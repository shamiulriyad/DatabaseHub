import React, { useState, useEffect, useCallback } from 'react';
import {
  FiClock, FiCheckCircle, FiXCircle, FiEye, FiUsers,
} from 'react-icons/fi';
import axios from 'axios';
import TeacherApplicationReviewModal from '../../components/TeacherApplicationReviewModal';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const t = {
  bg:           '#080B14',
  bgCard:       '#0D1120',
  bgInput:      '#111827',
  bgSection:    '#0A0E1A',
  border:       'rgba(255,255,255,0.07)',
  borderHover:  'rgba(255,255,255,0.13)',
  accent:       '#8B5CF6',
  accentGlow:   'rgba(139,92,246,0.25)',
  accentSoft:   'rgba(139,92,246,0.12)',
  gold:         '#F0C060',
  success:      '#10B981',
  successSoft:  'rgba(16,185,129,0.12)',
  warning:      '#F59E0B',
  warnSoft:     'rgba(245,158,11,0.12)',
  error:        '#F43F5E',
  errorSoft:    'rgba(244,63,94,0.12)',
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

  @keyframes fadeUp   { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn   { from{opacity:0;}to{opacity:1;} }
  @keyframes spin     { to{transform:rotate(360deg);} }
  @keyframes shimmer  { 0%{background-position:-200% center}100%{background-position:200% center} }
  @keyframes twinkle  { 0%,100%{opacity:0.12}50%{opacity:0.55} }
  @keyframes pulse-dot{ 0%,100%{opacity:1}50%{opacity:0.4} }

  .fade-up  { animation: fadeUp 0.45s ease both; }
  .d1 { animation-delay: 0.06s; }
  .d2 { animation-delay: 0.12s; }
  .d3 { animation-delay: 0.18s; }
  .d4 { animation-delay: 0.24s; }

  .app-row  { transition: background 0.18s ease; }
  .app-row:hover { background: rgba(255,255,255,0.03) !important; }

  .tab-btn  { transition: color 0.18s, border-color 0.18s, background 0.18s; }
  .icon-btn { transition: background 0.18s, color 0.18s, border-color 0.18s; }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const safeDate = (d) => {
  if (!d && d !== 0) return null;
  try {
    if (typeof d === 'number' || /^\d+$/.test(String(d).trim())) {
      const dt = new Date(Number(d));
      if (!isNaN(dt.getTime())) return dt.toISOString();
    }
    const dt2 = new Date(d);
    if (!isNaN(dt2.getTime())) return dt2.toISOString();
    const parsed = Date.parse(String(d));
    if (!isNaN(parsed)) return new Date(parsed).toISOString();
  } catch (_) {}
  return null;
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

const normalizeApp = (app) => {
  const first = app.FirstName ?? app.firstName ?? app.Firstname ?? '';
  const last  = app.LastName  ?? app.lastName  ?? app.Lastname  ?? '';
  const nameFromParts = (first + ' ' + last).trim();
  return {
    ...app,
    ApplicantName:     ((app.ApplicantName ?? app.applicantName ?? nameFromParts) || app.UserName || app.userName || app.user?.username || 'N/A'),
    ApplicantEmail:    app.ApplicantEmail ?? app.applicantEmail ?? app.UserEmail ?? app.userEmail ?? app.user?.email ?? 'N/A',
    ReasonForApplying: app.ReasonForApplying ?? app.reasonForApplying ?? app.Reason ?? app.reason ?? '',
    ApplicationDate:   safeDate(app.ApplicationDate ?? app.applicationDate ?? app.applicationDateUtc ?? app.ApplicationDateUtc),
    ApprovedDate:      safeDate(app.ApprovedDate ?? app.approvedDate ?? app.ApprovedDateUtc ?? app.approvedDateUtc),
    ReviewedDate:      safeDate(app.ReviewedDate ?? app.reviewedDate ?? app.ReviewedDateUtc ?? app.reviewedDateUtc),
    AdminRemarks:      app.AdminRemarks ?? app.adminRemarks ?? app.AdminRemark ?? app.adminRemark ?? '',
    IdType:            app.IdType ?? app.idType ?? '',
    IdNumber:          app.IdNumber ?? app.idNumber ?? '',
    IdFrontImagePath:  app.IdFrontImagePath ?? app.idFrontImagePath ?? '',
    IdBackImagePath:   app.IdBackImagePath ?? app.idBackImagePath ?? '',
  };
};

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => !toast ? null : (
  <div style={{
    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
    padding: '12px 20px', borderRadius: 12,
    background: toast.type === 'success' ? '#0D2B1F' : '#1F0D14',
    border: `1px solid ${toast.type === 'success' ? t.success + '50' : t.error + '50'}`,
    color: toast.type === 'success' ? t.success : t.error,
    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    animation: 'fadeUp 0.3s ease', maxWidth: 320,
  }}>
    {toast.type === 'success' ? '✓ ' : '⚠ '}{toast.msg}
  </div>
);

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div style={{ padding: '18px 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
    {[35, 25, 20, 15].map((w, i) => (
      <div key={i} style={{
        flex: w, height: 12, borderRadius: 6,
        background: `linear-gradient(90deg, ${t.bgInput} 25%, #1a2235 50%, ${t.bgInput} 75%)`,
        backgroundSize: '200% auto',
        animation: `shimmer 1.5s linear infinite`,
        animationDelay: `${i * 0.1}s`,
      }} />
    ))}
  </div>
);

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon: Icon, delay }) => (
  <div className={`fade-up ${delay}`} style={{
    background: t.bgCard, border: `1px solid ${t.border}`,
    borderRadius: 16, padding: '20px 22px',
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: color + '18', border: `1px solid ${color}25`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    }}>
      <Icon size={16} color={color} />
    </div>
    <p style={{ fontSize: 28, fontWeight: 700, color: t.textPrimary, lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: 12, color: t.textMuted, marginTop: 5 }}>{label}</p>
  </div>
);

// ─── Avatar Initial ────────────────────────────────────────────────────────────
const AvatarInitial = ({ name, size = 36 }) => {
  const initials = (name || 'N').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#8B5CF6','#6366F1','#EC4899','#10B981','#F59E0B','#3B82F6'];
  const color  = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color + '25', border: `1.5px solid ${color}45`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color,
    }}>{initials}</div>
  );
};

// ─── Pending Card ──────────────────────────────────────────────────────────────
const PendingCard = ({ app, onReview }) => (
  <div style={{
    background: t.bgCard,
    border: `1px solid ${t.border}`,
    borderLeft: `3px solid ${t.warning}`,
    borderRadius: 14, padding: 22,
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16,
    transition: 'box-shadow 0.2s',
  }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4)`}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
  >
    <div style={{ display: 'flex', gap: 14, flex: 1, minWidth: 0 }}>
      <AvatarInitial name={app.ApplicantName} size={42} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 15, color: t.textPrimary, marginBottom: 2 }}>{app.ApplicantName}</p>
        <p style={{ fontSize: 12, color: t.accent, marginBottom: 8 }}>{app.ApplicantEmail}</p>
        {app.ReasonForApplying && (
          <p style={{
            fontSize: 13, color: t.textSecondary, lineHeight: 1.6,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            marginBottom: 8,
          }}>{app.ReasonForApplying}</p>
        )}
        <p style={{ fontSize: 11, color: t.textMuted }}>
          Applied: {fmtDate(app.ApplicationDate)}
        </p>
      </div>
    </div>
    <button
      onClick={() => onReview(app)}
      className="icon-btn"
      style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 7,
        background: t.accentSoft, border: `1px solid ${t.accent}40`,
        borderRadius: 10, color: t.accent,
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
        padding: '9px 16px', cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = t.accent + '25'; e.currentTarget.style.borderColor = t.accent + '70'; }}
      onMouseLeave={e => { e.currentTarget.style.background = t.accentSoft; e.currentTarget.style.borderColor = t.accent + '40'; }}
    >
      <FiEye size={14} /> Review
    </button>
  </div>
);

// ─── Table ─────────────────────────────────────────────────────────────────────
const CosmicTable = ({ headers, rows }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${t.border}` }}>
          {headers.map(h => (
            <th key={h} style={{
              padding: '12px 16px', textAlign: 'left',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: t.textMuted,
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className="app-row" style={{ borderBottom: `1px solid ${t.border}` }}>
            {row.map((cell, ci) => (
              <td key={ci} style={{ padding: '14px 16px', fontSize: 13, color: t.textSecondary, verticalAlign: 'middle' }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ msg }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '60px 24px', textAlign: 'center',
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: '50%',
      background: t.accentSoft, border: `1px solid ${t.accent}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    }}>
      <FiUsers size={22} color={t.accent} />
    </div>
    <p style={{ fontSize: 14, color: t.textMuted }}>{msg}</p>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────────
const ManageTeachers = () => {
  const [applications, setApplications] = useState({ Pending: [], Approved: [], Rejected: [] });
  const [isLoading, setIsLoading]       = useState(true);
  const [activeTab, setActiveTab]       = useState('Pending');
  const [selectedApp, setSelectedApp]   = useState(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const token    = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5145/api/teachers/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const grouped = { Pending: [], Approved: [], Rejected: [] };

        response.data.applications.forEach((app) => {
          const status = app.Status ?? app.status ?? 'Pending';
          const norm   = normalizeApp(app);
          grouped[status] = grouped[status] || [];
          grouped[status].push(norm);
        });

        setApplications(grouped);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      showToast('Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleReviewClick = (app) => {
    // Ensure the modal receives camelCase keys (the modal expects e.g. applicantName)
    const mapped = {
      // id may be present as id or Id
      id: app.id ?? app.Id ?? app.ID,
      applicantName: app.ApplicantName ?? app.applicantName ?? app.UserName ?? app.userName ?? 'N/A',
      applicantEmail: app.ApplicantEmail ?? app.applicantEmail ?? app.UserEmail ?? app.userEmail ?? 'N/A',
      applicationDate: app.ApplicationDate ?? app.applicationDate ?? app.ApplicationDateUtc ?? app.applicationDateUtc ?? null,
      reasonForApplying: app.ReasonForApplying ?? app.reasonForApplying ?? app.Reason ?? app.reason ?? '',
      qualificationDetails: app.QualificationDetails ?? app.qualificationDetails ?? app.Qualification ?? '',
      experienceArea: app.ExperienceArea ?? app.experienceArea ?? app.Experience ?? '',
      idType: app.IdType ?? app.idType ?? '',
      idNumber: app.IdNumber ?? app.idNumber ?? '',
      idFrontImagePath: app.IdFrontImagePath ?? app.idFrontImagePath ?? '',
      idBackImagePath: app.IdBackImagePath ?? app.idBackImagePath ?? '',
      status: app.Status ?? app.status ?? 'Pending',
      reviewedDate: app.ReviewedDate ?? app.reviewedDate ?? app.ReviewedDateUtc ?? app.reviewedDateUtc ?? null,
      approvedDate: app.ApprovedDate ?? app.approvedDate ?? app.ApprovedDateUtc ?? app.approvedDateUtc ?? null,
      adminRemarks: app.AdminRemarks ?? app.adminRemarks ?? app.AdminRemark ?? app.adminRemark ?? '',
    };

    setSelectedApp(mapped);
    setModalOpen(true);
  };

  const handleReviewComplete = () => {
    setModalOpen(false);
    setSelectedApp(null);
    fetchApplications();
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const total = (applications.Pending?.length || 0) + (applications.Approved?.length || 0) + (applications.Rejected?.length || 0);

  // ── Tab config ────────────────────────────────────────────────────────────
  const tabs = [
    { key: 'Pending',  label: 'Pending',  Icon: FiClock,        color: t.warning, count: applications.Pending?.length  || 0 },
    { key: 'Approved', label: 'Approved', Icon: FiCheckCircle,  color: t.success, count: applications.Approved?.length || 0 },
    { key: 'Rejected', label: 'Rejected', Icon: FiXCircle,      color: t.error,   count: applications.Rejected?.length || 0 },
  ];

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
          background: `radial-gradient(ellipse 70% 50% at 10% 5%, rgba(139,92,246,0.08) 0%, transparent 55%),
                       radial-gradient(ellipse 50% 40% at 90% 90%, rgba(16,185,129,0.04) 0%, transparent 55%)`,
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '36px 16px 80px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>

          {/* ── Header ── */}
          <div className="fade-up" style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: t.accent, marginBottom: 6 }}>
              Admin Panel
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700,
              background: `linear-gradient(135deg, ${t.textPrimary} 50%, ${t.textSecondary})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: 6,
            }}>Manage Teacher Applications</h1>
            <p style={{ fontSize: 14, color: t.textSecondary }}>Review and approve teacher applications from students.</p>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
            <StatCard label="Total Applications" value={total}                              color={t.accent}  icon={FiUsers}       delay="d1" />
            <StatCard label="Pending Review"      value={applications.Pending?.length  || 0} color={t.warning} icon={FiClock}        delay="d1" />
            <StatCard label="Approved"            value={applications.Approved?.length || 0} color={t.success} icon={FiCheckCircle}  delay="d2" />
            <StatCard label="Rejected"            value={applications.Rejected?.length || 0} color={t.error}   icon={FiXCircle}      delay="d2" />
          </div>

          {/* ── Main Card ── */}
          <div className="fade-up d3" style={{
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
          }}>

            {/* Tab Bar */}
            <div style={{
              display: 'flex', borderBottom: `1px solid ${t.border}`,
              background: t.bgSection,
            }}>
              {tabs.map(tab => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    className="tab-btn"
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '16px 12px', cursor: 'pointer',
                      background: active ? t.bgCard : 'none',
                      border: 'none',
                      borderBottom: `2px solid ${active ? tab.color : 'transparent'}`,
                      color: active ? tab.color : t.textMuted,
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                    }}
                  >
                    <tab.Icon size={14} />
                    <span>{tab.label}</span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: 22, height: 20, borderRadius: 10, padding: '0 6px',
                      background: active ? tab.color + '25' : t.border,
                      color: active ? tab.color : t.textMuted,
                      fontSize: 11, fontWeight: 700,
                    }}>{tab.count}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div style={{ padding: 28 }}>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
                </div>
              ) : (

                /* ── PENDING ── */
                activeTab === 'Pending' ? (
                  applications.Pending?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {applications.Pending.map((app, i) => (
                        <PendingCard key={app.id || app.Id || i} app={app} onReview={handleReviewClick} />
                      ))}
                    </div>
                  ) : <EmptyState msg="No pending applications right now." />

                /* ── APPROVED ── */
                ) : activeTab === 'Approved' ? (
                  applications.Approved?.length > 0 ? (
                    <CosmicTable
                      headers={['Applicant', 'Email', 'Approved Date', 'Action']}
                      rows={applications.Approved.map((app, i) => [
                        /* Applicant */
                        <div key="n" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <AvatarInitial name={app.ApplicantName} size={34} />
                          <span style={{ fontWeight: 600, color: t.textPrimary, fontSize: 13 }}>{app.ApplicantName}</span>
                        </div>,
                        /* Email */
                        <span key="e" style={{ color: t.accent, fontSize: 12 }}>{app.ApplicantEmail}</span>,
                        /* Date */
                        <span key="d">{fmtDate(app.ApprovedDate || app.ReviewedDate)}</span>,
                        /* Action */
                        <button key="a"
                          onClick={() => handleReviewClick(app)}
                          className="icon-btn"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: t.successSoft, border: `1px solid ${t.success}30`,
                            borderRadius: 8, color: t.success,
                            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                            padding: '6px 12px', cursor: 'pointer',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = t.success + '25'}
                          onMouseLeave={e => e.currentTarget.style.background = t.successSoft}
                        >
                          <FiEye size={12} /> View
                        </button>,
                      ])}
                    />
                  ) : <EmptyState msg="No approved applications yet." />

                /* ── REJECTED ── */
                ) : (
                  applications.Rejected?.length > 0 ? (
                    <CosmicTable
                      headers={['Applicant', 'Email', 'Rejected Date', 'Admin Remarks']}
                      rows={applications.Rejected.map((app, i) => [
                        /* Applicant */
                        <div key="n" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <AvatarInitial name={app.ApplicantName} size={34} />
                          <span style={{ fontWeight: 600, color: t.textPrimary, fontSize: 13 }}>{app.ApplicantName}</span>
                        </div>,
                        /* Email */
                        <span key="e" style={{ color: t.accent, fontSize: 12 }}>{app.ApplicantEmail}</span>,
                        /* Date */
                        <span key="d">{fmtDate(app.ReviewedDate)}</span>,
                        /* Remarks */
                        <div key="r" style={{
                          fontSize: 12, color: app.AdminRemarks ? t.textSecondary : t.textMuted,
                          fontStyle: app.AdminRemarks ? 'normal' : 'italic',
                          maxWidth: 260,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {app.AdminRemarks || 'No remarks provided'}
                        </div>,
                      ])}
                    />
                  ) : <EmptyState msg="No rejected applications." />
                )
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Review Modal (unchanged — existing component) */}
      {selectedApp && (
        <TeacherApplicationReviewModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedApp(null); }}
          application={selectedApp}
          onReviewComplete={handleReviewComplete}
        />
      )}
    </>
  );
};

export default ManageTeachers;