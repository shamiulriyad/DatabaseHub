import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&family=Exo+2:wght@300;400;600&display=swap');

  .cl-wrap *, .cl-wrap *::before, .cl-wrap *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cl-wrap {
    --bg:       #080b10;
    --s1:       #0d1117;
    --s2:       #131920;
    --s3:       #1a2233;
    --b1:       #1c2637;
    --b2:       #243044;
    --acc:      #00d4ff;
    --acc-dim:  rgba(0,212,255,0.12);
    --acc-glow: rgba(0,212,255,0.35);
    --purple:   #b060ff;
    --purple-dim: rgba(176,96,255,0.12);
    --green:    #50fa7b;
    --green-dim:rgba(80,250,123,0.1);
    --orange:   #ff9f40;
    --orange-dim:rgba(255,159,64,0.1);
    --red:      #ff3d3d;
    --gold:     #f0c040;
    --text:     #b8cfe0;
    --dim:      #4e6a82;
    --fh: 'Rajdhani', sans-serif;
    --fm: 'Share Tech Mono', monospace;
    --fb: 'Exo 2', sans-serif;

    background: var(--bg);
    min-height: 100vh;
    font-family: var(--fb);
    color: var(--text);
    padding: 40px 20px 80px;
    position: relative;
    overflow-x: hidden;
  }

  .cl-wrap::before {
    content: '';
    position: fixed; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px);
    pointer-events: none; z-index: 9999;
  }
  .cl-wrap::after {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none; z-index: 0;
  }

  .cl-inner { position: relative; z-index: 1; max-width: 860px; margin: 0 auto; }

  /* ── Hero ── */
  .cl-hero {
    text-align: center; margin-bottom: 40px;
  }
  .cl-hero-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: var(--purple-dim); border: 1px solid rgba(176,96,255,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; margin: 0 auto 20px;
    box-shadow: 0 0 40px rgba(176,96,255,0.2);
  }
  .cl-hero-title {
    font-family: var(--fh); font-size: 36px; font-weight: 700;
    letter-spacing: 3px; text-transform: uppercase; color: #fff; margin-bottom: 8px;
  }
  .cl-hero-title em { color: var(--purple); font-style: normal; }
  .cl-hero-sub { font-family: var(--fm); font-size: 12px; color: var(--dim); letter-spacing: 2px; }

  /* ── Card ── */
  .cl-card {
    background: var(--s1); border: 1px solid var(--b1); border-radius: 10px;
    overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  }

  /* ── Section ── */
  .cl-section { padding: 28px 32px; }
  .cl-section + .cl-section { border-top: 1px solid var(--b1); }

  .cl-section-head {
    display: flex; align-items: center; gap: 10px; margin-bottom: 22px;
  }
  .cl-section-icon {
    width: 32px; height: 32px; border-radius: 6px;
    background: var(--purple-dim); border: 1px solid rgba(176,96,255,0.3);
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }
  .cl-section-title {
    font-family: var(--fh); font-size: 16px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase; color: #fff;
  }
  .cl-section-title em { color: var(--purple); font-style: normal; }

  /* ── Grid ── */
  .cl-grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
  .cl-grid-eq { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 600px) {
    .cl-grid-2, .cl-grid-eq { grid-template-columns: 1fr; }
  }

  /* ── Field ── */
  .cl-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 0; }
  .cl-field + .cl-field { margin-top: 16px; }
  .cl-label {
    font-family: var(--fm); font-size: 10px; color: var(--acc);
    letter-spacing: 2px; text-transform: uppercase;
    display: flex; align-items: center; gap: 6px;
  }
  .cl-label .req { color: var(--red); }
  .cl-helper { font-family: var(--fm); font-size: 11px; color: var(--dim); letter-spacing: 0.5px; }
  .cl-error { font-family: var(--fm); font-size: 11px; color: var(--red); letter-spacing: 0.5px; }

  .cl-input, .cl-select, .cl-textarea {
    width: 100%; background: var(--s2); border: 1px solid var(--b2);
    border-radius: 5px; color: var(--text); font-family: var(--fb);
    font-size: 14px; padding: 10px 13px; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s; -webkit-appearance: none;
  }
  .cl-input::placeholder, .cl-textarea::placeholder { color: var(--dim); }
  .cl-input:focus, .cl-select:focus, .cl-textarea:focus {
    border-color: var(--acc); box-shadow: 0 0 0 2px rgba(0,212,255,0.12);
  }
  .cl-input.has-error, .cl-textarea.has-error { border-color: var(--red); }
  .cl-textarea { resize: vertical; line-height: 1.6; }
  .cl-select option { background: #131920; }

  /* Number input */
  .cl-number-wrap { display: flex; align-items: center; gap: 0; }
  .cl-number-wrap input {
    flex: 1; background: var(--s2); border: 1px solid var(--b2);
    border-radius: 5px 0 0 5px; color: var(--text); font-family: var(--fb);
    font-size: 14px; padding: 10px 13px; outline: none;
    transition: border-color 0.15s; -webkit-appearance: none; border-right: none;
  }
  .cl-number-wrap input:focus { border-color: var(--acc); box-shadow: 0 0 0 2px rgba(0,212,255,0.12); }
  .cl-number-wrap input.has-error { border-color: var(--red); }
  .cl-stepper { display: flex; flex-direction: column; }
  .cl-step-btn {
    width: 32px; height: 21px; background: var(--s3); border: 1px solid var(--b2);
    color: var(--dim); cursor: pointer; font-size: 10px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .cl-step-btn:first-child { border-radius: 0 5px 0 0; border-bottom: none; }
  .cl-step-btn:last-child  { border-radius: 0 0 5px 0; }
  .cl-step-btn:hover { background: var(--b2); color: var(--acc); }

  /* ── Toggle Card ── */
  .cl-toggle-card {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-radius: 6px; border: 1px solid var(--b2);
    margin-bottom: 12px; gap: 12px; transition: border-color 0.2s;
  }
  .cl-toggle-card.is-on  { border-color: rgba(80,250,123,0.3); background: var(--green-dim); }
  .cl-toggle-card.is-off { border-color: rgba(255,159,64,0.3); background: var(--orange-dim); }
  .cl-toggle-left { display: flex; align-items: center; gap: 12px; }
  .cl-toggle-icon { font-size: 20px; flex-shrink: 0; }
  .cl-toggle-title { font-family: var(--fh); font-size: 15px; font-weight: 700; color: #fff; }
  .cl-toggle-desc { font-family: var(--fm); font-size: 11px; color: var(--dim); margin-top: 2px; letter-spacing: 0.5px; }

  /* Custom toggle switch */
  .cl-switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
  .cl-switch input { opacity: 0; width: 0; height: 0; }
  .cl-switch-slider {
    position: absolute; inset: 0; background: var(--b2); border-radius: 24px;
    cursor: pointer; transition: background 0.2s;
    border: 1px solid var(--b2);
  }
  .cl-switch-slider::before {
    content: ''; position: absolute;
    width: 18px; height: 18px; left: 2px; top: 2px;
    background: var(--dim); border-radius: 50%;
    transition: transform 0.2s, background 0.2s;
  }
  .cl-switch input:checked + .cl-switch-slider { background: rgba(176,96,255,0.3); border-color: var(--purple); }
  .cl-switch input:checked + .cl-switch-slider::before { transform: translateX(20px); background: var(--purple); }

  /* ── Summary ── */
  .cl-summary {
    background: var(--s2); border: 1px solid var(--b2); border-radius: 6px;
    padding: 16px 20px;
  }
  .cl-summary-title { font-family: var(--fm); font-size: 10px; color: var(--acc); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
  .cl-badges { display: flex; flex-wrap: wrap; gap: 8px; }
  .cl-badge {
    font-family: var(--fm); font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
    padding: 4px 10px; border-radius: 3px; border: 1px solid;
  }
  .cl-badge-purple { color: var(--purple); border-color: rgba(176,96,255,0.4); background: var(--purple-dim); }
  .cl-badge-green  { color: var(--green);  border-color: rgba(80,250,123,0.4); background: var(--green-dim);  }
  .cl-badge-orange { color: var(--orange); border-color: rgba(255,159,64,0.4); background: var(--orange-dim); }
  .cl-badge-blue   { color: var(--acc);   border-color: rgba(0,212,255,0.4); background: var(--acc-dim);   }

  /* ── Footer ── */
  .cl-footer {
    display: flex; align-items: center; justify-content: flex-end;
    padding: 20px 32px; border-top: 1px solid var(--b1); gap: 10px;
  }
  .btn-cl-cancel {
    font-family: var(--fb); font-size: 13px; padding: 10px 20px;
    background: transparent; border: 1px solid var(--b2); border-radius: 4px;
    color: var(--dim); cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; gap: 6px;
  }
  .btn-cl-cancel:hover { border-color: var(--red); color: var(--red); }

  .btn-cl-submit {
    font-family: var(--fh); font-size: 15px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    padding: 11px 28px; border-radius: 4px; cursor: pointer;
    background: var(--purple); color: #fff; border: none;
    position: relative; overflow: hidden;
    transition: background 0.2s, box-shadow 0.2s;
    display: flex; align-items: center; gap: 8px;
  }
  .btn-cl-submit:hover { background: #c87aff; box-shadow: 0 0 28px rgba(176,96,255,0.4); }
  .btn-cl-submit:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Toast ── */
  .cl-toast {
    position: fixed; bottom: 26px; right: 26px; z-index: 2000;
    background: var(--s2); border: 1px solid var(--b2); border-left: 3px solid;
    border-radius: 5px; padding: 13px 20px;
    font-family: var(--fm); font-size: 12px; letter-spacing: 0.5px;
    max-width: 340px; animation: clSlideInR 0.25s ease;
  }
  @keyframes clSlideInR { from { transform: translateX(40px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
  .cl-toast.success { border-left-color: var(--green); color: var(--green); }
  .cl-toast.error   { border-left-color: var(--red);   color: var(--red);   }
  .cl-toast.warning { border-left-color: var(--gold);  color: var(--gold);  }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onDone }) => {
  React.useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className={`cl-toast ${type}`}>{message}</div>;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ClanCreate = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => setToast({ message, type, key: Date.now() });

  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    description: '',
    motto: '',
    logoUrl: '',
    bannerUrl: '',
    clanType: 'Academic',
    isPublic: true,
    requireApproval: false,
    maxMembers: 100,
    joinCriteria: '',
  });

  const [errors, setErrors]       = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim())                                        e.name = 'Clan name is required';
    else if (formData.name.length < 3)                                e.name = 'Clan name must be at least 3 characters';
    if (!formData.tag.trim())                                         e.tag  = 'Clan tag is required';
    else if (formData.tag.length < 2 || formData.tag.length > 10)    e.tag  = 'Clan tag must be 2–10 characters';
    if (!formData.description.trim())                                 e.description = 'Description is required';
    else if (formData.description.length < 10)                        e.description = 'Description must be at least 10 characters';
    if (formData.maxMembers < 2 || formData.maxMembers > 500)         e.maxMembers  = 'Max members must be between 2 and 500';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) {
      showToast('// Fix the errors before submitting', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/clans', formData);
      showToast(`// ${formData.name} created successfully`, 'success');
      setTimeout(() => navigate(`/clans/${data?.clan?.id}`), 1200);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Something went wrong';
      showToast(`// ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="cl-wrap">
        <div className="cl-inner">

          {/* Hero */}
          <div className="cl-hero">
            <div className="cl-hero-icon">🛡️</div>
            <div className="cl-hero-title">Create Your <em>Clan</em></div>
            <div className="cl-hero-sub">&gt; BUILD A COMMUNITY — COMPETE TOGETHER</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="cl-card">

              {/* ── Basic Info ── */}
              <div className="cl-section">
                <div className="cl-section-head">
                  <div className="cl-section-icon">📋</div>
                  <div className="cl-section-title">Basic <em>Info</em></div>
                </div>

                <div className="cl-grid-2">
                  <div className="cl-field">
                    <label className="cl-label">Clan Name <span className="req">*</span></label>
                    <input
                      className={`cl-input${errors.name ? ' has-error' : ''}`}
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g., Elite Coders"
                      maxLength={100}
                    />
                    {errors.name
                      ? <span className="cl-error">⚠ {errors.name}</span>
                      : <span className="cl-helper">Choose a unique and memorable name</span>}
                  </div>
                  <div className="cl-field">
                    <label className="cl-label">Tag <span className="req">*</span></label>
                    <input
                      className={`cl-input${errors.tag ? ' has-error' : ''}`}
                      value={formData.tag}
                      onChange={(e) => handleChange('tag', e.target.value.toUpperCase())}
                      placeholder="e.g., ELITE"
                      maxLength={10}
                    />
                    {errors.tag
                      ? <span className="cl-error">⚠ {errors.tag}</span>
                      : <span className="cl-helper">2–10 characters</span>}
                  </div>
                </div>

                <div className="cl-field" style={{ marginTop: 16 }}>
                  <label className="cl-label">Description <span className="req">*</span></label>
                  <textarea
                    className={`cl-textarea${errors.description ? ' has-error' : ''}`}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe your clan's purpose and goals..."
                    rows={4}
                  />
                  {errors.description && <span className="cl-error">⚠ {errors.description}</span>}
                </div>

                <div className="cl-field" style={{ marginTop: 16 }}>
                  <label className="cl-label">Motto <span style={{ color: 'var(--dim)', fontSize: 9 }}>OPTIONAL</span></label>
                  <input
                    className="cl-input"
                    value={formData.motto}
                    onChange={(e) => handleChange('motto', e.target.value)}
                    placeholder="e.g., Learn Together, Win Together"
                    maxLength={100}
                  />
                  <span className="cl-helper">A short inspirational phrase</span>
                </div>
              </div>

              {/* ── Appearance ── */}
              <div className="cl-section">
                <div className="cl-section-head">
                  <div className="cl-section-icon">🎨</div>
                  <div className="cl-section-title">Appear<em>ance</em></div>
                </div>

                <div className="cl-grid-eq">
                  <div className="cl-field">
                    <label className="cl-label">Logo URL <span style={{ color: 'var(--dim)', fontSize: 9 }}>OPTIONAL</span></label>
                    <input
                      className="cl-input"
                      value={formData.logoUrl}
                      onChange={(e) => handleChange('logoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                      type="url"
                    />
                  </div>
                  <div className="cl-field">
                    <label className="cl-label">Banner URL <span style={{ color: 'var(--dim)', fontSize: 9 }}>OPTIONAL</span></label>
                    <input
                      className="cl-input"
                      value={formData.bannerUrl}
                      onChange={(e) => handleChange('bannerUrl', e.target.value)}
                      placeholder="https://example.com/banner.png"
                      type="url"
                    />
                  </div>
                </div>
              </div>

              {/* ── Settings ── */}
              <div className="cl-section">
                <div className="cl-section-head">
                  <div className="cl-section-icon">⚙️</div>
                  <div className="cl-section-title">Clan <em>Settings</em></div>
                </div>

                <div className="cl-grid-eq" style={{ marginBottom: 20 }}>
                  <div className="cl-field">
                    <label className="cl-label">Clan Type</label>
                    <select
                      className="cl-select"
                      value={formData.clanType}
                      onChange={(e) => handleChange('clanType', e.target.value)}
                    >
                      <option value="Academic">🎓 Academic</option>
                      <option value="Competitive">⚔️ Competitive</option>
                      <option value="Social">💬 Social</option>
                      <option value="StudyGroup">📚 Study Group</option>
                    </select>
                  </div>
                  <div className="cl-field">
                    <label className="cl-label">Max Members</label>
                    <div className="cl-number-wrap">
                      <input
                        type="number"
                        className={errors.maxMembers ? 'has-error' : ''}
                        value={formData.maxMembers}
                        onChange={(e) => handleChange('maxMembers', parseInt(e.target.value) || 2)}
                        min={2} max={500}
                      />
                      <div className="cl-stepper">
                        <button type="button" className="cl-step-btn" onClick={() => handleChange('maxMembers', Math.min(500, formData.maxMembers + 1))}>▲</button>
                        <button type="button" className="cl-step-btn" onClick={() => handleChange('maxMembers', Math.max(2, formData.maxMembers - 1))}>▼</button>
                      </div>
                    </div>
                    {errors.maxMembers && <span className="cl-error">⚠ {errors.maxMembers}</span>}
                  </div>
                </div>

                {/* Visibility toggle */}
                <div className={`cl-toggle-card ${formData.isPublic ? 'is-on' : 'is-off'}`}>
                  <div className="cl-toggle-left">
                    <div className="cl-toggle-icon">{formData.isPublic ? '🌐' : '🔒'}</div>
                    <div>
                      <div className="cl-toggle-title">{formData.isPublic ? 'Public Clan' : 'Private Clan'}</div>
                      <div className="cl-toggle-desc">{formData.isPublic ? 'Anyone can find and join' : 'Invitation only'}</div>
                    </div>
                  </div>
                  <label className="cl-switch">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => handleChange('isPublic', e.target.checked)}
                    />
                    <span className="cl-switch-slider" />
                  </label>
                </div>

                {/* Approval toggle */}
                <div className={`cl-toggle-card ${formData.requireApproval ? 'is-off' : 'is-on'}`}>
                  <div className="cl-toggle-left">
                    <div className="cl-toggle-icon">👥</div>
                    <div>
                      <div className="cl-toggle-title">{formData.requireApproval ? 'Requires Approval' : 'Auto Join'}</div>
                      <div className="cl-toggle-desc">{formData.requireApproval ? 'Leader approves join requests' : 'Members join instantly'}</div>
                    </div>
                  </div>
                  <label className="cl-switch">
                    <input
                      type="checkbox"
                      checked={formData.requireApproval}
                      onChange={(e) => handleChange('requireApproval', e.target.checked)}
                    />
                    <span className="cl-switch-slider" />
                  </label>
                </div>

                {formData.requireApproval && (
                  <div className="cl-field" style={{ marginTop: 16 }}>
                    <label className="cl-label">Join Criteria <span style={{ color: 'var(--dim)', fontSize: 9 }}>OPTIONAL</span></label>
                    <textarea
                      className="cl-textarea"
                      value={formData.joinCriteria}
                      onChange={(e) => handleChange('joinCriteria', e.target.value)}
                      placeholder="Describe the requirements for joining your clan..."
                      rows={3}
                    />
                    <span className="cl-helper">Let members know what you're looking for</span>
                  </div>
                )}
              </div>

              {/* ── Summary ── */}
              <div className="cl-section">
                <div className="cl-summary">
                  <div className="cl-summary-title">Summary</div>
                  <div className="cl-badges">
                    <span className="cl-badge cl-badge-purple">{formData.clanType}</span>
                    <span className={`cl-badge ${formData.isPublic ? 'cl-badge-green' : 'cl-badge-orange'}`}>
                      {formData.isPublic ? '🌐 Public' : '🔒 Private'}
                    </span>
                    <span className="cl-badge cl-badge-blue">👥 Max {formData.maxMembers}</span>
                    {formData.requireApproval && (
                      <span className="cl-badge cl-badge-orange">⏳ Requires Approval</span>
                    )}
                    {formData.name && (
                      <span className="cl-badge cl-badge-purple">🛡️ {formData.name}{formData.tag ? ` [${formData.tag}]` : ''}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="cl-footer">
                <button
                  type="button"
                  className="btn-cl-cancel"
                  onClick={() => navigate('/clans')}
                  disabled={isSubmitting}
                >
                  ✕ Cancel
                </button>
                <button
                  type="submit"
                  className="btn-cl-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '⏳ Creating...' : '🛡️ Create Clan'}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>

      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </>
  );
};

export default ClanCreate;