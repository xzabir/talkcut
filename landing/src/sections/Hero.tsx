import { motion } from 'framer-motion';
import { BRAND, STATS } from '../lib/constants';
import { VantaBackground } from '../components/VantaBackground';
import { Silhouette } from '../components/Silhouette';

export function Hero() {
  return (
    <section className="hero" id="top">
      <VantaBackground />
      <div className="container hero-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-badge">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6c5ce7' }} />
            Free · Open Source · Privacy First
          </div>
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Edit video by
          <br />
          <span className="gradient-text">editing the transcript.</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {BRAND.subtitle} Transcribe, cut filler words, export — all in your browser. No server, no account, no upload.
        </motion.p>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <a href={BRAND.github} target="_blank" rel="noopener" className="btn btn-primary">
            Open Scripta
            <ArrowRight />
          </a>
          <a href="#how-it-works" className="btn btn-ghost">
            See how it works
          </a>
        </motion.div>

        <Silhouette />

        <div className="stats-row">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="stat-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            >
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  );
}
