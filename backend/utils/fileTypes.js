// =====================================================
// UTILS: Tipos de Archivo y MIME types
// =====================================================

const MIME_TYPES = {
  // Documentos
  pdf:  'application/pdf',
  doc:  'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls:  'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt:  'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt:  'text/plain',
  rtf:  'application/rtf',
  html: 'text/html',
  htm:  'text/html',
  md:   'text/markdown',
  csv:  'text/csv',
  json: 'application/json',
  xml:  'application/xml',
  epub: 'application/epub+zip',
  // Imágenes
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  gif:  'image/gif',
  webp: 'image/webp',
  svg:  'image/svg+xml',
  bmp:  'image/bmp',
  tiff: 'image/tiff',
  tif:  'image/tiff',
  heic: 'image/heic',
  ico:  'image/x-icon',
  // Audio
  mp3:  'audio/mpeg',
  wav:  'audio/wav',
  ogg:  'audio/ogg',
  flac: 'audio/flac',
  aac:  'audio/aac',
  m4a:  'audio/mp4',
  opus: 'audio/ogg',
  // Video
  mp4:  'video/mp4',
  avi:  'video/x-msvideo',
  mov:  'video/quicktime',
  mkv:  'video/x-matroska',
  webm: 'video/webm',
  flv:  'video/x-flv',
  wmv:  'video/x-ms-wmv',
  // Archivos
  zip:  'application/zip',
  '7z': 'application/x-7z-compressed',
  tar:  'application/x-tar',
  gz:   'application/gzip',
  rar:  'application/vnd.rar',
};

function getMimeType(ext) {
  return MIME_TYPES[ext.toLowerCase()] || 'application/octet-stream';
}

function getFileType(ext) {
  const e = ext.toLowerCase();
  if (['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','rtf','html','htm','md','csv','json','xml','epub'].includes(e)) return 'document';
  if (['jpg','jpeg','png','gif','webp','svg','bmp','tiff','tif','heic','ico'].includes(e)) return 'image';
  if (['mp3','wav','ogg','flac','aac','m4a','opus','wma'].includes(e)) return 'audio';
  if (['mp4','avi','mov','mkv','webm','flv','wmv','m4v','3gp'].includes(e)) return 'video';
  if (['zip','7z','tar','gz','rar'].includes(e)) return 'archive';
  return 'other';
}

module.exports = { getMimeType, getFileType };
