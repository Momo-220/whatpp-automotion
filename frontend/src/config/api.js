// Configuration de l'API
// En développement, utilise le proxy Vite (/api)
// En production, utilise l'URL du backend depuis les variables d'environnement
const API_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || 'https://whatpp-automotion.onrender.com/api')  // URL de votre backend Render
  : '/api'  // Utilise le proxy Vite en développement

// Log pour débogage
if (import.meta.env.PROD) {
  console.log('🌐 API URL configurée:', API_URL)
  console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL)
}

export default API_URL

