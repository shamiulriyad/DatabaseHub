import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiStar, FiBarChart2, FiThumbsUp, FiThumbsDown, FiMessageSquare, FiBookOpen, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const t = {
  bg:           '#080B14',
  bgCard:       '#0D1120',
  bgInput:      '#111827',
  bgSection:    '#0A0E1A',
  border:       'rgba(255,255,255,0.07)',
  borderFocus:  'rgba(139,92,246,0.6)',
  accent:       '#8B5CF6',
  accentGlow:   'rgba(139,92,246,0.25)',
  accentSoft:   'rgba(139,92,246,0.12)',
  gold:         '#F0C060',
  goldSoft:     'rgba(240,192,96,0.15)',
  success:      '#10B981',
  successSoft:  'rgba(16,185,129,0.12)',
  warning:      '#F59E0B',
  warnSoft:     'rgba(245,158,11,0.12)',
  error:        '#F43F5E',
  errorSoft:    'rgba(244,63,94,0.12)',
  textPrimary:  '#F0F0F5',
  textSecondary:'#8891AA',
  textMuted:    '#4B5268',
};

// ─── Global Styles ─────────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${t.bg}; color: ${t.textPrimary}; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${t.bg}; }
  ::-webkit-scrollbar-thumb { background: ${t.accent}40; border-radius: 4px; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes twinkle { 0%,100%{opacity:0.15} 50%{opacity:0.7} }
  @keyframes fillBar { from { width: 0%; } to { width: var(--w); } }

  .fade-up { animation: fadeUp 0.45s ease both; }
  .d1 { animation-delay: 0.06s; }
  .d2 { animation-delay: 0.12s; }
  .d3 { animation-delay: 0.18s; }
  .d4 { animation-delay: 0.24s; }

  select option { background: #1a2030; color: #f0f0f5; }

  .review-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
  .review-card:hover { transform: translateY(-2px); }

  .pill-btn { transition: all 0.18s ease; }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const ratingColor = (r) => {
  if (r >= 4) return t.success;
  if (r === 3) return t.warning;
  return t.error;
};

const ratingBg = (r) => {
  if (r >= 4) return t.successSoft;
  if (r === 3) return t.warnSoft;
  return t.errorSoft;
};

const getReviewerName = (r) =>
  r.studentName || r.student?.name || r.userName || r.user?.fullName ||
  r.name || r.reviewerName || r.StudentName || '';

const getAvatarSrc = (r) =>
  r.studentAvatar || r.studentAvatarUrl || r.student?.avatarUrl ||
  r.student?.profileImageUrl || r.avatarUrl || r.profileImageUrl ||
  r.user?.profileImageUrl || r.user?.avatar || r.profilePhoto ||
  r.Student?.ProfileImageUrl || null;

const getCourseTitle = (r) =>
  r.courseTitle || r.courseName || r.CourseTitle || '';

const getRating = (r) => r.rating || r.Rating || 0;

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ─── Stars ─────────────────────────────────────────────────────────────────────
const Stars = ({ rating, size = 14 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <FiStar
        key={i}
        size={size}
        color={i <= rating ? t.gold : t.textMuted}
        style={{ fill: i <= rating ? t.gold : 'none', flexShrink: 0 }}
      />
    ))}
  </div>
);

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, src, size = 44 }) => {
  const initials = (name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#8B5CF6', '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'];
  const color  = colors[(name?.charCodeAt(0) || 0) % colors.length];

  return src ? (
    <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color + '30', border: `1.5px solid ${color}50`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color, letterSpacing: '0.02em',
    }}>{initials}</div>
  );
};

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => !toast ? null : (
  <div style={{
    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
    padding: '12px 20px', borderRadius: 12,
    background: toast.type === 'success' ? '#0D2B1F' : '#1F0D14',
    border: `1px solid ${toast.type === 'success' ? t.success + '50' : t.error + '50'}`,
    color: toast.type === 'success' ? t.success : t.error,
    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    animation: 'fadeUp 0.3s ease', maxWidth: 320,
  }}>
    {toast.type === 'success' ? '✓ ' : '⚠ '}{toast.msg}
  </div>
);

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonReview = () => (
  <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24 }}>
    <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.bgInput, flexShrink: 0,
        backgroundImage: `linear-gradient(90deg, ${t.bgInput} 25%, #1a2235 50%, ${t.bgInput} 75%)`,
        backgroundSize: '200% auto', animation: 'shimmer 1.5s linear infinite',
      }} />
      <div style={{ flex: 1 }}>
        {[60, 40].map((w, i) => (
          <div key={i} style={{ height: 12, borderRadius: 6, marginBottom: 8, width: `${w}%`,
            background: t.bgInput, backgroundImage: `linear-gradient(90deg, ${t.bgInput} 25%, #1a2235 50%, ${t.bgInput} 75%)`,
            backgroundSize: '200% auto', animation: `shimmer 1.5s linear infinite`,
            animationDelay: `${i * 0.15}s`,
          }} />
        ))}
      </div>
    </div>
    {[100, 80].map((w, i) => (
      <div key={i} style={{ height: 11, borderRadius: 6, marginBottom: 8, width: `${w}%`,
        background: t.bgInput, backgroundImage: `linear-gradient(90deg, ${t.bgInput} 25%, #1a2235 50%, ${t.bgInput} 75%)`,
        backgroundSize: '200% auto', animation: `shimmer 1.5s linear infinite`,
        animationDelay: `${i * 0.1}s`,
      }} />
    ))}
  </div>
);

// ─── Rating Distribution Bar ────────────────────────────────────────────────────
const DistributionBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, width: 48, flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500 }}>{star}</span>
        <FiStar size={10} color={t.gold} style={{ fill: t.gold }} />
      </div>
      <div style={{ flex: 1, height: 6, background: t.border, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 4,
          background: `linear-gradient(90deg, ${t.gold}, ${t.accent})`,
          transition: 'width 0.8s ease',
        }} />
      </div>
      <span style={{ fontSize: 11, color: t.textMuted, width: 28, textAlign: 'right', flexShrink: 0 }}>{count}</span>
    </div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div style={{
    background: t.bgCard, border: `1px solid ${t.border}`,
    borderRadius: 16, padding: '20px 22px',
    display: 'flex', flexDirection: 'column', gap: 10,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: color + '18', border: `1px solid ${color}25`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={16} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 26, fontWeight: 700, color: t.textPrimary, fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color, marginTop: 3 }}>{sub}</p>}
    </div>
  </div>
);

// ─── CosmicSelect ─────────────────────────────────────────────────────────────
const CosmicSelect = ({ value, onChange, children, style = {} }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          background: t.bgInput, border: `1px solid ${focused ? t.borderFocus : t.border}`,
          borderRadius: 10, color: t.textPrimary, fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, padding: '9px 34px 9px 14px', outline: 'none',
          appearance: 'none', cursor: 'pointer',
          boxShadow: focused ? `0 0 0 3px ${t.accentGlow}` : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          ...style,
        }}
      >{children}</select>
      <FiChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: t.textMuted, pointerEvents: 'none' }} />
    </div>
  );
};

// ─── Review Card ───────────────────────────────────────────────────────────────
const ReviewCard = ({ review }) => {
  const name    = getReviewerName(review);
  const src     = getAvatarSrc(review);
  const course  = getCourseTitle(review);
  const rating  = getRating(review);
  const rc      = ratingColor(rating);
  const rb      = ratingBg(rating);

  return (
    <div className="review-card" style={{
      background: t.bgCard, border: `1px solid ${t.border}`,
      borderRadius: 16, padding: 24,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        {/* Left: avatar + name */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
          <Avatar name={name} src={src} size={46} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: 15, color: t.textPrimary, marginBottom: 2 }}>{name || 'Anonymous'}</p>
            {course && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiBookOpen size={11} color={t.accent} />
                <p style={{ fontSize: 12, color: t.accent, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: rating badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          padding: '6px 12px', borderRadius: 20,
          background: rb, border: `1px solid ${rc}30`,
        }}>
          <Stars rating={rating} size={13} />
          <span style={{ fontSize: 13, fontWeight: 700, color: rc }}>{rating}.0</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: t.border, margin: '16px 0' }} />

      {/* Comment */}
      <p style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.7, marginBottom: 12 }}>
        {review.comment || review.Comment || review.text || review.Text || <em style={{ color: t.textMuted }}>No comment provided.</em>}
      </p>

      <p style={{ fontSize: 12, color: t.textMuted }}>{formatDate(review.createdAt || review.CreatedAt)}</p>
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────
const TeacherReviews = () => {
  const navigate = useNavigate();

  const [reviews, setReviews]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [sortBy, setSortBy]           = useState('newest');
  const [filterRating, setFilterRating] = useState('All');
  const [toast, setToast]             = useState(null);

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => { fetchReviews(); }, [sortBy, filterRating]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/reviews/teacher/reviews', {
        params:  { sortBy },
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = response.data.reviews ?? response.data.data ?? response.data ?? [];

      // Client-side rating filter
      if (filterRating !== 'All') {
        const r = parseInt(filterRating);
        data = data.filter(rv => getRating(rv) === r);
      }

      // Client-side sort
      if (sortBy === 'rating-high') data.sort((a, b) => getRating(b) - getRating(a));
      else if (sortBy === 'rating-low') data.sort((a, b) => getRating(a) - getRating(b));
      else data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      showToast('Unable to load reviews from server');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Computed Stats ────────────────────────────────────────────────────────
  const total    = reviews.length;
  const avgRaw   = total > 0 ? reviews.reduce((s, r) => s + getRating(r), 0) / total : 0;
  const avg      = parseFloat(avgRaw.toFixed(1));
  const positive = reviews.filter(r => getRating(r) >= 4).length;
  const negative = reviews.filter(r => getRating(r) <= 2).length;
  const courses  = new Set(reviews.map(r => r.courseId || r.CourseId)).size;

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => getRating(r) === star).length,
  }));

  return (
    <>
      <style>{G}</style>
      <Toast toast={toast} />

      {/* Starfield */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {[...Array(55)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 2 + 1, height: Math.random() * 2 + 1,
            background: `rgba(255,255,255,${Math.random() * 0.35 + 0.05})`,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 70% 50% at 15% 5%, rgba(139,92,246,0.08) 0%, transparent 55%),
                       radial-gradient(ellipse 50% 40% at 85% 95%, rgba(240,192,96,0.04) 0%, transparent 55%)`,
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '32px 16px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* ── Header ── */}
          <div className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
            <button onClick={() => navigate('/teacher')} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'none', border: `1px solid ${t.border}`, borderRadius: 10,
              color: t.textSecondary, fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, padding: '8px 14px', cursor: 'pointer',
              transition: 'border-color 0.2s, color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.textPrimary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSecondary; }}
            >
              <FiArrowLeft size={13} /> Back
            </button>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.accent, marginBottom: 2 }}>
                Teacher Dashboard
              </p>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700,
                background: `linear-gradient(135deg, ${t.textPrimary} 50%, ${t.textSecondary})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Course Reviews</h1>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="fade-up d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 28 }}>
            <StatCard label="Total Reviews"   value={total}    icon={FiMessageSquare} color={t.accent}   />
            <StatCard label="Average Rating"  value={`${avg}★`} icon={FiStar}         color={t.gold}    sub={total > 0 ? `from ${total} reviews` : ''} />
            <StatCard label="Positive (4–5★)" value={positive} icon={FiThumbsUp}      color={t.success} sub={total > 0 ? `${Math.round(positive/total*100)}% of total` : ''} />
            <StatCard label="Needs Work (≤2★)"value={negative} icon={FiThumbsDown}    color={t.error}   />
            <StatCard label="Courses Reviewed" value={courses}  icon={FiBookOpen}      color={t.accent}  />
          </div>

          {/* ── Rating Distribution ── */}
          {total > 0 && (
            <div className="fade-up d2" style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: 16, padding: '22px 26px', marginBottom: 24,
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center',
            }}>
              <div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 14 }}>
                  Rating Breakdown
                </p>
                {dist.map(d => <DistributionBar key={d.star} star={d.star} count={d.count} total={total} />)}
              </div>
              {/* Big avg circle */}
              <div style={{
                width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
                background: t.goldSoft, border: `2px solid ${t.gold}40`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 30px rgba(240,192,96,0.15)`,
              }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: t.gold, lineHeight: 1 }}>{avg}</span>
                <span style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>out of 5</span>
              </div>
            </div>
          )}

          {/* ── Filters ── */}
          <div className="fade-up d3" style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
            <CosmicSelect value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </CosmicSelect>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All', '5', '4', '3', '2', '1'].map(v => {
                const active = filterRating === v;
                return (
                  <button key={v} className="pill-btn" onClick={() => setFilterRating(v)} style={{
                    padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                    background: active ? t.gold + '20' : 'none',
                    border: `1px solid ${active ? t.gold + '60' : t.border}`,
                    color: active ? t.gold : t.textMuted,
                  }}>
                    {v === 'All' ? 'All Stars' : `${v} ★`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Reviews ── */}
          <div className="fade-up d4">
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[...Array(4)].map((_, i) => <SkeletonReview key={i} />)}
              </div>
            ) : reviews.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '72px 24px', textAlign: 'center',
                background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20,
              }}>
                <div style={{
                  width: 68, height: 68, borderRadius: '50%',
                  background: t.accentSoft, border: `1px solid ${t.accent}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                }}>
                  <FiBarChart2 size={28} color={t.accent} />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: t.textPrimary, marginBottom: 8 }}>
                  No Reviews Yet
                </h3>
                <p style={{ fontSize: 14, color: t.textSecondary, maxWidth: 300 }}>
                  {filterRating !== 'All' ? `No ${filterRating}-star reviews found. Try a different filter.` : 'Reviews will appear here once students rate your courses.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reviews.map((review, idx) => (
                  <ReviewCard
                    key={review.id || review.Id || `${review.courseId}-${review.studentId}-${idx}`}
                    review={review}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default TeacherReviews;