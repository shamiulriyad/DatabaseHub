import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Icon,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { FaSearch, FaTrophy, FaUsers, FaClock, FaFire, FaPlus, FaCalendarWeek, FaCalendarAlt, FaSun, FaList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import competitionApi from '../../services/api';
import CosmicBg from '../../components/CosmicBg';

/* ─────────────────────────────────────────────
   COSMIC DARK PREMIUM — global style injection
───────────────────────────────────────────── */
const CosmicStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --void: #05050f;
      --deep: #0a0a1a;
      --surface: #0f0f23;
      --card: #11112a;
      --card-hover: #161635;
      --border: rgba(139,92,246,0.15);
      --border-glow: rgba(139,92,246,0.4);
      --accent: #7c3aed;
      --accent-bright: #a855f7;
      --accent-glow: rgba(168,85,247,0.25);
      --gold: #f59e0b;
      --gold-glow: rgba(245,158,11,0.2);
      --cyan: #06b6d4;
      --green: #10b981;
      --text-primary: #f1f0ff;
      --text-secondary: #9b99b8;
      --text-muted: #5a5880;
    }

    .comp-page * { box-sizing: border-box; }

    .comp-page {
      font-family: 'DM Sans', sans-serif;
      background: var(--void);
      min-height: 100vh;
    }

    /* Nebula background */
    .nebula-bg {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    .nebula-bg::before {
      content: '';
      position: absolute;
      top: -20%;
      left: -10%;
      width: 60%;
      height: 60%;
      background: radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 70%);
      animation: nebulaDrift 18s ease-in-out infinite alternate;
    }
    .nebula-bg::after {
      content: '';
      position: absolute;
      bottom: -10%;
      right: -10%;
      width: 55%;
      height: 55%;
      background: radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 70%);
      animation: nebulaDrift 22s ease-in-out infinite alternate-reverse;
    }
    @keyframes nebulaDrift {
      from { transform: translate(0, 0) scale(1); }
      to   { transform: translate(3%, 5%) scale(1.05); }
    }

    /* Stars */
    .stars {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background-image:
        radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,0.6) 0%, transparent 100%),
        radial-gradient(1px 1px at 40% 60%, rgba(255,255,255,0.4) 0%, transparent 100%),
        radial-gradient(1px 1px at 70% 10%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 85% 75%, rgba(255,255,255,0.3) 0%, transparent 100%),
        radial-gradient(1px 1px at 55% 40%, rgba(168,85,247,0.6) 0%, transparent 100%),
        radial-gradient(1px 1px at 25% 85%, rgba(6,182,212,0.5) 0%, transparent 100%),
        radial-gradient(2px 2px at 90% 30%, rgba(255,255,255,0.4) 0%, transparent 100%),
        radial-gradient(1px 1px at 5%  50%, rgba(255,255,255,0.3) 0%, transparent 100%);
    }

    .content-wrap { position: relative; z-index: 1; }

    /* ─── Header ─── */
    .comp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .comp-eyebrow {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--accent-bright);
      margin-bottom: 0.4rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .comp-eyebrow::before {
      content: '';
      display: inline-block;
      width: 24px;
      height: 1px;
      background: var(--accent-bright);
    }

    .comp-title {
      font-family: 'Playfair Display', serif !important;
      font-size: clamp(2rem, 4vw, 3rem) !important;
      font-weight: 700 !important;
      color: var(--text-primary) !important;
      line-height: 1.15 !important;
      letter-spacing: -0.01em;
      background: linear-gradient(135deg, #f1f0ff 0%, #c4b5fd 50%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ─── Create Button ─── */
    .btn-create {
      font-family: 'DM Sans', sans-serif !important;
      font-weight: 600 !important;
      font-size: 0.85rem !important;
      letter-spacing: 0.04em;
      background: linear-gradient(135deg, #7c3aed, #a855f7) !important;
      color: #fff !important;
      border: none !important;
      border-radius: 10px !important;
      padding: 0.6rem 1.4rem !important;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease !important;
      box-shadow: 0 4px 20px rgba(124,58,237,0.35) !important;
    }
    .btn-create::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .btn-create:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 30px rgba(124,58,237,0.5) !important; }
    .btn-create:hover::before { opacity: 1; }

    /* ─── Filters ─── */
    .filter-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 2.5rem;
      align-items: center;
    }

    .filter-input-wrap {
      position: relative;
      flex: 1;
      max-width: 420px;
    }
    .filter-input-wrap .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 0.85rem;
      pointer-events: none;
      z-index: 2;
    }
    .filter-input {
      width: 100%;
      background: var(--card) !important;
      border: 1px solid var(--border) !important;
      border-radius: 10px !important;
      padding: 0.65rem 1rem 0.65rem 2.6rem !important;
      color: var(--text-primary) !important;
      font-family: 'DM Sans', sans-serif !important;
      font-size: 0.88rem !important;
      transition: border-color 0.2s, box-shadow 0.2s !important;
      outline: none !important;
    }
    .filter-input::placeholder { color: var(--text-muted) !important; }
    .filter-input:focus {
      border-color: var(--border-glow) !important;
      box-shadow: 0 0 0 3px var(--accent-glow) !important;
    }

    .filter-select {
      background: var(--card) !important;
      border: 1px solid var(--border) !important;
      border-radius: 10px !important;
      padding: 0.65rem 2.2rem 0.65rem 1rem !important;
      color: var(--text-primary) !important;
      font-family: 'DM Sans', sans-serif !important;
      font-size: 0.88rem !important;
      min-width: 170px;
      transition: border-color 0.2s !important;
      outline: none !important;
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239b99b8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") !important;
      background-repeat: no-repeat !important;
      background-position: right 0.85rem center !important;
      background-size: 10px !important;
    }
    .filter-select:focus { border-color: var(--border-glow) !important; box-shadow: 0 0 0 3px var(--accent-glow) !important; }
    .filter-select option { background: #1a1a3a; color: var(--text-primary); }

    /* ─── Stats Bar ─── */
    .stats-bar {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .stat-chip {
      background: rgba(139,92,246,0.08);
      border: 1px solid var(--border);
      border-radius: 100px;
      padding: 0.3rem 0.9rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-family: 'DM Sans', sans-serif;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .stat-chip .dot {
      width: 6px; height: 6px;
      border-radius: 50%;
    }
    .dot-ongoing  { background: var(--green); box-shadow: 0 0 6px var(--green); }
    .dot-upcoming { background: var(--cyan);  box-shadow: 0 0 6px var(--cyan); }
    .dot-done     { background: var(--text-muted); }

    /* ─── Grid ─── */
    .comp-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    /* ─── Tab Navigation ─── */
    .tabs-container {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .tab-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      background: var(--card);
      border: 2px solid var(--border);
      border-radius: 14px;
      padding: 1rem 1.5rem;
      cursor: pointer;
      transition: all 0.25s ease;
      min-width: 120px;
    }
    .tab-box:hover {
      border-color: var(--border-glow);
      background: var(--card-hover);
      transform: translateY(-2px);
    }
    .tab-box.active {
      border-color: var(--accent-bright);
      background: rgba(124,58,237,0.15);
      box-shadow: 0 0 20px rgba(124,58,237,0.25);
    }
    .tab-box .tab-icon {
      font-size: 1.2rem;
      color: var(--text-muted);
      transition: color 0.25s;
    }
    .tab-box.active .tab-icon {
      color: var(--accent-bright);
    }
    .tab-box .tab-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-secondary);
      transition: color 0.25s;
    }
    .tab-box.active .tab-title {
      color: var(--text-primary);
    }
    .tab-box .tab-count {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.68rem;
      color: var(--text-muted);
      border: 1px solid var(--border);
      border-radius: 100px;
      padding: 0.15rem 0.5rem;
      background: rgba(255,255,255,0.03);
      transition: all 0.25s;
    }
    .tab-box.active .tab-count {
      border-color: var(--accent);
      color: var(--accent-bright);
      background: rgba(124,58,237,0.1);
    }

    /* ─── Tab Content ─── */
    .tab-content {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.25rem;
      min-height: 300px;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .tab-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem 1rem;
      color: var(--text-muted);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
    }
    .tab-empty-icon {
      font-size: 2.5rem;
      opacity: 0.4;
    }

    @media (max-width: 600px) {
      .tabs-container {
        gap: 0.5rem;
      }
      .tab-box {
        padding: 0.75rem 1rem;
        min-width: 90px;
      }
      .tab-box .tab-icon {
        font-size: 1rem;
      }
      .tab-box .tab-title {
        font-size: 0.75rem;
      }
    }

    /* ─── Card ─── */
    .comp-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.6rem;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
      cursor: default;
    }
    .comp-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--accent-bright), transparent);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .comp-card:hover {
      transform: translateY(-5px);
      border-color: var(--border-glow);
      box-shadow: 0 20px 60px rgba(124,58,237,0.2), 0 0 0 1px rgba(168,85,247,0.1);
    }
    .comp-card:hover::before { opacity: 1; }

    /* Corner accent */
    .comp-card::after {
      content: '';
      position: absolute;
      top: -40px; right: -40px;
      width: 100px; height: 100px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%);
      transition: transform 0.3s;
    }
    .comp-card:hover::after { transform: scale(1.5); }

    /* ─── Card inner ─── */
    .card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .card-title {
      font-family: 'Playfair Display', serif !important;
      font-size: 1.1rem !important;
      font-weight: 600 !important;
      color: var(--text-primary) !important;
      line-height: 1.35 !important;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Status badge */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.7rem;
      border-radius: 100px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .badge-ongoing {
      background: rgba(16,185,129,0.12);
      color: #34d399;
      border: 1px solid rgba(16,185,129,0.25);
    }
    .badge-upcoming {
      background: rgba(6,182,212,0.12);
      color: #22d3ee;
      border: 1px solid rgba(6,182,212,0.25);
    }
    .badge-completed {
      background: rgba(100,116,139,0.15);
      color: #94a3b8;
      border: 1px solid rgba(100,116,139,0.2);
    }
    .badge-icon { font-size: 0.6rem; }

    .card-desc {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.83rem;
      color: var(--text-secondary);
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Meta row */
    .card-meta {
      display: flex;
      align-items: center;
      gap: 1.2rem;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .meta-icon { font-size: 0.75rem; color: var(--text-muted); }
    .meta-icon.gold { color: var(--gold); }

    /* Divider */
    .card-divider {
      height: 1px;
      background: linear-gradient(90deg, var(--border), transparent);
    }

    /* Dates */
    .card-dates {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .date-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .date-label { font-weight: 500; color: var(--text-secondary); }

    /* Progress bar (for ongoing) */
    .progress-wrap { display: flex; flex-direction: column; gap: 0.4rem; }
    .progress-label {
      display: flex; justify-content: space-between;
      font-size: 0.72rem; font-family: 'DM Sans', sans-serif;
      color: var(--text-muted);
    }
    .progress-track {
      height: 3px; background: rgba(255,255,255,0.06);
      border-radius: 100px; overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--accent-bright));
      border-radius: 100px;
      box-shadow: 0 0 8px var(--accent-glow);
    }

    /* Action button */
    .btn-view {
      width: 100%;
      background: transparent !important;
      border: 1px solid var(--border-glow) !important;
      border-radius: 10px !important;
      padding: 0.6rem 1rem !important;
      color: var(--accent-bright) !important;
      font-family: 'DM Sans', sans-serif !important;
      font-size: 0.82rem !important;
      font-weight: 600 !important;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: all 0.25s ease !important;
      position: relative;
      overflow: hidden;
    }
    .btn-view::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--accent), var(--accent-bright));
      opacity: 0;
      transition: opacity 0.25s;
    }
    .btn-view:hover {
      border-color: var(--accent-bright) !important;
      color: #fff !important;
      box-shadow: 0 4px 20px var(--accent-glow) !important;
    }
    .btn-view:hover::before { opacity: 1; }
    .btn-view span { position: relative; z-index: 1; }

    /* ─── Empty / Loading states ─── */
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 5rem 2rem;
      background: var(--card);
      border: 1px dashed var(--border);
      border-radius: 20px;
    }
    .empty-icon {
      font-size: 3rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
    .empty-text {
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }
    .empty-sub {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .loading-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6rem 2rem;
      gap: 1.2rem;
    }
    .loading-text {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      color: var(--text-muted);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50%       { opacity: 1; }
    }

    /* Card entry animation */
    .comp-card { animation: cardFadeUp 0.5s ease both; }
    @keyframes cardFadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `}</style>
);

/* ─── helpers ─── */
const getProgress = (start, end) => {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (now <= s) return 0;
  if (now >= e) return 100;
  return Math.round(((now - s) / (e - s)) * 100);
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const getStatusBadgeClass = (status) => {
  const map = { ongoing: 'badge-ongoing', upcoming: 'badge-upcoming', completed: 'badge-completed' };
  return map[status?.toLowerCase()] || 'badge-upcoming';
};

const StatusIcon = ({ status }) => {
  const icons = { ongoing: FaFire, upcoming: FaClock, completed: FaTrophy };
  const Ic = icons[status?.toLowerCase()] || FaClock;
  return <Icon as={Ic} className="badge-icon" />;
};

const detectPeriodBucket = (competition) => {
  const typeRaw = String(competition?.competitionType || '').toLowerCase();
  if (typeRaw.includes('weekly')) return 'weekly';
  if (typeRaw.includes('monthly')) return 'monthly';
  if (typeRaw.includes('season')) return 'seasonal';

  const periodRaw = String(
    competition?.competitionPeriod ||
    competition?.period ||
    competition?.scheduleType ||
    ''
  ).toLowerCase();

  if (periodRaw.includes('weekly')) return 'weekly';
  if (periodRaw.includes('monthly')) return 'monthly';
  if (periodRaw.includes('season')) return 'seasonal';

  return null;
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const CompetitionList = () => {
  const [competitions, setCompetitions] = useState([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('normal');
  const navigate = useNavigate();
  const toast = useToast();

  const fetchCompetitions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await competitionApi.get('/competitions', {
        params: { page: 1, pageSize: 20 }
      });
      if (response.data.success) {
        setCompetitions(response.data.data || []);
        setFilteredCompetitions(response.data.data || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load competitions',
        status: 'error', duration: 3000, isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchCompetitions(); }, [fetchCompetitions]);

  useEffect(() => {
    let filtered = competitions;
    if (statusFilter !== 'all') filtered = filtered.filter(c => c.status === statusFilter);
    if (searchTerm) filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompetitions(filtered);
  }, [searchTerm, statusFilter, competitions]);

  const ongoingCount  = competitions.filter(c => c.status === 'ongoing').length;
  const upcomingCount = competitions.filter(c => c.status === 'upcoming').length;

  const sectionedCompetitions = useMemo(() => {
    const sections = {
      normal: [],
      weekly: [],
      monthly: [],
      seasonal: [],
    };

    filteredCompetitions.forEach((competition) => {
      const creatorRole = String(competition?.creatorRole || '').toLowerCase();
      const isAdminHosted = creatorRole === 'admin';
      const bucket = detectPeriodBucket(competition);

      if (isAdminHosted && bucket) {
        sections[bucket].push(competition);
      } else {
        sections.normal.push(competition);
      }
    });

    return sections;
  }, [filteredCompetitions]);

  const renderCompetitionCard = (comp, i) => {
    const progress = getProgress(comp.startDate, comp.endDate);
    return (
      <div
        className="comp-card"
        key={comp.id}
        style={{ animationDelay: `${i * 0.07}s` }}
      >
        <div className="card-top">
          <div className="card-title">{comp.title}</div>
          <div className={`status-badge ${getStatusBadgeClass(comp.status)}`}>
            <StatusIcon status={comp.status} />
            {comp.status}
          </div>
        </div>

        <div className="card-desc">
          {comp.description || 'No description provided'}
        </div>

        <div className="card-meta">
          <div className="meta-item">
            <Icon as={FaUsers} className="meta-icon" />
            <span>{comp.participantCount} joined</span>
          </div>
          {comp.prizePool > 0 && (
            <div className="meta-item">
              <Icon as={FaTrophy} className="meta-icon gold" />
              <span style={{ color: '#fbbf24' }}>${comp.prizePool}</span>
            </div>
          )}
        </div>

        <div className="card-divider" />

        {comp.status?.toLowerCase() === 'ongoing' && (
          <div className="progress-wrap">
            <div className="progress-label">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="card-dates">
          <div className="date-row">
            <span className="date-label">Start</span>
            <span>{formatDate(comp.startDate)}</span>
          </div>
          <div className="date-row">
            <span className="date-label">End</span>
            <span>{formatDate(comp.endDate)}</span>
          </div>
        </div>

        <button className="btn-view" onClick={() => navigate(`/competitions/${comp.id}`)}>
          <span>View Details →</span>
        </button>
      </div>
    );
  };

  const tabs = [
    { key: 'normal', title: 'Normal', icon: FaList },
    { key: 'weekly', title: 'Weekly', icon: FaCalendarWeek },
    { key: 'monthly', title: 'Monthly', icon: FaCalendarAlt },
    { key: 'seasonal', title: 'Seasonal', icon: FaSun },
  ];

  const renderTabContent = () => {
    const items = sectionedCompetitions[activeTab];
    if (items.length === 0) {
      return (
        <div className="tab-empty">
          <div className="tab-empty-icon">📭</div>
          <div>No competitions in {activeTab} section</div>
        </div>
      );
    }
    return (
      <div className="comp-grid">
        {items.map((competition, index) => renderCompetitionCard(competition, index))}
      </div>
    );
  };

  return (
    <>
      <CosmicStyle />
      <div className="comp-page" style={{ background: '#070B1A' }}>
        <CosmicBg />
        <div className="nebula-bg" />
        <div className="stars" />

        <div className="content-wrap" style={{ padding: '3rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>

          {/* ─── Header ─── */}
          <div className="comp-header">
            <div>
              <div className="comp-eyebrow">Arena</div>
              <h1 className="comp-title">Competitions</h1>
            </div>
            <button className="btn-create" onClick={() => navigate('/competitions/create')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon as={FaPlus} style={{ fontSize: '0.75rem' }} />
                Create Competition
              </span>
            </button>
          </div>

          {/* ─── Filters ─── */}
          <div className="filter-row">
            <div className="filter-input-wrap">
              <Icon as={FaSearch} className="search-icon" />
              <input
                className="filter-input"
                placeholder="Search competitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* ─── Stats bar ─── */}
          <div className="stats-bar">
            <div className="stat-chip">
              <span className="dot dot-ongoing" />
              {ongoingCount} Live
            </div>
            <div className="stat-chip">
              <span className="dot dot-upcoming" />
              {upcomingCount} Upcoming
            </div>
            <div className="stat-chip">
              <span className="dot dot-done" />
              {competitions.length - ongoingCount - upcomingCount} Ended
            </div>
            <div className="stat-chip" style={{ marginLeft: 'auto' }}>
              {filteredCompetitions.length} shown
            </div>
          </div>

          {/* ─── Content ─── */}
          {loading ? (
            <div className="loading-wrap">
              <Spinner size="xl" color="#a855f7" thickness="3px" speed="0.8s" />
              <div className="loading-text">Loading Competitions...</div>
            </div>
          ) : (
            filteredCompetitions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏆</div>
                <div className="empty-text">No competitions found</div>
                <div className="empty-sub">Try adjusting your filters or create a new one</div>
              </div>
            ) : (
              <>
                {/* Tab Boxes - Side by Side */}
                <div className="tabs-container">
                  {tabs.map((tab) => (
                    <div
                      key={tab.key}
                      className={`tab-box ${activeTab === tab.key ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      <Icon as={tab.icon} className="tab-icon" />
                      <span className="tab-title">{tab.title}</span>
                      <span className="tab-count">{sectionedCompetitions[tab.key].length} items</span>
                    </div>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="tab-content" key={activeTab}>
                  {renderTabContent()}
                </div>
              </>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default CompetitionList;