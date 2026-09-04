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

  let touchStartX = null;
  let touchStartY = null;
  let lastTouchTime = 0;

  return {
    onTouchStart: (e) => {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    },
    onTouchEnd: (e) => {
      let isCleanTap = true;

      if (touchStartX !== null && touchStartY !== null && e.changedTouches && e.changedTouches[0]) {
        const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX);
        const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
        // Only reject if finger moved significantly (> 30px, e.g. actual scrolling)
        if (deltaX > 30 || deltaY > 30) {
          isCleanTap = false;
        }
      }

      // Reset start coordinates for next gesture
      touchStartX = null;
      touchStartY = null;

      if (isCleanTap) {
        lastTouchTime = Date.now();
        try {
          fn(e);
        } catch (err) {
          console.error("Error executing touch handler:", err);
        }
      }
    },
    onClick: (e) => {
      // Prevent double execution if already handled by onTouchEnd within 350ms
      if (Date.now() - lastTouchTime < 350) {
        return;
      }
      lastTouchTime = Date.now();
      try {
        fn(e);
      } catch (err) {
        console.error("Error executing click handler:", err);
      }
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

