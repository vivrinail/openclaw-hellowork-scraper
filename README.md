# 🤖 Agent de Recherche d'Offres d'Alternance

Ce projet est un **agent intelligent** conçu pour scraper les offres d'emploi sur Hellowork. Contrairement à un simple script, cet agent utilise l'Intelligence Artificielle pour comprendre tes besoins, respecter ta "blacklist" et ne te présenter que les offres qui correspondent vraiment à ton profil.

## 🚀 Fonctionnalités

*   **Scraping Automatisé :** Navigation et extraction des données sur Hellowork.
*   **Double Filtrage Agentique :**
    1.  **Règles strictes (Blacklist) :** Rejet immédiat des mots-clés interdits (ex: "Commercial", "Vente").
    2.  **Analyse IA (LLM) :** Compréhension du contexte de l'offre pour vérifier la pertinence avec tes objectifs.
*   **Dashboard Personnalisé :** Visualisation des offres validées dans une interface web locale.
*   **Configuration Simple :** Modifie tes critères sans toucher au code du scraper.

## 🛠️ Installation et Configuration

### 1. Pré-requis
*   Node.js installé sur ta machine.
*   Une clé API gratuite chez [OpenRouter](https://openrouter.ai/) (pour utiliser les modèles d'IA comme Llama 3).

### 2. Installation des dépendances
Ouvre ton terminal dans le dossier du projet et lance :
```bash
npm install
```

### 3. Configuration de l'IA
Crée ou modifie le fichier `agent-core.js` (ou utilise une variable d'environnement) pour y mettre ta clé API OpenRouter :
```javascript
apiKey: "ta_cle_api_ici" 
```
*Note : Tu peux aussi utiliser une variable d'environnement `OPENROUTER_API_KEY` pour plus de sécurité.*

### 4. Configuration de ton Profil
Le cœur de l'agent se trouve dans le fichier **`agent-config.js`**. C'est ici que tu définis ta personnalité de recherche :

*   **Goals :** Les types de postes que tu recherches (ex: "Développement Web").
*   **Technologies :** Tes langages préférés (ex: "React", "Python").
*   **Blacklist :** Les termes ou rôles que tu veux **absolument éviter** (ex: "Boulanger", "Hôte de caisse").

## 🏃‍♂️ Lancement de l'Agent

Une fois configuré, lance la mission avec :
```bash
node scraper.js
```

1.  Une fenêtre de configuration s'ouvre dans ton navigateur.
2.  Entre ta recherche (ex: "alternance informatique").
3.  L'agent commence à travailler : il navigue, analyse chaque offre et te donne son verdict (✅ ou ❌) en temps réel dans le terminal.
4.  À la fin, ton **Dashboard** s'ouvre automatiquement avec la liste des offres validées.

## 📂 Structure du Projet

*   `scraper.js` : Le moteur de navigation et l'orchestrateur.
*   `agent-core.js` : Le "cerveau" qui communique avec l'IA.
*   `agent-config.js` : Tes préférences et ta blacklist.
*   `dashboard.html` : L'interface de visualisation des résultats.
*   `offres.json` : La base de données locale générée par l'agent.

---
*Développé pour innover avec l'IA - M1 PSTB*
