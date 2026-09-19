/* SMS BLAFFA — Service Worker (passe-plat réseau)
   Ne met RIEN en cache et n'intercepte AUCUNE requête : tout passe
   directement au réseau. Sert uniquement à rendre l'app installable (PWA)
   et à purger les anciens caches d'une version précédente.
   -> garantit que l'application est toujours à jour, jamais bloquée par un
      cache périmé. */

self.addEventListener("install", function(e){
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil((async function(){
    try{
      var keys = await caches.keys();
      await Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }catch(_){}
    await self.clients.claim();
  })());
});

/* Écouteur fetch présent (pour l'installabilité PWA) mais volontairement
   passif : on n'appelle jamais respondWith, donc le navigateur fait la
   requête réseau normale. */
self.addEventListener("fetch", function(e){
  /* passe-plat : aucune interception */
});
