<template>
  <view class="login-guide" @tap="handleLogin">
    <image class="login-guide__icon" src="/static/icons/primary/star.svg" mode="aspectFit" />
    <text class="login-guide__title">{{ title || '请先登录' }}</text>
    <text class="login-guide__desc">{{ desc || '登录后可使用完整功能' }}</text>
    <view class="login-guide__btn">
      <text class="login-guide__btn-text">点击登录</text>
    </view>
  </view>
</template>

<script setup>
import { ensureLogin } from '../utils/auth';

defineProps({
  title: String,
  desc: String
});

const emit = defineEmits(['loggedIn']);

async function handleLogin() {
  const openid = await ensureLogin();
  if (openid) {
    emit('loggedIn');
  }
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
  opacity: 0.4;
  margin-bottom: 24rpx;
}

.login-guide__title {
  font-size: 30rpx;
  font-weight: bold;
  color: #1E293B;
  margin-bottom: 8rpx;
}

.login-guide__desc {
  font-size: 24rpx;
  color: #94A3B8;
  margin-bottom: 32rpx;
}

.login-guide__btn {
  background: #EA580C;
  padding: 16rpx 48rpx;
  border-radius: 4rpx;
}

.login-guide__btn-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: bold;
}
</style>
