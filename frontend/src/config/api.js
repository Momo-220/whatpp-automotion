// Configuration de l'API
// En développement, utilise le proxy Vite (/api)
// En production, utilise l'URL du backend depuis les variables d'environnement
const API_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || 'https://votre-backend.render.com/api')  // URL de votre backend Render
  : '/api'  // Utilise le proxy Vite en développement

export default API_URL

