const express = require('express');
const WhatsAppService = require('../services/whatsappService');

const router = express.Router();

// Instance globale du service WhatsApp (sera initialisée dans server.js)
let whatsappService = null;

/**
 * Initialise le service WhatsApp (appelé depuis server.js)
 */
function initializeWhatsAppService(service) {
  whatsappService = service;
}

/**
 * Route pour obtenir le statut WhatsApp
 * GET /api/whatsapp/status
 */
router.get('/status', (req, res) => {
  if (!whatsappService) {
    return res.json({
      ready: false,
      authenticated: false,
      error: 'Service WhatsApp non initialisé'
    });
  }

  res.json({
    ready: whatsappService.isClientReady(),
    authenticated: whatsappService.isAuthenticated,
    hasQRCode: whatsappService.getQRCode() !== null
  });
});

/**
 * Route pour obtenir le QR Code
 * GET /api/whatsapp/qrcode
 */
router.get('/qrcode', (req, res) => {
  console.log('📱 Requête QR Code reçue depuis:', req.headers.origin || req.headers.referer || 'unknown');
  
  if (!whatsappService) {
    console.error('❌ Service WhatsApp non initialisé');
    return res.status(500).json({
      success: false,
      error: 'Service WhatsApp non initialisé'
    });
  }

  const qrCode = whatsappService.getQRCode();
  const isReady = whatsappService.isClientReady();
  
  console.log('📊 QR Code request - QR available:', !!qrCode, 'Ready:', isReady);
  
  if (qrCode) {
    console.log('✅ Envoi du QR code au frontend');
    res.json({
      success: true,
      qrcode: qrCode,
      timestamp: new Date().toISOString()
    });
  } else {
    console.log('⏳ QR Code non disponible, statut:', isReady ? 'Connecté' : 'En attente');
    res.json({
      success: false,
      message: isReady 
        ? 'WhatsApp est déjà connecté' 
        : 'QR Code non disponible. Le backend génère le QR code, veuillez attendre quelques secondes...',
      isReady: isReady,
      waiting: !isReady
    });
  }
});

/**
 * Route pour obtenir les informations du client
 * GET /api/whatsapp/info
 */
router.get('/info', async (req, res) => {
  if (!whatsappService) {
    return res.status(500).json({
      success: false,
      error: 'Service WhatsApp non initialisé'
    });
  }

  try {
    const info = await whatsappService.getClientInfo();
    
    if (info) {
      res.json({
        success: true,
        info: info
      });
    } else {
      res.json({
        success: false,
        message: 'WhatsApp n\'est pas prêt'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Route pour déconnecter WhatsApp
 * POST /api/whatsapp/disconnect
 */
router.post('/disconnect', async (req, res) => {
  if (!whatsappService) {
    return res.status(500).json({
      success: false,
      error: 'Service WhatsApp non initialisé'
    });
  }

  try {
    await whatsappService.disconnect();
    res.json({
      success: true,
      message: 'WhatsApp déconnecté avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Route pour réinitialiser/reconnecter WhatsApp
 * POST /api/whatsapp/reconnect
 */
router.post('/reconnect', async (req, res) => {
  if (!whatsappService) {
    return res.status(500).json({
      success: false,
      error: 'Service WhatsApp non initialisé'
    });
  }

  try {
    console.log('🔄 Réinitialisation de WhatsApp...');
    
    // Utiliser la méthode reset si elle existe, sinon disconnect + initialize
    if (whatsappService.reset) {
      await whatsappService.reset();
    } else {
      await whatsappService.disconnect();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await whatsappService.initialize();
    }
    
    res.json({
      success: true,
      message: 'WhatsApp réinitialisé. Un nouveau QR code sera généré.'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = { router, initializeWhatsAppService };



