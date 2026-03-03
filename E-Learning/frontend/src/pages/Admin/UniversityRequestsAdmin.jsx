import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiClock, FiBook, FiUser, FiCalendar, FiHash, FiAlertTriangle, FiX, FiUniversity } from 'react-icons/fi';
import api from '../../services/api';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const t = {
  bg:           '#080B14',
  bgCard:       '#0D1120',
  bgInput:      '#111827',
  bgSection:    '#0A0E1A',
  bgModal:      '#0F1628',
  border:       'rgba(255,255,255,0.07)',
  borderFocus:  'rgba(139,92,246,0.6)',
  accent:       '#8B5CF6',
  accentGlow:   'rgba(139,92,246,0.25)',
  accentSoft:   'rgba(139,92,246,0.12)',
  gold:         '#F0C060',
  success:      '#10B981',
  successSoft:  'rgba(16,185,129,0.12)',
  error:        '#F43F5E',
  errorSoft:    'rgba(244,63,94,0.12)',
  warning:      '#F59E0B',
  warnSoft:     'rgba(245,158,11,0.12)',
  textPrimary:  '#F0F0F5',
  textSecondary:'#8891AA',
  textMuted:    '#4B5268',
};

// ─── Global Styles ─────────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${t.bg}; color: ${t.textPrimary}; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${t.bg}; }
  ::-webkit-scrollbar-thumb { background: ${t.accent}40; border-radius: 4px; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn   { from{opacity:0;}to{opacity:1;} }
  @keyframes shimmer  { 0%{background-position:-200% center}100%{background-position:200% center} }
  @keyframes spin     { to{transform:rotate(360deg);} }
  @keyframes twinkle  { 0%,100%{opacity:.1}50%{opacity:.5} }
  @keyframes pulse-dot{ 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.85);} }

  .fade-up { animation: fadeUp 0.42s ease both; }
  .d1{animation-delay:.05s;} .d2{animation-delay:.1s;} .d3{animation-delay:.15s;}

  .req-row   { transition: background 0.15s; }
  .req-row:hover { background: rgba(139,92,246,0.04) !important; }
  .act-btn   { transition: background 0.17s, color 0.17s, border-color 0.17s, box-shadow 0.17s; }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
};

const getId  = (r) => r.id  ?? r.Id;
const getName= (r) => r.name ?? r.Name ?? '—';
const getCode= (r) => r.code ?? r.Code ?? '—';
const getBy  = (r) => r.requestedBy ?? r.RequestedBy ?? '—';
const getDate= (r) => r.createdAt ?? r.CreatedAt;

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => !toast ? null : (
  <div style={{
    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
    padding: '12px 20px', borderRadius: 12,
    background: toast.type === 'success' ? '#0D2B1F' : toast.type === 'info' ? '#0D1A2B' : '#1F0D14',
    border: `1px solid ${toast.type === 'success' ? t.success + '50' : toast.type === 'info' ? t.accent + '50' : t.error + '50'}`,
    color: toast.type === 'success' ? t.success : toast.type === 'info' ? t.accent : t.error,
    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    animation: 'fadeUp 0.3s ease', maxWidth: 340,
  }}>
    {toast.type === 'success' ? '✓ ' : toast.type === 'info' ? 'ℹ ' : '⚠ '}{toast.msg}
  </div>
);

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[8, 25, 12, 20, 22, 18].map((w, i) => (
      <td key={i} style={{ padding: '16px 18px' }}>
        <div style={{
          height: 11, width: `${w}%`, minWidth: 30, borderRadius: 6,
          background: `linear-gradient(90deg,${t.bgInput} 25%,#1a2235 50%,${t.bgInput} 75%)`,
          backgroundSize: '200% auto', animation: `shimmer 1.5s linear infinite`,
          animationDelay: `${i * 0.09}s`,
        }} />
      </td>
    ))}
  </tr>
);

// ─── Spinner ───────────────────────────────────────────────────────────────────
const Spin = ({ size = 16, color = t.accent }) => (
  <span style={{
    display: 'inline-block', width: size, height: size,
    border: `2px solid ${color}30`, borderTopColor: color,
    borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0,
  }} />
);

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, delay }) => (
  <div className={`fade-up ${delay}`} style={{
    background: t.bgCard, border: `1px solid ${t.border}`,
    borderRadius: 16, padding: '18px 20px',
  }}>
    <div style={{
      width: 34, height: 34, borderRadius: 9,
      background: color + '18', border: `1px solid ${color}25`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    }}><Icon size={15} color={color} /></div>
    <p style={{ fontSize: 26, fontWeight: 700, color: t.textPrimary, lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: 11, color: t.textMuted, marginTop: 5 }}>{label}</p>
  </div>
);

// ─── Reject Modal ──────────────────────────────────────────────────────────────
const RejectModal = ({ req, note, setNote, onConfirm, onClose, loading }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.2s ease',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: t.bgModal, border: `1px solid ${t.border}`,
        borderRadius: 20, padding: 32, maxWidth: 440, width: '90%',
        boxShadow: '0 40px 80px rgba(0,0,0,0.65)',
        animation: 'fadeUp 0.25s ease',
      }}>
        {/* Icon */}
        <div style={{
          width: 50, height: 50, borderRadius: '50%',
          background: t.errorSoft, border: `1px solid ${t.error}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
        }}><FiAlertTriangle size={20} color={t.error} /></div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20, fontWeight: 700, color: t.textPrimary, marginBottom: 6,
        }}>Reject University Request</h2>

        {req && (
          <p style={{ fontSize: 13, color: t.textSecondary, marginBottom: 18 }}>
            Rejecting <span style={{ color: t.textPrimary, fontWeight: 600 }}>"{getName(req)}"</span>
            {getCode(req) !== '—' && <span style={{ color: t.textMuted }}> ({getCode(req)})</span>}
          </p>
        )}

        {/* Note textarea */}
        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: t.textMuted, marginBottom: 8,
          }}>Rejection Note (optional)</label>
          <textarea
            placeholder="Provide a reason for rejection…"
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={4}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: '100%', background: t.bgInput,
              border: `1px solid ${focused ? t.borderFocus : t.border}`,
              borderRadius: 10, color: t.textPrimary,
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              padding: '11px 14px', outline: 'none', resize: 'vertical',
              lineHeight: 1.6,
              boxShadow: focused ? `0 0 0 3px ${t.accentGlow}` : 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px', borderRadius: 10,
            background: 'none', border: `1px solid ${t.border}`,
            color: t.textSecondary, fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{
            flex: 1, padding: '11px', borderRadius: 10,
            background: t.error, border: 'none', color: '#fff',
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {loading && <Spin size={14} color="#fff" />}
            {loading ? 'Rejecting…' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <tr>
    <td colSpan={6} style={{ padding: '72px 24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: t.accentSoft, border: `1px solid ${t.accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><FiBook size={26} color={t.accent} /></div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: t.textPrimary }}>No Pending Requests</p>
        <p style={{ fontSize: 13, color: t.textMuted }}>All university requests have been reviewed.</p>
      </div>
    </td>
  </tr>
);

// ─── Main Component ─────────────────────────────────────────────────────────────
const UniversityRequestsAdmin = () => {
  const navigate = useNavigate();

  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast]               = useState(null);
  const [selected, setSelected]         = useState(null);
  const [note, setNote]                 = useState('');

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res  = await api.get('/admin/university-requests');
      const data = res.data?.data || res.data || [];
      setRequests(Array.isArray(data) ? data : data.items ?? []);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await api.post(`/admin/university-requests/${id}/approve`);
      const uni = res.data?.university || res.data?.data || null;
      showToast('University request approved!', 'success');
      if (uni && (uni.id || uni.Id)) {
        navigate(`/universities/${uni.id ?? uni.Id}`);
        return;
      }
      setRequests(prev => prev.filter(r => getId(r) !== id));
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || 'Approval failed');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const openReject = (req) => { setSelected(req); setNote(''); };
  const closeReject = () => { if (!actionLoading) { setSelected(null); setNote(''); } };

  const handleReject = async () => {
    if (!selected) return;
    const id = getId(selected);
    setActionLoading(id);
    try {
      await api.post(`/admin/university-requests/${id}/reject`, { note });
      showToast('Request rejected.', 'info');
      setRequests(prev => prev.filter(r => getId(r) !== id));
      closeReject();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <style>{G}</style>
      <Toast toast={toast} />

      {/* Starfield */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {[...Array(50)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 2 + 1, height: Math.random() * 2 + 1,
            background: `rgba(255,255,255,${Math.random() * 0.3 + 0.05})`,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 65% 45% at 10% 5%, rgba(139,92,246,0.08) 0%, transparent 55%),
                       radial-gradient(ellipse 50% 35% at 90% 90%, rgba(16,185,129,0.04) 0%, transparent 55%)`,
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '36px 16px 80px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>

          {/* ── Header ── */}
          <div className="fade-up" style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: t.accent, marginBottom: 6 }}>
              Admin Panel
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700,
              background: `linear-gradient(135deg, ${t.textPrimary} 50%, ${t.textSecondary})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: 6,
            }}>University Requests</h1>
            <p style={{ fontSize: 14, color: t.textSecondary }}>
              Review and approve or reject university creation requests.
            </p>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 26 }}>
            <StatCard label="Pending Requests" value={requests.length} icon={FiClock}        color={t.warning} delay="d1" />
            <StatCard label="Approved Today"   value="—"              icon={FiCheckCircle}   color={t.success} delay="d1" />
            <StatCard label="Rejected Today"   value="—"              icon={FiXCircle}       color={t.error}   delay="d2" />
          </div>

          {/* ── Table Card ── */}
          <div className="fade-up d3" style={{
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
          }}>

            {/* Card header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 26px', borderBottom: `1px solid ${t.border}`,
              background: t.bgSection,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: t.warning,
                  animation: requests.length > 0 ? 'pulse-dot 1.5s ease infinite' : 'none',
                }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary }}>
                  {requests.length} pending {requests.length === 1 ? 'request' : 'requests'}
                </span>
              </div>
              <button onClick={fetchRequests} disabled={loading} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: t.accentSoft, border: `1px solid ${t.accent}30`,
                borderRadius: 8, color: t.accent,
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                padding: '7px 14px', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}>
                {loading ? <Spin size={12} /> : '↻'} Refresh
              </button>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border}`, background: t.bgSection }}>
                    {[
                      { label: 'ID',           icon: FiHash        },
                      { label: 'University',   icon: FiBook  },
                      { label: 'Code',         icon: null          },
                      { label: 'Requested By', icon: FiUser        },
                      { label: 'Date',         icon: FiCalendar    },
                      { label: 'Actions',      icon: null          },
                    ].map(({ label, icon: Icon }) => (
                      <th key={label} style={{
                        padding: '12px 18px', textAlign: 'left',
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.09em',
                        textTransform: 'uppercase', color: t.textMuted, whiteSpace: 'nowrap',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          {Icon && <Icon size={11} />} {label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                    : requests.length === 0
                      ? <EmptyState />
                      : requests.map((r) => {
                        const id      = getId(r);
                        const isActing = actionLoading === id;
                        return (
                          <tr key={id} className="req-row" style={{ borderBottom: `1px solid ${t.border}` }}>

                            {/* ID */}
                            <td style={{ padding: '15px 18px' }}>
                              <span style={{
                                fontSize: 11, fontWeight: 700, color: t.textMuted,
                                background: t.bgInput, border: `1px solid ${t.border}`,
                                borderRadius: 6, padding: '3px 8px', fontFamily: 'monospace',
                              }}>#{id}</span>
                            </td>

                            {/* University name */}
                            <td style={{ padding: '15px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                  background: t.accentSoft, border: `1px solid ${t.accent}25`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  <FiBook size={15} color={t.accent} />
                                </div>
                                <span style={{ fontWeight: 600, fontSize: 13, color: t.textPrimary }}>{getName(r)}</span>
                              </div>
                            </td>

                            {/* Code */}
                            <td style={{ padding: '15px 18px' }}>
                              <span style={{
                                fontSize: 12, fontWeight: 700, color: t.gold,
                                background: t.goldSoft ?? 'rgba(240,192,96,0.12)',
                                border: `1px solid ${t.gold}30`,
                                borderRadius: 6, padding: '3px 9px',
                              }}>{getCode(r)}</span>
                            </td>

                            {/* Requested by */}
                            <td style={{ padding: '15px 18px', fontSize: 13, color: t.textSecondary }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FiUser size={12} color={t.textMuted} />
                                {getBy(r)}
                              </div>
                            </td>

                            {/* Date */}
                            <td style={{ padding: '15px 18px', fontSize: 12, color: t.textMuted, whiteSpace: 'nowrap' }}>
                              {fmtDate(getDate(r))}
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '15px 18px' }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {/* Approve */}
                                <button
                                  className="act-btn"
                                  disabled={isActing}
                                  onClick={() => handleApprove(id)}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    background: t.successSoft, border: `1px solid ${t.success}30`,
                                    borderRadius: 8, color: t.success,
                                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                                    padding: '8px 14px', cursor: isActing ? 'not-allowed' : 'pointer',
                                    opacity: isActing ? 0.6 : 1,
                                  }}
                                  onMouseEnter={e => { if (!isActing) { e.currentTarget.style.background = t.success + '25'; e.currentTarget.style.boxShadow = `0 0 14px ${t.success}30`; } }}
                                  onMouseLeave={e => { e.currentTarget.style.background = t.successSoft; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                  {isActing ? <Spin size={12} color={t.success} /> : <FiCheckCircle size={13} />}
                                  Approve
                                </button>

                                {/* Reject */}
                                <button
                                  className="act-btn"
                                  disabled={isActing}
                                  onClick={() => openReject(r)}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    background: t.errorSoft, border: `1px solid ${t.error}30`,
                                    borderRadius: 8, color: t.error,
                                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                                    padding: '8px 14px', cursor: isActing ? 'not-allowed' : 'pointer',
                                    opacity: isActing ? 0.6 : 1,
                                  }}
                                  onMouseEnter={e => { if (!isActing) { e.currentTarget.style.background = t.error + '25'; e.currentTarget.style.boxShadow = `0 0 14px ${t.error}25`; } }}
                                  onMouseLeave={e => { e.currentTarget.style.background = t.errorSoft; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                  <FiXCircle size={13} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Reject Modal */}
      {selected && (
        <RejectModal
          req={selected}
          note={note}
          setNote={setNote}
          loading={!!actionLoading}
          onConfirm={handleReject}
          onClose={closeReject}
        />
      )}
    </>
  );
};

export default UniversityRequestsAdmin;