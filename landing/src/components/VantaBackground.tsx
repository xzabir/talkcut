import { useEffect, useRef } from 'react';

// Minimal type for Vanta effect
interface VantaEffect {
  destroy: () => void;
}

export function VantaBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<VantaEffect | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    let cancelled = false;

    async function init() {
      try {
        const THREE = await import('three');
        if (cancelled || !containerRef.current) return;

        // Dynamic import of Vanta NET
        const vantaModule = await import('vanta/src/vanta.net.js');
        const VANTA = vantaModule.default;

        if (cancelled || !containerRef.current) return;

        effectRef.current = VANTA({
          el: containerRef.current,
          THREE: THREE as unknown,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1,
          color: 0x6c5ce7,
          backgroundColor: 0x0a0a0f,
          points: 8,
          maxDistance: 25,
          spacing: 18,
          showDots: false,
        } as Parameters<typeof VANTA>[0]);
      } catch (err) {
        console.warn('Vanta background failed to load:', err);
      }
    }

    init();

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        opacity: 0.5,
        pointerEvents: 'none',
      }}
    />
  );
}
