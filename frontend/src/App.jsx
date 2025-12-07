import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import './App.css'
import ExcelUpload from './components/ExcelUpload'
import ManualContacts from './components/ManualContacts'
import MessageEditor from './components/MessageEditor'
import WhatsAppStatus from './components/WhatsAppStatus'
import SendProgress from './components/SendProgress'
import API_URL from './config/api'

function App() {
  const [contacts, setContacts] = useState([])
  const [message, setMessage] = useState('')
  const [whatsappStatus, setWhatsappStatus] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const [sendProgress, setSendProgress] = useState(null)
  const [sendResults, setSendResults] = useState(null)
  const [activeTab, setActiveTab] = useState('excel') // 'excel' ou 'manual'

  // Vérifier le statut WhatsApp périodiquement
  const checkWhatsAppStatus = useCallback(async () => {
    try {
      // Construire l'URL - s'assurer que /api est inclus
      let statusUrl = `${API_URL}/whatsapp/status`
      
      // Si API_URL ne se termine pas par /api, l'ajouter
      if (!API_URL.endsWith('/api')) {
        statusUrl = API_URL.endsWith('/') 
          ? `${API_URL}api/whatsapp/status`
          : `${API_URL}/api/whatsapp/status`
      }
      
      console.log('🔍 Vérification du statut WhatsApp:', statusUrl)
      
      const response = await axios.get(statusUrl, {
        timeout: 3000 // Timeout réduit pour plus de réactivité
      })
      setWhatsappStatus(response.data)
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut:', error)
      console.error('📡 URL utilisée:', `${API_URL}/whatsapp/status`)
      if (error.response) {
        console.error('📊 Status:', error.response.status)
        console.error('📄 Data:', error.response.data)
      }
      // En cas d'erreur, définir un statut par défaut
      setWhatsappStatus({
        ready: false,
        authenticated: false,
        hasQRCode: false,
        error: error.message
      })
    }
  }, [])

  useEffect(() => {
    checkWhatsAppStatus()
    const interval = setInterval(checkWhatsAppStatus, 2000) // Vérifier toutes les 2 secondes pour plus de réactivité
    return () => clearInterval(interval)
  }, [checkWhatsAppStatus])

  const handleFileUpload = (uploadedContacts) => {
    setContacts(uploadedContacts)
    setSendResults(null)
  }

  const handleManualContacts = (manualContacts) => {
    setContacts(manualContacts)
    setSendResults(null)
  }

  const handleSend = async () => {
    if (!message.trim()) {
      alert('Veuillez entrer un message')
      return
    }

    if (contacts.length === 0) {
      alert('Veuillez ajouter des contacts (via fichier Excel ou saisie manuelle)')
      return
    }

    if (!whatsappStatus?.ready) {
      alert('WhatsApp n\'est pas connecté. Veuillez attendre la connexion.')
      return
    }

    setIsSending(true)
    setSendProgress(null)
    setSendResults(null)

    try {
      const response = await axios.post(`${API_URL}/send`, {
        contacts: contacts,
        message: message
      })

      setSendResults(response.data.results)
      setIsSending(false)
      setSendProgress(null)
      
      alert(`Envoi terminé !\n✅ Succès: ${response.data.results.success.length}\n❌ Échecs: ${response.data.results.failed.length}`)
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error)
      alert(`Erreur: ${error.response?.data?.error || error.message}`)
      setIsSending(false)
      setSendProgress(null)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📱 WhatsApp Automation</h1>
        <p>Envoyez des messages en masse à vos contacts</p>
      </header>

      <div className="app-content">
        {/* Statut WhatsApp */}
        <WhatsAppStatus status={whatsappStatus} />

        {/* Onglets pour choisir la méthode d'ajout */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'excel' ? 'active' : ''}`}
            onClick={() => setActiveTab('excel')}
          >
            📁 Fichier Excel
          </button>
          <button
            className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            ✏️ Saisie manuelle
          </button>
        </div>

        {/* Upload Excel */}
        {activeTab === 'excel' && (
          <ExcelUpload onUpload={handleFileUpload} />
        )}

        {/* Ajout manuel */}
        {activeTab === 'manual' && (
          <ManualContacts onContactsAdd={handleManualContacts} />
        )}

        {/* Éditeur de message */}
        {contacts.length > 0 && (
          <MessageEditor
            message={message}
            onMessageChange={setMessage}
            contactsCount={contacts.length}
          />
        )}

        {/* Bouton d'envoi */}
        {contacts.length > 0 && message.trim() && (
          <div className="send-section">
            {!whatsappStatus?.ready ? (
              <div className="send-warning">
                ⚠️ Veuillez attendre que WhatsApp soit connecté avant d'envoyer
              </div>
            ) : (
              <button
                className="send-button"
                onClick={handleSend}
                disabled={isSending}
              >
                {isSending ? '⏳ Envoi en cours...' : `📤 Envoyer à ${contacts.length} contact(s)`}
              </button>
            )}
          </div>
        )}

        {/* Progression */}
        {isSending && <SendProgress progress={sendProgress} />}

        {/* Résultats */}
        {sendResults && (
          <div className="results-section">
            <h3>📊 Résultats de l'envoi</h3>
            <div className="results-stats">
              <div className="stat success">
                <span className="stat-label">✅ Succès</span>
                <span className="stat-value">{sendResults.success.length}</span>
              </div>
              <div className="stat failed">
                <span className="stat-label">❌ Échecs</span>
                <span className="stat-value">{sendResults.failed.length}</span>
              </div>
              <div className="stat duration">
                <span className="stat-label">⏱️ Durée</span>
                <span className="stat-value">{sendResults.duration?.toFixed(2)}s</span>
              </div>
            </div>

            {sendResults.failed.length > 0 && (
              <div className="failed-contacts">
                <h4>Contacts en échec :</h4>
                <ul>
                  {sendResults.failed.map((failed, index) => (
                    <li key={index}>
                      {failed.contact} ({failed.telephone}) - {failed.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

