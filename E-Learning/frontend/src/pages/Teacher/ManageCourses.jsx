import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiUsers, FiArrowLeft, FiSearch, FiBookOpen, FiX, FiAlertTriangle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const t = {
  bg:          '#080B14',
  bgCard:      '#0D1120',
  bgInput:     '#111827',
  bgSection:   '#0A0E1A',
  bgModal:     '#0F1628',
  border:      'rgba(255,255,255,0.07)',
  borderHover: 'rgba(255,255,255,0.13)',
  accent:      '#8B5CF6',
  accentGlow:  'rgba(139,92,246,0.25)',
  accentSoft:  'rgba(139,92,246,0.12)',
  gold:        '#F0C060',
  success:     '#10B981',
  successSoft: 'rgba(16,185,129,0.12)',
  warning:     '#F59E0B',
  warnSoft:    'rgba(245,158,11,0.12)',
  error:       '#F43F5E',
  errorSoft:   'rgba(244,63,94,0.12)',
  textPrimary: '#F0F0F5',
  textSecondary:'#8891AA',
  textMuted:   '#4B5268',
};

// ─── Global Styles ─────────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${t.bg}; color: ${t.textPrimary}; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${t.bg}; }
  ::-webkit-scrollbar-thumb { background: ${t.accent}40; border-radius: 4px; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(16px);} to { opacity:1; transform:translateY(0);} }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 ${t.accentGlow}; }
    70%  { box-shadow: 0 0 0 10px rgba(139,92,246,0); }
    100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
  }

  .fade-up { animation: fadeUp 0.45s ease both; }
  .d1 { animation-delay: 0.05s; }
  .d2 { animation-delay: 0.1s; }
  .d3 { animation-delay: 0.15s; }

  .course-card { transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; }
  .course-card:hover { transform: translateY(-4px); }

  .btn-icon { transition: background 0.18s, color 0.18s, border-color 0.18s; }

  select option { background: #1a2030; color: #f0f0f5; }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const imgSrc = (c) =>
  c.courseImageUrl || c.thumbnailUrl || c.bannerUrl || c.imageUrl ||
  c.courseImage || c.thumbnail || c.coverImageUrl || c.coverImage ||
  c.CourseImageUrl || c.ThumbnailUrl || null;

const enrollCount = (c) =>
  c.enrollmentCount ?? c.totalEnrolled ?? c.EnrollmentCount ??
  c.totalStudents ?? c.total_enrolled ?? c.studentsCount ??
  c.enrolledCount ?? c.enrolled ?? 0;

const _normalizeStatus = (s) => (s || '').toString().trim().toLowerCase();

const statusMeta = (status) => {
  const st = _normalizeStatus(status);
  if (st === 'approved' || st === 'published') return { color: t.success, bg: t.successSoft, dot: '#10B981', label: 'Approved' };
  if (st === 'pending')  return { color: t.warning, bg: t.warnSoft,    dot: '#F59E0B', label: 'Pending'  };
  return                   { color: t.error,   bg: t.errorSoft,   dot: '#F43F5E', label: 'Rejected' };
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => !toast ? null : (
  <div style={{
    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
    padding: '12px 20px', borderRadius: 12,
    background: toast.type === 'success' ? '#0D2B1F' : '#1F0D14',
    border: `1px solid ${toast.type === 'success' ? t.success + '50' : t.error + '50'}`,
    color: toast.type === 'success' ? t.success : t.error,
    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    animation: 'fadeUp 0.3s ease',
    maxWidth: 320,
  }}>
    {toast.type === 'success' ? '✓ ' : '⚠ '}{toast.msg}
  </div>
);

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{
    background: t.bgCard, border: `1px solid ${t.border}`,
    borderRadius: 16, overflow: 'hidden',
  }}>
    <div style={{
      height: 180,
      background: `linear-gradient(90deg, ${t.bgInput} 25%, #1a2235 50%, ${t.bgInput} 75%)`,
      backgroundSize: '200% auto',
      animation: 'shimmer 1.5s linear infinite',
    }} />
    <div style={{ padding: 20 }}>
      {[80, 55, 100].map((w, i) => (
        <div key={i} style={{
          height: 12, borderRadius: 6, marginBottom: 12,
          width: `${w}%`,
          background: `linear-gradient(90deg, ${t.bgInput} 25%, #1a2235 50%, ${t.bgInput} 75%)`,
          backgroundSize: '200% auto',
          animation: 'shimmer 1.5s linear infinite',
          animationDelay: `${i * 0.15}s`,
        }} />
      ))}
    </div>
  </div>
);

// ─── Course Card ───────────────────────────────────────────────────────────────
const CourseCard = ({ course, onDelete, navigate }) => {
  const [hovered, setHovered] = useState(false);
  const sm = statusMeta(course.status);
  const thumb = imgSrc(course);

  return (
    <div
      className="course-card fade-up"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: t.bgCard,
        border: `1px solid ${hovered ? t.borderHover : t.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: hovered ? `0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px ${t.border}` : '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', height: 180, background: t.bgInput, flexShrink: 0 }}>
        {thumb ? (
          <img src={thumb} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${t.accentSoft}, ${t.bgInput})`,
          }}>
            <FiBookOpen size={36} color={t.textMuted} />
          </div>
        )}
        {/* Status badge overlay */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 20,
          background: sm.bg, border: `1px solid ${sm.color}30`,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: sm.dot,
            boxShadow: `0 0 6px ${sm.dot}`,
            animation: course.status === 'Pending' ? 'pulse-ring 2s infinite' : 'none',
          }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: sm.color, letterSpacing: '0.05em' }}>{sm.label}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Title + category */}
        <div>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 15, fontWeight: 700,
            color: t.textPrimary, lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            marginBottom: 4,
          }}>{course.title}</h3>
          <p style={{ fontSize: 12, color: t.textMuted }}>{course.categoryName || 'Uncategorized'}</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: t.textSecondary }}>
            <FiUsers size={12} />
            <span>{enrollCount(course)} students</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: t.textSecondary }}>
            <FiStar size={12} color={t.gold} />
            <span>{(course.averageRating || 0).toFixed(1)}</span>
          </div>
        </div>

        {/* Pending notice */}
        {_normalizeStatus(course.status) === 'pending' && (
          <div style={{
            fontSize: 11, color: t.warning,
            background: t.warnSoft, border: `1px solid ${t.warning}20`,
            borderRadius: 8, padding: '6px 10px',
          }}>
            ⏳ Waiting for admin approval
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: 8, paddingTop: 4 }}>
          <button
            className="btn-icon"
            onClick={() => navigate(`/courses/${course.id}/edit`)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: t.accentSoft, border: `1px solid ${t.accent}30`,
              borderRadius: 10, color: t.accent,
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
              padding: '8px', cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = t.accent + '25'; e.currentTarget.style.borderColor = t.accent + '60'; }}
            onMouseLeave={e => { e.currentTarget.style.background = t.accentSoft; e.currentTarget.style.borderColor = t.accent + '30'; }}
          >
            <FiEdit2 size={13} /> Edit
          </button>
          <button
            className="btn-icon"
            onClick={() => navigate(`/courses/${course.id}`)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: t.successSoft, border: `1px solid ${t.success}30`,
              borderRadius: 10, color: t.success,
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
              padding: '8px', cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = t.success + '25'; }}
            onMouseLeave={e => { e.currentTarget.style.background = t.successSoft; }}
          >
            View
          </button>
          <button
            className="btn-icon"
            onClick={() => onDelete(course)}
            style={{
              width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: `1px solid ${t.border}`,
              borderRadius: 10, color: t.textMuted,
              cursor: 'pointer', padding: '8px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = t.errorSoft; e.currentTarget.style.color = t.error; e.currentTarget.style.borderColor = t.error + '40'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = t.textMuted; e.currentTarget.style.borderColor = t.border; }}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Modal ──────────────────────────────────────────────────────────────
const DeleteModal = ({ course, onConfirm, onClose, deleting }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
    animation: 'fadeIn 0.2s ease',
  }} onClick={onClose}>
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: t.bgModal,
        border: `1px solid ${t.border}`,
        borderRadius: 20, padding: 32, maxWidth: 420, width: '90%',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        animation: 'fadeUp 0.25s ease',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: t.errorSoft, border: `1px solid ${t.error}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <FiAlertTriangle size={22} color={t.error} />
      </div>

      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 20, fontWeight: 700, color: t.textPrimary, marginBottom: 10,
      }}>Delete Course</h2>

      <p style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.6, marginBottom: 28 }}>
        Are you sure you want to delete{' '}
        <span style={{ color: t.textPrimary, fontWeight: 600 }}>"{course?.title}"</span>?
        This action cannot be undone.
      </p>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{
          flex: 1, padding: '11px', borderRadius: 10,
          background: 'none', border: `1px solid ${t.border}`,
          color: t.textSecondary, fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, cursor: 'pointer',
        }}>Cancel</button>
        <button onClick={onConfirm} disabled={deleting} style={{
          flex: 1, padding: '11px', borderRadius: 10,
          background: t.error, border: 'none',
          color: '#fff', fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer',
          opacity: deleting ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {deleting && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ searchTerm, navigate }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '80px 24px', textAlign: 'center',
    background: t.bgCard, border: `1px solid ${t.border}`,
    borderRadius: 20,
  }}>
    <div style={{
      width: 72, height: 72, borderRadius: '50%',
      background: t.accentSoft, border: `1px solid ${t.accent}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 20,
    }}>
      <FiBookOpen size={30} color={t.accent} />
    </div>
    <h3 style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: 22, fontWeight: 700, color: t.textPrimary, marginBottom: 8,
    }}>
      {searchTerm ? 'No Results Found' : 'No Courses Yet'}
    </h3>
    <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 28, maxWidth: 320 }}>
      {searchTerm ? `No courses match "${searchTerm}". Try a different search.` : 'Create your first course and start teaching students worldwide.'}
    </p>
    {!searchTerm && (
      <button onClick={() => navigate('/teacher/create-course')} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: `linear-gradient(135deg, ${t.accent}, #6D28D9)`,
        border: 'none', borderRadius: 12, color: '#fff',
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
        padding: '12px 28px', cursor: 'pointer',
        boxShadow: `0 0 24px ${t.accentGlow}`,
      }}>
        <FiPlus size={16} /> Create Your First Course
      </button>
    )}
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────────
const ManageCourses = () => {
  const navigate = useNavigate();

  const [courses, setCourses]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [deleting, setDeleting]           = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filterStatus, setFilterStatus]   = useState('All');
  const [searchTerm, setSearchTerm]       = useState('');
  const [toast, setToast]                 = useState(null);
  const [rawResponse, setRawResponse]     = useState(null);
  const [showRaw, setShowRaw]             = useState(false);

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCourses();
  }, []); // fetch once; apply status filter client-side for reliability

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token  = localStorage.getItem('token');
      // Always request all created courses and filter locally to avoid server-side mismatches
      const response = await axios.get('/api/courses/created-courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.debug('GET /api/courses/created-courses response (raw):', response.data);
      setRawResponse(response.data);

      // normalize response shapes from backend (support several shapes)
      let raw = [];
      const d = response.data;
      if (!d) raw = [];
      else if (Array.isArray(d.courses)) raw = d.courses;
      else if (Array.isArray(d.data?.items)) raw = d.data.items;
      else if (Array.isArray(d.items)) raw = d.items;
      else if (Array.isArray(d)) raw = d;
      else raw = [];

      setCourses(raw);
    } catch (err) {
      console.error('Error fetching courses:', err);
      showToast('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/courses/${selectedCourse.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(prev => prev.filter(c => c.id !== selectedCourse.id));
      setSelectedCourse(null);
      showToast('Course deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting course:', err);
      showToast(err.response?.data?.message || 'Failed to delete course');
    } finally {
      setDeleting(false);
    }
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filteredCourses = courses.filter(c => {
    const matchesTitle = c.title?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesTitle) return false;
    if (filterStatus === 'All') return true;
    const st = _normalizeStatus(c.status);
    if (filterStatus === 'Approved') return st === 'approved' || st === 'published' || st === 'active';
    if (filterStatus === 'Pending') return st === 'pending' || st === 'awaiting' || st === 'under review';
    if (filterStatus === 'Rejected') return st === 'rejected' || st === 'declined' || st === 'blocked';
    return true;
  });

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = {
    total:    courses.length,
    approved: courses.filter(c => {
      const s = _normalizeStatus(c.status);
      return s === 'approved' || s === 'published';
    }).length,
    pending:  courses.filter(c => _normalizeStatus(c.status) === 'pending').length,
    students: courses.reduce((sum, c) => sum + Number(enrollCount(c)), 0),
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
            background: `rgba(255,255,255,${Math.random() * 0.35 + 0.05})`,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 70% 50% at 10% 10%, rgba(139,92,246,0.07) 0%, transparent 60%),
                       radial-gradient(ellipse 50% 40% at 90% 90%, rgba(99,102,241,0.05) 0%, transparent 60%)`,
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '32px 16px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* ── Top bar ── */}
          <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={() => navigate('/teacher')} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'none', border: `1px solid ${t.border}`, borderRadius: 10,
                color: t.textSecondary, fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, padding: '8px 14px', cursor: 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.textPrimary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSecondary; }}
              >
                <FiArrowLeft size={13} /> Back
              </button>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.accent, marginBottom: 2 }}>
                  Teacher Dashboard
                </p>
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700,
                  background: `linear-gradient(135deg, ${t.textPrimary} 50%, ${t.textSecondary})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Manage Courses</h1>
              </div>
            </div>

            <button onClick={() => navigate('/teacher/create-course')} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: `linear-gradient(135deg, ${t.accent}, #6D28D9)`,
              border: 'none', borderRadius: 12, color: '#fff',
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
              padding: '11px 24px', cursor: 'pointer',
              boxShadow: `0 0 28px ${t.accentGlow}`,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 0 40px ${t.accentGlow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 0 28px ${t.accentGlow}`; }}
            >
              <FiPlus size={16} /> Create Course
            </button>
            <button onClick={() => setShowRaw(s => !s)} style={{
              marginLeft: 10,
              background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 10,
              color: t.textSecondary, padding: '8px 12px', cursor: 'pointer', fontSize: 13,
            }}>
              {showRaw ? 'Hide API JSON' : 'Show API JSON'}
            </button>
          </div>

          {showRaw && rawResponse && (
            <div style={{ marginTop: 18, background: '#071026', border: `1px solid ${t.border}`, padding: 12, borderRadius: 10 }}>
              <strong style={{ display: 'block', marginBottom: 8 }}>Backend response (raw):</strong>
              <pre style={{ maxHeight: 240, overflow: 'auto', color: '#cfe7ff', fontSize: 12 }}>{JSON.stringify(rawResponse, null, 2)}</pre>
            </div>
          )}

          {/* ── Stats row ── */}
          <div className="fade-up d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Total Courses', value: stats.total,    color: t.accent  },
              { label: 'Approved',      value: stats.approved, color: t.success },
              { label: 'Pending',       value: stats.pending,  color: t.warning },
              { label: 'Total Students',value: stats.students, color: t.gold    },
            ].map(s => (
              <div key={s.label} style={{
                background: t.bgCard, border: `1px solid ${t.border}`,
                borderRadius: 14, padding: '16px 20px',
              }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: "'DM Sans', sans-serif" }}>{s.value}</p>
                <p style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="fade-up d2" style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 340 }}>
              <FiSearch size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: t.textMuted, pointerEvents: 'none' }} />
              <input
                placeholder="Search courses…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', background: t.bgInput, border: `1px solid ${t.border}`,
                  borderRadius: 10, color: t.textPrimary, fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13, padding: '10px 14px 10px 36px', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = t.accent}
                onBlur={e => e.target.style.borderColor = t.border}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', padding: 2,
                }}><FiX size={13} /></button>
              )}
            </div>

            {/* Status filter pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All', 'Approved', 'Pending', 'Rejected'].map(s => {
                const active = filterStatus === s;
                const meta = s === 'All' ? { color: t.accent } : statusMeta(s);
                return (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{
                    padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                    transition: 'all 0.18s',
                    background: active ? meta.color + '20' : 'none',
                    border: `1px solid ${active ? meta.color + '50' : t.border}`,
                    color: active ? meta.color : t.textMuted,
                  }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Grid ── */}
          <div className="fade-up d3">
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filteredCourses.length === 0 ? (
              <EmptyState searchTerm={searchTerm} navigate={navigate} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    navigate={navigate}
                    onDelete={c => setSelectedCourse(c)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Delete Modal */}
      {selectedCourse && (
        <DeleteModal
          course={selectedCourse}
          deleting={deleting}
          onConfirm={handleDeleteCourse}
          onClose={() => !deleting && setSelectedCourse(null)}
        />
      )}
    </>
  );
};

export default ManageCourses;