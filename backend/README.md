# Backend - WhatsApp Automation

Backend pour l'automatisation d'envoi de messages WhatsApp en masse.

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration

Copier le fichier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

### 3. Démarrer le serveur

```bash
npm start
```

Ou en mode développement (avec auto-reload) :

```bash
npm run dev
```

## 📋 Structure du projet

```
backend/
├── services/
│   ├── whatsappService.js    # Service WhatsApp
│   ├── excelParser.js        # Parser Excel
│   └── messageSender.js      # Gestionnaire d'envoi
├── routes/
│   ├── upload.js             # Routes pour upload Excel
│   ├── whatsapp.js           # Routes WhatsApp
│   └── send.js               # Routes d'envoi
├── server.js                 # Serveur principal
├── env.example               # Exemple de configuration
└── package.json
```

## 🔌 API Endpoints

### Santé
- `GET /api/health` - Vérifier l'état du serveur

### Upload
- `POST /api/upload` - Uploader un fichier Excel
- `GET /api/upload/example` - Générer un fichier exemple
- `GET /api/upload/download-example` - Télécharger le fichier exemple

### WhatsApp
- `GET /api/whatsapp/status` - Statut de la connexion WhatsApp
- `GET /api/whatsapp/qrcode` - Obtenir le QR code
- `GET /api/whatsapp/info` - Informations du client WhatsApp
- `POST /api/whatsapp/disconnect` - Déconnecter WhatsApp

### Envoi
- `POST /api/send` - Envoyer des messages en masse
- `POST /api/send/test` - Tester l'envoi à un contact
- `GET /api/send/progress` - Progression de l'envoi

## 📝 Format du fichier Excel

Le fichier Excel doit contenir au minimum :

| Nom      | Téléphone    |
|----------|--------------|
| Jean     | +33123456789 |
| Marie    | +33987654321 |

**Colonnes acceptées :**
- `Nom` / `nom` / `Name` / `name`
- `Téléphone` / `telephone` / `Phone` / `phone`
- `Email` / `email` (optionnel)
- Toutes les autres colonnes seront disponibles pour la personnalisation IA

## 🔐 Variables d'environnement

Voir `.env.example` pour la liste complète des variables.

**Optionnelles :**
- `PORT` - Port du serveur (défaut: 3000)
- `MESSAGE_DELAY` - Délai entre messages en ms (défaut: 3000)
- `GEMINI_MODEL` - Modèle Gemini (défaut: gemini-pro)
- `UPLOAD_DIR` - Dossier pour les fichiers uploadés
- `WHATSAPP_SESSION_PATH` - Dossier pour la session WhatsApp

## 📱 Connexion WhatsApp

1. Démarrer le serveur
2. Un QR code apparaîtra dans la console
3. Scanner le QR code avec votre téléphone WhatsApp
4. La session sera sauvegardée automatiquement

## 🧪 Exemple d'utilisation

### Upload d'un fichier Excel

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@contacts.xlsx"
```

### Envoyer des messages

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "contacts": [
      {
        "nom": "Jean",
        "telephone": "+33123456789"
      }
    ],
    "message": "Bonjour {nom}, nous avons une nouvelle offre pour vous !"
  }'
```

## ⚠️ Limitations et bonnes pratiques

- **Délai entre messages** : Respecter un délai de 3-5 secondes minimum
- **Volume** : Ne pas envoyer plus de 50-100 messages/heure
- **Consentement** : S'assurer d'avoir le consentement des contacts
- **RGPD** : Respecter les réglementations sur la protection des données

## 🐛 Dépannage

### WhatsApp ne se connecte pas
- Vérifier que le QR code est scanné
- Vérifier la connexion internet
- Supprimer le dossier `whatsapp-session` et réessayer

### Erreur lors de l'envoi
- Vérifier que WhatsApp est connecté (`/api/whatsapp/status`)
- Vérifier le format des numéros de téléphone
- Vérifier que le message n'est pas vide

## 📄 Licence

MIT

