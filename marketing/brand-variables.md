# Variables de marque — kit Etsy

Ce kit marketing (dossier `marketing/`) est écrit avec des **placeholders** au
lieu du nom de marque en dur dans chaque fiche, pour rester facile à
rebrander. La marque et le domaine sont désormais verrouillés (voir la
décision en tête de `docs/marque-et-domaines.md`) : **Unfurl** /
`unfurlme.love`. Seul le nom exact de la boutique Etsy reste à réserver.

## 1. Les trois placeholders

| Placeholder      | Rôle                                                                    | Valeur par défaut utilisée dans ce kit   | Où elle vient                                                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{BRAND_NAME}}` | Nom de la marque, tel qu'affiché dans les textes (logo, signature, PDF) | `Unfurl`                                 | Décision de marque, `docs/marque-et-domaines.md`, section « Décision (septembre 2026) »                                                                                    |
| `{{BRAND_URL}}`  | Domaine racine de l'application, sans `https://` ni slash final         | `unfurlme.love`                          | Décision de marque, `docs/marque-et-domaines.md`, section « Décision (septembre 2026) »                                                                                    |
| `{{SHOP_NAME}}`  | Nom exact de la boutique Etsy (identifiant `etsy.com/shop/...`)         | `Unfurl` si disponible, sinon `UnfurlMe` | Pas encore réservé — vérifier `etsy.com/shop/Unfurl` puis `etsy.com/shop/UnfurlMe` avant choix définitif (voir `docs/marque-et-domaines.md`, section 3, pour la procédure) |

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

## 3. Remplacer les placeholders

`{{BRAND_NAME}}` et `{{BRAND_URL}}` sont désormais figés (Unfurl /
`unfurlme.love`). Il ne reste que `{{SHOP_NAME}}` à verrouiller (procédure de
vérification de la boutique Etsy : `docs/marque-et-domaines.md` §3), puis à
remplacer partout en une commande, depuis la racine du dépôt :

```bash
# {{SHOP_NAME}} à remplacer par le nom de boutique réellement réservé
# (Unfurl si disponible, sinon UnfurlMe).
grep -rl '{{BRAND_NAME}}\|{{BRAND_URL}}\|{{SHOP_NAME}}' marketing scripts/build-delivery-pdf.mjs \
  | xargs sed -i \
      -e 's/{{BRAND_NAME}}/Unfurl/g' \
      -e 's/{{BRAND_URL}}/unfurlme.love/g' \
      -e 's/{{SHOP_NAME}}/Unfurl/g'
```

Notes :

- Sur macOS, `sed -i` demande une extension de sauvegarde vide explicite :
  `sed -i '' -e ...`.
- `{{BRAND_URL}}` ne doit **pas** inclure `https://` : les textes l'utilisent
  déjà avec un préfixe explicite (`https://{{BRAND_URL}}/activate`) pour
  rester lisibles à l'écrit comme à l'oral sur les visuels de fiche.
- Après un remplacement, régénérer les PDF de livraison :
  `pnpm etsy:pdf` (ils ne se mettent pas à jour tout seuls, et le script lit
  directement les constantes `BRAND_NAME` / `BRAND_URL` en tête de fichier,
  déjà à jour sur Unfurl / unfurlme.love).
