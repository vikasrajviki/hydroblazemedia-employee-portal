import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  icon: string;
  lucideIcon?: LucideIcon;
  title: string;
  tagline: string;
  description: string;
  includes: string[];
  index: number;
  image?: string;
}

const ServiceCard = ({ 
  lucideIcon: LucideIconComp,
  title, 
  tagline, 
  description, 
  includes, 
  index,
  image,
}: ServiceCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onClick={() => setIsExpanded(!isExpanded)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* Mouse-follow radial */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--hydro) / 0.06), transparent 50%)`
        }}
      />

      <div className="relative bg-card/50 backdrop-blur-sm border border-foreground/10 rounded-2xl group-hover:border-hydro/20 transition-all duration-400">
        {/* Image banner */}
        {image && (
          <div className="relative h-44 md:h-52 overflow-hidden rounded-t-2xl">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-card via-card/50 to-transparent" />
            {/* Icon overlay */}
            <div className="absolute bottom-4 left-6">
              <div className="w-10 h-10 rounded-xl bg-background/80 backdrop-blur-sm border border-foreground/10 flex items-center justify-center">
                {LucideIconComp && <LucideIconComp className="w-5 h-5 text-hydro" />}
              </div>
            </div>
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg md:text-xl font-semibold tracking-tight mb-1">{title}</h3>
              <p className="text-hydro text-sm font-medium">{tagline}</p>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8 rounded-full border border-foreground/10 flex items-center justify-center shrink-0 mt-1"
            >
              <span className="text-muted-foreground text-lg leading-none">+</span>
            </motion.div>
          </div>

          <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{description}</p>

          {/* Expandable includes */}
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-5 mt-5 border-t border-foreground/5">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 mb-3 font-semibold">What's included</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {includes.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-hydro shrink-0" />
                    <span className="text-foreground/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
