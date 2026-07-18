import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const features = [
  { name: 'Static Posts', starter: '8', growth: '12', premium: '16–20' },
  { name: 'Reels', starter: '4', growth: '8', premium: 'Included' },
  { name: 'Content Calendar', starter: true, growth: true, premium: true },
  { name: 'Content Strategy', starter: false, growth: true, premium: true },
  { name: 'Captions & Hashtags', starter: 'Basic', growth: 'Research-based', premium: 'Advanced' },
  { name: 'Platforms', starter: 'IG + FB', growth: 'IG + FB', premium: 'IG + FB' },
  { name: 'Community Management', starter: false, growth: 'Basic', premium: 'Full' },
  { name: 'Performance Report', starter: 'Monthly', growth: 'Monthly', premium: 'Monthly + Insights' },
  { name: 'Trend-Based Reel Planning', starter: false, growth: false, premium: true },
  { name: 'Priority Support', starter: false, growth: false, premium: true },
  { name: 'Content Shoot', starter: false, growth: 'Add-on ₹8k–₹12k', premium: '1 shoot/month' },
  { name: 'Ads Management', starter: false, growth: 'Add-on', premium: 'Add-on' },
];

const renderValue = (value: string | boolean) => {
  if (value === true) return <Check className="w-4 h-4 text-hydro mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-sm">{value}</span>;
};

const ServiceComparison = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-16"
    >
      <div className="flex items-center gap-3 mb-8">
        <h3 className="font-display text-xl md:text-2xl">Plan Comparison</h3>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 font-medium text-muted-foreground min-w-[180px]">Feature</th>
                <th className="text-center p-4 font-medium text-hydro min-w-[130px]">
                  <div>Starter</div>
                  <div className="text-xs text-muted-foreground font-normal mt-1">₹15,000/mo</div>
                </th>
                <th className="text-center p-4 font-medium text-blaze min-w-[130px]">
                  <div>Growth</div>
                  <div className="text-xs text-muted-foreground font-normal mt-1">₹25,000/mo</div>
                </th>
                <th className="text-center p-4 font-medium text-hydro min-w-[130px]">
                  <div>Premium</div>
                  <div className="text-xs text-muted-foreground font-normal mt-1">₹40,000/mo</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr
                  key={feature.name}
                  className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                    i % 2 === 0 ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  <td className="p-4 font-medium">{feature.name}</td>
                  <td className="p-4 text-center">{renderValue(feature.starter)}</td>
                  <td className="p-4 text-center">{renderValue(feature.growth)}</td>
                  <td className="p-4 text-center">{renderValue(feature.premium)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceComparison;
