import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { communityService } from '../../services/communityService';
import FinalLogo from '../../assets/final.png';

// ═══════════════════════════════════════════════════════════
// NEXTUNIVERSE — CREATE / EDIT POST MODAL
// Cosmic Dark Premium · Pure CSS · No Chakra UI
// ═══════════════════════════════════════════════════════════

const CSS = `
/* ── Overlay ── */
.cp-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(3,3,13,0.88);
  backdrop-filter: blur(18px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  animation: cp-fade .2s ease both;
}
@keyframes cp-fade { from{opacity:0} to{opacity:1} }
@keyframes cp-up   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

/* ── Modal ── */
.cp-modal {
  width: 100%; max-width: 580px;
  background: #0d0d26;
  border: 1px solid rgba(124,58,237,0.28);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(0,0,0,0.75), 0 0 60px rgba(124,58,237,0.1);
  animation: cp-up .28s ease both;
  font-family: 'DM Sans', sans-serif;
}

/* ── Header ── */
.cp-header {
  padding: 22px 26px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(135deg, rgba(91,33,182,0.1), rgba(124,58,237,0.04));
  position: relative;
}
.cp-header::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent);
}
.cp-header-left { display: flex; align-items: center; gap: 10px; }
.cp-header-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg,#5b21b6,#7c3aed);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; box-shadow: 0 0 16px rgba(124,58,237,0.4);
}
.cp-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 17px; font-weight: 700; color: #f0ecff;
  letter-spacing: -0.01em;
}
.cp-close-btn {
  width: 32px; height: 32px; border-radius: 10px;
  background: transparent; border: 1px solid rgba(255,255,255,0.07);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #55527a; font-size: 16px;
  transition: all .2s; line-height: 1;
}
.cp-close-btn:hover { background: rgba(225,29,72,0.1); border-color: rgba(225,29,72,0.3); color: #fb7185; }
.cp-close-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ── Body ── */
.cp-body { padding: 22px 26px; display: flex; flex-direction: column; gap: 16px; }

/* ── Form group ── */
.cp-group { display: flex; flex-direction: column; gap: 6px; }
.cp-label {
  font-size: 11px; font-weight: 700; letter-spacing: .13em;
  text-transform: uppercase; color: #55527a;
}
.cp-label .req { color: #7c3aed; margin-left: 3px; }

/* ── Category chips ── */
.cp-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.cp-chip {
  padding: 6px 15px; border-radius: 99px;
  font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif;
  cursor: pointer; border: 1px solid rgba(255,255,255,0.07);
  background: transparent; color: #55527a;
  transition: all .2s;
}
.cp-chip:hover { border-color: rgba(124,58,237,0.3); color: #a09ec0; }
.cp-chip.active {
  background: rgba(124,58,237,0.14);
  border-color: rgba(124,58,237,0.4);
  color: #c4b5fd;
}

/* ── Inputs ── */
.cp-input, .cp-textarea, .cp-select {
  width: 100%; padding: 11px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  color: #f0ecff; font-family: 'DM Sans', sans-serif; font-size: 14px;
  outline: none; transition: all .2s;
}
.cp-input:focus, .cp-textarea:focus, .cp-select:focus {
  border-color: rgba(124,58,237,0.45);
  background: rgba(124,58,237,0.05);
  box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
}
.cp-input::placeholder, .cp-textarea::placeholder { color: #3d3b58; }
.cp-input:disabled, .cp-textarea:disabled { opacity: .5; cursor: not-allowed; }
.cp-input.error { border-color: rgba(225,29,72,0.4); }
.cp-input.error:focus { box-shadow: 0 0 0 3px rgba(225,29,72,0.1); }

.cp-textarea { resize: none; min-height: 130px; line-height: 1.75; }
.cp-textarea.error { border-color: rgba(225,29,72,0.4); }

/* ── Error message ── */
.cp-error { font-size: 11px; color: #fb7185; display: flex; align-items: center; gap: 5px; }

/* ── Char counter ── */
.cp-char-row { display: flex; justify-content: flex-end; }
.cp-char {
  font-size: 11px; color: #3d3b58;
  font-family: 'DM Mono', monospace;
  transition: color .2s;
}
.cp-char.warn { color: #f59e0b; }
.cp-char.over { color: #fb7185; }

/* ── Media preview ── */
.cp-media-preview {
  width: 100%; max-height: 180px; object-fit: cover;
  border-radius: 12px; margin-top: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  display: block;
}

/* ── Footer ── */
.cp-footer {
  padding: 16px 26px 22px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex; align-items: center; justify-content: flex-end; gap: 10px;
}
.cp-cancel-btn {
  padding: 10px 20px; border-radius: 12px;
  background: transparent; border: 1px solid rgba(255,255,255,0.07);
  color: #7a78a0; font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s;
}
.cp-cancel-btn:hover { border-color: rgba(255,255,255,0.15); color: #f0ecff; }
.cp-cancel-btn:disabled { opacity: .4; cursor: not-allowed; }

.cp-submit-btn {
  padding: 10px 26px; border-radius: 12px;
  background: linear-gradient(135deg,#5b21b6,#7c3aed);
  color: white; font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 700; cursor: pointer; border: none;
  transition: all .2s; box-shadow: 0 4px 16px rgba(124,58,237,0.35);
  display: flex; align-items: center; gap: 7px;
}
.cp-submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.5); }
.cp-submit-btn:active { transform: translateY(0); }
.cp-submit-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }

/* ── Spinner ── */
.cp-spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: white;
  animation: cp-spin .65s linear infinite;
}
@keyframes cp-spin { to{transform:rotate(360deg)} }

/* ── Toast ── */
.cp-toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 999;
  padding: 12px 18px; border-radius: 14px;
  background: #111130; border: 1px solid rgba(124,58,237,0.3);
  box-shadow: 0 12px 36px rgba(0,0,0,0.5);
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; font-weight: 600; color: #f0ecff;
  font-family: 'DM Sans', sans-serif;
  animation: cp-up .2s ease both;
  max-width: 300px;
}
.cp-toast.success { border-color: rgba(16,185,129,0.35); }
.cp-toast.error   { border-color: rgba(225,29,72,0.35); }

@media(max-width:560px) {
  .cp-modal { border-radius: 18px; }
  .cp-body, .cp-footer { padding-left: 16px; padding-right: 16px; }
  .cp-header { padding-left: 16px; padding-right: 16px; }
}
`;

// ── Category options ─────────────────────────────────────────
const CATEGORIES = [
  { value:'general',      label:'📌 General'      },
  { value:'question',     label:'❓ Question'     },
  { value:'announcement', label:'📢 Announcement' },
  { value:'discussion',   label:'💬 Discussion'   },
  { value:'help',         label:'🆘 Help'         },
];

// Suggested media gallery (include local project assets and public placeholders). Users can upload PNGs which will be added to the gallery client-side.
const DEFAULT_SUGGESTED = [
  FinalLogo,
  '/images/course-placeholder.png',
  '/images/placeholder.png',
];

// ── Toast component ──────────────────────────────────────────
function Toast({ msg, status, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`cp-toast ${status}`}>
      <span>{status === 'success' ? '✅' : '❌'}</span>
      <span>{msg}</span>
    </div>
  );
}

// ── Media preview ────────────────────────────────────────────
function MediaPreview({ url }) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  useEffect(() => { setOk(false); setErr(false); }, [url]);
  if (!url?.trim() || err) return null;
  return (
    <img
      src={url.trim()} alt="preview"
      className="cp-media-preview"
      onLoad={() => setOk(true)}
      onError={() => setErr(true)}
      style={{ display: ok ? 'block' : 'none' }}
    />
  );
}

/* Gallery thumbnail */
function Thumbnail({ src, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(src)}
      style={{
        border: selected ? '2px solid #7c3aed' : '2px solid transparent',
        padding: 0,
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'transparent'
      }}
    >
      <img src={src} alt="thumb" style={{ width: 96, height: 64, objectFit: 'cover', display: 'block' }} />
    </button>
  );
}


// ── MAIN COMPONENT ───────────────────────────────────────────
const CreatePost = ({ isOpen, onClose, onSuccess, initialData = null, isEdit = false }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title:    '',
    content:  '',
    category: 'general',
    mediaUrl: '',
    useUrl: false,
    mediaFile: null,
  });
  const [suggested, setSuggested] = useState(DEFAULT_SUGGESTED);
  const uploadInputRef = useRef(null);
  const [errors,       setErrors]       = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [toast,        setToast]        = useState(null);

  // Sync form when initialData / isOpen changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title:    initialData.title    || initialData.Title    || '',
        content:  initialData.content  || initialData.Content  || '',
        category: initialData.category || (initialData.postType ? String(initialData.postType).toLowerCase() : 'general'),
        mediaUrl: initialData.mediaUrl || initialData.MediaUrl || '',
        useUrl: (() => {
          const mv = initialData.mediaUrl || initialData.MediaUrl || '';
          if (!mv) return false;
          return !DEFAULT_SUGGESTED.includes(mv);
        })(),
        mediaFile: null,
      });
    } else {
      setFormData({ title:'', content:'', category:'general', mediaUrl:'', useUrl:false, mediaFile: null });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const showToast = (msg, status = 'success') => {
    setToast({ msg, status });
    setTimeout(() => setToast(null), 3200);
  };

  // Validation
  const validate = () => {
    const e = {};
    if (!formData.title.trim())           e.title   = 'Title is required';
    if (!formData.content.trim())         e.content = 'Content is required';
    if (formData.content.length > 5000)   e.content = 'Content must be under 5,000 characters';
    return e;
  };

  const handleChange = (name, value) => {
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const invalidate = () => {
    queryClient.invalidateQueries(['communityPosts']);
    queryClient.invalidateQueries(['myPosts']);
    queryClient.invalidateQueries(['allPostsCount']);
    queryClient.invalidateQueries(['myPostsCount']);
    if (isEdit && initialData) {
      const pid = initialData.id ?? initialData.Id ?? initialData.postId ?? initialData.postID ?? initialData.post_id;
      if (pid) queryClient.invalidateQueries(['post', pid]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSubmitting(true);
    // Prepare optimistic post for immediate UI feedback (shows blob URLs)
    const tempId = `tmp-${Date.now()}`;
    const optimisticPost = {
      id: tempId,
      title: formData.title.trim(),
      content: formData.content.trim(),
      postType: formData.category ? formData.category.charAt(0).toUpperCase() + formData.category.slice(1) : 'General',
      mediaUrl: formData.mediaUrl?.trim() || '',
      userName: (() => {
        try { const u = JSON.parse(localStorage.getItem('user') || '{}'); return u?.name || 'You'; } catch { return 'You'; }
      })(),
      upvoteCount: 0,
      downvoteCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Helper: prepend optimistic post to all communityPosts caches
    const prependOptimistic = (post) => {
      const queries = queryClient.getQueryCache().getAll();
      queries.forEach(q => {
        const key = q.queryKey;
        if (!Array.isArray(key) || key[0] !== 'communityPosts') return;
        queryClient.setQueryData(key, (old) => {
          if (!old) return [post];
          const payload = old.data ?? old;
          if (Array.isArray(payload)) return [post, ...payload];
          if (old.data && Array.isArray(old.data)) return { ...old, data: [post, ...old.data] };
          return old;
        });
      });
    };

    // Helper: replace temp post with server post (merge mediaUrl if missing)
    const replaceTempWithServer = (tempIdLocal, serverPost) => {
      const queries = queryClient.getQueryCache().getAll();
      queries.forEach(q => {
        const key = q.queryKey;
        if (!Array.isArray(key) || key[0] !== 'communityPosts') return;
        queryClient.setQueryData(key, (old) => {
          if (!old) return old;
          const payload = old.data ?? old;
          if (Array.isArray(payload)) {
            return payload.map(p => {
              if ((p.id ?? p.Id) === tempIdLocal) {
                // merge mediaUrl from optimistic if server didn't return it
                const merged = { ...serverPost };
                if (!merged.mediaUrl && p.mediaUrl) merged.mediaUrl = p.mediaUrl;
                return merged;
              }
              return p;
            });
          }
          if (old.data && Array.isArray(old.data)) {
            return { ...old, data: old.data.map(p => ((p.id ?? p.Id) === tempIdLocal ? ({ ...serverPost, mediaUrl: serverPost.mediaUrl || p.mediaUrl }) : p)) };
          }
          return old;
        });
      });
    };

    // Apply optimistic update if we have a local media blob or any mediaUrl set
    if (formData.mediaUrl) prependOptimistic(optimisticPost);
    try {
      const postData = {
        title:    formData.title.trim(),
        content:  formData.content.trim(),
        postType: formData.category
          ? formData.category.charAt(0).toUpperCase() + formData.category.slice(1)
          : 'General',
        ...(formData.mediaUrl?.trim() && { mediaUrl: formData.mediaUrl.trim() }),
      };

      if (isEdit && initialData) {
        const uid = initialData.id ?? initialData.Id ?? initialData.postId ?? initialData.postID ?? initialData.post_id;
        await communityService.updatePost(uid, postData);
      } else {
        const serverResp = await communityService.createPost(postData);
        // If we created an optimistic post earlier, replace it with server response
        if (formData.mediaUrl) {
          try {
            const serverPost = serverResp?.data ?? serverResp;
            replaceTempWithServer(tempId, serverPost);
          } catch {}
        }
      }

      invalidate();
      showToast(isEdit ? 'Post updated!' : 'Post published!', 'success');

      if (!isEdit) setFormData({ title:'', content:'', category:'general', mediaUrl:'', useUrl:false, mediaFile:null });
      setErrors({});
      onClose();
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error('CreatePost error:', err);
      let msg = 'Failed to save post. Please try again.';
      if (err.response?.data?.message)  msg = err.response.data.message;
      else if (err.response?.status === 401) msg = 'Please login to post.';
      else if (err.response?.status === 400) msg = 'Invalid post data.';
      else if (err.response?.status === 413) msg = 'Content is too large.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData({ title:'', content:'', category:'general', mediaUrl:'', useUrl:false, mediaFile: null });
    setErrors({});
    onClose();
  };

  // Upload handler: upload selected image to backend and use returned URL
  const handleFileSelected = async (file) => {
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const maxBytes = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      showToast('Only PNG, JPG/JPEG, and WEBP images are allowed.', 'error');
      return;
    }

    if (file.size > maxBytes) {
      showToast('Image size must be 5MB or less.', 'error');
      return;
    }

    setIsUploadingMedia(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploadedUrl = await communityService.uploadCommunityImage(fd);

      if (!uploadedUrl) {
        showToast('Upload failed. Please try again.', 'error');
        return;
      }

      setSuggested(s => (s.includes(uploadedUrl) ? s : [uploadedUrl, ...s]));
      setFormData(p => ({ ...p, mediaUrl: uploadedUrl, mediaFile: null, useUrl: true }));
      showToast('Image uploaded successfully!', 'success');
    } catch (err) {
      let msg = 'Failed to upload image. Please try again.';
      if (err?.response?.data?.message) msg = err.response.data.message;
      showToast(msg, 'error');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  useEffect(() => {
    // cleanup object URLs created for uploaded images when component unmounts
    // BUT: avoid revoking blobs that are still referenced by optimistic posts
    return () => {
      try {
        const queries = queryClient.getQueryCache().getAll();
        suggested.forEach(s => {
          try {
            if (!s || !s.startsWith('blob:')) return;
            // If any communityPosts cache still references this blob, skip revoking
            const isReferenced = queries.some(q => {
              const key = q.queryKey;
              if (!Array.isArray(key) || key[0] !== 'communityPosts') return false;
              const data = queryClient.getQueryData(key);
              const payload = data?.data ?? data;
              if (Array.isArray(payload)) return payload.some(p => (p.mediaUrl || p.MediaUrl) === s);
              if (data?.data && Array.isArray(data.data)) return data.data.some(p => (p.mediaUrl || p.MediaUrl) === s);
              return false;
            });
            if (!isReferenced) URL.revokeObjectURL(s);
          } catch {}
        });
      } catch {}
    };
  }, [suggested, queryClient]);

  const charCount = formData.content.length;
  const charClass = charCount > 5000 ? 'over' : charCount > 4000 ? 'warn' : '';

  if (!isOpen) return null;

  return (
    <>
      <style>{CSS}</style>

      <div className="cp-overlay" onClick={handleClose}>
        <div className="cp-modal" onClick={e => e.stopPropagation()}>
          <form onSubmit={handleSubmit}>

            {/* ── HEADER ── */}
            <div className="cp-header">
              <div className="cp-header-left">
                <div className="cp-header-icon">
                  {isEdit ? '✏️' : '✦'}
                </div>
                <span className="cp-title">
                  {isEdit ? 'Edit Post' : 'Create Post'}
                </span>
              </div>
              <button
                type="button"
                className="cp-close-btn"
                onClick={handleClose}
                disabled={isSubmitting}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* ── BODY ── */}
            <div className="cp-body">

              {/* Category */}
              <div className="cp-group">
                <div className="cp-label">Category</div>
                <div className="cp-chips">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      className={`cp-chip${formData.category === c.value ? ' active' : ''}`}
                      onClick={() => handleChange('category', c.value)}
                      disabled={isSubmitting}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="cp-group">
                <label className="cp-label">
                  Title <span className="req">*</span>
                </label>
                <input
                  className={`cp-input${errors.title ? ' error' : ''}`}
                  name="title"
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  placeholder="Enter a clear, descriptive title…"
                  disabled={isSubmitting}
                  autoComplete="off"
                />
                {errors.title && (
                  <div className="cp-error">⚠ {errors.title}</div>
                )}
              </div>

              {/* Content */}
              <div className="cp-group">
                <label className="cp-label">
                  Content <span className="req">*</span>
                </label>
                <textarea
                  className={`cp-textarea${errors.content ? ' error' : ''}`}
                  name="content"
                  value={formData.content}
                  onChange={e => handleChange('content', e.target.value)}
                  placeholder="What would you like to share with the community?"
                  disabled={isSubmitting}
                  rows={6}
                />
                <div className="cp-char-row">
                  <span className={`cp-char ${charClass}`}>
                    {charCount.toLocaleString()} / 5,000
                  </span>
                </div>
                {errors.content && (
                  <div className="cp-error">⚠ {errors.content}</div>
                )}
              </div>

              {/* Media - gallery of suggested images + optional URL toggle */}
              <div className="cp-group">
                <label className="cp-label">Media <span style={{ color:'#3d3b58', fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                  {suggested.map((m) => (
                    <Thumbnail
                      key={m}
                      src={m}
                      selected={formData.mediaUrl === m}
                      onClick={(url) => handleChange('mediaUrl', url)}
                    />
                  ))}
                </div>

                <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="cp-chip"
                    onClick={() => { handleChange('mediaUrl', ''); handleChange('useUrl', false); }}
                    disabled={isSubmitting}
                    style={{ padding: '6px 10px' }}
                  >
                    Remove media
                  </button>

                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelected(f);
                      e.target.value = '';
                    }}
                  />

                  <button
                    type="button"
                    className="cp-chip"
                    onClick={() => uploadInputRef.current?.click()}
                    disabled={isSubmitting || isUploadingMedia}
                    style={{ padding: '6px 10px' }}
                  >
                    {isUploadingMedia ? 'Uploading…' : 'Upload PNG/JPG'}
                  </button>

                  <button
                    type="button"
                    className="cp-chip"
                    onClick={() => handleChange('useUrl', !formData.useUrl)}
                    disabled={isSubmitting}
                    style={{ padding: '6px 10px' }}
                  >
                    {formData.useUrl ? 'Hide URL' : 'Use custom URL'}
                  </button>
                </div>

                {formData.useUrl && (
                  <div style={{ marginTop: 10 }}>
                    <input
                      className="cp-input"
                      name="mediaUrl"
                      value={formData.mediaUrl}
                      onChange={e => handleChange('mediaUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      disabled={isSubmitting}
                      autoComplete="off"
                    />
                  </div>
                )}

                <MediaPreview url={formData.mediaUrl} />
              </div>

            </div>

            {/* ── FOOTER ── */}
            <div className="cp-footer">
              <button
                type="button"
                className="cp-cancel-btn"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cp-submit-btn"
                disabled={isSubmitting || isUploadingMedia || charCount > 5000}
              >
                {isSubmitting && <div className="cp-spinner" />}
                {isSubmitting
                  ? (isEdit ? 'Saving…' : 'Posting…')
                  : (isEdit ? '✅ Save Changes' : '✦ Publish Post')
                }
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast msg={toast.msg} status={toast.status} onClose={() => setToast(null)} />
      )}
    </>
  );
};

export default CreatePost;