// Shared mutable state between the bug (writes its position) and the guide (shoos it away).
export const crawlerBus = {
  alive: false,
  homeX: -1, // the guide's head; the bug crawls around it
  homeY: -1,
  x: -9999,
  y: -9999,
  caughtAt: 0, // set when the bug is caught
  scaredAt: 0, // set by the guide; the bug scurries away from (scareX, scareY)
  scareX: 0,
  scareY: 0,
};
