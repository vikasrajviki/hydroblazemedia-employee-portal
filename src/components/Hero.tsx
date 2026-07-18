import { motion, useScroll, useTransform } from 'framer-motion';
import { useContactDialog } from '@/components/ContactFormDialog';
import { useRef } from 'react';
import { ArrowRight, Sparkles, Search } from 'lucide-react';


const Hero = () => {
  const { open } = useContactDialog();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const headingWordsLine1 = ['Where', 'Strategy', 'Meets', 'Creative'];
  const headingWordsLine2 = ['That'];

  return (
    <section ref={containerRef} className="relative min-h-[110vh] flex items-center justify-center px-6 overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, hsl(var(--hydro)), transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, hsl(var(--blaze)), transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], x: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, hsl(var(--hydro)), transparent 60%)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div style={{ y: textY, opacity }} className="text-center max-w-6xl mx-auto relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-hydro/10 text-hydro border border-hydro/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Trusted by Growing Brands
          </span>
        </motion.div>

        {/* Heading — staggered word reveal */}
        <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.92] tracking-[-0.025em] mb-8">
          {headingWordsLine1.map((word, i) => (
            <motion.span
              key={word + i}
              initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.6 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block mr-[0.25em]"
            >
              {word}
              {word === 'Creative' && <br className="hidden md:block" />}
            </motion.span>
          ))}
          {headingWordsLine2.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.6 + (4 + i) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block mr-[0.25em]"
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.6 + 5 * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block text-gradient"
          >
            Drives Growth
          </motion.span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-[1.7] mb-12 tracking-[-0.005em]"
        >
          We help brands grow through structured social media, performance marketing, and high-impact content — built to convert, not just look good.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => open("Start Your Growth")}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold bg-gradient-to-r from-hydro to-blaze text-white hover:shadow-[0_0_40px_hsl(var(--hydro)/0.4)] transition-all duration-500 hover:scale-105"
          >
            Start Your Growth
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
          </button>
          <button
            onClick={() => open("Get Free Audit")}
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-display font-semibold text-sm text-muted-foreground hover:text-foreground border border-foreground/10 hover:border-foreground/20 transition-all duration-300"
          >
            <Search className="w-4 h-4" />
            Get Free Audit
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2 }}
          className="absolute -bottom-24 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border border-foreground/20 flex justify-center pt-2"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-2 bg-foreground/50 rounded-full"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
