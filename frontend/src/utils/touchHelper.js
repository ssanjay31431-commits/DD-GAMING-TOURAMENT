/**
 * Universal Mobile Touch & Click Helper for DD GAMING
 * Integrates cleanly with React synthetic event delegation and touch-action: manipulation.
 */

export function handleTouchOrClick(fn) {
  return function (e) {
    if (!e) return;
    if (typeof fn === 'function') {
      fn(e);
    }
  };
}

export function touchProps(fn) {
  return {
    onClick: handleTouchOrClick(fn)
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
