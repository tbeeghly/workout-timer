// Generates favicon + PWA + native icons from the Ionicons stopwatch-outline glyph.
// Style: black icon on solid white background. Run: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');
const PUBLIC_ICONS = path.join(ROOT, 'public', 'icons');
const PUBLIC_ROOT = path.join(ROOT, 'public');
fs.mkdirSync(PUBLIC_ICONS, { recursive: true });
fs.mkdirSync(ASSETS, { recursive: true });

// Ionicons stopwatch-outline (MIT, ionic-team/ionicons). 512x512 viewBox.
const GLYPH = `
  <line x1="256" y1="232" x2="256" y2="152" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" fill="none"/>
  <line x1="256" y1="88"  x2="256" y2="72"  stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" fill="none"/>
  <line x1="132" y1="132" x2="120" y2="120" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" fill="none"/>
  <circle cx="256" cy="272" r="32" stroke="#000" stroke-width="32" fill="none" stroke-miterlimit="10"/>
  <path d="M256,96A176,176,0,1,0,432,272,176,176,0,0,0,256,96Z" stroke="#000" stroke-width="32" fill="none" stroke-miterlimit="10"/>
`;

/**
 * Compose an SVG of `size` px with a white background and the glyph drawn
 * inside an inset content area (so iOS rounded mask doesn't clip strokes).
 *
 * insetRatio = fraction of the size used by glyph (0..1). 0.72 keeps a healthy
 * margin so masking systems can crop without cutting the dial.
 */
function makeSvg(size, { background = '#FFFFFF', insetRatio = 0.72 } = {}) {
  const inset = size * insetRatio;
  const offset = (size - inset) / 2;
  const scale = inset / 512;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${background}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">${GLYPH}</g>
</svg>`;
}

async function writePng(svg, outPath, size) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log('  wrote', path.relative(ROOT, outPath));
}

async function main() {
  // Web / PWA icons (in public/, copied verbatim to dist root by Expo).
  await writePng(makeSvg(192), path.join(PUBLIC_ICONS, 'icon-192.png'), 192);
  await writePng(makeSvg(512), path.join(PUBLIC_ICONS, 'icon-512.png'), 512);
  // Maskable: tighter inset so safe-zone (40% radius) keeps the dial whole.
  await writePng(
    makeSvg(512, { insetRatio: 0.58 }),
    path.join(PUBLIC_ICONS, 'icon-maskable-512.png'),
    512
  );
  // Apple touch icon — iOS masks corners itself, so we use the standard inset.
  await writePng(makeSvg(180), path.join(PUBLIC_ICONS, 'apple-touch-icon.png'), 180);
  // Favicons
  await writePng(makeSvg(32), path.join(PUBLIC_ROOT, 'favicon-32.png'), 32);
  await writePng(makeSvg(16), path.join(PUBLIC_ROOT, 'favicon-16.png'), 16);

  // Native / Expo-required assets.
  await writePng(makeSvg(1024), path.join(ASSETS, 'icon.png'), 1024);
  // Android adaptive foreground: keep the glyph centered, transparent bg so
  // the configured backgroundColor shows through.
  const adaptiveFg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <g transform="translate(${(1024 - 1024 * 0.55) / 2} ${(1024 - 1024 * 0.55) / 2}) scale(${(1024 * 0.55) / 512})">${GLYPH}</g>
</svg>`;
  await sharp(Buffer.from(adaptiveFg))
    .resize(1024, 1024)
    .png({ compressionLevel: 9 })
    .toFile(path.join(ASSETS, 'adaptive-icon.png'));
  console.log('  wrote', path.relative(ROOT, path.join(ASSETS, 'adaptive-icon.png')));

  // Expo web favicon source.
  await writePng(makeSvg(48), path.join(ASSETS, 'favicon.png'), 48);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
