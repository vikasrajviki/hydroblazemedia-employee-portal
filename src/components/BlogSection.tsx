import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, ExternalLink } from 'lucide-react';

interface Post {
  title: string;
  brief: string;
  slug: string;
  coverImage: { url: string } | null;
  publishedAt: string;
}

const HASHNODE_HOST = 'blog.hydroblazemedia.com';
const BLOG_URL = `https://${HASHNODE_HOST}`;

const query = `
  query {
    publication(host: "${HASHNODE_HOST}") {
      posts(first: 6) {
        edges {
          node {
            title
            brief
            slug
            coverImage { url }
            publishedAt
          }
        }
      }
    }
  }
`;

const fallbackPosts: Post[] = [
  { title: 'Why Your Content Strategy Needs a Data-First Approach', brief: "Most brands create content based on vibes. Here's why that's killing your growth and what to do instead.", slug: 'data-first-content-strategy', coverImage: null, publishedAt: '2026-01-25T00:00:00Z' },
  { title: 'The Anatomy of a Viral Reel: What Actually Works in 2026', brief: "We analyzed 500+ viral reels to find the patterns. Spoiler: it's not just about trends.", slug: 'anatomy-viral-reel', coverImage: null, publishedAt: '2026-01-20T00:00:00Z' },
  { title: 'Landing Pages That Convert: A Technical Deep Dive', brief: "From load times to CTA placement, here's everything you need to build pages that actually convert.", slug: 'landing-pages-convert', coverImage: null, publishedAt: '2026-01-15T00:00:00Z' },
];

const BlogSection = () => {
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
          setPosts(edges.map((e: any) => e.node).slice(0, 6));
        } else {
          setPosts(fallbackPosts);
        }
      })
      .catch(() => setPosts(fallbackPosts))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-16 relative" aria-label="Blog">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-hydro/10 text-hydro border border-hydro/20 mb-6">
            Blog
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Insights & <span className="text-gradient">Growth Strategies</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Strategy breakdowns, creative inspiration, and actionable insights from the HydroBlaze team.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
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
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <a
                  href={`${BLOG_URL}/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl bg-card/50 border border-foreground/10 backdrop-blur-sm overflow-hidden hover:border-hydro/30 transition-all duration-300 hover:-translate-y-1 h-full"
                >
                  {post.coverImage?.url ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.coverImage.url}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-hydro/20 to-blaze/20 flex items-center justify-center">
                      <span className="text-4xl font-display font-bold text-foreground/10">HB</span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-hydro transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {post.brief}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-hydro group-hover:gap-2.5 transition-all duration-300">
                      Read More <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </a>
              </motion.article>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href={BLOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium bg-gradient-to-r from-hydro to-blaze text-white hover:shadow-[0_0_30px_hsl(var(--hydro)/0.4)] transition-all duration-300"
          >
            View All Blogs <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;
