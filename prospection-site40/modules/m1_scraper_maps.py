"""
Module 1 — Extraction Google Maps via Playwright
Scrape les résultats Google Maps pour une recherche "secteur + ville"
et retourne une liste structurée de business.
"""

import asyncio
import json
import re
import time
from dataclasses import dataclass, asdict
from pathlib import Path

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("❌ Installe Playwright : pip install playwright && playwright install chromium")
    exit(1)

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config.settings import (
    SECTEURS, VILLES, DELAY_BETWEEN_SEARCHES, MAX_RESULTS_PER_SEARCH
)


@dataclass
class Business:
    nom: str
    categorie: str
    adresse: str
    telephone: str
    site_web: str
    note: float
    nb_avis: int
    horaires: str
    url_maps: str
    recherche: str  # requête qui a trouvé ce résultat

    def to_dict(self):
        return asdict(self)


async def scrape_google_maps(query: str, max_results: int = MAX_RESULTS_PER_SEARCH) -> list[Business]:
    """
    Scrape Google Maps pour une requête donnée.
    Retourne une liste de Business.
    """
    results = []
    url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            locale="fr-FR",
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        try:
            await page.goto(url, wait_until="networkidle", timeout=15000)

            # Accepter les cookies Google si le bouton apparaît
            try:
                accept_btn = page.locator('button:has-text("Tout accepter")')
                if await accept_btn.count() > 0:
                    await accept_btn.first.click()
                    await page.wait_for_timeout(1000)
            except Exception:
                pass

            # Attendre le panneau de résultats
            feed_selector = 'div[role="feed"]'
            try:
                await page.wait_for_selector(feed_selector, timeout=8000)
            except Exception:
                print(f"  ⚠️  Pas de résultats pour : {query}")
                await browser.close()
                return results

            # Scroll pour charger plus de résultats
            feed = page.locator(feed_selector)
            prev_count = 0
            for _ in range(10):  # max 10 scrolls
                await feed.evaluate("el => el.scrollTop = el.scrollHeight")
                await page.wait_for_timeout(1500)

                items = page.locator(f'{feed_selector} > div > div > a[href*="/maps/place/"]')
                count = await items.count()

                if count >= max_results or count == prev_count:
                    break
                prev_count = count

            # Extraire les données de chaque résultat
            items = page.locator(f'{feed_selector} > div > div > a[href*="/maps/place/"]')
            count = min(await items.count(), max_results)

            for i in range(count):
                try:
                    item = items.nth(i)
                    business = await _extract_business_from_card(item, page, query)
                    if business:
                        results.append(business)
                except Exception as e:
                    print(f"  ⚠️  Erreur extraction item {i}: {e}")
                    continue

        except Exception as e:
            print(f"  ❌ Erreur scraping '{query}': {e}")
        finally:
            await browser.close()

    return results


async def _extract_business_from_card(item, page, query: str) -> Business | None:
    """Extrait les infos d'une carte de résultat Google Maps."""

    # Récupérer l'URL Maps
    url_maps = await item.get_attribute("href") or ""

    # Cliquer pour ouvrir le panneau détail
    await item.click()
    await page.wait_for_timeout(1500)

    # Nom
    nom = ""
    try:
        nom_el = page.locator('h1.DUwDvf')
        if await nom_el.count() > 0:
            nom = (await nom_el.first.inner_text()).strip()
    except Exception:
        pass

    if not nom:
        return None

    # Catégorie
    categorie = ""
    try:
        cat_el = page.locator('button[jsaction*="category"]')
        if await cat_el.count() > 0:
            categorie = (await cat_el.first.inner_text()).strip()
    except Exception:
        pass

    # Note et nombre d'avis
    note = 0.0
    nb_avis = 0
    try:
        note_el = page.locator('div.F7nice span[aria-hidden="true"]')
        if await note_el.count() >= 1:
            note_text = await note_el.first.inner_text()
            note = float(note_text.replace(",", "."))
        if await note_el.count() >= 2:
            avis_text = await note_el.nth(1).inner_text()
            nb_avis = int(re.sub(r'[^\d]', '', avis_text))
    except Exception:
        pass

    # Adresse
    adresse = await _get_detail(page, 'button[data-item-id="address"]')

    # Téléphone
    telephone = await _get_detail(page, 'button[data-item-id*="phone"]')

    # Site web
    site_web = ""
    try:
        site_el = page.locator('a[data-item-id="authority"]')
        if await site_el.count() > 0:
            site_web = await site_el.first.get_attribute("href") or ""
    except Exception:
        pass

    # Horaires (résumé)
    horaires = ""
    try:
        h_el = page.locator('button[data-item-id*="oh"] .fontBodyMedium')
        if await h_el.count() > 0:
            horaires = (await h_el.first.inner_text()).strip()
    except Exception:
        pass

    return Business(
        nom=nom,
        categorie=categorie,
        adresse=adresse,
        telephone=telephone,
        site_web=site_web,
        note=note,
        nb_avis=nb_avis,
        horaires=horaires,
        url_maps=url_maps,
        recherche=query,
    )


async def _get_detail(page, selector: str) -> str:
    """Récupère le texte d'un élément de détail."""
    try:
        el = page.locator(selector)
        if await el.count() > 0:
            text = await el.first.get_attribute("aria-label") or ""
            # Nettoyer les préfixes type "Adresse: "
            if ":" in text:
                text = text.split(":", 1)[1].strip()
            return text
    except Exception:
        pass
    return ""


async def run_extraction(secteurs: list[str] = None, villes: list[str] = None) -> list[Business]:
    """
    Lance l'extraction pour toutes les combinaisons secteur × ville.
    Déduplique par nom + adresse.
    """
    secteurs = secteurs or SECTEURS
    villes = villes or VILLES
    all_results: list[Business] = []
    seen = set()

    total = len(secteurs) * len(villes)
    current = 0

    for ville in villes:
        for secteur in secteurs:
            current += 1
            query = f"{secteur} {ville}"
            print(f"🔍 [{current}/{total}] {query}")

            businesses = await scrape_google_maps(query)
            print(f"   → {len(businesses)} résultats")

            for b in businesses:
                key = f"{b.nom}|{b.adresse}".lower()
                if key not in seen:
                    seen.add(key)
                    all_results.append(b)

            if current < total:
                await asyncio.sleep(DELAY_BETWEEN_SEARCHES)

    print(f"\n✅ Total : {len(all_results)} business uniques extraits")
    return all_results


def save_raw_results(businesses: list[Business], output_path: str = None):
    """Sauvegarde les résultats bruts en JSON."""
    if output_path is None:
        output_path = str(Path(__file__).resolve().parent.parent / "output" / "raw_businesses.json")

    data = [b.to_dict() for b in businesses]
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"💾 Résultats sauvegardés : {output_path}")
    return output_path


# === Point d'entrée direct ===
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Scraper Google Maps — Site 4.0")
    parser.add_argument("--secteur", type=str, help="Un seul secteur (sinon tous)")
    parser.add_argument("--ville", type=str, help="Une seule ville (sinon toutes)")
    parser.add_argument("--max", type=int, default=MAX_RESULTS_PER_SEARCH, help="Max résultats par recherche")
    args = parser.parse_args()

    secteurs = [args.secteur] if args.secteur else SECTEURS
    villes = [args.ville] if args.ville else VILLES

    businesses = asyncio.run(run_extraction(secteurs, villes))
    save_raw_results(businesses)
