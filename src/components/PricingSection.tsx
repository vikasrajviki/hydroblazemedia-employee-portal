import { motion } from 'framer-motion';
import { Check, X, Sparkles, Camera, Target, Palette, Globe, Zap, ArrowRight, MessageCircle } from 'lucide-react';
import { useContactDialog } from '@/components/ContactFormDialog';

const PricingSection = () => {
  const { open } = useContactDialog();

  return (
    <section className="relative z-10 overflow-hidden">
      {/* ── Page Hero ── */}
      <div className="relative py-24 md:py-36 px-6 md:px-12 lg:px-16 overflow-hidden">
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
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-blaze/10 text-blaze border border-blaze/20 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Pricing
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            Transparent Pricing.
            <br />
            <span className="text-gradient">No Surprises.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed mb-10"
          >
            Choose the plan that fits your growth stage. No hidden fees, no long-term contracts — just results-driven marketing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <button
              onClick={() => open("Book a Free Strategy Call - Pricing")}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold bg-gradient-to-r from-hydro to-blaze text-white hover:shadow-[0_0_40px_hsl(var(--hydro)/0.4)] transition-all duration-500 hover:scale-105"
            >
              Book a Free Strategy Call
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">

          {/* Social Media Management */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-20"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blaze/10 border border-blaze/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blaze" />
              </div>
              <div>
                <h3 className="font-display text-xl md:text-2xl font-semibold">Social Media Management</h3>
                <span className="text-xs text-muted-foreground">Monthly Retainer</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Starter */}
              <div className="relative bg-card/50 backdrop-blur-sm border border-foreground/10 hover:border-hydro/20 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1">
                <div className="mb-5">
                  <span className="inline-flex px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold bg-hydro/10 text-hydro border border-hydro/20">Starter</span>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-3xl font-display font-bold">₹15,000</span>
                    <span className="text-muted-foreground text-sm">/ month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Best for small/local businesses</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-hydro shrink-0" /> 8 Static Posts</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-hydro shrink-0" /> 4 Reels</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-hydro shrink-0" /> Content calendar</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-hydro shrink-0" /> Basic captions & hashtags</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-hydro shrink-0" /> Instagram + Facebook</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-hydro shrink-0" /> Monthly performance report</li>
                  <li className="flex items-center gap-2.5 text-sm text-muted-foreground"><X className="w-4 h-4 shrink-0" /> Ads not included</li>
                  <li className="flex items-center gap-2.5 text-sm text-muted-foreground"><X className="w-4 h-4 shrink-0" /> Shoot not included</li>
                </ul>
              </div>

              {/* Growth */}
              <div className="relative bg-card/50 backdrop-blur-sm border-2 border-blaze/40 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_40px_hsl(var(--blaze)/0.15)]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blaze to-blaze-glow text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-full">Most Popular</span>
                </div>
                <div className="mb-5">
                  <span className="inline-flex px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold bg-blaze/10 text-blaze border border-blaze/20">Growth</span>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-3xl font-display font-bold">₹25,000</span>
                    <span className="text-muted-foreground text-sm">/ month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Best for growing brands</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-blaze shrink-0" /> 12 Static Posts</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-blaze shrink-0" /> 8 Reels</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-blaze shrink-0" /> Content strategy</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-blaze shrink-0" /> Captions + hashtag research</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-blaze shrink-0" /> Instagram + Facebook</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-blaze shrink-0" /> Basic community management</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-blaze shrink-0" /> Monthly report</li>
                  <li className="flex items-center gap-2.5 text-sm text-hydro"><Zap className="w-4 h-4 shrink-0" /> Add-on: Shoot ₹8k–₹12k</li>
                </ul>
              </div>

              {/* Premium */}
              <div className="relative bg-card/50 backdrop-blur-sm border border-foreground/10 hover:border-hydro/20 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1">
                <div className="mb-5">
                  <span className="inline-flex px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold bg-hydro/10 text-hydro border border-hydro/20">Premium</span>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-3xl font-display font-bold">₹40,000</span>
                    <span className="text-muted-foreground text-sm">/ month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Best for serious brands</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-hydro shrink-0" /> 16–20 Posts (Static + Reels)</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-hydro shrink-0" /> Advanced content strategy</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-hydro shrink-0" /> Trend-based reel planning</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-hydro shrink-0" /> Instagram + Facebook</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-hydro shrink-0" /> Full community management</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-hydro shrink-0" /> Monthly analytics + insights</li>
                  <li className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 text-hydro shrink-0" /> Priority support</li>
                  <li className="flex items-center gap-2.5 text-sm text-blaze"><Check className="w-4 h-4 shrink-0" /> Includes 1 shoot/month</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Content Shoot & Meta Ads */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="bg-card/50 backdrop-blur-sm border border-foreground/10 hover:border-hydro/20 p-6 md:p-8 rounded-2xl transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-hydro/10 border border-hydro/20 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-hydro" />
                </div>
                <h3 className="font-display text-lg font-semibold">Content Shoot Pricing</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-foreground/5">
                  <div>
                    <p className="font-medium">Basic Shoot</p>
                    <p className="text-sm text-muted-foreground">2–3 hours, mobile, reels + photos</p>
                  </div>
                  <span className="text-hydro font-bold font-display">₹8,000</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-foreground/5">
                  <div>
                    <p className="font-medium">Standard Shoot</p>
                    <p className="text-sm text-muted-foreground">Half-day, reels-focused, trend content</p>
                  </div>
                  <span className="text-hydro font-bold font-display">₹12,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Premium Shoot</p>
                    <p className="text-sm text-muted-foreground">Full-day, cinematic shots, multiple formats</p>
                  </div>
                  <span className="text-hydro font-bold font-display">₹18,000+</span>
                </div>
                <p className="text-xs text-muted-foreground pt-2">Travel charges extra if outside city</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-card/50 backdrop-blur-sm border border-foreground/10 hover:border-blaze/20 p-6 md:p-8 rounded-2xl transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blaze/10 border border-blaze/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-blaze" />
                </div>
                <h3 className="font-display text-lg font-semibold">Meta Ads Management</h3>
              </div>
              <div className="space-y-4">
                <div className="pb-4 border-b border-foreground/5">
                  <p className="font-medium mb-2">Ads Setup (One-Time)</p>
                  <p className="text-sm text-muted-foreground">Campaign setup, creatives, audience research</p>
                  <span className="text-blaze font-bold font-display">₹5,000</span>
                </div>
                <div>
                  <p className="font-medium mb-3">Monthly Ads Management</p>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Ad budget up to ₹30,000</span><span className="text-blaze font-bold font-display">₹7,000</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Ad budget up to ₹75,000</span><span className="text-blaze font-bold font-display">₹10,000</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Ad budget ₹1L+</span><span className="text-blaze font-bold font-display">₹15,000</span></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pt-2">Includes: Campaign creation, audience targeting, creative testing, weekly optimisation, lead tracking</p>
              </div>
            </motion.div>
          </div>

          {/* Lead Gen, Branding, Website */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="bg-card/50 backdrop-blur-sm border border-foreground/10 hover:border-hydro/20 p-6 md:p-8 rounded-2xl transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-hydro/10 border border-hydro/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-hydro" />
                </div>
                <h3 className="font-display text-lg font-semibold">Lead Generation</h3>
              </div>
              <div className="space-y-4">
                <div className="pb-3 border-b border-foreground/5">
                  <p className="font-medium">Local Leads</p>
                  <p className="text-xs text-muted-foreground">Service / Store</p>
                  <span className="text-hydro font-bold font-display text-sm">₹12,000 + ad spend</span>
                </div>
                <div className="pb-3 border-b border-foreground/5">
                  <p className="font-medium">High-Intent Leads</p>
                  <p className="text-xs text-muted-foreground">Real Estate, Education, Clinics</p>
                  <span className="text-hydro font-bold font-display text-sm">₹18,000 + ad spend</span>
                </div>
                <div>
                  <p className="font-medium">Performance-Based</p>
                  <p className="text-xs text-muted-foreground">Fixed fee + per qualified lead</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-card/50 backdrop-blur-sm border border-foreground/10 hover:border-blaze/20 p-6 md:p-8 rounded-2xl transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blaze/10 border border-blaze/20 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-blaze" />
                </div>
                <h3 className="font-display text-lg font-semibold">Branding & Creatives</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Logo Design</span><span className="text-blaze font-bold font-display">₹5k–₹12k</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Brand Kit</span><span className="text-blaze font-bold font-display">₹15,000</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Poster / Banner</span><span className="text-blaze font-bold font-display">₹500–₹1k</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Reel Editing</span><span className="text-blaze font-bold font-display">₹800–₹1.5k</span></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="bg-card/50 backdrop-blur-sm border border-foreground/10 hover:border-hydro/20 p-6 md:p-8 rounded-2xl transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-hydro/10 border border-hydro/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-hydro" />
                </div>
                <h3 className="font-display text-lg font-semibold">Website Services</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Landing Page</span><span className="text-hydro font-bold font-display">₹8k–₹15k</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Business Website (5 pages)</span><span className="text-hydro font-bold font-display">₹20k–₹35k</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Website + Lead Form + Pixel</span><span className="text-hydro font-bold font-display">₹40,000+</span></div>
              </div>
            </motion.div>
          </div>

          {/* Recommended Combo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-20"
          >
            <div className="relative bg-card/50 backdrop-blur-sm border-2 border-blaze/30 rounded-3xl p-8 md:p-12 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blaze/5 via-transparent to-hydro/5 pointer-events-none" />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blaze/10 border border-blaze/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blaze" />
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-semibold">Recommended Combo</h3>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl md:text-5xl font-display font-bold text-gradient">₹30,000</span>
                    <span className="text-muted-foreground">/ month</span>
                  </div>
                  <p className="text-lg font-medium mb-5">Growth Combo</p>
                  <ul className="space-y-2.5 text-sm">
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blaze shrink-0" /> Social Media (Growth Plan)</li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blaze shrink-0" /> 1 Content Shoot</li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blaze shrink-0" /> Meta Ads Management (up to ₹30k spend)</li>
                  </ul>
                </div>
                <div className="md:text-right space-y-3">
                  <p className="text-sm text-muted-foreground">This is your sweet spot retainer</p>
                  <button
                    onClick={() => open("Get Started - Growth Combo")}
                    className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold bg-gradient-to-r from-hydro to-blaze text-white hover:shadow-[0_0_40px_hsl(var(--hydro)/0.4)] transition-all duration-500 hover:scale-105"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Final CTA ── */}
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
                Ready to <span className="text-gradient">Scale Your Business?</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg">
                Partner with HydroBlaze Media and start generating consistent leads and measurable growth.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => open("Book Free Strategy Call - Pricing")}
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

export default PricingSection;
