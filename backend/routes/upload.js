const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ExcelParser = require('../services/excelParser');

const router = express.Router();
const excelParser = new ExcelParser();

// Configuration de multer pour l'upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `contacts-${uniqueSuffix}${ext}`);
  }
});

// Filtre pour n'accepter que les fichiers Excel
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers Excel (.xlsx, .xls) et CSV sont acceptés'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB max
  }
});

/**
 * Route pour uploader un fichier Excel
 * POST /api/upload
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier fourni'
      });
    }

    console.log(`📁 Fichier reçu: ${req.file.filename}`);

    // Parser le fichier Excel
    const result = await excelParser.parseContacts(req.file.path);

    // Supprimer le fichier après traitement (optionnel)
    // fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      filename: req.file.originalname,
      filepath: req.file.path,
      contacts: {
        valid: result.valid,
        invalid: result.invalid,
        total: result.total,
        validCount: result.valid.length,
        invalidCount: result.invalid.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    
    // Supprimer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors du traitement du fichier'
    });
  }
});

/**
 * Route pour générer un fichier Excel d'exemple
 * GET /api/upload/example
 */
router.get('/example', (req, res) => {
  try {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const examplePath = path.join(uploadDir, 'exemple-contacts.xlsx');

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Générer le fichier exemple
    excelParser.generateExampleFile(examplePath);

    res.json({
      success: true,
      message: 'Fichier exemple créé avec succès',
      filepath: examplePath,
      downloadUrl: `/api/upload/download-example`
    });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'exemple:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Route pour télécharger le fichier exemple
 * GET /api/upload/download-example
 */
router.get('/download-example', (req, res) => {
  try {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const examplePath = path.join(uploadDir, 'exemple-contacts.xlsx');

    if (!fs.existsSync(examplePath)) {
      // Générer le fichier s'il n'existe pas
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      excelParser.generateExampleFile(examplePath);
    }

    res.download(examplePath, 'exemple-contacts.xlsx', (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement:', err);
        res.status(500).json({
          success: false,
          error: 'Erreur lors du téléchargement du fichier'
        });
      }
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;



