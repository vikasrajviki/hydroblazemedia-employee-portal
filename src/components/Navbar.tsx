import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logoDark from '@/assets/logo.png';
import logoLight from '@/assets/logo-light.png';
import { useContactDialog } from '@/components/ContactFormDialog';
import ThemeToggle, { useTheme } from '@/components/ThemeToggle';

const navLinks = [
  { path: '/services', label: 'Services' },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/about', label: 'About' },
  { path: '/blog', label: 'Blog' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { open: openContact } = useContactDialog();
  const isDark = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`fixed top-4 left-4 right-4 z-50 px-6 md:px-10 lg:px-14 rounded-2xl transition-all duration-500 ${
          isScrolled
            ? 'py-3 bg-card/80 backdrop-blur-2xl border border-foreground/[0.1] shadow-[0_8px_32px_hsl(var(--foreground)/0.1)]'
            : 'py-4 md:py-5 bg-card/50 backdrop-blur-2xl border border-foreground/[0.06] shadow-[0_4px_24px_hsl(var(--foreground)/0.05)]'
        }`}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3">
            <img src={isDark ? logoDark : logoLight} alt="HydroBlaze" className="h-[42px] w-[168px] object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-6 md:gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`hidden md:block text-sm transition-colors duration-300 hover:drop-shadow-[0_0_8px_hsl(var(--hydro))] ${
                  isActive(link.path) ? 'text-foreground drop-shadow-[0_0_8px_hsl(var(--hydro))]' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
            <button onClick={() => openContact("Start Project")} className="hidden md:block group relative px-5 py-2.5 rounded-full text-sm border border-foreground/20 text-foreground transition-all duration-300 hover:border-blaze hover:shadow-[0_0_20px_hsl(var(--blaze)/0.4)]">
              Start Project
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center rounded-lg border border-foreground/10 bg-foreground/5"
            >
              <AnimatePresence mode="wait">
                {isMobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-2xl md:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center justify-center h-full gap-6 pt-20"
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                >
                  <Link
                    to={link.path}
                    className={`font-display text-3xl font-semibold transition-colors duration-300 ${
                      isActive(link.path)
                        ? 'text-gradient'
                        : 'text-foreground/70 hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <button
                  onClick={() => { setIsMobileOpen(false); openContact("Start Project"); }}
                  className="inline-block px-8 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-hydro to-blaze text-white hover:shadow-[0_0_30px_hsl(var(--hydro)/0.4)] transition-all duration-300"
                >
                  Start Project
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
