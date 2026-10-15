/* ═══════════════════════════════════════════════════════════════════════════
   SMS BLAFFA — service worker (application installable, utilisable hors ligne)

   Gérard, 15/10/2026 :
     « Je veux une vraie application. […] Dès que les messages sont venus, ils
       sont là, même si on a désactivé la connexion, on peut faire des
       recherches. »

   ── CE QUI EMPÊCHAIT LE HORS-LIGNE ────────────────────────────────────────
   Tout était en place : manifeste, icônes, service worker, et depuis
   aujourd'hui le miroir local des messages. Mais le cache `sms-center-v7` est
   resté VIDE, et le service worker ne restait pas installé. La cause est une
   seule ligne de la version précédente :

       caches.open(CACHE).then((c) => c.addAll(SHELL))

   `addAll` est TOUT OU RIEN. Si un seul des quatre fichiers ne répond pas —
   une icône lente, un 404 passager, Railway qui se réveille — la promesse est
   rejetée, l'installation ÉCHOUE EN ENTIER, et le service worker n'est jamais
   activé. Résultat : aucun fichier en cache, et l'application ne peut pas
   s'ouvrir sans réseau. Un seul grain de sable annulait toute la mise en
   cache, en silence.

   Ici chaque fichier est mis en cache SÉPARÉMENT. Si l'un manque, les autres
   entrent quand même et l'application s'ouvre hors ligne. On garde ce qu'on
   peut au lieu de tout perdre pour un.

   ── CE QUI NE CHANGE PAS, ET POURQUOI ─────────────────────────────────────
   RÉSEAU D'ABORD pour la page. Le 19/09, un service worker à cache avait servi
   une version périmée et provoqué un ERR_FAILED. On ne refait pas cette
   erreur : le cache n'est qu'un FILET, il ne répond que si le réseau n'a rien
   donné. Une version périmée ne peut jamais prendre la place d'une fraîche.

   LES DONNÉES NE PASSENT JAMAIS PAR ICI. Les appels à l'API BLAFFA ne sont ni
   interceptés ni enregistrés. Les messages sont conservés par le miroir de
   l'application (IndexedDB), qui sait DIRE quand une réponse vient de la
   mémoire du téléphone. Un cache de réponses financières, lui, ne saurait pas
   le dire — et une preuve de paiement périmée qui se fait passer pour fraîche,
   c'est exactement ce qu'on ne veut pas.
   ═══════════════════════════════════════════════════════════════════════════ */

const CACHE = "sms-center-v8";
const SHELL = [
  "/sms-center.html",
  "/sms-center-manifest.json",
  "/sms-center-192.png",
  "/sms-center-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(
        // Un `add` par fichier, chacun protégé : l'absence de l'un ne fait plus
        // échouer l'installation des autres.
        SHELL.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => null))
      ))
      .catch(() => null)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .catch(() => null)
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  let url;
  try { url = new URL(e.request.url); } catch (err) { return; }
  // L'API BLAFFA et tout ce qui n'est pas de ce site passent au réseau, intacts.
  if (url.origin !== self.location.origin) return;

  // ── LA PAGE ─────────────────────────────────────────────────────────────
  // Toute navigation est servie par le réseau d'abord ; hors ligne, on rend la
  // dernière version mise en cache. `e.request.mode === "navigate"` couvre
  // aussi l'ouverture depuis l'écran d'accueil et les adresses avec « ? ».
  if (e.request.mode === "navigate" || url.pathname === "/sms-center.html") {
    e.respondWith(
      fetch(e.request, { cache: "no-store" })
        .then((r) => {
          const copie = r.clone();
          caches.open(CACHE).then((c) => c.put("/sms-center.html", copie)).catch(() => {});
          return r;
        })
        .catch(() => caches.match("/sms-center.html").then((hit) => hit || new Response(
          "<!doctype html><meta charset=utf-8><body style=\"font-family:system-ui;padding:24px;line-height:1.6\">"
          + "<b>SMS BLAFFA</b><br>L'application n'a pas encore ete ouverte une fois avec du reseau : "
          + "elle n'a donc rien a afficher hors connexion.</body>",
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        )))
    );
    return;
  }

  // ── ICÔNES ET MANIFESTE ─────────────────────────────────────────────────
  if (SHELL.includes(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => {
        const copie = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie)).catch(() => {});
        return r;
      }).catch(() => hit))
    );
  }
});
