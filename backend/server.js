require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Services
const WhatsAppService = require('./services/whatsappService');
const uploadRouter = require('./routes/upload');
const { router: whatsappRouter, initializeWhatsAppService } = require('./routes/whatsapp');
const { router: sendRouter, initializeServices } = require('./routes/send');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // En production, accepter toutes les origines depuis Vercel
    const allowedOrigins = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
      : ['http://localhost:5173', 'http://localhost:3000'];
    
    // Permettre les requêtes sans origine (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origine est autorisée
    if (allowedOrigins.some(allowed => origin.includes(allowed.replace(/^https?:\/\//, '').replace(/\/$/, '')))) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS: Origine non autorisée:', origin);
      console.log('✅ Origines autorisées:', allowedOrigins);
      // En production, on peut être plus permissif
      if (process.env.NODE_ENV === 'production') {
        callback(null, true); // Accepter toutes les origines en production
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Créer les dossiers nécessaires
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const sessionDir = process.env.WHATSAPP_SESSION_PATH || './whatsapp-session';

[uploadDir, sessionDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Dossier créé: ${dir}`);
  }
});

// Routes
app.use('/api/upload', uploadRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/send', sendRouter);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      whatsapp: whatsappService ? whatsappService.isClientReady() : false
    }
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'API WhatsApp Automation',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      upload: '/api/upload',
      whatsapp: '/api/whatsapp',
      send: '/api/send'
    }
  });
});

// Initialiser WhatsApp Service
const whatsappService = new WhatsAppService(sessionDir);
initializeWhatsAppService(whatsappService);

// Initialiser le service d'envoi
initializeServices(whatsappService, {
  messageDelay: parseInt(process.env.MESSAGE_DELAY) || 3000
});

// Démarrer le serveur
app.listen(PORT, async () => {
  console.log('\n🚀 Serveur démarré sur le port', PORT);
  console.log(`📡 API disponible sur http://localhost:${PORT}`);
  console.log('\n📋 Endpoints disponibles:');
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/upload`);
  console.log(`   GET  http://localhost:${PORT}/api/whatsapp/status`);
  console.log(`   GET  http://localhost:${PORT}/api/whatsapp/qrcode`);
  console.log(`   POST http://localhost:${PORT}/api/send`);
  console.log(`   POST http://localhost:${PORT}/api/send/test`);
  
  // Initialiser WhatsApp
  console.log('\n📱 Initialisation de WhatsApp...');
  try {
    await whatsappService.initialize();
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation WhatsApp:', error);
  }
});

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Arrêt du serveur...');
  if (whatsappService) {
    await whatsappService.disconnect();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Arrêt du serveur...');
  if (whatsappService) {
    await whatsappService.disconnect();
  }
  process.exit(0);
});

module.exports = app;

