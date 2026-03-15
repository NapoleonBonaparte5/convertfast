// =====================================================
// RUTA: /api/convert
// Orquesta todas las conversiones de archivos
// =====================================================

const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const logger = require('../utils/logger');
const converters = require('../utils/converters');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './tmp/uploads';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './tmp/outputs';

// Mapa de conversiones soportadas
const SUPPORTED_CONVERSIONS = {
  // PDF
  'pdf→docx': converters.pdfToDocx,
  'pdf→txt':  converters.pdfToTxt,
  'pdf→jpg':  converters.pdfToJpg,
  'pdf→png':  converters.pdfToPng,
  'docx→pdf': converters.docxToPdf,
  'txt→pdf':  converters.txtToPdf,
  'html→pdf': converters.htmlToPdf,
  // Imágenes
  'jpg→png':  converters.imageConvert,
  'jpg→webp': converters.imageConvert,
  'jpg→pdf':  converters.imageToPdf,
  'png→jpg':  converters.imageConvert,
  'png→webp': converters.imageConvert,
  'png→pdf':  converters.imageToPdf,
  'webp→jpg': converters.imageConvert,
  'webp→png': converters.imageConvert,
  'heic→jpg': converters.imageConvert,
  'heic→png': converters.imageConvert,
  'svg→png':  converters.imageConvert,
  'bmp→jpg':  converters.imageConvert,
  'bmp→png':  converters.imageConvert,
  'tiff→jpg': converters.imageConvert,
  'tiff→png': converters.imageConvert,
  'gif→mp4':  converters.gifToMp4,
  // Excel/Datos
  'xlsx→csv': converters.xlsxToCsv,
  'csv→xlsx': converters.csvToXlsx,
  'json→csv': converters.jsonToCsv,
  'csv→json': converters.csvToJson,
  // Audio
  'mp3→wav':  converters.audioConvert,
  'wav→mp3':  converters.audioConvert,
  'mp4→mp3':  converters.videoToAudio,
  'mp4→wav':  converters.videoToAudio,
  'ogg→mp3':  converters.audioConvert,
  'flac→mp3': converters.audioConvert,
  'aac→mp3':  converters.audioConvert,
  'm4a→mp3':  converters.audioConvert,
  // Video
  'mp4→webm': converters.videoConvert,
  'avi→mp4':  converters.videoConvert,
  'mov→mp4':  converters.videoConvert,
  'mkv→mp4':  converters.videoConvert,
  'webm→mp4': converters.videoConvert,
  // Texto
  'txt→html': converters.txtToHtml,
  'html→txt': converters.htmlToTxt,
  'md→html':  converters.mdToHtml,
  'md→pdf':   converters.mdToPdf,
  // Archivos
  'zip→files': converters.extractZip,
};

// POST /api/convert
router.post('/', async (req, res) => {
  const { fileId, outputFormat, options = {} } = req.body;

  // Validación de entrada
  if (!fileId || !outputFormat) {
    return res.status(400).json({ error: 'fileId y outputFormat son requeridos' });
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return res.status(400).json({ error: 'fileId inválido' });
  }

  if (!/^[a-z0-9]+$/.test(outputFormat)) {
    return res.status(400).json({ error: 'Formato de salida inválido' });
  }

  try {
    // Buscar archivo original
    const metaPath = path.join(UPLOAD_DIR, `${fileId}.meta.json`);
    
    if (!fs.existsSync(metaPath)) {
      return res.status(404).json({ error: 'Archivo no encontrado o expirado' });
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const inputExt = meta.ext.toLowerCase();
    const outputExt = outputFormat.toLowerCase();

    // Verificar que la conversión sea soportada
    const conversionKey = `${inputExt}→${outputExt}`;
    
    if (!SUPPORTED_CONVERSIONS[conversionKey]) {
      return res.status(400).json({
        error: `Conversión ${inputExt.toUpperCase()} → ${outputExt.toUpperCase()} no soportada`,
        supported: Object.keys(SUPPORTED_CONVERSIONS),
      });
    }

    // Evitar conversión innecesaria
    if (inputExt === outputExt) {
      return res.status(400).json({ error: 'El formato de entrada y salida son iguales' });
    }

    // Rutas de archivos
    const inputPath = path.join(UPLOAD_DIR, meta.filename);
    
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: 'Archivo de origen no encontrado' });
    }

    const outputId = uuidv4();
    const outputFilename = `${outputId}.${outputExt}`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);
    
    const originalBaseName = path.basename(meta.originalName, `.${inputExt}`);
    const outputName = `${originalBaseName}_convertido.${outputExt}`;

    logger.info(`Iniciando conversión: ${meta.originalName} → ${outputExt}`);
    const startTime = Date.now();

    // Ejecutar conversión
    const converter = SUPPORTED_CONVERSIONS[conversionKey];
    await converter(inputPath, outputPath, { ...options, inputExt, outputExt });

    const duration = Date.now() - startTime;

    if (!fs.existsSync(outputPath)) {
      throw new Error('La conversión no generó un archivo de salida');
    }

    const outputStats = fs.statSync(outputPath);
    const { getMimeType } = require('../utils/fileTypes');

    // Guardar metadata del archivo convertido
    const outputMeta = {
      id: outputId,
      originalFileId: fileId,
      outputName,
      outputFilename,
      ext: outputExt,
      mimeType: getMimeType(outputExt),
      size: outputStats.size,
      conversionTime: duration,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${outputFilename}.meta.json`),
      JSON.stringify(outputMeta, null, 2)
    );

    logger.info(`Conversión completada en ${duration}ms: ${outputName}`);

    res.json({
      success: true,
      outputId: outputFilename,
      outputName,
      size: outputStats.size,
      sizeFormatted: formatFileSize(outputStats.size),
      conversionTime: duration,
      downloadUrl: `/api/download/${outputFilename}`,
      expiresAt: outputMeta.expiresAt,
    });

  } catch (err) {
    logger.error(`Error en conversión: ${err.message}`, { stack: err.stack });
    res.status(500).json({
      error: `Error al convertir: ${err.message || 'Error desconocido'}`,
    });
  }
});

// GET /api/convert/supported - Lista todas las conversiones soportadas
router.get('/supported', (req, res) => {
  const supported = Object.keys(SUPPORTED_CONVERSIONS).map(key => {
    const [from, to] = key.split('→');
    return { from, to, key };
  });
  
  res.json({ conversions: supported, total: supported.length });
});

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

module.exports = router;
