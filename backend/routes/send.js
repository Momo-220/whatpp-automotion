const express = require('express');
const MessageSender = require('../services/messageSender');
const WhatsAppService = require('../services/whatsappService');

const router = express.Router();

// Instances globales (seront initialisées dans server.js)
let messageSender = null;
let whatsappService = null;

/**
 * Initialise les services (appelé depuis server.js)
 */
function initializeServices(whatsappServiceInstance, options) {
  whatsappService = whatsappServiceInstance;
  messageSender = new MessageSender(whatsappServiceInstance, options);
}

/**
 * Route pour envoyer des messages en masse
 * POST /api/send
 * Body: { contacts: Array, message: string }
 */
router.post('/', async (req, res) => {
  try {
    if (!messageSender) {
      return res.status(500).json({
        success: false,
        error: 'Service d\'envoi non initialisé'
      });
    }

    const { contacts, message } = req.body;

    // Validation
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'La liste des contacts est requise et ne peut pas être vide'
      });
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Le message est requis et ne peut pas être vide'
      });
    }

    // Vérifier que WhatsApp est prêt
    if (!whatsappService.isClientReady()) {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp n\'est pas prêt. Veuillez attendre la connexion.'
      });
    }

    // Vérifier qu'aucun envoi n'est en cours
    if (messageSender.isSending()) {
      return res.status(400).json({
        success: false,
        error: 'Un envoi est déjà en cours'
      });
    }

    console.log(`\n🚀 Démarrage de l'envoi de ${contacts.length} message(s)...`);

    // Démarrer l'envoi (asynchrone)
    const sendPromise = messageSender.sendBulkMessages(
      contacts,
      message,
      (progress) => {
        // Cette fonction sera appelée pour chaque progression
        // Pour une implémentation temps réel, utiliser WebSocket ou SSE
        console.log(`Progression: ${progress.current}/${progress.total} (${progress.percentage}%)`);
      }
    );

    // Attendre la fin de l'envoi
    const results = await sendPromise;

    res.json({
      success: true,
      results: results
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'envoi des messages'
    });
  }
});

/**
 * Route pour tester l'envoi d'un message à un seul contact
 * POST /api/send/test
 * Body: { contact: Object, message: string }
 */
router.post('/test', async (req, res) => {
  try {
    if (!messageSender) {
      return res.status(500).json({
        success: false,
        error: 'Service d\'envoi non initialisé'
      });
    }

    const { contact, message } = req.body;

    // Validation
    if (!contact) {
      return res.status(400).json({
        success: false,
        error: 'Le contact est requis'
      });
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Le message est requis'
      });
    }

    // Vérifier que WhatsApp est prêt
    if (!whatsappService.isClientReady()) {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp n\'est pas prêt'
      });
    }

    console.log(`\n🧪 Test d'envoi à ${contact.nom}...`);

    const result = await messageSender.testMessage(contact, message);

    res.json({
      success: result.success,
      result: result
    });

  } catch (error) {
    console.error('Erreur lors du test:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors du test'
    });
  }
});

/**
 * Route pour obtenir la progression actuelle
 * GET /api/send/progress
 */
router.get('/progress', (req, res) => {
  if (!messageSender) {
    return res.status(500).json({
      success: false,
      error: 'Service d\'envoi non initialisé'
    });
  }

  const progress = messageSender.getCurrentProgress();
  const isSending = messageSender.isSending();

  res.json({
    isSending: isSending,
    progress: progress
  });
});

module.exports = { router, initializeServices };

