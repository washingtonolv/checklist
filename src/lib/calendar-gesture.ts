/** A deliberate horizontal swipe changes a week; taps and vertical scroll do not. */
export function calendarSwipe(deltaX: number, deltaY: number, width: number): "next" | "previous" | null {
  if (![deltaX, deltaY, width].every(Number.isFinite) || width <= 0) return null;
  if (Math.abs(deltaX) < Math.min(72, width * .18) || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return null;
  return deltaX < 0 ? "next" : "previous";
}
