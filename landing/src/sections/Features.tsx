import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { FEATURES } from '../lib/constants';

const ICONS: Record<string, ReactNode> = {
  mic: <path d="M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3zM19 10v1a7 7 0 01-14 0v-1M12 19v3M8 22h8" />,
  cursor: <><path d="M4 4l7 16 2-7 7-2-16-7z" /></>,
  scissors: <><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/></>,
  export: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></>,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
  bolt: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
};

export function Features() {
  return (
    <section id="features">
      <div className="container">
        <div className="section-header">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything runs locally.</h2>
          <p className="section-subtitle">
            No server. No cloud. No API key. Your video never leaves your browser.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[feature.icon]}
                </svg>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
