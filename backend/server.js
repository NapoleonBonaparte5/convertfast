require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

const logger = require('./utils/logger');
const convertRoutes = require('./routes/convert');
const uploadRoutes = require('./routes/upload');
const { cleanupExpiredFiles } = require('./utils/cleanup');

const app = express();
const PORT = process.env.PORT || 3001;

// MUY IMPORTANTE para Render y proxies
app.set('trust proxy', 1);

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/uploads';
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/tmp/outputs';

[UPLOAD_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Directorio creado: ${dir}`);
  }
});

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const conversionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Límite de conversiones alcanzado. Espera 1 minuto.' },
});

app.use(generalLimiter);
app.use(compression());
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api/upload', conversionLimiter, uploadRoutes);
app.use('/api/convert', conversionLimiter, convertRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

app.get('/api/formats', (req, res) => {
  const formats = require('./utils/formats');
  res.json(formats);
});

app.get('/api/download/:fileId', (req, res) => {
  const { fileId } = req.params;

  if (!/^[a-zA-Z0-9._-]+$/.test(fileId)) {
    return res.status(400).json({ error: 'ID de archivo inválido' });
  }

  const outputPath = path.join(OUTPUT_DIR, fileId);

  if (!fs.existsSync(outputPath)) {
    return res.status(404).json({ error: 'Archivo no encontrado o expirado' });
  }

  const metaPath = `${outputPath}.meta.json`;
  let filename = fileId;
  let mimetype = 'application/octet-stream';

  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      filename = meta.outputName || fileId;
      mimetype = meta.mimeType || mimetype;
    } catch(e) {
      logger.warn(`No se pudo leer metadata para ${fileId}`);
    }
  }

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', mimetype);

  const stream = fs.createReadStream(outputPath);
  stream.pipe(res);

  stream.on('error', (err) => {
    logger.error(`Error al servir archivo ${fileId}: ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al descargar el archivo' });
    }
  });
});

cron.schedule('*/30 * * * *', async () => {
  logger.info('Ejecutando limpieza de archivos expirados...');
  try {
    const deleted = await cleanupExpiredFiles(UPLOAD_DIR, OUTPUT_DIR);
    logger.info(`Limpieza completada: ${deleted} archivos eliminados`);
  } catch(err) {
    logger.error(`Error en limpieza: ${err.message}`);
  }
});

app.use((err, req, res, next) => {
  logger.error(`Error no manejado: ${err.message}`);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: `Archivo demasiado grande. Máximo ${process.env.MAX_FILE_SIZE_MB || 100}MB.`,
    });
  }
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  logger.info(`🚀 ConverFast Backend corriendo en puerto ${PORT}`);
  logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

process.on('uncaughtException', (err) => {
  logger.error('Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Promesa rechazada no manejada:', reason);
});

module.exports = app;
