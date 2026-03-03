import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import TeacherApplicationModal from '../../components/TeacherApplicationModal';
import { useToast } from '@chakra-ui/react';
import {
  FaEdit, FaTrophy, FaEnvelope, FaCalendar,
  FaUsers, FaShieldAlt, FaChalkboardTeacher, FaGraduationCap,
  FaMedal, FaChartLine,
} from 'react-icons/fa';
import api from '../../services/api';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — matches HomePage exactly
═══════════════════════════════════════════════════════════════ */
const S = {
  pageBg:    '#070B1A',
  surface:   '#0D1428',
  card:      '#111A35',
  border:    '#1E2D55',
  muted:     '#8896BB',
  brand:     '#7055ff',
  brandDark: '#5533ee',
  gold:      '#fbbf24',
  goldLight: '#fcd34d',
  green:     '#4ade80',
  red:       '#f87171',
  blue:      '#38bdf8',
  pink:      '#f472b6',
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
::selection{background:#5533ee;color:#fff;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#0D1428;}
::-webkit-scrollbar-thumb{background:#5533ee;border-radius:99px;}

.up-root{min-height:100vh;background:linear-gradient(180deg,${S.surface} 0%,${S.pageBg} 100%);font-family:'DM Sans',sans-serif;color:#fff;position:relative;overflow-x:hidden;}

/* ── Animations ── */
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.2)}}
@keyframes shoot{0%{transform:translateX(-180px) translateY(30px);opacity:0;}8%{opacity:1;}100%{transform:translateX(700px) translateY(-110px);opacity:0;}}
@keyframes floatUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes dp{0%,100%{opacity:.3}50%{opacity:1}}

/* ── Layout ── */
.up-inner{max-width:1100px;margin:0 auto;padding:36px 28px 100px;animation:floatUp .5s ease both;}

/* ── Back btn ── */
.up-back{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:10px;background:rgba(112,85,255,.1);border:1px solid rgba(112,85,255,.3);color:${S.muted};font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;margin-bottom:24px;letter-spacing:.02em;}
.up-back:hover{color:#fff;border-color:${S.brand};background:rgba(112,85,255,.18);}

/* ── Cover ── */
.up-cover{height:220px;position:relative;overflow:hidden;border-radius:24px 24px 0 0;}
.up-cover-bg{width:100%;height:100%;background:linear-gradient(135deg,#07081A 0%,#14093A 50%,#0A1630 100%);position:relative;}
.up-cover-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(112,85,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(112,85,255,.06) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(to bottom,transparent,rgba(0,0,0,.55) 30%,rgba(0,0,0,.55) 70%,transparent);}
.up-cover-fade{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,${S.card} 100%);}
.up-star{position:absolute;border-radius:50%;background:rgba(167,139,250,.85);}
.up-shoot{position:absolute;height:1.5px;border-radius:99px;background:linear-gradient(90deg,transparent,rgba(167,139,250,.8),transparent);animation:shoot 5s ease-in-out infinite;}

/* ── Hero card ── */
.up-hero{border-radius:24px;overflow:hidden;border:1px solid ${S.border};margin-bottom:24px;background:${S.card};}
.up-hero-body{padding:0 32px 32px;}

/* ── Avatar ── */
.up-avatar-wrap{margin-top:-60px;display:inline-block;padding:4px;border-radius:50%;background:linear-gradient(135deg,${S.brandDark},${S.brand},${S.gold});box-shadow:0 0 0 4px ${S.card},0 0 40px rgba(112,85,255,.35);position:relative;}
.up-avatar-inner{width:100px;height:100px;border-radius:50%;background:${S.surface};display:flex;align-items:center;justify-content:center;overflow:hidden;}

/* ── Name ── */
.up-name{font-family:'Playfair Display',serif;font-size:34px;font-weight:900;line-height:1.05;letter-spacing:-.02em;color:#fff;}
.up-name em{font-style:italic;background:linear-gradient(135deg,${S.brand},${S.gold});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.up-handle{font-size:13px;font-weight:600;color:${S.brand};letter-spacing:.04em;margin-bottom:12px;}

/* ── Chips ── */
.up-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:1px solid;transition:all .2s;}
.up-chip:hover{transform:translateY(-1px);}
.up-chips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px;}

/* ── Meta ── */
.up-meta{display:flex;align-items:center;gap:7px;font-size:13px;color:${S.muted};}
.up-hr{height:1px;background:${S.border};margin:24px 0;}

/* ── Buttons ── */
.up-btn{display:inline-flex;align-items:center;gap:8px;padding:9px 20px;border-radius:999px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .25s;letter-spacing:.02em;}
.up-btn-primary{background:linear-gradient(135deg,${S.brandDark},${S.brand});color:#fff;box-shadow:0 4px 20px rgba(112,85,255,.3);}
.up-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(112,85,255,.45);}
.up-btn-ghost{background:transparent;color:${S.muted};border:1px solid ${S.border};}
.up-btn-ghost:hover{border-color:${S.brand};color:#fff;}

/* ── XP Bar ── */
.up-xp-row{display:flex;justify-content:space-between;margin-bottom:6px;}
.up-xp-track{height:6px;border-radius:999px;background:${S.border};overflow:hidden;}
.up-xp-fill{height:100%;border-radius:999px;background:linear-gradient(to right,${S.brand},${S.gold});}

/* ── Stat grid ── */
.up-stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px;margin-bottom:24px;}
.up-stat{background:${S.card};border:1px solid ${S.border};border-radius:20px;padding:24px;position:relative;overflow:hidden;transition:all .3s;cursor:default;}
.up-stat:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.4);}
.up-stat-bg-icon{position:absolute;bottom:-4px;right:4px;font-size:60px;opacity:.04;line-height:1;pointer-events:none;}
.up-stat-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:16px;border:1px solid;}
.up-stat-num{font-family:'Playfair Display',serif;font-size:44px;font-weight:900;line-height:1;letter-spacing:-.03em;}
.up-stat-label{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${S.muted};margin-top:4px;}
.up-stat-change{font-size:11px;font-weight:500;margin-top:4px;}

/* ── Two-col layout ── */
.up-cols{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}
@media(max-width:768px){.up-cols{grid-template-columns:1fr;}}

/* ── Panel ── */
.up-panel{background:${S.card};border:1px solid ${S.border};border-radius:20px;padding:26px;margin-bottom:20px;}
.up-panel-title{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#fff;display:flex;align-items:center;gap:9px;margin-bottom:20px;}
.up-panel-icon{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;}

/* ── Activity row ── */
.up-act-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid ${S.border};}
.up-act-row:last-child{border-bottom:none;padding-bottom:0;}
.up-act-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;border:1px solid;}
.up-act-text{font-size:13.5px;color:#fff;font-weight:500;line-height:1.4;}
.up-act-sub{font-size:12px;color:${S.muted};}

/* ── Clan card ── */
.up-clan-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;}
.up-clan{background:${S.surface};border:1px solid ${S.border};border-radius:18px;overflow:hidden;cursor:pointer;transition:all .3s;}
.up-clan:hover{border-color:rgba(112,85,255,.5);transform:translateY(-4px);box-shadow:0 16px 44px rgba(0,0,0,.45);}
.up-clan-top{height:4px;}
.up-clan-body{padding:18px;display:flex;gap:14px;align-items:center;}
.up-clan-logo{width:52px;height:52px;border-radius:14px;border:1px solid ${S.border};background:rgba(112,85,255,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;}
.up-clan-name{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#fff;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.up-clan-meta{font-size:12px;color:${S.muted};display:flex;gap:12px;margin-top:4px;}

/* ── Achievements ── */
.up-achieve-grid{display:flex;flex-wrap:wrap;gap:12px;}
.up-achieve{display:flex;flex-direction:column;align-items:center;gap:6px;width:68px;}
.up-achieve-icon{width:54px;height:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:22px;border:1px solid;transition:all .25s;}
.up-achieve-icon:hover{transform:translateY(-3px);}
.up-achieve-label{font-size:9.5px;color:${S.muted};text-align:center;line-height:1.3;}

/* ── Empty ── */
.up-empty{text-align:center;padding:48px 20px;}
.up-empty-icon{font-size:44px;display:block;margin-bottom:14px;}
.up-empty-text{font-size:13px;color:${S.muted};}

/* ── Loader ── */
.up-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:18px;background:${S.pageBg};}
.up-loader-ring{width:52px;height:52px;border-radius:50%;border:2px solid ${S.border};border-top-color:#9080ff;animation:spin .9s linear infinite;}
.up-loader-dots{display:flex;gap:6px;}
.up-loader-dot{width:7px;height:7px;border-radius:50%;background:${S.brand};animation:dp 1.3s ease-in-out infinite;}
.up-loader-dot:nth-child(2){animation-delay:.22s;}
.up-loader-dot:nth-child(3){animation-delay:.44s;}

/* ── Bio ── */
.up-bio{font-size:14px;color:${S.muted};line-height:1.75;max-width:620px;}

/* ── Weekly goal bar ── */
.up-day-bar-track{flex:1;height:6px;border-radius:999px;background:${S.border};overflow:hidden;}
.up-day-bar-fill{height:100%;border-radius:999px;background:linear-gradient(to right,${S.brand},${S.gold});}
`;

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const normalizeProfile = (p) => {
  if (!p) return {};
  const cc = p.currentClan || p.CurrentClan || null;
  return {
    id: p.id ?? p.Id,
    username: p.username ?? p.Username ?? p.userName,
    email: p.email ?? p.Email,
    firstName: p.firstName ?? p.FirstName,
    lastName: p.lastName ?? p.LastName,
    profileImageUrl: p.profileImageUrl ?? p.ProfileImageUrl ?? p.profileImage,
    coverImageUrl: p.coverImageUrl ?? p.CoverImageUrl ?? p.coverImage,
    bio: p.bio ?? p.Bio,
    createdAt: p.createdAt ?? p.CreatedAt,
    totalPoints: p.totalPoints ?? p.TotalPoints ?? 0,
    exp: p.exp ?? p.Exp ?? 0,
    level: p.level ?? p.Level ?? 0,
    currentRank: p.currentRank ?? p.CurrentRank,
    isStudent: p.isStudent ?? p.IsStudent,
    isTeacher: p.isTeacher ?? p.IsTeacher,
    isAdmin: p.isAdmin ?? p.IsAdmin,
    isCompetitor: p.isCompetitor ?? p.IsCompetitor,
    avatar: p.avatar ?? p.Avatar,
    currentClan: cc ? {
      clanId: cc.clanId ?? cc.ClanId,
      clanName: cc.clanName ?? cc.ClanName,
      clanTag: cc.clanTag ?? cc.ClanTag,
      clanLogoUrl: cc.clanLogoUrl ?? cc.ClanLogoUrl,
      role: cc.role ?? cc.Role,
    } : null,
  };
};

const ROLE_S = {
  Leader:   { bg: 'rgba(248,113,113,.15)', color: '#fca5a5', border: 'rgba(248,113,113,.3)', icon: '👑' },
  CoLeader: { bg: 'rgba(251,191,36,.15)',  color: '#fcd34d', border: 'rgba(251,191,36,.3)',  icon: '⚡' },
  Member:   { bg: 'rgba(74,222,128,.15)',  color: '#86efac', border: 'rgba(74,222,128,.3)',  icon: '✦' },
};
const roleStyle = r => ROLE_S[r] || ROLE_S.Member;

const USER_CHIPS = [
  { key:'isStudent',    label:'Student',    Icon:FaGraduationCap,    bg:'rgba(56,189,248,.12)',  color:'#7dd3fc', border:'rgba(56,189,248,.28)' },
  { key:'isTeacher',   label:'Teacher',    Icon:FaChalkboardTeacher, bg:'rgba(74,222,128,.12)',  color:'#86efac', border:'rgba(74,222,128,.28)' },
  { key:'isAdmin',     label:'Admin',      Icon:FaShieldAlt,         bg:'rgba(248,113,113,.12)', color:'#fca5a5', border:'rgba(248,113,113,.28)' },
  { key:'isCompetitor',label:'Competitor', Icon:FaMedal,             bg:'rgba(251,191,36,.12)',  color:'#fcd34d', border:'rgba(251,191,36,.28)' },
];

const STARS = Array.from({length:24},(_,i)=>({
  top:`${9+(i*19)%80}%`, left:`${4+(i*31)%92}%`,
  size: i%4===0?3:i%3===0?2.5:1.5,
  op: 0.28+(i%5)*0.11,
  glow: i%4===0?10:5,
}));

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
const UserProfile = () => {
  const { user: authUser } = useAuth();
  const [profile,  setProfile]  = useState(null);
  const [stats,    setStats]    = useState(null);
  const [progression, setProgression] = useState(null);
  const [competitionHistory, setCompetitionHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [myClans,  setMyClans]  = useState([]);
  const [isLoading,setIsLoading]= useState(true);
  const navigate = useNavigate();
  const toast    = useToast();

  const fetchProfileData = useCallback(async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data?.success) setProfile(res.data.user);

      try {
        const progressionRes = await api.get('/progression/me');
        if (progressionRes.data?.success) {
          setProgression(progressionRes.data.progression);
        }
      } catch (e) {
        console.warn('Progression fetch failed:', e?.message);
      }

      try {
        const dr = await api.get('/auth/dashboard');
        if (dr.data?.success && dr.data.dashboard) {
          const d = dr.data.dashboard, s = d.stats||d.Stats||{};
          setStats({ enrolledCourses: s.totalEnrollments??s.enrolledCourses??0, completedCourses: s.completedCourses??0 });
          setMyClans(d.myClans||d.MyClans||[]);
        } else {
          const cr = await api.get('/clans/my-clans');
          if (cr.data?.success) setMyClans(cr.data.clans||[]);
        }
      } catch(e){ console.warn(e.message); }
    } catch(err) {
      const local = JSON.parse(localStorage.getItem('user')||'{}');
      if (local?.email){ setProfile(local); setStats({enrolledCourses:0,completedCourses:0}); }
      else toast({title:'Error',description:err.response?.data?.message||'Failed to load',status:'error',duration:3000,isClosable:true});
    } finally { setIsLoading(false); }
  }, [toast]);

  const fetchCompetitionHistory = useCallback(async (page = 1) => {
    try {
      setHistoryLoading(true);
      const res = await api.get(`/progression/me/history?page=${page}&pageSize=10`);
      if (res.data?.success) {
        setCompetitionHistory(res.data.history || []);
        setHistoryTotalPages(Math.max(1, res.data.totalPages || 1));
      }
    } catch (err) {
      console.warn('Competition history fetch failed:', err?.message);
      setCompetitionHistory([]);
      setHistoryTotalPages(1);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(()=>{ fetchProfileData(); },[fetchProfileData]);
  useEffect(()=>{ fetchCompetitionHistory(historyPage); },[historyPage, fetchCompetitionHistory]);

  const dp = normalizeProfile(profile||authUser||JSON.parse(localStorage.getItem('user')||'{}'));

  const determineRole = (clan) => {
    if (!clan) return 'Member';
    const uid = authUser?.id ?? dp?.id;
    const mr = clan.memberRole??clan.role??clan.userRole;
    if (mr) return mr;
    const lid = clan.leaderId??clan.leader?.id??clan.LeaderId;
    if (lid && uid && String(lid)===String(uid)) return 'Leader';
    const coIds = clan.coLeaderIds??clan.coLeaders??[];
    if (Array.isArray(coIds) && uid && coIds.some(id=>String(id)===String(uid))) return 'CoLeader';
    return 'Member';
  };

  /* ── Loader ── */
  if (isLoading) return (
    <>
      <style>{CSS}</style>
      <div className="up-loader">
        <div className="up-loader-ring"/>
        <div className="up-loader-dots">
          <div className="up-loader-dot"/><div className="up-loader-dot"/><div className="up-loader-dot"/>
        </div>
        <p style={{color:S.muted,fontSize:13}}>Loading your profile…</p>
      </div>
    </>
  );

  const firstName  = dp.firstName||'';
  const lastName   = dp.lastName||'';
  const initials   = ((firstName[0]||'')+(lastName[0]||'')).toUpperCase()||'?';
  const joinDate   = new Date(dp.createdAt||Date.now()).toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const chips      = USER_CHIPS.filter(c=>dp[c.key]);

  const xpCurrent = Number(progression?.exp ?? dp.exp ?? 0);
  const level = Number(progression?.level ?? dp.level ?? 0);
  const xpMax = Number(progression?.nextLevelRequiredExp ?? ((level + 1) * 3000));
  const xpPct = xpMax > 0 ? Math.min(100, Math.round((xpCurrent / xpMax) * 100)) : 100;

  const statCards = [
    { icon:'📚', label:'Enrolled',   value: stats?.enrolledCourses??0,  change:'Active courses',  color: S.brand },
    { icon:'🏆', label:'Completed',  value: stats?.completedCourses??0, change:'Finished courses', color: S.green },
    { icon:'⭐', label:'EXP',     value: xpCurrent.toLocaleString(), change:`Level ${level}`, color: S.gold  },
  ];

  const achievements = [
    { icon:'⚡', label:'Speed Learner',   earned: (stats?.enrolledCourses||0) > 0 || (stats?.completedCourses||0) > 0 },
    { icon:'🏅', label:'Course Finisher', earned: (stats?.completedCourses||0) >= 1 },
    { icon:'🌟', label:'Top Member',      earned: xpCurrent >= 500 },
    { icon:'🎓', label:'Scholar',         earned: (stats?.completedCourses||0) >= 3 },
    { icon:'💎', label:'Diamond',         earned: xpCurrent >= 5000 },
    { icon:'🚀', label:'Creator',         earned: Boolean(dp.isTeacher || dp.isCompetitor) },
    { icon:'🌍', label:'Global Top',      earned: xpCurrent >= 10000 },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="up-root">
        <div className="up-inner">

          {/* ── Back ── */}
          <button className="up-back" onClick={()=>navigate(-1)}>
            ← Back
          </button>

          {/* ═══ HERO CARD ═══ */}
          <div className="up-hero">

            {/* Cover */}
            <div className="up-cover">
              {dp.coverImageUrl ? (
                <>
                  <img src={dp.coverImageUrl} alt="cover" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  <div className="up-cover-fade"/>
                </>
              ) : (
                <div className="up-cover-bg">
                  <div className="up-cover-grid"/>
                  {STARS.map((s,i)=>(
                    <div key={i} className="up-star" style={{top:s.top,left:s.left,width:s.size,height:s.size,opacity:s.op,boxShadow:`0 0 ${s.glow}px rgba(167,139,250,${s.op})`}}/>
                  ))}
                  <div className="up-shoot" style={{top:'22%',width:110}}/>
                  <div className="up-shoot" style={{top:'60%',width:74,animationDelay:'2.2s'}}/>
                  <div className="up-shoot" style={{top:'40%',width:58,animationDelay:'4s'}}/>
                  {/* Nebula */}
                  <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:320,height:120,background:'radial-gradient(ellipse,rgba(112,85,255,.13) 0%,transparent 70%)',borderRadius:'50%'}}/>
                  <div style={{position:'absolute',top:'18%',right:'14%',width:180,height:80,background:'radial-gradient(ellipse,rgba(251,191,36,.07) 0%,transparent 70%)',borderRadius:'50%'}}/>
                  <div className="up-cover-fade"/>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="up-hero-body">

              {/* Avatar + name + actions row */}
              <div style={{display:'flex',flexWrap:'wrap',gap:24,alignItems:'flex-end',marginBottom:28}}>

                {/* Avatar */}
                <div className="up-avatar-wrap">
                  <div className="up-avatar-inner">
                    {dp.profileImageUrl||dp.avatar
                      ? <img src={dp.profileImageUrl||dp.avatar} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      : <span style={{fontFamily:"'Playfair Display',serif",fontSize:38,fontWeight:900,color:S.brand}}>{initials}</span>
                    }
                  </div>
                </div>

                {/* Name block */}
                <div style={{flex:1,minWidth:220,paddingBottom:4}}>
                  <h1 className="up-name" style={{marginBottom:6}}>
                    {firstName} <em>{lastName}</em>
                  </h1>
                  <div className="up-handle">@{dp.username}</div>

                  {/* XP Bar */}
                  <div style={{marginBottom:14,maxWidth:320}}>
                    <div className="up-xp-row">
                      <span style={{fontSize:10,color:S.muted,fontWeight:600}}>Level {level} {progression?.nextLevelRequiredExp ? `→ ${level+1}` : 'MAX'}</span>
                      <span style={{fontSize:10,color:S.brand,fontWeight:600}}>{xpCurrent.toLocaleString()} / {xpMax.toLocaleString()} XP</span>
                    </div>
                    <div className="up-xp-track">
                      <div className="up-xp-fill" style={{width:`${xpPct}%`}}/>
                    </div>
                  </div>

                  {/* Role chips */}
                  {chips.length>0 && (
                    <div className="up-chips">
                      {chips.map(c=>(
                        <span key={c.key} className="up-chip" style={{background:c.bg,color:c.color,borderColor:c.border}}>
                          <c.Icon style={{fontSize:10}}/> {c.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta */}
                  <div style={{display:'flex',flexWrap:'wrap',gap:18}}>
                    {dp.email && <div className="up-meta"><FaEnvelope style={{fontSize:12,color:S.muted}}/>{dp.email}</div>}
                    <div className="up-meta"><FaCalendar style={{fontSize:12,color:S.muted}}/>Joined {joinDate}</div>
                  </div>
                </div>

                {/* CTAs */}
                <div style={{display:'flex',gap:10,paddingBottom:4,flexWrap:'wrap'}}>
                  <button className="up-btn up-btn-primary" onClick={()=>navigate('/profile/edit')}>
                    <FaEdit style={{fontSize:12}}/> Edit Profile
                  </button>
                  {!dp.isTeacher&&!dp.isAdmin&&<TeacherApplicationModal userId={dp.id}/>}
                </div>
              </div>

              {/* Bio */}
              {dp.bio && (
                <>
                  <div className="up-hr"/>
                  <p className="up-bio">{dp.bio}</p>
                </>
              )}
            </div>
          </div>

          {/* ═══ STAT CARDS ═══ */}
          <div className="up-stat-grid">
            {statCards.map((s,i)=>(
              <div key={i} className="up-stat">
                <div className="up-stat-bg-icon">{s.icon}</div>
                <div className="up-stat-icon" style={{background:`${s.color}18`,borderColor:`${s.color}33`}}>
                  {s.icon}
                </div>
                <div className="up-stat-num" style={{color:s.color}}>{s.value}</div>
                <div className="up-stat-label">{s.label}</div>
                <div className="up-stat-change" style={{color:s.color}}>{s.change}</div>
              </div>
            ))}
          </div>

          {/* ═══ TWO COLS: Activity + Achievements ═══ */}
          <div className="up-cols">

            {/* Activity */}
            <div className="up-panel">
              <div className="up-panel-title">
                <div className="up-panel-icon" style={{background:`${S.brand}18`,border:`1px solid ${S.brand}33`}}>
                  <FaChartLine style={{color:S.brand,fontSize:14}}/>
                </div>
                Activity
              </div>

              {(stats?.enrolledCourses>0||stats?.completedCourses>0) ? (
                <>
                  {stats?.enrolledCourses>0&&(
                    <div className="up-act-row">
                      <div className="up-act-icon" style={{background:`${S.blue}18`,borderColor:`${S.blue}33`}}>📚</div>
                      <div>
                        <div className="up-act-text">Enrolled Courses</div>
                        <div className="up-act-sub">{stats.enrolledCourses} active</div>
                      </div>
                      <div style={{marginLeft:'auto',fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:S.blue}}>{stats.enrolledCourses}</div>
                    </div>
                  )}
                  {stats?.completedCourses>0&&(
                    <div className="up-act-row">
                      <div className="up-act-icon" style={{background:`${S.green}18`,borderColor:`${S.green}33`}}>🏆</div>
                      <div>
                        <div className="up-act-text">Completed Courses</div>
                        <div className="up-act-sub">Finished & certified</div>
                      </div>
                      <div style={{marginLeft:'auto',fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:S.green}}>{stats.completedCourses}</div>
                    </div>
                  )}
                  {xpCurrent>0&&(
                    <div className="up-act-row">
                      <div className="up-act-icon" style={{background:`${S.gold}18`,borderColor:`${S.gold}33`}}>⭐</div>
                      <div>
                        <div className="up-act-text">Total EXP</div>
                        <div className="up-act-sub">Level {level}</div>
                      </div>
                      <div style={{marginLeft:'auto',fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:S.gold}}>{xpCurrent.toLocaleString()}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="up-empty">
                  <span className="up-empty-icon">📊</span>
                  <div className="up-empty-text">No activity yet. Start a course!</div>
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="up-panel">
              <div className="up-panel-title">
                <div className="up-panel-icon" style={{background:`${S.gold}18`,border:`1px solid ${S.gold}33`}}>
                  🏆
                </div>
                Achievements
                <span style={{fontSize:11,color:S.muted,fontWeight:500,marginLeft:'auto'}}>
                  {achievements.filter(a=>a.earned).length} earned
                </span>
              </div>
              <div className="up-achieve-grid">
                {achievements.map((a,i)=>(
                  <div key={i} className="up-achieve">
                    <div className="up-achieve-icon" style={{
                      background: a.earned?'linear-gradient(135deg,rgba(251,191,36,.2),rgba(112,85,255,.15))':'rgba(255,255,255,.03)',
                      borderColor: a.earned?'rgba(251,191,36,.4)':S.border,
                      filter: a.earned?'none':'grayscale(1)',
                      opacity: a.earned?1:.4,
                      boxShadow: a.earned?'0 0 18px rgba(251,191,36,.15)':'none',
                    }}>
                      {a.icon}
                    </div>
                    <span style={{fontSize:'9.5px',color:a.earned?S.muted:`${S.muted}55`,textAlign:'center',lineHeight:1.3}}>{a.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ COMPETITION HISTORY ═══ */}
          <div className="up-panel">
            <div className="up-panel-title">
              <div className="up-panel-icon" style={{background:`${S.blue}18`,border:`1px solid ${S.blue}33`}}>
                <FaTrophy style={{color:S.blue,fontSize:14}}/>
              </div>
              Competition History
              <span style={{fontSize:11,color:S.muted,fontWeight:500,marginLeft:'auto'}}>
                {competitionHistory.length} on page {historyPage}
              </span>
            </div>

            {historyLoading ? (
              <div className="up-empty">
                <span className="up-empty-icon">⏳</span>
                <div className="up-empty-text">Loading competition history...</div>
              </div>
            ) : competitionHistory.length > 0 ? (
              <>
                {competitionHistory.map((item, index) => (
                  <div className="up-act-row" key={`${item.competitionId}-${item.clanTeamId}-${index}`}>
                    <div className="up-act-icon" style={{background:`${S.brand}18`,borderColor:`${S.brand}33`}}>🏁</div>
                    <div style={{minWidth:0}}>
                      <div className="up-act-text" style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                        {item.competitionTitle}
                      </div>
                      <div className="up-act-sub">
                        Team: {item.clanTeamName} • Position: #{item.position} • {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{marginLeft:'auto',fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:S.gold}}>
                      +{item.earnedExp}
                    </div>
                  </div>
                ))}

                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:18}}>
                  <button
                    className="up-btn up-btn-ghost"
                    onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                    disabled={historyPage <= 1}
                    style={{opacity: historyPage <= 1 ? 0.5 : 1, cursor: historyPage <= 1 ? 'not-allowed' : 'pointer'}}
                  >
                    Previous
                  </button>
                  <span style={{fontSize:12,color:S.muted,fontWeight:600}}>
                    Page {historyPage} / {historyTotalPages}
                  </span>
                  <button
                    className="up-btn up-btn-ghost"
                    onClick={() => setHistoryPage(prev => Math.min(historyTotalPages, prev + 1))}
                    disabled={historyPage >= historyTotalPages}
                    style={{opacity: historyPage >= historyTotalPages ? 0.5 : 1, cursor: historyPage >= historyTotalPages ? 'not-allowed' : 'pointer'}}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="up-empty">
                <span className="up-empty-icon">🏆</span>
                <div className="up-empty-text">No competition participation history yet.</div>
              </div>
            )}
          </div>

          {/* ═══ MY CLANS ═══ */}
          <div className="up-panel">
            <div className="up-panel-title">
              <div className="up-panel-icon" style={{background:'rgba(112,85,255,.12)',border:`1px solid rgba(112,85,255,.3)`}}>
                <FaUsers style={{color:'#9080ff',fontSize:14}}/>
              </div>
              My Clans
              <span style={{fontSize:11,color:S.muted,fontWeight:500,marginLeft:'auto'}}>{myClans.length} joined</span>
            </div>

            {myClans.length>0 ? (
              <div className="up-clan-grid">
                {myClans.map((clan)=>{
                  const id   = clan.id??clan.clanId;
                  const banner = clan.bannerUrl??clan.coverUrl??clan.coverImageUrl;
                  const logo = clan.clanLogoUrl??clan.logoUrl??clan.logo??clan.avatar;
                  const name = clan.clanName??clan.name;
                  const tag  = clan.clanTag??clan.tag;
                  const role = determineRole(clan);
                  const rs   = roleStyle(role);
                  const members = clan.memberCount??clan.membersCount??null;
                  const points  = clan.contributionPoints??clan.points??null;

                  return (
                    <div key={id} className="up-clan"
                      onClick={()=>navigate(`/clans/${id}`)} role="button" tabIndex={0}
                      onKeyDown={e=>{if(e.key==='Enter')navigate(`/clans/${id}`);}}>
                      {banner
                        ? <div style={{height:70,overflow:'hidden'}}><img src={banner} alt="banner" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
                        : <div className="up-clan-top" style={{background:`linear-gradient(90deg,${S.brandDark},${S.brand},${S.gold})`}}/>
                      }
                      <div className="up-clan-body">
                        <div className="up-clan-logo">
                          {logo
                            ? <img src={logo} alt="logo" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                            : <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:'#9080ff'}}>{tag||(name||'?').charAt(0)}</span>
                          }
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div className="up-clan-name">{name}</div>
                          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                            <span className="up-chip" style={{background:rs.bg,color:rs.color,borderColor:rs.border,fontSize:10}}>{rs.icon} {role}</span>
                            {tag&&<span className="up-chip" style={{background:'rgba(255,255,255,.04)',color:S.muted,borderColor:S.border,fontSize:10}}>{tag}</span>}
                          </div>
                          <div className="up-clan-meta">
                            {typeof members==='number'&&<span>👥 {members}</span>}
                            {typeof points==='number'&&<span>⭐ {points} pts</span>}
                          </div>
                        </div>
                        <button className="up-btn up-btn-ghost" style={{padding:'7px 14px',fontSize:12,flexShrink:0}}
                          onClick={e=>{e.stopPropagation();navigate(`/clans/${id}`);}}>
                          View →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            ) : dp.currentClan ? (
              <div style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:16,overflow:'hidden'}}>
                <div style={{height:4,background:`linear-gradient(90deg,${S.brandDark},${S.brand},${S.gold})`}}/>
                <div style={{padding:20,display:'flex',gap:16,alignItems:'center'}}>
                  <div className="up-clan-logo" style={{width:60,height:60}}>
                    {dp.currentClan.clanLogoUrl
                      ? <img src={dp.currentClan.clanLogoUrl} alt="logo" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      : <span style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900,color:'#9080ff'}}>{dp.currentClan.clanTag||dp.currentClan.clanName?.charAt(0)}</span>
                    }
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:'#fff',marginBottom:8}}>{dp.currentClan.clanName}</div>
                    <div style={{display:'flex',gap:6}}>
                      {dp.currentClan.clanTag&&<span className="up-chip" style={{background:'rgba(255,255,255,.04)',color:S.muted,borderColor:S.border,fontSize:10}}>{dp.currentClan.clanTag}</span>}
                      {dp.currentClan.role&&(()=>{const rs=roleStyle(dp.currentClan.role);return<span className="up-chip" style={{background:rs.bg,color:rs.color,borderColor:rs.border,fontSize:10}}>{rs.icon} {dp.currentClan.role}</span>;})()}
                    </div>
                  </div>
                  <button className="up-btn up-btn-primary" onClick={()=>navigate(`/clans/${dp.currentClan.clanId}`)}>View Clan</button>
                </div>
              </div>

            ) : (
              <div className="up-empty">
                <span className="up-empty-icon">🌌</span>
                <div className="up-empty-text">You're not in a clan yet. Join one to compete & collaborate!</div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default UserProfile;