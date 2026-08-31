import { useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';

/**
 * useParallax
 *
 * Returns a `ref` to attach to a section/element and a `y` motion value
 * that translates the element as it scrolls through the viewport.
 *
 * @param {number} distance  – How many px the element travels (default 60).
 *                             Positive = moves down (slower than scroll).
 *                             Negative = moves up (faster than scroll).
 */
export function useParallax(distance = 60) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Map scroll progress 0→1 into -distance/2 → +distance/2
  const y = useTransform(scrollYProgress, [0, 1], [-distance / 2, distance / 2]);

  return { ref, y };
}
