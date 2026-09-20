import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface PageSection { id: string; label: string }

export function ReadingProgress() {
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  return <div ref={progressRef} className="reading-progress" aria-hidden="true" />;
}

export function PageNavigation({ sections }: { sections: PageSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const mobileRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = sections[0]?.id ?? '';
      for (const section of sections) {
        if ((document.getElementById(section.id)?.getBoundingClientRect().top ?? Infinity) <= Math.min(200, window.innerHeight * 0.3)) current = section.id;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = sections.at(-1)?.id ?? current;
      setActiveId(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [sections]);

  const links = (mobile: boolean) => <ol>{sections.map(section => <li key={section.id}><a href={`#${section.id}`} aria-current={activeId === section.id ? 'location' : undefined} onClick={() => { setActiveId(section.id); if (mobile && mobileRef.current) mobileRef.current.open = false; }}><span className="toc-mark" aria-hidden="true" />{section.label}</a></li>)}</ol>;
  return <>
    <nav className="desktop-toc" aria-label="On this page">{links(false)}</nav>
    <details ref={mobileRef} className="mobile-toc"><summary>On this page <ChevronDown size={16} aria-hidden="true" /></summary><nav aria-label="Page sections">{links(true)}</nav></details>
  </>;
}
