# 📱 WhatsApp Automation

Plateforme complète pour envoyer des messages WhatsApp en masse à partir d'un fichier Excel.

## 🎯 Fonctionnalités

- ✅ **Upload Excel** : Téléchargez un fichier Excel avec vos contacts
- ✅ **Envoi en masse** : Envoyez le même message à tous vos contacts
- ✅ **Statut en temps réel** : Suivez la progression de l'envoi
- ✅ **Gestion d'erreurs** : Affichage des succès et échecs
- ✅ **Interface moderne** : Design élégant et responsive

## 🚀 Démarrage rapide

### Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn
- Un compte WhatsApp actif

### Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd whatsapp-automation
```

2. **Installer les dépendances du backend**
```bash
cd backend
npm install
```

3. **Configurer le backend**
```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer .env si nécessaire (les valeurs par défaut fonctionnent)
```

4. **Démarrer le backend**
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

5. **Dans un autre terminal, installer les dépendances du frontend**
```bash
cd ../frontend
npm install
```

6. **Démarrer le frontend**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📋 Format du fichier Excel

Votre fichier Excel doit contenir au minimum ces colonnes :

| Nom      | Téléphone    |
|----------|--------------|
| Jean     | +33123456789 |
| Marie    | +33987654321 |

**Colonnes acceptées :**
- `Nom` / `nom` / `Name` / `name`
- `Téléphone` / `telephone` / `Phone` / `phone`
- `Email` / `email` (optionnel)

## 🔐 Connexion WhatsApp

1. Au démarrage du backend, un QR code apparaît dans la console
2. Ouvrez WhatsApp sur votre téléphone
3. Allez dans Paramètres > Appareils liés
4. Scannez le QR code affiché dans la console
5. La connexion est sauvegardée automatiquement

## 📖 Utilisation

1. **Uploader votre fichier Excel**
   - Cliquez sur "Choisir un fichier Excel"
   - Ou téléchargez un exemple pour voir le format

2. **Écrire votre message**
   - Tapez le message que vous voulez envoyer à tous les contacts
   - Le message sera envoyé tel quel (sans personnalisation)

3. **Vérifier le statut WhatsApp**
   - Assurez-vous que WhatsApp est connecté (statut vert)

4. **Envoyer**
   - Cliquez sur "Envoyer à X contact(s)"
   - Suivez la progression en temps réel

## ⚙️ Configuration

### Variables d'environnement (backend)

Voir `backend/env.example` pour la liste complète.

**Principales variables :**
- `PORT` : Port du serveur (défaut: 3000)
- `MESSAGE_DELAY` : Délai entre messages en ms (défaut: 3000)
- `UPLOAD_DIR` : Dossier pour les fichiers uploadés
- `WHATSAPP_SESSION_PATH` : Dossier pour la session WhatsApp

## ⚠️ Limitations et bonnes pratiques

- **Délai entre messages** : Respecter un délai de 3-5 secondes minimum
- **Volume** : Ne pas envoyer plus de 50-100 messages/heure
- **Consentement** : S'assurer d'avoir le consentement des contacts
- **RGPD** : Respecter les réglementations sur la protection des données
- **WhatsApp** : Risque de bannissement en cas d'usage abusif

## 🐛 Dépannage

### WhatsApp ne se connecte pas
- Vérifier que le QR code est scanné
- Vérifier la connexion internet
- Supprimer le dossier `whatsapp-session` et réessayer

### Erreur lors de l'envoi
- Vérifier que WhatsApp est connecté
- Vérifier le format des numéros de téléphone
- Vérifier que le message n'est pas vide

### Le frontend ne se connecte pas au backend
- Vérifier que le backend tourne sur le port 3000
- Vérifier la configuration du proxy dans `vite.config.js`

## 📁 Structure du projet

```
whatsapp-automation/
├── backend/
│   ├── services/          # Services métier
│   ├── routes/            # Routes API
│   ├── server.js          # Serveur Express
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── App.jsx        # Composant principal
│   │   └── main.jsx       # Point d'entrée
│   └── package.json
└── README.md
```

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.



