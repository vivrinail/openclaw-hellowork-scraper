const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const express = require('express');

(async () => {
  console.log("🚀 Lancement de l'application en plein écran...");
  
  // Lancement du navigateur
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized'] // Démarrage en plein écran/natif
  });
  
  const context = await browser.newContext({ viewport: null }); // Viewport nul pour utiliser toute la fenêtre
  
  // 1. Ouverture de la "Popup" de recherche
  console.log("📝 Ouverture de la fenêtre de recherche...");
  const popupPage = await context.newPage();
  
  // Serveur pour la popup
  const server = express();
  const popupPort = 3001;
  
  server.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Recherche Hellowork</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="bg-white p-10 rounded-xl shadow-2xl w-full max-w-lg text-center">
          <h1 class="text-3xl font-bold mb-6 text-blue-600">🚀 Hellowork Scraper</h1>
          <label class="block text-gray-700 text-lg font-bold mb-2">Quelle recherche effectuer ?</label>
          <input type="text" id="term" class="w-full border-2 border-gray-300 p-3 rounded-lg mb-6 text-lg focus:outline-none focus:border-blue-500 transition" placeholder="ex: alternance informatique">
          <button onclick="go()" class="w-full bg-blue-600 text-white font-bold p-4 rounded-lg hover:bg-blue-700 transition transform hover:scale-105 shadow-lg">
            Lancer le scraping
          </button>
        </div>
        <script>
          async function go() {
            const t = document.getElementById('term').value;
            if(t) await fetch('/run?q=' + encodeURIComponent(t));
          }
          document.getElementById('term').addEventListener('keypress', e => { if(e.key==='Enter') go(); });
        </script>
      </body>
      </html>
    `);
  });

  const startScraper = (query) => {
    return new Promise(async (resolve) => {
      console.log(`\n🔍 Recherche lancée : ${query}`);
      await popupPage.close(); // On ferme la popup
      
      const url = `https://www.hellowork.com/fr-fr/emploi/recherche.html?k=${encodeURIComponent(query)}`;
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });

      // Accepter les cookies
      try {
        const btn = await page.waitForSelector('#hw-cc-notice-accept-btn', { timeout: 5000 });
        if (btn) { await btn.click(); await page.waitForTimeout(1000); }
      } catch (e) {}

      const allOffers = [];
      let p = 1;
      
      while (p <= 10) {
        console.log(`📄 Traitement de la page ${p}...`);
        await page.waitForTimeout(2000);
        
        const offers = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('[data-cy="serpCard"]')).map(card => {
            const t = card.querySelector('[data-cy="offerTitle"] p')?.innerText;
            const c = card.querySelector('[data-cy="offerTitle"] p.tw-typo-s')?.innerText;
            const l = card.querySelector('[data-cy="localisationCard"]')?.innerText;
            const co = card.querySelector('[data-cy="contractCard"]')?.innerText;
            const s = Array.from(card.querySelectorAll('.tw-tag-secondary-s')).find(el => el.innerText.includes('€'))?.innerText;
            const u = card.querySelector('[data-cy="offerTitle"]')?.href;
            return t ? { title: t, company: c, location: l, contract: co, salary: s, url: u } : null;
          }).filter(Boolean);
        });
        
        allOffers.push(...offers);
        
        const next = await page.$('button[form="searchForm"]:has(svg use[href*="right"])');
        if (next && !await next.isDisabled()) {
          await next.click();
          await page.waitForLoadState('networkidle');
          p++;
        } else { break; }
      }

      if (allOffers.length > 0) {
        fs.writeFileSync('offres.json', JSON.stringify(allOffers, null, 2));
        console.log(`\n✅ ${allOffers.length} offres trouvées et sauvegardées !`);
        
        // Lancement du dashboard dans le même contexte
        const dashApp = express();
        dashApp.use(express.static(__dirname));
        const dashPort = 3000;
        dashApp.listen(dashPort, async () => {
          const dashPage = await context.newPage();
          await dashPage.goto(`http://localhost:${dashPort}/dashboard.html`);
        });
      }
      resolve();
    });
  };

  server.get('/run', async (req, res) => {
    res.send('<h1 style="text-align:center; color:green; margin-top:20%;">Scrapping en cours... Tu peux regarder la fenêtre du navigateur !</h1>');
    await startScraper(req.query.q);
  });

  server.listen(popupPort, () => {
    popupPage.goto(`http://localhost:${popupPort}`);
  });

})();
