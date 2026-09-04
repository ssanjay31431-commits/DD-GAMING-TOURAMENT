/**
 * Universal Mobile Touch & Click Helper for DD GAMING
 * Integrates cleanly with React synthetic event delegation and touch-action: manipulation.
 *
 * Direct Touch + Click Event Bridge:
 * On real mobile touchscreens, finger micro-wiggles can suppress synthetic `onClick` events.
 * This helper listens to `onTouchStart` and `onTouchEnd`. If finger movement is < 12px
 * (a clean tap), `fn` is executed immediately (0ms touch latency).
 * Timestamp deduplication ensures delayed synthetic `onClick` events do not double-trigger.
 */

export function touchProps(fn) {
  if (typeof fn !== 'function') return {};

  let touchStartX = 0;
  let touchStartY = 0;
  let lastTouchTime = 0;

  return {
    onTouchStart: (e) => {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    },
    onTouchEnd: (e) => {
      let deltaX = 0;
      let deltaY = 0;

      if (e.changedTouches && e.changedTouches[0]) {
        deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX);
        deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
      }

      // If touch movement is less than 12px in both dimensions, it's a mobile tap
      if (deltaX < 12 && deltaY < 12) {
        lastTouchTime = Date.now();
        fn(e);
      }
    },
    onClick: (e) => {
      // If already executed by onTouchEnd within 400ms, ignore duplicate synthetic click
      if (Date.now() - lastTouchTime < 400) {
        return;
      }
      fn(e);
    }
  };
}

export function handleTouchOrClick(fn) {
  return function (e) {
    if (!e) return;
    if (typeof fn === 'function') {
      fn(e);
    }
  };
}

/**
 * Forensic DOM Hit-Testing Helper
 * Inspects element sitting directly under a screen coordinate (x, y)
 */
export function getElementAtPoint(x, y) {
  if (typeof window === 'undefined' || !window.document) return null;
  return window.document.elementFromPoint(x, y);
}

/**
 * Forensic Viewport Overflow Diagnostic Audit
 * Returns all DOM elements whose right boundary extends beyond window.innerWidth
 */
export function auditViewportOverflow() {
  if (typeof window === 'undefined' || !window.document) return [];
  const viewportWidth = window.innerWidth;
  const elements = Array.from(window.document.querySelectorAll('*'));
  const overflowing = elements.filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.right > viewportWidth + 1 || rect.left < -1;
  });
  return overflowing.map(el => ({
    tagName: el.tagName,
    className: el.className,
    rect: el.getBoundingClientRect()
  }));
}

