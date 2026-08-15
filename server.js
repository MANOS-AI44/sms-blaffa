// SMS Center — petit serveur statique (Railway).
// Sert l'application PWA (page + manifeste + service worker + icônes).
// L'application parle directement à l'API BLAFFA FILE (/api/public/sms-app)
// avec le token de l'organisation.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUB = path.join(__dirname, "public");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/manifest+json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src https://blaffa-file.onrender.com; manifest-src 'self'; worker-src 'self'",
};

const server = http.createServer((req, res) => {
  const urlPath = (req.url || "/").split("?")[0];
  if (urlPath === "/health") {
    res.writeHead(200, { ...SECURITY_HEADERS, "Cache-Control": "no-store", "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, app: "sms-center" }));
    return;
  }
  // La racine REDIRIGE vers /sms-center.html : le manifeste PWA a pour scope
  // /sms-center, la page doit donc etre DANS ce scope pour que le navigateur
  // propose l'installation. (Un seul index.html identique a la copie BLAFFA.)
  if (urlPath === "/" || urlPath === "/index.html") {
    res.writeHead(302, { ...SECURITY_HEADERS, "Cache-Control": "no-store", Location: "/sms-center.html" });
    res.end();
    return;
  }
  let file;
  if (urlPath === "/sms-center.html" || urlPath === "/sms-center") {
    file = path.join(PUB, "index.html");
  } else {
    // Fichiers statiques (manifeste, SW, icônes) — pas de traversée de chemin.
    const clean = path.normalize(urlPath).replace(/^([.][.][\/\\])+/, "");
    file = path.join(PUB, clean);
    if (!file.startsWith(PUB)) { res.writeHead(403); res.end(); return; }
  }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { ...SECURITY_HEADERS, "Cache-Control": "no-store", "Content-Type": "text/plain" }); res.end("introuvable"); return; }
    const ext = path.extname(file).toLowerCase();
    const cache = ext === ".png" ? "public, max-age=86400" : "no-store, max-age=0";
    res.writeHead(200, { ...SECURITY_HEADERS, "Cache-Control": cache, "Content-Type": TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => console.log("SMS Center en ligne sur le port " + PORT));
