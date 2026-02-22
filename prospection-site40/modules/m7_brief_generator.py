"""
Module 7 — Générateur de brief prototype
Synthétise les analyses M5 + M6 pour produire :
  - Un brief JSON structuré (pour injection dans le template)
  - Un brief Markdown lisible (pour review humaine)
  - Une mise à jour de la fiche Notion
"""

import json
import time
from datetime import datetime
from pathlib import Path

import requests

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config.settings import (
    OUTPUT_DIR, NOTION_API_KEY, NOTION_DATABASE_ID
)
from modules.llm_client import call_llm, parse_json_response


# ═══════════════════════════════════════════
# CONSTRUCTION DU PROMPT BRIEF
# ═══════════════════════════════════════════

def _build_brief_prompt(business: dict) -> str:
    """Construit le prompt pour générer le brief prototype complet."""
    nom = business.get("nom", "")
    categorie = business.get("categorie", "")
    adresse = business.get("adresse", "")
    note = business.get("note", 0)
    nb_avis = business.get("nb_avis", 0)
    scoring = business.get("scoring", {})
    rang = scoring.get("rang", "B")
    palier = scoring.get("palier_suggere", "essentiel")
    raisons = scoring.get("raisons", [])

    brand = business.get("brand_analysis", {}).get("llm_analysis", {})
    content = business.get("content", {})
    pages_content = content.get("pages", {})
    images = content.get("images", [])
    source = content.get("source", "site")

    # Synthèse du contenu existant
    content_summary = []
    for path, page in list(pages_content.items())[:5]:
        h1 = page.get("h1", [])
        h2 = page.get("h2", [])
        paras = page.get("paragraphes", [])[:3]
        if h1 or h2 or paras:
            content_summary.append(f"Page {path}: H1={h1[:1]}, H2={h2[:2]}, §={paras[:2]}")

    prompt = f"""Tu es un expert en création de sites web et en stratégie digitale pour les PME locales.
Tu travailles pour Site 4.0, une agence qui crée des sites ultra-personnalisés en quelques jours.

## Brief entreprise

**Nom** : {nom}
**Secteur** : {categorie}
**Localisation** : {adresse}
**Réputation Google** : {note}★ ({nb_avis} avis) — rang prospect : {rang}
**Palier suggéré** : {palier}
**Pourquoi c'est un bon prospect** : {', '.join(raisons[:3])}

## Analyse de la marque (M5)

- Ton éditorial : {brand.get('ton_editorial', 'non analysé')}
- Personnalité : {brand.get('personnalite_marque', 'non analysé')}
- Audience cible : {brand.get('audience_cible', 'non analysé')}
- Points faibles actuels : {', '.join(brand.get('points_faibles_ux', [])[:3])}
- Angle d'accroche suggéré : {brand.get('angle_accroche', 'non analysé')}
- Palette améliorée : {json.dumps(brand.get('palette_amelioree', {}), ensure_ascii=False)}
- Typographie : {json.dumps(brand.get('typographie_suggeree', {}), ensure_ascii=False)}

## Contenu extrait (M6)

Source : {source}
{chr(10).join(content_summary) if content_summary else 'Pas de contenu extrait'}
Images disponibles : {len(images)}

## Ta mission

Génère un brief complet pour créer un prototype de site web ultra-personnalisé pour ce prospect.
Ce prototype sera montré au prospect sans qu'il l'ait commandé — l'objectif est de le séduire.

Retourne un JSON avec exactement cette structure :

{{
  "meta": {{
    "nom_client": "{nom}",
    "secteur": "{categorie}",
    "palier": "{palier}",
    "date_brief": "{datetime.now().strftime('%Y-%m-%d')}"
  }},
  "positionnement": {{
    "message_principal": "L'accroche principale du site (1 phrase percutante)",
    "sous_message": "Le sous-titre qui précise et rassure",
    "proposition_valeur": "Ce qui distingue cette entreprise de ses concurrents locaux",
    "ton": "Le ton éditorial à adopter"
  }},
  "design": {{
    "palette": {{
      "primaire": "#hexcode",
      "secondaire": "#hexcode",
      "accent": "#hexcode",
      "texte": "#hexcode",
      "fond": "#hexcode"
    }},
    "typographie": {{
      "titres": "Nom Google Font",
      "corps": "Nom Google Font"
    }},
    "style_global": "Description du style visuel (ex: épuré et professionnel, chaleureux et artisanal...)",
    "inspirations": ["mot-clé style 1", "mot-clé style 2"]
  }},
  "structure_pages": [
    {{
      "page": "Nom de la page",
      "url": "/slug",
      "priorite": 1,
      "sections": [
        {{
          "type": "hero | about | services | testimonials | cta | contact | gallery | faq",
          "titre": "Titre de la section",
          "contenu_suggere": "Description du contenu à mettre ici",
          "contenu_existant": "Texte extrait du site actuel si disponible, sinon null"
        }}
      ]
    }}
  ],
  "contenu_cles": {{
    "accroche_hero": "Texte exact pour le hero (tiré du site ou réécrit)",
    "description_activite": "Paragraphe court décrivant l'activité",
    "cta_principal": "Texte du bouton d'action principal",
    "cta_secondaire": "Texte du bouton secondaire",
    "points_forts": ["Point fort 1 à mettre en avant", "Point fort 2", "Point fort 3"]
  }},
  "images_a_utiliser": [
    {{
      "role": "hero | logo | service | team | gallery",
      "description": "Ce que doit montrer cette image",
      "source": "existante | à créer | stock"
    }}
  ],
  "notes_developpeur": "Instructions spécifiques pour le développement du prototype (composants spéciaux, animations, etc.)"
}}

Sois très concret et personnalisé. Utilise les vraies informations de l'entreprise.
Adapte la structure de pages au secteur d'activité et au palier suggéré :
- essentiel : 3-4 pages simples
- performance : 5-7 pages avec sections riches
- premium : 8+ pages, fonctionnalités avancées"""

    return prompt


# ═══════════════════════════════════════════
# GÉNÉRATION MARKDOWN
# ═══════════════════════════════════════════

def _brief_to_markdown(brief: dict, business: dict) -> str:
    """Convertit le brief JSON en document Markdown lisible."""
    nom = brief.get("meta", {}).get("nom_client", "")
    date = brief.get("meta", {}).get("date_brief", "")
    palier = brief.get("meta", {}).get("palier", "")
    secteur = brief.get("meta", {}).get("secteur", "")

    pos = brief.get("positionnement", {})
    design = brief.get("design", {})
    palette = design.get("palette", {})
    typo = design.get("typographie", {})
    contenu = brief.get("contenu_cles", {})
    pages = brief.get("structure_pages", [])
    images = brief.get("images_a_utiliser", [])

    scoring = business.get("scoring", {})
    rang = scoring.get("rang", "")
    score = scoring.get("score_total", 0)
    note_g = business.get("note", 0)
    avis = business.get("nb_avis", 0)
    adresse = business.get("adresse", "")

    lines = [
        f"# Brief Prototype — {nom}",
        f"",
        f"> **Date** : {date} | **Palier** : {palier.upper()} | **Rang prospect** : {rang} ({score}/100)",
        f"",
        f"---",
        f"",
        f"## Infos entreprise",
        f"",
        f"| Champ | Valeur |",
        f"|-------|--------|",
        f"| Secteur | {secteur} |",
        f"| Adresse | {adresse} |",
        f"| Note Google | {note_g}★ ({avis} avis) |",
        f"",
        f"---",
        f"",
        f"## Positionnement",
        f"",
        f"**Message principal** : {pos.get('message_principal', '')}",
        f"",
        f"**Sous-message** : {pos.get('sous_message', '')}",
        f"",
        f"**Proposition de valeur** : {pos.get('proposition_valeur', '')}",
        f"",
        f"**Ton éditorial** : {pos.get('ton', '')}",
        f"",
        f"---",
        f"",
        f"## Design",
        f"",
        f"### Palette de couleurs",
        f"",
        f"| Rôle | Couleur |",
        f"|------|---------|",
        f"| Primaire | `{palette.get('primaire', '')}` |",
        f"| Secondaire | `{palette.get('secondaire', '')}` |",
        f"| Accent | `{palette.get('accent', '')}` |",
        f"| Texte | `{palette.get('texte', '')}` |",
        f"| Fond | `{palette.get('fond', '')}` |",
        f"",
        f"### Typographie",
        f"",
        f"- **Titres** : {typo.get('titres', '')}",
        f"- **Corps** : {typo.get('corps', '')}",
        f"",
        f"**Style global** : {design.get('style_global', '')}",
        f"",
        f"---",
        f"",
        f"## Contenu clés",
        f"",
        f"**Accroche hero** : *{contenu.get('accroche_hero', '')}*",
        f"",
        f"**Description activité** :",
        f"{contenu.get('description_activite', '')}",
        f"",
        f"**CTA principal** : `{contenu.get('cta_principal', '')}`",
        f"**CTA secondaire** : `{contenu.get('cta_secondaire', '')}`",
        f"",
        f"**Points forts à mettre en avant** :",
    ]

    for pf in contenu.get("points_forts", []):
        lines.append(f"- {pf}")

    lines += [
        f"",
        f"---",
        f"",
        f"## Structure des pages",
        f"",
    ]

    for page in pages:
        lines.append(f"### {page.get('priorite', '')}. {page.get('page', '')} (`{page.get('url', '')}`)")
        lines.append("")
        for section in page.get("sections", []):
            lines.append(f"**{section.get('type', '').upper()}** — {section.get('titre', '')}")
            lines.append(f"→ {section.get('contenu_suggere', '')}")
            if section.get("contenu_existant"):
                lines.append(f"> Contenu existant : *{section['contenu_existant'][:200]}*")
            lines.append("")

    lines += [
        f"---",
        f"",
        f"## Images",
        f"",
    ]

    for img in images:
        lines.append(f"- **{img.get('role', '')}** : {img.get('description', '')} *(source : {img.get('source', '')})*")

    notes = brief.get("notes_developpeur", "")
    if notes:
        lines += [
            f"",
            f"---",
            f"",
            f"## Notes développeur",
            f"",
            f"{notes}",
        ]

    return "\n".join(lines)


# ═══════════════════════════════════════════
# MISE À JOUR NOTION
# ═══════════════════════════════════════════

def _update_notion_with_brief(business: dict, brief_md: str, brief_json_path: str):
    """Met à jour la fiche Notion du prospect avec le brief."""
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        print("   ⚠️  Notion non configuré — skip")
        return

    nom = business.get("nom", "").lower()

    # Trouver la page Notion existante
    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
    }

    r = requests.post(
        f"https://api.notion.com/v1/databases/{NOTION_DATABASE_ID}/query",
        headers=headers,
        json={"filter": {"property": "Nom", "title": {"contains": business.get("nom", "")}}}
    )

    if r.status_code != 200:
        print(f"   ⚠️  Notion query échoué : {r.status_code}")
        return

    results = r.json().get("results", [])
    if not results:
        print(f"   ⚠️  Prospect introuvable dans Notion")
        return

    page_id = results[0]["id"]

    # Préparer les nouvelles propriétés
    brief_preview = brief_md[:1900] + "..." if len(brief_md) > 1900 else brief_md
    design = business.get("prototype_brief", {}).get("design", {})
    palette = design.get("palette", {})

    update_props = {
        "Statut": {"select": {"name": "🔨 Prototype en cours"}},
        "Brief Prototype": {"rich_text": [{"text": {"content": brief_preview}}]},
        "Palette Couleurs": {
            "rich_text": [{"text": {"content": " | ".join(
                f"{k}: {v}" for k, v in palette.items() if v
            )}}]
        },
    }

    r2 = requests.patch(
        f"https://api.notion.com/v1/pages/{page_id}",
        headers=headers,
        json={"properties": update_props}
    )

    if r2.status_code == 200:
        print(f"   ✅ Notion mis à jour")
    else:
        print(f"   ⚠️  Erreur Notion : {r2.status_code}")


# ═══════════════════════════════════════════
# POINT D'ENTRÉE PRINCIPAL
# ═══════════════════════════════════════════

def generate_brief(business: dict, output_base: Path = None) -> dict:
    """
    Génère le brief complet pour un business.
    Retourne le business enrichi avec 'prototype_brief'.
    """
    if output_base is None:
        output_base = Path(__file__).resolve().parent.parent / OUTPUT_DIR

    nom = business.get("nom", "inconnu")
    slug = business.get("brand_analysis", {}).get("slug") or nom.lower().replace(" ", "-")[:40]

    brief_dir = output_base / slug
    brief_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n📝 Génération du brief : {nom}")

    # 1. Appel LLM
    prompt = _build_brief_prompt(business)
    print(f"   🤖 Génération LLM...")
    try:
        response = call_llm(prompt, json_output=True)
        brief = parse_json_response(response)
    except Exception as e:
        print(f"   ❌ Erreur LLM : {e}")
        brief = {"erreur": str(e), "meta": {"nom_client": nom}}

    # 2. Sauvegarder JSON
    json_path = brief_dir / "prototype_brief.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(brief, f, ensure_ascii=False, indent=2)
    print(f"   💾 JSON : {json_path}")

    # 3. Générer et sauvegarder Markdown
    md = _brief_to_markdown(brief, business)
    md_path = brief_dir / "prototype_brief.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"   💾 Markdown : {md_path}")

    # 4. Mettre à jour Notion
    _update_notion_with_brief(business, md, str(json_path))

    business["prototype_brief"] = brief
    business["prototype_brief_paths"] = {
        "json": str(json_path),
        "markdown": str(md_path),
    }

    return business


def generate_briefs_all(businesses: list[dict], output_path: str = None) -> list[dict]:
    """Génère les briefs pour tous les business de la liste."""
    if output_path is None:
        output_path = str(
            Path(__file__).resolve().parent.parent / OUTPUT_DIR / "briefed_prospects.json"
        )

    output_base = Path(output_path).parent
    results = []

    for i, biz in enumerate(businesses):
        print(f"\n[{i+1}/{len(businesses)}]", end="")
        enriched = generate_brief(biz, output_base)
        results.append(enriched)
        time.sleep(1)  # Politesse API

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n\n✅ {len(results)} briefs générés")
    print(f"💾 Sauvegardé : {output_path}")
    print(f"\n📁 Briefs individuels dans : {output_base}/[slug]/prototype_brief.md")

    return results


# ═══════════════════════════════════════════
# POINT D'ENTRÉE DIRECT
# ═══════════════════════════════════════════

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Générateur de brief prototype — Site 4.0")
    parser.add_argument("--input", type=str, help="JSON content_extracted (output module 6)")
    args = parser.parse_args()

    input_path = args.input or str(
        Path(__file__).resolve().parent.parent / OUTPUT_DIR / "content_extracted.json"
    )

    if not Path(input_path).exists():
        print("❌ Pas de fichier d'entrée. Lance d'abord les modules 1→6.")
        exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        businesses = json.load(f)

    generate_briefs_all(businesses)
