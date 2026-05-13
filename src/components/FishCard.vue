<template>
  <view class="fish-card" hover-class="fish-card--press">
    <view class="fish-card__img-wrap">
      <image v-if="coverSrc" :src="coverSrc" class="fish-card__img" mode="aspectFill" />
      <view v-else class="fish-card__placeholder">
        <image class="fish-card__placeholder-icon" src="/static/icons/muted/fish.svg" mode="aspectFit" />
      </view>
    </view>
    <view class="fish-card__info">
      <text class="fish-card__name">{{ fish.name_zh }}</text>
      <view class="fish-card__meta">
        <text v-if="fish.difficulty" class="fish-card__tag" :class="'fish-card__tag--' + fish.difficulty">{{ {easy:'简单',medium:'中等',hard:'困难'}[fish.difficulty] || fish.difficulty }}</text>
        <text v-for="m in (fish.fishing_methods || []).slice(0, 1)" :key="m" class="fish-card__method">{{ m }}</text>
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
  background: #EEEEEE;
  border: 3px solid #222222;
  box-shadow: 3px 3px 0 #222222;
  margin-bottom: 6rpx;
  transition: transform 100ms, box-shadow 100ms;

  &--press {
    box-shadow: none;
    transform: translate(3px, 3px);
  }

  &__img-wrap {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%; /* 16:9 */
    border-bottom: 3px solid #222222;
    overflow: hidden;
  }

  &__img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #D8D8D8;
  }

  &__placeholder-icon {
    width: 64rpx;
    height: 64rpx;
    opacity: 0.4;
  }

  &__info {
    padding: 12rpx;
  }

  &__name {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-size: 26rpx;
    font-weight: 900;
    color: #222222;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }

  &__meta {
    margin-top: 6rpx;
    display: flex;
    align-items: center;
    gap: 6rpx;
    overflow: hidden;
    flex-wrap: nowrap;
  }

  &__tag {
    font-size: 18rpx;
    font-weight: 900;
    padding: 2rpx 10rpx;
    border: 2px solid #222222;

    &--easy { background: #B4EF4E; color: #222222; }
    &--medium { background: #FFD93D; color: #222222; }
    &--hard { background: #FF590E; color: #FFFFFF; }
  }

  &__method {
    font-size: 18rpx;
    color: #A9A9A9;
    font-weight: 700;
  }
}
</style>
