import { motion } from 'framer-motion';

export function Silhouette() {
  return (
    <motion.div
      className="silhouette-container"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
    >
      <svg className="silhouette-svg" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Human head + shoulders silhouette mask */}
          <mask id="silhouette-mask">
            <path
              d="M200,60
                 C245,60 280,95 282,150
                 C284,195 268,230 240,250
                 L248,300 L256,370 L265,460
                 L135,460 L144,370 L152,300
                 L160,250
                 C132,230 116,195 118,150
                 C120,95 155,60 200,60 Z"
              fill="white"
            />
          </mask>

          {/* Animated gradient for fill */}
          <linearGradient id="silhouette-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6c5ce7">
              <animate attributeName="stop-color" values="#6c5ce7;#a78bfa;#6c5ce7" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#a78bfa">
              <animate attributeName="stop-color" values="#a78bfa;#6c5ce7;#a78bfa" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#7f70f0">
              <animate attributeName="stop-color" values="#7f70f0;#6c5ce7;#7f70f0" dur="6s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background rect (dark) */}
        <rect width="400" height="500" fill="#0a0a0f" />

        {/* Fill layer — only visible inside silhouette mask */}
        <g mask="url(#silhouette-mask)">
          <rect width="400" height="500" fill="url(#silhouette-gradient)" opacity="0.9" />

          {/* Waveform lines inside silhouette for double-exposure effect */}
          <g opacity="0.3" stroke="#f0f0f5" strokeWidth="1" fill="none">
            {Array.from({ length: 20 }).map((_, i) => {
              const y = 80 + i * 20;
              const amplitude = 15 + Math.sin(i * 0.5) * 10;
              return (
                <path
                  key={i}
                  d={`M 80 ${y} Q 200 ${y - amplitude} 320 ${y}`}
                  strokeOpacity={0.15 + Math.sin(i * 0.3) * 0.1}
                >
                  <animate
                    attributeName="d"
                    values={`M 80 ${y} Q 200 ${y - amplitude} 320 ${y};M 80 ${y} Q 200 ${y + amplitude} 320 ${y};M 80 ${y} Q 200 ${y - amplitude} 320 ${y}`}
                    dur={`${3 + i * 0.1}s`}
                    repeatCount="indefinite"
                  />
                </path>
              );
            })}
          </g>

          {/* Transcript text lines inside silhouette */}
          <g opacity="0.15" fill="#f0f0f5" fontFamily="JetBrains Mono, monospace" fontSize="10">
            <text x="90" y="120">"um... so basically..."</text>
            <text x="100" y="145">"you know what I mean"</text>
            <text x="85" y="170">"like, it's just..."</text>
            <text x="95" y="195">"I think that's right"</text>
            <text x="90" y="220">"uh, let me think"</text>
            <text x="100" y="245">"actually, no wait"</text>
            <text x="85" y="270">"so the thing is..."</text>
            <text x="95" y="295">"hmm, not sure"</text>
          </g>
        </g>

        {/* Subtle outline glow on silhouette edge */}
        <path
          d="M200,60 C245,60 280,95 282,150 C284,195 268,230 240,250
             L248,300 L256,370 L265,460 L135,460 L144,370 L152,300
             L160,250 C132,230 116,195 118,150 C120,95 155,60 200,60 Z"
          fill="none"
          stroke="#6c5ce7"
          strokeWidth="1"
          opacity="0.3"
          filter="url(#glow)"
        />
      </svg>
    </motion.div>
  );
}
