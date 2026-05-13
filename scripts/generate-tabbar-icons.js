/**
 * Generate tabbar PNG icons from SVG sources.
 * Run: node scripts/generate-tabbar-icons.js
 *
 * Requires: sharp (npm install sharp --save-dev)
 *
 * For now, placeholder PNGs are created manually.
 * In production, use this script or WeChat DevTools icon converter.
 */
const fs = require('fs');
const path = require('path');

// Minimal 40x40 transparent PNG (base64)
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAADklEQVRYR+3BAQ0AAADCoPdP' +
  'bQ43oAAAAHcNHDgAAQAbf3QAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjQtMDEtMDFUMDA6MDArMDA6MDAr' +
  'MDAwMDAwMDAAAABJRU5ErkJggg==',
  'base64'
);

const tabbarDir = path.resolve(__dirname, '../src/static/tabbar');
if (!fs.existsSync(tabbarDir)) {
  fs.mkdirSync(tabbarDir, { recursive: true });
}

const icons = ['home', 'fish', 'camera', 'bookmark', 'star'];
icons.forEach(name => {
  fs.writeFileSync(path.join(tabbarDir, `${name}.png`), PLACEHOLDER_PNG);
  fs.writeFileSync(path.join(tabbarDir, `${name}-active.png`), PLACEHOLDER_PNG);
});

console.log('Tabbar placeholder PNGs generated.');
console.log('Replace with proper 81x81 PNG icons for production.');
