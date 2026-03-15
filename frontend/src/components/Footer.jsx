import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Heart } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-dark-border bg-dark-card/30 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Zap size={14} className="text-accent" />
              </div>
              <span className="font-display font-semibold text-white">
                Convert<span className="text-accent">Fast</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Conversor de archivos gratuito, rápido y privado.
              Sin registro, sin límites molestos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-medium text-sm mb-3">Páginas</h4>
            <ul className="space-y-2">
              {[
                { to: '/',        label: 'Convertir archivos' },
                { to: '/about',   label: 'Sobre nosotros' },
                { to: '/privacy', label: 'Política de privacidad' },
                { to: '/terms',   label: 'Términos de uso' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-500 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Formatos */}
          <div>
            <h4 className="text-white font-medium text-sm mb-3">Conversiones populares</h4>
            <ul className="space-y-2">
              {[
                'PDF a Word (DOCX)', 'JPG a PNG', 'MP4 a MP3',
                'HEIC a JPG', 'CSV a Excel', 'AVI a MP4',
              ].map(c => (
                <li key={c}>
                  <span className="text-gray-500 text-sm">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {year} ConverFast. Todos los derechos reservados.
          </p>
          <p className="text-gray-600 text-xs flex items-center gap-1.5">
            Hecho con <Heart size={11} className="text-red-500" /> para la comunidad
          </p>
          <p className="text-gray-700 text-xs">
            🔒 Los archivos se eliminan automáticamente tras 1 hora
          </p>
        </div>
      </div>
    </footer>
  );
}
