import React, { useState, useEffect } from 'react';
import { Icon, useToast, Switch } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaArrowLeft, FaLock, FaGlobe, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import competitionApi from '../../services/api';

/* ─────────────────────────────────────────
   COSMIC DARK PREMIUM — Styles
───────────────────────────────────────── */
const CosmicStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --void:          #05050f;
      --card:          #11112a;
      --card-alt:      #0d0d20;
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
      --text-primary:  #f1f0ff;
      --text-secondary:#9b99b8;
      --text-muted:    #5a5880;
    }

    .cc-page * { box-sizing: border-box; margin: 0; padding: 0; }
    .cc-page {
      font-family: 'DM Sans', sans-serif;
      background: var(--void);
      min-height: 100vh;
      color: var(--text-primary);
    }

    /* Nebula */
    .cc-nebula { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
    .cc-nebula::before {
      content: ''; position: absolute; top: -25%; left: -10%; width: 60%; height: 60%;
      background: radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%);
      animation: cn 20s ease-in-out infinite alternate;
    }
    .cc-nebula::after {
      content: ''; position: absolute; bottom: -15%; right: -10%; width: 50%; height: 50%;
      background: radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%);
      animation: cn 24s ease-in-out infinite alternate-reverse;
    }
    @keyframes cn { from{transform:translate(0,0)scale(1)} to{transform:translate(4%,5%)scale(1.06)} }
    .cc-stars {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 40% 65%, rgba(255,255,255,0.35) 0%, transparent 100%),
        radial-gradient(1px 1px at 75% 12%, rgba(255,255,255,0.45) 0%, transparent 100%),
        radial-gradient(1px 1px at 88% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
        radial-gradient(1px 1px at 50% 40%, rgba(168,85,247,0.5) 0%, transparent 100%);
    }

    .cc-wrap { position: relative; z-index: 1; padding: 2.5rem 1.5rem; max-width: 900px; margin: 0 auto; }

    /* ─── Back ─── */
    .cc-back {
      display: inline-flex; align-items: center; gap: 0.5rem;
      font-size: 0.78rem; font-weight: 500; letter-spacing: 0.04em;
      color: var(--text-muted); background: none; border: none; outline: none;
      cursor: pointer; transition: color 0.2s; margin-bottom: 1.75rem;
    }
    .cc-back:hover { color: var(--accent-bright); }

    /* ─── Header ─── */
    .cc-eyebrow {
      font-size: 0.68rem; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase;
      color: var(--accent-bright); display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.5rem;
    }
    .cc-eyebrow::before { content: ''; display: inline-block; width: 20px; height: 1px; background: var(--accent-bright); }
    .cc-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.7rem, 3.5vw, 2.4rem); font-weight: 700; line-height: 1.2;
      background: linear-gradient(135deg, #f1f0ff 0%, #c4b5fd 55%, #a78bfa 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      margin-bottom: 0.4rem;
    }
    .cc-sub { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 2rem; }

    /* ─── Alert banner ─── */
    .cc-alert {
      background: rgba(6,182,212,0.08);
      border: 1px solid rgba(6,182,212,0.2);
      border-radius: 12px; padding: 0.9rem 1.1rem;
      font-size: 0.82rem; color: var(--cyan);
      display: flex; align-items: center; gap: 0.65rem;
      margin-bottom: 2rem;
    }

    /* ─── Section card ─── */
    .cc-section {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 18px; padding: 1.75rem;
      margin-bottom: 1.5rem;
      position: relative; overflow: hidden;
    }
    .cc-section::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, var(--accent-bright), transparent);
      opacity: 0.4;
    }
    .cc-section-title {
      font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 600;
      color: var(--text-primary); margin-bottom: 1.25rem;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .cc-section-title::after {
      content: ''; flex: 1; height: 1px;
      background: linear-gradient(90deg, var(--border), transparent);
    }
    .cc-section-icon { font-size: 0.8rem; color: var(--accent-bright); }

    /* ─── Form controls ─── */
    .cc-label {
      display: block; font-size: 0.76rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--text-secondary); margin-bottom: 0.5rem;
    }
    .cc-label .req { color: var(--accent-bright); margin-left: 2px; }
    .cc-hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.3rem; }

    .cc-input, .cc-textarea, .cc-select {
      width: 100%;
      background: rgba(255,255,255,0.03) !important;
      border: 1px solid var(--border) !important;
      border-radius: 10px !important;
      padding: 0.65rem 0.95rem !important;
      color: var(--text-primary) !important;
      font-family: 'DM Sans', sans-serif !important;
      font-size: 0.88rem !important;
      outline: none !important;
      transition: border-color 0.2s, box-shadow 0.2s !important;
    }
    .cc-input::placeholder, .cc-textarea::placeholder { color: var(--text-muted) !important; }
    .cc-input:focus, .cc-textarea:focus, .cc-select:focus {
      border-color: var(--border-glow) !important;
      box-shadow: 0 0 0 3px var(--accent-glow) !important;
    }
    .cc-input:disabled, .cc-textarea:disabled, .cc-select:disabled { opacity: 0.45 !important; cursor: not-allowed; }
    .cc-textarea { resize: vertical !important; min-height: 90px !important; }

    .cc-select {
      -webkit-appearance: none; appearance: none; cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239b99b8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") !important;
      background-repeat: no-repeat !important; background-position: right 0.85rem center !important; background-size: 10px !important;
      padding-right: 2.2rem !important;
    }
    .cc-select option { background: #1a1a3a; color: var(--text-primary); }

    .cc-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .cc-field { margin-bottom: 1.1rem; }
    .cc-field:last-child { margin-bottom: 0; }

    /* ─── Visibility toggle ─── */
    .cc-visibility-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.1rem; border-radius: 12px;
      border: 1px solid var(--border); background: rgba(255,255,255,0.02);
      margin-bottom: 0.85rem;
    }
    .cc-vis-info { display: flex; align-items: center; gap: 0.75rem; }
    .cc-vis-icon {
      width: 34px; height: 34px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; font-size: 0.8rem;
    }
    .vi-public  { background: rgba(16,185,129,0.12); color: var(--green); border: 1px solid rgba(16,185,129,0.25); }
    .vi-private { background: rgba(249,115,22,0.12);  color: var(--orange); border: 1px solid rgba(249,115,22,0.25); }
    .cc-vis-label { font-weight: 600; font-size: 0.88rem; color: var(--text-primary); }
    .cc-vis-desc  { font-size: 0.75rem; color: var(--text-muted); }

    /* ─── Private box ─── */
    .cc-private-box {
      background: rgba(249,115,22,0.05);
      border: 1px solid rgba(249,115,22,0.2);
      border-radius: 14px; padding: 1.25rem;
      animation: fadeSlide 0.3s ease;
    }
    @keyframes fadeSlide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

    .cc-private-title {
      font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--orange); margin-bottom: 1rem;
    }

    /* Tags */
    .cc-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.85rem; }
    .cc-tag {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.3rem 0.75rem; border-radius: 100px;
      font-size: 0.75rem; font-weight: 500; cursor: default;
    }
    .tag-member { background: rgba(168,85,247,0.15); color: var(--accent-bright); border: 1px solid rgba(168,85,247,0.3); }
    .tag-clan   { background: rgba(6,182,212,0.12);  color: var(--cyan);          border: 1px solid rgba(6,182,212,0.25); }
    .cc-tag-remove {
      background: none; border: none; cursor: pointer; padding: 0;
      color: inherit; opacity: 0.7; line-height: 1; font-size: 0.7rem;
      display: flex; align-items: center; transition: opacity 0.15s;
    }
    .cc-tag-remove:hover { opacity: 1; }

    /* Search dropdown */
    .cc-search-wrap { position: relative; margin-bottom: 0.75rem; }
    .cc-dropdown {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0;
      background: #16163a; border: 1px solid var(--border-glow);
      border-radius: 10px; max-height: 200px; overflow-y: auto; z-index: 50;
      box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    }
    .cc-dropdown-item {
      padding: 0.65rem 0.9rem; cursor: pointer;
      border-bottom: 1px solid rgba(139,92,246,0.07);
      transition: background 0.15s;
    }
    .cc-dropdown-item:last-child { border-bottom: none; }
    .cc-dropdown-item:hover { background: rgba(168,85,247,0.1); }
    .cc-dropdown-name { font-size: 0.85rem; color: var(--text-primary); font-weight: 500; }
    .cc-dropdown-sub  { font-size: 0.73rem; color: var(--text-muted); }
    .cc-dropdown-empty { padding: 1rem; text-align: center; font-size: 0.82rem; color: var(--text-muted); }

    /* Point range */
    .cc-point-range {
      background: rgba(6,182,212,0.05); border: 1px solid rgba(6,182,212,0.18);
      border-radius: 12px; padding: 1rem; margin-top: 1rem;
    }
    .cc-point-title { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--cyan); margin-bottom: 0.5rem; }
    .cc-point-desc  { font-size: 0.73rem; color: var(--text-muted); margin-bottom: 0.85rem; }

    /* ─── Question cards ─── */
    .cc-q-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border); border-radius: 14px; padding: 1.35rem;
      margin-bottom: 1rem; position: relative;
      transition: border-color 0.2s;
    }
    .cc-q-card:hover { border-color: var(--border-glow); }
    .cc-q-card:last-child { margin-bottom: 0; }
    .cc-q-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;
    }
    .cc-q-num {
      font-family: 'Playfair Display', serif; font-size: 0.9rem; font-weight: 600;
      color: var(--accent-bright); display: flex; align-items: center; gap: 0.5rem;
    }
    .cc-q-num-badge {
      width: 26px; height: 26px; border-radius: 8px; background: rgba(168,85,247,0.15);
      border: 1px solid rgba(168,85,247,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700;
    }
    .cc-q-options { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin: 0.85rem 0; }
    .cc-q-option { display: flex; align-items: center; gap: 0.5rem; }
    .cc-q-option-key {
      width: 24px; height: 24px; border-radius: 7px; flex-shrink: 0;
      background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700; color: var(--accent-bright);
    }
    .cc-q-bottom { display: flex; gap: 0.85rem; margin-top: 0.85rem; }
    .cc-q-bottom > * { flex: 1; }

    /* ─── Buttons ─── */
    .btn-primary {
      font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.88rem;
      letter-spacing: 0.04em; border-radius: 12px;
      padding: 0.7rem 1.75rem; cursor: pointer; border: none; outline: none;
      background: linear-gradient(135deg, var(--accent), var(--accent-bright));
      color: #fff; box-shadow: 0 4px 20px rgba(124,58,237,0.3);
      transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.5rem;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,0.5); }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

    .btn-ghost {
      font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.88rem;
      border-radius: 12px; padding: 0.7rem 1.5rem; cursor: pointer; outline: none;
      background: transparent; color: var(--text-secondary);
      border: 1px solid var(--border); transition: all 0.25s ease;
    }
    .btn-ghost:hover { border-color: var(--border-glow); color: var(--text-primary); }
    .btn-ghost:disabled { opacity: 0.45; cursor: not-allowed; }

    .cc-form-actions { display: flex; gap: 0.85rem; padding-top: 0.5rem; }

    /* ─── Type Modal ─── */
    .cc-modal-overlay {
      position: fixed; inset: 0; z-index: 100;
      background: rgba(5,5,15,0.85); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; padding: 1rem;
      animation: mfade 0.2s ease;
    }
    @keyframes mfade { from{opacity:0} to{opacity:1} }
    .cc-modal {
      background: var(--card);
      border: 1px solid var(--border-glow);
      border-radius: 22px; padding: 2.5rem; width: 100%; max-width: 480px;
      position: relative; box-shadow: 0 30px 80px rgba(0,0,0,0.7);
      animation: mslide 0.3s ease;
    }
    @keyframes mslide { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
    .cc-modal::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, var(--accent-bright), transparent);
    }
    .cc-modal-eyebrow {
      font-size: 0.65rem; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase;
      color: var(--accent-bright); margin-bottom: 0.6rem;
    }
    .cc-modal-title {
      font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700;
      color: var(--text-primary); margin-bottom: 0.4rem;
    }
    .cc-modal-sub { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.75rem; }

    .cc-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .cc-type-btn {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      border-radius: 14px; padding: 1.1rem 0.85rem;
      cursor: pointer; text-align: left;
      transition: all 0.25s ease; outline: none;
    }
    .cc-type-btn:hover { border-color: var(--border-glow); background: rgba(168,85,247,0.08); }
    .cc-type-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; margin-bottom: 0.7rem;
    }
    .ti-clan  { background: rgba(249,115,22,0.15); color: var(--orange); }
    .ti-pub   { background: rgba(16,185,129,0.15); color: var(--green); }
    .ti-priv  { background: rgba(168,85,247,0.15); color: var(--accent-bright); }
    .cc-type-label { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.2rem; }
    .cc-type-desc  { font-size: 0.73rem; color: var(--text-muted); }

    /* Access denied */
    .cc-denied {
      background: var(--card); border: 1px solid rgba(239,68,68,0.2);
      border-radius: 18px; padding: 2.5rem; text-align: center; margin-top: 4rem;
    }
    .cc-denied-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .cc-denied-title {
      font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700;
      color: #f87171; margin-bottom: 0.5rem;
    }
    .cc-denied-sub { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; }

    /* Scrollbar */
    .cc-dropdown::-webkit-scrollbar { width: 4px; }
    .cc-dropdown::-webkit-scrollbar-track { background: transparent; }
    .cc-dropdown::-webkit-scrollbar-thumb { background: var(--border-glow); border-radius: 10px; }

    @media (max-width: 600px) {
      .cc-grid-2 { grid-template-columns: 1fr; }
      .cc-q-options { grid-template-columns: 1fr; }
      .cc-type-grid { grid-template-columns: 1fr; }
    }
  `}</style>
);

/* ══════════════════════════════════════
   TYPE SELECTION MODAL
══════════════════════════════════════ */
const TypeModal = ({ onSelect }) => {
  const types = [
    { key: 'clan-vs-clan', icon: FaShieldAlt,   cls: 'ti-clan', label: 'Clan vs Clan',   desc: 'Clan-based team battles' },
    { key: 'public',     icon: FaGlobe,      cls: 'ti-pub',  label: 'Public',         desc: 'Open to everyone' },
    { key: 'private',    icon: FaLock,       cls: 'ti-priv', label: 'Private',        desc: 'Invite-only access' },
  ];
  return (
    <div className="cc-modal-overlay">
      <div className="cc-modal">
        <div className="cc-modal-eyebrow">New Competition</div>
        <div className="cc-modal-title">Choose a Type</div>
        <div className="cc-modal-sub">Select the kind of competition you want to create</div>
        <div className="cc-type-grid">
          {types.map(t => (
            <button key={t.key} className="cc-type-btn" onClick={() => onSelect(t.key)}>
              <div className={`cc-type-icon ${t.cls}`}>
                <Icon as={t.icon} />
              </div>
              <div className="cc-type-label">{t.label}</div>
              <div className="cc-type-desc">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
const CompetitionCreate = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [showTypeModal, setShowTypeModal] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', competitionType: 'Quiz',
    startDate: '', endDate: '', clanId: null, questionCount: 5,
    isPublic: true, allowedMemberIds: [], allowedClanIds: [],
    pointRangeMin: null, pointRangeMax: null,
  });

  const [users, setUsers] = useState([]);
  const [clans, setClans] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedClans, setSelectedClans]     = useState([]);
  const [searchTerm, setSearchTerm]           = useState('');
  const [clanSearchTerm, setClanSearchTerm]   = useState('');

  const [questions, setQuestions] = useState(
    Array.from({ length: 5 }, () => ({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', points: 1 }))
  );

  const canCreate = user && (user.isTeacher || user.isAdmin || user.isStudent);
  const isClanLeader = false;

  const handleTypeSelect = (type) => {
    setShowTypeModal(false);
    if (type === 'clan-vs-clan') return navigate('/clans-competitions/create');
    if (type === 'public')  setFormData(prev => ({ ...prev, isPublic: true }));
    if (type === 'private') setFormData(prev => ({ ...prev, isPublic: false }));
  };

  useEffect(() => {
    if (formData.isPublic) return;
    const fetchData = async () => {
      try {
        const ur = await competitionApi.get('/admin/all-users');
        if (ur.data.success) setUsers(ur.data.data || []);
      } catch { /* silent */ }
      try {
        const cr = await competitionApi.get('/clans/search?pageSize=100&isPublic=true');
        if (cr.data.success) setClans(cr.data.clans || cr.data.data || []);
      } catch { /* silent */ }
    };
    fetchData();
  }, [formData.isPublic]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'questionCount') {
      const count = Math.max(1, parseInt(value) || 1);
      setFormData(prev => ({ ...prev, questionCount: count }));
      setQuestions(prev => {
        if (count > prev.length) return [...prev, ...Array.from({ length: count - prev.length }, () => ({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', points: 1 }))];
        return prev.slice(0, count);
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: name === 'clanId' ? (value ? parseInt(value) : null) : value }));
    }
  };

  const handleVisibilityToggle = () => {
    setFormData(prev => {
      const toPublic = !prev.isPublic;
      if (toPublic) { setSelectedMembers([]); setSelectedClans([]); }
      return { ...prev, isPublic: toPublic, allowedMemberIds: [], allowedClanIds: [], pointRangeMin: null, pointRangeMax: null };
    });
  };

  const handleMemberSelect = (uid) => {
    if (selectedMembers.some(m => m.id === uid)) return;
    const member = users.find(u => u.id === uid);
    if (!member) return;
    const updated = [...selectedMembers, member];
    setSelectedMembers(updated);
    setFormData(prev => ({ ...prev, allowedMemberIds: updated.map(m => m.id) }));
    setSearchTerm('');
  };
  const handleMemberRemove = (uid) => {
    const updated = selectedMembers.filter(m => m.id !== uid);
    setSelectedMembers(updated);
    setFormData(prev => ({ ...prev, allowedMemberIds: updated.map(m => m.id) }));
  };

  const handleClanSelect = (cid) => {
    if (selectedClans.some(c => c.id === cid)) return;
    const clan = clans.find(c => c.id === cid);
    if (!clan) return;
    const updated = [...selectedClans, clan];
    setSelectedClans(updated);
    setFormData(prev => ({ ...prev, allowedClanIds: updated.map(c => c.id) }));
    setClanSearchTerm('');
  };
  const handleClanRemove = (cid) => {
    const updated = selectedClans.filter(c => c.id !== cid);
    setSelectedClans(updated);
    setFormData(prev => ({ ...prev, allowedClanIds: updated.map(c => c.id) }));
  };

  const handleQuestionChange = (idx, field, value) => {
    setQuestions(prev => { const q = [...prev]; q[idx] = { ...q[idx], [field]: value }; return q; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast({ title: 'Title is required', status: 'error', duration: 3000, isClosable: true });
    if (!formData.startDate || !formData.endDate) return toast({ title: 'Dates are required', status: 'error', duration: 3000, isClosable: true });
    if (new Date(formData.endDate) <= new Date(formData.startDate)) return toast({ title: 'End date must be after start date', status: 'error', duration: 3000, isClosable: true });
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) return toast({ title: `Q${i + 1}: Question text required`, status: 'error', duration: 3000, isClosable: true });
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) return toast({ title: `Q${i + 1}: All 4 options required`, status: 'error', duration: 3000, isClosable: true });
    }
    if (!formData.isPublic && !formData.allowedMemberIds.length && !formData.allowedClanIds.length)
      return toast({ title: 'Private competitions need at least one member or clan', status: 'error', duration: 3000, isClosable: true });

    try {
      setLoading(true);
      const res = await competitionApi.post('/competitions', {
        title: formData.title, description: formData.description,
        competitionType: formData.competitionType,
        startDate: new Date(formData.startDate).toISOString(),
        endDate:   new Date(formData.endDate).toISOString(),
        clanId: formData.clanId, isPublic: formData.isPublic,
        allowedMemberIds: formData.isPublic ? null : formData.allowedMemberIds,
        allowedClanIds:   formData.isPublic ? null : formData.allowedClanIds,
        pointRangeMin: formData.pointRangeMin, pointRangeMax: formData.pointRangeMax,
        questions: questions.map((q, i) => ({ ...q, points: q.points || 1, order: i + 1 })),
      });
      if (res.data.success) {
        toast({ title: '🎉 Competition Created!', description: res.data.message, status: 'success', duration: 3000, isClosable: true });
        navigate(`/competitions/${res.data.data.id}`);
      }
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to create competition', status: 'error', duration: 3000, isClosable: true });
    } finally { setLoading(false); }
  };

  const filteredUsers = users.filter(u =>
    !selectedMembers.some(m => m.id === u.id) &&
    (u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const filteredClans = clans.filter(c =>
    !selectedClans.some(sc => sc.id === c.id) &&
    (c.name?.toLowerCase().includes(clanSearchTerm.toLowerCase()) || c.tag?.toLowerCase().includes(clanSearchTerm.toLowerCase()))
  );

  /* ── Access denied ── */
  if (!canCreate) return (
    <><CosmicStyle />
      <div className="cc-page">
        <div className="cc-nebula" /><div className="cc-stars" />
        <div className="cc-wrap">
          <div className="cc-denied">
            <div className="cc-denied-icon">🔒</div>
            <div className="cc-denied-title">Access Denied</div>
            <div className="cc-denied-sub">Only Teachers, Admins, Students, and Clan Leaders can create competitions.</div>
            <button className="btn-primary" onClick={() => navigate('/competitions')}>
              Back to Competitions
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <CosmicStyle />
      <div className="cc-page">
        <div className="cc-nebula" /><div className="cc-stars" />

        {/* Type selection modal */}
        {showTypeModal && <TypeModal onSelect={handleTypeSelect} />}

        {!showTypeModal && (
          <div className="cc-wrap">
            <button className="cc-back" onClick={() => navigate('/competitions')}>
              <Icon as={FaArrowLeft} /> All Competitions
            </button>

            {/* Header */}
            <div className="cc-eyebrow">Create</div>
            <div className="cc-title">New Competition</div>
            <div className="cc-sub">
              {user?.role === 'Student'
                ? 'Your competition will be submitted for admin approval.'
                : 'Your competition will be published immediately.'}
            </div>

            {user?.role === 'Student' && (
              <div className="cc-alert">
                <Icon as={FaCheckCircle} style={{ fontSize: '0.9rem', flexShrink: 0 }} />
                Competitions created by students require admin approval before they appear publicly.
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* ── Basic Info ── */}
              <div className="cc-section">
                <div className="cc-section-title">
                  <Icon as={FaCheckCircle} className="cc-section-icon" /> Basic Info
                </div>

                <div className="cc-field">
                  <label className="cc-label">Title <span className="req">*</span></label>
                  <input className="cc-input" type="text" name="title" placeholder="e.g., JavaScript Quiz Challenge"
                    value={formData.title} onChange={handleChange} disabled={loading} />
                </div>

                <div className="cc-field">
                  <label className="cc-label">Description</label>
                  <textarea className="cc-textarea" name="description" placeholder="Describe the competition, rules, and objectives..."
                    value={formData.description} onChange={handleChange} disabled={loading} rows={4} />
                </div>

                <div className="cc-grid-2">
                  <div className="cc-field">
                    <label className="cc-label">Competition Type <span className="req">*</span></label>
                    <select className="cc-select" name="competitionType" value={formData.competitionType} onChange={handleChange} disabled={loading}>
                      <option value="Quiz">Quiz</option>
                      <option value="Assignment">Assignment</option>
                      <option value="Programming">Programming</option>
                      <option value="Essay">Essay</option>
                      <option value="Debate">Debate</option>
                    </select>
                    <div className="cc-hint">Used for categorization only</div>
                  </div>
                  <div className="cc-field">
                    <label className="cc-label">Number of Questions <span className="req">*</span></label>
                    <input className="cc-input" type="number" name="questionCount" min={1} max={50}
                      value={formData.questionCount} onChange={handleChange} disabled={loading} />
                  </div>
                </div>

                <div className="cc-grid-2">
                  <div className="cc-field">
                    <label className="cc-label">Start Date & Time <span className="req">*</span></label>
                    <input className="cc-input" type="datetime-local" name="startDate"
                      value={formData.startDate} onChange={handleChange} disabled={loading}
                      style={{ colorScheme: 'dark' }} />
                  </div>
                  <div className="cc-field">
                    <label className="cc-label">End Date & Time <span className="req">*</span></label>
                    <input className="cc-input" type="datetime-local" name="endDate"
                      value={formData.endDate} onChange={handleChange} disabled={loading}
                      style={{ colorScheme: 'dark' }} />
                  </div>
                </div>

                {(isClanLeader || user?.role === 'Student') && (
                  <div className="cc-field">
                    <label className="cc-label">Clan ID (Optional)</label>
                    <input className="cc-input" type="number" name="clanId" placeholder="Leave empty if not clan-specific"
                      value={formData.clanId || ''} onChange={handleChange} disabled={loading} />
                  </div>
                )}
              </div>

              {/* ── Visibility ── */}
              <div className="cc-section">
                <div className="cc-section-title">
                  <Icon as={formData.isPublic ? FaGlobe : FaLock} className="cc-section-icon" />
                  Visibility
                </div>

                <div className="cc-visibility-row">
                  <div className="cc-vis-info">
                    <div className={`cc-vis-icon ${formData.isPublic ? 'vi-public' : 'vi-private'}`}>
                      <Icon as={formData.isPublic ? FaGlobe : FaLock} />
                    </div>
                    <div>
                      <div className="cc-vis-label">{formData.isPublic ? 'Public' : 'Private'}</div>
                      <div className="cc-vis-desc">{formData.isPublic ? 'Anyone can join this competition.' : 'Only selected members can join.'}</div>
                    </div>
                  </div>
                  <Switch isChecked={formData.isPublic} onChange={handleVisibilityToggle} colorScheme="purple" size="lg" />
                </div>

                {!formData.isPublic && (
                  <div className="cc-private-box">
                    <div className="cc-private-title">Allowed Members</div>

                    {selectedMembers.length > 0 && (
                      <div className="cc-tags">
                        {selectedMembers.map(m => (
                          <span key={m.id} className="cc-tag tag-member">
                            {m.userName || m.email}
                            <button className="cc-tag-remove" onClick={() => handleMemberRemove(m.id)}>
                              <Icon as={FaTimes} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="cc-search-wrap">
                      <input className="cc-input" placeholder="Search users..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)} />
                      {searchTerm.length > 0 && (
                        <div className="cc-dropdown">
                          {filteredUsers.length > 0 ? filteredUsers.map(u => (
                            <div key={u.id} className="cc-dropdown-item" onClick={() => handleMemberSelect(u.id)}>
                              <div className="cc-dropdown-name">{u.userName || 'Unknown'}</div>
                              <div className="cc-dropdown-sub">{u.email}</div>
                            </div>
                          )) : <div className="cc-dropdown-empty">No users found</div>}
                        </div>
                      )}
                    </div>

                    {/* Clans */}
                    <div style={{ marginTop: '1.25rem' }}>
                      <div className="cc-private-title" style={{ color: 'var(--cyan)' }}>Allowed Clans</div>
                      <div className="cc-hint" style={{ marginBottom: '0.75rem' }}>All clan members will be included automatically</div>

                      {selectedClans.length > 0 && (
                        <div className="cc-tags">
                          {selectedClans.map(c => (
                            <span key={c.id} className="cc-tag tag-clan">
                              {c.name || `Clan ${c.id}`}
                              <button className="cc-tag-remove" onClick={() => handleClanRemove(c.id)}>
                                <Icon as={FaTimes} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="cc-search-wrap">
                        <input className="cc-input" placeholder="Search clans..." value={clanSearchTerm}
                          onChange={e => setClanSearchTerm(e.target.value)} />
                        {clanSearchTerm.length > 0 && (
                          <div className="cc-dropdown">
                            {filteredClans.length > 0 ? filteredClans.map(c => (
                              <div key={c.id} className="cc-dropdown-item" onClick={() => handleClanSelect(c.id)}>
                                <div className="cc-dropdown-name">{c.name || 'Unknown'}</div>
                                <div className="cc-dropdown-sub">{c.tag} · {c.memberCount || 0} members</div>
                              </div>
                            )) : <div className="cc-dropdown-empty">No clans found</div>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Point range */}
                    {selectedClans.length > 0 && (
                      <div className="cc-point-range">
                        <div className="cc-point-title">Point Range Filter (Optional)</div>
                        <div className="cc-point-desc">Restrict clan members to those within a specific point range</div>
                        <div className="cc-grid-2">
                          <div>
                            <label className="cc-label">Min Points</label>
                            <input className="cc-input" type="number" placeholder="e.g., 100"
                              value={formData.pointRangeMin || ''}
                              onChange={e => setFormData(prev => ({ ...prev, pointRangeMin: e.target.value ? parseInt(e.target.value) : null }))} />
                          </div>
                          <div>
                            <label className="cc-label">Max Points</label>
                            <input className="cc-input" type="number" placeholder="e.g., 1000"
                              value={formData.pointRangeMax || ''}
                              onChange={e => setFormData(prev => ({ ...prev, pointRangeMax: e.target.value ? parseInt(e.target.value) : null }))} />
                          </div>
                        </div>
                        {formData.pointRangeMin != null && formData.pointRangeMax != null && (
                          <div className="cc-hint" style={{ color: 'var(--cyan)', marginTop: '0.5rem' }}>
                            Only members with {formData.pointRangeMin}–{formData.pointRangeMax} points will be included
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Questions ── */}
              <div className="cc-section">
                <div className="cc-section-title">
                  <Icon as={FaCheckCircle} className="cc-section-icon" /> Questions
                </div>

                {questions.map((q, idx) => (
                  <div className="cc-q-card" key={idx}>
                    <div className="cc-q-header">
                      <div className="cc-q-num">
                        <span className="cc-q-num-badge">{idx + 1}</span>
                        Question {idx + 1}
                      </div>
                    </div>

                    <div className="cc-field">
                      <label className="cc-label">Question Text <span className="req">*</span></label>
                      <textarea className="cc-textarea" placeholder="Enter your question..." rows={2}
                        value={q.questionText} onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)}
                        disabled={loading} />
                    </div>

                    <div className="cc-q-options">
                      {['A', 'B', 'C', 'D'].map(key => (
                        <div key={key} className="cc-q-option">
                          <div className="cc-q-option-key">{key}</div>
                          <input className="cc-input" placeholder={`Option ${key}`}
                            value={q[`option${key}`]} disabled={loading}
                            onChange={e => handleQuestionChange(idx, `option${key}`, e.target.value)}
                            style={{ flex: 1 }} />
                        </div>
                      ))}
                    </div>

                    <div className="cc-q-bottom">
                      <div>
                        <label className="cc-label">Correct Answer <span className="req">*</span></label>
                        <select className="cc-select" value={q.correctAnswer} disabled={loading}
                          onChange={e => handleQuestionChange(idx, 'correctAnswer', e.target.value)}>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                      <div>
                        <label className="cc-label">Points</label>
                        <input className="cc-input" type="number" min={1} value={q.points} disabled={loading}
                          onChange={e => handleQuestionChange(idx, 'points', parseInt(e.target.value) || 1)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Actions ── */}
              <div className="cc-form-actions">
                <button type="submit" className="btn-primary" disabled={loading || !formData.title.trim()}>
                  {loading ? 'Creating...' : <>Create Competition <Icon as={FaCheckCircle} style={{ fontSize: '0.8rem' }} /></>}
                </button>
                <button type="button" className="btn-ghost" disabled={loading} onClick={() => navigate('/competitions')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default CompetitionCreate;
