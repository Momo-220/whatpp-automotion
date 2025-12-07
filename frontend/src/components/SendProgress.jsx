import { useEffect, useState } from 'react'
import axios from 'axios'
import './SendProgress.css'
import API_URL from '../config/api'

function SendProgress({ progress: initialProgress }) {
  const [progress, setProgress] = useState(initialProgress)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/send/progress`)
        if (response.data.isSending && response.data.progress) {
          setProgress(response.data.progress)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la progression:', error)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!progress) {
    return (
      <div className="send-progress">
        <div className="progress-loading">⏳ Préparation de l'envoi...</div>
      </div>
    )
  }

  return (
    <div className="send-progress">
      <h3>📤 Envoi en cours...</h3>
      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <div className="progress-info">
        <p>
          <strong>{progress.current}</strong> / <strong>{progress.total}</strong> messages envoyés
        </p>
        <p className="current-contact">
          {progress.status === 'success' && '✅'}
          {progress.status === 'failed' && '❌'}
          {' '}
          {progress.contact} ({progress.telephone})
        </p>
        {progress.error && (
          <p className="progress-error">Erreur: {progress.error}</p>
        )}
      </div>
    </div>
  )
}

export default SendProgress

