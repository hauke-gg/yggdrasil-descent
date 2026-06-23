/**
 * MobileDetect — single source of truth for touch/desktop branching.
 *
 * IS_TOUCH: device has touch input
 * IS_NARROW(scene): viewport is narrower than 900px (mobile landscape)
 */

export const IS_TOUCH = (() => {
  if (typeof window === 'undefined') return false;
  return ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
})();

export function isNarrow(scene) {
  return scene && scene.scale && scene.scale.width < 900;
}

export function isMobile(scene) {
  return IS_TOUCH || isNarrow(scene);
}
