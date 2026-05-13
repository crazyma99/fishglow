<template>
  <view class="fish-card" :hover-class="'fish-card--active'" hover-stay-time="150">
    <image v-if="coverSrc" :src="coverSrc" class="fish-card__img" mode="aspectFill" />
    <view v-else class="fish-card__placeholder">
      <image class="fish-card__placeholder-icon" src="/static/icons/muted/fish.svg" mode="aspectFit" />
    </view>
    <view class="fish-card__info">
      <text class="fish-card__name">{{ fish.name_zh }}</text>
      <view class="fish-card__meta">
        <text v-if="fish.difficulty" class="fish-card__difficulty">难度 {{ fish.difficulty }}</text>
        <text v-for="m in (fish.fishing_methods || []).slice(0, 1)" :key="m" class="fish-card__tag">{{ m }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

import { IMG_BASE } from '../utils/config';

const props = defineProps({
  fish: { type: Object, required: true }
});

const coverSrc = computed(() => {
  const url = props.fish.cover_image || props.fish.image_url || '';
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return IMG_BASE + url;
});
</script>

<style lang="scss" scoped>
.fish-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 4rpx;
  overflow: hidden;
  transition: opacity 150ms;

  &--active {
    opacity: 0.7;
  }

  &__img {
    width: 100%;
    height: 200rpx;
  }

  &__placeholder {
    width: 100%;
    height: 200rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F0F9FF;
  }

  &__placeholder-icon {
    width: 64rpx;
    height: 64rpx;
  }

  &__info {
    padding: 16rpx;
    height: 100rpx;
    overflow: hidden;
  }

  &__name {
    font-size: 28rpx;
    font-weight: bold;
    color: #1E293B;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    margin-top: 8rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    flex-wrap: nowrap;
    overflow: hidden;
  }

  &__difficulty {
    font-size: 22rpx;
    color: #EA580C;
    background: #FFF7ED;
    padding: 4rpx 12rpx;
    border-radius: 4rpx;
  }

  &__tag {
    font-size: 22rpx;
    color: #64748B;
    background: #F0F9FF;
    padding: 4rpx 12rpx;
    border-radius: 4rpx;
  }
}
</style>
