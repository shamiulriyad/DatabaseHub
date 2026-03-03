import { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import api from "../../services/api";

const formatCompactNumber = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M+`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
  return `${num}+`;
};

const initialsFromName = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join("") || "NA";
};

const COMP_BG = [
  "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.1))",
  "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(79,70,229,0.1))",
  "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(124,58,237,0.1))",
];

const CLAN_COLORS = ["#7c3aed", "#06b6d4", "#d97706", "#059669", "#e11d48"];

const DEFAULT_COMMUNITY_CLANS = [
  { name: "Code Titans", emoji: "⚔️", rank: "#1", members: 124, xp: "128,400 XP", progress: 100, color: "#7c3aed" },
  { name: "Data Masters", emoji: "🔬", rank: "#2", members: 98, xp: "113,200 XP", progress: 88, color: "#06b6d4" },
  { name: "Bug Hunters", emoji: "🔥", rank: "#3", members: 76, xp: "95,700 XP", progress: 74, color: "#d97706" },
];

const DEFAULT_COMMUNITY_LEADERBOARD = [
  { pos: "01", name: "Code Titans", clan: "124 members", xp: "128,400 XP", avatar: "CT", color: "#7c3aed" },
  { pos: "02", name: "Data Masters", clan: "98 members", xp: "113,200 XP", avatar: "DM", color: "#06b6d4" },
  { pos: "03", name: "Bug Hunters", clan: "76 members", xp: "95,700 XP", avatar: "BH", color: "#d97706" },
  { pos: "04", name: "Algo Ninjas", clan: "64 members", xp: "82,900 XP", avatar: "AN", color: "#059669" },
  { pos: "05", name: "Stack Riders", clan: "59 members", xp: "77,500 XP", avatar: "SR", color: "#e11d48" },
];

const DEFAULT_COMMUNITY_BADGES = [
  { icon: "🔥", label: "Code Rank" },
  { icon: "⚡", label: "Data Rank" },
  { icon: "💎", label: "Bug Rank" },
  { icon: "🎯", label: "Algo Rank" },
  { icon: "🌟", label: "Stack Rank" },
];

const DEFAULT_COMMUNITY_STATS = [
  { label: "Active Clans", val: formatCompactNumber(12), icon: "⚔️" },
  { label: "Total Clan Points", val: formatCompactNumber(497700), icon: "⚡" },
  { label: "Leaderboard Entries", val: formatCompactNumber(5), icon: "🏅" },
  { label: "Top Clan Members", val: formatCompactNumber(421), icon: "👑" },
];

const iconForCompetition = (type = "") => {
  const t = String(type || "").toLowerCase();
  if (t.includes("data")) return "📊";
  if (t.includes("ai") || t.includes("ml")) return "🧠";
  if (t.includes("research")) return "🔬";
  return "💻";
};

/* ══════════════════════════════════════════════════════════════════
  FEATURED COURSES
══════════════════════════════════════════════════════════════════ */
// (Removed misplaced CSS block)
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --void:        #03030d;
  --deep:        #07071a;
  --surface:     #0a0a20;
  --card:        #0d0d26;
  --elevated:    #111130;
  --glass:       rgba(13,13,38,0.7);

  --violet:      #7c3aed;
  --violet-bright: #8b5cf6;
  --violet-glow: rgba(124,58,237,0.4);
  --indigo:      #4f46e5;
  --cyan:        #06b6d4;
  --cyan-soft:   rgba(6,182,212,0.15);
  --gold:        #d97706;
  --gold-bright: #f59e0b;
  --gold-soft:   rgba(245,158,11,0.15);
  --rose:        #e11d48;
  --emerald:     #059669;

  --border:      rgba(124,58,237,0.18);
  --border-dim:  rgba(255,255,255,0.05);
  --border-gold: rgba(245,158,11,0.25);

  --text-1:  #f5f3ff;
  --text-2:  #a5a0c8;
  --text-3:  #5c587a;

  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'DM Sans', sans-serif;

  --r-sm: 8px;
  --r-md: 16px;
  --r-lg: 24px;
  --r-xl: 32px;
  --r-2xl: 40px;
}

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-body);
  background: var(--void);
  color: var(--text-1);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

::selection { background: var(--violet); color: white; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--deep); }
::-webkit-scrollbar-thumb { background: var(--violet); border-radius: 99px; }

/* ── KEYFRAMES ── */
@keyframes twinkle  { 0%,100%{opacity:var(--op,0.4)} 50%{opacity:0.05} }
@keyframes orb-drift { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-40px,30px) scale(1.08)} }
@keyframes orb-drift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(50px,-40px)} }
@keyframes orb-drift3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-25px,35px)} 66%{transform:translate(35px,-20px)} }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
@keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
@keyframes spin  { to{transform:rotate(360deg)} }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
@keyframes shimmer { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes fadeUp  { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn  { from{opacity:0} to{opacity:1} }
@keyframes countUp { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
@keyframes borderGlow {
  0%,100% { box-shadow: 0 0 20px rgba(124,58,237,0.3); }
  50% { box-shadow: 0 0 40px rgba(124,58,237,0.6), 0 0 80px rgba(124,58,237,0.2); }
}
@keyframes countdown { 0%{opacity:1} 100%{opacity:0.5} }
@keyframes slideLeft { from{transform:translateX(0)} to{transform:translateX(-50%)} }

/* ── GLOBAL PAGE ── */
.page {
  position: relative;
  min-height: 100vh;
  background:
    radial-gradient(ellipse 120% 60% at 50% -5%, rgba(79,46,229,0.18) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 90% 90%, rgba(6,182,212,0.07) 0%, transparent 50%),
    radial-gradient(ellipse 60% 50% at -10% 60%, rgba(124,58,237,0.07) 0%, transparent 50%),
    var(--void);
}

.cosmic-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* ── SECTION WRAPPER ── */
.section { position: relative; z-index: 1; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
.container-wide { max-width: 1400px; margin: 0 auto; padding: 0 32px; }

/* ── SECTION LABELS ── */
.section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 99px;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  background: rgba(124,58,237,0.12);
  border: 1px solid rgba(124,58,237,0.3);
  color: #a78bfa;
  margin-bottom: 20px;
}
.section-eyebrow.gold {
  background: rgba(245,158,11,0.1);
  border-color: rgba(245,158,11,0.3);
  color: var(--gold-bright);
}
.section-eyebrow.cyan {
  background: rgba(6,182,212,0.1);
  border-color: rgba(6,182,212,0.3);
  color: var(--cyan);
}
.eyebrow-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #a78bfa;
  animation: pulse 2s ease-in-out infinite;
}
.eyebrow-dot.gold { background: var(--gold-bright); }
.eyebrow-dot.cyan { background: var(--cyan); }

/* ── HEADINGS ── */
.display-heading {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--text-1);
}
.display-heading .gradient-violet {
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #4f46e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.display-heading .gradient-gold {
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 60%, #92400e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.display-heading .gradient-mixed {
  background: linear-gradient(135deg, #a78bfa 0%, #6d28d9 40%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200%;
  animation: shimmer 5s ease infinite;
}
.shimmer-text {
  background: linear-gradient(90deg, #a78bfa, #f59e0b, #a78bfa);
  background-size: 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s ease infinite;
}

/* ── BUTTONS ── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 99px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  white-space: nowrap;
  text-decoration: none;
}
.btn-primary {
  background: linear-gradient(135deg, #5b21b6, #7c3aed, #6d28d9);
  color: white;
  box-shadow: 0 4px 24px rgba(124,58,237,0.35);
  position: relative;
  overflow: hidden;
}
.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
  opacity: 0;
  transition: opacity 0.2s;
}
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(124,58,237,0.5); }
.btn-primary:hover::before { opacity: 1; }

.btn-gold {
  background: linear-gradient(135deg, #92400e, #d97706, #b45309);
  color: white;
  box-shadow: 0 4px 24px rgba(217,119,6,0.3);
}
.btn-gold:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(217,119,6,0.5); }

.btn-ghost {
  background: transparent;
  color: var(--text-2);
  border: 1px solid var(--border-dim);
}
.btn-ghost:hover { border-color: var(--border); color: var(--text-1); background: rgba(124,58,237,0.06); }

.btn-outline-gold {
  background: transparent;
  color: var(--gold-bright);
  border: 1px solid rgba(245,158,11,0.4);
}
.btn-outline-gold:hover { background: rgba(245,158,11,0.1); border-color: var(--gold-bright); }

.btn-sm { padding: 9px 20px; font-size: 13px; }
.btn-lg { padding: 18px 40px; font-size: 16px; }

/* ── CARDS ── */
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
}
.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.card:hover::before { opacity: 1; }
.card:hover { border-color: rgba(124,58,237,0.4); box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.08); transform: translateY(-6px); }

.card-glass {
  background: rgba(10,10,32,0.6);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
}

/* ── DIVIDERS ── */
.divider { height: 1px; background: var(--border-dim); margin: 0; }
.divider-glow { height: 1px; background: linear-gradient(90deg, transparent, var(--violet), transparent); }

/* ── GRID HELPERS ── */
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
@media(max-width:1024px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}
@media(max-width:640px) {
  .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
  .container, .container-wide { padding: 0 16px; }
  .btn-lg { padding: 14px 28px; font-size: 14px; }
}

/* ══════════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════════ */
.hero {
  padding: 140px 0 100px;
  position: relative;
  overflow: hidden;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}
@media(max-width:900px) { .hero-grid { grid-template-columns: 1fr; gap: 48px; } }

.hero-announce {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px;
  border-radius: 99px;
  background: rgba(124,58,237,0.1);
  border: 1px solid rgba(124,58,237,0.3);
  font-size: 12px;
  font-weight: 600;
  color: #c4b5fd;
  letter-spacing: 0.05em;
  margin-bottom: 32px;
  animation: fadeUp 0.8s ease both;
}
.announce-badge {
  padding: 2px 8px;
  border-radius: 99px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  font-size: 10px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(42px, 5.5vw, 76px);
  font-weight: 900;
  line-height: 1.0;
  letter-spacing: -0.03em;
  margin-bottom: 28px;
  animation: fadeUp 0.8s 0.1s ease both;
}

.hero-sub {
  font-size: 18px;
  color: var(--text-2);
  line-height: 1.8;
  max-width: 500px;
  margin-bottom: 44px;
  font-weight: 300;
  animation: fadeUp 0.8s 0.2s ease both;
}

.hero-btns {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 56px;
  animation: fadeUp 0.8s 0.3s ease both;
}

.hero-stats {
  display: flex;
  gap: 40px;
  animation: fadeUp 0.8s 0.4s ease both;
}
.hero-stat-val {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.02em;
  line-height: 1;
}
.hero-stat-label {
  font-size: 12px;
  color: var(--text-3);
  font-weight: 500;
  margin-top: 4px;
  letter-spacing: 0.05em;
}
.hero-stat-divider {
  width: 1px;
  background: var(--border-dim);
  align-self: stretch;
}

/* Hero visual */
.hero-visual {
  position: relative;
  animation: fadeUp 0.9s 0.3s ease both;
}
.hero-visual-main {
  border-radius: var(--r-xl);
  overflow: hidden;
  position: relative;
  border: 1px solid var(--border);
  box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(124,58,237,0.12);
  animation: borderGlow 4s ease-in-out infinite;
}
.hero-visual-main img {
  width: 100%;
  height: 420px;
  object-fit: cover;
  display: block;
}
.hero-visual-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(7,7,26,0.3) 0%, rgba(7,7,26,0.7) 100%);
}
.hero-float-card {
  position: absolute;
  padding: 16px 20px;
  border-radius: var(--r-md);
  background: rgba(7,7,26,0.92);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}
.hero-float-1 { bottom: 24px; left: -30px; animation: float 5s ease-in-out infinite; }
.hero-float-2 { top: 24px; right: -24px; animation: float2 6s ease-in-out infinite; }
.hero-float-3 { bottom: -24px; right: 40px; animation: float 7s 1s ease-in-out infinite; }
.float-stat-val {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.float-stat-sub { font-size: 11px; color: var(--text-3); margin-top: 2px; }
.float-stat-label { font-size: 11px; color: var(--text-2); margin-bottom: 4px; }

/* glow ring */
.hero-visual::after {
  content: '';
  position: absolute;
  inset: -40px;
  border-radius: 60px;
  background: radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 65%);
  z-index: -1;
  pointer-events: none;
}

/* ══════════════════════════════════════════════════════════
   PARTNER UNIVERSITIES
══════════════════════════════════════════════════════════ */
.partners {
  padding: 56px 0;
  border-top: 1px solid var(--border-dim);
  border-bottom: 1px solid var(--border-dim);
  background: linear-gradient(180deg, rgba(124,58,237,0.04) 0%, transparent 100%);
}
.partners-label {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: 32px;
}
.partners-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin-bottom: 32px;
}
.partner-logo {
  padding: 12px 24px;
  border-radius: var(--r-md);
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-dim);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-3);
  letter-spacing: 0.08em;
  transition: all 0.3s;
  cursor: default;
}
.partner-logo:hover {
  color: var(--text-1);
  border-color: var(--border);
  background: rgba(124,58,237,0.06);
  transform: translateY(-2px);
}

/* ══════════════════════════════════════════════════════════
   FEATURED COURSES
══════════════════════════════════════════════════════════ */
.courses { padding: 120px 0; position: relative; z-index: 60; }
.section-header { margin-bottom: 60px; }
.section-header-inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.course-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}
.filter-btn {
  padding: 8px 20px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  border: 1px solid var(--border-dim);
  background: transparent;
  color: var(--text-2);
  transition: all 0.2s;
}
.filter-btn.active, .filter-btn:hover {
  border-color: var(--violet-bright);
  background: rgba(124,58,237,0.12);
  color: #c4b5fd;
}

.courses-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 12px; align-items: start; }
.courses .container { position: relative; z-index: 62; }
@media(max-width:1024px) { .courses-grid { grid-template-columns: repeat(2, 1fr); } }
@media(max-width:640px)  { .courses-grid { grid-template-columns: 1fr; } }

.course-card {
  background: linear-gradient(180deg, rgba(26,26,46,0.98), rgba(18,18,36,0.95));
  border: 1.8px solid rgba(124,58,237,0.36);
  border-radius: var(--r-lg);
  overflow: hidden;
  transition: all 0.24s cubic-bezier(0.4,0,0.2,1);
  cursor: pointer;
  position: relative;
  box-shadow: 0 12px 40px rgba(0,0,0,0.6);
  min-height: 340px;
  z-index: 64;
  opacity: 1 !important;
  visibility: visible !important;
}
.course-card:hover { transform: translateY(-8px); box-shadow: 0 46px 110px rgba(0,0,0,0.65), 0 0 56px rgba(124,58,237,0.18); border-color: rgba(124,58,237,0.54); }
.course-thumb {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(20,18,36,0.6), var(--surface));
  z-index: 66;
}
/* Force visibility in case a parent overlay hides content */
.courses, .courses * {
  opacity: 1 !important;
  visibility: visible !important;
}
.course-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s; }
.course-card:hover .course-thumb img { transform: scale(1.06); }
.course-thumb-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 30%, rgba(7,7,26,0.9) 100%);
}
.course-tags {
  position: absolute;
  top: 12px; left: 12px; right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.tag {
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.tag-violet { background: rgba(124,58,237,0.25); color: #c4b5fd; border: 1px solid rgba(124,58,237,0.4); }
.tag-gold   { background: rgba(245,158,11,0.2); color: var(--gold-bright); border: 1px solid rgba(245,158,11,0.35); }
.tag-cyan   { background: rgba(6,182,212,0.2); color: var(--cyan); border: 1px solid rgba(6,182,212,0.35); }
.tag-rose   { background: rgba(225,29,72,0.2); color: #fb7185; border: 1px solid rgba(225,29,72,0.35); }
.tag-emerald { background: rgba(5,150,105,0.2); color: #34d399; border: 1px solid rgba(5,150,105,0.35); }

.course-body { padding: 20px; }
.course-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-1);
  line-height: 1.4;
  margin-bottom: 8px;
}
.course-instructor { font-size: 12px; color: var(--text-3); margin-bottom: 14px; }
.course-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.course-rating { display: flex; align-items: center; gap: 4px; }
.rating-val { font-size: 13px; font-weight: 700; color: var(--gold-bright); }
.rating-stars { color: var(--gold-bright); font-size: 11px; letter-spacing: -1px; }
.rating-count { font-size: 11px; color: var(--text-3); }
.course-duration { font-size: 11px; color: var(--text-3); display: flex; align-items: center; gap: 4px; }
.course-price {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--gold-bright);
}

/* ══════════════════════════════════════════════════════════
   DEPARTMENTS
══════════════════════════════════════════════════════════ */
.departments { padding: 120px 0; background: linear-gradient(180deg, var(--void) 0%, rgba(124,58,237,0.04) 50%, var(--void) 100%); }
.dept-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
@media(max-width:1024px) { .dept-grid { grid-template-columns: repeat(2, 1fr); } }
@media(max-width:640px)  { .dept-grid { grid-template-columns: 1fr; } }

.dept-card {
  padding: 32px 28px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
}
.dept-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--dept-color, var(--violet));
  opacity: 0;
  transition: opacity 0.3s;
}
.dept-card:hover { transform: translateY(-8px); }
.dept-card:hover::after { opacity: 1; }
.dept-icon {
  width: 56px; height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 20px;
  background: var(--dept-bg, rgba(124,58,237,0.12));
  border: 1px solid var(--dept-border, rgba(124,58,237,0.25));
}
.dept-name {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 10px;
}
.dept-desc { font-size: 13px; color: var(--text-2); line-height: 1.7; margin-bottom: 20px; }
.dept-count { font-size: 12px; color: var(--text-3); display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
.dept-explore {
  font-size: 13px;
  font-weight: 600;
  color: var(--dept-accent, #a78bfa);
  display: flex;
  align-items: center;
  gap: 6px;
  transition: gap 0.2s;
}
.dept-card:hover .dept-explore { gap: 10px; }

/* ══════════════════════════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════════════════════════ */
.hiw {
  padding: 120px 0;
  background: linear-gradient(180deg, var(--surface) 0%, var(--void) 100%);
  border-top: 1px solid var(--border-dim);
  border-bottom: 1px solid var(--border-dim);
}
.hiw-steps {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  position: relative;
  margin-top: 72px;
}
@media(max-width:1024px) { .hiw-steps { grid-template-columns: 1fr 1fr; gap: 24px; } }
@media(max-width:640px)  { .hiw-steps { grid-template-columns: 1fr; } }

.hiw-connector {
  position: absolute;
  top: 44px;
  left: 10%; right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
  z-index: 0;
}
@media(max-width:1024px) { .hiw-connector { display: none; } }

.hiw-step {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 16px;
}
.hiw-num {
  width: 88px; height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 28px;
  position: relative;
  border: 1px solid var(--border);
  background: var(--card);
  transition: all 0.3s;
}
.hiw-step:hover .hiw-num {
  border-color: var(--violet);
  box-shadow: 0 0 30px rgba(124,58,237,0.4);
  color: #c4b5fd;
}
.hiw-num-inner {
  width: 64px; height: 64px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
}
.hiw-icon-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1px dashed rgba(124,58,237,0.3);
  animation: spin 20s linear infinite;
}
.hiw-step-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 10px;
}
.hiw-step-desc { font-size: 13px; color: var(--text-2); line-height: 1.7; }
.hiw-step-num-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--text-3);
  text-transform: uppercase;
  margin-bottom: 8px;
}

/* ══════════════════════════════════════════════════════════
   COMMUNITY & CLAN
══════════════════════════════════════════════════════════ */
.community { padding: 120px 0; }
.community-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 48px;
  align-items: start;
}
@media(max-width:900px) { .community-grid { grid-template-columns: 1fr; } }

.clan-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 24px;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.clan-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--clan-color, var(--violet)), transparent);
}
.clan-card:hover { transform: translateY(-4px); border-color: var(--clan-color, rgba(124,58,237,0.4)); }

.clan-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.clan-avatar {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: rgba(124,58,237,0.12);
  border: 1px solid var(--border);
}
.clan-rank {
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(245,158,11,0.15);
  color: var(--gold-bright);
  border: 1px solid rgba(245,158,11,0.3);
}
.clan-name {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 8px;
}
.clan-meta { display: flex; gap: 16px; margin-bottom: 16px; }
.clan-meta-item { font-size: 12px; color: var(--text-3); display: flex; align-items: center; gap: 4px; }
.clan-progress-bar {
  height: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 8px;
}
.clan-progress-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--violet), var(--cyan));
}
.clan-progress-label { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-3); }

.leaderboard {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
}
.lb-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-dim);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.lb-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-1);
}
.lb-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  transition: background 0.2s;
}
.lb-row:hover { background: rgba(124,58,237,0.05); }
.lb-row:last-child { border-bottom: none; }
.lb-pos {
  width: 28px;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}
.lb-pos.gold-pos { color: #fbbf24; }
.lb-pos.silver-pos { color: #94a3b8; }
.lb-pos.bronze-pos { color: #cd7f32; }
.lb-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: white;
  font-family: var(--font-body);
  flex-shrink: 0;
}
.lb-name { flex: 1; font-size: 13px; font-weight: 500; color: var(--text-1); }
.lb-clan { font-size: 11px; color: var(--text-3); }
.lb-xp { font-size: 13px; font-weight: 700; color: #c4b5fd; font-family: var(--font-display); }

.badges-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.badge-icon {
  width: 52px; height: 52px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  border: 2px solid var(--border);
  background: var(--elevated);
  transition: all 0.3s;
  cursor: default;
}
.badge-icon:hover { border-color: var(--violet); transform: scale(1.1); box-shadow: 0 0 20px rgba(124,58,237,0.3); }
.badge-label { font-size: 10px; color: var(--text-3); text-align: center; max-width: 52px; }

/* ══════════════════════════════════════════════════════════
   COMPETITIONS
══════════════════════════════════════════════════════════ */
.competitions { padding: 120px 0; background: linear-gradient(180deg, var(--void) 0%, rgba(6,182,212,0.03) 50%, var(--void) 100%); }
.comp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
@media(max-width:1024px) { .comp-grid { grid-template-columns: 1fr 1fr; } }
@media(max-width:640px)  { .comp-grid { grid-template-columns: 1fr; } }

.comp-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
  position: relative;
  transition: all 0.3s;
  cursor: pointer;
}
.comp-card:hover { transform: translateY(-6px); border-color: var(--cyan); box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(6,182,212,0.08); }
.comp-banner {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.comp-banner-icon { font-size: 48px; z-index: 1; position: relative; }
.comp-live-badge {
  position: absolute;
  top: 12px; right: 12px;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 700;
  background: rgba(225,29,72,0.2);
  color: #fb7185;
  border: 1px solid rgba(225,29,72,0.4);
  display: flex; align-items: center; gap: 5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.comp-live-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #f43f5e;
  animation: pulse 1.2s ease-in-out infinite;
}
.comp-body { padding: 24px; }
.comp-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 10px;
  line-height: 1.4;
}
.comp-desc { font-size: 13px; color: var(--text-2); line-height: 1.6; margin-bottom: 20px; }
.comp-prize {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--r-md);
  background: rgba(245,158,11,0.07);
  border: 1px solid rgba(245,158,11,0.2);
  margin-bottom: 20px;
}
.comp-prize-val {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 800;
  color: var(--gold-bright);
}
.comp-prize-label { font-size: 11px; color: var(--text-3); }
.countdown-wrap { margin-bottom: 20px; }
.countdown-label { font-size: 11px; color: var(--text-3); margin-bottom: 8px; letter-spacing: 0.06em; }
.countdown { display: flex; gap: 8px; }
.countdown-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 44px;
  padding: 8px;
  border-radius: var(--r-sm);
  background: var(--elevated);
  border: 1px solid var(--border-dim);
}
.countdown-val {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
  color: var(--text-1);
  line-height: 1;
}
.countdown-unit-label { font-size: 9px; color: var(--text-3); letter-spacing: 0.08em; text-transform: uppercase; }
.countdown-sep { font-size: 18px; color: var(--text-3); font-weight: 800; align-self: flex-start; padding-top: 8px; }

/* ══════════════════════════════════════════════════════════
   STATS SECTION
══════════════════════════════════════════════════════════ */
.stats-section {
  padding: 100px 0;
  border-top: 1px solid var(--border-dim);
  border-bottom: 1px solid var(--border-dim);
  background: linear-gradient(180deg, var(--surface) 0%, var(--void) 100%);
}
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
@media(max-width:900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; } }

.stat-block {
  padding: 48px 32px;
  text-align: center;
  position: relative;
  border-right: 1px solid var(--border-dim);
  transition: background 0.3s;
}
.stat-block:last-child { border-right: none; }
.stat-block:hover { background: rgba(124,58,237,0.04); }
.stat-icon-wrap {
  width: 56px; height: 56px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
  font-size: 24px;
  background: rgba(124,58,237,0.1);
  border: 1px solid rgba(124,58,237,0.2);
}
.stat-value {
  font-family: var(--font-display);
  font-size: 52px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.04em;
  margin-bottom: 10px;
  background: linear-gradient(180deg, var(--text-1) 0%, rgba(167,139,250,0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.stat-label-text {
  font-size: 13px;
  color: var(--text-2);
  font-weight: 500;
  letter-spacing: 0.03em;
}
.stat-sublabel { font-size: 11px; color: var(--text-3); margin-top: 4px; }

/* ══════════════════════════════════════════════════════════
   INSTRUCTORS
══════════════════════════════════════════════════════════ */
.instructors { padding: 120px 0; }
.instructor-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
@media(max-width:1024px) { .instructor-grid { grid-template-columns: repeat(2, 1fr); } }
@media(max-width:640px)  { .instructor-grid { grid-template-columns: 1fr; } }

.instructor-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 28px 24px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.instructor-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.instructor-card:hover::before { opacity: 1; }
.instructor-card:hover { transform: translateY(-8px); border-color: rgba(124,58,237,0.35); box-shadow: 0 24px 60px rgba(0,0,0,0.5); }

.instructor-avatar {
  width: 80px; height: 80px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px;
  font-weight: 800;
  color: white;
  font-family: var(--font-body);
  margin: 0 auto 20px;
  position: relative;
}
.instructor-avatar::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--violet), var(--cyan));
  z-index: -1;
}
.instructor-name {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 6px;
}
.instructor-title { font-size: 12px; color: var(--text-3); margin-bottom: 4px; }
.instructor-uni { font-size: 12px; color: #a78bfa; margin-bottom: 16px; }
.instructor-stats { display: flex; justify-content: center; gap: 20px; }
.instructor-stat-val {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-1);
}
.instructor-stat-label { font-size: 10px; color: var(--text-3); }

.become-instructor-banner {
  margin-top: 56px;
  padding: 48px;
  border-radius: var(--r-xl);
  background: linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.06));
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.banner-title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 8px;
}
.banner-sub { font-size: 14px; color: var(--text-2); line-height: 1.7; max-width: 520px; }

/* ══════════════════════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════════════════════ */
.testimonials {
  padding: 120px 0;
  background: linear-gradient(180deg, var(--surface) 0%, var(--void) 100%);
  border-top: 1px solid var(--border-dim);
}
.testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
@media(max-width:1024px) { .testi-grid { grid-template-columns: 1fr 1fr; } }
@media(max-width:640px)  { .testi-grid { grid-template-columns: 1fr; } }

.testi-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 32px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}
.testi-card:hover { transform: translateY(-6px); box-shadow: 0 24px 60px rgba(0,0,0,0.5); }
.testi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent);
}
.testi-stars { color: var(--gold-bright); font-size: 14px; letter-spacing: 2px; margin-bottom: 20px; }
.testi-quote-icon {
  font-size: 48px;
  line-height: 1;
  color: rgba(124,58,237,0.2);
  font-family: Georgia, serif;
  position: absolute;
  top: 20px; right: 24px;
}
.testi-text {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.85;
  font-style: italic;
  margin-bottom: 28px;
}
.testi-divider { height: 1px; background: var(--border-dim); margin-bottom: 20px; }
.testi-author { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.testi-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 700; color: white;
  font-family: var(--font-body);
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--violet), var(--cyan));
}
.testi-name { font-size: 14px; font-weight: 600; color: var(--text-1); }
.testi-role { font-size: 12px; color: var(--text-3); }
.testi-course-badge {
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 600;
  background: rgba(124,58,237,0.12);
  color: #a78bfa;
  border: 1px solid rgba(124,58,237,0.25);
  white-space: nowrap;
}

/* ══════════════════════════════════════════════════════════
   PRICING
══════════════════════════════════════════════════════════ */
.pricing { padding: 120px 0; }
.pricing-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border-radius: 99px;
  background: var(--card);
  border: 1px solid var(--border);
  margin-bottom: 60px;
}
.toggle-btn {
  padding: 9px 22px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  color: var(--text-2);
  background: transparent;
}
.toggle-btn.active {
  background: linear-gradient(135deg, #5b21b6, #7c3aed);
  color: white;
  box-shadow: 0 4px 16px rgba(124,58,237,0.4);
}
.save-badge {
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 700;
  background: rgba(5,150,105,0.15);
  color: #34d399;
  border: 1px solid rgba(5,150,105,0.3);
  margin-left: 4px;
}

.pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: start; }
@media(max-width:900px) { .pricing-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; } }

.pricing-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: 40px 36px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}
.pricing-card.featured {
  background: linear-gradient(145deg, rgba(91,33,182,0.2), rgba(124,58,237,0.1));
  border-color: var(--violet);
  box-shadow: 0 0 60px rgba(124,58,237,0.2);
}
.pricing-card:hover { transform: translateY(-6px); }
.pricing-card.featured:hover { box-shadow: 0 20px 80px rgba(124,58,237,0.35); }
.pricing-top-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--violet), var(--cyan));
}
.popular-badge {
  position: absolute;
  top: 20px; right: 20px;
  padding: 5px 14px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  background: var(--gold-bright);
  color: #1a0a00;
  letter-spacing: 0.04em;
}
.plan-name {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: 16px;
}
.plan-name.featured-name { color: #a78bfa; }
.plan-price {
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 900;
  color: var(--text-1);
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: 6px;
}
.plan-period { font-size: 13px; color: var(--text-3); margin-bottom: 28px; }
.plan-divider { height: 1px; background: var(--border-dim); margin-bottom: 28px; }
.plan-features { list-style: none; display: flex; flex-direction: column; gap: 14px; margin-bottom: 36px; }
.plan-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text-2);
}
.feature-check {
  width: 20px; height: 20px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px;
  flex-shrink: 0;
  background: rgba(124,58,237,0.15);
  color: #a78bfa;
  border: 1px solid rgba(124,58,237,0.3);
}
.pricing-card.featured .feature-check { background: rgba(124,58,237,0.25); }

/* ══════════════════════════════════════════════════════════
   FAQ
══════════════════════════════════════════════════════════ */
.faq { padding: 120px 0; background: linear-gradient(180deg, var(--surface) 0%, var(--void) 100%); border-top: 1px solid var(--border-dim); }
.faq-list { display: flex; flex-direction: column; gap: 4px; max-width: 800px; margin: 0 auto; }
.faq-item {
  background: var(--card);
  border: 1px solid var(--border-dim);
  border-radius: var(--r-md);
  overflow: hidden;
  transition: border-color 0.2s;
}
.faq-item.open { border-color: rgba(124,58,237,0.35); }
.faq-question {
  width: 100%;
  padding: 22px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 500;
  color: var(--text-1);
  transition: color 0.2s;
}
.faq-question:hover { color: #c4b5fd; }
.faq-icon {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(124,58,237,0.1);
  border: 1px solid rgba(124,58,237,0.25);
  color: #a78bfa;
  font-size: 16px;
  flex-shrink: 0;
  transition: all 0.3s;
  font-weight: 300;
}
.faq-item.open .faq-icon { background: rgba(124,58,237,0.2); transform: rotate(45deg); }
.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1);
}
.faq-item.open .faq-answer { max-height: 300px; }
.faq-answer-inner {
  padding: 0 28px 24px;
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.8;
  border-top: 1px solid var(--border-dim);
  padding-top: 20px;
  margin-top: 0;
}

/* ══════════════════════════════════════════════════════════
   FINAL CTA
══════════════════════════════════════════════════════════ */
.final-cta { padding: 120px 0 160px; position: relative; overflow: hidden; }
.final-cta-box {
  border-radius: var(--r-2xl);
  padding: 100px 60px;
  text-align: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(91,33,182,0.15), rgba(124,58,237,0.08), rgba(6,182,212,0.05));
  border: 1px solid rgba(124,58,237,0.3);
  box-shadow: 0 40px 100px rgba(0,0,0,0.5), 0 0 80px rgba(124,58,237,0.1);
}
.final-cta-box::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--violet), var(--gold-bright), transparent);
}
.final-cta-box::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyan), var(--violet), transparent);
}
.cta-glow {
  position: absolute;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 700px; height: 350px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 65%);
  pointer-events: none;
}
.final-cta-title {
  font-family: var(--font-display);
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin-bottom: 24px;
  color: var(--text-1);
  position: relative;
  z-index: 1;
}
.final-cta-sub {
  font-size: 18px;
  color: var(--text-2);
  line-height: 1.8;
  max-width: 520px;
  margin: 0 auto 48px;
  font-weight: 300;
  position: relative;
  z-index: 1;
}
.final-cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 40px; position: relative; z-index: 1; }
.final-trust-row { display: flex; gap: 32px; justify-content: center; flex-wrap: wrap; position: relative; z-index: 1; }
.trust-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-3); }
.trust-check { color: #a78bfa; font-size: 14px; }
`;

// ══════════════════════════════════════════════════════════
// COSMIC BACKGROUND
// ══════════════════════════════════════════════════════════
function CosmicBg() {
  const stars = useRef([]);
  if (!stars.current.length) {
    stars.current = Array.from({ length: 100 }, (_, i) => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: i % 9 === 0 ? 2 : 1,
      opacity: Math.random() * 0.6 + 0.1,
      duration: 2.5 + Math.random() * 5,
      delay: Math.random() * 8,
    }));
  }
  return (
    <div className="cosmic-layer">
      {stars.current.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', top: `${s.top}%`, left: `${s.left}%`,
          width: s.size, height: s.size, borderRadius: '50%', background: 'white',
          '--op': s.opacity,
          animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}
      <div style={{ position:'absolute', top:'-15%', right:'-8%', width:800, height:800, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 68%)', animation:'orb-drift 24s ease-in-out infinite' }} />
      <div style={{ position:'absolute', bottom:'-12%', left:'-8%', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 68%)', animation:'orb-drift2 30s ease-in-out infinite' }} />
      <div style={{ position:'absolute', top:'40%', left:'30%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 68%)', animation:'orb-drift3 38s ease-in-out infinite' }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// HERO
// ══════════════════════════════════════════════════════════
function Hero() {
  const [heroStats, setHeroStats] = useState({
    users: "0+",
    courses: "0+",
    competitions: "0+",
    activeUsers: "0+",
  });

  useEffect(() => {
    let mounted = true;
    api.get("/admin/homepage")
      .then((res) => {
        if (!mounted) return;
        const data = res.data?.data || {};
        setHeroStats({
          users: formatCompactNumber(data.totalUsers),
          courses: formatCompactNumber(data.totalCourses),
          competitions: formatCompactNumber(data.ongoingCompetitions),
          activeUsers: formatCompactNumber(data.activeUsers),
        });
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  return (
    <section className="section hero">
      <div className="container">
        <div className="hero-grid">
          {/* Left */}
          <div>
            <div className="hero-announce">
              <span className="announce-badge">New</span>
              AI-Powered Learning Paths are live 
            </div>
            <h1 className="hero-title">
              <span className="gradient-mixed" style={{
                background:'linear-gradient(135deg, #c4b5fd 0%, #7c3aed 40%, #f59e0b 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>Learn Without</span>
              <br />
              <span style={{ color:'var(--text-1)' }}>Limits.</span>
              <br />
              <span style={{ color:'var(--text-1)' }}>Grow Without</span>
              <br />
              <span style={{
                background:'linear-gradient(135deg, #f59e0b 0%, #7c3aed 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>Borders.</span>
            </h1>
            <p className="hero-sub">
              NextUniVerse unites Universities, Departments, Courses, Clans and Competitions into one cosmic ecosystem — built for the next generation of scholars.
            </p>
            <div className="hero-btns">
              <Link to="/courses" className="btn btn-primary btn-lg">
                Explore Courses <span style={{ fontSize:18 }}>→</span>
              </Link>
              <Link to="/register" className="btn btn-outline-gold btn-lg">
                <span style={{
                  width:28, height:28, borderRadius:'50%',
                  background:'var(--gold-bright)', display:'inline-flex',
                  alignItems:'center', justifyContent:'center',
                  color:'#1a0a00', fontSize:12, flexShrink:0,
                }}>▶</span>
                Join Free
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-val">{heroStats.users}</div>
                <div className="hero-stat-label">Students</div>
              </div>
              <div className="hero-stat-divider" />
              <div>
                <div className="hero-stat-val">{heroStats.courses}</div>
                <div className="hero-stat-label">Courses</div>
              </div>
              <div className="hero-stat-divider" />
              <div>
                <div className="hero-stat-val">{heroStats.competitions}</div>
                <div className="hero-stat-label">Competitions</div>
              </div>
            </div>
          </div>

          {/* Right — Visual */}
          <div className="hero-visual">
            <div className="hero-visual-main">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700&q=80"
                alt="NextUniVerse Platform"
              />
              <div className="hero-visual-overlay" />
              {/* Scanline effect */}
              <div style={{ position:'absolute', inset:0, background:'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(124,58,237,0.02) 2px, rgba(124,58,237,0.02) 4px)', pointerEvents:'none' }} />
            </div>

            {/* Float cards */}
            <div className="hero-float-card hero-float-1">
              <div className="float-stat-label">🎓 Enrolled Today</div>
              <div className="float-stat-val" style={{ color:'var(--text-1)' }}>{heroStats.activeUsers}</div>
              <div className="float-stat-sub" style={{ color:'#34d399' }}>active in the last 7 days</div>
            </div>
            <div className="hero-float-card hero-float-2">
              <div className="float-stat-label">⚡ Live Now</div>
              <div className="float-stat-val" style={{ color:'var(--gold-bright)' }}>{heroStats.competitions}</div>
              <div className="float-stat-sub">ongoing competitions</div>
            </div>
            <div className="hero-float-card hero-float-3" style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:24 }}>🏆</span>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text-1)', fontFamily:'var(--font-display)' }}>#1 Ed-Tech Platform</div>
                <div style={{ fontSize:11, color:'var(--text-3)' }}>{heroStats.users} learners trust us</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// PARTNER UNIVERSITIES
// ══════════════════════════════════════════════════════════
function Partners() {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    let mounted = true;
    api.get("/universities?page=1&pageSize=10")
      .then((res) => {
        if (!mounted) return;
        const raw = res.data?.data || res.data?.universities || [];
        const names = (Array.isArray(raw) ? raw : []).map(u => u.name || u.title).filter(Boolean);
        setUniversities(names.slice(0, 10));
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  return (
    <section className="section partners">
      <div className="container">
        <p className="partners-label">Trusted by learners from the world's leading universities</p>
        <div className="partners-grid">
          {universities.length > 0
            ? universities.map(u => (
                <div key={u} className="partner-logo">{u}</div>
              ))
            : <div className="partner-logo" style={{ gridColumn:'1 / -1' }}>No universities available yet.</div>
          }
        </div>
        <div style={{ textAlign:'center' }}>
          <Link to="/universities" className="btn btn-ghost btn-sm">View All Universities →</Link>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// FEATURED COURSES — real backend data
// ══════════════════════════════════════════════════════════
function Courses() {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState([
    { key: "popular", label: "Popular", kind: "popular" },
    { key: "new", label: "New", kind: "new" },
  ]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("popular");

  useEffect(() => {
    let mounted = true;

    api.get("/departments?page=1&pageSize=8")
      .then((res) => {
        if (!mounted) return;
        const raw = res.data?.departments || res.data?.data || [];
        const dynamicFilters = (Array.isArray(raw) ? raw : []).slice(0, 4).map((d) => ({
          key: `dept-${d.id}`,
          label: d.code || d.departmentCode || d.name || "Department",
          kind: "department",
          id: d.id,
        }));
        setFilters([
          { key: "popular", label: "Popular", kind: "popular" },
          { key: "new", label: "New", kind: "new" },
          ...dynamicFilters,
        ]);
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const selectedFilter = filters.find((f) => f.key === activeFilter) || filters[0];
    const endpoint = selectedFilter?.kind === "popular"
      ? "/courses/popular"
      : selectedFilter?.kind === "new"
        ? "/courses/new"
        : `/courses/department/${selectedFilter?.id}?page=1&pageSize=12`;

    api.get(endpoint)
      .then(res => {
        if (!mounted) return;
        const raw = res.data?.data || res.data?.courses || res.data || [];
        const list = (Array.isArray(raw) ? raw : raw.items || raw.courses || []).map(c => ({
          id: c.id || c._id,
          img: c.thumbnailUrl || c.thumbnail || c.image || null,
          title: c.title || c.name || c.courseName || "Untitled Course",
          instructor: c.teacherName || c.teacher?.name || c.instructorName || "Staff",
          rating: (() => { const r = c.averageRating ?? c.rating ?? null; return r != null && !isNaN(+r) ? +r : null; })(),
          students: c.enrollmentCount ?? c.students ?? "—",
          duration: c.duration || c.durationHours ? `${c.durationHours || c.duration}h` : null,
          price: c.price != null ? (Number(c.price) === 0 ? "Free" : `$${c.price}`) : (c.isFree ? "Free" : "—"),
          tag: (c.tag || c.category || c.departmentName || c.department?.name || "Course").toString(),
          badge: c.badge || c.label || null,
        }));
        setCourses(list);
      })
      .catch(() => mounted && setCourses([]))
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [activeFilter, filters]);

  const tagColors = ["tag-violet","tag-cyan","tag-gold","tag-rose","tag-emerald"];

  return (
    <section className="section courses">
      <div className="container">
        <div className="section-header">
            <div className="section-header-inner">
            <div>
              <span className="section-eyebrow gold"><span className="eyebrow-dot gold" />Featured Courses</span>
              <h2 className="display-heading" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
                Courses students{" "}
                <span style={{ background:'linear-gradient(135deg, #fbbf24, #7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>love</span>
              </h2>
            </div>
            <Link to="/courses" className="btn btn-ghost">Browse All Courses →</Link>
          </div>
        </div>

        <div className="course-filters">
          {filters.map(f => (
            <button
              key={f.key}
              className={`filter-btn${activeFilter === f.key ? " active" : ""}`}
              onClick={() => setActiveFilter(f.key)}
            >{f.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'var(--text-3)' }}>
            <div style={{ width:40,height:40,border:'3px solid rgba(124,58,237,0.2)',borderTopColor:'var(--violet)',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px' }} />
            <p>Loading courses…</p>
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text-3)' }}>
            <p style={{ fontFamily:'var(--font-display)', fontSize:18, fontStyle:'italic', marginBottom:18 }}>No courses found for this filter.</p>
            <div className="courses-grid">
              {[0,1,2].map(i => (
                <div key={i} className="course-card" style={{ opacity:0.9 }}>
                  <div className="course-thumb" style={{ display:'flex',alignItems:'center',justifyContent:'center',fontSize:48 }}>
                    📚
                  </div>
                  <div className="course-body" style={{ padding:16 }}>
                    <div style={{ height:18, width:'70%', background:'linear-gradient(90deg,#1f1b35,#0e0d18)', borderRadius:6, marginBottom:8 }} />
                    <div style={{ height:12, width:'40%', background:'linear-gradient(90deg,#11101f,#0b0b12)', borderRadius:6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.slice(0,6).map((c, i) => (
              <div key={c.id || i} className="course-card">
                <div className="course-thumb">
                  {c.img
                    ? <img src={c.img} alt={c.title} />
                    : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48, background:'linear-gradient(135deg,var(--elevated),var(--surface))' }}>📚</div>
                  }
                  <div className="course-thumb-overlay" />
                  <div className="course-tags">
                    <span className={`tag ${tagColors[i % tagColors.length]}`}>{c.tag}</span>
                    {c.badge && <span className="tag tag-gold">{c.badge}</span>}
                  </div>
                </div>
                <div className="course-body">
                  <div className="course-title">{c.title}</div>
                  <div className="course-instructor">by {c.instructor}</div>
                  <div className="course-meta">
                    <div className="course-rating">
                      <span className="rating-val">{c.rating != null ? c.rating.toFixed(1) : "—"}</span>
                      <span className="rating-stars">★</span>
                      <span className="rating-count">({typeof c.students === "number" ? c.students.toLocaleString() : c.students})</span>
                    </div>
                    {c.duration && (
                      <div className="course-duration">⏱ {c.duration}</div>
                    )}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                    <span className="course-price">{c.price}</span>
                    <Link to="/courses" className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:'center' }}>Enroll Now</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// DEPARTMENTS
// ══════════════════════════════════════════════════════════
function Departments() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    let mounted = true;
    api.get("/departments?page=1&pageSize=8")
      .then((res) => {
        if (!mounted) return;
        const raw = res.data?.departments || res.data?.data || [];
        const palette = [
          { color:"#7c3aed", bg:"rgba(124,58,237,0.12)", border:"rgba(124,58,237,0.25)", accent:"#c4b5fd", icon:"💻" },
          { color:"#d97706", bg:"rgba(245,158,11,0.1)", border:"rgba(245,158,11,0.25)", accent:"#fbbf24", icon:"⚡" },
          { color:"#06b6d4", bg:"rgba(6,182,212,0.1)", border:"rgba(6,182,212,0.25)", accent:"#22d3ee", icon:"📊" },
          { color:"#059669", bg:"rgba(5,150,105,0.1)", border:"rgba(5,150,105,0.25)", accent:"#34d399", icon:"🧬" },
        ];

        const mapped = (Array.isArray(raw) ? raw : []).slice(0, 8).map((d, i) => {
          const p = palette[i % palette.length];
          return {
            icon: p.icon,
            name: d.name || d.departmentName || "Department",
            abbr: d.code || (d.name || "DP").slice(0, 3).toUpperCase(),
            desc: d.description || `${d.name || "Department"} courses and learning pathways.`,
            courses: Number(d.totalCourses ?? d.courseCount ?? 0),
            color: p.color,
            bg: p.bg,
            border: p.border,
            accent: p.accent,
          };
        });

        setDepartments(mapped);
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  return (
    <section className="section departments">
      <div className="container">
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <span className="section-eyebrow"><span className="eyebrow-dot" />Academic Departments</span>
          <h2 className="display-heading" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
            Find your{" "}
            <span style={{ background:'linear-gradient(135deg, #a78bfa, #06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>discipline</span>
          </h2>
          <p style={{ color:'var(--text-2)', marginTop:16, fontSize:16, maxWidth:500, margin:'16px auto 0' }}>
            Expert-curated courses organized by department — pick your field and dive in.
          </p>
        </div>

        <div className="dept-grid">
          {departments.length === 0 && (
            <div className="dept-card" style={{ gridColumn:'1 / -1', textAlign:'center' }}>
              No departments available right now.
            </div>
          )}
          {departments.map((d, i) => (
            <div
              key={i}
              className="dept-card"
              style={{ '--dept-color': d.color, '--dept-bg': d.bg, '--dept-border': d.border, '--dept-accent': d.accent }}
            >
              <div className="dept-icon" style={{ background:d.bg, border:`1px solid ${d.border}` }}>
                {d.icon}
              </div>
              <div className="dept-name">{d.name}</div>
              <div className="dept-desc">{d.desc}</div>
              <div className="dept-count">
                <span>📚</span> {d.courses} courses
              </div>
              <div className="dept-explore">
                <span style={{ padding:'2px 8px', borderRadius:99, fontSize:10, fontWeight:700, background:d.bg, color:d.accent, border:`1px solid ${d.border}` }}>{d.abbr}</span>
                Explore Department →
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// HOW IT WORKS
// ══════════════════════════════════════════════════════════
function HowItWorks() {
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    let mounted = true;

    api.get('/admin/homepage')
      .then((res) => {
        if (!mounted) return;
        const d = res.data?.data || {};
        setSteps([
          { num:'01', emoji:'🏛️', title:'Choose University', desc:`Start with ${formatCompactNumber(d.totalUniversities)} universities available on the platform.` },
          { num:'02', emoji:'📐', title:'Select Department', desc:`Explore ${formatCompactNumber(d.totalDepartments)} academic departments and learning paths.` },
          { num:'03', emoji:'📚', title:'Join a Course', desc:`Pick from ${formatCompactNumber(d.totalCourses)} active courses and begin learning immediately.` },
          { num:'04', emoji:'⚔️', title:'Join a Clan', desc:`Collaborate in ${formatCompactNumber(d.activeClans)} active clans and level up faster.` },
          { num:'05', emoji:'🏆', title:'Compete & Earn', desc:`Participate in ${formatCompactNumber(d.ongoingCompetitions)} live competitions right now.` },
        ]);
      })
      .catch(() => setSteps([]));

    return () => { mounted = false; };
  }, []);

  return (
    <section className="section hiw">
      <div className="container">
        <div style={{ textAlign:'center', marginBottom:0 }}>
          <span className="section-eyebrow cyan"><span className="eyebrow-dot cyan" />Your Journey</span>
          <h2 className="display-heading" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
            Five steps to{" "}
            <span style={{ background:'linear-gradient(135deg, #06b6d4, #7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>mastery</span>
          </h2>
          <p style={{ color:'var(--text-2)', marginTop:16, fontSize:16, maxWidth:480, margin:'16px auto 0' }}>
            A structured path from choosing your university to competing on a global stage.
          </p>
        </div>

        <div className="hiw-steps">
          <div className="hiw-connector" />
          {steps.map((s, i) => (
            <div key={i} className="hiw-step">
              <div className="hiw-num">
                <div className="hiw-icon-ring" />
                <div className="hiw-num-inner" style={{ background:`rgba(124,58,237,0.12)`, border:`1px solid rgba(124,58,237,0.25)` }}>
                  <span style={{ fontSize:26 }}>{s.emoji}</span>
                </div>
              </div>
              <div className="hiw-step-num-label">Step {s.num}</div>
              <div className="hiw-step-title">{s.title}</div>
              <div className="hiw-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// COMMUNITY & CLAN
// ══════════════════════════════════════════════════════════
function CommunityClans() {
  const [clans, setClans] = useState(DEFAULT_COMMUNITY_CLANS);
  const [leaderboard, setLeaderboard] = useState(DEFAULT_COMMUNITY_LEADERBOARD);
  const [badges, setBadges] = useState(DEFAULT_COMMUNITY_BADGES);
  const [communityStats, setCommunityStats] = useState(DEFAULT_COMMUNITY_STATS);

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      api.get("/clans/top-clans"),
      api.get("/clans/leaderboard?timeframe=alltime&page=1&pageSize=5"),
    ])
      .then(([topResult, lbResult]) => {
        if (!mounted) return;

        const topRaw = topResult.status === "fulfilled"
          ? (topResult.value.data?.clans || topResult.value.data?.data || [])
          : [];
        const lbRaw = lbResult.status === "fulfilled"
          ? (lbResult.value.data?.leaderboard || lbResult.value.data?.data || [])
          : [];

        const topList = Array.isArray(topRaw) ? topRaw : [];
        const lbList = Array.isArray(lbRaw) ? lbRaw : [];

        const list = topList.slice(0, 3);
        const maxPoints = Math.max(1, ...list.map(c => Number(c.totalPoints ?? 0)));
        const mappedClans = list.map((c, i) => ({
          name: c.name || `Clan ${i + 1}`,
          emoji: ["⚔️", "🔬", "🐂", "🛡️", "🔥"][i % 5],
          rank: `#${i + 1}`,
          members: Number(c.memberCount ?? 0),
          xp: `${Number(c.totalPoints ?? 0).toLocaleString()} XP`,
          progress: Math.max(8, Math.min(100, Math.round((Number(c.totalPoints ?? 0) / maxPoints) * 100))),
          color: CLAN_COLORS[i % CLAN_COLORS.length],
        }));
        if (mappedClans.length > 0) {
          setClans(mappedClans);
        }

        const mappedLb = lbList.slice(0, 5).map((r, i) => {
          const clan = r.clan || {};
          const name = clan.name || `Clan ${i + 1}`;
          return {
            pos: String(i + 1).padStart(2, "0"),
            name,
            clan: clan.tag ? `#${clan.tag}` : `${Number(r.memberCount ?? clan.memberCount ?? 0)} members`,
            xp: `${Number(r.totalPoints ?? clan.totalPoints ?? 0).toLocaleString()} XP`,
            avatar: initialsFromName(name),
            color: CLAN_COLORS[i % CLAN_COLORS.length],
          };
        });
        if (mappedLb.length > 0) {
          setLeaderboard(mappedLb);
          setBadges(mappedLb.slice(0, 6).map((r, i) => ({
            icon: ["🔥", "⚡", "💎", "🎯", "🌟", "🛡️"][i % 6],
            label: `${r.name.split(" ")[0]} Rank`,
          })));
        }

        const hasLiveStats = topList.length > 0 || lbList.length > 0;
        if (hasLiveStats) {
          const totalPoints = lbList.reduce((sum, r) => sum + Number(r.totalPoints ?? r.clan?.totalPoints ?? 0), 0);
          setCommunityStats([
            { label:"Active Clans", val:formatCompactNumber(topList.length), icon:"⚔️" },
            { label:"Total Clan Points", val:formatCompactNumber(totalPoints), icon:"⚡" },
            { label:"Leaderboard Entries", val:formatCompactNumber(lbList.length), icon:"🏅" },
            { label:"Top Clan Members", val:formatCompactNumber(topList.reduce((sum, c) => sum + Number(c.memberCount ?? 0), 0)), icon:"👑" },
          ]);
        }
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  return (
    <section className="section community">
      <div className="container">
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <span className="section-eyebrow"><span className="eyebrow-dot" />Community & Clans</span>
          <h2 className="display-heading" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
            Learn together,{" "}
            <span style={{ background:'linear-gradient(135deg, #a78bfa, #f59e0b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>win together</span>
          </h2>
          <p style={{ color:'var(--text-2)', marginTop:16, fontSize:16, maxWidth:500, margin:'16px auto 0' }}>
            Join a Clan, earn XP, climb the leaderboard and unlock exclusive achievement badges.
          </p>
        </div>

        <div className="community-grid">
          {/* Left — Clan cards + badges */}
          <div>
            <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:28 }}>
              {clans.map((c,i) => (
                <div key={i} className="clan-card" style={{ '--clan-color': c.color }}>
                  <div className="clan-header">
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div className="clan-avatar" style={{ background:`rgba(124,58,237,0.1)` }}>{c.emoji}</div>
                      <div className="clan-name">{c.name}</div>
                    </div>
                    <span className="clan-rank">{c.rank}</span>
                  </div>
                  <div className="clan-meta">
                    <div className="clan-meta-item">👥 {c.members} members</div>
                    <div className="clan-meta-item">⚡ {c.xp}</div>
                  </div>
                  <div className="clan-progress-bar">
                    <div className="clan-progress-fill" style={{ width:`${c.progress}%` }} />
                  </div>
                  <div className="clan-progress-label">
                    <span>Season progress</span>
                    <span>{c.progress}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p style={{ fontSize:12, color:'var(--text-3)', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:16 }}>Achievement Badges</p>
              <div className="badges-row">
                {badges.map((b,i) => (
                  <div key={i} className="badge-item">
                    <div className="badge-icon">{b.icon}</div>
                    <span className="badge-label">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/clans" className="btn btn-primary" style={{ marginTop:28, width:'100%', justifyContent:'center' }}>
              Join a Clan ⚔️
            </Link>
          </div>

          {/* Right — Leaderboard */}
          <div>
            <div className="leaderboard">
              <div className="lb-header">
                <span className="lb-title">🏆 Global Leaderboard</span>
                <span style={{ fontSize:12, color:'var(--text-3)' }}>This Season</span>
              </div>
              {leaderboard.map((r,i) => (
                <div key={i} className="lb-row">
                  <div className={`lb-pos ${i===0?'gold-pos':i===1?'silver-pos':i===2?'bronze-pos':''}`}>
                    {i < 3 ? ["🥇","🥈","🥉"][i] : r.pos}
                  </div>
                  <div className="lb-avatar" style={{ background:`linear-gradient(135deg, ${r.color}, #1e1b4b)` }}>{r.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div className="lb-name">{r.name}</div>
                    <div className="lb-clan">{r.clan}</div>
                  </div>
                  <div className="lb-xp">{r.xp}</div>
                </div>
              ))}
            </div>

            {/* Stats beneath */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:20 }}>
              {communityStats.map((s,i) => (
                <div key={i} style={{ padding:'20px', background:'var(--card)', border:'1px solid var(--border-dim)', borderRadius:'var(--r-md)', textAlign:'center' }}>
                  <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text-1)' }}>{s.val}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// COMPETITIONS
// ══════════════════════════════════════════════════════════
function useCountdown(targetDate) {
  const [time, setTime] = useState({ d:0, h:0, m:0, s:0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(targetDate) - new Date());
      setTime({
        d: Math.floor(diff/86400000),
        h: Math.floor((diff%86400000)/3600000),
        m: Math.floor((diff%3600000)/60000),
        s: Math.floor((diff%60000)/1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

function CompCard({ comp }) {
  const time = useCountdown(comp.deadline);
  return (
    <div className="comp-card">
      <div className="comp-banner" style={{ background: comp.bg }}>
        <span className="comp-banner-icon">{comp.icon}</span>
        <div className="comp-live-badge">
          <div className="comp-live-dot" />
          Live
        </div>
      </div>
      <div className="comp-body">
        <div className="comp-title">{comp.title}</div>
        <div className="comp-desc">{comp.desc}</div>

        <div className="comp-prize">
          <span style={{ fontSize:24 }}>🏆</span>
          <div>
            <div className="comp-prize-val">{comp.prize}</div>
            <div className="comp-prize-label">{comp.prizeLabel}</div>
          </div>
          <div style={{ marginLeft:'auto', fontSize:12, color:'var(--text-3)' }}>
            👥 {comp.participants.toLocaleString()} registered
          </div>
        </div>

        <div className="countdown-wrap">
          <div className="countdown-label">⏳ Closes in</div>
          <div className="countdown">
            <div className="countdown-unit"><span className="countdown-val">{String(time.d).padStart(2,"0")}</span><span className="countdown-unit-label">Days</span></div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit"><span className="countdown-val">{String(time.h).padStart(2,"0")}</span><span className="countdown-unit-label">Hrs</span></div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit"><span className="countdown-val">{String(time.m).padStart(2,"0")}</span><span className="countdown-unit-label">Min</span></div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit"><span className="countdown-val">{String(time.s).padStart(2,"0")}</span><span className="countdown-unit-label">Sec</span></div>
          </div>
        </div>

        <Link to={comp.id ? `/competitions/${comp.id}` : "/competitions"} className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }}>Register Now →</Link>
      </div>
    </div>
  );
}

function Competitions() {
  const [competitions, setCompetitions] = useState([]);

  useEffect(() => {
    let mounted = true;
    api.get("/competitions?page=1&pageSize=3")
      .then((res) => {
        if (!mounted) return;
        const raw = res.data?.data || res.data?.competitions || [];
        const mapped = (Array.isArray(raw) ? raw : []).slice(0, 3).map((c, i) => ({
          id: c.id || 0,
          icon: iconForCompetition(c.competitionType || c.type),
          title: c.title || c.name || "Upcoming Competition",
          desc: c.description || "Compete with top learners and showcase your skills.",
          prize: `$${Number(c.prizePool ?? 0).toLocaleString()}`,
          prizeLabel: "Prize Pool",
          bg: COMP_BG[i % COMP_BG.length],
          deadline: c.endDate || c.deadline || c.startDate || new Date().toISOString(),
          participants: Number(c.participantCount ?? c.participants ?? 0),
        }));
        setCompetitions(mapped);
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  return (
    <section className="section competitions">
      <div className="container">
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <span className="section-eyebrow cyan"><span className="eyebrow-dot cyan" />Competitions</span>
          <h2 className="display-heading" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
            Compete on a{" "}
            <span style={{ background:'linear-gradient(135deg, #06b6d4, #f59e0b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>global stage</span>
          </h2>
          <p style={{ color:'var(--text-2)', marginTop:16, fontSize:16, maxWidth:500, margin:'16px auto 0' }}>
            Real cash prizes, elite mentorship, and industry recognition await the best.
          </p>
        </div>
        <div className="comp-grid">
          {competitions.length === 0
            ? <div className="comp-card" style={{ textAlign:'center', padding:'40px 24px' }}>No competitions are available right now.</div>
            : competitions.map((c,i) => <CompCard key={i} comp={c} />)
          }
        </div>
        <div style={{ textAlign:'center', marginTop:40 }}>
          <Link to="/competitions" className="btn btn-ghost">View All Competitions →</Link>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// STATS
// ══════════════════════════════════════════════════════════
function StatsSection() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    let mounted = true;
    api.get("/admin/homepage")
      .then((res) => {
        if (!mounted) return;
        const d = res.data?.data || {};
        setStats([
          { icon:"👥", val:formatCompactNumber(d.totalUsers), label:"Total Students", sub:`Across ${formatCompactNumber(d.totalUniversities)} universities` },
          { icon:"⚔️", val:formatCompactNumber(d.activeClans), label:"Active Clans", sub:"Competing this season" },
          { icon:"🏆", val:formatCompactNumber(d.ongoingCompetitions), label:"Ongoing Competitions", sub:`${formatCompactNumber(d.totalEnrollments)} total enrollments` },
          { icon:"📈", val:formatCompactNumber(d.totalCourses), label:"Total Courses", sub:`${formatCompactNumber(d.totalDepartments)} active departments` },
        ]);
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  return (
    <section className="section stats-section">
      <div className="container">
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <span className="section-eyebrow"><span className="eyebrow-dot" />Platform Scale</span>
          <h2 className="display-heading" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
            Numbers that{" "}
            <span style={{ background:'linear-gradient(135deg, #a78bfa, #06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>speak</span>
          </h2>
        </div>
        <div className="stats-grid">
          {stats.map((s,i) => (
            <div key={i} className="stat-block">
              <div className="stat-icon-wrap">{s.icon}</div>
              <div className="stat-value">{s.val}</div>
              <div className="stat-label-text">{s.label}</div>
              <div className="stat-sublabel">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// INSTRUCTORS
// ══════════════════════════════════════════════════════════
function Instructors() {
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      api.get("/courses/popular"),
      api.get("/courses/new"),
      api.get("/courses?page=1&pageSize=50"),
    ])
      .then((results) => {
        if (!mounted) return;

        const allCourses = results
          .filter(r => r.status === "fulfilled")
          .flatMap((r) => {
            const res = r.value;
            const raw = res.data?.data || res.data?.courses || res.data || [];
            return Array.isArray(raw) ? raw : (raw.items || raw.courses || []);
          });

        const byTeacher = new Map();
        allCourses.forEach((course, index) => {
          const teacherObj = course.teacher || {};
          const teacherId = Number(course.teacherId ?? teacherObj.id ?? 0);
          const teacherName = (
            course.teacherName ||
            teacherObj.name ||
            [teacherObj.firstName, teacherObj.lastName].filter(Boolean).join(" ") ||
            ""
          ).trim();
          const universityName = course.universityName || course.university?.name || "NextUniVerse";
          const courseId = course.id ?? course._id ?? `row-${index}`;

          const key = teacherId > 0
            ? `id:${teacherId}`
            : teacherName
              ? `name:${teacherName.toLowerCase()}:${String(universityName).toLowerCase()}`
              : `unknown:${courseId}`;

          const existing = byTeacher.get(key) || {
            name: teacherName || `Instructor ${index + 1}`,
            uni: universityName,
            title: `${course.departmentName || course.department?.name || "Academic"} Instructor`,
            students: 0,
            courses: 0,
          };

          existing.students += Number(course.enrollmentCount ?? course.students ?? 0);
          existing.courses += 1;
          if (!existing.uni && universityName) existing.uni = universityName;
          byTeacher.set(key, existing);
        });

        const colors = ["#7c3aed", "#06b6d4", "#d97706", "#059669", "#e11d48"];
        const mapped = Array.from(byTeacher.values())
          .filter(item => item.name)
          .sort((a, b) => b.students - a.students)
          .slice(0, 4)
          .map((item, idx) => ({
            initials: initialsFromName(item.name),
            name: item.name,
            title: item.title,
            uni: item.uni || "NextUniVerse",
            students: formatCompactNumber(item.students).replace("+", ""),
            courses: item.courses,
            color: colors[idx % colors.length],
          }));

        setInstructors(mapped);
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  return (
    <section className="section instructors">
      <div className="container">
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <span className="section-eyebrow gold"><span className="eyebrow-dot gold" />Expert Instructors</span>
          <h2 className="display-heading" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
            Learn from the{" "}
            <span style={{ background:'linear-gradient(135deg, #fbbf24, #7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>world's best</span>
          </h2>
          <p style={{ color:'var(--text-2)', marginTop:16, fontSize:16, maxWidth:500, margin:'16px auto 0' }}>
            Verified practitioners from real courses and active classrooms.
          </p>
        </div>

        <div className="instructor-grid">
          {instructors.map((ins,i) => (
            <div key={i} className="instructor-card">
              <div className="instructor-avatar" style={{ background:`linear-gradient(135deg, ${ins.color}, #1e1b4b)`, '--glow': ins.color }}>
                {ins.initials}
              </div>
              <div className="instructor-name">{ins.name}</div>
              <div className="instructor-title">{ins.title}</div>
              <div className="instructor-uni">{ins.uni}</div>
              <div className="instructor-stats">
                <div style={{ textAlign:'center' }}>
                  <div className="instructor-stat-val">{ins.students}</div>
                  <div className="instructor-stat-label">Students</div>
                </div>
                <div style={{ width:1, background:'var(--border-dim)', margin:'0 4px' }} />
                <div style={{ textAlign:'center' }}>
                  <div className="instructor-stat-val">{ins.courses}</div>
                  <div className="instructor-stat-label">Courses</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="become-instructor-banner">
          <div>
            <div className="banner-title">Share your expertise. <span style={{ background:'linear-gradient(135deg, #a78bfa, #06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Earn globally.</span></div>
            <p className="banner-sub">Join 5,000+ instructors creating impact. Teach your passion, set your schedule, earn on your terms — with full platform support.</p>
          </div>
          <button className="btn btn-primary btn-lg">Become an Instructor →</button>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// TESTIMONIALS
// ══════════════════════════════════════════════════════════
function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    let mounted = true;

    api.get('/reviews/stats')
      .then((res) => {
        if (!mounted) return;
        const data = res.data?.data || {};
        const recent = data.recentReviews || [];
        const helpful = data.topHelpfulReviews || [];

        const rows = [...recent, ...helpful]
          .map((entry) => entry.review || entry.Review || entry)
          .filter((review) => review && review.comment)
          .slice(0, 6)
          .map((review, idx) => ({
            stars: Number(review.rating || 5),
            text: review.comment,
            name: review.userName || `Learner ${idx + 1}`,
            role: `Learner • ${review.courseTitle || 'Course'}`,
            avatar: initialsFromName(review.userName || `Learner ${idx + 1}`),
            course: review.courseTitle || 'Course Feedback',
          }));

        setTestimonials(rows);
      })
      .catch(() => setTestimonials([]));

    return () => { mounted = false; };
  }, []);

  return (
    <section className="section testimonials">
      <div className="container">
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <span className="section-eyebrow gold"><span className="eyebrow-dot gold" />Student Stories</span>
          <h2 className="display-heading" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
            Real people.{" "}
            <span style={{ background:'linear-gradient(135deg, #fbbf24, #a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Real results.</span>
          </h2>
        </div>
        <div className="testi-grid">
          {testimonials.length === 0 && (
            <div className="testi-card" style={{ gridColumn:'1 / -1', textAlign:'center' }}>
              No learner feedback has been published yet.
            </div>
          )}
          {testimonials.map((t,i) => (
            <div key={i} className="testi-card">
              <div className="testi-quote-icon">"</div>
              <div className="testi-stars">{"★".repeat(t.stars)}</div>
              <p className="testi-text">"{t.text}"</p>
              <div className="testi-divider" />
              <div className="testi-author">
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div className="testi-avatar">{t.avatar}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
                <span className="testi-course-badge">{t.course}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// PRICING
// ══════════════════════════════════════════════════════════
const PLANS = [
  {
    name:"Free", price:"$0", period:"forever", featured:false,
    features:["50+ free courses","Community access","Basic certificates","Mobile app","Progress tracking","Clan membership (1)"],
    cta:"Start Free", ctaStyle:"ghost",
  },
  {
    name:"Pro", price_m:"$39", price_y:"$29", period_m:"/month", period_y:"/month, billed annually", featured:true,
    features:["All 12,500+ courses","AI learning paths","Live cohorts","Industry certificates","Mentor access","Career coaching","Offline downloads","Priority support","Unlimited clans"],
    cta:"Start Pro Trial", ctaStyle:"primary", badge:"Most Popular ⭐",
  },
  {
    name:"Premium", price_m:"$99", price_y:"$79", period_m:"/month per team", period_y:"/month per team, billed annually", featured:false,
    features:["Everything in Pro","Team dashboard","Admin analytics","SSO integration","Dedicated CSM","Custom content","API access","White-label option"],
    cta:"Contact Sales", ctaStyle:"gold",
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(true);
  return (
    <section className="section pricing">
      <div className="container">
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <span className="section-eyebrow"><span className="eyebrow-dot" />Pricing</span>
          <h2 className="display-heading" style={{ fontSize:'clamp(28px,3.5vw,48px)', marginBottom:32 }}>
            Invest in your{" "}
            <span style={{ background:'linear-gradient(135deg, #a78bfa, #fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>future</span>
          </h2>
          <div className="pricing-toggle" style={{ margin:'0 auto' }}>
            <button className={`toggle-btn${!annual?" active":""}`} onClick={()=>setAnnual(false)}>Monthly</button>
            <button className={`toggle-btn${annual?" active":""}`} onClick={()=>setAnnual(true)}>
              Annual {annual && <span className="save-badge">Save 25%</span>}
            </button>
          </div>
        </div>

        <div className="pricing-grid">
          {PLANS.map((p,i) => {
            const price = p.price || (annual ? p.price_y : p.price_m);
            const period = p.period || (annual ? p.period_y : p.period_m);
            return (
              <div key={i} className={`pricing-card${p.featured?" featured":""}`}>
                {p.featured && <div className="pricing-top-bar" />}
                {p.badge && <div className="popular-badge">{p.badge}</div>}
                <div className={`plan-name${p.featured?" featured-name":""}`}>{p.name}</div>
                <div className="plan-price">{price}</div>
                <div className="plan-period">{period}</div>
                <div className="plan-divider" />
                <ul className="plan-features">
                  {p.features.map((f,j) => (
                    <li key={j} className="plan-feature">
                      <div className="feature-check">✓</div>
                      <span style={{ color: p.featured ? 'var(--text-1)' : 'var(--text-2)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`btn btn-${p.ctaStyle} btn-lg`} style={{ width:'100%', justifyContent:'center' }}>
                  {p.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// FAQ
// ══════════════════════════════════════════════════════════
function FAQ() {
  const [open, setOpen] = useState(null);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      api.get('/admin/homepage'),
      api.get('/reviews/stats'),
      api.get('/clans/top-clans'),
    ])
      .then((results) => {
        if (!mounted) return;
        const homepage = results[0].status === 'fulfilled' ? (results[0].value.data?.data || {}) : {};
        const reviewStats = results[1].status === 'fulfilled' ? (results[1].value.data?.data || {}) : {};
        const clansRaw = results[2].status === 'fulfilled'
          ? (results[2].value.data?.clans || results[2].value.data?.data || [])
          : [];

        const nextFaqs = [
          {
            q: 'How many courses can I start with?',
            a: `You can begin with any of the ${formatCompactNumber(homepage.totalCourses)} currently available courses.`
          },
          {
            q: 'How active is the platform community?',
            a: `There are ${formatCompactNumber(homepage.totalUsers)} learners and ${formatCompactNumber(homepage.activeClans)} active clans contributing weekly.`
          },
          {
            q: 'Are competitions currently available?',
            a: `Yes — ${formatCompactNumber(homepage.ongoingCompetitions)} competitions are running at the moment.`
          },
          {
            q: 'What do learners rate courses on average?',
            a: `Current review average is ${Number(reviewStats.averageRating ?? 0).toFixed(1)} / 5 from ${formatCompactNumber(reviewStats.totalReviews)} reviews.`
          },
          {
            q: 'Can I join a clan right away?',
            a: `Yes. Top public clans are listed live, with ${formatCompactNumber((Array.isArray(clansRaw) ? clansRaw : []).reduce((sum, c) => sum + Number(c.memberCount ?? 0), 0))} members across the current leaderboard.`
          },
        ];

        setFaqs(nextFaqs);
      })
      .catch(() => setFaqs([]));

    return () => { mounted = false; };
  }, []);

  return (
    <section className="section faq">
      <div className="container">
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <span className="section-eyebrow"><span className="eyebrow-dot" />FAQ</span>
          <h2 className="display-heading" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
            Questions{" "}
            <span style={{ background:'linear-gradient(135deg, #a78bfa, #06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>answered</span>
          </h2>
        </div>
        <div className="faq-list">
          {faqs.map((f,i) => (
            <div key={i} className={`faq-item${open===i?" open":""}`}>
              <button className="faq-question" onClick={()=>setOpen(open===i?null:i)}>
                {f.q}
                <div className="faq-icon">+</div>
              </button>
              <div className="faq-answer">
                <div className="faq-answer-inner">{f.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// FINAL CTA
// ══════════════════════════════════════════════════════════
function FinalCTA() {
  const [totalUsers, setTotalUsers] = useState('0+');

  useEffect(() => {
    let mounted = true;

    api.get('/admin/homepage')
      .then((res) => {
        if (!mounted) return;
        const d = res.data?.data || {};
        setTotalUsers(formatCompactNumber(d.totalUsers));
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  return (
    <section className="section final-cta">
      <div className="container">
        <div className="final-cta-box">
          <div className="cta-glow" />
          {/* Decorative star grid */}
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 60%)', pointerEvents:'none' }} />

          <div style={{ fontSize:52, marginBottom:20, position:'relative', zIndex:1, animation:'float 5s ease-in-out infinite' }}>🌌</div>
          <h2 className="final-cta-title">
            Your next universe of<br />
            <span style={{ background:'linear-gradient(135deg, #c4b5fd, #7c3aed, #f59e0b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', backgroundSize:'200%', animation:'shimmer 4s ease infinite' }}>
              knowledge awaits.
            </span>
          </h2>
          <p className="final-cta-sub">
            Join {totalUsers} learners who have already started. University-grade learning, clan battles, and real competitions in one platform.
          </p>
          <div className="final-cta-btns">
            <Link to="/register" className="btn btn-primary btn-lg" style={{ padding:'18px 52px', fontSize:16 }}>
              Join Free — Start Today <span style={{ fontSize:18 }}>→</span>
            </Link>
            <Link to="/courses" className="btn btn-ghost btn-lg">
              Explore Courses
            </Link>
          </div>
          <div className="final-trust-row">
            {["No credit card required","Cancel anytime","Free forever plan","Certificates included"].map((t,i) => (
              <div key={i} className="trust-item">
                <span className="trust-check">✦</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// ROOT EXPORT
// ══════════════════════════════════════════════════════════
export default function LandingPage() {
  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <CosmicBg />
        <Hero />
        <Partners />
        <Courses />
        <Departments />
        <HowItWorks />
        <CommunityClans />
        <Competitions />
        <StatsSection />
        <Instructors />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </div>
    </>
  );
}