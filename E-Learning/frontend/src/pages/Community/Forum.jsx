import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { communityAPI } from '../../services/api';

// ═══════════════════════════════════════════════════════════
// NEXTUNIVERSE — ADMIN FORUM / ANNOUNCEMENT BOARD
// Section Type : AdminForum (restricted — admin post only)
// Regular users: react only · no post · no edit · no delete
// Cosmic Dark Premium · Pure CSS · No Chakra
// ═══════════════════════════════════════════════════════════

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --void:    #03030d;
  --deep:    #07071a;
  --surface: #0a0a20;
  --card:    #0d0d26;
  --elevated:#111130;

  --violet:       #7c3aed;
  --violet-dim:   rgba(124,58,237,0.12);
  --violet-border:rgba(124,58,237,0.25);
  --gold:         #d97706;
  --gold-bright:  #f59e0b;
  --gold-dim:     rgba(245,158,11,0.10);
  --gold-border:  rgba(245,158,11,0.25);
  --cyan:         #06b6d4;
  --rose:         #e11d48;
  --emerald:      #10b981;

  --border:    rgba(124,58,237,0.16);
  --border-dim:rgba(255,255,255,0.05);

  --text-1: #f0ecff;
  --text-2: #a09ec0;
  --text-3: #55527a;

  --font-display:'Playfair Display', Georgia, serif;
  --font-body:   'DM Sans', sans-serif;

  --r-sm:6px; --r-md:12px; --r-lg:18px; --r-xl:24px; --r-2xl:32px;
}

body { font-family:var(--font-body); background:var(--void); color:var(--text-1); -webkit-font-smoothing:antialiased; }
::selection { background:var(--violet); color:white; }
::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-track { background:var(--deep); }
::-webkit-scrollbar-thumb { background:var(--violet); border-radius:99px; }

/* ── ANIMATIONS ── */
@keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.45;transform:scale(1.5)} }
@keyframes shimmer  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes spin     { to{transform:rotate(360deg)} }
@keyframes pop      { 0%{transform:scale(1)} 40%{transform:scale(1.35)} 100%{transform:scale(1)} }
@keyframes slide-in { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
@keyframes glow-ring{ 0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,0)} 50%{box-shadow:0 0 0 6px rgba(124,58,237,0.12)} }

/* ── PAGE LAYOUT ── */
.forum-page {
  min-height:100vh;
  background:
    radial-gradient(ellipse 100% 55% at 50% -5%, rgba(79,46,229,0.14) 0%, transparent 55%),
    radial-gradient(ellipse 40% 30% at 95% 85%, rgba(217,119,6,0.06) 0%, transparent 50%),
    var(--void);
  position:relative;
}
.forum-container { max-width:900px; margin:0 auto; padding:0 24px; position:relative; z-index:1; }
@media(max-width:640px){ .forum-container{padding:0 14px;} }

/* ── PAGE HEADER ── */
.forum-header { padding:48px 0 32px; animation:fadeUp .7s ease both; }
.forum-back { display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--text-3);text-decoration:none;margin-bottom:20px;transition:color .2s; }
.forum-back:hover { color:var(--text-2); }

.forum-title-row { display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:20px; }

.forum-badge-admin {
  display:inline-flex;align-items:center;gap:8px;
  padding:6px 16px;border-radius:99px;
  background:rgba(217,119,6,0.1);border:1px solid rgba(217,119,6,0.3);
  font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:var(--gold-bright);margin-bottom:14px;
}
.admin-badge-dot { width:6px;height:6px;border-radius:50%;background:var(--gold-bright);animation:pulse 2s ease-in-out infinite; }

.forum-title {
  font-family:var(--font-display);font-size:clamp(26px,4vw,42px);
  font-weight:700;letter-spacing:-.025em;line-height:1.1;color:var(--text-1);
  margin-bottom:10px;
}
.forum-title .hl {
  background:linear-gradient(135deg,#fbbf24,#d97706);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.forum-subtitle { font-size:14px;color:var(--text-3);line-height:1.7;max-width:560px; }

/* ── RESTRICTION NOTICE (non-admin) ── */
.restriction-notice {
  display:flex;align-items:center;gap:14px;
  padding:16px 20px;border-radius:var(--r-lg);
  background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);
  margin-bottom:28px;animation:fadeUp .6s .1s ease both;
}
.restriction-icon { font-size:22px;flex-shrink:0; }
.restriction-text { font-size:13px;color:var(--text-2);line-height:1.6; }
.restriction-text strong { color:var(--gold-bright); }

/* ── FILTER + SORT BAR ── */
.forum-controls {
  display:flex;align-items:center;justify-content:space-between;
  gap:14px;margin-bottom:28px;flex-wrap:wrap;
  animation:fadeUp .6s .15s ease both;
}
.forum-filters { display:flex;gap:6px;flex-wrap:wrap; }
.filter-chip {
  padding:7px 16px;border-radius:99px;font-size:12px;font-weight:600;
  font-family:var(--font-body);cursor:pointer;
  border:1px solid var(--border-dim);background:transparent;color:var(--text-3);
  transition:all .2s;
}
.filter-chip.active,.filter-chip:hover { border-color:var(--gold-border);background:var(--gold-dim);color:var(--gold-bright); }
.filter-chip.all.active { border-color:var(--violet-border);background:var(--violet-dim);color:#c4b5fd; }

.forum-sort { display:flex;align-items:center;gap:8px; }
.sort-label { font-size:12px;color:var(--text-3); }
.sort-select {
  padding:6px 12px;border-radius:var(--r-md);font-size:12px;font-weight:500;
  background:rgba(255,255,255,.03);border:1px solid var(--border-dim);
  color:var(--text-2);font-family:var(--font-body);outline:none;cursor:pointer;
  transition:all .2s;
}
.sort-select:focus { border-color:var(--border); }

/* ── CREATE POST BUTTON (admin only) ── */
.create-post-btn {
  display:inline-flex;align-items:center;gap:8px;
  padding:11px 22px;border-radius:var(--r-lg);
  background:linear-gradient(135deg,#92400e,#d97706);
  color:white;font-family:var(--font-body);font-size:13px;font-weight:700;
  cursor:pointer;border:none;transition:all .25s;
  box-shadow:0 4px 18px rgba(217,119,6,0.3);
}
.create-post-btn:hover { transform:translateY(-2px);box-shadow:0 8px 28px rgba(217,119,6,0.5); }
.create-post-btn:active { transform:translateY(0); }

/* ── POST COMPOSER (admin modal) ── */
.composer-overlay {
  position:fixed;inset:0;z-index:200;
  background:rgba(3,3,13,0.85);backdrop-filter:blur(16px);
  display:flex;align-items:center;justify-content:center;padding:20px;
}
.composer-modal {
  width:100%;max-width:640px;
  background:var(--card);border:1px solid var(--gold-border);
  border-radius:var(--r-2xl);overflow:hidden;
  box-shadow:0 40px 100px rgba(0,0,0,.7),0 0 60px rgba(217,119,6,0.1);
  animation:fadeUp .3s ease both;
}
.composer-header {
  padding:22px 28px;border-bottom:1px solid var(--border-dim);
  display:flex;align-items:center;justify-content:space-between;
  background:linear-gradient(135deg,rgba(146,64,14,0.1),rgba(217,119,6,0.05));
}
.composer-title { font-family:var(--font-display);font-size:18px;font-weight:600;color:var(--text-1); }
.composer-close { width:32px;height:32px;border-radius:var(--r-md);background:rgba(255,255,255,.05);border:1px solid var(--border-dim);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;color:var(--text-3);transition:all .2s; }
.composer-close:hover { background:rgba(225,29,72,.1);border-color:rgba(225,29,72,.3);color:#fb7185; }

.composer-body { padding:24px 28px;display:flex;flex-direction:column;gap:14px; }
.c-label { font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--text-3);margin-bottom:5px; }
.c-input {
  width:100%;padding:11px 14px;
  background:rgba(255,255,255,.03);border:1px solid var(--border-dim);
  border-radius:var(--r-md);color:var(--text-1);
  font-family:var(--font-body);font-size:14px;outline:none;transition:all .2s;
}
.c-input:focus { border-color:var(--gold-border);background:rgba(217,119,6,0.04); }
.c-input::placeholder { color:var(--text-3); }
textarea.c-input { resize:none;min-height:130px;line-height:1.7; }
.c-select { appearance:none;-webkit-appearance:none;cursor:pointer; }
.c-tags-hint { font-size:11px;color:var(--text-3); }

.composer-type-row { display:flex;gap:8px;flex-wrap:wrap; }
.type-chip {
  padding:7px 16px;border-radius:99px;font-size:12px;font-weight:600;
  font-family:var(--font-body);cursor:pointer;border:1px solid var(--border-dim);
  background:transparent;color:var(--text-3);transition:all .2s;
}
.type-chip.active { background:var(--gold-dim);border-color:var(--gold-border);color:var(--gold-bright); }

.composer-footer { padding:18px 28px;border-top:1px solid var(--border-dim);display:flex;gap:10px;justify-content:flex-end; }
.btn-cancel { padding:9px 20px;border-radius:var(--r-md);background:transparent;border:1px solid var(--border-dim);color:var(--text-2);font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s; }
.btn-cancel:hover { border-color:var(--border);color:var(--text-1); }
.btn-publish { padding:9px 24px;border-radius:var(--r-md);background:linear-gradient(135deg,#92400e,#d97706);color:white;font-family:var(--font-body);font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .2s;box-shadow:0 3px 14px rgba(217,119,6,0.3); }
.btn-publish:hover { box-shadow:0 6px 22px rgba(217,119,6,0.5);transform:translateY(-1px); }
.btn-publish:disabled { opacity:.5;cursor:not-allowed;transform:none; }

/* ── ANNOUNCEMENT CARDS ── */
.posts-list { display:flex;flex-direction:column;gap:16px; }

.post-card {
  background:var(--card);border:1px solid var(--border);
  border-radius:var(--r-xl);overflow:hidden;
  transition:all .3s cubic-bezier(.4,0,.2,1);
  animation:fadeUp .6s ease both;
  position:relative;
}
.post-card:hover { border-color:rgba(245,158,11,0.3);box-shadow:0 16px 50px rgba(0,0,0,.4),0 0 24px rgba(217,119,6,0.06); transform:translateY(-3px); }
.post-card::before { content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--pc, var(--gold-bright)),transparent);opacity:0;transition:opacity .3s; }
.post-card:hover::before { opacity:1; }

/* Pinned top glow */
.post-card.pinned { border-color:rgba(245,158,11,0.3);background:linear-gradient(180deg,rgba(245,158,11,0.04),var(--card)); }
.post-card.pinned::before { opacity:1; }

.post-header { padding:22px 24px 0; }
.post-meta-row { display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap; }

.post-type-badge {
  display:inline-flex;align-items:center;gap:6px;
  padding:4px 12px;border-radius:99px;font-size:10px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;
}
.type-announcement { background:rgba(245,158,11,0.12);color:var(--gold-bright);border:1px solid rgba(245,158,11,0.28); }
.type-update       { background:rgba(124,58,237,0.12);color:#a78bfa;border:1px solid rgba(124,58,237,0.28); }
.type-event        { background:rgba(6,182,212,0.12);color:var(--cyan);border:1px solid rgba(6,182,212,0.28); }
.type-competition  { background:rgba(225,29,72,0.12);color:#fb7185;border:1px solid rgba(225,29,72,0.28); }
.type-general      { background:rgba(255,255,255,0.05);color:var(--text-3);border:1px solid var(--border-dim); }

.pin-badge { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;background:rgba(245,158,11,0.1);color:var(--gold-bright);border:1px solid rgba(245,158,11,0.25); }

.post-date { font-size:11px;color:var(--text-3);font-family:'DM Mono',monospace;margin-left:auto; }

.post-title {
  font-family:var(--font-display);font-size:20px;font-weight:700;
  color:var(--text-1);line-height:1.3;letter-spacing:-.015em;
  margin-bottom:10px;cursor:pointer;transition:color .2s;
}
.post-title:hover { color:#fbbf24; }

.post-body { padding:0 24px 18px; }
.post-excerpt { font-size:14px;color:var(--text-2);line-height:1.8;margin-bottom:16px; }
.post-read-more { font-size:13px;color:#a78bfa;cursor:pointer;font-weight:600;transition:color .2s;background:none;border:none;padding:0;font-family:var(--font-body); }
.post-read-more:hover { color:#c4b5fd; }

/* Image */
.post-image { width:100%;max-height:280px;object-fit:cover;border-radius:var(--r-lg);margin-bottom:16px;border:1px solid var(--border-dim); }

/* Tags */
.post-tags { display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px; }
.post-tag  { padding:3px 10px;border-radius:99px;font-size:11px;font-weight:500;background:rgba(255,255,255,.04);border:1px solid var(--border-dim);color:var(--text-3); }

/* Footer */
.post-footer {
  padding:14px 24px;border-top:1px solid rgba(255,255,255,.04);
  display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;
}
.post-author { display:flex;align-items:center;gap:10px; }
.author-avatar {
  width:32px;height:32px;border-radius:10px;
  background:linear-gradient(135deg,#92400e,#d97706);
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;color:white;font-family:var(--font-body);
  flex-shrink:0;
}
.author-name  { font-size:12px;font-weight:600;color:var(--text-2); }
.author-role  { font-size:10px;color:var(--text-3);display:flex;align-items:center;gap:4px; }
.admin-crown  { font-size:10px; }

/* Reactions */
.post-reactions { display:flex;align-items:center;gap:6px; }
.reaction-btn {
  display:inline-flex;align-items:center;gap:5px;
  padding:6px 12px;border-radius:99px;
  background:rgba(255,255,255,.03);border:1px solid var(--border-dim);
  font-family:var(--font-body);font-size:12px;font-weight:600;
  color:var(--text-3);cursor:pointer;transition:all .2s;
}
.reaction-btn:hover { background:rgba(124,58,237,.1);border-color:var(--violet-border);color:#c4b5fd; }
.reaction-btn.reacted { background:rgba(124,58,237,.15);border-color:var(--violet-border);color:#c4b5fd; }
.reaction-btn.reacted .reaction-icon { animation:pop .35s ease; }
.reaction-count { font-size:11px;font-family:'DM Mono',monospace; }

.views-count { font-size:11px;color:var(--text-3);display:flex;align-items:center;gap:4px; }

/* Admin post controls */
.post-admin-controls { display:flex;gap:6px; }
.ctrl-btn {
  padding:5px 11px;border-radius:var(--r-md);font-size:11px;font-weight:600;
  font-family:var(--font-body);cursor:pointer;border:1px solid;transition:all .2s;
}
.ctrl-edit   { background:rgba(124,58,237,.08);border-color:rgba(124,58,237,.25);color:#a78bfa; }
.ctrl-edit:hover   { background:rgba(124,58,237,.18); }
.ctrl-pin    { background:rgba(245,158,11,.08);border-color:rgba(245,158,11,.25);color:var(--gold-bright); }
.ctrl-pin:hover    { background:rgba(245,158,11,.18); }
.ctrl-delete { background:rgba(225,29,72,.08);border-color:rgba(225,29,72,.25);color:#fb7185; }
.ctrl-delete:hover { background:rgba(225,29,72,.18); }

/* ── EXPANDED POST MODAL ── */
.post-modal-overlay {
  position:fixed;inset:0;z-index:300;
  background:rgba(3,3,13,0.9);backdrop-filter:blur(20px);
  display:flex;align-items:center;justify-content:center;padding:20px;
  animation:fadeUp .2s ease both;
}
.post-modal {
  width:100%;max-width:760px;max-height:90vh;overflow-y:auto;
  background:var(--card);border:1px solid var(--gold-border);
  border-radius:var(--r-2xl);
  box-shadow:0 48px 120px rgba(0,0,0,.8),0 0 60px rgba(217,119,6,0.1);
  animation:fadeUp .3s ease both;
}
.modal-header { padding:24px 28px;border-bottom:1px solid var(--border-dim);display:flex;align-items:center;justify-content:space-between; }
.modal-body   { padding:28px; }
.modal-content { font-size:15px;color:var(--text-2);line-height:1.85;white-space:pre-wrap; }

/* ── EMPTY STATE ── */
.forum-empty {
  text-align:center;padding:80px 24px;
  background:var(--card);border:1px solid var(--border);border-radius:var(--r-xl);
}
.forum-empty-icon { font-size:52px;margin-bottom:16px; }
.forum-empty-title { font-family:var(--font-display);font-size:20px;font-weight:600;color:var(--text-1);margin-bottom:8px; }
.forum-empty-sub   { font-size:14px;color:var(--text-3);line-height:1.7; }

/* ── SKELETON ── */
.skeleton { background:linear-gradient(90deg,var(--elevated) 25%,var(--surface) 50%,var(--elevated) 75%);background-size:200%;animation:shimmer 1.5s ease-in-out infinite;border-radius:var(--r-md); }

/* ── PINNED SECTION DIVIDER ── */
.section-divider { display:flex;align-items:center;gap:12px;margin:8px 0 16px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--text-3); }
.section-divider::before,.section-divider::after { content:'';flex:1;height:1px;background:var(--border-dim); }

/* ── CONFIRM DELETE ── */
.confirm-overlay { position:fixed;inset:0;z-index:400;background:rgba(3,3,13,0.9);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:20px; }
.confirm-box { width:100%;max-width:400px;background:var(--card);border:1px solid rgba(225,29,72,0.3);border-radius:var(--r-xl);padding:32px;text-align:center;animation:fadeUp .25s ease both; }
.confirm-icon  { font-size:40px;margin-bottom:14px; }
.confirm-title { font-family:var(--font-display);font-size:18px;font-weight:600;color:var(--text-1);margin-bottom:8px; }
.confirm-sub   { font-size:13px;color:var(--text-3);margin-bottom:24px;line-height:1.6; }
.confirm-btns  { display:flex;gap:10px;justify-content:center; }
.btn-confirm-delete { padding:10px 24px;border-radius:var(--r-md);background:var(--rose);color:white;font-family:var(--font-body);font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .2s; }
.btn-confirm-delete:hover { background:#be123c;transform:translateY(-1px); }
.btn-confirm-cancel { padding:10px 20px;border-radius:var(--r-md);background:transparent;color:var(--text-2);border:1px solid var(--border-dim);font-family:var(--font-body);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s; }
.btn-confirm-cancel:hover { border-color:var(--border);color:var(--text-1); }

/* ── TOAST ── */
.toast {
  position:fixed;bottom:28px;right:28px;z-index:500;
  padding:14px 20px;border-radius:var(--r-lg);
  background:var(--elevated);border:1px solid var(--border);
  box-shadow:0 16px 40px rgba(0,0,0,.5);
  display:flex;align-items:center;gap:10px;
  font-size:13px;font-weight:600;color:var(--text-1);
  animation:fadeUp .3s ease both;
  max-width:320px;
}
.toast.success { border-color:rgba(16,185,129,.35);background:rgba(16,185,129,.08); }
.toast.error   { border-color:rgba(225,29,72,.35);background:rgba(225,29,72,.08); }

@media(max-width:640px) {
  .forum-title-row { flex-direction:column; }
  .post-footer { flex-direction:column;align-items:flex-start; }
  .post-reactions { flex-wrap:wrap; }
}
`;

// ══════════════════════════════════════
// AUTH HELPER — reads user from storage
// ══════════════════════════════════════
function useCurrentUser() {
  try {
    const raw = localStorage.getItem('user');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
function isAdmin(user) {
  if (!user) return false;
  const role = String(user.role || user.userType || user.Role || '').toLowerCase();
  return Boolean(user.isAdmin || user.IsAdmin || role === 'admin' || role === 'superadmin');
}

// ══════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════
const SECTION_TYPE = 'AdminForum';

const POST_TYPES = [
  { key:'announcement', label:'📢 Announcement' },
  { key:'update',       label:'⚡ Platform Update' },
  { key:'event',        label:'🗓️ Event' },
  { key:'competition',  label:'🏆 Competition' },
  { key:'general',      label:'📌 General' },
];

const REACTIONS = [
  { emoji:'👍', key:'like'    },
  { emoji:'🔥', key:'fire'    },
  { emoji:'🎉', key:'celebrate'},
  { emoji:'💡', key:'insightful'},
];

const TYPE_CLASS = {
  announcement:'type-announcement', update:'type-update',
  event:'type-event', competition:'type-competition', general:'type-general',
};

function normalizeForumPost(rawPost) {
  const id = rawPost?.id ?? rawPost?.Id;
  const createdAt = rawPost?.createdAt ?? rawPost?.CreatedAt ?? new Date().toISOString();
  const content = rawPost?.content ?? rawPost?.Content ?? '';
  const title = rawPost?.title ?? rawPost?.Title ?? 'Untitled';
  const uiType = POST_TYPES.some(t => t.key === rawPost?.type)
    ? rawPost.type
    : 'announcement';

  const userName =
    rawPost?.author?.name ||
    rawPost?.userName ||
    rawPost?.UserName ||
    'Admin';

  const initials = (userName || 'AD')
    .split(' ')
    .filter(Boolean)
    .map(s => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  return {
    ...rawPost,
    id,
    type: uiType,
    title,
    content,
    mediaUrl: rawPost?.mediaUrl ?? rawPost?.MediaUrl ?? '',
    excerpt: rawPost?.excerpt ?? content.slice(0, 180),
    tags: Array.isArray(rawPost?.tags) ? rawPost.tags : [],
    pinned: Boolean(rawPost?.pinned ?? rawPost?.isPinned ?? rawPost?.IsPinned),
    views: rawPost?.views ?? rawPost?.viewCount ?? rawPost?.ViewCount ?? 0,
    createdAt,
    reactions: rawPost?.reactions || {
      like: rawPost?.upvoteCount ?? rawPost?.UpvoteCount ?? 0,
      fire: 0,
      celebrate: 0,
      insightful: 0,
    },
    userReactions: rawPost?.userReactions || {},
    author: {
      name: userName,
      initials,
    },
  };
}

// ══════════════════════════════════════
// TOAST COMPONENT
// ══════════════════════════════════════
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast ${type}`}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      <span>{msg}</span>
    </div>
  );
}

// ══════════════════════════════════════
// REACTION BUTTON
// ══════════════════════════════════════
function ReactionBtn({ emoji, reactionKey, count, reacted, onReact }) {
  return (
    <button className={`reaction-btn${reacted ? ' reacted' : ''}`} onClick={() => onReact(reactionKey)}>
      <span className="reaction-icon">{emoji}</span>
      <span className="reaction-count">{count}</span>
    </button>
  );
}

// ══════════════════════════════════════
// POST CARD
// ══════════════════════════════════════
function PostCard({ post, currentUser, admin, onReact, onEdit, onDelete, onPin, onExpand, animDelay }) {
  const [expanded, setExpanded] = useState(false);
  const userReactions = post.userReactions || {};

  const typeLabel = POST_TYPES.find(t => t.key === post.type)?.label || '📌 General';
  const dateStr   = new Date(post.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });

  const handleExpand = () => { setExpanded(true); if (onExpand) onExpand(post); };

  return (
    <div
      className={`post-card${post.pinned ? ' pinned' : ''}`}
      style={{ '--pc': post.type === 'competition' ? '#fb7185' : post.type === 'event' ? 'var(--cyan)' : post.type === 'update' ? '#a78bfa' : 'var(--gold-bright)', animationDelay:`${animDelay}s` }}
    >
      {/* Header */}
      <div className="post-header">
        <div className="post-meta-row">
          <span className={`post-type-badge ${TYPE_CLASS[post.type] || 'type-general'}`}>
            {typeLabel}
          </span>
          {post.pinned && <span className="pin-badge">📌 Pinned</span>}
          <span className="post-date">{dateStr}</span>
        </div>

        <div className="post-title" onClick={handleExpand}>{post.title}</div>
      </div>

      {/* Body */}
      <div className="post-body">
        <p className="post-excerpt">{post.excerpt}</p>
        {post.mediaUrl && <img src={post.mediaUrl} alt={post.title} className="post-image" />}
        <button className="post-read-more" onClick={handleExpand}>Read full announcement →</button>

        {post.tags?.length > 0 && (
          <div className="post-tags" style={{ marginTop:12 }}>
            {post.tags.map(t => <span key={t} className="post-tag">#{t}</span>)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="post-footer">
        {/* Author */}
        <div className="post-author">
          <div className="author-avatar">{post.author?.initials || 'AD'}</div>
          <div>
            <div className="author-name">{post.author?.name || 'Admin'}</div>
            <div className="author-role"><span className="admin-crown">👑</span> Administrator</div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          {/* Views */}
          <span className="views-count">👁 {post.views?.toLocaleString()}</span>

          {/* Reactions (all users can react) */}
          <div className="post-reactions">
            {REACTIONS.map(r => (
              <ReactionBtn
                key={r.key}
                emoji={r.emoji}
                reactionKey={r.key}
                count={post.reactions?.[r.key] || 0}
                reacted={!!userReactions[r.key]}
                onReact={(k) => onReact(post.id, k)}
              />
            ))}
          </div>

          {/* Admin controls */}
          {admin && (
            <div className="post-admin-controls">
              <button className="ctrl-btn ctrl-edit"   onClick={() => onEdit(post)}>✏️ Edit</button>
              <button className="ctrl-btn ctrl-pin"    onClick={() => onPin(post.id)}>{post.pinned ? '📌 Unpin' : '📌 Pin'}</button>
              <button className="ctrl-btn ctrl-delete" onClick={() => onDelete(post.id)}>🗑 Delete</button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded modal */}
      {expanded && (
        <div className="post-modal-overlay" onClick={() => setExpanded(false)}>
          <div className="post-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
                  <span className={`post-type-badge ${TYPE_CLASS[post.type]}`}>{typeLabel}</span>
                  {post.pinned && <span className="pin-badge">📌 Pinned</span>}
                </div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--text-1)', lineHeight:1.3 }}>{post.title}</div>
                <div style={{ fontSize:12, color:'var(--text-3)', marginTop:6 }}>Posted by {post.author?.name} · {dateStr}</div>
              </div>
              <button className="composer-close" onClick={() => setExpanded(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-content">{post.content}</div>
              {post.mediaUrl && <img src={post.mediaUrl} alt={post.title} className="post-image" style={{ marginTop:20 }} />}
              {post.tags?.length > 0 && (
                <div className="post-tags" style={{ marginTop:20 }}>
                  {post.tags.map(t => <span key={t} className="post-tag">#{t}</span>)}
                </div>
              )}
              <div style={{ marginTop:20, display:'flex', gap:8, flexWrap:'wrap' }}>
                {REACTIONS.map(r => (
                  <ReactionBtn
                    key={r.key}
                    emoji={r.emoji}
                    reactionKey={r.key}
                    count={post.reactions?.[r.key] || 0}
                    reacted={!!userReactions[r.key]}
                    onReact={(k) => { onReact(post.id, k); }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// COMPOSER MODAL (admin only)
// ══════════════════════════════════════
function ComposerModal({ editPost, onClose, onSave }) {
  const [type,    setType]    = useState(editPost?.type    || 'announcement');
  const [title,   setTitle]   = useState(editPost?.title   || '');
  const [excerpt, setExcerpt] = useState(editPost?.excerpt || '');
  const [content, setContent] = useState(editPost?.content || '');
  const [mediaUrl] = useState(editPost?.mediaUrl || '');
  const [mediaFile, setMediaFile] = useState(null);
  const [tags,    setTags]    = useState(editPost?.tags?.join(', ') || '');
  const [pinned,  setPinned]  = useState(editPost?.pinned  || false);
  const [saving,  setSaving]  = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const isEdit = !!editPost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);

    let finalMediaUrl = mediaUrl?.trim() || '';
    if (mediaFile) {
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append('file', mediaFile);
        const uploadResponse = await api.post('/uploads/community-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalMediaUrl = uploadResponse?.data?.url || '';
      } catch {
        setUploadingImage(false);
        setSaving(false);
        return;
      }
      setUploadingImage(false);
    }

    const payload = {
      sectionType: SECTION_TYPE,
      postType: 'admin_forum',
      type,
      title: title.trim(),
      excerpt: excerpt.trim() || content.trim().slice(0, 180) + '…',
      content: content.trim(),
      mediaUrl: finalMediaUrl || undefined,
      mediaType: finalMediaUrl ? 'Image' : undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      pinned,
    };
    try {
      if (isEdit) {
        await api.put(`/community/posts/${editPost.id}`, payload);
      } else {
        await communityAPI.createForumPost(payload);
      }
    } catch {}
    onSave(payload, editPost?.id);
    setSaving(false);
  };

  return (
    <div className="composer-overlay" onClick={onClose}>
      <div className="composer-modal" onClick={e => e.stopPropagation()}>
        <div className="composer-header">
          <span className="composer-title">{isEdit ? '✏️ Edit Announcement' : '📢 New Announcement'}</span>
          <button className="composer-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="composer-body">
            {/* Type */}
            <div>
              <div className="c-label">Post Type</div>
              <div className="composer-type-row">
                {POST_TYPES.map(t => (
                  <button key={t.key} type="button"
                    className={`type-chip${type === t.key ? ' active' : ''}`}
                    onClick={() => setType(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <div className="c-label">Title *</div>
              <input className="c-input" placeholder="Announcement title…" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            {/* Excerpt */}
            <div>
              <div className="c-label">Short Preview (optional)</div>
              <input className="c-input" placeholder="Brief summary shown on card…" value={excerpt} onChange={e => setExcerpt(e.target.value)} />
            </div>

            {/* Content */}
            <div>
              <div className="c-label">Full Content *</div>
              <textarea className="c-input" placeholder="Write the full announcement…" value={content} onChange={e => setContent(e.target.value)} rows={6} required />
            </div>

            {/* Image */}
            <div>
              <div className="c-label">Photo (optional)</div>
              <input
                className="c-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;
                  setMediaFile(selectedFile);
                }}
              />
              <div className="c-tags-hint" style={{ marginTop:5 }}>PNG/JPG/WEBP · max 5MB</div>
              {mediaUrl && !mediaFile && <img src={mediaUrl} alt="Forum post" className="post-image" style={{ marginTop:10 }} />}
              {mediaFile && <img src={URL.createObjectURL(mediaFile)} alt="Preview" className="post-image" style={{ marginTop:10 }} />}
            </div>

            {/* Tags */}
            <div>
              <div className="c-label">Tags</div>
              <input className="c-input" placeholder="maintenance, competition, update…" value={tags} onChange={e => setTags(e.target.value)} />
              <div className="c-tags-hint" style={{ marginTop:5 }}>Separate tags with commas</div>
            </div>

            {/* Pin toggle */}
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button type="button"
                style={{ width:40, height:22, borderRadius:99, background: pinned ? 'linear-gradient(135deg,#92400e,#d97706)' : 'rgba(255,255,255,.06)', border: pinned ? 'none' : '1px solid var(--border-dim)', cursor:'pointer', position:'relative', transition:'all .2s', flexShrink:0 }}
                onClick={() => setPinned(p => !p)}>
                <span style={{ position:'absolute', top:3, left: pinned ? 20 : 3, width:16, height:16, borderRadius:'50%', background:'white', transition:'all .2s', boxShadow:'0 1px 4px rgba(0,0,0,.3)' }} />
              </button>
              <span style={{ fontSize:13, color:'var(--text-2)' }}>📌 Pin this announcement to top</span>
            </div>
          </div>

          <div className="composer-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-publish" disabled={saving}>
              {saving ? (uploadingImage ? '⏳ Uploading image…' : '⏳ Saving…') : isEdit ? '✅ Update Post' : '📢 Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════
export default function AdminForum() {
  const currentUser  = useCurrentUser();
  const admin        = isAdmin(currentUser);

  const PAGE_SIZE = 10;
  const [posts,        setPosts]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [sort,         setSort]         = useState('newest');
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalCount,   setTotalCount]   = useState(0);
  const [composer,     setComposer]     = useState(false);
  const [editPost,     setEditPost]     = useState(null);
  const [deleteId,     setDeleteId]     = useState(null);
  const [toast,        setToast]        = useState(null);

  // Load posts
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    communityAPI.getForumPosts({ page, pageSize: PAGE_SIZE })
      .then(res => {
        if (!mounted) return;
        const payload = res?.data?.data ?? res?.data ?? {};
        const raw = payload?.posts || payload?.data || payload || [];
        const mapped = Array.isArray(raw) ? raw.map(normalizeForumPost) : [];
        setPosts(mapped);
        setTotalPages(Number(payload?.totalPages) > 0 ? Number(payload.totalPages) : 1);
        setTotalCount(Number(payload?.totalCount) || mapped.length);
      })
      .catch(() => { if (mounted) setPosts([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [page]);

  // Filter + sort (applies on current page data)
  const displayPosts = posts
    .filter(p => filter === 'all' || p.type === filter)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'popular') return (b.views || 0) - (a.views || 0);
      return 0;
    });

  const pinnedPosts  = displayPosts.filter(p => p.pinned);
  const regularPosts = displayPosts.filter(p => !p.pinned);

  // Reactions (optimistic)
  const handleReact = (postId, reactionKey) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const userReactions = { ...(p.userReactions || {}) };
      const reacted = !!userReactions[reactionKey];
      userReactions[reactionKey] = !reacted;
      const reactions = { ...p.reactions };
      reactions[reactionKey] = (reactions[reactionKey] || 0) + (reacted ? -1 : 1);
      api.post(`/community/posts/${postId}/react`, { reaction: reactionKey }).catch(() => {});
      return { ...p, reactions, userReactions };
    }));
  };

  // Save (create / edit)
  const handleSave = (payload, editId) => {
    if (editId) {
      setPosts(prev => prev.map(p => p.id === editId ? { ...p, ...payload } : p));
      showToast('Announcement updated successfully!', 'success');
    } else {
      const newPost = { ...payload, id: `p${Date.now()}`, reactions:{ like:0, fire:0, celebrate:0, insightful:0 }, views:0, createdAt: new Date().toISOString(), author:{ name: currentUser?.name || 'Admin', initials:(currentUser?.name||'AD').slice(0,2).toUpperCase() } };
      setPosts(prev => [newPost, ...prev]);
      showToast('Announcement published!', 'success');
    }
    setComposer(false);
    setEditPost(null);
  };

  // Delete
  const confirmDelete = () => {
    api.delete(`/community/posts/${deleteId}`).catch(() => {});
    setPosts(prev => prev.filter(p => p.id !== deleteId));
    setDeleteId(null);
    showToast('Post deleted.', 'success');
  };

  // Pin toggle
  const handlePin = (postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, pinned: !p.pinned } : p));
    api.put(`/community/posts/${postId}/pin`).catch(() => {});
  };

  // Toast helper
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="forum-page">
        <div className="forum-container">

          {/* ── HEADER ── */}
          <div className="forum-header">
            <Link to="/community" className="forum-back">← Back to Community</Link>

            <div className="forum-title-row">
              <div>
                <div className="forum-badge-admin"><div className="admin-badge-dot" />Admin Announcement Zone</div>
                <h1 className="forum-title">
                  Official <span className="hl">Forum</span>
                </h1>
                <p className="forum-subtitle">
                  Authoritative announcements, platform updates, competition news, and events — posted exclusively by the NextUniVerse administration team.
                </p>
              </div>

              {/* Create button — ADMIN ONLY */}
              {admin && (
                <button className="create-post-btn" onClick={() => { setEditPost(null); setComposer(true); }}>
                  ＋ New Announcement
                </button>
              )}
            </div>

            {/* Restriction notice — non-admin */}
            {!admin && (
              <div className="restriction-notice">
                <div className="restriction-icon">🔒</div>
                <div className="restriction-text">
                  <strong>Only administrators can post in this section.</strong>
                  {' '}You can read all announcements and react to posts — but creating, editing, or deleting is restricted to the admin team.
                </div>
              </div>
            )}
          </div>

          {/* ── CONTROLS ── */}
          <div className="forum-controls">
            <div className="forum-filters">
              <button className={`filter-chip all${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>All</button>
              {POST_TYPES.map(t => (
                <button key={t.key} className={`filter-chip${filter === t.key ? ' active' : ''}`} onClick={() => setFilter(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="forum-sort">
              <span className="sort-label">Sort:</span>
              <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Viewed</option>
              </select>
            </div>
          </div>

          {/* ── POSTS ── */}
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:24 }}>
                  <div className="skeleton" style={{ height:14, width:'30%', marginBottom:16 }} />
                  <div className="skeleton" style={{ height:22, width:'75%', marginBottom:12 }} />
                  <div className="skeleton" style={{ height:14, width:'90%', marginBottom:8 }} />
                  <div className="skeleton" style={{ height:14, width:'70%' }} />
                </div>
              ))}
            </div>
          ) : displayPosts.length === 0 ? (
            <div className="forum-empty">
              <div className="forum-empty-icon">📋</div>
              <div className="forum-empty-title">No announcements yet</div>
              <div className="forum-empty-sub">
                {admin
                  ? 'Create the first announcement using the button above.'
                  : 'Check back soon — the admin team will post updates here.'}
              </div>
            </div>
          ) : (
            <div className="posts-list">
              {/* Pinned */}
              {pinnedPosts.length > 0 && (
                <>
                  <div className="section-divider">📌 Pinned Announcements</div>
                  {pinnedPosts.map((p, i) => (
                    <PostCard key={p.id} post={p} currentUser={currentUser} admin={admin}
                      onReact={handleReact} onEdit={post => { setEditPost(post); setComposer(true); }}
                      onDelete={setDeleteId} onPin={handlePin} animDelay={i * 0.07} />
                  ))}
                  {regularPosts.length > 0 && <div className="section-divider">📋 All Announcements</div>}
                </>
              )}

              {/* Regular */}
              {regularPosts.map((p, i) => (
                <PostCard key={p.id} post={p} currentUser={currentUser} admin={admin}
                  onReact={handleReact} onEdit={post => { setEditPost(post); setComposer(true); }}
                  onDelete={setDeleteId} onPin={handlePin} animDelay={(pinnedPosts.length + i) * 0.07} />
              ))}
            </div>
          )}

          {/* ── PAGINATION ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--border-dim)'
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Page {page} of {totalPages} · Total posts: {totalCount}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-cancel"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || loading}
              >
                ← Previous
              </button>
              <button
                className="btn-publish"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages || loading}
              >
                Next →
              </button>
            </div>
          </div>

          <div style={{ height:72 }} />
        </div>
      </div>

      {/* ── COMPOSER MODAL (admin only) ── */}
      {composer && admin && (
        <ComposerModal
          editPost={editPost}
          onClose={() => { setComposer(false); setEditPost(null); }}
          onSave={handleSave}
        />
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId && (
        <div className="confirm-overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div>
            <div className="confirm-title">Delete Announcement?</div>
            <div className="confirm-sub">This action cannot be undone. The post will be permanently removed from the Forum.</div>
            <div className="confirm-btns">
              <button className="btn-confirm-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-confirm-delete" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}