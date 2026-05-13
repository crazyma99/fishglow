const fs = require('fs');
const path = require('path');

// Minimal valid 1x1 PNG
const PNG_1x1 = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489' +
  '0000000a49444154789c626000000002000198e7399f0000000049454e44ae426082',
  'hex'
);

const tabbarDir = path.resolve(__dirname, 'src/static/tabbar');
fs.mkdirSync(tabbarDir, { recursive: true });

const icons = ['home', 'fish', 'camera', 'bookmark', 'star'];
icons.forEach(name => {
  fs.writeFileSync(path.join(tabbarDir, `${name}.png`), PNG_1x1);
  fs.writeFileSync(path.join(tabbarDir, `${name}-active.png`), PNG_1x1);
});

console.log('Done: tabbar placeholder PNGs created');
