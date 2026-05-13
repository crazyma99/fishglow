<template>
  <view class="login-guide" @tap="handleLogin">
    <image class="login-guide__icon" src="/static/icons/muted/fish.svg" mode="aspectFit" />
    <text class="login-guide__title">{{ title || 'LOGIN REQUIRED' }}</text>
    <text class="login-guide__desc">{{ desc || '登录后可使用完整功能' }}</text>
    <view class="login-guide__btn" hover-class="login-guide__btn--press">
      <text class="login-guide__btn-text">★ LOGIN ★</text>
    </view>
  </view>
</template>

<script setup>
import { ensureLogin } from '../utils/auth';

defineProps({ title: String, desc: String });
const emit = defineEmits(['loggedIn']);

async function handleLogin() {
  const openid = await ensureLogin();
  if (openid) emit('loggedIn');
}
</script>

<style scoped>
.login-guide {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 48rpx;
}

.login-guide__icon {
  width: 80rpx;
  height: 80rpx;
  opacity: 0.3;
  margin-bottom: 24rpx;
}

.login-guide__title {
  font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
  font-size: 32rpx;
  font-weight: 900;
  color: #222222;
  margin-bottom: 8rpx;
}

.login-guide__desc {
  font-size: 24rpx;
  color: #A9A9A9;
  margin-bottom: 32rpx;
}

.login-guide__btn {
  background: #FF590E;
  border: 3px solid #222222;
  box-shadow: 4px 4px 0 #222222;
  padding: 16rpx 48rpx;
  border-radius: 999rpx;
  transition: transform 100ms, box-shadow 100ms;
}

.login-guide__btn--press {
  box-shadow: none;
  transform: translate(4px, 4px);
}

.login-guide__btn-text {
  font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 900;
}
</style>
