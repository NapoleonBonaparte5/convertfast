import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { File, ArrowRight, Download, RotateCcw, Check, AlertCircle, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

// Mapa de conversiones disponibles por extensión de entrada
const CONVERSION_MAP = {
  // Documentos
  pdf:  ['docx', 'txt', 'jpg', 'png'],
  docx: ['pdf', 'txt'],
  txt:  ['pdf', 'html'],
  html: ['pdf', 'txt'],
  xlsx: ['csv'],
  csv:  ['xlsx', 'json'],
  json: ['csv'],
  md:   ['html', 'pdf'],
  // Imágenes
  jpg:  ['png', 'webp', 'pdf'],
  jpeg: ['png', 'webp', 'pdf'],
  png:  ['jpg', 'webp', 'pdf'],
  webp: ['jpg', 'png'],
  heic: ['jpg', 'png'],
  bmp:  ['jpg', 'png'],
  tiff: ['jpg', 'png'],
  tif:  ['jpg', 'png'],
  svg:  ['png'],
  gif:  ['mp4'],
  // Audio
  mp3:  ['wav', 'ogg'],
  wav:  ['mp3', 'ogg'],
  ogg:  ['mp3', 'wav'],
  flac: ['mp3', 'wav'],
  aac:  ['mp3', 'wav'],
  m4a:  ['mp3', 'wav'],
  // Video
  mp4:  ['mp3', 'wav', 'webm', 'avi'],
  avi:  ['mp4', 'mp3'],
  mov:  ['mp4', 'mp3'],
  mkv:  ['mp4', 'mp3'],
  webm: ['mp4'],
};

const FORMAT_LABELS = {
  pdf: 'PDF', docx: 'Word (DOCX)', txt: 'Texto (TXT)',
  html: 'HTML', xlsx: 'Excel (XLSX)', csv: 'CSV',
  json: 'JSON', md: 'Markdown', jpg: 'JPG', jpeg: 'JPG',
  png: 'PNG', webp: 'WebP', heic: 'HEIC', bmp: 'BMP',
  gif: 'GIF', svg: 'SVG', tiff: 'TIFF', tif: 'TIFF',
  mp3: 'MP3', wav: 'WAV', ogg: 'OGG', flac: 'FLAC',
  aac: 'AAC', m4a: 'M4A', mp4: 'MP4', avi: 'AVI',
  mov: 'MOV', mkv: 'MKV', webm: 'WebM',
};

const QUALITY_OPTIONS = [
  { value: 'high',   label: 'Alta',   desc: 'Mejor calidad' },
  { value: 'medium', label: 'Media',  desc: 'Equilibrado' },
  { value: 'low',    label: 'Baja',   desc: 'Archivo más pequeño' },
];

const ICON_COLORS = {
  document: 'text-blue-400',
  image:    'text-purple-400',
  audio:    'text-green-400',
  video:    'text-orange-400',
};

export default function ConversionPanel({ file, fileId, onReset }) {
  const [selectedFormat, setSelectedFormat] = useState('');
  const [quality, setQuality] = useState('medium');
  const [compress, setCompress] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | converting | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);

  const availableFormats = CONVERSION_MAP[file.ext?.toLowerCase()] || [];

  useEffect(() => {
    if (availableFormats.length > 0) {
      setSelectedFormat(availableFormats[0]);
    }
  }, [file.ext]);

  // Timer
  useEffect(() => {
    let timer;
    if (status === 'converting') {
      setElapsed(0);
      timer = setInterval(() => setElapsed(e => e + 0.1), 100);
    }
    return () => clearInterval(timer);
  }, [status]);

  const handleConvert = async () => {
    if (!selectedFormat) {
      toast.error('Selecciona un formato de salida');
      return;
    }

    setStatus('converting');
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          outputFormat: selectedFormat,
          options: { quality, compress },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en la conversión');

      setResult(data);
      setStatus('done');
      toast.success(`¡Convertido en ${(data.conversionTime / 1000).toFixed(1)}s!`);
    } catch (err) {
      setStatus('error');
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleDownload = () => {
    if (!result?.downloadUrl) return;
    const a = document.createElement('a');
    a.href = result.downloadUrl;
    a.download = result.outputName;
    a.click();
    toast.success('Descarga iniciada');
  };

  const showQuality = ['audio', 'video', 'image'].includes(file.category);

  return (
    <div className="card-glass p-6 space-y-6">
      {/* File info */}
      <div className="flex items-center gap-4 p-4 bg-dark-surface rounded-xl border border-dark-border">
        <div className={`w-10 h-10 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center`}>
          <File size={18} className={ICON_COLORS[file.category] || 'text-gray-400'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{file.name}</p>
          <p className="text-gray-500 text-xs">{file.size} · <span className="font-mono text-gray-500">.{file.ext?.toUpperCase()}</span></p>
        </div>
        <button
          onClick={onReset}
          className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all"
          title="Cambiar archivo"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {availableFormats.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-sm">
          <AlertCircle size={20} className="mx-auto mb-2 text-yellow-500" />
          Formato <span className="font-mono">.{file.ext}</span> no soportado aún.
          <br />Prueba con PDF, JPG, PNG, MP4, MP3 o DOCX.
        </div>
      ) : (
        <>
          {/* Format selector */}
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 block">
              Convertir a
            </label>
            <div className="flex flex-wrap gap-2">
              {availableFormats.map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`format-badge ${selectedFormat === fmt ? 'selected' : ''}`}
                  disabled={status === 'converting'}
                >
                  .{fmt.toUpperCase()}
                  {FORMAT_LABELS[fmt] && fmt !== FORMAT_LABELS[fmt].toLowerCase() && (
                    <span className="ml-1 text-gray-600 font-sans not-italic text-xs hidden sm:inline">
                      {FORMAT_LABELS[fmt].includes('(') ? FORMAT_LABELS[fmt].match(/\((.+)\)/)?.[1] || '' : ''}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {/* Quality */}
            {showQuality && (
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                  Calidad
                </label>
                <div className="flex gap-1.5">
                  {QUALITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setQuality(opt.value)}
                      disabled={status === 'converting'}
                      className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium border transition-all
                        ${quality === opt.value
                          ? 'bg-accent/10 border-accent/30 text-accent'
                          : 'bg-dark-surface border-dark-border text-gray-400 hover:border-gray-600'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Compress */}
            <div className={showQuality ? '' : 'col-span-2'}>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                Opciones
              </label>
              <button
                onClick={() => setCompress(!compress)}
                disabled={status === 'converting'}
                className={`w-full flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm border transition-all
                  ${compress
                    ? 'bg-accent/10 border-accent/30 text-accent'
                    : 'bg-dark-surface border-dark-border text-gray-400 hover:border-gray-600'
                  }`}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all
                  ${compress ? 'bg-accent border-accent' : 'border-gray-600'}`}>
                  {compress && <Check size={10} className="text-dark-bg" />}
                </div>
                Comprimir salida
              </button>
            </div>
          </div>

          {/* Convert button / Status */}
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.button
                key="convert"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleConvert}
                className="btn-primary w-full justify-center py-4 text-base"
              >
                <Zap size={18} />
                Convertir a .{selectedFormat?.toUpperCase()}
                <ArrowRight size={16} />
              </motion.button>
            )}

            {status === 'converting' && (
              <motion.div
                key="converting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-4"
              >
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                <div className="text-center">
                  <p className="text-white font-medium text-sm">Convirtiendo...</p>
                  <p className="text-gray-500 text-xs mt-1 font-mono">{elapsed.toFixed(1)}s</p>
                </div>
                <div className="w-full bg-dark-surface rounded-full h-1 overflow-hidden">
                  <motion.div
                    className="progress-bar h-full"
                    animate={{ width: ['10%', '85%'] }}
                    transition={{ duration: 12, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            )}

            {status === 'done' && result && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {/* Result info */}
                <div className="flex items-center gap-3 p-4 bg-green-400/5 border border-green-400/20 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-green-400/10 border border-green-400/20 flex items-center justify-center flex-shrink-0">
                    <Check size={18} className="text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-green-400 font-medium text-sm">¡Conversión completada!</p>
                    <p className="text-gray-500 text-xs truncate">
                      {result.outputName} · {result.sizeFormatted}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock size={11} />
                    {(result.conversionTime / 1000).toFixed(1)}s
                  </div>
                </div>

                {/* Expiry notice */}
                <p className="text-gray-600 text-xs text-center">
                  ⏱ El archivo se eliminará en 1 hora. Descárgalo ahora.
                </p>

                {/* Download button */}
                <button onClick={handleDownload} className="btn-primary w-full justify-center py-4 text-base">
                  <Download size={18} />
                  Descargar {result.outputName}
                </button>

                {/* Convert another */}
                <button
                  onClick={() => { setStatus('idle'); setResult(null); }}
                  className="btn-ghost w-full justify-center text-sm"
                >
                  <RotateCcw size={14} />
                  Convertir a otro formato
                </button>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-start gap-3 p-4 bg-red-400/5 border border-red-400/20 rounded-xl">
                  <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium text-sm">Error al convertir</p>
                    <p className="text-gray-500 text-xs mt-1">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => setStatus('idle')}
                  className="btn-ghost w-full justify-center text-sm"
                >
                  <RotateCcw size={14} />
                  Intentar de nuevo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
