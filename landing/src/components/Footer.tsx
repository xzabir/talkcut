import { BRAND } from '../lib/constants';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#6c5ce7"/>
              <path d="M8 10V22H10V14L14 22H16V10H14V18L10 10H8Z" fill="white"/>
              <path d="M18 10V22H24V20H20V17H23V15H20V12H24V10H18Z" fill="white"/>
            </svg>
            {BRAND.name}
          </div>
          <div className="footer-links">
            <a href={BRAND.github} target="_blank" rel="noopener">GitHub</a>
            <a href={`${BRAND.github}/blob/main/README.md`} target="_blank" rel="noopener">Docs</a>
            <a href={`${BRAND.github}/blob/main/LICENSE`} target="_blank" rel="noopener">MIT License</a>
            <a href={`${BRAND.github}/issues`} target="_blank" rel="noopener">Issues</a>
          </div>
        </div>
        <div className="footer-copy">
          © 2026 {BRAND.name} contributors. MIT licensed. No telemetry, no tracking, no servers.
        </div>
      </div>
    </footer>
  );
}
