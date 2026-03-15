// PrivacyPage.jsx
import React from 'react';
import { motion } from 'framer-motion';

export function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold text-white mb-2">Política de Privacidad</h1>
        <p className="text-gray-500 text-sm mb-10">Última actualización: marzo 2026</p>

        {[
          {
            title: '1. Datos que recopilamos',
            text: `ConvertFast NO recopila datos personales identificables. No pedimos nombre, email, ni ningún dato de usuario. Los únicos datos procesados son los archivos que subes voluntariamente para su conversión.`,
          },
          {
            title: '2. Archivos subidos',
            text: `Los archivos que subes a nuestros servidores se almacenan temporalmente (máximo 1 hora) y se eliminan automáticamente mediante procesos automatizados. No leemos, analizamos, vendemos ni compartimos el contenido de tus archivos con terceros.`,
          },
          {
            title: '3. Cookies y analytics',
            text: `Usamos Google Analytics (con IP anonimizada) para entender cómo se usa el servicio de forma agregada y anónima. No usamos cookies de marketing ni de seguimiento individual. Puedes bloquear analytics con cualquier bloqueador de anuncios.`,
          },
          {
            title: '4. Anuncios (Google AdSense)',
            text: `Mostramos anuncios de Google AdSense para financiar el servicio gratuito. Google puede usar cookies propias para mostrar anuncios relevantes. Puedes gestionar tus preferencias en adssettings.google.com.`,
          },
          {
            title: '5. Seguridad',
            text: `Todas las comunicaciones van cifradas con HTTPS/TLS. Los archivos se almacenan en servidores seguros con acceso restringido. Los archivos se borran definitivamente y no se guardan backups.`,
          },
          {
            title: '6. Cumplimiento GDPR',
            text: `Cumplimos con el Reglamento General de Protección de Datos (GDPR) de la Unión Europea. Dado que no recopilamos datos personales, no hay datos que solicitar ni borrar. Para cualquier consulta: hola@convertfast.app`,
          },
          {
            title: '7. Menores',
            text: `ConvertFast no está dirigido a menores de 13 años. No recopilamos datos de menores intencionalmente.`,
          },
        ].map(section => (
          <div key={section.title} className="mb-8">
            <h2 className="font-display text-lg font-semibold text-white mb-3">{section.title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{section.text}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold text-white mb-2">Términos de Uso</h1>
        <p className="text-gray-500 text-sm mb-10">Última actualización: marzo 2026</p>

        {[
          {
            title: '1. Uso del servicio',
            text: 'ConvertFast es una herramienta de conversión de archivos gratuita. Al usarla, aceptas estos términos. El servicio se ofrece "tal cual", sin garantías de disponibilidad continua.',
          },
          {
            title: '2. Uso aceptable',
            text: 'Está prohibido usar ConvertFast para procesar archivos con contenido ilegal, malware, material protegido por derechos de autor sin autorización, o para cualquier actividad que viole leyes aplicables.',
          },
          {
            title: '3. Límites del servicio',
            text: `El tamaño máximo por archivo es de 100MB. Nos reservamos el derecho de limitar el uso en caso de abuso. El servicio puede estar temporalmente no disponible por mantenimiento.`,
          },
          {
            title: '4. Propiedad intelectual',
            text: 'Los usuarios son responsables de tener los derechos necesarios sobre los archivos que convierten. ConvertFast no reclama ningún derecho sobre los archivos procesados.',
          },
          {
            title: '5. Limitación de responsabilidad',
            text: 'ConvertFast no se responsabiliza por pérdida de archivos, calidad de conversión, o daños derivados del uso del servicio. Usa el servicio bajo tu propia responsabilidad.',
          },
          {
            title: '6. Cambios en los términos',
            text: 'Podemos actualizar estos términos en cualquier momento. Los cambios se publicarán en esta página con la fecha de actualización.',
          },
        ].map(section => (
          <div key={section.title} className="mb-8">
            <h2 className="font-display text-lg font-semibold text-white mb-3">{section.title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{section.text}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-8xl font-display font-bold text-accent/20 mb-4">404</div>
      <h1 className="font-display text-2xl font-bold text-white mb-3">Página no encontrada</h1>
      <p className="text-gray-500 mb-8">La página que buscas no existe o fue movida.</p>
      <a href="/" className="btn-primary">Volver al inicio</a>
    </div>
  );
}

export default PrivacyPage;
