import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// ── Inject Google Fonts + global styles once ──────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #07070f;
      --surface:   #0e0e1a;
      --card:      #12121f;
      --border:    rgba(255,255,255,0.07);
      --border-hi: rgba(255,255,255,0.14);
      --text:      #e8e6f0;
      --muted:     #7b78a0;
      --accent:    #a78bfa;
      --accent2:   #7c3aed;
      --pink:      #E2136E;
      --orange:    #F78C23;
      --blue:      #60a5fa;
      --glow:      rgba(167,139,250,0.18);
      --font-head: 'Playfair Display', Georgia, serif;
      --font-body: 'DM Sans', sans-serif;
    }

    body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 3px; }

    /* ── Cosmic Background ── */
    .checkout-root {
      min-height: 100vh;
      background:
        radial-gradient(ellipse 60% 50% at 20% 10%, rgba(124,58,237,0.12) 0%, transparent 60%),
        radial-gradient(ellipse 50% 40% at 80% 80%, rgba(167,139,250,0.08) 0%, transparent 55%),
        radial-gradient(ellipse 80% 60% at 50% 50%, rgba(7,7,15,1) 0%, transparent 100%),
        var(--bg);
      padding: 40px 20px 80px;
      font-family: var(--font-body);
    }

    /* ── Stars ── */
    .stars {
      position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
    }
    .star {
      position: absolute; width: 2px; height: 2px;
      background: #fff; border-radius: 50%;
      animation: twinkle var(--dur) ease-in-out infinite;
      opacity: 0;
    }
    @keyframes twinkle {
      0%,100% { opacity: 0; transform: scale(0.8); }
      50% { opacity: var(--op); transform: scale(1.2); }
    }

    /* ── Layout ── */
    .checkout-inner {
      position: relative; z-index: 1;
      max-width: 1080px; margin: 0 auto;
    }

    /* ── Back Button ── */
    .btn-back {
      display: inline-flex; align-items: center; gap: 8px;
      background: none; border: 1px solid var(--border);
      color: var(--muted); font-family: var(--font-body);
      font-size: 14px; padding: 10px 18px; border-radius: 10px;
      cursor: pointer; margin-bottom: 36px;
      transition: all 0.2s;
    }
    .btn-back:hover { border-color: var(--accent); color: var(--accent); background: var(--glow); }

    /* ── Grid ── */
    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 28px;
      align-items: start;
    }
    @media (max-width: 860px) {
      .checkout-grid { grid-template-columns: 1fr; }
    }

    /* ── Card ── */
    .c-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      overflow: hidden;
    }
    .c-card-header {
      padding: 28px 32px 22px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
    }
    .c-card-body { padding: 32px; }

    /* ── Heading ── */
    .heading-lg {
      font-family: var(--font-head);
      font-size: 26px; font-weight: 600;
      color: var(--text);
      letter-spacing: -0.3px;
    }
    .heading-md {
      font-family: var(--font-head);
      font-size: 20px; font-weight: 600;
      color: var(--text);
    }
    .sub-text { font-size: 13px; color: var(--muted); margin-top: 4px; }

    /* ── Secure Badge ── */
    .badge-secure {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.2);
      color: var(--accent); font-size: 11px; font-weight: 600;
      padding: 4px 10px; border-radius: 20px; letter-spacing: 0.6px;
      text-transform: uppercase;
    }

    /* ── Progress ── */
    .progress-row { margin-bottom: 32px; }
    .progress-label { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .progress-label span { font-size: 13px; color: var(--muted); }
    .progress-track {
      height: 3px; background: var(--border); border-radius: 2px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; width: 100%; border-radius: 2px;
      background: linear-gradient(90deg, var(--accent2), var(--accent));
    }

    /* ── Section Label ── */
    .section-label {
      font-size: 11px; font-weight: 600; letter-spacing: 1.2px;
      text-transform: uppercase; color: var(--muted); margin-bottom: 16px;
    }

    /* ── Payment Method Cards ── */
    .pm-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
    .pm-item {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 18px; border-radius: 12px;
      border: 1px solid var(--border);
      cursor: pointer; transition: all 0.2s; position: relative;
      background: transparent;
    }
    .pm-item:hover { border-color: var(--border-hi); background: rgba(255,255,255,0.02); }
    .pm-item.active { background: rgba(167,139,250,0.06); }
    .pm-item.active-bkash { border-color: rgba(226,19,110,0.5); background: rgba(226,19,110,0.05); }
    .pm-item.active-nagad { border-color: rgba(247,140,35,0.5); background: rgba(247,140,35,0.05); }
    .pm-item.active-card  { border-color: rgba(96,165,250,0.5); background: rgba(96,165,250,0.05); }

    .pm-radio {
      width: 18px; height: 18px; border-radius: 50%;
      border: 2px solid var(--border-hi); flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .pm-radio.checked-bkash { border-color: var(--pink); background: rgba(226,19,110,0.15); }
    .pm-radio.checked-nagad { border-color: var(--orange); background: rgba(247,140,35,0.15); }
    .pm-radio.checked-card  { border-color: var(--blue);  background: rgba(96,165,250,0.15); }
    .pm-radio-dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot-bkash { background: var(--pink); }
    .dot-nagad { background: var(--orange); }
    .dot-card  { background: var(--blue); }

    .pm-icon { font-size: 20px; }
    .pm-label { font-size: 15px; font-weight: 500; color: var(--text); }
    .pm-desc  { font-size: 12px; color: var(--muted); }

    /* ── Form ── */
    .form-group { margin-bottom: 20px; }
    .form-label {
      display: block; font-size: 12px; font-weight: 500;
      letter-spacing: 0.4px; color: var(--muted); margin-bottom: 8px;
      text-transform: uppercase;
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .input-wrap { position: relative; }
    .input-icon {
      position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
      color: var(--muted); font-size: 16px; pointer-events: none;
      display: flex; align-items: center;
    }
    .input-icon-right {
      position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
      color: var(--muted); font-size: 14px; pointer-events: none;
    }

    .c-input {
      width: 100%; background: rgba(255,255,255,0.03);
      border: 1px solid var(--border); border-radius: 12px;
      color: var(--text); font-family: var(--font-body);
      font-size: 15px; padding: 14px 16px;
      outline: none; transition: all 0.2s;
    }
    .c-input.has-icon { padding-left: 44px; }
    .c-input.has-icon-right { padding-right: 44px; }
    .c-input::placeholder { color: var(--muted); }
    .c-input:focus {
      border-color: var(--accent);
      background: rgba(167,139,250,0.04);
      box-shadow: 0 0 0 3px rgba(167,139,250,0.1);
    }

    /* ── Alert ── */
    .c-alert {
      display: flex; align-items: flex-start; gap: 12px;
      background: rgba(96,165,250,0.06); border: 1px solid rgba(96,165,250,0.15);
      border-radius: 12px; padding: 14px 16px; margin-bottom: 24px;
    }
    .c-alert-icon { font-size: 16px; color: var(--blue); flex-shrink: 0; margin-top: 1px; }
    .c-alert-text { font-size: 13px; color: #93c5fd; line-height: 1.5; }

    /* ── Pay Button ── */
    .btn-pay {
      width: 100%; height: 58px;
      background: linear-gradient(135deg, var(--accent2) 0%, var(--accent) 100%);
      border: none; border-radius: 14px;
      color: #fff; font-family: var(--font-body);
      font-size: 16px; font-weight: 600; letter-spacing: 0.3px;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
      transition: all 0.25s; position: relative; overflow: hidden;
    }
    .btn-pay::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
      opacity: 0; transition: opacity 0.2s;
    }
    .btn-pay:hover::before { opacity: 1; }
    .btn-pay:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(124,58,237,0.45); }
    .btn-pay:active { transform: translateY(0); }
    .btn-pay:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    /* ── Divider ── */
    .c-divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }

    /* ── Order Summary ── */
    .summary-card { position: sticky; top: 24px; }
    .order-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; }
    .order-label { font-size: 13px; color: var(--muted); }
    .order-value { font-size: 14px; font-weight: 500; color: var(--text); text-align: right; max-width: 60%; }
    .order-total-label { font-size: 15px; font-weight: 600; color: var(--text); }
    .order-total-value {
      font-family: var(--font-head); font-size: 28px; font-weight: 700;
      background: linear-gradient(135deg, var(--accent2), var(--accent));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    /* ── Shield Box ── */
    .shield-box {
      display: flex; align-items: flex-start; gap: 14px;
      background: rgba(167,139,250,0.05); border: 1px solid rgba(167,139,250,0.12);
      border-radius: 14px; padding: 16px; margin-top: 20px;
    }
    .shield-icon { font-size: 24px; }
    .shield-title { font-size: 14px; font-weight: 600; color: var(--accent); margin-bottom: 3px; }
    .shield-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }

    /* ── Help ── */
    .help-card { text-align: center; padding: 18px; margin-top: 16px; }
    .help-card .c-card { background: var(--surface); }
    .help-text { font-size: 13px; color: var(--muted); }
    .help-link {
      color: var(--accent); text-decoration: none; font-weight: 500;
      background: none; border: none; cursor: pointer;
      font-family: var(--font-body); font-size: 13px;
    }
    .help-link:hover { text-decoration: underline; }

    /* ── Toast ── */
    .toast-container {
      position: fixed; bottom: 32px; right: 32px; z-index: 9999;
      display: flex; flex-direction: column; gap: 10px;
    }
    .toast {
      min-width: 300px; padding: 14px 18px;
      border-radius: 14px; display: flex; align-items: center; gap: 12px;
      font-size: 14px; color: var(--text); font-family: var(--font-body);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      animation: toastIn 0.3s ease;
      border: 1px solid var(--border);
    }
    .toast.success { background: #0a1a0f; border-color: rgba(52,211,153,0.3); }
    .toast.error   { background: #1a0a0a; border-color: rgba(248,113,113,0.3); }
    .toast.warning { background: #1a150a; border-color: rgba(251,191,36,0.3); }
    .toast-icon { font-size: 18px; flex-shrink: 0; }
    .toast-title { font-weight: 600; font-size: 14px; }
    .toast-desc  { font-size: 12px; color: var(--muted); margin-top: 2px; }
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    /* ── Loading Spinner ── */
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner {
      width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* ── Animate in ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.5s ease forwards; }
    .delay-1 { animation-delay: 0.1s; opacity: 0; }
    .delay-2 { animation-delay: 0.2s; opacity: 0; }
  `}</style>
);

// ── Star Background ─────────────────────────────────────────────────────────
const Stars = () => {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    dur: `${2 + Math.random() * 4}s`,
    op: (0.2 + Math.random() * 0.5).toFixed(2),
    delay: `${Math.random() * 4}s`,
    size: Math.random() > 0.8 ? '3px' : '2px',
  }));
  return (
    <div className="stars">
      {stars.map(s => (
        <div key={s.id} className="star" style={{
          top: s.top, left: s.left,
          width: s.size, height: s.size,
          '--dur': s.dur, '--op': s.op,
          animationDelay: s.delay,
        }} />
      ))}
    </div>
  );
};

// ── Toast System ─────────────────────────────────────────────────────────────
const ToastContainer = ({ toasts }) => (
  <div className="toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`toast ${t.status}`}>
        <span className="toast-icon">
          {t.status === 'success' ? '✅' : t.status === 'error' ? '❌' : '⚠️'}
        </span>
        <div>
          <div className="toast-title">{t.title}</div>
          {t.description && <div className="toast-desc">{t.description}</div>}
        </div>
      </div>
    ))}
  </div>
);

// ── Icons (inline SVG) ───────────────────────────────────────────────────────
const IconLock    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>;
const IconCard    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>;
const IconPhone   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;
const IconShield  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>;
const IconArrow   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>;
const IconPay     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>;
const IconInfo    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>;

// ── Main Component ───────────────────────────────────────────────────────────
export default function Checkout() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const navigate = useNavigate();

  const [name, setName]       = useState('');
  const [card, setCard]       = useState('');
  const [phone, setPhone]     = useState('');
  const [method, setMethod]   = useState(searchParams.get('method') || 'bkash');
  const [expiry, setExpiry]   = useState('');
  const [cvv, setCvv]         = useState('');
  const [loading, setLoading] = useState(false);
  const [course, setCourse]   = useState(null);
  const [courseLoading, setCourseLoading] = useState(false);
  const [toasts, setToasts]   = useState([]);

  const addToast = (title, description, status) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, status }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handlePay = async () => {
    if (!name.trim()) { addToast('Name required', 'Please enter your full name', 'warning'); return; }
    if (method === 'card') {
      if (!card.trim() || card.length < 16) { addToast('Invalid card', 'Please enter a valid card number', 'warning'); return; }
      if (!expiry.trim()) { addToast('Expiry required', 'Please enter card expiry date', 'warning'); return; }
      if (!cvv.trim() || cvv.length < 3) { addToast('CVV required', 'Please enter card CVV', 'warning'); return; }
    } else {
      if (!phone.trim() || phone.length < 11) { addToast('Phone required', 'Please enter a valid phone number', 'warning'); return; }
    }

    setLoading(true);
    try {
      const { default: api } = await import('../../services/api');
      const payload = { paymentMethod: method };
      if (method === 'bkash' || method === 'nagad') payload.phoneNumber = phone;
      if (method === 'card') payload.cardDetails = {
        cardNumber: card, cardHolderName: name,
        expiryMonth: expiry.split('/')[0] || '01',
        expiryYear: '20' + (expiry.split('/')[1] || '30'), cvv,
      };
      const res = await api.post(`/payments/course/${courseId}`, payload);
      if (res?.data?.success) {
        addToast('Payment Successful!', 'Your course has been purchased successfully', 'success');
        setTimeout(() => navigate(`/courses/${courseId}`), 2000);
      } else {
        addToast('Payment Failed', res?.data?.message || 'Unable to process payment', 'error');
      }
    } catch (err) {
      addToast('Payment Error', err.response?.data?.message || err.message || 'Something went wrong', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    (async () => {
      setCourseLoading(true);
      try {
        const { courseService } = await import('../../services/courseService');
        const data = await courseService.getCourseById(courseId);
        if (mounted) setCourse(data || null);
      } catch (err) { console.error(err); }
      finally { if (mounted) setCourseLoading(false); }
    })();
    return () => { mounted = false; };
  }, [courseId]);

  const paymentMethods = [
    { id: 'bkash', label: 'bKash',            desc: 'Mobile Banking',        emoji: '🩷', colorClass: 'bkash' },
    { id: 'nagad', label: 'Nagad',             desc: 'Mobile Banking',        emoji: '🧡', colorClass: 'nagad' },
    { id: 'card',  label: 'Credit/Debit Card', desc: 'Visa, Mastercard, etc.', emoji: '💳', colorClass: 'card'  },
  ];

  const getPayBtnLabel = () => {
    if (loading) return null;
    if (method === 'card') return 'Pay with Card';
    return `Pay with ${method === 'bkash' ? 'bKash' : 'Nagad'}`;
  };

  return (
    <>
      <GlobalStyle />
      <div className="checkout-root">
        <Stars />
        <div className="checkout-inner">

          {/* Back */}
          <button className="btn-back fade-up" onClick={() => navigate(-1)}>
            <IconArrow /> Back to Course
          </button>

          <div className="checkout-grid">
            {/* ── LEFT: Payment Form ── */}
            <div className="fade-up delay-1">
              <div className="c-card">
                <div className="c-card-header">
                  <div>
                    <div className="heading-lg">Secure Payment</div>
                    <div className="sub-text">Complete your purchase</div>
                  </div>
                  <span className="badge-secure">🔒 Secure</span>
                </div>

                <div className="c-card-body">
                  {/* Progress */}
                  <div className="progress-row">
                    <div className="progress-label">
                      <span>Step 2 of 2: Payment</span>
                      <span style={{ color: 'var(--accent)' }}>100%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" />
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="section-label">Select Payment Method</div>
                  <div className="pm-list">
                    {paymentMethods.map(pm => {
                      const active = method === pm.id;
                      return (
                        <div
                          key={pm.id}
                          className={`pm-item ${active ? `active-${pm.colorClass}` : ''}`}
                          onClick={() => setMethod(pm.id)}
                        >
                          <div className={`pm-radio ${active ? `checked-${pm.colorClass}` : ''}`}>
                            {active && <div className={`pm-radio-dot dot-${pm.colorClass}`} />}
                          </div>
                          <span className="pm-icon">{pm.emoji}</span>
                          <div>
                            <div className="pm-label">{pm.label}</div>
                            <div className="pm-desc">{pm.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Form Fields */}
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      className="c-input"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>

                  {method === 'card' ? (
                    <>
                      <div className="form-group">
                        <label className="form-label">Card Number</label>
                        <div className="input-wrap">
                          <span className="input-icon"><IconCard /></span>
                          <input
                            className="c-input has-icon"
                            placeholder="1234 5678 9012 3456"
                            value={card}
                            maxLength={16}
                            onChange={e => setCard(e.target.value.replace(/\s/g, ''))}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Expiry Date</label>
                          <input
                            className="c-input"
                            placeholder="MM/YY"
                            value={expiry}
                            maxLength={5}
                            onChange={e => setExpiry(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">CVV</label>
                          <div className="input-wrap">
                            <input
                              className="c-input has-icon-right"
                              placeholder="123"
                              value={cvv}
                              maxLength={3}
                              type="password"
                              onChange={e => setCvv(e.target.value)}
                            />
                            <span className="input-icon-right"><IconLock /></span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <div className="input-wrap">
                        <span className="input-icon"><IconPhone /></span>
                        <input
                          className="c-input has-icon"
                          placeholder="01XXXXXXXXX"
                          value={phone}
                          type="tel"
                          onChange={e => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Security Alert */}
                  <div className="c-alert">
                    <span className="c-alert-icon"><IconInfo /></span>
                    <div className="c-alert-text">
                      Your payment is secured with SSL encryption. We never store your card details.
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button className="btn-pay" onClick={handlePay} disabled={loading}>
                    {loading ? (
                      <><div className="spinner" /> Processing Payment…</>
                    ) : (
                      <><IconPay /> {getPayBtnLabel()}</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Order Summary ── */}
            <div className="fade-up delay-2">
              <div className="c-card summary-card">
                <div className="c-card-header">
                  <div className="heading-md">Order Summary</div>
                </div>
                <div className="c-card-body">
                  <div className="order-row">
                    <span className="order-label">Course</span>
                    <span className="order-value">
                      {course ? course.title : courseId ? `Course #${courseId}` : '—'}
                    </span>
                  </div>

                  <hr className="c-divider" />

                  <div className="order-row" style={{ marginTop: 4 }}>
                    <span className="order-total-label">Total</span>
                    <span className="order-total-value">
                      {courseLoading ? '…' : course ? `৳${course.price ?? 0}` : '৳0'}
                    </span>
                  </div>

                  <div className="shield-box">
                    <span className="shield-icon"><IconShield /></span>
                    <div>
                      <div className="shield-title">100% Secure Payment</div>
                      <div className="shield-desc">Protected with 256-bit SSL encryption. Your information is always safe.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help */}
              <div className="c-card" style={{ marginTop: 16, background: 'var(--surface)' }}>
                <div className="c-card-body" style={{ textAlign: 'center', padding: '18px' }}>
                  <span className="help-text">Need help? </span>
                  <button className="help-link">Contact Support</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </>
  );
}