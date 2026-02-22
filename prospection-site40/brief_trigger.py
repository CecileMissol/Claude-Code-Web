#!/usr/bin/env python3
"""
🎨 Brief Trigger — Site 4.0
Interroge Notion, récupère les prospects avec statut "⚡ À briefer",
lance M5→M7 sur chacun, puis met à jour le statut.

Usage :
    python brief_trigger.py              # traite tous les "À briefer"
    python brief_trigger.py --dry-run    # affiche sans lancer
    python brief_trigger.py --llm gemini # force un provider LLM
"""

import argparse
import asyncio
import json
import time
from pathlib import Path

import requests

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from config.settings import NOTION_API_KEY, NOTION_DATABASE_ID, OUTPUT_DIR
from modules.m5_deep_analyzer import deep_analyze_business
from modules.m6_content_extractor import extract_content_for_business
from modules.m7_brief_generator import generate_brief

NOTION_API_URL = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"
STATUT_TRIGGER  = "⚡ À briefer"
STATUT_EN_COURS = "🔨 Prototype en cours"
STATUT_PRET     = "🎨 Brief prêt"


def _headers():
    return {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


# ═══════════════════════════════════════════
# LECTURE NOTION
# ═══════════════════════════════════════════

def fetch_prospects_to_brief() -> list[dict]:
    """
    Récupère tous les prospects avec statut "⚡ À briefer" depuis Notion.
    Retourne une liste de dicts au format pipeline (compatible M5→M7).
    """
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        print("❌ Configure NOTION_API_KEY et NOTION_DATABASE_ID dans .env ou config/settings.py")
        return []

    payload = {
        "filter": {
            "property": "Statut",
            "select": {"equals": STATUT_TRIGGER}
        }
    }

    r = requests.post(
        f"{NOTION_API_URL}/databases/{NOTION_DATABASE_ID}/query",
        headers=_headers(),
        json=payload,
    )

    if r.status_code != 200:
        print(f"❌ Erreur Notion : {r.status_code} — {r.text[:300]}")
        return []

    pages = r.json().get("results", [])
    print(f"📋 {len(pages)} prospect(s) avec statut '{STATUT_TRIGGER}'")

    prospects = []
    for page in pages:
        prospect = _notion_page_to_dict(page)
        if prospect:
            prospects.append(prospect)

    return prospects


def _get_text(prop: dict) -> str:
    """Extrait le texte d'une propriété Notion rich_text ou title."""
    items = prop.get("title") or prop.get("rich_text") or []
    return "".join(t.get("text", {}).get("content", "") for t in items)


def _get_number(prop: dict) -> float:
    return prop.get("number") or 0


def _get_select(prop: dict) -> str:
    s = prop.get("select")
    return s.get("name", "") if s else ""


def _get_url(prop: dict) -> str:
    return prop.get("url") or ""


def _notion_page_to_dict(page: dict) -> dict | None:
    """Convertit une page Notion en dict compatible avec le pipeline."""
    props = page.get("properties", {})
    nom = _get_text(props.get("Nom", {}))
    if not nom:
        return None

    return {
        # Identifiants Notion
        "_notion_page_id": page["id"],

        # Données M1
        "nom": nom,
        "categorie": _get_text(props.get("Catégorie", {})),
        "adresse": _get_text(props.get("Adresse", {})),
        "telephone": props.get("Téléphone", {}).get("phone_number", ""),
        "site_web": _get_url(props.get("Site web", {})),
        "note": _get_number(props.get("Note Google", {})),
        "nb_avis": int(_get_number(props.get("Nb avis", {}))),
        "horaires": "",
        "url_maps": _get_url(props.get("URL Maps", {})),
        "recherche": _get_text(props.get("Recherche", {})),

        # Données M2 (partielles)
        "analyse": {
            "url": _get_url(props.get("Site web", {})),
            "score_mobile": int(_get_number(props.get("Score mobile", {}))),
            "score_desktop": int(_get_number(props.get("Score desktop", {}))),
            "technologie": _get_text(props.get("Technologie", {})),
            "diagnostic": _get_select(props.get("Diagnostic site", {})),
            "a_un_site": bool(_get_url(props.get("Site web", {}))),
            "problemes": [],
        },

        # Données M3
        "scoring": {
            "rang": _get_select(props.get("Rang", {})),
            "score_total": int(_get_number(props.get("Score", {}))),
            "recommandation": _get_select(props.get("Recommandation", {})),
            "palier_suggere": _get_select(props.get("Palier suggéré", {})),
            "raisons": _get_text(props.get("Raisons score", {})).split("\n"),
            "details": {},
        },
    }


# ═══════════════════════════════════════════
# MISE À JOUR DU STATUT NOTION
# ═══════════════════════════════════════════

def _set_notion_status(page_id: str, statut: str):
    """Met à jour le statut d'une fiche Notion."""
    r = requests.patch(
        f"{NOTION_API_URL}/pages/{page_id}",
        headers=_headers(),
        json={"properties": {"Statut": {"select": {"name": statut}}}},
    )
    if r.status_code != 200:
        print(f"   ⚠️  Impossible de mettre à jour le statut Notion : {r.status_code}")


# ═══════════════════════════════════════════
# TRAITEMENT D'UN PROSPECT
# ═══════════════════════════════════════════

async def _process_prospect(prospect: dict, output_base: Path) -> bool:
    """Lance M5→M7 sur un prospect. Retourne True si succès."""
    nom = prospect.get("nom", "?")
    page_id = prospect.get("_notion_page_id", "")

    print(f"\n{'='*55}")
    print(f"🎯 Traitement : {nom}")
    print(f"{'='*55}")

    # Marquer "en cours" immédiatement pour éviter les doublons
    if page_id:
        _set_notion_status(page_id, STATUT_EN_COURS)

    try:
        # M5 — Analyse approfondie
        print(f"\n🔍 M5 — Analyse approfondie")
        prospect = await deep_analyze_business(prospect, output_base)

        # M6 — Extraction contenu
        print(f"\n📦 M6 — Extraction de contenu")
        prospect = await extract_content_for_business(prospect, output_base)

        # M7 — Brief
        print(f"\n📝 M7 — Génération du brief")
        prospect = generate_brief(prospect, output_base)

        # Statut final
        if page_id:
            _set_notion_status(page_id, STATUT_PRET)
        print(f"\n✅ Brief prêt pour : {nom}")

        # Sauvegarder le résultat individuel
        slug = prospect.get("brand_analysis", {}).get("slug", nom.lower().replace(" ", "-")[:40])
        result_path = output_base / slug / "full_prospect.json"
        with open(result_path, "w", encoding="utf-8") as f:
            json.dump(prospect, f, ensure_ascii=False, indent=2)

        return True

    except Exception as e:
        print(f"\n❌ Erreur pour {nom} : {e}")
        # Remettre en "À briefer" pour pouvoir réessayer
        if page_id:
            _set_notion_status(page_id, STATUT_TRIGGER)
        return False


# ═══════════════════════════════════════════
# POINT D'ENTRÉE
# ═══════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Brief Trigger — Site 4.0")
    parser.add_argument("--dry-run", action="store_true",
                        help="Affiche les prospects trouvés sans lancer M5→M7")
    parser.add_argument("--llm", type=str, choices=["openai", "gemini", "anthropic"],
                        help="Forcer un provider LLM pour M5/M7")
    args = parser.parse_args()

    # Surcharger le provider LLM si précisé
    if args.llm:
        import config.settings as cfg
        cfg.LLM_PROVIDER = args.llm
        print(f"🤖 Provider LLM : {args.llm}")

    # 1. Récupérer les prospects "À briefer"
    prospects = fetch_prospects_to_brief()

    if not prospects:
        print("✅ Rien à traiter.")
        return

    # 2. Dry run : afficher et sortir
    if args.dry_run:
        print("\n--- DRY RUN — Prospects qui seraient traités ---")
        for p in prospects:
            rang = p.get("scoring", {}).get("rang", "?")
            score = p.get("scoring", {}).get("score_total", 0)
            print(f"  [{rang} — {score}/100] {p['nom']} ({p.get('categorie', '')})")
        return

    # 3. Traitement
    output_base = Path(__file__).resolve().parent / OUTPUT_DIR
    output_base.mkdir(exist_ok=True)

    stats = {"ok": 0, "erreur": 0}

    for i, prospect in enumerate(prospects):
        print(f"\n[{i+1}/{len(prospects)}]", end="")
        success = asyncio.run(_process_prospect(prospect, output_base))
        if success:
            stats["ok"] += 1
        else:
            stats["erreur"] += 1

        # Pause entre deux prospects (rate limit LLM)
        if i < len(prospects) - 1:
            time.sleep(2)

    print(f"\n{'='*55}")
    print(f"✅ Terminé : {stats['ok']} brief(s) générés, {stats['erreur']} erreur(s)")
    print(f"📁 Résultats dans : {output_base}/[slug]/prototype_brief.md")
    print(f"{'='*55}")


if __name__ == "__main__":
    main()
