"""
Module 5 — Analyse approfondie : charte graphique, ton éditorial, UX
Pour chaque prospect shortlisté (rang A ou B), analyse :
  - Couleurs dominantes (CSS + computed styles)
  - Typographie (Google Fonts, @font-face)
  - Logo
  - Ton éditorial et personnalité de marque (via LLM + screenshots)
  - Points forts / faibles UX
  - Palette de couleurs améliorée suggérée
"""

import asyncio
import json
import re
import time
from pathlib import Path

import requests

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("❌ Installe Playwright : pip install playwright && playwright install chromium")
    exit(1)

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config.settings import OUTPUT_DIR, DELAY_BETWEEN_PAGESPEED
from modules.llm_client import call_llm, parse_json_response


# ═══════════════════════════════════════════
# SCREENSHOT + EXTRACTION CSS
# ═══════════════════════════════════════════

async def _take_screenshots(url: str, slug: str, output_dir: Path) -> dict:
    """Prend des screenshots desktop et mobile du site."""
    screenshots = {}
    screens_dir = output_dir / slug / "screenshots"
    screens_dir.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        for device, viewport in [("desktop", {"width": 1440, "height": 900}),
                                   ("mobile", {"width": 390, "height": 844})]:
            try:
                context = await browser.new_context(
                    viewport=viewport,
                    user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                )
                page = await context.new_page()
                await page.goto(url, wait_until="networkidle", timeout=15000)

                # Fermer les popups de cookies si présents
                for selector in ['button:has-text("Accepter")', 'button:has-text("Accept")',
                                  'button:has-text("Tout accepter")', '[id*="cookie"] button',
                                  '[class*="cookie"] button']:
                    try:
                        btn = page.locator(selector)
                        if await btn.count() > 0:
                            await btn.first.click()
                            await page.wait_for_timeout(500)
                            break
                    except Exception:
                        pass

                await page.wait_for_timeout(1000)
                path = str(screens_dir / f"{device}.png")
                await page.screenshot(path=path, full_page=(device == "desktop"))
                screenshots[device] = path
                await context.close()
            except Exception as e:
                print(f"   ⚠️  Screenshot {device} échoué : {e}")

        await browser.close()

    return screenshots


async def _extract_css_data(url: str) -> dict:
    """Extrait couleurs et fonts depuis le CSS du site."""
    colors = set()
    fonts = set()
    logo_url = ""

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = await context.new_page()

        try:
            await page.goto(url, wait_until="networkidle", timeout=15000)

            # Extraire les couleurs via computed styles des éléments principaux
            raw_colors = await page.evaluate("""() => {
                const elements = document.querySelectorAll('header, nav, h1, h2, button, a, footer, [class*="hero"], [class*="banner"]');
                const colors = new Set();
                elements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
                        const val = style[prop];
                        if (val && val !== 'rgba(0, 0, 0, 0)' && val !== 'transparent') {
                            colors.add(val);
                        }
                    });
                });
                return Array.from(colors);
            }""")
            colors = set(raw_colors[:30])  # limiter

            # Extraire les fonts depuis les links Google Fonts
            gf_links = await page.evaluate("""() => {
                const links = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
                return Array.from(links).map(l => l.href);
            }""")
            for link in gf_links:
                matches = re.findall(r'family=([^&:]+)', link)
                for m in matches:
                    fonts.add(m.replace("+", " ").split(":")[0])

            # Extraire la font-family CSS des balises principales
            css_fonts = await page.evaluate("""() => {
                const els = document.querySelectorAll('body, h1, h2, p, button');
                const fonts = new Set();
                els.forEach(el => {
                    const f = window.getComputedStyle(el).fontFamily;
                    if (f) fonts.add(f.split(',')[0].replace(/['"]/g, '').trim());
                });
                return Array.from(fonts);
            }""")
            for f in css_fonts:
                if f and f.lower() not in ('inherit', 'initial', 'unset', ''):
                    fonts.add(f)

            # Chercher le logo (img dans header avec "logo" dans src/alt/class)
            logo_url = await page.evaluate("""() => {
                const candidates = document.querySelectorAll('header img, nav img, [class*="logo"] img, img[alt*="logo"], img[src*="logo"]');
                for (const img of candidates) {
                    if (img.src) return img.src;
                }
                return '';
            }""")

        except Exception as e:
            print(f"   ⚠️  Extraction CSS échouée : {e}")
        finally:
            await browser.close()

    return {
        "couleurs_css": list(colors),
        "fonts": list(fonts),
        "logo_url": logo_url,
    }


def _rgb_to_hex(rgb_str: str) -> str | None:
    """Convertit 'rgb(r, g, b)' ou 'rgba(r, g, b, a)' en hex."""
    match = re.match(r'rgba?\((\d+),\s*(\d+),\s*(\d+)', rgb_str)
    if match:
        r, g, b = int(match.group(1)), int(match.group(2)), int(match.group(3))
        if (r, g, b) == (255, 255, 255) or (r, g, b) == (0, 0, 0):
            return None  # Ignorer blanc et noir purs
        return f"#{r:02x}{g:02x}{b:02x}"
    return None


# ═══════════════════════════════════════════
# ANALYSE LLM
# ═══════════════════════════════════════════

def _build_analysis_prompt(business: dict, css_data: dict) -> str:
    """Construit le prompt d'analyse pour le LLM."""
    nom = business.get("nom", "")
    categorie = business.get("categorie", "")
    adresse = business.get("adresse", "")
    note = business.get("note", 0)
    nb_avis = business.get("nb_avis", 0)
    analyse = business.get("analyse", {})
    diagnostic = analyse.get("diagnostic", "inconnu")
    techno = analyse.get("technologie", "inconnue")

    couleurs = [c for c in [_rgb_to_hex(c) for c in css_data.get("couleurs_css", [])] if c][:10]
    fonts = css_data.get("fonts", [])[:5]

    prompt = f"""Tu es un expert en design web et branding. Analyse ce prospect pour lequel nous allons créer un prototype de site web amélioré.

## Entreprise
- Nom : {nom}
- Catégorie : {categorie}
- Localisation : {adresse}
- Note Google : {note}★ ({nb_avis} avis)

## Site actuel
- Diagnostic : {diagnostic}
- Technologie : {techno}
- Couleurs détectées : {', '.join(couleurs) if couleurs else 'Non détectées'}
- Polices détectées : {', '.join(fonts) if fonts else 'Non détectées'}

{f"Des screenshots desktop et mobile du site actuel sont joints." if css_data.get("has_screenshots") else "Pas de screenshots disponibles."}

## Ta mission
Analyse et retourne un JSON avec exactement cette structure :

{{
  "ton_editorial": "description du ton (ex: professionnel et sobre, chaleureux et accessible...)",
  "personnalite_marque": "3-5 adjectifs qui définissent la marque",
  "audience_cible": "description de la cible client type",
  "style_visuel_actuel": "description du style actuel (ex: daté, minimaliste, chargé...)",
  "points_forts": ["point fort 1", "point fort 2"],
  "points_faibles_ux": ["problème UX 1", "problème UX 2", "problème UX 3"],
  "couleurs_identifiees": {{
    "primaire": "#hexcode ou null",
    "secondaire": "#hexcode ou null",
    "accent": "#hexcode ou null"
  }},
  "palette_amelioree": {{
    "primaire": "#hexcode",
    "secondaire": "#hexcode",
    "accent": "#hexcode",
    "texte": "#hexcode",
    "fond": "#hexcode",
    "rationale": "explication des choix de couleurs en 1 phrase"
  }},
  "typographie_suggeree": {{
    "titres": "Nom de la font Google Fonts pour les titres",
    "corps": "Nom de la font Google Fonts pour le corps de texte",
    "rationale": "explication en 1 phrase"
  }},
  "sections_cles": ["section 1 indispensable", "section 2", "section 3"],
  "angle_accroche": "l'angle / message principal à mettre en avant pour ce prospect"
}}

Sois précis, concret et adapté au secteur d'activité. La palette améliorée doit respecter l'identité existante tout en la modernisant."""

    return prompt


def _analyze_with_llm(business: dict, css_data: dict, screenshots: dict) -> dict:
    """Envoie le prompt + screenshots au LLM et parse la réponse."""
    prompt = _build_analysis_prompt(business, {**css_data, "has_screenshots": bool(screenshots)})

    images = [p for p in [screenshots.get("desktop"), screenshots.get("mobile")] if p and Path(p).exists()]

    print(f"   🤖 Analyse LLM en cours...")
    try:
        response = call_llm(prompt, images=images, json_output=True)
        result = parse_json_response(response)
        return result
    except Exception as e:
        print(f"   ⚠️  Erreur LLM : {e}")
        return {"erreur": str(e)}


# ═══════════════════════════════════════════
# POINT D'ENTRÉE PRINCIPAL
# ═══════════════════════════════════════════

async def deep_analyze_business(business: dict, output_base: Path = None) -> dict:
    """
    Analyse approfondie d'un seul business.
    Retourne le business enrichi avec 'brand_analysis'.
    """
    if output_base is None:
        output_base = Path(__file__).resolve().parent.parent / OUTPUT_DIR

    nom = business.get("nom", "inconnu")
    site_url = business.get("site_web", "") or business.get("analyse", {}).get("url", "")

    # Slug pour les dossiers
    slug = re.sub(r'[^a-z0-9]', '-', nom.lower())[:40]

    print(f"\n🔍 Analyse approfondie : {nom}")

    brand_analysis = {
        "slug": slug,
        "screenshots": {},
        "css_data": {},
        "llm_analysis": {},
        "source": "site" if site_url else "none",
    }

    if not site_url:
        print(f"   ⚠️  Pas de site web — analyse limitée")
        # Analyse minimale sans site
        brand_analysis["llm_analysis"] = _analyze_with_llm(business, {}, {})
        business["brand_analysis"] = brand_analysis
        return business

    # 1. Screenshots
    print(f"   📸 Screenshots...")
    screenshots = await _take_screenshots(site_url, slug, output_base)
    brand_analysis["screenshots"] = screenshots
    print(f"   ✅ {len(screenshots)} screenshot(s) pris")

    # 2. Extraction CSS
    print(f"   🎨 Extraction CSS/fonts...")
    css_data = await _extract_css_data(site_url)
    brand_analysis["css_data"] = css_data
    print(f"   ✅ {len(css_data.get('couleurs_css', []))} couleurs, {len(css_data.get('fonts', []))} fonts")

    await asyncio.sleep(DELAY_BETWEEN_PAGESPEED)

    # 3. Analyse LLM
    llm_result = _analyze_with_llm(business, css_data, screenshots)
    brand_analysis["llm_analysis"] = llm_result

    business["brand_analysis"] = brand_analysis
    return business


def deep_analyze_all(businesses: list[dict], shortlist_only: bool = True, output_path: str = None) -> list[dict]:
    """
    Lance l'analyse approfondie sur tous les prospects (ou shortlist A+B).
    """
    if output_path is None:
        output_path = str(Path(__file__).resolve().parent.parent / OUTPUT_DIR / "deep_analyzed.json")

    output_base = Path(output_path).parent

    if shortlist_only:
        to_analyze = [b for b in businesses if b.get("scoring", {}).get("rang") in ("A", "B")]
        print(f"🔍 Analyse approfondie — shortlist : {len(to_analyze)} prospects")
    else:
        to_analyze = businesses
        print(f"🔍 Analyse approfondie — tous : {len(to_analyze)} prospects")

    results = []
    for i, biz in enumerate(to_analyze):
        print(f"\n[{i+1}/{len(to_analyze)}]", end="")
        enriched = asyncio.run(deep_analyze_business(biz, output_base))
        results.append(enriched)
        time.sleep(1)

    # Sauvegarder
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n💾 Analyse sauvegardée : {output_path}")
    return results


# ═══════════════════════════════════════════
# POINT D'ENTRÉE DIRECT
# ═══════════════════════════════════════════

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Analyse approfondie — Site 4.0")
    parser.add_argument("--input", type=str, help="JSON scoré (output module 3)")
    parser.add_argument("--all", action="store_true", help="Analyser tous les rangs")
    args = parser.parse_args()

    input_path = args.input or str(
        Path(__file__).resolve().parent.parent / OUTPUT_DIR / "scored_prospects.json"
    )

    if not Path(input_path).exists():
        print("❌ Pas de fichier d'entrée. Lance d'abord les modules 1→3.")
        exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        businesses = json.load(f)

    deep_analyze_all(businesses, shortlist_only=not args.all)
