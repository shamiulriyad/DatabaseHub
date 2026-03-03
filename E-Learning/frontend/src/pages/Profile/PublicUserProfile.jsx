import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
  FaBook, FaTrophy, FaStar, FaChartLine, FaUsers,
  FaShieldAlt, FaArrowLeft, FaMedal, FaFire,
  FaGraduationCap, FaChalkboardTeacher,
} from 'react-icons/fa';

/* ═══════════════════════════════════════════════════════════
   TOKENS
═══════════════════════════════════════════════════════════ */
const T = {
  base:       '#080C17',
  surface:    '#0C1120',
  raised:     '#111827',
  overlay:    '#161F35',
  border:     'rgba(120,80,255,0.12)',
  borderMid:  'rgba(120,80,255,0.26)',
  borderHot:  'rgba(120,80,255,0.55)',
  violet:     '#7B5BF5',
  violetSoft: '#A78BFA',
  violetGlow: 'rgba(123,91,245,0.30)',
  violetDim:  'rgba(123,91,245,0.08)',
  sky:        '#38BDF8',
  emerald:    '#10B981',
  amber:      '#F59E0B',
  rose:       '#F43F5E',
  text:       '#F0EEFF',
  textSub:    '#8B9CC0',
  textMuted:  '#3D4F6E',
};

/* ═══════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

.pub-root{min-height:100vh;background:${T.base};font-family:'DM Sans',sans-serif;color:${T.text};position:relative;overflow-x:hidden;}
.pub-root::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");pointer-events:none;z-index:0;opacity:.65;}

.pub-blob{position:fixed;border-radius:50%;filter:blur(130px);pointer-events:none;z-index:0;}
.pub-inner{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:36px 24px 100px;}

/* BACK BUTTON */
.pub-back{display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border-radius:11px;background:rgba(123,91,245,.07);border:1px solid ${T.borderMid};color:${T.violetSoft};font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .22s;margin-bottom:28px;letter-spacing:.02em;}
.pub-back:hover{background:rgba(123,91,245,.14);border-color:${T.borderHot};transform:translateX(-2px);}

/* HERO */
.pub-hero{border-radius:28px;overflow:hidden;border:1px solid ${T.border};margin-bottom:24px;background:${T.surface};}
.pub-cover{height:220px;position:relative;overflow:hidden;}
.pub-cover-bg{width:100%;height:100%;background:linear-gradient(135deg,#07081A 0%,#150930 45%,#0A1530 100%);position:relative;}
.pub-cover-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(123,91,245,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(123,91,245,.06) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(to bottom,transparent,rgba(0,0,0,.5) 25%,rgba(0,0,0,.5) 75%,transparent);}
.pub-cover-fade{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,${T.surface} 100%);}
.pub-star{position:absolute;border-radius:50%;background:rgba(167,139,250,.85);}

@keyframes pub-shoot{0%{transform:translateX(-180px) translateY(30px);opacity:0;}8%{opacity:1;}100%{transform:translateX(700px) translateY(-110px);opacity:0;}}
.pub-shoot{position:absolute;height:1.5px;border-radius:99px;background:linear-gradient(90deg,transparent,${T.violetSoft},transparent);animation:pub-shoot 5.5s ease-in-out infinite;}

/* AVATAR */
.pub-avatar-wrap{padding:4px;border-radius:50%;background:linear-gradient(135deg,${T.violet},#4F46E5,${T.sky});box-shadow:0 0 0 5px ${T.surface},0 0 50px ${T.violetGlow};position:relative;display:inline-block;}
.pub-avatar-wrap::after{content:'';position:absolute;inset:-4px;border-radius:50%;background:linear-gradient(135deg,${T.violet},transparent,${T.sky});z-index:-1;filter:blur(10px);opacity:.4;}
.pub-avatar-inner{width:110px;height:110px;border-radius:50%;background:${T.raised};overflow:hidden;display:flex;align-items:center;justify-content:center;}

/* LAYOUT */
.pub-profile-body{background:${T.surface};padding:0 36px 36px;}
.pub-profile-row{display:flex;flex-wrap:wrap;gap:28px;align-items:flex-end;margin-bottom:28px;}
.pub-profile-info{flex:1;min-width:240px;padding-bottom:4px;}

.pub-name{font-family:'Playfair Display',serif;font-size:36px;font-weight:900;line-height:1.05;letter-spacing:-.02em;color:${T.text};margin-bottom:6px;}
.pub-name em{font-style:italic;background:linear-gradient(90deg,${T.violetSoft},${T.sky});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.pub-handle{font-size:13px;font-weight:600;color:${T.violet};letter-spacing:.05em;margin-bottom:14px;}
.pub-email{font-size:13px;color:${T.textSub};}

/* CHIPS */
.pub-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:1px solid;transition:transform .2s;}
.pub-chip:hover{transform:translateY(-1px);}
.pub-chips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;}

/* BIO */
.pub-bio{font-size:14px;color:${T.textSub};line-height:1.75;max-width:620px;}
.pub-hr{height:1px;background:linear-gradient(90deg,transparent,${T.borderMid},transparent);margin:24px 0;}

/* STAT CARDS */
.pub-stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:18px;margin-bottom:24px;}
.pub-stat{background:${T.surface};border:1px solid ${T.border};border-radius:20px;overflow:hidden;transition:all .3s cubic-bezier(.4,0,.2,1);position:relative;}
.pub-stat:hover{border-color:${T.borderMid};transform:translateY(-5px);box-shadow:0 20px 50px rgba(0,0,0,.55);}
.pub-stat-bar{height:3px;}
.pub-stat-body{padding:24px;}
.pub-stat-icon{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;border:1px solid;margin-bottom:20px;}
.pub-stat-num{font-family:'Playfair Display',serif;font-size:48px;font-weight:900;line-height:1;letter-spacing:-.03em;}
.pub-stat-tag{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${T.textMuted};margin-top:5px;}
.pub-stat-desc{font-size:13px;color:${T.textSub};margin-top:5px;}

/* BOTTOM GRID */
.pub-grid{display:grid;grid-template-columns:2fr 1fr;gap:20px;}
@media(max-width:768px){.pub-grid{grid-template-columns:1fr;}}

/* PANELS */
.pub-panel{background:${T.surface};border:1px solid ${T.border};border-radius:22px;padding:28px;}
.pub-panel-title{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;color:${T.text};display:flex;align-items:center;gap:9px;margin-bottom:22px;}
.pub-panel-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;}

/* ACTIVITY ROW */
.pub-activity-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid ${T.border};}
.pub-activity-row:last-child{border-bottom:none;padding-bottom:0;}
.pub-activity-label{font-size:13.5px;color:${T.textSub};}
.pub-activity-val{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;}

/* ACHIEVEMENT */
.pub-achieve{display:flex;align-items:center;gap:10px;padding:12px;border-radius:12px;background:rgba(123,91,245,.05);border:1px solid ${T.border};transition:all .2s;margin-bottom:8px;}
.pub-achieve:hover{border-color:${T.borderMid};background:rgba(123,91,245,.09);}
.pub-achieve-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.pub-achieve-name{font-size:13px;font-weight:600;color:${T.text};}
.pub-achieve-sub{font-size:11px;color:${T.textMuted};margin-top:2px;}

/* EMPTY */
.pub-empty{text-align:center;padding:40px 20px;}
.pub-empty-icon{font-size:40px;display:block;margin-bottom:14px;filter:drop-shadow(0 0 16px rgba(123,91,245,.4));}
.pub-empty-text{font-size:13px;color:${T.textMuted};}

/* LOADER / ERROR */
@keyframes pub-spin{to{transform:rotate(360deg);}}
@keyframes pub-pulse{0%,100%{opacity:.3;}50%{opacity:1;}}
.pub-center{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:18px;background:${T.base};}
.pub-spin{width:52px;height:52px;border-radius:50%;border:2px solid ${T.border};border-top-color:${T.violetSoft};animation:pub-spin .9s cubic-bezier(.5,0,.5,1) infinite;}
.pub-dots{display:flex;gap:6px;}
.pub-dot{width:7px;height:7px;border-radius:50%;background:${T.violet};animation:pub-pulse 1.3s ease-in-out infinite;}
.pub-dot:nth-child(2){animation-delay:.22s;}
.pub-dot:nth-child(3){animation-delay:.44s;}
.pub-err-icon{font-size:52px;margin-bottom:4px;filter:drop-shadow(0 0 24px rgba(123,91,245,.35));}
.pub-err-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:${T.text};}
.pub-err-sub{font-size:14px;color:${T.textMuted};}
.pub-btn{display:inline-flex;align-items:center;gap:8px;padding:11px 24px;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .25s cubic-bezier(.4,0,.2,1);background:linear-gradient(135deg,${T.violet},#5B21B6);color:#F0EEFF;border:1px solid rgba(167,139,250,.2);box-shadow:0 4px 20px rgba(123,91,245,.22);}
.pub-btn:hover{background:linear-gradient(135deg,#8B6BFF,#6D28D9);box-shadow:0 4px 32px rgba(123,91,245,.45);transform:translateY(-2px);}
`;

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const fetchUserProfile = async (userId) => {
  const { data } = await api.get(`/auth/user/${userId}`);
  return data?.user;
};

const STARS = Array.from({ length: 24 }, (_, i) => ({
  top: `${8 + (i * 19) % 82}%`,
  left: `${4 + (i * 31) % 93}%`,
  size: i % 4 === 0 ? 3 : i % 3 === 0 ? 2.5 : 1.5,
  op: 0.28 + (i % 5) * 0.12,
  glow: i % 4 === 0 ? 10 : 5,
}));

const USER_CHIPS = [
  { key: 'isStudent',    label: 'Student',    Icon: FaGraduationCap,    bg: 'rgba(56,189,248,.1)',  color: '#7DD3FC', border: 'rgba(56,189,248,.25)' },
  { key: 'isTeacher',   label: 'Teacher',    Icon: FaChalkboardTeacher, bg: 'rgba(16,185,129,.1)', color: '#6EE7B7', border: 'rgba(16,185,129,.25)' },
  { key: 'isAdmin',     label: 'Admin',      Icon: FaShieldAlt,         bg: 'rgba(244,63,94,.1)',  color: '#FDA4AF', border: 'rgba(244,63,94,.25)' },
  { key: 'isCompetitor',label: 'Competitor', Icon: FaMedal,             bg: 'rgba(245,158,11,.1)', color: '#FCD34D', border: 'rgba(245,158,11,.25)' },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
const PublicUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['publicUserProfile', userId],
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
  });

  /* ── Loading ── */
  if (isLoading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="pub-center">
          <div className="pub-spin" />
          <div className="pub-dots">
            <div className="pub-dot" /><div className="pub-dot" /><div className="pub-dot" />
          </div>
          <p style={{ color: T.textMuted, fontSize: 13 }}>Fetching profile…</p>
        </div>
      </>
    );
  }

  /* ── Error / Not Found ── */
  if (error || !profile) {
    return (
      <>
        <style>{CSS}</style>
        <div className="pub-center">
          <span className="pub-err-icon">👤</span>
          <div className="pub-err-title">User Not Found</div>
          <div className="pub-err-sub">The profile you're looking for doesn't exist.</div>
          <button className="pub-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft style={{ fontSize: 12 }} /> Go Back
          </button>
        </div>
      </>
    );
  }

  /* ── Profile data ── */
  const firstName = profile.firstName || '';
  const lastName  = profile.lastName  || '';
  const fullName  = `${firstName} ${lastName}`.trim() || profile.username || 'User';
  const chips     = USER_CHIPS.filter(c => profile[c.key]);

  const achievements = [
    profile.totalPoints >= 1000  && { icon: <FaStar style={{ color: T.amber, fontSize: 14 }} />, name: 'Points Master',       sub: `${profile.totalPoints?.toLocaleString()} points earned`,  bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.2)' },
    profile.completedCourses >= 5 && { icon: <FaBook style={{ color: T.sky,   fontSize: 14 }} />, name: 'Course Enthusiast',   sub: `${profile.completedCourses} courses completed`,           bg: 'rgba(56,189,248,.1)',  border: 'rgba(56,189,248,.2)' },
    profile.currentRank && profile.currentRank !== 'Unranked' && { icon: <FaTrophy style={{ color: T.violet, fontSize: 14 }} />, name: 'Ranked',             sub: profile.currentRank,                                      bg: 'rgba(123,91,245,.1)', border: 'rgba(123,91,245,.2)' },
  ].filter(Boolean);

  return (
    <>
      <style>{CSS}</style>
      <div className="pub-root">

        {/* Blobs */}
        <div className="pub-blob" style={{ width: 650, height: 650, background: 'radial-gradient(circle,rgba(123,91,245,.055) 0%,transparent 70%)', top: -250, right: -250 }} />
        <div className="pub-blob" style={{ width: 450, height: 450, background: 'radial-gradient(circle,rgba(56,189,248,.04) 0%,transparent 70%)', bottom: 80, left: -200 }} />

        <div className="pub-inner">

          {/* Back */}
          <button className="pub-back" onClick={() => navigate(-1)}>
            <FaArrowLeft style={{ fontSize: 11 }} /> Back
          </button>

          {/* ── HERO ── */}
          <div className="pub-hero">

            {/* Cover */}
            <div className="pub-cover">
              {profile.coverImageUrl ? (
                <>
                  <img src={profile.coverImageUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="pub-cover-fade" />
                </>
              ) : (
                <div className="pub-cover-bg">
                  <div className="pub-cover-grid" />
                  {STARS.map((s, i) => (
                    <div key={i} className="pub-star" style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: s.op, boxShadow: `0 0 ${s.glow}px rgba(167,139,250,${s.op})` }} />
                  ))}
                  <div className="pub-shoot" style={{ top: '22%', width: 100 }} />
                  <div className="pub-shoot" style={{ top: '60%', width: 72, animationDelay: '2.3s' }} />
                  <div className="pub-shoot" style={{ top: '38%', width: 58, animationDelay: '4.1s' }} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 320, height: 120, background: 'radial-gradient(ellipse,rgba(123,91,245,.11) 0%,transparent 70%)', borderRadius: '50%' }} />
                  <div style={{ position: 'absolute', top: '16%', right: '14%', width: 190, height: 80, background: 'radial-gradient(ellipse,rgba(56,189,248,.08) 0%,transparent 70%)', borderRadius: '50%' }} />
                  <div className="pub-cover-fade" />
                </div>
              )}
            </div>

            {/* Body */}
            <div className="pub-profile-body">
              <div className="pub-profile-row">

                {/* Avatar */}
                <div className="pub-avatar-wrap" style={{ marginTop: -62 }}>
                  <div className="pub-avatar-inner">
                    {profile.profileImageUrl
                      ? <img src={profile.profileImageUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 900, color: T.violetSoft }}>{fullName.charAt(0)}</span>
                    }
                  </div>
                </div>

                {/* Info */}
                <div className="pub-profile-info">
                  <h1 className="pub-name">
                    {firstName} <em>{lastName || profile.username}</em>
                  </h1>
                  <div className="pub-handle">@{profile.username}</div>

                  {chips.length > 0 && (
                    <div className="pub-chips">
                      {chips.map(c => (
                        <span key={c.key} className="pub-chip" style={{ background: c.bg, color: c.color, borderColor: c.border }}>
                          <c.Icon style={{ fontSize: 10 }} /> {c.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {profile.email && <div className="pub-email">{profile.email}</div>}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <>
                  <div className="pub-hr" />
                  <p className="pub-bio">{profile.bio}</p>
                </>
              )}
            </div>
          </div>

          {/* ── STATS ── */}
          <div className="pub-stat-grid">

            {/* Rank */}
            <div className="pub-stat">
              <div className="pub-stat-bar" style={{ background: 'linear-gradient(90deg,#7B5BF5,#A78BFA)' }} />
              <div className="pub-stat-body">
                <div className="pub-stat-icon" style={{ background: 'rgba(123,91,245,.08)', borderColor: 'rgba(123,91,245,.18)' }}>
                  <FaMedal style={{ color: T.violetSoft, fontSize: 18 }} />
                </div>
                <div className="pub-stat-num" style={{ color: T.violetSoft, fontSize: 28, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", letterSpacing: '-.01em' }}>{profile.currentRank || 'Unranked'}</div>
                <div className="pub-stat-tag">Rank</div>
                <div className="pub-stat-desc">Current standing</div>
              </div>
            </div>

            {/* Streak */}
            <div className="pub-stat">
              <div className="pub-stat-bar" style={{ background: 'linear-gradient(90deg,#F97316,#FB923C)' }} />
              <div className="pub-stat-body">
                <div className="pub-stat-icon" style={{ background: 'rgba(249,115,22,.08)', borderColor: 'rgba(249,115,22,.18)' }}>
                  <FaFire style={{ color: '#FB923C', fontSize: 18 }} />
                </div>
                <div className="pub-stat-num" style={{ color: '#FDBA74' }}>{profile.streakDays || 0}</div>
                <div className="pub-stat-tag">Streak</div>
                <div className="pub-stat-desc">Day streak</div>
              </div>
            </div>

            {/* Courses */}
            <div className="pub-stat">
              <div className="pub-stat-bar" style={{ background: 'linear-gradient(90deg,#0EA5E9,#38BDF8)' }} />
              <div className="pub-stat-body">
                <div className="pub-stat-icon" style={{ background: 'rgba(56,189,248,.08)', borderColor: 'rgba(56,189,248,.18)' }}>
                  <FaBook style={{ color: T.sky, fontSize: 18 }} />
                </div>
                <div className="pub-stat-num" style={{ color: '#7DD3FC' }}>{profile.enrolledCourses || 0}</div>
                <div className="pub-stat-tag">Courses</div>
                <div className="pub-stat-desc">Enrolled</div>
              </div>
            </div>

          </div>

          {/* ── BOTTOM GRID ── */}
          <div className="pub-grid">

            {/* Activity */}
            <div className="pub-panel">
              <div className="pub-panel-title">
                <div className="pub-panel-icon" style={{ background: 'rgba(123,91,245,.1)', border: `1px solid ${T.borderMid}` }}>
                  <FaChartLine style={{ color: T.violetSoft, fontSize: 14 }} />
                </div>
                Activity
              </div>

              {(profile.enrolledCourses > 0 || profile.completedCourses > 0) ? (
                <>
                  {profile.enrolledCourses > 0 && (
                    <div className="pub-activity-row">
                      <span className="pub-activity-label">Enrolled Courses</span>
                      <span className="pub-activity-val" style={{ color: '#7DD3FC' }}>{profile.enrolledCourses}</span>
                    </div>
                  )}
                  {profile.completedCourses > 0 && (
                    <div className="pub-activity-row">
                      <span className="pub-activity-label">Completed Courses</span>
                      <span className="pub-activity-val" style={{ color: '#6EE7B7' }}>{profile.completedCourses}</span>
                    </div>
                  )}
                  {profile.totalPoints > 0 && (
                    <div className="pub-activity-row">
                      <span className="pub-activity-label">Total Points</span>
                      <span className="pub-activity-val" style={{ color: T.violetSoft }}>{profile.totalPoints?.toLocaleString()}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="pub-empty">
                  <span className="pub-empty-icon">📊</span>
                  <div className="pub-empty-text">No activity to display yet.</div>
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="pub-panel">
              <div className="pub-panel-title">
                <div className="pub-panel-icon" style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)' }}>
                  <FaShieldAlt style={{ color: T.amber, fontSize: 14 }} />
                </div>
                Achievements
              </div>

              {achievements.length > 0 ? (
                achievements.map((a, i) => (
                  <div key={i} className="pub-achieve" style={{ background: a.bg, borderColor: a.border }}>
                    <div className="pub-achieve-icon" style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${a.border}` }}>
                      {a.icon}
                    </div>
                    <div>
                      <div className="pub-achieve-name">{a.name}</div>
                      <div className="pub-achieve-sub">{a.sub}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="pub-empty">
                  <span className="pub-empty-icon">🏆</span>
                  <div className="pub-empty-text">No achievements yet.</div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default PublicUserProfile;