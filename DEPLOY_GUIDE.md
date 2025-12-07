# 🚀 Guide de Déploiement - WhatsApp Automation

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration Backend (Render)](#configuration-backend-render)
3. [Configuration Frontend (Vercel)](#configuration-frontend-vercel)
4. [Vérification du déploiement](#vérification-du-déploiement)
5. [Dépannage](#dépannage)

---

## Prérequis

- Un compte [Render](https://render.com) (gratuit)
- Un compte [Vercel](https://vercel.com) (gratuit)
- Un compte [GitHub](https://github.com) avec le code du projet

---

## Configuration Backend (Render)

### 1. Push du code sur GitHub

```bash
cd d:\whatapp-automotion
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/whatapp-automation.git
git push -u origin main
```

### 2. Créer le service sur Render

1. Aller sur [Render Dashboard](https://dashboard.render.com/)
2. Cliquer sur **New +** → **Web Service**
3. Connecter votre repository GitHub
4. **IMPORTANT** : Utiliser le fichier `render.yaml` (Blueprint)
   - Render détectera automatiquement le fichier `render.yaml`
   - Cliquer sur **Apply** pour déployer automatiquement

### 3. Variables d'environnement (déjà configurées dans render.yaml)

Les variables suivantes sont déjà définies dans `render.yaml` :

```yaml
NODE_ENV=production
PORT=10000
MESSAGE_DELAY=500
BATCH_SIZE=5
FRONTEND_URL=https://whatpp-automotion.vercel.app
```

### 4. Attendre le déploiement

- Le build prend **3-5 minutes** (Puppeteer télécharge Chromium ~300MB)
- Suivre les logs en temps réel dans Render Dashboard
- Une fois terminé, votre backend sera accessible sur : `https://whatpp-automotion.onrender.com`

---

## Configuration Frontend (Vercel)

### 1. Créer le projet sur Vercel

1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Cliquer sur **Add New** → **Project**
3. Importer votre repository GitHub
4. **Framework Preset** : Vite
5. **Root Directory** : `frontend`

### 2. Configuration du build

Vercel détectera automatiquement :
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

### 3. Variables d'environnement

Ajouter cette variable dans **Settings** → **Environment Variables** :

```
VITE_API_URL=https://whatpp-automotion.onrender.com/api
```

**IMPORTANT** : L'URL doit se terminer par `/api`

### 4. Déployer

- Cliquer sur **Deploy**
- Le déploiement prend **1-2 minutes**
- Votre frontend sera accessible sur : `https://whatpp-automotion.vercel.app`

---

## Vérification du déploiement

### 1. Tester le backend

```bash
curl https://whatpp-automotion.onrender.com/api/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "whatsapp": false
  }
}
```

### 2. Tester le frontend

1. Aller sur `https://whatpp-automotion.vercel.app`
2. Vérifier que la page s'affiche correctement
3. Attendre l'affichage du QR code WhatsApp (10-30 secondes)

### 3. Scanner le QR code

1. Ouvrir WhatsApp sur votre téléphone
2. **Paramètres** → **Appareils liés**
3. Appuyer sur **Lier un appareil**
4. Scanner le QR code affiché sur le frontend

### 4. Tester l'envoi

1. Télécharger le fichier exemple Excel OU saisir des numéros manuellement
2. Écrire un message
3. Cliquer sur **Envoyer**
4. Vérifier la réception des messages

---

## Dépannage

### ❌ Le QR code ne s'affiche pas

**Symptômes** :
- "En attente du QR code..."
- Message : "Backend non accessible"

**Solutions** :
1. Vérifier que le backend est déployé sur Render :
   ```bash
   curl https://whatpp-automotion.onrender.com/api/health
   ```

2. Vérifier les logs du backend sur Render Dashboard

3. Réinitialiser WhatsApp :
   ```bash
   curl -X POST https://whatpp-automotion.onrender.com/api/whatsapp/reconnect
   ```

4. Vérifier que `VITE_API_URL` est correctement configurée sur Vercel

---

### ❌ Erreur "WhatsApp n'est pas prêt"

**Symptômes** :
- Statut : WhatsApp Non Connecté
- Impossible d'envoyer des messages

**Solutions** :
1. Scanner le QR code avec WhatsApp
2. Attendre 10-30 secondes après le scan
3. Recharger la page frontend

---

### ❌ Erreur "Failed to launch browser"

**Symptômes** :
- Logs backend : "spawn /usr/bin/google-chrome-stable ENOENT"
- WhatsApp ne démarre pas

**Cause** : Puppeteer n'est pas correctement installé

**Solutions** :
1. Vérifier `backend/package.json` :
   ```json
   {
     "dependencies": {
       "puppeteer": "^21.6.0"
     }
   }
   ```

2. Redéployer sur Render (le build téléchargera Chromium)

---

### ❌ Messages d'erreur "Numéro invalide"

**Symptômes** :
- Messages marqués comme "Échec"
- Erreur : "Le numéro n'est pas valide ou n'a pas WhatsApp"

**Solutions** :
1. Vérifier le format des numéros : `+[code pays][numéro]`
   - ✅ Bon : `+33612345678`, `+22790834737`
   - ❌ Mauvais : `0612345678`, `33612345678`

2. Vérifier que le numéro a WhatsApp installé

3. Tester avec votre propre numéro d'abord

---

### ❌ Envoi très lent

**Symptômes** :
- L'envoi prend plusieurs minutes

**Solutions** :
1. Vérifier les variables d'environnement sur Render :
   ```
   MESSAGE_DELAY=500
   BATCH_SIZE=5
   ```

2. Redéployer pour appliquer les changements

---

### ❌ CORS Error

**Symptômes** :
- Console frontend : "CORS policy: No 'Access-Control-Allow-Origin'"

**Solutions** :
1. Vérifier `FRONTEND_URL` sur Render :
   ```
   FRONTEND_URL=https://whatpp-automotion.vercel.app
   ```

2. Vérifier que l'URL Vercel est correcte (sans "/" final)

---

## 🔧 Commandes utiles

### Backend (Render)

- **Redémarrer** : Dashboard → Service → Manual Deploy → **Clear build cache & deploy**
- **Logs** : Dashboard → Service → **Logs**
- **Variables** : Dashboard → Service → **Environment** → Ajouter/Modifier

### Frontend (Vercel)

- **Redéployer** : Dashboard → Project → **Redeploy**
- **Logs** : Dashboard → Project → Deployment → **View Function Logs**
- **Variables** : Dashboard → Project → **Settings** → **Environment Variables**

---

## 📊 Architecture finale

```
┌─────────────────────────────────────────────────────────────┐
│                         UTILISATEUR                          │
│                  https://whatpp-automotion.vercel.app       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ Requêtes API
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Vercel)                        │
│  - React + Vite                                             │
│  - Interface utilisateur                                     │
│  - Affichage QR code                                        │
│  - Upload Excel / Saisie manuelle                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ VITE_API_URL
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Render)                         │
│  - Node.js + Express                                        │
│  - WhatsApp Web.js + Puppeteer                              │
│  - Parsing Excel                                            │
│  - Envoi de messages en masse                               │
│  https://whatpp-automotion.onrender.com                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ Connexion WhatsApp
                          ↓
                  ┌─────────────────┐
                  │  WhatsApp Web   │
                  │   (Chromium)    │
                  └─────────────────┘
```

---

## ✅ Checklist de déploiement

**Backend (Render)** :
- [ ] Code pushé sur GitHub
- [ ] Service créé avec `render.yaml`
- [ ] Variables d'environnement configurées
- [ ] Build réussi (3-5 min)
- [ ] Service accessible via `/api/health`
- [ ] QR code généré (visible dans les logs)

**Frontend (Vercel)** :
- [ ] Projet créé et lié à GitHub
- [ ] Root Directory = `frontend`
- [ ] `VITE_API_URL` configurée
- [ ] Build réussi (1-2 min)
- [ ] Application accessible
- [ ] QR code affiché sur la page

**Fonctionnalités** :
- [ ] QR code scanné avec succès
- [ ] WhatsApp connecté (statut ✅)
- [ ] Upload Excel fonctionne
- [ ] Saisie manuelle fonctionne
- [ ] Envoi de messages réussi
- [ ] Messages reçus sur WhatsApp

---

## 📞 Support

En cas de problème persistant :

1. **Vérifier les logs** :
   - Render : Dashboard → Logs
   - Vercel : Dashboard → Deployment → Function Logs
   - Frontend : Console du navigateur (F12)

2. **Vérifier la configuration** :
   - Toutes les variables d'environnement sont correctes
   - Les URL ne contiennent pas de "/" final
   - `VITE_API_URL` se termine bien par `/api`

3. **Réinitialiser tout** :
   - Render : Clear build cache & redeploy
   - Vercel : Redeploy
   - WhatsApp : POST `/api/whatsapp/reconnect`

---

## 🎉 Félicitations !

Votre application WhatsApp Automation est maintenant déployée et fonctionnelle !

- 📱 **WhatsApp** : Envoi automatique de messages
- 📊 **Excel** : Upload et parsing de contacts
- ✏️ **Saisie manuelle** : Support de masse (bulk paste)
- ⚡ **Performance** : 5 messages en parallèle, 0.5s de délai
- 🌐 **Cloud** : 100% en ligne, accessible partout

**Temps d'envoi estimé** : ~10 secondes pour 100 messages 🚀

