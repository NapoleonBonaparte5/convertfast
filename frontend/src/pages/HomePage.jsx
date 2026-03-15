import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Image, Music, Video, ArrowRight, Shield, Zap, Lock, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import ConversionPanel from '../components/ConversionPanel.jsx';
import StatsBar from '../components/StatsBar.jsx';
import FormatGrid from '../components/FormatGrid.jsx';

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const CATEGORY_FORMATS = {
  document: {
    label: 'Documentos',
    icon: FileText,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    formats: ['PDF', 'DOCX', 'TXT', 'XLSX', 'CSV', 'HTML', 'MD'],
  },
  image: {
    label: 'Imágenes',
    icon: Image,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    formats: ['JPG', 'PNG', 'WEBP', 'SVG', 'HEIC', 'BMP', 'GIF'],
  },
  audio: {
    label: 'Audio',
    icon: Music,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
    formats: ['MP3', 'WAV', 'OGG', 'FLAC', 'AAC', 'M4A'],
  },
  video: {
    label: 'Video',
    icon: Video,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    formats: ['MP4', 'AVI', 'MOV', 'MKV', 'WEBM'],
  },
};

function detectCategory(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['pdf','doc','docx','xls','xlsx','txt','rtf','html','htm','md','csv','json','epub','odt'].includes(ext)) return 'document';
  if (['jpg','jpeg','png','gif','webp','svg','bmp','tiff','heic','ico'].includes(ext)) return 'image';
  if (['mp3','wav','ogg','flac','aac','m4a','opus','wma'].includes(ext)) return 'audio';
  if (['mp4','avi','mov','mkv','webm','flv','wmv'].includes(ext)) return 'video';
  return 'document';
}

export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'file-too-large') {
        toast.error(`Archivo demasiado grande. Máximo ${MAX_FILE_SIZE_MB}MB.`);
      } else {
        toast.error(`Archivo no aceptado: ${err.message}`);
      }
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al subir el archivo');

      setFileId(data.fileId);
      setUploadedFile({
        name: file.name,
        size: data.sizeFormatted,
        ext: data.ext,
        category: detectCategory(file.name),
      });
      setActiveCategory(detectCategory(file.name));
      toast.success('Archivo subido correctamente');
    } catch (err) {
      toast.error(err.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: uploading,
  });

  const handleReset = () => {
    setUploadedFile(null);
    setFileId(null);
    setActiveCategory(null);
  };

  return (
    <div className="relative min-h-screen">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Hero section */}
      <section className="relative max-w-6xl mx-auto px-4 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/5 border border-accent/20 text-accent text-xs font-medium mb-6">
            <Zap size={12} />
            <span>Gratis · Sin registro · Seguro</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
            Convierte cualquier archivo
            <br />
            <span className="text-accent">en segundos</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            PDF, Word, imágenes, audio y video. Más de 50 formatos.
            Tus archivos se eliminan automáticamente tras 1 hora.
          </p>
        </motion.div>

        {/* Main converter */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <AnimatePresence mode="wait">
            {!uploadedFile ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                    transition-all duration-300 group
                    ${isDragActive
                      ? 'dropzone-active border-accent'
                      : 'border-dark-border hover:border-accent/40 hover:bg-accent/2'
                    }
                    ${uploading ? 'pointer-events-none opacity-60' : ''}
                  `}
                >
                  <input {...getInputProps()} aria-label="Subir archivo para convertir" />

                  {/* Corner decorations */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-accent/30 rounded-tl-lg" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-accent/30 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-accent/30 rounded-bl-lg" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-accent/30 rounded-br-lg" />

                  {uploading ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                      <p className="text-gray-400 font-medium">Subiendo archivo...</p>
                    </div>
                  ) : (
                    <>
                      <motion.div
                        animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                        className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center
                          ${isDragActive ? 'bg-accent/20 border-accent' : 'bg-dark-surface border-dark-border'}
                          border transition-all duration-300 group-hover:bg-accent/10 group-hover:border-accent/30`}
                      >
                        <Upload size={26} className={isDragActive ? 'text-accent' : 'text-gray-500 group-hover:text-accent'} />
                      </motion.div>

                      <p className="text-white font-semibold text-xl mb-2">
                        {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí'}
                      </p>
                      <p className="text-gray-500 text-sm mb-5">
                        o <span className="text-accent font-medium cursor-pointer hover:underline">busca en tu dispositivo</span>
                      </p>

                      <div className="flex flex-wrap justify-center gap-2">
                        {['PDF', 'DOCX', 'JPG', 'PNG', 'MP4', 'MP3', 'XLSX', 'WEBP'].map(fmt => (
                          <span key={fmt} className="tag font-mono text-xs">{fmt}</span>
                        ))}
                        <span className="tag text-xs">+40 más</span>
                      </div>

                      <p className="text-gray-600 text-xs mt-4">
                        Máximo {MAX_FILE_SIZE_MB}MB · Archivos eliminados tras 1 hora
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="conversion"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <ConversionPanel
                  file={uploadedFile}
                  fileId={fileId}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Stats bar */}
      <StatsBar />

      {/* Category cards */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-display text-2xl font-bold text-white mb-8 text-center">
          ¿Qué quieres convertir?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(CATEGORY_FORMATS).map(([key, cat]) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={key}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`card-glass p-5 cursor-pointer hover:border-opacity-50 transition-all duration-200
                  ${activeCategory === key ? `border-opacity-80 ${cat.border} ${cat.bg}` : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl ${cat.bg} ${cat.border} border flex items-center justify-center mb-4`}>
                  <Icon size={20} className={cat.color} />
                </div>
                <h3 className="font-semibold text-white text-sm mb-2">{cat.label}</h3>
                <div className="flex flex-wrap gap-1">
                  {cat.formats.map(f => (
                    <span key={f} className="text-xs text-gray-500 font-mono">{f}</span>
                  )).reduce((acc, el, i) => {
                    if (i > 0) acc.push(<span key={`sep-${i}`} className="text-gray-700 text-xs">·</span>);
                    acc.push(el);
                    return acc;
                  }, [])}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Formato grid completo */}
      <FormatGrid />

      {/* Features / Why us */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-display text-2xl font-bold text-white mb-10 text-center">
          Por qué elegir ConvertFast
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Lock,
              title: 'Privacidad total',
              desc: 'Tus archivos se eliminan automáticamente tras 1 hora. Nunca los vendemos ni analizamos.',
              color: 'text-blue-400',
              bg: 'bg-blue-400/10',
              border: 'border-blue-400/20',
            },
            {
              icon: Zap,
              title: 'Velocidad real',
              desc: 'Conversiones en segundos gracias a procesamiento optimizado. Sin colas de espera.',
              color: 'text-accent',
              bg: 'bg-accent/10',
              border: 'border-accent/20',
            },
            {
              icon: Shield,
              title: 'Sin registro',
              desc: 'No necesitas cuenta, no damos tu email a nadie. Usa y sal. Simple.',
              color: 'text-green-400',
              bg: 'bg-green-400/10',
              border: 'border-green-400/20',
            },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="card-glass p-6"
              >
                <div className={`w-11 h-11 rounded-xl ${feat.bg} ${feat.border} border flex items-center justify-center mb-4`}>
                  <Icon size={20} className={feat.color} />
                </div>
                <h3 className="font-display font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="font-display text-2xl font-bold text-white mb-8 text-center">
          Preguntas frecuentes
        </h2>
        <FAQ />
      </section>
    </div>
  );
}

const FAQ_ITEMS = [
  { q: '¿Es realmente gratis?', a: 'Sí, completamente gratis. Sin límites de uso diario ni funciones bloqueadas.' },
  { q: '¿Qué pasa con mis archivos?', a: 'Los archivos se eliminan automáticamente de nuestros servidores tras 1 hora. Nunca los compartimos ni analizamos.' },
  { q: '¿Cuál es el límite de tamaño?', a: `Puedes subir archivos de hasta ${MAX_FILE_SIZE_MB}MB. Para archivos más grandes, considera comprimir primero.` },
  { q: '¿Necesito instalar algo?', a: 'No. ConvertFast funciona 100% en el navegador. Compatible con Chrome, Firefox, Safari y Edge.' },
  { q: '¿Qué formatos soportáis?', a: 'Más de 50 formatos: documentos (PDF, Word, Excel), imágenes (JPG, PNG, WebP, HEIC), audio (MP3, WAV, FLAC) y video (MP4, AVI, MKV).' },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="card-glass overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-5 text-left hover:bg-white/2 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-medium text-white text-sm">{item.q}</span>
            <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={16} className="text-gray-500 flex-shrink-0 ml-4" />
            </motion.div>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-dark-border pt-3">
                  {item.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
