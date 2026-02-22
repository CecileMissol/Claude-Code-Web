"""
Module 3 — Scoring multicritères
Applique les critères de pondération du Workflow 1 Site 4.0
pour classer les prospects par potentiel de conversion.
"""

import json
from dataclasses import dataclass, asdict
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config.settings import (
    SCORING, SECTEURS_PREMIUM, SEUIL_NOTE_MIN, SEUIL_AVIS_MIN,
    SEUIL_PAGESPEED_MAUVAIS, SEUIL_SCORE_SHORTLIST
)


@dataclass
class ProspectScore:
    score_total: int              # 0-100
    rang: str                     # "A", "B", "C", "D"
    details: dict                 # score par critère
    raisons: list[str]            # justifications humaines
    recommandation: str           # "prioritaire", "intéressant", "à surveiller", "skip"
    palier_suggere: str           # "essentiel", "performance", "premium"


def score_prospect(business: dict) -> ProspectScore:
    """
    Calcule le score d'un prospect selon les critères Site 4.0.
    Attend un business enrichi par le module 2 (clé "analyse").
    """
    analyse = business.get("analyse", {})
    details = {}
    raisons = []

    # ═══════════════════════════════════════════
    # 1. SITE ABSENT OU OBSOLÈTE (30 pts max)
    # ═══════════════════════════════════════════
    poids = SCORING["site_absent_ou_obsolete"]
    s = 0

    diagnostic = analyse.get("diagnostic", "absent")
    a_un_site = analyse.get("a_un_site", False)
    score_mobile = analyse.get("score_mobile", 0)

    if not a_un_site:
        s = poids
        raisons.append("🎯 Aucun site web — besoin maximal")
    elif diagnostic == "obsolète":
        s = poids
        raisons.append(f"🎯 Site obsolète (mobile: {score_mobile}/100)")
    elif diagnostic == "passable":
        s = int(poids * 0.7)
        raisons.append(f"⚠️ Site passable (mobile: {score_mobile}/100)")
    elif diagnostic == "correct":
        s = int(poids * 0.3)
        raisons.append(f"ℹ️ Site correct mais améliorable")
    else:  # "bon"
        s = 0
        raisons.append("✅ Site déjà correct — conversion difficile")

    # Bonus problèmes détectés
    problemes = analyse.get("problemes", [])
    if len(problemes) >= 3:
        s = min(s + 5, poids)
        raisons.append(f"   + {len(problemes)} problèmes détectés")

    # Bonus techno obsolète
    techno = analyse.get("technologie", "")
    if techno in ("wix", "jimdo", "ionos", "one.com"):
        s = min(s + 5, poids)
        raisons.append(f"   + Techno limitante ({techno})")

    details["site_absent_ou_obsolete"] = s

    # ═══════════════════════════════════════════
    # 2. BONS AVIS GOOGLE (25 pts max)
    # ═══════════════════════════════════════════
    poids = SCORING["bons_avis"]
    s = 0

    note = business.get("note", 0)
    nb_avis = business.get("nb_avis", 0)

    if note >= SEUIL_NOTE_MIN and nb_avis >= SEUIL_AVIS_MIN:
        # Score proportionnel : plus y a d'avis, mieux c'est
        s = poids
        if nb_avis >= 100:
            raisons.append(f"⭐ Excellente réputation ({note}★, {nb_avis} avis)")
        else:
            raisons.append(f"⭐ Bonne réputation ({note}★, {nb_avis} avis)")
    elif note >= SEUIL_NOTE_MIN and nb_avis >= 5:
        s = int(poids * 0.5)
        raisons.append(f"⭐ Note correcte mais peu d'avis ({note}★, {nb_avis} avis)")
    elif note >= 3.5 and nb_avis >= SEUIL_AVIS_MIN:
        s = int(poids * 0.3)
        raisons.append(f"⚠️ Avis mitigés ({note}★, {nb_avis} avis)")
    else:
        s = 0
        raisons.append(f"❌ Réputation faible ou insuffisante ({note}★, {nb_avis} avis)")

    details["bons_avis"] = s

    # ═══════════════════════════════════════════
    # 3. ACTIVITÉ HAUTE VALEUR (20 pts max)
    # ═══════════════════════════════════════════
    poids = SCORING["activite_haute_valeur"]
    s = 0

    categorie = business.get("categorie", "").lower()
    recherche = business.get("recherche", "").lower()

    is_premium = False
    for sp in SECTEURS_PREMIUM:
        if sp.lower() in categorie or sp.lower() in recherche:
            is_premium = True
            break

    if is_premium:
        s = poids
        raisons.append(f"💰 Secteur à haute valeur ({categorie or recherche.split()[0]})")
    else:
        s = int(poids * 0.4)
        raisons.append(f"ℹ️ Secteur standard ({categorie or '?'})")

    details["activite_haute_valeur"] = s

    # ═══════════════════════════════════════════
    # 4. PRÉSENCE RÉSEAUX SOCIAUX (10 pts max)
    # ═══════════════════════════════════════════
    poids = SCORING["presence_reseaux"]
    s = 0

    # On détecte via le HTML du site (liens FB/Insta) ou la catégorie Maps
    site_html_hints = analyse.get("generateur", "").lower()

    # Heuristique : si le business a un site, il a probablement des réseaux
    # On pourrait enrichir avec un check Facebook/Instagram en module séparé
    if a_un_site:
        s = int(poids * 0.5)
        raisons.append("📱 Présence digitale existante (à vérifier réseaux)")
    else:
        s = int(poids * 0.3)
        raisons.append("📱 Présence digitale à vérifier")

    details["presence_reseaux"] = s

    # ═══════════════════════════════════════════
    # 5. ZONE GÉO PERTINENTE (10 pts max)
    # ═══════════════════════════════════════════
    poids = SCORING["zone_geo_pertinente"]
    # Par défaut on donne les points car la recherche est déjà filtrée par ville
    s = poids
    raisons.append("📍 Zone géographique ciblée")

    details["zone_geo_pertinente"] = s

    # ═══════════════════════════════════════════
    # 6. SECTEUR NON SATURÉ (5 pts max)
    # ═══════════════════════════════════════════
    poids = SCORING["secteur_non_sature"]
    # Heuristique : les artisans sont moins démarchés que les restaurants
    s = int(poids * 0.5)  # score neutre par défaut
    secteurs_moins_demarches = [
        "plombier", "électricien", "serrurier", "menuisier",
        "kinésithérapeute", "ostéopathe", "garage"
    ]
    for sec in secteurs_moins_demarches:
        if sec in recherche or sec in categorie:
            s = poids
            raisons.append("🟢 Secteur peu démarché")
            break
    else:
        raisons.append("🟡 Secteur courant")

    details["secteur_non_sature"] = s

    # ═══════════════════════════════════════════
    # SCORE TOTAL + CLASSIFICATION
    # ═══════════════════════════════════════════
    score_total = sum(details.values())

    if score_total >= 75:
        rang = "A"
        recommandation = "prioritaire"
    elif score_total >= SEUIL_SCORE_SHORTLIST:
        rang = "B"
        recommandation = "intéressant"
    elif score_total >= 35:
        rang = "C"
        recommandation = "à surveiller"
    else:
        rang = "D"
        recommandation = "skip"

    # Palier suggéré selon le profil
    palier = _suggest_palier(business, analyse, score_total)

    return ProspectScore(
        score_total=score_total,
        rang=rang,
        details=details,
        raisons=raisons,
        recommandation=recommandation,
        palier_suggere=palier,
    )


def _suggest_palier(business: dict, analyse: dict, score: int) -> str:
    """Suggère le palier Site 4.0 adapté au prospect."""
    nb_avis = business.get("nb_avis", 0)
    categorie = business.get("categorie", "").lower()

    # PME établie, beaucoup d'avis, secteur premium → Premium
    is_premium_sector = any(
        sp.lower() in categorie or sp.lower() in business.get("recherche", "").lower()
        for sp in SECTEURS_PREMIUM
    )

    if nb_avis >= 100 and is_premium_sector:
        return "premium"
    elif nb_avis >= 30 or is_premium_sector:
        return "performance"
    else:
        return "essentiel"


def score_all_businesses(businesses: list[dict], output_path: str = None) -> list[dict]:
    """
    Score tous les business et trie par score décroissant.
    """
    if output_path is None:
        output_path = str(Path(__file__).resolve().parent.parent / "output" / "scored_prospects.json")

    scored = []
    for biz in businesses:
        prospect_score = score_prospect(biz)
        biz["scoring"] = asdict(prospect_score)
        scored.append(biz)

    # Trier par score décroissant
    scored.sort(key=lambda x: x["scoring"]["score_total"], reverse=True)

    # Stats
    rangs = {"A": 0, "B": 0, "C": 0, "D": 0}
    for biz in scored:
        rangs[biz["scoring"]["rang"]] += 1

    print(f"\n📊 Résultats du scoring :")
    print(f"   🅰️  Prioritaire (A) : {rangs['A']}")
    print(f"   🅱️  Intéressant (B) : {rangs['B']}")
    print(f"   🅲  À surveiller (C) : {rangs['C']}")
    print(f"   🅳  Skip (D)         : {rangs['D']}")
    print(f"   ─────────────────────")
    print(f"   Total : {len(scored)}")

    # Shortlist (A + B)
    shortlist = [b for b in scored if b["scoring"]["rang"] in ("A", "B")]
    print(f"\n🎯 Shortlist (A+B) : {len(shortlist)} prospects")

    if shortlist:
        print(f"\n   Top 5 :")
        for b in shortlist[:5]:
            sc = b["scoring"]
            print(f"   {sc['score_total']:3d}/100 [{sc['rang']}] {b['nom']} — {sc['recommandation']} → {sc['palier_suggere']}")

    # Sauvegarder
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(scored, f, ensure_ascii=False, indent=2)

    print(f"\n💾 Résultats sauvegardés : {output_path}")
    return scored


# === Point d'entrée direct ===
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Scoring prospects — Site 4.0")
    parser.add_argument("--input", type=str, help="JSON enrichi (output module 2)")
    args = parser.parse_args()

    input_path = args.input or str(
        Path(__file__).resolve().parent.parent / "output" / "analyzed_businesses.json"
    )

    if not Path(input_path).exists():
        print("❌ Pas de fichier d'entrée. Lance d'abord les modules 1 et 2.")
        exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        businesses = json.load(f)

    score_all_businesses(businesses)
