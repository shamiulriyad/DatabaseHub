import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// ─── Mock service for preview ───────────────────────────────────────────────
const courseService = {
  getCourseById: async () => ({
    id: '1',
    title: 'Mastering React Architecture',
    shortDescription: 'Build scalable, production-grade React applications.',
    fullDescription: '<p>Deep dive into React patterns, performance optimization, and modern tooling.</p>',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    videoParts: [
      { id: 'v1', title: 'Introduction to React Patterns', description: 'Overview of compound components, render props, and hooks.', videoUrl: '', youtubeUrl: 'https://youtube.com/watch?v=xxx', isPreview: true },
      { id: 'v2', title: 'Performance Optimization', description: 'useMemo, useCallback, and React.memo in depth.', videoUrl: '', youtubeUrl: '', isPreview: false },
    ]
  }),
  updateCourse: async () => {}
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
`;

const css = `
  ${FONTS}

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-void:        #03020a;
    --bg-deep:        #07050f;
    --bg-card:        #0d0a1a;
    --bg-card-hover:  #120f22;
    --bg-input:       #0a0817;
    --border:         rgba(138, 92, 246, 0.15);
    --border-glow:    rgba(138, 92, 246, 0.4);
    --accent-violet:  #8a5cf6;
    --accent-indigo:  #6366f1;
    --accent-rose:    #f43f5e;
    --accent-amber:   #f59e0b;
    --text-primary:   #ede9ff;
    --text-secondary: #a89bc4;
    --text-muted:     #5e5278;
    --star-white:     rgba(255,255,255,0.6);
    --font-head:      'Playfair Display', Georgia, serif;
    --font-body:      'DM Sans', sans-serif;
    --radius-sm:      8px;
    --radius-md:      14px;
    --radius-lg:      20px;
    --transition:     0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  body {
    background: var(--bg-void);
    color: var(--text-primary);
    font-family: var(--font-body);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Starfield ── */
  .cosmos-bg {
    position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
  }
  .cosmos-bg::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,60,200,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(244,63,94,0.08) 0%, transparent 50%),
      radial-gradient(ellipse 40% 60% at 60% 30%, rgba(99,102,241,0.1) 0%, transparent 60%);
  }
  .cosmos-bg::after {
    content: '';
    position: absolute; inset: 0;
    background-image:
      radial-gradient(1px 1px at 15% 20%, var(--star-white), transparent),
      radial-gradient(1px 1px at 35% 65%, var(--star-white), transparent),
      radial-gradient(1.5px 1.5px at 55% 15%, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 70% 50%, var(--star-white), transparent),
      radial-gradient(1px 1px at 85% 25%, var(--star-white), transparent),
      radial-gradient(1px 1px at 10% 80%, var(--star-white), transparent),
      radial-gradient(1px 1px at 92% 70%, var(--star-white), transparent),
      radial-gradient(1px 1px at 45% 90%, var(--star-white), transparent),
      radial-gradient(1.5px 1.5px at 25% 45%, rgba(200,180,255,0.7), transparent),
      radial-gradient(1px 1px at 78% 88%, var(--star-white), transparent);
  }

  /* ── Layout ── */
  .page-wrapper {
    position: relative; z-index: 1;
    min-height: 100vh;
    padding: 0 0 80px;
  }

  /* ── Header Bar ── */
  .page-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 48px;
    border-bottom: 1px solid var(--border);
    background: rgba(7,5,15,0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    position: sticky; top: 0; z-index: 100;
  }
  .header-brand {
    display: flex; align-items: center; gap: 12px;
  }
  .brand-orb {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-violet), var(--accent-indigo));
    box-shadow: 0 0 20px rgba(138,92,246,0.5);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .brand-label {
    font-family: var(--font-head);
    font-size: 18px; font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.01em;
  }
  .btn-back {
    display: flex; align-items: center; gap: 8px;
    background: rgba(138,92,246,0.08);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    font-family: var(--font-body); font-size: 13px; font-weight: 500;
    padding: 8px 16px; border-radius: var(--radius-sm);
    cursor: pointer; transition: var(--transition);
    letter-spacing: 0.02em;
  }
  .btn-back:hover {
    background: rgba(138,92,246,0.15);
    border-color: var(--border-glow);
    color: var(--text-primary);
  }

  /* ── Main Content ── */
  .content-area {
    max-width: 900px;
    margin: 0 auto;
    padding: 48px 24px 0;
  }

  /* ── Page Title Section ── */
  .page-title-section {
    margin-bottom: 48px;
  }
  .page-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-body); font-size: 11px; font-weight: 600;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--accent-violet);
    margin-bottom: 12px;
  }
  .page-eyebrow::before {
    content: '';
    width: 20px; height: 1px;
    background: var(--accent-violet);
  }
  .page-title {
    font-family: var(--font-head);
    font-size: clamp(32px, 5vw, 48px);
    font-weight: 700;
    line-height: 1.1;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  .page-title em {
    font-style: italic;
    background: linear-gradient(135deg, var(--accent-violet), var(--accent-indigo));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .page-subtitle {
    font-size: 15px; color: var(--text-muted); font-weight: 300;
    letter-spacing: 0.01em;
  }

  /* ── Section Card ── */
  .section-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 36px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
    transition: border-color var(--transition);
  }
  .section-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(138,92,246,0.4), transparent);
  }
  .section-card:hover { border-color: rgba(138,92,246,0.25); }

  .section-header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 28px;
  }
  .section-icon {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, rgba(138,92,246,0.2), rgba(99,102,241,0.1));
    border: 1px solid rgba(138,92,246,0.3);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .section-title {
    font-family: var(--font-head);
    font-size: 22px; font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }
  .section-desc {
    font-size: 13px; color: var(--text-muted);
    font-weight: 300; margin-top: 2px;
  }

  /* ── Form Fields ── */
  .field-group {
    margin-bottom: 20px;
  }
  .field-label {
    display: block;
    font-size: 12px; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
  .field-input, .field-textarea {
    width: 100%;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-family: var(--font-body); font-size: 14px; font-weight: 400;
    padding: 12px 16px;
    transition: var(--transition);
    outline: none;
    resize: none;
  }
  .field-input:focus, .field-textarea:focus {
    border-color: var(--accent-violet);
    background: rgba(138,92,246,0.06);
    box-shadow: 0 0 0 3px rgba(138,92,246,0.1);
  }
  .field-input::placeholder, .field-textarea::placeholder {
    color: var(--text-muted);
  }
  .field-hint {
    font-size: 11px; color: var(--text-muted);
    margin-top: 6px; font-weight: 300;
  }

  .field-row {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (max-width: 600px) { .field-row { grid-template-columns: 1fr; } }

  /* ── Thumbnail Preview ── */
  .thumb-wrapper {
    display: grid; grid-template-columns: 1fr 200px;
    gap: 16px; align-items: start;
  }
  @media (max-width: 600px) { .thumb-wrapper { grid-template-columns: 1fr; } }
  .thumb-preview {
    width: 200px; height: 120px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    object-fit: cover;
    background: var(--bg-input);
    overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    color: var(--text-muted); font-size: 12px;
  }
  .thumb-preview img { width: 100%; height: 100%; object-fit: cover; }

  /* ── Video Part Card ── */
  .video-part-card {
    background: rgba(3,2,10,0.6);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 24px;
    margin-bottom: 16px;
    position: relative;
    transition: border-color var(--transition);
    animation: slideIn 0.3s ease;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .video-part-card:hover { border-color: rgba(138,92,246,0.25); }

  .part-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
  }
  .part-number {
    display: flex; align-items: center; gap: 10px;
  }
  .part-badge {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-violet), var(--accent-indigo));
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #fff;
    flex-shrink: 0;
  }
  .part-label {
    font-family: var(--font-head); font-size: 15px; font-weight: 600;
    color: var(--text-secondary); font-style: italic;
  }
  .part-actions { display: flex; align-items: center; gap: 8px; }

  .toggle-preview {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--text-muted);
    cursor: pointer; user-select: none;
    transition: color var(--transition);
  }
  .toggle-preview:hover { color: var(--accent-amber); }
  .toggle-preview input { display: none; }
  .toggle-pill {
    width: 32px; height: 18px; border-radius: 9px;
    background: var(--bg-input);
    border: 1px solid var(--border);
    position: relative; transition: var(--transition);
    cursor: pointer;
  }
  .toggle-pill.on {
    background: linear-gradient(90deg, var(--accent-amber), #f97316);
    border-color: var(--accent-amber);
    box-shadow: 0 0 10px rgba(245,158,11,0.3);
  }
  .toggle-pill::after {
    content: '';
    position: absolute; top: 2px; left: 2px;
    width: 12px; height: 12px; border-radius: 50%;
    background: white; transition: var(--transition);
  }
  .toggle-pill.on::after { left: 16px; }

  .btn-remove {
    background: transparent;
    border: 1px solid rgba(244,63,94,0.2);
    color: rgba(244,63,94,0.6);
    font-family: var(--font-body); font-size: 12px; font-weight: 500;
    padding: 5px 12px; border-radius: 6px;
    cursor: pointer; transition: var(--transition);
    letter-spacing: 0.03em;
  }
  .btn-remove:hover {
    background: rgba(244,63,94,0.1);
    border-color: var(--accent-rose);
    color: var(--accent-rose);
  }

  /* ── Empty State ── */
  .empty-parts {
    text-align: center; padding: 40px 0;
    color: var(--text-muted); font-size: 14px; font-weight: 300;
  }
  .empty-parts .empty-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.4; }

  /* ── Add Part Button ── */
  .btn-add {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 14px;
    background: transparent;
    border: 1px dashed rgba(138,92,246,0.3);
    border-radius: var(--radius-md);
    color: var(--accent-violet); font-family: var(--font-body);
    font-size: 13px; font-weight: 500;
    cursor: pointer; transition: var(--transition);
    letter-spacing: 0.04em;
  }
  .btn-add:hover {
    background: rgba(138,92,246,0.08);
    border-color: var(--accent-violet);
    box-shadow: 0 0 20px rgba(138,92,246,0.1);
  }
  .btn-add svg { transition: transform var(--transition); }
  .btn-add:hover svg { transform: rotate(90deg); }

  /* ── Action Footer ── */
  .action-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 36px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    margin-top: 12px;
  }
  .footer-info {
    font-size: 13px; color: var(--text-muted); font-weight: 300;
  }
  .footer-info strong { color: var(--text-secondary); font-weight: 500; }

  .btn-save {
    display: flex; align-items: center; gap: 10px;
    background: linear-gradient(135deg, var(--accent-violet), var(--accent-indigo));
    color: #fff; font-family: var(--font-body);
    font-size: 14px; font-weight: 600;
    padding: 12px 32px; border-radius: var(--radius-sm);
    border: none; cursor: pointer;
    transition: var(--transition);
    letter-spacing: 0.04em;
    box-shadow: 0 4px 24px rgba(138,92,246,0.35);
    position: relative; overflow: hidden;
  }
  .btn-save::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
    opacity: 0; transition: opacity var(--transition);
  }
  .btn-save:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(138,92,246,0.5); }
  .btn-save:hover::before { opacity: 1; }
  .btn-save:active { transform: translateY(0); }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* ── Toast ── */
  .toast {
    position: fixed; bottom: 32px; right: 32px; z-index: 999;
    padding: 14px 24px; border-radius: var(--radius-sm);
    font-size: 14px; font-weight: 500; font-family: var(--font-body);
    display: flex; align-items: center; gap: 10px;
    animation: toastIn 0.3s ease;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .toast.success {
    background: rgba(16,185,129,0.15);
    border: 1px solid rgba(16,185,129,0.4);
    color: #6ee7b7;
  }
  .toast.error {
    background: rgba(244,63,94,0.15);
    border: 1px solid rgba(244,63,94,0.4);
    color: #fda4af;
  }

  /* ── Loading ── */
  .loading-state {
    display: flex; align-items: center; justify-content: center;
    height: 100vh; gap: 12px;
    font-family: var(--font-head); font-size: 18px; font-style: italic;
    color: var(--text-secondary);
  }
  .spin {
    width: 20px; height: 20px; border-radius: 50%;
    border: 2px solid var(--border);
    border-top-color: var(--accent-violet);
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
    margin: 24px 0;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────
const CourseEdit = () => {
  const courseId = '1';
  const [course, setCourse] = useState(null);
  const [videoParts, setVideoParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await courseService.getCourseById(courseId);
        setCourse(data);
        setVideoParts((data?.videoParts || data?.VideoParts || []).map(p => ({
          id: p.id, title: p.title, description: p.description,
          videoUrl: p.videoUrl || '', youtubeUrl: p.youtubeUrl || p.youTubeUrl || '',
          isPreview: p.isPreview
        })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [courseId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        Title: course.title, ShortDescription: course.shortDescription,
        FullDescription: course.fullDescription, ThumbnailUrl: course.thumbnailUrl,
        VideoParts: videoParts.map((p, idx) => ({
          id: p.id, title: p.title, description: p.description,
          videoUrl: p.videoUrl, youTubeUrl: p.youtubeUrl,
          order: idx + 1, isPreview: !!p.isPreview
        }))
      };
      await courseService.updateCourse(course.id, payload);
      showToast('Course saved successfully ✓', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save course', 'error');
    } finally { setSaving(false); }
  };

  const updatePart = (idx, key, val) =>
    setVideoParts(prev => prev.map((x, i) => i === idx ? { ...x, [key]: val } : x));

  const removePart = idx =>
    setVideoParts(prev => prev.filter((_, i) => i !== idx));

  const addPart = () =>
    setVideoParts(prev => [...prev, { title: '', description: '', videoUrl: '', youtubeUrl: '', isPreview: false }]);

  if (loading) return (
    <>
      <style>{css}</style>
      <div className="loading-state">
        <div className="spin" />
        <span>Loading course…</span>
      </div>
    </>
  );
  if (!course) return (
    <>
      <style>{css}</style>
      <div className="loading-state">Course not found.</div>
    </>
  );

  return (
    <>
      <style>{css}</style>

      {/* Starfield */}
      <div className="cosmos-bg" />

      <div className="page-wrapper">

        {/* Header */}
        <header className="page-header">
          <div className="header-brand">
            <div className="brand-orb">✦</div>
            <span className="brand-label">CourseForge</span>
          </div>
          <button className="btn-back" onClick={() => window.history.back()}>
            ← Back to Courses
          </button>
        </header>

        {/* Content */}
        <main className="content-area">

          {/* Title */}
          <div className="page-title-section">
            <div className="page-eyebrow">Course Management</div>
            <h1 className="page-title">Edit <em>Course</em></h1>
            <p className="page-subtitle">Update course details, description, and curriculum below.</p>
          </div>

          {/* ── Core Details ── */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">📋</div>
              <div>
                <div className="section-title">Core Details</div>
                <div className="section-desc">Basic information displayed to learners</div>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Course Title</label>
              <input
                className="field-input"
                value={course.title}
                onChange={e => setCourse({ ...course, title: e.target.value })}
                placeholder="e.g. Mastering React Architecture"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Short Description</label>
              <input
                className="field-input"
                value={course.shortDescription}
                onChange={e => setCourse({ ...course, shortDescription: e.target.value })}
                placeholder="One-line summary for course listings"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Full Description <span style={{color:'var(--text-muted)',fontWeight:300,textTransform:'none',letterSpacing:0}}>(HTML supported)</span></label>
              <textarea
                className="field-textarea"
                rows={7}
                value={course.fullDescription || ''}
                onChange={e => setCourse({ ...course, fullDescription: e.target.value })}
                placeholder="<p>Detailed course overview…</p>"
              />
              <div className="field-hint">Supports standard HTML tags: &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, &lt;a&gt;, etc.</div>
            </div>
          </div>

          {/* ── Thumbnail ── */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">🖼</div>
              <div>
                <div className="section-title">Thumbnail</div>
                <div className="section-desc">Cover image shown in course listings</div>
              </div>
            </div>

            <div className="thumb-wrapper">
              <div className="field-group" style={{marginBottom:0}}>
                <label className="field-label">Thumbnail URL</label>
                <input
                  className="field-input"
                  value={course.thumbnailUrl || ''}
                  onChange={e => setCourse({ ...course, thumbnailUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                <div className="field-hint">Recommended: 1280×720px, JPG or PNG</div>
              </div>
              <div className="thumb-preview">
                {course.thumbnailUrl
                  ? <img src={course.thumbnailUrl} alt="Thumbnail preview" onError={e => { e.target.style.display='none'; }} />
                  : <span>No image</span>
                }
              </div>
            </div>
          </div>

          {/* ── Video Parts ── */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">🎬</div>
              <div>
                <div className="section-title">Curriculum & Videos</div>
                <div className="section-desc">{videoParts.length} part{videoParts.length !== 1 ? 's' : ''} · Drag to reorder coming soon</div>
              </div>
            </div>

            {videoParts.length === 0 && (
              <div className="empty-parts">
                <div className="empty-icon">📽️</div>
                <p>No course parts yet.</p>
                <p style={{marginTop:4, fontSize:12}}>Add your first video part below.</p>
              </div>
            )}

            {videoParts.map((p, idx) => (
              <div className="video-part-card" key={idx}>
                <div className="part-header">
                  <div className="part-number">
                    <div className="part-badge">{idx + 1}</div>
                    <span className="part-label">Part {idx + 1}</span>
                  </div>
                  <div className="part-actions">
                    <label
                      className="toggle-preview"
                      title="Mark as free preview"
                      onClick={() => updatePart(idx, 'isPreview', !p.isPreview)}
                    >
                      <div className={`toggle-pill${p.isPreview ? ' on' : ''}`} />
                      <span style={{color: p.isPreview ? 'var(--accent-amber)' : undefined}}>
                        {p.isPreview ? '★ Preview' : 'Preview'}
                      </span>
                    </label>
                    <button className="btn-remove" onClick={() => removePart(idx)}>Remove</button>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Part Title</label>
                  <input
                    className="field-input"
                    value={p.title || ''}
                    onChange={e => updatePart(idx, 'title', e.target.value)}
                    placeholder="e.g. Introduction to the Topic"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Part Description</label>
                  <textarea
                    className="field-textarea"
                    rows={3}
                    value={p.description || ''}
                    onChange={e => updatePart(idx, 'description', e.target.value)}
                    placeholder="What will learners cover in this part?"
                  />
                </div>

                <div className="field-row">
                  <div>
                    <label className="field-label">Video URL</label>
                    <input
                      className="field-input"
                      value={p.videoUrl || ''}
                      onChange={e => updatePart(idx, 'videoUrl', e.target.value)}
                      placeholder="https://cdn.example.com/video.mp4"
                    />
                  </div>
                  <div>
                    <label className="field-label">YouTube URL</label>
                    <input
                      className="field-input"
                      value={p.youtubeUrl || ''}
                      onChange={e => updatePart(idx, 'youtubeUrl', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className="btn-add" onClick={addPart}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add New Part
            </button>
          </div>

          {/* ── Action Footer ── */}
          <div className="action-footer">
            <div className="footer-info">
              <strong>{videoParts.length}</strong> video{videoParts.length !== 1 ? 's' : ''} · Last edited just now
            </div>
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving
                ? <><div className="spin" style={{borderTopColor:'#fff', width:14, height:14}} />Saving…</>
                : <>Save Changes ✦</>
              }
            </button>
          </div>

        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}
    </>
  );
};

export default CourseEdit;