import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';

interface Post {
  title: string;
  brief: string;
  slug: string;
  coverImage: { url: string } | null;
  publishedAt: string;
  tags: { name: string }[];
}

const HASHNODE_HOST = 'blog.hydroblazemedia.com';
const BLOG_URL = `https://${HASHNODE_HOST}`;

const query = `
  query {
    publication(host: "${HASHNODE_HOST}") {
      posts(first: 20) {
        edges {
          node {
            title
            brief
            slug
            coverImage { url }
            publishedAt
            tags { name }
          }
        }
      }
    }
  }
`;

const getCategoryColor = (category: string) => {
  const lower = category.toLowerCase();
  if (['strategy', 'marketing', 'growth', 'seo'].some(k => lower.includes(k))) return 'bg-hydro/10 text-hydro border-hydro/20';
  if (['creative', 'design', 'content', 'social'].some(k => lower.includes(k))) return 'bg-blaze/10 text-blaze border-blaze/20';
  if (['tech', 'web', 'development', 'code'].some(k => lower.includes(k))) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  return 'bg-foreground/5 text-muted-foreground border-foreground/10';
};

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://gql.hashnode.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
      .then(res => res.json())
      .then(data => {
        const edges = data?.data?.publication?.posts?.edges;
        if (edges?.length) {
          setPosts(edges.map((e: any) => e.node));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const featuredPosts = posts.slice(0, 2);
  const regularPosts = posts.slice(2);

  return (
    <PageTransition>
      <div className="noise-overlay" />
      <Navbar />

      <main className="pt-24">
        <section className="py-20 md:py-32 px-6 md:px-12 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-hydro/10 text-hydro border border-hydro/20 mb-6">
                <BookOpen className="w-3.5 h-3.5" />
                Blog
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Insights That <span className="text-gradient">Ignite</span> Growth
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
                Strategy breakdowns, creative inspiration, and technical deep-dives from the HydroBlaze team. No fluff, just actionable insights.
              </p>
            </motion.div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="rounded-2xl bg-card/50 border border-foreground/10 overflow-hidden animate-pulse">
                    <div className="h-48 bg-foreground/5" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-foreground/5 rounded w-1/3" />
                      <div className="h-5 bg-foreground/5 rounded w-full" />
                      <div className="h-4 bg-foreground/5 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg mb-4">No posts found.</p>
                <a href={BLOG_URL} target="_blank" rel="noopener noreferrer" className="text-hydro hover:underline">
                  Visit blog directly →
                </a>
              </div>
            ) : (
              <>
                {/* Featured */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {featuredPosts.map((post, index) => (
                    <motion.article key={post.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} className="group">
                      <a href={`${BLOG_URL}/${post.slug}`} target="_blank" rel="noopener noreferrer" className="block relative rounded-3xl bg-card/50 border border-foreground/10 backdrop-blur-sm overflow-hidden hover:border-hydro/30 transition-all duration-300 hover:-translate-y-1 h-full">
                        <span className="absolute top-6 right-6 z-10 px-3 py-1 rounded-full text-xs bg-gradient-to-r from-hydro/20 to-blaze/20 text-foreground border border-foreground/10">Featured</span>
                        {post.coverImage?.url ? (
                          <div className="h-56 overflow-hidden">
                            <img src={post.coverImage.url} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        ) : (
                          <div className="h-56 bg-gradient-to-br from-hydro/20 to-blaze/20" />
                        )}
                        <div className="p-8">
                          {post.tags?.[0] && (
                            <span className={`inline-block px-3 py-1 rounded-full text-xs border ${getCategoryColor(post.tags[0].name)} mb-4`}>{post.tags[0].name}</span>
                          )}
                          <h2 className="font-display text-2xl font-bold mb-3 group-hover:text-hydro transition-colors duration-300">{post.title}</h2>
                          <p className="text-muted-foreground mb-6 line-clamp-2">{post.brief}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                          </div>
                        </div>
                      </a>
                    </motion.article>
                  ))}
                </div>

                {/* Regular */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post, index) => (
                    <motion.article key={post.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} className="group">
                      <a href={`${BLOG_URL}/${post.slug}`} target="_blank" rel="noopener noreferrer" className="block rounded-2xl bg-card/50 border border-foreground/10 backdrop-blur-sm overflow-hidden hover:border-hydro/30 transition-all duration-300 hover:-translate-y-1 h-full">
                        {post.coverImage?.url ? (
                          <div className="h-48 overflow-hidden">
                            <img src={post.coverImage.url} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        ) : (
                          <div className="h-48 bg-gradient-to-br from-hydro/20 to-blaze/20 flex items-center justify-center">
                            <span className="text-4xl font-display font-bold text-foreground/10">HB</span>
                          </div>
                        )}
                        <div className="p-6">
                          {post.tags?.[0] && (
                            <span className={`inline-block px-3 py-1 rounded-full text-xs border ${getCategoryColor(post.tags[0].name)} mb-3`}>{post.tags[0].name}</span>
                          )}
                          <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-hydro transition-colors duration-300 line-clamp-2">{post.title}</h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.brief}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-hydro group-hover:gap-2 transition-all duration-300">
                              Read <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </a>
                    </motion.article>
                  ))}
                </div>
              </>
            )}

            {/* Newsletter CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-20 text-center p-8 md:p-12 rounded-3xl bg-gradient-to-br from-hydro/10 to-blaze/10 border border-foreground/10">
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">Get insights in your inbox</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Weekly breakdowns on strategy, creative, and growth. No spam, just value.</p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input type="email" placeholder="Enter your email" className="flex-1 px-5 py-3 rounded-full bg-background/50 border border-foreground/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-hydro transition-colors duration-300" />
                <button className="px-6 py-3 rounded-full text-sm font-medium bg-gradient-to-r from-hydro to-blaze text-white hover:shadow-[0_0_30px_hsl(var(--hydro)/0.4)] transition-all duration-300">Subscribe</button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
};

export default Blog;
