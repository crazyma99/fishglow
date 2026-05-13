<template>
  <view class="badge-item" :class="{ 'badge-item--locked': !unlocked }">
    <view class="badge-item__icon-wrap">
      <image v-if="badge.image_url" :src="badge.image_url" class="badge-item__icon" mode="aspectFit" />
      <image v-else class="badge-item__icon" src="/static/icons/muted/trophy.svg" mode="aspectFit" />
      <view v-if="!unlocked" class="badge-item__lock">
        <image class="badge-item__lock-icon" src="/static/icons/white/lock.svg" mode="aspectFit" />
      </view>
    </view>
    <text class="badge-item__name">{{ badge.name }}</text>
    <text v-if="unlocked && badge.unlocked_at" class="badge-item__date">{{ badge.unlocked_at }}</text>
  </view>
</template>

<script setup>
defineProps({
  badge: { type: Object, required: true },
  unlocked: { type: Boolean, default: false }
});
</script>

<style lang="scss" scoped>
.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;

  &--locked {
    .badge-item__icon-wrap {
      filter: grayscale(1);
      opacity: 0.5;
    }
    .badge-item__name {
      color: #A9A9A9;
    }
  }

  &__icon-wrap {
    position: relative;
    width: 120rpx;
    height: 120rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #222222;
    border-radius: 0;
    box-shadow: 4px 4px 0 #222222;
    background: #EEEEEE;
  }

  &__icon {
    width: 100%;
    height: 100%;
  }

  &__icon-placeholder {
    width: 64rpx;
    height: 64rpx;
  }

  &__lock {
    position: absolute;
    bottom: -4rpx;
    right: -4rpx;
    background: #222222;
    border-radius: 0;
    border: 2px solid #222222;
    width: 36rpx;
    height: 36rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__lock-icon {
    width: 20rpx;
    height: 20rpx;
  }

  &__name {
    margin-top: 8rpx;
    font-size: 24rpx;
    font-weight: bold;
    color: #222222;
    text-align: center;
  }

  &__date {
    font-size: 20rpx;
    color: #A9A9A9;
    margin-top: 4rpx;
  }
}
</style>
