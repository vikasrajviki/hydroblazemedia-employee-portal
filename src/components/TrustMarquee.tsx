import { motion } from 'framer-motion';

const phrases = [
  'Strategy-Led Growth',
  '•',
  'Scroll-Stopping Creatives',
  '•',
  'Performance Marketing',
  '•',
  'Brand Identity Systems',
  '•',
  'Data-Driven Decisions',
  '•',
  'Content That Converts',
  '•',
];

const TrustMarquee = () => {
  return (
    <section className="relative z-10 py-6 border-y border-foreground/5 overflow-hidden">
      <div className="flex">
        <motion.div
          className="flex shrink-0 gap-8 items-center"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          {[...phrases, ...phrases].map((phrase, i) => (
            <span
              key={i}
              className={`whitespace-nowrap text-sm font-display tracking-wide ${
                phrase === '•'
                  ? 'text-hydro text-lg'
                  : 'text-muted-foreground/60 uppercase tracking-[0.15em]'
              }`}
            >
              {phrase}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustMarquee;
