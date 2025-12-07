import { useState } from 'react'
import axios from 'axios'
import './ExcelUpload.css'
import API_URL from '../config/api'

function ExcelUpload({ onUpload }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [contacts, setContacts] = useState([])

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Vérifier le type de fichier
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV')
      return
    }

    setIsUploading(true)
    setUploadStatus(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const validContacts = response.data.contacts.valid
      setContacts(validContacts)
      setUploadStatus({
        success: true,
        total: response.data.contacts.total,
        valid: response.data.contacts.validCount,
        invalid: response.data.contacts.invalidCount
      })

      // Notifier le parent
      onUpload(validContacts)

      if (response.data.contacts.invalidCount > 0) {
        alert(
          `Fichier traité avec succès !\n` +
          `✅ ${response.data.contacts.validCount} contact(s) valide(s)\n` +
          `⚠️ ${response.data.contacts.invalidCount} contact(s) invalide(s)`
        )
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      setUploadStatus({
        success: false,
        error: error.response?.data?.error || error.message
      })
      alert(`Erreur: ${error.response?.data?.error || error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const downloadExample = async () => {
    try {
      const response = await axios.get(`${API_URL}/upload/download-example`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'exemple-contacts.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      alert('Erreur lors du téléchargement du fichier exemple')
    }
  }

  return (
    <div className="excel-upload">
      <h2>📁 Upload du fichier Excel</h2>
      
      <div className="upload-area">
        <input
          type="file"
          id="file-input"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          disabled={isUploading}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-input" className="upload-button">
          {isUploading ? '⏳ Upload en cours...' : '📤 Choisir un fichier Excel'}
        </label>
        
        <button
          className="example-button"
          onClick={downloadExample}
          disabled={isUploading}
        >
          📥 Télécharger un exemple
        </button>
      </div>

      {uploadStatus && uploadStatus.success && (
        <div className="upload-success">
          <p>✅ Fichier uploadé avec succès !</p>
          <p>
            <strong>{uploadStatus.valid}</strong> contact(s) valide(s) sur {uploadStatus.total}
          </p>
          {uploadStatus.invalid > 0 && (
            <p className="warning">
              ⚠️ {uploadStatus.invalid} contact(s) invalide(s) ignoré(s)
            </p>
          )}
        </div>
      )}

      {contacts.length > 0 && (
        <div className="contacts-preview">
          <h3>📋 Contacts chargés ({contacts.length})</h3>
          <div className="contacts-list">
            {contacts.slice(0, 5).map((contact, index) => (
              <div key={index} className="contact-item">
                <span className="contact-name">{contact.nom}</span>
                <span className="contact-phone">{contact.telephone}</span>
              </div>
            ))}
            {contacts.length > 5 && (
              <p className="more-contacts">... et {contacts.length - 5} autre(s) contact(s)</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExcelUpload

