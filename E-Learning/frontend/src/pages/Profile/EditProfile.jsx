import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

/* ─── Cosmic Dark Premium ── Playfair Display + DM Sans ─── Dark Only ── */

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-base:       #080b14;
    --bg-surface:    #0e1322;
    --bg-elevated:   #141929;
    --bg-input:      #101626;
    --border:        rgba(255,255,255,0.07);
    --border-focus:  rgba(124,106,247,0.6);
    --border-error:  rgba(248,113,113,0.6);
    --accent:        #7c6af7;
    --accent-2:      #a78bfa;
    --accent-glow:   rgba(124,106,247,0.18);
    --gold:          #f4c66a;
    --success:       #34d399;
    --danger:        #f87171;
    --danger-dim:    rgba(248,113,113,0.12);
    --text-primary:  #f0f4ff;
    --text-muted:    #7b82a0;
    --text-dim:      #4a5175;
  }

  body { background: var(--bg-base); color: var(--text-primary); font-family: 'DM Sans', sans-serif; }

  /* ── Page ── */
  .ep-page {
    min-height: 100vh;
    background: var(--bg-base);
    padding: 40px 24px 100px;
    position: relative;
    overflow: hidden;
  }

  /* starfield */
  .ep-page::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 75% 10%, rgba(255,255,255,0.35) 0%, transparent 100%),
      radial-gradient(1px 1px at 45% 40%, rgba(255,255,255,0.28) 0%, transparent 100%),
      radial-gradient(1px 1px at 90% 55%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 20% 70%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 60% 85%, rgba(255,255,255,0.22) 0%, transparent 100%),
      radial-gradient(1px 1px at 35% 95%, rgba(255,255,255,0.38) 0%, transparent 100%);
    pointer-events: none; z-index: 0;
  }

  .ep-orb-tl {
    position: fixed; top: -180px; left: -180px;
    width: 520px; height: 520px;
    background: radial-gradient(circle, rgba(124,106,247,0.09) 0%, transparent 70%);
    pointer-events: none; z-index: 0; border-radius: 50%;
  }
  .ep-orb-br {
    position: fixed; bottom: -160px; right: -160px;
    width: 480px; height: 480px;
    background: radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%);
    pointer-events: none; z-index: 0; border-radius: 50%;
  }

  .ep-container {
    max-width: 640px;
    margin: 0 auto;
    position: relative; z-index: 1;
  }

  /* ── Back button ── */
  .back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    padding: 9px 18px; border-radius: 50px;
    cursor: pointer; transition: all 0.25s;
    margin-bottom: 32px; letter-spacing: 0.01em;
  }
  .back-btn:hover {
    border-color: var(--accent); color: var(--accent-2);
    background: var(--accent-glow); transform: translateX(-2px);
  }

  /* ── Main Card ── */
  .ep-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    overflow: hidden;
    animation: fadeUp 0.45s ease both;
    margin-bottom: 20px;
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* ── Cover area ── */
  .cover-wrap {
    position: relative;
    height: 140px;
    overflow: hidden;
    cursor: pointer;
    background: linear-gradient(135deg, #12103a 0%, #1e1458 50%, #120e38 100%);
  }
  .cover-img {
    width: 100%; height: 140px;
    object-fit: cover; display: block;
  }
  .cover-placeholder-stars {
    position: absolute; inset: 0;
    background-image:
      radial-gradient(1px 1px at 15% 25%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 80% 55%, rgba(255,255,255,0.35) 0%, transparent 100%),
      radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.25) 0%, transparent 100%),
      radial-gradient(1px 1px at 5% 50%,  rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 92% 30%, rgba(255,255,255,0.3) 0%, transparent 100%);
  }
  .cover-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0);
    display: flex; align-items: center; justify-content: center;
    transition: background 0.25s;
  }
  .cover-wrap:hover .cover-overlay { background: rgba(0,0,0,0.45); }
  .cover-cam-btn {
    display: flex; align-items: center; justify-content: center;
    width: 38px; height: 38px;
    background: rgba(124,106,247,0.85);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 10px;
    color: #fff; font-size: 15px;
    cursor: pointer; opacity: 0; transition: opacity 0.25s;
    backdrop-filter: blur(6px);
    position: absolute; top: 10px; right: 10px;
  }
  .cover-wrap:hover .cover-cam-btn { opacity: 1; }

  /* ── Avatar cluster ── */
  .avatar-cluster {
    display: flex; justify-content: center;
    margin-top: -44px;
    position: relative; z-index: 2;
    padding-bottom: 4px;
  }
  .avatar-ring {
    position: relative;
    width: 88px; height: 88px;
  }
  .avatar-img, .avatar-placeholder {
    width: 88px; height: 88px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--bg-surface);
    box-shadow: 0 0 0 1px var(--border), 0 4px 20px rgba(0,0,0,0.5);
    display: block;
  }
  .avatar-placeholder {
    background: linear-gradient(135deg, var(--accent), #9b8df5);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 700; color: #fff;
  }
  .avatar-cam-btn {
    position: absolute; bottom: 2px; right: 2px;
    width: 28px; height: 28px;
    background: var(--accent);
    border: 2px solid var(--bg-surface);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 11px;
    cursor: pointer; transition: background 0.2s, transform 0.2s;
  }
  .avatar-cam-btn:hover { background: var(--accent-2); transform: scale(1.1); }

  /* ── Card body ── */
  .ep-card-body {
    padding: 24px 32px 36px;
  }

  .ep-card-header {
    text-align: center;
    margin-bottom: 28px;
  }
  .ep-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }
  .ep-card-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: var(--text-muted);
  }

  /* divider */
  .cosmic-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent) 40%, var(--accent-2) 60%, transparent);
    opacity: 0.2;
    margin-bottom: 28px;
  }

  /* ── Form ── */
  .ep-form { display: flex; flex-direction: column; gap: 22px; }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .form-group { display: flex; flex-direction: column; gap: 7px; }

  .form-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text-muted);
  }

  .form-input {
    width: 100%;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 400;
    padding: 13px 16px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }
  .form-input::placeholder { color: var(--text-dim); }
  .form-input:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(124,106,247,0.1);
  }
  .form-input.error {
    border-color: var(--border-error);
    box-shadow: 0 0 0 3px rgba(248,113,113,0.08);
  }

  .form-error {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; color: var(--danger);
    display: flex; align-items: center; gap: 5px;
  }
  .form-hint {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; color: var(--text-dim);
  }

  /* ── Submit button ── */
  .save-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, var(--accent) 0%, #9b8df5 100%);
    border: none; border-radius: 14px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.3s;
    box-shadow: 0 4px 24px rgba(124,106,247,0.3);
    margin-top: 6px;
    position: relative; overflow: hidden;
  }
  .save-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    opacity: 0; transition: opacity 0.25s;
  }
  .save-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(124,106,247,0.45);
  }
  .save-btn:hover::before { opacity: 1; }
  .save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* ── Security card ── */
  .security-card {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px 32px;
    animation: fadeUp 0.5s ease 0.1s both;
  }
  .security-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px; font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  .security-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: var(--text-muted);
    margin-bottom: 20px; line-height: 1.6;
  }
  .change-pw-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--danger-dim);
    border: 1px solid rgba(248,113,113,0.3);
    color: var(--danger);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    padding: 11px 22px; border-radius: 10px;
    cursor: pointer; transition: all 0.25s;
    letter-spacing: 0.02em;
  }
  .change-pw-btn:hover {
    background: rgba(248,113,113,0.18);
    border-color: rgba(248,113,113,0.55);
    transform: translateY(-1px);
  }

  /* ── Toast ── */
  .toast-wrap {
    position: fixed; bottom: 32px; right: 32px;
    z-index: 9999; display: flex; flex-direction: column; gap: 12px;
  }
  .toast {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px 20px;
    min-width: 280px;
    display: flex; align-items: flex-start; gap: 12px;
    animation: slideIn 0.3s ease;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  }
  @keyframes slideIn {
    from { opacity:0; transform:translateX(20px); }
    to   { opacity:1; transform:translateX(0); }
  }
  .toast-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .toast-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600; color: var(--text-primary);
    margin-bottom: 2px;
  }
  .toast-msg {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; color: var(--text-muted); line-height: 1.5;
  }
  .toast.success { border-color: rgba(52,211,153,0.3); }
  .toast.success .toast-icon { color: var(--success); }
  .toast.error   { border-color: rgba(248,113,113,0.3); }
  .toast.error   .toast-icon { color: var(--danger); }

  /* ── Spinner ── */
  .loading-screen {
    min-height: 100vh; background: var(--bg-base);
    display: flex; align-items: center; justify-content: center;
  }
  .spinner-ring {
    width: 48px; height: 48px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* spinner inline (save button) */
  .btn-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @media (max-width: 540px) {
    .form-row { grid-template-columns: 1fr; }
    .ep-card-body { padding: 20px 20px 28px; }
    .security-card { padding: 22px 20px; }
  }
`;

/* ─── Mini Toast ─────────────────────────────────────────────────────── */
const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const add = (title, description, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, title, description, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };
  return { toasts, add };
};

const initials = (f = '', l = '') =>
  `${f[0] || ''}${l[0] || ''}`.toUpperCase() || '?';

/* ─── Component ───────────────────────────────────────────────────────── */
const EditProfile = () => {
  const { user: authUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', username: '',
    profileImageUrl: '', coverImageUrl: '',
  });
  const [preview, setPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toasts, add: addToast } = useToasts();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5145/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const p = response.data.user;
        setFormData({ firstName: p.firstName||'', lastName: p.lastName||'', email: p.email||'', username: p.username||'', profileImageUrl: p.profileImageUrl||'', coverImageUrl: p.coverImageUrl||'' });
        setPreview(p.profileImageUrl || '');
        setCoverPreview(p.coverImageUrl || '');
      }
    } catch {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setFormData({ firstName: u.firstName||'', lastName: u.lastName||'', email: u.email||'', username: u.username||'', profileImageUrl: u.profileImageUrl||'', coverImageUrl: u.coverImageUrl||'' });
      setPreview(u.profileImageUrl || '');
      setCoverPreview(u.coverImageUrl || '');
    } finally { setIsLoading(false); }
  };

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim())  e.lastName  = 'Last name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email format';
    if (!formData.username.trim()) e.username = 'Username is required';
    else if (formData.username.length < 3) e.username = 'Username must be at least 3 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('Invalid File', 'Please select an image file', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { addToast('File Too Large', 'Image size must be less than 5MB', 'error'); return; }
    setPreview(URL.createObjectURL(file));
    setProfileFile(file);
    setFormData(p => ({ ...p, profileImageUrl: '' }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('Invalid File', 'Please select an image file', 'error'); return; }
    if (file.size > 8 * 1024 * 1024) { addToast('File Too Large', 'Cover image must be less than 8MB', 'error'); return; }
    setCoverPreview(URL.createObjectURL(file));
    setCoverFile(file);
    setFormData(p => ({ ...p, coverImageUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const uploadImage = async (file) => {
        if (!file) return null;
        const fd = new FormData();
        fd.append('image', file);
        const res = await axios.post('http://localhost:5145/api/auth/upload-image', fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        return res.data?.url || null;
      };
      const profileUrl = await uploadImage(profileFile);
      const coverUrl   = await uploadImage(coverFile);
      const payload = { ...formData, profileImageUrl: profileUrl || formData.profileImageUrl, coverImageUrl: coverUrl || formData.coverImageUrl };
      const response = await axios.put('http://localhost:5145/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const updatedUser = response.data.user || { ...JSON.parse(localStorage.getItem('user')||'{}'), ...payload };
        const sanitize = (u) => {
          const c = { ...u };
          if (typeof c.profileImageUrl === 'string' && c.profileImageUrl.startsWith('data:')) delete c.profileImageUrl;
          if (typeof c.coverImageUrl === 'string' && c.coverImageUrl.startsWith('data:')) delete c.coverImageUrl;
          return c;
        };
        try { localStorage.setItem('user', JSON.stringify(sanitize(updatedUser))); } catch {}
        addToast('Profile Updated', 'Your changes have been saved successfully.', 'success');
        try { window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedUser })); } catch {}
        setTimeout(() => navigate('/profile'), 1200);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || 'Failed to update profile';
      addToast('Update Failed', typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
    } finally { setIsSaving(false); }
  };

  if (isLoading) return (
    <>
      <style>{FONTS + CSS}</style>
      <div className="loading-screen"><div className="spinner-ring" /></div>
    </>
  );

  return (
    <>
      <style>{FONTS + CSS}</style>
      <div className="ep-page">
        <div className="ep-orb-tl" />
        <div className="ep-orb-br" />

        <div className="ep-container">
          {/* Back */}
          <button className="back-btn" onClick={() => navigate('/profile')}>
            ← Back to Profile
          </button>

          {/* Main card */}
          <div className="ep-card">
            {/* Cover */}
            <div className="cover-wrap" onClick={() => document.getElementById('cover-upload').click()}>
              {coverPreview || formData.coverImageUrl ? (
                <img className="cover-img" src={coverPreview || formData.coverImageUrl} alt="Cover" />
              ) : (
                <div className="cover-placeholder-stars" />
              )}
              <div className="cover-overlay">
                <button className="cover-cam-btn" onClick={e => { e.stopPropagation(); document.getElementById('cover-upload').click(); }}>📷</button>
              </div>
              <input id="cover-upload" type="file" accept="image/*" onChange={handleCoverChange} style={{ display:'none' }} />
            </div>

            {/* Avatar */}
            <div className="avatar-cluster">
              <div className="avatar-ring">
                {preview || formData.profileImageUrl ? (
                  <img className="avatar-img" src={preview || formData.profileImageUrl} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {initials(formData.firstName, formData.lastName)}
                  </div>
                )}
                <button
                  className="avatar-cam-btn"
                  onClick={() => document.getElementById('profile-upload').click()}
                >📷</button>
                <input id="profile-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display:'none' }} />
              </div>
            </div>

            {/* Body */}
            <div className="ep-card-body">
              <div className="ep-card-header">
                <div className="ep-card-title">Edit Profile</div>
                <div className="ep-card-sub">Update your personal information</div>
              </div>

              <div className="cosmic-divider" />

              <form className="ep-form" onSubmit={handleSubmit}>
                {/* Name row */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      className={`form-input ${errors.firstName ? 'error' : ''}`}
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                    />
                    {errors.firstName && <span className="form-error">⚠ {errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      className={`form-input ${errors.lastName ? 'error' : ''}`}
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                    />
                    {errors.lastName && <span className="form-error">⚠ {errors.lastName}</span>}
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                  {errors.email && <span className="form-error">⚠ {errors.email}</span>}
                </div>

                {/* Username */}
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    className={`form-input ${errors.username ? 'error' : ''}`}
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="@username"
                  />
                  {errors.username
                    ? <span className="form-error">⚠ {errors.username}</span>
                    : <span className="form-hint">Minimum 3 characters</span>
                  }
                </div>

                {/* Submit */}
                <button className="save-btn" type="submit" disabled={isSaving}>
                  {isSaving ? <><div className="btn-spinner" /> Saving…</> : <>✦ Save Changes</>}
                </button>
              </form>
            </div>
          </div>

          {/* Security card */}
          <div className="security-card">
            <div className="security-title">Security</div>
            <div className="security-sub">Keep your account secure with a strong, unique password.</div>
            <button className="change-pw-btn" onClick={() => navigate('/profile/change-password')}>
              🔒 Change Password
            </button>
          </div>
        </div>

        {/* Toasts */}
        <div className="toast-wrap">
          {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type}`}>
              <span className="toast-icon">{t.type === 'success' ? '✓' : '✕'}</span>
              <div>
                <div className="toast-title">{t.title}</div>
                <div className="toast-msg">{t.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EditProfile;