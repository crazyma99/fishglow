<template>
  <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="nav__bar">
      <!-- 首页: logo + 品牌名 -->
      <view v-if="home" class="nav__left">
        <image class="nav__logo" src="/static/logo-icon.png" mode="aspectFit" />
        <text class="nav__brand">渔光 FishGlow</text>
      </view>
      <!-- Tab页: 仅标题 -->
      <view v-else-if="tab" class="nav__left">
        <text class="nav__title">{{ title }}</text>
      </view>
      <!-- 二级页: 返回 + 标题 -->
      <view v-else class="nav__left">
        <view class="nav__back" hover-class="nav__back--press" @tap="goBack">
          <text class="nav__back-arrow">←</text>
        </view>
        <text class="nav__title">{{ title }}</text>
      </view>
    </view>
  </view>
  <!-- 占位 -->
  <view :style="{ height: (statusBarHeight + 44) + 'px' }"></view>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  title: { type: String, default: '' },
  home: { type: Boolean, default: false },
  tab: { type: Boolean, default: false }
});

const statusBarHeight = ref(20);
try {
  const info = uni.getWindowInfo();
  statusBarHeight.value = info.statusBarHeight || 20;
} catch (e) {
  // fallback for older base libs
  try {
    const sys = uni.getSystemInfoSync();
    statusBarHeight.value = sys.statusBarHeight || 20;
  } catch (e2) {}
}

function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.switchTab({ url: '/pages/home/index' });
  }
}
</script>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #F6F6F6;
  border-bottom: 3px solid #222222;
}

.nav__bar {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.nav__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav__logo {
  width: 30px;
  height: 20px;
}

.nav__brand {
  font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 900;
  color: #222222;
}

.nav__back {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #222222;
  background: #EEEEEE;
  box-shadow: 2px 2px 0 #222222;
  transition: transform 100ms, box-shadow 100ms;
}

.nav__back--press {
  box-shadow: none;
  transform: translate(2px, 2px);
}

.nav__back-arrow {
  font-size: 16px;
  font-weight: 900;
  color: #222222;
}

.nav__title {
  font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 900;
  color: #222222;
}
</style>
