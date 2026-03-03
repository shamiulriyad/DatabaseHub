import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { FiBook, FiUsers, FiStar, FiDollarSign, FiPlus, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM
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
  orange:    '#fb923c',
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
::selection{background:#5533ee;color:#fff;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#0D1428;}
::-webkit-scrollbar-thumb{background:#5533ee;border-radius:99px;}

.td-root{min-height:100vh;background:linear-gradient(180deg,${S.surface} 0%,${S.pageBg} 100%);font-family:'DM Sans',sans-serif;color:#fff;}
.td-inner{max-width:1160px;margin:0 auto;padding:36px 28px 100px;}

@keyframes td-spin{to{transform:rotate(360deg)}}
@keyframes td-pulse{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes td-float{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes td-live{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}
@keyframes td-ping{0%{transform:scale(1);opacity:.8}80%,100%{transform:scale(2.2);opacity:0}}

.td-inner{animation:td-float .45s ease both;}

/* Loader */
.td-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;gap:18px;}
.td-loader-ring{width:52px;height:52px;border-radius:50%;border:2px solid ${S.border};border-top-color:#9080ff;animation:td-spin .9s linear infinite;}
.td-loader-dots{display:flex;gap:6px;}
.td-loader-dot{width:7px;height:7px;border-radius:50%;background:${S.brand};animation:td-pulse 1.3s ease-in-out infinite;}
.td-loader-dot:nth-child(2){animation-delay:.22s;}
.td-loader-dot:nth-child(3){animation-delay:.44s;}

/* Hero banner */
.td-hero{border-radius:22px;padding:32px 36px;margin-bottom:26px;position:relative;overflow:hidden;background:linear-gradient(135deg,#0D0A2E 0%,#160A3A 50%,#0A1630 100%);border:1px solid rgba(112,85,255,.25);}
.td-hero::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(112,85,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(112,85,255,.05) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;}
.td-hero-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;}
.td-hero-inner{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;}
.td-hero-title{font-family:'Playfair Display',serif;font-size:clamp(22px,3.5vw,32px);font-weight:900;letter-spacing:-.02em;line-height:1.1;margin-bottom:8px;}
.td-hero-title-grad{background:linear-gradient(135deg,${S.brand},${S.gold});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.td-hero-sub{font-size:14px;color:${S.muted};}

/* Buttons */
.td-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 22px;border-radius:999px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .25s;letter-spacing:.02em;}
.td-btn-primary{background:linear-gradient(135deg,${S.brandDark},${S.brand});color:#fff;box-shadow:0 4px 20px rgba(112,85,255,.3);}
.td-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(112,85,255,.45);}
.td-btn-ghost{background:transparent;color:${S.muted};border:1px solid ${S.border};}
.td-btn-ghost:hover{border-color:${S.brand};color:#fff;}
.td-btn-outline{background:rgba(112,85,255,.1);color:#9080ff;border:1px solid rgba(112,85,255,.3);}
.td-btn-outline:hover{background:rgba(112,85,255,.18);border-color:${S.brand};color:#fff;}
.td-btn-sm{padding:7px 16px;font-size:12px;}
.td-btn-white{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(8px);}
.td-btn-white:hover{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.4);}

/* Stat cards */
.td-stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:16px;margin-bottom:26px;}
.td-stat{background:${S.card};border:1px solid ${S.border};border-radius:20px;padding:22px;position:relative;overflow:hidden;transition:all .3s;cursor:default;}
.td-stat:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.4);}
.td-stat-bg{position:absolute;bottom:-4px;right:4px;font-size:56px;opacity:.045;line-height:1;pointer-events:none;}
.td-stat-top{height:3px;margin:-22px -22px 18px;border-radius:20px 20px 0 0;}
.td-stat-icon{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:14px;border:1px solid;}
.td-stat-num{font-family:'Playfair Display',serif;font-size:42px;font-weight:900;line-height:1;letter-spacing:-.03em;}
.td-stat-label{font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${S.muted};margin-top:4px;}
.td-stat-sub{font-size:11px;font-weight:500;margin-top:4px;}

/* Panel */
.td-panel{background:${S.card};border:1px solid ${S.border};border-radius:22px;overflow:hidden;margin-bottom:22px;}
.td-panel-head{display:flex;justify-content:space-between;align-items:center;padding:22px 26px;border-bottom:1px solid ${S.border};}
.td-panel-title{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#fff;display:flex;align-items:center;gap:9px;}
.td-panel-body{padding:22px 26px;}
.td-panel-icon{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;}

/* Table */
.td-table{width:100%;border-collapse:collapse;}
.td-table th{font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${S.muted};padding:8px 14px;text-align:left;border-bottom:1px solid ${S.border};}
.td-table td{padding:13px 14px;font-size:13.5px;color:#d4daf2;border-bottom:1px solid rgba(30,45,85,.5);}
.td-table tr:last-child td{border-bottom:none;}
.td-table tr:hover td{background:rgba(112,85,255,.04);}
.td-table-title{font-weight:700;color:#fff;margin-bottom:2px;}
.td-table-cat{font-size:11px;color:${S.muted};}
.td-rating{display:flex;align-items:center;gap:4px;font-size:13px;font-weight:600;color:${S.gold};}

/* Status chip */
.td-chip{display:inline-flex;align-items:center;padding:3px 11px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:1px solid;}

/* Quick action cards */
.td-quick-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:14px;}
.td-quick{background:${S.card};border:1px solid ${S.border};border-radius:18px;padding:26px 20px;display:flex;flex-direction:column;align-items:center;gap:12px;cursor:pointer;transition:all .3s;text-align:center;}
.td-quick:hover{border-color:rgba(112,85,255,.5);transform:translateY(-4px);box-shadow:0 16px 44px rgba(0,0,0,.45);}
.td-quick-icon{width:58px;height:58px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:22px;border:1px solid;transition:transform .3s;}
.td-quick:hover .td-quick-icon{transform:scale(1.1);}
.td-quick-label{font-size:13px;font-weight:700;color:#fff;}
.td-quick-sub{font-size:11px;color:${S.muted};}

/* Live enrollment toast */
.td-live-dot{width:8px;height:8px;border-radius:50%;background:${S.green};animation:td-live 1.5s ease-in-out infinite;display:inline-block;margin-right:5px;}

/* Empty */
.td-empty{text-align:center;padding:52px 20px;}
.td-empty-icon{font-size:48px;display:block;margin-bottom:16px;filter:drop-shadow(0 0 18px rgba(112,85,255,.35));}
.td-empty-title{font-family:'Playfair Display',serif;font-size:20px;color:#fff;margin-bottom:8px;}
.td-empty-sub{font-size:13px;color:${S.muted};margin-bottom:22px;}

/* SignalR ping badge */
.td-ping-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center;}
.td-ping{position:absolute;top:-2px;right:-2px;width:10px;height:10px;border-radius:50%;}
.td-ping-inner{width:10px;height:10px;border-radius:50%;background:${S.green};}
.td-ping-ring{position:absolute;inset:0;border-radius:50%;background:${S.green};animation:td-ping 1.5s ease-out infinite;}
`;

/* ═══════════════════════════════════════════════════════════════
   STATUS CHIP STYLES
═══════════════════════════════════════════════════════════════ */
const statusStyle = (s) => ({
  Approved: { bg:'rgba(74,222,128,.12)', color:'#86efac', border:'rgba(74,222,128,.3)' },
  Pending:  { bg:'rgba(251,191,36,.12)', color:'#fcd34d', border:'rgba(251,191,36,.3)' },
  Rejected: { bg:'rgba(248,113,113,.12)',color:'#fca5a5', border:'rgba(248,113,113,.3)' },
}[s] || { bg:'rgba(136,150,187,.1)', color:'#8896BB', border:'rgba(136,150,187,.25)' });

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
const TeacherDashboard = () => {
  const navigate = useNavigate();
  const toast    = useToast();

  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [stats,   setStats]   = useState({ totalCourses:0, totalStudents:0, totalReviews:0, averageRating:0, totalEarnings:0 });
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0); // SignalR enrollment counter

  /* ── Fetch ── */
  useEffect(()=>{
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const hdr   = { Authorization:`Bearer ${token}` };

        const profileRes = await axios.get('/api/auth/profile', { headers:hdr });
        setTeacher(profileRes.data.user);

        const coursesRes = await axios.get('/api/courses/created-courses', { headers:hdr });
        setCourses(coursesRes.data.courses||[]);
      } catch(error) {
        console.error('Dashboard fetch error:', error);
        const user = JSON.parse(localStorage.getItem('user')||'{}');
        setTeacher(user);
        toast({ title:'Note', description:'Using cached data.', status:'info', duration:3000 });
      } finally { setLoading(false); }
    };
    fetchData();
  },[toast]);

  /* ── Recompute stats when courses change ── */
  useEffect(()=>{
    const totalStudents = courses.reduce((s,c)=>s+(c.enrollmentCount??c.totalEnrolled??c.EnrollmentCount??0),0);
    const totalReviews  = courses.reduce((s,c)=>s+(c.totalReviews??c.TotalReviews??0),0);
    const avgRating     = courses.length>0
      ? parseFloat((courses.reduce((s,c)=>s+(c.averageRating??c.AverageRating??0),0)/courses.length).toFixed(2))
      : 0;
    setStats(p=>({...p, totalCourses:courses.length, totalStudents, totalReviews, averageRating:avgRating }));
  },[courses]);

  /* ── SignalR ── */
  useEffect(()=>{
    if (!teacher) return;
    let connection;
    const start = async () => {
      try {
        const base   = process.env.REACT_APP_API_URL||'';
        connection   = new signalR.HubConnectionBuilder()
          .withUrl(base+'/hubs/courses',{
            skipNegotiation:true,
            transport:signalR.HttpTransportType.WebSockets,
            accessTokenFactory:()=>localStorage.getItem('token')||'',
          })
          .withAutomaticReconnect()
          .build();

        connection.on('StudentEnrolled',(enrollment)=>{
          try {
            const cid = enrollment?.courseId||enrollment?.CourseId;
            if (!cid) return;
            setCourses(prev=>prev.map(c=>
              String(c.id)===String(cid)
                ? {...c, enrollmentCount:(c.enrollmentCount??c.totalEnrolled??c.EnrollmentCount??0)+1}
                : c
            ));
            setLiveCount(n=>n+1);
            toast({ title:'🎉 New Enrollment', description:`A student just enrolled!`, status:'success', duration:4000 });
          } catch(e){ console.warn('StudentEnrolled handler error',e); }
        });

        await connection.start();
        await connection.invoke('JoinUserGroup',`user-${teacher.id}`);
        for (const c of courses) {
          try { await connection.invoke('JoinCourseGroup',`course-${c.id}`); } catch {}
        }
      } catch(err){ console.warn('SignalR failed',err); }
    };
    start();
    return ()=>{ if(connection) connection.stop().catch(()=>{}); };
  },[teacher, courses, toast]);

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="td-root">
        <div className="td-inner">
          <div className="td-loader">
            <div className="td-loader-ring"/>
            <div className="td-loader-dots">
              <div className="td-loader-dot"/><div className="td-loader-dot"/><div className="td-loader-dot"/>
            </div>
            <p style={{color:S.muted,fontSize:13}}>Loading your dashboard…</p>
          </div>
        </div>
      </div>
    </>
  );

  const firstName = teacher?.firstName||teacher?.username||'Teacher';
  const now       = new Date();
  const hour      = now.getHours();
  const greeting  = hour<12?'🌅 Good morning':hour<18?'☀️ Good afternoon':'🌙 Good evening';

  const statCards = [
    { icon:'📚', label:'Courses',       value:stats.totalCourses,   sub:'Created',          color:S.blue,   bar:'linear-gradient(90deg,#0EA5E9,#38BDF8)' },
    { icon:'👥', label:'Students',      value:stats.totalStudents,  sub:'Total enrolled',   color:S.green,  bar:'linear-gradient(90deg,#16A34A,#4ADE80)' },
    { icon:'⭐', label:'Avg Rating',    value:stats.averageRating,  sub:'Across all courses',color:S.gold,  bar:'linear-gradient(90deg,#D97706,#FBBF24)' },
    { icon:'💰', label:'Earnings',      value:`$${stats.totalEarnings}`,sub:'All time',     color:S.brand,  bar:'linear-gradient(90deg,#5533EE,#7055FF)' },
    { icon:'💬', label:'Reviews',       value:stats.totalReviews,   sub:'Total received',   color:S.pink,   bar:'linear-gradient(90deg,#DB2777,#F472B6)' },
  ];

  const quickActions = [
    { icon:<FiPlus/>,       label:'Create Course', sub:'Start building',    color:S.brand,  bg:'rgba(112,85,255,.12)', border:'rgba(112,85,255,.25)', path:'/teacher/create-course' },
    { icon:<FiBook/>,       label:'My Courses',    sub:'Manage content',    color:S.blue,   bg:'rgba(56,189,248,.12)', border:'rgba(56,189,248,.25)', path:'/teacher/manage-courses' },
    { icon:<FiStar/>,       label:'Reviews',       sub:'Student feedback',  color:S.gold,   bg:'rgba(251,191,36,.12)', border:'rgba(251,191,36,.28)', path:'/teacher/reviews' },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="td-root">
        <div className="td-inner">

          {/* ═══ HERO ═══ */}
          <div className="td-hero">
            {/* Nebula orbs */}
            <div className="td-hero-orb" style={{width:300,height:120,background:'radial-gradient(ellipse,rgba(112,85,255,.15) 0%,transparent 70%)',top:'50%',left:'40%',transform:'translate(-50%,-50%)',borderRadius:'50%'}}/>
            <div className="td-hero-orb" style={{width:180,height:80,background:'radial-gradient(ellipse,rgba(251,191,36,.08) 0%,transparent 70%)',top:'20%',right:'10%',borderRadius:'50%'}}/>

            <div className="td-hero-inner">
              <div>
                <p style={{fontSize:13,color:S.muted,marginBottom:8}}>{greeting}</p>
                <h1 className="td-hero-title">
                  Welcome back,{' '}
                  <span className="td-hero-title-grad">{firstName}! 👋</span>
                </h1>
                <p className="td-hero-sub">
                  Manage your courses and track student progress in real-time.
                  {liveCount>0 && (
                    <span style={{marginLeft:10,color:S.green,fontWeight:600}}>
                      <span className="td-live-dot"/>+{liveCount} new enrollment{liveCount!==1?'s':''} today!
                    </span>
                  )}
                </p>
              </div>
              <button className="td-btn td-btn-white" onClick={()=>navigate('/teacher/create-course')}>
                <FiPlus style={{fontSize:14}}/> Create Course
              </button>
            </div>
          </div>

          {/* ═══ STAT CARDS ═══ */}
          <div className="td-stat-grid">
            {statCards.map((s,i)=>(
              <div key={i} className="td-stat">
                <div className="td-stat-top" style={{background:s.bar}}/>
                <div className="td-stat-bg">{s.icon}</div>
                <div className="td-stat-icon" style={{background:`${s.color}18`,borderColor:`${s.color}30`}}>
                  <span style={{fontSize:16}}>{s.icon}</span>
                </div>
                <div className="td-stat-num" style={{color:s.color}}>{s.value}</div>
                <div className="td-stat-label">{s.label}</div>
                <div className="td-stat-sub" style={{color:s.color}}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ═══ COURSES TABLE ═══ */}
          <div className="td-panel">
            <div className="td-panel-head">
              <div className="td-panel-title">
                <div className="td-panel-icon" style={{background:'rgba(56,189,248,.1)',border:'1px solid rgba(56,189,248,.22)'}}>
                  <FiBook style={{color:S.blue,fontSize:14}}/>
                </div>
                Your Courses
                {/* SignalR live indicator */}
                <div className="td-ping-wrap" style={{marginLeft:4}}>
                  <div className="td-ping-ring"/>
                  <div className="td-ping-inner"/>
                </div>
              </div>
              <button className="td-btn td-btn-outline td-btn-sm" onClick={()=>navigate('/teacher/manage-courses')}>
                Manage All →
              </button>
            </div>
            <div className="td-panel-body">
              {courses.length===0 ? (
                <div className="td-empty">
                  <span className="td-empty-icon">📚</span>
                  <div className="td-empty-title">No courses yet</div>
                  <div className="td-empty-sub">Create your first course and start teaching the world.</div>
                  <button className="td-btn td-btn-primary" onClick={()=>navigate('/teacher/create-course')}>
                    <FiPlus style={{fontSize:13}}/> Create First Course
                  </button>
                </div>
              ) : (
                <div style={{overflowX:'auto'}}>
                  <table className="td-table">
                    <thead>
                      <tr>
                        <th>Course Title</th>
                        <th>Status</th>
                        <th>Students</th>
                        <th>Rating</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.slice(0,5).map((course)=>{
                        const enrolled = course.enrollmentCount??course.totalEnrolled??course.EnrollmentCount??0;
                        const rating   = course.averageRating??course.AverageRating??0;
                        const ss       = statusStyle(course.status);
                        return (
                          <tr key={course.id}>
                            <td>
                              <div className="td-table-title">{course.title}</div>
                              {course.category && <div className="td-table-cat">{course.category}</div>}
                            </td>
                            <td>
                              <span className="td-chip" style={{background:ss.bg,color:ss.color,borderColor:ss.border}}>
                                {course.status||'Unknown'}
                              </span>
                            </td>
                            <td>
                              <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:S.green}}>{enrolled}</span>
                            </td>
                            <td>
                              <div className="td-rating">
                                ★ <span>{Number(rating).toFixed(1)}</span>
                              </div>
                            </td>
                            <td>
                              <button className="td-btn td-btn-ghost td-btn-sm" onClick={()=>navigate(`/courses/${course.id}/edit`)}>
                                Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ═══ QUICK ACTIONS ═══ */}
          <div className="td-panel">
            <div className="td-panel-head">
              <div className="td-panel-title">
                <div className="td-panel-icon" style={{background:'rgba(112,85,255,.1)',border:'1px solid rgba(112,85,255,.22)'}}>
                  ⚡
                </div>
                Quick Actions
              </div>
            </div>
            <div className="td-panel-body">
              <div className="td-quick-grid">
                {quickActions.map((q,i)=>(
                  <div key={i} className="td-quick" onClick={()=>navigate(q.path)}>
                    <div className="td-quick-icon" style={{background:q.bg,borderColor:q.border}}>
                      <span style={{color:q.color,fontSize:22}}>{q.icon}</span>
                    </div>
                    <div className="td-quick-label">{q.label}</div>
                    <div className="td-quick-sub">{q.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default TeacherDashboard;