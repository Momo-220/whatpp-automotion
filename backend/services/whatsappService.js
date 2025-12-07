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
              '--single-process'
            ]
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
          }
        });

        // Événement QR Code
        this.client.on('qr', (qr) => {
          console.log('\n📱 QR CODE POUR CONNEXION WHATSAPP:');
          console.log('Scannez ce QR code avec votre téléphone WhatsApp\n');
          qrcode.generate(qr, { small: true });
          this.qrCode = qr;
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
        });

        // Initialiser le client
        this.client.initialize().catch(reject);

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
      await this.client.destroy();
      this.isReady = false;
      this.isAuthenticated = false;
      console.log('WhatsApp déconnecté');
    }
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

