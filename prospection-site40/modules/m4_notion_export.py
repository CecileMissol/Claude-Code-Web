"""
Module 4 — Export vers Notion
Crée/met à jour les prospects scorés dans une base Notion.
Gère la déduplication par nom + adresse.
"""

import json
import time
from pathlib import Path

import requests

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config.settings import NOTION_API_KEY, NOTION_DATABASE_ID, SEUIL_SCORE_SHORTLIST


NOTION_API_URL = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"


def _headers():
    return {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


def _check_config():
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        print("❌ Configure NOTION_API_KEY et NOTION_DATABASE_ID dans config/settings.py")
        print("   1. Crée une intégration : https://www.notion.so/my-integrations")
        print("   2. Partage ta DB avec l'intégration")
        print("   3. Copie le secret et l'ID de la DB")
        return False
    return True


# ═══════════════════════════════════════════
# CRÉATION DE LA BASE NOTION (one-time setup)
# ═══════════════════════════════════════════

PROSPECT_SCHEMA = {
    "Nom": {"title": {}},
    "Score": {"number": {"format": "number"}},
    "Rang": {
        "select": {
            "options": [
                {"name": "A", "color": "green"},
                {"name": "B", "color": "blue"},
                {"name": "C", "color": "yellow"},
                {"name": "D", "color": "red"},
            ]
        }
    },
    "Statut": {
        "select": {
            "options": [
                {"name": "🆕 Nouveau", "color": "default"},
                {"name": "⚡ À briefer", "color": "orange"},
                {"name": "🔨 Prototype en cours", "color": "yellow"},
                {"name": "🎨 Brief prêt", "color": "pink"},
                {"name": "📧 Contacté", "color": "blue"},
                {"name": "🔄 Relancé", "color": "purple"},
                {"name": "📞 RDV planifié", "color": "green"},
                {"name": "✅ Converti", "color": "green"},
                {"name": "❌ Refusé", "color": "red"},
                {"name": "⏸️ En attente", "color": "gray"},
            ]
        }
    },
    "Palier suggéré": {
        "select": {
            "options": [
                {"name": "essentiel", "color": "gray"},
                {"name": "performance", "color": "blue"},
                {"name": "premium", "color": "purple"},
            ]
        }
    },
    "Recommandation": {
        "select": {
            "options": [
                {"name": "prioritaire", "color": "green"},
                {"name": "intéressant", "color": "blue"},
                {"name": "à surveiller", "color": "yellow"},
                {"name": "skip", "color": "red"},
            ]
        }
    },
    "Catégorie": {"rich_text": {}},
    "Adresse": {"rich_text": {}},
    "Téléphone": {"phone_number": {}},
    "Site web": {"url": {}},
    "Note Google": {"number": {"format": "number"}},
    "Nb avis": {"number": {"format": "number"}},
    "Score mobile": {"number": {"format": "number"}},
    "Score desktop": {"number": {"format": "number"}},
    "Technologie": {"rich_text": {}},
    "Diagnostic site": {
        "select": {
            "options": [
                {"name": "absent", "color": "red"},
                {"name": "obsolète", "color": "red"},
                {"name": "passable", "color": "yellow"},
                {"name": "correct", "color": "blue"},
                {"name": "bon", "color": "green"},
            ]
        }
    },
    "Problèmes": {"rich_text": {}},
    "Raisons score": {"rich_text": {}},
    "URL Maps": {"url": {}},
    "Recherche": {"rich_text": {}},
    "Prototype URL": {"url": {}},
    "Brief Prototype": {"rich_text": {}},
    "Palette Couleurs": {"rich_text": {}},
    "Notes": {"rich_text": {}},
    "Date contact": {"date": {}},
    "Date relance": {"date": {}},
}


def create_database(parent_page_id: str, title: str = "🎯 Prospects Site 4.0") -> str:
    """
    Crée la base Notion avec le schéma prospect.
    Retourne l'ID de la DB créée.
    """
    if not NOTION_API_KEY:
        print("❌ NOTION_API_KEY manquante")
        return ""

    payload = {
        "parent": {"type": "page_id", "page_id": parent_page_id},
        "title": [{"type": "text", "text": {"content": title}}],
        "properties": PROSPECT_SCHEMA,
    }

    r = requests.post(f"{NOTION_API_URL}/databases", headers=_headers(), json=payload)

    if r.status_code == 200:
        db_id = r.json()["id"]
        print(f"✅ Base créée : {db_id}")
        print(f"   → Copie cet ID dans config/settings.py : NOTION_DATABASE_ID")
        return db_id
    else:
        print(f"❌ Erreur création DB : {r.status_code} — {r.text}")
        return ""


# ═══════════════════════════════════════════
# EXPORT DES PROSPECTS
# ═══════════════════════════════════════════

def _build_page_properties(biz: dict) -> dict:
    """Construit les propriétés Notion à partir d'un business scoré."""
    scoring = biz.get("scoring", {})
    analyse = biz.get("analyse", {})

    props = {
        "Nom": {"title": [{"text": {"content": biz.get("nom", "")[:100]}}]},
        "Score": {"number": scoring.get("score_total", 0)},
        "Rang": {"select": {"name": scoring.get("rang", "D")}},
        "Statut": {"select": {"name": "🆕 Nouveau"}},
        "Palier suggéré": {"select": {"name": scoring.get("palier_suggere", "essentiel")}},
        "Recommandation": {"select": {"name": scoring.get("recommandation", "skip")}},
        "Catégorie": {"rich_text": [{"text": {"content": biz.get("categorie", "")[:200]}}]},
        "Adresse": {"rich_text": [{"text": {"content": biz.get("adresse", "")[:200]}}]},
        "Note Google": {"number": biz.get("note", 0)},
        "Nb avis": {"number": biz.get("nb_avis", 0)},
        "Score mobile": {"number": analyse.get("score_mobile", 0)},
        "Score desktop": {"number": analyse.get("score_desktop", 0)},
        "Technologie": {"rich_text": [{"text": {"content": analyse.get("technologie", "")[:200]}}]},
        "Diagnostic site": {"select": {"name": analyse.get("diagnostic", "absent")}},
        "Problèmes": {"rich_text": [{"text": {"content": "\n".join(analyse.get("problemes", []))[:2000]}}]},
        "Raisons score": {"rich_text": [{"text": {"content": "\n".join(scoring.get("raisons", []))[:2000]}}]},
        "Recherche": {"rich_text": [{"text": {"content": biz.get("recherche", "")[:200]}}]},
    }

    # Champs optionnels (éviter les valeurs vides pour url/phone)
    tel = biz.get("telephone", "")
    if tel:
        props["Téléphone"] = {"phone_number": tel}

    site = biz.get("site_web", "") or analyse.get("url", "")
    if site and site.startswith("http"):
        props["Site web"] = {"url": site}

    url_maps = biz.get("url_maps", "")
    if url_maps and url_maps.startswith("http"):
        props["URL Maps"] = {"url": url_maps}

    return props


def _get_existing_prospects() -> dict:
    """Récupère les prospects existants pour déduplication. Retourne {nom_lower: page_id}."""
    existing = {}
    has_more = True
    start_cursor = None

    while has_more:
        payload = {"page_size": 100}
        if start_cursor:
            payload["start_cursor"] = start_cursor

        r = requests.post(
            f"{NOTION_API_URL}/databases/{NOTION_DATABASE_ID}/query",
            headers=_headers(), json=payload
        )

        if r.status_code != 200:
            print(f"⚠️  Erreur lecture DB : {r.status_code}")
            break

        data = r.json()
        for page in data.get("results", []):
            title_prop = page.get("properties", {}).get("Nom", {}).get("title", [])
            if title_prop:
                nom = title_prop[0].get("text", {}).get("content", "").lower()
                existing[nom] = page["id"]

        has_more = data.get("has_more", False)
        start_cursor = data.get("next_cursor")

    return existing


def export_to_notion(
    businesses: list[dict],
    shortlist_only: bool = True,
    update_existing: bool = True
) -> dict:
    """
    Exporte les prospects vers Notion.

    Args:
        businesses: liste de business scorés
        shortlist_only: si True, n'exporte que les rangs A et B
        update_existing: si True, met à jour les fiches existantes
    
    Returns:
        dict avec stats {created, updated, skipped}
    """
    if not _check_config():
        return {"created": 0, "updated": 0, "skipped": 0}

    # Filtrer si shortlist
    if shortlist_only:
        to_export = [b for b in businesses if b.get("scoring", {}).get("rang") in ("A", "B")]
        print(f"📋 Export shortlist : {len(to_export)} prospects (A+B)")
    else:
        to_export = businesses
        print(f"📋 Export complet : {len(to_export)} prospects")

    if not to_export:
        print("   Aucun prospect à exporter.")
        return {"created": 0, "updated": 0, "skipped": 0}

    # Déduplication
    print("🔄 Vérification des doublons...")
    existing = _get_existing_prospects()
    print(f"   {len(existing)} prospects déjà en base")

    stats = {"created": 0, "updated": 0, "skipped": 0}

    for i, biz in enumerate(to_export):
        nom = biz.get("nom", "")
        nom_lower = nom.lower()
        props = _build_page_properties(biz)

        if nom_lower in existing:
            if update_existing:
                # Mettre à jour (sans écraser le statut)
                page_id = existing[nom_lower]
                update_props = {k: v for k, v in props.items() if k != "Statut"}

                r = requests.patch(
                    f"{NOTION_API_URL}/pages/{page_id}",
                    headers=_headers(),
                    json={"properties": update_props}
                )
                if r.status_code == 200:
                    stats["updated"] += 1
                    print(f"   🔄 [{i+1}/{len(to_export)}] MAJ : {nom}")
                else:
                    print(f"   ⚠️  Erreur MAJ {nom} : {r.status_code}")
                    stats["skipped"] += 1
            else:
                stats["skipped"] += 1
        else:
            # Créer
            r = requests.post(
                f"{NOTION_API_URL}/pages",
                headers=_headers(),
                json={
                    "parent": {"database_id": NOTION_DATABASE_ID},
                    "properties": props,
                }
            )
            if r.status_code == 200:
                stats["created"] += 1
                print(f"   ✅ [{i+1}/{len(to_export)}] Créé : {nom}")
            else:
                print(f"   ❌ Erreur création {nom} : {r.status_code} — {r.text[:200]}")
                stats["skipped"] += 1

        # Rate limit Notion : 3 req/s
        time.sleep(0.35)

    print(f"\n📊 Résultat export :")
    print(f"   ✅ Créés   : {stats['created']}")
    print(f"   🔄 MAJ     : {stats['updated']}")
    print(f"   ⏭️  Ignorés : {stats['skipped']}")

    return stats


# ═══════════════════════════════════════════
# POINT D'ENTRÉE
# ═══════════════════════════════════════════

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Export Notion — Site 4.0")
    parser.add_argument("--input", type=str, help="JSON scoré (output module 3)")
    parser.add_argument("--all", action="store_true", help="Exporter tous les prospects (pas que A+B)")
    parser.add_argument("--no-update", action="store_true", help="Ne pas mettre à jour les existants")
    parser.add_argument("--create-db", type=str, metavar="PAGE_ID",
                        help="Créer la base Notion (fournir l'ID de la page parent)")
    args = parser.parse_args()

    if args.create_db:
        create_database(args.create_db)
        exit(0)

    input_path = args.input or str(
        Path(__file__).resolve().parent.parent / "output" / "scored_prospects.json"
    )

    if not Path(input_path).exists():
        print("❌ Pas de fichier d'entrée. Lance d'abord les modules 1→3.")
        exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        businesses = json.load(f)

    export_to_notion(
        businesses,
        shortlist_only=not args.all,
        update_existing=not args.no_update,
    )
