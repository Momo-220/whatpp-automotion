#!/usr/bin/env bash
# Script de build optimisé pour Render

set -e

echo "🚀 Début du build optimisé..."

# Installer les dépendances sans Puppeteer
echo "📦 Installation des dépendances..."
npm ci --production --prefer-offline --no-audit --no-fund

# Installer les dépendances système pour Puppeteer
echo "🔧 Configuration de Puppeteer pour Render..."
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

echo "✅ Build terminé avec succès!"

