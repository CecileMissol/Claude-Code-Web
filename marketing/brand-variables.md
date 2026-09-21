# Variables de marque — kit Etsy

Ce kit marketing (dossier `marketing/`) est écrit avec des **placeholders** au
lieu du nom de marque définitif, pour rester facile à rebrander tant que le
nom et le nom de domaine ne sont pas verrouillés (voir
`docs/marque-et-domaines.md`, section 3 : aucun domaine ni marque n'y est
confirmé comme disponible).

## 1. Les trois placeholders

| Placeholder      | Rôle                                                                    | Valeur par défaut utilisée dans ce kit | Où elle vient                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `{{BRAND_NAME}}` | Nom de la marque, tel qu'affiché dans les textes (logo, signature, PDF) | `Kraft & Bloom`                        | `docs/marque-et-domaines.md` §5, proposition B (recommandée)                                                                        |
| `{{BRAND_URL}}`  | Domaine racine de l'application, sans `https://` ni slash final         | `kraftandbloom.com`                    | Déduit de la proposition B — **non vérifié** : disponibilité domaine/marque à confirmer avant tout achat (voir §3 du même document) |
| `{{SHOP_NAME}}`  | Nom exact de la boutique Etsy (identifiant `etsy.com/shop/...`)         | `KraftAndBloomCo`                      | Première des 3 idées de boutique proposées en `docs/marque-et-domaines.md` §5, à vérifier une à une sur Etsy avant choix définitif  |

Deux placeholders additionnels apparaissent dans le PDF de livraison (générés
par le script, pas à remplacer à la main) :

| Placeholder                               | Rôle                                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------- |
| `{{ACTIVATION_URL}}`                      | Résolu automatiquement à `{{BRAND_URL}}/activate` par `scripts/build-delivery-pdf.mjs` |
| `{{THEME_NAME_EN}}` / `{{THEME_NAME_FR}}` | Nom du thème acheté, lu depuis `src/themes/<slug>/manifest.ts`, un PDF par thème       |

## 2. Où ces placeholders apparaissent

- `marketing/etsy/README.md`
- `marketing/etsy/listings/*.md` et `marketing/etsy/listings/fr/*.md`
- `marketing/etsy/listings/options/*.md`
- `marketing/etsy/messages.md`
- `marketing/launch-plan.md`
- `scripts/build-delivery-pdf.mjs` (variables en tête de fichier, `BRAND_NAME` / `BRAND_URL`, utilisées pour générer le texte des PDF — **pas** de remplacement dans un fichier `.pdf` déjà généré : il faut relancer `pnpm etsy:pdf` après avoir changé les variables du script)

## 3. Remplacer les placeholders une fois la marque verrouillée

Une fois le nom, le domaine et le nom de boutique confirmés (procédure de
vérification : `docs/marque-et-domaines.md` §3 — Cloudflare
Registrar/Namecheap, USPTO TESS, INPI, recherche boutique Etsy), remplacer
partout en une commande, depuis la racine du dépôt :

```bash
# Exemple avec la marque par défaut du kit → une marque réelle,
# à adapter avec les vraies valeurs choisies.
grep -rl '{{BRAND_NAME}}\|{{BRAND_URL}}\|{{SHOP_NAME}}' marketing scripts/build-delivery-pdf.mjs \
  | xargs sed -i \
      -e 's/{{BRAND_NAME}}/Kraft \& Bloom/g' \
      -e 's/{{BRAND_URL}}/kraftandbloom.com/g' \
      -e 's/{{SHOP_NAME}}/KraftAndBloomCo/g'
```

Notes :

- Sur macOS, `sed -i` demande une extension de sauvegarde vide explicite :
  `sed -i '' -e ...`.
- `{{BRAND_URL}}` ne doit **pas** inclure `https://` : les textes l'utilisent
  déjà avec un préfixe explicite (`https://{{BRAND_URL}}/activate`) pour
  rester lisibles à l'écrit comme à l'oral sur les visuels de fiche.
- Après un remplacement, régénérer les PDF de livraison :
  `pnpm etsy:pdf` (ils ne se mettent pas à jour tout seuls, et le script lit
  directement les constantes `BRAND_NAME` / `BRAND_URL` en tête de fichier —
  penser à les éditer aussi, la commande `sed` ci-dessus les couvre déjà
  puisqu'elle inclut `scripts/build-delivery-pdf.mjs`).
- Si un autre nom que la proposition B (Kraft & Bloom) est retenu (par
  exemple _Unfurl_ ou _Petal Post_, voir `docs/marque-et-domaines.md` §4-5),
  adapter aussi le ton de voix des textes : ce kit est rédigé sur le
  registre « chaleureux et artisanal » de la proposition B. Un changement de
  marque vers _Unfurl_ (chic, épurée) ou _Petal Post_ (moderne, joueuse)
  justifierait une relecture éditoriale des descriptions, pas seulement un
  remplacement de nom.
