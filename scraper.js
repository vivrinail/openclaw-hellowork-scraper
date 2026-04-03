const { chromium } = require('playwright');
const fs = require('fs');
const express = require('express');
const { agentBrain } = require('./agent-core');

(async () => {
  console.log("🤖 Agent de Recherche Agentique v2.0 (avec Blacklist)");
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  
  // Interface de config en popup
  const server = express();
  server.use(express.static(__dirname));
  server.get('/config', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="fr"><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script></head>
      <body class="bg-gray-100 flex justify-center items-center h-screen">
        <div class="bg-white p-8 rounded-xl shadow-xl">
          <h1 class="text-2xl font-bold mb-4">⚙️ Config Agent</h1>
          <input id="q" class="border p-2 w-full mb-2" placeholder="Recherche (ex: alternance dev)">
          <button onclick="start()" class="bg-blue-600 text-white px-4 py-2 rounded w-full">Lancer la mission</button>
        </div>
        <script>
          async function start() {
            const q = document.getElementById('q').value;
            await fetch('/run?q=' + q);
            document.body.innerHTML = '<h1 class="text-center mt-10 text-green-600">Mission en cours...</h1>';
          }
        </script>
      </body></html>
    `);
  });

  // L'Agent en action
  server.get('/run', async (req, res) => {
    res.send("Mission en cours...");
    const query = req.query.q;
    const url = `https://www.hellowork.com/fr-fr/emploi/recherche.html?k=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    try { await page.click('#hw-cc-notice-accept-btn'); } catch(e){}

    const validatedOffers = [];
    let p = 1;

    while (p <= 10) {
      console.log(`\n📄 Page ${p} - Analyse agentique...`);
      await page.waitForTimeout(2000);

      const rawOffers = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[data-cy="serpCard"]')).map(c => ({
          title: c.querySelector('[data-cy="offerTitle"] p')?.innerText,
          company: c.querySelector('[data-cy="offerTitle"] p.tw-typo-s')?.innerText,
          location: c.querySelector('[data-cy="localisationCard"]')?.innerText,
          url: c.querySelector('[data-cy="offerTitle"]')?.href
        })).filter(o => o.title);
      });

      // 🧠 L'AGENT UTILISE SON CERVEAU (ET TA BLACKLIST)
      for (const offer of rawOffers) {
        const isGood = await agentBrain(offer);
        if (isGood) {
          console.log(`✅ [VALIDÉ] ${offer.title}`);
          validatedOffers.push({ ...offer, source: 'Hellowork' });
        } else {
          console.log(`❌ [REJETÉ] ${offer.title} (Blacklist/IA)`);
        }
      }

      const next = await page.$('button[form="searchForm"]:has(svg use[href*="right"])');
      if (next && !await next.isDisabled()) { await next.click(); await page.waitForLoadState('networkidle'); p++; }
      else break;
    }

    // Résultat
    fs.writeFileSync('offres.json', JSON.stringify(validatedOffers, null, 2));
    console.log(`\n🎉 Mission accomplie ! ${validatedOffers.length} offres de qualité.`);
    
    const app = express();
    app.use(express.static(__dirname));
    app.listen(3000, async () => {
      const dash = await context.newPage();
      await dash.goto('http://localhost:3000/dashboard.html');
    });
  });

  server.listen(3001, () => page.goto('http://localhost:3001/config'));
})();
