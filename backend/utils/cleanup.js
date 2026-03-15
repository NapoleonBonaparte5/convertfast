// =====================================================
// UTILS: Limpieza automática de archivos expirados
// =====================================================

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const EXPIRY_MINUTES = parseInt(process.env.FILE_EXPIRY_MINUTES || '60');

async function cleanupExpiredFiles(uploadDir, outputDir) {
  let deletedCount = 0;
  const now = Date.now();
  const expiryMs = EXPIRY_MINUTES * 60 * 1000;

  for (const dir of [uploadDir, outputDir]) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        const age = now - stat.mtimeMs;

        if (age > expiryMs) {
          fs.unlinkSync(filePath);
          deletedCount++;
          logger.debug(`Archivo expirado eliminado: ${file}`);
        }
      } catch (err) {
        // El archivo puede haber sido eliminado entre el listado y el stat
        logger.debug(`No se pudo eliminar ${file}: ${err.message}`);
      }
    }
  }

  return deletedCount;
}

/**
 * Borra un archivo específico inmediatamente tras descarga
 */
function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug(`Archivo eliminado: ${filePath}`);
    }
  } catch (err) {
    logger.warn(`Error al eliminar ${filePath}: ${err.message}`);
  }
}

module.exports = { cleanupExpiredFiles, deleteFile };
