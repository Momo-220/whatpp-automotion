# 🔧 Configuration des URLs - Guide Complet

## 📍 URLs de votre application

- **Backend (Render)** : https://whatpp-automotion.onrender.com
- **Frontend (Vercel)** : https://whatpp-automotion.vercel.app

---

## ✅ Configuration Vercel (Frontend)

### 1. Aller dans Vercel Dashboard

1. **Ouvrir** : https://vercel.com
2. **Sélectionner** votre projet `whatpp-automotion`
3. **Aller dans** : **Settings** → **Environment Variables**

### 2. Ajouter/Modifier la variable

**Name** : `VITE_API_URL`  
**Value** : `https://whatpp-automotion.onrender.com/api`  
**Environments** : ✅ Production, ✅ Preview, ✅ Development

### 3. Redéployer

1. **Aller dans** : **Deployments**
2. **Cliquer** sur les **3 points** (⋯) du dernier déploiement
3. **Cliquer** : **"Redeploy"**

---

## ✅ Configuration Render (Backend)

### 1. Aller dans Render Dashboard

1. **Ouvrir** : https://dashboard.render.com
2. **Sélectionner** votre service `whatpp-automotion`
3. **Aller dans** : **Environment**

### 2. Vérifier/Ajouter les variables

#### Variables requises :

```
NODE_ENV=production
PORT=10000
MESSAGE_DELAY=3000
FRONTEND_URL=https://whatpp-automotion.vercel.app
UPLOAD_DIR=./uploads
WHATSAPP_SESSION_PATH=./whatsapp-session
```

**Important** :
- `FRONTEND_URL` doit être l'URL complète de votre frontend Vercel
- Si vous avez plusieurs URLs (production + previews), séparez-les par des virgules :
  ```
  FRONTEND_URL=https://whatpp-automotion.vercel.app,https://whatpp-automotion-*.vercel.app
  ```

### 3. Vérifier les Build & Deploy Settings

**Root Directory** : `backend`  
**Build Command** : `npm install`  
**Start Command** : `npm start` ou `node server.js`

### 4. Redéployer

1. **Aller dans** : **Manual Deploy**
2. **Cliquer** : **"Deploy latest commit"**

---

## 🔍 Vérification

### 1. Tester le backend

Ouvrez dans votre navigateur :
```
https://whatpp-automotion.onrender.com/api/health
```

Vous devriez voir :
```json
{
  "status": "ok",
  "timestamp": "...",
  "services": {
    "whatsapp": false
  }
}
```

### 2. Tester l'endpoint QR code

```
https://whatpp-automotion.onrender.com/api/whatsapp/qrcode
```

Vous devriez voir une réponse JSON (même si `success: false` au début).

### 3. Tester le frontend

1. **Ouvrir** : https://whatpp-automotion.vercel.app
2. **Ouvrir la console** (F12)
3. **Vérifier** les logs :
   ```
   🌐 API URL configurée: https://whatpp-automotion.onrender.com/api
   ```

### 4. Vérifier les logs Render

Dans **Render Dashboard** → **Logs**, vous devriez voir :
- ✅ Plus d'erreurs CORS
- ✅ Les requêtes QR code arrivent
- ✅ Le QR code est généré

---

## 🐛 Problèmes courants

### Erreur 404

**Cause** : L'URL de l'API est incorrecte

**Solution** :
1. Vérifier `VITE_API_URL` dans Vercel
2. Vérifier que l'URL se termine par `/api`
3. Redéployer le frontend

### Erreur CORS

**Cause** : Le backend n'accepte pas les requêtes depuis Vercel

**Solution** :
1. Vérifier `FRONTEND_URL` dans Render
2. S'assurer que l'URL est exacte (avec `https://`)
3. Redéployer le backend

### Le QR code ne s'affiche pas

**Cause** : Le backend n'a pas encore généré le QR code

**Solution** :
1. Attendre 10-30 secondes après le démarrage du backend
2. Vérifier les logs Render pour voir si le QR code est généré
3. Vérifier la console du navigateur pour les erreurs

---

## ✅ Checklist finale

- [ ] `VITE_API_URL` configuré dans Vercel
- [ ] `FRONTEND_URL` configuré dans Render
- [ ] Backend redéployé sur Render
- [ ] Frontend redéployé sur Vercel
- [ ] Backend accessible (test `/api/health`)
- [ ] Frontend se connecte au backend (vérifier console)
- [ ] QR code s'affiche (attendre 30 secondes)

---

## 📞 Support

Si les problèmes persistent :
1. Vérifier les logs Render
2. Vérifier la console du navigateur (F12)
3. Tester les endpoints directement dans le navigateur

