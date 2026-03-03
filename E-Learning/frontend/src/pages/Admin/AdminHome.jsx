import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';

// ═══════════════════════════════════════════════════════════
// NEXTUNIVERSE ADMIN — COSMIC DARK CONTROL CENTER
// Pure CSS · No Chakra · Playfair Display + DM Sans
// ═══════════════════════════════════════════════════════════

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --void:        #02020a;
  --deep:        #060614;
  --surface:     #09091e;
  --card:        #0c0c24;
  --elevated:    #10102c;
  --panel:       #0e0e28;

  --violet:      #7c3aed;
  --violet-dim:  rgba(124,58,237,0.15);
  --violet-glow: rgba(124,58,237,0.35);
  --indigo:      #4f46e5;
  --cyan:        #06b6d4;
  --cyan-dim:    rgba(6,182,212,0.12);
  --gold:        #d97706;
  --gold-bright: #f59e0b;
  --gold-dim:    rgba(245,158,11,0.12);
  --emerald:     #059669;
  --emerald-bright: #10b981;
  --emerald-dim: rgba(16,185,129,0.12);
  --rose:        #e11d48;
  --rose-dim:    rgba(225,29,72,0.12);
  --amber:       #f59e0b;
  --sky:         #0ea5e9;

  --border:      rgba(124,58,237,0.16);
  --border-dim:  rgba(255,255,255,0.04);
  --border-hi:   rgba(124,58,237,0.35);

  --text-1: #eeeaf8;
  --text-2: #9895b8;
  --text-3: #52506e;

  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'DM Sans', sans-serif;
  --font-mono:    'DM Mono', 'Courier New', monospace;

  --r-sm: 6px; --r-md: 12px; --r-lg: 18px; --r-xl: 24px;
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
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--deep); }
::-webkit-scrollbar-thumb { background: var(--violet); border-radius: 99px; }

/* ── ANIMATIONS ── */
@keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.45;transform:scale(1.5)} }
@keyframes spin     { to{transform:rotate(360deg)} }
@keyframes blink    { 0%,100%{opacity:1} 50%{opacity:.2} }
@keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
@keyframes glow     { 0%,100%{box-shadow:0 0 12px var(--violet-glow)} 50%{box-shadow:0 0 28px var(--violet-glow),0 0 60px rgba(124,58,237,0.15)} }
@keyframes countup  { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
@keyframes dash     { to{stroke-dashoffset:0} }
@keyframes barGrow  { from{width:0} }
@keyframes lineIn   { from{stroke-dashoffset:500} to{stroke-dashoffset:0} }
@keyframes dot-bounce { 0%,80%,100%{transform:scale(0);opacity:.5} 40%{transform:scale(1);opacity:1} }

/* ── LAYOUT ── */
.admin-root {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 100% 50% at 50% -5%, rgba(79,46,229,0.12) 0%, transparent 55%),
    radial-gradient(ellipse 40% 30% at 95% 90%, rgba(6,182,212,0.06) 0%, transparent 50%),
    var(--void);
  position: relative;
}
.admin-grid-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 0%, black 0%, transparent 70%);
}
.z1 { position: relative; z-index: 1; }

.container { max-width: 1400px; margin: 0 auto; padding: 0 28px; }
@media(max-width:640px){ .container{ padding: 0 14px; } }

/* ── TOPBAR ── */
.admin-topbar {
  position: sticky; top: 0; z-index: 100;
  padding: 0 28px;
  height: 60px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: rgba(6,6,20,0.92);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.topbar-left { display: flex; align-items: center; gap: 20px; }
.admin-logo  { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-gem    { width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#5b21b6,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 18px rgba(124,58,237,0.5); }
.logo-name   { font-family:var(--font-display);font-size:17px;font-weight:700;background:linear-gradient(135deg,#c4b5fd,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
.logo-badge  { padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;background:rgba(225,29,72,0.18);color:#fb7185;border:1px solid rgba(225,29,72,0.35);letter-spacing:.06em;text-transform:uppercase; }

.topbar-search { position:relative; }
.topbar-search input { width:240px;height:36px;padding:0 14px 0 36px;background:rgba(255,255,255,0.04);border:1px solid var(--border-dim);border-radius:var(--r-md);color:var(--text-1);font-family:var(--font-body);font-size:13px;outline:none;transition:all .2s; }
.topbar-search input:focus { border-color:var(--border);background:rgba(124,58,237,0.06); }
.topbar-search input::placeholder { color:var(--text-3); }
.topbar-search-icon { position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--text-3);pointer-events:none; }

.topbar-right { display:flex;align-items:center;gap:12px; }
.topbar-icon-btn { width:36px;height:36px;border-radius:var(--r-md);background:rgba(255,255,255,0.04);border:1px solid var(--border-dim);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;transition:all .2s;position:relative; }
.topbar-icon-btn:hover { border-color:var(--border);background:rgba(124,58,237,0.08); }
.notif-dot { position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;background:#f43f5e;border:1.5px solid var(--void);animation:pulse 2s ease-in-out infinite; }

.admin-avatar { width:36px;height:36px;border-radius:var(--r-md);background:linear-gradient(135deg,#5b21b6,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;cursor:pointer;transition:all .2s;font-family:var(--font-body); }
.admin-avatar:hover { box-shadow:0 0 16px rgba(124,58,237,0.5); }

.sys-status { display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:99px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.22);font-size:11px;font-weight:600;color:#34d399;cursor:default; }
.sys-dot    { width:6px;height:6px;border-radius:50%;background:#10b981;animation:pulse 2s ease-in-out infinite; }

/* ── PAGE HEADER ── */
.page-header { padding: 36px 0 28px; }
.page-header-inner { display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap; }
.page-eyebrow { font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--text-3);margin-bottom:8px;display:flex;align-items:center;gap:8px; }
.page-eyebrow-dot { width:6px;height:6px;border-radius:50%;background:var(--violet);animation:pulse 2s ease-in-out infinite; }
.page-title { font-family:var(--font-display);font-size:clamp(26px,3vw,40px);font-weight:700;color:var(--text-1);letter-spacing:-.025em;line-height:1.1; }
.page-sub   { font-size:13px;color:var(--text-3);margin-top:6px;font-weight:400; }
.page-time  { font-family:var(--font-mono);font-size:12px;color:var(--text-3);background:rgba(255,255,255,0.03);padding:8px 14px;border-radius:var(--r-md);border:1px solid var(--border-dim); }

/* ── SECTION LABEL ── */
.sec-label { font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--text-3);margin-bottom:16px;display:flex;align-items:center;gap:8px; }
.sec-label::after { content:'';flex:1;height:1px;background:linear-gradient(90deg,var(--border-dim),transparent);max-width:120px; }

/* ── BUTTONS ── */
.btn { display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:var(--r-md);font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .2s;white-space:nowrap;text-decoration:none; }
.btn-primary { background:linear-gradient(135deg,#5b21b6,#7c3aed);color:white;box-shadow:0 3px 16px rgba(124,58,237,.3); }
.btn-primary:hover { transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,58,237,.45); }
.btn-ghost   { background:transparent;color:var(--text-2);border:1px solid var(--border-dim); }
.btn-ghost:hover { border-color:var(--border);color:var(--text-1); }
.btn-danger  { background:rgba(225,29,72,.12);color:#fb7185;border:1px solid rgba(225,29,72,.3); }
.btn-danger:hover { background:rgba(225,29,72,.2); }
.btn-success { background:rgba(16,185,129,.12);color:#34d399;border:1px solid rgba(16,185,129,.3); }
.btn-success:hover { background:rgba(16,185,129,.2); }
.btn-sm { padding:6px 13px;font-size:12px; }
.btn-xs { padding:4px 10px;font-size:11px; }
.btn-icon { padding:8px;width:34px;height:34px;justify-content:center; }

/* ── KPI CARDS ── */
.kpi-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px; }
@media(max-width:1200px){ .kpi-grid{grid-template-columns:repeat(2,1fr);} }
@media(max-width:600px) { .kpi-grid{grid-template-columns:1fr;} }

.kpi-card {
  padding:22px 24px;border-radius:var(--r-lg);
  background:var(--card);border:1px solid var(--border);
  position:relative;overflow:hidden;cursor:default;
  transition:all .3s cubic-bezier(.4,0,.2,1);
  animation:fadeUp .6s ease both;
}
.kpi-card:hover { border-color:var(--kpi-color,var(--violet));transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.4),0 0 24px var(--kpi-glow,rgba(124,58,237,.1)); }
.kpi-card::before { content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--kpi-color,var(--violet));opacity:.6; }
.kpi-card::after  { content:'';position:absolute;bottom:0;right:0;width:80px;height:80px;border-radius:50%;background:var(--kpi-color,var(--violet));opacity:.04;transform:translate(20px,20px); }

.kpi-top { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px; }
.kpi-icon { width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;background:var(--kpi-bg,rgba(124,58,237,.1));border:1px solid var(--kpi-border,rgba(124,58,237,.2)); }
.kpi-trend { font-size:11px;font-weight:700;padding:3px 8px;border-radius:99px; }
.kpi-trend-up   { background:rgba(16,185,129,.12);color:#34d399; }
.kpi-trend-down { background:rgba(225,29,72,.12);color:#fb7185; }
.kpi-trend-flat { background:rgba(255,255,255,.05);color:var(--text-3); }

.kpi-val   { font-family:var(--font-display);font-size:34px;font-weight:800;color:var(--text-1);letter-spacing:-.04em;line-height:1;margin-bottom:6px;animation:countup .6s ease both; }
.kpi-label { font-size:12px;color:var(--text-3);font-weight:500;letter-spacing:.03em; }
.kpi-sub   { font-size:11px;color:var(--text-3);margin-top:4px; }

.kpi-sparkline { margin-top:14px;height:36px;position:relative;overflow:visible; }

/* ── CHARTS SECTION ── */
.charts-section { margin-bottom:28px; }
.charts-grid { display:grid;grid-template-columns:2fr 1fr;gap:16px; }
@media(max-width:1000px){ .charts-grid{grid-template-columns:1fr;} }

.chart-card { background:var(--card);border:1px solid var(--border);border-radius:var(--r-lg);padding:24px;position:relative;overflow:hidden; }
.chart-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px; }
.chart-title  { font-family:var(--font-display);font-size:16px;font-weight:600;color:var(--text-1); }
.chart-tabs   { display:flex;gap:4px; }
.chart-tab    { padding:5px 13px;border-radius:99px;font-size:12px;font-weight:500;font-family:var(--font-body);cursor:pointer;border:1px solid transparent;background:transparent;color:var(--text-3);transition:all .2s; }
.chart-tab.active { background:rgba(124,58,237,.12);border-color:rgba(124,58,237,.3);color:#a78bfa; }

/* SVG Line Chart */
.line-chart-wrap { position:relative;height:200px; }
.line-chart-wrap svg { width:100%;height:100%;overflow:visible; }
.chart-grid-line { stroke:rgba(255,255,255,.04);stroke-width:1; }
.chart-y-label   { font-family:var(--font-mono);font-size:10px;fill:var(--text-3); }
.chart-x-label   { font-family:var(--font-body);font-size:10px;fill:var(--text-3); }
.chart-line      { fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:500;stroke-dashoffset:500;animation:lineIn 1.2s ease forwards; }
.chart-area      { opacity:.12; }
.chart-dot       { transition:r .2s; }
.chart-dot:hover { r:5; }
.chart-tooltip-line { stroke:rgba(124,58,237,.3);stroke-width:1;stroke-dasharray:4; }

/* Donut */
.donut-wrap { display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;position:relative; }
.donut-center { position:absolute;text-align:center; }
.donut-center-val   { font-family:var(--font-display);font-size:26px;font-weight:800;color:var(--text-1); }
.donut-center-label { font-size:11px;color:var(--text-3);margin-top:2px; }
.donut-legends { display:flex;flex-direction:column;gap:8px;margin-top:16px;width:100%; }
.donut-legend-item { display:flex;align-items:center;justify-content:space-between;font-size:12px; }
.donut-legend-dot  { width:8px;height:8px;border-radius:50%;flex-shrink:0; }

/* Bar Chart */
.bar-chart-wrap { display:flex;align-items:flex-end;gap:10px;height:140px;padding-top:16px; }
.bar-col { display:flex;flex-direction:column;align-items:center;gap:6px;flex:1; }
.bar-fill { border-radius:4px 4px 0 0;width:100%;transition:height .3s;animation:barGrow .8s ease both; }
.bar-label { font-size:10px;color:var(--text-3);font-family:var(--font-mono); }
.bar-val   { font-size:10px;font-weight:700;color:var(--text-2);font-family:var(--font-mono); }

/* ── QUICK ACTIONS ── */
.qa-grid { display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:28px; }
@media(max-width:1100px){ .qa-grid{grid-template-columns:repeat(3,1fr);} }
@media(max-width:600px) { .qa-grid{grid-template-columns:repeat(2,1fr);} }

.qa-btn {
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
  padding:22px 16px;border-radius:var(--r-lg);
  background:var(--card);border:1px solid var(--border);
  cursor:pointer;transition:all .25s cubic-bezier(.4,0,.2,1);text-decoration:none;
  position:relative;overflow:hidden;
}
.qa-btn::before { content:'';position:absolute;inset:0;background:var(--qa-color,var(--violet));opacity:0;transition:opacity .25s; }
.qa-btn:hover { transform:translateY(-4px);border-color:var(--qa-color,var(--violet));box-shadow:0 12px 32px rgba(0,0,0,.4),0 0 20px var(--qa-glow,rgba(124,58,237,.15)); }
.qa-btn:hover::before { opacity:.06; }
.qa-icon { font-size:26px;position:relative;z-index:1;transition:transform .2s; }
.qa-btn:hover .qa-icon { transform:scale(1.1); }
.qa-label { font-size:12px;font-weight:600;color:var(--text-2);text-align:center;position:relative;z-index:1;line-height:1.3; }
.qa-btn:hover .qa-label { color:var(--text-1); }

/* ── DATA TABLES (Pending / Users / etc.) ── */
.data-grid-2 { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px; }
.data-grid-3 { display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px; }
@media(max-width:1100px){ .data-grid-2,.data-grid-3{grid-template-columns:1fr;} }

.panel { background:var(--card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden; }
.panel-header { display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--border-dim); }
.panel-title  { font-family:var(--font-display);font-size:15px;font-weight:600;color:var(--text-1);display:flex;align-items:center;gap:8px; }
.panel-count  { padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700;background:rgba(225,29,72,.15);color:#fb7185;border:1px solid rgba(225,29,72,.3); }
.panel-count.green { background:rgba(16,185,129,.12);color:#34d399;border-color:rgba(16,185,129,.3); }
.panel-count.violet { background:rgba(124,58,237,.12);color:#a78bfa;border-color:rgba(124,58,237,.3); }

.table-row { display:flex;align-items:center;gap:14px;padding:13px 22px;border-bottom:1px solid rgba(255,255,255,.025);transition:background .15s;cursor:pointer; }
.table-row:last-child { border-bottom:none; }
.table-row:hover { background:rgba(124,58,237,.04); }

/* Ensure rows have a stable height and readable text */
.table-row { min-height:56px; align-items:center; }

.row-avatar { width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:white;font-family:var(--font-body);flex-shrink:0; }
.row-icon   { width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.2); }

.row-title  { font-size:13px;font-weight:600;color:var(--text-1) !important;line-height:1.3;display:block; }
.row-sub    { font-size:11px;color:var(--text-2) !important;margin-top:2px;display:block; }
.row-right  { margin-left:auto;display:flex;align-items:center;gap:8px;flex-shrink:0; }

.status-badge { padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.04em; }
.badge-pending  { background:rgba(245,158,11,.12);color:var(--gold-bright);border:1px solid rgba(245,158,11,.3); }
.badge-active   { background:rgba(16,185,129,.12);color:#34d399;border:1px solid rgba(16,185,129,.3); }
.badge-review   { background:rgba(124,58,237,.12);color:#a78bfa;border:1px solid rgba(124,58,237,.3); }
.badge-flagged  { background:rgba(225,29,72,.12);color:#fb7185;border:1px solid rgba(225,29,72,.3); }
.badge-new      { background:rgba(6,182,212,.12);color:var(--cyan);border:1px solid rgba(6,182,212,.3); }

/* ── COMPETITION PANEL ── */
.comp-panel-grid { display:grid;grid-template-columns:1.3fr 1fr;gap:16px;margin-bottom:28px; }
@media(max-width:1000px){ .comp-panel-grid{grid-template-columns:1fr;} }

.comp-row { display:flex;align-items:center;gap:14px;padding:14px 22px;border-bottom:1px solid rgba(255,255,255,.025);transition:background .15s; }
.comp-row:last-child { border-bottom:none; }
.comp-row:hover { background:rgba(6,182,212,.03); }
.comp-live-dot { width:8px;height:8px;border-radius:50%;background:#f43f5e;animation:pulse 1.2s ease-in-out infinite;flex-shrink:0; }
.comp-prog { height:3px;border-radius:99px;background:rgba(255,255,255,.05);overflow:hidden;margin-top:5px; }
.comp-prog-fill { height:100%;border-radius:99px;background:linear-gradient(90deg,var(--violet),var(--cyan)); }

/* ── USER TABLE ── */
.user-search { padding:14px 22px;border-bottom:1px solid var(--border-dim); }
.user-search input { width:100%;height:34px;padding:0 12px 0 32px;background:rgba(255,255,255,.03);border:1px solid var(--border-dim);border-radius:var(--r-md);color:var(--text-1);font-family:var(--font-body);font-size:12px;outline:none;transition:all .2s; }
.user-search input:focus { border-color:var(--border);background:rgba(124,58,237,.05); }
.user-search input::placeholder { color:var(--text-3); }
.user-search-wrap { position:relative; }
.user-search-icon { position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--text-3);pointer-events:none; }

.user-row { display:grid;grid-template-columns:36px 1fr auto auto auto;align-items:center;gap:14px;padding:12px 22px;border-bottom:1px solid rgba(255,255,255,.025);transition:background .15s;cursor:pointer; }
.user-row:hover { background:rgba(124,58,237,.04); }
.user-row:last-child { border-bottom:none; }
.user-row-header { display:grid;grid-template-columns:36px 1fr auto auto auto;gap:14px;padding:10px 22px;border-bottom:1px solid var(--border-dim);background:rgba(255,255,255,.02); }
.col-label { font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text-3); }

/* ── ALERTS ── */
.alerts-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px; }
@media(max-width:900px){ .alerts-grid{grid-template-columns:1fr;} }

.alert-item { display:flex;gap:14px;padding:14px 18px;border-radius:var(--r-md);border:1px solid;margin-bottom:8px;cursor:pointer;transition:all .2s; }
.alert-item:hover { transform:translateX(3px); }
.alert-item:last-child { margin-bottom:0; }
.alert-critical { background:rgba(225,29,72,.07);border-color:rgba(225,29,72,.25); }
.alert-warning  { background:rgba(245,158,11,.07);border-color:rgba(245,158,11,.25); }
.alert-info     { background:rgba(6,182,212,.07);border-color:rgba(6,182,212,.2); }
.alert-success  { background:rgba(16,185,129,.07);border-color:rgba(16,185,129,.25); }

.alert-icon-wrap { width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0; }
.alert-title { font-size:13px;font-weight:600;color:var(--text-1);margin-bottom:3px; }
.alert-desc  { font-size:12px;color:var(--text-2);line-height:1.5; }
.alert-time  { font-size:10px;color:var(--text-3);margin-top:4px;font-family:var(--font-mono); }

/* ── LOGS PANEL ── */
.log-row { display:flex;align-items:flex-start;gap:12px;padding:10px 20px;border-bottom:1px solid rgba(255,255,255,.025);font-family:var(--font-mono);font-size:11px; }
.log-row:last-child { border-bottom:none; }
.log-level { padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;flex-shrink:0;margin-top:1px; }
.log-info  { background:rgba(6,182,212,.12);color:var(--cyan); }
.log-warn  { background:rgba(245,158,11,.12);color:var(--gold-bright); }
.log-error { background:rgba(225,29,72,.12);color:#fb7185; }
.log-ok    { background:rgba(16,185,129,.12);color:#34d399; }
.log-time  { color:var(--text-3);flex-shrink:0; }
.log-msg   { color:var(--text-2);flex:1;line-height:1.5; }

/* ── DB HEALTH ── */
.db-health { display:grid;grid-template-columns:repeat(4,1fr);gap:12px; }
@media(max-width:900px){ .db-health{grid-template-columns:repeat(2,1fr);} }
.db-metric { padding:16px 18px;border-radius:var(--r-md);background:rgba(255,255,255,.02);border:1px solid var(--border-dim);text-align:center; }
.db-metric-val   { font-family:var(--font-mono);font-size:22px;font-weight:700;color:var(--text-1);line-height:1; }
.db-metric-label { font-size:10px;color:var(--text-3);text-transform:uppercase;letter-spacing:.1em;margin-top:4px; }
.db-metric-bar   { height:3px;border-radius:99px;background:rgba(255,255,255,.05);margin-top:8px;overflow:hidden; }
.db-metric-fill  { height:100%;border-radius:99px;animation:barGrow .8s ease both; }

/* ── ANNOUNCE COMPOSER ── */
.announce-form { display:flex;flex-direction:column;gap:12px;padding:20px 22px; }
.a-input { width:100%;padding:10px 14px;background:rgba(255,255,255,.03);border:1px solid var(--border-dim);border-radius:var(--r-md);color:var(--text-1);font-family:var(--font-body);font-size:13px;outline:none;transition:all .2s; }
.a-input:focus { border-color:var(--border);background:rgba(124,58,237,.05); }
.a-input::placeholder { color:var(--text-3); }
.a-select { appearance:none;-webkit-appearance:none;cursor:pointer; }
textarea.a-input { resize:none;min-height:80px; }
.a-row { display:flex;gap:10px;flex-wrap:wrap; }
.a-row > * { flex:1;min-width:140px; }

/* ── CONTENT SNAPSHOT ── */
.content-grid { display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px; }
@media(max-width:1000px){ .content-grid{grid-template-columns:1fr;} }

/* ── SECTION SPACING ── */
.mb-section { margin-bottom: 28px; }

/* ── RESPONSIVE ── */
@media(max-width:640px) {
  .topbar-search { display:none; }
  .page-title { font-size:22px; }
  .kpi-val { font-size:26px; }
  .qa-grid { grid-template-columns:repeat(2,1fr); }
}
`;

// ═══════════════════════════════════════
// MINI SVG LINE CHART (pure SVG, no lib)
// ═══════════════════════════════════════
function MiniLineChart({ data = [], color = '#7c3aed', height = 200, labels = [], yMax }) {
  const W = 600, H = height;
  const pad = { top: 20, right: 20, bottom: 30, left: 44 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  // Normalize incoming data to a numeric series. Support simple numbers or objects like { y: number }.
  const series = Array.isArray(data) ? data : [];
  const nums = series.length === 0 ? [] : series.map(v => {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && !Number.isNaN(Number(v))) return Number(v);
    if (typeof v === 'object') return Number(v.y ?? v.value ?? v.v ?? 0);
    return 0;
  });

  if (!nums.length) {
    // Render an empty placeholder SVG to avoid runtime errors when no data
    return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
        <defs>
          <linearGradient id={`area-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".12"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  const max = yMax ?? Math.max(...nums, 1);
  const min = Math.min(...nums, 0);
  const range = max - min || 1;

  // If only one point, render a flat line in the middle
  const pts = nums.map((v, i) => ({
    x: pad.left + (nums.length === 1 ? 0.5 : (i / (nums.length - 1))) * iW,
    y: pad.top + iH - ((v - min) / range) * iH,
  }));

  const linePath  = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const lastPt = pts[pts.length - 1] || pts[0];
  const firstPt = pts[0] || lastPt;
  const areaPath  = `${linePath} L${lastPt.x},${pad.top + iH} L${firstPt.x},${pad.top + iH} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: pad.top + iH - t * iH, val: Math.round(min + t * range) }));

  const labelArray = Array.isArray(labels) && labels.length === nums.length ? labels : [];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
      <defs>
        <linearGradient id={`area-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.left} x2={W - pad.right} y1={t.y} y2={t.y} className="chart-grid-line" />
          <text x={pad.left - 6} y={t.y + 4} textAnchor="end" className="chart-y-label">{t.val >= 1000 ? `${(t.val/1000).toFixed(0)}k` : t.val}</text>
        </g>
      ))}
      {labelArray.map((l, i) => {
        const x = pad.left + (i / (labelArray.length - 1)) * iW;
        return <text key={i} x={x} y={H - 4} textAnchor="middle" className="chart-x-label">{l}</text>;
      })}
      <path d={areaPath} fill={`url(#area-${color.replace('#','')})`} className="chart-area" />
      <path d={linePath} stroke={color} className="chart-line" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} className="chart-dot" stroke="var(--card)" strokeWidth="2" />
      ))}
    </svg>
  );
}

// Donut Chart
function DonutChart({ segments, size = 140 }) {
  const r = 52, cx = 70, cy = 70, circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map(s => {
    const len = (s.pct / 100) * circ;
    const arc = { ...s, dasharray: `${len} ${circ - len}`, dashoffset: -offset };
    offset += len;
    return arc;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="16"/>
      {arcs.map((a, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={a.color} strokeWidth="16"
          strokeDasharray={a.dasharray} strokeDashoffset={a.dashoffset}
          strokeLinecap="butt"
          style={{ transform:'rotate(-90deg)', transformOrigin:'70px 70px', transition:'stroke-dasharray .8s ease' }} />
      ))}
    </svg>
  );
}

// KPI Sparkline (tiny SVG)
function Sparkline({ data = [], color = '#7c3aed' }) {
  const W = 80, H = 36;
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`);
  return (
    <svg width={W} height={H} style={{ overflow:'visible' }}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: 'lineIn 1s ease forwards' }} />
    </svg>
  );
}

// Live Clock
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <span>
      {time.toLocaleDateString('en-US', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}
      {'  '}
      <span style={{ color:'var(--violet-bright)', fontWeight:700 }}>
        {time.toLocaleTimeString('en-US', { hour12:false })}
      </span>
    </span>
  );
}

// Countdown unit
function Countdown({ deadline }) {
  const [t, setT] = useState({ d:0, h:0, m:0, s:0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(deadline) - new Date());
      setT({ d:Math.floor(diff/86400000), h:Math.floor((diff%86400000)/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [deadline]);
  return (
    <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-3)' }}>
      {t.d}d {String(t.h).padStart(2,'0')}:{String(t.m).padStart(2,'0')}:{String(t.s).padStart(2,'0')}
    </span>
  );
}

// ═══════════════════════════════════════
// DASHBOARD CONFIG + FALLBACK SHAPES
// ═══════════════════════════════════════
// KPI metadata — values come from API (`adminStats`) when available
const KPI_CARDS = [
  { icon:'👥', label:'Total Users', val:null, trend:null, trendDir:'flat', sub:null, color:'#7c3aed', bg:'rgba(124,58,237,0.1)', border:'rgba(124,58,237,0.2)', glow:'rgba(124,58,237,0.15)', spark:[] },
  { icon:'🎓', label:'Active Students Today', val:null, trend:null, trendDir:'flat', sub:null, color:'#06b6d4', bg:'rgba(6,182,212,0.1)', border:'rgba(6,182,212,0.2)', glow:'rgba(6,182,212,0.12)', spark:[] },
  { icon:'🏛️', label:'Universities', val:null, trend:null, trendDir:'flat', sub:null, color:'#d97706', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.2)', glow:'rgba(245,158,11,0.12)', spark:[] },
  { icon:'📚', label:'Total Courses', val:null, trend:null, trendDir:'flat', sub:null, color:'#7c3aed', bg:'rgba(124,58,237,0.1)', border:'rgba(124,58,237,0.2)', glow:'rgba(124,58,237,0.15)', spark:[] },
  { icon:'⚔️', label:'Active Clans', val:null, trend:null, trendDir:'flat', sub:null, color:'#e11d48', bg:'rgba(225,29,72,0.1)', border:'rgba(225,29,72,0.2)', glow:'rgba(225,29,72,0.12)', spark:[] },
  { icon:'🏆', label:'Ongoing Competitions', val:null, trend:null, trendDir:'flat', sub:null, color:'#f59e0b', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.2)', glow:'rgba(245,158,11,0.12)', spark:[] },
  { icon:'📐', label:'Departments', val:null, trend:null, trendDir:'flat', sub:null, color:'#059669', bg:'rgba(5,150,105,0.1)', border:'rgba(5,150,105,0.2)', glow:'rgba(5,150,105,0.12)', spark:[] },
  { icon:'💰', label:'Platform Revenue', val:null, trend:null, trendDir:'flat', sub:null, color:'#4f46e5', bg:'rgba(79,70,229,0.1)', border:'rgba(79,70,229,0.2)', glow:'rgba(79,70,229,0.12)', spark:[] },
];

// Chart placeholders — prefer `adminStats.charts` if available
const CHART_DATA = {
  userGrowth:    { labels:[], data:[] },
  enrollment:    { labels:[], data:[] },
  competition:   { labels:[], data:[] },
  revenue:       { labels:[], data:[] },
};

// Enrollment by department — will be populated from API when available
const DONUT_DATA = [];

const QUICK_ACTIONS = [
  { icon:'🏛️', label:'Add University',     color:'#d97706', glow:'rgba(217,119,6,0.18)', to:'/admin/universities' },
  { icon:'📐', label:'Add Department',     color:'#06b6d4', glow:'rgba(6,182,212,0.18)', to:'/admin/department-requests' },
  { icon:'📚', label:'Create Course',      color:'#7c3aed', glow:'rgba(124,58,237,0.18)', to:'/admin/courses' },
  { icon:'🏆', label:'Create Competition', color:'#f59e0b', glow:'rgba(245,158,11,0.18)', to:'/admin/competitions' },
  { icon:'⚔️', label:'Create Clan Event',  color:'#e11d48', glow:'rgba(225,29,72,0.18)', to:'/admin/clan-competitions' },
  { icon:'📢', label:'Broadcast Notice',   color:'#059669', glow:'rgba(5,150,105,0.18)', to:'/community/forum' },
];

const PENDING_INSTRUCTORS = [];

const PENDING_COURSES = [];

const PENDING_CLANS = [];

const REPORTED_POSTS = [];

const COMPETITIONS = [];

const RECENT_USERS = [];

const LOGS = [];

const DB_METRICS = [];

const CONTENT_SNAPSHOT = { courses:[], universities:[], departments:[] };

// Small helper: derive readable initials from a name or email
function getInitialsFromName(name, email) {
  try {
    if (name && typeof name === 'string') {
      const parts = name.split(' ').filter(Boolean);
      if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
      return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    }
    if (email && typeof email === 'string') return email[0].toUpperCase();
  } catch (e) {}
  return 'NA';
}

// ═══════════════════════════════════════
// API FETCHERS (real data integration)
// ═══════════════════════════════════════
const fetchAdminStats = async () => {
  try {
    const { data } = await api.get('/admin/homepage');
    return data?.data ?? data; // support wrapper { data: { ... } }
  } catch (err) { throw err; }
};
const fetchPendingApprovals = async () => {
  try {
    // Backend endpoint: GET /api/admin/teacher-approvals/pending
    const res = await api.get('/admin/teacher-approvals/pending');
    // Controller returns: { success: true, message: "...", data: [...] }
    const payload = res?.data ?? null;
    const list = payload?.data ?? payload;
    // Normalize and ensure the UI fields we render exist: name, initials, sub, badge, color
    const normalized = Array.isArray(list) ? list.map(u => {
      const name = u?.name ?? u?.userName ?? u?.username ?? ((u?.firstName || u?.lastName) ? `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim() : null) ?? u?.email ?? 'Unknown';
      const initials = u?.initials ?? getInitialsFromName(name, u?.email);
      const sub = u?.sub ?? u?.email ?? u?.title ?? '';
      const badge = u?.badge ?? 'pending';
      const color = u?.color ?? u?.avatarColor ?? '#7c3aed';
      return { ...u, name, initials, sub, badge, color };
    }) : [];
    return { instructors: normalized };
  } catch (err) {
    // Let react-query surface the error
    throw err;
  }
};
const fetchSystemAlerts = async () => {
  try {
    const { data } = await api.get('/admin/system-alerts');
    return data;
  } catch { return null; }
};

const fetchRecentActivities = async () => {
  const { data } = await api.get('/admin/activities', { params: { page: 1, pageSize: 20 } });
  return data?.activities ?? [];
};

const fetchTopCourses = async () => {
  const { data } = await api.get('/admin/courses/top', { params: { count: 6 } });
  return data?.topCourses ?? [];
};

const fetchAdminUsers = async () => {
  const { data } = await api.get('/admin/users', { params: { page: 1, pageSize: 20 } });
  return data?.users ?? [];
};

const fetchPendingCourses = async () => {
  const { data } = await api.get('/admin/courses/pending', { params: { page: 1, pageSize: 10 } });
  return data?.courses ?? [];
};

const fetchCompetitions = async () => {
  const { data } = await api.get('/competitions', { params: { page: 1, pageSize: 12 } });
  const list = data?.data?.items ?? data?.data ?? [];
  return Array.isArray(list) ? list : [];
};

const fetchContentSnapshot = async () => {
  try {
    const [uniRes, deptRes] = await Promise.all([
      api.get('/universities', { params: { page: 1, pageSize: 6 } }),
      api.get('/departments', { params: { page: 1, pageSize: 6 } })
    ]);

    const universitiesRaw = uniRes?.data?.data ?? uniRes?.data?.universities ?? [];
    const departmentsRaw = deptRes?.data?.data ?? deptRes?.data?.departments ?? [];

    const universities = (Array.isArray(universitiesRaw) ? universitiesRaw : universitiesRaw?.items || []).slice(0, 5).map((u) => ({
      icon: '🏛️',
      title: u?.name || 'University',
      sub: u?.website || u?.location || 'Updated recently',
      badge: u?.isActive === false ? 'review' : 'active',
    }));

    const departments = (Array.isArray(departmentsRaw) ? departmentsRaw : departmentsRaw?.items || []).slice(0, 5).map((d) => ({
      icon: '📐',
      title: d?.name || 'Department',
      sub: d?.universityName || d?.code || 'Updated recently',
      badge: d?.isActive === false ? 'review' : 'active',
    }));

    return { universities, departments };
  } catch {
    return { universities: [], departments: [] };
  }
};

// ═══════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ═══════════════════════════════════════
export default function AdminHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chartTab, setChartTab]       = useState('userGrowth');
  const [userSearch, setUserSearch]   = useState('');
  const [announceType, setAnnounceType] = useState('global');
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceMsg, setAnnounceMsg]   = useState('');
  const [announceSent, setAnnounceSent] = useState(false);
  const [activeLogTab, setActiveLogTab] = useState('api');

  // Real API data (gracefully falls back to static)
  const { data: adminStats, isLoading: adminLoading, isError: adminError, refetch: refetchAdmin } = useQuery({ queryKey:['admin','stats'], queryFn:fetchAdminStats, staleTime:30000 });
  const { data: pendingData }   = useQuery({ queryKey:['admin','pending'],  queryFn:fetchPendingApprovals, staleTime:30000 });
  const { data: alertsData }    = useQuery({ queryKey:['admin','alerts'],   queryFn:fetchSystemAlerts,  staleTime:15000 });
  const { data: recentActivitiesData } = useQuery({ queryKey:['admin','activities'], queryFn:fetchRecentActivities, staleTime:15000 });
  const { data: topCoursesData }       = useQuery({ queryKey:['admin','top-courses'], queryFn:fetchTopCourses, staleTime:30000 });
  const { data: usersData }            = useQuery({ queryKey:['admin','users'], queryFn:fetchAdminUsers, staleTime:30000 });
  const { data: pendingCoursesData }   = useQuery({ queryKey:['admin','pending-courses'], queryFn:fetchPendingCourses, staleTime:30000 });
  const { data: competitionsData }     = useQuery({ queryKey:['admin','competitions'], queryFn:fetchCompetitions, staleTime:30000 });
  const { data: contentSnapshotData }  = useQuery({ queryKey:['admin','content-snapshot'], queryFn:fetchContentSnapshot, staleTime:60000 });

  // Merge real data over static fallback
  const kpiCards = useMemo(() => {
    if (!adminStats) return KPI_CARDS;
    return KPI_CARDS.map(k => {
      const map = {
        'Total Users':            adminStats.totalUsers,
        'Active Students Today':  (adminStats.activeUsers ?? adminStats.activeStudentsToday),
        'Universities':           adminStats.totalUniversities,
        'Total Courses':          adminStats.totalCourses,
        'Active Clans':           adminStats.activeClans,
        'Ongoing Competitions':   adminStats.ongoingCompetitions,
        'Departments':            adminStats.totalDepartments,
        'Platform Revenue':       adminStats.revenue ? `$${adminStats.revenue}` : null,
      };
      const v = map[k.label];
      return v != null ? { ...k, val: typeof v === 'number' ? v.toLocaleString() : v } : k;
    });
  }, [adminStats]);

  // Loading / error UI handling
  if (adminLoading) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-2)'}}>Loading dashboard data…</div>
      </>
    );
  }

  if (adminError) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{minHeight:'60vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'var(--text-2)',gap:12}}>
          <div>Failed to load dashboard data.</div>
          <button className="btn btn-primary btn-sm" onClick={() => refetchAdmin()}>Retry</button>
        </div>
      </>
    );
  }

  const recentActivitiesList = Array.isArray(recentActivitiesData) ? recentActivitiesData : [];

  const alerts = (() => {
    if (Array.isArray(alertsData) && alertsData.length) return alertsData;
    return recentActivitiesList.slice(0, 6).map((a, idx) => ({
      type: idx % 3 === 0 ? 'info' : idx % 3 === 1 ? 'warning' : 'success',
      icon: idx % 3 === 0 ? 'ℹ️' : idx % 3 === 1 ? '⚠️' : '✅',
      title: a?.action || 'System Activity',
      desc: a?.meta || a?.user || 'Recent platform update',
      time: a?.time ? new Date(a.time).toLocaleString() : 'Just now',
    }));
  })();
  const chartConfig = (adminStats && adminStats.charts && adminStats.charts[chartTab]) ? adminStats.charts[chartTab] : CHART_DATA[chartTab];

  // Prefer API data when available, otherwise fall back to the static mocks
  const competitionsList = (() => {
    if (Array.isArray(competitionsData) && competitionsData.length) {
      return competitionsData.slice(0, 6).map((c) => {
        const participants = Number(c?.participantCount ?? c?.participants ?? 0);
        const maxPart = Number(c?.maxParticipants ?? c?.maxPart ?? Math.max(participants, 1));
        const statusRaw = String(c?.status || '').toLowerCase();
        const status = statusRaw.includes('ongoing') || statusRaw.includes('live') ? 'live' : 'upcoming';
        return {
          icon: '🏆',
          title: c?.title || 'Competition',
          participants,
          maxPart,
          status,
          deadline: c?.endDate || c?.registrationDeadline || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          prize: c?.prizePool ? `$${c.prizePool}` : '—',
          id: c?.id,
        };
      });
    }

    if (Array.isArray(adminStats?.topCompetitions) && adminStats.topCompetitions.length) {
      return adminStats.topCompetitions.slice(0, 6).map((c) => ({
        icon: '🏆',
        title: c?.title || 'Competition',
        participants: Number(c?.participantCount ?? 0),
        maxPart: Math.max(Number(c?.participantCount ?? 1), 1),
        status: 'live',
        deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        prize: '—',
        id: c?.competitionId,
      }));
    }

    return COMPETITIONS;
  })();

  const recentUsersList = (() => {
    if (!Array.isArray(usersData) || !usersData.length) return RECENT_USERS;
    return usersData.slice(0, 20).map((u) => {
      const name = `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || u?.username || u?.email || 'Unknown User';
      const role = u?.isAdmin ? 'Admin' : u?.isTeacher ? 'Teacher' : 'Student';
      const status = u?.teacherPendingApproval ? 'new' : 'active';
      return {
        id: u?.id,
        initials: getInitialsFromName(name, u?.email),
        name,
        email: u?.email || '—',
        joined: u?.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—',
        role,
        status,
        color: u?.isAdmin ? '#e11d48' : u?.isTeacher ? '#06b6d4' : '#7c3aed',
      };
    });
  })();

  const logsList = (() => {
    if (Array.isArray(adminStats?.logs) && adminStats.logs.length) return adminStats.logs;
    if (!recentActivitiesList.length) return LOGS;
    return recentActivitiesList.slice(0, 20).map((a, idx) => ({
      level: idx % 4 === 0 ? 'OK' : idx % 4 === 1 ? 'INFO' : idx % 4 === 2 ? 'WARN' : 'INFO',
      time: a?.time ? new Date(a.time).toLocaleTimeString() : '--:--:--',
      msg: `${a?.action || 'Activity'}${a?.meta ? ` · ${a.meta}` : ''}`,
    }));
  })();

  const dbMetricsList = (adminStats && Array.isArray(adminStats.dbMetrics) && adminStats.dbMetrics.length) ? adminStats.dbMetrics : DB_METRICS;

  const contentSnapshotObj = (() => {
    const base = adminStats && adminStats.contentSnapshot ? adminStats.contentSnapshot : CONTENT_SNAPSHOT;
    const dynamicCourses = Array.isArray(topCoursesData)
      ? topCoursesData.slice(0, 5).map((item) => ({
          icon: '📚',
          title: item?.course?.title || item?.title || 'Course',
          sub: `${item?.enrollmentCount ?? 0} enrollments`,
          badge: (item?.completionRate ?? 0) >= 50 ? 'active' : 'review',
        }))
      : [];

    return {
      courses: dynamicCourses.length ? dynamicCourses : (base.courses || []),
      universities: (contentSnapshotData?.universities?.length ? contentSnapshotData.universities : (base.universities || [])),
      departments: (contentSnapshotData?.departments?.length ? contentSnapshotData.departments : (base.departments || [])),
    };
  })();

  const security = adminStats && adminStats.security ? adminStats.security : {};
  const successfulLogins = security.successfulLoginsToday ?? null;
  const failedLogins = security.failedLoginAttempts ?? null;
  const suspiciousActivity = security.suspicious ?? null;
  const activeSessionsNow = security.activeSessionsNow ?? null;

  const instructors = (pendingData && Array.isArray(pendingData.instructors) && pendingData.instructors.length) ? pendingData.instructors : PENDING_INSTRUCTORS;
  const pendingCoursesList = (() => {
    if (Array.isArray(pendingCoursesData) && pendingCoursesData.length) {
      return pendingCoursesData.slice(0, 8).map((c) => ({
        icon: '📚',
        title: c?.title || 'Pending Course',
        sub: `${c?.teacherName || 'Teacher'} · ${c?.departmentName || 'Department'}`,
        badge: 'pending',
      }));
    }
    if (pendingData && Array.isArray(pendingData.courses) && pendingData.courses.length) return pendingData.courses;
    return PENDING_COURSES;
  })();
  const pendingClansList = (pendingData && Array.isArray(pendingData.clans) && pendingData.clans.length) ? pendingData.clans : PENDING_CLANS;
  const reportedPostsList = (pendingData && Array.isArray(pendingData.reports) && pendingData.reports.length) ? pendingData.reports : REPORTED_POSTS;

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceMsg.trim()) return;
    try {
      await api.post('/posts/forums', {
        title: announceTitle.trim(),
        content: announceMsg.trim(),
        postType: 'Discussion',
        type: 'Forum',
        tags: ['broadcast', announceType],
      });

      setAnnounceSent(true);
      setAnnounceTitle('');
      setAnnounceMsg('');
      setTimeout(() => navigate('/community/forum'), 500);
    } catch {
      setAnnounceSent(false);
    }
  };

  const filteredUsers = recentUsersList.filter(u =>
    !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const suspendedUsersCount = recentUsersList.filter(u => String(u?.status || '').toLowerCase() === 'suspended').length;

  const topbarAdminName = (() => {
    if (user) {
      const full = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
      return full || user?.username || user?.email || 'Admin';
    }
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      const full = `${parsed?.firstName || ''} ${parsed?.lastName || ''}`.trim();
      return full || parsed?.username || parsed?.email || 'Admin';
    } catch {
      return 'Admin';
    }
  })();

  const topbarAdminInitials = getInitialsFromName(topbarAdminName, user?.email);

  const normalizedAlerts = (() => {
    const source = alertsData?.alerts ?? alertsData?.data ?? alertsData;
    return Array.isArray(source) ? source : [];
  })();

  const hasCriticalAlert = normalizedAlerts.some((a) => {
    const text = `${a?.type || ''} ${a?.severity || ''} ${a?.status || ''}`.toLowerCase();
    return text.includes('critical') || text.includes('error') || text.includes('down') || text.includes('failed');
  });

  const hasWarningAlert = !hasCriticalAlert && normalizedAlerts.some((a) => {
    const text = `${a?.type || ''} ${a?.severity || ''} ${a?.status || ''}`.toLowerCase();
    return text.includes('warning') || text.includes('degraded') || text.includes('pending');
  });

  const topbarSystemStatus = hasCriticalAlert
    ? 'System Issues Detected'
    : hasWarningAlert
      ? 'System Under Observation'
      : 'All Systems Operational';

  const topbarStatusStyle = hasCriticalAlert
    ? { background:'rgba(225,29,72,0.10)', border:'1px solid rgba(225,29,72,0.28)', color:'#fb7185' }
    : hasWarningAlert
      ? { background:'rgba(245,158,11,0.10)', border:'1px solid rgba(245,158,11,0.28)', color:'#fbbf24' }
      : undefined;

  const topbarSearchPlaceholder = `Search ${Number(adminStats?.totalUsers ?? 0).toLocaleString()} users, ${Number(adminStats?.totalCourses ?? 0).toLocaleString()} courses, ${Number(adminStats?.totalUniversities ?? 0).toLocaleString()} unis…`;

  return (
    <>
      <style>{CSS}</style>
      <div className="admin-root">
        <div className="admin-grid-bg" />

        {/* ── TOPBAR ── */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <Link to="/admin/home" className="admin-logo">
             
              <span className="logo-badge">Admin</span>
            </Link>
            <div className="topbar-search">
              <span className="topbar-search-icon">🔍</span>
              <input placeholder={topbarSearchPlaceholder} />
            </div>
          </div>
          <div className="topbar-right">
            <div className="sys-status" style={topbarStatusStyle}><div className="sys-dot" />{topbarSystemStatus}</div>
            <div className="topbar-icon-btn" title="Settings" onClick={() => navigate('/admin/dashboard')}>⚙️</div>
            <div className="admin-avatar" onClick={() => navigate('/profile')} title={topbarAdminName}>{topbarAdminInitials}</div>
          </div>
        </header>

        <div className="z1">
          <div className="container">

            {/* ── PAGE HEADER ── */}
            <div className="page-header">
              <div className="page-header-inner">
                <div>
                  <div className="page-eyebrow"><div className="page-eyebrow-dot" />Control Center · Admin Dashboard</div>
                  <h1 className="page-title">
                    System{' '}
                    <span style={{ background:'linear-gradient(135deg,#c4b5fd,#7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                      Overview
                    </span>
                  </h1>
                  <p className="page-sub">Real-time platform health, activity monitoring, and operational controls.</p>
                </div>
                <div className="page-time"><LiveClock /></div>
              </div>
            </div>

            {/* ══════════════════════════════════
               1. KPI CARDS
            ══════════════════════════════════ */}
            <div className="sec-label">📊 Platform KPIs</div>
            <div className="kpi-grid mb-section">
              {kpiCards.map((k, i) => (
                <div key={i} className="kpi-card" style={{
                  '--kpi-color': k.color,
                  '--kpi-bg':    k.bg,
                  '--kpi-border':k.border,
                  '--kpi-glow':  k.glow,
                  animationDelay: `${i * 0.06}s`,
                }}>
                  <div className="kpi-top">
                    <div className="kpi-icon">{k.icon}</div>
                    <span className={`kpi-trend kpi-trend-${k.trendDir}`}>{k.trend}</span>
                  </div>
                  <div className="kpi-val">{k.val}</div>
                  <div className="kpi-label">{k.label}</div>
                  <div className="kpi-sub">{k.sub}</div>
                  <div className="kpi-sparkline">
                    <Sparkline data={k.spark} color={k.color} />
                  </div>
                </div>
              ))}
            </div>

            {/* ══════════════════════════════════
               2. CHARTS
            ══════════════════════════════════ */}
            <div className="sec-label">📈 Activity Overview</div>
            <div className="charts-grid mb-section">

              {/* Line Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title">Growth Analytics</div>
                  <div className="chart-tabs">
                    {[
                      { k:'userGrowth', label:'Users' },
                      { k:'enrollment', label:'Enrollment' },
                      { k:'competition',label:'Competition' },
                      { k:'revenue',    label:'Revenue' },
                    ].map(t => (
                      <button key={t.k} className={`chart-tab${chartTab===t.k?' active':''}`}
                        onClick={() => setChartTab(t.k)}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="line-chart-wrap">
                  <MiniLineChart
                    data={chartConfig.data}
                    labels={chartConfig.labels}
                    color={chartTab==='revenue'?'#f59e0b':chartTab==='enrollment'?'#06b6d4':chartTab==='competition'?'#e11d48':'#7c3aed'}
                    height={200}
                  />
                </div>
              </div>

              {/* Donut + Bar */}
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title">Enrollment by Dept.</div>
                </div>
                <div className="donut-wrap">
                  <DonutChart segments={(adminStats && Array.isArray(adminStats.enrollmentByDept) && adminStats.enrollmentByDept.length) ? adminStats.enrollmentByDept : DONUT_DATA} size={150} />
                  <div className="donut-center">
                    <div className="donut-center-val">{(adminStats && (adminStats.totalEnrollments || adminStats.enrollmentsTotal)) ? (adminStats.totalEnrollments || adminStats.enrollmentsTotal).toLocaleString() : (chartConfig && chartConfig.data && chartConfig.data.length? chartConfig.data[chartConfig.data.length-1].toLocaleString() : '—')}</div>
                    <div className="donut-center-label">Enrollments</div>
                  </div>
                </div>
                <div className="donut-legends">
                  {DONUT_DATA.map((d, i) => (
                    <div key={i} className="donut-legend-item">
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div className="donut-legend-dot" style={{ background:d.color }} />
                        <span style={{ fontSize:12, color:'var(--text-2)' }}>{d.label}</span>
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text-1)', fontFamily:'var(--font-mono)' }}>{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════
               3. QUICK ACTIONS
            ══════════════════════════════════ */}
            <div className="sec-label">⚡ Quick Actions</div>
            <div className="qa-grid mb-section">
              {QUICK_ACTIONS.map((a, i) => (
                <Link key={i} to={a.to} className="qa-btn"
                  style={{ '--qa-color': a.color, '--qa-glow': a.glow }}>
                  <div className="qa-icon">{a.icon}</div>
                  <div className="qa-label">{a.label}</div>
                </Link>
              ))}
            </div>

            {/* ══════════════════════════════════
               4. PENDING APPROVALS
            ══════════════════════════════════ */}
            <div className="sec-label">🕐 Pending Approvals</div>
            <div className="data-grid-2 mb-section">

              {/* Instructor Approvals */}
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">👨‍🏫 Teacher Applications
                    <span className="panel-count">{instructors.length}</span>
                  </span>
                  <Link to="/admin/manage-teachers" className="btn btn-ghost btn-xs">View All</Link>
                </div>
                {instructors.length === 0 ? (
                  <div style={{ padding:22, textAlign:'center', color:'var(--text-2)' }}>
                    No pending teacher applications.
                  </div>
                ) : (
                  instructors.map((r, i) => (
                    <div key={i} className="table-row">
                      <div className="row-avatar" style={{ background:`linear-gradient(135deg,${r.color},#1e1b4b)` }}>{r.initials}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div className="row-title">{r.name}</div>
                        <div className="row-sub">{r.sub}</div>
                      </div>
                      <div className="row-right">
                        <span className={`status-badge badge-${r.badge}`}>{r.badge}</span>
                        <button className="btn btn-success btn-xs" onClick={() => navigate('/admin/manage-teachers')}>Approve</button>
                        <button className="btn btn-danger btn-xs" onClick={() => navigate('/admin/manage-teachers')}>Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Course Reviews + Clan + Reports */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">📚 Course Reviews
                      <span className="panel-count violet">{pendingCoursesList.length}</span>
                    </span>
                    <Link to="/admin/courses" className="btn btn-ghost btn-xs">View All</Link>
                  </div>
                  {pendingCoursesList.map((r, i) => (
                    <div key={i} className="table-row">
                      <div className="row-icon">{r.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div className="row-title" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.title}</div>
                        <div className="row-sub">{r.sub}</div>
                      </div>
                      <div className="row-right">
                        <span className={`status-badge badge-${r.badge}`}>{r.badge}</span>
                        <button className="btn btn-ghost btn-xs" onClick={() => navigate('/admin/courses')}>Review →</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">⚔️ Clan Requests
                      <span className="panel-count">{pendingClansList.length}</span>
                    </span>
                  </div>
                  {pendingClansList.map((r, i) => (
                    <div key={i} className="table-row">
                      <div className="row-icon">{r.icon}</div>
                      <div style={{ flex:1 }}>
                        <div className="row-title">{r.name}</div>
                        <div className="row-sub">{r.sub}</div>
                      </div>
                      <div className="row-right">
                        <button className="btn btn-success btn-xs" onClick={() => navigate('/admin/clan-competitions')}>Approve</button>
                        <button className="btn btn-danger btn-xs" onClick={() => navigate('/admin/clan-competitions')}>Deny</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">🚩 Reported Content
                      <span className="panel-count">{reportedPostsList.length}</span>
                    </span>
                  </div>
                  {reportedPostsList.map((r, i) => (
                    <div key={i} className="table-row">
                      <div className="row-icon" style={{ background:'rgba(225,29,72,0.1)', border:'1px solid rgba(225,29,72,0.25)' }}>{r.icon}</div>
                      <div style={{ flex:1 }}>
                        <div className="row-title">{r.title}</div>
                        <div className="row-sub">{r.sub}</div>
                      </div>
                      <div className="row-right">
                        <span className={`status-badge badge-${r.badge}`}>{r.badge}</span>
                        <button className="btn btn-ghost btn-xs" onClick={() => navigate('/community/posts')}>Review</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════
               5. COMPETITION CONTROL
            ══════════════════════════════════ */}
            <div className="sec-label">🏆 Competition Control Panel</div>
            <div className="comp-panel-grid mb-section">
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Live & Upcoming Competitions</span>
                  <Link to="/admin/competitions" className="btn btn-ghost btn-xs">Manage All →</Link>
                </div>
                {competitionsList.map((c, i) => {
                  const pct = Math.round((c.participants / c.maxPart) * 100);
                  return (
                    <div key={i} className="comp-row">
                      <div className="row-icon" style={{ fontSize:20 }}>{c.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                          {c.status === 'live' && <div className="comp-live-dot" />}
                          <div className="row-title" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</div>
                          <span className={`status-badge ${c.status==='live'?'badge-flagged':'badge-review'}`} style={{ flexShrink:0 }}>{c.status}</span>
                        </div>
                        <div className="comp-prog"><div className="comp-prog-fill" style={{ width:`${pct}%` }} /></div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                          <span style={{ fontSize:10, color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>{c.participants.toLocaleString()} / {c.maxPart.toLocaleString()} participants</span>
                          <Countdown deadline={c.deadline} />
                        </div>
                      </div>
                      <div className="row-right">
                        <span style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color:'var(--gold-bright)' }}>{c.prize}</span>
                        <button className="btn btn-ghost btn-xs" onClick={() => navigate('/admin/competitions')}>Manage</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div className="panel" style={{ padding:'20px 22px' }}>
                  <div className="panel-title" style={{ marginBottom:16 }}>⚙️ Competition Controls</div>
                  {[
                    { label:'Override Result',   desc:'Manually set competition winner', btn:'Override', danger:true  },
                    { label:'Reset Leaderboard', desc:'Clear all scores for a competition', btn:'Reset', danger:true  },
                    { label:'Extend Deadline',   desc:'Push competition end date',        btn:'Extend', danger:false  },
                    { label:'Lock Submissions',  desc:'Freeze all entries immediately',   btn:'Lock',   danger:false  },
                    { label:'Export Results',    desc:'Download full participant data',   btn:'Export', danger:false  },
                  ].map((ctrl, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-1)' }}>{ctrl.label}</div>
                        <div style={{ fontSize:11, color:'var(--text-3)' }}>{ctrl.desc}</div>
                      </div>
                      <button className={`btn btn-xs ${ctrl.danger ? 'btn-danger' : 'btn-ghost'}`} onClick={() => navigate('/admin/competitions')}>{ctrl.btn}</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════
               6. USER MANAGEMENT
            ══════════════════════════════════ */}
            <div className="sec-label">👥 User Management</div>
            <div className="mb-section">
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Recently Registered Users</span>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-ghost btn-xs" onClick={() => navigate('/admin/users')}>Suspended ({suspendedUsersCount})</button>
                    <Link to="/admin/users" className="btn btn-ghost btn-xs">All Users →</Link>
                  </div>
                </div>
                <div className="user-search">
                  <div className="user-search-wrap">
                    <span className="user-search-icon">🔍</span>
                    <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name or email…" />
                  </div>
                </div>
                <div className="user-row-header">
                  <div />
                  <div className="col-label">User</div>
                  <div className="col-label">Role</div>
                  <div className="col-label">Status</div>
                  <div className="col-label">Actions</div>
                </div>
                {filteredUsers.map((u, i) => (
                  <div key={i} className="user-row">
                    <div className="row-avatar" style={{ background:`linear-gradient(135deg,${u.color},#1e1b4b)` }}>{u.initials}</div>
                    <div>
                      <div className="row-title">{u.name}</div>
                      <div className="row-sub">{u.email} · {u.joined}</div>
                    </div>
                    <span className="status-badge badge-review">{u.role}</span>
                    <span className={`status-badge badge-${u.status==='new'?'new':'active'}`}>{u.status}</span>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-ghost btn-xs" onClick={() => navigate('/admin/users')}>View</button>
                      <button className="btn btn-danger btn-xs" onClick={() => navigate('/admin/users')}>Suspend</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ══════════════════════════════════
               7. SYSTEM ALERTS
            ══════════════════════════════════ */}
            <div className="sec-label">🔔 System Alerts & Notifications</div>
            <div className="alerts-grid mb-section">
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Live Alerts</span>
                  <button className="btn btn-ghost btn-xs" onClick={() => navigate('/admin/dashboard')}>Clear All</button>
                </div>
                <div style={{ padding:'12px 16px' }}>
                  {alerts.slice(0, 4).map((a, i) => (
                    <div key={i} className={`alert-item alert-${a.type}`}>
                      <div className="alert-icon-wrap" style={{
                        background: a.type==='critical'?'rgba(225,29,72,0.1)':a.type==='warning'?'rgba(245,158,11,0.1)':a.type==='success'?'rgba(16,185,129,0.1)':'rgba(6,182,212,0.1)'
                      }}>
                        {a.icon}
                      </div>
                      <div>
                        <div className="alert-title">{a.title}</div>
                        <div className="alert-desc">{a.desc}</div>
                        <div className="alert-time">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {alerts.slice(4).map((a, i) => (
                  <div key={i} className={`alert-item alert-${a.type}`}>
                    <div className="alert-icon-wrap" style={{
                      background: a.type==='critical'?'rgba(225,29,72,0.1)':a.type==='warning'?'rgba(245,158,11,0.1)':a.type==='success'?'rgba(16,185,129,0.1)':'rgba(6,182,212,0.1)'
                    }}>
                      {a.icon}
                    </div>
                    <div>
                      <div className="alert-title">{a.title}</div>
                      <div className="alert-desc">{a.desc}</div>
                      <div className="alert-time">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ══════════════════════════════════
               8. CONTENT SNAPSHOT
            ══════════════════════════════════ */}
            <div className="sec-label">📦 Content Management Snapshot</div>
            <div className="content-grid mb-section">
              {[
                { title:'Latest Courses', key:'courses', link:'/admin/courses' },
                { title:'Updated Universities', key:'universities', link:'/admin/university-requests' },
                { title:'Popular Departments', key:'departments', link:'/admin/department-requests' },
              ].map((col, ci) => (
                <div key={ci} className="panel">
                  <div className="panel-header">
                    <span className="panel-title">{col.title}</span>
                    <Link to={col.link} className="btn btn-ghost btn-xs">View →</Link>
                  </div>
                  { (contentSnapshotObj[col.key] || []).map((item, i) => (
                    <div key={i} className="table-row">
                      <div className="row-icon">{item.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div className="row-title" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</div>
                        <div className="row-sub">{item.sub}</div>
                      </div>
                      <span className={`status-badge badge-${item.badge}`}>{item.badge}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* ══════════════════════════════════
               9. ANNOUNCEMENT COMPOSER
            ══════════════════════════════════ */}
            <div className="sec-label">📢 Broadcast & Announcements</div>
            <div className="data-grid-2 mb-section">
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Compose Broadcast</span>
                </div>
                {announceSent ? (
                  <div style={{ padding:'32px', textAlign:'center' }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:600, color:'#34d399', marginBottom:6 }}>Broadcast Sent!</div>
                    <div style={{ fontSize:13, color:'var(--text-3)' }}>Notification delivered to all target users.</div>
                  </div>
                ) : (
                  <form className="announce-form" onSubmit={handleSendAnnouncement}>
                    <select className="a-input a-select" value={announceType} onChange={e => setAnnounceType(e.target.value)}>
                      <option value="global">🌐 Global — All Users</option>
                      <option value="university">🏛️ University-Specific</option>
                      <option value="competition">🏆 Competition Announcement</option>
                      <option value="clan">⚔️ Clan Members</option>
                      <option value="instructors">👨‍🏫 Instructors Only</option>
                    </select>
                    <input className="a-input" placeholder="Announcement title…" value={announceTitle} onChange={e => setAnnounceTitle(e.target.value)} required />
                    <textarea className="a-input" placeholder="Write your announcement…" value={announceMsg} onChange={e => setAnnounceMsg(e.target.value)} rows={4} required />
                    <div className="a-row">
                      <button type="submit" className="btn btn-primary">📢 Send Broadcast</button>
                      <button type="button" className="btn btn-ghost" onClick={() => { setAnnounceTitle(''); setAnnounceMsg(''); }}>Clear</button>
                    </div>
                  </form>
                )}
              </div>

              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Recent Broadcasts</span>
                </div>
                {recentActivitiesList.slice(0, 6).map((b, i) => (
                  <div key={i} className="table-row">
                    <div style={{ fontSize:20, flexShrink:0 }}>📢</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="row-title" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b?.action || 'Platform Announcement'}</div>
                      <div className="row-sub">{b?.meta || b?.user || 'System update'}</div>
                    </div>
                    <div style={{ flexShrink:0, textAlign:'right' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#34d399', fontFamily:'var(--font-mono)' }}>{b?.time ? new Date(b.time).toLocaleDateString() : '—'}</div>
                      <div style={{ fontSize:10, color:'var(--text-3)' }}>activity</div>
                    </div>
                  </div>
                ))}
                {recentActivitiesList.length === 0 && (
                  <div style={{ padding:22, textAlign:'center', color:'var(--text-2)' }}>
                    No recent activity available.
                  </div>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════
               10. LOGS & MONITORING
            ══════════════════════════════════ */}
            <div className="sec-label">🖥️ Logs & System Monitoring</div>
            <div className="data-grid-2 mb-section" style={{ marginBottom:0 }}>
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">System Logs</span>
                  <div className="chart-tabs">
                    {['api','admin','db'].map(t => (
                      <button key={t} className={`chart-tab${activeLogTab===t?' active':''}`} onClick={() => setActiveLogTab(t)}>{t.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
                <div style={{ maxHeight:320, overflowY:'auto' }}>
                  {logsList.map((l, i) => (
                    <div key={i} className="log-row">
                      <span className={`log-level log-${l.level.toLowerCase()==='ok'?'ok':l.level.toLowerCase()==='error'?'error':l.level.toLowerCase()==='warn'?'warn':'info'}`}>{l.level}</span>
                      <span className="log-time">{l.time}</span>
                      <span className="log-msg">{l.msg}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div className="panel" style={{ padding:'20px 22px' }}>
                  <div className="panel-title" style={{ marginBottom:20 }}>🗄️ Database & Infrastructure Health</div>
                  <div className="db-health">
                    {dbMetricsList.map((m, i) => (
                      <div key={i} className="db-metric">
                        <div className="db-metric-val">{m.val}</div>
                        <div className="db-metric-label">{m.label}</div>
                        <div className="db-metric-bar">
                          <div className="db-metric-fill" style={{ width:m.fill, background:m.color, animationDelay:`${i*.1}s` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel" style={{ padding:'20px 22px' }}>
                  <div className="panel-title" style={{ marginBottom:16 }}>🔐 Login & Security Activity</div>
                  {[
                    { icon:'🟢', label:'Successful Logins Today', val: successfulLogins, color:'#34d399' },
                    { icon:'🔴', label:'Failed Login Attempts',   val: failedLogins,   color:'#fb7185' },
                    { icon:'🟡', label:'Suspicious Activity',     val: suspiciousActivity, color:'var(--gold-bright)' },
                    { icon:'🔵', label:'Active Sessions Now',     val: activeSessionsNow, color:'var(--cyan)' },
                  ].map((s, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ fontSize:14 }}>{s.icon}</span>
                        <span style={{ fontSize:13, color:'var(--text-2)' }}>{s.label}</span>
                      </div>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700, color:s.color }}>{s.val != null ? (typeof s.val === 'number' ? s.val.toLocaleString() : s.val) : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom padding */}
            <div style={{ height: 60 }} />

          </div>
        </div>
      </div>
    </>
  );
}