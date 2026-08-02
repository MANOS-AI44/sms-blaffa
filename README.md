# 📨 SMS BLAFFA

Application PWA (installable sur téléphone) pour lire et rechercher tous les
SMS opérateurs d'une organisation BLAFFA : réclamations, annulations avec
notification et badge, filtres dépôt/retrait, code couleur
(🔵 sortant · 🟡 entrant · 🔴 annulation).

Chaque organisation se connecte avec **son token**, généré dans BLAFFA FILE →
menu 💬 SMS → **SMS Center (token)** (`/admin/sms-app`). Accès lecture seule.

## Déployer sur Railway

1. https://railway.app → **New Project** → **Deploy from GitHub repo** → choisis `sms-blaffa`.
2. Railway détecte `package.json` et lance `npm start` tout seul.
3. **Settings → Networking → Generate Domain** → nom de domaine : `sm-blaffa`.

L'application sera en ligne sur https://sm-blaffa.up.railway.app
(aucune variable d'environnement nécessaire).
