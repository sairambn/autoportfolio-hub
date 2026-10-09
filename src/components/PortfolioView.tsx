import type { CSSProperties } from "react";
import {
  ArrowUpRight,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Star,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  ArrowDown,
} from "lucide-react";
import { FONTS, type Content, type Repo, type Section, type Theme } from "@/lib/portfolio";

export const PORTFOLIO_CSS = `
html {
  scroll-behavior: smooth;
  scroll-padding-top: 80px;
}
.pf {
  background: var(--pf-bg);
  color: var(--pf-fg);
  font-family: var(--pf-body);
  min-height: 100%;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  position: relative;
  overflow-x: hidden;
}
.pf * {
  box-sizing: border-box;
}
.pf a {
  color: inherit;
  text-decoration: none;
}

/* Atmospheric Ambient Hero Glow */
.pf-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  max-width: 1100px;
  height: 520px;
  background: radial-gradient(ellipse 75% 55% at 50% 0%, color-mix(in oklab, var(--pf-accent) 15%, transparent), transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* Sticky Glassmorphic Navigation */
.pf-nav-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  background: color-mix(in oklab, var(--pf-bg) 84%, transparent);
  border-bottom: 1px solid color-mix(in oklab, var(--pf-fg) 8%, transparent);
  transition: all 0.2s ease;
}
.pf-nav-inner {
  max-width: 860px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.pf-brand {
  font-family: var(--pf-head);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.pf-nav-links {
  display: flex;
  align-items: center;
  gap: 18px;
}
.pf-nav-link {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--pf-muted);
  transition: color 0.18s ease;
}
.pf-nav-link:hover {
  color: var(--pf-fg);
}
.pf-nav-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  background: color-mix(in oklab, var(--pf-accent) 14%, transparent);
  color: var(--pf-accent);
  border: 1px solid color-mix(in oklab, var(--pf-accent) 30%, transparent);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf-nav-cta:hover {
  background: var(--pf-accent);
  color: var(--pf-bg);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px color-mix(in oklab, var(--pf-accent) 35%, transparent);
}

/* Page Container */
.pf-wrap {
  position: relative;
  z-index: 1;
  max-width: 860px;
  margin: 0 auto;
  padding: 0 24px 100px;
}

/* Hero Section */
.pf-hero {
  padding: 56px 0 44px;
}
.pf-hero-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--pf-fg) 5%, transparent);
  border: 1px solid color-mix(in oklab, var(--pf-fg) 10%, transparent);
  font-size: 12px;
  font-weight: 500;
  color: var(--pf-muted);
  margin-bottom: 24px;
  transition: border-color 0.2s ease;
}
.pf-hero-status:hover {
  border-color: color-mix(in oklab, var(--pf-accent) 40%, transparent);
}
.pf-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
  animation: pf-pulse 2.2s infinite;
}
@keyframes pf-pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
.pf-hero-body {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}
.pf-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.pf-avatar {
  width: 104px;
  height: 104px;
  border-radius: 999px;
  object-fit: cover;
  border: 2.5px solid color-mix(in oklab, var(--pf-accent) 35%, transparent);
  box-shadow: 0 10px 24px -6px color-mix(in oklab, var(--pf-accent) 25%, transparent);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
}
.pf-avatar:hover {
  transform: scale(1.05) rotate(1deg);
  box-shadow: 0 14px 28px -6px color-mix(in oklab, var(--pf-accent) 35%, transparent);
}
.pf-avatar-initials {
  width: 104px;
  height: 104px;
  border-radius: 999px;
  background: var(--pf-surface);
  border: 2.5px solid color-mix(in oklab, var(--pf-accent) 35%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--pf-head);
  font-size: 34px;
  font-weight: 700;
  color: var(--pf-accent);
  box-shadow: 0 10px 24px -6px color-mix(in oklab, var(--pf-accent) 25%, transparent);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf-avatar-initials:hover {
  transform: scale(1.05);
}
.pf-name {
  font-family: var(--pf-head);
  font-size: clamp(36px, 6vw, 56px);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0;
}
.pf-location {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13.5px;
  color: var(--pf-muted);
  margin-top: 8px;
}
.pf-headline {
  font-size: clamp(17px, 2.3vw, 21px);
  line-height: 1.45;
  font-weight: 500;
  margin: 16px 0 0;
  max-width: 38em;
  color: var(--pf-fg);
}
.pf-bio {
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--pf-muted);
  margin: 14px 0 0;
  max-width: 40em;
  white-space: pre-wrap;
}
.pf-hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
}
.pf-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 999px;
  background: var(--pf-accent);
  color: var(--pf-bg);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 14px -3px color-mix(in oklab, var(--pf-accent) 40%, transparent);
}
.pf-btn-primary:hover {
  opacity: 0.93;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -4px color-mix(in oklab, var(--pf-accent) 45%, transparent);
}
.pf-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  background: var(--pf-surface);
  color: var(--pf-fg);
  border: 1px solid color-mix(in oklab, var(--pf-fg) 14%, transparent);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}
.pf-btn-secondary:hover {
  border-color: color-mix(in oklab, var(--pf-accent) 40%, transparent);
  background: color-mix(in oklab, var(--pf-accent) 8%, var(--pf-surface));
  transform: translateY(-2px);
}
.pf-social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: var(--pf-surface);
  color: var(--pf-muted);
  border: 1px solid color-mix(in oklab, var(--pf-fg) 12%, transparent);
  transition: all 0.2s ease;
}
.pf-social-btn:hover {
  color: var(--pf-fg);
  border-color: var(--pf-accent);
  transform: translateY(-2px);
}

/* Sections */
.pf-sec {
  padding: 60px 0 0;
  border-top: 1px solid color-mix(in oklab, var(--pf-fg) 10%, transparent);
}
.pf-sec-header {
  margin-bottom: 22px;
}
.pf-h {
  font-family: var(--pf-head);
  font-size: clamp(23px, 3.4vw, 30px);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.pf-h-icon {
  color: var(--pf-accent);
}

/* Projects Cards Grid */
.pf-projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 16px;
}
.pf-project-card {
  background: var(--pf-surface);
  border: 1px solid color-mix(in oklab, var(--pf-fg) 9%, transparent);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.26s cubic-bezier(0.16, 1, 0.3, 1);
  color: inherit;
  position: relative;
  overflow: hidden;
}
.pf-project-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in oklab, var(--pf-accent) 45%, transparent);
  box-shadow: 0 16px 32px -12px color-mix(in oklab, var(--pf-accent) 20%, transparent);
}
.pf-project-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.pf-project-name {
  font-family: var(--pf-head);
  font-size: 18.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0;
}
.pf-project-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--pf-fg) 5%, transparent);
  color: var(--pf-muted);
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.pf-project-card:hover .pf-project-arrow {
  background: var(--pf-accent);
  color: var(--pf-bg);
  transform: translate(2px, -2px);
}
.pf-project-desc {
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--pf-muted);
  margin: 12px 0 20px;
}
.pf-project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}
.pf-project-tag {
  font-size: 12px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 6px;
  background: color-mix(in oklab, var(--pf-fg) 5%, transparent);
  color: var(--pf-muted);
  border: 1px solid color-mix(in oklab, var(--pf-fg) 8%, transparent);
  transition: all 0.15s ease;
}
.pf-project-card:hover .pf-project-tag {
  border-color: color-mix(in oklab, var(--pf-accent) 30%, transparent);
  color: var(--pf-fg);
}

/* Skills Section */
.pf-skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
.pf-skill-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--pf-surface);
  border: 1px solid color-mix(in oklab, var(--pf-fg) 10%, transparent);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--pf-fg);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: default;
}
.pf-skill-pill:hover {
  transform: translateY(-2px);
  border-color: var(--pf-accent);
  color: var(--pf-accent);
  background: color-mix(in oklab, var(--pf-accent) 10%, var(--pf-surface));
  box-shadow: 0 4px 12px -2px color-mix(in oklab, var(--pf-accent) 20%, transparent);
}
.pf-skill-dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--pf-accent);
  opacity: 0.75;
}

/* Experience Timeline */
.pf-timeline {
  position: relative;
  padding-left: 28px;
  border-left: 2px solid color-mix(in oklab, var(--pf-fg) 12%, transparent);
  margin: 24px 0 0 8px;
  display: flex;
  flex-direction: column;
  gap: 36px;
}
.pf-timeline-item {
  position: relative;
  transition: transform 0.2s ease;
}
.pf-timeline-node {
  position: absolute;
  left: -35px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: var(--pf-bg);
  border: 2.5px solid var(--pf-accent);
  transition: all 0.2s ease;
}
.pf-timeline-item:hover .pf-timeline-node {
  background: var(--pf-accent);
  transform: scale(1.3);
  box-shadow: 0 0 0 5px color-mix(in oklab, var(--pf-accent) 20%, transparent);
}
.pf-timeline-title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
}
.pf-timeline-role {
  font-family: var(--pf-head);
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.pf-timeline-company {
  font-size: 15px;
  font-weight: 600;
  color: var(--pf-accent);
}
.pf-timeline-period {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--pf-muted);
  padding: 3px 10px;
  border-radius: 6px;
  background: var(--pf-surface);
  border: 1px solid color-mix(in oklab, var(--pf-fg) 8%, transparent);
}
.pf-timeline-desc {
  font-size: 14.5px;
  line-height: 1.65;
  color: var(--pf-muted);
  margin: 10px 0 0;
}

/* Education Cards */
.pf-edu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}
.pf-edu-card {
  background: var(--pf-surface);
  border: 1px solid color-mix(in oklab, var(--pf-fg) 9%, transparent);
  border-radius: 14px;
  padding: 20px;
  transition: all 0.2s ease;
}
.pf-edu-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in oklab, var(--pf-accent) 35%, transparent);
  box-shadow: 0 10px 20px -8px color-mix(in oklab, var(--pf-accent) 15%, transparent);
}
.pf-edu-degree {
  font-family: var(--pf-head);
  font-size: 16.5px;
  font-weight: 700;
  margin: 0;
}
.pf-edu-inst {
  font-size: 14px;
  color: var(--pf-accent);
  font-weight: 600;
  margin-top: 4px;
}
.pf-edu-period {
  font-size: 12px;
  color: var(--pf-muted);
  margin-top: 4px;
}
.pf-edu-desc {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--pf-muted);
  margin-top: 8px;
}

/* GitHub Repositories */
.pf-repos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}
.pf-repo-card {
  background: var(--pf-surface);
  border: 1px solid color-mix(in oklab, var(--pf-fg) 9%, transparent);
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: inherit;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf-repo-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in oklab, var(--pf-accent) 40%, transparent);
  box-shadow: 0 10px 20px -8px color-mix(in oklab, var(--pf-accent) 15%, transparent);
}
.pf-repo-name {
  font-family: var(--pf-head);
  font-size: 15.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.pf-repo-desc {
  font-size: 13.5px;
  color: var(--pf-muted);
  line-height: 1.5;
  margin: 8px 0 14px;
}
.pf-repo-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  color: var(--pf-muted);
  margin-top: auto;
}
.pf-repo-star {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--pf-accent);
  font-weight: 600;
}

/* Contact Card */
.pf-contact-box {
  background: color-mix(in oklab, var(--pf-accent) 5%, var(--pf-surface));
  border: 1.5px solid color-mix(in oklab, var(--pf-accent) 25%, transparent);
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  margin-top: 24px;
  position: relative;
  overflow: hidden;
}
.pf-contact-title {
  font-family: var(--pf-head);
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
}
.pf-contact-lead {
  font-size: 15px;
  color: var(--pf-muted);
  max-width: 440px;
  margin: 10px auto 26px;
  line-height: 1.6;
}
.pf-contact-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}
.pf-contact-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 600;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf-contact-btn-main {
  background: var(--pf-accent);
  color: var(--pf-bg);
  box-shadow: 0 4px 14px -3px color-mix(in oklab, var(--pf-accent) 40%, transparent);
}
.pf-contact-btn-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -4px color-mix(in oklab, var(--pf-accent) 50%, transparent);
  opacity: 0.95;
}
.pf-contact-btn-sub {
  background: var(--pf-surface);
  color: var(--pf-fg);
  border: 1px solid color-mix(in oklab, var(--pf-fg) 14%, transparent);
}
.pf-contact-btn-sub:hover {
  transform: translateY(-2px);
  border-color: var(--pf-accent);
  color: var(--pf-accent);
}

/* Footer */
.pf-footer {
  padding: 48px 0 24px;
  border-top: 1px solid color-mix(in oklab, var(--pf-fg) 8%, transparent);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: var(--pf-muted);
}
.pf-back-top {
  color: var(--pf-accent);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: transform 0.2s ease;
}
.pf-back-top:hover {
  transform: translateY(-2px);
}

/* Theme Modifiers */
.pf-t-terminal {
  font-family: var(--pf-body);
}
.pf-t-terminal .pf-name::before {
  content: "> ";
  color: var(--pf-accent);
}
.pf-t-terminal .pf-project-card,
.pf-t-terminal .pf-edu-card,
.pf-t-terminal .pf-repo-card,
.pf-t-terminal .pf-contact-box {
  border-radius: 6px;
}
.pf-t-terminal .pf-skill-pill,
.pf-t-terminal .pf-btn-primary,
.pf-t-terminal .pf-btn-secondary,
.pf-t-terminal .pf-contact-btn {
  border-radius: 6px;
}

.pf-t-blueprint {
  background-image: radial-gradient(color-mix(in oklab, var(--pf-accent) 15%, transparent) 1px, transparent 1px);
  background-size: 24px 24px;
}
.pf-t-blueprint .pf-project-card,
.pf-t-blueprint .pf-edu-card,
.pf-t-blueprint .pf-repo-card {
  border-radius: 4px;
}

.pf-t-studio .pf-name {
  font-weight: 900;
  letter-spacing: -0.04em;
}

.pf-t-bloom .pf-project-card,
.pf-t-bloom .pf-edu-card,
.pf-t-bloom .pf-contact-box {
  border-radius: 20px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pf-wrap {
    padding: 0 20px 80px;
  }
  .pf-nav-inner {
    padding: 12px 20px;
  }
  .pf-nav-links {
    display: none;
  }
  .pf-hero {
    padding: 40px 0 32px;
  }
  .pf-hero-body {
    flex-direction: column;
    gap: 20px;
  }
  .pf-avatar,
  .pf-avatar-initials {
    width: 88px;
    height: 88px;
  }
  .pf-projects-grid {
    grid-template-columns: 1fr;
  }
  .pf-timeline {
    padding-left: 20px;
  }
  .pf-timeline-node {
    left: -27px;
  }
}

@media (max-width: 480px) {
  .pf-hero-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .pf-btn-primary,
  .pf-btn-secondary {
    justify-content: center;
  }
  .pf-contact-buttons {
    flex-direction: column;
  }
  .pf-contact-btn {
    justify-content: center;
  }
}
`;

export function themeVars(theme: Theme): CSSProperties {
  const f = FONTS[theme.font] ?? FONTS.fraunces;
  return {
    ["--pf-bg" as string]: theme.palette.bg,
    ["--pf-fg" as string]: theme.palette.fg,
    ["--pf-accent" as string]: theme.palette.accent,
    ["--pf-muted" as string]: theme.palette.muted,
    ["--pf-surface" as string]: theme.palette.surface,
    ["--pf-head" as string]: f.heading,
    ["--pf-body" as string]: f.body,
  };
}

function getInitials(name: string): string {
  if (!name || !name.trim()) return "P";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function PortfolioView({
  content: c,
  theme,
  sections,
  repos,
}: {
  content: Content;
  theme: Theme;
  sections: Section[];
  repos?: Repo[] | null;
}) {
  const href = (k: string, v: string) =>
    k === "email" ? `mailto:${v}` : v.startsWith("http") ? v : `https://${v}`;

  const tpl = theme.template || "paper";
  const visibleTypes = new Set(sections.filter((s) => s.visible).map((s) => s.type));

  const hasAbout = visibleTypes.has("about") && Boolean(c.bio);
  const hasSkills = visibleTypes.has("skills") && c.skills && c.skills.length > 0;
  const hasProjects = visibleTypes.has("projects") && c.projects && c.projects.length > 0;
  const hasExperience = visibleTypes.has("experience") && c.experience && c.experience.length > 0;
  const hasEducation = visibleTypes.has("education") && c.education && c.education.length > 0;
  const hasRepos = visibleTypes.has("repos") && Boolean(c.githubUsername);
  const hasContact = visibleTypes.has("contact");

  return (
    <div className={`pf pf-t-${tpl}`} style={themeVars(theme)}>
      <style dangerouslySetInnerHTML={{ __html: PORTFOLIO_CSS }} />
      <div className="pf-glow" aria-hidden="true" />

      {/* Top Navigation Bar */}
      <header className="pf-nav-bar">
        <div className="pf-nav-inner">
          <a href="#" className="pf-brand">
            <span>{c.name || "Portfolio"}</span>
          </a>

          <nav className="pf-nav-links" aria-label="Main Navigation">
            {hasAbout && (
              <a href="#about" className="pf-nav-link">
                About
              </a>
            )}
            {hasProjects && (
              <a href="#projects" className="pf-nav-link">
                Projects
              </a>
            )}
            {hasSkills && (
              <a href="#skills" className="pf-nav-link">
                Skills
              </a>
            )}
            {hasExperience && (
              <a href="#experience" className="pf-nav-link">
                Experience
              </a>
            )}
            {hasEducation && (
              <a href="#education" className="pf-nav-link">
                Education
              </a>
            )}
            {hasContact && (
              <a href="#contact" className="pf-nav-link">
                Contact
              </a>
            )}
          </nav>

          {c.contact.email ? (
            <a href={`mailto:${c.contact.email}`} className="pf-nav-cta">
              <Mail className="size-3.5" />
              <span>Get in touch</span>
            </a>
          ) : (
            <a href="#contact" className="pf-nav-cta">
              <span>Contact</span>
            </a>
          )}
        </div>
      </header>

      {/* Content Container */}
      <main className="pf-wrap">
        {sections
          .filter((s) => s.visible)
          .map((s) => {
            switch (s.type) {
              case "hero": {
                return (
                  <section key={s.id} id="hero" className="pf-hero">
                    <div className="pf-hero-status">
                      <span className="pf-pulse-dot" />
                      <span>Available for engineering & product roles</span>
                    </div>

                    <div className="pf-hero-body">
                      <div className="pf-avatar-wrap">
                        {c.avatarUrl ? (
                          <img
                            className="pf-avatar"
                            src={c.avatarUrl}
                            alt={c.name || "Profile Photo"}
                            loading="eager"
                          />
                        ) : (
                          <div className="pf-avatar-initials">{getInitials(c.name)}</div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h1 className="pf-name">{c.name || "Your Name"}</h1>

                        {c.location ? (
                          <div className="pf-location">
                            <MapPin className="size-3.5" />
                            <span>{c.location}</span>
                          </div>
                        ) : null}

                        {c.headline ? <p className="pf-headline">{c.headline}</p> : null}

                        {c.bio ? <p className="pf-bio">{c.bio}</p> : null}

                        <div className="pf-hero-actions">
                          {hasProjects && (
                            <a href="#projects" className="pf-btn-primary">
                              <span>View Projects</span>
                              <ArrowDown className="size-4" />
                            </a>
                          )}

                          {c.contact.email && (
                            <a href={`mailto:${c.contact.email}`} className="pf-btn-secondary">
                              <Mail className="size-4" />
                              <span>Email Me</span>
                            </a>
                          )}

                          {c.contact.github && (
                            <a
                              href={href("github", c.contact.github)}
                              target="_blank"
                              rel="noreferrer"
                              className="pf-social-btn"
                              title="GitHub Profile"
                              aria-label="GitHub Profile"
                            >
                              <Github className="size-4" />
                            </a>
                          )}

                          {c.contact.linkedin && (
                            <a
                              href={href("linkedin", c.contact.linkedin)}
                              target="_blank"
                              rel="noreferrer"
                              className="pf-social-btn"
                              title="LinkedIn Profile"
                              aria-label="LinkedIn Profile"
                            >
                              <Linkedin className="size-4" />
                            </a>
                          )}

                          {c.contact.website && (
                            <a
                              href={href("website", c.contact.website)}
                              target="_blank"
                              rel="noreferrer"
                              className="pf-social-btn"
                              title="Personal Website"
                              aria-label="Personal Website"
                            >
                              <Globe className="size-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                );
              }

              case "about":
                if (!c.bio) return null;
                return (
                  <section key={s.id} id="about" className="pf-sec">
                    <div className="pf-sec-header">
                      <h2 className="pf-h">About Me</h2>
                    </div>
                    <p className="pf-bio" style={{ margin: 0, maxWidth: "48em" }}>
                      {c.bio}
                    </p>
                  </section>
                );

              case "skills":
                if (!c.skills || !c.skills.length) return null;
                return (
                  <section key={s.id} id="skills" className="pf-sec">
                    <div className="pf-sec-header">
                      <h2 className="pf-h">
                        <Code2 className="pf-h-icon size-6" />
                        <span>Skills & Technologies</span>
                      </h2>
                    </div>

                    <div className="pf-skills-grid">
                      {c.skills.map((skill) => (
                        <div key={skill} className="pf-skill-pill">
                          <span className="pf-skill-dot" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                );

              case "projects":
                if (!c.projects || !c.projects.length) return null;
                return (
                  <section key={s.id} id="projects" className="pf-sec">
                    <div className="pf-sec-header">
                      <h2 className="pf-h">
                        <FolderGit2 className="pf-h-icon size-6" />
                        <span>Featured Projects</span>
                      </h2>
                    </div>

                    <div className="pf-projects-grid">
                      {c.projects.map((p, i) => {
                        const tagsList = Array.isArray(p.tags)
                          ? p.tags
                          : p.tags
                            ? String(p.tags)
                                .split(/[·,]/)
                                .map((t) => t.trim())
                                .filter(Boolean)
                            : [];

                        const targetUrl = p.url
                          ? href("url", p.url)
                          : p.repo
                            ? href("repo", p.repo)
                            : undefined;

                        return (
                          <div key={i} className="pf-project-card">
                            <div>
                              <div className="pf-project-title-row">
                                <h3 className="pf-project-name">{p.title}</h3>
                                {targetUrl && (
                                  <a
                                    href={targetUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="pf-project-arrow"
                                    title="Open Project"
                                    aria-label={`Open ${p.title}`}
                                  >
                                    <ArrowUpRight className="size-4" />
                                  </a>
                                )}
                              </div>

                              <p className="pf-project-desc">{p.description}</p>
                            </div>

                            <div>
                              {tagsList.length > 0 && (
                                <div className="pf-project-tags">
                                  {tagsList.map((tag) => (
                                    <span key={tag} className="pf-project-tag">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {targetUrl && (
                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                                  <a
                                    href={targetUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                                  >
                                    <span>Explore project</span>
                                    <ExternalLink className="size-3" />
                                  </a>
                                  {p.repo && (
                                    <a
                                      href={href("repo", p.repo)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                                    >
                                      <Github className="size-3" />
                                      <span>Source</span>
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );

              case "experience":
                if (!c.experience || !c.experience.length) return null;
                return (
                  <section key={s.id} id="experience" className="pf-sec">
                    <div className="pf-sec-header">
                      <h2 className="pf-h">
                        <Briefcase className="pf-h-icon size-6" />
                        <span>Work Experience</span>
                      </h2>
                    </div>

                    <div className="pf-timeline">
                      {c.experience.map((e, i) => (
                        <div key={i} className="pf-timeline-item">
                          <div className="pf-timeline-node" />
                          <div className="pf-timeline-title-row">
                            <h3 className="pf-timeline-role">{e.role}</h3>
                            {e.period && <span className="pf-timeline-period">{e.period}</span>}
                          </div>

                          {e.company && <div className="pf-timeline-company">{e.company}</div>}

                          {e.description && <p className="pf-timeline-desc">{e.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                );

              case "education":
                if (!c.education || !c.education.length) return null;
                return (
                  <section key={s.id} id="education" className="pf-sec">
                    <div className="pf-sec-header">
                      <h2 className="pf-h">
                        <GraduationCap className="pf-h-icon size-6" />
                        <span>Education & Qualifications</span>
                      </h2>
                    </div>

                    <div className="pf-edu-grid">
                      {c.education.map((edu, i) => (
                        <div key={i} className="pf-edu-card">
                          <h3 className="pf-edu-degree">{edu.degree}</h3>
                          {edu.institution && <div className="pf-edu-inst">{edu.institution}</div>}
                          {edu.period && <div className="pf-edu-period">{edu.period}</div>}
                          {edu.description && <p className="pf-edu-desc">{edu.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                );

              case "repos":
                if (!c.githubUsername) return null;
                return (
                  <section key={s.id} id="repos" className="pf-sec">
                    <div className="pf-sec-header">
                      <h2 className="pf-h">
                        <Github className="pf-h-icon size-6" />
                        <span>GitHub Repositories</span>
                      </h2>
                    </div>

                    {repos == null ? (
                      <p style={{ opacity: 0.6 }}>Loading repositories…</p>
                    ) : repos.length === 0 ? (
                      <p style={{ opacity: 0.6 }}>No public repositories found.</p>
                    ) : (
                      <div className="pf-repos-grid">
                        {repos.map((r) => (
                          <a
                            key={r.name}
                            className="pf-repo-card"
                            href={r.html_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <div>
                              <div className="pf-repo-name">
                                <span>{r.name}</span>
                                <ExternalLink className="size-3.5 opacity-60" />
                              </div>
                              <p className="pf-repo-desc">
                                {r.description || "Public open-source repository on GitHub"}
                              </p>
                            </div>

                            <div className="pf-repo-meta">
                              <span className="pf-repo-star">
                                <Star className="size-3.5 fill-current" />
                                <span>{r.stargazers_count}</span>
                              </span>
                              {r.language && <span className="opacity-80">{r.language}</span>}
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </section>
                );

              case "contact": {
                const links = Object.entries(c.contact).filter(([, v]) => v);
                if (!links.length && !c.contact.email) return null;

                return (
                  <section key={s.id} id="contact" className="pf-sec">
                    <div className="pf-contact-box">
                      <h2 className="pf-contact-title">Let&apos;s build something great</h2>
                      <p className="pf-contact-lead">
                        I&apos;m always open to discussing new engineering opportunities,
                        collaborations, or tech conversations.
                      </p>

                      <div className="pf-contact-buttons">
                        {c.contact.email && (
                          <a
                            href={`mailto:${c.contact.email}`}
                            className="pf-contact-btn pf-contact-btn-main"
                          >
                            <Mail className="size-4" />
                            <span>{c.contact.email}</span>
                          </a>
                        )}

                        {c.contact.linkedin && (
                          <a
                            href={href("linkedin", c.contact.linkedin)}
                            target="_blank"
                            rel="noreferrer"
                            className="pf-contact-btn pf-contact-btn-sub"
                          >
                            <Linkedin className="size-4" />
                            <span>LinkedIn</span>
                          </a>
                        )}

                        {c.contact.github && (
                          <a
                            href={href("github", c.contact.github)}
                            target="_blank"
                            rel="noreferrer"
                            className="pf-contact-btn pf-contact-btn-sub"
                          >
                            <Github className="size-4" />
                            <span>GitHub</span>
                          </a>
                        )}

                        {c.contact.website && (
                          <a
                            href={href("website", c.contact.website)}
                            target="_blank"
                            rel="noreferrer"
                            className="pf-contact-btn pf-contact-btn-sub"
                          >
                            <Globe className="size-4" />
                            <span>Website</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </section>
                );
              }

              default:
                return null;
            }
          })}

        {/* Proper Website Footer */}
        <footer className="pf-footer">
          <div>
            <span>
              © {new Date().getFullYear()} {c.name || "Portfolio"}.
            </span>
            {c.location ? <span> · Based in {c.location}</span> : null}
          </div>
          <a href="#" className="pf-back-top">
            <span>Back to top ↑</span>
          </a>
        </footer>
      </main>
    </div>
  );
}
