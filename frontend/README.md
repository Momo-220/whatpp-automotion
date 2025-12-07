# Frontend - WhatsApp Automation

Interface React pour l'automatisation d'envoi de messages WhatsApp.

## 🚀 Installation

```bash
npm install
```

## 🏃 Démarrer en développement

```bash
npm run dev
```

L'application sera accessible sur http://localhost:5173

## 📦 Build pour production

```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/`

## 🎯 Fonctionnalités

- ✅ Upload de fichier Excel avec contacts
- ✅ Éditeur de message
- ✅ Affichage du statut WhatsApp
- ✅ Envoi en masse avec progression
- ✅ Affichage des résultats (succès/échecs)

## 📋 Prérequis

Le backend doit être démarré sur le port 3000.

## 🔧 Configuration

Le proxy est configuré dans `vite.config.js` pour rediriger les requêtes `/api` vers `http://localhost:3000`



