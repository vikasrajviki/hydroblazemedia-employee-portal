import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, MessageCircle, Check } from 'lucide-react';
import { useContactDialog } from '@/components/ContactFormDialog';

import serviceAds from '@/assets/service-meta-google-ads.jpg';
import serviceSocial from '@/assets/service-social-mgmt.jpg';
import serviceContent from '@/assets/service-content-creation.jpg';
import serviceFunnels from '@/assets/service-lead-funnels.jpg';
import serviceWebsite from '@/assets/service-website-design.jpg';
import serviceStrategy from '@/assets/service-strategy.jpg';

const services = [
  {
    title: 'Meta & Google Ads',
    description: 'We create and manage high-performance paid advertising campaigns on Meta and Google designed to generate qualified leads and maximize return on ad spend.',
    deliverables: ['Campaign strategy & research', 'Audience targeting', 'Ad creatives and copywriting', 'A/B testing', 'Conversion tracking', 'Performance optimization'],
    cta: 'Start Advertising',
    image: serviceAds,
  },
  {
    title: 'Social Media Management',
    description: 'Build a powerful brand presence with strategic social media management that increases engagement, visibility, and customer trust.',
    deliverables: ['Content strategy', 'Content calendar planning', 'Post design and captions', 'Community management', 'Audience growth strategies', 'Performance tracking'],
    cta: 'Grow Your Brand',
    image: serviceSocial,
  },
  {
    title: 'Content Creation',
    description: 'Professional content designed to capture attention, build authority, and convert viewers into customers across digital platforms.',
    deliverables: ['Social media creatives', 'Short-form video content', 'Ad creatives', 'Branding visuals', 'Marketing graphics'],
    cta: 'Create High-Converting Content',
    image: serviceContent,
  },
  {
    title: 'Lead Generation Funnels',
    description: 'We design optimized lead generation funnels that capture, nurture, and convert prospects into paying customers.',
    deliverables: ['Funnel strategy', 'Landing page design', 'Lead capture forms', 'Email / WhatsApp automation', 'Conversion optimization'],
    cta: 'Build My Funnel',
    image: serviceFunnels,
  },
  {
    title: 'Website & Landing Page Design',
    description: 'We build modern, conversion-focused websites and landing pages designed to turn visitors into leads and customers.',
    deliverables: ['Website design', 'Landing page design', 'Mobile optimization', 'Fast loading performance', 'SEO-friendly structure'],
    cta: 'Get a High-Converting Website',
    image: serviceWebsite,
  },
  {
    title: 'Performance Marketing Strategy',
    description: 'A data-driven marketing strategy designed to scale your business through the right channels, campaigns, and growth frameworks.',
    deliverables: ['Marketing audit', 'Growth strategy', 'Channel selection', 'Campaign roadmap', 'Performance tracking'],
    cta: 'Get a Growth Strategy',
    image: serviceStrategy,
  },
];

const ServiceBlock = ({ service, index }: { service: typeof services[0]; index: number }) => {
  const { open } = useContactDialog();
  const isReversed = index % 2 !== 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="py-16 md:py-24"
    >
      <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 lg:gap-16 items-center`}>
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="w-full lg:w-1/2"
        >
          <div className="relative group rounded-2xl overflow-hidden">
            <img
              src={service.image}
              alt={service.title}
              className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            {/* Glow border on hover */}
            <div className="absolute inset-0 rounded-2xl border border-foreground/10 group-hover:border-hydro/30 transition-colors duration-500" />
          </div>
        </motion.div>

        {/* Content */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold bg-hydro/10 text-hydro border border-hydro/20 mb-4">
              Service {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-3">{service.title}</h3>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{service.description}</p>
          </div>

          {/* Deliverables */}
          <div className="space-y-2.5">
            {service.deliverables.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-hydro/10 border border-hydro/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-hydro" />
                </div>
                <span className="text-foreground/80 text-sm">{item}</span>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => open(service.cta)}
            className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full text-sm font-semibold bg-gradient-to-r from-hydro to-blaze text-white hover:shadow-[0_0_40px_hsl(var(--hydro)/0.4)] transition-all duration-500 hover:scale-105"
          >
            {service.cta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ServicesSection = () => {
  const { open } = useContactDialog();

  return (
    <section className="relative z-10 overflow-hidden">
      {/* Page Hero */}
      <div className="relative py-24 md:py-36 px-6 md:px-12 lg:px-16 overflow-hidden">
        {/* Ambient bg */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.08]"
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
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-hydro/10 text-hydro border border-hydro/20 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Our Services
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            Digital Marketing Services
            <br />
            That Drive <span className="text-gradient">Real Growth</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed mb-10"
          >
            HydroBlaze Media provides performance-driven digital marketing solutions designed to generate leads, increase sales, and scale businesses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <button
              onClick={() => open("Book a Free Strategy Call")}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold bg-gradient-to-r from-hydro to-blaze text-white hover:shadow-[0_0_40px_hsl(var(--hydro)/0.4)] transition-all duration-500 hover:scale-105"
            >
              Book a Free Strategy Call
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Service Blocks */}
      <div className="px-6 md:px-12 lg:px-16">
        <div className="max-w-6xl mx-auto divide-y divide-foreground/5">
          {services.map((service, index) => (
            <ServiceBlock key={service.title} service={service} index={index} />
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-6 md:px-12 lg:px-16 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative bg-card/50 backdrop-blur-sm border border-foreground/10 rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-hydro/5 via-transparent to-blaze/5 pointer-events-none" />
            <div className="relative space-y-6">
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
                Ready to Scale <span className="text-gradient">Your Business?</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg">
                Partner with HydroBlaze Media and start generating consistent leads and measurable growth.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => open("Book Free Strategy Call")}
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold bg-gradient-to-r from-hydro to-blaze text-white hover:shadow-[0_0_40px_hsl(var(--hydro)/0.4)] transition-all duration-500 hover:scale-105"
                >
                  Book Free Strategy Call
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                </button>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-sm font-semibold border border-foreground/10 hover:border-foreground/20 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
