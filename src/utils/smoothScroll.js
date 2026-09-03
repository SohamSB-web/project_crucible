/**
 * Smoothly scrolls the window to a target element or position with a custom easing animation
 * @param {string|number|HTMLElement} target - Element, ID, or Y position to scroll to
 * @param {object} options - Configuration options
 * @param {number} options.offset - Offset in px from the top (default 80 to account for fixed navbar)
 * @param {number} options.duration - Duration of scroll animation in ms (default 900)
 * @param {function} options.onComplete - Optional callback when scrolling finishes
 */
export function smoothScrollTo(target, { offset = 80, duration = 850, onComplete } = {}) {
  let targetY = 0;

  if (typeof target === 'number') {
    targetY = target;
  } else if (typeof target === 'string') {
    const cleanId = target.replace(/^#/, '');
    if (!cleanId || cleanId === 'home') {
      targetY = 0;
    } else {
      const el = document.getElementById(cleanId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      targetY = window.pageYOffset + rect.top - offset;
    }
  } else if (target && target.getBoundingClientRect) {
    const rect = target.getBoundingClientRect();
    targetY = window.pageYOffset + rect.top - offset;
  }

  // Ensure targetY is within bounds
  const maxScroll = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight
  ) - window.innerHeight;

  targetY = Math.max(0, Math.min(targetY, maxScroll));

  const startY = window.pageYOffset;
  const distance = targetY - startY;

  if (Math.abs(distance) < 2) {
    if (onComplete) onComplete();
    return;
  }

  // Smooth quintic / cubic custom ease-in-out curve for a luxurious, flawless feel
  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      window.scrollTo(0, targetY);
      if (onComplete) onComplete();
    }
  }

  window.requestAnimationFrame(step);
}
