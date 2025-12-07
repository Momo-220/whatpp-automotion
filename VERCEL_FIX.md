# 🔧 Correction de l'erreur Vercel

## ❌ Erreur actuelle
```
Environment Variable "VITE_API_URL" references Secret "api_url", which does not exist.
```

## ✅ Solution : Configurer la variable d'environnement dans Vercel Dashboard

### Étape 1 : Aller dans Vercel Dashboard

1. **Aller sur** : https://vercel.com
2. **Cliquer** sur votre projet
3. **Aller dans** : **"Settings"** → **"Environment Variables"**

### Étape 2 : Ajouter la variable d'environnement

1. **Cliquer** : **"Add New"**
2. **Remplir** :
   - **Name** : `VITE_API_URL`
   - **Value** : `https://votre-backend.onrender.com/api`
     (Remplacer par votre URL Render réelle)
   - **Environment** : Cocher **Production**, **Preview**, et **Development**
3. **Cliquer** : **"Save"**

### Étape 3 : Redéployer

1. **Aller dans** : **"Deployments"**
2. **Cliquer** sur les **3 points** (⋯) du dernier déploiement
3. **Cliquer** : **"Redeploy"**

---

## 📋 Configuration correcte

### Variables d'environnement dans Vercel :

```
VITE_API_URL=https://votre-backend.onrender.com/api
```

**Important** : 
- Remplacer `votre-backend.onrender.com` par votre URL Render réelle
- Cocher toutes les environnements (Production, Preview, Development)

---

## 🔄 Alternative : Via Vercel CLI

```bash
# Aller dans frontend
cd frontend

# Ajouter la variable
vercel env add VITE_API_URL production
# Entrer: https://votre-backend.onrender.com/api

# Ajouter aussi pour preview et development
vercel env add VITE_API_URL preview
vercel env add VITE_API_URL development

# Redéployer
vercel --prod
```

---

## ✅ Vérification

Après correction, le build devrait réussir et l'application devrait se connecter au backend.

