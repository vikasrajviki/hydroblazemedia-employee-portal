import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader = ({ onComplete }: PreloaderProps) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 4 + 1;
        const next = Math.min(prev + increment, 100);
        
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 800);
          }, 400);
        }
        
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: [0.8, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          <div className="flex items-start gap-1 mb-6">
            <span className="font-display text-7xl md:text-8xl font-semibold text-foreground tabular-nums">
              {Math.floor(progress).toString().padStart(2, '0')}
            </span>
            <span className="font-display text-xl md:text-2xl mt-2 text-blaze">%</span>
          </div>
          
          <div className="w-48 h-0.5 bg-muted relative overflow-hidden rounded-full">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, hsl(var(--hydro)), hsl(var(--blaze)))',
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
          
          <p className="mt-8 text-sm text-muted-foreground tracking-widest uppercase">
            HydroBlaze Media
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
