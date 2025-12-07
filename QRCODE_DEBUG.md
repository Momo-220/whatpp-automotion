# 🔍 Débogage du QR Code en Production

## ✅ Améliorations apportées

1. **Meilleure gestion des erreurs** : Le frontend affiche maintenant des messages d'erreur clairs
2. **Bouton de réessai** : Possibilité de réessayer manuellement
3. **Logs améliorés** : Le backend log maintenant les requêtes QR code
4. **Timeout** : Les requêtes ont maintenant un timeout de 5 secondes
5. **Polling optimisé** : Vérification toutes les 2-3 secondes au lieu de 5

---

## 🔧 Vérifications à faire

### 1. Vérifier que le backend est démarré sur Render

1. **Aller sur** : https://dashboard.render.com
2. **Ouvrir** votre service backend
3. **Aller dans** : **"Logs"**
4. **Vérifier** que vous voyez :
   ```
   🚀 Serveur démarré sur le port 10000
   📡 API disponible sur http://localhost:10000
   ```

### 2. Vérifier l'initialisation WhatsApp

Dans les logs Render, vous devriez voir :
```
📱 QR CODE POUR CONNEXION WHATSAPP:
Scannez ce QR code avec votre téléphone WhatsApp
```

Si vous ne voyez pas ce message, le backend n'a pas encore généré le QR code.

### 3. Tester l'endpoint QR code directement

Ouvrez dans votre navigateur :
```
https://votre-backend.onrender.com/api/whatsapp/qrcode
```

Vous devriez voir une réponse JSON :
- Si QR disponible : `{"success": true, "qrcode": "..."}`
- Si pas encore prêt : `{"success": false, "message": "..."}`

### 4. Vérifier la variable d'environnement VITE_API_URL

Dans Vercel Dashboard → Settings → Environment Variables :
- **Name** : `VITE_API_URL`
- **Value** : `https://votre-backend.onrender.com/api`
- **Important** : Vérifier que l'URL est correcte (avec `/api` à la fin)

### 5. Vérifier la console du navigateur

1. **Ouvrir** votre site Vercel
2. **Appuyer** sur `F12` pour ouvrir la console
3. **Vérifier** les erreurs :
   - Erreurs CORS ?
   - Erreurs de connexion au backend ?
   - Erreurs de timeout ?

---

## 🐛 Problèmes courants

### Problème 1 : "Impossible de se connecter au serveur"

**Cause** : Le backend n'est pas démarré ou l'URL est incorrecte

**Solution** :
1. Vérifier que le backend est bien déployé sur Render
2. Vérifier que `VITE_API_URL` dans Vercel pointe vers la bonne URL
3. Tester l'URL directement dans le navigateur

### Problème 2 : "QR Code non disponible"

**Cause** : Le backend n'a pas encore généré le QR code

**Solution** :
1. Attendre 10-30 secondes après le démarrage du backend
2. Vérifier les logs Render pour voir si le QR code est généré
3. Si le backend redémarre souvent, vérifier les erreurs dans les logs

### Problème 3 : Le QR code s'affiche mais ne fonctionne pas

**Cause** : Le QR code a expiré (ils expirent après ~20 secondes)

**Solution** :
1. Le QR code se régénère automatiquement toutes les 20 secondes
2. Attendre le nouveau QR code
3. Scanner rapidement après l'affichage

### Problème 4 : Erreur CORS

**Cause** : Le backend n'autorise pas les requêtes depuis Vercel

**Solution** :
1. Vérifier dans `backend/server.js` que `FRONTEND_URL` est bien configuré
2. Vérifier que `FRONTEND_URL` dans Render pointe vers votre URL Vercel

---

## 🔄 Redémarrage du backend

Si le QR code ne s'affiche toujours pas :

1. **Dans Render Dashboard** :
   - Aller dans votre service backend
   - Cliquer sur **"Manual Deploy"** → **"Clear build cache & deploy"**
   - Attendre le redéploiement

2. **Vérifier les logs** :
   - Attendre 30 secondes après le démarrage
   - Vérifier que le QR code est généré dans les logs

---

## 📝 Logs à vérifier

### Backend (Render) :
```
✅ WhatsApp est prêt !
📱 QR CODE POUR CONNEXION WHATSAPP:
QR Code request - QR available: true, Ready: false
```

### Frontend (Console navigateur) :
```
✅ Récupération du QR code réussie
❌ Erreur lors de la récupération du QR code: ...
```

---

## 🆘 Si rien ne fonctionne

1. **Vérifier** que tous les services sont bien déployés
2. **Vérifier** toutes les variables d'environnement
3. **Tester** les endpoints directement dans le navigateur
4. **Vérifier** les logs des deux services (Render et Vercel)
5. **Redéployer** les deux services si nécessaire

