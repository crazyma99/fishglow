<template>
  <view class="home">
    <!-- Logo -->
    <view class="home__logo">
      <image class="home__logo-img" src="/static/logo.png" mode="aspectFit" />
    </view>

    <!-- 每日一鱼 -->
    <view class="card" hover-class="card--active" hover-stay-time="150" @tap="goFishDetail(dailyFish)">
      <view class="card__header">
        <text class="card__title">每日一鱼</text>
        <text class="card__sub">{{ todayDate }}</text>
      </view>
      <view class="daily-fish" v-if="dailyFish">
        <image v-if="dailyFish.image_url" :src="dailyFish.image_url" class="daily-fish__img" mode="aspectFill" />
        <view class="daily-fish__info">
          <text class="daily-fish__name">{{ dailyFish.name_zh }}</text>
          <text class="daily-fish__desc">{{ dailyFish.description || '点击查看详情' }}</text>
        </view>
      </view>
    </view>

    <!-- 本周挑战 -->
    <view class="card">
      <view class="card__header">
        <text class="card__title">本周挑战</text>
      </view>
      <text class="challenge__text">识别5种不同的鱼</text>
      <view class="challenge__bar">
        <view class="challenge__progress" :style="{ width: Math.min(collectionCount / 5 * 100, 100) + '%' }"></view>
      </view>
      <text class="challenge__count">{{ collectionCount }}/5</text>
    </view>

    <!-- 当季活跃 -->
    <view class="card">
      <view class="card__header">
        <text class="card__title">当季活跃</text>
      </view>
      <scroll-view scroll-x class="seasonal-scroll">
        <view class="seasonal-list">
          <view v-for="fish in seasonalList" :key="fish.name_zh" class="seasonal-item" @tap="goFishDetail(fish)">
            <FishCard :fish="fish" />
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 快捷入口 -->
    <view class="shortcuts">
      <view class="shortcut-item" hover-class="shortcut-item--active" @tap="goHistory">
        <image class="shortcut-item__icon" src="/static/icons/primary/history.svg" mode="aspectFit" />
        <text class="shortcut-item__text">识别历史</text>
      </view>
      <view class="shortcut-item" hover-class="shortcut-item--active" @tap="goAchievement">
        <image class="shortcut-item__icon" src="/static/icons/primary/trophy.svg" mode="aspectFit" />
        <text class="shortcut-item__text">我的成就</text>
      </view>
      <view class="shortcut-item" hover-class="shortcut-item--active" @tap="goFishDb">
        <image class="shortcut-item__icon" src="/static/icons/primary/fish.svg" mode="aspectFit" />
        <text class="shortcut-item__text">鱼类百科</text>
      </view>
      <view class="shortcut-item" hover-class="shortcut-item--active" @tap="goFishing">
        <image class="shortcut-item__icon" src="/static/icons/primary/star.svg" mode="aspectFit" />
        <text class="shortcut-item__text">去钓鱼</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { request } from '../../utils/api';
import FishCard from '../../components/FishCard.vue';

const dailyFish = ref(null);
const seasonalList = ref([]);
const collectionCount = ref(0);
const todayDate = ref('');

onMounted(() => {
  const d = new Date();
  todayDate.value = `${d.getMonth() + 1}月${d.getDate()}日`;
  loadSeasonal();
});

onShow(() => {
  loadCollectionCount();
});

onPullDownRefresh(async () => {
  try {
    await loadSeasonal();
    loadCollectionCount();
  } finally {
    uni.stopPullDownRefresh();
  }
});

async function loadSeasonal() {
  try {
    const res = await request({ url: '/seasonal' });
    const list = res.data.recommendations || [];
    seasonalList.value = list.slice(0, 10);
    if (list.length > 0) {
      const today = new Date();
      const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % Math.min(list.length, 5);
      dailyFish.value = list[dayIndex];
    }
  } catch (e) {
    console.log('load seasonal error', e);
  }
}

function loadCollectionCount() {
  const stored = uni.getStorageSync('collection_count');
  collectionCount.value = stored ? parseInt(stored) : 0;
}

function goFishDetail(fish) {
  if (!fish) return;
  uni.setStorageSync('temp_fish_detail', JSON.stringify(fish));
  uni.navigateTo({ url: '/pages/fish-detail/index' });
}

function goHistory() {
  uni.navigateTo({ url: '/pages/history/index' });
}

function goAchievement() {
  uni.navigateTo({ url: '/pages/achievement/index' });
}

function goFishDb() {
  uni.switchTab({ url: '/pages/fishdb/index' });
}

function goFishing() {
  uni.showToast({ title: '功能开发中', icon: 'none' });
}
</script>

<style lang="scss" scoped>
.home {
  padding: 24rpx;

  &__logo {
    display: flex;
    justify-content: center;
    margin-bottom: 24rpx;
  }

  &__logo-img {
    width: 240rpx;
    height: 144rpx;
  }
}

.card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 4rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: opacity 150ms;

  &--active {
    opacity: 0.7;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }

  &__title {
    font-size: 30rpx;
    font-weight: bold;
    color: #1E293B;
  }

  &__sub {
    font-size: 24rpx;
    color: #64748B;
  }
}

.daily-fish {
  display: flex;
  gap: 16rpx;

  &__img {
    width: 160rpx;
    height: 120rpx;
    border-radius: 4rpx;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &__name {
    font-size: 32rpx;
    font-weight: bold;
    color: #1E293B;
  }

  &__desc {
    font-size: 24rpx;
    color: #64748B;
    margin-top: 8rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.challenge {
  &__text {
    font-size: 26rpx;
    color: #1E293B;
  }

  &__bar {
    height: 12rpx;
    background: #E2E8F0;
    border-radius: 4rpx;
    margin-top: 16rpx;
    overflow: hidden;
  }

  &__progress {
    height: 100%;
    background: #EA580C;
    border-radius: 4rpx;
    transition: width 300ms;
  }

  &__count {
    font-size: 22rpx;
    color: #64748B;
    margin-top: 8rpx;
  }
}

.seasonal-scroll {
  white-space: nowrap;
  margin: 0 -24rpx;
  padding: 0 24rpx;
}

.seasonal-list {
  display: inline-flex;
  gap: 16rpx;
}

.seasonal-item {
  width: 240rpx;
  flex-shrink: 0;
  display: inline-block;
}

.shortcuts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.shortcut-item {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 4rpx;
  padding: 32rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  transition: opacity 150ms;

  &--active {
    opacity: 0.7;
  }

  &__icon {
    width: 44rpx;
    height: 44rpx;
  }

  &__text {
    font-size: 26rpx;
    color: #1E293B;
  }
}
</style>
