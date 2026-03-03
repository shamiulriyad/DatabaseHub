import React, { useState, useEffect } from 'react';
import api from '../../services/api';

// ─── Cosmic Dark Premium Design System ───────────────────────────────────────
// Primary Font  : Playfair Display (headings)
// Body Font     : DM Sans (body, UI)
// Color Mode    : Dark only
// ─────────────────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-void:        #05050f;
    --bg-deep:        #090916;
    --bg-surface:     #0e0e22;
    --bg-elevated:    #141428;
    --bg-card:        #111124;
    --border-subtle:  rgba(139,92,246,0.12);
    --border-glow:    rgba(139,92,246,0.35);

    --accent-violet:  #8b5cf6;
    --accent-indigo:  #6366f1;
    --accent-cyan:    #22d3ee;
    --accent-gold:    #f59e0b;
    --accent-rose:    #f43f5e;
    --accent-emerald: #10b981;

    --text-primary:   #f1f0ff;
    --text-secondary: #a09ec0;
    --text-muted:     #5d5b80;

    --font-display: 'Playfair Display', Georgia, serif;
    --font-body:    'DM Sans', sans-serif;

    --radius-sm:  6px;
    --radius-md:  12px;
    --radius-lg:  18px;
    --radius-xl:  24px;

    --shadow-card: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px var(--border-subtle);
    --shadow-glow: 0 0 40px rgba(139,92,246,0.15);
  }

  body {
    font-family: var(--font-body);
    background: var(--bg-void);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
  }

  /* ── Layout ── */
  .admin-root {
    min-height: 100vh;
    background:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 40% 30% at 90% 80%, rgba(34,211,238,0.06) 0%, transparent 50%),
      var(--bg-void);
    padding: 40px 24px 80px;
  }

  .container { max-width: 1100px; margin: 0 auto; }

  /* ── Header ── */
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 40px;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--border-subtle);
    gap: 24px;
    flex-wrap: wrap;
  }

  .header-label {
    font-family: var(--font-body);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent-violet);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-label::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 1px;
    background: var(--accent-violet);
  }

  .header-title {
    font-family: var(--font-display);
    font-size: clamp(24px, 3vw, 36px);
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .header-subtitle {
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 8px;
    font-weight: 300;
    line-height: 1.6;
  }

  /* ── Refresh Button ── */
  .btn-refresh {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: var(--accent-cyan);
    background: rgba(34,211,238,0.08);
    border: 1px solid rgba(34,211,238,0.25);
    border-radius: var(--radius-sm);
    padding: 10px 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
    align-self: flex-start;
  }
  .btn-refresh:hover {
    background: rgba(34,211,238,0.14);
    border-color: rgba(34,211,238,0.5);
    box-shadow: 0 0 16px rgba(34,211,238,0.15);
  }
  .btn-refresh.loading { opacity: 0.6; cursor: not-allowed; }

  /* ── Error Banner ── */
  .error-banner {
    background: rgba(244,63,94,0.08);
    border: 1px solid rgba(244,63,94,0.25);
    border-radius: var(--radius-md);
    padding: 14px 18px;
    margin-bottom: 24px;
    font-size: 13px;
    color: #fca5a5;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* ── Stat Card ── */
  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 24px 32px;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: var(--shadow-card);
    position: relative;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(139,92,246,0.04) 0%, transparent 60%);
    pointer-events: none;
  }

  .stat-orb {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 60%, transparent 100%);
    border: 1px solid rgba(245,158,11,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 20px rgba(245,158,11,0.15);
  }

  .stat-number {
    font-family: var(--font-display);
    font-size: 40px;
    font-weight: 700;
    color: var(--accent-gold);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .stat-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 4px;
  }

  /* ── Main Card ── */
  .main-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-card), var(--shadow-glow);
  }

  .card-header {
    padding: 20px 28px;
    border-bottom: 1px solid var(--border-subtle);
    background: rgba(255,255,255,0.01);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .card-header-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--accent-violet);
    box-shadow: 0 0 8px var(--accent-violet);
  }

  .card-header-title {
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  /* ── Table ── */
  .table-wrap { overflow-x: auto; }

  table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-body);
    font-size: 14px;
  }

  thead tr {
    border-bottom: 1px solid var(--border-subtle);
    background: rgba(139,92,246,0.04);
  }

  th {
    padding: 14px 20px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  tbody tr {
    border-bottom: 1px solid rgba(139,92,246,0.06);
    transition: background 0.15s ease;
  }

  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: rgba(139,92,246,0.05); }

  td {
    padding: 16px 20px;
    color: var(--text-primary);
    vertical-align: middle;
  }

  .td-name {
    font-weight: 500;
    color: var(--text-primary);
  }

  .td-email {
    color: var(--text-secondary);
    font-size: 13px;
  }

  .td-area {
    color: var(--accent-cyan);
    font-size: 13px;
    font-weight: 400;
  }

  .td-date {
    color: var(--text-muted);
    font-size: 13px;
  }

  /* ── Badge ── */
  .badge-pending {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent-gold);
    background: rgba(245,158,11,0.1);
    border: 1px solid rgba(245,158,11,0.25);
    border-radius: 100px;
    padding: 4px 12px;
  }

  .badge-pending svg { width: 10px; height: 10px; }

  /* ── Review Button ── */
  .btn-review {
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary);
    background: linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.2));
    border: 1px solid rgba(139,92,246,0.35);
    border-radius: var(--radius-sm);
    padding: 8px 16px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .btn-review:hover {
    background: linear-gradient(135deg, rgba(139,92,246,0.5), rgba(99,102,241,0.35));
    border-color: rgba(139,92,246,0.6);
    box-shadow: 0 0 16px rgba(139,92,246,0.2);
    transform: translateY(-1px);
  }

  /* ── Empty / Loading State ── */
  .empty-state {
    padding: 80px 20px;
    text-align: center;
  }

  .empty-state-icon {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: rgba(139,92,246,0.08);
    border: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 22px;
  }

  .empty-state-text {
    font-family: var(--font-display);
    font-size: 18px;
    color: var(--text-muted);
    font-style: italic;
  }

  .spinner {
    width: 40px; height: 40px;
    border: 3px solid rgba(139,92,246,0.15);
    border-top-color: var(--accent-violet);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Modal Overlay ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(5,5,15,0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal {
    background: var(--bg-elevated);
    border: 1px solid var(--border-glow);
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 580px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(139,92,246,0.1);
    animation: slideUp 0.25s ease;
    overflow: hidden;
    max-height: 90vh;
    overflow-y: auto;
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .modal-header {
    padding: 28px 32px 20px;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }

  .modal-close {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--text-secondary);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    line-height: 1;
  }
  .modal-close:hover { background: rgba(244,63,94,0.15); border-color: rgba(244,63,94,0.3); color: #fca5a5; }

  .modal-body { padding: 28px 32px; }

  .section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent-violet);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, var(--border-subtle), transparent);
  }

  .info-grid {
    display: grid;
    gap: 12px;
    margin-bottom: 28px;
  }

  .info-row {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 12px;
    align-items: start;
  }

  .info-key {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding-top: 1px;
  }

  .info-val {
    font-size: 14px;
    color: var(--text-primary);
    line-height: 1.5;
  }

  .info-val-muted { color: var(--text-secondary); font-size: 13px; line-height: 1.6; }

  .form-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 10px;
    display: block;
  }

  textarea.remarks {
    width: 100%;
    background: var(--bg-deep);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 14px;
    resize: vertical;
    min-height: 100px;
    transition: border-color 0.2s ease;
    outline: none;
  }
  textarea.remarks::placeholder { color: var(--text-muted); }
  textarea.remarks:focus { border-color: var(--border-glow); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }

  .modal-footer {
    padding: 20px 32px 28px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    border-top: 1px solid var(--border-subtle);
  }

  .btn-ghost {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius-sm);
    padding: 10px 20px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }

  .btn-reject {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: #fca5a5;
    background: rgba(244,63,94,0.1);
    border: 1px solid rgba(244,63,94,0.3);
    border-radius: var(--radius-sm);
    padding: 10px 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-reject:hover { background: rgba(244,63,94,0.2); border-color: rgba(244,63,94,0.5); box-shadow: 0 0 16px rgba(244,63,94,0.15); }
  .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-approve {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: #6ee7b7;
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.3);
    border-radius: var(--radius-sm);
    padding: 10px 22px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-approve:hover { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.5); box-shadow: 0 0 16px rgba(16,185,129,0.15); }
  .btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Toast ── */
  .toast-container {
    position: fixed;
    bottom: 28px;
    right: 28px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 9999;
  }

  .toast {
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 280px;
    font-size: 13px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    animation: slideInRight 0.3s ease;
  }

  @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  .toast-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .toast.success .toast-dot { background: var(--accent-emerald); box-shadow: 0 0 8px var(--accent-emerald); }
  .toast.error   .toast-dot { background: var(--accent-rose);    box-shadow: 0 0 8px var(--accent-rose); }
  .toast.warning .toast-dot { background: var(--accent-gold);    box-shadow: 0 0 8px var(--accent-gold); }

  .toast-title { font-weight: 600; color: var(--text-primary); }
  .toast-desc  { color: var(--text-secondary); margin-top: 2px; }
`;

// ── Toast System ─────────────────────────────────────────────────────────────
let toastId = 0;

const ToastContainer = ({ toasts }) => (
  <div className="toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`toast ${t.status}`}>
        <div className="toast-dot" />
        <div>
          <div className="toast-title">{t.title}</div>
          {t.description && <div className="toast-desc">{t.description}</div>}
        </div>
      </div>
    ))}
  </div>
);

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconClock = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M8 4.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/>
    <circle cx="8" cy="8" r="2"/>
  </svg>
);

const IconRefresh = ({ spinning }) => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    style={{ animation: spinning ? 'spin 0.8s linear infinite' : 'none' }}>
    <path d="M13.5 8A5.5 5.5 0 1 1 10 3.07"/>
    <path d="M10 1v3h3"/>
  </svg>
);

const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z"/>
  </svg>
);

const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="6.5"/>
    <path d="M8 5v3M8 11h.01"/>
  </svg>
);

// ── AdminPanel ─────────────────────────────────────────────────────────────────
const AdminPanel = () => {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (title, description, status = 'success') => {
    const id = ++toastId;
    setToasts(t => [...t, { id, title, description, status }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };


  // Mock data for pending teachers
  const mockTeachers = [
    {
      id: 1,
      FirstName: 'Alice',
      LastName: 'Johnson',
      UserEmail: 'alice.johnson@example.com',
      UserName: 'alicejohnson',
      ExperienceArea: 'Mathematics',
      ApplicationDate: new Date().toISOString(),
      Status: 'Pending',
      ReasonForApplying: 'I want to help students excel in math.',
      QualificationDetails: 'MSc Mathematics, 5 years teaching experience.'
    },
    {
      id: 2,
      FirstName: 'Bob',
      LastName: 'Smith',
      UserEmail: 'bob.smith@example.com',
      UserName: 'bobsmith',
      ExperienceArea: 'Physics',
      ApplicationDate: new Date(Date.now() - 86400000).toISOString(),
      Status: 'Pending',
      ReasonForApplying: 'Passionate about teaching physics.',
      QualificationDetails: 'PhD Physics, 3 years online teaching.'
    }
  ];

  const fetchPendingTeachers = async () => {
    setIsLoading(true);
    setApiError(null);
    await new Promise(r => setTimeout(r, 800));
    setPendingTeachers(mockTeachers);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPendingTeachers();
    const interval = setInterval(fetchPendingTeachers, 30000);
    return () => clearInterval(interval);
  }, []);

  const closeModal = () => {
    setIsReviewModalOpen(false);
    setSelectedTeacher(null);
    setAdminRemarks('');
  };

  const handleReviewClick = (teacher) => {
    setSelectedTeacher(teacher);
    setAdminRemarks('');
    setIsReviewModalOpen(true);
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setPendingTeachers(t => t.filter(x => x.id !== selectedTeacher.id));
    showToast('Application Approved', `${selectedTeacher.FirstName} ${selectedTeacher.LastName} has been approved.`, 'success');
    closeModal();
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    if (!adminRemarks.trim()) {
      showToast('Remarks Required', 'Please provide a reason for rejection.', 'warning');
      return;
    }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setPendingTeachers(t => t.filter(x => x.id !== selectedTeacher.id));
    showToast('Application Rejected', `${selectedTeacher.FirstName} ${selectedTeacher.LastName}'s application was rejected.`, 'error');
    closeModal();
    setIsSubmitting(false);
  };

  return (
    <>
      <style>{styles}</style>

      <div className="admin-root">
        <div className="container">

          {/* ── Header ── */}
          <div className="header">
            <div>
              <div className="header-label">Admin Console</div>
              <h1 className="header-title">Teacher Application<br/>Management</h1>
              <p className="header-subtitle">Review, approve, or reject pending instructor applications</p>
            </div>
            <button
              className={`btn-refresh ${isLoading ? 'loading' : ''}`}
              onClick={fetchPendingTeachers}
              disabled={isLoading}
            >
              <IconRefresh spinning={isLoading} />
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {/* ── Error Banner ── */}
          {apiError && (
            <div className="error-banner">
              <IconAlert /> <strong>Error:</strong>&nbsp;{apiError}
            </div>
          )}

          {/* ── Stat Card ── */}
          <div className="stat-card">
            <div className="stat-orb"><IconShield /></div>
            <div>
              <div className="stat-number">{pendingTeachers.length}</div>
              <div className="stat-label">Pending Applications</div>
            </div>
          </div>

          {/* ── Table Card ── */}
          <div className="main-card">
            <div className="card-header">
              <div className="card-header-dot" />
              <span className="card-header-title">Awaiting Review</span>
            </div>

            {isLoading && pendingTeachers.length === 0 ? (
              <div className="empty-state">
                <div className="spinner" />
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
                  Loading applications…
                </p>
              </div>
            ) : pendingTeachers.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Experience Area</th>
                      <th>Applied On</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTeachers.map(t => (
                      <tr key={t.id}>
                        <td className="td-name">{t.FirstName} {t.LastName}</td>
                        <td className="td-email">{t.UserEmail}</td>
                        <td className="td-area">{t.ExperienceArea || '—'}</td>
                        <td className="td-date">{new Date(t.ApplicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td>
                          <span className="badge-pending">
                            <IconClock /> {t.Status}
                          </span>
                        </td>
                        <td>
                          <button className="btn-review" onClick={() => handleReviewClick(t)}>
                            <IconEye /> Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">✦</div>
                <p className="empty-state-text">No pending applications at this time</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Review Modal ── */}
      {isReviewModalOpen && selectedTeacher && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Review Application</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              {/* Applicant Info */}
              <div className="section-label">Applicant</div>
              <div className="info-grid" style={{ marginBottom: 28 }}>
                <div className="info-row">
                  <span className="info-key">Name</span>
                  <span className="info-val">{selectedTeacher.FirstName} {selectedTeacher.LastName}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Email</span>
                  <span className="info-val" style={{ color: 'var(--accent-cyan)' }}>{selectedTeacher.UserEmail}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Username</span>
                  <span className="info-val" style={{ color: 'var(--text-secondary)' }}>@{selectedTeacher.UserName}</span>
                </div>
              </div>

              {/* Application Details */}
              <div className="section-label">Application</div>
              <div className="info-grid" style={{ marginBottom: 28 }}>
                <div className="info-row">
                  <span className="info-key">Reason</span>
                  <span className="info-val-muted">{selectedTeacher.ReasonForApplying}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Area</span>
                  <span className="info-val" style={{ color: 'var(--accent-cyan)' }}>{selectedTeacher.ExperienceArea || '—'}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Quals</span>
                  <span className="info-val-muted">{selectedTeacher.QualificationDetails || '—'}</span>
                </div>
              </div>

              {/* Remarks */}
              <div className="section-label">Decision Remarks</div>
              <label className="form-label">Admin Remarks <span style={{ color: 'var(--accent-rose)', fontSize: 11 }}>(required for rejection)</span></label>
              <textarea
                className="remarks"
                placeholder="Add your remarks or feedback for this applicant…"
                value={adminRemarks}
                onChange={e => setAdminRemarks(e.target.value)}
                rows={4}
              />
            </div>

            <div className="modal-footer">
              <button className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn-reject" onClick={handleReject} disabled={isSubmitting}>
                {isSubmitting ? 'Rejecting…' : 'Reject'}
              </button>
              <button className="btn-approve" onClick={handleApprove} disabled={isSubmitting}>
                {isSubmitting ? 'Approving…' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} />
    </>
  );
};

export default AdminPanel;