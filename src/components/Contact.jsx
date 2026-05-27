import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiSend, FiUser, FiMail, FiMessageSquare, FiActivity, FiShield, FiLoader } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const Contact = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const formRef = useRef();
  
  const [loaded, setLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // Rate limiting: track submission timestamps
  const submissionTimestamps = useRef([]);
  const MAX_SUBMISSIONS = 3;
  const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
  const COOLDOWN_SECONDS = 30;

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const frameCount = 160;
  const imagesRef = useRef([]);
  const seqRef = useRef({ frame: 0 });

  const currentFrame = (index) => `/image3/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`;

  // 1. Preload Sequence
  useEffect(() => {
    let loadedCount = 0;
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        img.onload = () => {
            loadedCount++;
            setLoadingProgress(Math.floor((loadedCount / frameCount) * 100));
            if (loadedCount === frameCount) setLoaded(true);
        };
        img.onerror = () => {
            loadedCount++;
            if (loadedCount === frameCount) setLoaded(true);
        };
        imagesRef.current.push(img);
    }
  }, []);

  // 2. GSAP Scroll and Render Logic (Hero Sync)
  useEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Responsive Canvas Size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    };

    const render = () => {
      if (!canvas || !imagesRef.current.length) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let frameIdx = Math.round(seqRef.current.frame);
      if (frameIdx >= frameCount) frameIdx = frameCount - 1;

      const img = imagesRef.current[frameIdx];
      if (img && img.complete && img.naturalWidth !== 0) {
        const scale = Math.max(
          canvas.width / img.width,
          canvas.height / img.height
        );
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      }
      setCurrentFrameIdx(frameIdx);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Scroll Animation - Sync with Hero logic
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=4000",
        scrub: 1.2, // Smoother scrub
        pin: true,
        anticipatePin: 1
      }
    });

    tl.to(seqRef.current, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      onUpdate: render
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      ScrollTrigger.getAll().filter(t => t.trigger === containerRef.current).forEach(t => t.kill());
    };
  }, [loaded]);

  // Validate email format
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const sendEmail = async (e) => {
    e.preventDefault();

    const form = formRef.current;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    // Honeypot check — if filled, it's a bot
    if (form.website?.value) {
      toast.success("TRANSMISSION_COMPLETE "); // Fake success for bots
      form.reset();
      return;
    }

    // Field validation
    if (!name || name.length < 2) {
      toast.error("IDENT_SIGNATURE requires at least 2 characters");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("INVALID_COMM_PATH — check email format");
      return;
    }
    if (!message || message.length < 10) {
      toast.error("DATA_PAYLOAD too short — minimum 10 characters");
      return;
    }

    // Rate limiting check
    const now = Date.now();
    submissionTimestamps.current = submissionTimestamps.current.filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW
    );
    if (submissionTimestamps.current.length >= MAX_SUBMISSIONS) {
      toast.error("RATE_LIMIT_EXCEEDED — try again in a few minutes");
      return;
    }

    // Cooldown check
    if (cooldown > 0) {
      toast.error(`COOLDOWN_ACTIVE — wait ${cooldown}s`);
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, website: form.website?.value || '' }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "CONNECTION_FAILURE");
        return;
      }

      toast.success("TRANSMISSION_COMPLETE");
      form.reset();
      submissionTimestamps.current.push(Date.now());
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      toast.error("CONNECTION_FAILURE — server unreachable");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      ref={containerRef}
      id="contactme"
      className="relative w-full h-screen bg-[#020202] overflow-hidden flex items-center justify-center font-mono"
    >
      {/* 1. Loading Module (Ultra-high Z) */}
      <AnimatePresence>
        {!loaded && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-[100] bg-[#020202]"
          >
            <div className="text-cyan-400 font-mono text-[10px] uppercase tracking-[0.5em] mb-4 animate-pulse">
              SYNCING_COMM_STREAM {loadingProgress}%
            </div>
            <div className="w-64 h-[2px] bg-cyan-950/30 overflow-hidden">
               <motion.div 
                 className="h-full bg-cyan-500" 
                 style={{ width: `${loadingProgress}%` }}
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Cinematic Canvas Layer (Z-0) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 3. Aesthetic Overlays (Z-10) */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-radial-vignette opacity-40" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

      {/* 4. Peripheral HUD Elements (Z-20) */}
      <AnimatePresence>
        {loaded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 pointer-events-none p-10"
          >
            {/* Top-left animated text */}
            <div className="absolute top-12 left-12">
              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-cyan-400 font-mono text-[9px] uppercase tracking-[0.7em] font-bold"
              >
                Establish Sub-Space Connection
              </motion.div>
            </div>

            {/* Brackets */}
            <div className="absolute top-10 left-10 w-24 h-24 border-t border-l border-cyan-500/20" />
            <div className="absolute top-10 right-10 w-24 h-24 border-t border-r border-cyan-500/20" />
            <div className="absolute bottom-10 left-10 w-24 h-24 border-b border-l border-cyan-500/20" />
            <div className="absolute bottom-10 right-10 w-24 h-24 border-b border-r border-cyan-500/20" />

            {/* Static HUD Text */}
            <div className="absolute top-12 left-12 flex items-center space-x-3">
               <FiActivity className="text-cyan-400 text-xs animate-pulse" />
               <span className="text-cyan-400/40 text-[9px] tracking-[0.4em] uppercase font-bold">Signal_Stable</span>
            </div>
            
            <div className="absolute bottom-12 right-12 text-right hidden lg:block">
               <span className="text-white/10 text-[9px] tracking-[0.6em] uppercase block mb-1">Archive_003</span>
               <span className="text-cyan-500/30 text-[9px] tracking-[0.4em] uppercase">&gt; System_Ready</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Central Contact UI (Z-50) */}
      <AnimatePresence>
        {loaded && (currentFrameIdx >= 120 || isFocused) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-50 w-full max-w-4xl px-6 pointer-events-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl sm:text-5xl md:text-9xl font-black text-white uppercase tracking-tighter leading-none">
              COMM<span className="text-cyan-500 block sm:inline">.LINK</span>
            </h2>
              <div className="flex items-center justify-center space-x-2 text-cyan-500/60 font-mono text-[9px] tracking-[0.6em] uppercase">
                <FiShield />
                <span>Protocol: Neural_Gate</span>
              </div>
            </div>

            <form
              ref={formRef}
              onSubmit={sendEmail}
              className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-10 md:p-14 rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-10 group"
            >
              {/* Honeypot — hidden from humans, bots fill it */}
              <input
                type="text"
                name="website"
                autoComplete="off"
                tabIndex="-1"
                style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-cyan-400 block ml-1">IDENT_SIGNATURE</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="ENTER_NAME"
                    required
                    minLength={2}
                    maxLength={100}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full bg-white/5 border-b border-white/10 py-5 px-6 text-white text-sm outline-none focus:border-cyan-500 transition-all placeholder:text-white/30"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-cyan-400 block ml-1">COMM_PATH_ADDR</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="ENTER_EMAIL"
                    required
                    maxLength={254}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full bg-white/5 border-b border-white/10 py-5 px-6 text-white text-sm outline-none focus:border-cyan-500 transition-all placeholder:text-white/30"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-cyan-400 block ml-1">DATA_PAYLOAD</label>
                <textarea
                  name="message"
                  placeholder="INPUT_TRANSMISSION..."
                  required
                  minLength={10}
                  maxLength={5000}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full bg-white/5 border-b border-white/10 py-5 px-6 text-white text-sm outline-none focus:border-cyan-500 transition-all min-h-[140px] resize-none placeholder:text-white/30"
                />
              </div>

              <div className="flex justify-center md:justify-end">
                <motion.button
                  whileHover={!isSending && cooldown === 0 ? { scale: 1.05, boxShadow: "0 0 50px rgba(6, 182, 212, 0.3)" } : {}}
                  whileTap={!isSending && cooldown === 0 ? { scale: 0.95 } : {}}
                  type="submit"
                  disabled={isSending || cooldown > 0}
                  className={`group flex items-center space-x-6 font-black text-[11px] uppercase tracking-[0.6em] px-24 py-6 shadow-2xl transition-all ${
                    isSending || cooldown > 0
                      ? 'bg-cyan-900/50 text-cyan-300/50 cursor-not-allowed'
                      : 'bg-cyan-600 text-black cursor-pointer'
                  }`}
                >
                  <span>
                    {isSending ? 'TRANSMITTING...' : cooldown > 0 ? `COOLDOWN ${cooldown}s` : 'TRANSMIT'}
                  </span>
                  {isSending ? (
                    <FiLoader className="text-lg animate-spin" />
                  ) : (
                    <FiSend className="text-lg transition-transform group-hover:translate-x-1" />
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        theme="dark"
        toastStyle={{
          background: '#0a0a0a',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: 0,
          color: '#e5e5e5',
          fontFamily: 'monospace',
          fontSize: '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        }}
        icon={false}
      />
    </div>
  );
};

export default Contact;
