# Index de la documentation

Un document par phase, plus les documents transverses. Chaque document de phase
décrit **ce qui est réellement dans le dépôt** à la fin de la phase, les choix
faits en chemin et les limites connues — pas une intention.

Pour déployer, il n'y a qu'un document à lire :
[`MISE-EN-PRODUCTION.md`](MISE-EN-PRODUCTION.md).

## Exploitation

| Document                                             | Contenu                                                                                                  |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [`MISE-EN-PRODUCTION.md`](MISE-EN-PRODUCTION.md)     | **Guide pas à pas du premier déploiement** : ressources Cloudflare, jeton API, secrets, Resend, migrations, domaine, cron, checklist d'ouverture, coûts, ce qui reste à produire hors code. |

## Produit et marque

| Document                                                 | Contenu                                                                                                   |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [`strategie-produit.md`](strategie-produit.md)           | Marché, positionnement, prix, règles Etsy, description des trois thèmes (§3.1 à §3.3). Sources citées.        |
| [`marque-et-domaines.md`](marque-et-domaines.md)         | Recherche de nom, disponibilité des domaines et des boutiques Etsy, trois identités de marque candidates.     |
| [`phase-10-vitrine-marque.md`](phase-10-vitrine-marque.md) | Système de marque configurable (`BRAND_ID`, trois presets), page vitrine `/`, ce qui reste à produire.      |
| [`phase-11-kit-etsy.md`](phase-11-kit-etsy.md)           | Kit de mise en vente : fiches, options, messages, PDF de livraison (`pnpm etsy:pdf`). Détail dans `marketing/`. |

## Conception et socle technique

| Document                                           | Contenu                                                                                                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [`phase-1-cadrage.md`](phase-1-cadrage.md)         | Cadrage : pile technique, arborescence cible, modèle de données, i18n, RGPD, budgets (dont le budget JS de 200 kB). |
| [`phase-2-socle.md`](phase-2-socle.md)             | Socle livré : Next 16 + OpenNext Cloudflare, D1/R2/KV, Better Auth, i18n sans préfixe d'URL, permissions du jeton API. |

## Thèmes d'invitation

| Document                                                             | Contenu                                                                                                  |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`phase-3-theme-noir-ivoire.md`](phase-3-theme-noir-ivoire.md)       | Thème 1 et **moteur d'animation** commun aux trois thèmes (seuils, GSAP chargé dynamiquement, poids JS, accessibilité). La référence à lire avant d'écrire un thème. |
| [`phase-9-theme-terracotta-bloom.md`](phase-9-theme-terracotta-bloom.md) | Thème 2 « Terracotta Bloom » (bohème désert) : ce qui change par rapport au thème 1, préfixe `tb-`, captures. |
| [`phase-9-theme-riviera-postcard.md`](phase-9-theme-riviera-postcard.md) | Thème 3 « Riviera Postcard » (méditerranéen) et, en §3, **le piège des feuilles de style qui se croisent** — à lire avant de toucher au CSS d'un thème. |

## Application

| Document                                                           | Contenu                                                                                          |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| [`phase-4-editeur.md`](phase-4-editeur.md)                         | Éditeur : formulaire par chapitre, aperçu en iframe, sauvegarde, upload des photos vers R2.        |
| [`phase-5-6-publication-rsvp.md`](phase-5-6-publication-rsvp.md)   | Publication (slug, fenêtre d'hébergement), page de partage (QR, `.ics`), RSVP, export CSV, rétention. |
| [`phase-7-activation-admin.md`](phase-7-activation-admin.md)       | Activation Etsy V0 (validation manuelle), back-office `/admin`, verrou de connexion, plan V1.      |
| [`phase-8-reconciliation.md`](phase-8-reconciliation.md)           | Refermeture des doublons des phases 4 à 7 (seed unique, env centralisé, `scheduled()`, fuseaux horaires) et, en **§9, la liste des points encore ouverts**. |
