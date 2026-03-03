import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import competitionService from '../../services/competitionService';
import { enrollmentService } from '../../services/enrollmentService';
import { FiBook, FiArrowRight } from 'react-icons/fi';
import { FaTrophy, FaMedal, FaFire, FaStar, FaChartLine, FaUsers } from 'react-icons/fa';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — matches HomePage / Sidebar exactly
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

.sd-root{min-height:100vh;background:linear-gradient(180deg,${S.surface} 0%,${S.pageBg} 100%);font-family:'DM Sans',sans-serif;color:#fff;}
.sd-inner{max-width:1100px;margin:0 auto;padding:36px 28px 100px;}

/* Animations */
@keyframes sd-spin{to{transform:rotate(360deg)}}
@keyframes sd-pulse{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes sd-float{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes sd-live{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(1.25)}}

.sd-inner{animation:sd-float .45s ease both;}

/* Loader */
.sd-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;gap:18px;}
.sd-loader-ring{width:52px;height:52px;border-radius:50%;border:2px solid ${S.border};border-top-color:#9080ff;animation:sd-spin .9s linear infinite;}
.sd-loader-dots{display:flex;gap:6px;}
.sd-loader-dot{width:7px;height:7px;border-radius:50%;background:${S.brand};animation:sd-pulse 1.3s ease-in-out infinite;}
.sd-loader-dot:nth-child(2){animation-delay:.22s;}
.sd-loader-dot:nth-child(3){animation-delay:.44s;}

/* Header */
.sd-header{margin-bottom:32px;}
.sd-greeting{font-size:13px;color:${S.muted};margin-bottom:8px;}
.sd-title{font-family:'Playfair Display',serif;font-size:clamp(26px,4vw,36px);font-weight:900;letter-spacing:-.02em;line-height:1.05;margin-bottom:8px;}
.sd-title-grad{background:linear-gradient(135deg,${S.brand},${S.gold});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.sd-subtitle{font-size:14px;color:${S.muted};}

/* Stat cards */
.sd-stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:28px;}
.sd-stat{background:${S.card};border:1px solid ${S.border};border-radius:20px;padding:24px;position:relative;overflow:hidden;transition:all .3s;cursor:default;}
.sd-stat:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.4);}
.sd-stat-bg{position:absolute;bottom:-4px;right:4px;font-size:58px;opacity:.045;line-height:1;pointer-events:none;}
.sd-stat-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:16px;border:1px solid;}
.sd-stat-num{font-family:'Playfair Display',serif;font-size:44px;font-weight:900;line-height:1;letter-spacing:-.03em;}
.sd-stat-label{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${S.muted};margin-top:4px;}
.sd-stat-sub{font-size:11px;font-weight:500;margin-top:4px;}

/* Section header */
.sd-section{margin-bottom:28px;}
.sd-section-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:20px;}
.sd-section-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#fff;}
.sd-section-sub{font-size:13px;color:${S.muted};margin-top:3px;}

/* Buttons */
.sd-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 20px;border-radius:999px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .25s;letter-spacing:.02em;}
.sd-btn-primary{background:linear-gradient(135deg,${S.brandDark},${S.brand});color:#fff;box-shadow:0 4px 20px rgba(112,85,255,.3);}
.sd-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(112,85,255,.45);}
.sd-btn-ghost{background:transparent;color:${S.muted};border:1px solid ${S.border};}
.sd-btn-ghost:hover{border-color:${S.brand};color:#fff;}
.sd-btn-outline{background:rgba(112,85,255,.1);color:#9080ff;border:1px solid rgba(112,85,255,.3);}
.sd-btn-outline:hover{background:rgba(112,85,255,.18);border-color:${S.brand};color:#fff;}

/* Course cards */
.sd-course-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px;}
.sd-course{background:${S.card};border:1px solid ${S.border};border-radius:20px;overflow:hidden;transition:all .3s;cursor:pointer;}
.sd-course:hover{border-color:rgba(112,85,255,.5);transform:translateY(-5px);box-shadow:0 20px 50px rgba(0,0,0,.5);}
.sd-course-banner{height:148px;position:relative;overflow:hidden;}
.sd-course-banner img{width:100%;height:100%;object-fit:cover;display:block;}
.sd-course-banner-default{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${S.brandDark},${S.brand},${S.gold});}
.sd-course-fade{position:absolute;inset:0;background:linear-gradient(to top,rgba(17,26,53,.85),transparent);}
.sd-course-body{padding:20px;}
.sd-course-title{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#fff;line-height:1.4;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.sd-course-instructor{display:flex;align-items:center;gap:8px;margin-bottom:14px;}
.sd-course-avatar{width:28px;height:28px;border-radius:50%;border:1px solid ${S.border};background:${S.surface};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${S.brand};flex-shrink:0;overflow:hidden;}
.sd-course-instructor-name{font-size:12px;color:${S.muted};}
.sd-prog-row{display:flex;justify-content:space-between;margin-bottom:6px;}
.sd-prog-track{height:6px;border-radius:999px;background:${S.border};overflow:hidden;margin-bottom:8px;}
.sd-prog-fill{height:100%;border-radius:999px;}
.sd-course-lessons{font-size:12px;color:${S.muted};margin-bottom:14px;}
.sd-chip{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:1px solid;}

/* Competition section */
.sd-comp-overview{border-radius:18px;padding:24px;margin-bottom:18px;}
.sd-comp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;}
.sd-comp-card{background:${S.card};border:1px solid ${S.border};border-radius:18px;padding:22px;transition:all .3s;}
.sd-comp-card:hover{border-color:rgba(112,85,255,.45);transform:translateY(-3px);box-shadow:0 14px 40px rgba(0,0,0,.4);}
.sd-comp-stat{font-family:'Playfair Display',serif;font-size:32px;font-weight:900;line-height:1;}

/* Panel */
.sd-panel{background:${S.card};border:1px solid ${S.border};border-radius:22px;padding:28px;margin-bottom:24px;}
.sd-panel-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;}
.sd-panel-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#fff;}
.sd-panel-sub{font-size:13px;color:${S.muted};margin-top:3px;}
.sd-panel-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;}

/* Divider */
.sd-hr{height:1px;background:${S.border};margin:20px 0;}

/* Empty */
.sd-empty{text-align:center;padding:56px 20px;}
.sd-empty-icon{font-size:52px;display:block;margin-bottom:18px;filter:drop-shadow(0 0 20px rgba(112,85,255,.35));}
.sd-empty-title{font-family:'Playfair Display',serif;font-size:20px;color:#fff;margin-bottom:8px;}
.sd-empty-sub{font-size:14px;color:${S.muted};margin-bottom:24px;}

/* XP Bar */
.sd-xp-row{display:flex;justify-content:space-between;margin-bottom:6px;}
.sd-xp-track{height:6px;border-radius:999px;background:${S.border};overflow:hidden;}
.sd-xp-fill{height:100%;border-radius:999px;background:linear-gradient(to right,${S.brand},${S.gold});}

/* Live dot */
.sd-live-dot{width:8px;height:8px;border-radius:50%;background:${S.red};animation:sd-live 1.5s ease-in-out infinite;display:inline-block;}
`;

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const normalizeEnrollment = e => ({
  id:               e.Id            ?? e.id,
  courseId:         e.CourseId      ?? e.courseId      ?? e.course?.id,
  courseTitle:      e.CourseTitle   ?? e.courseTitle   ?? e.course?.title   ?? e.Course?.Title   ?? e.course?.CourseTitle,
  instructor:       e.Instructor    ?? e.instructor    ?? e.course?.teacherName ?? '',
  instructorAvatar: e.InstructorAvatar ?? e.instructorAvatar ?? e.course?.teacherAvatar ?? e.course?.teacher?.profileImageUrl ?? null,
  progress:         e.ProgressPercentage ?? e.progressPercentage ?? e.progress ?? e.Progress ?? 0,
  completedLessons: e.CompletedLessons ?? e.completedLessons ?? e.completed_lessons ?? 0,
  totalLessons:     e.TotalLessons  ?? e.totalLessons  ?? e.total_lessons   ?? e.CourseTotalLessons ?? e.course?.totalLessons ?? 0,
  status:           e.Status        ?? e.status,
  enrolledAt:       e.EnrolledAt    ?? e.enrolledAt    ?? e.enrolledAtUtc   ?? null,
  bannerUrl:        e.CourseBannerUrl ?? e.courseBannerUrl ?? e.course?.bannerUrl ?? e.Course?.BannerUrl ?? null,
});

/* ═══════════════════════════════════════════════════════════════
   PARTICIPATED COMPETITIONS
═══════════════════════════════════════════════════════════════ */
function ParticipatedSummary() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['userCompetitions'],
    queryFn: () => competitionService.getUserCompetitions(),
  });

  if (isLoading) return (
    <div style={{display:'flex',justifyContent:'center',padding:'32px 0'}}>
      <div style={{display:'flex',gap:6}}>
        {[0,.22,.44].map((d,i)=>(
          <div key={i} style={{width:7,height:7,borderRadius:'50%',background:S.brand,animation:`sd-pulse 1.3s ease-in-out ${d}s infinite`}}/>
        ))}
      </div>
    </div>
  );

  if (isError) return (
    <div style={{textAlign:'center',padding:'32px 0',color:S.red,fontSize:13}}>Failed to load competition data.</div>
  );

  const count     = data?.length || 0;
  const rawLatest = count > 0 ? data[0] : null;
  const latest    = rawLatest ? (rawLatest.competition || rawLatest.Competition || null) : null;
  const latestScore = rawLatest ? (rawLatest.participantScore ?? rawLatest.ParticipantScore ?? null) : null;
  const latestRank  = rawLatest ? (rawLatest.participantRank  ?? rawLatest.ParticipantRank  ?? null) : null;

  return (
    <div>
      {/* Overview strip */}
      <div className="sd-comp-overview" style={{background:`linear-gradient(135deg,rgba(112,85,255,.1),rgba(251,191,36,.06))`,border:`1px solid rgba(112,85,255,.25)`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:'#fff',marginBottom:6}}>
              Participation Overview
            </div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:900,color:S.brand,lineHeight:1}}>
              {count}
            </div>
            <div style={{fontSize:13,color:S.muted,marginTop:4}}>Competition{count!==1?'s':''} joined</div>
          </div>
          <div style={{width:60,height:60,borderRadius:16,background:'rgba(251,191,36,.12)',border:'1px solid rgba(251,191,36,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>🏅</div>
        </div>
      </div>

      {latest ? (
        <div className="sd-comp-grid">
          {/* Latest */}
          <div className="sd-comp-card">
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:S.muted,marginBottom:12}}>Latest Competition</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:'#fff',marginBottom:18,lineHeight:1.3}}>{latest.title}</div>
            <div className="sd-hr"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:16}}>
              <div>
                <div style={{fontSize:11,color:S.muted,marginBottom:4}}>Your Score</div>
                <div className="sd-comp-stat" style={{color:S.green}}>{latestScore??'—'}</div>
              </div>
              <div>
                <div style={{fontSize:11,color:S.muted,marginBottom:4}}>Your Rank</div>
                <div className="sd-comp-stat" style={{color:S.blue}}>{latestRank?`#${latestRank}`:'—'}</div>
              </div>
            </div>
          </div>

          {/* Quick action */}
          <div className="sd-comp-card" style={{display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:S.muted,marginBottom:12}}>Next Challenge</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:'#fff',marginBottom:8}}>Ready to compete again?</div>
              <div style={{fontSize:13,color:S.muted,lineHeight:1.6}}>Join a new competition to climb the rankings and sharpen your skills.</div>
            </div>
            <button className="sd-btn sd-btn-primary" style={{marginTop:20,width:'100%',justifyContent:'center'}} onClick={()=>navigate('/competitions')}>
              Join New Competition →
            </button>
          </div>
        </div>
      ) : (
        <div className="sd-empty">
          <span className="sd-empty-icon">🎯</span>
          <div className="sd-empty-title">No Competitions Yet</div>
          <div className="sd-empty-sub">Test your skills by joining exciting competitions.</div>
          <button className="sd-btn sd-btn-primary" onClick={()=>navigate('/competitions')}>Browse Competitions</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const StudentDashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const toast       = useToast();
  const [enrollments, setEnrollments] = useState([]);
  const [stats,       setStats]       = useState({ totalEnrolled:0, inProgress:0, completed:0 });
  const [loading,     setLoading]     = useState(true);

  useEffect(()=>{ fetchDashboardData(); },[]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/dashboard');
      const dash = response.data?.dashboard || response.data?.data || {};
      const recentRaw = dash.RecentEnrollments || dash.recentEnrollments || dash.recent_enrollments || [];
      setEnrollments((recentRaw||[]).map(normalizeEnrollment));
      const s = dash.Stats||dash.stats||{};
      setStats({
        totalEnrolled: s.TotalEnrollments ?? s.totalEnrollments ?? s.total_enrollments ?? 0,
        inProgress:    s.OngoingCourses   ?? s.ongoingCourses   ?? s.ongoing_courses   ?? 0,
        completed:     s.CompletedCourses ?? s.completedCourses ?? s.completed_courses  ?? 0,
      });
    } catch (error) {
      toast({ title:'Failed to load dashboard', description: error.response?.data?.message || error.message, status:'warning', duration:5000, isClosable:true });
      try {
        const list  = await enrollmentService.getUserEnrollments(1,5);
        const stats = await enrollmentService.getStats();
        const n = (list||[]).map(normalizeEnrollment);
        setEnrollments(n);
        setStats({
          totalEnrolled: stats?.TotalEnrollments ?? stats?.totalEnrollments ?? n.length,
          inProgress:    stats?.ActiveEnrollments ?? stats?.activeEnrollments ?? 0,
          completed:     stats?.CompletedEnrollments ?? stats?.completedEnrollments ?? 0,
        });
      } catch(fe){ console.error('Fallback failed',fe); }
    } finally { setLoading(false); }
  };

  const now       = new Date();
  const hour      = now.getHours();
  const greeting  = hour < 12 ? '🌅 Good morning' : hour < 18 ? '☀️ Good afternoon' : '🌙 Good evening';
  const dateStr   = now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});

  const statCards = [
    { icon:'📚', label:'Total Enrolled',  value:stats.totalEnrolled, sub:'All courses',      color:S.brand },
    { icon:'🎯', label:'In Progress',     value:stats.inProgress,    sub:'Active courses',   color:S.blue  },
    { icon:'🏆', label:'Completed',       value:stats.completed,     sub:'Courses finished', color:S.green },
    { icon:'🔥', label:'Streak',          value:user?.streakDays||0, sub:'Day streak',       color:S.pink  },
  ];

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="sd-root">
        <div className="sd-inner">
          <div className="sd-loader">
            <div className="sd-loader-ring"/>
            <div className="sd-loader-dots">
              <div className="sd-loader-dot"/><div className="sd-loader-dot"/><div className="sd-loader-dot"/>
            </div>
            <p style={{color:S.muted,fontSize:13}}>Loading your dashboard…</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="sd-root">
        <div className="sd-inner">

          {/* ═══ HEADER ═══ */}
          <div className="sd-header">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
              <div>
                <div className="sd-greeting">{greeting} · {dateStr}</div>
                <h1 className="sd-title">
                  Welcome back,{' '}
                  <span className="sd-title-grad">{user?.firstName||'Student'}! 👋</span>
                </h1>
                <p className="sd-subtitle">
                  You're{' '}
                  <span style={{color:S.brand,fontWeight:600}}>
                    {stats.completed>0&&stats.totalEnrolled>0
                      ? `${Math.round((stats.completed/stats.totalEnrolled)*100)}% complete`
                      : 'just getting started'}
                  </span>
                  {' '}on your learning journey. Keep going!
                </p>
              </div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <button className="sd-btn sd-btn-primary" onClick={()=>navigate('/profile/enrollments')}>
                  ▶ Continue Learning
                </button>
                <button className="sd-btn sd-btn-ghost" onClick={()=>navigate('/universities')}>
                  View Schedule
                </button>
              </div>
            </div>
          </div>

          {/* ═══ STAT CARDS ═══ */}
          <div className="sd-stat-grid">
            {statCards.map((s,i)=>(
              <div key={i} className="sd-stat">
                <div className="sd-stat-bg">{s.icon}</div>
                <div className="sd-stat-icon" style={{background:`${s.color}18`,borderColor:`${s.color}33`}}>{s.icon}</div>
                <div className="sd-stat-num" style={{color:s.color}}>{s.value}</div>
                <div className="sd-stat-label">{s.label}</div>
                <div className="sd-stat-sub" style={{color:s.color}}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ═══ RECENT COURSES ═══ */}
          <div className="sd-panel">
            <div className="sd-panel-head">
              <div>
                <div className="sd-panel-title">Continue Learning</div>
                <div className="sd-panel-sub">Pick up where you left off</div>
              </div>
              <button className="sd-btn sd-btn-outline" onClick={()=>navigate('/profile/enrollments')}>
                View All →
              </button>
            </div>

            {enrollments.length>0 ? (
              <div className="sd-course-grid">
                {enrollments.map(e=>{
                  const pct   = Math.min(100, Math.round(e.progress||0));
                  const done  = pct===100;
                  const color = done ? S.green : e.progress>60 ? S.brand : S.blue;
                  const initials = (e.instructor||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);

                  return (
                    <div key={e.id} className="sd-course" onClick={()=>navigate(`/courses/${e.courseId||e.id}`)}>
                      {/* Banner */}
                      <div className="sd-course-banner">
                        {e.bannerUrl
                          ? <><img src={e.bannerUrl} alt={e.courseTitle}/><div className="sd-course-fade"/></>
                          : <div className="sd-course-banner-default"><FiBook style={{fontSize:36,color:'rgba(255,255,255,.7)'}}/></div>
                        }
                        {/* Badge on cover */}
                        <span className="sd-chip" style={{position:'absolute',top:12,left:12,background:done?'rgba(74,222,128,.2)':'rgba(112,85,255,.2)',color:done?S.green:'#9080ff',borderColor:done?'rgba(74,222,128,.35)':'rgba(112,85,255,.35)'}}>
                          {e.status||'In Progress'}
                        </span>
                        <span style={{position:'absolute',bottom:10,right:12,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:color}}>{pct}%</span>
                      </div>

                      {/* Body */}
                      <div className="sd-course-body">
                        <div className="sd-course-title">{e.courseTitle}</div>

                        {/* Instructor */}
                        <div className="sd-course-instructor">
                          <div className="sd-course-avatar">
                            {e.instructorAvatar
                              ? <img src={e.instructorAvatar} alt={e.instructor} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                              : initials
                            }
                          </div>
                          <span className="sd-course-instructor-name">{e.instructor||'Instructor'}</span>
                        </div>

                        {/* Progress bar */}
                        <div>
                          <div className="sd-prog-row">
                            <span style={{fontSize:11,color:S.muted,fontWeight:500}}>Progress</span>
                            <span style={{fontSize:11,fontWeight:700,color}}>{pct}%</span>
                          </div>
                          <div className="sd-prog-track">
                            <div className="sd-prog-fill" style={{width:`${pct}%`,background:`linear-gradient(to right,${color},${color}99)`}}/>
                          </div>
                        </div>

                        {/* Lessons */}
                        {e.totalLessons>0 && (
                          <div className="sd-course-lessons">{e.completedLessons}/{e.totalLessons} lessons</div>
                        )}

                        {/* CTA */}
                        <button className="sd-btn sd-btn-primary" style={{width:'100%',justifyContent:'center',borderRadius:12}}
                          onClick={ev=>{ev.stopPropagation();navigate(`/courses/${e.courseId||e.id}`);}}>
                          {done?'Review Course':'Continue →'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="sd-empty">
                <span className="sd-empty-icon">📚</span>
                <div className="sd-empty-title">No courses yet</div>
                <div className="sd-empty-sub">Start your learning journey with our premium courses.</div>
                <button className="sd-btn sd-btn-primary" onClick={()=>navigate('/courses')}>Browse Courses</button>
              </div>
            )}
          </div>

          {/* ═══ COMPETITIONS ═══ */}
          <div className="sd-panel">
            <div className="sd-panel-head">
              <div>
                <div className="sd-panel-title" style={{display:'flex',alignItems:'center',gap:10}}>
                  Competitions
                  <span className="sd-live-dot"/>
                </div>
                <div className="sd-panel-sub">Track your performance & rankings</div>
              </div>
              <button className="sd-btn sd-btn-outline" onClick={()=>navigate('/my-competitions')}>
                View All →
              </button>
            </div>

            <ParticipatedSummary/>
          </div>

        </div>
      </div>
    </>
  );
};

export default StudentDashboard;