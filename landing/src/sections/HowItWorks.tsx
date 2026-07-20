import { motion } from 'framer-motion';
import { STEPS } from '../lib/constants';

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: 'var(--bg-surface)' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-label">How it works</div>
          <h2 className="section-title">Four steps. That's it.</h2>
          <p className="section-subtitle">
            From raw video to polished cut in under a minute. No timeline, no layers, no learning curve.
          </p>
        </div>

        <div className="steps-grid">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              className="step-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
