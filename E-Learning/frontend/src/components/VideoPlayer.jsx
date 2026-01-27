import React, { useEffect, useRef, useState, useCallback } from 'react';
import { learningService } from '../services/learningService';

// VideoPlayer props:
// - lessonId: integer
// - videoType: 'YOUTUBE' | 'MP4'
// - videoUrl: string (YouTube link or mp4 URL)
// - duration: number (seconds, optional)
export default function VideoPlayer({ lessonId, videoType, videoUrl, duration, enrollmentId = null }) {
  const videoRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const ytDivRef = useRef(null);
  // mutable refs used inside callbacks to avoid stale closures
  const lastSentRef = useRef(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const isCompletedRef = useRef(isCompleted);

  const sendWatch = useCallback(async (watchedSeconds) => {
    try {
      console.debug('VideoPlayer.sendWatch', { lessonId, watchedSeconds });
      // learningService.watchLesson expects (lessonId, enrollmentId, watchedSeconds)
      // pass enrollmentId when available so backend can update enrollment progress
      const data = await learningService.watchLesson(lessonId, enrollmentId, watchedSeconds).catch((err) => {
        console.debug('VideoPlayer.watchLesson error', { lessonId, watchedSeconds, err });
        return null;
      });
      if (data && data.isCompleted) {
        setIsCompleted(true);
        isCompletedRef.current = true;
      }
      try {
        let dur = duration || 0;
        // fallback: read duration from actual player if prop missing
        try {
          if ((!dur || dur === 0) && videoType === 'MP4' && videoRef.current && videoRef.current.duration) {
            dur = Math.floor(videoRef.current.duration || 0);
          }
          if ((!dur || dur === 0) && videoType === 'YOUTUBE' && ytPlayerRef.current && typeof ytPlayerRef.current.getDuration === 'function') {
            dur = Math.floor(ytPlayerRef.current.getDuration() || 0);
          }
        } catch (e) { /* ignore */ }

        const percent = dur > 0 ? Math.min(100, Math.floor((watchedSeconds / dur) * 100)) : 0;
        console.debug('VideoPlayer.dispatch lessonProgress', { lessonId, watchedSeconds, percent, dur, isCompleted: !!(data && data.isCompleted) });
        window.dispatchEvent(new CustomEvent('lessonProgress', { detail: { lessonId, watchedSeconds, percent, isCompleted: !!(data && data.isCompleted) } }));
      } catch (e) { /* ignore */ }
    } catch (e) { console.error(e); }
  }, [lessonId, duration, videoType]);

  const sendComplete = useCallback(async () => {
    try {
      console.debug('VideoPlayer.sendComplete', { lessonId });
      await learningService.completeLesson(enrollmentId, lessonId).catch((err) => { console.debug('VideoPlayer.completeLesson error', { lessonId, enrollmentId, err }); return null; });
      setIsCompleted(true);
      isCompletedRef.current = true;
      try { console.debug('VideoPlayer.dispatch lessonCompleted', { lessonId }); window.dispatchEvent(new CustomEvent('lessonCompleted', { detail: { lessonId } })); } catch (e) {}
    } catch (e) { console.error(e); }
  }, [lessonId]);

  // MP4 handlers
  useEffect(() => {
    if (videoType !== 'MP4') return;
    const v = videoRef.current;
    if (!v) return;

    const onTimeUpdate = () => {
      const sec = Math.floor(v.currentTime);
      // send every 15 seconds or when progressed beyond lastSentRef
      if (sec - lastSentRef.current >= 15 || sec > lastSentRef.current + 1) {
        lastSentRef.current = sec;
        sendWatch(sec);
      }
      // completed check using ref to avoid stale closure
      const dur = duration || Math.floor(v.duration || 0);
      if (dur > 0 && sec >= Math.ceil(dur * 0.9) && !isCompletedRef.current) {
        sendComplete();
      }
    };

    const onEnded = () => {
      sendComplete();
    };

    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('ended', onEnded);

    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('ended', onEnded);
    };
  }, [videoType, lessonId, duration, sendComplete, sendWatch]);

  // YouTube integration (IFrame API)
  useEffect(() => {
    if (videoType !== 'YOUTUBE') return;

    const ensureYouTubeApi = () => {
      return new Promise((resolve) => {
        if (window.YT && window.YT.Player) return resolve(window.YT);
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        window.onYouTubeIframeAPIReady = () => resolve(window.YT);
        document.body.appendChild(tag);
      });
    };

    let intervalId;

    (async () => {
      const YT = await ensureYouTubeApi();
      const id = `yt-player-${lessonId}`;
      // extract video id if a full url provided
      const videoIdMatch = videoUrl.match(/[?&]v=([^&]+)/);
      const vid = videoIdMatch ? videoIdMatch[1] : videoUrl.split('/').pop();

      ytPlayerRef.current = new YT.Player(id, {
        height: '390',
        width: '640',
        videoId: vid,
        events: {
          onStateChange: (e) => {
            const state = e.data;
            // playing
            if (state === 1) {
              // start polling every 8s
              if (!intervalId) {
                intervalId = setInterval(() => {
                  try {
                    const t = Math.floor(ytPlayerRef.current.getCurrentTime());
                    if (t - lastSentRef.current >= 15 || t > lastSentRef.current + 1) {
                      lastSentRef.current = t;
                      sendWatch(t);
                    }
                    const dur = duration || Math.floor(ytPlayerRef.current.getDuration() || 0);
                    if (dur > 0 && t >= Math.ceil(dur * 0.9) && !isCompletedRef.current) {
                      sendComplete();
                    }
                  } catch (err) {
                    // ignore
                  }
                }, 8000);
              }
            } else {
              // stopped/paused: clear interval
              if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
                try {
                  const t = Math.floor(ytPlayerRef.current.getCurrentTime());
                  // send on pause as well
                  if (t > lastSentRef.current) {
                    lastSentRef.current = t;
                    sendWatch(t);
                  }
                } catch (e) {}
              }
            }
            // ended
            if (state === 0) sendComplete();
          }
        }
      });
    })();

    return () => {
      try {
        if (ytPlayerRef.current && ytPlayerRef.current.destroy) ytPlayerRef.current.destroy();
      } catch (e) {}
    };
  }, [videoType, videoUrl, lessonId, duration, sendComplete, sendWatch]);

  return (
    <div>
      {videoType === 'MP4' && (
        <video ref={videoRef} controls style={{ width: '100%' }} src={videoUrl} />
      )}
      {videoType === 'YOUTUBE' && (
        <div id={`yt-player-${lessonId}`} ref={ytDivRef}></div>
      )}
      {isCompleted && <div style={{ color: 'green', marginTop: 8 }}>Completed</div>}
    </div>
  );
}
