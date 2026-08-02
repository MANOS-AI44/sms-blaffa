// SMS BLAFFA — serveur statique (Railway).
// Structure PLATE (tous les fichiers a la racine du depot) : l'upload web
// GitHub ne conserve pas les dossiers. index.html est la PWA complete.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const RACINE = __dirname;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/manifest+json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".md": "text/plain; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const urlPath = (req.url || "/").split("?")[0];
  if (urlPath === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, app: "sms-blaffa" }));
    return;
  }
  // La racine REDIRIGE vers /sms-center.html : le manifeste PWA a pour scope
  // /sms-center, la page doit etre DANS ce scope pour l'installation.
  if (urlPath === "/" || urlPath === "/index.html") {
    res.writeHead(302, { Location: "/sms-center.html" });
    res.end();
    return;
  }
  let file;
  if (urlPath === "/sms-center.html" || urlPath === "/sms-center") {
    file = path.join(RACINE, "index.html");
  } else {
    const clean = path.normalize(urlPath).replace(/^([.][.][\/\\])+/, "");
    file = path.join(RACINE, clean);
    if (!file.startsWith(RACINE)) { res.writeHead(403); res.end(); return; }
  }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain" }); res.end("introuvable"); return; }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => console.log("SMS BLAFFA en ligne sur le port " + PORT));
