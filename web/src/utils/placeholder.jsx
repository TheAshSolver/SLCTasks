export function getPlaceholder({ seed, w = 640, h = 480, blur = 1 }) {
  const encodedSeed = Buffer.from(seed).toString("base64");
  return `https://picsum.photos/seed/${encodedSeed}/${w}/${h}?blur=${blur}`;
}
