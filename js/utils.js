export function hexToRgb(hex) {
  const cleaned = hex.replace(/^#/, '');
  if (cleaned.length !== 6 && cleaned.length !== 3) {
    return null;
  }

  let full = cleaned;
  if (cleaned.length === 3) {
    full = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2];
  }

  const num = parseInt(full, 16);
  if (isNaN(num)) return null;

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}
