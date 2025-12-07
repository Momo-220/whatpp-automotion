const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

class WhatsAppService {
  constructor(sessionPath = './whatsapp-session') {
    this.client = null;
    this.isReady = false;
    this.isAuthenticated = false;
    this.qrCode = null;
    this.sessionPath = sessionPath;
  }

  /**
   * Initialise le client WhatsApp
   * @returns {Promise<void>}
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      try {
        this.client = new Client({
          authStrategy: new LocalAuth({
            dataPath: this.sessionPath
          }),
          puppeteer: {
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--disable-gpu',
              '--disable-software-rasterizer',
              '--disable-extensions',
              '--single-process',
              '--disable-blink-features=AutomationControlled',
              '--disable-features=IsolateOrigins,site-per-process',
              '--disable-web-security',
              '--disable-features=VizDisplayCompositor'
            ],
            timeout: 60000, // 60 secondes de timeout
            ignoreHTTPSErrors: true
          },
          webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wppconnect/main/wppconnect/src/lib/wapi.js',
            options: {
              restartOnAuthFail: true,
              cacheEnabled: true,
              cachePath: './.wwebjs_cache/',
              clearCache: false
            }
          },
          // Options supplémentaires pour améliorer la connexion
          takeoverOnConflict: false,
          takeoverTimeoutMs: 0,
          qrMaxRetries: 5, // Nombre de tentatives pour générer le QR code
          restartOnAuthFail: true
        });

        // Événement QR Code
        this.client.on('qr', (qr) => {
          console.log('\n📱 QR CODE POUR CONNEXION WHATSAPP:');
          console.log('Scannez ce QR code avec votre téléphone WhatsApp');
          console.log('⚠️ Le QR code expire dans 20 secondes. Scannez rapidement !\n');
          qrcode.generate(qr, { small: true });
          this.qrCode = qr;
          console.log('✅ QR Code généré et disponible pour scan');
        });

        // Événement authentification réussie
        this.client.on('ready', () => {
          console.log('\n✅ WhatsApp est prêt !');
          this.isReady = true;
          this.isAuthenticated = true;
          this.qrCode = null;
          resolve();
        });

        // Événement authentification
        this.client.on('authenticated', () => {
          console.log('\n✅ Authentification réussie !');
          this.isAuthenticated = true;
        });

        // Événement échec authentification
        this.client.on('auth_failure', (msg) => {
          console.error('\n❌ Échec de l\'authentification:', msg);
          this.isAuthenticated = false;
          reject(new Error('Échec de l\'authentification WhatsApp'));
        });

        // Événement déconnexion
        this.client.on('disconnected', (reason) => {
          console.log('\n⚠️ WhatsApp déconnecté:', reason);
          this.isReady = false;
          this.isAuthenticated = false;
          this.qrCode = null;
        });

        // Événement loading_screen
        this.client.on('loading_screen', (percent, message) => {
          console.log(`\n⏳ Chargement: ${percent}% - ${message}`);
        });

        // Événement change_state
        this.client.on('change_state', (state) => {
          console.log(`\n🔄 Changement d'état: ${state}`);
        });

        // Gestion des erreurs de connexion
        this.client.on('remote_session_saved', () => {
          console.log('\n💾 Session distante sauvegardée');
        });

        // Gestion des erreurs
        this.client.on('error', (error) => {
          console.error('\n❌ Erreur WhatsApp:', error);
          reject(error);
        });

        // Timeout pour l'initialisation (2 minutes)
        const initTimeout = setTimeout(() => {
          if (!this.isReady && !this.qrCode) {
            console.error('\n⏰ Timeout: Le QR code n\'a pas été généré dans les 2 minutes');
            console.log('🔄 Tentative de réinitialisation...');
            this.client.destroy().catch(() => {});
            reject(new Error('Timeout: Impossible de générer le QR code. Réessayez.'));
          }
        }, 120000); // 2 minutes

        // Nettoyer le timeout si on obtient le QR code ou si on est prêt
        this.client.on('qr', () => {
          clearTimeout(initTimeout);
        });

        this.client.on('ready', () => {
          clearTimeout(initTimeout);
        });

        // Initialiser le client
        console.log('🚀 Démarrage de l\'initialisation WhatsApp...');
        this.client.initialize().catch((error) => {
          clearTimeout(initTimeout);
          console.error('❌ Erreur lors de l\'initialisation:', error);
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Vérifie si WhatsApp est prêt
   * @returns {boolean}
   */
  isClientReady() {
    return this.isReady && this.isAuthenticated && this.client !== null;
  }

  /**
   * Obtient le QR code actuel
   * @returns {string|null}
   */
  getQRCode() {
    return this.qrCode;
  }

  /**
   * Envoie un message à un numéro
   * @param {string} phoneNumber - Numéro au format international (+33123456789)
   * @param {string} message - Message à envoyer
   * @returns {Promise<object>} Résultat de l'envoi
   */
  async sendMessage(phoneNumber, message) {
    if (!this.isClientReady()) {
      throw new Error('WhatsApp n\'est pas prêt. Veuillez attendre la connexion.');
    }

    try {
      // Formater le numéro pour WhatsApp (format international)
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
      // Vérifier si le numéro est valide
      if (!this.isValidPhoneNumber(formattedNumber)) {
        throw new Error(`Numéro invalide: ${phoneNumber}`);
      }

      // Convertir au format WhatsApp ID (sans + et avec @c.us)
      const whatsappId = this.convertToWhatsAppId(formattedNumber);
      
      console.log(`Envoi à ${phoneNumber} (WhatsApp ID: ${whatsappId})`);

      // Envoyer le message
      const result = await this.client.sendMessage(whatsappId, message);
      
      return {
        success: true,
        messageId: result.id._serialized,
        phoneNumber: formattedNumber,
        whatsappId: whatsappId,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Erreur lors de l'envoi à ${phoneNumber}:`, error);
      // Message d'erreur plus détaillé
      let errorMessage = error.message;
      if (errorMessage.includes('Evaluation failed')) {
        errorMessage = 'Le numéro n\'est pas valide ou n\'a pas WhatsApp. Vérifiez que le numéro est correct et qu\'il utilise WhatsApp.';
      }
      throw new Error(`Échec de l'envoi: ${errorMessage}`);
    }
  }

  /**
   * Formate un numéro de téléphone pour WhatsApp (format international)
   * @private
   */
  formatPhoneNumber(phoneNumber) {
    // Enlever tous les caractères non numériques sauf le +
    let formatted = phoneNumber.replace(/[^\d+]/g, '');
    
    // S'assurer qu'il commence par +
    if (!formatted.startsWith('+')) {
      // Si commence par 0, remplacer par +33 (France)
      if (formatted.startsWith('0')) {
        formatted = '+33' + formatted.substring(1);
      } else {
        formatted = '+' + formatted;
      }
    }
    
    return formatted;
  }

  /**
   * Convertit un numéro au format WhatsApp ID (numéro@c.us)
   * @private
   */
  convertToWhatsAppId(phoneNumber) {
    // Enlever le + et ajouter @c.us
    const numberOnly = phoneNumber.replace(/^\+/, '');
    return `${numberOnly}@c.us`;
  }

  /**
   * Vérifie si un numéro est valide
   * @private
   */
  isValidPhoneNumber(phoneNumber) {
    // Format: + suivi de 7 à 15 chiffres
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Déconnecte le client WhatsApp
   */
  async disconnect() {
    if (this.client) {
      try {
        await this.client.destroy();
        console.log('✅ WhatsApp déconnecté proprement');
      } catch (error) {
        console.error('⚠️ Erreur lors de la déconnexion:', error);
      }
      this.client = null;
      this.isReady = false;
      this.isAuthenticated = false;
      this.qrCode = null;
    }
  }

  /**
   * Réinitialise complètement le client WhatsApp
   */
  async reset() {
    console.log('🔄 Réinitialisation complète de WhatsApp...');
    await this.disconnect();
    // Attendre un peu avant de réinitialiser
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Réinitialiser les états
    this.isReady = false;
    this.isAuthenticated = false;
    this.qrCode = null;
    // Réinitialiser
    await this.initialize();
  }

  /**
   * Obtient les informations du client
   */
  async getClientInfo() {
    if (!this.isClientReady()) {
      return null;
    }

    try {
      const info = await this.client.info;
      return {
        wid: info.wid,
        pushname: info.pushname,
        platform: info.platform
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des infos:', error);
      return null;
    }
  }
}

module.exports = WhatsAppService;

