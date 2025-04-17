// serverHTTP.js

// 1. Importer le module HTTP
const http = require('http');

// 2. Créer le serveur web
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Bonjour, bienvenue sur mon serveur Node.js!</h1>');
});

// 3. Démarrer le serveur sur le port 3000
const port = 3000;
server.listen(port, () => {
    console.log(`Le serveur écoute sur le port ${port}`);
});

