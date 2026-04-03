const OpenAI = require('openai');
const config = require('./agent-config');

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "ta_cle_api_ici",
  defaultHeaders: { "HTTP-Referer": "http://localhost:3000", "X-Title": "Job Agent" },
});

async function agentBrain(offer) {
  // 1. Filtrage "Hard" (Blacklist simple)
  const titleLower = offer.title.toLowerCase();
  for (const banned of config.preferences.blacklist.roles) {
    if (titleLower.includes(banned.toLowerCase())) return false;
  }

  // 2. Filtrage "Intelligent" (IA)
  try {
    const prompt = `
      Tu es un agent de carrière agentique.
      
      PROFIL UTILISATEUR :
      - Rôle : ${config.preferences.role}
      - Objectifs : ${config.preferences.goals.join(", ")}
      - Tech aimées : ${config.preferences.technologies.join(", ")}
      
      BLACKLIST (À REJETER ABSOLUMENT) :
      - Rôles : ${config.preferences.blacklist.roles.join(", ")}
      
      OFFRE À ANALYSER :
      - Titre : "${offer.title}"
      - Entreprise : "${offer.company}"
      
      Cette offre correspond-elle au profil et ne fait-elle PAS partie de la blacklist ?
      Réponds UNIQUEMENT par "OUI" ou "NON".
    `;

    const res = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct:free",
      messages: [{ role: "user", content: prompt }]
    });

    return res.choices[0].message.content.toUpperCase().includes("OUI");
  } catch (e) {
    console.log("⚠️ Erreur IA, on accepte par sécurité.");
    return true;
  }
}

module.exports = { agentBrain };
