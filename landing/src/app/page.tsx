"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Play, ArrowRight, Menu } from "lucide-react";
import { useRef } from "react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <main ref={containerRef} className="relative min-h-[200vh] bg-[#000000] text-white">
      {/* Navbar - Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md bg-black/10 border-b border-white/5">
        <div className="text-xl font-bold tracking-[0.3em] font-playfair">KAGE</div>
        <div className="hidden md:flex gap-8 text-xs font-semibold tracking-widest text-white/70">
          <a href="#" className="hover:text-white transition-colors">FEATURES</a>
          <a href="#" className="hover:text-white transition-colors">WORKFLOW</a>
          <a href="#" className="hover:text-white transition-colors">STUDIO</a>
        </div>
        <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 backdrop-blur-xl">
          <Menu size={18} />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        
        {/* Double Exposure Background Layer */}
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 z-0 flex items-center justify-center bg-black"
        >
          {/* Base darkness */}
          <div className="absolute inset-0 bg-black/70 z-10 mix-blend-multiply" />
          <img 
            src="https://images.unsplash.com/photo-1682687220199-d0124f48f95b?q=80&w=2070&auto=format&fit=crop" 
            alt="Cinematic Background" 
            className="w-full h-full object-cover scale-110 opacity-40 mix-blend-screen"
          />
        </motion.div>

        {/* Text as Mask / Double Exposure Typography */}
        <div className="z-10 flex flex-col items-center justify-center relative w-full h-full pointer-events-none">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ scale: textScale }}
            className="text-[18vw] leading-none font-playfair font-black text-transparent bg-clip-text bg-cover bg-center text-center tracking-tighter"
            // The image inside the text creates the double exposure effect
          >
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                WebkitTextFillColor: "transparent"
              }}
            >
              KAGE
            </span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-24 flex flex-col items-center gap-8 z-20 pointer-events-auto"
          >
            <p className="text-xs md:text-sm font-light tracking-[0.3em] text-white/80 max-w-md text-center">
              THE NEXT EVOLUTION OF CINEMATIC VIDEO EDITING.
            </p>
            
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold text-xs tracking-[0.2em] hover:bg-white/90 transition-all hover:scale-105 active:scale-95">
                <Play size={14} fill="currentColor" />
                WATCH REEL
              </button>
              <button className="flex items-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full font-semibold text-xs tracking-[0.2em] hover:bg-white/10 transition-all">
                EARLY ACCESS
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Visual Noise / Texture Overlay */}
        <div 
          className="absolute inset-0 z-30 pointer-events-none mix-blend-overlay opacity-30" 
          style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')" }}
        />
      </section>

      {/* Spacer to allow scrolling and parallax */}
      <div className="h-screen bg-[#000000] z-40 relative flex items-center justify-center border-t border-white/5 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0 opacity-20"
        >
          <img 
            src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop" 
            alt="Abstract"
            className="w-full h-full object-cover mix-blend-screen"
          />
        </motion.div>
        <div className="z-10 text-center max-w-2xl px-6">
          <h2 className="text-3xl md:text-5xl font-playfair font-light mb-6 tracking-wide">
            Edit at the speed of thought.
          </h2>
          <p className="text-white/50 text-sm md:text-base font-sans tracking-widest leading-relaxed">
            POWERED BY ARTIFICIAL INTELLIGENCE, DRIVEN BY CINEMATOGRAPHY.
            <br/><br/>
            Kage introduces a revolutionary timeline designed for modern storytellers. Break the limits of traditional non-linear editing.
          </p>
        </div>
      </div>
    </main>
  );
}
