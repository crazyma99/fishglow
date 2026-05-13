<template>
  <view class="loading-wave">
    <view class="loading-wave__circle loading-wave__circle--1"></view>
    <view class="loading-wave__circle loading-wave__circle--2"></view>
    <view class="loading-wave__circle loading-wave__circle--3"></view>
    <text class="loading-wave__text">识别中...</text>
  </view>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.loading-wave {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;

  &__circle {
    position: absolute;
    border: 2rpx solid rgba(14, 165, 233, 0.6);
    border-radius: 50%;
    animation: ripple 2s ease-out infinite;

    &--1 {
      width: 80rpx;
      height: 80rpx;
      animation-delay: 0s;
    }
    &--2 {
      width: 80rpx;
      height: 80rpx;
      animation-delay: 0.6s;
    }
    &--3 {
      width: 80rpx;
      height: 80rpx;
      animation-delay: 1.2s;
    }
  }

  &__text {
    margin-top: 200rpx;
    color: #FFFFFF;
    font-size: 28rpx;
  }
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
