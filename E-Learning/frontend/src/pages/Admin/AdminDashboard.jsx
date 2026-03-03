import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import {
  FiUsers, FiBook, FiDollarSign, FiTrendingUp, FiUserCheck,
  FiAlertCircle, FiCheckCircle, FiClock, FiBarChart2, FiActivity,
} from 'react-icons/fi';
import { FaUniversity } from 'react-icons/fa';
import api from '../../services/api';

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
  teal:      '#2dd4bf',
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
::selection{background:#5533ee;color:#fff;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#0D1428;}
::-webkit-scrollbar-thumb{background:#5533ee;border-radius:99px;}

.ad-root{min-height:100vh;background:linear-gradient(180deg,${S.surface} 0%,${S.pageBg} 100%);font-family:'DM Sans',sans-serif;color:#fff;}
.ad-inner{max-width:1200px;margin:0 auto;padding:36px 28px 100px;}

@keyframes ad-spin{to{transform:rotate(360deg)}}
@keyframes ad-pulse{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes ad-float{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes ad-live{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}
@keyframes ad-glow{0%,100%{box-shadow:0 0 20px rgba(112,85,255,.2)}50%{box-shadow:0 0 40px rgba(112,85,255,.45)}}

.ad-inner{animation:ad-float .45s ease both;}

/* Loader */
.ad-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;gap:18px;}
.ad-loader-ring{width:52px;height:52px;border-radius:50%;border:2px solid ${S.border};border-top-color:#9080ff;animation:ad-spin .9s linear infinite;}
.ad-loader-dots{display:flex;gap:6px;}
.ad-loader-dot{width:7px;height:7px;border-radius:50%;background:${S.brand};animation:ad-pulse 1.3s ease-in-out infinite;}
.ad-loader-dot:nth-child(2){animation-delay:.22s;}
.ad-loader-dot:nth-child(3){animation-delay:.44s;}

/* Header */
.ad-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:32px;}
.ad-title{font-family:'Playfair Display',serif;font-size:clamp(24px,4vw,34px);font-weight:900;letter-spacing:-.02em;line-height:1.05;margin-bottom:6px;}
.ad-title-grad{background:linear-gradient(135deg,${S.brand},${S.gold});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.ad-subtitle{font-size:13.5px;color:${S.muted};}

/* Buttons */
.ad-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 20px;border-radius:999px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .25s;letter-spacing:.02em;}
.ad-btn-primary{background:linear-gradient(135deg,${S.brandDark},${S.brand});color:#fff;box-shadow:0 4px 20px rgba(112,85,255,.3);}
.ad-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(112,85,255,.45);}
.ad-btn-ghost{background:transparent;color:${S.muted};border:1px solid ${S.border};}
.ad-btn-ghost:hover{border-color:${S.brand};color:#fff;}
.ad-btn-outline{background:rgba(112,85,255,.1);color:#9080ff;border:1px solid rgba(112,85,255,.3);}
.ad-btn-outline:hover{background:rgba(112,85,255,.18);border-color:${S.brand};color:#fff;}
.ad-btn-sm{padding:6px 14px;font-size:12px;}

/* Stat cards - primary */
.ad-stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:16px;margin-bottom:24px;}
.ad-stat{background:${S.card};border:1px solid ${S.border};border-radius:20px;padding:22px;position:relative;overflow:hidden;transition:all .3s;cursor:default;}
.ad-stat:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.4);}
.ad-stat-bg{position:absolute;bottom:-4px;right:4px;font-size:56px;opacity:.04;line-height:1;pointer-events:none;}
.ad-stat-top{height:3px;margin:-22px -22px 18px;border-radius:20px 20px 0 0;}
.ad-stat-icon{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:14px;border:1px solid;flex-shrink:0;}
.ad-stat-num{font-family:'Playfair Display',serif;font-size:40px;font-weight:900;line-height:1;letter-spacing:-.03em;}
.ad-stat-label{font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${S.muted};margin-top:4px;}
.ad-stat-sub{font-size:11px;font-weight:500;margin-top:4px;}
.ad-stat-arrow{font-size:10px;margin-right:3px;}

/* Secondary stats */
.ad-sec-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:24px;}
.ad-sec{background:${S.card};border:1px solid ${S.border};border-radius:16px;padding:18px 20px;display:flex;align-items:center;gap:14px;transition:all .3s;}
.ad-sec:hover{border-color:rgba(112,85,255,.35);transform:translateY(-2px);}
.ad-sec-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid;}
.ad-sec-label{font-size:11px;color:${S.muted};font-weight:500;}
.ad-sec-num{font-family:'Playfair Display',serif;font-size:26px;font-weight:900;line-height:1.1;}

/* Main grid */
.ad-main-grid{display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:24px;}
@media(max-width:900px){.ad-main-grid{grid-template-columns:1fr;}}

/* Panel */
.ad-panel{background:${S.card};border:1px solid ${S.border};border-radius:22px;overflow:hidden;margin-bottom:22px;}
.ad-panel-head{display:flex;justify-content:space-between;align-items:center;padding:22px 26px;border-bottom:1px solid ${S.border};}
.ad-panel-title{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#fff;display:flex;align-items:center;gap:9px;}
.ad-panel-body{padding:22px 26px;}
.ad-panel-icon{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;}

/* Table */
.ad-table{width:100%;border-collapse:collapse;}
.ad-table th{font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${S.muted};padding:8px 12px;text-align:left;border-bottom:1px solid ${S.border};}
.ad-table td{padding:12px;font-size:13px;color:#d4daf2;border-bottom:1px solid rgba(30,45,85,.5);}
.ad-table tr:last-child td{border-bottom:none;}
.ad-table tr:hover td{background:rgba(112,85,255,.04);}
.ad-table-name{font-weight:600;color:#fff;}
.ad-table-email{font-size:12px;color:${S.muted};}

/* Activity item */
.ad-act{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid rgba(30,45,85,.5);}
.ad-act:last-child{border-bottom:none;padding-bottom:0;}
.ad-act-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;border:1px solid;}
.ad-act-action{font-size:13px;font-weight:500;color:#fff;line-height:1.4;}
.ad-act-meta{font-size:11px;color:${S.muted};margin-top:2px;}

/* Top courses */
.ad-course-row{margin-bottom:18px;}
.ad-course-row:last-child{margin-bottom:0;}
.ad-course-name{font-weight:600;color:#fff;font-size:13.5px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ad-course-meta{font-size:12px;color:${S.muted};margin-bottom:8px;}
.ad-prog-track{height:5px;border-radius:999px;background:${S.border};overflow:hidden;}
.ad-prog-fill{height:100%;border-radius:999px;background:linear-gradient(to right,${S.brand},${S.gold});}
.ad-rank-badge{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;font-size:11px;font-weight:800;background:rgba(74,222,128,.12);color:${S.green};border:1px solid rgba(74,222,128,.25);}

/* Quick actions */
.ad-quick-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;}
.ad-quick{background:${S.card};border:1px solid ${S.border};border-radius:18px;padding:24px;display:flex;flex-direction:column;align-items:center;gap:12px;cursor:pointer;transition:all .3s;text-align:center;}
.ad-quick:hover{border-color:rgba(112,85,255,.5);transform:translateY(-4px);box-shadow:0 16px 44px rgba(0,0,0,.45);}
.ad-quick-icon{width:58px;height:58px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:24px;border:1px solid;transition:all .3s;}
.ad-quick:hover .ad-quick-icon{transform:scale(1.08);}
.ad-quick-label{font-size:13px;font-weight:600;color:#fff;}

/* Chip */
.ad-chip{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:1px solid;}

/* Divider */
.ad-hr{height:1px;background:${S.border};}

/* Empty */
.ad-empty{text-align:center;padding:40px 20px;color:${S.muted};font-size:13px;}

/* Modal */
.ad-modal-overlay{position:fixed;inset:0;background:rgba(5,7,26,.8);backdrop-filter:blur(8px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;}
.ad-modal{background:${S.surface};border:1px solid ${S.border};border-radius:24px;width:100%;max-width:700px;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,.6);}
.ad-modal-head{display:flex;justify-content:space-between;align-items:center;padding:24px 28px;border-bottom:1px solid ${S.border};}
.ad-modal-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#fff;}
.ad-modal-body{padding:20px 28px;overflow-y:auto;flex:1;}
.ad-modal-foot{padding:16px 28px;border-top:1px solid ${S.border};display:flex;justify-content:flex-end;}
.ad-modal-close{width:32px;height:32px;border-radius:9px;background:rgba(255,255,255,.06);border:1px solid ${S.border};color:${S.muted};cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;transition:all .2s;}
.ad-modal-close:hover{border-color:rgba(248,113,113,.4);color:${S.red};}

/* Refresh pulse */
.ad-refresh{display:inline-flex;align-items:center;gap:6px;}
.ad-refresh-dot{width:7px;height:7px;border-radius:50%;background:${S.green};animation:ad-live 2s ease-in-out infinite;display:inline-block;}
`;

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const navigate  = useNavigate();
  const toast     = useToast();

  const [stats, setStats] = useState({
    totalUsers:0, totalTeachers:0, totalStudents:0, totalCourses:0,
    totalDepartments:0, pendingTeachers:0, activeCourses:0,
    totalRevenue:0, activeUsers:0, newUsersThisMonth:0, courseCompletionRate:0,
  });
  const [recentActivities, setRecentActivities]  = useState([]);
  const [pendingRequests,  setPendingRequests]   = useState([]);
  const [topCourses,       setTopCourses]        = useState([]);
  const [departments,      setDepartments]       = useState([]);
  const [deptOpen,         setDeptOpen]          = useState(false);
  const [loading,          setLoading]           = useState(true);

  useEffect(()=>{
    fetchDashboardData();
    const iv = setInterval(()=>fetchDashboardData(true), 15000);
    return ()=>clearInterval(iv);
  },[]);

  const fetchDashboardData = async (silent=false) => {
    try {
      if (!silent) setLoading(true);
      const statsRes = await api.get('/admin/stats');
      if (statsRes.data?.success && statsRes.data?.stats) {
        const a = statsRes.data.stats;
        setStats({
          totalUsers:          a.totalUsers          ?? a.TotalUsers          ?? 0,
          totalTeachers:       a.totalTeachers       ?? a.TotalTeachers       ?? 0,
          totalStudents:       a.totalStudents       ?? a.TotalStudents       ?? 0,
          totalCourses:        a.totalCourses        ?? a.TotalCourses        ?? 0,
          totalDepartments:    a.totalDepartments    ?? a.TotalDepartments    ?? 0,
          pendingTeachers:     a.pendingTeachers     ?? a.PendingTeachers     ?? 0,
          activeCourses:       a.activeCourses       ?? a.ActiveCourses       ?? 0,
          totalRevenue:        a.totalRevenue        ?? a.TotalRevenue        ?? 0,
          activeUsers:         a.activeUsers         ?? a.ActiveUsers         ?? 0,
          newUsersThisMonth:   a.newUsersThisMonth   ?? a.NewUsersThisMonth   ?? 0,
          courseCompletionRate:a.courseCompletionRate?? a.CourseCompletionRate ?? 0,
        });
      } else {
        toast({ title:'Warning', description:'Stats not in expected format', status:'warning', duration:3000 });
      }

      try {
        const tr = await api.get('/admin/teacher-approvals/pending?page=1&pageSize=5');
        if (tr.data?.success) setPendingRequests(tr.data.data||[]);
      } catch {}

      try {
        const ar = await api.get('/admin/activities?page=1&pageSize=5');
        if (ar.data?.success) {
          setRecentActivities((ar.data.activities||[]).map(a=>({ action:a.action||a.Action, user:a.user||a.User, time:a.time||a.Time })));
        } else {
          setRecentActivities([
            { action:'New user registered',  user:'John Doe',     time:'5 mins ago'  },
            { action:'Course published',     user:'Teacher Jane', time:'1 hour ago'  },
            { action:'Payment received',     user:'Student Mike', time:'2 hours ago' },
          ]);
        }
      } catch {
        setRecentActivities([
          { action:'New user registered',  user:'John Doe',     time:'5 mins ago'  },
          { action:'Course published',     user:'Teacher Jane', time:'1 hour ago'  },
          { action:'Payment received',     user:'Student Mike', time:'2 hours ago' },
        ]);
      }

      try {
        const cr = await api.get('/admin/courses/top?count=5');
        if (cr.data?.success) {
          setTopCourses((cr.data.topCourses||[]).map(tc=>{
            const c = tc.course||tc.Course||{};
            return { title:c.title||c.Title||'Untitled', students:tc.enrollmentCount||tc.EnrollmentCount||0, rating:tc.averageRating||tc.AverageRating||0 };
          }));
        }
      } catch {}

    } catch (error) {
      toast({ title:'Error Fetching Stats', description:error.response?.data?.message||error.message, status:'error', duration:5000 });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const openDeptModal = async () => {
    try {
      const res = await api.get('/departments', { params:{ page:1, pageSize:200 } });
      const list = res.data?.departments ?? res.data?.data ?? res.data ?? [];
      setDepartments(Array.isArray(list)?list:[]);
    } catch { setDepartments([]); }
    setDeptOpen(true);
  };

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="ad-root">
        <div className="ad-inner">
          <div className="ad-loader">
            <div className="ad-loader-ring"/>
            <div className="ad-loader-dots">
              <div className="ad-loader-dot"/><div className="ad-loader-dot"/><div className="ad-loader-dot"/>
            </div>
            <p style={{color:S.muted,fontSize:13}}>Loading admin dashboard…</p>
          </div>
        </div>
      </div>
    </>
  );

  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});

  const primaryStats = [
    { icon:'👥', label:'Total Users',        value:stats.totalUsers,       sub:`+${stats.newUsersThisMonth} this month`, arrow:true, color:S.blue,   barColor:'linear-gradient(90deg,#0EA5E9,#38BDF8)' },
    { icon:'🏫', label:'Departments',        value:stats.totalDepartments, sub:'View all',  click:openDeptModal, color:S.teal,   barColor:'linear-gradient(90deg,#0D9488,#2DD4BF)' },
    { icon:'📚', label:'Total Courses',      value:stats.totalCourses,     sub:`${stats.activeCourses} active`, arrow:true, color:S.green,  barColor:'linear-gradient(90deg,#16A34A,#4ADE80)' },
    { icon:'⏳', label:'Pending Teachers',   value:stats.pendingTeachers,  sub:'Needs review', color:S.orange, barColor:'linear-gradient(90deg,#EA580C,#FB923C)' },
    { icon:'💰', label:'Total Revenue',      value:`$${stats.totalRevenue}`,sub:'+12% increase', arrow:true, color:S.brand,  barColor:'linear-gradient(90deg,#5533EE,#7055FF)' },
  ];

  const secondaryStats = [
    { icon:<FiUserCheck/>, label:'Teachers',        value:stats.totalTeachers,        color:S.green  },
    { icon:<FiActivity/>,  label:'Active Users',    value:stats.activeUsers,          color:S.blue   },
    { icon:<FiCheckCircle/>,label:'Completion Rate',value:`${stats.courseCompletionRate}%`, color:S.teal },
  ];

  const quickActions = [
    { icon:<FiUserCheck/>, label:'Approve Teachers', color:S.brand,  bg:'rgba(112,85,255,.12)', border:'rgba(112,85,255,.25)', path:'/admin/manage-teachers' },
    { icon:<FiUsers/>,     label:'Manage Users',     color:S.blue,   bg:'rgba(56,189,248,.12)', border:'rgba(56,189,248,.25)', path:'/admin/users' },
    { icon:<FiBook/>,      label:'Manage Courses',   color:S.green,  bg:'rgba(74,222,128,.12)', border:'rgba(74,222,128,.25)', path:'/admin/courses' },
    { icon:<FiBarChart2/>, label:'View Reports',     color:S.orange, bg:'rgba(251,146,60,.12)', border:'rgba(251,146,60,.25)', path:'/admin/settings' },
  ];

  const activityColors = [S.green, S.brand, S.gold, S.blue, S.pink];

  return (
    <>
      <style>{CSS}</style>
      <div className="ad-root">
        <div className="ad-inner">

          {/* ═══ HEADER ═══ */}
          <div className="ad-header">
            <div>
              <p style={{fontSize:13,color:S.muted,marginBottom:8}}>⚙️ Admin Panel · {dateStr}</p>
              <h1 className="ad-title">
                Platform <span className="ad-title-grad">Overview</span>
              </h1>
              <p className="ad-subtitle">Real-time stats, pending actions & platform health.</p>
            </div>
            <button className="ad-btn ad-btn-primary" onClick={()=>fetchDashboardData()}>
              <span className="ad-refresh"><span className="ad-refresh-dot"/>Live</span> Refresh
            </button>
          </div>

          {/* ═══ PRIMARY STATS ═══ */}
          <div className="ad-stat-grid">
            {primaryStats.map((s,i)=>(
              <div key={i} className="ad-stat" onClick={s.click||undefined} style={{cursor:s.click?'pointer':undefined}}>
                <div className="ad-stat-top" style={{background:s.barColor}}/>
                <div className="ad-stat-bg">{s.icon}</div>
                <div className="ad-stat-icon" style={{background:`${s.color}18`,borderColor:`${s.color}30`}}>
                  <span style={{fontSize:16}}>{s.icon}</span>
                </div>
                <div className="ad-stat-num" style={{color:s.color}}>{s.value}</div>
                <div className="ad-stat-label">{s.label}</div>
                <div className="ad-stat-sub" style={{color:s.color}}>
                  {s.arrow && <span className="ad-stat-arrow">↑</span>}{s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* ═══ SECONDARY STATS ═══ */}
          <div className="ad-sec-grid">
            {secondaryStats.map((s,i)=>(
              <div key={i} className="ad-sec">
                <div className="ad-sec-icon" style={{background:`${s.color}15`,borderColor:`${s.color}28`}}>
                  <span style={{color:s.color,fontSize:16}}>{s.icon}</span>
                </div>
                <div>
                  <div className="ad-sec-label">{s.label}</div>
                  <div className="ad-sec-num" style={{color:s.color}}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ═══ MAIN GRID ═══ */}
          <div className="ad-main-grid">

            {/* Pending Teachers */}
            <div className="ad-panel">
              <div className="ad-panel-head">
                <div className="ad-panel-title">
                  <div className="ad-panel-icon" style={{background:'rgba(251,146,60,.12)',border:'1px solid rgba(251,146,60,.25)'}}>
                    <FiClock style={{color:S.orange,fontSize:14}}/>
                  </div>
                  Pending Teacher Requests
                  <span className="ad-chip" style={{background:'rgba(251,146,60,.15)',color:S.orange,borderColor:'rgba(251,146,60,.3)',fontSize:10}}>
                    {stats.pendingTeachers}
                  </span>
                </div>
                <button className="ad-btn ad-btn-outline ad-btn-sm" onClick={()=>navigate('/admin/manage-teachers')}>
                  View All →
                </button>
              </div>
              <div className="ad-panel-body">
                {pendingRequests.length===0 ? (
                  <div className="ad-empty">🎉 No pending requests</div>
                ) : (
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Applied</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRequests.slice(0,5).map((r,i)=>(
                        <tr key={r.id||i}>
                          <td className="ad-table-name">{r.firstName} {r.lastName}</td>
                          <td className="ad-table-email">{r.email||r.userEmail||r.Email||'—'}</td>
                          <td style={{fontSize:12,color:S.muted}}>
                            {(r.teacherRequestDate||r.createdAt||r.applicationDate)
                              ? new Date(r.teacherRequestDate||r.createdAt||r.applicationDate).toLocaleDateString()
                              : '—'}
                          </td>
                          <td>
                            <button className="ad-btn ad-btn-outline ad-btn-sm" onClick={()=>navigate('/admin/manage-teachers')}>
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="ad-panel">
              <div className="ad-panel-head">
                <div className="ad-panel-title">
                  <div className="ad-panel-icon" style={{background:'rgba(56,189,248,.12)',border:'1px solid rgba(56,189,248,.25)'}}>
                    <FiActivity style={{color:S.blue,fontSize:14}}/>
                  </div>
                  Activity
                </div>
              </div>
              <div className="ad-panel-body">
                {recentActivities.map((a,i)=>(
                  <div key={i} className="ad-act">
                    <div className="ad-act-icon" style={{background:`${activityColors[i%activityColors.length]}18`,borderColor:`${activityColors[i%activityColors.length]}30`}}>
                      <span style={{fontSize:13}}>{i===0?'✅':i===1?'📚':i===2?'💳':i===3?'💬':'⭐'}</span>
                    </div>
                    <div>
                      <div className="ad-act-action">{a.action}</div>
                      <div className="ad-act-meta">{a.user} · {a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ TOP COURSES ═══ */}
          <div className="ad-panel" style={{marginBottom:22}}>
            <div className="ad-panel-head">
              <div className="ad-panel-title">
                <div className="ad-panel-icon" style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.22)'}}>
                  <FiTrendingUp style={{color:S.green,fontSize:14}}/>
                </div>
                Top Performing Courses
              </div>
              <button className="ad-btn ad-btn-ghost ad-btn-sm" onClick={()=>navigate('/admin/courses')}>
                View All →
              </button>
            </div>
            <div className="ad-panel-body">
              {topCourses.length===0 ? (
                <div className="ad-empty">No course data yet.</div>
              ) : (
                topCourses.map((c,i)=>(
                  <div key={i} className="ad-course-row">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                      <div style={{flex:1,minWidth:0,paddingRight:12}}>
                        <div className="ad-course-name">{c.title}</div>
                        <div className="ad-course-meta">{c.students} students · {Number(c.rating||0).toFixed(1)} ⭐</div>
                      </div>
                      <span className="ad-rank-badge">#{i+1}</span>
                    </div>
                    <div className="ad-prog-track">
                      <div className="ad-prog-fill" style={{width:`${Math.min(100,Math.round((c.students/300)*100))}%`}}/>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ═══ QUICK ACTIONS ═══ */}
          <div className="ad-panel">
            <div className="ad-panel-head">
              <div className="ad-panel-title">
                <div className="ad-panel-icon" style={{background:'rgba(112,85,255,.1)',border:`1px solid rgba(112,85,255,.22)`}}>
                  ⚡
                </div>
                Quick Actions
              </div>
            </div>
            <div className="ad-panel-body">
              <div className="ad-quick-grid">
                {quickActions.map((q,i)=>(
                  <div key={i} className="ad-quick" onClick={()=>navigate(q.path)}>
                    <div className="ad-quick-icon" style={{background:q.bg,borderColor:q.border}}>
                      <span style={{color:q.color,fontSize:22}}>{q.icon}</span>
                    </div>
                    <div className="ad-quick-label">{q.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ═══ DEPARTMENTS MODAL ═══ */}
      {deptOpen && (
        <div className="ad-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setDeptOpen(false);}}>
          <div className="ad-modal">
            <div className="ad-modal-head">
              <div className="ad-modal-title">🏫 All Departments</div>
              <button className="ad-modal-close" onClick={()=>setDeptOpen(false)}>×</button>
            </div>
            <div className="ad-modal-body">
              {departments.length===0 ? (
                <div className="ad-empty">No departments found.</div>
              ) : (
                <table className="ad-table" style={{width:'100%'}}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>University</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((d,i)=>(
                      <tr key={d.id??d.departmentId??d.code??i}>
                        <td className="ad-table-name">{d.name??d.Name}</td>
                        <td>
                          <span className="ad-chip" style={{background:'rgba(112,85,255,.1)',color:'#9080ff',borderColor:'rgba(112,85,255,.25)'}}>
                            {d.code??d.Code??'—'}
                          </span>
                        </td>
                        <td style={{color:S.muted,fontSize:13}}>{d.universityName??d.university?.name??d.UniversityName??'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="ad-modal-foot">
              <button className="ad-btn ad-btn-ghost" onClick={()=>setDeptOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;