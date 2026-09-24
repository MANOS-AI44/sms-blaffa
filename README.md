# 📨 SMS BLAFFA v6

Application indépendante pour consulter les captures envoyées par l'APK
**BLAFFA FILE SMS**. Les modèles financiers reconnus restent dans
**Tous / Dépôt / Retrait / Annulations** ; les SMS et notifications hors
modèles sont rangés exclusivement dans **Autres SMS**, sans mélange de statut.

Chaque organisation se connecte avec **son token**, généré dans BLAFFA FILE sur
la page **`/admin/sms-app`**. Le token donne un accès **lecture seule** aux SMS
de cette organisation uniquement.

## Déployer sur Railway

1. https://railway.app → **New Project** → **Deploy from GitHub repo** → choisis `MANOS-AI44/sms-blaffa`.
2. Railway détecte `package.json` et lance `npm start` tout seul.
3. **Settings → Networking → Generate Domain** → nom de domaine : `sm-blaffa`.

L'application sera en ligne sur https://sm-blaffa.up.railway.app
(aucune variable d'environnement nécessaire).

## API utilisée

`GET https://blaffa-file.onrender.com/api/public/sms-app`

- Authentification : `Authorization: Bearer <token>` (jamais dans l'URL).
- Paramètres : `q`, `filtre = tous | depot | retrait | annulations | autres`,
  `limit` (maximum 200) et `avant` (pagination ISO).
- `tous`, `depot`, `retrait` et `annulations` restent financiers uniquement.
- `autres` contient exclusivement les captures non financières/non reconnues.
