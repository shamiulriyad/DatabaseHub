import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&family=Exo+2:wght@300;400;600&display=swap');

  .ce-wrap *, .ce-wrap *::before, .ce-wrap *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ce-wrap {
    --bg:         #080b10;
    --s1:         #0d1117;
    --s2:         #131920;
    --s3:         #1a2233;
    --b1:         #1c2637;
    --b2:         #243044;
    --acc:        #00d4ff;
    --acc-dim:    rgba(0,212,255,0.12);
    --acc-glow:   rgba(0,212,255,0.35);
    --purple:     #b060ff;
    --purple-dim: rgba(176,96,255,0.12);
    --green:      #50fa7b;
    --green-dim:  rgba(80,250,123,0.1);
    --orange:     #ff9f40;
    --orange-dim: rgba(255,159,64,0.1);
    --red:        #ff3d3d;
    --gold:       #f0c040;
    --text:       #b8cfe0;
    --dim:        #4e6a82;
    --fh: 'Rajdhani', sans-serif;
    --fm: 'Share Tech Mono', monospace;
    --fb: 'Exo 2', sans-serif;

    background: var(--bg);
    min-height: 100vh;
    font-family: var(--fb);
    color: var(--text);
    padding: 32px 20px 80px;
    position: relative;
    overflow-x: hidden;
  }

  .ce-wrap::before {
    content: '';
    position: fixed; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px);
    pointer-events: none; z-index: 9999;
  }
  .ce-wrap::after {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none; z-index: 0;
  }

  .ce-inner { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; }

  /* ── Back button ── */
  .btn-back {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--fm); font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;
    padding: 8px 14px; border-radius: 4px; cursor: pointer; margin-bottom: 24px;
    background: transparent; border: 1px solid var(--b2); color: var(--dim);
    transition: all 0.15s;
  }
  .btn-back:hover { border-color: var(--acc); color: var(--acc); }

  /* ── Card ── */
  .ce-card {
    background: var(--s1); border: 1px solid var(--b1); border-radius: 10px;
    overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  }

  /* ── Card Header ── */
  .ce-card-head {
    padding: 24px 32px 20px;
    border-bottom: 1px solid var(--b1); position: relative;
  }
  .ce-card-head::after {
    content: ''; position: absolute; bottom: -1px; left: 32px;
    width: 80px; height: 1px;
    background: var(--purple); box-shadow: 0 0 12px rgba(176,96,255,0.4);
  }
  .ce-head-title {
    font-family: var(--fh); font-size: 24px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase; color: #fff;
  }
  .ce-head-title em { color: var(--purple); font-style: normal; }
  .ce-head-sub { font-family: var(--fm); font-size: 11px; color: var(--dim); letter-spacing: 1px; margin-top: 4px; }

  /* ── Section ── */
  .ce-section { padding: 24px 32px; }
  .ce-section + .ce-section { border-top: 1px solid var(--b1); }
  .ce-section-label {
    font-family: var(--fm); font-size: 10px; color: var(--acc);
    letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .ce-section-label::after {
    content: ''; flex: 1; height: 1px; background: var(--b1);
  }

  /* ── Media Section ── */
  .ce-banner-wrap {
    height: 160px; border-radius: 6px; overflow: hidden;
    background: var(--s3); border: 1px solid var(--b2);
    position: relative; margin-bottom: 12px; cursor: pointer;
    transition: border-color 0.2s;
  }
  .ce-banner-wrap:hover { border-color: var(--purple); }
  .ce-banner-wrap:hover .ce-media-overlay { opacity: 1; }
  .ce-banner-img { width: 100%; height: 100%; object-fit: cover; }
  .ce-banner-placeholder {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #1a0a2e 0%, #0a1628 100%);
    display: flex; align-items: center; justify-content: center;
    border: 2px dashed var(--b2);
  }
  .ce-media-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s;
    font-family: var(--fm); font-size: 12px; color: var(--purple); letter-spacing: 1px;
    gap: 8px;
  }

  .ce-logo-row { display: flex; align-items: center; gap: 16px; }
  .ce-logo-wrap {
    width: 72px; height: 72px; border-radius: 50%; overflow: hidden;
    background: var(--s3); border: 2px solid var(--b2);
    position: relative; cursor: pointer; flex-shrink: 0;
    transition: border-color 0.2s;
  }
  .ce-logo-wrap:hover { border-color: var(--purple); }
  .ce-logo-wrap:hover .ce-media-overlay { opacity: 1; }
  .ce-logo-img { width: 100%; height: 100%; object-fit: cover; }
  .ce-logo-initials {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--fh); font-size: 24px; font-weight: 700; color: var(--purple);
  }
  .ce-logo-hint { font-family: var(--fm); font-size: 11px; color: var(--dim); letter-spacing: 0.5px; line-height: 1.6; }

  /* ── Field ── */
  .ce-field { display: flex; flex-direction: column; gap: 6px; }
  .ce-field + .ce-field { margin-top: 16px; }
  .ce-label {
    font-family: var(--fm); font-size: 10px; color: var(--acc);
    letter-spacing: 2px; text-transform: uppercase;
  }
  .ce-input, .ce-textarea {
    width: 100%; background: var(--s2); border: 1px solid var(--b2);
    border-radius: 5px; color: var(--text); font-family: var(--fb);
    font-size: 14px; padding: 10px 13px; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .ce-input::placeholder, .ce-textarea::placeholder { color: var(--dim); }
  .ce-input:focus, .ce-textarea:focus { border-color: var(--acc); box-shadow: 0 0 0 2px rgba(0,212,255,0.12); }
  .ce-textarea { resize: vertical; line-height: 1.6; }

  /* Number input */
  .ce-number-wrap { display: flex; }
  .ce-number-wrap input {
    flex: 1; background: var(--s2); border: 1px solid var(--b2);
    border-radius: 5px 0 0 5px; color: var(--text); font-family: var(--fb);
    font-size: 14px; padding: 10px 13px; outline: none;
    border-right: none; -webkit-appearance: none;
    transition: border-color 0.15s;
  }
  .ce-number-wrap input:focus { border-color: var(--acc); }
  .ce-stepper { display: flex; flex-direction: column; }
  .ce-step-btn {
    width: 32px; height: 21px; background: var(--s3); border: 1px solid var(--b2);
    color: var(--dim); cursor: pointer; font-size: 10px;
    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
  }
  .ce-step-btn:first-child { border-radius: 0 5px 0 0; border-bottom: none; }
  .ce-step-btn:last-child  { border-radius: 0 0 5px 0; }
  .ce-step-btn:hover { background: var(--b2); color: var(--acc); }

  /* ── Toggles ── */
  .ce-toggle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 560px) { .ce-toggle-grid { grid-template-columns: 1fr; } }

  .ce-toggle-card {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 15px; border-radius: 6px; border: 1px solid var(--b2);
    gap: 10px; transition: border-color 0.2s, background 0.2s;
  }
  .ce-toggle-card.is-on  { border-color: rgba(80,250,123,0.3); background: var(--green-dim); }
  .ce-toggle-card.is-off { border-color: rgba(255,159,64,0.3); background: var(--orange-dim); }
  .ce-toggle-left { display: flex; align-items: center; gap: 10px; }
  .ce-toggle-icon { font-size: 18px; flex-shrink: 0; }
  .ce-toggle-title { font-family: var(--fh); font-size: 14px; font-weight: 700; color: #fff; line-height: 1.2; }
  .ce-toggle-desc { font-family: var(--fm); font-size: 10px; color: var(--dim); letter-spacing: 0.5px; margin-top: 2px; }

  .ce-switch { position: relative; width: 42px; height: 23px; flex-shrink: 0; }
  .ce-switch input { opacity: 0; width: 0; height: 0; }
  .ce-switch-slider {
    position: absolute; inset: 0; background: var(--b2); border-radius: 23px;
    cursor: pointer; transition: background 0.2s; border: 1px solid var(--b2);
  }
  .ce-switch-slider::before {
    content: ''; position: absolute;
    width: 17px; height: 17px; left: 2px; top: 2px;
    background: var(--dim); border-radius: 50%; transition: transform 0.2s, background 0.2s;
  }
  .ce-switch input:checked + .ce-switch-slider { background: rgba(176,96,255,0.3); border-color: var(--purple); }
  .ce-switch input:checked + .ce-switch-slider::before { transform: translateX(19px); background: var(--purple); }

  /* ── Footer ── */
  .ce-footer {
    display: flex; align-items: center; justify-content: flex-end;
    padding: 20px 32px; border-top: 1px solid var(--b1); gap: 10px;
  }
  .btn-ce-cancel {
    font-family: var(--fb); font-size: 13px; padding: 10px 20px;
    background: transparent; border: 1px solid var(--b2); border-radius: 4px;
    color: var(--dim); cursor: pointer; transition: all 0.15s;
  }
  .btn-ce-cancel:hover { border-color: var(--red); color: var(--red); }
  .btn-ce-save {
    font-family: var(--fh); font-size: 15px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    padding: 11px 28px; background: var(--purple); color: #fff;
    border: none; border-radius: 4px; cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
    display: flex; align-items: center; gap: 8px;
  }
  .btn-ce-save:hover { background: #c87aff; box-shadow: 0 0 28px rgba(176,96,255,0.4); }
  .btn-ce-save:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Loading Screen ── */
  .ce-loading {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 16px;
    font-family: var(--fm); font-size: 13px; color: var(--dim); letter-spacing: 1px;
  }
  .ce-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 2px solid var(--b2); border-top-color: var(--purple);
    animation: ceSpin 0.8s linear infinite;
  }
  @keyframes ceSpin { to { transform: rotate(360deg); } }

  /* ── Toast ── */
  .ce-toast {
    position: fixed; bottom: 26px; right: 26px; z-index: 2000;
    background: var(--s2); border: 1px solid var(--b2); border-left: 3px solid;
    border-radius: 5px; padding: 13px 20px;
    font-family: var(--fm); font-size: 12px; letter-spacing: 0.5px;
    max-width: 340px; animation: ceSlideInR 0.25s ease;
  }
  @keyframes ceSlideInR { from { transform: translateX(40px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
  .ce-toast.success { border-left-color: var(--green); color: var(--green); }
  .ce-toast.error   { border-left-color: var(--red);   color: var(--red);   }
  .ce-toast.warning { border-left-color: var(--gold);  color: var(--gold);  }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className={`ce-toast ${type}`}>{message}</div>;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ClanEdit = () => {
  const { clanId } = useParams();
  const navigate   = useNavigate();
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'error') => setToast({ message, type, key: Date.now() });

  const [form, setForm] = useState({
    name: '', description: '', motto: '',
    isPublic: true, requireApproval: false,
    maxMembers: 100, logoUrl: '', bannerUrl: '',
  });

  const [logoFile,     setLogoFile]     = useState(null);
  const [bannerFile,   setBannerFile]   = useState(null);
  const [logoPreview,  setLogoPreview]  = useState('');
  const [bannerPreview,setBannerPreview]= useState('');
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => { fetchClan(); }, []);

  const fetchClan = async () => {
    try {
      const res = await api.get(`/clans/${clanId}`);
      if (res.data?.success) {
        const c = res.data.clan;
        setForm({
          name: c.name || '',
          description: c.description || '',
          motto: c.motto || '',
          isPublic: c.isPublic ?? true,
          requireApproval: c.requireApproval ?? false,
          maxMembers: c.maxMembers ?? 100,
          logoUrl: c.logoUrl || c.clanLogoUrl || '',
          bannerUrl: c.bannerUrl || '',
        });
        setLogoPreview(c.logoUrl || c.clanLogoUrl || '');
        setBannerPreview(c.bannerUrl || '');
      }
    } catch (e) {
      showToast('// Could not load clan data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { showToast('// Please select an image file', 'warning'); return; }
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
    setForm((p) => ({ ...p, logoUrl: '' }));
  };

  const handleBannerChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { showToast('// Please select an image file', 'warning'); return; }
    setBannerFile(f);
    setBannerPreview(URL.createObjectURL(f));
    setForm((p) => ({ ...p, bannerUrl: '' }));
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    try {
      const fd = new FormData();
      fd.append('image', file);
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5145/api/auth/upload-image', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.url || null;
    } catch (e) {
      console.error('Upload failed', e);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const logoUrl   = await uploadImage(logoFile);
      const bannerUrl = await uploadImage(bannerFile);
      const payload = {
        name:            form.name        || undefined,
        description:     form.description || undefined,
        motto:           form.motto       || undefined,
        logoUrl:         logoUrl  || form.logoUrl  || undefined,
        bannerUrl:       bannerUrl || form.bannerUrl || undefined,
        isPublic:        form.isPublic,
        requireApproval: form.requireApproval,
        maxMembers:      Number(form.maxMembers) || undefined,
      };
      const res = await api.put(`/clans/${clanId}`, payload);
      if (res.data?.success) {
        showToast('// Clan updated successfully', 'success');
        setTimeout(() => navigate(`/clans/${clanId}`), 1200);
      }
    } catch (err) {
      showToast(`// ${err.response?.data?.message || 'Failed to update clan'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="ce-wrap">
          <div className="ce-loading">
            <div className="ce-spinner" />
            <div>LOADING CLAN DATA...</div>
          </div>
        </div>
      </>
    );
  }

  const initials = form.name?.slice(0, 2).toUpperCase() || '??';

  return (
    <>
      <style>{CSS}</style>
      <div className="ce-wrap">
        <div className="ce-inner">

          {/* Back */}
          <button className="btn-back" type="button" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <form onSubmit={handleSubmit}>
            <div className="ce-card">

              {/* Header */}
              <div className="ce-card-head">
                <div className="ce-head-title">Edit <em>Clan</em></div>
                <div className="ce-head-sub">&gt; UPDATE DETAILS, LOGO AND BANNER</div>
              </div>

              {/* ── Media ── */}
              <div className="ce-section">
                <div className="ce-section-label">// Visuals</div>

                {/* Banner */}
                <div
                  className="ce-banner-wrap"
                  onClick={() => document.getElementById('ce-banner-input').click()}
                >
                  {bannerPreview || form.bannerUrl ? (
                    <img className="ce-banner-img" src={bannerPreview || form.bannerUrl} alt="Banner" />
                  ) : (
                    <div className="ce-banner-placeholder">
                      <span style={{ fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--dim)', letterSpacing: 1 }}>
                        📷 Click to upload banner
                      </span>
                    </div>
                  )}
                  <div className="ce-media-overlay">📷 Change Banner</div>
                </div>
                <input id="ce-banner-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerChange} />

                {/* Logo */}
                <div className="ce-logo-row">
                  <div
                    className="ce-logo-wrap"
                    onClick={() => document.getElementById('ce-logo-input').click()}
                  >
                    {logoPreview || form.logoUrl ? (
                      <img className="ce-logo-img" src={logoPreview || form.logoUrl} alt="Logo" />
                    ) : (
                      <div className="ce-logo-initials">{initials}</div>
                    )}
                    <div className="ce-media-overlay" style={{ fontSize: 16 }}>📷</div>
                  </div>
                  <div className="ce-logo-hint">
                    Click the avatar to change logo<br />
                    Recommended: square image, min 200×200px
                  </div>
                </div>
                <input id="ce-logo-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
              </div>

              {/* ── Basic Info ── */}
              <div className="ce-section">
                <div className="ce-section-label">// Basic Info</div>

                <div className="ce-field">
                  <label className="ce-label">// Name</label>
                  <input className="ce-input" name="name" value={form.name} onChange={handleChange} placeholder="Clan name..." />
                </div>

                <div className="ce-field">
                  <label className="ce-label">// Motto</label>
                  <input className="ce-input" name="motto" value={form.motto} onChange={handleChange} placeholder="e.g., Learn Together, Win Together" />
                </div>

                <div className="ce-field">
                  <label className="ce-label">// Description</label>
                  <textarea className="ce-textarea" name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Describe your clan..." />
                </div>
              </div>

              {/* ── Settings ── */}
              <div className="ce-section">
                <div className="ce-section-label">// Settings</div>

                <div className="ce-toggle-grid" style={{ marginBottom: 16 }}>
                  {/* Public toggle */}
                  <div className={`ce-toggle-card ${form.isPublic ? 'is-on' : 'is-off'}`}>
                    <div className="ce-toggle-left">
                      <div className="ce-toggle-icon">{form.isPublic ? '🌐' : '🔒'}</div>
                      <div>
                        <div className="ce-toggle-title">{form.isPublic ? 'Public' : 'Private'}</div>
                        <div className="ce-toggle-desc">{form.isPublic ? 'Anyone can find and join' : 'Invitation only'}</div>
                      </div>
                    </div>
                    <label className="ce-switch">
                      <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm((p) => ({ ...p, isPublic: e.target.checked }))} />
                      <span className="ce-switch-slider" />
                    </label>
                  </div>

                  {/* Approval toggle */}
                  <div className={`ce-toggle-card ${form.requireApproval ? 'is-off' : 'is-on'}`}>
                    <div className="ce-toggle-left">
                      <div className="ce-toggle-icon">👥</div>
                      <div>
                        <div className="ce-toggle-title">{form.requireApproval ? 'Approval Required' : 'Auto Join'}</div>
                        <div className="ce-toggle-desc">{form.requireApproval ? 'Leader approves requests' : 'Members join instantly'}</div>
                      </div>
                    </div>
                    <label className="ce-switch">
                      <input type="checkbox" checked={form.requireApproval} onChange={(e) => setForm((p) => ({ ...p, requireApproval: e.target.checked }))} />
                      <span className="ce-switch-slider" />
                    </label>
                  </div>
                </div>

                {/* Max members */}
                <div className="ce-field">
                  <label className="ce-label">// Max Members</label>
                  <div className="ce-number-wrap">
                    <input
                      type="number" min={2} max={1000}
                      value={form.maxMembers}
                      onChange={(e) => setForm((p) => ({ ...p, maxMembers: Number(e.target.value) }))}
                    />
                    <div className="ce-stepper">
                      <button type="button" className="ce-step-btn" onClick={() => setForm((p) => ({ ...p, maxMembers: Math.min(1000, p.maxMembers + 1) }))}>▲</button>
                      <button type="button" className="ce-step-btn" onClick={() => setForm((p) => ({ ...p, maxMembers: Math.max(2, p.maxMembers - 1) }))}>▼</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="ce-footer">
                <button type="button" className="btn-ce-cancel" onClick={() => navigate(`/clans/${clanId}`)}>
                  Cancel
                </button>
                <button type="submit" className="btn-ce-save" disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Changes'}
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

export default ClanEdit;