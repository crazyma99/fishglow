<script setup>
import { onLaunch } from '@dcloudio/uni-app';
import { IMG_BASE } from './utils/config';

onLaunch(() => {
  // 加载英文氛围字体 Space Grotesk Bold (68KB)
  uni.loadFontFace({
    family: 'SpaceGrotesk',
    source: `url("${IMG_BASE}/assets/fonts/SpaceGrotesk-Bold.ttf")`,
    global: true,
    scopes: ['webview', 'native'],
    desc: { style: 'normal', weight: 'bold' },
    success() { console.log('[font] SpaceGrotesk loaded'); },
    fail(e) { console.warn('[font] SpaceGrotesk failed:', e); }
  });
});
</script>

<style>
page {
  font-family: -apple-system, 'PingFang SC', sans-serif;
  font-size: 28rpx;
  color: #222222;
  background: #F6F6F6;
}

</style>
