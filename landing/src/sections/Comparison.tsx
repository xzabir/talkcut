import { motion } from 'framer-motion';
import { COMPARISON } from '../lib/constants';

export function Comparison() {
  return (
    <section id="compare">
      <div className="container">
        <div className="section-header">
          <div className="section-label">Compare</div>
          <h2 className="section-title">Scripta vs. Descript</h2>
          <p className="section-subtitle">
            Same paradigm. No subscription. No credit meter. No server.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <table className="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Descript</th>
                <th>Scripta</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td>{row.descript}</td>
                  <td>{row.scripta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
