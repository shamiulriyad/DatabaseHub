import React, { useEffect, useMemo, useState } from 'react';
import {
  Icon,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { FaUsers, FaTrophy, FaFire, FaClock, FaArrowLeft, FaLock, FaChartBar, FaListUl } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import competitionApi from '../../services/api';
import { competitionService } from '../../services/competitionService';
import CosmicBg from '../../components/CosmicBg';

/* ─────────────────────────────────────────
   COSMIC DARK PREMIUM — Style Injection
───────────────────────────────────────── */
const CosmicStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --void:          #05050f;
      --deep:          #0a0a1a;
      --surface:       #0f0f23;
      --card:          #11112a;
      --card-alt:      #0d0d20;
      --border:        rgba(139,92,246,0.15);
      --border-glow:   rgba(139,92,246,0.4);
      --accent:        #7c3aed;
      --accent-bright: #a855f7;
      --accent-glow:   rgba(168,85,247,0.2);
      --gold:          #f59e0b;
      --gold-dim:      rgba(245,158,11,0.15);
      --cyan:          #06b6d4;
      --green:         #10b981;
      --red:           #ef4444;
      --text-primary:  #f1f0ff;
      --text-secondary:#9b99b8;
      --text-muted:    #5a5880;
    }

    .cd-page * { box-sizing: border-box; margin: 0; padding: 0; }
    .cd-page {
      font-family: 'DM Sans', sans-serif;
      background: var(--void);
      min-height: 100vh;
      color: var(--text-primary);
    }

    /* Nebula BG */
    .cd-nebula {
      position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
    }
    .cd-nebula::before {
      content: '';
      position: absolute; top: -20%; left: -15%; width: 65%; height: 65%;
      background: radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%);
      animation: ndrift 20s ease-in-out infinite alternate;
    }
    .cd-nebula::after {
      content: '';
      position: absolute; bottom: -10%; right: -15%; width: 55%; height: 55%;
      background: radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%);
      animation: ndrift 25s ease-in-out infinite alternate-reverse;
    }
    @keyframes ndrift {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(4%,5%) scale(1.06); }
    }
    .cd-stars {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.55) 0%, transparent 100%),
        radial-gradient(1px 1px at 38% 65%, rgba(255,255,255,0.4)  0%, transparent 100%),
        radial-gradient(1px 1px at 72% 12%, rgba(255,255,255,0.5)  0%, transparent 100%),
        radial-gradient(1px 1px at 88% 78%, rgba(255,255,255,0.3)  0%, transparent 100%),
        radial-gradient(1px 1px at 52% 42%, rgba(168,85,247,0.55)  0%, transparent 100%),
        radial-gradient(1px 1px at 22% 88%, rgba(6,182,212,0.5)    0%, transparent 100%),
        radial-gradient(2px 2px at 93% 33%, rgba(255,255,255,0.35) 0%, transparent 100%);
    }

    .cd-wrap { position: relative; z-index: 1; padding: 2.5rem 1.5rem; max-width: 1200px; margin: 0 auto; }

    /* ─── Back ─── */
    .cd-back {
      display: inline-flex; align-items: center; gap: 0.5rem;
      font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500;
      color: var(--text-muted); cursor: pointer;
      background: none; border: none; outline: none;
      transition: color 0.2s; margin-bottom: 1.75rem;
      letter-spacing: 0.04em;
    }
    .cd-back:hover { color: var(--accent-bright); }

    /* ─── Hero card ─── */
    .cd-hero {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 2rem 2.5rem;
      margin-bottom: 1.75rem;
      position: relative; overflow: hidden;
    }
    .cd-hero::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent 0%, var(--accent-bright) 50%, transparent 100%);
    }
    .cd-hero-glow {
      position: absolute; top: -60px; right: -60px;
      width: 220px; height: 220px; border-radius: 50%;
      background: radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%);
      pointer-events: none;
    }

    .cd-hero-top {
      display: flex; align-items: flex-start;
      justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }
    .cd-eyebrow {
      font-size: 0.68rem; font-weight: 600; letter-spacing: 0.25em;
      text-transform: uppercase; color: var(--accent-bright);
      display: flex; align-items: center; gap: 0.45rem;
      margin-bottom: 0.5rem;
    }
    .cd-eyebrow::before {
      content: ''; display: inline-block; width: 18px; height: 1px;
      background: var(--accent-bright);
    }
    .cd-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.6rem, 3.5vw, 2.4rem);
      font-weight: 700; line-height: 1.2;
      background: linear-gradient(135deg, #f1f0ff 0%, #c4b5fd 55%, #a78bfa 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      margin-bottom: 0.75rem;
    }
    .cd-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    .cd-status-badge {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.28rem 0.8rem; border-radius: 100px;
      font-size: 0.72rem; font-weight: 600; letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .bs-ongoing   { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
    .bs-upcoming  { background: rgba(6,182,212,0.12);  color: #22d3ee; border: 1px solid rgba(6,182,212,0.25); }
    .bs-completed { background: rgba(100,116,139,0.12);color: #94a3b8; border: 1px solid rgba(100,116,139,0.2); }
    .bs-private   { background: rgba(245,158,11,0.12); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }

    .cd-desc {
      font-size: 0.92rem; color: var(--text-secondary); line-height: 1.7;
      margin-bottom: 1.75rem; max-width: 680px;
    }

    /* ─── Stat chips ─── */
    .cd-stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1rem;
    }
    .cd-stat {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1rem 1.1rem;
    }
    .cd-stat-label {
      font-size: 0.7rem; font-weight: 500; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.4rem;
    }
    .cd-stat-value {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem; font-weight: 700; line-height: 1;
    }
    .sv-purple { color: var(--accent-bright); }
    .sv-gold   { color: var(--gold); }
    .sv-green  { color: var(--green); }
    .sv-cyan   { color: var(--cyan); }
    .sv-small  { font-size: 0.88rem; font-family: 'DM Sans', sans-serif; font-weight: 500; color: var(--text-secondary); }

    /* ─── Action button ─── */
    .cd-action-wrap { display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; }
    .btn-join {
      font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.88rem;
      letter-spacing: 0.04em; border-radius: 12px;
      padding: 0.65rem 1.6rem; cursor: pointer; border: none; outline: none;
      transition: all 0.3s ease; position: relative; overflow: hidden; white-space: nowrap;
    }
    .btn-join-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent-bright));
      color: #fff;
      box-shadow: 0 4px 20px rgba(124,58,237,0.35);
    }
    .btn-join-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(124,58,237,0.5); }
    .btn-join-secondary {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }
    .btn-join-secondary:hover { border-color: var(--border-glow); color: var(--text-primary); }
    .btn-join:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }

    .cd-restricted {
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 12px; padding: 0.75rem 1.1rem;
      text-align: right;
    }
    .cd-restricted-title { font-size: 0.78rem; color: #f87171; font-weight: 600; margin-bottom: 0.2rem; }
    .cd-restricted-sub   { font-size: 0.72rem; color: var(--text-muted); }

    /* ─── Tabs ─── */
    .cd-tabs { margin-top: 1.5rem; }
    .cd-tab-list {
      display: flex; gap: 0.25rem; padding: 0.4rem;
      background: var(--card); border: 1px solid var(--border);
      border-radius: 14px; margin-bottom: 1.5rem; overflow-x: auto;
    }
    .cd-tab {
      font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500;
      color: var(--text-muted); background: transparent; border: none; outline: none;
      padding: 0.55rem 1.1rem; border-radius: 10px; cursor: pointer;
      display: flex; align-items: center; gap: 0.45rem; white-space: nowrap;
      transition: all 0.2s ease;
    }
    .cd-tab:hover { color: var(--text-primary); background: rgba(255,255,255,0.04); }
    .cd-tab.active {
      background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(168,85,247,0.2));
      color: var(--accent-bright); border: 1px solid var(--border-glow);
    }
    .cd-tab-icon { font-size: 0.75rem; }

    /* ─── Panel card ─── */
    .cd-panel {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 18px; padding: 2rem;
      animation: panelIn 0.3s ease;
    }
    @keyframes panelIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ─── Overview ─── */
    .cd-section { margin-bottom: 2rem; }
    .cd-section-title {
      font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 600;
      color: var(--text-primary); margin-bottom: 0.75rem;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .cd-section-title::after {
      content: ''; flex: 1; height: 1px;
      background: linear-gradient(90deg, var(--border), transparent);
    }
    .cd-section-text { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.7; }
    .cd-info-rows { display: flex; flex-direction: column; gap: 0.7rem; }
    .cd-info-row {
      display: flex; align-items: center; gap: 0.75rem;
      font-size: 0.85rem; color: var(--text-secondary);
    }
    .cd-info-icon { font-size: 0.8rem; color: var(--accent-bright); flex-shrink: 0; }
    .cd-type-chip {
      display: inline-flex; align-items: center;
      background: rgba(6,182,212,0.1); color: var(--cyan);
      border: 1px solid rgba(6,182,212,0.2);
      border-radius: 100px; padding: 0.2rem 0.75rem;
      font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
    }

    /* ─── Leaderboard ─── */
    .cd-lb-table { width: 100%; border-collapse: collapse; }
    .cd-lb-table th {
      font-family: 'DM Sans', sans-serif; font-size: 0.7rem;
      font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--text-muted); padding: 0.75rem 1rem;
      text-align: left; border-bottom: 1px solid var(--border);
    }
    .cd-lb-table th:last-child { text-align: right; }
    .cd-lb-table td {
      padding: 0.85rem 1rem; font-size: 0.85rem; color: var(--text-secondary);
      border-bottom: 1px solid rgba(139,92,246,0.06);
      vertical-align: middle;
    }
    .cd-lb-table tr:last-child td { border-bottom: none; }
    .cd-lb-table tr:hover td { background: rgba(255,255,255,0.02); }

    .lb-rank { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; }
    .lb-rank-1 { color: #fbbf24; }
    .lb-rank-2 { color: #94a3b8; }
    .lb-rank-3 { color: #cd7f32; }
    .lb-score  { font-weight: 600; color: var(--accent-bright); text-align: right; }
    .lb-name   { color: var(--text-primary); font-weight: 500; }

    .lb-type-chip {
      display: inline-flex; padding: 0.2rem 0.6rem; border-radius: 100px;
      font-size: 0.68rem; font-weight: 600; letter-spacing: 0.05em;
      background: rgba(6,182,212,0.1); color: var(--cyan);
      border: 1px solid rgba(6,182,212,0.2);
    }
    .lb-status-chip {
      display: inline-flex; padding: 0.2rem 0.6rem; border-radius: 100px;
      font-size: 0.68rem; font-weight: 600;
    }
    .lbs-done { background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
    .lbs-pend { background: rgba(245,158,11,0.1);  color: #fbbf24; border: 1px solid rgba(245,158,11,0.2); }

    .cd-empty {
      text-align: center; padding: 3.5rem 1rem;
      font-size: 0.88rem; color: var(--text-muted);
      font-family: 'Playfair Display', serif;
    }

    /* ─── Stats grid ─── */
    .cd-stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1.25rem;
    }
    .cd-big-stat {
      background: rgba(255,255,255,0.025);
      border: 1px solid var(--border);
      border-radius: 16px; padding: 1.5rem;
    }
    .cd-big-stat-label {
      font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
      font-weight: 600; color: var(--text-muted); margin-bottom: 0.6rem;
    }
    .cd-big-stat-value {
      font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; line-height: 1;
    }

    /* ─── Questions ─── */
    .cd-q-list { display: flex; flex-direction: column; gap: 1.25rem; }
    .cd-q-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem;
      transition: border-color 0.2s;
    }
    .cd-q-card:hover { border-color: var(--border-glow); }
    .cd-q-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
    .cd-q-num {
      font-family: 'Playfair Display', serif; font-size: 0.9rem; font-weight: 600;
      color: var(--accent-bright);
    }
    .cd-q-pts {
      font-size: 0.72rem; font-weight: 600; letter-spacing: 0.06em;
      background: rgba(168,85,247,0.12); color: var(--accent-bright);
      border: 1px solid rgba(168,85,247,0.25);
      border-radius: 100px; padding: 0.2rem 0.65rem;
    }
    .cd-q-text {
      font-size: 0.9rem; color: var(--text-primary); line-height: 1.65;
      margin-bottom: 1.1rem; font-weight: 400;
    }

    /* Radio options */
    .cd-options { display: flex; flex-direction: column; gap: 0.55rem; }
    .cd-option {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.6rem 0.9rem; border-radius: 10px;
      border: 1px solid var(--border);
      background: rgba(255,255,255,0.02);
      cursor: pointer; transition: all 0.2s;
      font-size: 0.85rem; color: var(--text-secondary);
    }
    .cd-option:hover { border-color: var(--border-glow); color: var(--text-primary); background: rgba(168,85,247,0.06); }
    .cd-option.selected { border-color: var(--border-glow); background: rgba(168,85,247,0.1); color: var(--text-primary); }
    .cd-option.correct { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.08); color: #34d399; }
    .cd-option.incorrect{ border-color: rgba(239,68,68,0.4);  background: rgba(239,68,68,0.08);  color: #f87171; }
    .cd-option.disabled { cursor: default; }
    .cd-option-key {
      width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700; letter-spacing: 0;
      border: 1px solid var(--border); color: var(--text-muted);
      background: rgba(255,255,255,0.04);
    }

    .cd-feedback {
      margin-top: 0.85rem; padding: 0.6rem 0.9rem; border-radius: 10px;
      font-size: 0.82rem; font-weight: 600;
    }
    .fb-correct   { background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
    .fb-incorrect { background: rgba(239,68,68,0.1);  color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

    .cd-admin-answer {
      margin-top: 0.75rem; font-size: 0.8rem; color: #34d399; font-weight: 600;
      display: flex; align-items: center; gap: 0.4rem;
    }

    /* Submit btn */
    .btn-submit {
      align-self: flex-end; margin-top: 1rem;
      font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.88rem;
      letter-spacing: 0.04em;
      background: linear-gradient(135deg, var(--accent), var(--accent-bright));
      color: #fff; border: none; outline: none; border-radius: 12px;
      padding: 0.7rem 2rem; cursor: pointer;
      box-shadow: 0 4px 20px rgba(124,58,237,0.3);
      transition: all 0.3s ease;
    }
    .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(124,58,237,0.5); }
    .btn-submit:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

    /* Loading */
    .cd-loading {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 60vh; gap: 1.2rem;
    }
    .cd-loading-text {
      font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--text-muted); animation: lpulse 2s ease-in-out infinite;
    }
    @keyframes lpulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
  `}</style>
);

/* ─── Helpers ─── */
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

const getProgress = (start, end) => {
  const now = Date.now(), s = new Date(start).getTime(), e = new Date(end).getTime();
  if (now <= s) return 0;
  if (now >= e) return 100;
  return Math.round(((now - s) / (e - s)) * 100);
};

const statusBadgeClass = (s) =>
  ({ ongoing: 'bs-ongoing', upcoming: 'bs-upcoming', completed: 'bs-completed' })[s?.toLowerCase()] || 'bs-upcoming';

const RankBadge = ({ rank }) => {
  if (rank === 1) return <span>🥇</span>;
  if (rank === 2) return <span>🥈</span>;
  if (rank === 3) return <span>🥉</span>;
  return null;
};

/* ──────────────────────────────────────
   TABS CONFIG
────────────────────────────────────── */
const TABS = [
  { label: 'Overview',    icon: FaListUl },
  { label: 'Leaderboard', icon: FaTrophy },
  { label: 'Statistics',  icon: FaChartBar },
  { label: 'Questions',   icon: FaListUl },
];

const getLeaderboardDisplayName = (participant, isTeamBased = false) => {
  const teamOrClanName = participant?.teamName
    ?? participant?.TeamName
    ?? participant?.team?.name
    ?? participant?.Team?.Name
    ?? participant?.clanName
    ?? participant?.ClanName;

  if (isTeamBased && teamOrClanName) return teamOrClanName;
  return teamOrClanName || participant?.participantName || participant?.ParticipantName || 'Unknown';
};

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
const CompetitionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [competition, setCompetition]         = useState(null);
  const [leaderboard, setLeaderboard]         = useState(null);
  const [userScore, setUserScore]             = useState(null);
  const [userRank, setUserRank]               = useState(null);
  const [stats, setStats]                     = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [isJoined, setIsJoined]               = useState(false);
  const [joiningLoading, setJoiningLoading]   = useState(false);
  const [questions, setQuestions]             = useState(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError]   = useState(null);
  const [answersMap, setAnswersMap]           = useState({});
  const [submitting, setSubmitting]           = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState({});
  const [hasSubmitted, setHasSubmitted]       = useState(false);
  const [tabIndex, setTabIndex]               = useState(0);
  const [teamStatus, setTeamStatus]           = useState(null);

  const statusLower = useMemo(() => competition?.status?.toLowerCase() || '', [competition]);

  useEffect(() => { fetchCompetitionDetails(); }, [id, user]);

  const fetchCompetitionDetails = async () => {
    try {
      setLoading(true);
      const compRes = await competitionApi.get(`/competitions/${id}`);
      if (compRes.data.success) setCompetition(compRes.data.data);

      try {
        const leaderRes = await competitionApi.get(`/competitions/${id}/leaderboard`);
        if (leaderRes.data.success) {
          const lb = leaderRes.data.data;
          setLeaderboard(lb);
          if (user && lb?.participants && Array.isArray(lb.participants)) {
            const idx = lb.participants.findIndex(p => Number(p.participantId ?? p.ParticipantId) === Number(user.id));
            if (idx >= 0) { setUserRank(idx + 1); setUserScore(lb.participants[idx].score ?? lb.participants[idx].Score ?? 0); }
            else { setUserRank(null); setUserScore(null); }
          }
        }
      } catch { /* silent */ }

      try {
        const sRes = await competitionApi.get(`/competitions/${id}/stats`);
        if (sRes.data.success) setStats(sRes.data.data);
      } catch { /* silent */ }

      if (user) {
        try {
          const myComps = await competitionService.getUserCompetitions();
          setIsJoined(Boolean(myComps?.some(c => c.id === Number(id))));
        } catch { setIsJoined(false); }

        try {
          const statusRes = await competitionService.getMyTeamStatus(id);
          setTeamStatus(statusRes?.data || null);
        } catch {
          setTeamStatus(null);
        }
      } else { setIsJoined(false); }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to load competition', status: 'error', duration: 3000, isClosable: true });
    } finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      setJoiningLoading(true);
      const res = await competitionApi.post(`/competitions/${id}/join`);
      if (res.data.success) {
        setIsJoined(true);
        setCompetition(prev => prev ? { ...prev, participantCount: (prev.participantCount || 0) + 1 } : prev);
        toast({ title: 'Joined!', description: 'You have joined the competition.', status: 'success', duration: 3000, isClosable: true });
        fetchCompetitionDetails();
      } else {
        toast({ title: 'Error', description: res.data.message || 'Failed to join', status: 'error', duration: 3000, isClosable: true });
      }
    } catch (e) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed to join', status: 'error', duration: 3000, isClosable: true });
    } finally { setJoiningLoading(false); }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave?')) return;
    try {
      setJoiningLoading(true);
      const res = await competitionApi.post(`/competitions/${id}/leave`);
      if (res.data.success) {
        setIsJoined(false);
        toast({ title: 'Left', description: 'You have left the competition.', status: 'success', duration: 3000, isClosable: true });
        fetchCompetitionDetails();
      }
    } catch (e) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed to leave', status: 'error', duration: 3000, isClosable: true });
    } finally { setJoiningLoading(false); }
  };

  const fetchQuestions = async () => {
    if (!competition) return;
    setQuestionsLoading(true); setQuestionsError(null);
    try {
      if (!user) { setQuestionsError('Please login to view questions'); setQuestions([]); return; }
      const isAdmin   = user?.isAdmin;
      const isCreator = competition.creatorId === user?.id || competition.creator?.id === user?.id;
      if (isAdmin || isCreator) {
        const res = await competitionService.getAdminQuestions(id);
        const payload = res?.data ?? res;
        setQuestions(payload?.data ?? payload ?? []);
      } else {
        const res = await competitionService.getParticipantQuestions(id);
        const payload = res?.data ?? res;
        if (!payload || payload.success === false) { setQuestionsError(payload?.message || 'Questions not available'); setQuestions([]); }
        else {
          const qList = payload.data ?? payload ?? [];
          setQuestions(qList);
          const map = {}; qList.forEach(q => { const qid = q.id ?? q.Id; map[qid] = ''; });
          setAnswersMap(map); setQuestionFeedback({}); setHasSubmitted(false);
        }
      }
    } catch (e) {
      setQuestionsError(e.response?.data?.message || e.message || 'Failed to load questions');
      setQuestions([]);
    } finally { setQuestionsLoading(false); }
  };

  useEffect(() => { if (tabIndex === 3 && competition) fetchQuestions(); }, [tabIndex, competition, user]);

  const handleSubmitAnswers = async () => {
    if (!user) { navigate('/login'); return; }
    const answers = Object.entries(answersMap)
      .filter(([, v]) => v && v !== '')
      .map(([qid, val]) => ({ questionId: Number(qid), answer: val }));
    if (answers.length === 0) {
      toast({ title: 'No answers', description: 'Select at least one answer.', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    try {
      setSubmitting(true);
      if (!isJoined) {
        try {
          const jr = await competitionApi.post(`/competitions/${id}/join`);
          if (jr.data?.success) setIsJoined(true);
          else {
            const m = (jr.data?.message || '').toLowerCase();
            if (m.includes('already a participant')) setIsJoined(true);
            else { toast({ title: 'Not Registered', description: jr.data?.message, status: 'error', duration: 3000, isClosable: true }); return; }
          }
        } catch (je) {
          const m = (je.response?.data?.message || je.message || '').toLowerCase();
          if (m.includes('already a participant')) setIsJoined(true);
          else { toast({ title: 'Join Failed', description: je.response?.data?.message || je.message, status: 'error', duration: 3000, isClosable: true }); return; }
        }
      }
      const resp = await competitionService.submitAnswers(id, { answers });
      if (resp && resp.success) {
        toast({ title: '✓ Submitted', description: resp.message || 'Answers submitted!', status: 'success', duration: 3000, isClosable: true });
        const qr = resp.data?.questionResults ?? resp.data?.QuestionResults ?? null;
        if (qr && Array.isArray(qr)) {
          const map = {};
          qr.forEach(r => { map[r.questionId ?? r.QuestionId] = { isCorrect: r.isCorrect ?? r.IsCorrect, correctAnswer: r.correctAnswer ?? r.CorrectAnswer, submittedAnswer: r.submittedAnswer ?? r.SubmittedAnswer, pointsAwarded: r.pointsAwarded ?? r.PointsAwarded ?? 0 }; });
          setQuestionFeedback(map); setHasSubmitted(true);
        }
        fetchCompetitionDetails();
      } else { toast({ title: 'Error', description: resp?.message || 'Submission failed', status: 'error', duration: 3000, isClosable: true }); }
    } catch (e) {
      toast({ title: 'Error', description: e.response?.data?.message || e.message, status: 'error', duration: 3000, isClosable: true });
    } finally { setSubmitting(false); }
  };

  const getOptionClass = (qid, key) => {
    const fb = questionFeedback[qid];
    const sel = answersMap[qid];
    let cls = 'cd-option';
    if (hasSubmitted) {
      cls += ' disabled';
      if (fb) {
        const corr = (fb.correctAnswer || '').toUpperCase();
        if (key === corr) cls += ' correct';
        else if (key === (fb.submittedAnswer || '').toUpperCase() && key !== corr) cls += ' incorrect';
      }
    } else {
      if (sel === key) cls += ' selected';
    }
    return cls;
  };

  /* ─── Loading ─── */
  if (loading) return (
    <><CosmicStyle />
      <div className="cd-page" style={{ background: '#070B1A' }}>
        <CosmicBg />
        <div className="cd-nebula" /><div className="cd-stars" />
        <div className="cd-loading">
          <Spinner size="xl" color="#a855f7" thickness="3px" speed="0.8s" />
          <div className="cd-loading-text">Loading Competition...</div>
        </div>
      </div>
    </>
  );

  if (!competition) return (
    <><CosmicStyle />
      <div className="cd-page" style={{ background: '#070B1A' }}>
        <CosmicBg />
        <div className="cd-nebula" /><div className="cd-stars" />
        <div className="cd-wrap">
          <div className="cd-empty" style={{ marginTop: '6rem' }}>Competition not found.</div>
        </div>
      </div>
    </>
  );

  const isAdmin   = user?.isAdmin;
  const isCreator = competition.creatorId === user?.id || competition.creator?.id === user?.id;
  const canAccess = competition.isPublic || (competition.allowedMemberIds?.includes(user?.id));
  const progress  = getProgress(competition.startDate, competition.endDate);
  const hasApprovedTeam = Boolean(teamStatus?.hasApprovedTeamRegistration);
  const hasPendingTeam = Boolean(teamStatus?.hasPendingTeamRegistration);
  const isTeamPlayableNow = !competition.isTeamBased || hasApprovedTeam || (statusLower === 'ongoing' && hasPendingTeam);

  return (
    <><CosmicStyle />
    <div className="cd-page" style={{ background: '#070B1A' }}>
      <CosmicBg />
      <div className="cd-nebula" /><div className="cd-stars" />
      <div className="cd-wrap">

        {/* Back */}
        <button className="cd-back" onClick={() => navigate('/competitions')}>
          <Icon as={FaArrowLeft} /> All Competitions
        </button>

        {/* ─── Hero ─── */}
        <div className="cd-hero">
          <div className="cd-hero-glow" />
          <div className="cd-hero-top">
            <div>
              <div className="cd-eyebrow">
                <Icon as={competition.status?.toLowerCase() === 'ongoing' ? FaFire : FaClock} style={{ fontSize: '0.65rem' }} />
                Competition
              </div>
              <div className="cd-title">{competition.title}</div>
              <div className="cd-badges">
                <span className={`cd-status-badge ${statusBadgeClass(competition.status)}`}>
                  {competition.status}
                </span>
                {!competition.isPublic && (
                  <span className="cd-status-badge bs-private">
                    <Icon as={FaLock} style={{ fontSize: '0.6rem' }} /> Private
                  </span>
                )}
                {competition.isTeamBased && user && (
                  <span
                    className="cd-status-badge"
                    style={
                      isTeamPlayableNow
                        ? { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }
                        : hasPendingTeam
                          ? { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }
                          : { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }
                    }
                  >
                    {isTeamPlayableNow
                      ? 'Team Approved'
                      : hasPendingTeam
                        ? 'Team Pending Approval'
                        : 'Team Not Registered'}
                  </span>
                )}
              </div>
            </div>

            {/* Action */}
            {user && (
              canAccess ? (
                <div className="cd-action-wrap">
                  <button
                    className={`btn-join ${isJoined ? 'btn-join-secondary' : 'btn-join-primary'}`}
                    disabled={joiningLoading || (isJoined && statusLower !== 'upcoming')}
                    onClick={isJoined && statusLower === 'upcoming' ? handleLeave : handleJoin}
                  >
                    {joiningLoading ? '...' : isJoined ? (statusLower === 'upcoming' ? 'Leave' : 'Participated') : 'Join Competition'}
                  </button>
                </div>
              ) : (
                <div className="cd-restricted">
                  <div className="cd-restricted-title">
                    <Icon as={FaLock} style={{ fontSize: '0.7rem', marginRight: '0.3rem' }} />
                    Access Restricted
                  </div>
                  <div className="cd-restricted-sub">You are not on the allowed list</div>
                </div>
              )
            )}
          </div>

          <div className="cd-desc">{competition.description}</div>

          {/* Stats row */}
          <div className="cd-stats-row">
            <div className="cd-stat">
              <div className="cd-stat-label">Participants</div>
              <div className="cd-stat-value sv-purple">{competition.participantCount}</div>
            </div>
            {user && (
              <>
                <div className="cd-stat">
                  <div className="cd-stat-label">Your Score</div>
                  <div className="cd-stat-value sv-green">{userScore ?? 0}</div>
                </div>
                <div className="cd-stat">
                  <div className="cd-stat-label">Your Rank</div>
                  <div className="cd-stat-value sv-cyan">{userRank && userRank > 0 ? `#${userRank}` : '—'}</div>
                </div>
              </>
            )}
            <div className="cd-stat">
              <div className="cd-stat-label">Prize Pool</div>
              <div className="cd-stat-value sv-gold">{competition.prizePool > 0 ? `$${competition.prizePool}` : '—'}</div>
            </div>
            <div className="cd-stat">
              <div className="cd-stat-label">Start Date</div>
              <div className="cd-stat-value sv-small">{formatDate(competition.startDate)}</div>
            </div>
            <div className="cd-stat">
              <div className="cd-stat-label">End Date</div>
              <div className="cd-stat-value sv-small">{formatDate(competition.endDate)}</div>
            </div>
          </div>

          {/* Progress bar for ongoing */}
          {statusLower === 'ongoing' && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                <span>Competition Progress</span><span>{progress}%</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))', boxShadow: '0 0 10px var(--accent-glow)', borderRadius: '100px', transition: 'width 1s ease' }} />
              </div>
            </div>
          )}
        </div>

        {/* ─── Tabs ─── */}
        <div className="cd-tabs">
          <div className="cd-tab-list">
            {TABS.map((t, i) => (
              <button key={i} className={`cd-tab ${tabIndex === i ? 'active' : ''}`} onClick={() => setTabIndex(i)}>
                <Icon as={t.icon} className="cd-tab-icon" /> {t.label}
              </button>
            ))}
          </div>

          {/* ── Overview ── */}
          {tabIndex === 0 && (
            <div className="cd-panel">
              <div className="cd-section">
                <div className="cd-section-title">About This Competition</div>
                <div className="cd-section-text">{competition.description || 'No description provided.'}</div>
              </div>
              <div className="cd-section">
                <div className="cd-section-title">Competition Type</div>
                <span className="cd-type-chip">{competition.competitionType}</span>
              </div>
              <div className="cd-section">
                <div className="cd-section-title">Key Information</div>
                <div className="cd-info-rows">
                  <div className="cd-info-row">
                    <Icon as={FaClock} className="cd-info-icon" />
                    <span>{formatDate(competition.startDate)} — {formatDate(competition.endDate)}</span>
                  </div>
                  <div className="cd-info-row">
                    <Icon as={FaUsers} className="cd-info-icon" />
                    <span>Max Participants: {competition.maxParticipants}</span>
                  </div>
                  {competition.isTeamBased && (
                    <div className="cd-info-row">
                      <Icon as={FaUsers} className="cd-info-icon" />
                      <span>Team Size: {competition.teamSize} members</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Leaderboard ── */}
          {tabIndex === 1 && (
            <div className="cd-panel">
              {leaderboard?.participants?.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="cd-lb-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>{competition?.isTeamBased ? 'Team' : 'Participant'}</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.participants.map((p, i) => (
                        <tr key={i}>
                          <td>
                            <span className={`lb-rank ${i === 0 ? 'lb-rank-1' : i === 1 ? 'lb-rank-2' : i === 2 ? 'lb-rank-3' : ''}`}>
                              {i < 3 ? <RankBadge rank={i + 1} /> : i + 1}
                            </span>
                          </td>
                          <td className="lb-name">{getLeaderboardDisplayName(p, competition?.isTeamBased)}</td>
                          <td><span className="lb-type-chip">{p.participantType}</span></td>
                          <td>
                            <span className={`lb-status-chip ${p.status === 'Completed' ? 'lbs-done' : 'lbs-pend'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="lb-score">{p.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="cd-empty">No leaderboard data yet.</div>
              )}
            </div>
          )}

          {/* ── Statistics ── */}
          {tabIndex === 2 && (
            <div className="cd-panel">
              {stats ? (
                <div className="cd-stat-grid">
                  {[
                    { label: 'Total Participants', value: stats.totalParticipants,         cls: 'sv-purple' },
                    { label: 'Active Participants', value: stats.activeParticipants,        cls: 'sv-green' },
                    { label: 'Average Score',       value: stats.averageScore?.toFixed(2), cls: 'sv-cyan' },
                    { label: 'Highest Score',       value: stats.highestScore,             cls: 'sv-gold' },
                  ].map((s, i) => (
                    <div key={i} className="cd-big-stat">
                      <div className="cd-big-stat-label">{s.label}</div>
                      <div className={`cd-big-stat-value ${s.cls}`}>{s.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cd-empty">Statistics not available.</div>
              )}
            </div>
          )}

          {/* ── Questions ── */}
          {tabIndex === 3 && (
            <div className="cd-panel">
              {questionsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <Spinner color="#a855f7" />
                </div>
              ) : questionsError ? (
                <div style={{ color: '#f87171', fontSize: '0.88rem', padding: '1rem' }}>{questionsError}</div>
              ) : questions && questions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  <div className="cd-q-list">
                    {questions.map((q, idx) => {
                      const qid = q.id ?? q.Id;
                      const fb  = questionFeedback[qid];
                      const OPTIONS = ['A','B','C','D'];
                      const optTexts = { A: q.optionA ?? q.OptionA, B: q.optionB ?? q.OptionB, C: q.optionC ?? q.OptionC, D: q.optionD ?? q.OptionD };
                      return (
                        <div className="cd-q-card" key={qid || idx}>
                          <div className="cd-q-header">
                            <div className="cd-q-num">Question {idx + 1}</div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                Order: {q.order ?? q.Order}
                              </span>
                              <span className="cd-q-pts">{q.points ?? q.Points} pts</span>
                            </div>
                          </div>
                          <div className="cd-q-text">{q.questionText ?? q.QuestionText}</div>
                          <div className="cd-options">
                            {OPTIONS.map(key => (
                              <div
                                key={key}
                                className={getOptionClass(qid, key)}
                                onClick={() => {
                                  if (!hasSubmitted) setAnswersMap(prev => ({ ...prev, [qid]: key }));
                                }}
                              >
                                <span className="cd-option-key">{key}</span>
                                <span>{optTexts[key]}</span>
                              </div>
                            ))}
                          </div>

                          {/* Feedback */}
                          {fb && hasSubmitted && (
                            <div className={`cd-feedback ${(fb.submittedAnswer || '').toUpperCase() === (fb.correctAnswer || '').toUpperCase() ? 'fb-correct' : 'fb-incorrect'}`}>
                              {(fb.submittedAnswer || '').toUpperCase() === (fb.correctAnswer || '').toUpperCase()
                                ? `✓ Correct — +${fb.pointsAwarded ?? 0} pts`
                                : `✗ Incorrect — Correct answer: ${fb.correctAnswer}`}
                            </div>
                          )}

                          {/* Admin answer */}
                          {(isAdmin || isCreator) && (
                            <div className="cd-admin-answer">
                              <span>✓</span> Correct: {q.correctAnswer ?? q.CorrectAnswer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit */}
                  {!isAdmin && !isCreator && statusLower === 'ongoing' && user && !hasSubmitted && isTeamPlayableNow && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                      <button className="btn-submit" disabled={submitting} onClick={handleSubmitAnswers}>
                        {submitting ? 'Submitting...' : 'Submit Answers →'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="cd-empty">No questions available.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default CompetitionDetail;