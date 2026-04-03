const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const express = require('express');

(async () => {
  console.log("🚀 Lancement du navigateur et du serveur...");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allOffers = [];
  let currentPage = 1;
  const maxPages = 10;

  try {
    const url = "https://www.hellowork.com/fr-fr/emploi/recherche.html?k=alternance+en+informatique";
    console.log(`🌐 Navigation vers: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // 1. Accepter les cookies
    try {
      const acceptBtn = await page.waitForSelector('#hw-cc-notice-accept-btn', { timeout: 5000 });
      if (acceptBtn) {
        console.log("🍪 Acceptation des cookies...");
        await acceptBtn.click();
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.log("Cookies déjà acceptés ou absents.");
    }

    // Fonction d'extraction
    const extractOffers = async () => {
      return await page.evaluate(() => {
        const results = [];
        const jobCards = document.querySelectorAll('[data-cy="serpCard"]');
        
        jobCards.forEach((card) => {
          try {
            const titleEl = card.querySelector('[data-cy="offerTitle"] p.tw-typo-l, [data-cy="offerTitle"] h3 p');
            const title = titleEl ? titleEl.innerText.trim() : null;
            
            const companyEl = card.querySelector('[data-cy="offerTitle"] p.tw-typo-s.tw-inline');
            const company = companyEl ? companyEl.innerText.trim() : null;
            
            const locationEl = card.querySelector('[data-cy="localisationCard"]');
            const location = locationEl ? locationEl.innerText.trim() : null;
            
            const contractEl = card.querySelector('[data-cy="contractCard"]');
            const contract = contractEl ? contractEl.innerText.trim() : null;
            
            const salaryEl = Array.from(card.querySelectorAll('.tw-tag-secondary-s')).find(el => 
              el.innerText.includes('€')
            );
            const salary = salaryEl ? salaryEl.innerText.trim() : null;
            
            const linkEl = card.querySelector('[data-cy="offerTitle"]');
            const url = linkEl ? linkEl.getAttribute('href') : null;

            if (title) {
              results.push({
                title,
                company: company || 'Non spécifié',
                location: location || 'Non spécifié',
                contract: contract || 'Non spécifié',
                salary: salary || 'Non spécifié',
                url: url ? `https://www.hellowork.com${url}` : null
              });
            }
          } catch (e) {}
        });
        return results;
      });
    };

    while (currentPage <= maxPages) {
      console.log(`\n📄 Traitement de la page ${currentPage}...`);
      await page.waitForSelector('[data-cy="serpCard"]', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);

      const pageOffers = await extractOffers();
      console.log(`✅ ${pageOffers.length} offres extraites.`);
      allOffers.push(...pageOffers);

      const nextBtn = await page.$('button[form="searchForm"]:has(svg use[href*="right"])');
      
      if (nextBtn && !await nextBtn.isDisabled()) {
        console.log("➡️  Clic sur 'Page suivante'...");
        await nextBtn.click();
        await page.waitForLoadState('networkidle');
        currentPage++;
      } else {
        console.log("🏁 Dernière page atteinte.");
        break;
      }
    }

    // Sauvegarde
    if (allOffers.length > 0) {
      const jsonPath = path.join(__dirname, 'offres.json');
      fs.writeFileSync(jsonPath, JSON.stringify(allOffers, null, 2));
      console.log(`\n🎉 Terminé ! ${allOffers.length} offres au total dans 'offres.json'.`);
      
      // Démarrage du serveur Express
      const app = express();
      const port = 3000;
      
      // Servir le dossier courant comme fichiers statiques
      app.use(express.static(__dirname));
      
      const server = app.listen(port, async () => {
        console.log(`📊 Serveur dashboard démarré sur http://localhost:${port}`);
        
        // Ouvrir le dashboard
        const dashboardPage = await context.newPage();
        await dashboardPage.goto(`http://localhost:${port}/dashboard.html`);
      });

    } else {
      console.log("⚠️ Aucune offre extraite.");
    }

  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } 
  // On ne ferme pas le navigateur ici pour laisser le dashboard ouvert
})();
