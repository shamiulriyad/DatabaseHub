import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@chakra-ui/react';
import FinalLogo from '../assets/final.png';
import { publicApi } from '../services/api';

// ═══════════════════════════════════════════════════════════
// NEXTUNIVERSE — COSMIC DARK PREMIUM FOOTER
// Fonts : Playfair Display + DM Sans  |  Mode: Dark Only
// ═══════════════════════════════════════════════════════════

const CSS = `
  .footer-root {
    position: relative;
    background:
      radial-gradient(ellipse 80% 60% at 50% 120%, rgba(124,58,237,0.1) 0%, transparent 65%),
      linear-gradient(180deg, #07071a 0%, #03030d 100%);
    border-top: 1px solid rgba(124,58,237,0.18);
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }

  .footer-root::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; right: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(245,158,11,0.3), transparent);
  }

  .footer-stars { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
  .footer-star  { position:absolute; border-radius:50%; background:white; animation:ftw var(--d,3s) ease-in-out var(--del,0s) infinite; }
  @keyframes ftw { 0%,100%{opacity:var(--op,.3)} 50%{opacity:.04} }

  .footer-container { max-width:1200px; margin:0 auto; padding:0 32px; position:relative; z-index:1; }

  /* ── MAIN GRID ── */
  .footer-top {
    padding: 80px 0 60px;
    display: grid;
    grid-template-columns: 1.6fr 1fr 1fr 1fr 1.2fr;
    gap: 48px;
    align-items: start;
  }
  @media(max-width:1100px){ .footer-top{ grid-template-columns:1fr 1fr 1fr; gap:36px; } }
  @media(max-width:700px) { .footer-top{ grid-template-columns:1fr 1fr; gap:28px; } }
  @media(max-width:480px) { .footer-top{ grid-template-columns:1fr; } }

  /* Brand */
  .footer-brand-logo { display:inline-flex; align-items:center; gap:10px; text-decoration:none; margin-bottom:20px; }
  .footer-logo-icon  { width:38px; height:38px; border-radius:11px; background:linear-gradient(135deg,#5b21b6,#7c3aed); display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 0 20px rgba(124,58,237,0.4); flex-shrink:0; }
  .footer-logo-text  { font-family:'Playfair Display',Georgia,serif; font-size:20px; font-weight:700; background:linear-gradient(135deg,#c4b5fd,#7c3aed,#f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; letter-spacing:-0.02em; }
  .footer-brand-desc { font-size:13px; color:#6b6890; line-height:1.8; margin-bottom:24px; max-width:260px; }

  .footer-stats { display:flex; gap:20px; flex-wrap:wrap; margin-bottom:28px; }
  .footer-stat  { display:flex; flex-direction:column; gap:2px; }
  .footer-stat-val   { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:#f5f3ff; letter-spacing:-0.02em; }
  .footer-stat-label { font-size:10px; color:#5c587a; text-transform:uppercase; letter-spacing:0.1em; font-weight:500; }

  /* Newsletter */
  .footer-newsletter { display:flex; flex-direction:column; gap:10px; }
  .footer-nl-label   { font-size:11px; font-weight:600; color:#5c587a; text-transform:uppercase; letter-spacing:0.12em; }
  .footer-nl-row     { display:flex; gap:0; border-radius:10px; overflow:hidden; border:1px solid rgba(124,58,237,0.25); background:rgba(13,13,38,0.8); transition:border-color 0.2s; }
  .footer-nl-row:focus-within { border-color:rgba(124,58,237,0.5); box-shadow:0 0 0 3px rgba(124,58,237,0.1); }
  .footer-nl-input { flex:1; padding:11px 14px; background:transparent; border:none; outline:none; font-family:'DM Sans',sans-serif; font-size:13px; color:#f5f3ff; min-width:0; }
  .footer-nl-input::placeholder { color:#5c587a; }
  .footer-nl-btn   { padding:11px 18px; background:linear-gradient(135deg,#5b21b6,#7c3aed); border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; color:white; transition:all 0.2s; flex-shrink:0; }
  .footer-nl-btn:hover { background:linear-gradient(135deg,#6d28d9,#8b5cf6); }
  .footer-nl-note  { font-size:11px; color:#5c587a; }

  /* Columns */
  .footer-col-title { font-family:'Playfair Display',serif; font-size:14px; font-weight:600; color:#f5f3ff; margin-bottom:20px; letter-spacing:-0.01em; display:flex; align-items:center; gap:8px; }
  .footer-col-title::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,rgba(124,58,237,0.3),transparent); max-width:40px; }

  .footer-links { display:flex; flex-direction:column; gap:12px; }
  .footer-link  { font-size:13px; color:#6b6890; text-decoration:none; display:flex; align-items:center; gap:7px; transition:all 0.2s; font-weight:400; width:fit-content; }
  .footer-link:hover { color:#c4b5fd; transform:translateX(4px); }
  .footer-link-dot { width:4px; height:4px; border-radius:50%; background:rgba(124,58,237,0.4); flex-shrink:0; transition:background 0.2s; }
  .footer-link:hover .footer-link-dot { background:#a78bfa; }

  /* Socials */
  .footer-socials { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; }
  .social-btn {
    width:40px; height:40px; border-radius:11px;
    border:1px solid rgba(124,58,237,0.2); background:rgba(13,13,38,0.6);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all 0.25s; text-decoration:none;
    font-size:14px; color:#6b6890; flex-shrink:0; font-weight:700;
  }
  .social-btn:hover { background:rgba(124,58,237,0.15); border-color:rgba(124,58,237,0.4); color:#c4b5fd; transform:translateY(-3px); box-shadow:0 8px 20px rgba(124,58,237,0.2); }

  .footer-contact-items { display:flex; flex-direction:column; gap:10px; }
  .footer-contact-item  { display:flex; align-items:flex-start; gap:10px; font-size:13px; color:#6b6890; line-height:1.5; }
  .footer-contact-icon  { font-size:14px; flex-shrink:0; margin-top:1px; }

  .footer-badge     { display:inline-flex; align-items:center; gap:7px; padding:6px 14px; border-radius:99px; background:rgba(124,58,237,0.08); border:1px solid rgba(124,58,237,0.2); font-size:11px; font-weight:600; color:#a78bfa; letter-spacing:0.04em; }
  .footer-badge-dot { width:6px; height:6px; border-radius:50%; background:#7c3aed; box-shadow:0 0 8px #7c3aed; animation:ftw 1.5s ease-in-out infinite; }

  /* Ecosystem Belt */
  .footer-belt { padding:28px 0; border-top:1px solid rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.04); }
  .footer-belt-label { font-size:10px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:#5c587a; text-align:center; margin-bottom:18px; }
  .footer-belt-scroll { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }
  .belt-pill { display:inline-flex; align-items:center; gap:6px; padding:7px 16px; border-radius:99px; font-size:12px; font-weight:500; color:#6b6890; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); white-space:nowrap; transition:all 0.2s; cursor:default; }
  .belt-pill:hover { border-color:rgba(124,58,237,0.3); color:#a78bfa; background:rgba(124,58,237,0.06); }

  /* Bottom */
  .footer-bottom { padding:24px 0 36px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
  .footer-copy { font-size:12px; color:#5c587a; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .footer-copy-heart { color:#7c3aed; animation:ftw 2s ease-in-out infinite; }
  .footer-legal { display:flex; gap:20px; flex-wrap:wrap; }
  .footer-legal a { font-size:12px; color:#5c587a; text-decoration:none; transition:color 0.2s; }
  .footer-legal a:hover { color:#a78bfa; }

  @media(max-width:640px) {
    .footer-container { padding:0 16px; }
    .footer-top { padding:48px 0 36px; }
    .footer-bottom { justify-content:center; text-align:center; }
    .footer-legal { justify-content:center; }
  }
`;

const STARS = Array.from({ length: 40 }, (_, i) => ({
  top:  (Math.random() * 100).toFixed(1),
  left: (Math.random() * 100).toFixed(1),
  size: i % 8 === 0 ? 2 : 1,
  op:   (Math.random() * 0.35 + 0.06).toFixed(2),
  dur:  (2.5 + Math.random() * 4).toFixed(1),
  del:  (Math.random() * 6).toFixed(1),
}));

const DEFAULT_FOOTER_DATA = {
  brand: {
    name: 'NextUniVerse',
    description: 'Empowering the next generation of scholars with university-backed courses, vibrant clans, and real competitions that open real doors.',
    supportEmail: 'hello@nextuniverse.edu',
    location: 'Global · Remote First · Dhaka HQ',
    supportWindow: 'Support 24/7 · Response within 4h',
    statusText: 'All systems operational',
  },
  stats: [
    { label: 'Students', value: 0 },
    { label: 'Courses', value: 0 },
    { label: 'Competitions', value: 0 },
  ],
  links: {
    platform: [
      { to: '/courses', label: 'Browse Courses' },
      { to: '/universities', label: 'Universities' },
      { to: '/departments', label: 'Departments' },
      { to: '/community', label: 'Community' },
      { to: '/clans', label: 'Clans' },
      { to: '/competitions', label: 'Competitions' },
    ],
    company: [
      { href: '/about', label: 'About Us' },
      { href: '#blog', label: 'Blog' },
      { href: '#careers', label: 'Careers' },
      { href: '#press', label: 'Press' },
      { href: '#contact', label: 'Contact' },
      { href: '#partners', label: 'Partners' },
    ],
    support: [
      { href: '#help', label: 'Help Center' },
      { href: '#docs', label: 'Documentation' },
      { href: '#instructors', label: 'Become Instructor' },
      { href: '#affiliate', label: 'Affiliate Program' },
      { href: '#status', label: 'System Status' },
    ],
    legal: [
      { href: '#privacy', label: 'Privacy Policy' },
      { href: '#terms', label: 'Terms of Service' },
      { href: '#cookies', label: 'Cookie Policy' },
      { href: '#accessibility', label: 'Accessibility' },
    ]
  },
  socials: [
    { icon: 'f', label: 'Facebook', href: 'https://facebook.com' },
    { icon: '𝕏', label: 'Twitter', href: 'https://twitter.com' },
    { icon: 'in', label: 'LinkedIn', href: 'https://linkedin.com' },
    { icon: '⌥', label: 'Instagram', href: 'https://instagram.com' },
    { icon: '▶', label: 'YouTube', href: 'https://youtube.com' },
  ],
  ecosystem: [
    { icon: '🏛️', label: 'Universities' },
    { icon: '📐', label: 'Departments' },
    { icon: '📚', label: 'Courses' },
    { icon: '💬', label: 'Community' },
    { icon: '⚔️', label: 'Clans' },
    { icon: '🏆', label: 'Competitions' },
  ],
  copy: {
    year: new Date().getFullYear(),
    text: `© ${new Date().getFullYear()} NextUniVerse.`,
    suffix: 'for learners worldwide.',
  }
};

const formatCompactNumber = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  if (number < 1000) return `${number}`;
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(number);
};

const Footer = () => {
  const [email, setEmail]         = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [footerData, setFooterData] = useState(DEFAULT_FOOTER_DATA);

  useEffect(() => {
    let active = true;
    const loadFooterData = async () => {
      try {
        const response = await publicApi.get('/public/footer');
        const payload = response?.data?.data;
        if (active && payload) {
          setFooterData({
            ...DEFAULT_FOOTER_DATA,
            ...payload,
            brand: { ...DEFAULT_FOOTER_DATA.brand, ...(payload.brand || {}) },
            links: {
              ...DEFAULT_FOOTER_DATA.links,
              ...(payload.links || {}),
              platform: payload?.links?.platform || DEFAULT_FOOTER_DATA.links.platform,
              company: payload?.links?.company || DEFAULT_FOOTER_DATA.links.company,
              support: payload?.links?.support || DEFAULT_FOOTER_DATA.links.support,
              legal: payload?.links?.legal || DEFAULT_FOOTER_DATA.links.legal,
            },
            stats: payload.stats || DEFAULT_FOOTER_DATA.stats,
            socials: payload.socials || DEFAULT_FOOTER_DATA.socials,
            ecosystem: payload.ecosystem || DEFAULT_FOOTER_DATA.ecosystem,
            copy: { ...DEFAULT_FOOTER_DATA.copy, ...(payload.copy || {}) }
          });
        }
      } catch {
      }
    };

    loadFooterData();
    return () => { active = false; };
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); }
  };

  return (
    <>
      <style>{CSS}</style>
      <footer className="footer-root">

        {/* Stars */}
        <div className="footer-stars" aria-hidden="true">
          {STARS.map((s, i) => (
            <div key={i} className="footer-star" style={{
              top:`${s.top}%`, left:`${s.left}%`,
              width:s.size, height:s.size,
              '--op':s.op, '--d':`${s.dur}s`, '--del':`${s.del}s`,
            }} />
          ))}
        </div>

        <div className="footer-container">

          {/* ── MAIN GRID ── */}
          <div className="footer-top">

            {/* Brand + Newsletter */}
            <div>
              <Link to="/" className="footer-brand-logo">
                <Image src={FinalLogo} alt="NextUniVerse" width="38px" height="38px" borderRadius="11px" objectFit="cover" />
                <span className="footer-logo-text">{footerData.brand.name}</span>
              </Link>

              <p className="footer-brand-desc">
                {footerData.brand.description}
              </p>

              <div className="footer-stats">
                {footerData.stats.map((s,i) => (
                  <div key={i} className="footer-stat">
                    <span className="footer-stat-val">{formatCompactNumber(s.value)}</span>
                    <span className="footer-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="footer-newsletter">
                <span className="footer-nl-label">Stay in the loop</span>
                {subscribed ? (
                  <div style={{ padding:'12px 16px', borderRadius:10, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', fontSize:13, color:'#34d399', display:'flex', alignItems:'center', gap:8 }}>
                    ✓ You're subscribed! Welcome to the universe.
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe}>
                    <div className="footer-nl-row">
                      <input
                        className="footer-nl-input"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                      <button type="submit" className="footer-nl-btn">Subscribe →</button>
                    </div>
                  </form>
                )}
                <span className="footer-nl-note">No spam. Unsubscribe anytime.</span>
              </div>
            </div>

            {/* Platform */}
            <div>
              <div className="footer-col-title">Platform</div>
              <div className="footer-links">
                {footerData.links.platform.map((l,i) => (
                  <Link key={i} to={l.to} className="footer-link">
                    <span className="footer-link-dot" />{l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <div className="footer-col-title">Company</div>
              <div className="footer-links">
                {footerData.links.company.map((l,i) => (
                  <a key={i} href={l.href} className="footer-link">
                    <span className="footer-link-dot" />{l.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <div className="footer-col-title">Support</div>
              <div className="footer-links">
                {footerData.links.support.map((l,i) => (
                  <a key={i} href={l.href} className="footer-link">
                    <span className="footer-link-dot" />{l.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Connect */}
            <div>
              <div className="footer-col-title">Connect</div>

              <div className="footer-socials">
                {footerData.socials.map((s,i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="social-btn" aria-label={s.label}>
                    <span style={{ fontSize: (s.icon || '').length > 1 ? 11 : 15 }}>{s.icon}</span>
                  </a>
                ))}
              </div>

              <div className="footer-contact-items">
                <div className="footer-contact-item">
                  <span className="footer-contact-icon">✉</span>
                  <span>{footerData.brand.supportEmail}</span>
                </div>
                <div className="footer-contact-item">
                  <span className="footer-contact-icon">📍</span>
                  <span>{footerData.brand.location}</span>
                </div>
                <div className="footer-contact-item">
                  <span className="footer-contact-icon">🕐</span>
                  <span>{footerData.brand.supportWindow}</span>
                </div>
              </div>

              <div style={{ marginTop:20 }}>
                <span className="footer-badge">
                  <span className="footer-badge-dot" />
                  {footerData.brand.statusText}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ── ECOSYSTEM BELT ── */}
        <div className="footer-belt">
          <div className="footer-container">
            <div className="footer-belt-label">The NextUniVerse Ecosystem</div>
            <div className="footer-belt-scroll">
              {footerData.ecosystem.map((e,i) => (
                <div key={i} className="belt-pill">
                  <span>{e.icon}</span>
                  <span>{e.value ? `${e.label} (${formatCompactNumber(e.value)})` : e.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="footer-container">
          <div className="footer-bottom">
            <div className="footer-copy">
              <span>{footerData.copy.text}</span>
              <span>Made with</span>
              <span className="footer-copy-heart">♥</span>
              <span>{footerData.copy.suffix}</span>
            </div>
            <div className="footer-legal">
              {footerData.links.legal.map((item, i) => (
                <a key={i} href={item.href}>{item.label}</a>
              ))}
            </div>
          </div>
        </div>

      </footer>
    </>
  );
};

export default Footer;