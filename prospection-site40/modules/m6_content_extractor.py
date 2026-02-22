"""
Module 6 — Extraction de contenu
Crawle le site existant pour extraire textes et images.
Fallback si pas de site : Google Business (Maps), recherche web, données M1.
"""

import asyncio
import json
import re
import time
import urllib.parse
from pathlib import Path

import requests

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("❌ Installe Playwright : pip install playwright && playwright install chromium")
    exit(1)

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config.settings import OUTPUT_DIR, MAX_PAGES_TO_CRAWL, MAX_IMAGES_TO_DOWNLOAD


# ═══════════════════════════════════════════
# CRAWL DU SITE
# ═══════════════════════════════════════════

# Pages prioritaires à crawler (par ordre de priorité)
PRIORITY_PATHS = ["/", "/a-propos", "/about", "/qui-sommes-nous", "/services",
                  "/prestations", "/contact", "/nos-services", "/activites"]


async def _discover_pages(page, base_url: str) -> list[str]:
    """Découvre les URLs internes du site depuis la homepage."""
    links = await page.evaluate("""(base) => {
        const anchors = document.querySelectorAll('a[href]');
        const urls = new Set();
        anchors.forEach(a => {
            try {
                const url = new URL(a.href, base);
                if (url.hostname === new URL(base).hostname &&
                    !url.href.includes('#') &&
                    !url.href.match(/\\.(pdf|jpg|jpeg|png|gif|svg|zip|doc)$/i)) {
                    urls.add(url.href);
                }
            } catch(e) {}
        });
        return Array.from(urls);
    }""", base_url)
    return links


async def _extract_page_content(page) -> dict:
    """Extrait le contenu textuel structuré d'une page."""
    return await page.evaluate("""() => {
        const getText = (selector) => {
            const el = document.querySelector(selector);
            return el ? el.innerText.trim() : '';
        };
        const getAll = (selector) => {
            return Array.from(document.querySelectorAll(selector))
                .map(el => el.innerText.trim())
                .filter(t => t.length > 10);
        };

        // Supprimer nav et footer pour éviter le bruit
        const clone = document.body.cloneNode(true);
        clone.querySelectorAll('nav, footer, header nav, script, style, .cookie-banner, #cookie-banner').forEach(el => el.remove());

        return {
            titre_page: document.title,
            h1: getAll('h1'),
            h2: getAll('h2'),
            h3: getAll('h3'),
            paragraphes: Array.from(clone.querySelectorAll('p'))
                .map(p => p.innerText.trim())
                .filter(t => t.length > 30)
                .slice(0, 20),
            ctas: Array.from(document.querySelectorAll('a.btn, button, a[class*="button"], a[class*="cta"], .cta a'))
                .map(el => el.innerText.trim())
                .filter(t => t.length > 2 && t.length < 60)
                .slice(0, 10),
            listes: Array.from(clone.querySelectorAll('ul li, ol li'))
                .map(li => li.innerText.trim())
                .filter(t => t.length > 5 && t.length < 200)
                .slice(0, 20),
            temoignages: Array.from(document.querySelectorAll('[class*="temoignage"], [class*="testimonial"], [class*="review"], blockquote'))
                .map(el => el.innerText.trim())
                .filter(t => t.length > 20)
                .slice(0, 5),
        };
    }""")


async def _collect_images(page, base_url: str, max_images: int) -> list[dict]:
    """Collecte les URLs d'images pertinentes sur la page."""
    images = await page.evaluate("""(base) => {
        const imgs = document.querySelectorAll('img[src]');
        const result = [];
        imgs.forEach(img => {
            try {
                const src = new URL(img.src, base).href;
                const alt = img.alt || '';
                const width = img.naturalWidth || img.width || 0;
                const height = img.naturalHeight || img.height || 0;
                // Ignorer les icônes et images trop petites
                if (width > 100 || height > 100 || width === 0) {
                    result.push({ src, alt, width, height });
                }
            } catch(e) {}
        });
        return result;
    }""", base_url)

    # Trier par taille (les grandes images en premier)
    images.sort(key=lambda x: (x.get("width", 0) * x.get("height", 0)), reverse=True)

    # Dédupliquer
    seen = set()
    unique = []
    for img in images:
        if img["src"] not in seen:
            seen.add(img["src"])
            unique.append(img)

    return unique[:max_images]


def _download_images(image_list: list[dict], output_dir: Path) -> list[dict]:
    """Télécharge les images et retourne les chemins locaux."""
    output_dir.mkdir(parents=True, exist_ok=True)
    downloaded = []

    for i, img in enumerate(image_list):
        url = img.get("src", "")
        if not url or not url.startswith("http"):
            continue

        ext = Path(urllib.parse.urlparse(url).path).suffix or ".jpg"
        ext = ext.lower()
        if ext not in (".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"):
            ext = ".jpg"

        filename = f"image_{i:02d}{ext}"
        filepath = output_dir / filename

        try:
            r = requests.get(url, timeout=10, headers={
                "User-Agent": "Mozilla/5.0",
                "Referer": url,
            })
            if r.status_code == 200:
                filepath.write_bytes(r.content)
                downloaded.append({
                    "local": str(filepath),
                    "original_url": url,
                    "alt": img.get("alt", ""),
                    "width": img.get("width", 0),
                    "height": img.get("height", 0),
                })
        except Exception as e:
            print(f"   ⚠️  Image non téléchargée : {url[:60]}... ({e})")

    return downloaded


async def crawl_site(base_url: str, slug: str, output_base: Path) -> dict:
    """
    Crawle le site et extrait tout le contenu.
    Retourne un dict structuré avec les textes et chemins des images.
    """
    images_dir = output_base / slug / "images"
    all_content = {}
    all_images = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            locale="fr-FR",
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        # Charger la homepage
        try:
            await page.goto(base_url, wait_until="networkidle", timeout=15000)
        except Exception as e:
            print(f"   ❌ Impossible de charger {base_url} : {e}")
            await browser.close()
            return {}

        # Fermer cookie banner
        for sel in ['button:has-text("Accepter")', 'button:has-text("Tout accepter")',
                    'button:has-text("Accept all")', '[id*="accept"]']:
            try:
                btn = page.locator(sel)
                if await btn.count() > 0:
                    await btn.first.click()
                    await page.wait_for_timeout(500)
                    break
            except Exception:
                pass

        # Découvrir les pages
        discovered = await _discover_pages(page, base_url)

        # Sélectionner les pages prioritaires
        to_crawl = [base_url]
        for priority in PRIORITY_PATHS[1:]:
            for url in discovered:
                if priority in url.lower() and url not in to_crawl:
                    to_crawl.append(url)
                    break
        # Compléter avec d'autres pages si pas assez
        for url in discovered:
            if url not in to_crawl and len(to_crawl) < MAX_PAGES_TO_CRAWL:
                to_crawl.append(url)

        print(f"   📄 {len(to_crawl)} pages à crawler")

        # Crawler chaque page
        for i, url in enumerate(to_crawl[:MAX_PAGES_TO_CRAWL]):
            try:
                if i > 0:
                    await page.goto(url, wait_until="networkidle", timeout=10000)
                    await page.wait_for_timeout(500)

                content = await _extract_page_content(page)
                path_key = "/" + url.replace(base_url, "").strip("/") or "/"
                all_content[path_key] = content
                print(f"   ✅ {path_key} — {len(content.get('paragraphes', []))} §, {len(content.get('h2', []))} H2")

                # Collecter images (seulement sur les 2 premières pages)
                if i < 2:
                    imgs = await _collect_images(page, url, MAX_IMAGES_TO_DOWNLOAD)
                    all_images.extend(imgs)

            except Exception as e:
                print(f"   ⚠️  Erreur crawl {url} : {e}")

        await browser.close()

    # Dédupliquer les images
    seen_srcs = set()
    unique_images = []
    for img in all_images:
        if img["src"] not in seen_srcs:
            seen_srcs.add(img["src"])
            unique_images.append(img)

    # Télécharger les images
    print(f"   🖼️  Téléchargement de {len(unique_images[:MAX_IMAGES_TO_DOWNLOAD])} images...")
    downloaded = _download_images(unique_images[:MAX_IMAGES_TO_DOWNLOAD], images_dir)
    print(f"   ✅ {len(downloaded)} images téléchargées")

    return {
        "pages": all_content,
        "images": downloaded,
        "source": "site",
    }


# ═══════════════════════════════════════════
# FALLBACK : PAS DE SITE WEB
# ═══════════════════════════════════════════

def _extract_maps_photos(business: dict, output_dir: Path) -> list[dict]:
    """Télécharge les photos depuis Google Maps (URL déjà dans les données M1)."""
    photos = business.get("photos_maps", [])
    if not photos:
        return []

    output_dir.mkdir(parents=True, exist_ok=True)
    downloaded = []

    for i, url in enumerate(photos[:5]):
        try:
            r = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
            if r.status_code == 200:
                path = output_dir / f"maps_photo_{i:02d}.jpg"
                path.write_bytes(r.content)
                downloaded.append({"local": str(path), "original_url": url, "alt": "Photo Google Maps"})
        except Exception:
            pass

    return downloaded


def _web_search_fallback(business: dict) -> dict:
    """
    Fallback web : utilise les données déjà disponibles (M1 + M2)
    et construit un contenu minimal à partir du nom, catégorie, adresse, etc.
    """
    nom = business.get("nom", "")
    categorie = business.get("categorie", "")
    adresse = business.get("adresse", "")
    telephone = business.get("telephone", "")
    note = business.get("note", 0)
    nb_avis = business.get("nb_avis", 0)
    horaires = business.get("horaires", "")

    # Contenu synthétique depuis les données disponibles
    pages = {
        "/": {
            "titre_page": nom,
            "h1": [nom],
            "h2": [categorie] if categorie else [],
            "paragraphes": [],
            "ctas": ["Nous contacter", "Prendre rendez-vous"],
            "listes": [],
            "temoignages": [],
        }
    }

    if adresse:
        pages["/"]["listes"].append(f"Adresse : {adresse}")
    if telephone:
        pages["/"]["listes"].append(f"Tél : {telephone}")
    if horaires:
        pages["/"]["listes"].append(f"Horaires : {horaires}")
    if note and nb_avis:
        pages["/"]["paragraphes"].append(f"{note}★ — {nb_avis} avis Google")

    return {
        "pages": pages,
        "images": [],
        "source": "maps_data",
        "note": "Pas de site web — contenu basé sur les données Google Maps",
    }


# ═══════════════════════════════════════════
# POINT D'ENTRÉE PRINCIPAL
# ═══════════════════════════════════════════

async def extract_content_for_business(business: dict, output_base: Path = None) -> dict:
    """
    Extrait le contenu pour un business.
    Retourne le business enrichi avec la clé 'content'.
    """
    if output_base is None:
        output_base = Path(__file__).resolve().parent.parent / OUTPUT_DIR

    nom = business.get("nom", "inconnu")
    site_url = business.get("site_web", "") or business.get("analyse", {}).get("url", "")
    slug = business.get("brand_analysis", {}).get("slug") or re.sub(r'[^a-z0-9]', '-', nom.lower())[:40]

    print(f"\n📦 Extraction contenu : {nom}")

    if site_url:
        content = await crawl_site(site_url, slug, output_base)
    else:
        print(f"   ⚠️  Pas de site — fallback données Maps")
        images_dir = output_base / slug / "images"
        maps_photos = _extract_maps_photos(business, images_dir)
        content = _web_search_fallback(business)
        content["images"] = maps_photos

    business["content"] = content
    return business


def extract_content_all(businesses: list[dict], output_path: str = None) -> list[dict]:
    """Extrait le contenu pour tous les business de la liste."""
    if output_path is None:
        output_path = str(Path(__file__).resolve().parent.parent / OUTPUT_DIR / "content_extracted.json")

    output_base = Path(output_path).parent
    results = []

    for i, biz in enumerate(businesses):
        print(f"\n[{i+1}/{len(businesses)}]", end="")
        enriched = asyncio.run(extract_content_for_business(biz, output_base))
        results.append(enriched)
        time.sleep(0.5)

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n💾 Contenu sauvegardé : {output_path}")
    return results


# ═══════════════════════════════════════════
# POINT D'ENTRÉE DIRECT
# ═══════════════════════════════════════════

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Extraction contenu — Site 4.0")
    parser.add_argument("--input", type=str, help="JSON deep_analyzed (output module 5)")
    args = parser.parse_args()

    input_path = args.input or str(
        Path(__file__).resolve().parent.parent / OUTPUT_DIR / "deep_analyzed.json"
    )

    if not Path(input_path).exists():
        print("❌ Pas de fichier d'entrée. Lance d'abord les modules 1→5.")
        exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        businesses = json.load(f)

    extract_content_all(businesses)
