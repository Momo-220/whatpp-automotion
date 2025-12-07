// Configuration de l'API
// En développement, utilise le proxy Vite (/api)
// En production, utilise l'URL du backend depuis les variables d'environnement

let API_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || 'https://whatpp-automotion.onrender.com/api')
  : '/api'

// S'assurer que l'URL se termine par /api en production
if (import.meta.env.PROD) {
  // Si VITE_API_URL ne contient pas /api, l'ajouter
  if (API_URL && !API_URL.endsWith('/api')) {
    // Si l'URL se termine par /, ajouter api, sinon ajouter /api
    API_URL = API_URL.endsWith('/') ? `${API_URL}api` : `${API_URL}/api`
  }
}

// Log pour débogage
if (import.meta.env.PROD) {
  console.log('🌐 API URL configurée:', API_URL)
  console.log('🔧 VITE_API_URL (raw):', import.meta.env.VITE_API_URL)
}

export default API_URL

