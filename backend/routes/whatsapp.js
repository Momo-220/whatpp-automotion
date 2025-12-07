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
  if (!whatsappService) {
    return res.status(500).json({
      success: false,
      error: 'Service WhatsApp non initialisé'
    });
  }

  const qrCode = whatsappService.getQRCode();
  
  if (qrCode) {
    res.json({
      success: true,
      qrcode: qrCode
    });
  } else {
    res.json({
      success: false,
      message: whatsappService.isClientReady() 
        ? 'WhatsApp est déjà connecté' 
        : 'QR Code non disponible. Veuillez attendre...'
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

module.exports = { router, initializeWhatsAppService };



