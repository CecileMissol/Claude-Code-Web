"""
Configuration du pipeline de prospection Site 4.0
"""

import os

# === RECHERCHES GOOGLE MAPS ===
# Format : "secteur + ville"
# Le scraper boucle sur toutes les combinaisons secteur × ville

SECTEURS = [
    "restaurant",
    "hôtel",
    "plombier",
    "électricien",
    "serrurier",
    "menuisier",
    "avocat",
    "architecte",
    "cabinet comptable",
    "kinésithérapeute",
    "ostéopathe",
    "dentiste",
    "coiffeur",
    "boulangerie",
    "fleuriste",
    "garage automobile",
]

VILLES = [
    "Aix-en-Provence",
    "Marseille",
    # Ajouter tes villes cibles ici
]

# === SCORING (pondérations sur 100) ===
SCORING = {
    "site_absent_ou_obsolete": 30,   # ★★★ pas de site ou mauvais score
    "bons_avis": 25,                 # ★★★ note >= 4.0 et >= 20 avis
    "activite_haute_valeur": 20,     # ★★★ secteur premium
    "presence_reseaux": 10,          # ★★ présence Facebook/Insta
    "zone_geo_pertinente": 10,       # ★★ proximité
    "secteur_non_sature": 5,         # ★ peu de concurrence web
}

# Secteurs à haute valeur (panier moyen élevé)
SECTEURS_PREMIUM = [
    "hôtel", "restaurant", "avocat", "architecte",
    "cabinet comptable", "dentiste", "chirurgien",
]

# Seuils
SEUIL_NOTE_MIN = 4.0        # Note Google minimum
SEUIL_AVIS_MIN = 15         # Nombre d'avis minimum
SEUIL_PAGESPEED_MAUVAIS = 50  # En dessous = site obsolète
SEUIL_SCORE_SHORTLIST = 50  # Score minimum pour la shortlist

# === PAGESPEED API ===
# Gratuite, pas de clé nécessaire (mais rate-limited)
PAGESPEED_API_URL = "https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed"

# === NOTION ===
NOTION_API_KEY = os.getenv("NOTION_API_KEY", "")          # À remplir : secret_xxx
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID", "")  # À remplir : ID de la DB prospects

# === LLM (pour M5, M7) ===
# Provider à utiliser : "openai" | "gemini" | "anthropic"
# Change pour tester et comparer les résultats !
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")

LLM_MODELS = {
    "openai":    "gpt-4o",
    "gemini":    "gemini-1.5-flash",
    "anthropic": "claude-sonnet-4-6",
}

OPENAI_API_KEY    = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY    = os.getenv("GEMINI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# === CRAWL (pour M6) ===
MAX_PAGES_TO_CRAWL    = 5   # Nombre max de pages crawlées par site
MAX_IMAGES_TO_DOWNLOAD = 10  # Nombre max d'images téléchargées par site

# === OUTPUT ===
OUTPUT_DIR = "output"  # Dossier de sortie relatif à la racine du projet

# === DÉLAIS (politesse scraping) ===
DELAY_BETWEEN_SEARCHES = 3   # secondes entre chaque recherche Maps
DELAY_BETWEEN_PAGESPEED = 2  # secondes entre chaque appel PageSpeed
MAX_RESULTS_PER_SEARCH = 20  # nombre max de résultats par recherche Maps
