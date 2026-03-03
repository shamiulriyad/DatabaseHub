import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaThumbsDown } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';
import { normalizeAvatar, normalizeUrl } from '../../utils/imageUtils';
import CreatePost from './CreatePost';

// ═══════════════════════════════════════════════════════════
// NEXTUNIVERSE — POST CARD
// Cosmic Dark Premium · Pure CSS · No Chakra UI
// ═══════════════════════════════════════════════════════════

const CSS = `
.pc-card {
  background: #0d0d26;
  border: 1px solid rgba(124,58,237,0.16);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  position: relative;
}
.pc-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.pc-card:hover {
  border-color: rgba(124,58,237,0.32);
  box-shadow: 0 16px 48px rgba(0,0,0,0.45), 0 0 28px rgba(124,58,237,0.07);
  transform: translateY(-3px);
}
.pc-card:hover::before { opacity: 1; }

/* Header */
.pc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px 12px;
}
.pc-avatar {
  width: 38px; height: 38px;
  border-radius: 12px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid rgba(124,58,237,0.35);
  flex-shrink: 0;
  background: linear-gradient(135deg, #5b21b6, #7c3aed);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: white;
  font-family: 'DM Sans', sans-serif;
  transition: border-color 0.2s;
}
.pc-avatar:hover { border-color: rgba(124,58,237,0.7); }
.pc-avatar img { width: 100%; height: 100%; border-radius: 10px; object-fit: cover; }

.pc-meta { flex: 1; min-width: 0; }
.pc-username {
  font-size: 14px; font-weight: 700; color: #f0ecff;
  cursor: pointer; transition: color 0.15s;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-family: 'DM Sans', sans-serif;
}
.pc-username:hover { color: #c4b5fd; }
.pc-meta-row { display: flex; align-items: center; gap: 8px; margin-top: 2px; flex-wrap: wrap; }
.pc-date { font-size: 11px; color: #55527a; display: flex; align-items: center; gap: 4px; }
.pc-type-badge {
  padding: 2px 9px; border-radius: 99px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  background: rgba(124,58,237,0.12); color: #a78bfa;
  border: 1px solid rgba(124,58,237,0.25);
  font-family: 'DM Sans', sans-serif;
}

/* Menu */
.pc-menu-wrap { position: relative; }
.pc-menu-btn {
  width: 32px; height: 32px; border-radius: 10px;
  background: transparent; border: 1px solid transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #55527a; font-size: 18px;
  transition: all 0.2s; line-height: 1;
}
.pc-menu-btn:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.08); color: #a09ec0; }

.pc-dropdown {
  position: absolute; top: 38px; right: 0; z-index: 50;
  min-width: 150px;
  background: #111130; border: 1px solid rgba(124,58,237,0.25);
  border-radius: 14px; box-shadow: 0 16px 40px rgba(0,0,0,0.55);
  overflow: hidden;
  animation: pc-drop 0.18s ease both;
}
@keyframes pc-drop { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }

.pc-dropdown-item {
  display: flex; align-items: center; gap: 9px;
  padding: 10px 14px; cursor: pointer;
  font-size: 13px; font-weight: 500; color: #a09ec0;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s; background: transparent; border: none; width: 100%; text-align: left;
}
.pc-dropdown-item:hover { background: rgba(255,255,255,0.05); color: #f0ecff; }
.pc-dropdown-item.danger { color: #fb7185; }
.pc-dropdown-item.danger:hover { background: rgba(225,29,72,0.08); }
.pc-dropdown-item .item-icon { font-size: 13px; width: 16px; text-align: center; }

/* Content */
.pc-body { padding: 0 18px 14px; }
.pc-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 16px; font-weight: 700; color: #f0ecff;
  margin-bottom: 8px; cursor: pointer; line-height: 1.4;
  letter-spacing: -0.01em; transition: color 0.15s;
}
.pc-title:hover { color: #c4b5fd; }
.pc-content {
  font-size: 13px; line-height: 1.75; color: #7a78a0;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
  overflow: hidden; margin-bottom: 12px;
  font-family: 'DM Sans', sans-serif;
}
.pc-media {
  width: 100%; max-height: 220px; object-fit: cover;
  border-radius: 12px; margin-bottom: 12px;
  border: 1px solid rgba(255,255,255,0.05);
  display: block;
}

/* Divider */
.pc-divider { height: 1px; background: rgba(255,255,255,0.04); margin: 0; }

/* Actions */
.pc-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; gap: 10px;
}
.pc-actions { display: flex; align-items: center; gap: 4px; }

.pc-action-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 13px; border-radius: 10px;
  background: transparent; border: 1px solid transparent;
  font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
  cursor: pointer; color: #55527a; transition: all 0.2s;
}
.pc-action-btn:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.07); color: #a09ec0; }
.pc-action-btn.liked    { color: #fb7185; }
.pc-action-btn.liked:hover { background: rgba(225,29,72,0.08); border-color: rgba(225,29,72,0.2); }
.pc-action-btn.disliked  { color: #fb7185; }
.pc-action-btn.disliked:hover { background: rgba(225,29,72,0.08); border-color: rgba(225,29,72,0.2); }
.pc-action-btn .pc-count { font-family: 'DM Mono', monospace; font-size: 11px; }
.pc-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Like bounce animation */
@keyframes pc-pop { 0%{transform:scale(1)} 40%{transform:scale(1.4)} 100%{transform:scale(1)} }
.pc-action-btn.liked svg,
.pc-action-btn.liked .heart-icon { animation: pc-pop 0.3s ease; }

.pc-view-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 10px;
  background: linear-gradient(135deg, #5b21b6, #7c3aed);
  color: white; font-family: 'DM Sans', sans-serif;
  font-size: 12px; font-weight: 700;
  cursor: pointer; border: none;
  transition: all 0.2s;
  box-shadow: 0 3px 12px rgba(124,58,237,0.3);
}
.pc-view-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(124,58,237,0.5); }
.pc-view-btn:active { transform: translateY(0); }

/* Toast */
.pc-toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 999;
  padding: 12px 18px; border-radius: 14px;
  background: #111130; border: 1px solid rgba(124,58,237,0.3);
  box-shadow: 0 12px 36px rgba(0,0,0,0.5);
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; font-weight: 600; color: #f0ecff;
  font-family: 'DM Sans', sans-serif;
  animation: pc-drop 0.2s ease both;
  max-width: 300px;
}
.pc-toast.success { border-color: rgba(16,185,129,0.35); }
.pc-toast.error   { border-color: rgba(225,29,72,0.35); }
.pc-toast.warning { border-color: rgba(245,158,11,0.35); }

/* Confirm overlay */
.pc-confirm-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(3,3,13,0.85); backdrop-filter: blur(14px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.pc-confirm-box {
  width: 100%; max-width: 380px;
  background: #0d0d26; border: 1px solid rgba(225,29,72,0.3);
  border-radius: 22px; padding: 32px 28px; text-align: center;
  box-shadow: 0 32px 80px rgba(0,0,0,0.7);
  animation: pc-drop 0.22s ease both;
}
.pc-confirm-icon  { font-size: 40px; margin-bottom: 14px; }
.pc-confirm-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #f0ecff; margin-bottom: 8px; }
.pc-confirm-sub   { font-size: 13px; color: #55527a; line-height: 1.65; margin-bottom: 24px; }
.pc-confirm-btns  { display: flex; gap: 10px; justify-content: center; }
.pc-confirm-cancel { padding: 9px 20px; border-radius: 10px; background: transparent; border: 1px solid rgba(255,255,255,0.08); color: #7a78a0; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.pc-confirm-cancel:hover { border-color: rgba(255,255,255,0.15); color: #f0ecff; }
.pc-confirm-delete { padding: 9px 22px; border-radius: 10px; background: #e11d48; color: white; border: none; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.pc-confirm-delete:hover { background: #be123c; transform: translateY(-1px); }
`;

// ── Mini toast hook ──────────────────────────────────────────
function useLocalToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, status = 'success') => {
    setToast({ msg, status });
    setTimeout(() => setToast(null), 2800);
  };
  return { toast, show };
}

// ── Confirm dialog ───────────────────────────────────────────
function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="pc-confirm-overlay" onClick={onCancel}>
      <div className="pc-confirm-box" onClick={e => e.stopPropagation()}>
        <div className="pc-confirm-icon">🗑️</div>
        <div className="pc-confirm-title">Delete this post?</div>
        <div className="pc-confirm-sub">
          This action cannot be undone. The post and all its reactions will be permanently removed.
        </div>
        <div className="pc-confirm-btns">
          <button className="pc-confirm-cancel" onClick={onCancel}>Cancel</button>
          <button className="pc-confirm-delete" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Post Media ────────────────────────────────────────────────
function PostMedia({ src }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return null;
  const url = normalizeUrl(src);
  return <img src={url} alt="Post media" className="pc-media" onError={() => setBroken(true)} />;
}

// ── Avatar with fallback ─────────────────────────────────────
function UserAvatar({ src, name, onClick }) {
  const [broken, setBroken] = useState(false);
  const initials = (name || 'AN').slice(0, 2).toUpperCase();
  const normalized = normalizeAvatar(src);
  return (
    <div className="pc-avatar" onClick={onClick}>
      {!broken && normalized
        ? <img src={normalized} alt={name} onError={() => setBroken(true)} />
        : initials
      }
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────
const PostCard = ({ post, type }) => {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const userId       = localStorage.getItem('userId');
  const currentUser  = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const isAdminUser = Boolean(
    currentUser?.isAdmin ||
    currentUser?.IsAdmin ||
    String(currentUser?.role || currentUser?.Role || '').toLowerCase() === 'admin'
  );
  const { toast, show: showToast } = useLocalToast();

  const [isLiked,     setIsLiked]     = useState(Boolean(post.HasUpvoted   ?? post.hasUpvoted   ?? false));
  const [isDisliked,  setIsDisliked]  = useState(Boolean(post.HasDownvoted ?? post.hasDownvoted ?? false));
  const [upvoteCount,   setUpvoteCount]   = useState(post.upvoteCount   ?? post.UpvoteCount   ?? 0);
  const [downvoteCount, setDownvoteCount] = useState(post.downvoteCount ?? post.DownvoteCount ?? 0);
  const [isEditOpen,  setIsEditOpen]  = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);

  const pid     = post.Id ?? post.id ?? post._id ?? post.postId ?? post.PostId ?? post.postID ?? post.post_id;
  const isOwner = String(post.userId ?? post.UserId) === String(userId);
  const canManage = isOwner || isAdminUser;
  const commentCount = post.commentCount ?? post.CommentCount ?? post.comment_count ?? 0;

  const invalidatePosts = () => {
    queryClient.invalidateQueries(['communityPosts']);
    queryClient.invalidateQueries(['myPosts']);
    queryClient.invalidateQueries(['post', pid]);
  };

  // Like
  const likeMutation = useMutation({
    mutationFn: () => isLiked ? communityAPI.unlikePost(pid) : communityAPI.likePost(pid),
    onMutate: () => {
      if (isLiked) {
        setUpvoteCount(n => Math.max(0, n - 1));
        setIsLiked(false);
      } else {
        setUpvoteCount(n => n + 1);
        setIsLiked(true);
        if (isDisliked) { setIsDisliked(false); setDownvoteCount(n => Math.max(0, n - 1)); }
      }
    },
    onError: () => {
      setIsLiked(v => !v);
      setUpvoteCount(post.upvoteCount ?? post.UpvoteCount ?? 0);
      showToast('Something went wrong', 'error');
    },
    onSettled: invalidatePosts,
  });

  // Dislike
  const dislikeMutation = useMutation({
    mutationFn: () => communityAPI.dislikePost(pid),
    onMutate: () => {
      if (isDisliked) {
        setIsDisliked(false);
        setDownvoteCount(n => Math.max(0, n - 1));
      } else {
        setIsDisliked(true);
        setDownvoteCount(n => n + 1);
        if (isLiked) { setIsLiked(false); setUpvoteCount(n => Math.max(0, n - 1)); }
      }
    },
    onError: () => {
      setIsDisliked(v => !v);
      setDownvoteCount(post.downvoteCount ?? post.DownvoteCount ?? 0);
      showToast('Something went wrong', 'error');
    },
    onSettled: invalidatePosts,
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: () => communityAPI.deletePost(pid),
    onSuccess: () => { invalidatePosts(); showToast('Post deleted', 'success'); },
    onError:   () => { showToast('Failed to delete post', 'error'); },
  });

  const requireAuth = () => {
    if (!localStorage.getItem('token')) { showToast('Login required', 'warning'); return false; }
    return true;
  };

  const handleLike    = () => { if (requireAuth()) likeMutation.mutate(); };
  const handleDislike = () => { if (requireAuth()) dislikeMutation.mutate(); };
  const handleDelete  = () => { setMenuOpen(false); setConfirmDel(true); };

  const handleEditSuccess = () => {
    invalidatePosts();
    setIsEditOpen(false);
    showToast('Post updated', 'success');
  };

  const handleViewDetail = () => navigate(`/community/post/${pid}`);

  const dateStr = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
    : '';

  return (
    <>
      {/* Inject styles once */}
      <style>{CSS}</style>

      <div className="pc-card">

        {/* ── HEADER ── */}
        <div className="pc-header">
          <UserAvatar
            src={post.profileImageUrl || post.user?.profileImageUrl || post.user?.avatar}
            name={post.userName}
            onClick={() => navigate(`/user/${post.userId}`)}
          />

          <div className="pc-meta">
            <div className="pc-username" onClick={() => navigate(`/user/${post.userId}`)}>
              {post.userName || 'Anonymous'}
            </div>
            <div className="pc-meta-row">
              <span className="pc-date">🕐 {dateStr}</span>
              {post.postType && (
                <span className="pc-type-badge">{post.postType}</span>
              )}
            </div>
          </div>

          {/* Owner menu */}
          {canManage && (
            <div className="pc-menu-wrap">
              <button
                className="pc-menu-btn"
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Post options"
              >
                ···
              </button>

              {menuOpen && (
                <>
                  {/* Click-outside backdrop */}
                  <div style={{ position:'fixed', inset:0, zIndex:49 }} onClick={() => setMenuOpen(false)} />
                  <div className="pc-dropdown">
                    <button
                      className="pc-dropdown-item"
                      onClick={() => { setMenuOpen(false); setIsEditOpen(true); }}
                    >
                      <span className="item-icon">✏️</span> Edit
                    </button>
                    <button
                      className="pc-dropdown-item danger"
                      onClick={handleDelete}
                      disabled={deleteMutation.isLoading}
                    >
                      <span className="item-icon">🗑️</span>
                      {deleteMutation.isLoading ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Edit modal */}
        <CreatePost
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={handleEditSuccess}
          initialData={{
            id:       post.id,
            title:    post.title,
            content:  post.content,
            category: post.postType ? post.postType.toLowerCase() : 'general',
            mediaUrl: post.mediaUrl || post.MediaUrl || '',
          }}
          isEdit
        />

        {/* ── CONTENT ── */}
        <div className="pc-body">
          {post.title && (
            <div className="pc-title" onClick={handleViewDetail}>{post.title}</div>
          )}
          <div className="pc-content">{post.content}</div>
          {(post.mediaUrl || post.MediaUrl) && (
            <PostMedia src={post.mediaUrl || post.MediaUrl} />
          )}
        </div>

        {/* ── DIVIDER ── */}
        <div className="pc-divider" />

        {/* ── FOOTER / ACTIONS ── */}
        <div className="pc-footer">
          <div className="pc-actions">
            {/* Like */}
            <button
              className={`pc-action-btn${isLiked ? ' liked' : ''}`}
              onClick={handleLike}
              disabled={likeMutation.isLoading}
              aria-label="Like post"
            >
              {isLiked
                ? <FaHeart className="heart-icon" style={{ color:'#fb7185', fontSize:14 }} />
                : <FaRegHeart style={{ color:'#55527a', fontSize:14 }} />
              }
              <span className="pc-count">{upvoteCount}</span>
            </button>

            {/* Dislike */}
            <button
              className={`pc-action-btn${isDisliked ? ' disliked' : ''}`}
              onClick={handleDislike}
              disabled={dislikeMutation.isLoading}
              aria-label="Dislike post"
            >
              <FaThumbsDown style={{ color: isDisliked ? '#fb7185' : '#55527a', fontSize:13 }} />
              <span className="pc-count">{downvoteCount}</span>
            </button>

            {/* Comments */}
            <button className="pc-action-btn" onClick={handleViewDetail} aria-label="Comments">
              <span style={{ fontSize:14 }}>💬</span>
              <span className="pc-count">{commentCount}</span>
            </button>
          </div>

          <button className="pc-view-btn" onClick={handleViewDetail}>
            View →
          </button>
        </div>
      </div>

      {/* ── DELETE CONFIRM ── */}
      {confirmDel && (
        <ConfirmDialog
          onConfirm={() => { setConfirmDel(false); deleteMutation.mutate(); }}
          onCancel={() => setConfirmDel(false)}
        />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`pc-toast ${toast.status}`}>
          <span>{toast.status === 'success' ? '✅' : toast.status === 'error' ? '❌' : '⚠️'}</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
};

export default PostCard;