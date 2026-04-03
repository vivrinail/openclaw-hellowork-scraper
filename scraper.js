const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log("🚀 Lancement du navigateur...");
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

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
        // Utilisation de [data-cy="serpCard"] comme conteneur stable
        const jobCards = document.querySelectorAll('[data-cy="serpCard"]');
        
        jobCards.forEach((card) => {
          try {
            // Titre : dans le lien avec data-cy="offerTitle"
            const titleEl = card.querySelector('[data-cy="offerTitle"] p.tw-typo-l, [data-cy="offerTitle"] h3 p');
            const title = titleEl ? titleEl.innerText.trim() : null;
            
            // Entreprise : p.tw-typo-s.tw-inline
            const companyEl = card.querySelector('[data-cy="offerTitle"] p.tw-typo-s.tw-inline');
            const company = companyEl ? companyEl.innerText.trim() : null;
            
            // Localisation
            const locationEl = card.querySelector('[data-cy="localisationCard"]');
            const location = locationEl ? locationEl.innerText.trim() : null;
            
            // Contrat
            const contractEl = card.querySelector('[data-cy="contractCard"]');
            const contract = contractEl ? contractEl.innerText.trim() : null;
            
            // Salaire (le div qui contient '€')
            const salaryEl = Array.from(card.querySelectorAll('.tw-tag-secondary-s')).find(el => 
              el.innerText.includes('€')
            );
            const salary = salaryEl ? salaryEl.innerText.trim() : null;
            
            // Lien
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
          } catch (e) {
            // Erreur individuelle silencieuse
          }
        });
        return results;
      });
    };

    while (currentPage <= maxPages) {
      console.log(`\n📄 Traitement de la page ${currentPage}...`);
      
      // Attente du chargement des offres
      await page.waitForSelector('[data-cy="serpCard"]', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);

      // Extraction
      const pageOffers = await extractOffers();
      console.log(`✅ ${pageOffers.length} offres extraites.`);
      allOffers.push(...pageOffers);

      // Navigation page suivante
      // Le bouton "Suivant" est un <button> avec une flèche droite (href="/svg/icons/arrow.svg#right")
      // Il contient value="page_suivante" ou simplement l'icone right
      const nextBtn = await page.$('button[form="searchForm"]:has(svg use[href*="right"])');
      
      if (nextBtn && !await nextBtn.isDisabled()) {
        console.log("➡️  Clic sur 'Page suivante'...");
        await nextBtn.click();
        await page.waitForLoadState('networkidle');
        currentPage++;
      } else {
        console.log("🏁 Dernière page atteinte ou bouton suivant désactivé.");
        break;
      }
    }

    // Sauvegarde
    if (allOffers.length > 0) {
      fs.writeFileSync('offres.json', JSON.stringify(allOffers, null, 2));
      console.log(`\n🎉 Terminé ! ${allOffers.length} offres au total dans 'offres.json'.`);
    } else {
      console.log("⚠️ Aucune offre extraite.");
    }

  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await browser.close();
    console.log("🔒 Navigateur fermé.");
  }
})();
