# 🔧 Correction du déploiement Render

## ❌ Erreur actuelle
```
Error: Cannot find module '/opt/render/project/src/backend/serve.js'
```

## ✅ Solution : Corriger la configuration dans Render Dashboard

### Étape 1 : Aller dans Render Dashboard

1. **Aller sur** : https://dashboard.render.com
2. **Cliquer** sur votre service `whatsapp-automation-backend`
3. **Aller dans l'onglet** : **"Settings"** (Paramètres)

### Étape 2 : Corriger la commande de démarrage

Dans la section **"Start Command"**, vous devez avoir :

```
node server.js
```

**PAS** `node serve.js` ❌

### Étape 3 : Vérifier toutes les configurations

Assurez-vous que ces paramètres sont corrects :

- **Root Directory** : `backend`
- **Environment** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `node server.js` ✅

### Étape 4 : Redémarrer le service

1. **Aller dans l'onglet** : **"Manual Deploy"**
2. **Cliquer** : **"Deploy latest commit"**
3. **Attendre** le redéploiement

---

## 📋 Configuration complète dans Render Dashboard

### Settings → Build & Deploy

```
Root Directory: backend
Environment: Node
Build Command: npm install
Start Command: node server.js
```

### Settings → Environment

Ajouter ces variables :

```
NODE_ENV=production
PORT=10000
MESSAGE_DELAY=3000
FRONTEND_URL=https://votre-app.vercel.app
UPLOAD_DIR=./uploads
WHATSAPP_SESSION_PATH=./whatsapp-session
```

---

## 🔄 Alternative : Utiliser npm start

Si `node server.js` ne fonctionne pas, utilisez :

**Start Command** : `npm start`

(Cela utilisera le script défini dans `package.json`)

---

## ✅ Vérification

Après correction, les logs devraient afficher :
```
🚀 Serveur démarré sur le port 10000
📡 API disponible sur http://localhost:10000
```

