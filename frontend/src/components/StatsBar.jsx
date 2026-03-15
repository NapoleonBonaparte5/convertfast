// StatsBar.jsx
import React from 'react';
import { motion } from 'framer-motion';

const STATS = [
  { value: '50+',    label: 'Formatos' },
  { value: '100MB',  label: 'Máx. por archivo' },
  { value: '<10s',   label: 'Tiempo promedio' },
  { value: '1h',     label: 'Retención de datos' },
];

export function StatsBar() {
  return (
    <section className="border-y border-dark-border bg-dark-card/50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="text-center"
            >
              <div className="font-display text-2xl font-bold text-accent mb-0.5">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsBar;
