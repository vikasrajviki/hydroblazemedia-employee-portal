import Navbar from '@/components/Navbar';
import PortfolioSection from '@/components/PortfolioSection';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';

const Portfolio = () => {
  return (
    <PageTransition>
      <div className="noise-overlay" />
      <Navbar />
      <main className="pt-24">
        <PortfolioSection />
        <Footer />
      </main>
    </PageTransition>
  );
};

export default Portfolio;
