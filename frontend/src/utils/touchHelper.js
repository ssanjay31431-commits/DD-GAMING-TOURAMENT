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
