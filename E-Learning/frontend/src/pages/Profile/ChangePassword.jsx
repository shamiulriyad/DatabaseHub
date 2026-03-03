import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    --accent-glow:   rgba(124,106,247,0.15);
    --success:       #34d399;
    --danger:        #f87171;
    --warn:          #fbbf24;
    --text-primary:  #f0f4ff;
    --text-muted:    #7b82a0;
    --text-dim:      #4a5175;
  }

  body { background: var(--bg-base); color: var(--text-primary); font-family: 'DM Sans', sans-serif; }

  /* ── Page ── */
  .cp-page {
    min-height: 100vh;
    background: var(--bg-base);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    position: relative;
    overflow: hidden;
  }

  /* starfield */
  .cp-page::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      radial-gradient(1px 1px at 8%  12%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 78% 8%,  rgba(255,255,255,0.38) 0%, transparent 100%),
      radial-gradient(1px 1px at 42% 35%, rgba(255,255,255,0.28) 0%, transparent 100%),
      radial-gradient(1px 1px at 90% 52%, rgba(255,255,255,0.42) 0%, transparent 100%),
      radial-gradient(1px 1px at 18% 68%, rgba(255,255,255,0.32) 0%, transparent 100%),
      radial-gradient(1px 1px at 55% 80%, rgba(255,255,255,0.22) 0%, transparent 100%),
      radial-gradient(1px 1px at 32% 92%, rgba(255,255,255,0.38) 0%, transparent 100%),
      radial-gradient(1px 1px at 65% 20%, rgba(255,255,255,0.30) 0%, transparent 100%);
    pointer-events: none; z-index: 0;
  }

  /* orbs */
  .cp-page::after {
    content: '';
    position: fixed; top: -200px; left: 50%; transform: translateX(-50%);
    width: 700px; height: 500px;
    background: radial-gradient(ellipse, rgba(124,106,247,0.07) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .cp-orb-b {
    position: fixed; bottom: -160px; left: 50%; transform: translateX(-50%);
    width: 600px; height: 400px;
    background: radial-gradient(ellipse, rgba(167,139,250,0.05) 0%, transparent 70%);
    pointer-events: none; z-index: 0; border-radius: 50%;
  }

  /* ── Card ── */
  .cp-card {
    position: relative; z-index: 1;
    width: 100%; max-width: 480px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 28px;
    overflow: hidden;
    animation: fadeUp 0.45s cubic-bezier(.22,.61,.36,1) both;
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* top glow strip */
  .cp-card::before {
    content: '';
    display: block;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--accent) 30%, var(--accent-2) 70%, transparent);
    opacity: 0.6;
  }

  .cp-card-body {
    padding: 40px 40px 48px;
  }

  /* ── Back ── */
  .back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    padding: 8px 16px; border-radius: 50px;
    cursor: pointer; transition: all 0.25s;
    margin-bottom: 32px; letter-spacing: 0.01em;
  }
  .back-btn:hover {
    border-color: var(--accent); color: var(--accent-2);
    background: var(--accent-glow); transform: translateX(-2px);
  }

  /* ── Lock icon ── */
  .lock-icon-wrap {
    display: flex; justify-content: center;
    margin-bottom: 24px;
  }
  .lock-icon {
    width: 68px; height: 68px;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 35%, rgba(124,106,247,0.25), rgba(124,106,247,0.08));
    border: 1px solid rgba(124,106,247,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
    box-shadow: 0 0 32px rgba(124,106,247,0.15), inset 0 1px 0 rgba(255,255,255,0.06);
  }

  /* ── Header ── */
  .cp-header {
    text-align: center;
    margin-bottom: 36px;
  }
  .cp-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  .cp-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: var(--text-muted);
    line-height: 1.5;
  }

  /* divider */
  .cosmic-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent) 40%, var(--accent-2) 60%, transparent);
    opacity: 0.18;
    margin-bottom: 32px;
  }

  /* ── Form ── */
  .cp-form { display: flex; flex-direction: column; gap: 24px; }

  .form-group { display: flex; flex-direction: column; gap: 7px; }

  .form-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text-muted);
  }

  .input-wrap {
    position: relative;
  }
  .form-input {
    width: 100%;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    padding: 13px 48px 13px 16px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }
  .form-input::placeholder { color: var(--text-dim); }
  .form-input:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(124,106,247,0.1);
  }
  .form-input.has-error {
    border-color: var(--border-error);
    box-shadow: 0 0 0 3px rgba(248,113,113,0.08);
  }

  .eye-btn {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    background: transparent; border: none;
    color: var(--text-dim); font-size: 15px;
    cursor: pointer; transition: color 0.2s;
    padding: 4px; line-height: 1;
    display: flex; align-items: center; justify-content: center;
  }
  .eye-btn:hover { color: var(--accent-2); }

  .form-error {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; color: var(--danger);
    display: flex; align-items: center; gap: 5px;
  }

  /* ── Strength meter ── */
  .strength-wrap {
    margin-top: 4px;
  }
  .strength-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 6px;
  }
  .strength-label-txt {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--text-dim);
  }
  .strength-val {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .strength-val.weak   { color: var(--danger); }
  .strength-val.fair   { color: var(--warn); }
  .strength-val.good   { color: #a3e635; }
  .strength-val.strong { color: var(--success); }

  .strength-track {
    width: 100%; height: 4px;
    background: var(--bg-elevated);
    border-radius: 10px; overflow: hidden;
    border: 1px solid var(--border);
  }
  .strength-fill {
    height: 100%; border-radius: 10px;
    transition: width 0.4s cubic-bezier(.22,.61,.36,1), background 0.4s;
  }
  .strength-fill.weak   { background: var(--danger); }
  .strength-fill.fair   { background: var(--warn); }
  .strength-fill.good   { background: #a3e635; }
  .strength-fill.strong {
    background: linear-gradient(90deg, var(--success), #6ee7b7);
    box-shadow: 0 0 8px rgba(52,211,153,0.4);
  }

  /* ── Requirements ── */
  .requirements {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 16px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .req-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text-dim); margin-bottom: 2px;
  }
  .req-item {
    display: flex; align-items: center; gap: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; color: var(--text-dim);
    transition: color 0.2s;
  }
  .req-item.met { color: var(--success); }
  .req-dot {
    width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
    background: var(--text-dim); transition: background 0.2s, box-shadow 0.2s;
  }
  .req-item.met .req-dot {
    background: var(--success);
    box-shadow: 0 0 5px rgba(52,211,153,0.5);
  }

  /* ── Match indicator ── */
  .match-hint {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    display: flex; align-items: center; gap: 6px;
  }
  .match-hint.ok  { color: var(--success); }
  .match-hint.bad { color: var(--danger); }

  /* ── Submit ── */
  .submit-btn {
    width: 100%; padding: 15px;
    background: linear-gradient(135deg, var(--accent) 0%, #9b8df5 100%);
    border: none; border-radius: 14px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 600; letter-spacing: 0.04em;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.3s;
    box-shadow: 0 4px 24px rgba(124,106,247,0.3);
    position: relative; overflow: hidden;
    margin-top: 4px;
  }
  .submit-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    opacity: 0; transition: opacity 0.25s;
  }
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(124,106,247,0.45);
  }
  .submit-btn:hover::before { opacity: 1; }
  .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .btn-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Toast ── */
  .toast-wrap {
    position: fixed; bottom: 32px; right: 32px;
    z-index: 9999; display: flex; flex-direction: column; gap: 12px;
  }
  .toast {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 14px 20px;
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
    font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px;
  }
  .toast-msg {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; color: var(--text-muted); line-height: 1.5;
  }
  .toast.success { border-color: rgba(52,211,153,0.3); }
  .toast.success .toast-icon { color: var(--success); }
  .toast.error   { border-color: rgba(248,113,113,0.3); }
  .toast.error   .toast-icon { color: var(--danger); }

  @media (max-width: 520px) {
    .cp-card-body { padding: 32px 24px 40px; }
  }
`;

/* ─── Toast hook ────────────────────────────────────────────────────── */
const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const add = (title, description, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, title, description, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  };
  return { toasts, add };
};

/* ─── Password strength ─────────────────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return { score: 0, key: '', label: '' };
  let score = 0;
  if (pw.length >= 6)         score += 25;
  if (pw.length >= 8)         score += 25;
  if (/[A-Z]/.test(pw))       score += 25;
  if (/[0-9]/.test(pw))       score += 25;
  if (score <= 25) return { score, key: 'weak',   label: 'Weak' };
  if (score <= 50) return { score, key: 'fair',   label: 'Fair' };
  if (score <= 75) return { score, key: 'good',   label: 'Good' };
  return             { score, key: 'strong', label: 'Strong' };
};

/* ─── Eye icon (emoji fallback) ─────────────────────────────────────── */
const EyeIcon = ({ show }) => <span>{show ? '🙈' : '👁'}</span>;

/* ─── Component ─────────────────────────────────────────────────────── */
const ChangePassword = () => {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toasts, add: addToast } = useToasts();

  const strength = getStrength(formData.newPassword);
  const np = formData.newPassword;

  const reqs = [
    { label: 'At least 6 characters',          met: np.length >= 6 },
    { label: 'At least 8 characters',          met: np.length >= 8 },
    { label: 'One uppercase letter (A–Z)',      met: /[A-Z]/.test(np) },
    { label: 'One number (0–9)',                met: /[0-9]/.test(np) },
  ];

  const validate = () => {
    const e = {};
    if (!formData.currentPassword) e.currentPassword = 'Current password is required';
    if (!formData.newPassword)     e.newPassword = 'New password is required';
    else if (formData.newPassword.length < 6) e.newPassword = 'Password must be at least 6 characters';
    if (formData.currentPassword && formData.currentPassword === formData.newPassword)
      e.newPassword = 'New password must differ from current password';
    if (!formData.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (formData.newPassword !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5145/api/auth/change-password',
        { oldPassword: formData.currentPassword, newPassword: formData.newPassword, confirmPassword: formData.confirmPassword },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        addToast('Password Changed', 'Your password has been updated successfully.', 'success');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => navigate('/profile'), 1500);
      }
    } catch (error) {
      addToast('Update Failed', error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmMatch = formData.confirmPassword && formData.newPassword === formData.confirmPassword;
  const confirmMismatch = formData.confirmPassword && formData.newPassword !== formData.confirmPassword;

  return (
    <>
      <style>{FONTS + CSS}</style>
      <div className="cp-page">
        <div className="cp-orb-b" />
        <div className="cp-card">
          <div className="cp-card-body">

            {/* Back */}
            <button className="back-btn" onClick={() => navigate('/profile/edit')}>
              ← Back
            </button>

            {/* Lock icon */}
            <div className="lock-icon-wrap">
              <div className="lock-icon">🔐</div>
            </div>

            {/* Header */}
            <div className="cp-header">
              <div className="cp-title">Change Password</div>
              <div className="cp-subtitle">Keep your account secure with a strong password</div>
            </div>

            <div className="cosmic-divider" />

            {/* Form */}
            <form className="cp-form" onSubmit={handleSubmit}>

              {/* Current password */}
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div className="input-wrap">
                  <input
                    className={`form-input ${errors.currentPassword ? 'has-error' : ''}`}
                    name="currentPassword"
                    type={show.current ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShow(s => ({ ...s, current: !s.current }))}>
                    <EyeIcon show={show.current} />
                  </button>
                </div>
                {errors.currentPassword && <span className="form-error">⚠ {errors.currentPassword}</span>}
              </div>

              {/* New password */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrap">
                  <input
                    className={`form-input ${errors.newPassword ? 'has-error' : ''}`}
                    name="newPassword"
                    type={show.new ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShow(s => ({ ...s, new: !s.new }))}>
                    <EyeIcon show={show.new} />
                  </button>
                </div>
                {errors.newPassword && <span className="form-error">⚠ {errors.newPassword}</span>}

                {/* Strength meter */}
                {formData.newPassword && (
                  <div className="strength-wrap">
                    <div className="strength-row">
                      <span className="strength-label-txt">Strength</span>
                      <span className={`strength-val ${strength.key}`}>{strength.label}</span>
                    </div>
                    <div className="strength-track">
                      <div className={`strength-fill ${strength.key}`} style={{ width: `${strength.score}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Requirements */}
              {formData.newPassword && (
                <div className="requirements">
                  <div className="req-title">Requirements</div>
                  {reqs.map((r, i) => (
                    <div key={i} className={`req-item ${r.met ? 'met' : ''}`}>
                      <div className="req-dot" />
                      {r.label}
                    </div>
                  ))}
                </div>
              )}

              {/* Confirm password */}
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="input-wrap">
                  <input
                    className={`form-input ${errors.confirmPassword || confirmMismatch ? 'has-error' : ''}`}
                    name="confirmPassword"
                    type={show.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}>
                    <EyeIcon show={show.confirm} />
                  </button>
                </div>
                {errors.confirmPassword
                  ? <span className="form-error">⚠ {errors.confirmPassword}</span>
                  : confirmMatch
                    ? <span className="match-hint ok">✓ Passwords match</span>
                    : confirmMismatch
                      ? <span className="match-hint bad">✕ Passwords do not match</span>
                      : null
                }
              </div>

              {/* Submit */}
              <button className="submit-btn" type="submit" disabled={isLoading}>
                {isLoading
                  ? <><div className="btn-spinner" /> Updating…</>
                  : <>🔒 Change Password</>
                }
              </button>
            </form>
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

export default ChangePassword;