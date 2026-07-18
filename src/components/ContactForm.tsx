import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  email: z.string().trim().email('Please enter a valid email').max(255, 'Email must be under 255 characters'),
  phone: z.string().trim().min(1, 'Phone number is required').max(20, 'Phone must be under 20 characters').regex(/^[\d\s+\-()]+$/, 'Please enter a valid phone number'),
  message: z.string().trim().min(1, 'Message is required').max(1000, 'Message must be under 1000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;
type FormErrors = Partial<Record<keyof ContactFormData, string>>;

const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFormData, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Live-revalidate the field if it has been touched
    if (touched[field]) {
      const next = { ...formData, [field]: value };
      const result = contactSchema.safeParse(next);
      const fieldError = !result.success
        ? result.error.issues.find(err => err.path[0] === field)?.message
        : undefined;
      setErrors(prev => ({ ...prev, [field]: fieldError }));
    } else if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof ContactFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldError = result.error.issues.find(err => err.path[0] === field)?.message;
      setErrors(prev => ({ ...prev, [field]: fieldError }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach(err => {
        const field = err.path[0] as keyof ContactFormData;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setTouched({ name: true, email: true, phone: true, message: true });
      // Scroll to first error field
      const firstErrorField = Object.keys(fieldErrors)[0];
      if (firstErrorField) {
        document.getElementById(`contact-${firstErrorField}`)?.focus();
      }
      return;
    }

    // Build WhatsApp message
    const text = `Hi, I'm ${encodeURIComponent(result.data.name)}.%0A%0AEmail: ${encodeURIComponent(result.data.email)}%0APhone: ${encodeURIComponent(result.data.phone)}%0A%0A${encodeURIComponent(result.data.message)}`;
    window.open(`https://wa.me/919999999999?text=${text}`, '_blank');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="contact" className="relative z-10 py-24 md:py-32 px-6 md:px-12 lg:px-16">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card relative overflow-hidden p-12 md:p-14 rounded-3xl text-center border border-hydro/20"
          >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-hydro/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 right-0 w-80 h-80 rounded-full bg-blaze/15 blur-3xl" />

            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }}
              className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-hydro to-blaze shadow-[0_0_40px_hsl(var(--hydro)/0.5)]"
            >
              <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="relative"
            >
              <span className="badge-glow mb-4 inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Submission received
              </span>
              <h3 className="font-display text-3xl md:text-4xl font-bold mb-3">
                Thanks for reaching out
              </h3>
              <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-md mx-auto">
                Your message is in. Our team will get back to you within <span className="text-foreground font-medium">24 hours</span>.
              </p>
            </motion.div>

            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', phone: '', message: '' });
                setErrors({});
                setTouched({});
              }}
              className="relative inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium border border-foreground/15 bg-foreground/5 hover:bg-foreground/10 hover:border-foreground/25 transition-all duration-300"
            >
              Send another message
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  const inputClass = (hasError?: boolean) =>
    `w-full px-4 py-3 rounded-xl bg-white/5 border ${
      hasError
        ? 'border-destructive/50 focus:border-destructive/70 focus:ring-1 focus:ring-destructive/30'
        : 'border-white/10 focus:border-hydro/50 focus:ring-1 focus:ring-hydro/30'
    } text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all`;

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <section id="contact" className="relative z-10 py-24 md:py-32 px-6 md:px-12 lg:px-16">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left - Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <span className="badge-glow mb-6 w-fit">Get in Touch</span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Let's <span className="text-gradient">ignite</span> your brand
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              Ready to transform your digital presence? Fill out the form and we'll craft a strategy tailored to your goals.
            </p>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>✦ Response within 24 hours</p>
              <p>✦ Free initial consultation</p>
              <p>✦ No commitment required</p>
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.form
            onSubmit={handleSubmit}
            noValidate
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass-card p-6 md:p-8 rounded-2xl space-y-5"
          >
            {/* Error summary */}
            <AnimatePresence>
              {errorCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-sm"
                >
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-destructive">
                    Please fix the {errorCount} {errorCount === 1 ? 'error' : 'errors'} below to continue.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name */}
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium mb-2">Name</label>
              <input
                id="contact-name"
                type="text"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="Your full name"
                className={inputClass(!!errors.name)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'contact-name-error' : undefined}
                maxLength={100}
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    id="contact-name-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1.5 text-xs text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium mb-2">Email</label>
              <input
                id="contact-email"
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                className={inputClass(!!errors.email)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'contact-email-error' : undefined}
                maxLength={255}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    id="contact-email-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1.5 text-xs text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="contact-phone" className="block text-sm font-medium mb-2">Phone</label>
              <input
                id="contact-phone"
                type="tel"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="+91 98765 43210"
                className={inputClass(!!errors.phone)}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                maxLength={20}
              />
              <AnimatePresence>
                {errors.phone && (
                  <motion.p
                    id="contact-phone-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1.5 text-xs text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Message */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="contact-message" className="block text-sm font-medium">Message</label>
                <span className="text-xs text-muted-foreground/70">{formData.message.length}/1000</span>
              </div>
              <textarea
                id="contact-message"
                value={formData.message}
                onChange={e => handleChange('message', e.target.value)}
                onBlur={() => handleBlur('message')}
                placeholder="Tell us about your project, goals, and budget..."
                rows={4}
                className={`${inputClass(!!errors.message)} resize-none`}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                maxLength={1000}
              />
              <AnimatePresence>
                {errors.message && (
                  <motion.p
                    id="contact-message-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1.5 text-xs text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" /> {errors.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-display font-semibold text-sm bg-gradient-to-r from-hydro to-blaze text-white hover:shadow-[0_0_30px_hsl(var(--hydro)/0.4)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              Send Message <Send className="w-4 h-4" />
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
