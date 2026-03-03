import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

/* ─── Cosmic Dark Premium Design System ───────────────────────────────────
   Primary Font : Playfair Display (headings)
   Body Font    : DM Sans (body, UI)
   Mode         : Dark only
   Palette      :
     --bg-base      : #080b14   (deep space)
     --bg-surface   : #0e1322   (card surface)
     --bg-elevated  : #141929   (elevated)
     --border       : rgba(255,255,255,0.07)
     --accent       : #7c6af7   (cosmic violet)
     --accent-2     : #a78bfa
     --gold         : #f4c66a
     --success      : #34d399
     --text-primary : #f0f4ff
     --text-muted   : #7b82a0
──────────────────────────────────────────────────────────────────────── */

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
`;

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-base: #080b14;
    --bg-surface: #0e1322;
    --bg-elevated: #141929;
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(124,106,247,0.45);
    --accent: #7c6af7;
    --accent-2: #a78bfa;
    --accent-glow: rgba(124,106,247,0.18);
    --gold: #f4c66a;
    --success: #34d399;
    --success-glow: rgba(52,211,153,0.15);
    --text-primary: #f0f4ff;
    --text-muted: #7b82a0;
    --text-dim: #4a5175;
  }

  body { background: var(--bg-base); color: var(--text-primary); font-family: 'DM Sans', sans-serif; }

  /* ── Page ── */
  .enroll-page {
    min-height: 100vh;
    background: var(--bg-base);
    padding: 40px 24px 80px;
    position: relative;
    overflow: hidden;
  }

  /* starfield */
  .enroll-page::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(1px 1px at 15% 12%, rgba(255,255,255,0.55) 0%, transparent 100%),
      radial-gradient(1px 1px at 72% 8%,  rgba(255,255,255,0.40) 0%, transparent 100%),
      radial-gradient(1px 1px at 40% 35%, rgba(255,255,255,0.30) 0%, transparent 100%),
      radial-gradient(1px 1px at 88% 50%, rgba(255,255,255,0.45) 0%, transparent 100%),
      radial-gradient(1px 1px at 5%  65%, rgba(255,255,255,0.35) 0%, transparent 100%),
      radial-gradient(1px 1px at 55% 78%, rgba(255,255,255,0.25) 0%, transparent 100%),
      radial-gradient(1px 1px at 30% 90%, rgba(255,255,255,0.40) 0%, transparent 100%),
      radial-gradient(1px 1px at 95% 85%, rgba(255,255,255,0.30) 0%, transparent 100%),
      radial-gradient(1px 1px at 20% 55%, rgba(255,255,255,0.20) 0%, transparent 100%),
      radial-gradient(1px 1px at 65% 42%, rgba(255,255,255,0.35) 0%, transparent 100%);
    pointer-events: none;
    z-index: 0;
  }

  /* ambient orbs */
  .enroll-page::after {
    content: '';
    position: fixed;
    top: -200px; left: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(124,106,247,0.08) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  .orb-right {
    position: fixed;
    bottom: -150px; right: -150px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
    border-radius: 50%;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  /* ── Back button ── */
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    padding: 10px 18px;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.25s;
    margin-bottom: 40px;
    letter-spacing: 0.01em;
  }
  .back-btn:hover {
    border-color: var(--accent);
    color: var(--accent-2);
    background: var(--accent-glow);
    transform: translateX(-2px);
  }

  /* ── Header ── */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 48px;
    flex-wrap: wrap;
    gap: 20px;
  }

  .header-left {}

  .header-eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent-2);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .header-eyebrow::before {
    content: '';
    display: inline-block;
    width: 20px; height: 1px;
    background: var(--accent-2);
  }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 4vw, 48px);
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .page-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--text-muted);
    margin-top: 8px;
    font-weight: 400;
  }

  .browse-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, var(--accent) 0%, #9b8df5 100%);
    border: none;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    padding: 14px 28px;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: 0.02em;
    box-shadow: 0 4px 24px rgba(124,106,247,0.3);
    white-space: nowrap;
  }
  .browse-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(124,106,247,0.45);
  }

  /* ── Divider ── */
  .cosmic-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent) 30%, var(--accent-2) 70%, transparent);
    opacity: 0.3;
    margin-bottom: 48px;
  }

  /* ── Stats Bar ── */
  .stats-bar {
    display: flex;
    gap: 24px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }

  .stat-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 50px;
    padding: 8px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--text-muted);
  }
  .stat-chip strong {
    color: var(--text-primary);
    font-weight: 600;
  }
  .stat-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 6px var(--accent);
  }
  .stat-dot.green { background: var(--success); box-shadow: 0 0 6px var(--success); }

  /* ── Grid ── */
  .courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
  }

  /* ── Card ── */
  .course-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    transition: transform 0.35s cubic-bezier(.22,.61,.36,1), border-color 0.3s, box-shadow 0.35s;
    cursor: pointer;
    animation: fadeUp 0.5s ease both;
  }
  .course-card:hover {
    transform: translateY(-6px);
    border-color: var(--border-hover);
    box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,106,247,0.2);
  }
  .course-card.completed:hover {
    border-color: rgba(52,211,153,0.35);
    box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(52,211,153,0.15);
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* stagger */
  .course-card:nth-child(1) { animation-delay: 0.05s; }
  .course-card:nth-child(2) { animation-delay: 0.10s; }
  .course-card:nth-child(3) { animation-delay: 0.15s; }
  .course-card:nth-child(4) { animation-delay: 0.20s; }
  .course-card:nth-child(5) { animation-delay: 0.25s; }
  .course-card:nth-child(6) { animation-delay: 0.30s; }

  /* ── Card Banner ── */
  .card-banner {
    width: 100%;
    height: 168px;
    object-fit: cover;
    display: block;
  }

  .card-banner-placeholder {
    width: 100%;
    height: 168px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1440 0%, #2d1b69 50%, #1a0f3a 100%);
    position: relative;
    overflow: hidden;
  }
  .card-banner-placeholder::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 50% 70%, rgba(255,255,255,0.2) 0%, transparent 100%),
      radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.35) 0%, transparent 100%),
      radial-gradient(1px 1px at 90% 60%, rgba(255,255,255,0.25) 0%, transparent 100%);
  }
  .card-banner-placeholder .banner-icon {
    font-size: 36px;
    opacity: 0.6;
    position: relative;
    z-index: 1;
  }

  /* ── Progress ribbon ── */
  .progress-ribbon {
    position: absolute;
    top: 12px; right: 12px;
    background: rgba(8,11,20,0.85);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border);
    color: var(--accent-2);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 50px;
    letter-spacing: 0.05em;
    z-index: 2;
  }
  .progress-ribbon.complete {
    color: var(--success);
    border-color: rgba(52,211,153,0.3);
  }

  /* ── Card Body ── */
  .card-body {
    padding: 22px 22px 26px;
  }

  /* status row */
  .card-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }

  .status-badge {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 50px;
    background: rgba(124,106,247,0.12);
    border: 1px solid rgba(124,106,247,0.25);
    color: var(--accent-2);
  }
  .status-badge.complete {
    background: rgba(52,211,153,0.10);
    border-color: rgba(52,211,153,0.25);
    color: var(--success);
  }

  .rating-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--gold);
  }

  /* Course title */
  .course-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.35;
    margin-bottom: 10px;
    letter-spacing: -0.01em;
  }

  /* Instructor */
  .instructor-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
  }
  .instructor-avatar {
    width: 24px; height: 24px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
    color: var(--accent-2);
    flex-shrink: 0;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
  }
  .instructor-name {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--text-muted);
  }

  /* ── Progress section ── */
  .progress-section {
    margin-bottom: 16px;
  }
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .progress-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--text-dim);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .progress-count {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent-2);
  }
  .progress-count.complete { color: var(--success); }

  .progress-track {
    width: 100%;
    height: 5px;
    background: var(--bg-elevated);
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .progress-fill {
    height: 100%;
    border-radius: 10px;
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    transition: width 1s cubic-bezier(.22,.61,.36,1);
    position: relative;
  }
  .progress-fill::after {
    content: '';
    position: absolute;
    right: 0; top: 0;
    width: 6px; height: 100%;
    background: rgba(255,255,255,0.6);
    border-radius: 10px;
    filter: blur(2px);
  }
  .progress-fill.complete {
    background: linear-gradient(90deg, #34d399, #6ee7b7);
  }

  /* ── Enrolled date ── */
  .enrolled-date {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 20px;
  }

  /* ── CTA Button ── */
  .card-cta {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid;
    transition: all 0.25s;
    letter-spacing: 0.03em;
  }
  .card-cta.learning {
    background: rgba(124,106,247,0.12);
    border-color: rgba(124,106,247,0.35);
    color: var(--accent-2);
  }
  .card-cta.learning:hover {
    background: rgba(124,106,247,0.22);
    border-color: var(--accent);
    box-shadow: 0 0 20px rgba(124,106,247,0.2);
    transform: translateY(-1px);
  }
  .card-cta.review {
    background: rgba(52,211,153,0.08);
    border-color: rgba(52,211,153,0.3);
    color: var(--success);
  }
  .card-cta.review:hover {
    background: rgba(52,211,153,0.15);
    border-color: var(--success);
    box-shadow: 0 0 20px rgba(52,211,153,0.15);
    transform: translateY(-1px);
  }

  /* ── Empty state ── */
  .empty-state {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 80px 40px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    animation: fadeUp 0.4s ease both;
  }
  .empty-icon {
    width: 80px; height: 80px;
    border-radius: 50%;
    background: rgba(124,106,247,0.1);
    border: 1px solid rgba(124,106,247,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 32px;
    margin-bottom: 8px;
  }
  .empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
  }
  .empty-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--text-muted);
    max-width: 360px;
    line-height: 1.6;
  }

  /* ── Spinner ── */
  .loading-screen {
    min-height: 100vh;
    background: var(--bg-base);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .spinner-ring {
    width: 48px; height: 48px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Responsive ── */
  @media (max-width: 700px) {
    .page-header { flex-direction: column; align-items: flex-start; }
    .courses-grid { grid-template-columns: 1fr; }
    .stats-bar { gap: 12px; }
  }
`;

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/* ─── Component ───────────────────────────────────────────────────────── */
const MyEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchEnrollments();
    const handler = (e) => setTimeout(() => fetchEnrollments(), 800);
    window.addEventListener('enrollmentUpdated', handler);
    return () => window.removeEventListener('enrollmentUpdated', handler);
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/enrollments');
      let raw = [];
      if (response.data) {
        if (Array.isArray(response.data)) raw = response.data;
        else if (response.data.data && Array.isArray(response.data.data)) raw = response.data.data;
        else raw = [];
      }
      const normalized = raw.map(e => ({
        id: e.Id ?? e.id,
        courseId: e.CourseId ?? e.courseId ?? e.course?.id ?? null,
        courseTitle: e.CourseTitle ?? e.courseTitle ?? e.title ?? e.course?.title,
        instructor: e.Instructor ?? e.instructor ?? e.course?.teacherName ?? '',
        instructorAvatar: e.InstructorAvatar ?? e.instructorAvatar ?? e.course?.teacherAvatar ?? null,
        progress: e.ProgressPercentage ?? e.progressPercentage ?? e.progress ?? 0,
        totalLessons: e.TotalLessons ?? e.totalLessons ?? e.CourseTotalLessons ?? e.course?.totalLessons ?? 0,
        completedLessons: (e.CompletedLessons ?? e.completedLessons ?? 0) || (() => {
          const pct = e.ProgressPercentage ?? e.progressPercentage ?? 0;
          const total = e.TotalLessons ?? e.totalLessons ?? 0;
          return total && pct ? Math.round((pct / 100) * total) : 0;
        })(),
        status: e.Status ?? e.status ?? '',
        enrolledDate: e.EnrolledAt ?? e.enrolledAt ?? e.enrolledDate ?? null,
        rating: e.Rating ?? e.rating ?? 0,
        bannerUrl: e.CourseBannerUrl ?? e.courseBannerUrl ?? e.course?.bannerUrl ?? null,
      }));
      setEnrollments(normalized);
    } catch {
      setEnrollments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const completedCount = enrollments.filter(e => e.progress === 100).length;
  const inProgressCount = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;

  if (isLoading) return (
    <>
      <style>{FONTS + CSS}</style>
      <div className="loading-screen">
        <div className="spinner-ring" />
      </div>
    </>
  );

  return (
    <>
      <style>{FONTS + CSS}</style>
      <div className="enroll-page">
        <div className="orb-right" />
        <div className="container">

          {/* Back */}
          <button className="back-btn" onClick={() => navigate('/profile')}>
            ← Back to Profile
          </button>

          {/* Header */}
          <div className="page-header">
            <div className="header-left">
              <div className="header-eyebrow">Learning Journey</div>
              <h1 className="page-title">My Courses</h1>
              <p className="page-subtitle">
                {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled
              </p>
            </div>
            <button className="browse-btn" onClick={() => navigate('/courses')}>
              ✦ Browse More Courses
            </button>
          </div>

          <div className="cosmic-divider" />

          {/* Stats bar */}
          {enrollments.length > 0 && (
            <div className="stats-bar">
              <div className="stat-chip">
                <span className="stat-dot" />
                <span>In Progress: <strong>{inProgressCount}</strong></span>
              </div>
              <div className="stat-chip">
                <span className="stat-dot green" />
                <span>Completed: <strong>{completedCount}</strong></span>
              </div>
              <div className="stat-chip">
                <span>Total: <strong>{enrollments.length}</strong></span>
              </div>
            </div>
          )}

          {/* Empty state */}
          {enrollments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h2 className="empty-title">No Enrollments Yet</h2>
              <p className="empty-sub">
                Your learning universe awaits. Explore courses and start your journey today.
              </p>
              <button className="browse-btn" onClick={() => navigate('/courses')}>
                ✦ Explore Courses
              </button>
            </div>
          ) : (
            <div className="courses-grid">
              {enrollments.map((enrollment) => {
                const done = enrollment.progress === 100;
                return (
                  <div
                    key={enrollment.id}
                    className={`course-card ${done ? 'completed' : ''}`}
                    onClick={() => navigate(`/courses/${enrollment.courseId || enrollment.id}`)}
                  >
                    {/* Banner */}
                    {enrollment.bannerUrl ? (
                      <img
                        className="card-banner"
                        src={enrollment.bannerUrl}
                        alt={enrollment.courseTitle}
                      />
                    ) : (
                      <div className="card-banner-placeholder">
                        <span className="banner-icon">🎓</span>
                      </div>
                    )}

                    {/* Ribbon */}
                    <div className={`progress-ribbon ${done ? 'complete' : ''}`}>
                      {enrollment.progress}%
                    </div>

                    {/* Body */}
                    <div className="card-body">

                      {/* Meta row */}
                      <div className="card-meta-row">
                        <span className={`status-badge ${done ? 'complete' : ''}`}>
                          {enrollment.status || (done ? 'Completed' : 'In Progress')}
                        </span>
                        {enrollment.rating > 0 && (
                          <div className="rating-chip">
                            ★ {enrollment.rating}
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <div className="course-title">{enrollment.courseTitle}</div>

                      {/* Instructor */}
                      <div className="instructor-row">
                        {enrollment.instructorAvatar ? (
                          <img
                            className="instructor-avatar"
                            src={enrollment.instructorAvatar}
                            alt={enrollment.instructor}
                          />
                        ) : (
                          <div className="instructor-avatar">
                            {initials(enrollment.instructor)}
                          </div>
                        )}
                        <span className="instructor-name">By {enrollment.instructor}</span>
                      </div>

                      {/* Progress */}
                      <div className="progress-section">
                        <div className="progress-header">
                          <span className="progress-label">Progress</span>
                          <span className={`progress-count ${done ? 'complete' : ''}`}>
                            {enrollment.completedLessons}/{enrollment.totalLessons} lessons
                          </span>
                        </div>
                        <div className="progress-track">
                          <div
                            className={`progress-fill ${done ? 'complete' : ''}`}
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Enrolled date */}
                      <div className="enrolled-date">
                        🕐 Enrolled {fmtDate(enrollment.enrolledDate)}
                      </div>

                      {/* CTA */}
                      <button
                        className={`card-cta ${done ? 'review' : 'learning'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/courses/${enrollment.courseId || enrollment.id}`);
                        }}
                      >
                        {done ? '✓ Review Course' : '▶ Continue Learning'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyEnrollments;