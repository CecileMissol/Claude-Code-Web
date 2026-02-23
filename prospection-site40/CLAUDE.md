# 🎯 Prospection Site 4.0 — Contexte Claude Code

> Agence web Site 4.0 — Pipeline automatisé de prospection : identifie les PME avec un mauvais site web, les score, les exporte vers Notion, puis génère un brief prototype à la demande.

## Repo & branche active

```
https://github.com/CecileMissol/Claude-Code-Web
branche : claude/setup-site-workflow-G6dEJ
dossier : prospection-site40/
```

---

## Architecture : deux workflows distincts

### Workflow 1 — Prospection (M1→M4)
Lance quotidiennement ou à la demande.

```
M1 scraper_maps     → Google Maps → raw_businesses.json
M2 analyzer         → PageSpeed + CMS → analyzed_businesses.json
M3 scoring          → Score 0-100, Rang A/B/C/D → scored_prospects.json
M4 notion_export    → Notion DB (dedup par nom)
```

```bash
python pipeline.py                        # pipeline complet M1→M4
python pipeline.py --skip-scrape          # reprend depuis analyzed_businesses.json
python pipeline.py --skip-notion          # sans export Notion
python pipeline.py --secteur restaurant --ville Marseille
```

Après M4, le pipeline **s'arrête** et affiche le nombre de prospects shortlist A/B.

---

### Workflow 2 — Brief Prototype (M5→M7)
Déclenché **manuellement** depuis Notion via statut `⚡ À briefer`.

```
Notion "⚡ À briefer"
    ↓
brief_trigger.py
    ↓
M5 deep_analyzer    → Screenshots + LLM brand analysis
M6 content_extractor→ Crawl site + images
M7 brief_generator  → Brief JSON + Markdown + update Notion
    ↓
Notion "🎨 Brief prêt"
```

```bash
python brief_trigger.py             # traite tous les "⚡ À briefer"
python brief_trigger.py --dry-run   # aperçu sans traiter
python brief_trigger.py --llm gemini
```

Pour enchaîner M5→M7 directement sans passer par Notion :
```bash
python pipeline.py --with-brief
python pipeline.py --only-brief     # depuis scored_prospects.json uniquement
```

---

## Structure des fichiers

```
prospection-site40/
├── pipeline.py             # Orchestrateur principal (M1→M4 + options)
├── brief_trigger.py        # Trigger Notion → M5→M7
├── config/
│   └── settings.py         # SECTEURS, VILLES, seuils, clés API
├── modules/
│   ├── m1_scraper_maps.py  # Scraping Google Maps (Playwright)
│   ├── m2_analyzer.py      # PageSpeed API + détection CMS
│   ├── m3_scoring.py       # Score multi-critères 0-100
│   ├── m4_notion_export.py # Export Notion (schéma 22 champs)
│   ├── m5_deep_analyzer.py # Screenshots + analyse LLM marque
│   ├── m6_content_extractor.py  # Crawl site + téléchargement images
│   ├── m7_brief_generator.py    # Génération brief JSON+MD + update Notion
│   └── llm_client.py       # Wrapper multi-provider (OpenAI/Gemini/Anthropic)
└── output/
    ├── raw_businesses.json
    ├── analyzed_businesses.json
    ├── scored_prospects.json
    ├── deep_analyzed.json
    ├── content_extracted.json
    ├── briefed_prospects.json
    └── [slug]/
        ├── screenshots/{desktop,mobile}.png
        ├── images/
        ├── prototype_brief.json
        ├── prototype_brief.md
        └── full_prospect.json
```

---

## Variables d'environnement requises

Créer un fichier `.env` dans `prospection-site40/` :

```env
# Notion — requis pour M4 + M7
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxx

# LLM — au moins un requis pour M5 + M7
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx

# Optionnel : forcer un provider (défaut : openai)
LLM_PROVIDER=openai
```

---

## Schéma Notion (22 champs)

| Champ | Type | Rôle |
|---|---|---|
| Nom | title | Identifiant |
| Score | number | Score M3 (0-100) |
| Rang | select | A / B / C / D |
| Statut | select | Voir ci-dessous |
| Recommandation | select | prioritaire / intéressant / à surveiller / skip |
| Palier suggéré | select | essentiel / performance / premium |
| Catégorie | rich_text | Secteur |
| Adresse | rich_text | |
| Téléphone | phone_number | |
| Site web | url | |
| Note Google | number | |
| Nb avis | number | |
| URL Maps | url | |
| Recherche | rich_text | Requête M1 |
| Score mobile | number | PageSpeed |
| Score desktop | number | PageSpeed |
| Technologie | rich_text | WordPress, Wix… |
| Diagnostic site | select | absent / obsolète / passable / correct / bon |
| Problèmes | rich_text | Liste M2 |
| Raisons score | rich_text | Explication M3 |
| Prototype URL | url | URL du prototype |
| Brief Prototype | rich_text | Résumé brief M7 |
| Palette Couleurs | rich_text | HEX palette M7 |
| Notes | rich_text | |
| Date contact | date | |
| Date relance | date | |

### Statuts Notion

| Statut | Couleur | Signification |
|---|---|---|
| 🆕 Nouveau | gris | Exporté par M4, pas encore traité |
| ⚡ À briefer | orange | **Déclenche brief_trigger.py** |
| 🔨 Prototype en cours | jaune | M5→M7 en cours |
| 🎨 Brief prêt | rose | Brief généré, à consulter |
| 📧 Contacté | bleu | Email envoyé |
| 🔄 Relancé | violet | Relance envoyée |
| 📞 RDV planifié | vert | |
| ✅ Converti | vert | Client signé |
| ❌ Refusé | rouge | |
| ⏸️ En attente | gris | |

---

## Scoring M3 (100 points max)

| Critère | Points max | Logique |
|---|---|---|
| Site absent ou obsolète | 30 | Absent=30, obsolète=30, passable=21, correct=9, bon=0 |
| Bons avis Google | 25 | Note≥4.0 ET avis≥15 = 25 pts (sinon prorata) |
| Secteur haute valeur | 20 | Hotel, resto, avocat, archi, comptable, dentiste |
| Présence réseaux | 10 | A un site = +5 |
| Zone géo pertinente | 10 | Auto-accordé (recherche filtrée par ville) |
| Secteur non saturé | 5 | Artisans > commerces |

Rang : A ≥ 75 | B ≥ 50 | C ≥ 35 | D < 35

---

## Installation (Desktop)

```bash
# 1. Cloner + checkout
git clone https://github.com/CecileMissol/Claude-Code-Web
cd Claude-Code-Web
git checkout claude/setup-site-workflow-G6dEJ

# 2. Installer les dépendances
cd prospection-site40
pip install -r requirements.txt
playwright install chromium

# 3. Créer le .env (voir section Variables ci-dessus)
cp .env.example .env  # ou créer manuellement

# 4. Lancer
python pipeline.py
```

---

## Choses à faire / WIP

- [ ] Webhook Notion pour déclencher brief_trigger.py automatiquement (au lieu du polling manuel)
- [ ] Retry LLM avec backoff exponentiel en cas de timeout API
- [ ] Parallélisation de M5/M6 (actuellement séquentiel)
- [ ] Mise à jour du champ "Prototype URL" dans Notion (M7 génère l'URL mais ne la poste pas)
- [ ] Migration/mise à jour du schéma Notion si les champs changent
- [ ] `.env.example` à créer

---

## Provider LLM par défaut

`openai` → `gpt-4o` (pour M5 et M7, analyses visuelles + brief)

Pour tester d'autres providers :
```bash
python brief_trigger.py --llm gemini    # gemini-1.5-flash
python brief_trigger.py --llm anthropic # claude-sonnet-4-6
```
