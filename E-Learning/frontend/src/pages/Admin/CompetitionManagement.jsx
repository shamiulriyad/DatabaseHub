import React, { useEffect, useState, useRef } from 'react';
import {
  FiEdit2, FiEye, FiCheck, FiX, FiTrash2, FiFilter,
  FiSearch, FiAward, FiCheckCircle, FiXCircle, FiClock,
  FiUser, FiCalendar, FiAlertTriangle, FiChevronDown, FiRefreshCw
} from 'react-icons/fi';
import api from '../../services/api';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const t = {
  bg:           '#080B14',
  bgCard:       '#0D1120',
  bgInput:      '#111827',
  bgSection:    '#0A0E1A',
  bgModal:      '#0F1628',
  border:       'rgba(255,255,255,0.07)',
  borderFocus:  'rgba(139,92,246,0.6)',
  accent:       '#8B5CF6',
  accentGlow:   'rgba(139,92,246,0.25)',
  accentSoft:   'rgba(139,92,246,0.12)',
  gold:         '#F0C060',
  goldSoft:     'rgba(240,192,96,0.12)',
  success:      '#10B981',
  successSoft:  'rgba(16,185,129,0.12)',
  error:        '#F43F5E',
  errorSoft:    'rgba(244,63,94,0.12)',
  warning:      '#F59E0B',
  warnSoft:     'rgba(245,158,11,0.12)',
  info:         '#3B82F6',
  infoSoft:     'rgba(59,130,246,0.12)',
  pink:         '#EC4899',
  pinkSoft:     'rgba(236,72,153,0.12)',
  cyan:         '#06B6D4',
  cyanSoft:     'rgba(6,182,212,0.12)',
  textPrimary:  '#F0F0F5',
  textSecondary:'#8891AA',
  textMuted:    '#4B5268',
};

// ─── Global Styles ─────────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${t.bg}; color: ${t.textPrimary}; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${t.bg}; }
  ::-webkit-scrollbar-thumb { background: ${t.accent}40; border-radius: 4px; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn   { from{opacity:0;}to{opacity:1;} }
  @keyframes shimmer  { 0%{background-position:-200% center}100%{background-position:200% center} }
  @keyframes spin     { to{transform:rotate(360deg);} }
  @keyframes twinkle  { 0%,100%{opacity:.1}50%{opacity:.5} }
  @keyframes pulse-dot{ 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.8);} }

  .fade-up { animation: fadeUp 0.42s ease both; }
  .d1{animation-delay:.05s;} .d2{animation-delay:.1s;} .d3{animation-delay:.15s;} .d4{animation-delay:.2s;}

  .c-row { transition: background 0.15s; }
  .c-row:hover { background: rgba(139,92,246,0.035) !important; }
  .act-btn { transition: background 0.17s, box-shadow 0.17s, border-color 0.17s, opacity 0.17s; }
  select option { background: #1a2030; color: #f0f0f5; }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }); }
  catch { return '—'; }
};
const fmtFull = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); }
  catch { return '—'; }
};

const compStatus = (c) => {
  if (c.status === 'Rejected') return { label:'Rejected', color:t.error,   bg:t.errorSoft   };
  if (c.isApproved)            return { label:'Approved', color:t.success, bg:t.successSoft };
  return                              { label:'Pending',  color:t.warning, bg:t.warnSoft    };
};

const typeColor = (type) => {
  const map = {
    Academic:  { color:t.info,    bg:t.infoSoft   },
    Quiz:      { color:t.accent,  bg:t.accentSoft  },
    Sports:    { color:t.warning, bg:t.warnSoft    },
    Cultural:  { color:t.pink,    bg:t.pinkSoft    },
    Technical: { color:t.cyan,    bg:t.cyanSoft    },
  };
  return map[type] || { color:t.textMuted, bg:'rgba(255,255,255,0.06)' };
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
const Spin = ({ size=14, color=t.accent }) => (
  <span style={{ display:'inline-block', width:size, height:size, border:`2px solid ${color}30`, borderTopColor:color, borderRadius:'50%', animation:'spin 0.8s linear infinite', flexShrink:0 }}/>
);

const Badge = ({ label, color, bg }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, fontWeight:700, letterSpacing:'0.06em', padding:'3px 9px', borderRadius:20, background:bg, border:`1px solid ${color}30`, color, whiteSpace:'nowrap' }}>{label}</span>
);

const Toast = ({ toast }) => !toast ? null : (
  <div style={{
    position:'fixed', bottom:28, right:28, zIndex:9999,
    padding:'12px 20px', borderRadius:12,
    background: toast.type==='success'?'#0D2B1F':toast.type==='info'?'#0D1A2B':'#1F0D14',
    border:`1px solid ${toast.type==='success'?t.success+'50':toast.type==='info'?t.accent+'50':t.error+'50'}`,
    color: toast.type==='success'?t.success:toast.type==='info'?t.accent:t.error,
    fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500,
    boxShadow:'0 8px 32px rgba(0,0,0,0.5)', animation:'fadeUp 0.3s ease', maxWidth:340,
  }}>
    {toast.type==='success'?'✓ ':toast.type==='info'?'ℹ ':'⚠ '}{toast.msg}
  </div>
);

const StatCard = ({ label, value, sub, icon:Icon, color, delay }) => (
  <div className={`fade-up ${delay}`} style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:16, padding:'20px 22px' }}>
    <div style={{ width:34, height:34, borderRadius:9, background:color+'18', border:`1px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
      <Icon size={15} color={color}/>
    </div>
    <p style={{ fontSize:28, fontWeight:700, color:t.textPrimary, lineHeight:1 }}>{value}</p>
    <p style={{ fontSize:12, color:t.textMuted, marginTop:5 }}>{label}</p>
    {sub && <p style={{ fontSize:11, color:color, marginTop:3 }}>{sub}</p>}
  </div>
);

const SkeletonRow = () => (
  <tr>
    {[30,14,18,14,14,20,22].map((w,i)=>(
      <td key={i} style={{ padding:'16px 16px' }}>
        <div style={{ height:11, width:`${w}%`, minWidth:24, borderRadius:6, background:`linear-gradient(90deg,${t.bgInput} 25%,#1a2235 50%,${t.bgInput} 75%)`, backgroundSize:'200% auto', animation:`shimmer 1.5s linear infinite`, animationDelay:`${i*0.08}s` }}/>
      </td>
    ))}
  </tr>
);

// ─── CosmicInput / Textarea / Select ─────────────────────────────────────────
const CosmicInput = ({ value, onChange, placeholder, icon:Icon, style={} }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ position:'relative' }}>
      {Icon && <Icon size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:t.textMuted, pointerEvents:'none' }}/>}
      <input value={value} onChange={onChange} placeholder={placeholder}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{ width:'100%', background:t.bgInput, border:`1px solid ${f?t.borderFocus:t.border}`, borderRadius:10, color:t.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:13, padding:`9px 14px 9px ${Icon?'34px':'14px'}`, outline:'none', boxShadow:f?`0 0 0 3px ${t.accentGlow}`:'none', transition:'border-color 0.2s,box-shadow 0.2s', ...style }}
      />
    </div>
  );
};

const CosmicTextarea = ({ value, onChange, placeholder, rows=4, label }) => {
  const [f, setF] = useState(false);
  return (
    <div>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:t.textMuted, marginBottom:7 }}>{label}</label>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{ width:'100%', background:t.bgInput, border:`1px solid ${f?t.borderFocus:t.border}`, borderRadius:10, color:t.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:13, padding:'10px 14px', outline:'none', resize:'vertical', lineHeight:1.6, boxShadow:f?`0 0 0 3px ${t.accentGlow}`:'none', transition:'border-color 0.2s,box-shadow 0.2s' }}
      />
    </div>
  );
};

const CosmicSelect = ({ value, onChange, children, style={} }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ position:'relative' }}>
      <select value={value} onChange={onChange} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{ width:'100%', background:t.bgInput, border:`1px solid ${f?t.borderFocus:t.border}`, borderRadius:10, color:t.textPrimary, fontFamily:"'DM Sans',sans-serif", fontSize:13, padding:'9px 34px 9px 14px', outline:'none', appearance:'none', cursor:'pointer', boxShadow:f?`0 0 0 3px ${t.accentGlow}`:'none', transition:'border-color 0.2s,box-shadow 0.2s', ...style }}
      >{children}</select>
      <FiChevronDown size={13} style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', color:t.textMuted, pointerEvents:'none' }}/>
    </div>
  );
};

// ─── Detail Row ────────────────────────────────────────────────────────────────
const DetailRow = ({ label, children }) => (
  <div style={{ display:'flex', gap:12, padding:'12px 0', borderBottom:`1px solid ${t.border}` }}>
    <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:t.textMuted, width:110, flexShrink:0, paddingTop:1 }}>{label}</p>
    <div style={{ flex:1, fontSize:13, color:t.textSecondary, lineHeight:1.6 }}>{children}</div>
  </div>
);

// ─── Modal Shell ──────────────────────────────────────────────────────────────
const ModalShell = ({ title, subtitle, icon:Icon, iconColor=t.accent, onClose, children, footer }) => (
  <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.72)', backdropFilter:'blur(6px)', animation:'fadeIn 0.2s ease' }} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{ background:t.bgModal, border:`1px solid ${t.border}`, borderRadius:20, padding:32, maxWidth:560, width:'90%', boxShadow:'0 40px 80px rgba(0,0,0,0.65)', animation:'fadeUp 0.25s ease', maxHeight:'88vh', overflowY:'auto' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22, gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {Icon && <div style={{ width:42, height:42, borderRadius:'50%', background:iconColor+'18', border:`1px solid ${iconColor}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon size={18} color={iconColor}/></div>}
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:700, color:t.textPrimary }}>{title}</h2>
            {subtitle && <p style={{ fontSize:12, color:t.textMuted, marginTop:2 }}>{subtitle}</p>}
          </div>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:t.textMuted, cursor:'pointer', padding:4, flexShrink:0 }}><FiX size={18}/></button>
      </div>
      {children}
      {footer && <div style={{ display:'flex', gap:10, marginTop:24, paddingTop:20, borderTop:`1px solid ${t.border}` }}>{footer}</div>}
    </div>
  </div>
);

const ModalBtn = ({ label, onClick, color, soft, disabled, loading:isLoading }) => (
  <button onClick={onClick} disabled={disabled||isLoading} style={{
    flex:1, padding:'11px', borderRadius:10, cursor:(disabled||isLoading)?'not-allowed':'pointer',
    background:soft?'none':color, border:`1px solid ${soft?t.border:'transparent'}`,
    color:soft?t.textSecondary:'#fff', fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600,
    opacity:(disabled||isLoading)?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
    transition:'opacity 0.2s',
  }}>
    {isLoading && <Spin size={14} color={soft?t.textMuted:'#fff'}/>} {label}
  </button>
);

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ comp, onConfirm, onClose, loading:isLoading }) => (
  <ModalShell title="Delete Competition" subtitle={comp?.title} icon={FiAlertTriangle} iconColor={t.error} onClose={onClose}
    footer={[
      <ModalBtn key="c" label="Cancel" soft onClick={onClose} disabled={isLoading}/>,
      <ModalBtn key="d" label={isLoading?'Deleting…':'Delete Forever'} color={t.error} onClick={onConfirm} loading={isLoading}/>,
    ]}
  >
    <p style={{ fontSize:14, color:t.textSecondary, lineHeight:1.7 }}>
      Are you sure you want to permanently delete <span style={{ color:t.textPrimary, fontWeight:600 }}>"{comp?.title}"</span>? This action cannot be undone.
    </p>
  </ModalShell>
);

// ─── Main Component ─────────────────────────────────────────────────────────────
const CompetitionManagement = () => {
  const [competitions, setCompetitions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus]   = useState('all');
  const [searchText, setSearchText]       = useState('');
  const [toast, setToast]                 = useState(null);

  // Modals
  const [viewComp,   setViewComp]   = useState(null);
  const [rejectComp, setRejectComp] = useState(null);
  const [deleteComp, setDeleteComp] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const showToast = (msg, type='error') => { setToast({ msg, type }); setTimeout(()=>setToast(null), 4000); };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/competitions/admin/all-competitions', { params:{ page:1, pageSize:100 } });
      const data = response.data?.data || [];
      setCompetitions(data);
      showToast(`Loaded ${data.length} competitions`, 'success');
    } catch (err) {
      console.error('Failed to fetch competitions:', err);
      showToast('Failed to load competitions');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCompetitions(); }, []);

  // ── Filter (client-side) ──────────────────────────────────────────────────
  const filtered = competitions.filter(c => {
    const matchStatus =
      filterStatus === 'all'     ? true :
      filterStatus === 'pending'  ? (!c.isApproved && c.status !== 'Rejected') :
      filterStatus === 'approved' ? c.isApproved :
      filterStatus === 'rejected' ? c.status === 'Rejected' : true;

    const q = searchText.toLowerCase();
    const matchSearch = !searchText || [c.title, c.description, c.creatorName].some(f => (f||'').toLowerCase().includes(q));

    return matchStatus && matchSearch;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total:    competitions.length,
    pending:  competitions.filter(c => !c.isApproved && c.status !== 'Rejected').length,
    approved: competitions.filter(c => c.isApproved).length,
    rejected: competitions.filter(c => c.status === 'Rejected').length,
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await api.post(`/competitions/${id}/approve`);
      showToast('Competition approved!', 'success');
      setViewComp(null);
      fetchCompetitions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve');
    } finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectComp) return;
    setActionLoading(true);
    try {
      await api.post(`/competitions/${rejectComp.id}/reject`, { reason: rejectReason || 'No reason provided' });
      showToast('Competition rejected.', 'info');
      setRejectReason('');
      setRejectComp(null);
      setViewComp(null);
      fetchCompetitions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject');
    } finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteComp) return;
    setActionLoading(true);
    try {
      await api.delete(`/competitions/${deleteComp.id}`);
      showToast('Competition deleted.', 'info');
      setDeleteComp(null);
      fetchCompetitions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete');
    } finally { setActionLoading(false); }
  };

  return (
    <>
      <style>{G}</style>
      <Toast toast={toast}/>

      {/* Starfield */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        {[...Array(50)].map((_,i)=>(
          <div key={i} style={{ position:'absolute', width:Math.random()*2+1, height:Math.random()*2+1, background:`rgba(255,255,255,${Math.random()*0.3+0.05})`, borderRadius:'50%', top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, animation:`twinkle ${2+Math.random()*4}s ease-in-out infinite`, animationDelay:`${Math.random()*4}s` }}/>
        ))}
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 65% 45% at 10% 5%, rgba(139,92,246,0.08) 0%, transparent 55%), radial-gradient(ellipse 50% 35% at 90% 90%, rgba(240,192,96,0.04) 0%, transparent 55%)` }}/>
      </div>

      <div style={{ position:'relative', zIndex:1, minHeight:'100vh', padding:'36px 16px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          {/* ── Header ── */}
          <div className="fade-up" style={{ marginBottom:32 }}>
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:t.accent, marginBottom:6 }}>Admin Panel</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(22px,4vw,34px)', fontWeight:700, background:`linear-gradient(135deg, ${t.textPrimary} 50%, ${t.textSecondary})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:6 }}>Competition Management</h1>
            <p style={{ fontSize:14, color:t.textSecondary }}>Review, approve, and monitor all platform competitions.</p>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:14, marginBottom:26 }}>
            <StatCard label="Total"    value={stats.total}    sub="All competitions"   icon={FiAward}        color={t.accent}  delay="d1"/>
            <StatCard label="Pending"  value={stats.pending}  sub="Awaiting approval"  icon={FiClock}        color={t.warning} delay="d1"/>
            <StatCard label="Approved" value={stats.approved} sub="Active & published"  icon={FiCheckCircle}  color={t.success} delay="d2"/>
            <StatCard label="Rejected" value={stats.rejected} sub="Not approved"        icon={FiXCircle}      color={t.error}   delay="d2"/>
          </div>

          {/* ── Filter Bar ── */}
          <div className="fade-up d2" style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:16, padding:'16px 20px', marginBottom:18, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ flex:'1 1 220px', maxWidth:340 }}>
              <CosmicInput value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search by title or creator…" icon={FiSearch}/>
            </div>
            <div style={{ flex:'0 1 180px' }}>
              <CosmicSelect value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                <option value="all">All Competitions</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </CosmicSelect>
            </div>
            <button onClick={()=>{ setSearchText(''); setFilterStatus('all'); }} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:`1px solid ${t.border}`, borderRadius:10, color:t.textMuted, fontFamily:"'DM Sans',sans-serif", fontSize:12, padding:'9px 14px', cursor:'pointer', transition:'border-color 0.2s,color 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=t.accent;e.currentTarget.style.color=t.accent;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.textMuted;}}
            >
              <FiRefreshCw size={12}/> Reset
            </button>
          </div>

          {/* ── Table Card ── */}
          <div className="fade-up d3" style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:20, overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,0.45)' }}>

            {/* Card header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:`1px solid ${t.border}`, background:t.bgSection }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:t.warning, animation:stats.pending>0?'pulse-dot 1.5s ease infinite':'none' }}/>
                <span style={{ fontSize:13, fontWeight:600, color:t.textSecondary }}>{filtered.length} competitions</span>
              </div>
              <button onClick={fetchCompetitions} disabled={loading} style={{ display:'flex', alignItems:'center', gap:6, background:t.accentSoft, border:`1px solid ${t.accent}30`, borderRadius:8, color:t.accent, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, padding:'7px 14px', cursor:loading?'not-allowed':'pointer', opacity:loading?0.6:1 }}>
                {loading?<Spin size={12}/>:'↻'} Refresh
              </button>
            </div>

            {/* Table */}
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${t.border}`, background:t.bgSection }}>
                    {['Title','Type','Creator','Role','Status','Dates','Actions'].map(h=>(
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:10, fontWeight:600, letterSpacing:'0.09em', textTransform:'uppercase', color:t.textMuted, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(7)].map((_,i)=><SkeletonRow key={i}/>)
                    : filtered.length===0
                      ? (
                        <tr><td colSpan={7} style={{ padding:'64px 24px', textAlign:'center' }}>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                            <div style={{ width:58, height:58, borderRadius:'50%', background:t.accentSoft, border:`1px solid ${t.accent}30`, display:'flex', alignItems:'center', justifyContent:'center' }}><FiAward size={24} color={t.accent}/></div>
                            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:t.textPrimary }}>No Competitions Found</p>
                            <p style={{ fontSize:13, color:t.textMuted }}>Try adjusting your filters or search query.</p>
                          </div>
                        </td></tr>
                      )
                      : filtered.map(c => {
                          const sm  = compStatus(c);
                          const tc  = typeColor(c.competitionType);
                          const isPending = !c.isApproved && c.status !== 'Rejected';
                          return (
                            <tr key={c.id} className="c-row" style={{ borderBottom:`1px solid ${t.border}` }}>

                              {/* Title */}
                              <td style={{ padding:'14px 16px', maxWidth:220 }}>
                                <p style={{ fontWeight:600, fontSize:13, color:t.textPrimary, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{c.title}</p>
                                {c.description && <p style={{ fontSize:11, color:t.textMuted, marginTop:2, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{c.description}</p>}
                              </td>

                              {/* Type */}
                              <td style={{ padding:'14px 16px' }}>
                                <Badge label={c.competitionType||'—'} color={tc.color} bg={tc.bg}/>
                              </td>

                              {/* Creator */}
                              <td style={{ padding:'14px 16px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:t.textSecondary }}>
                                  <FiUser size={11} color={t.textMuted}/> {c.creatorName||'N/A'}
                                </div>
                              </td>

                              {/* Creator Role */}
                              <td style={{ padding:'14px 16px' }}>
                                <Badge label={c.creatorRole||'—'} color={t.info} bg={t.infoSoft}/>
                              </td>

                              {/* Status */}
                              <td style={{ padding:'14px 16px' }}>
                                <Badge label={sm.label} color={sm.color} bg={sm.bg}/>
                              </td>

                              {/* Dates */}
                              <td style={{ padding:'14px 16px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:t.textSecondary, whiteSpace:'nowrap' }}>
                                  <FiCalendar size={10} color={t.textMuted}/>
                                  <span>{fmtDate(c.startDate)}</span>
                                </div>
                                <div style={{ fontSize:11, color:t.textMuted, marginTop:2, paddingLeft:16 }}>→ {fmtDate(c.endDate)}</div>
                              </td>

                              {/* Actions */}
                              <td style={{ padding:'14px 16px' }}>
                                <div style={{ display:'flex', gap:5, flexWrap:'nowrap' }}>
                                  {/* View */}
                                  <button className="act-btn" onClick={()=>setViewComp(c)}
                                    style={{ display:'flex', alignItems:'center', gap:4, background:t.accentSoft, border:`1px solid ${t.accent}30`, borderRadius:8, color:t.accent, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, padding:'7px 10px', cursor:'pointer' }}
                                    onMouseEnter={e=>{e.currentTarget.style.background=t.accent+'25';e.currentTarget.style.boxShadow=`0 0 10px ${t.accentGlow}`;}}
                                    onMouseLeave={e=>{e.currentTarget.style.background=t.accentSoft;e.currentTarget.style.boxShadow='none';}}
                                  ><FiEye size={12}/></button>

                                  {/* Approve (only if pending) */}
                                  {isPending && (
                                    <button className="act-btn" onClick={()=>handleApprove(c.id)} disabled={actionLoading}
                                      style={{ display:'flex', alignItems:'center', gap:4, background:t.successSoft, border:`1px solid ${t.success}30`, borderRadius:8, color:t.success, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, padding:'7px 10px', cursor:actionLoading?'not-allowed':'pointer', opacity:actionLoading?0.6:1 }}
                                      onMouseEnter={e=>{if(!actionLoading){e.currentTarget.style.background=t.success+'25';e.currentTarget.style.boxShadow=`0 0 10px ${t.success}30`;}}}
                                      onMouseLeave={e=>{e.currentTarget.style.background=t.successSoft;e.currentTarget.style.boxShadow='none';}}
                                    >{actionLoading?<Spin size={11} color={t.success}/>:<FiCheck size={12}/>}</button>
                                  )}

                                  {/* Reject (only if pending) */}
                                  {isPending && (
                                    <button className="act-btn" onClick={()=>{setRejectComp(c);setRejectReason('');}} disabled={actionLoading}
                                      style={{ display:'flex', alignItems:'center', gap:4, background:t.errorSoft, border:`1px solid ${t.error}30`, borderRadius:8, color:t.error, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, padding:'7px 10px', cursor:actionLoading?'not-allowed':'pointer', opacity:actionLoading?0.6:1 }}
                                      onMouseEnter={e=>{if(!actionLoading){e.currentTarget.style.background=t.error+'25';e.currentTarget.style.boxShadow=`0 0 10px ${t.error}25`;}}}
                                      onMouseLeave={e=>{e.currentTarget.style.background=t.errorSoft;e.currentTarget.style.boxShadow='none';}}
                                    ><FiX size={12}/></button>
                                  )}

                                  {/* Delete */}
                                  <button className="act-btn" onClick={()=>setDeleteComp(c)} disabled={actionLoading}
                                    style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:`1px solid ${t.border}`, borderRadius:8, color:t.textMuted, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, padding:'7px 10px', cursor:actionLoading?'not-allowed':'pointer', opacity:actionLoading?0.6:1 }}
                                    onMouseEnter={e=>{if(!actionLoading){e.currentTarget.style.background=t.errorSoft;e.currentTarget.style.borderColor=t.error+'40';e.currentTarget.style.color=t.error;}}}
                                    onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.textMuted;}}
                                  ><FiTrash2 size={12}/></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* ── View Details Modal ── */}
      {viewComp && (
        <ModalShell
          title={viewComp.title}
          subtitle={`Competition ID: ${viewComp.id}`}
          icon={FiAward}
          iconColor={t.gold}
          onClose={()=>!actionLoading&&setViewComp(null)}
          footer={[
            <ModalBtn key="cl" label="Close" soft onClick={()=>setViewComp(null)} disabled={actionLoading}/>,
            ...(!viewComp.isApproved && viewComp.status !== 'Rejected' ? [
              <ModalBtn key="ap" label={actionLoading?'Approving…':'Approve'} color={t.success} onClick={()=>handleApprove(viewComp.id)} loading={actionLoading}/>,
              <ModalBtn key="rj" label="Reject" color={t.error} onClick={()=>{ setViewComp(null); setTimeout(()=>{ setRejectComp(viewComp); setRejectReason(''); }, 200); }}/>,
            ] : [])
          ]}
        >
          <div style={{ marginTop:-4 }}>
            <DetailRow label="Description">
              <span style={{ color:viewComp.description?t.textSecondary:t.textMuted }}>
                {viewComp.description || 'No description provided'}
              </span>
            </DetailRow>
            <DetailRow label="Type">
              <Badge label={viewComp.competitionType||'—'} color={typeColor(viewComp.competitionType).color} bg={typeColor(viewComp.competitionType).bg}/>
            </DetailRow>
            <DetailRow label="Status">
              <Badge label={compStatus(viewComp).label} color={compStatus(viewComp).color} bg={compStatus(viewComp).bg}/>
            </DetailRow>
            <DetailRow label="Creator">
              {viewComp.creatorName} <span style={{ color:t.textMuted }}>({viewComp.creatorRole})</span>
            </DetailRow>
            <DetailRow label="Start Date">{fmtFull(viewComp.startDate)}</DetailRow>
            <DetailRow label="End Date">{fmtFull(viewComp.endDate)}</DetailRow>
            {viewComp.clanId && <DetailRow label="Clan ID"><span style={{ fontFamily:'monospace', color:t.accent }}>#{viewComp.clanId}</span></DetailRow>}
            <DetailRow label="Created On">{fmtFull(viewComp.createdAt)}</DetailRow>
          </div>
        </ModalShell>
      )}

      {/* ── Reject Modal ── */}
      {rejectComp && (
        <ModalShell
          title="Reject Competition"
          subtitle={rejectComp.title}
          icon={FiAlertTriangle}
          iconColor={t.error}
          onClose={()=>!actionLoading&&setRejectComp(null)}
          footer={[
            <ModalBtn key="c" label="Cancel" soft onClick={()=>setRejectComp(null)} disabled={actionLoading}/>,
            <ModalBtn key="r" label={actionLoading?'Rejecting…':'Reject Competition'} color={t.error} onClick={handleReject} loading={actionLoading}/>,
          ]}
        >
          <p style={{ fontSize:13, color:t.textSecondary, marginBottom:18, lineHeight:1.6 }}>
            Rejecting <span style={{ color:t.textPrimary, fontWeight:600 }}>"{rejectComp.title}"</span> will notify the creator.
          </p>
          <CosmicTextarea
            label="Reason for rejection"
            value={rejectReason}
            onChange={e=>setRejectReason(e.target.value)}
            placeholder="Provide a clear reason (optional)…"
            rows={4}
          />
        </ModalShell>
      )}

      {/* ── Delete Modal ── */}
      {deleteComp && (
        <DeleteModal
          comp={deleteComp}
          loading={actionLoading}
          onConfirm={handleDelete}
          onClose={()=>!actionLoading&&setDeleteComp(null)}
        />
      )}
    </>
  );
};

export default CompetitionManagement;