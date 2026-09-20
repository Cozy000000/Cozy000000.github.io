import { Trophy } from 'lucide-react';
import { profile } from '../content';
import { Hero } from './Hero';
import { PageNavigation, type PageSection } from './PageNavigation';
import { FeaturedPaper, PublicationCard } from './Publications';
import { ExternalLink, LinkArrow, Section } from './Shared';

const featured = profile.featured.flatMap(id => { const paper = profile.publications.find(item => item.id === id); return paper ? [paper] : []; });
const sections: PageSection[] = [
  { id: 'about', label: 'About' },
  ...(profile.news.length ? [{ id: 'news', label: 'News' }] : []),
  ...(profile.research.description || profile.research.topics.length ? [{ id: 'research', label: 'Research' }] : []),
  ...(featured.length ? [{ id: 'featured', label: 'Featured' }] : []),
  ...(profile.education.length ? [{ id: 'education', label: 'Education' }] : []),
  ...(profile.publications.length ? [{ id: 'publications', label: 'Selected' }] : []),
  ...(profile.awards.length ? [{ id: 'awards', label: 'Awards' }] : []),
  ...(profile.activities.length ? [{ id: 'activities', label: 'Activities' }] : []),
];

function formatNewsDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value.slice(0, 7)}-01T00:00:00Z`));
}

export function Home() {
  const author = profile.author;
  return <>
    <Hero />
    <main id="main-content" tabIndex={-1} className="page-width home-main">
      <PageNavigation sections={sections} />
      <Section id="about" title="About Me" icon="👋" legacyIds={['about-me']}><div className="prose"><p>I am <strong>{author.name} <span lang="zh-CN">({author.nativeName})</span></strong>, {author.bio} at <ExternalLink href={author.affiliationUrl}>{author.affiliationShort}</ExternalLink>, advised by <ExternalLink href={author.advisorUrl}>{author.advisor}</ExternalLink>.</p></div></Section>
      {profile.news.length > 0 && <Section id="news" title="News" icon="📰" legacyIds={['-news']}><div className="news-list">{profile.news.map(news => <div className="news-item" key={`${news.date}-${news.text}`}><time dateTime={news.date}>{formatNewsDate(news.date)}</time><p>{news.label && <span className="news-label">{news.label}</span>}{news.text}</p></div>)}</div></Section>}
      {(profile.research.description || profile.research.topics.length > 0) && <Section id="research" title="Research Interests" icon="🔬"><div className="prose"><p>{profile.research.description}</p></div><ul className="research-topics" aria-label="Research topics">{profile.research.topics.map(topic => <li key={topic}>{topic}</li>)}</ul></Section>}
      {featured.length > 0 && <Section id="featured" title="Featured Papers" icon="✦"><div className="featured-grid">{featured.map(paper => <FeaturedPaper key={paper.id} paper={paper} />)}</div></Section>}
      {profile.education.length > 0 && <Section id="education" title="Education" icon="🎓" legacyIds={['-educations']}><ol className="education-list">{profile.education.map(entry => <li key={`${entry.period}-${entry.school}`} className={`education-item${entry.current ? ' is-current' : ''}`}><p className="education-period">{entry.period}</p><div><h3>{entry.school}</h3><p className="education-degree">{entry.degree}</p>{entry.detail && <p className="education-detail">{entry.detail}</p>}</div></li>)}</ol></Section>}
      {profile.publications.length > 0 && <Section id="publications" title="Selected Publications" icon="📚" legacyIds={['-publications']}><p className="section-description">Research on efficient learning and language models. <ExternalLink href={author.scholar} className="text-link">Google Scholar <LinkArrow /></ExternalLink></p><div className="publication-list">{profile.publications.map(paper => <PublicationCard key={paper.id} paper={paper} />)}</div></Section>}
      {profile.awards.length > 0 && <Section id="awards" title="Awards & Honors" icon="🏆" legacyIds={['-honors-and-awards']}><ul className="awards-grid">{profile.awards.map(award => <li className="award" key={`${award.year}-${award.event}`}><Trophy size={23} aria-hidden="true" /><div><div className="award-topline"><h3>{award.title}</h3><span>{award.year}</span></div><p>{award.event}</p></div></li>)}</ul></Section>}
      {profile.activities.length > 0 && <Section id="activities" title="Academic Activities" icon="🌐" legacyIds={['-professional-activities']}><div className="activities-list">{profile.activities.map(activity => <div className="activity" key={`${activity.year}-${activity.text}`}><span className="activity-year">{activity.year}</span><p>{activity.text}</p></div>)}</div></Section>}
    </main>
  </>;
}
