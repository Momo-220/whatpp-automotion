import './MessageEditor.css'

function MessageEditor({ message, onMessageChange, contactsCount }) {
  const handleChange = (e) => {
    onMessageChange(e.target.value)
  }

  return (
    <div className="message-editor">
      <h2>✍️ Écrire votre message</h2>
      <p className="editor-info">
        Ce message sera envoyé à <strong>{contactsCount}</strong> contact(s)
      </p>
      
      <textarea
        className="message-textarea"
        value={message}
        onChange={handleChange}
        placeholder="Écrivez votre message ici...&#10;&#10;Exemple:&#10;Bonjour, nous avons une nouvelle offre spéciale pour vous !"
        rows={8}
      />
      
      <div className="message-stats">
        <span className="char-count">
          {message.length} caractère(s)
        </span>
        {message.length > 0 && (
          <span className="estimated-time">
            ⏱️ Temps estimé: ~{Math.ceil((contactsCount * 0.15) / 60)} minute(s)
          </span>
        )}
      </div>
    </div>
  )
}

export default MessageEditor



