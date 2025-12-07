import { useState, useEffect } from 'react'
import axios from 'axios'
import { QRCodeSVG } from 'qrcode.react'
import './WhatsAppStatus.css'
import API_URL from '../config/api'

function WhatsAppStatus({ status }) {
  const [qrCode, setQrCode] = useState(null)

  useEffect(() => {
    if (status && !status.ready) {
      // Vérifier immédiatement
      fetchQRCode()
      // Vérifier le QR code toutes les 2 secondes
      const interval = setInterval(fetchQRCode, 2000)
      return () => clearInterval(interval)
    } else if (status && status.ready) {
      // Si connecté, nettoyer le QR code
      setQrCode(null)
    }
  }, [status])

  const fetchQRCode = async () => {
    try {
      const response = await axios.get(`${API_URL}/whatsapp/qrcode`)
      if (response.data.success && response.data.qrcode) {
        setQrCode(response.data.qrcode)
      } else {
        setQrCode(null)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du QR code:', error)
      setQrCode(null)
    }
  }

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
            ) : (
              <div className="qrcode-loading">
                <div className="loading-spinner"></div>
                <p className="waiting-message">Génération du QR code en cours...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default WhatsAppStatus

