import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaHeart, FaRegHeart, FaThumbsDown } from 'react-icons/fa';
import { communityAPI } from '../../services/api';
import { normalizeAvatar, normalizeUrl } from '../../utils/imageUtils';
import CreatePost from './CreatePost';
import Comments from './Comments';

// ═══════════════════════════════════════════════════════════
// NEXTUNIVERSE — POST DETAIL
// Cosmic Dark Premium · Pure CSS · No Chakra UI
// ═══════════════════════════════════════════════════════════

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.pd-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 90% 50% at 50% -5%, rgba(79,46,229,0.12) 0%, transparent 55%),
    #03030d;
  font-family: 'DM Sans', sans-serif;
  padding: 40px 0 80px;
}
.pd-container {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 24px;
}
@media(max-width:640px){ .pd-container{ padding:0 14px; } .pd-page{ padding:20px 0 60px; } }

/* ── Back button ── */
.pd-back {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; color: #55527a; text-decoration: none;
  margin-bottom: 24px; cursor: pointer; background: none; border: none;
  font-family: 'DM Sans', sans-serif; transition: color .2s;
}
.pd-back:hover { color: #a09ec0; }

/* ── Loading ── */
.pd-loading {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 40vh; gap: 14px;
}
.pd-spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid rgba(124,58,237,0.2);
  border-top-color: #7c3aed;
  animation: pd-spin .7s linear infinite;
}
@keyframes pd-spin { to{ transform:rotate(360deg) } }
.pd-loading-text { font-size: 13px; color: #55527a; }

/* ── Error ── */
.pd-error {
  padding: 20px 24px; border-radius: 16px;
  background: rgba(225,29,72,0.07); border: 1px solid rgba(225,29,72,0.25);
  color: #fb7185; font-size: 14px; margin-bottom: 20px;
  display: flex; align-items: center; gap: 10px;
}

/* ── MAIN CARD ── */
.pd-card {
  background: #0d0d26;
  border: 1px solid rgba(124,58,237,0.18);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  margin-bottom: 20px;
  position: relative;
}
.pd-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(124,58,237,0.45), transparent);
}

/* ── Author header ── */
.pd-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 14px; padding: 24px 26px 20px; flex-wrap: wrap;
}
.pd-author-row { display: flex; align-items: center; gap: 13px; }
.pd-avatar {
  width: 46px; height: 46px; border-radius: 14px;
  border: 2px solid rgba(124,58,237,0.35);
  background: linear-gradient(135deg,#5b21b6,#7c3aed);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700; color: white;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer; flex-shrink: 0; overflow: hidden;
  transition: border-color .2s;
}
.pd-avatar:hover { border-color: rgba(124,58,237,0.65); }
.pd-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
.pd-username {
  font-size: 15px; font-weight: 700; color: #f0ecff;
  cursor: pointer; transition: color .15s;
}
.pd-username:hover { color: #c4b5fd; }
.pd-meta-row { display: flex; align-items: center; gap: 10px; margin-top: 3px; flex-wrap: wrap; }
.pd-date { font-size: 11px; color: #55527a; display: flex; align-items: center; gap: 4px; font-family: 'DM Mono', monospace; }
.pd-type-badge {
  padding: 2px 10px; border-radius: 99px;
  font-size: 10px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
  background: rgba(124,58,237,0.12); color: #a78bfa;
  border: 1px solid rgba(124,58,237,0.26);
}

/* Owner controls */
.pd-owner-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.pd-btn-edit, .pd-btn-delete {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 15px; border-radius: 10px;
  font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif;
  cursor: pointer; border: 1px solid; transition: all .2s;
}
.pd-btn-edit   { background: rgba(124,58,237,0.08); border-color: rgba(124,58,237,0.25); color: #a78bfa; }
.pd-btn-edit:hover   { background: rgba(124,58,237,0.18); }
.pd-btn-delete { background: rgba(225,29,72,0.08);  border-color: rgba(225,29,72,0.25);  color: #fb7185; }
.pd-btn-delete:hover { background: rgba(225,29,72,0.18); }
.pd-btn-delete:disabled { opacity: .5; cursor: not-allowed; }

/* ── Content ── */
.pd-content { padding: 0 26px 24px; }
.pd-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(20px, 3vw, 28px); font-weight: 700;
  color: #f0ecff; line-height: 1.3; letter-spacing: -.02em;
  margin-bottom: 16px;
}
.pd-body {
  font-size: 15px; color: #7a78a0; line-height: 1.85;
  white-space: pre-line; margin-bottom: 20px;
}
.pd-media {
  width: 100%; max-height: 420px; object-fit: contain;
  border-radius: 14px; margin-bottom: 20px;
  border: 1px solid rgba(255,255,255,0.06); display: block;
}

/* ── Divider ── */
.pd-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 0 26px; }

/* ── Actions row ── */
.pd-actions-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 26px; gap: 10px; flex-wrap: wrap;
}
.pd-action-group { display: flex; align-items: center; gap: 4px; }
.pd-action-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 15px; border-radius: 10px;
  background: transparent; border: 1px solid transparent;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  color: #55527a; cursor: pointer; transition: all .2s;
}
.pd-action-btn:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.07); color: #a09ec0; }
.pd-action-btn.liked    { color: #fb7185; }
.pd-action-btn.liked:hover    { background: rgba(225,29,72,0.08); border-color: rgba(225,29,72,0.2); }
.pd-action-btn.disliked { color: #fb7185; }
.pd-action-btn.disliked:hover { background: rgba(225,29,72,0.08); border-color: rgba(225,29,72,0.2); }
.pd-action-btn:disabled { opacity: .5; cursor: not-allowed; }
.pd-comment-count { font-size: 13px; color: #55527a; display: flex; align-items: center; gap: 6px; padding: 8px 12px; }

/* ── Comment box ── */
.pd-comment-section { padding: 24px 26px; border-top: 1px solid rgba(255,255,255,0.05); }
.pd-comment-label {
  font-size: 11px; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; color: #55527a; margin-bottom: 12px;
}
.pd-textarea {
  width: 100%; padding: 13px 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; color: #f0ecff;
  font-family: 'DM Sans', sans-serif; font-size: 14px;
  line-height: 1.7; resize: vertical; min-height: 90px;
  outline: none; transition: all .2s; margin-bottom: 12px;
}
.pd-textarea:focus {
  border-color: rgba(124,58,237,0.45);
  background: rgba(124,58,237,0.04);
  box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
}
.pd-textarea::placeholder { color: #3d3b58; }
.pd-comment-footer { display: flex; justify-content: flex-end; }
.pd-comment-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 24px; border-radius: 12px;
  background: linear-gradient(135deg,#5b21b6,#7c3aed);
  color: white; font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 700; cursor: pointer; border: none;
  transition: all .2s; box-shadow: 0 4px 16px rgba(124,58,237,0.3);
}
.pd-comment-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.5); }
.pd-comment-btn:active { transform: translateY(0); }
.pd-comment-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
.pd-btn-spinner {
  width: 13px; height: 13px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2); border-top-color: white;
  animation: pd-spin .65s linear infinite;
}

/* ── Toast ── */
.pd-toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 999;
  padding: 12px 18px; border-radius: 14px;
  background: #111130; border: 1px solid rgba(124,58,237,0.3);
  box-shadow: 0 12px 36px rgba(0,0,0,0.5);
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; font-weight: 600; color: #f0ecff;
  font-family: 'DM Sans', sans-serif; max-width: 300px;
  animation: pd-fadeup .25s ease both;
}
@keyframes pd-fadeup { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.pd-toast.success { border-color: rgba(16,185,129,0.35); }
.pd-toast.error   { border-color: rgba(225,29,72,0.35); }
.pd-toast.warning { border-color: rgba(245,158,11,0.35); }

/* ── Confirm ── */
.pd-confirm-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(3,3,13,0.88); backdrop-filter: blur(16px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.pd-confirm-box {
  width: 100%; max-width: 380px;
  background: #0d0d26; border: 1px solid rgba(225,29,72,0.3);
  border-radius: 22px; padding: 32px 28px; text-align: center;
  box-shadow: 0 32px 80px rgba(0,0,0,.7);
  animation: pd-fadeup .22s ease both;
}
.pd-confirm-icon  { font-size: 40px; margin-bottom: 14px; }
.pd-confirm-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #f0ecff; margin-bottom: 8px; }
.pd-confirm-sub   { font-size: 13px; color: #55527a; line-height: 1.65; margin-bottom: 24px; }
.pd-confirm-btns  { display: flex; gap: 10px; justify-content: center; }
.pd-confirm-cancel { padding: 9px 20px; border-radius: 10px; background: transparent; border: 1px solid rgba(255,255,255,0.08); color: #7a78a0; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; }
.pd-confirm-cancel:hover { border-color: rgba(255,255,255,0.15); color: #f0ecff; }
.pd-confirm-ok { padding: 9px 22px; border-radius: 10px; background: #e11d48; color: white; border: none; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .2s; }
.pd-confirm-ok:hover { background: #be123c; transform: translateY(-1px); }
`;

// ── Helpers ──────────────────────────────────────────────────
function useLocalToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, status = 'success') => {
    setToast({ msg, status });
    setTimeout(() => setToast(null), 2800);
  };
  return { toast, show };
}

function Toast({ msg, status, onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 2800); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`pd-toast ${status}`}>
      <span>{status === 'success' ? '✅' : status === 'error' ? '❌' : '⚠️'}</span>
      <span>{msg}</span>
    </div>
  );
}

function ConfirmDialog({ title, sub, onConfirm, onCancel }) {
  return (
    <div className="pd-confirm-overlay" onClick={onCancel}>
      <div className="pd-confirm-box" onClick={e => e.stopPropagation()}>
        <div className="pd-confirm-icon">🗑️</div>
        <div className="pd-confirm-title">{title}</div>
        <div className="pd-confirm-sub">{sub}</div>
        <div className="pd-confirm-btns">
          <button className="pd-confirm-cancel" onClick={onCancel}>Cancel</button>
          <button className="pd-confirm-ok" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

function UserAvatar({ src, name, onClick }) {
  const [broken, setBroken] = useState(false);
  const initials = (name || 'AN').slice(0, 2).toUpperCase();
  const normalized = normalizeAvatar(src);
  return (
    <div className="pd-avatar" onClick={onClick}>
      {!broken && normalized
        ? <img src={normalized} alt={name} onError={() => setBroken(true)} />
        : initials
      }
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────
const PostDetail = () => {
  const { postId }  = useParams();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const userId      = localStorage.getItem('userId');
  const { toast, show: showToast } = useLocalToast();

  const [commentText, setCommentText] = useState('');
  const [isEditOpen,  setIsEditOpen]  = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);

  // Optimistic like/dislike state
  const [isLiked,      setIsLiked]      = useState(null);
  const [isDisliked,   setIsDisliked]   = useState(false);
  const [upvoteCount,  setUpvoteCount]  = useState(null);
  const [downvoteCount,setDownvoteCount]= useState(null);

  // ── Fetch post ────────────────────────────────────────────
  const { data: postData, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => communityAPI.getPostById(postId),
    enabled: !!postId,
  });

  const post = postData?.data?.post ?? postData?.data;

  // Derived values (null = not yet overridden)
  const resolvedIsLiked  = isLiked      !== null ? isLiked      : (post?.HasUpvoted   ?? post?.hasUpvoted   ?? false);
  const resolvedUpvote   = upvoteCount  !== null ? upvoteCount  : (post?.UpvoteCount  ?? post?.upvoteCount  ?? post?.Upvotes ?? post?.likes?.length ?? 0);
  const resolvedDownvote = downvoteCount!== null ? downvoteCount: (post?.DownvoteCount ?? post?.downvoteCount ?? 0);
  const isOwner = post ? String(post.userId ?? post.UserId) === String(userId) : false;
  const commentCount = post?.CommentCount ?? post?.commentCount ?? post?.Comments?.length ?? post?.comments?.length ?? 0;

  const invalidatePost = () => {
    queryClient.invalidateQueries(['post', postId]);
    queryClient.invalidateQueries(['communityPosts']);
    queryClient.invalidateQueries(['myPosts']);
  };

  // ── Like ─────────────────────────────────────────────────
  const likeMutation = useMutation({
    mutationFn: () => resolvedIsLiked ? communityAPI.unlikePost(postId) : communityAPI.likePost(postId),
    onMutate: () => {
      if (resolvedIsLiked) {
        setIsLiked(false);
        setUpvoteCount(n => Math.max(0, (n ?? resolvedUpvote) - 1));
      } else {
        setIsLiked(true);
        setUpvoteCount(n => (n ?? resolvedUpvote) + 1);
        if (isDisliked) { setIsDisliked(false); setDownvoteCount(n => Math.max(0, (n ?? resolvedDownvote) - 1)); }
      }
    },
    onError: () => { setIsLiked(resolvedIsLiked); setUpvoteCount(resolvedUpvote); showToast('Something went wrong', 'error'); },
    onSettled: invalidatePost,
  });

  // ── Dislike ───────────────────────────────────────────────
  const dislikeMutation = useMutation({
    mutationFn: () => communityAPI.dislikePost(postId),
    onMutate: () => {
      if (isDisliked) {
        setIsDisliked(false); setDownvoteCount(n => Math.max(0, (n ?? resolvedDownvote) - 1));
      } else {
        setIsDisliked(true); setDownvoteCount(n => (n ?? resolvedDownvote) + 1);
        if (resolvedIsLiked) { setIsLiked(false); setUpvoteCount(n => Math.max(0, (n ?? resolvedUpvote) - 1)); }
      }
    },
    onError: () => { setIsDisliked(false); setDownvoteCount(resolvedDownvote); showToast('Something went wrong', 'error'); },
    onSettled: invalidatePost,
  });

  // ── Delete ────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: () => communityAPI.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['communityPosts']);
      queryClient.invalidateQueries(['myPosts']);
      showToast('Post deleted', 'success');
      setTimeout(() => navigate('/community/posts'), 800);
    },
    onError: () => showToast('Failed to delete post', 'error'),
  });

  // ── Comment ───────────────────────────────────────────────
  const commentMutation = useMutation({
    mutationFn: (data) => communityAPI.addComment(postId, data),
    onSuccess: (data) => {
      try {
        const resp = data?.data ?? data;
        const newComment = resp?.comment ?? resp?.data ?? resp;
        if (newComment) {
          queryClient.setQueryData(['comments', postId], (old) => {
            let arr = [];
            if (Array.isArray(old)) arr = old;
            else if (old?.data?.comments) arr = old.data.comments;
            else if (old?.data) arr = old.data;
            else if (old?.comments) arr = old.comments;
            return [...arr, newComment];
          });
        }
      } catch { queryClient.invalidateQueries(['comments', postId]); }
      invalidatePost();
      setCommentText('');
      showToast('Comment added!', 'success');
    },
    onError: () => showToast('Failed to add comment', 'error'),
  });

  // ── Auth guard ────────────────────────────────────────────
  const requireAuth = (msg) => {
    if (!userId) { showToast(msg || 'Login required', 'warning'); return false; }
    return true;
  };

  const handleLike    = () => { if (requireAuth('Login to like posts')) likeMutation.mutate(); };
  const handleDislike = () => { if (requireAuth('Login to dislike posts')) dislikeMutation.mutate(); };
  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!requireAuth('Login to comment')) return;
    commentMutation.mutate({ content: commentText });
  };

  // ── Loading ───────────────────────────────────────────────
  if (isLoading) return (
    <>
      <style>{CSS}</style>
      <div className="pd-page">
        <div className="pd-container">
          <div className="pd-loading">
            <div className="pd-spinner" />
            <div className="pd-loading-text">Loading post…</div>
          </div>
        </div>
      </div>
    </>
  );

  // ── Error ─────────────────────────────────────────────────
  if (error || !post) return (
    <>
      <style>{CSS}</style>
      <div className="pd-page">
        <div className="pd-container">
          <div className="pd-error">❌ Post not found or failed to load.</div>
          <button className="pd-back" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      </div>
    </>
  );

  const authorName = post.user?.name ?? post.userName ?? post.user?.username ?? 'Anonymous';
  const avatarSrc  = post.user?.avatar || post.user?.profileImageUrl || post.profileImageUrl || post.profileImage || post.user?.ProfileImageUrl || post.user?.Avatar;
  const dateStr    = post.createdAt ? new Date(post.createdAt).toLocaleString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '';

  return (
    <>
      <style>{CSS}</style>
      <div className="pd-page">
        <div className="pd-container">

          {/* ── BACK ── */}
          <button className="pd-back" onClick={() => navigate(-1)}>
            ← Back to Community
          </button>

          {/* ── MAIN CARD ── */}
          <div className="pd-card">

            {/* Header */}
            <div className="pd-header">
              <div className="pd-author-row">
                <UserAvatar
                  src={avatarSrc}
                  name={authorName}
                  onClick={() => navigate(`/user/${post.userId ?? post.UserId}`)}
                />
                <div>
                  <div className="pd-username" onClick={() => navigate(`/user/${post.userId ?? post.UserId}`)}>
                    {authorName}
                  </div>
                  <div className="pd-meta-row">
                    <span className="pd-date">🕐 {dateStr}</span>
                    {(post.category || post.postType) && (
                      <span className="pd-type-badge">{post.category || post.postType}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner controls */}
              {isOwner && (
                <div className="pd-owner-btns">
                  <button className="pd-btn-edit" onClick={() => setIsEditOpen(true)}>
                    ✏️ Edit
                  </button>
                  <button
                    className="pd-btn-delete"
                    onClick={() => setConfirmDel(true)}
                    disabled={deleteMutation.isLoading}
                  >
                    🗑️ {deleteMutation.isLoading ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="pd-content">
              {post.title && <div className="pd-title">{post.title}</div>}
              <div className="pd-body">{post.content}</div>
              {(post.mediaUrl || post.MediaUrl) && (
                <img
                  src={normalizeUrl(post.mediaUrl || post.MediaUrl)}
                  alt="Post media"
                  className="pd-media"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              )}
            </div>

            {/* Divider */}
            <div className="pd-divider" />

            {/* Actions */}
            <div className="pd-actions-row">
              <div className="pd-action-group">
                {/* Like */}
                <button
                  className={`pd-action-btn${resolvedIsLiked ? ' liked' : ''}`}
                  onClick={handleLike}
                  disabled={likeMutation.isLoading}
                >
                  {resolvedIsLiked
                    ? <FaHeart style={{ fontSize:14, color:'#fb7185' }} />
                    : <FaRegHeart style={{ fontSize:14, color:'#55527a' }} />
                  }
                  {resolvedUpvote} Likes
                </button>

                {/* Dislike */}
                <button
                  className={`pd-action-btn${isDisliked ? ' disliked' : ''}`}
                  onClick={handleDislike}
                  disabled={dislikeMutation.isLoading}
                >
                  <FaThumbsDown style={{ fontSize:13, color: isDisliked ? '#fb7185' : '#55527a' }} />
                  {resolvedDownvote} Dislikes
                </button>

                {/* Comment count */}
                <div className="pd-comment-count">💬 {commentCount} Comments</div>
              </div>
            </div>

            {/* ── Add Comment ── */}
            <div className="pd-comment-section">
              <div className="pd-comment-label">Add a Comment</div>
              <form onSubmit={handleComment}>
                <textarea
                  className="pd-textarea"
                  placeholder="Share your thoughts…"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  rows={3}
                />
                <div className="pd-comment-footer">
                  <button
                    type="submit"
                    className="pd-comment-btn"
                    disabled={!commentText.trim() || commentMutation.isLoading}
                  >
                    {commentMutation.isLoading && <div className="pd-btn-spinner" />}
                    {commentMutation.isLoading ? 'Posting…' : '💬 Comment'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── Edit modal ── */}
          <CreatePost
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onSuccess={() => {
              invalidatePost();
              setIsEditOpen(false);
              showToast('Post updated!', 'success');
            }}
            initialData={{
              id:       post.Id ?? post.id ?? post.postId ?? postId,
              title:    post.title    ?? post.Title,
              content:  post.content  ?? post.Content,
              category: post.postType ?? post.PostType ?? post.category,
              mediaUrl: post.mediaUrl ?? post.MediaUrl,
            }}
            isEdit
          />

          {/* ── Comments section ── */}
          <Comments postId={postId} />

        </div>
      </div>

      {/* ── Delete confirm ── */}
      {confirmDel && (
        <ConfirmDialog
          title="Delete this post?"
          sub="This action cannot be undone. The post and all its comments will be permanently removed."
          onConfirm={() => { setConfirmDel(false); deleteMutation.mutate(); }}
          onCancel={() => setConfirmDel(false)}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast.msg} status={toast.status} onClose={() => {}} />}
    </>
  );
};

export default PostDetail;