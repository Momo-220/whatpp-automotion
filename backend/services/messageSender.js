const WhatsAppService = require('./whatsappService');

class MessageSender {
  constructor(whatsappService, options = {}) {
    this.whatsapp = whatsappService;
    this.delay = options.messageDelay || 500; // Délai par défaut: 0.5 seconde (très rapide)
    this.batchSize = options.batchSize || 5; // Envoyer 5 messages en parallèle
    this.isRunning = false;
    this.currentProgress = null;
  }

  /**
   * Envoie le même message à tous les contacts
   * @param {Array} contacts - Liste des contacts valides
   * @param {string} message - Message à envoyer
   * @param {Function} onProgress - Callback de progression
   * @returns {Promise<object>} Résultats de l'envoi
   */
  async sendBulkMessages(contacts, message, onProgress) {
    if (this.isRunning) {
      throw new Error('Un envoi est déjà en cours');
    }

    if (!this.whatsapp.isClientReady()) {
      throw new Error('WhatsApp n\'est pas prêt. Veuillez attendre la connexion.');
    }

    if (!contacts || contacts.length === 0) {
      throw new Error('Aucun contact à traiter');
    }

    if (!message || message.trim() === '') {
      throw new Error('Le message ne peut pas être vide');
    }

    this.isRunning = true;
    const results = {
      success: [],
      failed: [],
      total: contacts.length,
      startTime: new Date(),
      endTime: null
    };

    try {
      // Envoi par batch pour optimiser la vitesse
      for (let i = 0; i < contacts.length; i += this.batchSize) {
        const batch = contacts.slice(i, Math.min(i + this.batchSize, contacts.length));
        
        // Envoyer les messages du batch en parallèle
        const batchPromises = batch.map(async (contact, batchIndex) => {
          const globalIndex = i + batchIndex;
          try {
            console.log(`📤 Envoi à ${contact.nom} (${contact.telephone})...`);
            
            // Envoyer le message tel quel via WhatsApp
            const sendResult = await this.whatsapp.sendMessage(
              contact.telephone,
              message
            );

            results.success.push({
              contact: contact.nom,
              telephone: contact.telephone,
              message: message,
              messageId: sendResult.messageId,
              timestamp: sendResult.timestamp
            });

            console.log(`✅ Message envoyé avec succès à ${contact.nom}`);

            // Callback de progression
            if (onProgress) {
              this.currentProgress = {
                current: globalIndex + 1,
                total: contacts.length,
                contact: contact.nom,
                telephone: contact.telephone,
                status: 'success',
                percentage: Math.round(((globalIndex + 1) / contacts.length) * 100)
              };
              onProgress(this.currentProgress);
            }

            return { success: true, contact };

          } catch (error) {
            console.error(`❌ Erreur pour ${contact.nom}:`, error.message);
            
            results.failed.push({
              contact: contact.nom,
              telephone: contact.telephone,
              error: error.message,
              timestamp: new Date()
            });

            if (onProgress) {
              this.currentProgress = {
                current: globalIndex + 1,
                total: contacts.length,
                contact: contact.nom,
                telephone: contact.telephone,
                status: 'failed',
                error: error.message,
                percentage: Math.round(((globalIndex + 1) / contacts.length) * 100)
              };
              onProgress(this.currentProgress);
            }

            return { success: false, contact, error };
          }
        });

        // Attendre que tous les messages du batch soient envoyés
        await Promise.all(batchPromises);

        // Délai entre les batches (éviter le spam et le bannissement)
        if (i + this.batchSize < contacts.length) {
          console.log(`⏳ Attente de ${this.delay}ms avant le prochain batch...`);
          await this.delayMs(this.delay);
        }
      }

      results.endTime = new Date();
      const duration = (results.endTime - results.startTime) / 1000; // en secondes
      results.duration = duration;

      console.log(`\n📊 Résumé de l'envoi:`);
      console.log(`   ✅ Succès: ${results.success.length}`);
      console.log(`   ❌ Échecs: ${results.failed.length}`);
      console.log(`   ⏱️  Durée: ${duration.toFixed(2)} secondes`);

      return results;

    } finally {
      this.isRunning = false;
      this.currentProgress = null;
    }
  }

  /**
   * Obtient la progression actuelle
   * @returns {object|null}
   */
  getCurrentProgress() {
    return this.currentProgress;
  }

  /**
   * Vérifie si un envoi est en cours
   * @returns {boolean}
   */
  isSending() {
    return this.isRunning;
  }

  /**
   * Délai en millisecondes
   * @private
   */
  delayMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Teste l'envoi d'un message à un seul contact
   * @param {object} contact - Contact de test
   * @param {string} message - Message à envoyer
   * @returns {Promise<object>} Résultat du test
   */
  async testMessage(contact, message) {
    try {
      // Envoyer le message tel quel
      const sendResult = await this.whatsapp.sendMessage(
        contact.telephone,
        message
      );

      return {
        success: true,
        contact: contact.nom,
        telephone: contact.telephone,
        message: message,
        messageId: sendResult.messageId,
        timestamp: sendResult.timestamp
      };
    } catch (error) {
      return {
        success: false,
        contact: contact.nom,
        telephone: contact.telephone,
        error: error.message
      };
    }
  }
}

module.exports = MessageSender;

