// =====================================================
// RUTA: /api/upload
// Maneja la subida de archivos con validación completa
// =====================================================

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const logger = require('../utils/logger');
const { getFileType, getMimeType } = require('../utils/fileTypes');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './tmp/uploads';
const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '100');

// Extensiones permitidas (whitelist de seguridad)
const ALLOWED_EXTENSIONS = new Set([
  // Documentos
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp',
  'html', 'htm', 'md', 'csv', 'json', 'xml', 'epub',
  // Imágenes
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif', 'heic', 'ico',
  // Audio
  'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'opus',
  // Video
  'mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v', '3gp',
  // Archivos
  'zip', '7z', 'tar', 'gz', 'rar',
]);

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const id = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    cb(null, `${id}.${ext}`);
  },
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error(`Tipo de archivo no permitido: .${ext}`), false);
  }
  
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter,
});

// POST /api/upload - Subida de un archivo
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    const { filename, originalname, size, path: filePath } = req.file;
    const ext = path.extname(originalname).toLowerCase().replace('.', '');
    const fileId = filename.replace(`.${ext}`, '');

    // Guardar metadata del archivo subido
    const meta = {
      id: fileId,
      originalName: originalname,
      filename,
      ext,
      size,
      mimeType: getMimeType(ext),
      uploadedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora
    };

    fs.writeFileSync(
      path.join(UPLOAD_DIR, `${fileId}.meta.json`),
      JSON.stringify(meta, null, 2)
    );

    logger.info(`Archivo subido: ${originalname} (${(size / 1024 / 1024).toFixed(2)}MB)`);

    res.json({
      success: true,
      fileId,
      filename: originalname,
      size,
      ext,
      sizeFormatted: formatFileSize(size),
      expiresAt: meta.expiresAt,
    });

  } catch (err) {
    logger.error(`Error en upload: ${err.message}`);
    
    // Limpiar archivo si se subió parcialmente
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: err.message || 'Error al subir el archivo' });
  }
});

// POST /api/upload/batch - Subida múltiple (hasta 5 archivos)
router.post('/batch', upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se recibieron archivos' });
    }

    const results = req.files.map(file => {
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      const fileId = file.filename.replace(`.${ext}`, '');
      
      const meta = {
        id: fileId,
        originalName: file.originalname,
        filename: file.filename,
        ext,
        size: file.size,
        mimeType: getMimeType(ext),
        uploadedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };

      fs.writeFileSync(
        path.join(UPLOAD_DIR, `${fileId}.meta.json`),
        JSON.stringify(meta, null, 2)
      );

      return {
        fileId,
        filename: file.originalname,
        size: file.size,
        ext,
        sizeFormatted: formatFileSize(file.size),
      };
    });

    res.json({ success: true, files: results });

  } catch (err) {
    logger.error(`Error en batch upload: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

module.exports = router;
