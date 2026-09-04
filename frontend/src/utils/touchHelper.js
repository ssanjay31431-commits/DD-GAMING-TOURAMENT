/**
 * Universal Mobile Touch & Click Helper for DD GAMING
 * Eliminates 300ms mobile tap delays, touch cancellations, and duplicate click events.
 */

let lastTouchTimestamp = 0;

export function handleTouchOrClick(fn) {
  return function (e) {
    if (!e) return;
    
    if (e.type === 'touchend') {
      lastTouchTimestamp = Date.now();
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
      if (typeof fn === 'function') fn(e);
    } else if (e.type === 'click') {
      if (Date.now() - lastTouchTimestamp < 450) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        return;
      }
      if (typeof fn === 'function') fn(e);
    }
  };
}

export function touchProps(fn) {
  const handler = handleTouchOrClick(fn);
  return {
    onClick: handler,
    onTouchEnd: handler
  };
}
