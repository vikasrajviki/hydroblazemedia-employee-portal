import { createContext, useContext, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Send, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

// Deployed Google Apps Script Web App URL
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzkex-NlLu7qDYzoEu5FvLILHLCTeNdYnml3x0BYYyFro4nvgJsPjAOJAezq2SP1b1zZA/exec';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  company: z.string().trim().max(100, 'Company name must be under 100 characters').optional().or(z.literal('')),
  email: z.string().trim().email('Please enter a valid email').max(255, 'Email must be under 255 characters'),
  phone: z.string().trim().min(1, 'Phone number is required').max(20, 'Phone must be under 20 characters').regex(/^[\d\s+\-()]+$/, 'Please enter a valid phone number'),
  message: z.string().trim().min(1, 'Message is required').max(1000, 'Message must be under 1000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;
type FormErrors = Partial<Record<keyof ContactFormData, string>>;

type ContactDialogContextType = { open: (source?: string) => void };
const ContactDialogContext = createContext<ContactDialogContextType>({ open: () => {} });
export const useContactDialog = () => useContext(ContactDialogContext);

export const ContactDialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({ name: '', company: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFormData, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [source, setSource] = useState<string>('');

  const open = useCallback((src?: string) => {
    setIsOpen(true);
    setSubmitted(false);
    setSource(src || 'Direct');
    setFormData({ name: '', company: '', email: '', phone: '', message: '' });
    setErrors({});
    setTouched({});
  }, []);

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach(err => {
        const field = err.path[0] as keyof ContactFormData;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setTouched({ name: true, company: true, email: true, phone: true, message: true });
      return;
    }

    setIsSubmitting(true);

    // Send to Google Sheets (fire and forget with no-cors)
    if (GOOGLE_SHEET_URL) {
      fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.data.name,
          company: result.data.company || '',
          email: result.data.email,
          phone: result.data.phone,
          message: result.data.message,
          source,
        }),
      }).catch(() => {});
    }

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const inputClass = (hasError?: boolean) =>
    `w-full px-4 py-3 rounded-xl bg-white/5 border ${
      hasError
        ? 'border-destructive/50 focus:border-destructive/70 focus:ring-1 focus:ring-destructive/30'
        : 'border-white/10 focus:border-hydro/50 focus:ring-1 focus:ring-hydro/30'
    } text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all`;

  const errorCount = Object.values(errors).filter(Boolean).length;

  const fieldError = (field: keyof ContactFormData) => (
    <AnimatePresence>
      {errors[field] && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="mt-1.5 text-xs text-destructive flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" /> {errors[field]}
        </motion.p>
      )}
    </AnimatePresence>
  );

  return (
    <ContactDialogContext.Provider value={{ open }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-xl border-foreground/10 rounded-2xl p-0 overflow-hidden">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative p-8 md:p-10 text-center overflow-hidden"
            >
              {/* Ambient glow */}
              <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-hydro/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 right-0 w-72 h-72 rounded-full bg-blaze/15 blur-3xl" />

              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 14 }}
                className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-hydro to-blaze shadow-[0_0_40px_hsl(var(--hydro)/0.5)]"
              >
                <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="relative"
              >
                <span className="badge-glow mb-3 inline-flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3 h-3" /> Submission received
                </span>
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl md:text-3xl font-bold">
                    Thanks for reaching out
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-2 text-base">
                    Your message is in. We'll get back to you within <span className="text-foreground font-medium">24 hours</span>.
                  </DialogDescription>
                </DialogHeader>
              </motion.div>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', company: '', email: '', phone: '', message: '' });
                  setErrors({});
                  setTouched({});
                }}
                className="relative mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border border-foreground/15 bg-foreground/5 hover:bg-foreground/10 hover:border-foreground/25 transition-all duration-300"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="p-6 md:p-8 space-y-5">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-bold">Let's <span className="text-gradient">ignite</span> your brand</DialogTitle>
                <DialogDescription className="text-muted-foreground">Fill out the form and we'll craft a strategy tailored to your goals.</DialogDescription>
              </DialogHeader>

              {/* Error summary */}
              <AnimatePresence>
                {errorCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-destructive">
                      Please fix the {errorCount} {errorCount === 1 ? 'error' : 'errors'} below.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor="dialog-name" className="block text-sm font-medium mb-2">Name</label>
                <input id="dialog-name" type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} onBlur={() => handleBlur('name')} placeholder="Your full name" className={inputClass(!!errors.name)} aria-invalid={!!errors.name} maxLength={100} />
                {fieldError('name')}
              </div>

              <div>
                <label htmlFor="dialog-company" className="block text-sm font-medium mb-2">Company Name</label>
                <input id="dialog-company" type="text" value={formData.company} onChange={e => handleChange('company', e.target.value)} onBlur={() => handleBlur('company')} placeholder="Your company or brand" className={inputClass(!!errors.company)} maxLength={100} />
                {fieldError('company')}
              </div>

              <div>
                <label htmlFor="dialog-email" className="block text-sm font-medium mb-2">Email</label>
                <input id="dialog-email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} placeholder="you@example.com" className={inputClass(!!errors.email)} aria-invalid={!!errors.email} maxLength={255} />
                {fieldError('email')}
              </div>

              <div>
                <label htmlFor="dialog-phone" className="block text-sm font-medium mb-2">Phone</label>
                <input id="dialog-phone" type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} onBlur={() => handleBlur('phone')} placeholder="+91 98765 43210" className={inputClass(!!errors.phone)} aria-invalid={!!errors.phone} maxLength={20} />
                {fieldError('phone')}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="dialog-message" className="block text-sm font-medium">Message</label>
                  <span className="text-xs text-muted-foreground/70">{formData.message.length}/1000</span>
                </div>
                <textarea id="dialog-message" value={formData.message} onChange={e => handleChange('message', e.target.value)} onBlur={() => handleBlur('message')} placeholder="Tell us about your project, goals, and budget..." rows={3} className={`${inputClass(!!errors.message)} resize-none`} aria-invalid={!!errors.message} maxLength={1000} />
                {fieldError('message')}
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-xl font-display font-semibold text-sm bg-gradient-to-r from-hydro to-blaze text-white hover:shadow-[0_0_30px_hsl(var(--hydro)/0.4)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <>Send Message <Send className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </ContactDialogContext.Provider>
  );
};
