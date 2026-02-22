"""
Module 2 — Analyse des sites web
- PageSpeed Insights API (gratuite, sans clé)
- Détection de la technologie (WordPress, Wix, etc.)
- Check HTTPS, responsive, âge estimé du design
"""

import json
import re
import time
from dataclasses import dataclass, asdict
from pathlib import Path

import requests

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config.settings import (
    PAGESPEED_API_URL, DELAY_BETWEEN_PAGESPEED, SEUIL_PAGESPEED_MAUVAIS
)


@dataclass
class SiteAnalysis:
    url: str
    # PageSpeed
    score_mobile: int          # 0-100
    score_desktop: int         # 0-100
    lcp: float                 # Largest Contentful Paint (sec)
    cls: float                 # Cumulative Layout Shift
    fcp: float                 # First Contentful Paint (sec)
    # Techno
    technologie: str           # "wordpress", "wix", "squarespace", "custom", "inconnu"
    cms_version: str           # si détecté
    generateur: str            # meta generator
    # Checks
    https: bool
    mobile_friendly: bool
    a_un_site: bool            # False si pas de site ou erreur
    # Diagnostic
    problemes: list[str]       # liste de problèmes détectés
    diagnostic: str            # "obsolète", "passable", "correct", "bon"

    def to_dict(self):
        return asdict(self)


# === TECHNOS DÉTECTABLES ===
TECH_SIGNATURES = {
    "wordpress": [
        "/wp-content/", "/wp-includes/", "wp-json", "wordpress.org",
        'name="generator" content="WordPress'
    ],
    "wix": [
        "wix.com", "wixsite.com", "X-Wix-", "wix-code-sdk"
    ],
    "squarespace": [
        "squarespace.com", "sqsp.net", "Squarespace"
    ],
    "shopify": [
        "shopify.com", "cdn.shopify", "Shopify.theme"
    ],
    "jimdo": [
        "jimdo.com", "jimdosite.com"
    ],
    "webflow": [
        "webflow.io", "webflow.com", "Webflow"
    ],
    "prestashop": [
        "prestashop", "PrestaShop", "/modules/ps_"
    ],
    "joomla": [
        "Joomla", "/media/jui/", "/components/com_"
    ],
    "one.com": [
        "one.com/", "website-editor.one.com"
    ],
    "ionos": [
        "ionos.com", "1and1", "mywebsite.ionos"
    ],
}


def analyze_site(url: str) -> SiteAnalysis:
    """Analyse complète d'un site web."""

    # Valeurs par défaut (pas de site)
    analysis = SiteAnalysis(
        url=url,
        score_mobile=0, score_desktop=0,
        lcp=0, cls=0, fcp=0,
        technologie="inconnu", cms_version="", generateur="",
        https=False, mobile_friendly=False, a_un_site=False,
        problemes=[], diagnostic="absent"
    )

    if not url or url.strip() == "":
        analysis.problemes.append("Aucun site web")
        return analysis

    # Normaliser l'URL
    url = url.strip()
    if not url.startswith("http"):
        url = "https://" + url
    analysis.url = url

    # 1. Fetch le HTML pour détection techno
    html = _fetch_html(url)
    if html is None:
        analysis.problemes.append("Site inaccessible")
        return analysis

    analysis.a_un_site = True
    analysis.https = url.startswith("https")
    if not analysis.https:
        analysis.problemes.append("Pas de HTTPS")

    # 2. Détection technologie
    analysis.technologie = _detect_technology(html, url)
    analysis.generateur = _extract_generator(html)
    analysis.cms_version = _extract_cms_version(html, analysis.technologie)

    # 3. PageSpeed Insights
    ps_mobile = _pagespeed(url, strategy="mobile")
    ps_desktop = _pagespeed(url, strategy="desktop")

    if ps_mobile:
        analysis.score_mobile = ps_mobile.get("score", 0)
        analysis.lcp = ps_mobile.get("lcp", 0)
        analysis.cls = ps_mobile.get("cls", 0)
        analysis.fcp = ps_mobile.get("fcp", 0)
        analysis.mobile_friendly = analysis.score_mobile >= 50

    if ps_desktop:
        analysis.score_desktop = ps_desktop.get("score", 0)

    # 4. Diagnostic
    analysis.problemes.extend(_detect_problems(analysis, html))
    analysis.diagnostic = _compute_diagnostic(analysis)

    return analysis


def _fetch_html(url: str, timeout: int = 10) -> str | None:
    """Récupère le HTML d'un site."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                          "AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        }
        r = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)
        if r.status_code == 200:
            return r.text[:200_000]  # limiter à 200Ko
        return None
    except Exception:
        return None


def _detect_technology(html: str, url: str) -> str:
    """Détecte la technologie du site."""
    html_lower = html.lower()
    url_lower = url.lower()

    for tech, signatures in TECH_SIGNATURES.items():
        for sig in signatures:
            if sig.lower() in html_lower or sig.lower() in url_lower:
                return tech

    return "custom"


def _extract_generator(html: str) -> str:
    """Extrait le contenu de <meta name='generator'>."""
    match = re.search(
        r'<meta[^>]+name=["\']generator["\'][^>]+content=["\']([^"\']+)',
        html, re.IGNORECASE
    )
    if match:
        return match.group(1).strip()
    return ""


def _extract_cms_version(html: str, tech: str) -> str:
    """Essaie d'extraire la version du CMS."""
    if tech == "wordpress":
        match = re.search(r'WordPress\s*([\d.]+)', html)
        if match:
            return match.group(1)
    return ""


def _pagespeed(url: str, strategy: str = "mobile") -> dict | None:
    """Appel PageSpeed Insights API."""
    try:
        params = {
            "url": url,
            "strategy": strategy,
            "category": "performance",
        }
        r = requests.get(PAGESPEED_API_URL, params=params, timeout=30)
        if r.status_code != 200:
            return None

        data = r.json()
        lh = data.get("lighthouseResult", {})
        audits = lh.get("audits", {})
        categories = lh.get("categories", {})

        score = int(categories.get("performance", {}).get("score", 0) * 100)

        lcp = audits.get("largest-contentful-paint", {}).get("numericValue", 0) / 1000
        cls = audits.get("cumulative-layout-shift", {}).get("numericValue", 0)
        fcp = audits.get("first-contentful-paint", {}).get("numericValue", 0) / 1000

        return {"score": score, "lcp": round(lcp, 2), "cls": round(cls, 3), "fcp": round(fcp, 2)}

    except Exception:
        return None


def _detect_problems(analysis: SiteAnalysis, html: str) -> list[str]:
    """Détecte les problèmes courants."""
    problems = []

    # Score mobile faible
    if analysis.score_mobile > 0 and analysis.score_mobile < SEUIL_PAGESPEED_MAUVAIS:
        problems.append(f"Score mobile faible : {analysis.score_mobile}/100")

    # Score desktop faible
    if analysis.score_desktop > 0 and analysis.score_desktop < SEUIL_PAGESPEED_MAUVAIS:
        problems.append(f"Score desktop faible : {analysis.score_desktop}/100")

    # LCP trop lent (> 4s)
    if analysis.lcp > 4:
        problems.append(f"Chargement très lent : {analysis.lcp}s")

    # Pas de viewport (pas responsive)
    if 'name="viewport"' not in html.lower() and "name='viewport'" not in html.lower():
        problems.append("Pas de balise viewport (probablement pas responsive)")

    # Techno obsolète connue
    if analysis.technologie == "wordpress":
        if analysis.cms_version:
            try:
                major = int(analysis.cms_version.split(".")[0])
                if major < 6:
                    problems.append(f"WordPress obsolète (v{analysis.cms_version})")
            except ValueError:
                pass

    # Pas de meta description
    if 'name="description"' not in html.lower() and "name='description'" not in html.lower():
        problems.append("Pas de meta description (SEO basique absent)")

    # Design détection heuristique : tables pour layout, pas de flexbox/grid
    if "<table" in html.lower() and html.lower().count("<table") > 3:
        if "flex" not in html.lower() and "grid" not in html.lower():
            problems.append("Layout par tableaux (design probablement obsolète)")

    return problems


def _compute_diagnostic(analysis: SiteAnalysis) -> str:
    """Calcule un diagnostic global."""
    if not analysis.a_un_site:
        return "absent"

    score_moyen = (analysis.score_mobile + analysis.score_desktop) / 2
    nb_problemes = len(analysis.problemes)

    if score_moyen < 30 or nb_problemes >= 4:
        return "obsolète"
    elif score_moyen < 50 or nb_problemes >= 2:
        return "passable"
    elif score_moyen < 75:
        return "correct"
    else:
        return "bon"


def analyze_businesses(businesses: list[dict], output_path: str = None) -> list[dict]:
    """
    Analyse tous les sites web d'une liste de business.
    Enrichit chaque business avec les données d'analyse.
    """
    if output_path is None:
        output_path = str(Path(__file__).resolve().parent.parent / "output" / "analyzed_businesses.json")

    enriched = []
    total = len(businesses)

    for i, biz in enumerate(businesses):
        site = biz.get("site_web", "")
        print(f"🔎 [{i+1}/{total}] {biz.get('nom', '?')} — {site or 'PAS DE SITE'}")

        analysis = analyze_site(site)
        biz["analyse"] = analysis.to_dict()

        print(f"   → Diagnostic: {analysis.diagnostic} | Mobile: {analysis.score_mobile} | "
              f"Techno: {analysis.technologie} | Problèmes: {len(analysis.problemes)}")

        enriched.append(biz)

        if site and i < total - 1:
            time.sleep(DELAY_BETWEEN_PAGESPEED)

    # Sauvegarder
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(enriched, f, ensure_ascii=False, indent=2)

    print(f"\n✅ {total} business analysés → {output_path}")
    return enriched


# === Point d'entrée direct ===
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Analyseur de sites — Site 4.0")
    parser.add_argument("--input", type=str, help="JSON des business (output module 1)")
    parser.add_argument("--url", type=str, help="Analyser une seule URL")
    args = parser.parse_args()

    if args.url:
        result = analyze_site(args.url)
        print(json.dumps(result.to_dict(), ensure_ascii=False, indent=2))
    elif args.input:
        with open(args.input, "r", encoding="utf-8") as f:
            businesses = json.load(f)
        analyze_businesses(businesses)
    else:
        # Chercher le fichier par défaut du module 1
        default_input = Path(__file__).resolve().parent.parent / "output" / "raw_businesses.json"
        if default_input.exists():
            with open(default_input, "r", encoding="utf-8") as f:
                businesses = json.load(f)
            analyze_businesses(businesses)
        else:
            print("❌ Pas de fichier d'entrée. Lance d'abord le module 1 ou utilise --url")
