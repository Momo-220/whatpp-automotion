// Configuration de l'API
// En développement, utilise le proxy Vite (/api)
// En production, utilise l'URL du backend depuis les variables d'environnement

const API_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || 'https://whatpp-automotion.onrender.com/api')
  : '/api'

// Log pour débogage en production
if (import.meta.env.PROD) {
  console.log('🌐 Mode:', import.meta.env.MODE)
  console.log('🌐 API URL:', API_URL)
}

export default API_URL

