// AboutPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Lock, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold text-white mb-4">Sobre ConverFast</h1>
        <p className="text-gray-400 text-lg leading-relaxed mb-10">
          ConverFast nació de una necesidad real: convertir archivos sin tener que registrarse,
          instalar software ni sufrir anuncios agresivos. Somos una herramienta simple, gratuita y privada.
        </p>

        <div className="grid gap-6 mb-10">
          {[
            { icon: Shield, title: 'Privacidad primero', text: 'No almacenamos tus datos. Los archivos se borran automáticamente tras 1 hora de su subida. No hay cookies de seguimiento, no hay venta de datos.', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
            { icon: Zap, title: 'Tecnología moderna', text: 'Usamos tecnologías de procesamiento de última generación para garantizar conversiones rápidas y de alta calidad. Sin colas de espera.', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
            { icon: Lock, title: 'Sin registro', text: 'Nunca pediremos tu email ni crear cuenta. Sube el archivo, conviértelo, descárgalo. Así de simple.', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
            { icon: Globe, title: 'Para todos', text: 'Interfaz disponible en español, inglés y francés. Diseñada para ser accesible en cualquier dispositivo y para cualquier usuario.', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
          ].map(feat => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="card-glass p-6 flex gap-5">
                <div className={`w-11 h-11 rounded-xl ${feat.bg} ${feat.border} border flex items-center justify-center flex-shrink-0`}>
                  <Icon size={20} className={feat.color} />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feat.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feat.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-gray-500 text-sm">
          ¿Tienes sugerencias? Escríbenos a{' '}
          <a href="mailto:hola@converfast.com" className="text-accent hover:underline">
            hola@converfast.com
          </a>
        </p>
      </motion.div>
    </div>
  );
}
