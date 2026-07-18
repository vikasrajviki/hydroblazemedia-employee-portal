import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Users, Image, Eye, Award } from 'lucide-react';

const stats = [
  { label: 'Clients Served', value: 50, suffix: '+', icon: Users },
  { label: 'Creatives Delivered', value: 500, suffix: '+', icon: Image },
  { label: 'Impressions Generated', value: 10, suffix: 'M+', icon: Eye },
  { label: 'Campaigns Launched', value: 100, suffix: '+', icon: Award },
];

const Counter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const StatsCounter = () => {
  return (
    <section className="relative z-10 py-20 md:py-28 px-6 md:px-12 lg:px-16 border-b border-foreground/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Numbers That <span className="text-gradient">Speak</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
              className="relative group text-center p-8 rounded-2xl bg-card/50 border border-foreground/10 backdrop-blur-sm hover:border-hydro/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-b from-hydro/5 to-transparent" />
              <stat.icon className="w-8 h-8 mx-auto mb-4 text-hydro opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="font-display text-4xl md:text-5xl font-bold mb-2 text-gradient">
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
