import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { profile, posts } from './content';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import { ReadingProgress } from './components/PageNavigation';
import { ExternalLink, LinkArrow, ThemeToggle } from './components/Shared';
import { ThemeProvider } from './contexts/ThemeContext';
import type { PublishedPost } from './types';

function PageShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children: ReactNode }) {
  return <>
    <header className="inner-header" id="top"><div className="page-width"><a className="text-link home-link" href="/"><ArrowLeft size={15} aria-hidden="true" />{profile.author.name}</a></div><ThemeToggle /></header>
    <main id="main-content" tabIndex={-1} className="page-width inner-main"><div className="page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{children}</main>
  </>;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'Asia/Shanghai' }).format(new Date(value));
}

function Blog() {
  return <PageShell eyebrow="Notes & ideas" title="Blog" description="Thoughts on language models, machine learning, and the things I learn along the way.">
    {posts.length ? <div className="post-list">{posts.map(post => <article className="post-preview" key={post.url}><time dateTime={post.date}>{dateLabel(post.date)}</time><h2><a href={post.url}>{post.title}</a></h2><p>{post.description}</p><a href={post.url} className="text-link">Read note <ArrowRight size={14} aria-hidden="true" /></a></article>)}</div> : <div className="empty-notes"><BookOpen size={36} strokeWidth={1} aria-hidden="true" /><h2>A notebook in the making.</h2><p>No posts published yet.</p><a href="/#publications" className="text-link">Explore my research <LinkArrow /></a></div>}
  </PageShell>;
}

function Drawing() {
  return <PageShell eyebrow="Visual notebook" title="Diagram" description="A space to connect ideas."><div className="diagram-frame"><iframe title={profile.diagram.title} loading="lazy" src={profile.diagram.src} /></div><p className="diagram-caption"><ExternalLink href={profile.diagram.src} className="text-link">Open diagram in a new tab <LinkArrow /></ExternalLink></p></PageShell>;
}

function Post({ post }: { post: PublishedPost }) {
  return <PageShell eyebrow="Research notebook" title={post.title} description={post.description}><div className="post-meta"><time dateTime={post.date}>{dateLabel(post.date)}</time>{post.categories.map(category => <span key={category}>{category}</span>)}</div><article className="prose post-content" dangerouslySetInnerHTML={{ __html: post.html }} /><a className="text-link post-back" href="/blog/"><ArrowLeft size={14} aria-hidden="true" />All notes</a></PageShell>;
}

function NotFound() {
  return <PageShell eyebrow="404" title="Page not found" description="This page may have moved, or the address may be incorrect."><a className="text-link" href="/">Back to the homepage <ArrowRight size={15} aria-hidden="true" /></a></PageShell>;
}

function normalizePath(path: string) {
  const documentPath = path.replace(/\/index\.html$/, '/');
  return documentPath === '/' ? '/' : documentPath.replace(/\/$/, '');
}

export default function App() {
  const path = normalizePath(window.location.pathname);
  const post = posts.find(item => normalizePath(item.url) === path);
  useEffect(() => {
    const scrollToHash = () => {
      if (!window.location.hash) return;
      try { document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView(); } catch { /* Invalid URL encoding should not prevent rendering. */ }
    };
    const frame = requestAnimationFrame(scrollToHash);
    window.addEventListener('hashchange', scrollToHash);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('hashchange', scrollToHash); };
  }, []);
  return <ThemeProvider><a href="#main-content" className="skip-link">Skip to content</a><ReadingProgress />{path === '/' ? <Home /> : path === '/blog' ? <Blog /> : path === '/drawing' ? <Drawing /> : post ? <Post post={post} /> : <NotFound />}<Footer /></ThemeProvider>;
}
