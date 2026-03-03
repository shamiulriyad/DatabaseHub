import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:         '#05060f',
  surface:    '#0d0f1e',
  surfaceAlt: '#111326',
  border:     'rgba(139,92,246,0.18)',
  purple:     '#8b5cf6',
  purpleD:    '#7c3aed',
  purpleGlow: 'rgba(139,92,246,0.35)',
  cyan:       '#22d3ee',
  cyanGlow:   'rgba(34,211,238,0.2)',
  gold:       '#f59e0b',
  green:      '#10b981',
  greenGlow:  'rgba(16,185,129,0.3)',
  red:        '#ef4444',
  blue:       '#3b82f6',
  blueGlow:   'rgba(59,130,246,0.3)',
  text:       '#e2e8f0',
  textSub:    '#94a3b8',
  textMuted:  '#475569',
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; }

  .ue-input {
    background: ${C.surfaceAlt};
    border: 1px solid ${C.border};
    border-radius: 10px;
    padding: 11px 14px;
    color: ${C.text};
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    width: 100%;
    outline: none;
    transition: border .2s, box-shadow .2s;
  }
  .ue-input:focus {
    border-color: ${C.purple};
    box-shadow: 0 0 0 3px rgba(139,92,246,0.15);
  }
  .ue-input::placeholder { color: ${C.textMuted}; }

  .ue-file-zone {
    border: 1.5px dashed ${C.border};
    border-radius: 12px;
    padding: 18px 20px;
    text-align: center;
    cursor: pointer;
    transition: border .2s, background .2s;
    position: relative;
    overflow: hidden;
    margin-top: 8px;
  }
  .ue-file-zone:hover { border-color: ${C.purple}; background: rgba(139,92,246,0.05); }
  .ue-file-zone.has-file { border-color: ${C.green}; background: rgba(16,185,129,0.04); }
  .ue-file-zone input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

  .ue-btn {
    border: none; border-radius: 10px;
    padding: 12px 26px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600; font-size: 14px;
    cursor: pointer;
    transition: transform .15s, box-shadow .15s, opacity .15s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .ue-btn:hover { transform: translateY(-2px); }
  .ue-btn:active { transform: translateY(0); }
  .ue-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

  .ue-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    color: ${C.textMuted}; margin-bottom: 7px;
    display: block;
  }
  .ue-label span { color: ${C.purple}; margin-left: 3px; }

  .ue-card {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 28px;
    position: relative;
    overflow: hidden;
  }
  .ue-card::before {
    content: '';
    position: absolute; top: 0; right: 0;
    width: 200px; height: 200px;
    background: radial-gradient(circle at top right, rgba(139,92,246,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .ue-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, ${C.border}, transparent);
    margin: 24px 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes bannerShimmer { 0%,100%{opacity:.4} 50%{opacity:.8} }

  .ue-toast {
    position: fixed; top: 24px; right: 24px; z-index: 9999;
    background: ${C.surface};
    border-radius: 12px; padding: 14px 20px;
    font-family: 'DM Sans', sans-serif; color: ${C.text}; font-size: 14px;
    box-shadow: 0 8px 40px rgba(0,0,0,.5); min-width: 260px;
    display: flex; align-items: center; gap: 10px;
    animation: fadeUp .25s ease;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: rgba(139,92,246,.3); border-radius: 10px; }
  input[type=number]::-webkit-inner-spin-button { opacity: .4; }
`;

const injectStyles = () => {
  if (!document.getElementById('ue-styles')) {
    const s = document.createElement('style');
    s.id = 'ue-styles';
    s.textContent = STYLES;
    document.head.appendChild(s);
  }
};

// ── Tiny atoms ────────────────────────────────────────────────────────────────
const Spinner = ({ size = 14 }) => (
  <span style={{
    display: 'inline-block', width: size, height: size,
    border: '2px solid rgba(255,255,255,.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin .7s linear infinite',
    flexShrink: 0,
  }} />
);

const GlowDot = ({ color = C.purple }) => (
  <span style={{
    display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
    background: color, boxShadow: `0 0 8px 2px ${color}99`,
    flexShrink: 0,
  }} />
);

const SectionHeading = ({ icon, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
    <GlowDot color={C.purple} />
    <h3 style={{
      fontFamily: 'Playfair Display, serif',
      fontSize: 17, fontWeight: 700, color: C.text, margin: 0,
    }}>{icon && <span style={{ marginRight: 8 }}>{icon}</span>}{children}</h3>
  </div>
);

const Field = ({ label, required, children }) => (
  <div>
    <label className="ue-label">{label}{required && <span>*</span>}</label>
    {children}
  </div>
);

const FileZone = ({ label, hasFile, fileName, onChange, accept = 'image/*' }) => (
  <div className={`ue-file-zone${hasFile ? ' has-file' : ''}`}>
    <input type="file" accept={accept} onChange={onChange} />
    <div style={{ pointerEvents: 'none' }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{hasFile ? '🖼️' : '📁'}</div>
      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600,
        color: hasFile ? C.green : C.textSub, margin: 0 }}>
        {hasFile ? fileName : `Upload ${label}`}
      </p>
      {!hasFile && <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11,
        color: C.textMuted, marginTop: 3 }}>PNG, JPG, WEBP</p>}
    </div>
  </div>
);

// ── Toast hook ────────────────────────────────────────────────────────────────
const useToast = () => {
  const [t, setT] = useState(null);
  const toast = ({ title, status = 'info', duration = 4000 }) => {
    setT({ title, status });
    setTimeout(() => setT(null), duration);
  };
  const colors = { success: C.green, error: C.red, warning: C.gold, info: C.cyan };
  const icons  = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const Toast = () => t ? (
    <div className="ue-toast" style={{
      borderLeft: `3px solid ${colors[t.status]}`,
      border: `1px solid ${colors[t.status]}33`,
    }}>
      <span style={{ color: colors[t.status], fontWeight: 700 }}>{icons[t.status]}</span>
      {t.title}
    </div>
  ) : null;
  return { toast, Toast };
};

// ── Main Component ────────────────────────────────────────────────────────────
const UniversityEdit = () => {
  injectStyles();
  const { universityId } = useParams();
  const navigate = useNavigate();
  const { toast, Toast } = useToast();

  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoFile, setLogoFile]     = useState(null);

  const [form, setForm] = useState({
    name: '', description: '', website: '',
    logoUrl: '', bannerUrl: '', location: '',
  });
  const [bannerPreview, setBannerPreview] = useState('');
  const [logoPreview, setLogoPreview]     = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/universities/${universityId}`);
        const d = res.data?.data;
        if (!mounted) return;
        setForm({
          name: d.name || '', description: d.description || '',
          website: d.website || '', logoUrl: d.logoUrl || '',
          bannerUrl: d.bannerUrl || '', location: d.location || '',
        });
        setBannerPreview(d.bannerUrl || '');
        setLogoPreview(d.logoUrl || '');
      } catch {
        toast({ title: 'Error loading university', status: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [universityId]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (field === 'banner') {
        setBannerPreview(reader.result);
        setBannerFile(file);
        setForm(p => ({ ...p, bannerUrl: reader.result }));
      } else {
        setLogoPreview(reader.result);
        setLogoFile(file);
        setForm(p => ({ ...p, logoUrl: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/universities/${universityId}`, {
        name: form.name, description: form.description,
        website: form.website, logoUrl: form.logoUrl,
        bannerUrl: form.bannerUrl, location: form.location,
      });
      toast({ title: 'University updated successfully!', status: 'success' });
      setTimeout(() => navigate(`/universities/${universityId}`), 1200);
    } catch {
      toast({ title: 'Update failed. Please try again.', status: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <Spinner size={32} />
      <p style={{ fontFamily: 'DM Sans,sans-serif', color: C.textSub, fontSize: 14 }}>Loading university data…</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, position: 'relative' }}>

      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,92,246,0.1) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 100% 80%, rgba(34,211,238,0.06) 0%, transparent 60%)
        `,
      }} />

      <Toast />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '0 24px 60px' }}>

        {/* ── Banner Hero ─────────────────────────────────────────────────── */}
        <div style={{
          position: 'relative', borderRadius: '0 0 20px 20px', overflow: 'hidden',
          height: 240, marginBottom: 32,
          background: bannerPreview ? 'transparent' : `linear-gradient(135deg,${C.surfaceAlt},${C.surface})`,
          border: bannerPreview ? 'none' : `1px solid ${C.border}`,
          borderTop: 'none',
        }}>
          {bannerPreview ? (
            <img src={bannerPreview} alt="Banner preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:10 }}>
              <span style={{ fontSize: 36, opacity: 0.4 }}>🏛️</span>
              <p style={{ fontFamily:'DM Sans,sans-serif', color:C.textMuted, fontSize:13 }}>Banner preview will appear here</p>
            </div>
          )}

          {/* Dark gradient overlay */}
          <div style={{
            position:'absolute',inset:0,
            background:'linear-gradient(to top, rgba(5,6,15,0.85) 0%, rgba(5,6,15,0.2) 60%, transparent 100%)',
          }} />

          {/* Name + logo overlay */}
          <div style={{
            position:'absolute',bottom:0,left:0,right:0,
            padding:'20px 28px',
            display:'flex',alignItems:'flex-end',gap:16,
          }}>
            {logoPreview && (
              <img src={logoPreview} alt="Logo"
                style={{
                  width:64,height:64,borderRadius:12,objectFit:'cover',
                  border:`2px solid rgba(139,92,246,0.5)`,
                  boxShadow:`0 0 20px ${C.purpleGlow}`,
                  flexShrink:0,
                }} />
            )}
            <div>
              {form.name && (
                <h1 style={{
                  fontFamily:'Playfair Display,serif',
                  fontSize:26,fontWeight:700,color:'#fff',
                  textShadow:'0 2px 12px rgba(0,0,0,0.8)',
                  lineHeight:1.2,
                }}>{form.name}</h1>
              )}
              {form.location && (
                <p style={{
                  fontFamily:'DM Sans,sans-serif',fontSize:13,
                  color:'rgba(255,255,255,0.65)',marginTop:4,
                }}>📍 {form.location}</p>
              )}
            </div>
          </div>

          {/* Edit banner badge */}
          <div style={{
            position:'absolute',top:14,right:14,
            background:'rgba(0,0,0,0.55)',backdropFilter:'blur(8px)',
            border:`1px solid ${C.border}`,borderRadius:20,
            padding:'4px 12px',
            fontFamily:'DM Sans,sans-serif',fontSize:11,color:C.textSub,fontWeight:600,letterSpacing:'.06em',
          }}>✏️ EDITING</div>
        </div>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom:32 }}>
          <p style={{ fontFamily:'DM Sans,sans-serif',fontSize:11,fontWeight:700,
            letterSpacing:'.18em',textTransform:'uppercase',color:C.purple,marginBottom:4 }}>
            Admin · University
          </p>
          <h2 style={{ fontFamily:'Playfair Display,serif',fontSize:28,fontWeight:700,color:C.text,margin:0 }}>
            Edit University
          </h2>
          <p style={{ fontFamily:'DM Sans,sans-serif',fontSize:14,color:C.textSub,marginTop:6 }}>
            Update details, visuals and metadata for this institution
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display:'flex',flexDirection:'column',gap:20 }}>

            {/* ── Basic Info ─── */}
            <div className="ue-card">
              <SectionHeading icon="🏛️">Basic Information</SectionHeading>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16 }}>
                <Field label="University Name" required>
                  <input className="ue-input" name="name" value={form.name}
                    onChange={handleChange} placeholder="e.g. MIT, Harvard…" required />
                </Field>
                <Field label="Location">
                  <input className="ue-input" name="location" value={form.location}
                    onChange={handleChange} placeholder="e.g. Cambridge, MA, USA" />
                </Field>
                <Field label="Website">
                  <input className="ue-input" name="website" value={form.website}
                    onChange={handleChange} placeholder="https://university.edu" />
                </Field>
              </div>

              <div className="ue-divider" />

              <Field label="Description">
                <textarea className="ue-input" name="description" value={form.description}
                  onChange={handleChange} rows={4}
                  placeholder="Brief overview of the university — history, mission, specialties…"
                  style={{ resize:'vertical',lineHeight:1.7,minHeight:100 }} />
              </Field>
            </div>

            {/* ── Logo ─── */}
            <div className="ue-card">
              <SectionHeading icon="🎨">Logo</SectionHeading>
              <div style={{ display:'grid',gridTemplateColumns:'1fr auto',gap:20,alignItems:'start' }}>
                <div>
                  <Field label="Logo URL">
                    <input className="ue-input" name="logoUrl" value={form.logoUrl}
                      onChange={handleChange} placeholder="https://…/logo.png" />
                  </Field>
                  <FileZone
                    label="Logo Image"
                    hasFile={!!logoFile}
                    fileName={logoFile?.name}
                    onChange={e => handleFileChange(e, 'logo')}
                  />
                </div>
                {logoPreview ? (
                  <div style={{ textAlign:'center' }}>
                    <p className="ue-label" style={{ marginBottom:8 }}>Preview</p>
                    <img src={logoPreview} alt="Logo preview"
                      style={{
                        width:90,height:90,borderRadius:14,objectFit:'cover',
                        border:`1px solid ${C.border}`,
                        boxShadow:`0 0 20px ${C.purpleGlow}`,
                      }} />
                  </div>
                ) : (
                  <div style={{
                    width:90,height:90,borderRadius:14,
                    background:C.surfaceAlt,border:`1px dashed ${C.border}`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                  }}>
                    <span style={{ fontSize:28,opacity:.3 }}>🏛️</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Banner ─── */}
            <div className="ue-card">
              <SectionHeading icon="🖼️">Banner Image</SectionHeading>
              <Field label="Banner URL">
                <input className="ue-input" name="bannerUrl" value={form.bannerUrl}
                  onChange={handleChange} placeholder="https://…/banner.jpg" />
              </Field>
              <FileZone
                label="Banner Image"
                hasFile={!!bannerFile}
                fileName={bannerFile?.name}
                onChange={e => handleFileChange(e, 'banner')}
              />
              {bannerPreview && (
                <div style={{ marginTop:14 }}>
                  <p className="ue-label" style={{ marginBottom:8 }}>Banner Preview</p>
                  <img src={bannerPreview} alt="Banner preview"
                    style={{ width:'100%',height:120,objectFit:'cover',borderRadius:12,
                      border:`1px solid ${C.border}` }} />
                </div>
              )}
            </div>

            {/* ── Actions ─── */}
            <div style={{
              display:'flex',justifyContent:'flex-end',gap:12,
              padding:'20px 28px',
              background:C.surface,border:`1px solid ${C.border}`,
              borderRadius:16,
            }}>
              <button type="button" className="ue-btn"
                onClick={() => navigate(-1)}
                style={{
                  background:'transparent',border:`1px solid ${C.border}`,
                  color:C.textSub,
                }}>
                Cancel
              </button>
              <button type="submit" className="ue-btn" disabled={submitting}
                style={{
                  background:`linear-gradient(135deg,${C.purpleD},${C.purple})`,
                  color:'#fff',
                  boxShadow:`0 0 24px ${C.purpleGlow}`,
                }}>
                {submitting ? <><Spinner /> Saving…</> : ' Save Changes'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default UniversityEdit;