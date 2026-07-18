import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Smartphone, Camera, TrendingUp, Palette,
  Droplets, Flame, Target, Users, Shield, MessageCircle,
  BarChart3, MousePointerClick, Eye, Percent
} from 'lucide-react';
import { useContactDialog } from '@/components/ContactFormDialog';

/* ── What We Do ── */
const quickServices = [
  { icon: Smartphone, label: 'Social Media Management', desc: 'Consistent presence with structured execution', color: 'hydro' as const },
  { icon: Camera, label: 'Content Production', desc: 'High-quality content built for reels & ads', color: 'blaze' as const },
  { icon: TrendingUp, label: 'Performance Marketing', desc: 'Paid campaigns that scale with control', color: 'hydro' as const },
  { icon: Palette, label: 'Branding & Creatives', desc: 'Professional design that builds trust', color: 'blaze' as const },
];

const colorMap = {
  hydro: { border: 'hover:border-hydro/30', bg: 'from-hydro/5', icon: 'text-hydro' },
  blaze: { border: 'hover:border-blaze/30', bg: 'from-blaze/5', icon: 'text-blaze' },
};

/* ── Results ── */
const results = [
  { icon: BarChart3, metric: '3.5x', label: 'Average ROAS', color: 'text-hydro' },
  { icon: MousePointerClick, metric: '150%', label: 'Lead Increase', color: 'text-blaze' },
  { icon: Eye, metric: '2M+', label: 'Impressions Delivered', color: 'text-hydro' },
  { icon: Percent, metric: '40%', label: 'Lower Cost Per Lead', color: 'text-blaze' },
];

/* ── Why HydroBlaze ── */
const reasons = [
  { icon: Target, title: 'Strategy-First Approach', desc: 'Every campaign starts with research and a clear growth roadmap.' },
  { icon: MessageCircle, title: 'Clear Communication', desc: 'Regular updates, transparent reporting, and direct access to your team.' },
  { icon: TrendingUp, title: 'Performance-Focused Execution', desc: 'We optimize for results — not vanity metrics.' },
  { icon: Users, title: 'Limited Clients = Better Quality', desc: 'We work with select brands to deliver undivided attention and superior results.' },
];

const PagePreviewSection = () => {
  const { open } = useContactDialog();

  return (
    <div className="relative z-10 home-sections">

      {/* ═══ WHAT WE DO ═══ */}
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-hydro/10 text-hydro border border-hydro/20 mb-5">
              <Shield className="w-3.5 h-3.5" />
              What We Do
            </span>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <h2 className="font-display text-3xl md:text-5xl font-bold leading-[1.05] tracking-[-0.025em]">
                Growth Services Built
                <br />
                <span className="text-gradient">for Execution.</span>
              </h2>
              <Link to="/services" className="group inline-flex items-center gap-2 text-sm text-hydro hover:text-hydro-glow transition-colors shrink-0">
                View all services
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickServices.map((service, i) => {
              const colors = colorMap[service.color];
              return (
                <motion.div
                  key={service.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className={`group relative p-6 md:p-7 rounded-2xl border border-foreground/10 bg-card/50 backdrop-blur-sm ${colors.border} transition-all duration-500 cursor-pointer overflow-hidden hover:shadow-[0_20px_60px_-20px_hsl(var(--hydro)/0.25)]`}
                >
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b ${colors.bg} to-transparent pointer-events-none`} />
                  <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `linear-gradient(135deg, hsl(var(--${service.color})/0.4), transparent 60%)`, WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '1px' }} />
                  <service.icon className={`w-8 h-8 mb-4 ${colors.icon} opacity-80 group-hover:opacity-100 transition-opacity relative z-10`} />
                  <p className="font-display font-semibold text-base mb-2 tracking-[-0.01em] relative z-10">{service.label}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed relative z-10">{service.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ HOW WE WORK ═══ */}
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-16 border-t border-foreground/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-hydro/10 text-hydro border border-hydro/20 mb-5">
              <Droplets className="w-3.5 h-3.5" />
              <Flame className="w-3.5 h-3.5 text-blaze" />
              Our System
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.025em]">
              Our System, Not <span className="text-gradient">Guesswork.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative p-8 md:p-10 rounded-2xl border border-foreground/10 bg-card/50 backdrop-blur-sm hover:border-hydro/30 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-hydro/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-hydro/10 border border-hydro/20 flex items-center justify-center mb-5">
                  <Droplets className="w-6 h-6 text-hydro" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3 text-gradient-hydro">Hydro Strategy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We plan before we execute. Every move is backed by data and intent — from audience research to channel selection, nothing is left to chance.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group relative p-8 md:p-10 rounded-2xl border border-foreground/10 bg-card/50 backdrop-blur-sm hover:border-blaze/30 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blaze/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blaze/10 border border-blaze/20 flex items-center justify-center mb-5">
                  <Flame className="w-6 h-6 text-blaze" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3 text-gradient-blaze">Blaze Creative</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We create content designed to perform — not just fill your feed. Every asset is crafted to stop scrolls and drive conversions.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ RESULTS / PROOF ═══ */}
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-16 border-t border-foreground/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-blaze/10 text-blaze border border-blaze/20 mb-5">
              <BarChart3 className="w-3.5 h-3.5" />
              Results
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.025em] mb-4">
              Built for Results, <span className="text-gradient-blaze">Not Just Aesthetics.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg">
              Real performance metrics from campaigns we've managed across industries.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {results.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative p-6 md:p-8 rounded-2xl border border-foreground/10 bg-card/50 backdrop-blur-sm text-center overflow-hidden group hover:border-foreground/20 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.02] to-transparent pointer-events-none" />
                <r.icon className={`w-7 h-7 mx-auto mb-4 ${r.color} opacity-70`} />
                <p className="font-display text-3xl md:text-4xl font-bold mb-2">{r.metric}</p>
                <p className="text-muted-foreground text-sm">{r.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY HYDROBLAZE ═══ */}
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-16 border-t border-foreground/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-hydro/10 text-hydro border border-hydro/20 mb-5">
              <Shield className="w-3.5 h-3.5" />
              Why Us
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.025em]">
              Why Brands <span className="text-gradient">Choose Us.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            {reasons.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group flex gap-5 p-6 rounded-2xl border border-foreground/10 bg-card/50 backdrop-blur-sm hover:border-hydro/20 transition-all duration-500"
              >
                <div className="w-11 h-11 rounded-xl bg-hydro/10 border border-hydro/20 flex items-center justify-center shrink-0">
                  <r.icon className="w-5 h-5 text-hydro" />
                </div>
                <div>
                  <p className="font-display font-semibold text-base mb-1">{r.title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="px-6 md:px-12 lg:px-16 py-20 md:py-28 border-t border-foreground/5">
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
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.025em]">
                Ready to Scale <span className="text-gradient">Your Brand?</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg">
                Let's build something that actually grows your business — not just your feed.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => open("Start Project - Home")}
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold bg-gradient-to-r from-hydro to-blaze text-white hover:shadow-[0_0_40px_hsl(var(--hydro)/0.4)] transition-all duration-500 hover:scale-105"
                >
                  Start Project
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                </button>
                <button
                  onClick={() => open("Book a Call - Home")}
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-sm font-semibold border border-foreground/10 hover:border-foreground/20 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  Book a Call
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default PagePreviewSection;
