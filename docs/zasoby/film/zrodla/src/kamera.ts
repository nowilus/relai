// The camera of a scene: a zoom towards a focal point of the layer, as one transform. `k` runs
// 0..1; at 0 the layer is untouched, at 1 the focal point sits at the frame's anchor, `zoom` times
// larger. Between them the focal point travels straight to the anchor while the scale grows, so
// the eye never loses what the camera goes to.

export type Punkt = { x: number, y: number };

export function camera(focus: Punkt, anchor: Punkt, zoom: number, k: number): string {
  const s = 1 + (zoom - 1) * k;
  const sx = focus.x + (anchor.x - focus.x) * k;
  const sy = focus.y + (anchor.y - focus.y) * k;
  return `translate(${(sx - focus.x * s).toFixed(3)}px, ${(sy - focus.y * s).toFixed(3)}px) scale(${s.toFixed(5)})`;
}

/** The offset of an element inside an ancestor, from layout alone: CSS transforms do not count. */
export function offsetWithin(el: HTMLElement, ancestor: HTMLElement): Punkt {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  if (node !== ancestor) throw new Error('camera target is not inside the stage');
  return { x, y };
}
