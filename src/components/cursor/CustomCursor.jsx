import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useCursor } from '../../context/CursorContext';

// ---------------------------------------------------------------------------
// Helper – read cursor theme from DOM data-attributes on the hovered element
// ---------------------------------------------------------------------------
function readDomTheme(target) {
  const el = target instanceof Element ? target : null;
  return {
    domDark: !!el?.closest('[data-cursor-theme="dark"]'),
    domLight:
      !!el?.closest('[data-cursor-theme="light"]') ||
      !!el?.closest('[data-cursor-accent="light"]'),
    domForceNormal: el?.closest('[data-cursor-force-normal]') != null,
    isInteractive: !!el?.closest(
      'a, button, input, textarea, select, [data-cursor-hover], .interactive'
    ),
  };
}

// Spring config – smooth but not excessively bouncy
const SPRING = { damping: 25, stiffness: 300, mass: 0.5 };

// ---------------------------------------------------------------------------
// CustomCursor
// ---------------------------------------------------------------------------
export default function CustomCursor() {
  // ── Framer Motion values (no React re-render on every mouse move) ──────────
  const dotX = useMotionValue(-200);
  const dotY = useMotionValue(-200);
  const ringX = useMotionValue(-200);
  const ringY = useMotionValue(-200);

  const ringXSpring = useSpring(ringX, SPRING);
  const ringYSpring = useSpring(ringY, SPRING);

  // ── Context state (only a few booleans – very cheap) ─────────────────────
  const { isHoveringDark, forceNormal, showRedOnNormal } = useCursor();

  // ── Local UI state ────────────────────────────────────────────────────────
  const [visible, setVisible] = useState(false);
  const [domTheme, setDomTheme] = useState({
    domDark: false,
    domLight: false,
    domForceNormal: false,
    isInteractive: false,
  });
  const domThemeRef = useRef(domTheme);

  // ── Event listeners ────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      // Update positions (motion values – no re-render)
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);

      // Only setState when the theme actually changes
      const next = readDomTheme(e.target);
      const cur = domThemeRef.current;
      if (
        next.domDark !== cur.domDark ||
        next.domLight !== cur.domLight ||
        next.domForceNormal !== cur.domForceNormal ||
        next.isInteractive !== cur.isInteractive
      ) {
        domThemeRef.current = next;
        setDomTheme(next);
      }

      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dotX, dotY, ringX, ringY]);

  // ── Derived appearance flags ───────────────────────────────────────────────
  const isDark = isHoveringDark || domTheme.domDark;
  const useNormal = forceNormal || domTheme.domForceNormal || isDark;
  const showAccent =
    !isDark &&
    !forceNormal &&
    !domTheme.domForceNormal &&
    (showRedOnNormal || domTheme.domLight);

  const ringScale = domTheme.isInteractive ? 1.35 : 1;

  // ── Shared base style helpers ─────────────────────────────────────────────
  const base = {
    position: 'fixed',
    top: 0,
    left: 0,
    borderRadius: '50%',
    pointerEvents: 'none',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.2s ease',
  };

  return (
    <>
      {/* ── Center Dot (white) ──────────────────────────────────────────────── */}
      <motion.div
        style={{
          ...base,
          width: 6,
          height: 6,
          background: 'rgba(255, 255, 255, 0.97)',
          boxShadow: '0 0 12px rgba(255, 255, 255, 0.35)',
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          mixBlendMode: useNormal ? 'normal' : 'difference',
          zIndex: 2147483647,
        }}
      />

      {/* ── Outer Ring (white) ──────────────────────────────────────────────── */}
      <motion.div
        style={{
          ...base,
          width: 32,
          height: 32,
          border: '1.5px solid rgba(255, 255, 255, 0.88)',
          background: 'rgba(255, 255, 255, 0.03)',
          x: ringXSpring,
          y: ringYSpring,
          translateX: '-50%',
          translateY: '-50%',
          scale: ringScale,
          mixBlendMode: useNormal ? 'normal' : 'difference',
          zIndex: 2147483646,
        }}
        transition={{ scale: { type: 'spring', ...SPRING } }}
      />

      {/* ── Accent layer (light backgrounds only - using site primary blue #71a7ff) ──────────── */}
      <motion.div
        style={{
          ...base,
          width: 6,
          height: 6,
          background: '#71a7ff',
          boxShadow: '0 0 10px rgba(113, 167, 255, 0.6)',
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: showAccent ? 1 : 0,
          mixBlendMode: 'lighten',
          zIndex: 2147483645,
          transition: 'opacity 0.25s ease',
        }}
      />
      <motion.div
        style={{
          ...base,
          width: 32,
          height: 32,
          border: '1.5px solid #71a7ff',
          background: 'rgba(113, 167, 255, 0.08)',
          boxShadow: '0 0 16px rgba(113, 167, 255, 0.25)',
          x: ringXSpring,
          y: ringYSpring,
          translateX: '-50%',
          translateY: '-50%',
          scale: ringScale,
          opacity: showAccent ? 0.85 : 0,
          mixBlendMode: 'lighten',
          zIndex: 2147483644,
          transition: 'opacity 0.25s ease, scale 0.2s ease',
        }}
      />
    </>
  );
}
