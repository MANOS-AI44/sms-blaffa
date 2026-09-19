/* SMS BLAFFA — Service Worker
   Stratégie « réseau d'abord » : l'application est toujours à jour dès qu'elle
   est déployée. Le cache ne sert que de secours hors-ligne pour la coquille et
   les icônes. Les appels d'API ne sont JAMAIS mis en cache. */

var CACHE = "smsblaffa-v3";
var SHELL = ["/", "/sms-center.html", "/index.html",
             "/sms-center-192.png", "/sms-center-512.png", "/sms-center-manifest.json"];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      // best-effort: ne bloque pas l'installation si un fichier manque
      return Promise.all(SHELL.map(function(u){
        return c.add(u).catch(function(){});
      }));
    })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;

  var url;
  try { url = new URL(req.url); } catch(_){ return; }

  // Ne jamais intercepter les appels d'API (autre origine / chemin /api/)
  if(url.origin !== self.location.origin || url.pathname.indexOf("/api/") === 0){
    return; // laisse passer directement au réseau
  }

  var isDoc = req.mode === "navigate" ||
              url.pathname === "/" ||
              url.pathname.endsWith(".html");

  if(isDoc){
    // réseau d'abord, cache en secours
    e.respondWith(
      fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copy); });
        return res;
      }).catch(function(){
        return caches.match(req).then(function(m){ return m || caches.match("/index.html"); });
      })
    );
    return;
  }

  // autres statiques (icônes, manifest) : cache d'abord, réseau en secours
  e.respondWith(
    caches.match(req).then(function(m){
      return m || fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copy); });
        return res;
      });
    })
  );
});
