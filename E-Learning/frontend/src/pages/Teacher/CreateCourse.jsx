import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiSave, FiSearch, FiUpload, FiPlus, FiTrash2, FiChevronDown, FiVideo, FiImage, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const tokens = {
  bg: '#080B14',
  bgCard: '#0D1120',
  bgInput: '#111827',
  bgSection: '#0A0E1A',
  border: 'rgba(255,255,255,0.07)',
  borderFocus: 'rgba(139,92,246,0.6)',
  accent: '#8B5CF6',
  accentGlow: 'rgba(139,92,246,0.25)',
  accentSoft: 'rgba(139,92,246,0.12)',
  gold: '#F0C060',
  goldGlow: 'rgba(240,192,96,0.2)',
  success: '#10B981',
  error: '#F43F5E',
  textPrimary: '#F0F0F5',
  textSecondary: '#8891AA',
  textMuted: '#4B5268',
};

// ─── Global Styles ─────────────────────────────────────────────────────────────
const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${tokens.bg};
    color: ${tokens.textPrimary};
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${tokens.bg}; }
  ::-webkit-scrollbar-thumb { background: ${tokens.accent}40; border-radius: 4px; }

  ::selection { background: ${tokens.accentGlow}; }

  @keyframes starfield {
    0% { transform: translateY(0); }
    100% { transform: translateY(-50%); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px ${tokens.accentGlow}; }
    50%       { box-shadow: 0 0 40px ${tokens.accentGlow}, 0 0 80px ${tokens.accentGlow}; }
  }

  @keyframes shimmer {
    from { background-position: -200% center; }
    to   { background-position: 200% center; }
  }

  .anim-fade-up { animation: fadeUp 0.5s ease forwards; }
  .anim-delay-1 { animation-delay: 0.05s; opacity: 0; }
  .anim-delay-2 { animation-delay: 0.1s;  opacity: 0; }
  .anim-delay-3 { animation-delay: 0.15s; opacity: 0; }
  .anim-delay-4 { animation-delay: 0.2s;  opacity: 0; }
  .anim-delay-5 { animation-delay: 0.25s; opacity: 0; }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  textarea:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px ${tokens.bgInput} inset !important; -webkit-text-fill-color: ${tokens.textPrimary} !important; }
`;

// ─── Sub-components ────────────────────────────────────────────────────────────

const SectionLabel = ({ step, title, subtitle }) => (
  <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
    <div style={{
      width: 36, height: 36, borderRadius: '50%', flexShrink: 0, marginTop: 2,
      background: `linear-gradient(135deg, ${tokens.accent}, #6D28D9)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 600, color: '#fff',
      boxShadow: `0 0 20px ${tokens.accentGlow}`,
    }}>{step}</div>
    <div>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 22, fontWeight: 700, color: tokens.textPrimary, letterSpacing: '-0.3px',
      }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: tokens.textSecondary, marginTop: 4 }}>{subtitle}</p>}
    </div>
  </div>
);

const FieldLabel = ({ children, required }) => (
  <label style={{
    display: 'block', marginBottom: 8,
    fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
    color: tokens.textSecondary,
  }}>
    {children}{required && <span style={{ color: tokens.accent, marginLeft: 4 }}>*</span>}
  </label>
);

const inputBase = {
  width: '100%',
  background: tokens.bgInput,
  border: `1px solid ${tokens.border}`,
  borderRadius: 10,
  color: tokens.textPrimary,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  padding: '11px 14px',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const CosmicInput = ({ error, style = {}, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      style={{
        ...inputBase,
        borderColor: error ? tokens.error : focused ? tokens.borderFocus : tokens.border,
        boxShadow: focused ? `0 0 0 3px ${tokens.accentGlow}` : 'none',
        ...style,
      }}
    />
  );
};

const CosmicTextarea = ({ error, rows = 4, style = {}, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      rows={rows}
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      style={{
        ...inputBase,
        resize: 'vertical',
        lineHeight: 1.6,
        borderColor: error ? tokens.error : focused ? tokens.borderFocus : tokens.border,
        boxShadow: focused ? `0 0 0 3px ${tokens.accentGlow}` : 'none',
        ...style,
      }}
    />
  );
};

const CosmicSelect = ({ error, children, style = {}, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <select
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{
          ...inputBase,
          appearance: 'none',
          paddingRight: 38,
          cursor: 'pointer',
          borderColor: error ? tokens.error : focused ? tokens.borderFocus : tokens.border,
          boxShadow: focused ? `0 0 0 3px ${tokens.accentGlow}` : 'none',
          ...style,
        }}
      >
        {children}
      </select>
      <FiChevronDown size={16} style={{
        position: 'absolute', right: 12, top: '50%',
        transform: 'translateY(-50%)', color: tokens.textMuted, pointerEvents: 'none',
      }} />
    </div>
  );
};

const ErrorMsg = ({ msg }) => msg ? (
  <p style={{ fontSize: 12, color: tokens.error, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
    <span>⚠</span> {msg}
  </p>
) : null;

const Divider = () => (
  <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${tokens.border} 30%, ${tokens.border} 70%, transparent)`, margin: '36px 0' }} />
);

const Tag = ({ children, color = tokens.accent }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
    padding: '3px 10px', borderRadius: 20,
    background: color + '18', color, border: `1px solid ${color}30`,
  }}>{children}</span>
);

// ─── Main Component ─────────────────────────────────────────────────────────────
const CreateCourse = () => {
  const navigate = useNavigate();

  const [loading, setLoading]       = useState(false);
  const [uniLoading, setUniLoading] = useState(false);
  const [deptLoading, setDeptLoading] = useState(false);
  const [toast, setToast]           = useState(null); // { msg, type }

  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments]   = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [universityQuery, setUniversityQuery]       = useState('');

  const [formData, setFormData] = useState({
    title: '', description: '', overview: '',
    universityId: '', departmentId: '',
    courseCode: '', courseType: '',
    price: '0', difficulty: 'Beginner',
    isFree: true, language: 'English',
    category: 'Programming',
    courseImage: '', instructor: '',
    previewVideoUrl: '', youtubeUrl: '',
  });

  const [videoParts, setVideoParts] = useState([
    { title: '', description: '', videoUrl: '', youtubeUrl: '', isPreview: false, durationSeconds: 0 }
  ]);

  const [errors, setErrors] = useState({});

  // ── Toast helper ──────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch universities on mount ───────────────────────────────────────────────
  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    setUniLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/universities', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const payload = response.data?.data ?? response.data?.universities ?? response.data;
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (payload?.items && Array.isArray(payload.items)) list = payload.items;

      const mapped = list.map(u => ({
        id:          (u.id ?? u.Id)?.toString(),
        name:        u.name ?? u.Name,
        code:        u.code ?? u.Code,
        description: u.description ?? u.Description ?? '',
      }));
      setUniversities(mapped);
    } catch (err) {
      console.error('Error fetching universities:', err);
      showToast('Failed to load universities');
    } finally {
      setUniLoading(false);
    }
  };

  // ── Fetch departments when university changes ──────────────────────────────────
  const fetchDepartments = async (universityId) => {
    if (!universityId) { setDepartments([]); return; }
    setDeptLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/universities/${universityId}/departments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const payload = response.data?.data ?? response.data?.departments ?? response.data;
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (payload?.items && Array.isArray(payload.items)) list = payload.items;

      const mapped = list.map(d => ({
        id:   (d.id ?? d.Id)?.toString(),
        name: d.name ?? d.Name,
      }));
      setDepartments(mapped);
    } catch (err) {
      console.error('Error fetching departments:', err);
      showToast('Failed to load departments');
      setDepartments([]);
    } finally {
      setDeptLoading(false);
    }
  };

  // ── Progress calculation ───────────────────────────────────────────────────────
  const fields = ['title', 'description', 'overview', 'courseCode', 'courseType', 'universityId', 'departmentId'];
  const filled = fields.filter(f => formData[f]?.toString().trim()).length;
  const progress = Math.round((filled / fields.length) * 100);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleUniversitySelection = (uni) => {
    setSelectedUniversity(uni.id);
    setFormData(prev => ({ ...prev, universityId: uni.id, departmentId: '' }));
    setUniversityQuery('');
    setErrors(prev => ({ ...prev, universityId: '', departmentId: '' }));
    fetchDepartments(uni.id);
  };

  const filteredUniversities = universities.filter(u => {
    if (!universityQuery) return true;
    const q = universityQuery.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) || (u.code || '').toLowerCase().includes(q);
  });

  const getSelectedUniversityName = () => {
    const u = universities.find(u => u.id === selectedUniversity);
    return u ? `${u.name}${u.code ? ` (${u.code})` : ''}` : '';
  };

  // ── Video part helpers ────────────────────────────────────────────────────────
  const updatePart = (index, key, value) =>
    setVideoParts(prev => prev.map((p, i) => i === index ? { ...p, [key]: value } : p));
  const addPart    = () => setVideoParts(prev => [...prev, { title: '', description: '', videoUrl: '', youtubeUrl: '', isPreview: false, durationSeconds: 0 }]);
  const removePart = (index) => setVideoParts(prev => prev.filter((_, i) => i !== index));

  // ── Image upload ─────────────────────────────────────────────────────────────
  const handleImageUpload = async (file) => {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post('/api/uploads/image', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.url) {
        setFormData(prev => ({ ...prev, courseImage: res.data.url }));
        showToast('Image uploaded successfully', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload image');
    }
  };

  // ── Preview video upload ──────────────────────────────────────────────────────
  const handlePreviewVideoUpload = async (file) => {
    const objectUrl = URL.createObjectURL(file);
    const videoEl   = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.src     = objectUrl;
    videoEl.onloadedmetadata = async () => {
      URL.revokeObjectURL(objectUrl);
      if (videoEl.duration > 300) {
        showToast('Preview video must be 5 minutes or less'); return;
      }
      const token = localStorage.getItem('token');
      const fd    = new FormData();
      fd.append('file', file);
      fd.append('durationSeconds', String(Math.round(videoEl.duration)));
      try {
        const res = await axios.post('/api/uploads/video', fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.url) {
          setFormData(prev => ({ ...prev, previewVideoUrl: res.data.url }));
          showToast('Preview video uploaded', 'success');
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to upload preview video');
      }
    };
    videoEl.onerror = () => { URL.revokeObjectURL(objectUrl); showToast('Cannot read video file'); };
  };

  // ── Part video upload ─────────────────────────────────────────────────────────
  const handlePartVideoUpload = async (file, idx) => {
    const objectUrl = URL.createObjectURL(file);
    const videoEl   = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.src     = objectUrl;
    videoEl.onloadedmetadata = async () => {
      URL.revokeObjectURL(objectUrl);
      if (videoEl.duration > 300) {
        showToast('Part video must be 5 minutes or less'); return;
      }
      const token = localStorage.getItem('token');
      const fd    = new FormData();
      fd.append('file', file);
      fd.append('durationSeconds', String(Math.round(videoEl.duration)));
      try {
        const res = await axios.post('/api/uploads/video', fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.url) {
          updatePart(idx, 'videoUrl', res.data.url);
          updatePart(idx, 'durationSeconds', Math.round(videoEl.duration));
          showToast('Part video uploaded', 'success');
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to upload part video');
      }
    };
    videoEl.onerror = () => { URL.revokeObjectURL(objectUrl); showToast('Cannot read video file'); };
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title.trim())       newErrors.title       = 'Course title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.overview.trim())    newErrors.overview    = 'Course overview is required';
    if (!formData.courseCode.trim())  newErrors.courseCode  = 'Course code is required';
    if (!formData.courseType.trim())  newErrors.courseType  = 'Course type is required';
    if (!formData.universityId)       newErrors.universityId = 'University is required';
    if (!formData.departmentId)       newErrors.departmentId = 'Department is required';
    if (!formData.previewVideoUrl && !formData.youtubeUrl)
      newErrors.previewVideoUrl = 'Provide a preview video or YouTube URL (max 5 min)';
    if (!formData.isFree && (!formData.price || parseFloat(formData.price) <= 0))
      newErrors.price = 'Price must be greater than 0';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        title:           formData.title,
        shortDescription: formData.description,
        fullDescription:  formData.overview,
        universityId:     parseInt(formData.universityId),
        departmentId:     parseInt(formData.departmentId),
        courseCode:       formData.courseCode,
        courseType:       formData.courseType,
        isFree:           formData.isFree,
        price:            formData.isFree ? 0 : parseFloat(formData.price),
        difficultyLevel:  formData.difficulty,
        thumbnailUrl:     formData.courseImage,
        previewVideoUrl:  formData.youtubeUrl?.trim() ? formData.youtubeUrl.trim() : formData.previewVideoUrl,
        language:         formData.language,
        category:         formData.category,
        videoParts: videoParts
          .filter(p => p.title?.trim())
          .map((p, idx) => ({
            title:           p.title,
            description:     p.description,
            videoUrl:        p.videoUrl,
            youTubeUrl:      p.youtubeUrl,
            order:           idx + 1,
            isPreview:       !!p.isPreview,
            durationSeconds: Number(p.durationSeconds) || 0,
          })),
        durationHours: (() => {
          const secs = videoParts
            .filter(p => p.title?.trim())
            .reduce((s, p) => s + (Number(p.durationSeconds) || 0), 0);
          return Math.ceil(secs / 3600);
        })(),
      };

      const response = await axios.post('/api/courses', submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showToast(response.data.message || 'Course created successfully! Waiting for admin approval.', 'success');
      setTimeout(() => navigate('/teacher/manage-courses'), 1500);
    } catch (err) {
      console.error('Error creating course:', err);
      showToast(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const categories  = ['Programming', 'Design', 'Business', 'Science', 'Language', 'Arts', 'Mathematics', 'Other'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const languages   = ['English', 'Bengali', 'Hindi', 'Spanish', 'French', 'German', 'Japanese'];

  return (
    <>
      <style>{globalStyle}</style>

      {/* ── Toast Notification ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          padding: '12px 20px', borderRadius: 12,
          background: toast.type === 'success' ? '#0D2B1F' : '#1F0D14',
          border: `1px solid ${toast.type === 'success' ? tokens.success + '50' : tokens.error + '50'}`,
          color: toast.type === 'success' ? tokens.success : tokens.error,
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          animation: 'fadeUp 0.3s ease',
          maxWidth: 320,
        }}>
          {toast.type === 'success' ? '✓ ' : '⚠ '}{toast.msg}
        </div>
      )}

      {/* Starfield BG */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        {[...Array(60)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            background: `rgba(255,255,255,${Math.random() * 0.4 + 0.1})`,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 20% 0%, rgba(139,92,246,0.08) 0%, transparent 60%),
                       radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99,102,241,0.06) 0%, transparent 60%)`,
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '32px 16px 80px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* ── Top Nav ── */}
          <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: `1px solid ${tokens.border}`, borderRadius: 10,
              color: tokens.textSecondary, fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, padding: '8px 16px', cursor: 'pointer',
              transition: 'border-color 0.2s, color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = tokens.accent; e.currentTarget.style.color = tokens.textPrimary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.color = tokens.textSecondary; }}
            >
              <FiArrowLeft size={14} /> Back to Courses
            </button>

            <Tag color={tokens.gold}>✦ Teacher Dashboard</Tag>
          </div>

          {/* ── Hero Header ── */}
          <div className="anim-fade-up anim-delay-1" style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: tokens.accent, marginBottom: 10 }}>
              Course Creation
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700,
              lineHeight: 1.15, letterSpacing: '-0.5px',
              background: `linear-gradient(135deg, ${tokens.textPrimary} 40%, ${tokens.textSecondary})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Craft Your New Course
            </h1>
            <p style={{ fontSize: 14, color: tokens.textSecondary, marginTop: 10 }}>
              Complete all required fields to publish and reach students worldwide.
            </p>

            {/* Progress bar */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: tokens.textMuted }}>Completion</span>
                <span style={{ fontSize: 12, color: tokens.accent, fontWeight: 600 }}>{progress}%</span>
              </div>
              <div style={{ height: 3, background: tokens.border, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: `linear-gradient(90deg, ${tokens.accent}, #6D28D9)`,
                  borderRadius: 4, transition: 'width 0.5s ease',
                  boxShadow: `0 0 8px ${tokens.accentGlow}`,
                }} />
              </div>
            </div>
          </div>

          {/* ── Main Card ── */}
          <form onSubmit={handleSubmit}>
            <div className="anim-fade-up anim-delay-2" style={{
              background: tokens.bgCard,
              border: `1px solid ${tokens.border}`,
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px ${tokens.border}`,
            }}>
              {/* Card inner padding */}
              <div style={{ padding: 'clamp(24px, 4vw, 48px)' }}>

                {/* ════ SECTION 1: Basic Info ════ */}
                <SectionLabel step="1" title="Basic Information" subtitle="Define your course identity and core content" />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 20 }}>
                  <div>
                    <FieldLabel required>Course Title</FieldLabel>
                    <CosmicInput name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Advanced Machine Learning" error={errors.title} />
                    <ErrorMsg msg={errors.title} />
                  </div>
                  <div>
                    <FieldLabel required>Course Code</FieldLabel>
                    <CosmicInput name="courseCode" value={formData.courseCode} onChange={handleChange} placeholder="e.g. CSE401" error={errors.courseCode} />
                    <ErrorMsg msg={errors.courseCode} />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <FieldLabel required>Short Description</FieldLabel>
                  <CosmicTextarea name="description" value={formData.description} onChange={handleChange} placeholder="What will students learn? A brief, compelling overview..." rows={3} error={errors.description} />
                  <ErrorMsg msg={errors.description} />
                </div>

                <div>
                  <FieldLabel required>Full Course Overview</FieldLabel>
                  <CosmicTextarea name="overview" value={formData.overview} onChange={handleChange} placeholder="Provide a comprehensive curriculum overview, learning objectives, prerequisites..." rows={6} error={errors.overview} />
                  <ErrorMsg msg={errors.overview} />
                </div>

                <Divider />

                {/* ════ SECTION 2: Institution ════ */}
                <SectionLabel step="2" title="Institution" subtitle="Link your course to a university and department" />

                {/* University */}
                <div style={{ marginBottom: 24 }}>
                  <FieldLabel required>University</FieldLabel>

                  {selectedUniversity ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px',
                      background: tokens.accentSoft,
                      border: `1px solid ${tokens.accent}40`,
                      borderRadius: 12,
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14, color: tokens.textPrimary }}>{getSelectedUniversityName()}</p>
                        <p style={{ fontSize: 12, color: tokens.accent, marginTop: 2 }}>✓ University selected</p>
                      </div>
                      <button type="button" onClick={() => {
                        setSelectedUniversity('');
                        setFormData(prev => ({ ...prev, universityId: '', departmentId: '' }));
                        setDepartments([]);
                      }} style={{
                        background: 'none', border: `1px solid ${tokens.border}`,
                        borderRadius: 8, color: tokens.textSecondary,
                        fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                        padding: '6px 14px', cursor: 'pointer',
                      }}>Change</button>
                    </div>
                  ) : (
                    <>
                      {/* Search */}
                      <div style={{ position: 'relative', marginBottom: 16 }}>
                        <FiSearch size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: tokens.textMuted }} />
                        <CosmicInput
                          placeholder="Search by name or code…"
                          value={universityQuery}
                          onChange={e => setUniversityQuery(e.target.value)}
                          style={{ paddingLeft: 38 }}
                        />
                      </div>

                      {/* Cards grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                        {filteredUniversities.map(uni => (
                          <UniCard key={uni.id} uni={uni} onSelect={handleUniversitySelection} />
                        ))}
                      </div>
                    </>
                  )}

                  <ErrorMsg msg={errors.universityId} />
                </div>

                {/* Department */}
                <div style={{ marginBottom: 4 }}>
                  <FieldLabel required>Department</FieldLabel>

                  {!selectedUniversity ? (
                    <div style={{
                      padding: '18px', borderRadius: 12,
                      border: `1px dashed ${tokens.border}`,
                      textAlign: 'center', color: tokens.textMuted, fontSize: 13,
                    }}>
                      Select a university first to load departments
                    </div>
                  ) : (
                    <CosmicSelect name="departmentId" value={formData.departmentId} onChange={handleChange} error={errors.departmentId}>
                      <option value="">Select department…</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </CosmicSelect>
                  )}

                  <ErrorMsg msg={errors.departmentId} />
                </div>

                <Divider />

                {/* ════ SECTION 3: Course Details ════ */}
                <SectionLabel step="3" title="Course Details" subtitle="Category, difficulty, pricing and more" />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 20 }}>
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <CosmicSelect name="category" value={formData.category} onChange={handleChange}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </CosmicSelect>
                  </div>
                  <div>
                    <FieldLabel>Difficulty</FieldLabel>
                    <CosmicSelect name="difficulty" value={formData.difficulty} onChange={handleChange}>
                      {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                    </CosmicSelect>
                  </div>
                  <div>
                    <FieldLabel>Language</FieldLabel>
                    <CosmicSelect name="language" value={formData.language} onChange={handleChange}>
                      {languages.map(l => <option key={l} value={l}>{l}</option>)}
                    </CosmicSelect>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 8 }}>
                  <div>
                    <FieldLabel required>Course Type</FieldLabel>
                    <CosmicInput name="courseType" value={formData.courseType} onChange={handleChange} placeholder="e.g. Core, Elective, Lab" error={errors.courseType} />
                    <ErrorMsg msg={errors.courseType} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <ToggleSwitch
                      checked={formData.isFree}
                      onChange={() => setFormData(prev => ({ ...prev, isFree: !prev.isFree }))}
                      label={formData.isFree ? 'Free Course' : 'Paid Course'}
                    />
                    {!formData.isFree && (
                      <div style={{ marginTop: 10 }}>
                        <CosmicInput type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" style={{ paddingLeft: 30 }} />
                        <span style={{ position: 'relative', bottom: 32, left: 12, color: tokens.textMuted, fontSize: 14, pointerEvents: 'none' }}>$</span>
                        <ErrorMsg msg={errors.price} />
                      </div>
                    )}
                  </div>
                </div>

                <Divider />

                {/* ════ SECTION 4: Media ════ */}
                <SectionLabel step="4" title="Media & Assets" subtitle="Thumbnail image and preview video" />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 4 }}>
                  {/* Image upload */}
                  <div>
                    <FieldLabel>Course Thumbnail</FieldLabel>
                    <div
                      style={{
                        border: `1px dashed ${tokens.border}`,
                        borderRadius: 12, padding: 24, textAlign: 'center',
                        background: tokens.bgInput, cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = tokens.accent}
                      onMouseLeave={e => e.currentTarget.style.borderColor = tokens.border}
                      onClick={() => document.getElementById('img-upload').click()}
                    >
                      <FiImage size={28} color={tokens.textMuted} />
                      <p style={{ fontSize: 13, color: tokens.textSecondary, margin: '8px 0 4px' }}>Drop image or click to upload</p>
                      <p style={{ fontSize: 11, color: tokens.textMuted }}>PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      id="img-upload" type="file" accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                    />
                    <CosmicInput name="courseImage" value={formData.courseImage} onChange={handleChange} placeholder="…or paste image URL" style={{ marginTop: 8 }} />
                    {formData.courseImage && (
                      <p style={{ fontSize: 12, color: tokens.success, marginTop: 6 }}>✓ Image set</p>
                    )}
                  </div>

                  {/* Video */}
                  <div>
                    <FieldLabel required>Preview Video</FieldLabel>
                    <div
                      style={{
                        border: `1px dashed ${tokens.border}`,
                        borderRadius: 12, padding: 24, textAlign: 'center',
                        background: tokens.bgInput, cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = tokens.accent}
                      onMouseLeave={e => e.currentTarget.style.borderColor = tokens.border}
                      onClick={() => document.getElementById('preview-video-upload').click()}
                    >
                      <FiVideo size={28} color={tokens.textMuted} />
                      <p style={{ fontSize: 13, color: tokens.textSecondary, margin: '8px 0 4px' }}>Upload preview video</p>
                      <p style={{ fontSize: 11, color: tokens.textMuted }}>Max 5 minutes duration</p>
                    </div>
                    <input
                      id="preview-video-upload" type="file" accept="video/*"
                      style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handlePreviewVideoUpload(f); }}
                    />
                    <CosmicInput
                      name="youtubeUrl"
                      value={formData.youtubeUrl}
                      onChange={handleChange}
                      placeholder="…or paste YouTube URL"
                      style={{ marginTop: 8 }}
                    />
                    {(formData.previewVideoUrl || formData.youtubeUrl) && (
                      <p style={{ fontSize: 12, color: tokens.success, marginTop: 6 }}>✓ Preview video set</p>
                    )}
                    <ErrorMsg msg={errors.previewVideoUrl} />
                  </div>
                </div>

                <Divider />

                {/* ════ SECTION 5: Course Parts ════ */}
                <SectionLabel step="5" title="Course Parts" subtitle="Add individual video lessons to your course" />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {videoParts.map((part, idx) => (
                    <PartCard key={idx} part={part} idx={idx} updatePart={updatePart} removePart={removePart} onVideoUpload={handlePartVideoUpload} />
                  ))}
                </div>

                <button type="button" onClick={addPart} style={{
                  marginTop: 14,
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: tokens.accentSoft, border: `1px dashed ${tokens.accent}50`,
                  borderRadius: 10, color: tokens.accent,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                  padding: '10px 20px', cursor: 'pointer', width: '100%', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = tokens.accent + '25'}
                  onMouseLeave={e => e.currentTarget.style.background = tokens.accentSoft}
                >
                  <FiPlus size={16} /> Add New Part
                </button>

              </div>{/* end card inner */}

              {/* ── Footer Actions ── */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px clamp(24px, 4vw, 48px)',
                borderTop: `1px solid ${tokens.border}`,
                background: `linear-gradient(to right, ${tokens.bg}80, ${tokens.bgSection}80)`,
              }}>
                <button type="button" style={{
                  background: 'none', border: `1px solid ${tokens.border}`,
                  borderRadius: 10, color: tokens.textSecondary,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  padding: '10px 24px', cursor: 'pointer',
                }}>
                  Cancel
                </button>

                <button type="submit" disabled={loading} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: loading ? tokens.accent + '80' : `linear-gradient(135deg, ${tokens.accent}, #6D28D9)`,
                  border: 'none', borderRadius: 12,
                  color: '#fff', fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15, fontWeight: 600,
                  padding: '12px 32px', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : `0 0 30px ${tokens.accentGlow}, 0 4px 16px rgba(0,0,0,0.4)`,
                  transition: 'box-shadow 0.2s, transform 0.15s',
                  animation: loading ? 'none' : 'pulse-glow 3s ease infinite',
                }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {loading ? (
                    <span style={{
                      width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  ) : <FiSave size={16} />}
                  {loading ? 'Creating…' : 'Create Course'}
                </button>
              </div>

            </div>{/* end card */}
          </form>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #1a2030; color: #f0f0f5; }
      `}</style>
    </>
  );
};

// ─── University Card ────────────────────────────────────────────────────────────
const UniCard = ({ uni, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onSelect(uni)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
        background: hovered ? tokens.accentSoft : tokens.bgInput,
        border: `1px solid ${hovered ? tokens.accent + '50' : tokens.border}`,
        transition: 'all 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        padding: '2px 8px', borderRadius: 6,
        background: tokens.accent + '20', color: tokens.accent,
        marginBottom: 8,
      }}>{uni.code}</div>
      <p style={{ fontSize: 12, fontWeight: 600, color: tokens.textPrimary, lineHeight: 1.3, marginBottom: 4 }}>{uni.name}</p>
      <p style={{ fontSize: 11, color: tokens.textMuted }}>{uni.description}</p>
    </div>
  );
};

// ─── Toggle Switch ──────────────────────────────────────────────────────────────
const ToggleSwitch = ({ checked, onChange, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }} onClick={onChange}>
    <div style={{
      width: 40, height: 22, borderRadius: 11,
      background: checked ? tokens.accent : tokens.border,
      position: 'relative', transition: 'background 0.25s',
      boxShadow: checked ? `0 0 10px ${tokens.accentGlow}` : 'none',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: '#fff', transition: 'left 0.25s',
      }} />
    </div>
    <span style={{ fontSize: 13, fontWeight: 500, color: checked ? tokens.textPrimary : tokens.textSecondary }}>
      {label}
    </span>
  </div>
);

// ─── Part Card ──────────────────────────────────────────────────────────────────
const PartCard = ({ part, idx, updatePart, removePart, onVideoUpload }) => {
  const [expanded, setExpanded] = useState(idx === 0);
  return (
    <div style={{
      border: `1px solid ${tokens.border}`,
      borderRadius: 12,
      background: tokens.bgSection,
      overflow: 'hidden',
    }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
            background: tokens.accentSoft, border: `1px solid ${tokens.accent}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: tokens.accent,
          }}>{idx + 1}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: part.title ? tokens.textPrimary : tokens.textMuted }}>
            {part.title || `Part ${idx + 1} — untitled`}
          </span>
          {part.isPreview && <Tag color={tokens.gold}>Preview</Tag>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiChevronDown size={14} color={tokens.textMuted} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          {idx > 0 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); removePart(idx); }} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: tokens.error, padding: 4,
            }}>
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${tokens.border}` }}>
          <div style={{ marginTop: 14 }}>
            <FieldLabel required>Part Title</FieldLabel>
            <CosmicInput value={part.title} onChange={e => updatePart(idx, 'title', e.target.value)} placeholder="e.g. Introduction to Neural Networks" />
          </div>
          <div style={{ marginTop: 12 }}>
            <FieldLabel>Description</FieldLabel>
            <CosmicTextarea value={part.description} onChange={e => updatePart(idx, 'description', e.target.value)} rows={2} placeholder="What does this part cover?" />
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <FieldLabel>YouTube URL</FieldLabel>
              <CosmicInput value={part.youtubeUrl} onChange={e => updatePart(idx, 'youtubeUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div>
              <button
                type="button"
                onClick={() => document.getElementById(`part-vid-${idx}`).click()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: tokens.accentSoft, border: `1px solid ${tokens.accent}40`,
                  borderRadius: 10, color: tokens.accent,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                  padding: '10px 14px', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                <FiUpload size={13} /> Upload Video
              </button>
              <input
                id={`part-vid-${idx}`} type="file" accept="video/*"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) onVideoUpload(f, idx); }}
              />
            </div>
          </div>
          {(part.videoUrl || part.youtubeUrl) && (
            <p style={{ fontSize: 12, color: tokens.success, marginTop: 6 }}>✓ Video set for this part</p>
          )}
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch checked={!!part.isPreview} onChange={() => updatePart(idx, 'isPreview', !part.isPreview)} label="Available as free preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;