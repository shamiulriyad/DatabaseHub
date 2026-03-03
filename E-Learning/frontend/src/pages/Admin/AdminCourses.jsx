import React, { useEffect, useState, useRef } from 'react';
import {
  FiCheckCircle, FiXCircle, FiEdit2, FiSearch, FiFilter,
  FiBookOpen, FiUser, FiGlobe, FiLayers, FiAlertTriangle,
  FiX, FiChevronDown, FiRefreshCw, FiImage
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
  .d1{animation-delay:.05s;} .d2{animation-delay:.1s;} .d3{animation-delay:.15s;}

  .c-row { transition: background 0.15s; }
  .c-row:hover { background: rgba(139,92,246,0.035) !important; }
  .act-btn { transition: background 0.17s, box-shadow 0.17s, border-color 0.17s; }
  select option { background: #1a2030; color: #f0f0f5; }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const statusMeta = (s) => {
  const map = {
    Pending:   { color: t.warning, bg: t.warnSoft },
    Published: { color: t.success, bg: t.successSoft },
    Approved:  { color: t.success, bg: t.successSoft },
    Rejected:  { color: t.error,   bg: t.errorSoft },
    Draft:     { color: t.textMuted, bg: 'rgba(255,255,255,0.05)' },
  };
  return map[s] || { color: t.textMuted, bg: 'rgba(255,255,255,0.05)' };
};

// ─── Reusable atoms ────────────────────────────────────────────────────────────
const Spin = ({ size = 14, color = t.accent }) => (
  <span style={{
    display:'inline-block', width:size, height:size,
    border:`2px solid ${color}30`, borderTopColor:color,
    borderRadius:'50%', animation:'spin 0.8s linear infinite', flexShrink:0,
  }}/>
);

const Toast = ({ toast }) => !toast ? null : (
  <div style={{
    position:'fixed', bottom:28, right:28, zIndex:9999,
    padding:'12px 20px', borderRadius:12,
    background: toast.type==='success' ? '#0D2B1F' : toast.type==='info' ? '#0D1A2B' : '#1F0D14',
    border:`1px solid ${toast.type==='success' ? t.success+'50' : toast.type==='info' ? t.accent+'50' : t.error+'50'}`,
    color: toast.type==='success' ? t.success : toast.type==='info' ? t.accent : t.error,
    fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500,
    boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
    animation:'fadeUp 0.3s ease', maxWidth:340,
  }}>
    {toast.type==='success'?'✓ ':toast.type==='info'?'ℹ ':'⚠ '}{toast.msg}
  </div>
);

const SkeletonRow = ({ cols = 6 }) => (
  <tr>
    {[...Array(cols)].map((_, i) => (
      <td key={i} style={{ padding:'16px 18px' }}>
        <div style={{
          height:11, width:`${[55,25,22,20,18,20][i]||30}%`, minWidth:28, borderRadius:6,
          background:`linear-gradient(90deg,${t.bgInput} 25%,#1a2235 50%,${t.bgInput} 75%)`,
          backgroundSize:'200% auto', animation:`shimmer 1.5s linear infinite`,
          animationDelay:`${i*0.08}s`,
        }}/>
      </td>
    ))}
  </tr>
);

const StatCard = ({ label, value, icon:Icon, color, delay }) => (
  <div className={`fade-up ${delay}`} style={{
    background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:16, padding:'18px 20px',
  }}>
    <div style={{
      width:34, height:34, borderRadius:9,
      background:color+'18', border:`1px solid ${color}25`,
      display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12,
    }}><Icon size={15} color={color}/></div>
    <p style={{ fontSize:26, fontWeight:700, color:t.textPrimary, lineHeight:1 }}>{value}</p>
    <p style={{ fontSize:11, color:t.textMuted, marginTop:5 }}>{label}</p>
  </div>
);

// ─── CosmicInput ──────────────────────────────────────────────────────────────
const CosmicInput = ({ label, value, onChange, placeholder, style={} }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:t.textMuted, marginBottom:7 }}>{label}</label>}
      <input value={value} onChange={onChange} placeholder={placeholder}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{
          width:'100%', background:t.bgInput, border:`1px solid ${f?t.borderFocus:t.border}`,
          borderRadius:10, color:t.textPrimary, fontFamily:"'DM Sans',sans-serif",
          fontSize:13, padding:'10px 14px', outline:'none',
          boxShadow:f?`0 0 0 3px ${t.accentGlow}`:'none',
          transition:'border-color 0.2s,box-shadow 0.2s', ...style,
        }}
      />
    </div>
  );
};

const CosmicTextarea = ({ label, value, onChange, placeholder, rows=4 }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:t.textMuted, marginBottom:7 }}>{label}</label>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{
          width:'100%', background:t.bgInput, border:`1px solid ${f?t.borderFocus:t.border}`,
          borderRadius:10, color:t.textPrimary, fontFamily:"'DM Sans',sans-serif",
          fontSize:13, padding:'10px 14px', outline:'none', resize:'vertical', lineHeight:1.6,
          boxShadow:f?`0 0 0 3px ${t.accentGlow}`:'none',
          transition:'border-color 0.2s,box-shadow 0.2s',
        }}
      />
    </div>
  );
};

const CosmicSelect = ({ label, value, onChange, children, style={} }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom:0, ...style }}>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:t.textMuted, marginBottom:7 }}>{label}</label>}
      <div style={{ position:'relative' }}>
        <select value={value} onChange={onChange}
          onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          style={{
            width:'100%', background:t.bgInput, border:`1px solid ${f?t.borderFocus:t.border}`,
            borderRadius:10, color:t.textPrimary, fontFamily:"'DM Sans',sans-serif",
            fontSize:13, padding:'9px 34px 9px 14px', outline:'none',
            appearance:'none', cursor:'pointer',
            boxShadow:f?`0 0 0 3px ${t.accentGlow}`:'none',
            transition:'border-color 0.2s,box-shadow 0.2s',
          }}
        >{children}</select>
        <FiChevronDown size={13} style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', color:t.textMuted, pointerEvents:'none' }}/>
      </div>
    </div>
  );
};

// ─── Modal Shell ──────────────────────────────────────────────────────────────
const ModalShell = ({ title, icon:Icon, iconColor, onClose, children, footer }) => (
  <div style={{
    position:'fixed', inset:0, zIndex:1000,
    display:'flex', alignItems:'center', justifyContent:'center',
    background:'rgba(0,0,0,0.72)', backdropFilter:'blur(6px)',
    animation:'fadeIn 0.2s ease',
  }} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{
      background:t.bgModal, border:`1px solid ${t.border}`,
      borderRadius:20, padding:32, maxWidth:500, width:'90%',
      boxShadow:'0 40px 80px rgba(0,0,0,0.65)',
      animation:'fadeUp 0.25s ease', maxHeight:'90vh', overflowY:'auto',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {Icon && (
            <div style={{
              width:40, height:40, borderRadius:'50%',
              background:iconColor+'18', border:`1px solid ${iconColor}30`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}><Icon size={18} color={iconColor}/></div>
          )}
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:700, color:t.textPrimary }}>{title}</h2>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:t.textMuted, cursor:'pointer', padding:4 }}>
          <FiX size={18}/>
        </button>
      </div>
      {children}
      {footer && <div style={{ display:'flex', gap:10, marginTop:24 }}>{footer}</div>}
    </div>
  </div>
);

const ModalBtn = ({ label, onClick, color, soft, disabled, loading: isLoading }) => (
  <button onClick={onClick} disabled={disabled||isLoading} style={{
    flex:1, padding:'11px', borderRadius:10, cursor:(disabled||isLoading)?'not-allowed':'pointer',
    background: soft ? 'none' : color,
    border:`1px solid ${soft ? t.border : 'transparent'}`,
    color: soft ? t.textSecondary : '#fff',
    fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600,
    opacity:(disabled||isLoading)?0.7:1,
    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
    transition:'opacity 0.2s',
  }}>
    {isLoading && <Spin size={14} color={soft?t.textMuted:'#fff'}/>}
    {label}
  </button>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <tr><td colSpan={6} style={{ padding:'72px 24px', textAlign:'center' }}>
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
      <div style={{ width:60, height:60, borderRadius:'50%', background:t.accentSoft, border:`1px solid ${t.accent}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <FiBookOpen size={26} color={t.accent}/>
      </div>
      <p style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:t.textPrimary }}>No Courses Found</p>
      <p style={{ fontSize:13, color:t.textMuted }}>Try adjusting your filters or search query.</p>
    </div>
  </td></tr>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const AdminCourses = () => {
  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [teachers, setTeachers]   = useState([]);
  const [universities, setUniversities] = useState([]);

  const [filters, setFilters]     = useState({ price:'all', difficulty:'all', status:'Pending', instructorId:'', universityId:'' });
  const [searchQ, setSearchQ]     = useState('');
  const [searchInput, setSearchInput] = useState('');
  const debounceRef               = useRef(null);

  const [toast, setToast]         = useState(null);
  const [actionId, setActionId]   = useState(null); // which course is being acted on

  // Reject modal
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selected, setSelected]   = useState(null);

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData]   = useState({ title:'', shortDescription:'', fullDescription:'', thumbnailUrl:'' });

  const showToast = (msg, type='error') => { setToast({ msg, type }); setTimeout(()=>setToast(null), 4000); };

  // ── Fetch courses ─────────────────────────────────────────────────────────
  useEffect(() => { fetchCourses(); }, [filters, searchQ]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = { page:1, pageSize:200, status:filters.status };
      if (searchQ)              params.q            = searchQ;
      if (filters.instructorId) params.teacherId    = filters.instructorId;
      if (filters.universityId) params.universityId = filters.universityId;
      if (filters.price==='free') params.price      = 0;
      if (filters.price==='paid') params.minPrice   = 1;

      const res = await api.get('/courses', { params });
      const payload = res.data?.courses ?? res.data?.data ?? res.data ?? [];
      let list = [];
      if (Array.isArray(payload))                          list = payload;
      else if (payload?.items && Array.isArray(payload.items)) list = payload.items;
      else if (payload?.courses && Array.isArray(payload.courses)) list = payload.courses;
      setCourses(list);
    } catch (err) {
      console.error(err);
      showToast('Failed to load courses');
    } finally { setLoading(false); }
  };

  // ── Fetch teachers + universities ─────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    api.get('/teachers?page=1&pageSize=500')
      .then(res => { const d = res.data?.data || res.data || []; if (mounted) setTeachers(Array.isArray(d) ? d : d.items||[]); })
      .catch(() => setTeachers([]));
    api.get('/universities')
      .then(res => { const d = res.data?.data || res.data || []; if (mounted) setUniversities(Array.isArray(d) ? d : d.items||[]); })
      .catch(() => setUniversities([]));
    return () => { mounted = false; };
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleApprove = async (course) => {
    setActionId(course.id);
    try {
      await api.put(`/courses/${course.id}/status`, { Status:'Approve' });
      showToast('Course approved and published!', 'success');
      fetchCourses();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to approve');
    } finally { setActionId(null); }
  };

  const openReject = (course) => { setSelected(course); setRejectReason(''); setRejectModal(true); };

  const handleReject = async () => {
    if (!selected) return;
    setActionId(selected.id);
    try {
      await api.put(`/courses/${selected.id}/status`, { Status:'Reject', Reason:rejectReason });
      showToast('Course rejected.', 'info');
      setRejectModal(false);
      fetchCourses();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to reject');
    } finally { setActionId(null); }
  };

  const openEdit = (course) => {
    setSelected(course);
    setEditData({ title:course.title||'', shortDescription:course.shortDescription||'', fullDescription:course.fullDescription||'', thumbnailUrl:course.thumbnailUrl||'' });
    setEditModal(true);
  };

  const handleEditSave = async () => {
    if (!selected) return;
    setActionId(selected.id);
    try {
      await api.put(`/courses/${selected.id}`, {
        Title:selected.editData?.title ?? editData.title,
        ShortDescription: editData.shortDescription,
        FullDescription:  editData.fullDescription,
        ThumbnailUrl:     editData.thumbnailUrl,
      });
      showToast('Course updated successfully!', 'success');
      setEditModal(false);
      fetchCourses();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to save');
    } finally { setActionId(null); }
  };

  // ── Debounced search ──────────────────────────────────────────────────────
  const handleSearchInput = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQ(val), 400);
  };

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]:val }));

  // ── Stats ─────────────────────────────────────────────────────────────────
  const pending   = courses.filter(c => c.status==='Pending').length;
  const published = courses.filter(c => c.status==='Published'||c.status==='Approved').length;
  const rejected  = courses.filter(c => c.status==='Rejected').length;

  return (
    <>
      <style>{G}</style>
      <Toast toast={toast}/>

      {/* Starfield */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        {[...Array(50)].map((_,i) => (
          <div key={i} style={{
            position:'absolute',
            width:Math.random()*2+1, height:Math.random()*2+1,
            background:`rgba(255,255,255,${Math.random()*0.3+0.05})`,
            borderRadius:'50%',
            top:`${Math.random()*100}%`, left:`${Math.random()*100}%`,
            animation:`twinkle ${2+Math.random()*4}s ease-in-out infinite`,
            animationDelay:`${Math.random()*4}s`,
          }}/>
        ))}
        <div style={{
          position:'absolute', inset:0,
          background:`radial-gradient(ellipse 65% 45% at 10% 5%, rgba(139,92,246,0.08) 0%, transparent 55%),
                      radial-gradient(ellipse 50% 35% at 90% 90%, rgba(16,185,129,0.04) 0%, transparent 55%)`,
        }}/>
      </div>

      <div style={{ position:'relative', zIndex:1, minHeight:'100vh', padding:'36px 16px 80px' }}>
        <div style={{ maxWidth:1150, margin:'0 auto' }}>

          {/* ── Header ── */}
          <div className="fade-up" style={{ marginBottom:32 }}>
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:t.accent, marginBottom:6 }}>Admin Panel</p>
            <h1 style={{
              fontFamily:"'Playfair Display',serif",
              fontSize:'clamp(22px,4vw,34px)', fontWeight:700,
              background:`linear-gradient(135deg, ${t.textPrimary} 50%, ${t.textSecondary})`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:6,
            }}>Course Management</h1>
            <p style={{ fontSize:14, color:t.textSecondary }}>Review, approve, reject and edit submitted courses.</p>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:14, marginBottom:26 }}>
            <StatCard label="Total Loaded"  value={courses.length} icon={FiBookOpen}    color={t.accent}  delay="d1"/>
            <StatCard label="Pending"        value={pending}        icon={FiFilter}      color={t.warning} delay="d1"/>
            <StatCard label="Approved"       value={published}      icon={FiCheckCircle} color={t.success} delay="d2"/>
            <StatCard label="Rejected"       value={rejected}       icon={FiXCircle}     color={t.error}   delay="d2"/>
          </div>

          {/* ── Filter Bar ── */}
          <div className="fade-up d2" style={{
            background:t.bgCard, border:`1px solid ${t.border}`,
            borderRadius:16, padding:'18px 22px', marginBottom:18,
            display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end',
          }}>
            {/* Search */}
            <div style={{ position:'relative', flex:'1 1 220px', maxWidth:300 }}>
              <FiSearch size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:t.textMuted, pointerEvents:'none' }}/>
              <input
                placeholder="Search courses…"
                value={searchInput}
                onChange={e=>handleSearchInput(e.target.value)}
                style={{
                  width:'100%', background:t.bgInput, border:`1px solid ${t.border}`,
                  borderRadius:10, color:t.textPrimary, fontFamily:"'DM Sans',sans-serif",
                  fontSize:13, padding:'9px 30px 9px 34px', outline:'none',
                  transition:'border-color 0.2s',
                }}
                onFocus={e=>{e.target.style.borderColor=t.borderFocus;e.target.style.boxShadow=`0 0 0 3px ${t.accentGlow}`;}}
                onBlur={e=>{e.target.style.borderColor=t.border;e.target.style.boxShadow='none';}}
              />
              {searchInput && (
                <button onClick={()=>{setSearchInput('');setSearchQ('');}} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:t.textMuted, cursor:'pointer', padding:2 }}>
                  <FiX size={12}/>
                </button>
              )}
            </div>

            {/* Status */}
            <div style={{ flex:'0 1 140px' }}>
              <CosmicSelect value={filters.status} onChange={e=>setFilter('status',e.target.value)}>
                {['Pending','Published','Rejected','Draft'].map(s=><option key={s} value={s}>{s}</option>)}
              </CosmicSelect>
            </div>

            {/* Price */}
            <div style={{ flex:'0 1 130px' }}>
              <CosmicSelect value={filters.price} onChange={e=>setFilter('price',e.target.value)}>
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </CosmicSelect>
            </div>

            {/* Teacher */}
            <div style={{ flex:'0 1 180px' }}>
              <CosmicSelect value={filters.instructorId} onChange={e=>setFilter('instructorId',e.target.value)}>
                <option value="">All Teachers</option>
                {teachers.map(t2=>(
                  <option key={t2.id??t2.Id} value={t2.id??t2.Id}>
                    {t2.fullName??t2.name??t2.username??'Teacher'}
                  </option>
                ))}
              </CosmicSelect>
            </div>

            {/* University */}
            <div style={{ flex:'0 1 180px' }}>
              <CosmicSelect value={filters.universityId} onChange={e=>setFilter('universityId',e.target.value)}>
                <option value="">All Universities</option>
                {universities.map(u=>(
                  <option key={u.id??u.Id} value={u.id??u.Id}>
                    {u.name??u.Name}
                  </option>
                ))}
              </CosmicSelect>
            </div>

            {/* Reset */}
            <button onClick={()=>{ setFilters({price:'all',difficulty:'all',status:'Pending',instructorId:'',universityId:''}); setSearchInput(''); setSearchQ(''); }}
              style={{
                display:'flex', alignItems:'center', gap:6,
                background:'none', border:`1px solid ${t.border}`, borderRadius:10,
                color:t.textMuted, fontFamily:"'DM Sans',sans-serif", fontSize:12,
                padding:'9px 14px', cursor:'pointer', transition:'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=t.accent;e.currentTarget.style.color=t.accent;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.textMuted;}}
            >
              <FiRefreshCw size={12}/> Reset
            </button>
          </div>

          {/* ── Table Card ── */}
          <div className="fade-up d3" style={{
            background:t.bgCard, border:`1px solid ${t.border}`,
            borderRadius:20, overflow:'hidden',
            boxShadow:'0 24px 60px rgba(0,0,0,0.45)',
          }}>

            {/* Card header */}
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'16px 24px', borderBottom:`1px solid ${t.border}`, background:t.bgSection,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:t.warning, animation:courses.length>0?'pulse-dot 1.5s ease infinite':'none' }}/>
                <span style={{ fontSize:13, fontWeight:600, color:t.textSecondary }}>
                  {courses.length} courses · <span style={{ color:filters.status===pending?t.warning:t.textMuted }}>{filters.status}</span>
                </span>
              </div>
              <button onClick={fetchCourses} disabled={loading} style={{
                display:'flex', alignItems:'center', gap:6,
                background:t.accentSoft, border:`1px solid ${t.accent}30`,
                borderRadius:8, color:t.accent, fontFamily:"'DM Sans',sans-serif",
                fontSize:12, fontWeight:600, padding:'7px 14px',
                cursor:loading?'not-allowed':'pointer', opacity:loading?0.6:1,
              }}>
                {loading?<Spin size={12}/>:'↻'} Refresh
              </button>
            </div>

            {/* Table */}
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${t.border}`, background:t.bgSection }}>
                    {['Course','University','Department','Teacher','Status','Actions'].map(h=>(
                      <th key={h} style={{ padding:'12px 18px', textAlign:'left', fontSize:10, fontWeight:600, letterSpacing:'0.09em', textTransform:'uppercase', color:t.textMuted, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(7)].map((_,i)=><SkeletonRow key={i}/>)
                    : courses.length===0
                      ? <EmptyState/>
                      : courses.map(c => {
                          const sm       = statusMeta(c.status);
                          const isActing = actionId===c.id;
                          return (
                            <tr key={c.id} className="c-row" style={{ borderBottom:`1px solid ${t.border}` }}>

                              {/* Course */}
                              <td style={{ padding:'14px 18px', maxWidth:260 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                  {c.thumbnailUrl ? (
                                    <img src={c.thumbnailUrl} alt={c.title} style={{ width:40, height:30, borderRadius:6, objectFit:'cover', flexShrink:0, border:`1px solid ${t.border}` }}/>
                                  ) : (
                                    <div style={{ width:40, height:30, borderRadius:6, flexShrink:0, background:t.accentSoft, border:`1px solid ${t.accent}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                      <FiImage size={14} color={t.accent}/>
                                    </div>
                                  )}
                                  <div style={{ minWidth:0 }}>
                                    <p style={{
                                      fontWeight:600, fontSize:13, color:t.textPrimary,
                                      display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden',
                                    }}>{c.title}</p>
                                    {c.shortDescription && (
                                      <p style={{ fontSize:11, color:t.textMuted, marginTop:2, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{c.shortDescription}</p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* University */}
                              <td style={{ padding:'14px 18px', fontSize:12, color:t.textSecondary, whiteSpace:'nowrap' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                  <FiGlobe size={11} color={t.textMuted}/> {c.universityName||'—'}
                                </div>
                              </td>

                              {/* Department */}
                              <td style={{ padding:'14px 18px', fontSize:12, color:t.textSecondary, whiteSpace:'nowrap' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                  <FiLayers size={11} color={t.textMuted}/> {c.departmentName||'—'}
                                </div>
                              </td>

                              {/* Teacher */}
                              <td style={{ padding:'14px 18px', fontSize:12, color:t.textSecondary, whiteSpace:'nowrap' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                  <FiUser size={11} color={t.textMuted}/> {c.teacherName||'—'}
                                </div>
                              </td>

                              {/* Status */}
                              <td style={{ padding:'14px 18px' }}>
                                <span style={{
                                  display:'inline-flex', alignItems:'center', gap:5,
                                  fontSize:11, fontWeight:700, letterSpacing:'0.05em',
                                  padding:'4px 10px', borderRadius:20,
                                  background:sm.bg, border:`1px solid ${sm.color}30`, color:sm.color,
                                }}>{c.status}</span>
                              </td>

                              {/* Actions */}
                              <td style={{ padding:'14px 18px' }}>
                                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                                  {/* Approve */}
                                  <button className="act-btn" disabled={isActing} onClick={()=>handleApprove(c)}
                                    style={{ display:'flex', alignItems:'center', gap:5, background:t.successSoft, border:`1px solid ${t.success}30`, borderRadius:8, color:t.success, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, padding:'7px 11px', cursor:isActing?'not-allowed':'pointer', opacity:isActing?0.6:1 }}
                                    onMouseEnter={e=>{if(!isActing){e.currentTarget.style.background=t.success+'25';e.currentTarget.style.boxShadow=`0 0 12px ${t.success}30`;}}}
                                    onMouseLeave={e=>{e.currentTarget.style.background=t.successSoft;e.currentTarget.style.boxShadow='none';}}
                                  >
                                    {isActing?<Spin size={11} color={t.success}/>:<FiCheckCircle size={12}/>} Approve
                                  </button>

                                  {/* Reject */}
                                  <button className="act-btn" disabled={isActing} onClick={()=>openReject(c)}
                                    style={{ display:'flex', alignItems:'center', gap:5, background:t.errorSoft, border:`1px solid ${t.error}30`, borderRadius:8, color:t.error, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, padding:'7px 11px', cursor:isActing?'not-allowed':'pointer', opacity:isActing?0.6:1 }}
                                    onMouseEnter={e=>{if(!isActing){e.currentTarget.style.background=t.error+'25';e.currentTarget.style.boxShadow=`0 0 12px ${t.error}25`;}}}
                                    onMouseLeave={e=>{e.currentTarget.style.background=t.errorSoft;e.currentTarget.style.boxShadow='none';}}
                                  >
                                    <FiXCircle size={12}/> Reject
                                  </button>

                                  {/* Edit */}
                                  <button className="act-btn" disabled={isActing} onClick={()=>openEdit(c)}
                                    style={{ display:'flex', alignItems:'center', gap:5, background:t.accentSoft, border:`1px solid ${t.accent}30`, borderRadius:8, color:t.accent, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, padding:'7px 11px', cursor:isActing?'not-allowed':'pointer', opacity:isActing?0.6:1 }}
                                    onMouseEnter={e=>{if(!isActing){e.currentTarget.style.background=t.accent+'25';e.currentTarget.style.boxShadow=`0 0 12px ${t.accentGlow}`;}}}
                                    onMouseLeave={e=>{e.currentTarget.style.background=t.accentSoft;e.currentTarget.style.boxShadow='none';}}
                                  >
                                    <FiEdit2 size={12}/> Edit
                                  </button>
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

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <ModalShell
          title="Reject Course"
          icon={FiAlertTriangle}
          iconColor={t.error}
          onClose={()=>!actionId&&setRejectModal(false)}
          footer={[
            <ModalBtn key="c" label="Cancel" soft onClick={()=>setRejectModal(false)} disabled={!!actionId}/>,
            <ModalBtn key="r" label={actionId?'Rejecting…':'Confirm Reject'} color={t.error} onClick={handleReject} loading={!!actionId}/>,
          ]}
        >
          {selected && (
            <p style={{ fontSize:13, color:t.textSecondary, marginBottom:18, lineHeight:1.6 }}>
              Rejecting course <span style={{ color:t.textPrimary, fontWeight:600 }}>"{selected.title}"</span>
            </p>
          )}
          <CosmicTextarea
            label="Reason (optional)"
            value={rejectReason}
            onChange={e=>setRejectReason(e.target.value)}
            placeholder="Provide a reason for rejection…"
            rows={4}
          />
        </ModalShell>
      )}

      {/* ── Edit Modal ── */}
      {editModal && (
        <ModalShell
          title="Edit Course"
          icon={FiEdit2}
          iconColor={t.accent}
          onClose={()=>!actionId&&setEditModal(false)}
          footer={[
            <ModalBtn key="c" label="Cancel" soft onClick={()=>setEditModal(false)} disabled={!!actionId}/>,
            <ModalBtn key="s" label={actionId?'Saving…':'Save Changes'} color={t.accent} onClick={handleEditSave} loading={!!actionId}/>,
          ]}
        >
          <CosmicInput label="Title" value={editData.title} onChange={e=>setEditData(p=>({...p,title:e.target.value}))} placeholder="Course title"/>
          <CosmicInput label="Short Description" value={editData.shortDescription} onChange={e=>setEditData(p=>({...p,shortDescription:e.target.value}))} placeholder="Brief summary…"/>
          <CosmicTextarea label="Full Description" value={editData.fullDescription} onChange={e=>setEditData(p=>({...p,fullDescription:e.target.value}))} placeholder="Detailed description…" rows={5}/>
          <CosmicInput label="Thumbnail URL" value={editData.thumbnailUrl} onChange={e=>setEditData(p=>({...p,thumbnailUrl:e.target.value}))} placeholder="https://…"/>
          {editData.thumbnailUrl && (
            <img src={editData.thumbnailUrl} alt="preview" style={{ width:'100%', height:140, objectFit:'cover', borderRadius:10, border:`1px solid ${t.border}`, marginTop:-8 }}
              onError={e=>e.target.style.display='none'}
            />
          )}
        </ModalShell>
      )}
    </>
  );
};

export default AdminCourses;