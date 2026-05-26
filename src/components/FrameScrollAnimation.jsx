import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const FrameScrollAnimation = ({ frameCount = 240 }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const images = useRef([]);
  const [loaded, setLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // 1. Scroll Tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 2. Smooth Easing (Spring) for the scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // 3. Transform Progress to Frame Index
  const frameIndex = useTransform(smoothProgress, [0, 0.9], [0, frameCount - 1]);

  // 4. Anti-Gravity 3D Effects
  // Floating motion
  const y = useTransform(smoothProgress, [0, 1], ["0%", "-10%"]);
  const rotateX = useTransform(smoothProgress, [0, 0.5, 1], [0, 15, 0]);
  const rotateY = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0, -10, 10, 0]);
  const scale = useTransform(smoothProgress, [0, 0.8, 0.95], [1, 1.05, 1.2]);
  
  // Depth effect (Z-axis translation)
  const z = useTransform(smoothProgress, [0, 1], [0, 100]);

  // Preloading Logic
  useEffect(() => {
    let loadedCount = 0;
    const preloadImages = () => {
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const frameNumber = String(i).padStart(3, "0");
        // Using new URL for Vite asset compatibility
        const imgUrl = new URL(`../assets/image2/ezgif-frame-${frameNumber}.jpg`, import.meta.url).href;
        img.src = imgUrl;
        img.onload = () => {
          loadedCount++;
          setLoadingProgress(Math.floor((loadedCount / frameCount) * 100));
          if (loadedCount === frameCount) {
            setLoaded(true);
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === frameCount) {
            setLoaded(true);
          }
        };
        images.current.push(img);
      }
    };
    preloadImages();
  }, [frameCount]);

  // Canvas Rendering
  useEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const render = () => {
      const index = Math.round(frameIndex.get());
      const img = images.current[index];

      if (img && img.complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Responsive cover logic
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasAspect > imgAspect) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgAspect;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgAspect;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Frame update loop
    const unsubscribe = frameIndex.on("change", render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      unsubscribe();
    };
  }, [loaded, frameIndex]);

  // Final Scene Transitions
  const opacity = useTransform(smoothProgress, [0.85, 0.95], [1, 0]);
  const blur = useTransform(smoothProgress, [0.85, 0.95], ["blur(0px)", "blur(20px)"]);

  return (
    <div ref={containerRef} className="relative h-[600vh] bg-[#020202]">
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center perspective-2000">
        
        {/* Loading Overlay */}
        {!loaded && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#020202]">
            <div className="text-blue-500 font-mono text-[10px] uppercase tracking-[0.5em] mb-4">
              Syncing Core Frames... {loadingProgress}%
            </div>
            <div className="w-1/4 h-[1px] bg-white/10 overflow-hidden">
               <motion.div 
                 className="h-full bg-blue-500" 
                 style={{ width: `${loadingProgress}%` }}
               />
            </div>
          </div>
        )}

        {/* The Animated Frame (Full Screen Canvas) */}
        <motion.div
           style={{
             y,
             rotateX,
             rotateY,
             scale,
             z,
             opacity,
             filter: blur,
             transformStyle: "preserve-3d"
           }}
           className="relative w-full h-full overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Global Cinematic Vibe */}
        <div className="absolute inset-0 pointer-events-none bg-radial-vignette opacity-40" />

        {/* Cinematic Text Reveal — synced to ~frame 143 */}
        <motion.div 
          style={{ 
            opacity: useTransform(smoothProgress, [0.50, 0.58, 0.68, 0.78], [0, 1, 1, 0]),
            scale: useTransform(smoothProgress, [0.50, 0.58, 0.68, 0.78], [0.85, 1, 1, 1.05]),
          }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-[60]"
        >
          <motion.h3 
            style={{
              letterSpacing: useTransform(smoothProgress, [0.50, 0.60, 0.75], ["-0.05em", "0.02em", "0.15em"]),
              fontSize: 'clamp(1.5rem, 6vw, 90px)',
            }}
            className="text-white font-black uppercase mb-80 drop-shadow-2xl px-4"
          >
            Welcome to my <span className="text-blue-500">Portfolio</span>
          </motion.h3>
          <motion.p 
            style={{
              opacity: useTransform(smoothProgress, [0.54, 0.62, 0.68, 0.76], [0, 1, 1, 0]),
            }}
            className="text-blue-400 font-mono tracking-[0.3em] sm:tracking-[0.6em] uppercase text-[10px] sm:text-[12px] px-4"
          >
            Core System Interface
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default FrameScrollAnimation;
