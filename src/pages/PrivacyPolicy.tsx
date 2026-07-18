import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <PageTransition>
      <div className="noise-overlay" />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-muted-foreground mb-12">Effective Date: April 3, 2026</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-sm md:prose-base max-w-none
              prose-headings:font-display prose-headings:text-foreground prose-headings:font-bold
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-li:text-muted-foreground
              prose-strong:text-foreground
              prose-a:text-hydro prose-a:no-underline hover:prose-a:underline"
          >
            <h2>1. Introduction</h2>
            <p>
              HydroBlaze Media ("we," "us," or "our") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website hydroblazemedia.com, engage our services, or otherwise interact with us. Please read this policy carefully. If you disagree with its terms, please discontinue use of our site and services.
            </p>

            <h2>2. Information We Collect</h2>

            <h3>2.1 Information You Provide Directly</h3>
            <p>We collect information you voluntarily provide when you:</p>
            <ul>
              <li>Fill out contact or inquiry forms</li>
              <li>Request a quote, proposal, or consultation</li>
              <li>Sign a contract or statement of work</li>
              <li>Correspond with us via email, phone, or other channels</li>
              <li>Subscribe to our newsletter or marketing communications</li>
            </ul>
            <p>
              This may include your name, email address, phone number, company name, job title, billing and payment information, and project-related details.
            </p>

            <h3>2.2 Information Collected Automatically</h3>
            <p>When you visit our website, we may automatically collect certain technical information, including:</p>
            <ul>
              <li>IP address and general geographic location</li>
              <li>Browser type, version, and device information</li>
              <li>Pages visited, time spent, and referring URLs</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3>2.3 Information from Third Parties</h3>
            <p>
              We may receive information about you from third-party sources such as business partners, referral networks, or publicly available sources, which we combine with information we already hold.
            </p>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li>To respond to your inquiries and provide requested services</li>
              <li>To prepare proposals, contracts, and project deliverables</li>
              <li>To process payments and manage billing</li>
              <li>To communicate updates, project status, and relevant news</li>
              <li>To send marketing communications (where you have consented)</li>
              <li>To improve our website, services, and client experience</li>
              <li>To comply with legal obligations and enforce our agreements</li>
              <li>To detect and prevent fraud or misuse of our services</li>
            </ul>

            <h2>4. Legal Basis for Processing</h2>
            <p>Where applicable under data protection law (including GDPR), we process your personal data on the following legal bases:</p>
            <ul>
              <li><strong>Contractual necessity</strong> — to perform services you have engaged us for</li>
              <li><strong>Legitimate interests</strong> — to operate and improve our business</li>
              <li><strong>Consent</strong> — for marketing communications and optional data uses</li>
              <li><strong>Legal obligation</strong> — to comply with applicable laws and regulations</li>
            </ul>

            <h2>5. How We Share Your Information</h2>
            <p>We do not sell your personal information. We may share your information with:</p>

            <h3>5.1 Service Providers</h3>
            <p>
              Trusted third-party vendors who assist us in operating our business (e.g., cloud hosting, accounting software, project management tools, email platforms). These providers are contractually bound to protect your data and use it only as directed by us.
            </p>

            <h3>5.2 Professional Advisors</h3>
            <p>
              Lawyers, accountants, and other professional advisors where necessary to obtain advice or services in connection with our business operations.
            </p>

            <h3>5.3 Legal Requirements</h3>
            <p>
              We may disclose your information if required to do so by law, court order, or governmental authority, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
            </p>

            <h3>5.4 Business Transfers</h3>
            <p>
              In the event of a merger, acquisition, or sale of all or part of our business, your information may be transferred as part of that transaction. We will notify you of any such change.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfil the purposes outlined in this policy, unless a longer retention period is required or permitted by law. Client project data is typically retained for a minimum of 7 years in accordance with financial and contractual record-keeping requirements. You may request deletion of your data subject to our legal obligations.
            </p>

            <h2>7. Your Rights</h2>
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul>
              <li><strong>Right to access</strong> — request a copy of the data we hold about you</li>
              <li><strong>Right to rectification</strong> — request correction of inaccurate data</li>
              <li><strong>Right to erasure</strong> — request deletion of your personal data</li>
              <li><strong>Right to restrict processing</strong> — request we limit how we use your data</li>
              <li><strong>Right to data portability</strong> — receive your data in a structured format</li>
              <li><strong>Right to object</strong> — object to processing based on legitimate interests</li>
              <li><strong>Right to withdraw consent</strong> — where processing is based on consent</li>
            </ul>
            <p>To exercise any of these rights, please contact us at the details provided in Section 11. We will respond within 30 days.</p>

            <h2>8. Cookies and Tracking Technologies</h2>
            <p>
              Our website uses cookies and similar technologies to enhance your browsing experience, analyse site traffic, and support our marketing activities. You can control cookie preferences through your browser settings. Disabling certain cookies may affect website functionality.
            </p>
            <p>We use the following types of cookies:</p>
            <ul>
              <li><strong>Essential cookies</strong> — necessary for the website to function</li>
              <li><strong>Analytics cookies</strong> — help us understand how visitors use the site</li>
              <li><strong>Marketing cookies</strong> — used to deliver relevant advertisements (where applicable)</li>
            </ul>

            <h2>9. Data Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, loss, destruction, or alteration. These include encrypted communications (SSL/TLS), access controls, and regular security reviews.
            </p>
            <p>
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>

            <h2>10. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>

            <h2>11. Contact Us</h2>
            <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
            <p>
              <strong>HydroBlaze Media</strong><br />
              Email: <a href="mailto:info@hydroblazemedia.com">info@hydroblazemedia.com</a><br />
              Website: <a href="https://hydroblazemedia.com">hydroblazemedia.com</a>
            </p>

            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the revised policy on our website with an updated effective date. Your continued use of our services after any changes constitutes your acceptance of the updated policy.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-8">Last updated: April 3, 2026 — HydroBlaze Media</p>
          </motion.div>
        </div>
        <Footer />
      </main>
    </PageTransition>
  );
};

export default PrivacyPolicy;
