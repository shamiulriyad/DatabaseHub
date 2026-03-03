import React from 'react';
import { Icon, Spinner, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaTrophy, FaFire, FaClock, FaCheckCircle, FaChartBar, FaArrowRight, FaMedal, FaStar } from 'react-icons/fa';
import competitionService from '../../services/competitionService';
import { useAuth } from '../../hooks/useAuth';

/* ─────────────────────────────────────────
   COSMIC DARK PREMIUM — Style
───────────────────────────────────────── */
const CosmicStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

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
      --text-primary:  #f1f0ff;
      --text-secondary:#9b99b8;
      --text-muted:    #5a5880;
    }

    .mc-page * { box-sizing: border-box; margin: 0; padding: 0; }
    .mc-page {
      font-family: 'DM Sans', sans-serif;
      background: var(--void);
      min-height: 100vh;
      color: var(--text-primary);
    }

    /* Nebula */
    .mc-nebula {
      position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
    }
    .mc-nebula::before {
      content: '';
      position: absolute; top: -20%; right: -10%; width: 55%; height: 55%;
      background: radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%);
      animation: mn 20s ease-in-out infinite alternate;
    }
    .mc-nebula::after {
      content: '';
      position: absolute; bottom: -10%; left: -10%; width: 50%; height: 50%;
      background: radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%);
      animation: mn 24s ease-in-out infinite alternate-reverse;
    }
    @keyframes mn { from{transform:translate(0,0)scale(1)} to{transform:translate(3%,4%)scale(1.05)} }
    .mc-stars {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 35% 70%, rgba(255,255,255,0.35) 0%, transparent 100%),
        radial-gradient(1px 1px at 68% 10%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 90% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
        radial-gradient(1px 1px at 50% 45%, rgba(168,85,247,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 20% 90%, rgba(6,182,212,0.45) 0%, transparent 100%);
    }

    .mc-wrap { position: relative; z-index: 1; padding: 2.5rem 1.5rem; max-width: 1100px; margin: 0 auto; }

    /* ─── Header ─── */
    .mc-header { margin-bottom: 2.5rem; }
    .mc-eyebrow {
      font-size: 0.68rem; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase;
      color: var(--accent-bright); display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.5rem;
    }
    .mc-eyebrow::before { content: ''; display: inline-block; width: 20px; height: 1px; background: var(--accent-bright); }
    .mc-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 700; line-height: 1.2;
      background: linear-gradient(135deg, #f1f0ff 0%, #c4b5fd 55%, #a78bfa 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      margin-bottom: 0.4rem;
    }
    .mc-sub { font-size: 0.88rem; color: var(--text-muted); }

    /* ─── Summary Strip ─── */
    .mc-strip {
      display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap;
    }
    .mc-strip-chip {
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border); border-radius: 100px;
      padding: 0.4rem 1rem; font-size: 0.78rem; color: var(--text-secondary);
    }
    .chip-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .dot-g { background: var(--green); box-shadow: 0 0 6px var(--green); }
    .dot-p { background: var(--accent-bright); box-shadow: 0 0 6px var(--accent-bright); }
    .dot-m { background: var(--text-muted); }

    /* ─── Grid ─── */
    .mc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;
    }

    /* ─── Card ─── */
    .mc-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 18px;
      position: relative; overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
      animation: cardUp 0.45s ease both;
    }
    @keyframes cardUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .mc-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, var(--accent-bright), transparent);
      opacity: 0; transition: opacity 0.3s;
    }
    .mc-card:hover {
      transform: translateY(-5px);
      border-color: var(--border-glow);
      box-shadow: 0 20px 60px rgba(124,58,237,0.2);
    }
    .mc-card:hover::before { opacity: 1; }

    /* Status accent bar */
    .mc-card-bar {
      height: 3px; width: 100%;
    }
    .bar-ongoing   { background: linear-gradient(90deg, var(--green), transparent); }
    .bar-upcoming  { background: linear-gradient(90deg, var(--cyan), transparent); }
    .bar-completed { background: linear-gradient(90deg, var(--text-muted), transparent); }

    .mc-card-body { padding: 1.5rem; }

    /* Card top */
    .mc-card-top {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem;
      margin-bottom: 0.85rem;
    }
    .mc-card-title {
      font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 600;
      color: var(--text-primary); line-height: 1.3;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .mc-status {
      display: inline-flex; align-items: center; gap: 0.3rem;
      padding: 0.22rem 0.65rem; border-radius: 100px;
      font-size: 0.68rem; font-weight: 600; letter-spacing: 0.06em;
      text-transform: uppercase; white-space: nowrap; flex-shrink: 0;
    }
    .ms-ongoing   { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
    .ms-upcoming  { background: rgba(6,182,212,0.12);  color: #22d3ee; border: 1px solid rgba(6,182,212,0.25); }
    .ms-completed { background: rgba(100,116,139,0.12);color: #94a3b8; border: 1px solid rgba(100,116,139,0.2); }

    .mc-desc {
      font-size: 0.82rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.1rem;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    /* Score/Rank chips */
    .mc-metrics {
      display: flex; gap: 0.6rem; margin-bottom: 1rem; flex-wrap: wrap;
    }
    .mc-metric {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border); border-radius: 10px;
      padding: 0.55rem 0.85rem; flex: 1; min-width: 80px;
    }
    .mc-metric-label { font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.25rem; }
    .mc-metric-value { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; line-height: 1; }
    .mv-purple { color: var(--accent-bright); }
    .mv-gold   { color: var(--gold); }
    .mv-cyan   { color: var(--cyan); }
    .mv-muted  { color: var(--text-muted); font-size: 0.9rem; font-family: 'DM Sans', sans-serif; }

    /* Dates */
    .mc-dates {
      display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1.1rem;
    }
    .mc-date-row {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.74rem; color: var(--text-muted);
    }
    .mc-date-label { font-weight: 500; color: var(--text-secondary); }

    .mc-divider { height: 1px; background: linear-gradient(90deg, var(--border), transparent); margin-bottom: 1.1rem; }

    /* Joined tag */
    .mc-joined {
      display: inline-flex; align-items: center; gap: 0.35rem;
      font-size: 0.72rem; color: var(--text-muted); margin-bottom: 1rem;
    }
    .mc-joined-icon { font-size: 0.65rem; color: var(--green); }

    /* Action buttons */
    .mc-actions { display: flex; gap: 0.6rem; }
    .btn-view-mc {
      flex: 1;
      font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.82rem;
      letter-spacing: 0.04em; border-radius: 10px;
      padding: 0.6rem 1rem; cursor: pointer; border: none; outline: none;
      background: linear-gradient(135deg, var(--accent), var(--accent-bright));
      color: #fff; box-shadow: 0 4px 16px rgba(124,58,237,0.3);
      transition: all 0.25s ease;
      display: flex; align-items: center; justify-content: center; gap: 0.4rem;
    }
    .btn-view-mc:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.45); }

    .btn-stats-mc {
      font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.82rem;
      border-radius: 10px; padding: 0.6rem 1rem; cursor: pointer; outline: none;
      background: transparent; color: var(--text-secondary);
      border: 1px solid var(--border);
      transition: all 0.25s ease;
      display: flex; align-items: center; gap: 0.4rem;
    }
    .btn-stats-mc:hover { border-color: var(--border-glow); color: var(--text-primary); background: rgba(168,85,247,0.06); }

    /* ─── Empty state ─── */
    .mc-empty {
      grid-column: 1 / -1;
      background: var(--card); border: 1px dashed var(--border);
      border-radius: 20px; padding: 5rem 2rem;
      text-align: center;
    }
    .mc-empty-icon { font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.4; }
    .mc-empty-title {
      font-family: 'Playfair Display', serif; font-size: 1.2rem;
      color: var(--text-secondary); margin-bottom: 0.5rem;
    }
    .mc-empty-sub { font-size: 0.83rem; color: var(--text-muted); margin-bottom: 1.5rem; }
    .btn-browse {
      font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.85rem;
      background: linear-gradient(135deg, var(--accent), var(--accent-bright));
      color: #fff; border: none; border-radius: 12px;
      padding: 0.65rem 1.75rem; cursor: pointer;
      box-shadow: 0 4px 20px rgba(124,58,237,0.3);
      transition: all 0.3s ease;
    }
    .btn-browse:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,0.5); }

    /* Loading */
    .mc-loading {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 60vh; gap: 1.2rem;
    }
    .mc-loading-text {
      font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase;
      color: var(--text-muted); animation: mlp 2s ease-in-out infinite;
    }
    @keyframes mlp { 0%,100%{opacity:0.4} 50%{opacity:1} }
  `}</style>
);

/* ─── Helpers ─── */
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const statusClass   = (s) => ({ ongoing: 'ms-ongoing', upcoming: 'ms-upcoming', completed: 'ms-completed' })[s?.toLowerCase()] || 'ms-upcoming';
const barClass      = (s) => ({ ongoing: 'bar-ongoing', upcoming: 'bar-upcoming', completed: 'bar-completed' })[s?.toLowerCase()] || 'bar-upcoming';
const StatusIcon    = ({ s }) => { const ic = { ongoing: FaFire, upcoming: FaClock, completed: FaCheckCircle }; const Ic = ic[s?.toLowerCase()] || FaClock; return <Icon as={Ic} style={{ fontSize: '0.6rem' }} />; };

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
const MyCompetitions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['userCompetitions'],
    queryFn: () => competitionService.getUserCompetitions(),
  });

  React.useEffect(() => {
    if (isError) {
      toast({
        title: 'Failed to load competitions',
        description: error?.message || 'Could not fetch your competitions.',
        status: 'error', duration: 5000, isClosable: true,
      });
    }
  }, [isError, error, toast]);

  const handleStats = async (compId) => {
    try {
      const stats = await competitionService.getStats(compId);
      toast({
        title: 'Competition Stats',
        description: `Avg Score: ${stats.averageScore ?? '—'} · Highest: ${stats.highestScore ?? '—'}`,
        status: 'info', duration: 4000, isClosable: true,
      });
    } catch {
      toast({ title: 'Failed to load stats', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const ongoing   = (data || []).filter(i => (i.competition || i.Competition || {}).status === 'ongoing').length;
  const upcoming  = (data || []).filter(i => (i.competition || i.Competition || {}).status === 'upcoming').length;
  const completed = (data || []).filter(i => (i.competition || i.Competition || {}).status === 'completed').length;

  return (
    <>
      <CosmicStyle />
      <div className="mc-page">
        <div className="mc-nebula" />
        <div className="mc-stars" />

        <div className="mc-wrap">

          {/* ─── Header ─── */}
          <div className="mc-header">
            <div className="mc-eyebrow">
              <Icon as={FaMedal} style={{ fontSize: '0.65rem' }} /> My Arena
            </div>
            <div className="mc-title">My Competitions</div>
            <div className="mc-sub">Competitions you've joined — scores, ranks, and status</div>
          </div>

          {/* ─── Loading ─── */}
          {isLoading ? (
            <div className="mc-loading">
              <Spinner size="xl" color="#a855f7" thickness="3px" speed="0.8s" />
              <div className="mc-loading-text">Fetching your arena...</div>
            </div>
          ) : (
            <>
              {/* Summary strip */}
              {data && data.length > 0 && (
                <div className="mc-strip">
                  <div className="mc-strip-chip"><span className="chip-dot dot-g" />{ongoing} Live</div>
                  <div className="mc-strip-chip"><span className="chip-dot dot-p" />{upcoming} Upcoming</div>
                  <div className="mc-strip-chip"><span className="chip-dot dot-m" />{completed} Ended</div>
                  <div className="mc-strip-chip" style={{ marginLeft: 'auto' }}>
                    <Icon as={FaStar} style={{ fontSize: '0.65rem', color: 'var(--gold)' }} />
                    {data.length} total
                  </div>
                </div>
              )}

              {/* Grid */}
              <div className="mc-grid">
                {data && data.length > 0 ? (
                  data.map((item, idx) => {
                    const comp     = item.competition || item.Competition || {};
                    const score    = item.participantScore ?? item.ParticipantScore ?? null;
                    const rank     = item.participantRank  ?? item.ParticipantRank  ?? null;
                    const joinedAt = item.joinedAt         ?? item.JoinedAt         ?? null;
                    const status   = comp.status?.toLowerCase();

                    return (
                      <div
                        className="mc-card"
                        key={comp.id || idx}
                        style={{ animationDelay: `${idx * 0.07}s` }}
                      >
                        {/* Status bar */}
                        <div className={`mc-card-bar ${barClass(status)}`} />

                        <div className="mc-card-body">
                          {/* Top */}
                          <div className="mc-card-top">
                            <div className="mc-card-title">{comp.title}</div>
                            <span className={`mc-status ${statusClass(status)}`}>
                              <StatusIcon s={status} /> {comp.status}
                            </span>
                          </div>

                          {/* Desc */}
                          {comp.description && (
                            <div className="mc-desc">{comp.description}</div>
                          )}

                          {/* Metrics */}
                          <div className="mc-metrics">
                            <div className="mc-metric">
                              <div className="mc-metric-label">Score</div>
                              <div className={`mc-metric-value ${score != null ? 'mv-purple' : 'mv-muted'}`}>
                                {score ?? '—'}
                              </div>
                            </div>
                            <div className="mc-metric">
                              <div className="mc-metric-label">Rank</div>
                              <div className={`mc-metric-value ${rank != null ? 'mv-gold' : 'mv-muted'}`}>
                                {rank != null ? `#${rank}` : '—'}
                              </div>
                            </div>
                          </div>

                          <div className="mc-divider" />

                          {/* Dates */}
                          <div className="mc-dates">
                            <div className="mc-date-row">
                              <span className="mc-date-label">Start</span>
                              <span>{fmtDate(comp.startDate)}</span>
                            </div>
                            <div className="mc-date-row">
                              <span className="mc-date-label">End</span>
                              <span>{fmtDate(comp.endDate)}</span>
                            </div>
                          </div>

                          {/* Joined at */}
                          {joinedAt && (
                            <div className="mc-joined">
                              <Icon as={FaCheckCircle} className="mc-joined-icon" />
                              Joined {fmtDate(joinedAt)}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="mc-actions">
                            <button className="btn-view-mc" onClick={() => navigate(`/competitions/${comp.id}`)}>
                              View <Icon as={FaArrowRight} style={{ fontSize: '0.7rem' }} />
                            </button>
                            <button className="btn-stats-mc" onClick={() => handleStats(comp.id)}>
                              <Icon as={FaChartBar} style={{ fontSize: '0.75rem' }} /> Stats
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="mc-empty">
                    <div className="mc-empty-icon">🏆</div>
                    <div className="mc-empty-title">No competitions yet</div>
                    <div className="mc-empty-sub">You haven't joined any competitions. Step into the arena!</div>
                    <button className="btn-browse" onClick={() => navigate('/competitions')}>
                      Browse Competitions
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MyCompetitions;