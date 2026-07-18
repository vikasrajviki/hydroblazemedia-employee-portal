import Navbar from '@/components/Navbar';
import PricingSection from '@/components/PricingSection';
import ServiceComparison from '@/components/ServiceComparison';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';

const Pricing = () => {
  return (
    <PageTransition>
      <div className="noise-overlay" />
      <Navbar />
      <main className="pt-24">
        <PricingSection />
        <section className="relative z-10 px-6 md:px-12 lg:px-16 -mt-8">
          <div className="max-w-7xl mx-auto">
            <ServiceComparison />
          </div>
        </section>
        <Footer />
      </main>
    </PageTransition>
  );
};

export default Pricing;
