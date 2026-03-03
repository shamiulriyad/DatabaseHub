import React, { useState, useEffect } from 'react';
import { Icon, useToast } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaShieldAlt, FaCheck, FaTimes, FaUsers, FaClock,
  FaTrophy, FaStar, FaCheckCircle, FaFire,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import competitionApi from '../../services/api';

/* ─────────────────────────────────────────
   COSMIC DARK PREMIUM — Styles
───────────────────────────────────────── */
const CosmicStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --void:          #05050f;
      --card:          #11112a;
      --border:        rgba(139,92,246,0.15);
      --border-glow:   rgba(139,92,246,0.4);
      --accent:        #7c3aed;
      --accent-bright: #a855f7;
      --accent-glow:   rgba(168,85,247,0.2);
      --gold:          #f59e0b;
      --cyan:          #06b6d4;
      --green:         #10b981;
      --orange:        #f97316;
      --red:           #ef4444;
      --blue:          #3b82f6;
      --text-primary:  #f1f0ff;
      --text-secondary:#9b99b8;
      --text-muted:    #5a5880;
    }

    .cvd-page * { box-sizing: border-box; margin: 0; padding: 0; }
    .cvd-page {
      font-family: 'DM Sans', sans-serif;
      background: var(--void); min-height: 100vh; color: var(--text-primary);
    }

    /* Nebula */
    .cvd-nebula { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
    .cvd-nebula::before {
      content: ''; position: absolute; top: -20%; left: -10%; width: 55%; height: 55%;
      background: radial-gradient(ellipse, rgba(124,58,237,0.09) 0%, transparent 70%);
      animation: nv 20s ease-in-out infinite alternate;
    }
    .cvd-nebula::after {
      content: ''; position: absolute; bottom: -15%; right: -10%; width: 50%; height: 50%;
      background: radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%);
      animation: nv 26s ease-in-out infinite alternate-reverse;
    }
    @keyframes nv { from{transform:translate(0,0)scale(1)} to{transform:translate(4%,5%)scale(1.06)} }
    .cvd-stars {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 40% 65%, rgba(255,255,255,0.35) 0%, transparent 100%),
        radial-gradient(1px 1px at 75% 10%, rgba(255,255,255,0.45) 0%, transparent 100%),
        radial-gradient(1px 1px at 55% 45%, rgba(168,85,247,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 85% 75%, rgba(249,115,22,0.35) 0%, transparent 100%);
    }

    .cvd-wrap { position: relative; z-index: 1; padding: 2.5rem 1.5rem; max-width: 1100px; margin: 0 auto; }

    /* Back */
    .cvd-back {
      display: inline-flex; align-items: center; gap: 0.5rem;
      font-size: 0.78rem; color: var(--text-muted); background: none; border: none;
      outline: none; cursor: pointer; transition: color 0.2s; margin-bottom: 1.75rem;
    }
    .cvd-back:hover { color: var(--orange); }

    /* Header */
    .cvd-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;
    }
    .cvd-eyebrow {
      font-size: 0.68rem; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase;
      color: var(--orange); display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.5rem;
    }
    .cvd-eyebrow::before { content: ''; display: inline-block; width: 20px; height: 1px; background: var(--orange); }
    .cvd-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.5rem, 3vw, 2.2rem); font-weight: 700;
      background: linear-gradient(135deg, #fff5ed 0%, #fdba74 50%, #f97316 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      margin-bottom: 0.65rem;
    }
    .cvd-desc { font-size: 0.85rem; color: var(--text-muted); }

    /* Status badge */
    .cvd-status {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.28rem 0.8rem; border-radius: 100px;
      font-size: 0.72rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
    }
    .s-pending   { background: rgba(249,115,22,0.12); color: #fb923c; border: 1px solid rgba(249,115,22,0.25); }
    .s-scheduled { background: rgba(59,130,246,0.12);  color: #60a5fa; border: 1px solid rgba(59,130,246,0.25); }
    .s-ongoing   { background: rgba(168,85,247,0.12);  color: var(--accent-bright); border: 1px solid rgba(168,85,247,0.3); }
    .s-completed { background: rgba(16,185,129,0.12);  color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
    .s-rejected  { background: rgba(239,68,68,0.12);   color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
    .s-cancelled { background: rgba(100,116,139,0.12); color: #94a3b8; border: 1px solid rgba(100,116,139,0.2); }

    /* ─── Section ─── */
    .cvd-section {
      background: var(--card); border: 1px solid var(--border);
      border-radius: 18px; padding: 1.75rem; margin-bottom: 1.25rem;
      position: relative; overflow: hidden;
    }
    .cvd-section::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, var(--orange), transparent);
      opacity: 0.3;
    }
    .cvd-section-title {
      font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 600;
      color: var(--text-primary); margin-bottom: 1.5rem;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .cvd-section-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, var(--border), transparent); }
    .sec-icon { font-size: 0.8rem; color: var(--orange); }

    /* ─── Clan Matchup ─── */
    .cvd-matchup {
      display: grid; grid-template-columns: 1fr auto 1fr; gap: 1.5rem;
      align-items: center;
    }
    .cvd-clan { display: flex; flex-direction: column; align-items: center; gap: 0.85rem; text-align: center; }
    .cvd-clan.challenger { align-items: flex-start; text-align: left; }
    .cvd-clan.opponent   { align-items: flex-end;   text-align: right; }
    .cvd-clan-logo-wrap {
      width: 72px; height: 72px; border-radius: 16px; overflow: hidden; flex-shrink: 0;
      border: 2px solid var(--border);
    }
    .cvd-clan-logo { width: 100%; height: 100%; object-fit: cover; }
    .cvd-clan-placeholder {
      width: 72px; height: 72px; border-radius: 16px; flex-shrink: 0;
      border: 2px solid rgba(249,115,22,0.3);
      background: rgba(249,115,22,0.08);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; color: var(--orange);
    }
    .cvd-clan-placeholder.opp {
      border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.08); color: var(--blue);
    }
    .cvd-clan-name {
      font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 600; color: var(--text-primary);
    }
    .cvd-clan-members { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.1rem; }
    .cvd-ready-badge {
      display: inline-flex; align-items: center; gap: 0.3rem;
      padding: 0.2rem 0.65rem; border-radius: 100px;
      font-size: 0.68rem; font-weight: 600;
      background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.25);
    }
    .cvd-vs-wrap {
      display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
    }
    .cvd-vs {
      font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 700;
      color: var(--orange); text-shadow: 0 0 30px rgba(249,115,22,0.5);
      line-height: 1;
    }
    .cvd-vs-sub { font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-muted); }

    /* ─── Details grid ─── */
    .cvd-details-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem;
    }
    .cvd-detail-chip {
      background: rgba(255,255,255,0.025);
      border: 1px solid var(--border); border-radius: 12px; padding: 0.85rem 1rem;
    }
    .cvd-detail-label { font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); font-weight: 600; margin-bottom: 0.4rem; }
    .cvd-detail-value { font-size: 0.92rem; color: var(--text-primary); font-weight: 500; display: flex; align-items: center; gap: 0.4rem; }

    .diff-badge {
      display: inline-flex; padding: 0.2rem 0.65rem; border-radius: 100px;
      font-size: 0.7rem; font-weight: 600;
    }
    .diff-easy   { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
    .diff-medium { background: rgba(245,158,11,0.12);  color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }
    .diff-hard   { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
    .type-badge  { background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25); display: inline-flex; padding: 0.2rem 0.65rem; border-radius: 100px; font-size: 0.7rem; font-weight: 600; }

    /* ─── Action buttons ─── */
    .cvd-actions { display: flex; gap: 0.85rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
    .btn-accept {
      font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.88rem;
      border-radius: 12px; padding: 0.7rem 1.75rem; cursor: pointer; border: none; outline: none;
      background: linear-gradient(135deg, #059669, #10b981); color: #fff;
      box-shadow: 0 4px 20px rgba(16,185,129,0.3);
      transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.5rem;
    }
    .btn-accept:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(16,185,129,0.5); }
    .btn-accept:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
    .btn-reject {
      font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.88rem;
      border-radius: 12px; padding: 0.7rem 1.5rem; cursor: pointer; outline: none;
      background: transparent; color: #f87171;
      border: 1px solid rgba(239,68,68,0.3);
      transition: all 0.25s ease; display: inline-flex; align-items: center; gap: 0.5rem;
    }
    .btn-reject:hover { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.5); }
    .btn-primary-orange {
      font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.88rem;
      border-radius: 12px; padding: 0.7rem 1.75rem; cursor: pointer; border: none; outline: none;
      background: linear-gradient(135deg, #ea580c, #f97316); color: #fff;
      box-shadow: 0 4px 20px rgba(249,115,22,0.3);
      transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.5rem;
    }
    .btn-primary-orange:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(249,115,22,0.5); }
    .btn-primary-orange:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
    .btn-ghost {
      font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.88rem;
      border-radius: 12px; padding: 0.7rem 1.25rem; cursor: pointer; outline: none;
      background: transparent; color: var(--text-secondary); border: 1px solid var(--border);
      transition: all 0.25s; display: inline-flex; align-items: center; gap: 0.5rem;
    }
    .btn-ghost:hover { border-color: var(--border-glow); color: var(--text-primary); }

    /* ─── Member selection ─── */
    .cvd-member-list { display: flex; flex-direction: column; gap: 0.65rem; max-height: 420px; overflow-y: auto; padding-right: 0.25rem; }
    .cvd-member-list::-webkit-scrollbar { width: 4px; }
    .cvd-member-list::-webkit-scrollbar-track { background: transparent; }
    .cvd-member-list::-webkit-scrollbar-thumb { background: var(--border-glow); border-radius: 10px; }

    .cvd-member {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(255,255,255,0.02); border: 1px solid var(--border);
      border-radius: 12px; padding: 0.85rem 1rem; cursor: pointer;
      transition: all 0.2s;
    }
    .cvd-member:hover { border-color: rgba(249,115,22,0.35); background: rgba(249,115,22,0.04); }
    .cvd-member.selected {
      border-color: rgba(249,115,22,0.5); background: rgba(249,115,22,0.08);
    }
    .cvd-member.disabled { opacity: 0.4; cursor: not-allowed; }
    .cvd-member-left  { display: flex; align-items: center; gap: 0.75rem; }
    .cvd-member-avatar {
      width: 38px; height: 38px; border-radius: 50%; object-fit: cover;
      border: 1px solid var(--border);
    }
    .cvd-member-avatar-placeholder {
      width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
      background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700; color: var(--orange);
    }
    .cvd-member-name  { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }
    .cvd-member-uname { font-size: 0.75rem; color: var(--text-muted); }
    .cvd-member-right { display: flex; align-items: center; gap: 0.65rem; }
    .cvd-member-pts   { font-size: 0.75rem; color: var(--text-muted); }
    .cvd-selected-badge {
      display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.6rem;
      border-radius: 100px; font-size: 0.65rem; font-weight: 600;
      background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.25);
    }

    .cvd-selection-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.75rem 1rem; border-radius: 10px;
      background: rgba(249,115,22,0.06); border: 1px solid rgba(249,115,22,0.18);
      font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;
    }
    .cvd-selection-count { font-weight: 600; color: var(--orange); }

    /* ─── Results ─── */
    .cvd-results {
      background: rgba(245,158,11,0.04);
      border: 1px solid rgba(245,158,11,0.2); border-radius: 18px; padding: 2rem;
      position: relative; overflow: hidden;
    }
    .cvd-results::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
    }
    .cvd-results-grid {
      display: grid; grid-template-columns: 1fr auto 1fr; gap: 1.5rem; align-items: center;
    }
    .cvd-score-box { display: flex; flex-direction: column; }
    .cvd-score-box.right { align-items: flex-end; }
    .cvd-score-clan { font-size: 0.78rem; color: var(--text-muted); font-weight: 500; margin-bottom: 0.3rem; }
    .cvd-score-num {
      font-family: 'Playfair Display', serif; font-size: 2.5rem; font-weight: 700;
      color: var(--accent-bright); line-height: 1;
    }
    .cvd-winner-wrap { text-align: center; }
    .cvd-winner-label { font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: 0.5rem; }
    .cvd-winner-badge {
      font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700;
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .cvd-trophy { font-size: 2rem; display: block; margin-bottom: 0.5rem; }

    /* Questions preview */
    .cvd-q-preview {
      display: flex; align-items: center; gap: 0.85rem;
      padding: 1.1rem; border-radius: 12px;
      background: rgba(255,255,255,0.02); border: 1px dashed var(--border);
    }
    .cvd-q-icon { font-size: 1.5rem; opacity: 0.3; }
    .cvd-q-text { font-size: 0.85rem; color: var(--text-muted); }

    /* ─── Reject Modal ─── */
    .cvd-modal-overlay {
      position: fixed; inset: 0; z-index: 100;
      background: rgba(5,5,15,0.85); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; padding: 1rem;
      animation: mfade 0.2s ease;
    }
    @keyframes mfade { from{opacity:0} to{opacity:1} }
    .cvd-modal {
      background: var(--card); border: 1px solid rgba(239,68,68,0.3);
      border-radius: 20px; padding: 2rem; width: 100%; max-width: 440px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.7);
      animation: mslide 0.25s ease;
    }
    @keyframes mslide { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
    .cvd-modal::before {
      content: ''; display: block; height: 1px; margin-bottom: 1.5rem;
      background: linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent);
    }
    .cvd-modal-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: #f87171; margin-bottom: 0.4rem; }
    .cvd-modal-sub   { font-size: 0.83rem; color: var(--text-muted); margin-bottom: 1.25rem; }
    .cvd-modal-label { font-size: 0.74rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.45rem; display: block; }
    .cvd-modal-textarea {
      width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(239,68,68,0.2);
      border-radius: 10px; padding: 0.65rem 0.9rem; color: var(--text-primary);
      font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
      outline: none; resize: vertical; min-height: 100px; margin-bottom: 1.25rem;
      transition: border-color 0.2s;
    }
    .cvd-modal-textarea::placeholder { color: var(--text-muted); }
    .cvd-modal-textarea:focus { border-color: rgba(239,68,68,0.5); box-shadow: 0 0 0 3px rgba(239,68,68,0.08); }
    .cvd-modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }

    /* Loading */
    .cvd-loading {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 60vh; gap: 1.2rem;
    }
    .cvd-loading-text {
      font-size: 0.75rem; letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--text-muted); animation: lp 2s ease-in-out infinite;
    }
    @keyframes lp { 0%,100%{opacity:0.4} 50%{opacity:1} }

    @media (max-width: 600px) {
      .cvd-matchup { grid-template-columns: 1fr; gap: 1rem; }
      .cvd-results-grid { grid-template-columns: 1fr; }
      .cvd-details-grid { grid-template-columns: 1fr 1fr; }
    }
  `}</style>
);

/* ── Helpers ── */
const statusClass = (s) => ({
  Pending: 's-pending', Scheduled: 's-scheduled', Ongoing: 's-ongoing',
  Completed: 's-completed', Rejected: 's-rejected', Cancelled: 's-cancelled',
})[s] || 's-cancelled';

const diffClass = (d) => ({ Easy: 'diff-easy', Medium: 'diff-medium', Hard: 'diff-hard' })[d] || 'diff-medium';

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
const ClanVsClansCompetitionDetail = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const toast       = useToast();
  const { user }    = useAuth();

  const [competition, setCompetition]             = useState(null);
  const [loading, setLoading]                     = useState(true);
  const [actionLoading, setActionLoading]         = useState(false);
  const [rejectionReason, setRejectionReason]     = useState('');
  const [showRejectModal, setShowRejectModal]     = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [clanMembers, setClanMembers]             = useState([]);
  const [userClanId, setUserClanId]               = useState(null);

  useEffect(() => {
    const fetchComp = async () => {
      try {
        const res = await competitionApi.get(`/clan-vs-clans-competitions/${id}`);
        if (res.data.success) setCompetition(res.data.data);
      } catch {
        toast({ title: 'Error', description: 'Failed to load competition details', status: 'error', duration: 3000, isClosable: true });
      } finally { setLoading(false); }
    };
    fetchComp();
  }, [id, toast]);

  useEffect(() => {
    if (!competition || !user) return;
    const cid = user?.currentClan?.clanId || user?.currentClan?.id || null;
    if (cid) { setUserClanId(cid); fetchClanMembers(cid); }
  }, [competition, user]);

  const fetchClanMembers = async (cid) => {
    try {
      const res = await competitionApi.get(`/clans/${cid}/members`);
      if (res.data.success) setClanMembers(res.data.data || []);
    } catch { /* silent */ }
  };

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      const res = await competitionApi.post(`/clan-vs-clans-competitions/${competition.id}/accept`);
      if (res.data.success) {
        setCompetition(res.data.data);
        toast({ title: '⚔️ Challenge Accepted!', description: 'Now select your participants.', status: 'success', duration: 3000, isClosable: true });
        navigate(res?.data?.redirectUrl || `/clans-competitions/${competition.id}`);
      }
    } catch (e) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed to accept', status: 'error', duration: 3000, isClosable: true });
    } finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      const res = await competitionApi.post(`/clan-vs-clans-competitions/${competition.id}/reject`, { rejectionReason });
      if (res.data.success) {
        toast({ title: 'Challenge Rejected', status: 'success', duration: 3000, isClosable: true });
        navigate(-1);
      }
    } catch (e) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed to reject', status: 'error', duration: 3000, isClosable: true });
    } finally { setActionLoading(false); setShowRejectModal(false); }
  };

  const handleSelectParticipants = async () => {
    if (selectedParticipants.length !== competition.participantsPerClan) {
      toast({ title: `Select exactly ${competition.participantsPerClan} participants`, status: 'error', duration: 3000, isClosable: true });
      return;
    }
    try {
      setActionLoading(true);
      const res = await competitionApi.post(`/clan-vs-clans-competitions/${competition.id}/select-participants`, { selectedUserIds: selectedParticipants });
      if (res.data.success) {
        setCompetition(res.data.data);
        setSelectedParticipants([]);
        toast({ title: '✓ Participants Confirmed!', status: 'success', duration: 3000, isClosable: true });
      }
    } catch (e) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed to select', status: 'error', duration: 3000, isClosable: true });
    } finally { setActionLoading(false); }
  };

  const toggleMember = (mid) => {
    if (selectedParticipants.includes(mid)) {
      setSelectedParticipants(prev => prev.filter(x => x !== mid));
    } else if (selectedParticipants.length < competition.participantsPerClan) {
      setSelectedParticipants(prev => [...prev, mid]);
    }
  };

  /* Guards */
  if (loading) return (
    <><CosmicStyle />
      <div className="cvd-page">
        <div className="cvd-nebula" /><div className="cvd-stars" />
        <div className="cvd-loading">
          <div style={{ fontSize: '2rem' }}>⚔️</div>
          <div className="cvd-loading-text">Loading Battle...</div>
        </div>
      </div>
    </>
  );

  if (!competition) return (
    <><CosmicStyle />
      <div className="cvd-page">
        <div className="cvd-nebula" /><div className="cvd-stars" />
        <div className="cvd-wrap">
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Competition not found.
          </div>
        </div>
      </div>
    </>
  );

  const isUserOpponentLeader  = competition.opponentClan?.id === userClanId;
  const isUserChallengerLeader = competition.challengerClan?.id === userClanId;
  const isPending   = competition.status === 'Pending';
  const isScheduled = competition.status === 'Scheduled' || competition.status === 'Ready' || competition.status === 'Accepted' || competition.status === 'Ongoing';
  const isCompleted = competition.status === 'Completed';

  return (
    <>
      <CosmicStyle />
      <div className="cvd-page">
        <div className="cvd-nebula" /><div className="cvd-stars" />
        <div className="cvd-wrap">

          <button className="cvd-back" onClick={() => navigate(-1)}>
            <Icon as={FaArrowLeft} /> Back
          </button>

          {/* Header */}
          <div className="cvd-header">
            <div>
              <div className="cvd-eyebrow"><Icon as={FaShieldAlt} style={{ fontSize: '0.65rem' }} /> Clan Battle</div>
              <div className="cvd-title">{competition.title}</div>
              {competition.description && <div className="cvd-desc">{competition.description}</div>}
              <div style={{ marginTop: '0.65rem' }}>
                <span className={`cvd-status ${statusClass(competition.status)}`}>
                  {competition.status === 'Ongoing' && <Icon as={FaFire} style={{ fontSize: '0.6rem' }} />}
                  {competition.status}
                </span>
              </div>
            </div>
          </div>

          {/* ── Matchup ── */}
          <div className="cvd-section">
            <div className="cvd-section-title"><Icon as={FaShieldAlt} className="sec-icon" />Battle Matchup</div>
            <div className="cvd-matchup">
              {/* Challenger */}
              <div className="cvd-clan challenger">
                {competition.challengerClan?.logoUrl
                  ? <div className="cvd-clan-logo-wrap"><img className="cvd-clan-logo" src={competition.challengerClan.logoUrl} alt={competition.challengerClan.name} /></div>
                            : <div className="cvd-clan-placeholder"><Icon as={FaShieldAlt} /></div>
                }
                <div className="cvd-clan-name">{competition.challengerClan?.name}</div>
                <div className="cvd-clan-members"><Icon as={FaUsers} style={{ fontSize: '0.65rem', marginRight: '0.25rem' }} />{competition.challengerClan?.memberCount} members</div>
                {competition.challengerReady && (
                  <span className="cvd-ready-badge"><Icon as={FaCheckCircle} style={{ fontSize: '0.6rem' }} /> Ready</span>
                )}
              </div>

              {/* VS */}
              <div className="cvd-vs-wrap">
                <div className="cvd-vs">⚔️</div>
                <div className="cvd-vs-sub">VS</div>
              </div>

              {/* Opponent */}
              <div className="cvd-clan opponent">
                {competition.opponentClan?.logoUrl
                  ? <div className="cvd-clan-logo-wrap"><img className="cvd-clan-logo" src={competition.opponentClan.logoUrl} alt={competition.opponentClan.name} /></div>
                  : <div className="cvd-clan-placeholder opp"><Icon as={FaShieldAlt} /></div>
                }
                <div className="cvd-clan-name">{competition.opponentClan?.name}</div>
                <div className="cvd-clan-members"><Icon as={FaUsers} style={{ fontSize: '0.65rem', marginRight: '0.25rem' }} />{competition.opponentClan?.memberCount} members</div>
                {competition.opponentReady && (
                  <span className="cvd-ready-badge"><Icon as={FaCheckCircle} style={{ fontSize: '0.6rem' }} /> Ready</span>
                )}
              </div>
            </div>
          </div>

          {/* ── Details ── */}
          <div className="cvd-section">
            <div className="cvd-section-title"><Icon as={FaStar} className="sec-icon" />Competition Details</div>
            <div className="cvd-details-grid">
              <div className="cvd-detail-chip">
                <div className="cvd-detail-label">Type</div>
                <div className="cvd-detail-value"><span className="type-badge">{competition.competitionType}</span></div>
              </div>
              <div className="cvd-detail-chip">
                <div className="cvd-detail-label">Difficulty</div>
                <div className="cvd-detail-value"><span className={`diff-badge ${diffClass(competition.difficultyLevel)}`}>{competition.difficultyLevel}</span></div>
              </div>
              <div className="cvd-detail-chip">
                <div className="cvd-detail-label">Duration</div>
                <div className="cvd-detail-value"><Icon as={FaClock} style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} /> {competition.durationMinutes} min</div>
              </div>
              <div className="cvd-detail-chip">
                <div className="cvd-detail-label">Format</div>
                <div className="cvd-detail-value"><Icon as={FaUsers} style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} /> {competition.participantsPerClan} vs {competition.participantsPerClan}</div>
              </div>
              <div className="cvd-detail-chip">
                <div className="cvd-detail-label">Created</div>
                <div className="cvd-detail-value">{new Date(competition.createdAt).toLocaleDateString()}</div>
              </div>
              {competition.scheduledStartTime && (
                <div className="cvd-detail-chip">
                  <div className="cvd-detail-label">Scheduled Start</div>
                  <div className="cvd-detail-value">{new Date(competition.scheduledStartTime).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Pending actions ── */}
          {isPending && isUserOpponentLeader && (
            <div className="cvd-actions">
              <button className="btn-accept" disabled={actionLoading} onClick={handleAccept}>
                <Icon as={FaCheck} /> Accept Challenge
              </button>
              <button className="btn-reject" onClick={() => setShowRejectModal(true)}>
                <Icon as={FaTimes} /> Reject
              </button>
            </div>
          )}

          {/* ── Participant Selection ── */}
          {isScheduled && (isUserChallengerLeader || isUserOpponentLeader) && (
            <div className="cvd-section">
              <div className="cvd-section-title"><Icon as={FaUsers} className="sec-icon" />Select Your Warriors</div>

              <div className="cvd-selection-bar">
                <span>Choose <span className="cvd-selection-count">{competition.participantsPerClan}</span> participants from your clan</span>
                <span className="cvd-selection-count">{selectedParticipants.length} / {competition.participantsPerClan} selected</span>
              </div>

              <div className="cvd-member-list">
                {clanMembers.map(m => {
                  const isSelected = selectedParticipants.includes(m.id);
                  const isDisabledByLimit = !isSelected && selectedParticipants.length >= competition.participantsPerClan;
                  return (
                    <div
                      key={m.id}
                      className={`cvd-member ${isSelected ? 'selected' : ''} ${isDisabledByLimit ? 'disabled' : ''}`}
                      onClick={() => !isDisabledByLimit && toggleMember(m.id)}
                    >
                      <div className="cvd-member-left">
                        {m.profileImageUrl
                          ? <img className="cvd-member-avatar" src={m.profileImageUrl} alt={m.username} />
                          : <div className="cvd-member-avatar-placeholder">{(m.firstName?.[0] || m.username?.[0] || '?').toUpperCase()}</div>
                        }
                        <div>
                          <div className="cvd-member-name">{m.firstName} {m.lastName}</div>
                          <div className="cvd-member-uname">@{m.username}</div>
                        </div>
                      </div>
                      <div className="cvd-member-right">
                        <span className="cvd-member-pts"><Icon as={FaStar} style={{ fontSize: '0.6rem', color: 'var(--gold)', marginRight: '0.2rem' }} />{m.totalPoints}</span>
                        {isSelected && <span className="cvd-selected-badge"><Icon as={FaCheck} style={{ fontSize: '0.6rem' }} /> Selected</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary-orange" disabled={actionLoading || selectedParticipants.length !== competition.participantsPerClan} onClick={handleSelectParticipants}>
                  <Icon as={FaCheckCircle} /> Confirm Warriors
                </button>
              </div>
            </div>
          )}

          {/* ── Questions Preview ── */}
          <div className="cvd-section">
            <div className="cvd-section-title"><Icon as={FaStar} className="sec-icon" />Questions</div>
            <div className="cvd-q-preview">
              <div className="cvd-q-icon">🔒</div>
              <div className="cvd-q-text">Questions will be revealed when the competition starts. Both clans will answer the same set of questions simultaneously.</div>
            </div>
          </div>

          {/* ── Results ── */}
          {isCompleted && (
            <div className="cvd-results">
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon as={FaTrophy} style={{ fontSize: '0.9rem' }} /> Battle Results
              </div>
              <div className="cvd-results-grid">
                <div className="cvd-score-box">
                  <div className="cvd-score-clan">{competition.challengerClan?.name}</div>
                  <div className="cvd-score-num">{competition.challengerTotalScore ?? 0}</div>
                </div>
                <div className="cvd-winner-wrap">
                  <span className="cvd-trophy">🏆</span>
                  <div className="cvd-winner-label">Winner</div>
                  <div className="cvd-winner-badge">{competition.winnerClanStatus || '—'}</div>
                </div>
                <div className="cvd-score-box right">
                  <div className="cvd-score-clan">{competition.opponentClan?.name}</div>
                  <div className="cvd-score-num">{competition.opponentTotalScore ?? 0}</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Reject Modal ── */}
      {showRejectModal && (
        <div className="cvd-modal-overlay">
          <div className="cvd-modal">
            <div className="cvd-modal-title">Reject Challenge</div>
            <div className="cvd-modal-sub">Are you sure? This action cannot be undone.</div>
            <label className="cvd-modal-label">Reason (optional)</label>
            <textarea
              className="cvd-modal-textarea"
              placeholder="Tell the challenger clan why you're rejecting..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
            />
            <div className="cvd-modal-actions">
              <button className="btn-ghost" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="btn-reject" disabled={actionLoading} onClick={handleReject}>
                <Icon as={FaTimes} /> {actionLoading ? 'Rejecting...' : 'Reject Challenge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClanVsClansCompetitionDetail;