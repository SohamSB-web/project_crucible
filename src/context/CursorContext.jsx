import { createContext, useCallback, useContext, useState } from 'react';

/**
 * CursorContext
 *
 * Lets any component in the tree signal what cursor state it requires.
 *
 * Usage in a dark-background section:
 *   const { setDarkSection } = useCursor();
 *   <section onMouseEnter={() => setDarkSection(true)} onMouseLeave={() => setDarkSection(false)}>
 *
 * Or use the convenience data attributes (read by the cursor itself on mousemove):
 *   <section data-cursor-theme="dark">   → dark mode (white only, normal blend)
 *   <section data-cursor-theme="light">  → show burgundy red accent layer
 *   <section data-cursor-force-normal>   → bypass difference blend on any bg
 */

const CursorContext = createContext(null);

export function CursorProvider({ children }) {
  const [isHoveringDark, setIsHoveringDark] = useState(false);
  const [forceNormal, setForceNormal] = useState(false);
  const [showRedOnNormal, setShowRedOnNormal] = useState(false);

  // Stable setters so consumers don't trigger unnecessary re-renders
  const setDarkSection = useCallback((v) => setIsHoveringDark(Boolean(v)), []);
  const setForceNormalMode = useCallback((v) => setForceNormal(Boolean(v)), []);
  const setRedAccent = useCallback((v) => setShowRedOnNormal(Boolean(v)), []);

  return (
    <CursorContext.Provider
      value={{
        isHoveringDark,
        forceNormal,
        showRedOnNormal,
        setDarkSection,
        setForceNormalMode,
        setRedAccent,
      }}
    >
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error('useCursor must be used inside <CursorProvider>');
  return ctx;
}
