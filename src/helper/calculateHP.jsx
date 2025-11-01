export function calculateHP(base, level, iv = 0, ev = 0) {
  return (
    Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) +
    level +
    10
  );
}