import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const EMOJI_OPTIONS = ['👍', '❤️', '🎉', '🔥', '👏', '💯', '✅', '⭐'];

const TYPE_META = {
  General:     { icon: '📢', color: '#4a9eff', glow: 'rgba(74,158,255,0.25)'   },
  Competition: { icon: '🏆', color: '#f0c040', glow: 'rgba(240,192,64,0.25)'   },
  Deadline:    { icon: '⏰', color: '#ff6b35', glow: 'rgba(255,107,53,0.25)'   },
  Important:   { icon: '⚠️', color: '#ff3d3d', glow: 'rgba(255,61,61,0.28)'    },
  Event:       { icon: '📅', color: '#50fa7b', glow: 'rgba(80,250,123,0.25)'   },
};

const fetchAnnouncements = async (clanId) => {
  const { data } = await api.get(`/clans/${clanId}/announcements`);
  return data?.announcements || [];
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&family=Exo+2:ital,wght@0,300;0,400;0,600;1,300&display=swap');

  .ca-wrap *, .ca-wrap *::before, .ca-wrap *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ca-wrap {
    --bg:       #080b10;
    --s1:       #0d1117;
    --s2:       #131920;
    --s3:       #1a2233;
    --b1:       #1c2637;
    --b2:       #243044;
    --acc:      #00d4ff;
    --acc-dim:  rgba(0,212,255,0.15);
    --acc-glow: rgba(0,212,255,0.35);
    --text:     #b8cfe0;
    --dim:      #4e6a82;
    --gold:     #f0c040;
    --red:      #ff3d3d;
    --green:    #50fa7b;
    --fh: 'Rajdhani', sans-serif;
    --fm: 'Share Tech Mono', monospace;
    --fb: 'Exo 2', sans-serif;

    background: var(--bg);
    min-height: 100vh;
    font-family: var(--fb);
    color: var(--text);
    padding: 32px 20px 80px;
    position: relative;
    overflow-x: hidden;
  }

  /* scanlines */
  .ca-wrap::before {
    content: '';
    position: fixed; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px);
    pointer-events: none; z-index: 9999;
  }
  /* grid */
  .ca-wrap::after {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none; z-index: 0;
  }

  .ca-inner { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }

  /* ── Header ── */
  .ca-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 32px; padding-bottom: 22px;
    border-bottom: 1px solid var(--b1); position: relative;
  }
  .ca-header::after {
    content: ''; position: absolute; bottom: -1px; left: 0;
    width: 110px; height: 1px;
    background: var(--acc); box-shadow: 0 0 14px var(--acc-glow);
  }
  .ca-header-left { display: flex; align-items: center; gap: 14px; }
  .ca-icon-box {
    width: 44px; height: 44px; border-radius: 8px;
    background: var(--acc-dim); border: 1px solid rgba(0,212,255,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; box-shadow: 0 0 18px rgba(0,212,255,0.12); flex-shrink: 0;
  }
  .ca-title {
    font-family: var(--fh); font-size: 28px; font-weight: 700;
    letter-spacing: 2.5px; text-transform: uppercase; color: #fff; line-height: 1;
  }
  .ca-title em { color: var(--acc); font-style: normal; }
  .ca-subtitle { font-family: var(--fm); font-size: 11px; color: var(--dim); letter-spacing: 1.5px; margin-top: 3px; }

  /* ── Broadcast Button ── */
  .btn-broadcast {
    font-family: var(--fh); font-size: 13px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    padding: 10px 20px; border-radius: 4px; cursor: pointer;
    background: transparent; color: var(--acc); border: 1px solid var(--acc);
    position: relative; overflow: hidden;
    transition: color 0.22s ease, box-shadow 0.22s ease;
  }
  .btn-broadcast::before {
    content: ''; position: absolute; inset: 0;
    background: var(--acc); transform: scaleX(0); transform-origin: left;
    transition: transform 0.22s ease;
  }
  .btn-broadcast:hover { color: #000; box-shadow: 0 0 24px var(--acc-glow); }
  .btn-broadcast:hover::before { transform: scaleX(1); }
  .btn-broadcast span { position: relative; z-index: 1; }

  /* ── Info Banner ── */
  .ca-banner {
    margin-bottom: 20px; padding: 11px 16px;
    background: rgba(0,212,255,0.04); border: 1px solid rgba(0,212,255,0.12);
    border-left: 3px solid var(--acc); border-radius: 4px;
    font-family: var(--fm); font-size: 12px; color: var(--dim); letter-spacing: 0.5px;
  }

  /* ── Card ── */
  .ann-card {
    background: var(--s1); border: 1px solid var(--b1); border-radius: 8px;
    margin-bottom: 16px; position: relative; overflow: hidden;
    transition: border-color 0.2s, transform 0.18s, box-shadow 0.2s;
  }
  .ann-card:hover { border-color: var(--b2); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
  .ann-card.is-pinned {
    border-top-color: var(--acc); border-top-width: 2px;
    box-shadow: 0 0 28px rgba(0,212,255,0.07), inset 0 0 50px rgba(0,212,255,0.02);
  }
  .ann-strip { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; }
  .ann-body { padding: 18px 20px 16px 24px; }

  /* ── Card Top Row ── */
  .ann-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
  .ann-user { display: flex; align-items: center; gap: 11px; }
  .ann-avatar {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    background: var(--s3); border: 1px solid var(--b2);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--fh); font-size: 13px; font-weight: 700; color: var(--acc); overflow: hidden;
  }
  .ann-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .ann-name { font-family: var(--fh); font-size: 15px; font-weight: 700; color: #fff; letter-spacing: 0.4px; line-height: 1.2; }
  .ann-role { font-family: var(--fm); font-size: 10px; color: var(--gold); letter-spacing: 1.2px; text-transform: uppercase; }
  .ann-time { font-family: var(--fm); font-size: 11px; color: var(--dim); margin-top: 1px; }

  .ann-tags { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .ann-tag {
    font-family: var(--fm); font-size: 10px; letter-spacing: 1px;
    text-transform: uppercase; padding: 3px 8px; border-radius: 3px;
    border: 1px solid; display: flex; align-items: center; gap: 4px; white-space: nowrap;
  }
  .ann-tag-pin { color: var(--acc); border-color: rgba(0,212,255,0.4); background: rgba(0,212,255,0.08); }

  /* ── Content Box ── */
  .ann-content {
    padding: 13px 15px; border-radius: 5px;
    background: var(--s2); border: 1px solid var(--b1); margin-bottom: 14px;
  }
  .ann-content.is-important { border-left: 3px solid var(--red); background: rgba(255,61,61,0.04); }
  .ann-content-title { font-family: var(--fh); font-size: 19px; font-weight: 700; color: #fff; letter-spacing: 0.3px; margin-bottom: 7px; line-height: 1.3; }
  .ann-content-body { font-size: 14px; line-height: 1.65; color: var(--text); white-space: pre-wrap; }

  .ann-sep { height: 1px; background: var(--b1); margin: 2px 0 12px; }

  /* ── Reactions ── */
  .ann-reactions { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .r-btn {
    display: flex; align-items: center; gap: 5px;
    font-family: var(--fm); font-size: 12px;
    padding: 4px 10px; border-radius: 4px; cursor: pointer;
    background: var(--s2); border: 1px solid var(--b2); color: var(--text); transition: all 0.15s;
  }
  .r-btn:hover { border-color: var(--acc); color: #fff; }
  .r-btn.active { background: var(--acc-dim); border-color: var(--acc); color: var(--acc); box-shadow: 0 0 10px rgba(0,212,255,0.18); }
  .r-add {
    width: 30px; height: 30px; border-radius: 4px; cursor: pointer;
    background: var(--s2); border: 1px dashed var(--b2); color: var(--dim);
    font-size: 15px; display: flex; align-items: center; justify-content: center; transition: all 0.15s;
  }
  .r-add:hover { border-color: var(--acc); color: var(--acc); }

  /* ── Empty / Loading ── */
  .ca-empty {
    text-align: center; padding: 64px 20px;
    border: 1px dashed var(--b1); border-radius: 8px;
    font-family: var(--fm); color: var(--dim); font-size: 13px; letter-spacing: 1px;
  }
  .ca-empty-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.5; }

  /* ── Modal Overlay ── */
  .ca-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.88); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: caFadeIn 0.15s ease;
  }
  @keyframes caFadeIn { from { opacity: 0 } to { opacity: 1 } }

  .ca-modal {
    background: var(--s1); border: 1px solid var(--b2);
    border-top: 2px solid var(--acc); border-radius: 8px;
    width: 100%; max-width: 520px;
    max-height: 80vh; overflow: hidden;
    box-shadow: 0 0 60px rgba(0,212,255,0.08);
    animation: caSlideUp 0.2s ease;
  }
  @keyframes caSlideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

  .ca-modal-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--b1);
  }
  .ca-modal-title { font-family: var(--fh); font-size: 19px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #fff; }
  .ca-modal-title em { color: var(--acc); font-style: normal; }
  .ca-modal-close { background: none; border: none; cursor: pointer; color: var(--dim); font-size: 18px; line-height: 1; padding: 4px 6px; transition: color 0.15s; border-radius: 3px; }
  .ca-modal-close:hover { color: var(--red); }

  .ca-modal-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }

  /* keep modal body scrollable when tall content appears */
  .ca-modal-body { overflow: auto; max-height: calc(80vh - 160px); padding: 18px; }

  .ca-field { display: flex; flex-direction: column; gap: 7px; }
  .ca-label { font-family: var(--fm); font-size: 10px; color: var(--acc); letter-spacing: 2px; text-transform: uppercase; }
  .ca-input, .ca-select, .ca-textarea {
    width: 100%; background: var(--s2); border: 1px solid var(--b2);
    border-radius: 5px; color: var(--text); font-family: var(--fb);
    font-size: 14px; padding: 10px 13px; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s; -webkit-appearance: none;
  }
  .ca-input::placeholder, .ca-textarea::placeholder { color: var(--dim); }
  .ca-input:focus, .ca-select:focus, .ca-textarea:focus { border-color: var(--acc); box-shadow: 0 0 0 2px rgba(0,212,255,0.12); }
  .ca-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
  .ca-select option { background: #131920; }

  .ca-modal-foot {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-top: 1px solid var(--b1); gap: 10px;
  }
  .btn-pin { font-family: var(--fm); font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; padding: 8px 13px; border-radius: 4px; cursor: pointer; transition: all 0.15s; }
  .btn-pin.off { background: transparent; border: 1px dashed var(--b2); color: var(--dim); }
  .btn-pin.off:hover { border-color: var(--acc); color: var(--acc); }
  .btn-pin.on { background: var(--acc-dim); border: 1px solid var(--acc); color: var(--acc); }

  .btn-cancel { font-family: var(--fb); font-size: 13px; padding: 9px 18px; background: transparent; border: 1px solid var(--b2); border-radius: 4px; color: var(--dim); cursor: pointer; transition: all 0.15s; }
  .btn-cancel:hover { border-color: var(--red); color: var(--red); }

  .btn-post { font-family: var(--fh); font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 10px 24px; background: var(--acc); color: #000; border: none; border-radius: 4px; cursor: pointer; transition: background 0.15s, box-shadow 0.15s; }
  .btn-post:hover { background: #00eeff; box-shadow: 0 0 24px var(--acc-glow); }
  .btn-post:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Toast ── */
  .ca-toast {
    position: fixed; bottom: 26px; right: 26px; z-index: 2000;
    background: var(--s2); border: 1px solid var(--b2); border-left: 3px solid;
    border-radius: 5px; padding: 13px 20px;
    font-family: var(--fm); font-size: 12px; letter-spacing: 0.5px;
    max-width: 340px; animation: caSlideInR 0.25s ease;
  }
  @keyframes caSlideInR { from { transform: translateX(40px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
  .ca-toast.success { border-left-color: var(--green); color: var(--green); }
  .ca-toast.error   { border-left-color: var(--red);   color: var(--red);   }
  .ca-toast.warning { border-left-color: var(--gold);  color: var(--gold);  }

  /* Inline container (non-fullscreen) */
  .ca-inline-container { margin: 12px 0 18px; }
  .ca-inline-container .ca-modal { box-shadow: 0 8px 30px rgba(0,0,0,0.45); }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className={`ca-toast ${type}`}>{message}</div>;
};

// ─── AnnouncementCard ─────────────────────────────────────────────────────────
const AnnouncementCard = React.memo(({ announcement, onReact, userRole }) => {
  const meta = TYPE_META[announcement.type] || TYPE_META.General;
  const initials = announcement.userName?.slice(0, 2).toUpperCase();
  const existingEmojis = new Set(announcement.reactions?.map((r) => r.emoji) ?? []);
  const availableEmojis = EMOJI_OPTIONS.filter((e) => !existingEmojis.has(e));

  return (
    <div className={`ann-card${announcement.isPinned ? ' is-pinned' : ''}`}>
      <div
        className="ann-strip"
        style={{ background: meta.color, boxShadow: `0 0 12px ${meta.glow}` }}
      />
      <div className="ann-body">
        {/* Top row */}
        <div className="ann-top">
          <div className="ann-user">
            <div className="ann-avatar">
              {announcement.userProfileImage
                ? <img src={announcement.userProfileImage} alt={announcement.userName} />
                : initials}
            </div>
            <div>
              <div className="ann-name">{announcement.userName}</div>
              {announcement.userRole && (
                <div className="ann-role">◈ {announcement.userRole}</div>
              )}
              <div className="ann-time">{timeAgo(announcement.createdAt)}</div>
            </div>
          </div>
          <div className="ann-tags">
            {announcement.isPinned && (
              <div className="ann-tag ann-tag-pin">📌 Pinned</div>
            )}
            <div
              className="ann-tag"
              style={{
                color: meta.color,
                borderColor: meta.color + '77',
                background: meta.glow,
              }}
            >
              {meta.icon} {announcement.type}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`ann-content${announcement.type === 'Important' ? ' is-important' : ''}`}>
          <div className="ann-content-title">{announcement.title}</div>
          <div className="ann-content-body">{announcement.content}</div>
        </div>

        <div className="ann-sep" />

        {/* Reactions */}
        <div className="ann-reactions">
          {announcement.reactions?.map((reaction) => (
            <button
              key={reaction.emoji}
              className={`r-btn${announcement.myReaction === reaction.emoji ? ' active' : ''}`}
              onClick={() => onReact(announcement.id, reaction.emoji)}
              title={reaction.userNames?.join(', ')}
            >
              <span>{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </button>
          ))}
          {availableEmojis.map((emoji) => (
            <button
              key={emoji}
              className="r-add"
              onClick={() => onReact(announcement.id, emoji)}
              aria-label={`React with ${emoji}`}
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

// ─── Create Announcement Modal ────────────────────────────────────────────────
const CreateAnnouncementModal = ({ isOpen, onClose, clanId, inline = false }) => {

  const [title, setTitle]       = useState('');
  const [content, setContent]   = useState('');
  const [type, setType]         = useState('General');
  const [isPinned, setIsPinned] = useState(false);
  const queryClient             = useQueryClient();
  const [toast, setToast]       = useState(null);

  const showToast = (message, kind) => setToast({ message, kind, key: Date.now() });

  useEffect(() => {
    if (!isOpen) {
      setTitle(''); setContent(''); setType('General'); setIsPinned(false);
    }
  }, [isOpen]);

  const createMutation = useMutation({
    mutationFn: (data) => api.post(`/clans/${clanId}/announcements`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clanAnnouncements', clanId]);
      showToast('// Announcement broadcast successfully', 'success');
      setTimeout(onClose, 1200);
    },
    onError: (error) => {
      showToast(error.response?.data?.message || '// Error creating announcement', 'error');
    },
  });

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('// Title and content required', 'warning');
      return;
    }
    createMutation.mutate({ title, content, type, isPinned });
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="ca-modal">
      <div className="ca-modal-head">
        <div className="ca-modal-title">New <em>Transmission</em></div>
        <button className="ca-modal-close" onClick={onClose}>✕</button>
      </div>

      <div className="ca-modal-body">
        <div className="ca-field">
          <label className="ca-label">// Type</label>
          <select className="ca-select" value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(TYPE_META).map(([val, m]) => (
              <option key={val} value={val}>{m.icon}  {val}</option>
            ))}
          </select>
        </div>
        <div className="ca-field">
          <label className="ca-label">// Title</label>
          <input
            className="ca-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title..."
            maxLength={200}
          />
        </div>
        <div className="ca-field">
          <label className="ca-label">// Content</label>
          <textarea
            className="ca-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Broadcast your message to the clan..."
            rows={4}
          />
        </div>
      </div>

      <div className="ca-modal-foot">
        <button
          className={`btn-pin ${isPinned ? 'on' : 'off'}`}
          onClick={() => setIsPinned((p) => !p)}
        >
          📌 {isPinned ? 'Pinned' : 'Pin this'}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="btn-post"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? '...' : 'Broadcast'}
          </button>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="ca-inline-container">
        {modalContent}
        {toast && <Toast key={toast.key} message={toast.message} type={toast.kind} onDone={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <>
      <div className="ca-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {modalContent}
      </div>
      {toast && <Toast key={toast.key} message={toast.message} type={toast.kind} onDone={() => setToast(null)} />}
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ClanAnnouncements = ({ userRole }) => {
  const { clanId }                = useParams();
  const queryClient               = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast]         = useState(null);

  const showToast = (message, type = 'error') => setToast({ message, type, key: Date.now() });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['clanAnnouncements', clanId],
    queryFn: () => fetchAnnouncements(clanId),
  });

  const reactMutation = useMutation({
    mutationFn: ({ announcementId, emoji }) =>
      api.post(`/clans/${clanId}/announcements/${announcementId}/react`, { emoji }),
    onMutate: async ({ announcementId, emoji }) => {
      await queryClient.cancelQueries(['clanAnnouncements', clanId]);
      const prev = queryClient.getQueryData(['clanAnnouncements', clanId]);
      queryClient.setQueryData(['clanAnnouncements', clanId], (old) =>
        old?.map((ann) => {
          if (ann.id !== announcementId) return ann;
          const alreadyReacted = ann.myReaction === emoji;
          const reactions = [...(ann.reactions ?? [])];
          const idx = reactions.findIndex((r) => r.emoji === emoji);
          if (alreadyReacted) {
            const updated = idx >= 0
              ? reactions
                  .map((r, i) => i === idx ? { ...r, count: r.count - 1, userNames: r.userNames.slice(1) } : r)
                  .filter((r) => r.count > 0)
              : reactions;
            return { ...ann, reactions: updated, myReaction: null };
          } else {
            const updated = idx >= 0
              ? reactions.map((r, i) =>
                  i === idx ? { ...r, count: r.count + 1, userNames: ['You', ...r.userNames] } : r
                )
              : [...reactions, { emoji, count: 1, userNames: ['You'] }];
            return { ...ann, reactions: updated, myReaction: emoji };
          }
        })
      );
      return { prev };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(['clanAnnouncements', clanId], context.prev);
      showToast('// Failed to register reaction', 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['clanAnnouncements', clanId]);
    },
  });

  const handleReact = useCallback(
    (announcementId, emoji) => reactMutation.mutate({ announcementId, emoji }),
    [reactMutation]
  );

  const normalizedRole = (userRole || "").toLowerCase().replace(/[-_\s]/g, "");
  const canPost = ["leader", "coleader"].includes(normalizedRole);

  return (
    <>
      <style>{CSS}</style>
      <div className="ca-wrap">
        <div className="ca-inner">

          {/* Header */}
          <div className="ca-header">
            <div className="ca-header-left">
              <div className="ca-icon-box">📡</div>
              <div>
                <div className="ca-title">Clan <em>Comms</em></div>
                <div className="ca-subtitle">&gt; ANNOUNCEMENTS CHANNEL</div>
              </div>
            </div>
              {canPost && (
                <button className="btn-broadcast" onClick={() => setModalOpen(true)}>
                  <span>+ Broadcast</span>
                </button>
              )}
            </div>

            {/* Inline form (shows right under header, no fullscreen overlay) */}
            {modalOpen && (
              <CreateAnnouncementModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                clanId={clanId}
                inline
              />
            )}

          {/* Role banner */}
          {!canPost && (
            <div className="ca-banner">
              &gt; READ-ONLY — Only Leaders and Co-Leaders may broadcast to the clan
            </div>
          )}

          {/* List */}
          {isLoading ? (
            <div className="ca-empty">
              <div className="ca-empty-icon">📡</div>
              <div>LOADING TRANSMISSIONS...</div>
            </div>
          ) : announcements && announcements.length > 0 ? (
            announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onReact={handleReact}
                userRole={userRole}
              />
            ))
          ) : (
            <div className="ca-empty">
              <div className="ca-empty-icon">📡</div>
              <div>NO TRANSMISSIONS FOUND</div>
            </div>
          )}

        </div>
      </div>

      {/* overlay fallback: render nothing here (inline version used above) */}

      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </>
  );
};

export default ClanAnnouncements;