import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { QRCodeSVG } from 'qrcode.react'
import './WhatsAppStatus.css'
import API_URL from '../config/api'

function WhatsAppStatus({ status }) {
  const [qrCode, setQrCode] = useState(null)
  const [qrError, setQrError] = useState(null)
  const [isFetching, setIsFetching] = useState(false)
  const intervalRef = useRef(null)
  const hasQRCodeRef = useRef(false)

  const fetchQRCode = useCallback(async () => {
    // Utiliser une ref pour éviter les requêtes multiples
    if (isFetching) return
    
    setIsFetching(true)
    setQrError(null)
    
    try {
      // Construire l'URL complète - s'assurer que /api est inclus
      let qrCodeUrl = `${API_URL}/whatsapp/qrcode`
      
      // Si API_URL ne se termine pas par /api, l'ajouter
      if (!API_URL.endsWith('/api')) {
        qrCodeUrl = API_URL.endsWith('/') 
          ? `${API_URL}api/whatsapp/qrcode`
          : `${API_URL}/api/whatsapp/qrcode`
      }
      
      console.log('🔍 Fetching QR code from:', qrCodeUrl)
      
      const response = await axios.get(qrCodeUrl, {
        timeout: 2000, // Timeout ultra court
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.success && response.data.qrcode) {
        setQrCode(response.data.qrcode)
        setQrError(null)
        hasQRCodeRef.current = true
        // Arrêter le polling si on a le QR code
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      } else {
        setQrCode(null)
        if (response.data.message) {
          setQrError(response.data.message)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du QR code:', error)
      setQrCode(null)
      if (error.response) {
        setQrError(`Erreur serveur: ${error.response.status} - ${error.response.data?.error || error.message}`)
      } else if (error.request) {
        setQrError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.')
      } else {
        setQrError(`Erreur: ${error.message}`)
      }
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    // Nettoyer l'intervalle précédent
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (status && !status.ready && !hasQRCodeRef.current) {
      // Vérifier immédiatement
      fetchQRCode()
      // Vérifier le QR code toutes les 0.8 secondes pour réactivité maximale
      intervalRef.current = setInterval(() => {
        if (!hasQRCodeRef.current && !isFetching) {
          fetchQRCode()
        }
      }, 800)
    } else if (status && status.ready) {
      // Si connecté, nettoyer le QR code
      setQrCode(null)
      setQrError(null)
      hasQRCodeRef.current = false
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [status, fetchQRCode])

  if (!status) {
    return (
      <div className="whatsapp-status">
        <div className="status-loading">⏳ Vérification du statut WhatsApp...</div>
      </div>
    )
  }

  return (
    <div className="whatsapp-status">
      {status.ready ? (
        <div className="status-ready">
          <div className="status-icon">✅</div>
          <div className="status-content">
            <h3>WhatsApp Connecté</h3>
            <p>Vous pouvez maintenant envoyer des messages</p>
          </div>
        </div>
      ) : (
        <div className="status-waiting">
          <div className="status-icon">📱</div>
          <div className="status-content">
            <h3>WhatsApp Non Connecté</h3>
            <p>Scannez le QR code ci-dessous avec votre téléphone WhatsApp</p>
            {qrCode ? (
              <div className="qrcode-container">
                <div className="qrcode-wrapper">
                  <QRCodeSVG 
                    value={qrCode} 
                    size={256}
                    level="H"
                    includeMargin={true}
                    fgColor="#111B21"
                    bgColor="#FFFFFF"
                  />
                </div>
                <p className="qrcode-instructions">
                  <strong>Instructions :</strong>
                  <br />
                  1. Ouvrez WhatsApp sur votre téléphone
                  <br />
                  2. Allez dans <strong>Paramètres</strong> → <strong>Appareils liés</strong>
                  <br />
                  3. Appuyez sur <strong>Lier un appareil</strong>
                  <br />
                  4. Scannez ce QR code
                </p>
              </div>
            ) : qrError ? (
              <div className="qrcode-error">
                <div className="error-icon">⚠️</div>
                <p className="error-message">{qrError}</p>
                <button 
                  onClick={fetchQRCode} 
                  className="retry-button"
                  disabled={isFetching}
                >
                  {isFetching ? '⏳ Vérification...' : '🔄 Réessayer'}
                </button>
                <p className="error-help">
                  💡 Le QR code apparaîtra automatiquement quand le backend sera prêt.
                  <br />
                  Vérifiez les logs du backend sur Render pour voir le QR code dans la console.
                </p>
              </div>
            ) : (
              <div className="qrcode-loading">
                <div className="loading-spinner"></div>
                <p className="waiting-message">Génération du QR code en cours...</p>
                <p className="waiting-help">
                  Le backend génère le QR code. Cela peut prendre quelques secondes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default WhatsAppStatus

