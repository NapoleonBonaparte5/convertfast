import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CONVERSIONS = [
  // Documentos populares
  { from: 'PDF',  to: 'DOCX', label: 'PDF a Word',   popular: true },
  { from: 'PDF',  to: 'TXT',  label: 'PDF a Texto',  popular: false },
  { from: 'PDF',  to: 'JPG',  label: 'PDF a Imagen', popular: true },
  { from: 'DOCX', to: 'PDF',  label: 'Word a PDF',   popular: true },
  { from: 'TXT',  to: 'PDF',  label: 'TXT a PDF',    popular: false },
  { from: 'HTML', to: 'PDF',  label: 'HTML a PDF',   popular: false },
  // Imágenes
  { from: 'JPG',  to: 'PNG',  label: 'JPG a PNG',    popular: true },
  { from: 'PNG',  to: 'WEBP', label: 'PNG a WebP',   popular: true },
  { from: 'HEIC', to: 'JPG',  label: 'HEIC a JPG',   popular: true },
  { from: 'SVG',  to: 'PNG',  label: 'SVG a PNG',    popular: false },
  { from: 'JPG',  to: 'PDF',  label: 'JPG a PDF',    popular: false },
  { from: 'WEBP', to: 'JPG',  label: 'WebP a JPG',   popular: false },
  // Datos
  { from: 'CSV',  to: 'XLSX', label: 'CSV a Excel',  popular: true },
  { from: 'XLSX', to: 'CSV',  label: 'Excel a CSV',  popular: false },
  { from: 'JSON', to: 'CSV',  label: 'JSON a CSV',   popular: false },
  { from: 'CSV',  to: 'JSON', label: 'CSV a JSON',   popular: false },
  // Audio
  { from: 'MP4',  to: 'MP3',  label: 'MP4 a MP3',    popular: true },
  { from: 'WAV',  to: 'MP3',  label: 'WAV a MP3',    popular: true },
  { from: 'FLAC', to: 'MP3',  label: 'FLAC a MP3',   popular: false },
  { from: 'AAC',  to: 'MP3',  label: 'AAC a MP3',    popular: false },
  // Video
  { from: 'AVI',  to: 'MP4',  label: 'AVI a MP4',    popular: true },
  { from: 'MOV',  to: 'MP4',  label: 'MOV a MP4',    popular: true },
  { from: 'MKV',  to: 'MP4',  label: 'MKV a MP4',    popular: false },
  { from: 'WEBM', to: 'MP4',  label: 'WebM a MP4',   popular: false },
];

export default function FormatGrid() {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? CONVERSIONS : CONVERSIONS.filter(c => c.popular);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-white">
          Conversiones populares
        </h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-accent hover:text-accent/80 transition-colors"
        >
          {showAll ? 'Ver menos' : `Ver todas (${CONVERSIONS.length})`}
        </button>
      </div>

      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visible.map((conv, i) => (
          <motion.div
            key={conv.label}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            className="card-glass p-3 hover:border-accent/20 transition-all duration-200 group cursor-default"
          >
            <div className="flex items-center gap-2 justify-center">
              <span className="font-mono text-xs font-semibold text-gray-300 bg-dark-surface px-2 py-1 rounded">
                {conv.from}
              </span>
              <ArrowRight size={12} className="text-accent/60 group-hover:text-accent transition-colors" />
              <span className="font-mono text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded">
                {conv.to}
              </span>
            </div>
            <p className="text-center text-xs text-gray-600 mt-2">{conv.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
