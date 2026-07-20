import { motion } from 'framer-motion';
import { BRAND } from '../lib/constants';

export function CTA() {
  return (
    <section className="cta-section">
      <div className="container">
        <motion.div
          className="cta-box"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>
            Stop paying for <span className="gradient-text">Descript.</span>
          </h2>
          <p>
            Open Scripta, drop a video, edit the transcript, export the cut. Free forever. No account needed.
          </p>
          <a href={BRAND.github} target="_blank" rel="noopener" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
            Open Scripta — it's free
            <ArrowRight />
          </a>
        </motion.div>
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
