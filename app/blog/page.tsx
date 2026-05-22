import Link from 'next/link';
import { Leaf, ArrowLeft, ArrowUpRight, Calendar, Clock } from 'lucide-react';

const POSTS = [
  {
    title: 'Why I Built Cortex',
    excerpt: 'A personal finance app that actually works the way I think. The journey from idea to production.',
    date: 'May 2026',
    readTime: '5 min read',
    tag: 'Story',
  },
  {
    title: 'Building an AI That Manages Your Money',
    excerpt: 'How tool calling with Gemini and Groq turns natural language into database operations. A technical deep dive.',
    date: 'May 2026',
    readTime: '8 min read',
    tag: 'Technical',
  },
  {
    title: 'The Botanical Design System',
    excerpt: 'Earthy colors, organic shapes, and paper textures. Why I chose nature-inspired design for a finance app.',
    date: 'May 2026',
    readTime: '4 min read',
    tag: 'Design',
  },
  {
    title: 'Supabase + Next.js: The Perfect Stack',
    excerpt: 'Why I chose Supabase for auth, database, and real-time subscriptions. Plus the pitfalls I hit along the way.',
    date: 'May 2026',
    readTime: '6 min read',
    tag: 'Engineering',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-alabaster">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-forest transition-colors mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf size={16} className="text-sage" />
            <span className="text-xs text-sage font-medium tracking-[0.2em] uppercase">Blog</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-forest tracking-tight mb-4">
            Building Cortex
          </h1>
          <p className="text-text-secondary max-w-xl">
            Notes on design, engineering, and the journey of building a personal finance app with AI.
          </p>
        </div>

        <div className="space-y-6">
          {POSTS.map((post, i) => (
            <article key={i} className="group bg-white rounded-card border border-stone/50 p-6 md:p-8 hover:shadow-botanical-md hover:border-sage/20 transition-all duration-500 cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium text-sage bg-sage/10 px-2.5 py-1 rounded-full tracking-wider uppercase">{post.tag}</span>
                    <span className="flex items-center gap-1.5 text-xs text-mushroom">
                      <Calendar size={12} /> {post.date}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-mushroom">
                      <Clock size={12} /> {post.readTime}
                    </span>
                  </div>
                  <h2 className="font-serif text-xl font-semibold text-forest mb-2 group-hover:text-sage transition-colors duration-300">{post.title}</h2>
                  <p className="text-sm text-text-secondary leading-relaxed">{post.excerpt}</p>
                </div>
                <ArrowUpRight size={18} className="text-stone group-hover:text-sage transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0 mt-1" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
