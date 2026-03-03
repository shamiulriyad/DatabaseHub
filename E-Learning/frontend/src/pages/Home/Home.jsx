import React, { useMemo, useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { formatTime } from '../../utils/formatters';
import { useQuery } from '@tanstack/react-query';
import {
  FaBook, FaUsers, FaTrophy, FaChartLine, FaStar, FaClock,
  FaGraduationCap, FaPlayCircle, FaCertificate, FaSearch,
  FaUniversity, FaArrowRight, FaFire, FaBell, FaBolt,
  FaShieldAlt, FaMedal, FaFlame,
} from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';

const formatCompactNumber = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return '0+';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M+`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K+`;
  return `${num}+`;
};

const getCourseProgress = (course) => {
  const raw = course?.progressPercentage
    ?? course?.ProgressPercentage
    ?? course?.progress
    ?? 0;
  const value = Number(raw);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
};

const resolveCourseId = (course) => {
  return course?.id
    ?? course?.courseId
    ?? course?.CourseId
    ?? course?.course?.id
    ?? course?.course?.courseId
    ?? course?.course?.CourseId
    ?? null;
};

const getCourseRoute = (course) => {
  const courseId = resolveCourseId(course);
  return courseId !== null && courseId !== undefined && String(courseId).trim() !== ''
    ? `/courses/${courseId}`
    : '/courses';
};

const isCourseCompleted = (course) => {
  const status = String(course?.status ?? course?.Status ?? '').toLowerCase();
  if (status.includes('complete')) return true;
  return getCourseProgress(course) >= 100;
};

// ═══════════════════════════════════════════════════════════
// COSMIC DARK PREMIUM — HOME PAGE
// Fonts : Playfair Display + DM Sans  |  Mode: Dark Only
// ═══════════════════════════════════════════════════════════

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --void:     #03030d;
  --deep:     #07071a;
  --surface:  #0a0a20;
  --card:     #0d0d26;
  --elevated: #111130;
  --glass:    rgba(13,13,38,0.75);

  --violet:        #7c3aed;
  --violet-bright: #8b5cf6;
  --violet-glow:   rgba(124,58,237,0.4);
  --indigo:        #4f46e5;
  --cyan:          #06b6d4;
  --gold:          #d97706;
  --gold-bright:   #f59e0b;
  --rose:          #e11d48;
  --emerald:       #059669;
  --emerald-bright:#10b981;

  --border:     rgba(124,58,237,0.18);
  --border-dim: rgba(255,255,255,0.05);
  --border-gold:rgba(245,158,11,0.25);

  --text-1: #f5f3ff;
  --text-2: #a5a0c8;
  --text-3: #5c587a;

  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'DM Sans', sans-serif;

  --r-sm:  8px;
  --r-md:  14px;
  --r-lg:  20px;
  --r-xl:  28px;
  --r-2xl: 36px;

html { scroll-behavior: smooth; }
body {
  font-family: var(--font-body);
  background: var(--void);
  color: var(--text-1);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
::selection { background: var(--violet); color: white; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--deep); }
::-webkit-scrollbar-thumb { background: var(--violet); border-radius: 99px; }

/* ── ANIMATIONS ── */
@keyframes twinkle    { 0%,100%{opacity:var(--op,0.4)} 50%{opacity:0.04} }
@keyframes orb1       { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-45px,35px)} }
@keyframes orb2       { 0%,100%{transform:translate(0,0)} 50%{transform:translate(45px,-45px)} }
@keyframes orb3       { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-20px,30px)} 66%{transform:translate(30px,-20px)} }
@keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
@keyframes float2     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes pulse      { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
@keyframes spin       { to{transform:rotate(360deg)} }
@keyframes shimmer    { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes fadeUp     { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes glow-pulse { 0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.3)} 50%{box-shadow:0 0 40px rgba(124,58,237,0.6),0 0 80px rgba(124,58,237,0.2)} }
@keyframes streak     { 0%{color:var(--gold-bright)} 50%{color:#fde68a} 100%{color:var(--gold-bright)} }

/* ── PAGE SHELL ── */
.home-page {
  position: relative;
  min-height: 100vh;
  background:
    radial-gradient(ellipse 120% 60% at 50% -5%, rgba(79,46,229,0.16) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 92% 88%, rgba(6,182,212,0.07) 0%, transparent 50%),
    var(--void);
}
.cosmic-layer { position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden; }
.z1 { position:relative; z-index:1; }

/* ── HELPERS ── */
.container     { max-width:1200px; margin:0 auto; padding:0 32px; }
.container-sm  { max-width:860px;  margin:0 auto; padding:0 32px; }

.section-eyebrow {
  display:inline-flex; align-items:center; gap:8px;
  padding:5px 14px; border-radius:99px;
  font-family:var(--font-body); font-size:11px; font-weight:600;
  letter-spacing:0.16em; text-transform:uppercase;
  background:rgba(124,58,237,0.12); border:1px solid rgba(124,58,237,0.3); color:#a78bfa;
}
.section-eyebrow.gold  { background:rgba(245,158,11,0.1);  border-color:rgba(245,158,11,0.3);  color:var(--gold-bright); }
.section-eyebrow.cyan  { background:rgba(6,182,212,0.1);   border-color:rgba(6,182,212,0.3);   color:var(--cyan); }
.section-eyebrow.rose  { background:rgba(225,29,72,0.1);   border-color:rgba(225,29,72,0.3);   color:#fb7185; }
.eyebrow-dot { width:6px;height:6px;border-radius:50%;background:#a78bfa;animation:pulse 2s ease-in-out infinite; }
.eyebrow-dot.gold { background:var(--gold-bright); }
.eyebrow-dot.cyan { background:var(--cyan); }

.display-h {
  font-family:var(--font-display); font-weight:700;
  letter-spacing:-0.025em; line-height:1.1; color:var(--text-1);
}
.g-violet { background:linear-gradient(135deg,#c4b5fd,#7c3aed,#4f46e5); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.g-gold   { background:linear-gradient(135deg,#fbbf24,#d97706,#92400e); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.g-mixed  { background:linear-gradient(135deg,#c4b5fd,#7c3aed,#f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; background-size:200%; animation:shimmer 5s ease infinite; }
.g-cyan   { background:linear-gradient(135deg,#22d3ee,#06b6d4,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

/* ── BUTTONS ── */
.btn {
  display:inline-flex; align-items:center; gap:8px;
  padding:12px 24px; border-radius:99px;
  font-family:var(--font-body); font-size:14px; font-weight:600;
  cursor:pointer; border:none; transition:all 0.25s cubic-bezier(0.4,0,0.2,1);
  white-space:nowrap; text-decoration:none;
}
.btn-primary { background:linear-gradient(135deg,#5b21b6,#7c3aed); color:white; box-shadow:0 4px 20px rgba(124,58,237,0.35); }
.btn-primary:hover { transform:translateY(-3px); box-shadow:0 12px 36px rgba(124,58,237,0.5); }
.btn-gold    { background:linear-gradient(135deg,#92400e,#d97706); color:white; box-shadow:0 4px 20px rgba(217,119,6,0.3); }
.btn-gold:hover { transform:translateY(-3px); box-shadow:0 12px 36px rgba(217,119,6,0.5); }
.btn-ghost   { background:transparent; color:var(--text-2); border:1px solid var(--border-dim); }
.btn-ghost:hover { border-color:var(--border); color:var(--text-1); background:rgba(124,58,237,0.06); }
.btn-cyan    { background:rgba(6,182,212,0.12); color:var(--cyan); border:1px solid rgba(6,182,212,0.3); }
.btn-cyan:hover { background:rgba(6,182,212,0.2); transform:translateY(-2px); }
.btn-sm  { padding:8px 18px; font-size:13px; }
.btn-lg  { padding:16px 36px; font-size:15px; }
.btn-xl  { padding:18px 48px; font-size:16px; }
.btn-full { width:100%; justify-content:center; }

/* ── CARDS ── */
.card-base {
  background:var(--card); border:1px solid var(--border);
  border-radius:var(--r-lg); position:relative; overflow:hidden;
  transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
}
.card-base:hover { border-color:rgba(124,58,237,0.4); box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 30px rgba(124,58,237,0.08); transform:translateY(-6px); }
.card-base::before {
  content:''; position:absolute; top:0; left:0; right:0; height:1px;
  background:linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent);
  opacity:0; transition:opacity 0.3s;
}
.card-base:hover::before { opacity:1; }

/* ── DIVIDERS ── */
.divider     { height:1px; background:var(--border-dim); }
.divider-glow{ height:1px; background:linear-gradient(90deg,transparent,var(--violet),transparent); }

/* ── GRID ── */
.grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }
.grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
.grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
.grid-5 { display:grid; grid-template-columns:repeat(5,1fr); gap:16px; }

@media(max-width:1100px){ .grid-4{grid-template-columns:repeat(2,1fr);} .grid-5{grid-template-columns:repeat(3,1fr);} }
@media(max-width:900px) { .grid-3{grid-template-columns:repeat(2,1fr);} .hero-grid{grid-template-columns:1fr !important;} }
@media(max-width:640px) { .grid-2,.grid-3,.grid-4,.grid-5{grid-template-columns:1fr;} .container{padding:0 16px;} .btn-xl{padding:14px 28px;font-size:14px;} .hero-right{display:none !important;} }

/* ══════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════ */
.hero { padding:140px 0 80px; position:relative; overflow:hidden; }
.hero-grid { display:grid; grid-template-columns:1.1fr 1fr; gap:72px; align-items:center; }

.hero-announce {
  display:inline-flex; align-items:center; gap:10px;
  padding:7px 18px; border-radius:99px;
  background:rgba(124,58,237,0.1); border:1px solid rgba(124,58,237,0.3);
  font-size:12px; font-weight:600; color:#c4b5fd; letter-spacing:0.04em;
  margin-bottom:28px; animation:fadeUp 0.8s ease both;
}
.announce-dot { width:6px;height:6px;border-radius:50%;background:var(--violet-bright);animation:pulse 2s ease-in-out infinite; }
.announce-new { padding:2px 8px;border-radius:99px;background:linear-gradient(135deg,#7c3aed,#4f46e5);font-size:10px;font-weight:700;color:white;letter-spacing:0.08em;text-transform:uppercase; }

.hero-title {
  font-family:var(--font-display); font-size:clamp(42px,5.5vw,74px);
  font-weight:900; line-height:1.0; letter-spacing:-0.03em;
  margin-bottom:24px; animation:fadeUp 0.8s 0.1s ease both;
}
.hero-sub {
  font-size:18px; color:var(--text-2); line-height:1.85; max-width:500px;
  margin-bottom:40px; font-weight:300; animation:fadeUp 0.8s 0.2s ease both;
}
.hero-btns { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:48px; animation:fadeUp 0.8s 0.3s ease both; }
.hero-stats { display:flex; gap:36px; align-items:center; animation:fadeUp 0.8s 0.4s ease both; }
.h-stat-val { font-family:var(--font-display); font-size:26px; font-weight:800; color:var(--text-1); letter-spacing:-0.02em; line-height:1; }
.h-stat-label { font-size:11px; color:var(--text-3); font-weight:500; margin-top:4px; }
.h-stat-div { width:1px; align-self:stretch; background:var(--border-dim); }

/* Logged-in hero */
.hero-logged-in { padding:100px 0 60px; }
.welcome-badge { display:inline-flex; align-items:center; gap:10px; padding:10px 20px; border-radius:99px; background:rgba(124,58,237,0.1); border:1px solid rgba(124,58,237,0.3); margin-bottom:20px; }
.streak-pill { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:99px; background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); font-size:12px; font-weight:700; color:var(--gold-bright); animation:streak 2s ease-in-out infinite; }
.xp-bar-wrap { margin-top:20px; }
.xp-bar-label { display:flex; justify-content:space-between; font-size:12px; color:var(--text-3); margin-bottom:6px; }
.xp-bar { height:6px; border-radius:99px; background:rgba(255,255,255,0.06); overflow:hidden; }
.xp-bar-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,var(--violet),var(--cyan)); transition:width 1s ease; }

.comp-reminder {
  display:flex; align-items:center; gap:14px;
  padding:16px 20px; border-radius:var(--r-md);
  background:rgba(225,29,72,0.07); border:1px solid rgba(225,29,72,0.2);
  margin-top:20px; cursor:pointer; transition:all 0.2s;
}
.comp-reminder:hover { background:rgba(225,29,72,0.12); border-color:rgba(225,29,72,0.4); }
.comp-reminder-dot { width:8px;height:8px;border-radius:50%;background:#f43f5e;animation:pulse 1.2s ease-in-out infinite;flex-shrink:0; }

/* Hero visual */
.hero-visual { position:relative; animation:fadeUp 0.9s 0.3s ease both; }
.hero-visual-main { border-radius:var(--r-xl); overflow:hidden; border:1px solid var(--border); box-shadow:0 40px 100px rgba(0,0,0,0.7),0 0 60px rgba(124,58,237,0.12); animation:glow-pulse 4s ease-in-out infinite; }
.hero-visual-main img { width:100%; height:420px; object-fit:cover; display:block; }
.hero-visual-main .overlay { position:absolute; inset:0; background:linear-gradient(180deg,rgba(3,3,13,0.3) 0%,rgba(3,3,13,0.65) 100%); }
.hero-float { position:absolute; padding:14px 18px; border-radius:var(--r-md); background:rgba(5,5,20,0.92); backdrop-filter:blur(20px); border:1px solid var(--border); box-shadow:0 12px 40px rgba(0,0,0,0.5); }
.hero-float-1 { bottom:24px; left:-28px; animation:float 5s ease-in-out infinite; }
.hero-float-2 { top:24px; right:-22px; animation:float2 6.5s ease-in-out infinite; }
.hero-float-3 { bottom:-20px; right:44px; animation:float 7s 1s ease-in-out infinite; }
.float-val { font-family:var(--font-display); font-size:20px; font-weight:800; letter-spacing:-0.02em; line-height:1; }
.float-sub { font-size:11px; color:var(--text-3); margin-top:3px; }
.float-label { font-size:11px; color:var(--text-2); margin-bottom:4px; }
.hero-glow { position:absolute; inset:-40px; border-radius:60px; background:radial-gradient(ellipse,rgba(124,58,237,0.14) 0%,transparent 65%); z-index:-1; pointer-events:none; }

/* ══════════════════════════════════════════════════
   SEARCH BAR
══════════════════════════════════════════════════ */
.search-wrap { padding:28px 0; border-bottom:1px solid var(--border-dim); background:linear-gradient(180deg,var(--void),rgba(124,58,237,0.04)); }
.search-inner { max-width:720px; margin:0 auto; }
.search-form { display:flex; gap:12px; }
.search-input-wrap { flex:1; position:relative; }
.search-icon { position:absolute; left:18px; top:50%; transform:translateY(-50%); color:var(--text-3); pointer-events:none; font-size:16px; }
.search-input {
  width:100%; height:52px; padding:0 20px 0 48px;
  background:var(--card); border:1.5px solid var(--border-dim);
  border-radius:var(--r-md); color:var(--text-1);
  font-family:var(--font-body); font-size:14px;
  outline:none; transition:all 0.2s;
}
.search-input:focus { border-color:var(--violet); box-shadow:0 0 0 3px rgba(124,58,237,0.12); }
.search-input::placeholder { color:var(--text-3); }

/* ══════════════════════════════════════════════════
   ENGAGEMENT TRIO (Continue Learning / Competition / Clan)
══════════════════════════════════════════════════ */
.engagement-trio { padding:48px 0; border-bottom:1px solid var(--border-dim); }
.trio-grid { display:grid; grid-template-columns:1.4fr 1fr 1fr; gap:20px; }
@media(max-width:1000px) { .trio-grid { grid-template-columns:1fr 1fr; } }
@media(max-width:640px)  { .trio-grid { grid-template-columns:1fr; } }

.trio-card { padding:24px; border-radius:var(--r-lg); position:relative; overflow:hidden; }
.trio-card-violet { background:linear-gradient(135deg,rgba(91,33,182,0.18),rgba(124,58,237,0.08)); border:1px solid rgba(124,58,237,0.3); }
.trio-card-rose   { background:rgba(225,29,72,0.07); border:1px solid rgba(225,29,72,0.2); }
.trio-card-gold   { background:rgba(245,158,11,0.07); border:1px solid rgba(245,158,11,0.2); }
.trio-top-bar { position:absolute; top:0; left:0; right:0; height:2px; }
.trio-title { font-family:var(--font-display); font-size:16px; font-weight:600; color:var(--text-1); margin-bottom:6px; }
.trio-sub   { font-size:13px; color:var(--text-2); margin-bottom:18px; line-height:1.5; }

/* Continue learning course row */
.cl-row { display:flex; align-items:center; gap:12px; padding:12px; border-radius:var(--r-md); background:rgba(255,255,255,0.03); border:1px solid var(--border-dim); margin-bottom:10px; transition:background 0.2s; cursor:pointer; }
.cl-row:hover { background:rgba(124,58,237,0.08); }
.cl-thumb { width:48px; height:48px; border-radius:10px; object-fit:cover; background:linear-gradient(135deg,var(--elevated),var(--surface)); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; overflow:hidden; }
.cl-thumb img { width:100%; height:100%; object-fit:cover; }
.cl-title { font-size:13px; font-weight:600; color:var(--text-1); margin-bottom:4px; line-height:1.3; }
.cl-progress-bar { height:3px; border-radius:99px; background:rgba(255,255,255,0.06); overflow:hidden; margin-top:6px; }
.cl-progress-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,var(--violet),var(--cyan)); }
.cl-pct { font-size:10px; color:var(--text-3); margin-top:3px; }

/* ══════════════════════════════════════════════════
   SECTION HEADER
══════════════════════════════════════════════════ */
.section-hdr { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:40px; flex-wrap:wrap; }
.section-hdr-left { display:flex; flex-direction:column; gap:6px; }
.section-h { font-family:var(--font-display); font-size:clamp(24px,2.8vw,36px); font-weight:700; color:var(--text-1); letter-spacing:-0.02em; }

/* ══════════════════════════════════════════════════
   COURSE CARDS
══════════════════════════════════════════════════ */
.courses-section { padding:80px 0; }
.courses-filters { display:flex; gap:8px; margin-bottom:32px; flex-wrap:wrap; }
.filter-btn { padding:7px 18px; border-radius:99px; font-size:13px; font-weight:500; font-family:var(--font-body); cursor:pointer; border:1px solid var(--border-dim); background:transparent; color:var(--text-2); transition:all 0.2s; }
.filter-btn.active,.filter-btn:hover { border-color:var(--violet-bright); background:rgba(124,58,237,0.12); color:#c4b5fd; }

.course-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
@media(max-width:1100px){ .course-grid{grid-template-columns:repeat(2,1fr);} }
@media(max-width:600px) { .course-grid{grid-template-columns:1fr;} }

.c-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r-lg); overflow:hidden; cursor:pointer; transition:all 0.3s cubic-bezier(0.4,0,0.2,1); text-decoration:none; display:block; }
.c-card:hover { transform:translateY(-7px); border-color:rgba(124,58,237,0.4); box-shadow:0 24px 60px rgba(0,0,0,0.5),0 0 24px rgba(124,58,237,0.08); }
.c-thumb { position:relative; height:176px; overflow:hidden; background:linear-gradient(135deg,var(--elevated),var(--surface)); }
.c-thumb img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s; }
.c-card:hover .c-thumb img { transform:scale(1.06); }
.c-thumb-overlay { position:absolute; inset:0; background:linear-gradient(180deg,transparent 35%,rgba(3,3,13,0.85) 100%); }
.c-price-tag { position:absolute; top:12px; right:12px; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; }
.c-price-free { background:rgba(16,185,129,0.2); color:#34d399; border:1px solid rgba(16,185,129,0.35); }
.c-price-paid { background:rgba(124,58,237,0.2); color:#a78bfa; border:1px solid rgba(124,58,237,0.35); }
.c-body { padding:18px; }
.c-title { font-family:var(--font-display); font-size:15px; font-weight:600; color:var(--text-1); line-height:1.4; margin-bottom:6px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.c-uni { font-size:12px; color:var(--text-3); margin-bottom:12px; }
.c-rating { display:flex; align-items:center; gap:5px; margin-bottom:10px; }
.c-rating-val { font-size:13px; font-weight:700; color:var(--gold-bright); }
.c-rating-stars { color:var(--gold-bright); font-size:11px; }
.c-rating-count { font-size:11px; color:var(--text-3); }
.c-meta-row { display:flex; align-items:center; justify-content:space-between; padding-top:10px; border-top:1px solid var(--border-dim); }
.c-duration { font-size:11px; color:var(--text-3); display:flex; align-items:center; gap:4px; }
.c-diff { padding:3px 8px; border-radius:99px; font-size:10px; font-weight:600; }

/* Skeleton */
.skeleton { background:linear-gradient(90deg,var(--elevated) 25%,var(--surface) 50%,var(--elevated) 75%); background-size:200%; animation:shimmer 1.5s ease-in-out infinite; border-radius:var(--r-md); }

/* ══════════════════════════════════════════════════
   UNIVERSITIES
══════════════════════════════════════════════════ */
.universities-section { padding:80px 0; border-top:1px solid var(--border-dim); background:linear-gradient(180deg,rgba(124,58,237,0.04) 0%,var(--void) 100%); }
.uni-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
@media(max-width:1100px){ .uni-grid{grid-template-columns:repeat(2,1fr);} }
@media(max-width:600px) { .uni-grid{grid-template-columns:1fr;} }

.uni-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r-lg); overflow:hidden; cursor:pointer; transition:all 0.3s; text-decoration:none; display:block; }
.uni-card:hover { transform:translateY(-6px); border-color:rgba(245,158,11,0.4); box-shadow:0 20px 60px rgba(0,0,0,0.5); }
.uni-banner { height:100px; position:relative; background:linear-gradient(135deg,rgba(91,33,182,0.3),rgba(217,119,6,0.15)); overflow:hidden; }
.uni-banner img { width:100%; height:100%; object-fit:cover; }
.uni-banner-overlay { position:absolute; inset:0; background:linear-gradient(180deg,transparent,rgba(3,3,13,0.7)); }
.uni-body { padding:16px; }
.uni-logo-wrap { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.uni-logo { width:32px; height:32px; border-radius:8px; object-fit:contain; background:white; padding:3px; }
.uni-logo-fallback { width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg,var(--violet),var(--gold-bright)); display:flex; align-items:center; justify-content:center; font-size:14px; color:white; flex-shrink:0; }
.uni-name { font-family:var(--font-display); font-size:14px; font-weight:600; color:var(--text-1); line-height:1.3; }
.uni-tags { display:flex; gap:6px; flex-wrap:wrap; }
.uni-tag { padding:3px 9px; border-radius:99px; font-size:10px; font-weight:600; }
.uni-tag-violet { background:rgba(124,58,237,0.15); color:#a78bfa; border:1px solid rgba(124,58,237,0.3); }
.uni-tag-gold   { background:rgba(245,158,11,0.12); color:var(--gold-bright); border:1px solid rgba(245,158,11,0.3); }
.uni-tag-dim    { background:rgba(255,255,255,0.04); color:var(--text-3); border:1px solid var(--border-dim); }

/* ══════════════════════════════════════════════════
   DEPARTMENTS
══════════════════════════════════════════════════ */
.departments-section { padding:80px 0; border-top:1px solid var(--border-dim); }
.dept-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
@media(max-width:1100px){ .dept-grid{grid-template-columns:repeat(2,1fr);} }
@media(max-width:600px) { .dept-grid{grid-template-columns:1fr;} }

.dept-card { padding:26px 22px; border-radius:var(--r-lg); position:relative; overflow:hidden; cursor:pointer; transition:all 0.3s; background:var(--card); border:1px solid var(--border); }
.dept-card::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; background:var(--dc,var(--violet)); opacity:0; transition:opacity 0.3s; }
.dept-card:hover { transform:translateY(-6px); }
.dept-card:hover::after { opacity:1; }
.dept-icon { width:50px; height:50px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:24px; margin-bottom:16px; }
.dept-name { font-family:var(--font-display); font-size:16px; font-weight:600; color:var(--text-1); margin-bottom:8px; }
.dept-desc { font-size:13px; color:var(--text-2); line-height:1.6; margin-bottom:14px; }
.dept-count { font-size:11px; color:var(--text-3); display:flex; align-items:center; gap:5px; margin-bottom:12px; }
.dept-link { font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px; transition:gap 0.2s; }
.dept-card:hover .dept-link { gap:10px; }

/* ══════════════════════════════════════════════════
   CLANS & LEADERBOARD
══════════════════════════════════════════════════ */
.clans-section { padding:80px 0; border-top:1px solid var(--border-dim); background:linear-gradient(180deg,rgba(124,58,237,0.04) 0%,var(--void) 100%); }
.clans-grid { display:grid; grid-template-columns:1fr 1.3fr; gap:28px; align-items:start; }
@media(max-width:900px) { .clans-grid { grid-template-columns:1fr; } }

.clan-card { padding:20px; border-radius:var(--r-lg); background:var(--card); border:1px solid var(--border); cursor:pointer; transition:all 0.3s; position:relative; overflow:hidden; margin-bottom:12px; }
.clan-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--cc,var(--violet)),transparent); }
.clan-card:hover { transform:translateY(-3px); border-color:var(--cc,rgba(124,58,237,0.4)); }
.clan-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.clan-avatar { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; background:rgba(124,58,237,0.12); border:1px solid var(--border); }
.clan-rank-badge { padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; background:rgba(245,158,11,0.15); color:var(--gold-bright); border:1px solid rgba(245,158,11,0.3); }
.clan-name { font-family:var(--font-display); font-size:16px; font-weight:600; color:var(--text-1); margin-bottom:8px; }
.clan-meta { display:flex; gap:14px; margin-bottom:14px; }
.clan-meta-item { font-size:12px; color:var(--text-3); }
.clan-prog-bar { height:4px; border-radius:99px; background:rgba(255,255,255,0.05); overflow:hidden; margin-bottom:6px; }
.clan-prog-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,var(--violet),var(--cyan)); }
.clan-prog-label { display:flex; justify-content:space-between; font-size:10px; color:var(--text-3); }

.leaderboard-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r-lg); overflow:hidden; }
.lb-header { padding:18px 22px; border-bottom:1px solid var(--border-dim); display:flex; justify-content:space-between; align-items:center; }
.lb-title { font-family:var(--font-display); font-size:16px; font-weight:600; color:var(--text-1); }
.lb-row { display:flex; align-items:center; gap:14px; padding:13px 22px; border-bottom:1px solid rgba(255,255,255,0.03); transition:background 0.15s; cursor:pointer; }
.lb-row:last-child { border-bottom:none; }
.lb-row:hover { background:rgba(124,58,237,0.04); }
.lb-pos { width:26px; font-family:var(--font-display); font-size:14px; font-weight:700; text-align:center; flex-shrink:0; }
.lb-avatar { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:white; font-family:var(--font-body); flex-shrink:0; }
.lb-info { flex:1; }
.lb-name { font-size:13px; font-weight:500; color:var(--text-1); }
.lb-clan-name { font-size:11px; color:var(--text-3); }
.lb-xp { font-size:13px; font-weight:700; color:#c4b5fd; font-family:var(--font-display); }

/* ══════════════════════════════════════════════════
   COMPETITIONS
══════════════════════════════════════════════════ */
.competitions-section { padding:80px 0; border-top:1px solid var(--border-dim); }
.comp-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
@media(max-width:1000px){ .comp-grid{grid-template-columns:repeat(2,1fr);} }
@media(max-width:600px) { .comp-grid{grid-template-columns:1fr;} }

.comp-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r-lg); overflow:hidden; cursor:pointer; transition:all 0.3s; }
.comp-card:hover { transform:translateY(-6px); border-color:var(--cyan); box-shadow:0 20px 60px rgba(0,0,0,0.4),0 0 24px rgba(6,182,212,0.08); }
.comp-banner { height:110px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
.comp-banner-icon { font-size:44px; position:relative; z-index:1; }
.comp-live-badge { position:absolute; top:12px; right:12px; padding:4px 10px; border-radius:99px; font-size:10px; font-weight:700; background:rgba(225,29,72,0.2); color:#fb7185; border:1px solid rgba(225,29,72,0.4); display:flex; align-items:center; gap:5px; text-transform:uppercase; letter-spacing:0.05em; }
.comp-live-dot { width:5px; height:5px; border-radius:50%; background:#f43f5e; animation:pulse 1.2s ease-in-out infinite; }
.comp-body { padding:20px; }
.comp-title { font-family:var(--font-display); font-size:16px; font-weight:600; color:var(--text-1); margin-bottom:8px; line-height:1.4; }
.comp-desc { font-size:13px; color:var(--text-2); line-height:1.6; margin-bottom:16px; }
.comp-prize { display:flex; align-items:center; gap:10px; padding:12px 14px; border-radius:var(--r-md); background:rgba(245,158,11,0.07); border:1px solid rgba(245,158,11,0.2); margin-bottom:16px; }
.comp-prize-val { font-family:var(--font-display); font-size:18px; font-weight:800; color:var(--gold-bright); }
.comp-prize-label { font-size:11px; color:var(--text-3); }
.countdown { display:flex; gap:6px; margin-bottom:16px; }
.cd-unit { display:flex; flex-direction:column; align-items:center; gap:2px; min-width:40px; padding:7px; border-radius:var(--r-sm); background:var(--elevated); border:1px solid var(--border-dim); }
.cd-val { font-family:var(--font-display); font-size:16px; font-weight:800; color:var(--text-1); line-height:1; }
.cd-label { font-size:8px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.08em; }
.cd-sep { font-size:16px; color:var(--text-3); font-weight:800; align-self:flex-start; padding-top:7px; }

/* ══════════════════════════════════════════════════
   COMMUNITY ACTIVITY FEED
══════════════════════════════════════════════════ */
.community-section { padding:80px 0; border-top:1px solid var(--border-dim); background:linear-gradient(180deg,rgba(6,182,212,0.03),var(--void)); }
.community-grid { display:grid; grid-template-columns:1.4fr 1fr; gap:28px; }
@media(max-width:900px) { .community-grid { grid-template-columns:1fr; } }

.feed-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r-lg); overflow:hidden; }
.feed-header { padding:16px 20px; border-bottom:1px solid var(--border-dim); display:flex; justify-content:space-between; align-items:center; }
.feed-title { font-family:var(--font-display); font-size:15px; font-weight:600; color:var(--text-1); }
.feed-post { display:flex; gap:12px; padding:14px 20px; border-bottom:1px solid rgba(255,255,255,0.03); cursor:pointer; transition:background 0.15s; }
.feed-post:hover { background:rgba(124,58,237,0.04); }
.feed-post:last-child { border-bottom:none; }
.feed-avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:white; font-family:var(--font-body); flex-shrink:0; background:linear-gradient(135deg,var(--violet),var(--indigo)); }
.feed-content { flex:1; }
.feed-author { font-size:13px; font-weight:600; color:var(--text-1); }
.feed-text { font-size:13px; color:var(--text-2); line-height:1.5; margin:3px 0; }
.feed-meta { display:flex; gap:10px; font-size:11px; color:var(--text-3); margin-top:4px; }
.feed-type-badge { padding:2px 7px; border-radius:99px; font-size:10px; font-weight:600; }
.post-type-disc  { background:rgba(124,58,237,0.12); color:#a78bfa; }
.post-type-ann   { background:rgba(245,158,11,0.12); color:var(--gold-bright); }
.post-type-trend { background:rgba(6,182,212,0.12);  color:var(--cyan); }

.trending-topics { display:flex; flex-direction:column; gap:0; }
.trending-item { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-bottom:1px solid rgba(255,255,255,0.03); cursor:pointer; transition:background 0.15s; }
.trending-item:hover { background:rgba(124,58,237,0.04); }
.trending-item:last-child { border-bottom:none; }
.trending-rank { width:24px; font-family:var(--font-display); font-size:13px; font-weight:700; color:var(--text-3); }
.trending-tag { font-size:13px; font-weight:600; color:var(--text-1); }
.trending-count { font-size:11px; color:var(--text-3); }
.trending-hot { font-size:10px; color:#fb7185; background:rgba(225,29,72,0.12); border:1px solid rgba(225,29,72,0.25); padding:2px 7px; border-radius:99px; font-weight:600; }

/* ══════════════════════════════════════════════════
   ACHIEVEMENTS & BADGES
══════════════════════════════════════════════════ */
.achievements-section { padding:80px 0; border-top:1px solid var(--border-dim); }
.ach-grid { display:grid; grid-template-columns:1fr 1.5fr; gap:28px; align-items:start; }
@media(max-width:900px) { .ach-grid { grid-template-columns:1fr; } }

.badge-showcase { display:flex; flex-wrap:wrap; gap:16px; }
.badge-item { display:flex; flex-direction:column; align-items:center; gap:8px; cursor:default; }
.badge-icon-wrap { width:60px; height:60px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:26px; border:2px solid var(--border); background:var(--elevated); transition:all 0.3s; }
.badge-icon-wrap:hover { border-color:var(--violet); transform:scale(1.1); box-shadow:0 0 20px rgba(124,58,237,0.3); }
.badge-label { font-size:10px; color:var(--text-3); text-align:center; max-width:60px; line-height:1.3; }
.badge-locked { opacity:0.35; filter:grayscale(1); }

.top-performers { display:flex; flex-direction:column; gap:10px; }
.performer-row { display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:var(--r-md); background:var(--card); border:1px solid var(--border); cursor:pointer; transition:all 0.2s; }
.performer-row:hover { border-color:rgba(124,58,237,0.3); transform:translateX(4px); }
.performer-medal { font-size:20px; flex-shrink:0; }
.performer-avatar { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:white; font-family:var(--font-body); flex-shrink:0; }
.performer-name { font-size:14px; font-weight:600; color:var(--text-1); }
.performer-meta { font-size:11px; color:var(--text-3); }
.performer-xp { font-family:var(--font-display); font-size:15px; font-weight:700; color:#c4b5fd; margin-left:auto; }

/* ══════════════════════════════════════════════════
   INSTRUCTOR SPOTLIGHT
══════════════════════════════════════════════════ */
.instructors-section { padding:80px 0; border-top:1px solid var(--border-dim); background:linear-gradient(180deg,rgba(124,58,237,0.04),var(--void)); }
.instructor-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
@media(max-width:1100px){ .instructor-grid{grid-template-columns:repeat(2,1fr);} }
@media(max-width:600px) { .instructor-grid{grid-template-columns:1fr;} }

.instructor-card { padding:28px 22px; border-radius:var(--r-lg); background:var(--card); border:1px solid var(--border); text-align:center; cursor:pointer; transition:all 0.3s; position:relative; overflow:hidden; }
.instructor-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent); opacity:0; transition:opacity 0.3s; }
.instructor-card:hover::before { opacity:1; }
.instructor-card:hover { transform:translateY(-6px); border-color:rgba(124,58,237,0.35); box-shadow:0 20px 60px rgba(0,0,0,0.5); }
.instructor-avatar { width:76px; height:76px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:700; color:white; font-family:var(--font-body); margin:0 auto 18px; position:relative; }
.instructor-avatar::after { content:''; position:absolute; inset:-3px; border-radius:50%; background:linear-gradient(135deg,var(--violet),var(--cyan)); z-index:-1; }
.instructor-name { font-family:var(--font-display); font-size:16px; font-weight:600; color:var(--text-1); margin-bottom:5px; }
.instructor-title { font-size:12px; color:var(--text-3); margin-bottom:4px; }
.instructor-uni { font-size:12px; color:#a78bfa; margin-bottom:16px; }
.instructor-stats { display:flex; justify-content:center; gap:20px; }
.ins-stat-val { font-family:var(--font-display); font-size:17px; font-weight:700; color:var(--text-1); }
.ins-stat-label { font-size:10px; color:var(--text-3); }

/* ══════════════════════════════════════════════════
   ANNOUNCEMENTS
══════════════════════════════════════════════════ */
.announcements-section { padding:80px 0; border-top:1px solid var(--border-dim); }
.ann-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; }
@media(max-width:900px) { .ann-grid { grid-template-columns:1fr; } }

.ann-card { padding:26px; border-radius:var(--r-lg); background:var(--card); border:1px solid var(--border); cursor:pointer; transition:all 0.3s; position:relative; overflow:hidden; }
.ann-card:hover { transform:translateY(-4px); }
.ann-top-tag { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:99px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:14px; }
.ann-icon { font-size:28px; margin-bottom:12px; }
.ann-title { font-family:var(--font-display); font-size:17px; font-weight:600; color:var(--text-1); margin-bottom:10px; line-height:1.4; }
.ann-desc { font-size:13px; color:var(--text-2); line-height:1.7; margin-bottom:16px; }
.ann-date { font-size:11px; color:var(--text-3); display:flex; align-items:center; gap:6px; }

/* ══════════════════════════════════════════════════
   FINAL CTA
══════════════════════════════════════════════════ */
.final-cta { padding:100px 0 140px; }
.cta-box { border-radius:var(--r-2xl); padding:80px 56px; text-align:center; position:relative; overflow:hidden; background:linear-gradient(145deg,rgba(91,33,182,0.15),rgba(124,58,237,0.08),rgba(6,182,212,0.05)); border:1px solid rgba(124,58,237,0.3); box-shadow:0 40px 100px rgba(0,0,0,0.5),0 0 80px rgba(124,58,237,0.1); }
.cta-box::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--violet),var(--gold-bright),transparent); }
.cta-box::after  { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--cyan),var(--violet),transparent); }
.cta-glow { position:absolute; top:-100px; left:50%; transform:translateX(-50%); width:600px; height:300px; border-radius:50%; background:radial-gradient(ellipse,rgba(124,58,237,0.2) 0%,transparent 65%); pointer-events:none; }
.cta-title { font-family:var(--font-display); font-size:clamp(32px,4.5vw,58px); font-weight:900; line-height:1.05; letter-spacing:-0.03em; margin-bottom:20px; color:var(--text-1); position:relative; z-index:1; }
.cta-sub { font-size:17px; color:var(--text-2); line-height:1.8; max-width:500px; margin:0 auto 44px; font-weight:300; position:relative; z-index:1; }
.cta-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; margin-bottom:36px; position:relative; z-index:1; }
.trust-row { display:flex; gap:28px; justify-content:center; flex-wrap:wrap; position:relative; z-index:1; }
.trust-item { display:flex; align-items:center; gap:7px; font-size:13px; color:var(--text-3); }
.trust-check { color:#a78bfa; }

@media(max-width:640px) { .cta-box{padding:48px 24px;} }
`;

// ══════════════════════════════════════════════════════════
// COSMIC BACKGROUND
// ══════════════════════════════════════════════════════════
function CosmicBg() {
  const stars = useRef([]);
  if (!stars.current.length) {
    stars.current = Array.from({ length: 90 }, (_, i) => ({
      top: Math.random() * 100, left: Math.random() * 100,
      size: i % 9 === 0 ? 2 : 1,
      op: (Math.random() * 0.55 + 0.08).toFixed(2),
      dur: (2.5 + Math.random() * 5).toFixed(1),
      del: (Math.random() * 8).toFixed(1),
    }));
  }
  return (
    <div className="cosmic-layer">
      {stars.current.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', top: `${s.top}%`, left: `${s.left}%`,
          width: s.size, height: s.size, borderRadius: '50%', background: 'white',
          '--op': s.op,
          animation: `twinkle ${s.dur}s ease-in-out ${s.del}s infinite`,
        }} />
      ))}
      <div style={{ position:'absolute',top:'-18%',right:'-8%',width:750,height:750,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,0.13) 0%,transparent 68%)',animation:'orb1 24s ease-in-out infinite' }} />
      <div style={{ position:'absolute',bottom:'-14%',left:'-8%',width:650,height:650,borderRadius:'50%',background:'radial-gradient(circle,rgba(6,182,212,0.07) 0%,transparent 68%)',animation:'orb2 30s ease-in-out infinite' }} />
      <div style={{ position:'absolute',top:'45%',left:'28%',width:450,height:450,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,0.05) 0%,transparent 68%)',animation:'orb3 38s ease-in-out infinite' }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// AUTH CONTEXT (lightweight — reads from localStorage)
// ══════════════════════════════════════════════════════════
function useAuth() {
  const token = localStorage.getItem('token');
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch {}
  return { isLoggedIn: !!token, user };
}

// ══════════════════════════════════════════════════════════
// COUNTDOWN HOOK
// ══════════════════════════════════════════════════════════
function useCountdown(targetDate) {
  const [t, setT] = useState({ d:0, h:0, m:0, s:0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(targetDate) - new Date());
      setT({ d:Math.floor(diff/86400000), h:Math.floor((diff%86400000)/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [targetDate]);
  return t;
}

// ══════════════════════════════════════════════════════════
// API FETCHERS
// ══════════════════════════════════════════════════════════
const fetchPopularCourses = async () => {
  try { const { data } = await api.get('/courses/popular'); return Array.isArray(data?.courses) ? data.courses : (Array.isArray(data) ? data : []); }
  catch { return []; }
};
const fetchTrendingCourses = async () => {
  try { const { data } = await api.get('/courses/trending'); return Array.isArray(data?.courses) ? data.courses : (Array.isArray(data) ? data : []); }
  catch { return []; }
};
const fetchUniversities = async () => {
  try {
    const { data } = await api.get('/universities', { params: { page:1, pageSize:8 } });
    const d = data?.data ?? data;
    const list = Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : []);
    if (!Array.isArray(list) || list.length === 0) return [];

    const normalizeUniversity = (u, details = null) => {
      const stats = details?.stats ?? details?.Stats ?? {};
      const totalCourses = Number(
        u?.totalCourses ?? u?.TotalCourses ??
        u?.courseCount ?? u?.CourseCount ??
        u?.coursesCount ?? u?.CoursesCount ??
        u?.derivedCourseCount ?? u?.DerivedCourseCount ??
        stats?.totalCourses ?? stats?.TotalCourses ??
        0
      ) || 0;

      return {
        ...u,
        id: u?.id ?? u?.Id,
        name: u?.name ?? u?.Name ?? 'Unknown University',
        bannerUrl: u?.bannerUrl ?? u?.BannerUrl ?? details?.bannerUrl ?? details?.BannerUrl ?? null,
        logoUrl: u?.logoUrl ?? u?.LogoUrl ?? details?.logoUrl ?? details?.LogoUrl ?? null,
        location: u?.location ?? u?.Location ?? details?.location ?? details?.Location ?? null,
        totalCourses,
        averageCourseRating: Number(
          u?.averageCourseRating ?? u?.AverageCourseRating ??
          stats?.averageRating ?? stats?.AverageRating ??
          0
        ) || 0,
      };
    };

    const enriched = await Promise.all(list.map(async (u) => {
      const normalized = normalizeUniversity(u);
      if (normalized.totalCourses > 0 || !(normalized.id > 0)) return normalized;

      try {
        const { data: detailsData } = await api.get(`/universities/${normalized.id}/details`);
        const details = detailsData?.data ?? detailsData;
        return normalizeUniversity({ ...u, ...details }, details);
      } catch {
        return normalized;
      }
    }));

    return enriched;
  } catch { return []; }
};
const fetchMyCourses = async () => {
  const normalize = (list = []) => {
    const src = Array.isArray(list) ? list : [];
    return src.map((row) => ({
      ...row,
      id: row?.id ?? row?.courseId ?? row?.CourseId,
      courseId: row?.courseId ?? row?.CourseId ?? row?.id,
      title: row?.title ?? row?.courseTitle ?? row?.CourseTitle ?? row?.courseName,
      courseName: row?.courseName ?? row?.courseTitle ?? row?.CourseTitle ?? row?.title,
      thumbnailUrl: row?.thumbnailUrl ?? row?.courseThumbnail ?? row?.CourseThumbnail ?? row?.courseBannerUrl ?? row?.CourseBannerUrl,
      progressPercentage: row?.progressPercentage ?? row?.ProgressPercentage ?? row?.progress ?? 0,
      status: row?.status ?? row?.Status,
    }));
  };

  try {
    const { data } = await api.get('/courses/my-courses', { params: { page: 1, pageSize: 50 } });
    const list = data?.courses ?? data?.data?.courses ?? data?.data ?? data;
    return normalize(list);
  } catch {
    try {
      const { data } = await api.get('/enrollments', { params: { page: 1, pageSize: 50 } });
      const list = data?.data?.items ?? data?.data ?? data?.courses ?? data;
      return normalize(list);
    } catch {
      return [];
    }
  }
};
const fetchMyClans = async () => {
  try {
    const { data } = await api.get('/clans/my-clans');
    const d = data?.clans ?? data?.data ?? data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.items)) return d.items;
    if (d && typeof d === 'object') return [d];
    return [];
  } catch {
    try {
      const { data } = await api.get('/clans/my');
      const d = data?.clans ?? data?.data ?? data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.items)) return d.items;
      if (d && typeof d === 'object') return [d];
      return [];
    } catch {
      return [];
    }
  }
};
const fetchDepartments = async () => {
  try {
    const { data } = await api.get('/departments', { params: { page: 1, pageSize: 50 } });
    const d = data?.data ?? data?.items ?? data?.departments ?? data;
    if (Array.isArray(d)) return d;
    return [];
  } catch (e) {
    return [];
  }
};
const fetchCompetitions = async () => {
  try {
    const { data } = await api.get('/competitions', { params: { page: 1, pageSize: 10 } });
    const d = data?.data ?? data?.competitions ?? data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.items)) return d.items;
    return [];
  } catch (e) { return []; }
};

const fetchHomepageSnapshot = async () => {
  try {
    const { data } = await api.get('/admin/homepage');
    return data?.data ?? data ?? {};
  } catch (e) {
    return {};
  }
};

const fetchAnnouncements = async () => {
  const [homeRes, compRes, postRes] = await Promise.allSettled([
    api.get('/admin/homepage'),
    api.get('/competitions', { params: { page: 1, pageSize: 3 } }),
    api.get('/community/posts', { params: { page: 1, pageSize: 1 } }),
  ]);

  const home = homeRes.status === 'fulfilled' ? (homeRes.value.data?.data ?? {}) : {};
  const competitionsRaw = compRes.status === 'fulfilled'
    ? (compRes.value.data?.data ?? compRes.value.data?.competitions ?? compRes.value.data ?? [])
    : [];
  const latestPost = postRes.status === 'fulfilled'
    ? ((postRes.value.data?.data ?? postRes.value.data?.posts ?? postRes.value.data ?? [])[0] ?? null)
    : null;

  const firstCompetition = Array.isArray(competitionsRaw) ? competitionsRaw[0] : null;
  const now = new Date();

  return [
    {
      tag: 'Platform Snapshot',
      icon: '🚀',
      title: `${formatCompactNumber(home.totalUsers)} learners are active`,
      desc: `${formatCompactNumber(home.totalCourses)} courses across ${formatCompactNumber(home.totalUniversities)} universities and ${formatCompactNumber(home.totalDepartments)} departments.`,
      date: now.toLocaleDateString(),
      color: 'rgba(124,58,237,0.2)',
      borderColor: 'rgba(124,58,237,0.3)',
      tagColor: '#a78bfa',
      tagBg: 'rgba(124,58,237,0.12)',
    },
    {
      tag: 'Competition Update',
      icon: '🏆',
      title: firstCompetition?.title || 'Competitions are live',
      desc: firstCompetition?.description || `${formatCompactNumber(home.ongoingCompetitions)} competitions are currently running on the platform.`,
      date: firstCompetition?.endDate ? new Date(firstCompetition.endDate).toLocaleDateString() : now.toLocaleDateString(),
      color: 'rgba(245,158,11,0.08)',
      borderColor: 'rgba(245,158,11,0.25)',
      tagColor: 'var(--gold-bright)',
      tagBg: 'rgba(245,158,11,0.12)',
    },
    {
      tag: 'Community Pulse',
      icon: '📣',
      title: latestPost?.title || latestPost?.userName || 'Latest learner activity',
      desc: latestPost?.content || 'Community posts and discussions are updating live.',
      date: latestPost?.createdAt ? new Date(latestPost.createdAt).toLocaleDateString() : now.toLocaleDateString(),
      color: 'rgba(6,182,212,0.06)',
      borderColor: 'rgba(6,182,212,0.25)',
      tagColor: 'var(--cyan)',
      tagBg: 'rgba(6,182,212,0.12)',
    },
  ];
};
// Community posts (homepage feed)
const fetchCommunityPosts = async () => {
  try {
    const { data } = await api.get('/community/posts', { params: { page: 1, pageSize: 6 } });
    const d = data?.data ?? data?.posts ?? data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.items)) return d.items;
    return [];
  } catch (e) { return []; }
};

// Current authenticated profile (used for badges/streak)
const fetchProfile = async () => {
  try {
    const { data } = await api.get('/auth/profile');
    return data?.user ?? data?.data ?? data ?? null;
  } catch (e) { return null; }
};

const fetchProgression = async () => {
  try {
    const { data } = await api.get('/progression/me');
    if (data?.success) return data?.progression ?? null;
    return data?.progression ?? data?.data ?? data ?? null;
  } catch (e) { return null; }
};

// Fetch instructors (teachers) for a university (fallback safe)
const fetchInstructors = async (universityId = 1) => {
  try {
    const { data } = await api.get(`/universities/${universityId}/teachers`, { params: { page: 1, pageSize: 8 } });
    const d = data?.data ?? data?.items ?? data;
    try { console.debug('[fetchInstructors] raw response:', data, 'derived:', d); } catch (_) {}
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.items)) return d.items;
    // Fallback: some servers expose teachers inside university details as TopTeachers
    try {
      const { data: detailsData } = await api.get(`/universities/${universityId}/details`);
      const det = detailsData?.data ?? detailsData;
      try { console.debug('[fetchInstructors] details response:', detailsData, 'derived:', det); } catch(_) {}
      if (Array.isArray(det?.TopTeachers)) return det.TopTeachers;
      if (Array.isArray(det?.topTeachers)) return det.topTeachers;
      if (Array.isArray(det?.Teachers)) return det.Teachers;
      if (Array.isArray(det?.teachers)) return det.teachers;
    } catch (e) {
      // ignore details fallback errors
    }
    // Fallback: global teachers endpoint
    try {
      const res = await api.get('/teachers', { params: { page:1, pageSize:8 } });
      const payload = res.data?.data ?? res.data ?? [];
      try { console.debug('[fetchInstructors] /teachers fallback payload:', payload); } catch(_) {}
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.teachers)) return payload.teachers;
    } catch (e) {
      // ignore
    }
    return [];
  } catch (e) { return []; }
};

// ══════════════════════════════════════════════════════════
// SECTION HEADER
// ══════════════════════════════════════════════════════════
function SectionHdr({ eyebrow, eyebrowClass='', title, titleGrad, action }) {
  return (
    <div className="section-hdr">
      <div className="section-hdr-left">
        {eyebrow && <span className={`section-eyebrow ${eyebrowClass}`}><span className={`eyebrow-dot ${eyebrowClass}`} />{eyebrow}</span>}
        <h2 className="section-h">
          {title}{' '}
          {titleGrad && <span className={titleGrad.cls}>{titleGrad.text}</span>}
        </h2>
      </div>
      {action}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SEARCH BAR
// ══════════════════════════════════════════════════════════
function SearchBar() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/courses?search=${encodeURIComponent(q.trim())}` : '/courses');
  };
  return (
    <div className="search-wrap z1">
      <div className="container">
        <div className="search-inner">
          <form className="search-form" onSubmit={submit}>
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input className="search-input" value={q} onChange={e => setQ(e.target.value)} placeholder="Search courses, universities, departments…" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height:52, borderRadius:14, flexShrink:0 }}>Search</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// HERO — LOGGED-OUT
// ══════════════════════════════════════════════════════════
function HeroLoggedOut() {
  return (
    <section className="section hero z1">
      <div className="container">
        <div className="hero-grid">
          {/* Left */}
          <div>
            <div className="hero-announce">
              <span className="announce-dot" />
              <span className="announce-new">New</span>
              AI-Powered Learning Paths are live ✦
            </div>
            <h1 className="hero-title">
              <span className="g-mixed" style={{ background:'linear-gradient(135deg,#c4b5fd 0%,#7c3aed 40%,#f59e0b 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                Learn Without
              </span>
              <br />
              <span style={{ color:'var(--text-1)' }}>Limits.</span>
              <br />
              <span style={{ color:'var(--text-1)' }}>Grow Without</span>
              <br />
              <span style={{ background:'linear-gradient(135deg,#f59e0b,#7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                Borders.
              </span>
            </h1>
            <p className="hero-sub">
              NextUniVerse unites Universities, Departments, Courses, Clans and Competitions into one cosmic ecosystem — built for the next generation of scholars.
            </p>
            <div className="hero-btns">
              <Link to="/courses" className="btn btn-primary btn-lg">
                <span style={{ fontSize:15 }}>▶</span> Explore Courses
              </Link>
              <Link to="/register" className="btn btn-gold btn-lg">
                🎓 Join Free
              </Link>
            </div>
            <div className="hero-stats">
              {[
                { val:'2M+', label:'Students' },
                { val:'12,500+', label:'Courses' },
                { val:'340+', label:'Competitions' },
              ].map((s,i) => (
                <React.Fragment key={i}>
                  {i>0 && <div className="h-stat-div" />}
                  <div>
                    <div className="h-stat-val">{s.val}</div>
                    <div className="h-stat-label">{s.label}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          {/* Right */}
          <div className="hero-visual hero-right">
            <div className="hero-visual-main">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80" alt="Platform preview" />
              <div className="overlay" />
              <div style={{ position:'absolute',inset:0,background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(124,58,237,0.02) 2px,rgba(124,58,237,0.02) 4px)',pointerEvents:'none' }} />
            </div>
            <div className="hero-float hero-float-1">
              <div className="float-label">🎓 Enrolled Today</div>
              <div className="float-val" style={{ color:'var(--text-1)' }}>+1,247</div>
              <div className="float-sub" style={{ color:'#34d399' }}>↑ 12% this week</div>
            </div>
            <div className="hero-float hero-float-2">
              <div className="float-label">⚡ Live Now</div>
              <div className="float-val" style={{ color:'var(--gold-bright)' }}>843</div>
              <div className="float-sub">students learning</div>
            </div>
            <div className="hero-float hero-float-3" style={{ display:'flex',alignItems:'center',gap:12 }}>
              <span style={{ fontSize:22 }}>🏆</span>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:'var(--text-1)',fontFamily:'var(--font-display)' }}>#1 Ed-Tech Platform</div>
                <div style={{ fontSize:11,color:'var(--text-3)' }}>2024 Global Award</div>
              </div>
            </div>
            <div className="hero-glow" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// HERO — LOGGED-IN (personalized)
// ══════════════════════════════════════════════════════════
function HeroLoggedIn({ user, myCourses, progression }) {
  const navigate = useNavigate();
  const name = user?.firstName || user?.name?.split(' ')[0] || 'Scholar';
  const xp = Number(
    progression?.exp ?? progression?.Exp ??
    user?.xp ?? user?.Exp ??
    user?.totalXp ?? user?.TotalXp ??
    0
  );
  // default xp required for level 1 is 3200 as requested
  const streak = Number(user?.streakDays ?? user?.StreakDays ?? user?.streak ?? 0) || 0;
  const level = Number(progression?.level ?? progression?.Level ?? user?.level ?? user?.Level ?? (Math.floor(xp / 1000) + 1)) || 1;
  const xpNext = Number(progression?.nextLevelRequiredExp ?? progression?.NextLevelRequiredExp ?? user?.xpForNextLevel ?? user?.XpForNextLevel ?? (level === 1 ? 3200 : (level * 1000))) || 3200;
  const xpPct = xpNext > 0 ? Math.min(100, Math.round((xp / xpNext) * 100)) : 0;

  const totalInProgress = (myCourses || []).filter((c) => !isCourseCompleted(c));
  const inProgress = totalInProgress.slice(0, 3);

  const completedCount = (() => {
    if (typeof user?.completedCourses === 'number') return user.completedCourses;
    const list = Array.isArray(myCourses) ? myCourses : [];
    return list.filter((c) => isCourseCompleted(c)).length;
  })();

  const badgesCount = (() => {
    if (typeof user?.badges === 'number') return user.badges;
    if (Array.isArray(user?.badges)) return user.badges.length;
    return 0;
  })();

  const { data: competitions = [] } = useQuery({ queryKey: ['competitions','home'], queryFn: fetchCompetitions });
  const featuredComp = useMemo(() => {
    if (!Array.isArray(competitions) || competitions.length === 0) return null;
    const now = new Date();
    const active = competitions.find(c => {
      const s = (c.status || '').toString().toLowerCase();
      return ['ongoing','active','live'].includes(s) || c.isActive || c.is_live;
    });
    if (active) return active;
    const upcoming = competitions.filter(c => c.deadline && new Date(c.deadline) > now)
      .sort((a,b) => new Date(a.deadline) - new Date(b.deadline));
    return upcoming[0] || competitions[0];
  }, [competitions]);

  const compTimeLeft = useMemo(() => {
    try {
      if (!featuredComp?.deadline) return null;
      const diff = Math.max(0, new Date(featuredComp.deadline) - new Date());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      return `${d}d ${h}h left`;
    } catch (e) { return null; }
  }, [featuredComp]);

  return (
    <section className="section hero-logged-in z1" style={{ paddingBottom:40 }}>
      <div className="container">
        <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:56, alignItems:'start' }}>
          <div>
            {/* Welcome */}
            <div className="welcome-badge">
              <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--violet),var(--cyan))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }}>
                {name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize:12,color:'var(--text-3)',fontWeight:500 }}>Welcome back</div>
                <div style={{ fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,color:'var(--text-1)' }}>
                  {name} ✦
                </div>
              </div>
              <div style={{ marginLeft:'auto' }}>
                <div className="streak-pill">🔥 {streak} day streak</div>
              </div>
            </div>

            <h1 style={{ fontFamily:'var(--font-display)',fontSize:'clamp(32px,4vw,54px)',fontWeight:900,letterSpacing:'-0.03em',lineHeight:1.1,color:'var(--text-1)',marginBottom:16,animation:'fadeUp 0.8s ease both' }}>
              Continue your
              <br />
              <span style={{ background:'linear-gradient(135deg,#c4b5fd,#7c3aed,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>
                learning journey.
              </span>
            </h1>

            {/* XP Bar */}
            <div className="xp-bar-wrap" style={{ marginBottom:28 }}>
              <div className="xp-bar-label">
                <span>Level {level} · {xp.toLocaleString()} XP</span>
                <span>{xpNext.toLocaleString()} XP to Level {level + 1}</span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width:`${xpPct}%` }} />
              </div>
            </div>

            <div style={{ display:'flex',gap:12,marginBottom:24,flexWrap:'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/profile/enrollments')}>
                ▶ Continue Learning
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('/courses')}>
                Explore More →
              </button>
            </div>

            {/* Competition reminder (dynamic) */}
            <div className="comp-reminder" onClick={() => navigate('/competitions')}>
              <div className="comp-reminder-dot" />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:700,color:'var(--text-1)' }}>{featuredComp ? '⚡ Competition ending soon' : '⚡ Competitions'}</div>
                <div style={{ fontSize:12,color:'var(--text-2)',marginTop:3 }}>{featuredComp ? `${featuredComp.title} — ${compTimeLeft ?? 'Ends soon'}` : 'Browse competitions →'}</div>
              </div>
              <div style={{ fontSize:13,color:'#fb7185',fontWeight:600 }}>{featuredComp ? 'Register →' : 'View →'}</div>
            </div>
          </div>

          {/* In-progress courses */}
          <div style={{ animation:'fadeUp 0.9s 0.2s ease both' }}>
            <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text-3)',marginBottom:14 }}>📚 In Progress</div>
            {inProgress.length > 0 ? inProgress.map((c, i) => {
              const pct = getCourseProgress(c);
              return (
                <div key={i} className="cl-row" onClick={() => navigate(getCourseRoute(c))}>
                  <div className="cl-thumb">
                    {c.thumbnailUrl ? <img src={c.thumbnailUrl} alt={c.title} /> : '📖'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="cl-title" style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{c.title || c.courseName}</div>
                    <div className="cl-progress-bar"><div className="cl-progress-fill" style={{ width:`${pct}%` }} /></div>
                    <div className="cl-pct">{Math.round(pct)}% complete</div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flexShrink:0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(getCourseRoute(c));
                    }}
                  >
                    Resume
                  </button>
                </div>
              );
            }) : (
              <div style={{ padding:'24px',textAlign:'center',color:'var(--text-3)',fontSize:13,background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r-md)' }}>
                No courses in progress yet.{' '}
                <Link to="/courses" style={{ color:'#a78bfa' }}>Explore courses →</Link>
              </div>
            )}

            {/* Quick stats */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:16 }}>
              {[
                { icon:'📚', val: totalInProgress.length || 0, label:'In Progress' },
                { icon:'✅', val: completedCount || 0, label:'Completed' },
                { icon:'🏅', val: badgesCount || 0, label:'Badges' },
              ].map((s,i) => (
                <div key={i} style={{ padding:'14px 10px',textAlign:'center',background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r-md)' }}>
                  <div style={{ fontSize:20,marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,color:'var(--text-1)' }}>{typeof s.val === 'number' ? s.val.toLocaleString() : s.val}</div>
                  <div style={{ fontSize:10,color:'var(--text-3)',marginTop:2 }}>{s.label}</div>
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
// COURSE CARD
// ══════════════════════════════════════════════════════════
function CourseCard({ course }) {
  const isFree = course?.isFree;
  const price = isFree ? 'FREE' : (course?.price != null ? `$${course.discountPrice ?? course.price}` : '—');
  const rating = Number(course?.averageRating || course?.rating || 0);
  const diff = (course?.difficultyLevel || 'General').toLowerCase();
  const diffStyle = {
    beginner:     { background:'rgba(16,185,129,0.15)', color:'#34d399' },
    intermediate: { background:'rgba(124,58,237,0.15)', color:'#a78bfa' },
    advanced:     { background:'rgba(245,158,11,0.15)', color:'var(--gold-bright)' },
  }[diff] || { background:'rgba(255,255,255,0.06)', color:'var(--text-3)' };

  const totalSeconds = (() => {
    const parse = v => { const n = Number(v); return Number.isFinite(n) ? n : null; };
    const s1 = parse(course?.totalDurationSeconds ?? course?.durationSeconds);
    if (s1 != null) return Math.round(s1);
    const hrs = parse(course?.durationHours ?? course?.DurationHours);
    if (hrs != null) return Math.round(hrs * 3600);
    const d = parse(course?.duration ?? course?.totalDuration ?? course?.contentDuration);
    if (d != null) return d <= 24 ? Math.round(d*3600) : d <= 600 ? Math.round(d*60) : Math.round(d);
    return 0;
  })();

  return (
    <Link to={getCourseRoute(course)} className="c-card">
      <div className="c-thumb">
        {course?.thumbnailUrl
          ? <img src={course.thumbnailUrl} alt={course.title} />
          : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,background:'linear-gradient(135deg,var(--elevated),var(--surface))' }}>📚</div>
        }
        <div className="c-thumb-overlay" />
        <span className={`c-price-tag ${isFree ? 'c-price-free' : 'c-price-paid'}`}>{price}</span>
      </div>
      <div className="c-body">
        <div className="c-title">{course?.title}</div>
        <div className="c-uni">{course?.universityName}</div>
        <div className="c-rating">
          <span className="c-rating-val">{rating.toFixed(1)}</span>
          <span className="c-rating-stars">★</span>
          <span className="c-rating-count">({(course?.enrollmentCount || 0).toLocaleString()})</span>
        </div>
        <div className="c-meta-row">
          <span className="c-duration">⏱ {totalSeconds > 0 ? formatTime(totalSeconds) : '—'}</span>
          <span className="c-diff" style={diffStyle}>{course?.difficultyLevel || 'General'}</span>
        </div>
      </div>
    </Link>
  );
}

function CourseSkeleton() {
  return (
    <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)',overflow:'hidden' }}>
      <div className="skeleton" style={{ height:176 }} />
      <div style={{ padding:18,display:'flex',flexDirection:'column',gap:10 }}>
        <div className="skeleton" style={{ height:14,borderRadius:4,width:'85%' }} />
        <div className="skeleton" style={{ height:12,borderRadius:4,width:'55%' }} />
        <div className="skeleton" style={{ height:12,borderRadius:4,width:'70%' }} />
        <div className="skeleton" style={{ height:12,borderRadius:4,width:'50%' }} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// UNIVERSITY CARD
// ══════════════════════════════════════════════════════════
function UniCard({ uni }) {
  return (
    <Link to={`/universities/${uni?.id}`} className="uni-card">
      <div className="uni-banner">
        {uni?.bannerUrl && <img src={uni.bannerUrl} alt={uni.name} />}
        <div className="uni-banner-overlay" />
      </div>
      <div className="uni-body">
        <div className="uni-logo-wrap">
          {uni?.logoUrl
            ? <img src={uni.logoUrl} alt={uni.name} className="uni-logo" />
            : <div className="uni-logo-fallback">🏛️</div>
          }
          <div className="uni-name">{uni?.name}</div>
        </div>
        <div className="uni-tags">
          {uni?.totalCourses != null && <span className="uni-tag uni-tag-violet">{uni.totalCourses} courses</span>}
          {uni?.averageCourseRating != null && <span className="uni-tag uni-tag-gold">★ {Number(uni.averageCourseRating).toFixed(1)}</span>}
          {uni?.location && <span className="uni-tag uni-tag-dim">{uni.location}</span>}
        </div>
      </div>
    </Link>
  );
}

function Departments() {
  const { data: departments = [], isLoading: loadingDepts } = useQuery({ queryKey: ['departments','list'], queryFn: fetchDepartments, staleTime: 300000 });

  const list = Array.isArray(departments) ? departments : [];

  // Deduplicate departments returned by backend (some backends may return duplicates)
  const dedupedList = (() => {
    if (!Array.isArray(list)) return [];
    const m = new Map();
    for (const d of list) {
      const idKey = d?.id ?? d?.departmentId ?? null;
      const nameKey = (d?.name ?? d?.title ?? d?.deptName ?? '').toString().trim().toLowerCase();
      const key = idKey != null ? `id:${idKey}` : `name:${nameKey}`;
      if (!m.has(key)) m.set(key, d);
    }
    return Array.from(m.values());
  })();

  return (
    <section className="section departments-section z1">
      <div className="container">
        <SectionHdr
          eyebrow="Academic Departments"
          title="Browse by"
          titleGrad={{ cls:'g-cyan', text:'Department' }}
          action={<Link to="/departments" className="btn btn-ghost btn-sm">View All →</Link>}
        />
        <div className="dept-grid">
          {(loadingDepts ? Array.from({length:8}) : dedupedList).map((d, i) => {
            if (loadingDepts && !d) {
              return (
                <div key={`s-${i}`} className="dept-card" style={{ opacity:0.6 }}>
                  <div className="dept-icon"><div className="skeleton" style={{ width:40,height:40,borderRadius:8 }} /></div>
                  <div className="dept-name"><div className="skeleton" style={{ height:16,width:'65%' }} /></div>
                  <div className="dept-desc"><div className="skeleton" style={{ height:12,width:'90%',marginTop:8 }} /></div>
                  <div className="dept-count"><div className="skeleton" style={{ height:12,width:'40%',marginTop:12 }} /></div>
                  <div className="dept-link"><div className="skeleton" style={{ height:18,width:'50%',marginTop:10 }} /></div>
                </div>
              );
            }

            // normalize fields from backend or fallback static
            const name = d?.name ?? d?.title ?? d?.deptName ?? '—';
            const desc = d?.description ?? d?.desc ?? d?.about ?? '';
            const courses = (d?.totalCourses ?? d?.courseCount ?? d?.courses ?? d?.count ?? 0) || 0;
            const abbr = d?.code ?? d?.abbr ?? (name ? name.split(' ').map(w=>w[0]).slice(0,3).join('').toUpperCase() : '—');
            const bg = d?.bg ?? 'rgba(124,58,237,0.12)';
            const border = d?.border ?? 'rgba(124,58,237,0.25)';
            const accent = d?.accent ?? '#c4b5fd';
            const icon = d?.icon ?? (name ? name.charAt(0) : '📚');

            return (
              <div key={d?.id ?? i} className="dept-card" style={{ '--dc': d?.color ?? '#7c3aed' }}>
                <div className="dept-icon" style={{ background:bg, border:`1px solid ${border}` }}>{icon}</div>
                <div className="dept-name">{name}</div>
                <div className="dept-desc">{desc}</div>
                <div className="dept-count">📚 {courses} courses</div>
                <div className="dept-link" style={{ color:accent }}>
                  <span style={{ padding:'2px 8px',borderRadius:99,fontSize:10,fontWeight:700,background:bg,color:accent,border:`1px solid ${border}` }}>{abbr}</span>
                  Explore →
                </div>
              </div>
            );
          })}
          {!loadingDepts && dedupedList.length === 0 && (
            <div className="dept-card" style={{ gridColumn:'1 / -1', textAlign:'center' }}>
              No departments available right now.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// ENGAGEMENT TRIO (Continue / Competition / Clan) — logged-in only
// ══════════════════════════════════════════════════════════
function EngagementTrio({ myCourses, myClans }) {
  const { data: competitions = [] } = useQuery({ queryKey: ['competitions','trio'], queryFn: fetchCompetitions });
  const comp = useMemo(() => {
    if (!Array.isArray(competitions) || competitions.length === 0) return null;
    const now = new Date();
    const active = competitions.find(c => {
      const s = (c.status || '').toString().toLowerCase();
      return ['ongoing','active','live'].includes(s) || c.isActive || c.is_live;
    });
    if (active) return active;
    const upcoming = competitions.filter(c => c.deadline && new Date(c.deadline) > now)
      .sort((a,b) => new Date(a.deadline) - new Date(b.deadline));
    return upcoming[0] || competitions[0];
  }, [competitions]);
  const time = useCountdown(comp?.deadline ?? null);
  const navigate = useNavigate();
  const inProgress = (myCourses || []).filter((c) => !isCourseCompleted(c));
  const nextCourse = inProgress[0];
  const userClan = (Array.isArray(myClans) && myClans.length > 0) ? myClans[0] : null;
  const myClanRoute = userClan?.id ? `/clans/${userClan.id}` : '/clans';

  return (
    <section className="section engagement-trio z1">
      <div className="container">
        <div className="trio-grid">
          {/* Continue Learning */}
          <div className="trio-card trio-card-violet">
            <div className="trio-top-bar" style={{ background:'linear-gradient(90deg,transparent,var(--violet),transparent)' }} />
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
              <span className="section-eyebrow" style={{ marginBottom:0 }}>📚 Continue Learning</span>
              <Link to="/profile/enrollments" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            {nextCourse ? (
              <div className="cl-row" onClick={() => navigate(getCourseRoute(nextCourse))}>
                <div className="cl-thumb">
                  {nextCourse.thumbnailUrl ? <img src={nextCourse.thumbnailUrl} alt={nextCourse.title} /> : '📖'}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div className="cl-title" style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{nextCourse.title||nextCourse.courseName}</div>
                  <div className="cl-progress-bar"><div className="cl-progress-fill" style={{ width:`${getCourseProgress(nextCourse)}%` }} /></div>
                  <div className="cl-pct">{Math.round(getCourseProgress(nextCourse))}% complete</div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flexShrink:0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(getCourseRoute(nextCourse));
                  }}
                >
                  Resume
                </button>
              </div>
            ) : (
              <div style={{ padding:'20px 16px',textAlign:'center',color:'var(--text-3)',fontSize:13 }}>
                No active courses. <Link to="/courses" style={{ color:'#a78bfa' }}>Start one →</Link>
              </div>
            )}
            <p className="trio-sub" style={{ marginTop:14,marginBottom:0 }}>
              {inProgress.length} course{inProgress.length !== 1 ? 's' : ''} in progress
            </p>
          </div>

          {/* Active Competition */}
          <div className="trio-card trio-card-rose">
            <div className="trio-top-bar" style={{ background:'linear-gradient(90deg,transparent,rgba(225,29,72,0.6),transparent)' }} />
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
              <div className="comp-live-dot" /><span className="section-eyebrow rose" style={{ marginBottom:0 }}>🏆 Active Competition</span>
            </div>
            <div className="trio-title">{comp?.title ?? 'Upcoming Competition'}</div>
            <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:12,background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',marginBottom:16 }}>
              <span style={{ fontSize:18 }}>🏆</span>
              <span style={{ fontFamily:'var(--font-display)',fontSize:18,fontWeight:800,color:'var(--gold-bright)' }}>{comp?.prize ?? '—'}</span>
              <span style={{ fontSize:11,color:'var(--text-3)' }}>Prize Pool</span>
            </div>
            <div style={{ fontSize:11,color:'var(--text-3)',marginBottom:8 }}>⏳ Closes in</div>
            <div className="countdown" style={{ marginBottom:16 }}>
              {[{v:time.d,l:'Days'},{v:time.h,l:'Hrs'},{v:time.m,l:'Min'},{v:time.s,l:'Sec'}].map((u,i,arr) => (
                <React.Fragment key={i}>
                  <div className="cd-unit">
                    <span className="cd-val">{String(u.v).padStart(2,'0')}</span>
                    <span className="cd-label">{u.l}</span>
                  </div>
                  {i<arr.length-1 && <span className="cd-sep">:</span>}
                </React.Fragment>
              ))}
            </div>
            <button className="btn btn-primary btn-sm btn-full" onClick={() => navigate('/competitions')}>Register Now →</button>
          </div>

          {/* Clan / Leaderboard */}
          <div className="trio-card trio-card-gold">
            <div className="trio-top-bar" style={{ background:'linear-gradient(90deg,transparent,rgba(245,158,11,0.5),transparent)' }} />
            <div style={{ marginBottom:12 }}>
              <span className="section-eyebrow gold" style={{ marginBottom:0 }}>⚔️ Your Clan</span>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:14 }}>
              <div style={{ width:44,height:44,borderRadius:12,background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>
                {userClan?.emoji || userClan?.icon || '⚔️'}
              </div>
              <div>
                <div className="trio-title" style={{ marginBottom:4 }}>{userClan?.name ?? 'No Clan'}</div>
                <div style={{ display:'flex',gap:8 }}>
                  <span style={{ padding:'2px 8px',borderRadius:99,fontSize:10,fontWeight:700,background:'rgba(245,158,11,0.15)',color:'var(--gold-bright)',border:'1px solid rgba(245,158,11,0.3)' }}>{userClan?.rank ?? userClan?.position ?? '#—'}</span>
                  <span style={{ fontSize:12,color:'var(--text-3)' }}>👥 {userClan?.members ?? userClan?.memberCount ?? 0} members</span>
                </div>
              </div>
            </div>
            <div className="clan-prog-bar"><div className="clan-prog-fill" style={{ width:`${userClan?.seasonProgress ?? userClan?.progress ?? 0}%` }} /></div>
            <div className="clan-prog-label" style={{ marginBottom:16 }}><span>Season Progress</span><span>{userClan?.seasonProgress ?? userClan?.progress ?? 0}%</span></div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/clans')}>Leaderboard</button>
              <button className="btn btn-gold btn-sm" onClick={() => navigate(myClanRoute)}>My Clan</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// CLANS & LEADERBOARD SECTION
// ══════════════════════════════════════════════════════════
// Clans and leaderboard will render dynamic backend data; no static fallbacks kept here.

// Dynamic clan + leaderboard fetchers
const fetchTopClans = async () => {
  try {
    const { data } = await api.get('/clans/search', { params: { page: 1, pageSize: 6, sortBy: 'members', sortOrder: 'desc' } });
    const d = data?.data ?? data?.items ?? data?.clans ?? data;
    if (Array.isArray(d)) return d;
    return [];
  } catch (e) { return []; }
};

// Try to build lightweight global stats from available endpoints
const fetchGlobalStats = async () => {
  const stats = { activeClans: null, totalXp: null, badges: null, topMembers: null };
  try {
    // Active clans: use /clans (returns totalCount)
    try {
      const res = await api.get('/clans', { params: { page: 1, pageSize: 1 } });
      const tc = res?.data?.totalCount ?? res?.data?.total ?? res?.data?.count ?? null;
      if (typeof tc === 'number') stats.activeClans = tc;
    } catch (e) {}

    // Clan leaderboard: sum points to estimate total XP and collect member counts
    try {
      const res = await api.get('/clans/leaderboard', { params: { page: 1, pageSize: 50 } });
      const list = res?.data?.leaderboard ?? res?.data?.data ?? res?.data ?? [];
      if (Array.isArray(list) && list.length > 0) {
        const totalXp = list.reduce((s, it) => s + (Number(it?.TotalPoints ?? it?.totalPoints ?? it?.TotalPoints ?? 0) || 0), 0);
        const members = list.reduce((s, it) => s + (Number(it?.MemberCount ?? it?.memberCount ?? it?.Clan?.MemberCount ?? 0) || 0), 0);
        stats.totalXp = totalXp || null;
        stats.topMembers = members || list.length;
      }
    } catch (e) {}

    // Global leaderboard/ratings: try to read Stats if present
    try {
      const res = await api.get('/leaderboard', { params: { page: 1, pageSize: 1 } });
      const d = res?.data?.data ?? res?.data ?? {};
      const statsObj = d?.Stats ?? d?.stats ?? d?.Stats ?? d?.data?.Stats ?? null;
      if (statsObj) {
        stats.topMembers = stats.topMembers ?? statsObj?.TotalParticipants ?? statsObj?.totalParticipants ?? statsObj?.TotalCount ?? statsObj?.total ?? statsObj?.TotalParticipants;
        stats.badges = stats.badges ?? (Array.isArray(statsObj?.TopBadges) ? statsObj.TopBadges.length : null);
      }
    } catch (e) {}

    // Fallback: try top-clans list to get approximate XP
    try {
      const res = await api.get('/clans/top-clans');
      const list = res?.data?.clans ?? res?.data ?? [];
      if (Array.isArray(list) && list.length > 0) {
        stats.totalXp = stats.totalXp ?? list.reduce((s, it) => s + (Number(it?.TotalPoints ?? it?.totalPoints ?? 0) || 0), 0);
      }
    } catch (e) {}
  } catch (e) {
    // ignore
  }
  return stats;
};

const fetchLeaderboard = async () => {
  // Try known leaderboard endpoints and parse common shapes
  const candidates = ['/clans/leaderboard', '/leaderboard', '/users/leaderboard', '/leaderboards/global'];
  for (const ep of candidates) {
    try {
      const { data } = await api.get(ep, { params: { page: 1, pageSize: 20 } });
      // common envelope shapes: { leaderboard: [...] } || { entries: [...] } || { data: [...] } || array
      const d = data?.leaderboard ?? data?.entries ?? data?.data ?? data?.items ?? data?.leaders ?? data;
      if (Array.isArray(d) && d.length > 0) return d;
      // Some endpoints return a wrapper like { success: true, data: { entries: [...] } }
      const nested = data?.data?.leaderboard ?? data?.data?.entries ?? data?.data?.items ?? data?.data;
      if (Array.isArray(nested) && nested.length > 0) return nested;
    } catch (e) {
      // ignore and try next
    }
  }
  return [];
};

function ClansLeaderboard() {
  const navigate = useNavigate();
  const { data: topClans = [], isLoading: clubsLoading } = useQuery({ queryKey: ['clans','top'], queryFn: fetchTopClans });
  const { data: leaderboard = [], isLoading: lbLoading } = useQuery({ queryKey: ['leaderboard','global'], queryFn: fetchLeaderboard });
  const { data: gStats = {}, isLoading: statsLoading } = useQuery({ queryKey: ['leaderboard','stats'], queryFn: fetchGlobalStats, staleTime: 300000 });

  const clans = Array.isArray(topClans) ? topClans : [];
  const lb = Array.isArray(leaderboard) ? leaderboard : [];

  return (
    <section className="section clans-section z1">
      <div className="container">
        <SectionHdr
          eyebrow="Clans & Leaderboard"
          title="Learn together,"
          titleGrad={{ cls:'g-mixed', text:'win together' }}
          action={<button className="btn btn-ghost btn-sm" onClick={() => navigate('/clans')}>View All Clans →</button>}
        />
        <div className="clans-grid">
          {/* Clan cards */}
          <div>
            <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text-3)',marginBottom:16 }}>Top Clans</div>
            {(clubsLoading ? Array.from({length:5}) : clans).map((c,i) => {
              if (!c) return (
                <div key={`s-${i}`} className="clan-card" style={{ opacity:0.6 }}>
                  <div className="clan-header"><div className="clan-avatar skeleton" style={{ width:48,height:48,borderRadius:12 }} /></div>
                  <div className="clan-meta"><div className="skeleton" style={{ height:12,width:'40%' }} /></div>
                </div>
              );

              // normalize clan fields
              const name = c?.name ?? c?.title ?? c?.clanName ?? 'Clan';
              const emoji = c?.emoji ?? c?.icon ?? '⚔️';
              const members = c?.members ?? c?.memberCount ?? c?.size ?? 0;
              const xp = c?.xp ?? c?.totalXp ?? c?.xpTotal ?? c?.score ?? '—';
              const prog = c?.seasonProgress ?? c?.progress ?? c?.prog ?? 0;
              const color = c?.color ?? '#7c3aed';
              const rank = c?.rank ?? `#${i+1}`;

              return (
                <div key={c?.id ?? i} className="clan-card" style={{ '--cc': color }}>
                  <div className="clan-header">
                    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                      <div className="clan-avatar">{emoji}</div>
                      <div className="clan-name">{name}</div>
                    </div>
                    <span className="clan-rank-badge">{rank}</span>
                  </div>
                  <div className="clan-meta">
                    <div className="clan-meta-item">👥 {members} members</div>
                    <div className="clan-meta-item">⚡ {typeof xp === 'number' ? xp.toLocaleString() : xp}</div>
                  </div>
                  <div className="clan-prog-bar"><div className="clan-prog-fill" style={{ width:`${prog}%` }} /></div>
                  <div className="clan-prog-label"><span>Season progress</span><span>{prog}%</span></div>
                </div>
              );
            })}
            <button className="btn btn-primary btn-full" style={{ marginTop:16 }} onClick={() => navigate('/clans')}>
              ⚔️ Join a Clan
            </button>
          </div>

          {/* Leaderboard */}
          <div>
            <div className="leaderboard-card">
              <div className="lb-header">
                <span className="lb-title">🏆 Global Leaderboard</span>
                <span style={{ fontSize:12,color:'var(--text-3)' }}>This Season</span>
              </div>
              {lbLoading ? (
                Array.from({length:5}).map((_,i) => (
                  <div key={`s-lb-${i}`} className="lb-row" style={{ opacity:0.6 }}>
                    <div className="lb-pos"><div className="skeleton" style={{ width:28,height:18 }} /></div>
                    <div className="lb-avatar skeleton" style={{ width:40,height:40,borderRadius:20 }} />
                    <div className="lb-info"><div className="skeleton" style={{ height:12,width:'60%' }} /></div>
                    <div className="lb-xp"><div className="skeleton" style={{ height:12,width:48 }} /></div>
                  </div>
                ))
              ) : (lb.length > 0 ? lb.map((r,i) => {
                  // normalize leaderboard row (supports both user entries and clan leaderboard entries)
                  if (r?.Clan || r?.clan) {
                    const clanObj = r?.Clan ?? r?.clan ?? r;
                    const clanName = clanObj?.name ?? clanObj?.Name ?? clanObj?.clanName ?? clanObj?.tag ?? 'Clan';
                    const members = r?.MemberCount ?? r?.memberCount ?? clanObj?.memberCount ?? clanObj?.MemberCount ?? 0;
                    const xp = r?.TotalPoints ?? r?.totalPoints ?? r?.score ?? r?.points ?? clanObj?.TotalPoints ?? '—';
                    const initials = (clanObj?.tag) || (clanName.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase());
                    const color = clanObj?.color ?? '#7c3aed';
                    return (
                      <div key={clanObj?.id ?? i} className="lb-row">
                        <div className={`lb-pos`} style={{ color: i===0?'#fbbf24':i===1?'#94a3b8':i===2?'#cd7f32':'var(--text-3)' }}>
                          {i < 3 ? ['🥇','🥈','🥉'][i] : String(i+1).padStart(2,'0')}
                        </div>
                        <div className="lb-avatar" style={{ background:`linear-gradient(135deg,${color},#1e1b4b)` }}>{initials}</div>
                        <div className="lb-info">
                          <div className="lb-name">{clanName}</div>
                          <div className="lb-clan-name">{members} members</div>
                        </div>
                        <div className="lb-xp">{typeof xp === 'number' ? xp.toLocaleString() : xp}</div>
                      </div>
                    );
                  }

                  const name = r?.name ?? r?.fullName ?? r?.username ?? r?.displayName ?? 'Player';
                  const clan = r?.clanName ?? r?.clan ?? r?.team ?? '';
                  const xp = r?.xp ?? r?.score ?? r?.totalXp ?? r?.points ?? '—';
                  const initials = (r?.initials) || (name.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase());
                  const color = r?.color ?? '#7c3aed';

                  return (
                    <div key={r?.id ?? i} className="lb-row">
                      <div className={`lb-pos`} style={{ color: i===0?'#fbbf24':i===1?'#94a3b8':i===2?'#cd7f32':'var(--text-3)' }}>
                        {i < 3 ? ['🥇','🥈','🥉'][i] : String(i+1).padStart(2,'0')}
                      </div>
                      <div className="lb-avatar" style={{ background:`linear-gradient(135deg,${color},#1e1b4b)` }}>{initials}</div>
                      <div className="lb-info">
                        <div className="lb-name">{name}</div>
                        <div className="lb-clan-name">{clan}</div>
                      </div>
                      <div className="lb-xp">{typeof xp === 'number' ? xp.toLocaleString() : xp}</div>
                    </div>
                  );
                }) : (
                <div style={{ padding:20,color:'var(--text-3)' }}>No leaderboard entries yet.</div>
              ))}
            </div>

            {/* Mini clan stats (dynamic when available) */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginTop:16 }}>
              {[
                { icon:'⚔️', label:'Active Clans', val: statsLoading ? '—' : (gStats?.activeClans != null ? gStats.activeClans.toLocaleString() : '—') },
                { icon:'⚡', label:'Total XP',     val: statsLoading ? '—' : (gStats?.totalXp != null ? (typeof gStats.totalXp === 'number' ? `${gStats.totalXp.toLocaleString()} XP` : gStats.totalXp) : '—') },
                { icon:'🏅', label:'Badges',       val: statsLoading ? '—' : (gStats?.badges != null ? gStats.badges.toLocaleString() : '—') },
                { icon:'👑', label:'Top Members',  val: statsLoading ? '—' : (gStats?.topMembers != null ? gStats.topMembers.toLocaleString() : '—') },
              ].map((s,i) => (
                <div key={i} style={{ padding:'16px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',textAlign:'center' }}>
                  <div style={{ fontSize:20,marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,color:'var(--text-1)' }}>{s.val}</div>
                  <div style={{ fontSize:11,color:'var(--text-3)',marginTop:2 }}>{s.label}</div>
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
// COMPETITIONS (fetched from backend)
// ══════════════════════════════════════════════════════════

function CompCard({ comp }) {
  const t = useCountdown(comp.deadline);
  const navigate = useNavigate();
  const fmt = (v) => {
    if (v == null) return '—';
    if (typeof v === 'number') return v.toLocaleString();
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString() : String(v);
  };

  return (
    <div className="comp-card">
      <div className="comp-banner" style={{ background:comp.bg }}>
        <span className="comp-banner-icon">{comp.icon}</span>
        <div className="comp-live-badge"><div className="comp-live-dot" />Live</div>
      </div>
      <div className="comp-body">
        <div className="comp-title">{comp.title}</div>
        <div className="comp-desc">{comp.desc}</div>
        <div className="comp-prize">
          <span style={{ fontSize:22 }}>🏆</span>
          <div>
            <div className="comp-prize-val">{comp.prize}</div>
            <div className="comp-prize-label">Prize Pool</div>
          </div>
          <div style={{ marginLeft:'auto',fontSize:12,color:'var(--text-3)' }}>👥 {fmt(comp.participants)}{typeof comp?.participants === 'number' ? '' : ''}</div>
        </div>
        <div style={{ fontSize:11,color:'var(--text-3)',marginBottom:8 }}>⏳ Closes in</div>
        <div className="countdown">
          {[{v:t.d,l:'D'},{v:t.h,l:'H'},{v:t.m,l:'M'},{v:t.s,l:'S'}].map((u,i,arr) => (
            <React.Fragment key={i}>
              <div className="cd-unit"><span className="cd-val">{String(u.v).padStart(2,'0')}</span><span className="cd-label">{u.l}</span></div>
              {i<arr.length-1 && <span className="cd-sep">:</span>}
            </React.Fragment>
          ))}
        </div>
        <button className="btn btn-primary btn-full" style={{ marginTop:14 }} onClick={() => navigate('/competitions')}>Register Now →</button>
      </div>
    </div>
  );
}

function Competitions() {
  const navigate = useNavigate();
  const { data: competitions = [], isLoading } = useQuery({ queryKey: ['competitions','list'], queryFn: fetchCompetitions });
  return (
    <section className="section competitions-section z1">
      <div className="container">
        <SectionHdr
          eyebrow="Competitions" eyebrowClass="cyan"
          title="Compete on a"
          titleGrad={{ cls:'g-cyan', text:'global stage' }}
          action={<button className="btn btn-ghost btn-sm" onClick={() => navigate('/competitions')}>View All →</button>}
        />
        <div className="comp-grid">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:16, height:220 }} />
            ))
          ) : (
            (competitions.length === 0) ? (
              <div style={{ color:'var(--text-3)', padding:20 }}>No competitions available.</div>
            ) : (
              competitions.slice(0,3).map((c, i) => <CompCard key={c.id || i} comp={c} />)
            )
          )}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// COMMUNITY ACTIVITY FEED
// ══════════════════════════════════════════════════════════
// Note: feed/trending now loaded from backend. No static fallbacks here.

const typeStyles = { disc:'post-type-disc', ann:'post-type-ann', trend:'post-type-trend' };
const avatarColors = ['#7c3aed','#06b6d4','#d97706','#059669','#e11d48','#4f46e5'];

function CommunityFeed() {
  const navigate = useNavigate();
  const { data: feed = [], isLoading: feedLoading } = useQuery({ queryKey: ['community','posts','home'], queryFn: fetchCommunityPosts, staleTime: 60000 });
  const { data: homepage = {} } = useQuery({ queryKey: ['home','snapshot','community'], queryFn: fetchHomepageSnapshot, staleTime: 300000 });

  // normalize backend post shape to the lightweight feed shape used by UI
  const normalized = (Array.isArray(feed) && feed.length > 0) ? feed.map((p, i) => {
    // author name can be in multiple places depending on endpoint (PostDTO vs PostDetailDTO)
    const author = p?.userName
      ?? p?.UserName
      ?? p?.authorName
      ?? p?.author
      ?? (p?.user && ((p.user.firstName || p.user.lastName) ? `${p.user.firstName ?? ''} ${p.user.lastName ?? ''}`.trim() : p.user.username ?? p.user.displayName))
      ?? (p?.author && (p.author.name || p.author.fullName || p.author.displayName))
      ?? 'Unknown';

    const initials = (p?.authorInitials) || (typeof author === 'string' && author.length > 0 ? author.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase() : 'U');
    const text = p?.content ?? p?.Content ?? p?.text ?? p?.body ?? '';
    const type = (p?.postType ?? p?.PostType ?? p?.type ?? p?.category) || (text && text.includes('#') ? 'trend' : 'disc');
    const typeLabel = p?.typeLabel ?? p?.categoryLabel ?? (p?.postType ?? p?.PostType) ?? (type === 'ann' ? 'Announcement' : (type === 'trend' ? 'Trending' : 'Discussion'));
    const time = p?.time ?? p?.timeAgo ?? (p?.createdAt ?? p?.CreatedAt ? new Date(p?.createdAt ?? p?.CreatedAt).toLocaleString() : '—');
    const likes = p?.likesCount ?? p?.likes ?? p?.upvoteCount ?? p?.UpvoteCount ?? 0;
    return { avatar: initials, author, text, type, typeLabel, time, likes };
  }) : [];

  // derive trending topics from posts (no static fallback)
  const trending = (() => {
    if (!normalized.length) return [];
    const counts = new Map();
    const tagRe = /#([A-Za-z0-9_\-]+)/g;
    for (const p of normalized) {
      let m;
      while ((m = tagRe.exec(p.text)) !== null) {
        const tag = `#${m[1]}`;
        counts.set(tag, (counts.get(tag)||0) + 1);
      }
    }
    if (counts.size === 0) return [];
    return Array.from(counts.entries()).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([tag,c],i)=>({ tag, count: `${c} mentions`, hot: c>1 }));
  })();

  const postsToRender = feedLoading ? [] : normalized;

  return (
    <section className="section community-section z1">
      <div className="container">
        <SectionHdr
          eyebrow="Community"
          title="Stay in the"
          titleGrad={{ cls:'g-violet', text:'loop' }}
          action={<button className="btn btn-ghost btn-sm" onClick={() => navigate('/community')}>View Community →</button>}
        />
        <div className="community-grid">
          {/* Feed */}
          <div className="feed-card">
            <div className="feed-header">
              <span className="feed-title">Recent Activity</span>
              <span style={{ fontSize:12,color:'var(--text-3)' }}>Live feed</span>
            </div>
            {feedLoading ? (
              Array.from({length:3}).map((_,i) => (
                <div key={i} className="feed-post" style={{ opacity:0.6 }}>
                  <div className="feed-avatar skeleton" style={{ width:44,height:44,borderRadius:22 }} />
                  <div className="feed-content">
                    <div className="skeleton" style={{ height:12,width:'40%',marginBottom:8 }} />
                    <div className="skeleton" style={{ height:12,width:'80%',marginBottom:6 }} />
                    <div className="skeleton" style={{ height:10,width:'30%' }} />
                  </div>
                </div>
              ))
            ) : (postsToRender && postsToRender.length > 0) ? (
              postsToRender.map((p,i) => (
                <div key={i} className="feed-post">
                  <div className="feed-avatar" style={{ background:`linear-gradient(135deg,${avatarColors[i%avatarColors.length]},#1e1b4b)` }}>{p.avatar}</div>
                  <div className="feed-content">
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:2 }}>
                      <span className="feed-author">{p.author}</span>
                      <span className={`feed-type-badge ${typeStyles[p.type]}`}>{p.typeLabel}</span>
                    </div>
                    <div className="feed-text">{p.text}</div>
                    <div className="feed-meta">
                      <span>{p.time}</span>
                      <span>❤ {p.likes}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding:24,color:'var(--text-3)',textAlign:'center' }}>No community posts yet.</div>
            )}
          </div>

          {/* Trending */}
          <div>
            <div className="feed-card" style={{ marginBottom:16 }}>
              <div className="feed-header">
                <span className="feed-title">🔥 Trending Topics</span>
              </div>
              <div className="trending-topics">
                {trending.length > 0 ? trending.map((t,i) => (
                  <div key={i} className="trending-item">
                    <div className="trending-rank">#{i+1}</div>
                    <div style={{ flex:1 }}>
                      <div className="trending-tag">{t.tag}</div>
                      <div className="trending-count">{t.count}</div>
                    </div>
                    {t.hot && <span className="trending-hot">🔥 Hot</span>}
                  </div>
                )) : (
                  <div style={{ padding:16,color:'var(--text-3)',textAlign:'center' }}>No trending topics yet.</div>
                )}
              </div>
            </div>

            {/* Quick join */}
            <div style={{ padding:'20px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)',textAlign:'center' }}>
              <div style={{ fontSize:32,marginBottom:10 }}>💬</div>
              <div style={{ fontFamily:'var(--font-display)',fontSize:16,fontWeight:600,color:'var(--text-1)',marginBottom:8 }}>Join the Conversation</div>
              <div style={{ fontSize:13,color:'var(--text-2)',marginBottom:16,lineHeight:1.6 }}>Connect with {formatCompactNumber(homepage?.totalUsers)} learners, share insights, and grow together.</div>
              <button className="btn btn-primary btn-full btn-sm" onClick={() => navigate('/community')}>Explore Community</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// ACHIEVEMENTS & BADGES
// ══════════════════════════════════════════════════════════
// Badges and top-performers are populated from backend (profile.badges and leaderboard). No static list maintained here.

function Achievements() {
  const { data: profile = null } = useQuery({ queryKey: ['profile','me'], queryFn: fetchProfile, staleTime: 60000 });
  const { data: lb = [], isLoading: lbLoading } = useQuery({ queryKey: ['leaderboard','globalTop'], queryFn: fetchLeaderboard, staleTime: 300000 });

  const badges = (() => {
    if (profile && profile.badges) {
      try {
        const raw = typeof profile.badges === 'string' ? JSON.parse(profile.badges) : profile.badges;
        if (Array.isArray(raw) && raw.length > 0) return raw.map(b => ({ icon: b.icon ?? '🔖', label: b.name ?? b.label ?? String(b), earned: true }));
      } catch (e) { /* fallthrough to empty */ }
      }
      return [];
  })();

  const topPerformers = (() => {
    if (Array.isArray(lb) && lb.length > 0) {
      return lb.slice(0,4).map((u,i) => ({
        initials: (u.name||u.username||'').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase() || (u.initials || '??'),
        name: u.name ?? u.username ?? u.displayName ?? '—',
        meta: u.clan ? `${u.clan?.name ?? u.clan} · Rank #${u.rank ?? u.position ?? i+1}` : `Rank #${u.rank ?? u.position ?? i+1}`,
        xp: (u.xp || u.totalXp || u.points) ? `${Number(u.xp || u.totalXp || u.points).toLocaleString()} XP` : (u.xp || '—'),
        color: i===0 ? '#7c3aed' : (i===1 ? '#06b6d4' : (i===2 ? '#7c3aed' : '#d97706')),
        medal: ['🥇','🥈','🥉','🏅'][i]
      }));
    }
    return [];
  })();

  const clanName =
    profile?.clanName ?? profile?.ClanName ??
    profile?.currentClanName ?? profile?.CurrentClanName ??
    profile?.clan?.name ?? profile?.Clan?.Name ??
    'Your Clan';

  const clanBadgesCount = Number(
    profile?.clanBadgesCount ?? profile?.ClanBadgesCount ??
    profile?.badgesUnlocked ?? profile?.BadgesUnlocked ??
    0
  ) || 0;

  const clanBadgesTotal = Number(
    profile?.clanBadgesTotal ?? profile?.ClanBadgesTotal ??
    profile?.totalClanBadges ?? profile?.TotalClanBadges ??
    0
  ) || 0;

  const clanBadgeProgress = clanBadgesTotal > 0
    ? Math.min(100, Math.round((Math.max(0, clanBadgesCount) / clanBadgesTotal) * 100))
    : 0;

  return (
    <section className="section achievements-section z1">
      <div className="container">
        <SectionHdr
          eyebrow="Achievements" eyebrowClass="gold"
          title="Earn badges,"
          titleGrad={{ cls:'g-gold', text:'rise to glory' }}
        />
        <div className="ach-grid">
          <div>
            <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text-3)',marginBottom:16 }}>Achievement Badges</div>
            <div className="badge-showcase" style={{ marginBottom:28 }}>
              {badges.length > 0 ? badges.map((b,i) => (
                <div key={i} className="badge-item">
                  <div className={`badge-icon-wrap ${!b.earned?'badge-locked':''}`}>{b.icon}</div>
                  <span className="badge-label">{b.label}</span>
                </div>
              )) : (
                <div style={{ padding:16,color:'var(--text-3)' }}>No badges earned yet.</div>
              )}
            </div>
            <div style={{ padding:'20px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)' }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                <span style={{ fontSize:24 }}>⚔️</span>
                <div>
                  <div style={{ fontFamily:'var(--font-display)',fontSize:15,fontWeight:600,color:'var(--text-1)' }}>{clanName} — Season Achievements</div>
                  <div style={{ fontSize:12,color:'var(--text-3)' }}>{clanBadgesCount} of {clanBadgesTotal} clan badges unlocked</div>
                </div>
              </div>
              <div style={{ height:4,borderRadius:99,background:'rgba(255,255,255,0.05)',overflow:'hidden' }}>
                <div style={{ height:'100%',borderRadius:99,background:'linear-gradient(90deg,var(--violet),var(--cyan))',width:`${clanBadgeProgress}%` }} />
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text-3)',marginBottom:16 }}>Top Performers</div>
            <div className="top-performers">
              {topPerformers.length > 0 ? topPerformers.map((p,i) => (
                <div key={i} className="performer-row">
                  <span className="performer-medal">{p.medal}</span>
                  <div className="performer-avatar" style={{ background:`linear-gradient(135deg,${p.color},#1e1b4b)` }}>{p.initials}</div>
                  <div>
                    <div className="performer-name">{p.name}</div>
                    <div className="performer-meta">{p.meta}</div>
                  </div>
                  <div className="performer-xp">{p.xp}</div>
                </div>
              )) : (
                <div style={{ padding:16,color:'var(--text-3)' }}>No top performers yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// INSTRUCTOR SPOTLIGHT
// ══════════════════════════════════════════════════════════
// Instructor spotlight populated from backend `/universities/{id}/teachers`

function InstructorSpotlight() {
  const navigate = useNavigate();
  const { data: instructors = [], isLoading: instructorsLoading } = useQuery({
    queryKey: ['university','teachers','home'],
    queryFn: async () => {
      try {
        const res = await api.get('/universities/1/teachers', { params: { page: 1, pageSize: 8 } });
        const payload = res.data?.data ?? res.data ?? [];
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.items)) return payload.items;
        return [];
      } catch (e) { return []; }
    },
    staleTime: 60000
  });

  const mapped = Array.isArray(instructors) && instructors.length > 0 ? instructors.map(t => {
    const name = (
      t.name ?? t.Name ?? t.fullName ?? t.full_name ?? t.displayName ?? t.display_name ??
      ((t.firstName ?? t.first_name) ? `${t.firstName ?? t.first_name} ${t.lastName ?? t.last_name}` : null) ??
      t.username ?? t.userName ?? t.user?.name ?? t.label ?? t.title ?? ''
    ).trim();
    const totalStudents = t.totalStudents ?? t.TotalStudents ?? t.TotalCoursesEnrolled ?? 0;
    const totalCourses = t.totalCourses ?? t.TotalCourses ?? t.createdCourses ?? 0;
    const initials = (name ? name.split(' ').filter(Boolean).slice(0,2).map(s => s[0]).join('').toUpperCase() : 'IN');
    return {
      name,
      title: t.specialization ?? t.bio ?? t.qualifications ?? '',
      uni: t.universityName ?? t.uni ?? '',
      students: typeof totalStudents === 'number' ? String(totalStudents) : totalStudents,
      courses: typeof totalCourses === 'number' ? totalCourses : (totalCourses ?? 0),
      color: '#7c3aed',
      initials
    };
  }) : [];

  // If backend returned entries but none have a real name, fall back to static sample data
  const validMapped = mapped.filter(m => m && (m.name && m.name.length > 0));
  const list = validMapped;

  return (
    <section className="section instructors-section z1">
      <div className="container">
        <SectionHdr
          eyebrow="Expert Instructors" eyebrowClass="gold"
          title="Learn from the"
          titleGrad={{ cls:'g-gold', text:"world's best" }}
          action={<button className="btn btn-ghost btn-sm" onClick={() => navigate('/universities')}>View All →</button>}
        />
        <div className="instructor-grid">
          {instructorsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="instructor-card skeleton" />
            ))
          ) : list && list.length > 0 ? (
            list.map((ins, i) => (
              <div key={i} className="instructor-card">
                <div className="instructor-avatar" style={{ background:`linear-gradient(135deg,${ins.color},#1e1b4b)` }}>
                  {ins.initials}
                </div>
                <div className="instructor-name">{ins.name}</div>
                <div className="instructor-title">{ins.title}</div>
                <div className="instructor-uni">{ins.uni}</div>
                <div className="instructor-stats">
                  <div style={{ textAlign:'center' }}>
                    <div className="ins-stat-val">{ins.students}</div>
                    <div className="ins-stat-label">Students</div>
                  </div>
                  <div style={{ width:1,background:'var(--border-dim)',margin:'0 4px' }} />
                  <div style={{ textAlign:'center' }}>
                    <div className="ins-stat-val">{ins.courses}</div>
                    <div className="ins-stat-label">Courses</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding:20,color:'var(--text-3)' }}>No instructors available yet.</div>
          )}
        </div>

        <div style={{ marginTop:48,padding:'40px',borderRadius:'var(--r-xl)',background:'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(6,182,212,0.05))',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:24,flexWrap:'wrap' }}>
          <div>
            <div style={{ fontFamily:'var(--font-display)',fontSize:22,fontWeight:700,color:'var(--text-1)',marginBottom:8 }}>
              Share your expertise.{' '}
              <span className="g-cyan">Earn globally.</span>
            </div>
            <div style={{ fontSize:14,color:'var(--text-2)',lineHeight:1.7,maxWidth:500 }}>
              Join expert instructors creating impact. Teach your passion, set your schedule, earn on your terms.
            </div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Become an Instructor →
          </button>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// ANNOUNCEMENTS
// ══════════════════════════════════════════════════════════
function Announcements() {
  const { data: announcements = [], isLoading: loadingAnnouncements } = useQuery({
    queryKey: ['home', 'announcements'],
    queryFn: fetchAnnouncements,
    staleTime: 300000,
  });

  return (
    <section className="section announcements-section z1">
      <div className="container">
        <SectionHdr
          eyebrow="Announcements"
          title="Stay"
          titleGrad={{ cls:'g-mixed', text:'informed' }}
          action={<Link to="/community/posts" className="btn btn-ghost btn-sm">View All →</Link>}
        />
        <div className="ann-grid">
          {(loadingAnnouncements ? [] : announcements).map((a,i) => (
            <div key={i} className="ann-card" style={{ background:a.color, borderColor:a.borderColor }}>
              <div className="ann-top-tag" style={{ background:a.tagBg, color:a.tagColor, border:`1px solid ${a.borderColor}` }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:a.tagColor }} />
                {a.tag}
              </div>
              <div className="ann-icon">{a.icon}</div>
              <div className="ann-title">{a.title}</div>
              <div className="ann-desc">{a.desc}</div>
              <div className="ann-date">📅 {a.date}</div>
            </div>
          ))}
          {!loadingAnnouncements && announcements.length === 0 && (
            <div className="ann-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              No announcements available right now.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// FINAL CTA
// ══════════════════════════════════════════════════════════
function FinalCTA() {
  const { data: homepage = {} } = useQuery({ queryKey: ['home', 'snapshot', 'cta'], queryFn: fetchHomepageSnapshot, staleTime: 300000 });

  return (
    <section className="section final-cta z1">
      <div className="container">
        <div className="cta-box">
          <div className="cta-glow" />
          <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(124,58,237,0.15) 0%,transparent 60%)',pointerEvents:'none' }} />
          <div style={{ fontSize:48,marginBottom:16,position:'relative',zIndex:1,animation:'float 5s ease-in-out infinite' }}>🌌</div>
          <h2 className="cta-title">
            Your next universe of
            <br />
            <span style={{ background:'linear-gradient(135deg,#c4b5fd,#7c3aed,#f59e0b)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',backgroundSize:'200%',animation:'shimmer 4s ease infinite' }}>
              knowledge awaits.
            </span>
          </h2>
          <p className="cta-sub">
            Join {formatCompactNumber(homepage?.totalUsers)} learners. University-grade courses, clan battles, and live competitions in one platform.
          </p>
          <div className="cta-btns">
            <Link to="/register" className="btn btn-primary btn-xl">Join Free — Start Today →</Link>
            <Link to="/courses"  className="btn btn-ghost btn-lg">Explore Courses</Link>
          </div>
          <div className="trust-row">
            {['No credit card required','Cancel anytime','Free forever plan','Certificates included'].map((t,i) => (
              <div key={i} className="trust-item"><span className="trust-check">✦</span>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN HOME COMPONENT
// ══════════════════════════════════════════════════════════
const Home = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [courseFilter, setCourseFilter] = useState('Popular');
  const [profileTick, setProfileTick] = useState(0);

  const { data: popularCourses,  isLoading: loadingPopular,    isError: errorPopular }    = useQuery({ queryKey:['courses','popular'],              queryFn:fetchPopularCourses,  staleTime:300000 });
  const { data: trendingCourses, isLoading: loadingTrending,   isError: errorTrending }   = useQuery({ queryKey:['courses','trending'],             queryFn:fetchTrendingCourses, staleTime:300000 });
  const { data: universities,    isLoading: loadingUnis,        isError: errorUnis }       = useQuery({ queryKey:['universities',{page:1,pageSize:8}], queryFn:fetchUniversities,    staleTime:300000 });
  const { data: profile }       = useQuery({ queryKey:['profile','home-me', profileTick], queryFn:fetchProfile, enabled:isLoggedIn, staleTime:30000, refetchInterval:60000, refetchOnWindowFocus:true });
  const { data: progression }   = useQuery({ queryKey:['progression','home-me'], queryFn:fetchProgression, enabled:isLoggedIn, staleTime:30000, refetchInterval:60000, refetchOnWindowFocus:true });
  const { data: myCourses }     = useQuery({ queryKey:['enrollments','my'], queryFn:fetchMyCourses, enabled:isLoggedIn, staleTime:60000 });
  const { data: myClans }       = useQuery({ queryKey:['clans','my'],       queryFn:fetchMyClans,   enabled:isLoggedIn, staleTime:60000 });

  const currentUser = useMemo(() => {
    const base = user || {};
    const live = profile || {};
    return {
      ...base,
      ...live,
      xp: Number(live?.xp ?? live?.Exp ?? base?.xp ?? base?.Exp ?? live?.totalXp ?? live?.TotalXp ?? base?.totalXp ?? base?.TotalXp ?? 0) || 0,
      level: Number(live?.level ?? live?.Level ?? base?.level ?? base?.Level ?? 1) || 1,
      streakDays: Number(live?.streakDays ?? live?.StreakDays ?? base?.streakDays ?? base?.StreakDays ?? 0) || 0,
      lastActive: live?.lastActive ?? live?.LastActive ?? base?.lastActive ?? base?.LastActive ?? null,
      isAdmin: Boolean(live?.isAdmin ?? live?.IsAdmin ?? base?.isAdmin ?? base?.IsAdmin ?? false),
      role: live?.role ?? live?.Role ?? base?.role ?? base?.Role,
    };
  }, [user, profile]);

  const sortedPopular = useMemo(() => {
    const list = Array.isArray(popularCourses) ? popularCourses.slice() : [];
    return list.sort((a,b) => {
      const ra = Number(a?.averageRating??a?.rating??0), rb = Number(b?.averageRating??b?.rating??0);
      if (rb !== ra) return rb - ra;
      return Number(b?.enrollmentCount??0) - Number(a?.enrollmentCount??0);
    });
  }, [popularCourses]);

  const sortedTrending = useMemo(() => {
    const list = Array.isArray(trendingCourses) ? trendingCourses.slice() : [];
    return list.sort((a,b) => {
      const ra = Number(a?.averageRating??a?.rating??0), rb = Number(b?.averageRating??b?.rating??0);
      if (rb !== ra) return rb - ra;
      return Number(b?.enrollmentCount??0) - Number(a?.enrollmentCount??0);
    });
  }, [trendingCourses]);

  const unis = useMemo(() => {
    if (!Array.isArray(universities)) return [];
    return universities.map((u) => ({
      ...u,
      id: u?.id ?? u?.Id,
      name: u?.name ?? u?.Name,
      bannerUrl: u?.bannerUrl ?? u?.BannerUrl,
      logoUrl: u?.logoUrl ?? u?.LogoUrl,
      location: u?.location ?? u?.Location,
      totalCourses: Number(
        u?.totalCourses ?? u?.TotalCourses ??
        u?.courseCount ?? u?.CourseCount ??
        u?.coursesCount ?? u?.CoursesCount ??
        u?.derivedCourseCount ?? u?.DerivedCourseCount ??
        u?.stats?.totalCourses ?? u?.stats?.TotalCourses ??
        u?.Stats?.totalCourses ?? u?.Stats?.TotalCourses ??
        0
      ) || 0,
      averageCourseRating: Number(
        u?.averageCourseRating ?? u?.AverageCourseRating ??
        u?.stats?.averageRating ?? u?.stats?.AverageRating ??
        u?.Stats?.averageRating ?? u?.Stats?.AverageRating ??
        0
      ) || 0,
    }));
  }, [universities]);
  const activeCourses = courseFilter === 'Popular' ? sortedPopular : sortedTrending;
  const activeLoading = courseFilter === 'Popular' ? loadingPopular : loadingTrending;

  // Increment daily streak once per day when user visits home
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;
    try {
      const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD
      const lastRaw = currentUser.lastActive || localStorage.getItem('lastActive');
      const lastDay = lastRaw ? (new Date(lastRaw).toISOString().slice(0,10)) : null;
      if (lastDay !== today) {
        // increase streak by 1 (backend should validate/reset if needed)
        const currentStreak = Number(currentUser.streakDays ?? currentUser.streak ?? 0);
        const newStreak = currentStreak + 1;
        api.put('/auth/profile', { streakDays: newStreak, lastActive: today })
          .then(res => {
            const updated = Object.assign({}, currentUser, { streakDays: newStreak, lastActive: today });
            try { localStorage.setItem('user', JSON.stringify(updated)); } catch(e) {}
            setProfileTick(t => t + 1);
          })
          .catch(() => {
            // If backend fails, still update localStorage so UI reflects change temporarily
            const updatedLocal = Object.assign({}, currentUser, { streakDays: currentStreak + 1, lastActive: today });
            try { localStorage.setItem('user', JSON.stringify(updatedLocal)); } catch(e) {}
            setProfileTick(t => t + 1);
          });
      }
    } catch (e) {}
  }, [isLoggedIn, currentUser]);

  // If an admin visits the regular home route, redirect them to the Admin Home
  useEffect(() => {
    try {
      if (isLoggedIn && currentUser && (currentUser.isAdmin || currentUser.role === 'Admin')) {
        navigate('/admin/home', { replace: true });
      }
    } catch (e) {}
  }, [isLoggedIn, currentUser, navigate]);

  return (
    <>
      <style>{CSS}</style>
      <div className="home-page">
        <CosmicBg />

        {/* ── HERO ── */}
        {isLoggedIn
          ? <HeroLoggedIn user={currentUser} myCourses={myCourses || []} progression={progression} />
          : <HeroLoggedOut />
        }

        {/* ── SEARCH ── */}
        <SearchBar />

        {/* ── ENGAGEMENT TRIO (logged-in only) ── */}
        {isLoggedIn && <EngagementTrio myCourses={myCourses || []} myClans={myClans || []} />}

        {/* ── UNIVERSITIES ── */}
        <section className="section universities-section z1">
          <div className="container">
            <SectionHdr
              eyebrow="Partner Universities"
              title="Explore by"
              titleGrad={{ cls:'g-gold', text:'University' }}
              action={<Link to="/universities" className="btn btn-ghost btn-sm">View All →</Link>}
            />
            {loadingUnis ? (
              <div className="uni-grid">
                {Array.from({length:8}).map((_,i) => (
                  <div key={i} style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)',overflow:'hidden' }}>
                    <div className="skeleton" style={{ height:100 }} />
                    <div style={{ padding:16,display:'flex',flexDirection:'column',gap:8 }}>
                      <div className="skeleton" style={{ height:12,borderRadius:4,width:'70%' }} />
                      <div className="skeleton" style={{ height:10,borderRadius:4,width:'50%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : unis.length === 0 ? (
              <div style={{ textAlign:'center',padding:'60px 0',color:'var(--text-3)',fontSize:14,fontStyle:'italic' }}>No universities found.</div>
            ) : (
              <div className="uni-grid">
                {unis.slice(0,8).map(u => <UniCard key={u?.id} uni={u} />)}
              </div>
            )}
          </div>
        </section>

        {/* ── DEPARTMENTS ── */}
        <Departments />

        {/* ── COURSES ── */}
        <section className="section courses-section z1">
          <div className="container">
            <SectionHdr
              eyebrow="Courses"
              title="Popular &"
              titleGrad={{ cls:'g-mixed', text:'Trending Courses' }}
              action={<Link to="/courses" className="btn btn-ghost btn-sm">Browse All →</Link>}
            />
            <div className="courses-filters">
              {['Popular','Trending'].map(f => (
                <button key={f} className={`filter-btn${courseFilter===f?' active':''}`} onClick={() => setCourseFilter(f)}>{f}</button>
              ))}
            </div>
            {activeLoading ? (
              <div className="course-grid">
                {Array.from({length:8}).map((_,i) => <CourseSkeleton key={i} />)}
              </div>
            ) : (activeCourses||[]).length === 0 ? (
              <div style={{ textAlign:'center',padding:'60px 0',color:'var(--text-3)',fontSize:14,fontStyle:'italic',fontFamily:'var(--font-display)' }}>
                No courses available. Check back soon.
              </div>
            ) : (
              <div className="course-grid">
                {activeCourses.slice(0,8).map(c => <CourseCard key={c?.id} course={c} />)}
              </div>
            )}
          </div>
        </section>

        {/* ── CLANS & LEADERBOARD ── */}
        <ClansLeaderboard />

        {/* ── COMPETITIONS ── */}
        <Competitions />

        {/* ── COMMUNITY FEED ── */}
        <CommunityFeed />

        {/* ── ACHIEVEMENTS ── */}
        <Achievements />

        {/* ── INSTRUCTOR SPOTLIGHT ── */}
        <InstructorSpotlight />

        {/* ── ANNOUNCEMENTS ── */}
        <Announcements />

        {/* ── FINAL CTA ── */}
        <FinalCTA />
      </div>
    </>
  );
};

export default Home;