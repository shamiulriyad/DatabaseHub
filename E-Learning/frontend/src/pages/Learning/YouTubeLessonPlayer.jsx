import React, { useEffect, useRef, useState } from 'react';
import { Box, Spinner, HStack, Text, Progress, useToast } from '@chakra-ui/react';
import { learningService } from '../../services/learningService';

function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    return u.searchParams.get('v') || '';
  } catch {
    // fallback: try simple regex
    const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : '';
  }
}

export default function YouTubeLessonPlayer({ videoUrl, enrollmentId, lessonId, lessonDuration = 0, autoMark = true }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const lastSentRef = useRef(0);
  const toast = useToast();

  useEffect(() => {
    if (!videoUrl || !containerRef.current) return;

    let scriptAdded = false;
    const id = extractYouTubeId(videoUrl);

    function initPlayer() {
      if (!containerRef.current) return;
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy(); } catch (e) { /* ignore */ }
      }
      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '100%',
          width: '100%',
          videoId: id,
          playerVars: { rel: 0, modestbranding: 1, enablejsapi: 1 },
          events: {
            onStateChange: onStateChange,
          },
        });
      } catch (err) {
        console.error('YT player init failed', err);
      }

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        try {
          const p = playerRef.current;
          if (!p || typeof p.getCurrentTime !== 'function') return;
          const cur = Math.floor(p.getCurrentTime() || 0);
          setWatchedSeconds(cur);
          if (cur - lastSentRef.current >= 5) {
            lastSentRef.current = cur;
            const pctNow = lessonDuration > 0 ? Math.min(100, Math.floor((cur / lessonDuration) * 100)) : 0;
            console.debug('YouTubeLessonPlayer.watchTick', { lessonId, enrollmentId, cur, pctNow });
            if (enrollmentId && lessonId) {
              learningService.watchLesson(lessonId, enrollmentId, cur).catch((err) => console.debug('YouTubeLessonPlayer.watchLesson error', { lessonId, enrollmentId, cur, err }));
            }
            try {
              console.debug('YouTubeLessonPlayer.dispatch lessonProgress', { lessonId, watchedSeconds: cur, percent: pctNow, isCompleted: false });
              window.dispatchEvent(new CustomEvent('lessonProgress', { detail: { lessonId, watchedSeconds: cur, percent: pctNow, isCompleted: false } }));
            } catch (e) { /* ignore */ }
          }

          if (autoMark && lessonDuration > 0) {
            const pct = Math.min(100, Math.floor((cur / lessonDuration) * 100));
            if (pct >= 90) {
              if (enrollmentId && lessonId) {
                console.debug('YouTubeLessonPlayer.autoComplete (>=90%)', { lessonId, enrollmentId, pct });
                learningService.completeLesson(enrollmentId, lessonId)
                  .then(() => {
                    try { console.debug('YouTubeLessonPlayer.dispatch enrollmentUpdated/lessonCompleted', { enrollmentId, lessonId }); window.dispatchEvent(new CustomEvent('enrollmentUpdated', { detail: { enrollmentId } })); } catch (e) { }
                    try { window.dispatchEvent(new CustomEvent('lessonCompleted', { detail: { lessonId } })); } catch (e) { }
                    try { window.dispatchEvent(new CustomEvent('lessonProgress', { detail: { lessonId, watchedSeconds: Math.floor(pct * (lessonDuration/100)), percent: pct, isCompleted: true } })); } catch (e) { }
                    toast({ title: 'Lesson auto-completed (90%)', status: 'success', duration: 3000 });
                  })
                  .catch((err) => console.debug('YouTubeLessonPlayer.completeLesson error', { lessonId, enrollmentId, err }));
                clearInterval(intervalRef.current);
              }
            }
          }
        } catch (e) { console.error(e); }
      }, 1000);
    }

    function onStateChange(evt) {
      const YT = window.YT;
      try {
        if (evt.data === (YT?.PlayerState?.ENDED ?? 0)) {
          const p = playerRef.current;
          const cur = Math.floor((p && p.getCurrentTime && p.getCurrentTime()) || 0);
          setWatchedSeconds(cur);
          const pctNow = lessonDuration > 0 ? Math.min(100, Math.floor((cur / lessonDuration) * 100)) : 0;
          try { console.debug('YouTubeLessonPlayer.ended dispatch', { lessonId, cur, pctNow }); window.dispatchEvent(new CustomEvent('lessonProgress', { detail: { lessonId, watchedSeconds: cur, percent: pctNow, isCompleted: false } })); } catch (e) { }
          if (enrollmentId && lessonId) {
            console.debug('YouTubeLessonPlayer.ended API calls', { lessonId, enrollmentId, cur });
            learningService.watchLesson(lessonId, enrollmentId, cur).catch((err) => console.debug('YouTubeLessonPlayer.watchLesson error', { lessonId, enrollmentId, cur, err }));
            learningService.completeLesson(enrollmentId, lessonId)
              .then(() => {
                try { console.debug('YouTubeLessonPlayer.dispatch enrollmentUpdated/lessonCompleted (ended)', { enrollmentId, lessonId }); window.dispatchEvent(new CustomEvent('enrollmentUpdated', { detail: { enrollmentId } })); } catch (e) { }
                try { window.dispatchEvent(new CustomEvent('lessonCompleted', { detail: { lessonId } })); } catch (e) { }
                try { window.dispatchEvent(new CustomEvent('lessonProgress', { detail: { lessonId, watchedSeconds: cur, percent: pctNow, isCompleted: true } })); } catch (e) { }
                toast({ title: 'Lesson completed', status: 'success', duration: 3000 });
              })
              .catch((err) => console.debug('YouTubeLessonPlayer.completeLesson error', { lessonId, enrollmentId, err }));
          }
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (e) { console.error('onStateChange error', e); }
    }

    if (window.YT && window.YT.Player) initPlayer();
    else {
      // inject API
      if (!document.querySelector('script[data-youtube-api]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        s.setAttribute('data-youtube-api', '1');
        document.body.appendChild(s);
        scriptAdded = true;
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        try { if (prev) prev(); } catch (e) { }
        initPlayer();
      };
    }

    return () => {
      try { if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy(); } catch (e) { }
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (scriptAdded) {
        const s = document.querySelector('script[data-youtube-api]');
        if (s && s.parentNode) s.parentNode.removeChild(s);
      }
    };
  }, [videoUrl, enrollmentId, lessonId, lessonDuration, autoMark, toast]);

  const percent = lessonDuration > 0 ? Math.min(100, Math.floor((watchedSeconds / lessonDuration) * 100)) : 0;

  return (
    <Box>
      <Box style={{ width: '100%', height: '100%' }}>
        <div ref={containerRef} />
      </Box>
      <HStack mt={3} justify="space-between">
        <Text fontSize="sm">Watched: {Math.floor(watchedSeconds / 60)} min</Text>
        <Text fontSize="sm">{percent}%</Text>
      </HStack>
      <Progress value={percent} mt={2} size="sm" colorScheme="purple" />
    </Box>
  );
}
