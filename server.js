const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(__dirname));

// Route pour servir le fichier JSON
app.get('/offres.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'offres.json'));
});

app.listen(port, () => {
    console.log(`Dashboard accessible à l'adresse: http://localhost:${port}/dashboard.html`);
});
