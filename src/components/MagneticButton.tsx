import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  as?: 'button' | 'a' | 'div';
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
}

const MagneticButton = ({ children, className = '', as = 'button', href, target, rel, onClick }: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Component = motion.div;

  return (
    <Component
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {as === 'a' ? (
        <a href={href} target={target} rel={rel} className={className} onClick={onClick}>
          {children}
        </a>
      ) : (
        <button className={className} onClick={onClick}>
          {children}
        </button>
      )}
    </Component>
  );
};

export default MagneticButton;
