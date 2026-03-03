import React, { useEffect, useState, useRef } from 'react';
import { FiSearch, FiPlus, FiEye, FiChevronLeft, FiChevronRight, FiUsers, FiShield, FiBookOpen, FiUser, FiX } from 'react-icons/fi';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const t = {
  bg:           '#080B14',
  bgCard:       '#0D1120',
  bgInput:      '#111827',
  bgSection:    '#0A0E1A',
  border:       'rgba(255,255,255,0.07)',
  borderFocus:  'rgba(139,92,246,0.6)',
  accent:       '#8B5CF6',
  accentGlow:   'rgba(139,92,246,0.25)',
  accentSoft:   'rgba(139,92,246,0.12)',
  gold:         '#F0C060',
  success:      '#10B981',
  successSoft:  'rgba(16,185,129,0.12)',
  info:         '#3B82F6',
  infoSoft:     'rgba(59,130,246,0.12)',
  error:        '#F43F5E',
  errorSoft:    'rgba(244,63,94,0.12)',
  warning:      '#F59E0B',
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
  @keyframes shimmer  { 0%{background-position:-200% center}100%{background-position:200% center} }
  @keyframes twinkle  { 0%,100%{opacity:.1}50%{opacity:.5} }
  @keyframes spin     { to{transform:rotate(360deg);} }

  .fade-up { animation: fadeUp 0.42s ease both; }
  .d1 { animation-delay:.05s; } .d2 { animation-delay:.1s; }
  .d3 { animation-delay:.15s; } .d4 { animation-delay:.2s; }

  .trow { transition: background 0.15s; }
  .trow:hover { background: rgba(139,92,246,0.04) !important; }

  .action-btn { transition: background 0.17s, color 0.17s, border-color 0.17s; }
  .pg-btn     { transition: background 0.17s, color 0.17s, border-color 0.17s, opacity 0.17s; }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const userName = (u) =>
  u.fullName ?? ((`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()) || u.username || '—');

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

// ─── Avatar Initial ────────────────────────────────────────────────────────────
const AvatarInitial = ({ name, size = 34 }) => {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const palette  = ['#8B5CF6','#6366F1','#EC4899','#10B981','#F59E0B','#3B82F6','#14B8A6'];
  const color    = palette[(name?.charCodeAt(0) || 0) % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color + '22', border: `1.5px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color,
    }}>{initials}</div>
  );
};

// ─── Role Badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ label, color, bg }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
    padding: '3px 9px', borderRadius: 20,
    background: bg, border: `1px solid ${color}30`, color,
    marginRight: 4,
  }}>{label}</span>
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
    }}>
      <Icon size={15} color={color} />
    </div>
    <p style={{ fontSize: 26, fontWeight: 700, color: t.textPrimary, lineHeight: 1 }}>{value ?? '—'}</p>
    <p style={{ fontSize: 11, color: t.textMuted, marginTop: 5 }}>{label}</p>
  </div>
);

// ─── Shimmer rows ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[40, 28, 18, 18, 18, 10].map((w, i) => (
      <td key={i} style={{ padding: '16px 18px' }}>
        <div style={{
          height: 11, width: `${w}%`, minWidth: 40, borderRadius: 6,
          background: `linear-gradient(90deg,${t.bgInput} 25%,#1a2235 50%,${t.bgInput} 75%)`,
          backgroundSize: '200% auto',
          animation: `shimmer 1.5s linear infinite`,
          animationDelay: `${i * 0.08}s`,
        }} />
      </td>
    ))}
  </tr>
);

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function UserManagement() {
  const navigate = useNavigate();

  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const pageSize                = 10;
  const [total, setTotal]       = useState(null);
  const [search, setSearch]     = useState('');
  const [inputVal, setInputVal] = useState('');
  const debounceRef             = useRef(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const load = async () => {
      try {
        const res     = await api.get('/admin/users', { params: { page, pageSize, search } });
        const payload = res.data?.users ?? res.data?.data ?? res.data ?? [];
        if (res.data?.total != null) setTotal(res.data.total);
        if (!mounted) return;
        setUsers(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error('Failed to load users', err);
        if (mounted) setUsers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [page, search]);

  // ── Debounced search ──────────────────────────────────────────────────────
  const handleSearchInput = (val) => {
    setInputVal(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setSearch(val);
    }, 400);
  };

  const totalPages = total ? Math.ceil(total / pageSize) : null;

  // ── Derived stats from current page ───────────────────────────────────────
  const admins   = users.filter(u => u.isAdmin).length;
  const teachers = users.filter(u => u.isTeacher).length;
  const students = users.filter(u => u.isStudent && !u.isTeacher && !u.isAdmin).length;

  return (
    <>
      <style>{G}</style>

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
                       radial-gradient(ellipse 50% 35% at 90% 92%, rgba(59,130,246,0.05) 0%, transparent 55%)`,
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '36px 16px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* ── Header ── */}
          <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: t.accent, marginBottom: 6 }}>
                Admin Panel
              </p>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700,
                background: `linear-gradient(135deg, ${t.textPrimary} 50%, ${t.textSecondary})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>User Management</h1>
            </div>

            <button
              onClick={() => navigate('/admin/users/create')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: `linear-gradient(135deg, ${t.accent}, #6D28D9)`,
                border: 'none', borderRadius: 12, color: '#fff',
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                padding: '11px 22px', cursor: 'pointer',
                boxShadow: `0 0 24px ${t.accentGlow}`,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 0 36px ${t.accentGlow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 0 24px ${t.accentGlow}`; }}
            >
              <FiPlus size={15} /> Create User
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 26 }}>
            <StatCard label="Total Users"   value={total ?? users.length} icon={FiUsers}    color={t.accent}  delay="d1" />
            <StatCard label="Admins"         value={admins}               icon={FiShield}   color={t.error}   delay="d1" />
            <StatCard label="Teachers"       value={teachers}             icon={FiBookOpen} color={t.success} delay="d2" />
            <StatCard label="Students"       value={students}             icon={FiUser}     color={t.info}    delay="d2" />
          </div>

          {/* ── Main Table Card ── */}
          <div className="fade-up d3" style={{
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
          }}>

            {/* Search + Pagination bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12,
              padding: '18px 24px',
              borderBottom: `1px solid ${t.border}`,
              background: t.bgSection,
            }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
                <FiSearch size={13} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: t.textMuted, pointerEvents: 'none' }} />
                <input
                  placeholder="Search by name or email…"
                  value={inputVal}
                  onChange={e => handleSearchInput(e.target.value)}
                  style={{
                    width: '100%', background: t.bgInput,
                    border: `1px solid ${t.border}`, borderRadius: 10,
                    color: t.textPrimary, fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13, padding: '9px 34px 9px 36px', outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = t.borderFocus; e.target.style.boxShadow = `0 0 0 3px ${t.accentGlow}`; }}
                  onBlur={e => { e.target.style.borderColor = t.border; e.target.style.boxShadow = 'none'; }}
                  onKeyDown={e => { if (e.key === 'Enter') { setPage(1); setSearch(inputVal); } }}
                />
                {inputVal && (
                  <button onClick={() => { setInputVal(''); setSearch(''); setPage(1); }} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', padding: 2,
                  }}><FiX size={12} /></button>
                )}
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  className="pg-btn"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 8,
                    background: 'none', border: `1px solid ${t.border}`,
                    color: page <= 1 ? t.textMuted : t.textSecondary,
                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                    opacity: page <= 1 ? 0.4 : 1,
                  }}
                  onMouseEnter={e => { if (page > 1) { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSecondary; }}
                >
                  <FiChevronLeft size={15} />
                </button>

                <div style={{
                  padding: '4px 14px', borderRadius: 8,
                  background: t.accentSoft, border: `1px solid ${t.accent}30`,
                  fontSize: 12, fontWeight: 600, color: t.accent,
                }}>
                  {page}{totalPages ? ` / ${totalPages}` : ''}
                </div>

                <button
                  className="pg-btn"
                  disabled={totalPages ? page >= totalPages : false}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 8,
                    background: 'none', border: `1px solid ${t.border}`,
                    color: (totalPages && page >= totalPages) ? t.textMuted : t.textSecondary,
                    cursor: (totalPages && page >= totalPages) ? 'not-allowed' : 'pointer',
                    opacity: (totalPages && page >= totalPages) ? 0.4 : 1,
                  }}
                  onMouseEnter={e => { if (!(totalPages && page >= totalPages)) { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSecondary; }}
                >
                  <FiChevronRight size={15} />
                </button>

                {total != null && (
                  <span style={{ fontSize: 12, color: t.textMuted }}>
                    {total} total
                  </span>
                )}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border}`, background: t.bgSection }}>
                    {['User', 'Email', 'Roles', 'Joined', 'Teacher Request', 'Action'].map(h => (
                      <th key={h} style={{
                        padding: '12px 18px', textAlign: 'left',
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.09em',
                        textTransform: 'uppercase', color: t.textMuted,
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(pageSize)].map((_, i) => <SkeletonRow key={i} />)
                    : users.length === 0
                      ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '60px 24px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 52, height: 52, borderRadius: '50%',
                                background: t.accentSoft, border: `1px solid ${t.accent}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <FiUsers size={22} color={t.accent} />
                              </div>
                              <p style={{ fontSize: 14, color: t.textMuted }}>
                                {search ? `No users match "${search}"` : 'No users found'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )
                      : users.map(u => {
                        const name = userName(u);
                        return (
                          <tr key={u.id ?? u.userId ?? u.email} className="trow" style={{ borderBottom: `1px solid ${t.border}` }}>

                            {/* User */}
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <AvatarInitial name={name} size={36} />
                                <div>
                                  <p style={{ fontWeight: 600, fontSize: 13, color: t.textPrimary, lineHeight: 1.3 }}>{name}</p>
                                  <p style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{u.username ?? u.email ?? '—'}</p>
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td style={{ padding: '14px 18px', fontSize: 13, color: t.textSecondary }}>
                              {u.email ?? '—'}
                            </td>

                            {/* Roles */}
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {u.isAdmin   && <RoleBadge label="Admin"   color={t.error}   bg={t.errorSoft}   />}
                                {u.isTeacher && <RoleBadge label="Teacher" color={t.success} bg={t.successSoft} />}
                                {u.isStudent && <RoleBadge label="Student" color={t.info}    bg={t.infoSoft}    />}
                                {!u.isAdmin && !u.isTeacher && !u.isStudent && (
                                  <span style={{ fontSize: 11, color: t.textMuted }}>—</span>
                                )}
                              </div>
                            </td>

                            {/* Joined */}
                            <td style={{ padding: '14px 18px', fontSize: 12, color: t.textMuted, whiteSpace: 'nowrap' }}>
                              {fmtDate(u.createdAt)}
                            </td>

                            {/* Teacher Request */}
                            <td style={{ padding: '14px 18px', fontSize: 12, color: t.textMuted, whiteSpace: 'nowrap' }}>
                              {u.teacherRequestDate ? (
                                <span style={{ color: t.warning }}>{fmtDate(u.teacherRequestDate)}</span>
                              ) : '—'}
                            </td>

                            {/* Action */}
                            <td style={{ padding: '14px 18px' }}>
                              <button
                                className="action-btn"
                                onClick={() => navigate(`/user/${u.id ?? u.userId ?? u.email}`)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 6,
                                  background: t.accentSoft, border: `1px solid ${t.accent}30`,
                                  borderRadius: 8, color: t.accent,
                                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                                  padding: '7px 14px', cursor: 'pointer',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = t.accent + '25'; e.currentTarget.style.borderColor = t.accent + '60'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = t.accentSoft; e.currentTarget.style.borderColor = t.accent + '30'; }}
                              >
                                <FiEye size={12} /> View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>

            {/* Bottom pagination */}
            {!loading && users.length > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 24px', borderTop: `1px solid ${t.border}`,
                background: t.bgSection,
              }}>
                <span style={{ fontSize: 12, color: t.textMuted }}>
                  Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total ?? page * pageSize)} {total ? `of ${total}` : ''} users
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="pg-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: 'none', border: `1px solid ${t.border}`, borderRadius: 8,
                      color: page <= 1 ? t.textMuted : t.textSecondary, fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12, padding: '7px 14px', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                      opacity: page <= 1 ? 0.4 : 1,
                    }}>
                    <FiChevronLeft size={13} /> Prev
                  </button>
                  <button className="pg-btn" disabled={totalPages ? page >= totalPages : false} onClick={() => setPage(p => p + 1)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: 'none', border: `1px solid ${t.border}`, borderRadius: 8,
                      color: (totalPages && page >= totalPages) ? t.textMuted : t.textSecondary,
                      fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '7px 14px',
                      cursor: (totalPages && page >= totalPages) ? 'not-allowed' : 'pointer',
                      opacity: (totalPages && page >= totalPages) ? 0.4 : 1,
                    }}>
                    Next <FiChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}