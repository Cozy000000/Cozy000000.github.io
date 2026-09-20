import { motion, useReducedMotion } from 'framer-motion';
import { Github, GraduationCap, Mail, MapPin } from 'lucide-react';
import { profile } from '../content';
import { ExternalLink, ThemeToggle } from './Shared';

export function Hero() {
  const reduceMotion = useReducedMotion();
  const author = profile.author;
  const socials = [
    { label: 'Email', href: `mailto:${author.email}`, Icon: Mail },
    { label: 'Google Scholar', href: author.scholar, Icon: GraduationCap },
    { label: 'GitHub', href: author.github, Icon: Github },
  ];
  return <header className="hero" id="top">
    <ThemeToggle />
    <motion.div className="page-width hero-inner" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <figure className="portrait">
        <img src={author.avatar} alt={author.name} width="176" height="176" fetchPriority="high" />
        <figcaption><MapPin size={12} aria-hidden="true" />{author.location}</figcaption>
      </figure>
      <div className="hero-copy">
        <h1>{author.name} <span lang="zh-CN">({author.nativeName})</span></h1>
        <p className="hero-affiliation">{author.affiliation}</p>
        <p className="hero-role">{author.role}</p>
        <p className="hero-intro">{profile.intro}</p>
        <div className="social-links" aria-label="Contact and research profiles">{socials.map(({ label, href, Icon }) => <ExternalLink key={label} href={href} className="icon-button" title={label} aria-label={label}><Icon size={22} aria-hidden="true" /></ExternalLink>)}</div>
        <div className="hero-highlights">{profile.highlights.map((highlight, index) => {
          if ('paperId' in highlight) {
            const paper = profile.publications.find(item => item.id === highlight.paperId);
            if (!paper) return null;
            return <a className="hero-highlight" href={`#${paper.id}`} key={paper.id}><span className="highlight-label">{paper.venue}{paper.distinction ? ` · ${paper.distinction}` : ''}</span><p><strong>{paper.short_name}</strong> — {paper.summary}</p></a>;
          }
          const content = <><span className="highlight-label">{highlight.label}</span><p>{highlight.text}</p></>;
          return highlight.href ? <ExternalLink key={index} className="hero-highlight" href={highlight.href}>{content}</ExternalLink> : <div className="hero-highlight" key={index}>{content}</div>;
        })}</div>
      </div>
    </motion.div>
  </header>;
}
