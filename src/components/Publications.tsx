import { Check, ChevronDown, Copy, FileText } from 'lucide-react';
import { Fragment, useRef, useState } from 'react';
import { profile } from '../content';
import type { Publication } from '../types';
import { ExternalLink, LinkArrow } from './Shared';

export function FeaturedPaper({ paper }: { paper: Publication }) {
  return <article className="featured-paper">
    <a className="figure-link" href={paper.figure.src} target="_blank" rel="noopener noreferrer" aria-label={`View full-size ${paper.short_name} method figure`}>
      <img src={paper.figure.src} alt={paper.figure.alt} loading="lazy" decoding="async" />
    </a>
    <div className="featured-content">
      <p className="paper-venue">{paper.venue}{paper.distinction && <span className="distinction">{paper.distinction}</span>}</p>
      <h3><ExternalLink href={paper.paper}>{paper.title}</ExternalLink></h3>
      <p className="paper-summary">{paper.summary}</p>
      <div className="featured-bottom"><ExternalLink href={paper.paper} className="text-link">Read paper <LinkArrow /></ExternalLink><ExternalLink href={paper.figure.source} className="figure-source">{paper.figure.label}</ExternalLink></div>
    </div>
  </article>;
}

export function PublicationCard({ paper }: { paper: Publication }) {
  const [copyStatus, setCopyStatus] = useState('');
  const codeRef = useRef<HTMLElement>(null);
  async function copyCitation() {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(paper.bibtex);
      setCopyStatus('Citation copied.');
    } catch {
      if (codeRef.current) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(codeRef.current);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setCopyStatus('Select and copy the citation manually.');
    }
  }
  return <article id={paper.id} className="publication" aria-labelledby={`${paper.id}-title`}>
    <div className="publication-topline"><p className="paper-venue">{paper.venue}{paper.distinction && <span className="distinction">{paper.distinction}</span>}</p><span className="paper-topic">{paper.topic}</span></div>
    <h3 id={`${paper.id}-title`}><ExternalLink href={paper.paper}>{paper.title}</ExternalLink></h3>
    <p className="paper-authors">{paper.authors.map((author, index) => <Fragment key={`${index}-${author}`}>{index > 0 && (index === paper.authors.length - 1 ? ', and ' : ', ')}{author === profile.author.name ? <strong>{author}</strong> : author}</Fragment>)}</p>
    <p className="paper-summary">{paper.summary}</p>
    <div className="paper-links"><ExternalLink href={paper.paper} className="paper-link"><FileText size={14} aria-hidden="true" />Paper <LinkArrow /></ExternalLink><ExternalLink href={paper.pdf} className="paper-link">PDF <LinkArrow /></ExternalLink></div>
    <details className="citation" onToggle={event => { if (!event.currentTarget.open) setCopyStatus(''); }}>
      <summary>BibTeX <ChevronDown size={15} aria-hidden="true" /></summary>
      <div className="citation-content"><pre tabIndex={0} aria-label={`BibTeX citation for ${paper.short_name}`}><code ref={codeRef}>{paper.bibtex}</code></pre><div className="citation-controls"><button type="button" className="paper-link copy-citation" onClick={() => { void copyCitation(); }}>{copyStatus === 'Citation copied.' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}Copy citation</button><span className="copy-status" role="status" aria-live="polite">{copyStatus}</span></div></div>
    </details>
  </article>;
}
