const XLSX = require('xlsx');
const fs = require('fs');

class ExcelParser {
  /**
   * Parse un fichier Excel et extrait les contacts
   * @param {string} filePath - Chemin vers le fichier Excel
   * @returns {Promise<Array>} Liste des contacts
   */
  async parseContacts(filePath) {
    try {
      // Vérifier que le fichier existe
      if (!fs.existsSync(filePath)) {
        throw new Error(`Fichier non trouvé: ${filePath}`);
      }

      // Lire le fichier Excel
      const workbook = XLSX.readFile(filePath);
      
      // Prendre la première feuille
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir en JSON
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      // Normaliser les contacts
      const contacts = this.normalizeContacts(data);
      
      // Valider les contacts
      const validContacts = this.validateContacts(contacts);
      
      return validContacts;
    } catch (error) {
      console.error('Erreur lors du parsing Excel:', error);
      throw new Error(`Erreur lors de la lecture du fichier Excel: ${error.message}`);
    }
  }

  /**
   * Normalise les contacts (gère différents formats de colonnes)
   * @private
   */
  normalizeContacts(data) {
    return data.map((row, index) => {
      const contact = {
        index: index + 1,
        nom: null,
        telephone: null,
        email: null,
        rawData: row // Conserver toutes les données originales
      };

      // Chercher le nom (plusieurs variantes possibles)
      contact.nom = row.Nom || row.nom || row.Name || row.name || 
                    row['Nom complet'] || row['Nom Complet'] || 
                    row.Prénom || row.prénom || row.Prenom || 
                    row['Prénom'] || null;

      // Chercher le téléphone (plusieurs variantes possibles)
      contact.telephone = row.Téléphone || row.telephone || row.Telephone ||
                         row.Phone || row.phone || row['Téléphone'] ||
                         row['Numéro'] || row.numero || row.Numero ||
                         row['Numéro de téléphone'] || row['Numéro de Téléphone'] ||
                         null;

      // Chercher l'email (plusieurs variantes possibles)
      contact.email = row.Email || row.email || row['E-mail'] || 
                     row['E-Mail'] || row['Adresse email'] || null;

      // Ajouter toutes les autres colonnes comme propriétés supplémentaires
      Object.keys(row).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (!['nom', 'name', 'téléphone', 'telephone', 'phone', 'email', 'e-mail'].includes(lowerKey)) {
          contact[key] = row[key];
        }
      });

      return contact;
    });
  }

  /**
   * Valide les contacts (vérifie que nom et téléphone sont présents)
   * @private
   */
  validateContacts(contacts) {
    const validContacts = [];
    const invalidContacts = [];

    contacts.forEach(contact => {
      // Vérifier que le nom existe
      if (!contact.nom || contact.nom.toString().trim() === '') {
        invalidContacts.push({
          ...contact,
          error: 'Nom manquant'
        });
        return;
      }

      // Vérifier que le téléphone existe
      if (!contact.telephone || contact.telephone.toString().trim() === '') {
        invalidContacts.push({
          ...contact,
          error: 'Téléphone manquant'
        });
        return;
      }

      // Formater le téléphone
      contact.telephone = this.formatPhoneNumber(contact.telephone.toString());
      
      // Vérifier le format du téléphone
      if (!this.isValidPhoneNumber(contact.telephone)) {
        invalidContacts.push({
          ...contact,
          error: `Format de téléphone invalide: ${contact.telephone}`
        });
        return;
      }

      validContacts.push(contact);
    });

    if (invalidContacts.length > 0) {
      console.warn(`⚠️ ${invalidContacts.length} contact(s) invalide(s) détecté(s)`);
      invalidContacts.forEach(contact => {
        console.warn(`  - Ligne ${contact.index}: ${contact.error}`);
      });
    }

    return {
      valid: validContacts,
      invalid: invalidContacts,
      total: contacts.length
    };
  }

  /**
   * Formate un numéro de téléphone
   * @private
   */
  formatPhoneNumber(phoneNumber) {
    // Enlever tous les caractères non numériques sauf le +
    let formatted = phoneNumber.replace(/[^\d+]/g, '');
    
    // Si commence par 0, remplacer par +33 (France)
    if (formatted.startsWith('0')) {
      formatted = '+33' + formatted.substring(1);
    }
    // Si ne commence pas par +, l'ajouter
    else if (!formatted.startsWith('+')) {
      // Si commence par 33, ajouter le +
      if (formatted.startsWith('33')) {
        formatted = '+' + formatted;
      } else {
        // Par défaut, ajouter +33 pour la France
        formatted = '+33' + formatted;
      }
    }
    
    return formatted;
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
   * Génère un fichier Excel d'exemple
   * @param {string} outputPath - Chemin de sortie
   */
  generateExampleFile(outputPath) {
    const exampleData = [
      {
        'Nom': 'Jean Dupont',
        'Téléphone': '+33123456789',
        'Email': 'jean.dupont@email.com'
      },
      {
        'Nom': 'Marie Martin',
        'Téléphone': '+33987654321',
        'Email': 'marie.martin@email.com'
      },
      {
        'Nom': 'Pierre Durand',
        'Téléphone': '+33612345678',
        'Email': 'pierre.durand@email.com'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(exampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');
    XLSX.writeFile(workbook, outputPath);
    
    console.log(`✅ Fichier exemple créé: ${outputPath}`);
  }
}

module.exports = ExcelParser;



