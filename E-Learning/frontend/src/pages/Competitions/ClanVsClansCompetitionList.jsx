import React, { useEffect, useState } from "react";
import { Icon, useToast } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import {
  FaShieldAlt, FaPlus, FaArrowRight, FaFire, FaClock,
  FaCheckCircle, FaTimes, FaStar, FaUsers,
} from "react-icons/fa";

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
      --text-primary:  #f1f0ff;
      --text-secondary:#9b99b8;
      --text-muted:    #5a5880;
    }

    .cvl-page * { box-sizing: border-box; margin: 0; padding: 0; }
    .cvl-page {
      font-family: 'DM Sans', sans-serif;
      background: var(--void); min-height: 100vh; color: var(--text-primary);
    }

    /* Nebula */
    .cvl-nebula { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
    .cvl-nebula::before {
      content: ''; position: absolute; top: -20%; left: -10%; width: 55%; height: 55%;
      background: radial-gradient(ellipse, rgba(124,58,237,0.09) 0%, transparent 70%);
      animation: nn 20s ease-in-out infinite alternate;
    }
    .cvl-nebula::after {
      content: ''; position: absolute; bottom: -15%; right: -10%; width: 50%; height: 50%;
      background: radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%);
      animation: nn 26s ease-in-out infinite alternate-reverse;
    }
    @keyframes nn { from{transform:translate(0,0)scale(1)} to{transform:translate(4%,5%)scale(1.06)} }
    .cvl-stars {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 40% 65%, rgba(255,255,255,0.35) 0%, transparent 100%),
        radial-gradient(1px 1px at 75% 10%, rgba(255,255,255,0.45) 0%, transparent 100%),
        radial-gradient(1px 1px at 55% 45%, rgba(168,85,247,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 88% 72%, rgba(249,115,22,0.35) 0%, transparent 100%);
    }

    .cvl-wrap { position: relative; z-index: 1; padding: 2.5rem 1.5rem; max-width: 1200px; margin: 0 auto; }

    /* ─── Header ─── */
    .cvl-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;
    }
    .cvl-eyebrow {
      font-size: 0.68rem; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase;
      color: var(--orange); display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.5rem;
    }
    .cvl-eyebrow::before { content: ''; display: inline-block; width: 20px; height: 1px; background: var(--orange); }
    .cvl-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 700; line-height: 1.15;
      background: linear-gradient(135deg, #fff5ed 0%, #fdba74 50%, #f97316 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      margin-bottom: 0.3rem;
    }
    .cvl-sub { font-size: 0.85rem; color: var(--text-muted); }

    /* ─── Create button ─── */
    .btn-create-clan {
      font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.85rem;
      letter-spacing: 0.04em; border-radius: 12px; padding: 0.65rem 1.4rem;
      cursor: pointer; border: none; outline: none;
      background: linear-gradient(135deg, #ea580c, #f97316); color: #fff;
      box-shadow: 0 4px 20px rgba(249,115,22,0.35);
      transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.5rem;
      white-space: nowrap;
    }
    .btn-create-clan:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(249,115,22,0.5); }

    /* ─── Stats strip ─── */
    .cvl-strip {
      display: flex; gap: 0.65rem; margin-bottom: 2rem; flex-wrap: wrap;
    }
    .cvl-chip {
      display: flex; align-items: center; gap: 0.45rem;
      background: rgba(255,255,255,0.025); border: 1px solid var(--border);
      border-radius: 100px; padding: 0.35rem 0.9rem;
      font-size: 0.75rem; color: var(--text-secondary);
    }
    .chip-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .dot-pending   { background: var(--orange); box-shadow: 0 0 6px var(--orange); }
    .dot-ongoing   { background: var(--accent-bright); box-shadow: 0 0 6px var(--accent-bright); }
    .dot-completed { background: var(--green); box-shadow: 0 0 6px var(--green); }
    .dot-other     { background: var(--text-muted); }

    /* ─── Grid ─── */
    .cvl-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    /* ─── Card ─── */
    .cvl-card {
      background: var(--card); border: 1px solid var(--border); border-radius: 18px;
      overflow: hidden; position: relative;
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
      animation: cardUp 0.45s ease both;
      text-decoration: none; display: flex; flex-direction: column;
    }
    @keyframes cardUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .cvl-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, var(--orange), transparent);
      opacity: 0; transition: opacity 0.3s;
    }
    .cvl-card:hover {
      transform: translateY(-5px); border-color: rgba(249,115,22,0.4);
      box-shadow: 0 20px 60px rgba(249,115,22,0.12), 0 0 0 1px rgba(249,115,22,0.08);
    }
    .cvl-card:hover::before { opacity: 1; }

    /* Status accent bar */
    .cvl-card-bar { height: 3px; width: 100%; }
    .bar-pending   { background: linear-gradient(90deg, var(--orange), transparent); }
    .bar-scheduled { background: linear-gradient(90deg, var(--cyan), transparent); }
    .bar-ongoing   { background: linear-gradient(90deg, var(--accent-bright), transparent); }
    .bar-completed { background: linear-gradient(90deg, var(--green), transparent); }
    .bar-rejected  { background: linear-gradient(90deg, var(--red), transparent); }
    .bar-other     { background: linear-gradient(90deg, var(--text-muted), transparent); }

    .cvl-card-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; gap: 0.85rem; }

    /* Card top */
    .cvl-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
    .cvl-card-title {
      font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 600;
      color: var(--text-primary); line-height: 1.3;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    /* Status badge */
    .cvl-status {
      display: inline-flex; align-items: center; gap: 0.3rem;
      padding: 0.22rem 0.65rem; border-radius: 100px;
      font-size: 0.68rem; font-weight: 600; letter-spacing: 0.06em;
      text-transform: uppercase; white-space: nowrap; flex-shrink: 0;
    }
    .cs-pending   { background: rgba(249,115,22,0.12); color: #fb923c; border: 1px solid rgba(249,115,22,0.25); }
    .cs-scheduled { background: rgba(6,182,212,0.12);  color: #22d3ee; border: 1px solid rgba(6,182,212,0.25); }
    .cs-ongoing   { background: rgba(168,85,247,0.12); color: var(--accent-bright); border: 1px solid rgba(168,85,247,0.3); }
    .cs-completed { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
    .cs-rejected  { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
    .cs-cancelled { background: rgba(100,116,139,0.12);color: #94a3b8; border: 1px solid rgba(100,116,139,0.2); }

    /* Description */
    .cvl-card-desc {
      font-size: 0.82rem; color: var(--text-muted); line-height: 1.6;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    /* Clan mini matchup */
    .cvl-mini-matchup {
      display: flex; align-items: center; gap: 0.65rem;
      padding: 0.65rem 0.85rem; border-radius: 10px;
      background: rgba(255,255,255,0.02); border: 1px solid var(--border);
    }
    .cvl-mini-clan { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 0; }
    .cvl-mini-clan.right { justify-content: flex-end; }
    .cvl-mini-logo {
      width: 28px; height: 28px; border-radius: 8px; object-fit: cover;
      border: 1px solid var(--border); flex-shrink: 0;
    }
    .cvl-mini-placeholder {
      width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
      background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; color: var(--orange);
    }
    .cvl-mini-placeholder.opp { background: rgba(6,182,212,0.1); border-color: rgba(6,182,212,0.2); color: var(--cyan); }
    .cvl-mini-name {
      font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .cvl-mini-vs {
      font-family: 'Playfair Display', serif; font-size: 0.75rem; font-weight: 700;
      color: var(--orange); flex-shrink: 0;
    }

    /* Meta row */
    .cvl-meta { display: flex; gap: 1rem; flex-wrap: wrap; }
    .cvl-meta-item {
      display: flex; align-items: center; gap: 0.35rem;
      font-size: 0.75rem; color: var(--text-muted);
    }
    .cvl-meta-icon { font-size: 0.65rem; }

    .cvl-divider { height: 1px; background: linear-gradient(90deg, var(--border), transparent); }

    /* CTA */
    .cvl-cta {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.65rem 0.85rem; border-radius: 10px;
      background: transparent; border: 1px solid rgba(249,115,22,0.2);
      color: var(--orange); font-size: 0.8rem; font-weight: 600;
      transition: all 0.2s; cursor: pointer; text-decoration: none;
      font-family: 'DM Sans', sans-serif; margin-top: auto;
    }
    .cvl-cta:hover { background: rgba(249,115,22,0.08); border-color: rgba(249,115,22,0.4); }
    .cvl-cta-arrow { font-size: 0.7rem; transition: transform 0.2s; }
    .cvl-cta:hover .cvl-cta-arrow { transform: translateX(3px); }

    /* ─── Empty ─── */
    .cvl-empty {
      grid-column: 1 / -1; background: var(--card);
      border: 1px dashed var(--border); border-radius: 20px;
      padding: 5rem 2rem; text-align: center;
    }
    .cvl-empty-icon { font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.35; }
    .cvl-empty-title {
      font-family: 'Playfair Display', serif; font-size: 1.2rem;
      color: var(--text-secondary); margin-bottom: 0.5rem;
    }
    .cvl-empty-sub { font-size: 0.83rem; color: var(--text-muted); }

    /* ─── Error ─── */
    .cvl-error {
      background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2);
      border-radius: 14px; padding: 1.25rem 1.5rem;
      font-size: 0.85rem; color: #f87171;
      display: flex; align-items: center; gap: 0.65rem;
    }

    /* Loading */
    .cvl-loading {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 60vh; gap: 1.2rem;
    }
    .cvl-loading-text {
      font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase;
      color: var(--text-muted); animation: lp 2s ease-in-out infinite;
    }
    @keyframes lp { 0%,100%{opacity:0.4} 50%{opacity:1} }

    @media (max-width: 600px) {
      .cvl-grid { grid-template-columns: 1fr; }
    }
  `}</style>
);

/* ── Helpers ── */
const statusClass = (s) => ({
  Pending: 'cs-pending', Scheduled: 'cs-scheduled', Ongoing: 'cs-ongoing',
  Completed: 'cs-completed', Rejected: 'cs-rejected', Cancelled: 'cs-cancelled',
})[s] || 'cs-cancelled';

const barClass = (s) => ({
  Pending: 'bar-pending', Scheduled: 'bar-scheduled', Ongoing: 'bar-ongoing',
  Completed: 'bar-completed', Rejected: 'bar-rejected',
})[s] || 'bar-other';

const StatusIcon = ({ s }) => {
  const map = { Ongoing: FaFire, Pending: FaClock, Completed: FaCheckCircle, Rejected: FaTimes, Scheduled: FaClock };
  const Ic = map[s] || FaClock;
  return <Icon as={Ic} style={{ fontSize: '0.55rem' }} />;
};

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
const ClanVsClansCompetitionList = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const toast     = useToast();

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        if (!user) {
          setCompetitions([]);
          setLoading(false);
          return;
        }

        const profileRes = await api.get('/auth/profile');
        const clanId = profileRes?.data?.user?.currentClan?.clanId;

        if (!clanId) {
          setCompetitions([]);
          setLoading(false);
          return;
        }

        const response = await api.get(`/clan-vs-clans-competitions/clan/${clanId}`);
        setCompetitions(response?.data?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to fetch competitions');
      } finally {
        setLoading(false);
      }
    };

    loadCompetitions();
  }, [user]);

  const handleCreate = () => {
    const role = user?.currentClan?.role || user?.currentClan?.memberRole;
    const isClanLeader = role === 'Leader' || role === 'CoLeader';

    if (!isClanLeader) {
      toast({ title: "Access Denied", description: "Only clan leaders can create clan vs clan competitions.", status: "error", duration: 3000, isClosable: true });
      return;
    }
    navigate("/clans-competitions/create");
  };

  /* counts */
  const pending   = competitions.filter(c => c.status === 'Pending').length;
  const ongoing   = competitions.filter(c => c.status === 'Ongoing').length;
  const completed = competitions.filter(c => c.status === 'Completed').length;

  return (
    <>
      <CosmicStyle />
      <div className="cvl-page">
        <div className="cvl-nebula" /><div className="cvl-stars" />
        <div className="cvl-wrap">

          {/* Header */}
          <div className="cvl-header">
            <div>
              <div className="cvl-eyebrow">
                <Icon as={FaShieldAlt} style={{ fontSize: '0.65rem' }} /> Clan Battles
              </div>
              <div className="cvl-title">Clan vs Clan</div>
              <div className="cvl-sub">Challenge rival clans to MCQ battles</div>
            </div>
            <button className="btn-create-clan" onClick={handleCreate}>
              <Icon as={FaPlus} style={{ fontSize: '0.75rem' }} /> Create Battle
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="cvl-loading">
              <span style={{ fontSize: '2.5rem' }}>⚔️</span>
              <div className="cvl-loading-text">Loading Battles...</div>
            </div>
          ) : error ? (
            <div className="cvl-error">
              <Icon as={FaTimes} /> {error}
            </div>
          ) : (
            <>
              {/* Stats strip */}
              {competitions.length > 0 && (
                <div className="cvl-strip">
                  <div className="cvl-chip"><span className="chip-dot dot-pending" />{pending} Pending</div>
                  <div className="cvl-chip"><span className="chip-dot dot-ongoing" />{ongoing} Ongoing</div>
                  <div className="cvl-chip"><span className="chip-dot dot-completed" />{completed} Completed</div>
                    <div className="cvl-chip" style={{ marginLeft: 'auto' }}>
                    <Icon as={FaShieldAlt} style={{ fontSize: '0.65rem', color: 'var(--orange)' }} />
                    {competitions.length} total
                  </div>
                </div>
              )}

              {/* Grid */}
              <div className="cvl-grid">
                {competitions.length === 0 ? (
                  <div className="cvl-empty">
                    <div className="cvl-empty-icon">⚔️</div>
                    <div className="cvl-empty-title">No battles found</div>
                    <div className="cvl-empty-sub">Be the first to issue a clan challenge!</div>
                  </div>
                ) : (
                  competitions.map((comp, idx) => (
                    <div
                      key={comp.id}
                      className="cvl-card"
                      style={{ animationDelay: `${idx * 0.07}s` }}
                    >
                      <div className={`cvl-card-bar ${barClass(comp.status)}`} />
                      <div className="cvl-card-body">

                        {/* Top */}
                        <div className="cvl-card-top">
                          <div className="cvl-card-title">{comp.title}</div>
                          <span className={`cvl-status ${statusClass(comp.status)}`}>
                            <StatusIcon s={comp.status} /> {comp.status}
                          </span>
                        </div>

                        {/* Description */}
                        {comp.description && (
                          <div className="cvl-card-desc">{comp.description}</div>
                        )}

                        {/* Clan mini matchup */}
                        {(comp.challengerClan || comp.opponentClan) && (
                          <div className="cvl-mini-matchup">
                            <div className="cvl-mini-clan">
                              {comp.challengerClan?.logoUrl
                                ? <img className="cvl-mini-logo" src={comp.challengerClan.logoUrl} alt={comp.challengerClan.name} />
                                : <div className="cvl-mini-placeholder"><Icon as={FaShieldAlt} /></div>
                              }
                              <span className="cvl-mini-name">{comp.challengerClan?.name || 'Challenger'}</span>
                            </div>
                            <div className="cvl-mini-vs">⚔</div>
                            <div className="cvl-mini-clan right">
                              <span className="cvl-mini-name">{comp.opponentClan?.name || 'Opponent'}</span>
                              {comp.opponentClan?.logoUrl
                                ? <img className="cvl-mini-logo" src={comp.opponentClan.logoUrl} alt={comp.opponentClan.name} />
                                : <div className="cvl-mini-placeholder opp"><Icon as={FaShieldAlt} /></div>
                              }
                            </div>
                          </div>
                        )}

                        {/* Meta */}
                        <div className="cvl-meta">
                          {comp.competitionType && (
                            <div className="cvl-meta-item">
                              <Icon as={FaStar} className="cvl-meta-icon" style={{ color: 'var(--gold)' }} />
                              <span>{comp.competitionType}</span>
                            </div>
                          )}
                          {comp.durationMinutes && (
                            <div className="cvl-meta-item">
                              <Icon as={FaClock} className="cvl-meta-icon" />
                              <span>{comp.durationMinutes} min</span>
                            </div>
                          )}
                          {comp.participantsPerClan && (
                            <div className="cvl-meta-item">
                              <Icon as={FaUsers} className="cvl-meta-icon" />
                              <span>{comp.participantsPerClan} vs {comp.participantsPerClan}</span>
                            </div>
                          )}
                        </div>

                        <div className="cvl-divider" />

                        {/* CTA */}
                        <Link className="cvl-cta" to={`/clans-competitions/${comp.id}`}>
                          <span>View Battle</span>
                          <Icon as={FaArrowRight} className="cvl-cta-arrow" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ClanVsClansCompetitionList;