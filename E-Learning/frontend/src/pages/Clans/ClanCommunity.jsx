import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const EMOJI_OPTIONS = ['👍', '❤️', '🎉', '🔥', '👏', '💯', '✅', '⭐'];

const fetchPosts = async (clanId) => {
  const { data } = await api.get(`/clans/${clanId}/posts`);
  return data?.posts || [];
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&family=Exo+2:wght@300;400;600&display=swap');

  .cc-wrap *, .cc-wrap *::before, .cc-wrap *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cc-wrap {
    --bg:       #080b10;
    --s1:       #0d1117;
    --s2:       #131920;
    --s3:       #1a2233;
    --b1:       #1c2637;
    --b2:       #243044;
    --acc:      #00d4ff;
    --acc-dim:  rgba(0,212,255,0.12);
    --acc-glow: rgba(0,212,255,0.35);
    --green:    #50fa7b;
    --green-dim:rgba(80,250,123,0.12);
    --red:      #ff3d3d;
    --red-dim:  rgba(255,61,61,0.12);
    --gold:     #f0c040;
    --text:     #b8cfe0;
    --dim:      #4e6a82;
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

  .cc-wrap::before {
    content: '';
    position: fixed; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px);
    pointer-events: none; z-index: 9999;
  }
  .cc-wrap::after {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none; z-index: 0;
  }

  .cc-inner { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }

  /* ── Header ── */
  .cc-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; padding-bottom: 20px;
    border-bottom: 1px solid var(--b1); position: relative;
  }
  .cc-header::after {
    content: ''; position: absolute; bottom: -1px; left: 0;
    width: 110px; height: 1px;
    background: var(--green); box-shadow: 0 0 14px rgba(80,250,123,0.4);
  }
  .cc-header-left { display: flex; align-items: center; gap: 14px; }
  .cc-icon-box {
    width: 44px; height: 44px; border-radius: 8px;
    background: var(--green-dim); border: 1px solid rgba(80,250,123,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; box-shadow: 0 0 18px rgba(80,250,123,0.1); flex-shrink: 0;
  }
  .cc-title {
    font-family: var(--fh); font-size: 28px; font-weight: 700;
    letter-spacing: 2.5px; text-transform: uppercase; color: #fff; line-height: 1;
  }
  .cc-title em { color: var(--green); font-style: normal; }
  .cc-subtitle { font-family: var(--fm); font-size: 11px; color: var(--dim); letter-spacing: 1.5px; margin-top: 3px; }

  /* ── Post Button ── */
  .btn-post-new {
    font-family: var(--fh); font-size: 13px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    padding: 10px 20px; border-radius: 4px; cursor: pointer;
    background: transparent; color: var(--green); border: 1px solid var(--green);
    position: relative; overflow: hidden;
    transition: color 0.22s ease, box-shadow 0.22s ease;
  }
  .btn-post-new::before {
    content: ''; position: absolute; inset: 0;
    background: var(--green); transform: scaleX(0); transform-origin: left;
    transition: transform 0.22s ease;
  }
  .btn-post-new:hover { color: #000; box-shadow: 0 0 24px rgba(80,250,123,0.35); }
  .btn-post-new:hover::before { transform: scaleX(1); }
  .btn-post-new span { position: relative; z-index: 1; }

  /* ── Info Banner ── */
  .cc-banner {
    margin-bottom: 20px; padding: 11px 16px;
    background: var(--green-dim); border: 1px solid rgba(80,250,123,0.15);
    border-left: 3px solid var(--green); border-radius: 4px;
    font-family: var(--fm); font-size: 12px; color: var(--dim); letter-spacing: 0.5px;
  }

  /* ── Post Card ── */
  .post-card {
    background: var(--s1); border: 1px solid var(--b1); border-radius: 8px;
    margin-bottom: 16px; position: relative; overflow: hidden;
    transition: border-color 0.2s, transform 0.18s, box-shadow 0.2s;
  }
  .post-card:hover { border-color: var(--b2); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
  .post-card.is-pinned {
    border-top: 2px solid var(--green);
    box-shadow: 0 0 28px rgba(80,250,123,0.06), inset 0 0 50px rgba(80,250,123,0.02);
  }
  .post-strip {
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: var(--green); box-shadow: 0 0 10px rgba(80,250,123,0.3);
  }
  .post-body { padding: 18px 20px 16px 24px; }

  /* ── Post Header ── */
  .post-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
  .post-user { display: flex; align-items: center; gap: 11px; }
  .post-avatar {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    background: var(--s3); border: 1px solid var(--b2);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--fh); font-size: 13px; font-weight: 700; color: var(--green);
    overflow: hidden; cursor: pointer; transition: border-color 0.15s;
  }
  .post-avatar:hover { border-color: var(--green); }
  .post-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .post-name {
    font-family: var(--fh); font-size: 15px; font-weight: 700;
    color: #fff; letter-spacing: 0.4px; cursor: pointer; transition: color 0.15s;
  }
  .post-name:hover { color: var(--green); }
  .post-role { font-family: var(--fm); font-size: 10px; color: var(--acc); letter-spacing: 1.2px; text-transform: uppercase; }
  .post-time { font-family: var(--fm); font-size: 11px; color: var(--dim); margin-top: 1px; }

  .post-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .post-views { font-family: var(--fm); font-size: 11px; color: var(--dim); display: flex; align-items: center; gap: 4px; }
  .post-pin-tag {
    font-family: var(--fm); font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
    padding: 3px 8px; border-radius: 3px; border: 1px solid rgba(80,250,123,0.4);
    color: var(--green); background: var(--green-dim);
  }

  /* ── Post Content ── */
  .post-content { margin-bottom: 14px; }
  .post-title { font-family: var(--fh); font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 7px; line-height: 1.3; letter-spacing: 0.3px; }
  .post-text { font-size: 14px; line-height: 1.65; color: var(--text); white-space: pre-wrap; }
  .post-media { margin-top: 12px; }
  .post-media img { max-width: 100%; border-radius: 6px; border: 1px solid var(--b2); }

  .post-sep { height: 1px; background: var(--b1); margin: 2px 0 12px; }

  /* ── Actions ── */
  .post-actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .post-votes { display: flex; align-items: center; gap: 6px; }

  .vote-btn {
    display: flex; align-items: center; gap: 5px;
    font-family: var(--fm); font-size: 12px;
    padding: 5px 12px; border-radius: 4px; cursor: pointer;
    background: var(--s2); border: 1px solid var(--b2); color: var(--text);
    transition: all 0.15s;
  }
  .vote-btn:hover { border-color: var(--b2); color: #fff; }
  .vote-btn.up.active   { background: rgba(80,250,123,0.12); border-color: var(--green); color: var(--green); box-shadow: 0 0 10px rgba(80,250,123,0.18); }
  .vote-btn.down.active { background: var(--red-dim); border-color: var(--red); color: var(--red); box-shadow: 0 0 10px rgba(255,61,61,0.18); }
  .vote-btn:hover.up   { border-color: var(--green); }
  .vote-btn:hover.down { border-color: var(--red); }

  .comment-btn {
    display: flex; align-items: center; gap: 5px;
    font-family: var(--fm); font-size: 12px;
    padding: 5px 12px; border-radius: 4px; cursor: pointer;
    background: var(--s2); border: 1px solid var(--b2); color: var(--dim);
    transition: all 0.15s;
  }
  .comment-btn:hover { border-color: var(--acc); color: var(--acc); }

  /* ── Reactions ── */
  .post-reactions { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .r-btn {
    display: flex; align-items: center; gap: 4px;
    font-family: var(--fm); font-size: 12px;
    padding: 4px 9px; border-radius: 4px; cursor: pointer;
    background: var(--s2); border: 1px solid var(--b2); color: var(--text);
    transition: all 0.15s;
  }
  .r-btn:hover { border-color: var(--acc); color: #fff; }
  .r-btn.active { background: var(--acc-dim); border-color: var(--acc); color: var(--acc); box-shadow: 0 0 10px rgba(0,212,255,0.18); }
  .r-add {
    width: 28px; height: 28px; border-radius: 4px; cursor: pointer;
    background: var(--s2); border: 1px dashed var(--b2); color: var(--dim);
    font-size: 14px; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .r-add:hover { border-color: var(--acc); color: var(--acc); }

  /* ── Empty / Loading ── */
  .cc-empty {
    text-align: center; padding: 64px 20px;
    border: 1px dashed var(--b1); border-radius: 8px;
    font-family: var(--fm); color: var(--dim); font-size: 13px; letter-spacing: 1px;
  }
  .cc-empty-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.5; }

  /* ── Modal Overlay ── */
  .cc-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.88); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: ccFadeIn 0.15s ease;
  }
  @keyframes ccFadeIn { from { opacity: 0 } to { opacity: 1 } }

  .cc-modal {
    background: var(--s1); border: 1px solid var(--b2);
    border-top: 2px solid var(--green); border-radius: 8px;
    width: 100%; max-width: 520px; max-height: 80vh; overflow: hidden;
    box-shadow: 0 0 60px rgba(80,250,123,0.06);
    animation: ccSlideUp 0.2s ease;
  }
  @keyframes ccSlideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

  .cc-modal-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--b1);
  }
  .cc-modal-title { font-family: var(--fh); font-size: 19px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #fff; }
  .cc-modal-title em { color: var(--green); font-style: normal; }
  .cc-modal-close { background: none; border: none; cursor: pointer; color: var(--dim); font-size: 18px; line-height: 1; padding: 4px 6px; transition: color 0.15s; border-radius: 3px; }
  .cc-modal-close:hover { color: var(--red); }

  .cc-modal-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }

  /* make body scroll when tall */
  .cc-modal-body { overflow: auto; max-height: calc(80vh - 160px); padding: 18px; }

  .cc-field { display: flex; flex-direction: column; gap: 7px; }
  .cc-label { font-family: var(--fm); font-size: 10px; color: var(--green); letter-spacing: 2px; text-transform: uppercase; }
  .cc-textarea {
    width: 100%; background: var(--s2); border: 1px solid var(--b2);
    border-radius: 5px; color: var(--text); font-family: var(--fb);
    font-size: 14px; padding: 10px 13px; outline: none; resize: vertical;
    min-height: 100px; line-height: 1.6;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .cc-textarea::placeholder { color: var(--dim); }
  .cc-textarea:focus { border-color: var(--green); box-shadow: 0 0 0 2px rgba(80,250,123,0.1); }

  .cc-char-count { font-family: var(--fm); font-size: 11px; color: var(--dim); text-align: right; }

  .cc-modal-foot {
    display: flex; align-items: center; justify-content: flex-end;
    padding: 16px 24px; border-top: 1px solid var(--b1); gap: 8px;
  }
  .btn-cancel-cc { font-family: var(--fb); font-size: 13px; padding: 9px 18px; background: transparent; border: 1px solid var(--b2); border-radius: 4px; color: var(--dim); cursor: pointer; transition: all 0.15s; }
  .btn-cancel-cc:hover { border-color: var(--red); color: var(--red); }
  .btn-submit-cc {
    font-family: var(--fh); font-size: 14px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    padding: 10px 24px; background: var(--green); color: #000;
    border: none; border-radius: 4px; cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .btn-submit-cc:hover { background: #6effa0; box-shadow: 0 0 24px rgba(80,250,123,0.35); }
  .btn-submit-cc:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Toast ── */
  .cc-toast {
    position: fixed; bottom: 26px; right: 26px; z-index: 2000;
    background: var(--s2); border: 1px solid var(--b2); border-left: 3px solid;
    border-radius: 5px; padding: 13px 20px;
    font-family: var(--fm); font-size: 12px; letter-spacing: 0.5px;
    max-width: 340px; animation: ccSlideInR 0.25s ease;
  }
  @keyframes ccSlideInR { from { transform: translateX(40px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
  .cc-toast.success { border-left-color: var(--green); color: var(--green); }
  .cc-toast.error   { border-left-color: var(--red);   color: var(--red);   }
  .cc-toast.warning { border-left-color: var(--gold);  color: var(--gold);  }
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
  return <div className={`cc-toast ${type}`}>{message}</div>;
};

// ─── PostCard ─────────────────────────────────────────────────────────────────
const PostCard = React.memo(({ post, onReact, onVote }) => {
  const navigate = useNavigate();
  const initials = post.userName?.slice(0, 2).toUpperCase();
  const existingEmojis = new Set(post.reactions?.map((r) => r.emoji) ?? []);
  const availableEmojis = EMOJI_OPTIONS.filter((e) => !existingEmojis.has(e)).slice(0, 3);

  return (
    <div className={`post-card${post.isPinned ? ' is-pinned' : ''}`}>
      {post.isPinned && <div className="post-strip" />}
      <div className="post-body">

        {/* Header */}
        <div className="post-top">
          <div className="post-user">
            <div
              className="post-avatar"
              onClick={() => navigate(`/profile/${post.userId}`)}
            >
              {post.userProfileImage
                ? <img src={post.userProfileImage} alt={post.userName} />
                : initials}
            </div>
            <div>
              <div className="post-name" onClick={() => navigate(`/profile/${post.userId}`)}>
                {post.userName}
              </div>
              {post.userRole && <div className="post-role">◈ {post.userRole}</div>}
              <div className="post-time">{timeAgo(post.createdAt)}</div>
            </div>
          </div>
          <div className="post-meta">
            <div className="post-views">👁 {post.viewCount ?? 0}</div>
            {post.isPinned && <div className="post-pin-tag">📌 Pinned</div>}
          </div>
        </div>

        {/* Content */}
        <div className="post-content">
          {post.title && <div className="post-title">{post.title}</div>}
          <div className="post-text">{post.content}</div>
          {post.mediaUrl && post.mediaType === 'Image' && (
            <div className="post-media">
              <img src={post.mediaUrl} alt="Post media" />
            </div>
          )}
        </div>

        <div className="post-sep" />

        {/* Actions */}
        <div className="post-actions">
          <div className="post-votes">
            <button
              className={`vote-btn up${post.myVote === 1 ? ' active' : ''}`}
              onClick={() => onVote(post.id, 1)}
            >
              👍 {post.upvoteCount ?? 0}
            </button>
            <button
              className={`vote-btn down${post.myVote === -1 ? ' active' : ''}`}
              onClick={() => onVote(post.id, -1)}
            >
              👎 {post.downvoteCount ?? 0}
            </button>
            <button className="comment-btn">
              💬 {post.commentCount ?? 0}
            </button>
          </div>

          <div className="post-reactions">
            {post.reactions?.slice(0, 3).map((reaction) => (
              <button
                key={reaction.emoji}
                className={`r-btn${post.myReaction === reaction.emoji ? ' active' : ''}`}
                onClick={() => onReact(post.id, reaction.emoji)}
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
                onClick={() => onReact(post.id, emoji)}
                aria-label={`React with ${emoji}`}
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
});

// ─── Create Post Modal ────────────────────────────────────────────────────────
const CreatePostModal = ({ isOpen, onClose, clanId, inline = false }) => {
  const [content, setContent] = useState('');
  const queryClient           = useQueryClient();
  const [toast, setToast]     = useState(null);

  const showToast = (message, kind) => setToast({ message, kind, key: Date.now() });

  useEffect(() => {
    if (!isOpen) setContent('');
  }, [isOpen]);

  const createMutation = useMutation({
    mutationFn: (data) => api.post(`/clans/${clanId}/posts`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clanPosts', clanId]);
      showToast('// Post published successfully', 'success');
      setTimeout(onClose, 1200);
    },
    onError: (error) => {
      showToast(error.response?.data?.message || '// Error creating post', 'error');
    },
  });

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!content.trim()) {
      showToast('// Content cannot be empty', 'warning');
      return;
    }
    createMutation.mutate({ content });
  };

  if (!isOpen) return null;
  const modalContent = (
    <div className="cc-modal">
      <div className="cc-modal-head">
        <div className="cc-modal-title">New <em>Post</em></div>
        <button className="cc-modal-close" onClick={onClose}>✕</button>
      </div>

      <div className="cc-modal-body">
        <div className="cc-field">
          <label className="cc-label">// Content</label>
          <textarea
            className="cc-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, questions, or ideas with the clan..."
            rows={4}
          />
          <div className="cc-char-count">{content.length} chars</div>
        </div>
      </div>

      <div className="cc-modal-foot">
        <button className="btn-cancel-cc" onClick={onClose}>Cancel</button>
        <button
          className="btn-submit-cc"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? '...' : 'Publish'}
        </button>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="cc-inline-container" style={{ margin: '12px 0 18px' }}>
        {modalContent}
        {toast && <Toast key={toast.key} message={toast.message} type={toast.kind} onDone={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <>
      <div className="cc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {modalContent}
      </div>
      {toast && <Toast key={toast.key} message={toast.message} type={toast.kind} onDone={() => setToast(null)} />}
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ClanCommunity = () => {
  const { clanId }                = useParams();
  const queryClient               = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast]         = useState(null);

  const showToast = (message, type = 'error') => setToast({ message, type, key: Date.now() });

  const { data: posts, isLoading } = useQuery({
    queryKey: ['clanPosts', clanId],
    queryFn: () => fetchPosts(clanId),
  });

  const reactMutation = useMutation({
    mutationFn: ({ postId, emoji }) =>
      api.post(`/clans/${clanId}/posts/${postId}/react`, { emoji }),
    onMutate: async ({ postId, emoji }) => {
      await queryClient.cancelQueries(['clanPosts', clanId]);
      const prev = queryClient.getQueryData(['clanPosts', clanId]);
      queryClient.setQueryData(['clanPosts', clanId], (old) =>
        old?.map((p) => {
          if (p.id !== postId) return p;
          const alreadyReacted = p.myReaction === emoji;
          const reactions = [...(p.reactions ?? [])];
          const idx = reactions.findIndex((r) => r.emoji === emoji);
          if (alreadyReacted) {
            const updated = idx >= 0
              ? reactions.map((r, i) => i === idx ? { ...r, count: r.count - 1, userNames: r.userNames.slice(1) } : r).filter((r) => r.count > 0)
              : reactions;
            return { ...p, reactions: updated, myReaction: null };
          } else {
            const updated = idx >= 0
              ? reactions.map((r, i) => i === idx ? { ...r, count: r.count + 1, userNames: ['You', ...r.userNames] } : r)
              : [...reactions, { emoji, count: 1, userNames: ['You'] }];
            return { ...p, reactions: updated, myReaction: emoji };
          }
        })
      );
      return { prev };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(['clanPosts', clanId], context.prev);
      showToast('// Failed to register reaction', 'error');
    },
    onSettled: () => queryClient.invalidateQueries(['clanPosts', clanId]),
  });

  const voteMutation = useMutation({
    mutationFn: ({ postId, vote }) =>
      api.post(`/clans/${clanId}/posts/${postId}/vote?vote=${vote}`),
    onMutate: async ({ postId, vote }) => {
      await queryClient.cancelQueries(['clanPosts', clanId]);
      const prev = queryClient.getQueryData(['clanPosts', clanId]);
      queryClient.setQueryData(['clanPosts', clanId], (old) =>
        old?.map((p) => {
          if (p.id !== postId) return p;
          const prevVote = p.myVote;
          const isToggle = prevVote === vote;
          return {
            ...p,
            myVote: isToggle ? 0 : vote,
            upvoteCount: vote === 1
              ? p.upvoteCount + (isToggle ? -1 : prevVote === -1 ? 2 : 1)
              : p.upvoteCount + (prevVote === 1 ? -1 : 0),
            downvoteCount: vote === -1
              ? p.downvoteCount + (isToggle ? -1 : prevVote === 1 ? 2 : 1)
              : p.downvoteCount + (prevVote === -1 ? -1 : 0),
          };
        })
      );
      return { prev };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(['clanPosts', clanId], context.prev);
      showToast('// Failed to register vote', 'error');
    },
    onSettled: () => queryClient.invalidateQueries(['clanPosts', clanId]),
  });

  const handleReact = useCallback(
    (postId, emoji) => reactMutation.mutate({ postId, emoji }),
    [reactMutation]
  );

  const handleVote = useCallback(
    (postId, vote) => voteMutation.mutate({ postId, vote }),
    [voteMutation]
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="cc-wrap">
        <div className="cc-inner">

          {/* Header */}

          <div className="cc-header">
            <div className="cc-header-left">
              <div className="cc-icon-box">💬</div>
              <div>
                <div className="cc-title">Clan <em>Hub</em></div>
                {/* Inline post form (compact) */}
                {modalOpen && (
                  <CreatePostModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    clanId={clanId}
                    inline
                  />
                )}
              </div>
            </div>
            <button className="btn-post-new" onClick={() => setModalOpen(true)}>
              <span>+ New Post</span>
            </button>
          </div>

          {/* Banner */}
          <div className="cc-banner">
            &gt; All members may post and discuss — keep it respectful and on topic
          </div>

          {/* Feed */}
          {isLoading ? (
            <div className="cc-empty">
              <div className="cc-empty-icon">💬</div>
              <div>LOADING FEED...</div>
            </div>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onReact={handleReact}
                onVote={handleVote}
              />
            ))
          ) : (
            <div className="cc-empty">
              <div className="cc-empty-icon">💬</div>
              <div>NO POSTS YET — BE THE FIRST TO POST</div>
            </div>
          )}

        </div>
      </div>

      {/* overlay fallback: inline version is rendered under header */}

      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </>
  );
};

export default ClanCommunity;