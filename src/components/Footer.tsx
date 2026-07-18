import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const serviceLinks = [
  { name: 'Social Media Management', path: '/services' },
  { name: 'Performance Marketing', path: '/services' },
  { name: 'Content Creation', path: '/services' },
  { name: 'Website Design', path: '/services' },
  { name: 'Lead Generation', path: '/services' },
];

const quickLinks = [
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'About', path: '/about' },
  { name: 'Blog', path: '/blog' },
];

const socials = [
  { name: 'Instagram', url: 'https://www.instagram.com/hydroblaze_media' },
  { name: 'X', url: 'https://x.com/HydroBlazeMedia' },
  { name: 'Facebook', url: 'https://www.facebook.com/share/1EPQequMaK/' },
  { name: 'YouTube', url: 'https://www.youtube.com/@HydroBlazeMedia' },
  { name: 'Threads', url: 'https://www.threads.com/@hydroblaze_media' },
  { name: 'Pinterest', url: 'https://www.pinterest.com/03tdqyod14r7zkytlhuqodo679g983' },
];

const Footer = () => {
  return (
    <footer id="contact" className="relative z-10 py-20 md:py-24 px-6 md:px-12 lg:px-16 border-t border-foreground/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <h2 className="font-display text-2xl font-bold mb-4">
              <span className="text-gradient">HydroBlaze</span> Media
            </h2>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Performance-driven digital marketing agency helping brands generate leads, increase sales, and scale with confidence.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="mailto:hello@hydroblazemedia.com" className="block hover:text-hydro transition-colors">
                hello@hydroblazemedia.com
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="block hover:text-hydro transition-colors">
                WhatsApp: +91 98765 43210
              </a>
              <p>📍 India</p>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-foreground/70 mb-5">Services</h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-foreground/70 mb-5">Company</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social + Trust */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-foreground/70 mb-5">Follow Us</h3>
            <div className="flex flex-wrap gap-3 mb-6">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full text-xs text-muted-foreground border border-foreground/10 hover:border-hydro/30 hover:text-foreground transition-all duration-300"
                >
                  {social.name}
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              Trusted by growing brands across India for performance marketing and creative execution.
            </p>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/50">
            © 2026 HydroBlaze Media. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <p className="text-xs text-muted-foreground/40">
              Strategy × Creative × Growth
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
