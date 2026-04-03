// agent-config.js
module.exports = {
  // Ta "Prompt" principale
  preferences: {
    role: "Étudiant M1 Informatique à Paris",
    goals: ["Développement Web Fullstack", "Data Science", "Cybersécurité"],
    technologies: ["React", "Node.js", "Python", "Docker"],
    
    // La Blacklist (Ce que l'agent doit absolument rejeter)
    blacklist: {
      roles: ["Commercial", "Vendeur", "Boulanger", "Hôte de caisse"],
      technologies: ["COBOL", "Fortran"], // Exemple
      companies: ["McDo", "KFC"], // Exemple
      locations: ["Plus de 2h de trajet"] 
    },

    // Contraintes
    minSalary: 800, // Euros par mois
    contractType: ["Alternance", "Apprentissage"]
  }
};
