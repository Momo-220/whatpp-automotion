# 📋 Commandes de Déploiement - Guide Rapide

## 🚀 Commandes à exécuter dans l'ordre

### 1️⃣ Préparer le repository Git

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - Ready for deployment"

# Créer la branche main
git branch -M main

# Ajouter le remote GitHub (remplacer par votre URL)
git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git

# Pousser vers GitHub
git push -u origin main
```

---

## 🔧 PARTIE 1 : Backend sur Render

### Option A : Via l'interface Render (RECOMMANDÉ)

1. **Aller sur** : https://dashboard.render.com
2. **Cliquer** : "New +" → "Web Service"
3. **Connecter** votre repository GitHub
4. **Configurer** :
   - Name: `whatsapp-automation-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. **Ajouter les variables d'environnement** :
   ```
   NODE_ENV=production
   PORT=10000
   MESSAGE_DELAY=3000
   FRONTEND_URL=https://votre-app.vercel.app
   ```
6. **Cliquer** : "Create Web Service"
7. **Attendre** le déploiement (~5-10 min)
8. **Copier l'URL** : `https://votre-backend.onrender.com`

### Option B : Via Render CLI

```bash
# Installer Render CLI
npm install -g render-cli

# Se connecter
render login

# Aller dans le dossier backend
cd backend

# Créer le service (première fois)
render service:create

# Déployer
render deploy
```

---

## 🎨 PARTIE 2 : Frontend sur Vercel

### Option A : Via l'interface Vercel (RECOMMANDÉ)

1. **Aller sur** : https://vercel.com
2. **Cliquer** : "Add New..." → "Project"
3. **Importer** votre repository GitHub
4. **Configurer** :
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Ajouter la variable d'environnement** :
   ```
   VITE_API_URL=https://votre-backend.onrender.com/api
   ```
   (Remplacer par votre URL Render du backend)
6. **Cliquer** : "Deploy"
7. **Attendre** le déploiement (~2-3 min)
8. **Copier l'URL** : `https://votre-app.vercel.app`

### Option B : Via Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Aller dans le dossier frontend
cd frontend

# Déployer (première fois)
vercel

# Répondre aux questions :
# - Set up and deploy? Y
# - Which scope? (votre compte)
# - Link to existing project? N
# - Project name: whatsapp-automation-frontend
# - Directory: ./
# - Override settings? N

# Ajouter la variable d'environnement pour la production
vercel env add VITE_API_URL production
# Entrer: https://votre-backend.onrender.com/api

# Déployer en production
vercel --prod
```

---

## 🔄 Mettre à jour après modifications

### Backend
```bash
git add .
git commit -m "Update backend"
git push
# Render redéploiera automatiquement
```

### Frontend
```bash
git add .
git commit -m "Update frontend"
git push
# Vercel redéploiera automatiquement
```

---

## ✅ Vérification

### Tester le Backend
```bash
curl https://votre-backend.onrender.com/api/health
```

### Tester le Frontend
1. Ouvrir : `https://votre-app.vercel.app`
2. Vérifier que l'interface se charge
3. Vérifier le statut WhatsApp

---

## 🔐 Configuration CORS (IMPORTANT)

Après avoir déployé le frontend, mettre à jour la variable d'environnement dans Render :

```
FRONTEND_URL=https://votre-app.vercel.app
```

Puis redémarrer le service sur Render.

---

## 📝 Checklist de déploiement

- [ ] Repository GitHub créé et poussé
- [ ] Backend déployé sur Render
- [ ] URL du backend copiée
- [ ] Frontend déployé sur Vercel
- [ ] Variable `VITE_API_URL` configurée dans Vercel
- [ ] Variable `FRONTEND_URL` configurée dans Render
- [ ] Backend redémarré sur Render (pour appliquer CORS)
- [ ] Test de l'endpoint `/api/health` réussi
- [ ] Test du frontend réussi
- [ ] QR code WhatsApp accessible dans les logs Render

---

## 🆘 En cas de problème

### Backend ne répond pas
1. Vérifier les logs Render : Dashboard → Service → Logs
2. Vérifier que le PORT est bien défini
3. Vérifier que toutes les dépendances sont installées

### Frontend ne se connecte pas
1. Vérifier `VITE_API_URL` dans Vercel
2. Vérifier CORS dans Render
3. Vérifier la console du navigateur (F12)

### WhatsApp QR Code
1. Aller dans Render Dashboard → Logs
2. Chercher le QR code dans les logs
3. Scanner avec votre téléphone



