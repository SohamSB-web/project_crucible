import { motion, useSpring } from 'framer-motion';
import { useRef, useState } from 'react';

export default function MagneticButton({ children, className = '', onClick, variant = 'primary', type = 'button' }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const springX = useSpring(0, { stiffness: 120, damping: 12 });
  const springY = useSpring(0, { stiffness: 120, damping: 12 });

  const handleMove = (event) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);

    const maxOffset = 14;
    const x = Math.max(Math.min(offsetX / (rect.width * 1.2), 1), -1) * maxOffset;
    const y = Math.max(Math.min(offsetY / (rect.height * 1.2), 1), -1) * maxOffset;

    setPosition({ x, y });
    springX.set(x);
    springY.set(y);
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
    springX.set(0);
    springY.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={`magnetic-button ${variant} ${className}`.trim()}
      style={{
        x: springX,
        y: springY,
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="magnetic-inner" style={{ x: position.x * 0.35, y: position.y * 0.35 }}>
        {children}
      </span>
    </motion.button>
  );
}
