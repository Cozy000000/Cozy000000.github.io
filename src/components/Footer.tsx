import { ArrowUp } from 'lucide-react';
import { profile } from '../content';
import { ExternalLink, LinkArrow } from './Shared';
import { VisitorMap } from './VisitorMap';

export function Footer() {
  return <footer className="site-footer">
    <div className="page-width">
      <div className="footer-contact"><div><p className="eyebrow">Get in touch</p><p>Let’s talk research.</p></div><a className="text-link contact-email" href={`mailto:${profile.author.email}`}>{profile.author.email}<LinkArrow /></a></div>
      <div className="footer-bottom"><p>© {new Date().getFullYear()} {profile.author.name}</p><nav aria-label="Footer"><a href="/">Home</a><a href="/blog/">Blog</a><a href="/drawing/">Diagram</a><ExternalLink href={profile.author.github}>GitHub <LinkArrow /></ExternalLink><a href="#top" className="back-to-top">Back to top <ArrowUp size={13} aria-hidden="true" /></a></nav></div>
      {profile.visitorMap && <VisitorMap {...profile.visitorMap} />}
    </div>
  </footer>;
}
