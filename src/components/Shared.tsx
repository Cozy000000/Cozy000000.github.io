import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Moon, Sun } from 'lucide-react';
import { type AnchorHTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../contexts/useTheme';

export function ExternalLink({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = href?.startsWith('https://') || href?.startsWith('http://');
  return <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...props}>{children}</a>;
}

export function LinkArrow() {
  return <ArrowUpRight size={14} aria-hidden="true" />;
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
  return <button type="button" onClick={toggleTheme} className="icon-button theme-toggle" aria-label={label} title={label} aria-pressed={theme === 'dark'}>{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button>;
}

export function Section({ id, title, icon, legacyIds = [], children }: { id: string; title: string; icon: string; legacyIds?: string[]; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return <motion.section id={id} className="content-section" tabIndex={-1} aria-labelledby={`${id}-heading`} initial={reduceMotion ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.05 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
    {legacyIds.map(anchor => <span className="legacy-anchor" id={anchor} key={anchor} aria-hidden="true" />)}
    <div className="section-heading"><span className="section-icon" aria-hidden="true">{icon}</span><h2 id={`${id}-heading`}>{title}</h2></div>
    {children}
  </motion.section>;
}
