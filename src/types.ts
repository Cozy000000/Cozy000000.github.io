export interface Publication {
  id: string;
  short_name: string;
  title: string;
  authors: string[];
  venue: string;
  distinction?: string;
  topic: string;
  summary: string;
  paper: string;
  pdf: string;
  bibtex: string;
  figure: { src: string; alt: string; source: string; label: string };
}

export type Highlight = { paperId: string } | { label: string; text: string; href?: string };

export interface Profile {
  site: { title: string; description: string; url: string; language: string };
  author: {
    name: string;
    nativeName: string;
    role: string;
    bio: string;
    affiliation: string;
    affiliationShort: string;
    affiliationUrl: string;
    advisor: string;
    advisorUrl: string;
    location: string;
    email: string;
    scholar: string;
    github: string;
    avatar: string;
  };
  intro: string;
  research: { description: string; topics: string[] };
  highlights: Highlight[];
  news: { date: string; text: string; label?: string }[];
  featured: string[];
  publications: Publication[];
  education: { period: string; school: string; degree: string; detail?: string; current?: boolean }[];
  awards: { year: number; title: string; event: string }[];
  activities: { year: number; text: string }[];
  diagram: { title: string; src: string };
  visitorMap: { imageUrl: string; statsUrl: string } | null;
}

export interface PublishedPost {
  title: string;
  description: string;
  date: string;
  categories: string[];
  url: string;
  html: string;
  math: boolean;
}
