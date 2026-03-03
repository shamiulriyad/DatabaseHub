import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:         '#05060f',
  surface:    '#0d0f1e',
  surfaceAlt: '#111326',
  overlay:    'rgba(3,4,12,0.85)',
  border:     'rgba(139,92,246,0.18)',
  borderHov:  'rgba(139,92,246,0.45)',
  purple:     '#8b5cf6',
  purpleD:    '#7c3aed',
  purpleGlow: 'rgba(139,92,246,0.35)',
  cyan:       '#22d3ee',
  cyanGlow:   'rgba(34,211,238,0.25)',
  gold:       '#f59e0b',
  goldGlow:   'rgba(245,158,11,0.25)',
  green:      '#10b981',
  greenGlow:  'rgba(16,185,129,0.3)',
  red:        '#ef4444',
  redGlow:    'rgba(239,68,68,0.25)',
  yellow:     '#fbbf24',
  text:       '#e2e8f0',
  textSub:    '#94a3b8',
  textMuted:  '#475569',
};

// ── Global styles injection ──────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
  .tapp-overlay {
    position:fixed;inset:0;z-index:9000;
    background:${C.overlay};
    backdrop-filter:blur(10px);
    display:flex;align-items:center;justify-content:center;padding:20px;
    animation:fadeIn .2s ease;
  }
  .tapp-modal {
    background:${C.surface};
    border:1px solid ${C.border};
    border-radius:20px;
    width:100%;max-width:560px;
    max-height:88vh;overflow-y:auto;
    position:relative;
    box-shadow:0 0 80px rgba(139,92,246,0.15), 0 40px 80px rgba(0,0,0,0.6);
    animation:slideUp .3s cubic-bezier(.16,1,.3,1);
    scrollbar-width:thin;scrollbar-color:rgba(139,92,246,0.3) transparent;
  }
  .tapp-modal::-webkit-scrollbar{width:4px;}
  .tapp-modal::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.3);border-radius:10px;}
  .tapp-input {
    background:${C.surfaceAlt};
    border:1px solid ${C.border};
    border-radius:10px;
    padding:11px 14px;
    color:${C.text};
    font-family:'DM Sans',sans-serif;
    font-size:14px;
    width:100%;box-sizing:border-box;
    outline:none;
    transition:border .2s, box-shadow .2s;
  }
  .tapp-input:focus {
    border-color:${C.purple};
    box-shadow:0 0 0 3px rgba(139,92,246,0.15);
  }
  .tapp-input::placeholder{color:${C.textMuted};}
  .tapp-btn {
    border:none;border-radius:10px;
    padding:11px 22px;
    font-family:'DM Sans',sans-serif;
    font-weight:600;font-size:14px;
    cursor:pointer;
    transition:transform .15s,box-shadow .15s,opacity .15s;
    letter-spacing:.01em;
  }
  .tapp-btn:hover{transform:translateY(-2px);}
  .tapp-btn:active{transform:translateY(0);}
  .tapp-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
  .tapp-file-zone {
    border:1.5px dashed ${C.border};
    border-radius:12px;
    padding:20px;
    text-align:center;
    cursor:pointer;
    transition:border .2s,background .2s;
    position:relative;overflow:hidden;
  }
  .tapp-file-zone:hover{border-color:${C.purple};background:rgba(139,92,246,0.05);}
  .tapp-file-zone.has-file{border-color:${C.green};background:rgba(16,185,129,0.05);}
  .tapp-file-zone input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;}
  .tapp-label{
    font-family:'DM Sans',sans-serif;
    font-size:12px;font-weight:600;
    color:${C.textMuted};letter-spacing:.08em;text-transform:uppercase;
    margin-bottom:6px;
  }
  .tapp-close {
    position:absolute;top:20px;right:20px;
    width:32px;height:32px;border-radius:50%;
    background:rgba(139,92,246,0.1);
    border:1px solid ${C.border};
    color:${C.textSub};
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;font-size:14px;
    transition:all .2s;z-index:2;
  }
  .tapp-close:hover{background:rgba(239,68,68,0.2);border-color:rgba(239,68,68,0.4);color:${C.red};}
  select.tapp-input option{background:${C.surfaceAlt};color:${C.text};}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes glow{0%,100%{opacity:.6}50%{opacity:1}}
`;

// ── Tiny atoms ───────────────────────────────────────────────────────────────
const inject = () => {
  if (!document.getElementById('tapp-styles')) {
    const s = document.createElement('style');
    s.id = 'tapp-styles';
    s.textContent = STYLES;
    document.head.appendChild(s);
  }
};

const Label = ({ children, required }) => (
  <p className="tapp-label">{children}{required && <span style={{ color:C.purple, marginLeft:4 }}>*</span>}</p>
);

const FieldGroup = ({ label, required, children, style={} }) => (
  <div style={{ ...style }}>
    <Label required={required}>{label}</Label>
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    Pending:  { color:C.yellow, glow:'rgba(251,191,36,0.3)', icon:'⏳' },
    Approved: { color:C.green,  glow:C.greenGlow,            icon:'✓' },
    Rejected: { color:C.red,    glow:C.redGlow,              icon:'✕' },
  };
  const s = map[status] || { color:C.textSub, glow:'transparent', icon:'•' };
  return (
    <span style={{
      display:'inline-flex',alignItems:'center',gap:6,
      background:`${s.color}18`,
      border:`1px solid ${s.color}44`,
      borderRadius:20,padding:'4px 14px',
      fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:700,
      color:s.color,
      boxShadow:`0 0 12px ${s.glow}`,
    }}>
      <span>{s.icon}</span>{status}
    </span>
  );
};

const InfoBox = ({ children, color = C.purple, style={} }) => (
  <div style={{
    background:`${color}10`,
    border:`1px solid ${color}30`,
    borderLeft:`3px solid ${color}`,
    borderRadius:10,padding:'12px 16px',
    fontFamily:'DM Sans,sans-serif',fontSize:13,color:C.text,
    lineHeight:1.6,...style,
  }}>{children}</div>
);

const Spinner = () => (
  <span style={{
    display:'inline-block',width:14,height:14,
    border:`2px solid rgba(255,255,255,0.3)`,
    borderTop:`2px solid #fff`,
    borderRadius:'50%',
    animation:'spin .7s linear infinite',
    marginRight:8,
  }} />
);

const FileZone = ({ label, name, value, onChange }) => {
  const hasFile = !!value;
  return (
    <div>
      <Label required>{label}</Label>
      <div className={`tapp-file-zone${hasFile ? ' has-file' : ''}`}>
        <input type="file" name={name} accept="image/png,image/jpeg,image/webp" onChange={onChange} />
        <div style={{ pointerEvents:'none' }}>
          <div style={{ fontSize:24, marginBottom:6 }}>{hasFile ? '🖼️' : '📤'}</div>
          <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13,
            color: hasFile ? C.green : C.textSub, fontWeight:600, margin:0 }}>
            {hasFile ? value.name : 'Click or drag to upload'}
          </p>
          {!hasFile && <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.textMuted, margin:'4px 0 0' }}>
            PNG, JPG, WEBP accepted
          </p>}
        </div>
      </div>
    </div>
  );
};

const DateStr = (d) => d ? new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : null;
const normalizeUrl = (u) => u?.startsWith('http') ? u : `/${u}`;

// ── Main Component ───────────────────────────────────────────────────────────
const TeacherApplicationModal = ({ userId }) => {
  inject();

  const [isOpen, setIsOpen]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState(null);
  const [toast, setToast]     = useState(null);
  const [form, setForm]       = useState({
    reasonForApplying:'', qualificationDetails:'', experienceArea:'',
    idType:'', idNumber:'', idFrontImage:null, idBackImage:null,
  });

  useEffect(() => { if (isOpen) fetchStatus(); }, [isOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.duration || 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (opts) => setToast(opts);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const r = await axios.get('/api/teachers/my-application', { headers:{ Authorization:`Bearer ${token}` }});
      if (r.data.success) setStatus(r.data.application);
    } catch { setStatus(null); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({...p, [name]:value}));
  };

  const handleFile = (e) => {
    const { name, files } = e.target;
    setForm(p => ({...p, [name]: files?.[0] || null}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reasonForApplying.trim()) {
      showToast({ title:'Please fill in your reason for applying', status:'warning' }); return;
    }
    if (!form.idType || !form.idNumber.trim()) {
      showToast({ title:'ID type and number are required', status:'warning' }); return;
    }
    if (!form.idFrontImage || !form.idBackImage) {
      showToast({ title:'Both ID images are required', status:'warning' }); return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = new FormData();
      Object.entries(form).forEach(([k,v]) => { if(v) payload.append(k,v); });
      const r = await axios.post('/api/teachers/apply', payload, {
        headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'multipart/form-data' }
      });
      if (r.data.success) {
        showToast({ title:'Application submitted!', status:'success', duration:5000 });
        setForm({ reasonForApplying:'', qualificationDetails:'', experienceArea:'',
          idType:'', idNumber:'', idFrontImage:null, idBackImage:null });
        fetchStatus();
      }
    } catch (err) {
      showToast({ title: err.response?.data?.message || 'Submission failed', status:'error', duration:5000 });
    } finally { setLoading(false); }
  };

  const toastColors = { success:C.green, error:C.red, warning:C.gold, info:C.cyan };
  const canApply = !status || status.status === 'Rejected';

  return (
    <>
      {/* Trigger button */}
      <button className="tapp-btn" onClick={() => setIsOpen(true)} style={{
        background:`linear-gradient(135deg,${C.purpleD},${C.purple})`,
        color:'#fff', boxShadow:`0 0 20px ${C.purpleGlow}`,
        display:'inline-flex',alignItems:'center',gap:8,
      }}>
        📋 Apply to Become Teacher
      </button>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed',top:24,right:24,zIndex:99999,
          background:C.surface,
          border:`1px solid ${toastColors[toast.status] || C.purple}44`,
          borderLeft:`3px solid ${toastColors[toast.status] || C.purple}`,
          borderRadius:12,padding:'14px 20px',
          fontFamily:'DM Sans,sans-serif',color:C.text,fontSize:14,
          boxShadow:'0 8px 40px rgba(0,0,0,0.5)',minWidth:280,
          animation:'slideUp .25s ease',
          display:'flex',alignItems:'center',gap:10,
        }}>
          <span style={{ fontSize:18 }}>
            {toast.status==='success'?'✓':toast.status==='error'?'✕':toast.status==='warning'?'⚠':'ℹ'}
          </span>
          {toast.title}
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="tapp-overlay" onClick={e => e.target === e.currentTarget && setIsOpen(false)}>
          <div className="tapp-modal">

            {/* Purple top glow */}
            <div style={{
              position:'absolute',top:0,left:0,right:0,height:200,
              background:`radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 70%)`,
              pointerEvents:'none',borderRadius:'20px 20px 0 0',
            }} />

            {/* Close */}
            <div className="tapp-close" onClick={() => setIsOpen(false)}>✕</div>

            {/* Header */}
            <div style={{ padding:'32px 32px 0', position:'relative' }}>
              <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:700,
                letterSpacing:'.18em', textTransform:'uppercase', color:C.purple, marginBottom:4 }}>
                Educator Program
              </p>
              <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:24, fontWeight:700,
                color:C.text, margin:0, lineHeight:1.3, marginBottom:6 }}>
                Apply to Become a Teacher
              </h2>
              <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:C.textSub, margin:0 }}>
                Share your expertise and inspire learners worldwide
              </p>

              {/* Decorative line */}
              <div style={{ height:1, background:`linear-gradient(90deg,${C.purple},${C.cyan},transparent)`,
                marginTop:24, marginBottom:0 }} />
            </div>

            <div style={{ padding:'24px 32px 32px' }}>

              {/* ── Current status card ── */}
              {status && (
                <div style={{
                  background:C.surfaceAlt,
                  border:`1px solid ${C.border}`,
                  borderRadius:14,padding:'20px',marginBottom:20,
                }}>
                  <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:700,
                    letterSpacing:'.1em', textTransform:'uppercase', color:C.textMuted, marginBottom:12 }}>
                    Your Application
                  </p>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12 }}>
                    <StatusBadge status={status.status} />
                    <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.textMuted, textAlign:'right' }}>
                      <div>Submitted: <span style={{ color:C.textSub }}>{DateStr(status.applicationDate)}</span></div>
                      {status.reviewedDate && <div>Reviewed: <span style={{ color:C.textSub }}>{DateStr(status.reviewedDate)}</span></div>}
                    </div>
                  </div>

                  {status.adminRemarks && (
                    <InfoBox color={C.cyan} style={{ marginTop:14 }}>
                      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:700, color:C.cyan,
                        letterSpacing:'.06em', textTransform:'uppercase', marginBottom:6 }}>Admin Remarks</p>
                      {status.adminRemarks}
                    </InfoBox>
                  )}

                  {(status.idType || status.idNumber) && (
                    <div style={{ marginTop:14, background:`rgba(139,92,246,0.07)`,
                      border:`1px solid ${C.border}`, borderRadius:10, padding:'12px 16px' }}>
                      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:700, color:C.textMuted,
                        letterSpacing:'.06em', textTransform:'uppercase', marginBottom:8 }}>Submitted ID</p>
                      <div style={{ display:'flex',gap:24,flexWrap:'wrap' }}>
                        <div>
                          <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.textMuted, marginBottom:2 }}>TYPE</p>
                          <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.text, fontWeight:600 }}>{status.idType || '—'}</p>
                        </div>
                        <div>
                          <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.textMuted, marginBottom:2 }}>NUMBER</p>
                          <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.text, fontWeight:600 }}>{status.idNumber || '—'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(status.idFrontImagePath || status.idBackImagePath) && (
                    <div style={{ display:'flex',gap:14,marginTop:14,flexWrap:'wrap' }}>
                      {status.idFrontImagePath && (
                        <div>
                          <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.textMuted, marginBottom:6 }}>ID FRONT</p>
                          <img src={normalizeUrl(status.idFrontImagePath)} alt="ID Front"
                            style={{ maxHeight:110, borderRadius:10, border:`1px solid ${C.border}`, display:'block' }} />
                        </div>
                      )}
                      {status.idBackImagePath && (
                        <div>
                          <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.textMuted, marginBottom:6 }}>ID BACK</p>
                          <img src={normalizeUrl(status.idBackImagePath)} alt="ID Back"
                            style={{ maxHeight:110, borderRadius:10, border:`1px solid ${C.border}`, display:'block' }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Status-specific message ── */}
              {status && status.status === 'Approved' && (
                <InfoBox color={C.green}>
                  <p style={{ fontFamily:'Playfair Display,serif', fontSize:16, fontWeight:600, color:C.green, marginBottom:6 }}>
                    🎉 Congratulations!
                  </p>
                  <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:C.text, margin:0 }}>
                    You are now a verified teacher. You can create courses, manage students, and share your knowledge with the world.
                  </p>
                </InfoBox>
              )}

              {status && status.status === 'Pending' && (
                <InfoBox color={C.yellow}>
                  <p style={{ fontFamily:'Playfair Display,serif', fontSize:15, fontWeight:600, color:C.yellow, marginBottom:6 }}>
                    ⏳ Application Under Review
                  </p>
                  <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:C.text, margin:0 }}>
                    Our admin team is reviewing your application. We'll notify you within 24–48 hours.
                  </p>
                </InfoBox>
              )}

              {/* ── Application Form ── */}
              {canApply && (
                <form onSubmit={handleSubmit}>
                  {status?.status === 'Rejected' && (
                    <InfoBox color={C.red} style={{ marginBottom:20 }}>
                      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.red, fontWeight:600, marginBottom:4 }}>
                        Your previous application was rejected.
                      </p>
                      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.text, margin:0 }}>
                        You're welcome to submit a new application below.
                      </p>
                    </InfoBox>
                  )}

                  <div style={{ display:'flex',flexDirection:'column',gap:18 }}>

                    <FieldGroup label="Why do you want to become a teacher?" required>
                      <textarea className="tapp-input"
                        name="reasonForApplying"
                        value={form.reasonForApplying}
                        onChange={handleChange}
                        placeholder="Share your passion for teaching and what subjects you want to cover..."
                        rows={4}
                        style={{ resize:'vertical', lineHeight:1.6, minHeight:100 }}
                      />
                    </FieldGroup>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      <FieldGroup label="ID Type" required>
                        <select className="tapp-input" name="idType" value={form.idType} onChange={handleChange}>
                          <option value="">Select type...</option>
                          <option value="National ID">National ID</option>
                          <option value="Passport">Passport</option>
                          <option value="Driving License">Driving License</option>
                          <option value="Student ID">Student ID</option>
                        </select>
                      </FieldGroup>
                      <FieldGroup label="ID Number" required>
                        <input className="tapp-input" name="idNumber" value={form.idNumber}
                          onChange={handleChange} placeholder="Enter ID number" />
                      </FieldGroup>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      <FileZone label="ID Front Image" name="idFrontImage" value={form.idFrontImage} onChange={handleFile} />
                      <FileZone label="ID Back Image"  name="idBackImage"  value={form.idBackImage}  onChange={handleFile} />
                    </div>

                    <FieldGroup label="Your Qualifications">
                      <textarea className="tapp-input"
                        name="qualificationDetails"
                        value={form.qualificationDetails}
                        onChange={handleChange}
                        placeholder="e.g., Bachelor's in Computer Science, 5+ years industry experience..."
                        rows={3}
                        style={{ resize:'vertical', lineHeight:1.6 }}
                      />
                    </FieldGroup>

                    <FieldGroup label="Areas of Expertise">
                      <input className="tapp-input" name="experienceArea" value={form.experienceArea}
                        onChange={handleChange} placeholder="e.g., Web Dev, Machine Learning, Data Science..." />
                    </FieldGroup>

                    <InfoBox color={C.cyan}>
                      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:700,
                        color:C.cyan, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:6 }}>
                        Review Process
                      </p>
                      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.text, margin:0 }}>
                        Applications are reviewed within <strong style={{ color:C.text }}>24–48 hours</strong>. You'll receive an email with the decision.
                      </p>
                    </InfoBox>

                    {/* Actions */}
                    <div style={{ display:'flex',justifyContent:'flex-end',gap:12,marginTop:4 }}>
                      <button type="button" className="tapp-btn" onClick={() => setIsOpen(false)}
                        style={{ background:'transparent', border:`1px solid ${C.border}`,
                          color:C.textSub, padding:'10px 20px' }}>
                        Cancel
                      </button>
                      <button type="submit" className="tapp-btn" disabled={loading}
                        style={{
                          background:`linear-gradient(135deg,${C.purpleD},${C.purple})`,
                          color:'#fff',
                          boxShadow:`0 0 20px ${C.purpleGlow}`,
                          display:'flex',alignItems:'center',
                        }}>
                        {loading && <Spinner />}
                        {loading ? 'Submitting...' : ' Submit Application'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherApplicationModal;