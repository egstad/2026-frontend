/** Ensures only one hover tooltip is “active” at a time (shared hitboxes can overlap). */
let activeClose: (() => void) | null = null;

export function tooltipTakeOver(close: () => void) {
  if (activeClose && activeClose !== close) activeClose();
  activeClose = close;
}

export function tooltipRelease(close: () => void) {
  if (activeClose === close) activeClose = null;
}
