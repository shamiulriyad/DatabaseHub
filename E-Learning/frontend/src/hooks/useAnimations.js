/**
 * useAnimations – lightweight animation hooks for the e-learning platform.
 *
 * Provides:
 *  • useFadeIn       – fade-in on mount (IntersectionObserver powered)
 *  • useStaggered    – stagger children animations
 *  • motionProps     – pre-built Chakra style-prop objects you can spread
 *
 * All animations use CSS transforms & opacity (GPU-composited, 60 fps).
 */
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { fadeIn, fadeInScale, slideInRight } from '../theme';

// ---------------------------------------------------------------------------
// useFadeIn – triggers when the element scrolls into view (or on mount)
// ---------------------------------------------------------------------------
export function useFadeIn({ threshold = 0.15, triggerOnce = true } = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) observer.unobserve(node);
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, triggerOnce]);

  const style = useMemo(
    () => ({
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.5s cubic-bezier(.4,0,.2,1), transform 0.5s cubic-bezier(.4,0,.2,1)',
    }),
    [isVisible],
  );

  return { ref, style, isVisible };
}

// ---------------------------------------------------------------------------
// Pre-built Chakra sx / style-prop objects (spread into any Box, Flex, etc.)
// ---------------------------------------------------------------------------
export const motionProps = {
  /** Gentle fade-in + slide up on mount */
  fadeInUp: {
    animation: `${fadeIn} 0.45s cubic-bezier(.4,0,.2,1) both`,
  },

  /** Scale-in (good for modals, cards) */
  fadeInScale: {
    animation: `${fadeInScale} 0.3s cubic-bezier(.4,0,.2,1) both`,
  },

  /** Slide-in from right (sidebars, drawers) */
  slideInRight: {
    animation: `${slideInRight} 0.35s cubic-bezier(.4,0,.2,1) both`,
  },

  /** Hover lift (spread into _hover) */
  hoverLift: {
    transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
    _hover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    },
  },

  /** Subtle scale on hover */
  hoverScale: {
    transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
    _hover: {
      transform: 'scale(1.02)',
    },
  },
};

// ---------------------------------------------------------------------------
// Stagger helper – returns an animation-delay style for the nth item
// ---------------------------------------------------------------------------
export function staggerDelay(index, baseMs = 60) {
  return {
    animation: `${fadeIn} 0.4s cubic-bezier(.4,0,.2,1) both`,
    animationDelay: `${index * baseMs}ms`,
  };
}

// ---------------------------------------------------------------------------
// useStaggered – returns an array of sx objects for a list of items
// ---------------------------------------------------------------------------
export function useStaggered(count, baseMs = 60) {
  return useMemo(
    () => Array.from({ length: count }, (_, i) => staggerDelay(i, baseMs)),
    [count, baseMs],
  );
}

export default useFadeIn;
