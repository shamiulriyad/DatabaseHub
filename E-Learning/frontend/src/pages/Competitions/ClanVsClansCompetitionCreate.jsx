import React, { useState, useEffect } from 'react';
import { Icon, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaArrowRight, FaShieldAlt, FaTimes, FaPlus,
  FaCheckCircle, FaStar, FaClock, FaUsers, FaEye,
  FaExclamationTriangle,
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

    .cvc-page * { box-sizing: border-box; margin: 0; padding: 0; }
    .cvc-page {
      font-family: 'DM Sans', sans-serif;
      background: var(--void); min-height: 100vh; color: var(--text-primary);
    }

    /* Nebula */
    .cvc-nebula { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
    .cvc-nebula::before {
      content: ''; position: absolute; top: -20%; right: -10%; width: 55%; height: 55%;
      background: radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%);
      animation: nv 20s ease-in-out infinite alternate;
    }
    .cvc-nebula::after {
      content: ''; position: absolute; bottom: -15%; left: -10%; width: 50%; height: 50%;
      background: radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%);
      animation: nv 25s ease-in-out infinite alternate-reverse;
    }
    @keyframes nv { from{transform:translate(0,0)scale(1)} to{transform:translate(4%,5%)scale(1.06)} }
    .cvc-stars {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 40% 65%, rgba(255,255,255,0.35) 0%, transparent 100%),
        radial-gradient(1px 1px at 75% 12%, rgba(255,255,255,0.45) 0%, transparent 100%),
        radial-gradient(1px 1px at 55% 40%, rgba(168,85,247,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 88% 70%, rgba(249,115,22,0.35) 0%, transparent 100%);
    }

    .cvc-wrap { position: relative; z-index: 1; padding: 2.5rem 1.5rem; max-width: 960px; margin: 0 auto; }

    /* ─── Back ─── */
    .cvc-back {
      display: inline-flex; align-items: center; gap: 0.5rem;
      font-size: 0.78rem; font-weight: 500; color: var(--text-muted);
      background: none; border: none; outline: none; cursor: pointer;
      transition: color 0.2s; margin-bottom: 1.75rem;
    }
    .cvc-back:hover { color: var(--accent-bright); }

    /* ─── Header ─── */
    .cvc-eyebrow {
      font-size: 0.68rem; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase;
      color: var(--orange); display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.5rem;
    }
    .cvc-eyebrow::before { content: ''; display: inline-block; width: 20px; height: 1px; background: var(--orange); }
    .cvc-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.7rem, 3.5vw, 2.4rem); font-weight: 700; line-height: 1.2;
      background: linear-gradient(135deg, #fff5ed 0%, #fdba74 50%, #f97316 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      margin-bottom: 0.4rem;
    }
    .cvc-sub { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 2rem; }

    /* ─── Step indicator ─── */
    .cvc-steps {
      display: flex; align-items: center; gap: 0;
      background: var(--card); border: 1px solid var(--border);
      border-radius: 14px; padding: 0.4rem; margin-bottom: 2rem;
      overflow-x: auto;
    }
    .cvc-step {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.55rem 1.1rem; border-radius: 10px;
      font-size: 0.82rem; font-weight: 500; cursor: pointer;
      color: var(--text-muted); background: transparent; border: none; outline: none;
      transition: all 0.2s; white-space: nowrap; flex: 1; justify-content: center;
    }
    .cvc-step:hover { color: var(--text-primary); }
    .cvc-step.active {
      background: linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,146,60,0.15));
      color: var(--orange); border: 1px solid rgba(249,115,22,0.35);
    }
    .cvc-step.done { color: var(--green); }
    .cvc-step-num {
      width: 22px; height: 22px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
      background: rgba(255,255,255,0.05); border: 1px solid var(--border);
    }
    .cvc-step.active .cvc-step-num { background: rgba(249,115,22,0.2); border-color: rgba(249,115,22,0.4); color: var(--orange); }
    .cvc-step.done  .cvc-step-num { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.35); color: var(--green); }
    .cvc-sep { width: 1px; height: 20px; background: var(--border); flex-shrink: 0; }

    /* ─── Panel ─── */
    .cvc-panel { animation: panelIn 0.3s ease; }
    @keyframes panelIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

    /* ─── Section ─── */
    .cvc-section {
      background: var(--card); border: 1px solid var(--border);
      border-radius: 18px; padding: 1.75rem; margin-bottom: 1.25rem;
      position: relative; overflow: hidden;
    }
    .cvc-section::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, var(--orange), transparent);
      opacity: 0.3;
    }
    .cvc-section-title {
      font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 600;
      color: var(--text-primary); margin-bottom: 1.25rem;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .cvc-section-title::after {
      content: ''; flex: 1; height: 1px;
      background: linear-gradient(90deg, var(--border), transparent);
    }
    .sec-icon { font-size: 0.8rem; color: var(--orange); }

    /* ─── Clan matchup card ─── */
    .cvc-matchup {
      display: flex; align-items: center; gap: 1rem;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border); border-radius: 14px; padding: 1.25rem;
      margin-bottom: 1.25rem;
    }
    .cvc-clan-box {
      flex: 1; display: flex; align-items: center; gap: 0.85rem;
    }
    .cvc-clan-logo {
      width: 50px; height: 50px; border-radius: 12px; object-fit: cover;
      border: 1px solid var(--border);
    }
    .cvc-clan-logo-placeholder {
      width: 50px; height: 50px; border-radius: 12px;
      background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; color: var(--orange); flex-shrink: 0;
    }
    .cvc-clan-name { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 600; color: var(--text-primary); }
    .cvc-clan-meta { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem; }
    .cvc-vs {
      font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700;
      color: var(--orange); padding: 0 0.25rem;
      text-shadow: 0 0 20px rgba(249,115,22,0.4);
      flex-shrink: 0;
    }
    .cvc-clan-box.opponent .cvc-clan-logo-placeholder {
      background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.25); color: var(--blue);
    }

    /* Opponent detail card */
    .cvc-opponent-detail {
      background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.18);
      border-radius: 12px; padding: 1rem 1.1rem; margin-top: -0.5rem; margin-bottom: 1.25rem;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .cvc-opp-title { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--blue); margin-bottom: 0.5rem; }

    /* ─── Form ─── */
    .cvc-label {
      display: block; font-size: 0.74rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--text-secondary); margin-bottom: 0.45rem;
    }
    .cvc-label .req { color: var(--orange); margin-left: 2px; }
    .cvc-hint { font-size: 0.73rem; color: var(--text-muted); margin-top: 0.3rem; }
    .cvc-field { margin-bottom: 1.1rem; }
    .cvc-field:last-child { margin-bottom: 0; }

    .cvc-input, .cvc-textarea, .cvc-select {
      width: 100%; background: rgba(255,255,255,0.03) !important;
      border: 1px solid var(--border) !important; border-radius: 10px !important;
      padding: 0.65rem 0.95rem !important; color: var(--text-primary) !important;
      font-family: 'DM Sans', sans-serif !important; font-size: 0.88rem !important;
      outline: none !important; transition: border-color 0.2s, box-shadow 0.2s !important;
    }
    .cvc-input::placeholder, .cvc-textarea::placeholder { color: var(--text-muted) !important; }
    .cvc-input:focus, .cvc-textarea:focus, .cvc-select:focus {
      border-color: rgba(249,115,22,0.5) !important;
      box-shadow: 0 0 0 3px rgba(249,115,22,0.12) !important;
    }
    .cvc-input:disabled, .cvc-textarea:disabled, .cvc-select:disabled { opacity: 0.45 !important; cursor: not-allowed; }
    .cvc-textarea { resize: vertical !important; min-height: 80px !important; }
    .cvc-select {
      -webkit-appearance: none; appearance: none; cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239b99b8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") !important;
      background-repeat: no-repeat !important; background-position: right 0.85rem center !important;
      background-size: 10px !important; padding-right: 2.2rem !important;
    }
    .cvc-select option { background: #1a1a3a; color: var(--text-primary); }
    .cvc-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    /* ─── Question card ─── */
    .cvc-q-card {
      background: rgba(255,255,255,0.02); border: 1px solid var(--border);
      border-radius: 14px; padding: 1.4rem; margin-bottom: 1rem;
      transition: border-color 0.2s; position: relative;
    }
    .cvc-q-card:hover { border-color: rgba(249,115,22,0.3); }
    .cvc-q-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;
    }
    .cvc-q-num {
      font-family: 'Playfair Display', serif; font-size: 0.9rem; font-weight: 600;
      color: var(--orange); display: flex; align-items: center; gap: 0.5rem;
    }
    .cvc-q-badge {
      width: 26px; height: 26px; border-radius: 8px;
      background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700;
    }
    .btn-remove-q {
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
      color: #f87171; border-radius: 8px; padding: 0.3rem 0.75rem;
      font-size: 0.75rem; font-weight: 600; cursor: pointer; outline: none;
      transition: all 0.2s; display: flex; align-items: center; gap: 0.35rem;
    }
    .btn-remove-q:hover { background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4); }
    .cvc-q-options { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin: 0.85rem 0; }
    .cvc-q-opt { display: flex; align-items: center; gap: 0.5rem; }
    .cvc-q-opt-key {
      width: 24px; height: 24px; border-radius: 7px; flex-shrink: 0;
      background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.68rem; font-weight: 700; color: var(--orange);
    }
    .cvc-q-bottom { display: flex; gap: 0.85rem; }
    .cvc-q-bottom > * { flex: 1; }

    .btn-add-q {
      width: 100%; background: transparent; border: 1px dashed var(--border);
      border-radius: 12px; padding: 0.85rem; color: var(--text-muted);
      font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500;
      cursor: pointer; outline: none; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      margin-top: 0.25rem;
    }
    .btn-add-q:hover { border-color: rgba(249,115,22,0.4); color: var(--orange); background: rgba(249,115,22,0.04); }

    /* ─── Review ─── */
    .cvc-review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
    .cvc-review-item {
      background: rgba(255,255,255,0.02); border: 1px solid var(--border);
      border-radius: 12px; padding: 0.9rem 1rem;
    }
    .cvc-review-label { font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.35rem; font-weight: 600; }
    .cvc-review-value { font-size: 0.92rem; color: var(--text-primary); font-weight: 500; }

    .cvc-diff-badge {
      display: inline-flex; padding: 0.2rem 0.7rem; border-radius: 100px;
      font-size: 0.72rem; font-weight: 600; letter-spacing: 0.05em;
    }
    .diff-easy   { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
    .diff-medium { background: rgba(245,158,11,0.12);  color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }
    .diff-hard   { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }

    .cvc-type-badge {
      display: inline-flex; padding: 0.2rem 0.7rem; border-radius: 100px;
      font-size: 0.72rem; font-weight: 600;
      background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25);
    }

    .cvc-review-q {
      background: rgba(255,255,255,0.02); border: 1px solid var(--border);
      border-radius: 12px; padding: 0.9rem 1rem; margin-bottom: 0.65rem;
    }
    .cvc-review-q-text { font-size: 0.85rem; color: var(--text-primary); margin-bottom: 0.5rem; font-weight: 500; }
    .cvc-review-q-chips { display: flex; gap: 0.45rem; flex-wrap: wrap; }
    .rchip {
      display: inline-flex; padding: 0.18rem 0.6rem; border-radius: 100px;
      font-size: 0.68rem; font-weight: 600;
    }
    .rc-topic  { background: rgba(139,92,246,0.12); color: var(--accent-bright); border: 1px solid rgba(139,92,246,0.25); }
    .rc-pts    { background: rgba(168,85,247,0.12); color: var(--accent-bright); border: 1px solid rgba(168,85,247,0.25); }
    .rc-ans    { background: rgba(16,185,129,0.1);  color: #34d399; border: 1px solid rgba(16,185,129,0.2); }

    /* ─── Buttons ─── */
    .btn-primary-orange {
      font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.88rem;
      letter-spacing: 0.04em; border-radius: 12px; padding: 0.7rem 1.5rem;
      cursor: pointer; border: none; outline: none;
      background: linear-gradient(135deg, #ea580c, #f97316);
      color: #fff; box-shadow: 0 4px 20px rgba(249,115,22,0.3);
      transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.5rem;
    }
    .btn-primary-orange:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(249,115,22,0.5); }
    .btn-primary-orange:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

    .btn-primary-green {
      font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.88rem;
      letter-spacing: 0.04em; border-radius: 12px; padding: 0.7rem 1.75rem;
      cursor: pointer; border: none; outline: none;
      background: linear-gradient(135deg, #059669, #10b981);
      color: #fff; box-shadow: 0 4px 20px rgba(16,185,129,0.3);
      transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.5rem;
    }
    .btn-primary-green:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(16,185,129,0.5); }
    .btn-primary-green:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

    .btn-ghost {
      font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.88rem;
      border-radius: 12px; padding: 0.7rem 1.5rem; cursor: pointer; outline: none;
      background: transparent; color: var(--text-secondary);
      border: 1px solid var(--border); transition: all 0.25s ease;
      display: inline-flex; align-items: center; gap: 0.5rem;
    }
    .btn-ghost:hover { border-color: var(--border-glow); color: var(--text-primary); }

    .cvc-nav { display: flex; align-items: center; justify-content: space-between; margin-top: 1.5rem; }

    /* ─── Alert / access denied ─── */
    .cvc-alert {
      background: var(--card); border: 1px solid rgba(239,68,68,0.2);
      border-radius: 18px; padding: 2.5rem; text-align: center; margin-top: 3rem;
    }
    .cvc-alert-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .cvc-alert-title {
      font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .cvc-alert-sub { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; }
    .cvc-alert.warning .cvc-alert-title { color: #fbbf24; }
    .cvc-alert.error   .cvc-alert-title { color: #f87171; }

    @media (max-width: 600px) {
      .cvc-grid-2, .cvc-q-options, .cvc-review-grid { grid-template-columns: 1fr; }
      .cvc-matchup { flex-direction: column; }
    }
  `}</style>
);

/* ── Helpers ── */
const STEPS = [
  { key: 'details',   label: 'Details',   icon: FaShieldAlt },
  { key: 'questions', label: 'Questions', icon: FaStar },
  { key: 'review',    label: 'Review',    icon: FaEye },
];

const diffClass = (d) => ({ Easy: 'diff-easy', Medium: 'diff-medium', Hard: 'diff-hard' })[d] || 'diff-medium';

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
const ClanVsClansCompetitionCreate = () => {
  const navigate  = useNavigate();
  const toast     = useToast();
  const { user }  = useAuth();

  const [loading, setLoading]               = useState(false);
  const [fetchingClans, setFetchingClans]   = useState(false);
  const [userClans, setUserClans]           = useState([]);
  const [availableClans, setAvailableClans] = useState([]);
  const [currentStep, setCurrentStep]       = useState('details');

  const [formData, setFormData] = useState({
    title: '', description: '', competitionType: 'Programming',
    difficultyLevel: 'Medium', participantsPerClan: 3,
    durationMinutes: 30, opponentClanId: '', scheduledStartTime: '',
  });

  const [questions, setQuestions] = useState([
    { questionText: '', topic: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', points: 10 },
  ]);

  useEffect(() => {
    if (!user) return;
    const fetchCtx = async () => {
      setFetchingClans(true);
      try {
        const res = await competitionApi.get('/competitions/create-context');
        if (res.data.success) {
          setAvailableClans(res.data.clans || []);
          setUserClans(res.data.leaderClans || []);
        }
      } catch { /* silent */ } finally { setFetchingClans(false); }
    };
    fetchCtx();
  }, [user]);

  const challengerClan = userClans[0];
  const opponentClan   = availableClans.find(c => c.id === parseInt(formData.opponentClanId));

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const numberFields = ['participantsPerClan', 'durationMinutes', 'opponentClanId'];
    setFormData(prev => ({
      ...prev,
      [name]: numberFields.includes(name) ? (value === '' ? '' : parseInt(value, 10)) : value,
    }));
  };

  const handleQuestionChange = (idx, field, value) => {
    setQuestions(prev => { const q = [...prev]; q[idx] = { ...q[idx], [field]: value }; return q; });
  };

  const addQuestion = () => setQuestions(prev => [...prev, { questionText: '', topic: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', points: 10 }]);
  const removeQuestion = (idx) => setQuestions(prev => prev.filter((_, i) => i !== idx));

  const validateDetails = () => {
    if (!formData.title.trim())    { toast({ title: 'Competition title is required', status: 'error', duration: 3000, isClosable: true }); return false; }
    if (!formData.opponentClanId)  { toast({ title: 'Please select an opponent clan', status: 'error', duration: 3000, isClosable: true }); return false; }
    if (formData.participantsPerClan < 1 || formData.participantsPerClan > 10) { toast({ title: 'Participants per clan: 1–10', status: 'error', duration: 3000, isClosable: true }); return false; }
    if (formData.durationMinutes < 5 || formData.durationMinutes > 180) { toast({ title: 'Duration: 5–180 minutes', status: 'error', duration: 3000, isClosable: true }); return false; }
    return true;
  };

  const validateQuestions = () => {
    if (!questions.length) { toast({ title: 'At least one question required', status: 'error', duration: 3000, isClosable: true }); return false; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) { toast({ title: `Q${i+1}: Question text required`, status: 'error', duration: 3000, isClosable: true }); return false; }
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) { toast({ title: `Q${i+1}: All 4 options required`, status: 'error', duration: 3000, isClosable: true }); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateDetails() || !validateQuestions()) return;
    try {
      setLoading(true);
      const res = await competitionApi.post('/clan-vs-clans-competitions', {
        title: formData.title, description: formData.description,
        competitionType: formData.competitionType, difficultyLevel: formData.difficultyLevel,
        participantsPerClan: formData.participantsPerClan, durationMinutes: formData.durationMinutes,
        opponentClanId: formData.opponentClanId,
        scheduledStartTime: formData.scheduledStartTime || null,
        questions: questions.map(q => ({ ...q })),
      });
      if (res.data.success) {
        toast({ title: '⚔️ Challenge Created!', description: 'Clan vs Clan competition launched!', status: 'success', duration: 3000, isClosable: true });
        navigate(`/clans-competitions/${res.data.data.id}`);
      } else {
        toast({ title: 'Error', description: res.data.message, status: 'error', duration: 3000, isClosable: true });
      }
    } catch (e) {
      toast({ title: 'Error', description: e.response?.data?.message || 'An error occurred', status: 'error', duration: 3000, isClosable: true });
    } finally { setLoading(false); }
  };

  /* ── Guard states ── */
  if (!user) return (
    <><CosmicStyle />
      <div className="cvc-page">
        <div className="cvc-nebula" /><div className="cvc-stars" />
        <div className="cvc-wrap">
          <div className="cvc-alert error">
            <div className="cvc-alert-icon">🔒</div>
            <div className="cvc-alert-title">Not Authenticated</div>
            <div className="cvc-alert-sub">You must be logged in to create a clan vs clan competition.</div>
            <button className="btn-primary-orange" onClick={() => navigate('/login')}>Login</button>
          </div>
        </div>
      </div>
    </>
  );

  if (!fetchingClans && userClans.length === 0) return (
    <><CosmicStyle />
      <div className="cvc-page">
        <div className="cvc-nebula" /><div className="cvc-stars" />
        <div className="cvc-wrap">
          <div className="cvc-alert warning">
            <div className="cvc-alert-icon"><Icon as={FaExclamationTriangle} style={{ color: '#fbbf24' }} /></div>
            <div className="cvc-alert-title">Not a Clan Leader</div>
            <div className="cvc-alert-sub">You must be a leader or co-leader of a clan to create a Clan vs Clan competition.</div>
            <button className="btn-ghost" onClick={() => navigate('/clans')}>Browse Clans</button>
          </div>
        </div>
      </div>
    </>
  );

  const stepIdx = STEPS.findIndex(s => s.key === currentStep);

  return (
    <>
      <CosmicStyle />
      <div className="cvc-page">
        <div className="cvc-nebula" /><div className="cvc-stars" />
        <div className="cvc-wrap">

          <button className="cvc-back" onClick={() => navigate('/competitions')}>
            <Icon as={FaArrowLeft} /> All Competitions
          </button>

          {/* Header */}
          <div className="cvc-eyebrow">
            <Icon as={FaShieldAlt} style={{ fontSize: '0.65rem' }} /> Clan Battle
          </div>
          <div className="cvc-title">Clan vs Clan Challenge</div>
          <div className="cvc-sub">
            Challenge a rival clan to an MCQ battle. Test programming knowledge with focused questions covering algorithms, data structures, and logic.
          </div>

          {/* Steps */}
          <div className="cvc-steps">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.key}>
                {i > 0 && <div className="cvc-sep" />}
                <button
                  className={`cvc-step ${currentStep === s.key ? 'active' : i < stepIdx ? 'done' : ''}`}
                  onClick={() => {
                    if (i < stepIdx) setCurrentStep(s.key);
                    else if (i === stepIdx + 1 && currentStep === 'details' && validateDetails()) setCurrentStep(s.key);
                    else if (i === stepIdx + 1 && currentStep === 'questions' && validateQuestions()) setCurrentStep(s.key);
                  }}
                >
                  <span className="cvc-step-num">
                    {i < stepIdx ? <Icon as={FaCheckCircle} style={{ fontSize: '0.65rem' }} /> : i + 1}
                  </span>
                  {s.label}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* ── STEP 1: Details ── */}
          {currentStep === 'details' && (
            <div className="cvc-panel">

              {/* Challenger card */}
              {challengerClan && (
                <div className="cvc-section">
                  <div className="cvc-section-title"><Icon as={FaShieldAlt} className="sec-icon" />Your Clan (Challenger)</div>
                  <div className="cvc-matchup">
                    <div className="cvc-clan-box">
                      {challengerClan.logoUrl
                        ? <img className="cvc-clan-logo" src={challengerClan.logoUrl} alt={challengerClan.name} />
                        : <div className="cvc-clan-logo-placeholder"><Icon as={FaShieldAlt} /></div>
                      }
                      <div>
                        <div className="cvc-clan-name">{challengerClan.name}</div>
                        <div className="cvc-clan-meta"><Icon as={FaUsers} style={{ fontSize: '0.65rem', marginRight: '0.25rem' }} />{challengerClan.memberCount} members</div>
                      </div>
                    </div>
                    <div className="cvc-vs">⚔️</div>
                    <div className="cvc-clan-box opponent" style={{ justifyContent: 'flex-end' }}>
                      {opponentClan ? (
                        <>
                          <div style={{ textAlign: 'right' }}>
                            <div className="cvc-clan-name">{opponentClan.name}</div>
                            <div className="cvc-clan-meta">{opponentClan.memberCount} members</div>
                          </div>
                          {opponentClan.logoUrl
                            ? <img className="cvc-clan-logo" src={opponentClan.logoUrl} alt={opponentClan.name} />
                            : <div className="cvc-clan-logo-placeholder" style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)', color: 'var(--blue)' }}><Icon as={FaShieldAlt} /></div>
                          }
                        </>
                      ) : (
                        <div style={{ textAlign: 'right' }}>
                          <div className="cvc-clan-name" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Select Opponent</div>
                          <div className="cvc-clan-meta">choose below</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="cvc-section">
                <div className="cvc-section-title"><Icon as={FaStar} className="sec-icon" />Competition Info</div>

                <div className="cvc-field">
                  <label className="cvc-label">Title <span className="req">*</span></label>
                  <input className="cvc-input" name="title" placeholder="e.g., Spring 2026 Programming Challenge"
                    value={formData.title} onChange={handleFormChange} />
                </div>

                <div className="cvc-field">
                  <label className="cvc-label">Description</label>
                  <textarea className="cvc-textarea" name="description" rows={3}
                    placeholder="Optional description..." value={formData.description} onChange={handleFormChange} />
                </div>

                <div className="cvc-field">
                  <label className="cvc-label">Opponent Clan <span className="req">*</span></label>
                  <select className="cvc-select" name="opponentClanId" value={formData.opponentClanId} onChange={handleFormChange} disabled={fetchingClans}>
                    <option value="">{fetchingClans ? 'Loading clans...' : 'Select a clan to challenge'}</option>
                    {availableClans.filter(c => c.id !== challengerClan?.id).map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.memberCount} members)</option>
                    ))}
                  </select>
                </div>

                <div className="cvc-grid-2">
                  <div className="cvc-field">
                    <label className="cvc-label">Competition Type <span className="req">*</span></label>
                    <select className="cvc-select" name="competitionType" value={formData.competitionType} onChange={handleFormChange}>
                      <option value="Programming">Programming</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                  <div className="cvc-field">
                    <label className="cvc-label">Difficulty <span className="req">*</span></label>
                    <select className="cvc-select" name="difficultyLevel" value={formData.difficultyLevel} onChange={handleFormChange}>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="cvc-field">
                    <label className="cvc-label">Participants per Clan <span className="req">*</span></label>
                    <input className="cvc-input" type="number" name="participantsPerClan" min={1} max={10}
                      value={formData.participantsPerClan} onChange={handleFormChange} />
                    <div className="cvc-hint">Each clan selects this many fighters</div>
                  </div>
                  <div className="cvc-field">
                    <label className="cvc-label">Duration (minutes) <span className="req">*</span></label>
                    <input className="cvc-input" type="number" name="durationMinutes" min={5} max={180}
                      value={formData.durationMinutes} onChange={handleFormChange} />
                    <div className="cvc-hint">Time limit for all questions</div>
                  </div>
                </div>

                <div className="cvc-field">
                  <label className="cvc-label">Scheduled Start Time (Optional)</label>
                  <input className="cvc-input" type="datetime-local" name="scheduledStartTime"
                    value={formData.scheduledStartTime} onChange={handleFormChange}
                    style={{ colorScheme: 'dark' }} />
                  <div className="cvc-hint">Leave empty to start after both clans select participants</div>
                </div>
              </div>

              <div className="cvc-nav">
                <button className="btn-ghost" onClick={() => navigate('/competitions')}>
                  <Icon as={FaArrowLeft} /> Cancel
                </button>
                <button className="btn-primary-orange" onClick={() => { if (validateDetails()) setCurrentStep('questions'); }}>
                  Next: Questions <Icon as={FaArrowRight} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Questions ── */}
          {currentStep === 'questions' && (
            <div className="cvc-panel">
              <div className="cvc-section">
                <div className="cvc-section-title"><Icon as={FaStar} className="sec-icon" />MCQ Questions</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Add questions focused on programming concepts, algorithms, and logic. Both clans answer the same questions.
                </div>

                {questions.map((q, idx) => (
                  <div className="cvc-q-card" key={idx}>
                    <div className="cvc-q-header">
                      <div className="cvc-q-num">
                        <span className="cvc-q-badge">{idx + 1}</span>
                        Question {idx + 1}
                      </div>
                      {questions.length > 1 && (
                        <button className="btn-remove-q" onClick={() => removeQuestion(idx)}>
                          <Icon as={FaTimes} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="cvc-grid-2" style={{ marginBottom: '0.85rem' }}>
                      <div>
                        <label className="cvc-label">Topic / Area</label>
                        <input className="cvc-input" placeholder="e.g., Arrays, Sorting, Recursion"
                          value={q.topic} onChange={e => handleQuestionChange(idx, 'topic', e.target.value)} />
                      </div>
                      <div>
                        <label className="cvc-label">Points</label>
                        <input className="cvc-input" type="number" min={1} max={100}
                          value={q.points} onChange={e => handleQuestionChange(idx, 'points', e.target.value === '' ? '' : parseInt(e.target.value, 10))} />
                      </div>
                    </div>

                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="cvc-label">Question Text <span className="req">*</span></label>
                      <textarea className="cvc-textarea" rows={2} placeholder="Write your question here..."
                        value={q.questionText} onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)} />
                    </div>

                    <div className="cvc-q-options">
                      {['A','B','C','D'].map(key => (
                        <div key={key} className="cvc-q-opt">
                          <div className="cvc-q-opt-key">{key}</div>
                          <input className="cvc-input" placeholder={`Option ${key}`}
                            value={q[`option${key}`]}
                            onChange={e => handleQuestionChange(idx, `option${key}`, e.target.value)}
                            style={{ flex: 1 }} />
                        </div>
                      ))}
                    </div>

                    <div className="cvc-q-bottom" style={{ marginTop: '0.85rem' }}>
                      <div>
                        <label className="cvc-label">Correct Answer <span className="req">*</span></label>
                        <select className="cvc-select" value={q.correctAnswer}
                          onChange={e => handleQuestionChange(idx, 'correctAnswer', e.target.value)}>
                          <option value="A">A</option><option value="B">B</option>
                          <option value="C">C</option><option value="D">D</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <button className="btn-add-q" onClick={addQuestion}>
                  <Icon as={FaPlus} /> Add Another Question
                </button>
              </div>

              <div className="cvc-nav">
                <button className="btn-ghost" onClick={() => setCurrentStep('details')}>
                  <Icon as={FaArrowLeft} /> Back
                </button>
                <button className="btn-primary-orange" onClick={() => { if (validateQuestions()) setCurrentStep('review'); }}>
                  Review <Icon as={FaArrowRight} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Review ── */}
          {currentStep === 'review' && (
            <div className="cvc-panel">
              <div className="cvc-section">
                <div className="cvc-section-title"><Icon as={FaEye} className="sec-icon" />Competition Summary</div>
                <div className="cvc-review-grid">
                  <div className="cvc-review-item">
                    <div className="cvc-review-label">Title</div>
                    <div className="cvc-review-value">{formData.title}</div>
                  </div>
                  <div className="cvc-review-item">
                    <div className="cvc-review-label">Type</div>
                    <div className="cvc-review-value"><span className="cvc-type-badge">{formData.competitionType}</span></div>
                  </div>
                  <div className="cvc-review-item">
                    <div className="cvc-review-label">Difficulty</div>
                    <div className="cvc-review-value"><span className={`cvc-diff-badge ${diffClass(formData.difficultyLevel)}`}>{formData.difficultyLevel}</span></div>
                  </div>
                  <div className="cvc-review-item">
                    <div className="cvc-review-label">Duration</div>
                    <div className="cvc-review-value"><Icon as={FaClock} style={{ fontSize: '0.75rem', marginRight: '0.3rem', color: 'var(--text-muted)' }} />{formData.durationMinutes} min</div>
                  </div>
                  <div className="cvc-review-item">
                    <div className="cvc-review-label">Format</div>
                    <div className="cvc-review-value">{formData.participantsPerClan} vs {formData.participantsPerClan}</div>
                  </div>
                  <div className="cvc-review-item">
                    <div className="cvc-review-label">Questions</div>
                    <div className="cvc-review-value">{questions.length} questions</div>
                  </div>
                  {challengerClan && (
                    <div className="cvc-review-item">
                      <div className="cvc-review-label">Challenger</div>
                      <div className="cvc-review-value">{challengerClan.name}</div>
                    </div>
                  )}
                  {opponentClan && (
                    <div className="cvc-review-item">
                      <div className="cvc-review-label">Opponent</div>
                      <div className="cvc-review-value">{opponentClan.name}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="cvc-section">
                <div className="cvc-section-title"><Icon as={FaStar} className="sec-icon" />Questions Preview ({questions.length})</div>
                {questions.map((q, idx) => (
                  <div key={idx} className="cvc-review-q">
                    <div className="cvc-review-q-text">
                      Q{idx + 1}: {q.questionText.length > 80 ? q.questionText.substring(0, 80) + '…' : q.questionText}
                    </div>
                    <div className="cvc-review-q-chips">
                      <span className="rchip rc-topic">{q.topic || 'General'}</span>
                      <span className="rchip rc-pts">{q.points} pts</span>
                      <span className="rchip rc-ans">Answer: {q.correctAnswer}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cvc-nav">
                <button className="btn-ghost" onClick={() => setCurrentStep('questions')}>
                  <Icon as={FaArrowLeft} /> Back
                </button>
                <button className="btn-primary-green" disabled={loading} onClick={handleSubmit}>
                  {loading ? 'Creating...' : <><Icon as={FaCheckCircle} /> Launch Challenge</>}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ClanVsClansCompetitionCreate;