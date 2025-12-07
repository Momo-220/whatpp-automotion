# 🚀 Guide de Déploiement

Guide pour déployer l'application WhatsApp Automation sur Vercel (frontend) et Render (backend).

## 📋 Prérequis

- Compte GitHub (pour connecter les repos)
- Compte Vercel (gratuit) : https://vercel.com
- Compte Render (gratuit) : https://render.com
- Node.js installé localement (pour les tests)

---

## 🔧 PARTIE 1 : Déploiement du Backend sur Render

### Étape 1 : Préparer le repository

1. **Créer un repository GitHub** (si pas déjà fait)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/votre-username/votre-repo.git
   git push -u origin main
   ```

### Étape 2 : Déployer sur Render

1. **Aller sur Render** : https://dashboard.render.com
2. **Cliquer sur "New +"** → **"Web Service"**
3. **Connecter votre repository GitHub**
4. **Configurer le service** :
   - **Name** : `whatsapp-automation-backend`
   - **Region** : Choisir la région la plus proche
   - **Branch** : `main` (ou `master`)
   - **Root Directory** : `backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `node server.js`

5. **Variables d'environnement** (dans Render Dashboard → Environment) :
   ```
   NODE_ENV=production
   PORT=10000
   MESSAGE_DELAY=3000
   GEMINI_MODEL=gemini-pro
   UPLOAD_DIR=./uploads
   WHATSAPP_SESSION_PATH=./whatsapp-session
   ```

6. **Cliquer sur "Create Web Service"**

7. **Attendre le déploiement** (première fois : ~5-10 minutes)

8. **Copier l'URL du backend** (ex: `https://whatsapp-automation-backend.onrender.com`)

---

## 🎨 PARTIE 2 : Déploiement du Frontend sur Vercel

### Étape 1 : Préparer le frontend

1. **Mettre à jour l'URL de l'API** dans `frontend/src/config/api.js` :
   - Remplacer `https://votre-backend.render.com` par l'URL de votre backend Render

### Étape 2 : Déployer sur Vercel

**Option A : Via l'interface Vercel (Recommandé)**

1. **Aller sur Vercel** : https://vercel.com
2. **Cliquer sur "Add New..."** → **"Project"**
3. **Importer votre repository GitHub**
4. **Configurer le projet** :
   - **Framework Preset** : Vite
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

5. **Variables d'environnement** :
   ```
   VITE_API_URL=https://votre-backend.render.com/api
   ```
   (Remplacer par votre URL Render)

6. **Cliquer sur "Deploy"**

**Option B : Via Vercel CLI**

```bash
# Installer Vercel CLI
npm i -g vercel

# Aller dans le dossier frontend
cd frontend

# Déployer
vercel

# Suivre les instructions
# - Link to existing project? No
# - Project name: whatsapp-automation-frontend
# - Directory: ./
# - Override settings? No

# Définir la variable d'environnement
vercel env add VITE_API_URL production
# Entrer: https://votre-backend.render.com/api

# Redéployer avec les variables
vercel --prod
```

---

## 🔐 Configuration CORS (Important !)

Le backend doit autoriser les requêtes depuis votre domaine Vercel.

### Modifier `backend/server.js` :

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://votre-app.vercel.app'  // Votre URL Vercel
  ],
  credentials: true
}));
```

Ou pour autoriser tous les domaines (développement uniquement) :
```javascript
app.use(cors());
```

---

## 📝 Commandes à exécuter

### 1. Préparer le repository Git

```bash
# Dans le dossier racine du projet
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/votre-username/votre-repo.git
git push -u origin main
```

### 2. Déployer le Backend sur Render

**Via l'interface Render** (recommandé) :
1. Aller sur https://dashboard.render.com
2. New + → Web Service
3. Connecter GitHub repo
4. Configurer comme indiqué ci-dessus

**Ou via Render CLI** :
```bash
# Installer Render CLI
npm install -g render-cli

# Se connecter
render login

# Déployer (depuis la racine)
render deploy
```

### 3. Déployer le Frontend sur Vercel

**Via l'interface Vercel** (recommandé) :
1. Aller sur https://vercel.com
2. Import Project
3. Connecter GitHub repo
4. Configurer comme indiqué ci-dessus

**Ou via Vercel CLI** :
```bash
# Installer Vercel CLI
npm install -g vercel

# Aller dans frontend
cd frontend

# Déployer
vercel

# Ajouter variable d'environnement
vercel env add VITE_API_URL production
# Entrer: https://votre-backend.onrender.com/api

# Déployer en production
vercel --prod
```

---

## ✅ Vérification après déploiement

### Backend (Render)
1. Vérifier que le service est "Live" sur Render
2. Tester l'endpoint : `https://votre-backend.onrender.com/api/health`
3. Devrait retourner : `{"status":"ok",...}`

### Frontend (Vercel)
1. Vérifier que le déploiement est "Ready" sur Vercel
2. Ouvrir l'URL Vercel dans le navigateur
3. Vérifier que l'interface se charge
4. Vérifier que le statut WhatsApp s'affiche

---

## 🔄 Mises à jour

### Mettre à jour le Backend
```bash
git add .
git commit -m "Update backend"
git push
# Render redéploiera automatiquement
```

### Mettre à jour le Frontend
```bash
git add .
git commit -m "Update frontend"
git push
# Vercel redéploiera automatiquement
```

---

## ⚠️ Notes importantes

1. **WhatsApp Session** : La session WhatsApp sera stockée sur Render. Si le service redémarre, vous devrez rescanner le QR code.

2. **Fichiers uploadés** : Les fichiers Excel uploadés sont stockés localement sur Render. Ils seront supprimés si le service redémarre.

3. **Limites gratuites** :
   - **Render** : Service peut s'endormir après 15 min d'inactivité (gratuit)
   - **Vercel** : 100GB bandwidth/mois (gratuit)

4. **Variables d'environnement** : Ne jamais commiter le fichier `.env` !

5. **CORS** : Assurez-vous que CORS est configuré correctement pour autoriser votre domaine Vercel.

---

## 🐛 Dépannage

### Backend ne démarre pas sur Render
- Vérifier les logs dans Render Dashboard
- Vérifier que `PORT` est bien défini (Render utilise le port depuis `PORT` env var)
- Vérifier que toutes les dépendances sont dans `package.json`

### Frontend ne se connecte pas au backend
- Vérifier que `VITE_API_URL` est correctement défini dans Vercel
- Vérifier que CORS autorise votre domaine Vercel
- Vérifier les logs du navigateur (F12 → Console)

### WhatsApp ne se connecte pas
- Le QR code s'affichera dans les logs Render
- Accéder aux logs : Render Dashboard → Service → Logs
- Scanner le QR code depuis les logs

---

## 📞 Support

En cas de problème, vérifier :
1. Les logs sur Render Dashboard
2. Les logs sur Vercel Dashboard
3. La console du navigateur (F12)



