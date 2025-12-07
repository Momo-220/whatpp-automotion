import { useState, useEffect } from 'react'
import './ManualContacts.css'

function ManualContacts({ onContactsAdd }) {
  const [contacts, setContacts] = useState([
    { nom: '', telephone: '' }
  ])
  const [bulkNumbers, setBulkNumbers] = useState('')
  const [parsedCount, setParsedCount] = useState(0)
  const [uniqueCount, setUniqueCount] = useState(0)
  const [duplicateCount, setDuplicateCount] = useState(0)
  const [duplicateNumbers, setDuplicateNumbers] = useState([])
  const [invalidNumbers, setInvalidNumbers] = useState([])
  const [validNumbers, setValidNumbers] = useState([])
  const [showDetails, setShowDetails] = useState(false)

  const addContact = () => {
    setContacts([...contacts, { nom: '', telephone: '' }])
  }

  const removeContact = (index) => {
    if (contacts.length > 1) {
      const newContacts = contacts.filter((_, i) => i !== index)
      setContacts(newContacts)
      updateParentContacts(newContacts)
    }
  }

  const updateContact = (index, field, value) => {
    const newContacts = [...contacts]
    newContacts[index][field] = value
    setContacts(newContacts)
    updateParentContacts(newContacts)
  }

  const updateParentContacts = (contactsList) => {
    // Filtrer les contacts valides (au moins le téléphone est requis)
    // Pour les numéros parsés en masse, le nom peut être vide
    const validContacts = contactsList.filter(
      contact => contact.telephone.trim()
    )
    // Si pas de nom, utiliser le numéro comme nom
    const contactsWithNames = validContacts.map(contact => ({
      nom: contact.nom.trim() || contact.telephone,
      telephone: contact.telephone.trim()
    }))
    onContactsAdd(contactsWithNames)
  }

  const formatPhoneNumber = (value) => {
    // Enlever tous les caractères non numériques sauf le +
    let formatted = value.replace(/[^\d+]/g, '')
    
    // Si commence par 0, remplacer par +33 (France)
    if (formatted.startsWith('0')) {
      formatted = '+33' + formatted.substring(1)
    }
    // Si ne commence pas par +, l'ajouter
    else if (!formatted.startsWith('+')) {
      if (formatted.startsWith('33')) {
        formatted = '+' + formatted
      } else if (formatted.length > 0) {
        formatted = '+33' + formatted
      }
    }
    
    return formatted
  }

  const handlePhoneChange = (index, value) => {
    const formatted = formatPhoneNumber(value)
    updateContact(index, 'telephone', formatted)
  }

  const parseBulkNumbers = (value) => {
    if (!value || !value.trim()) {
      setParsedCount(0)
      setUniqueCount(0)
      setDuplicateCount(0)
      setDuplicateNumbers([])
      setInvalidNumbers([])
      setValidNumbers([])
      // Garder seulement les contacts manuels (ceux qui ne commencent pas par "Contact ")
      const manualContacts = contacts.filter(c => {
        const hasManualName = c.nom.trim() && !c.nom.startsWith('Contact ')
        const isEmpty = !c.nom.trim() && !c.telephone.trim()
        return hasManualName || isEmpty
      })
      if (manualContacts.length === 0) {
        setContacts([{ nom: '', telephone: '' }])
        updateParentContacts([])
      } else {
        setContacts(manualContacts)
        updateParentContacts(manualContacts.filter(c => c.nom.trim() && c.telephone.trim()))
      }
      return
    }

    // Séparer par lignes et nettoyer
    const lines = value.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    // Parser les numéros et séparer valides/invalides
    const parsedNumbers = []
    const invalid = []
    
    lines.forEach((line, index) => {
      const originalLine = line
      
      // Vérifier d'abord si la ligne est vide ou ne contient que des espaces
      if (!line || line.trim().length === 0) {
        return
      }
      
      // Enlever tous les espaces pour le traitement
      let cleaned = line.replace(/\s+/g, '')
      
      // Si après nettoyage il ne reste rien, c'est invalide
      if (cleaned.length === 0) {
        invalid.push({ 
          original: originalLine, 
          cleaned: '',
          reason: 'Ligne vide ou ne contient que des espaces'
        })
        return
      }
      
      // S'assurer qu'il commence par +
      if (!cleaned.startsWith('+')) {
        // Si ne commence pas par +, essayer d'ajouter
        const digitsOnly = cleaned.replace(/[^\d]/g, '')
        if (digitsOnly.length === 0) {
          invalid.push({ 
            original: originalLine, 
            cleaned: cleaned,
            reason: 'Aucun chiffre trouvé'
          })
          return
        }
        cleaned = '+' + digitsOnly
      } else {
        // Déjà avec +, extraire seulement les chiffres après le +
        cleaned = '+' + cleaned.substring(1).replace(/[^\d]/g, '')
      }
      
      // Vérifier si valide (au moins 6 chiffres après le +, max 15)
      const digitsOnly = cleaned.replace('+', '')
      
      if (!cleaned.startsWith('+')) {
        invalid.push({ 
          original: originalLine, 
          cleaned: cleaned,
          reason: 'Format incorrect (doit commencer par +)'
        })
      } else if (digitsOnly.length < 6) {
        invalid.push({ 
          original: originalLine, 
          cleaned: cleaned,
          reason: `Trop court (${digitsOnly.length} chiffres, minimum 6 requis)`
        })
      } else if (digitsOnly.length > 15) {
        invalid.push({ 
          original: originalLine, 
          cleaned: cleaned,
          reason: `Trop long (${digitsOnly.length} chiffres, maximum 15 autorisés)`
        })
      } else if (!/^\+[1-9]\d{5,14}$/.test(cleaned)) {
        invalid.push({ 
          original: originalLine, 
          cleaned: cleaned,
          reason: 'Format invalide (doit commencer par + suivi de 6-15 chiffres)'
        })
      } else {
        // Numéro valide
        parsedNumbers.push(cleaned)
      }
    })
    
    setInvalidNumbers(invalid)

    // Créer des contacts avec ces numéros
    const bulkContacts = parsedNumbers.map((phone, index) => ({
      nom: `Contact ${index + 1}`,
      telephone: phone
    }))

    // Récupérer les contacts manuels existants (ceux ajoutés manuellement)
    const manualContacts = contacts.filter(c => {
      const hasManualName = c.nom.trim() && !c.nom.startsWith('Contact ')
      return hasManualName
    })

    // Combiner les contacts manuels avec les numéros parsés
    const allContacts = [...manualContacts, ...bulkContacts]
    
    // Dédupliquer par numéro de téléphone (garder le premier)
    const contactMap = new Map()
    const duplicates = []
    const duplicateList = []
    
    allContacts.forEach(contact => {
      if (contact.telephone.trim()) {
        if (contactMap.has(contact.telephone)) {
          duplicates.push(contact.telephone)
          duplicateList.push(contact.telephone)
        } else {
          contactMap.set(contact.telephone, contact)
        }
      }
    })
    
    const uniqueContacts = Array.from(contactMap.values())
    const duplicateSet = new Set(duplicates)
    const validNums = uniqueContacts.map(c => c.telephone)
    
    setValidNumbers(validNums)
    setDuplicateNumbers(Array.from(duplicateSet))
    
    // Toujours ajouter un champ vide à la fin pour permettre l'ajout manuel
    const finalContacts = uniqueContacts.length > 0 
      ? [...uniqueContacts, { nom: '', telephone: '' }]
      : [{ nom: '', telephone: '' }]

    setContacts(finalContacts)
    // parsedCount = total des lignes valides parsées (incluant les doublons)
    setParsedCount(parsedNumbers.length)
    setUniqueCount(uniqueContacts.length)
    // Compter les doublons : nombre de fois qu'un numéro apparaît plusieurs fois
    const duplicateCountTotal = parsedNumbers.length - uniqueContacts.length
    setDuplicateCount(duplicateCountTotal > 0 ? duplicateSet.size : 0)
    updateParentContacts(uniqueContacts.filter(c => c.telephone.trim()))
  }

  const handleBulkNumbersChange = (value) => {
    setBulkNumbers(value)
  }

  // Parser automatiquement les numéros en masse avec un délai
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      parseBulkNumbers(bulkNumbers)
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulkNumbers])

  // Compter les contacts valides (exclure le champ vide à la fin)
  const validCount = contacts.filter(
    c => c.telephone.trim() // Seul le téléphone est requis
  ).length

  return (
    <div className="manual-contacts">
      <div className="manual-contacts-header">
        <h2>✏️ Ajouter des contacts manuellement</h2>
        <span className="contacts-count">
          {validCount} contact(s) valide(s)
        </span>
      </div>

      {/* Section pour coller plusieurs numéros */}
      <div className="bulk-input-section">
        <label className="bulk-label">
          📋 Coller une liste de numéros (un par ligne)
        </label>
        <textarea
          className="bulk-textarea"
          placeholder="Collez vos numéros ici, un par ligne :&#10;&#10;+90 5522130448&#10;+90 5010029984&#10;+90 5525850311&#10;..."
          value={bulkNumbers}
          onChange={(e) => handleBulkNumbersChange(e.target.value)}
          rows={8}
        />
        {(parsedCount > 0 || invalidNumbers.length > 0) && (
          <div className="parsed-info">
            <div className="parsed-summary">
              <div>
                📊 {parsedCount + invalidNumbers.length} ligne(s) analysée(s) au total
              </div>
              {uniqueCount > 0 && (
                <div className="valid-summary">
                  ✅ {uniqueCount} contact(s) unique(s) ajouté(s) et prêt(s) à être envoyé(s)
                </div>
              )}
              {duplicateCount > 0 && (
                <div className="duplicate-summary">
                  ⚠️ {duplicateCount} numéro(s) en double détecté(s) (supprimés)
                </div>
              )}
              {invalidNumbers.length > 0 ? (
                <div className="invalid-summary">
                  ❌ {invalidNumbers.length} numéro(s) invalide(s) ou au mauvais format
                </div>
              ) : (
                <div className="valid-summary" style={{ opacity: 0.7 }}>
                  ✓ Tous les numéros sont valides
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="details-toggle-button"
            >
              {showDetails ? '▼ Masquer les détails' : '▶ Afficher les détails'}
            </button>
            
            {showDetails && (
              <div className="parsed-details">
                {validNumbers.length > 0 && (
                  <div className="detail-section valid-section">
                    <h4>✅ Numéros valides ({validNumbers.length})</h4>
                    <div className="numbers-list">
                      {validNumbers.map((num, idx) => (
                        <span key={idx} className="number-badge valid-badge">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {duplicateNumbers.length > 0 && (
                  <div className="detail-section duplicate-section">
                    <h4>⚠️ Numéros en double ({duplicateNumbers.length})</h4>
                    <div className="numbers-list">
                      {duplicateNumbers.map((num, idx) => (
                        <span key={idx} className="number-badge duplicate-badge">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="detail-section invalid-section">
                  <h4>
                    ❌ Numéros invalides ou au mauvais format 
                    {invalidNumbers.length > 0 ? ` (${invalidNumbers.length})` : ' (0)'}
                  </h4>
                  {invalidNumbers.length > 0 ? (
                    <div className="numbers-list">
                      {invalidNumbers.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="number-badge invalid-badge" 
                          title={`Original: "${item.original}"${item.reason ? ` - ${item.reason}` : ''}`}
                        >
                          <div className="invalid-number-original">
                            {item.original || '(vide)'}
                          </div>
                          {item.reason && (
                            <div className="invalid-reason">
                              {item.reason}
                            </div>
                          )}
                          {item.cleaned && item.cleaned !== item.original && (
                            <div className="invalid-cleaned">
                              Tentative de correction: {item.cleaned}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-invalid-message">
                      ✓ Aucun numéro invalide détecté. Tous les numéros sont au bon format.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="divider">
        <span>OU</span>
      </div>

      {/* Section pour ajouter manuellement contact par contact */}
      <div className="manual-input-section">
        <h3 className="section-subtitle">Ajouter contact par contact</h3>
        <div className="contacts-list">
          {contacts.map((contact, index) => (
            <div key={index} className="contact-row">
              <div className="contact-inputs">
                <input
                  type="text"
                  placeholder="Nom"
                  value={contact.nom}
                  onChange={(e) => updateContact(index, 'nom', e.target.value)}
                  className="contact-input"
                />
                <input
                  type="text"
                  placeholder="Téléphone (ex: +33123456789)"
                  value={contact.telephone}
                  onChange={(e) => handlePhoneChange(index, e.target.value)}
                  className="contact-input phone-input"
                />
              </div>
              {contacts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContact(index)}
                  className="remove-button"
                  title="Supprimer ce contact"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addContact}
          className="add-contact-button"
        >
          + Ajouter un contact
        </button>
      </div>

      {validCount > 0 && (
        <div className="valid-contacts-info">
          ✅ {validCount} contact(s) prêt(s) à être utilisé(s)
        </div>
      )}
    </div>
  )
}

export default ManualContacts

