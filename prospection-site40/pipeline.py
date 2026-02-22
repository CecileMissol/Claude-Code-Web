#!/usr/bin/env python3
"""
🎯 Pipeline de prospection Site 4.0
Lance les modules en séquence :
  1. Scraping Google Maps
  2. Analyse des sites web (PageSpeed, techno)
  3. Scoring multicritères → shortlist A/B
  4. Export Notion (fiche prospect)
  --- Workflow prototype (shortlist uniquement) ---
  5. Analyse approfondie (charte, ton, screenshots)
  6. Extraction de contenu (textes + images)
  7. Génération du brief prototype (JSON + Markdown + Notion)
"""

import asyncio
import argparse
import json
from pathlib import Path

from modules.m1_scraper_maps import run_extraction, save_raw_results
from modules.m2_analyzer import analyze_businesses
from modules.m3_scoring import score_all_businesses
from modules.m4_notion_export import export_to_notion
from modules.m5_deep_analyzer import deep_analyze_all
from modules.m6_content_extractor import extract_content_all
from modules.m7_brief_generator import generate_briefs_all


def main():
    parser = argparse.ArgumentParser(description="Pipeline de prospection Site 4.0")

    # Contrôle du scraping
    parser.add_argument("--secteur", type=str, help="Un seul secteur")
    parser.add_argument("--ville", type=str, help="Une seule ville")
    parser.add_argument("--skip-scrape", action="store_true", help="Reprendre depuis le JSON existant")

    # Contrôle des étapes
    parser.add_argument("--skip-notion", action="store_true", help="Ne pas exporter vers Notion (M4)")
    parser.add_argument("--with-brief", action="store_true",
                        help="Enchaîner M5→M7 après le scoring (sinon utilisez brief_trigger.py)")
    parser.add_argument("--only-brief", action="store_true", help="Lancer uniquement M5→M7 depuis scored_prospects.json")

    # Options
    parser.add_argument("--all-rangs", action="store_true", help="Exporter/analyser tous les rangs (pas que A+B)")
    parser.add_argument("--llm", type=str, choices=["openai", "gemini", "anthropic"],
                        help="Forcer un provider LLM pour M5/M7")

    args = parser.parse_args()

    # Surcharger le provider LLM si précisé
    if args.llm:
        import config.settings as cfg
        cfg.LLM_PROVIDER = args.llm
        print(f"🤖 Provider LLM forcé : {args.llm}")

    output_dir = Path(__file__).resolve().parent / "output"
    output_dir.mkdir(exist_ok=True)

    # ════════════════════════════════════════════
    # MODE : BRIEF SEULEMENT (M5→M7)
    # ════════════════════════════════════════════
    if args.only_brief:
        scored_path = output_dir / "scored_prospects.json"
        if not scored_path.exists():
            print("❌ scored_prospects.json introuvable. Lance d'abord le pipeline complet.")
            return

        with open(scored_path, "r", encoding="utf-8") as f:
            scored = json.load(f)

        _run_prototype_workflow(scored, output_dir, shortlist_only=not args.all_rangs)
        return

    # ════════════════════════════════════════════
    # PIPELINE COMPLET
    # ════════════════════════════════════════════

    # ── ÉTAPE 1 : Scraping ──
    raw_path = output_dir / "raw_businesses.json"

    if args.skip_scrape and raw_path.exists():
        print("⏭️  Scraping ignoré — chargement du JSON existant")
        with open(raw_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
    else:
        print("=" * 55)
        print("📍 ÉTAPE 1 — Scraping Google Maps")
        print("=" * 55)
        secteurs = [args.secteur] if args.secteur else None
        villes = [args.ville] if args.ville else None
        businesses = asyncio.run(run_extraction(secteurs, villes))
        save_raw_results(businesses)
        raw_data = [b.to_dict() if hasattr(b, 'to_dict') else b for b in businesses]

    # ── ÉTAPE 2 : Analyse ──
    print("\n" + "=" * 55)
    print("🔎 ÉTAPE 2 — Analyse des sites web")
    print("=" * 55)
    analyzed = analyze_businesses(raw_data)

    # ── ÉTAPE 3 : Scoring ──
    print("\n" + "=" * 55)
    print("📊 ÉTAPE 3 — Scoring multicritères")
    print("=" * 55)
    scored = score_all_businesses(analyzed)

    # ── ÉTAPE 4 : Export Notion ──
    if not args.skip_notion:
        print("\n" + "=" * 55)
        print("📤 ÉTAPE 4 — Export Notion (fiches prospects)")
        print("=" * 55)
        export_to_notion(scored, shortlist_only=not args.all_rangs)
    else:
        print("\n⏭️  Export Notion ignoré")

    # ── ÉTAPES 5→7 : Workflow prototype (optionnel) ──
    if args.with_brief:
        _run_prototype_workflow(scored, output_dir, shortlist_only=not args.all_rangs)
    else:
        shortlist = [b for b in scored if b.get("scoring", {}).get("rang") in ("A", "B")]
        print(f"\n💡 {len(shortlist)} prospect(s) en shortlist A/B.")
        print(f"   → Dans Notion, passez-les en '⚡ À briefer' puis lancez : python brief_trigger.py")

    print("\n" + "=" * 55)
    print("✅ Pipeline terminé !")
    print("=" * 55)


def _run_prototype_workflow(scored: list[dict], output_dir: Path, shortlist_only: bool = True):
    """Lance les modules 5, 6, 7 sur la shortlist."""

    shortlist = [b for b in scored if b.get("scoring", {}).get("rang") in ("A", "B")] if shortlist_only else scored
    label = f"shortlist A+B : {len(shortlist)}" if shortlist_only else f"tous : {len(shortlist)}"

    print("\n" + "=" * 55)
    print(f"🔍 ÉTAPE 5 — Analyse approfondie ({label})")
    print("=" * 55)
    deep_analyzed = deep_analyze_all(shortlist, shortlist_only=False,
                                      output_path=str(output_dir / "deep_analyzed.json"))

    print("\n" + "=" * 55)
    print(f"📦 ÉTAPE 6 — Extraction de contenu")
    print("=" * 55)
    content_extracted = extract_content_all(deep_analyzed,
                                             output_path=str(output_dir / "content_extracted.json"))

    print("\n" + "=" * 55)
    print(f"📝 ÉTAPE 7 — Génération des briefs prototypes")
    print("=" * 55)
    generate_briefs_all(content_extracted,
                        output_path=str(output_dir / "briefed_prospects.json"))


if __name__ == "__main__":
    main()
