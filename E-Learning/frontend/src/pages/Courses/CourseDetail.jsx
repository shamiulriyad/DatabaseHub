import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Heading, Text, Image, Button, HStack, IconButton, Input,
  VStack, useToast, Container, Flex, Badge, Stack, Divider,
  Progress, Grid, GridItem, Card, CardBody, AspectRatio,
  Icon, Spinner, Skeleton, SkeletonText, Textarea, useColorModeValue,
} from '@chakra-ui/react';
import { StarIcon, ChevronLeftIcon, LockIcon, UnlockIcon } from '@chakra-ui/icons';
import { FiBookOpen, FiClock, FiUsers, FiBarChart2, FiPlay, FiCheckCircle, FiGlobe, FiAward } from 'react-icons/fi';
import { courseService } from '../../services/courseService';
import api from '../../services/api';
import { FREE_COURSE_BANNER_IMAGES } from '../../config/freeCourseBannerImages';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  pageBg:  '#070B1A',
  surface: '#0D1428',
  card:    '#111A35',
  border:  '#1E2D55',
  muted:   '#8896BB',
  brand:   '#7055ff',
  brandDk: '#5533ee',
  gold:    '#fbbf24',
  green:   '#4ade80',
  red:     '#f87171',
  blue:    '#38bdf8',
};

const MEDIA_ORIGIN = (() => {
  const fallbackBase = process.env.REACT_APP_API_URL || 'http://localhost:5145/api';
  const apiBase = api?.defaults?.baseURL || fallbackBase;
  try {
    const parsed = new URL(apiBase, window.location.origin);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return window.location.origin;
  }
})();

const normalizeMediaUrl = (rawUrl) => {
  const value = (rawUrl || '').toString().trim();
  if (!value) return '';

  if (/^(https?:)?\/\//i.test(value)) {
    return value.startsWith('//') ? `https:${value}` : value;
  }

  if (/^((www\.)?youtube\.com|youtu\.be)\//i.test(value)) {
    return `https://${value}`;
  }

  if (/^((www\.)?drive\.google\.com|vimeo\.com)\//i.test(value)) {
    return `https://${value}`;
  }

  if (value.startsWith('/api/')) {
    return `${MEDIA_ORIGIN}${value.slice(4)}`;
  }

  if (value.startsWith('/')) {
    return `${MEDIA_ORIGIN}${value}`;
  }

  return `${MEDIA_ORIGIN}/${value.replace(/^\/+/, '')}`;
};

const extractPartRawUrl = (part) => (
  part?.videoUrl
  || part?.VideoUrl
  || part?.videoURL
  || part?.VideoURL
  || part?.youTubeUrl
  || part?.YouTubeUrl
  || part?.youtubeUrl
  || part?.YoutubeUrl
  || part?.resourceUrl
  || part?.ResourceUrl
  || part?.fileUrl
  || part?.FileUrl
  || part?.contentUrl
  || part?.ContentUrl
  || part?.url
  || part?.Url
  || ''
);

const pickPartVideoUrl = (part) => normalizeMediaUrl(
  extractPartRawUrl(part)
);

// Use Chakra color mode to match site backgrounds
const pageBgToken = (mode) => mode; // placeholder

// ─── Global Styles ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

    body { background:${C.pageBg}; color:#f0f4ff; font-family:'DM Sans',sans-serif; }
    ::selection { background:${C.brandDk}; color:#fff; }
    ::-webkit-scrollbar { width:6px; }
    ::-webkit-scrollbar-track { background:${C.surface}; }
    ::-webkit-scrollbar-thumb { background:${C.brandDk}; border-radius:999px; }

    @keyframes floatUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
    @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.3);opacity:.6} }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

    .nu-reveal   { animation:floatUp .7s ease both; }
    .nu-reveal-1 { animation:floatUp .7s .1s ease both; }
    .nu-reveal-2 { animation:floatUp .7s .2s ease both; }

    .shimmer-text {
      background:linear-gradient(90deg,${C.brand},${C.gold},${C.brand});
      background-size:200%;
      -webkit-background-clip:text;
      -webkit-text-fill-color:transparent;
      animation:shimmer 4s ease infinite;
    }

    .lesson-row {
      display:flex; align-items:center; gap:12px;
      padding:12px 16px; border-radius:12px; cursor:pointer;
      border:1px solid transparent;
      transition:all .2s;
      color:#f0f4ff;
    }
    .lesson-row:hover { background:rgba(112,85,255,.1); border-color:rgba(112,85,255,.3); }
    .lesson-row.active { background:rgba(112,85,255,.15); border-color:${C.brand}; }

    .star-btn { transition:transform .15s !important; }
    .star-btn:hover { transform:scale(1.2) !important; }

    .review-input {
      background:${C.surface} !important;
      border:1.5px solid ${C.border} !important;
      border-radius:12px !important;
      color:#f0f4ff !important;
      font-size:14px !important;
      transition:border-color .2s, box-shadow .2s !important;
      resize:vertical !important;
    }
    .review-input:focus {
      border-color:${C.brand} !important;
      box-shadow:0 0 0 3px ${C.brand}33 !important;
    }
    .review-input::placeholder { color:${C.muted} !important; }

    .sidebar-card {
      background:${C.card};
      border:1px solid ${C.border};
      border-radius:24px;
      padding:28px;
      position:sticky;
      top:24px;
    }

    .detail-row {
      display:flex; flex-direction:column; gap:4px;
      padding:16px; border-radius:14px;
      background:rgba(255,255,255,.02);
      border:1px solid ${C.border};
    }
  `}</style>
);

// ─── Reusable: Section Heading ────────────────────────────────────────────────
const SectionTitle = ({ children, gold }) => (
  <Heading fontFamily="'Playfair Display',serif" fontWeight="800"
    fontSize={{ base:'xl', md:'2xl' }} letterSpacing="-0.02em" color="white" mb={5}>
    {children}{' '}
    {gold && (
      <Box as="span" style={{ background:`linear-gradient(to right,${C.brand},${C.gold})`,
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        {gold}
      </Box>
    )}
  </Heading>
);

// ─── Star Rating Display ──────────────────────────────────────────────────────
const StarDisplay = ({ value = 0, total, size = 14 }) => (
  <HStack spacing={2} align="center">
    {[1,2,3,4,5].map(i => (
      <Box key={i} color={i <= Math.floor(value) ? C.gold : C.border} style={{ fontSize: size }}>★</Box>
    ))}
    <Text fontSize="sm" color="whiteAlpha.900" ml={1} fontWeight="600">
      {Number(value || 0).toFixed(1)}
    </Text>
    {typeof total !== 'undefined' && (
      <Text fontSize="xs" color={C.muted} ml={1}>
        ({total} {total === 1 ? 'rating' : 'ratings'})
      </Text>
    )}
  </HStack>
);

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <Box minH="100vh" style={{ background:C.pageBg }}>
    <GlobalStyles />
    {/* Hero skeleton */}
    <Box py={16} style={{ background:`linear-gradient(135deg,${C.surface},${C.pageBg})`,
      borderBottom:`1px solid ${C.border}` }}>
      <Container maxW="7xl">
        <Grid templateColumns={{ base:'1fr', lg:'2fr 1fr' }} gap={10}>
          <Stack spacing={5}>
            <Skeleton h="24px" w="120px" borderRadius="full" startColor={C.card} endColor={C.border} />
            <Skeleton h="48px" w="90%" borderRadius="12px" startColor={C.card} endColor={C.border} />
            <Skeleton h="24px" w="70%" borderRadius="8px" startColor={C.card} endColor={C.border} />
            <SkeletonText noOfLines={3} spacing={3} startColor={C.card} endColor={C.border} />
          </Stack>
          <Skeleton h="320px" borderRadius="24px" startColor={C.card} endColor={C.border} />
        </Grid>
      </Container>
    </Box>
  </Box>
);

// ─── Not Found ────────────────────────────────────────────────────────────────
const NotFound = ({ navigate }) => (
  <Box minH="100vh" style={{ background:C.pageBg }} display="flex" alignItems="center" justifyContent="center">
    <GlobalStyles />
    <VStack spacing={6} textAlign="center">
      <Text fontSize="64px">🔭</Text>
      <Heading fontFamily="'Playfair Display',serif" color="white" fontSize="2xl">Course Not Found</Heading>
      <Text color={C.muted}>The course you're looking for doesn't exist or has been removed.</Text>
      <Button borderRadius="full" px={8} color="white" fontWeight="600"
        style={{ background:`linear-gradient(135deg,${C.brandDk},${C.brand})` }}
        leftIcon={<ChevronLeftIcon />}
        _hover={{ transform:'translateY(-2px)', boxShadow:`0 8px 25px rgba(112,85,255,.5)` }}
        onClick={() => navigate('/courses')}>
        Browse Courses
      </Button>
    </VStack>
  </Box>
);

const CourseAdBanner = ({ images = FREE_COURSE_BANNER_IMAGES }) => {
  const slides = (Array.isArray(images) ? images : []).slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={3}>
        <Heading size="md" color="white">Ads</Heading>
        <Badge px={3} py={1} borderRadius="full" style={{ background:'rgba(112,85,255,.2)', color:C.brand }}>
          5 Ads
        </Badge>
      </Flex>

      <Box
        position="relative"
        h={{ base: '250px', md: '280px', lg: '300px' }}
        w="100%"
        borderRadius="20px"
        overflow="hidden"
        style={{ border:`1px solid ${C.border}`, boxShadow:'0 20px 60px rgba(0,0,0,.35)' }}
      >
        {slides.map((src, index) => (
          <Box
            key={`${src}-${index}`}
            as="img"
            src={src}
            alt={`Course ad ${index + 1}`}
            loading={index === 0 ? 'eager' : 'lazy'}
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            objectFit="cover"
            opacity={index === activeIndex ? 1 : 0}
            transition="opacity 700ms ease-in-out"
            pointerEvents="none"
          />
        ))}
        <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(7,11,26,0.45), rgba(7,11,26,0.08))" pointerEvents="none" />
      </Box>
    </Box>
  );
};

// ─── Video Player ─────────────────────────────────────────────────────────────
const VideoPlayer = ({ url, durationSeconds = 0, onWatchProgress, onCompleted }) => {
  const videoRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const lastSentRef = useRef(0);
  const completionSentRef = useRef(false);
  const onWatchProgressRef = useRef(onWatchProgress);
  const onCompletedRef = useRef(onCompleted);
  const playerIdRef = useRef(`yt-part-${Math.random().toString(36).slice(2)}`);
  const [mediaError, setMediaError] = useState('');
  const isYT = /(youtube\.com|youtu\.be)/i.test(url);
  const isDrive = /drive\.google\.com/i.test(url);
  const isVimeo = /vimeo\.com/i.test(url);
  const useIframe = isYT || isDrive || isVimeo;
  const useYouTubePlayer = isYT;
  const useGenericIframe = useIframe && !isYT;
  const embedSrc = (() => {
    if (isYT) {
      try {
        const u = new URL(url);
        let id = u.hostname.includes('youtu.be') ? u.pathname.slice(1) : u.searchParams.get('v') || '';
        const origin = encodeURIComponent(window.location.origin);
        return id ? `https://www.youtube.com/embed/${id}?autoplay=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${origin}` : url;
      } catch { return url; }
    }

    if (isDrive) {
      try {
        const u = new URL(url);
        const pathMatch = u.pathname.match(/\/file\/d\/([^/]+)/i);
        const queryId = u.searchParams.get('id');
        const id = pathMatch?.[1] || queryId || '';
        return id ? `https://drive.google.com/file/d/${id}/preview` : url;
      } catch { return url; }
    }

    if (isVimeo) {
      try {
        const u = new URL(url);
        const id = u.pathname.split('/').filter(Boolean).pop() || '';
        return /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : url;
      } catch { return url; }
    }

    return url;
  })();

  useEffect(() => {
    onWatchProgressRef.current = onWatchProgress;
  }, [onWatchProgress]);

  useEffect(() => {
    onCompletedRef.current = onCompleted;
  }, [onCompleted]);

  const emitWatch = useCallback((seconds) => {
    if (typeof onWatchProgressRef.current === 'function') {
      onWatchProgressRef.current(Math.max(0, Math.floor(seconds || 0)));
    }
  }, []);

  const emitCompleted = useCallback(() => {
    if (typeof onCompletedRef.current === 'function') {
      onCompletedRef.current();
    }
  }, []);

  useEffect(() => {
    lastSentRef.current = 0;
    completionSentRef.current = false;
    setMediaError('');
  }, [url]);

  useEffect(() => {
    if (useIframe) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const onTimeUpdate = () => {
      const sec = Math.floor(videoEl.currentTime || 0);
      if (sec - lastSentRef.current >= 10) {
        lastSentRef.current = sec;
        emitWatch(sec);
      }

      const dur = durationSeconds > 0 ? durationSeconds : Math.floor(videoEl.duration || 0);
      if (dur > 0 && sec >= Math.ceil(dur * 0.9) && !completionSentRef.current) {
        completionSentRef.current = true;
        emitCompleted();
      }
    };

    const onEnded = () => {
      const sec = Math.floor(videoEl.duration || durationSeconds || 0);
      emitWatch(sec);
      if (!completionSentRef.current) {
        completionSentRef.current = true;
        emitCompleted();
      }
    };

    videoEl.addEventListener('timeupdate', onTimeUpdate);
    videoEl.addEventListener('ended', onEnded);

    return () => {
      videoEl.removeEventListener('timeupdate', onTimeUpdate);
      videoEl.removeEventListener('ended', onEnded);
    };
  }, [useIframe, durationSeconds, emitWatch, emitCompleted]);

  useEffect(() => {
    if (!isYT) return;

    let intervalId;
    let disposed = false;

    const ensureYouTubeApi = () => new Promise((resolve) => {
      if (window.YT && window.YT.Player) return resolve(window.YT);
      const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existing) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') prev();
        resolve(window.YT);
      };
    });

    (async () => {
      try {
        const YT = await ensureYouTubeApi();
        if (disposed) return;

        let videoId = '';
        try {
          const parsed = new URL(url);
          videoId = parsed.hostname.includes('youtu.be') ? parsed.pathname.slice(1) : (parsed.searchParams.get('v') || '');
        } catch {
          videoId = '';
        }

        if (!videoId) return;

        ytPlayerRef.current = new YT.Player(playerIdRef.current, {
          videoId,
          events: {
            onError: () => {
              setMediaError('Failed to load YouTube video in embedded player.');
            },
            onStateChange: (event) => {
              const state = event.data;
              if (state === 1) {
                if (!intervalId) {
                  intervalId = setInterval(() => {
                    try {
                      const sec = Math.floor(ytPlayerRef.current?.getCurrentTime?.() || 0);
                      if (sec - lastSentRef.current >= 10) {
                        lastSentRef.current = sec;
                        emitWatch(sec);
                      }
                      const dur = durationSeconds > 0 ? durationSeconds : Math.floor(ytPlayerRef.current?.getDuration?.() || 0);
                      if (dur > 0 && sec >= Math.ceil(dur * 0.9) && !completionSentRef.current) {
                        completionSentRef.current = true;
                        emitCompleted();
                      }
                    } catch {}
                  }, 8000);
                }
              } else {
                if (intervalId) {
                  clearInterval(intervalId);
                  intervalId = null;
                }
              }

              if (state === 0 && !completionSentRef.current) {
                completionSentRef.current = true;
                emitCompleted();
              }
            }
          }
        });
      } catch {}
    })();

    return () => {
      disposed = true;
      if (intervalId) clearInterval(intervalId);
      try {
        if (ytPlayerRef.current?.destroy) ytPlayerRef.current.destroy();
      } catch {}
    };
  }, [isYT, url, durationSeconds, emitWatch, emitCompleted]);

  return (
    <Box borderRadius="20px" overflow="hidden"
      style={{ border:`1px solid ${C.border}`, boxShadow:'0 20px 60px rgba(0,0,0,.5)' }}>
      <AspectRatio ratio={16/9}>
        {useYouTubePlayer ? (
          <Box id={playerIdRef.current} style={{ background:'#000' }} />
        ) : useGenericIframe ? (
          <Box as="iframe" title="Course video" src={embedSrc}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onError={() => setMediaError('Failed to load embedded video source.')}
            allowFullScreen />
        ) : (
          <Box as="video" ref={videoRef} src={url} controls
            onError={() => setMediaError('Failed to load video file. Check lesson video URL.')}
            style={{ background:'#000' }} />
        )}
      </AspectRatio>
      {mediaError && (
        <Box px={4} py={3} style={{ borderTop:`1px solid ${C.border}`, background:'rgba(248,113,113,.08)' }}>
          <Text fontSize="sm" color={C.red}>{mediaError}</Text>
        </Box>
      )}
      {(useGenericIframe || useYouTubePlayer) && (
        <Box px={4} py={3} style={{ borderTop:`1px solid ${C.border}`, background:'rgba(56,189,248,.08)' }}>
          <Text fontSize="sm" color={C.muted}>
            If the embedded player stays blank, open this video source directly:{' '}
            <a href={embedSrc} target="_blank" rel="noreferrer" style={{ color: C.blue, textDecoration: 'underline' }}>
              Open video
            </a>
          </Text>
        </Box>
      )}
    </Box>
  );
};

// ─── Locked Preview ───────────────────────────────────────────────────────────
const LockedPreview = ({ onEnroll, disabled, thumbnailUrl }) => (
  <Box borderRadius="20px" overflow="hidden" position="relative"
    style={{ border:`1px solid ${C.border}` }}>
    {thumbnailUrl ? (
      <Box position="relative">
        <Box as="img" src={thumbnailUrl} alt="Course preview"
          style={{ width:'100%', height:340, objectFit:'cover', display:'block', filter:'blur(2px) brightness(.4)' }} />
        <Box position="absolute" inset={0} display="flex" flexDir="column"
          alignItems="center" justifyContent="center" gap={4}
          style={{ background:'rgba(7,11,26,.6)', backdropFilter:'blur(4px)' }}>
          <Box w="64px" h="64px" borderRadius="full" display="flex" alignItems="center" justifyContent="center"
            style={{ background:'rgba(112,85,255,.2)', border:`2px solid ${C.brand}` }}>
            <Icon as={LockIcon} color={C.brand} boxSize={6} />
          </Box>
          <Text color="white" fontWeight="600" fontSize="lg">Enroll to Access Content</Text>
          <Text color={C.muted} fontSize="sm">Get full access to all lessons and materials</Text>
          <Button borderRadius="full" px={8} color="white" fontWeight="600"
            style={{ background:`linear-gradient(135deg,${C.brandDk},${C.brand})` }}
            _hover={{ transform:'translateY(-2px)', boxShadow:`0 8px 25px rgba(112,85,255,.5)` }}
            isDisabled={disabled} onClick={onEnroll}>
            Enroll Now
          </Button>
        </Box>
      </Box>
    ) : (
      <Box py={16} display="flex" flexDir="column" alignItems="center" justifyContent="center" gap={4}
        style={{ background:C.card }}>
        <Box w="64px" h="64px" borderRadius="full" display="flex" alignItems="center" justifyContent="center"
          style={{ background:'rgba(112,85,255,.15)', border:`1px solid ${C.brand}44` }}>
          <Icon as={LockIcon} color={C.brand} boxSize={6} />
        </Box>
        <Text color="white" fontWeight="600">Preview available after enrollment</Text>
        <Button borderRadius="full" px={8} color="white" fontWeight="600" size="sm"
          style={{ background:`linear-gradient(135deg,${C.brandDk},${C.brand})` }}
          isDisabled={disabled} onClick={onEnroll}>
          Enroll to Access Content
        </Button>
      </Box>
    )}
  </Box>
);

// ─── Lesson List ──────────────────────────────────────────────────────────────
const LessonList = ({ parts, selectedIndex, onSelect, navigate }) => (
  <Box borderRadius="20px" overflow="hidden"
    style={{ background:C.card, border:`1px solid ${C.border}` }}>
    {/* Header */}
    <Box px={5} py={4} style={{ borderBottom:`1px solid ${C.border}`,
      background:`linear-gradient(135deg,rgba(112,85,255,.12),rgba(251,191,36,.06))` }}>
      <HStack justify="space-between">
        <Text fontWeight="700" color="white" fontSize="sm">Course Lessons</Text>
        <Badge px={2.5} py={0.5} borderRadius="full" fontSize="10px" fontWeight="700"
          style={{ background:'rgba(112,85,255,.2)', color:C.brand }}>
          {parts.length} lessons
        </Badge>
      </HStack>
    </Box>
    {/* Lessons */}
    <VStack spacing={1} p={3} align="stretch">
      {parts.map((p, i) => (
        <Box key={p.id || p.videoUrl || i}
          className={`lesson-row${selectedIndex === i ? ' active' : ''}`}
          onClick={() => onSelect ? onSelect(i) : navigate(`/lesson/${p.id}`)}>
          {/* Number */}
          <Box w="28px" h="28px" borderRadius="full" flexShrink={0} display="flex"
            alignItems="center" justifyContent="center" fontSize="11px" fontWeight="700"
            style={{ background: selectedIndex === i ? `rgba(112,85,255,.3)` : `rgba(255,255,255,.05)`,
              color: selectedIndex === i ? C.brand : C.muted,
              border:`1px solid ${selectedIndex === i ? C.brand+'55' : C.border}` }}>
            {i + 1}
          </Box>
          {/* Play icon */}
          <Icon as={FiPlay} color={selectedIndex === i ? C.brand : C.muted} flexShrink={0} />
          {/* Title */}
          <Text fontSize="sm" fontWeight={selectedIndex === i ? '600' : '400'}
            color={selectedIndex === i ? 'white' : C.muted} flex={1} noOfLines={1}>
            {p.order ? `${p.order}. ` : ''}{p.title}
          </Text>
          {selectedIndex === i && (
            <Box w="6px" h="6px" borderRadius="full" flexShrink={0}
              style={{ background:C.brand, animation:'pulse 2s ease-in-out infinite' }} />
          )}
        </Box>
      ))}
    </VStack>
  </Box>
);

// ─── Main CourseDetail ────────────────────────────────────────────────────────
const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate    = useNavigate();
  const toast       = useToast();

  // ── State (all original) ──
  const [course,             setCourse]             = useState(null);
  const [loading,            setLoading]            = useState(true);
  const [rating,             setRating]             = useState(0);
  const [review,             setReview]             = useState('');
  const [submitting,         setSubmitting]         = useState(false);
  const [selectedPartIndex,  setSelectedPartIndex]  = useState(0);
  const [partProgressMap,    setPartProgressMap]    = useState({});

  // ── Data loading (original logic) ──
  useEffect(() => {
    const load = async () => {
      try {
        const data = await courseService.getCourseById(courseId);
        setCourse(data || null);
      } catch (err) {
        console.error('Failed to load course', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  useEffect(() => {
    const parts = (course?.videoParts || course?.VideoParts) || [];
    const map = {};

    parts.forEach((part) => {
      const partId = part?.id ?? part?.Id;
      if (!partId) return;

      map[partId] = {
        progressPercentage: Number(part?.progressPercentage ?? part?.ProgressPercentage ?? 0),
        isCompleted: Boolean(part?.isCompleted ?? part?.IsCompleted ?? false),
        timeSpentMinutes: Number(part?.timeSpentMinutes ?? part?.TimeSpentMinutes ?? 0),
        completedAt: part?.completedAt ?? part?.CompletedAt ?? null,
      };
    });

    setPartProgressMap(map);
  }, [course]);

  useEffect(() => {
    const isEnrolledNow = (course?.isEnrolled ?? course?.IsEnrolled) ?? false;
    if (!isEnrolledNow) return;

    let cancelled = false;
    const loadPartProgress = async () => {
      try {
        const res = await api.get(`/course/${courseId}/parts-progress`);
        const parts = res?.data?.parts || [];
        if (cancelled) return;

        if (parts.length > 0) {
          const map = {};
          parts.forEach((part) => {
            map[part.coursePartId] = {
              progressPercentage: Number(part.progressPercentage ?? 0),
              isCompleted: Boolean(part.isCompleted),
              timeSpentMinutes: Number(part.timeSpentMinutes ?? 0),
              completedAt: part.completedAt ?? null,
            };
          });
          setPartProgressMap((prev) => ({ ...prev, ...map }));
        }

        if (typeof res?.data?.courseProgress !== 'undefined') {
          const progress = Number(res.data.courseProgress || 0);
          setCourse((prev) => prev ? ({ ...prev, progressPercentage: progress, ProgressPercentage: progress }) : prev);
        }
      } catch {}
    };

    loadPartProgress();
    return () => { cancelled = true; };
  }, [courseId, course?.isEnrolled, course?.IsEnrolled]);

  useEffect(() => {
    const partList = (course?.videoParts || course?.VideoParts) || [];
    const count = partList.filter((part) => pickPartVideoUrl(part).length > 0).length;

    if (count === 0) {
      if (selectedPartIndex !== 0) setSelectedPartIndex(0);
      return;
    }

    if (selectedPartIndex >= count) {
      setSelectedPartIndex(0);
    }
  }, [course, selectedPartIndex]);

  const updateCoursePartProgress = useCallback(async (part, watchedSeconds, forceComplete = false) => {
    const partId = part?.id ?? part?.Id;
    if (!partId) return;
    const isEnrolledNow = (course?.isEnrolled ?? course?.IsEnrolled) ?? false;
    if (!isEnrolledNow) return;

    try {
      const response = forceComplete
        ? await api.post(`/course-part/${partId}/complete`)
        : await api.post(`/course-part/${partId}/watch`, { watchedSeconds: Math.max(0, Math.floor(watchedSeconds || 0)) });

      const data = response?.data || {};
      setPartProgressMap((prev) => ({
        ...prev,
        [partId]: {
          progressPercentage: Number(data.progressPercentage ?? (forceComplete ? 100 : (prev[partId]?.progressPercentage ?? 0))),
          isCompleted: Boolean(data.isCompleted ?? (forceComplete || prev[partId]?.isCompleted)),
          timeSpentMinutes: Number(data.timeSpentMinutes ?? prev[partId]?.timeSpentMinutes ?? 0),
          completedAt: data.completedAt ?? prev[partId]?.completedAt ?? null,
        }
      }));

      if (typeof data.courseProgress !== 'undefined') {
        const nextProgress = Number(data.courseProgress || 0);
        setCourse((prev) => prev ? ({ ...prev, progressPercentage: nextProgress, ProgressPercentage: nextProgress }) : prev);
      }
    } catch {}
  }, [course]);

  // ── handleBuy (original logic) ──
  const handleBuy = async () => {
    const price = course?.price ?? 0;
    if (price > 0) { navigate(`/payment?courseId=${courseId}`); return; }
    try {
      const res = await api.post(`/courses/${courseId}/enroll`);
      if (res?.data?.success) {
        toast({ title:'Successfully Enrolled!', description:res.data.message || 'You are now enrolled.',
          status:'success', duration:3000, position:'top-right', isClosable:true });
        const refreshed = await courseService.getCourseById(courseId);
        setCourse(refreshed || course);
      } else {
        toast({ title:'Enrollment Failed', description:res?.data?.message || 'Could not enroll.',
          status:'error', duration:4000 });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Enrollment request failed';
      toast({ title:'Enrollment Error', description:msg, status:'error', duration:4000 });
    }
  };

  // ── submitRating (original logic) ──
  const submitRating = async () => {
    if (!rating) { toast({ title:'Please select a rating', status:'warning', duration:2000 }); return; }
    setSubmitting(true);
    try {
      await api.post(`/courses/${courseId}/ratings`, { rating, review });
      const refreshed = await courseService.getCourseById(courseId);
      setCourse(refreshed || course);
      setReview(''); setRating(0);
      toast({ title:'Rating Submitted!', description:'Thank you for your feedback.',
        status:'success', duration:3000 });
    } catch (err) {
      toast({ title:'Submission Failed', description:'Could not submit your rating.',
        status:'error', duration:3000 });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──
  if (loading) return <LoadingSkeleton />;
  if (!course)  return <NotFound navigate={navigate} />;

  // ── Computed values (all original) ──
  const price        = course.price ?? 0;
  const isEnrolled   = (course.isEnrolled ?? course.IsEnrolled) ?? false;
  const previewUrl   = normalizeMediaUrl(course.previewVideoUrl ?? course.PreviewVideoUrl ?? course.youtubeUrl ?? course.YouTubeUrl ?? '');
  const parts        = (course.videoParts || course.VideoParts) || [];
  const validParts   = parts.filter(p => {
    const url = pickPartVideoUrl(p);
    return url.length > 0;
  });
  const avgRating = (
    course.averageRating ?? course.AverageRating ?? course.stats?.averageRating ?? course.Stats?.AverageRating ?? course.AverageRating
  ) || 0;
  const totalRatings = (
    course.totalReviews ?? course.TotalReviews ?? course.totalReviewsCount ?? course.totalRatings ?? course.TotalReviews
  ) || 0;
  const isFree       = price === 0;

  // Current lesson url (for enrolled with parts)
  const currentPart    = validParts[selectedPartIndex];
  const currentVideoUrl = currentPart ? pickPartVideoUrl(currentPart) : '';
  const currentPartId = currentPart?.id ?? currentPart?.Id;
  const currentPartProgress = Number(
    (currentPartId ? partProgressMap[currentPartId]?.progressPercentage : undefined)
    ?? currentPart?.progressPercentage
    ?? currentPart?.ProgressPercentage
    ?? 0
  );
  const currentPartCompleted = Boolean(
    (currentPartId ? partProgressMap[currentPartId]?.isCompleted : undefined)
    ?? currentPart?.isCompleted
    ?? currentPart?.IsCompleted
    ?? false
  );

  // Status color
  const statusColor = course.status === 'Published' ? C.green : C.muted;

  return (
    <Box minH="100vh" style={{ background:C.pageBg }} position="relative">
      <GlobalStyles />

      {/* ── Hero Banner ── */}
      <Box position="relative" overflow="hidden"
        style={{ background:`linear-gradient(135deg, ${C.surface} 0%, ${C.pageBg} 100%)`,
          borderBottom:`1px solid ${C.border}` }}>
        {/* Ambient glow */}
        <Box position="absolute" top="-100px" right="-100px" w="500px" h="500px" borderRadius="full"
          style={{ background:'radial-gradient(circle,rgba(112,85,255,.1),transparent 70%)', pointerEvents:'none' }} />

        <Container maxW="7xl" py={{ base:10, md:16 }}>
          {/* Back btn */}
          <Button variant="ghost" size="sm" color={C.muted} mb={6} borderRadius="full" px={4}
            leftIcon={<ChevronLeftIcon />} _hover={{ color:'white', bg:'rgba(255,255,255,.06)' }}
            onClick={() => navigate('/courses')}>
            Back to Courses
          </Button>

          <Grid templateColumns={{ base:'1fr', lg:'1.6fr 1fr' }} gap={{ base:8, lg:14 }} alignItems="start">
            {/* Left — Course info */}
            <GridItem className="nu-reveal" style={{ opacity:0 }}>
              <Stack spacing={5}>
                {/* Status + Category */}
                <HStack spacing={3} flexWrap="wrap">
                  <Box px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="700"
                    style={{ background:`${statusColor}18`, color:statusColor, border:`1px solid ${statusColor}33` }}>
                    {course.status}
                  </Box>
                  {course.difficultyLevel && (
                    <Box px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="700"
                      style={{ background:'rgba(112,85,255,.15)', color:C.brand, border:`1px solid rgba(112,85,255,.3)` }}>
                      {course.difficultyLevel}
                    </Box>
                  )}
                  {course.departmentName && (
                    <Box px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="600"
                      style={{ background:'rgba(136,150,187,.1)', color:C.muted, border:`1px solid ${C.border}` }}>
                      {course.departmentName}
                    </Box>
                  )}
                </HStack>

                {/* Title */}
                <Heading fontFamily="'Playfair Display',serif" fontWeight="900"
                  fontSize={{ base:'2xl', md:'3xl', lg:'4xl' }} lineHeight="1.15"
                  letterSpacing="-0.02em" color="white">
                  {course.title}
                </Heading>

                {/* Short description */}
                {course.shortDescription && (
                  <Text fontSize={{ base:'md', md:'lg' }} color={C.muted} lineHeight="1.8">
                    {course.shortDescription}
                  </Text>
                )}

                {/* Meta row */}
                <HStack spacing={6} flexWrap="wrap">
                  <HStack spacing={2}>
                    <Icon as={FiUsers} color={C.brand} boxSize={4} />
                    <Text fontSize="sm" color={C.muted}>
                      <Box as="span" color="white" fontWeight="600">
                        {(course.enrollmentCount || 0).toLocaleString()}
                      </Box> students
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <StarDisplay value={avgRating} total={totalRatings} />
                  </HStack>
                  {course.teacherName && (
                    <HStack spacing={2}>
                      <Icon as={FiBookOpen} color={C.gold} boxSize={4} />
                      <Text fontSize="sm" color={C.muted}>
                        <Box as="span" color="white" fontWeight="600">{course.teacherName}</Box>
                      </Text>
                    </HStack>
                  )}
                </HStack>

                {/* University */}
                {course.universityName && (
                  <HStack spacing={3} px={4} py={3} borderRadius="14px"
                    style={{ background:'rgba(251,191,36,.07)', border:`1px solid rgba(251,191,36,.2)` }}>
                    <Text fontSize="20px">🏛️</Text>
                    <VStack spacing={0} align="flex-start">
                      <Text fontSize="10px" color={C.gold} fontWeight="700" letterSpacing=".08em"
                        textTransform="uppercase">Partner University</Text>
                      <Text fontSize="sm" color="white" fontWeight="600">{course.universityName}</Text>
                    </VStack>
                  </HStack>
                )}
              </Stack>
            </GridItem>

            {/* Right — Sidebar (desktop: shown inline in hero; lg: sticky sidebar) */}
            <GridItem display={{ base:'none', lg:'block' }}>
              <SidebarCard
                course={course} price={price} isFree={isFree}
                isEnrolled={isEnrolled} avgRating={avgRating}
                totalRatings={totalRatings} onBuy={handleBuy}
              />
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* ── Mobile Sidebar ── */}
      <Box display={{ base:'block', lg:'none' }} px={4} pt={6}>
        <SidebarCard
          course={course} price={price} isFree={isFree}
          isEnrolled={isEnrolled} avgRating={avgRating}
          totalRatings={totalRatings} onBuy={handleBuy}
        />
      </Box>

      {/* ── Main Body ── */}
      <Container maxW="7xl" py={10}>
        <Box mb={8} className="nu-reveal" style={{ opacity:0 }}>
          <CourseAdBanner />
        </Box>

        <Grid templateColumns={{ base:'1fr', lg:'1.6fr 1fr' }} gap={{ base:8, lg:14 }} alignItems="start">

          {/* ── Left Column ── */}
          <GridItem>
            <Stack spacing={10}>

              {/* ── Video / Preview Section ── */}
              <Box className="nu-reveal-1" style={{ opacity:0 }}>
                <SectionTitle>
                  {isEnrolled && validParts.length > 0 ? 'Now Playing' : 'Course Preview'}
                </SectionTitle>

                {isEnrolled && validParts.length > 0 ? (
                  <Stack spacing={5}>
                    {/* Active lesson info */}
                    <HStack px={4} py={3} borderRadius="14px"
                      style={{ background:'rgba(112,85,255,.1)', border:`1px solid rgba(112,85,255,.3)` }}>
                      <Box w="8px" h="8px" borderRadius="full"
                        style={{ background:C.brand, animation:'pulse 2s ease-in-out infinite' }} />
                      <Text fontSize="sm" color="white" fontWeight="600">
                        Lesson {selectedPartIndex + 1}: {currentPart?.title}
                      </Text>
                      <Text fontSize="xs" color={currentPartCompleted ? C.green : C.muted} fontWeight="700" ml="auto">
                        {currentPartCompleted ? 'Completed' : `${Math.round(currentPartProgress)}%`}
                      </Text>
                    </HStack>
                    {/* Player */}
                    {currentVideoUrl
                      ? <VideoPlayer
                          url={currentVideoUrl}
                          durationSeconds={Number(currentPart?.durationSeconds ?? currentPart?.DurationSeconds ?? 0)}
                          onWatchProgress={(seconds) => updateCoursePartProgress(currentPart, seconds, false)}
                          onCompleted={() => updateCoursePartProgress(currentPart, Number(currentPart?.durationSeconds ?? currentPart?.DurationSeconds ?? 0), true)}
                        />
                      : <Box py={12} textAlign="center" borderRadius="20px"
                          style={{ background:C.card, border:`1px solid ${C.border}` }}>
                          <Text color={C.muted}>No video available for this lesson.</Text>
                        </Box>
                    }
                    {/* Lesson list */}
                    <LessonList parts={validParts} selectedIndex={selectedPartIndex}
                      onSelect={setSelectedPartIndex} navigate={navigate} />
                  </Stack>
                ) : isEnrolled && previewUrl ? (
                  <VideoPlayer url={previewUrl} />
                ) : (
                  <LockedPreview
                    onEnroll={handleBuy}
                    disabled={course.status !== 'Published'}
                    thumbnailUrl={course.thumbnailUrl}
                  />
                )}
              </Box>

              {/* ── About This Course ── */}
              <Box className="nu-reveal-2" style={{ opacity:0 }}>
                <SectionTitle>About This <Box as="span" className="shimmer-text">Course</Box></SectionTitle>
                <Box borderRadius="20px" p={6}
                  style={{ background:C.card, border:`1px solid ${C.border}` }}>
                  <Box
                    className="course-desc"
                    style={{ color:C.muted, lineHeight:1.85, fontSize:15 }}
                    dangerouslySetInnerHTML={{ __html: course.fullDescription || '<p>No description available.</p>' }}
                  />
                  <style>{`
                    .course-desc h1,.course-desc h2,.course-desc h3 { color:white; font-family:'Playfair Display',serif; margin:16px 0 8px; }
                    .course-desc p { margin-bottom:12px; }
                    .course-desc ul,.course-desc ol { padding-left:20px; margin-bottom:12px; }
                    .course-desc li { margin-bottom:6px; }
                    .course-desc a { color:${C.brand}; text-decoration:underline; }
                    .course-desc strong { color:white; font-weight:600; }
                  `}</style>
                </Box>
              </Box>

              {/* ── Course Details ── */}
              <Box>
                <SectionTitle>Course <Box as="span" className="shimmer-text">Details</Box></SectionTitle>
                <SimpleGrid columns={{ base:1, sm:2 }} spacing={4}>
                  {[
                    { label:'University',  value:course.universityName  || 'Not specified', icon:'🏛️' },
                    { label:'Department',  value:course.departmentName  || 'Not specified', icon:'📐' },
                    { label:'Instructor',  value:course.teacherName     || 'Not specified', icon:'👨‍🏫' },
                    { label:'Duration',    value:course.duration        || 'Self-paced',    icon:'⏱️' },
                  ].map((d, i) => (
                    <Box key={i} className="detail-row">
                      <Text fontSize="10px" color={C.muted} fontWeight="700" letterSpacing=".08em"
                        textTransform="uppercase">
                        {d.icon} {d.label}
                      </Text>
                      <Text fontSize="md" color="white" fontWeight="600">{d.value}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>

              {/* ── What You'll Learn ── */}
              <Box>
                <SectionTitle>What You'll <Box as="span" className="shimmer-text">Learn</Box></SectionTitle>
                <Box borderRadius="20px" overflow="hidden"
                  style={{ background:C.card, border:`1px solid ${C.border}` }}>
                  <Box px={5} py={4}
                    style={{ borderBottom:`1px solid ${C.border}`,
                      background:`linear-gradient(135deg,rgba(74,222,128,.08),rgba(112,85,255,.06))` }}>
                    <Text fontSize="sm" color={C.green} fontWeight="700">{validParts.length} Lessons Included</Text>
                  </Box>
                  {validParts.length > 0 ? (
                    <VStack spacing={0} align="stretch" p={3}>
                      {validParts.map((p, i) => (
                        <HStack key={i} spacing={3} px={4} py={3.5} borderRadius="10px"
                          style={{ borderBottom: i < validParts.length-1 ? `1px solid ${C.border}55` : 'none' }}>
                          <Icon as={FiCheckCircle} color={C.green} flexShrink={0} />
                          <Text fontSize="sm" color={C.muted}>
                            {p.order ? `${p.order}. ` : ''}{p.title}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  ) : (
                    <Box px={5} py={8} textAlign="center">
                      <Text fontSize="sm" color={C.muted}>Lesson details will be available after enrollment.</Text>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* ── Rate This Course ── */}
              <Box>
                <SectionTitle>Rate This <Box as="span" className="shimmer-text">Course</Box></SectionTitle>
                <Box borderRadius="20px" p={7}
                  style={{ background:C.card, border:`1px solid ${C.border}` }}
                  position="relative" overflow="hidden">
                  <Box position="absolute" top={0} left={0} right={0} h="2px"
                    style={{ background:`linear-gradient(to right,transparent,${C.gold}66,transparent)` }} />

                  <Stack spacing={6}>
                    {/* Stars */}
                    <Box>
                      <Text fontSize="sm" fontWeight="600" color="white" mb={3}>
                        How would you rate this course?
                      </Text>
                      <HStack spacing={2}>
                        {[1,2,3,4,5].map(i => (
                          <Box key={i} className="star-btn" cursor="pointer" fontSize="36px"
                            color={i <= rating ? C.gold : C.border}
                            onClick={() => setRating(i)}
                            style={{ transition:'all .15s', filter: i <= rating ? 'drop-shadow(0 0 8px rgba(251,191,36,.5))' : 'none' }}>
                            ★
                          </Box>
                        ))}
                      </HStack>
                      <Text fontSize="xs" color={C.muted} mt={2}>
                        {rating === 0 ? 'Click a star to rate' : `You selected ${rating} star${rating > 1 ? 's' : ''}`}
                      </Text>
                    </Box>

                    {/* Review textarea */}
                    <Box>
                      <Text fontSize="sm" fontWeight="600" color="white" mb={2}>
                        Your Review <Box as="span" color={C.muted}>(Optional)</Box>
                      </Text>
                      <textarea
                        className="review-input"
                        placeholder="Share your experience with this course…"
                        value={review}
                        onChange={e => setReview(e.target.value)}
                        rows={4}
                        style={{ width:'100%', padding:'12px 16px', outline:'none', fontFamily:'inherit' }}
                      />
                    </Box>

                    {/* Submit */}
                    <Button borderRadius="full" size="lg" px={10} fontWeight="700" color="white"
                      style={{ background:`linear-gradient(135deg,${C.brandDk},${C.brand})`,
                        opacity: !rating ? .5 : 1 }}
                      _hover={{ transform: rating ? 'translateY(-2px)' : 'none',
                        boxShadow: rating ? `0 8px 25px rgba(112,85,255,.5)` : 'none' }}
                      transition="all .25s"
                      isDisabled={!rating}
                      isLoading={submitting}
                      loadingText="Submitting…"
                      onClick={submitRating}>
                      Submit Rating
                    </Button>
                  </Stack>
                </Box>
              </Box>

            </Stack>
          </GridItem>

          {/* ── Right Column (desktop sticky sidebar placeholder) ── */}
          <GridItem display={{ base:'none', lg:'block' }}>
            {/* Sticky sidebar is rendered in hero above for desktop; 
                this space holds lesson list for enrolled users */}
            {isEnrolled && validParts.length > 0 && (
              <Box position="sticky" top="24px">
                <LessonList parts={validParts} selectedIndex={selectedPartIndex}
                  onSelect={setSelectedPartIndex} navigate={navigate} />
              </Box>
            )}
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

// ─── Sidebar Card (extracted for reuse in hero + mobile) ─────────────────────
const SidebarCard = ({ course, price, isFree, isEnrolled, avgRating, totalRatings, onBuy }) => {
  const enrolled = isEnrolled;
  return (
    <Box className="sidebar-card" style={{ boxShadow:'0 30px 80px rgba(0,0,0,.5)' }}>
      {/* Top shimmer */}
      <Box position="absolute" top={0} left={0} right={0} h="2px" borderRadius="24px 24px 0 0"
        style={{ background:`linear-gradient(to right,transparent,${isFree ? C.green : C.brand},transparent)` }} />

      <Stack spacing={5}>
        {/* Thumbnail */}
        {course.thumbnailUrl && (
          <Box borderRadius="16px" overflow="hidden">
            <Box as="img" src={course.thumbnailUrl} alt={course.title}
              style={{ width:'100%', height:180, objectFit:'cover', display:'block' }} />
          </Box>
        )}

        {/* Price */}
        <Box textAlign="center">
          <Text fontSize="10px" color={C.muted} fontWeight="700" letterSpacing=".1em"
            textTransform="uppercase" mb={1}>Course Price</Text>
          <Box fontSize="42px" fontWeight="900" letterSpacing="-0.03em"
            fontFamily="'Playfair Display',serif"
            style={{ background: isFree
              ? `linear-gradient(to right,${C.green},#86efac)`
              : `linear-gradient(to right,${C.gold},${C.goldLight || '#fcd34d'})`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            {isFree ? 'Free' : `৳${price}`}
          </Box>
          {!isFree && (
            <Text fontSize="xs" color={C.muted} mt={1}>One-time payment · Lifetime access</Text>
          )}
        </Box>

        {/* Rating */}
        <Box textAlign="center">
          <StarDisplay value={avgRating} total={totalRatings} size={16} />
        </Box>

        <Box h="1px" style={{ background:C.border }} />

        {/* CTA Button */}
        {course.status === 'Published' ? (
          <Stack spacing={2}>
            <Button size="lg" w="100%" borderRadius="full" fontWeight="700" py={7}
              color="white"
              style={{
                background: enrolled
                  ? `linear-gradient(135deg,rgba(74,222,128,.2),rgba(74,222,128,.1))`
                  : isFree
                  ? `linear-gradient(135deg,${C.green}cc,${C.green}88)`
                  : `linear-gradient(135deg,${C.brandDk},${C.brand})`,
                border: enrolled ? `1px solid ${C.green}44` : 'none',
              }}
              leftIcon={enrolled ? <Icon as={FiCheckCircle} color={C.green} /> : undefined}
              _hover={{ transform: enrolled ? 'none' : 'translateY(-3px)',
                boxShadow: enrolled ? 'none' : isFree
                  ? `0 10px 30px rgba(74,222,128,.3)`
                  : `0 10px 30px rgba(112,85,255,.5)` }}
              transition="all .3s"
              onClick={enrolled ? undefined : onBuy}
              isDisabled={enrolled}
              cursor={enrolled ? 'default' : 'pointer'}>
              {enrolled ? 'Already Enrolled ✓' : isFree ? 'Enroll for Free' : `Enroll for ৳${price}`}
            </Button>
            {!isFree && !enrolled && (
              <Text fontSize="xs" color={C.muted} textAlign="center">
                30-day money-back guarantee
              </Text>
            )}
          </Stack>
        ) : (
          <Button size="lg" w="100%" borderRadius="full" isDisabled color={C.muted}
            style={{ background:'rgba(255,255,255,.05)', border:`1px solid ${C.border}` }}>
            {course.status}
          </Button>
        )}

        <Box h="1px" style={{ background:C.border }} />

        {/* Includes */}
        <Stack spacing={3}>
          <Text fontSize="xs" fontWeight="700" color="white" letterSpacing=".05em"
            textTransform="uppercase">This course includes:</Text>
          {[
            { icon:FiClock,      color:C.green,  label:'Lifetime access'           },
            { icon:FiAward,      color:C.gold,   label:'Certificate of completion' },
            { icon:FiUsers,      color:C.brand,  label:'Community access'          },
            { icon:FiGlobe,      color:C.blue,   label:'Learn at your own pace'    },
          ].map((f, i) => (
            <HStack key={i} spacing={3}>
              <Box w="32px" h="32px" borderRadius="10px" display="flex"
                alignItems="center" justifyContent="center" flexShrink={0}
                style={{ background:`${f.color}18`, border:`1px solid ${f.color}33` }}>
                <Icon as={f.icon} color={f.color} boxSize={3.5} />
              </Box>
              <Text fontSize="sm" color={C.muted}>{f.label}</Text>
            </HStack>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

// ─── Helper: SimpleGrid ───────────────────────────────────────────────────────
function SimpleGrid({ children, columns, spacing }) {
  const cols = typeof columns === 'object'
    ? Object.entries(columns).map(([bp,v]) => `${bp}:repeat(${v},1fr)`).join(' ')
    : `repeat(${columns},1fr)`;
  return (
    <Box display="grid"
      gridTemplateColumns={{ base:`repeat(${columns?.base||1},1fr)`, sm:`repeat(${columns?.sm||columns?.base||1},1fr)` }}
      gap={spacing}>
      {children}
    </Box>
  );
}

export default CourseDetail;