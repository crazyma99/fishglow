<template>
  <view class="home">
    <CustomNav home />

    <!-- 每日一鱼 -->
    <view class="card" hover-class="card--press" @tap="goFishDetail(dailyFish)">
      <view class="card__head">
        <text class="card__tag card__tag--green">★ 每日一鱼</text>
        <text class="card__sub">{{ todayDate }}</text>
      </view>
      <view class="daily" v-if="dailyFish">
        <view class="daily__info">
          <text class="daily__name">{{ dailyFish.name_zh }}</text>
          <text class="daily__latin">{{ dailyFish.name_latin || '' }}</text>
          <text class="daily__tip">{{ dailyFish.tip || '点击查看详情 →' }}</text>
        </view>
      </view>
    </view>

    <!-- 本周挑战 -->
    <view class="card">
      <view class="card__head">
        <text class="card__tag card__tag--orange">本周挑战</text>
      </view>
      <text class="quest__label">识别 5 种不同的鱼</text>
      <view class="quest__bar">
        <view class="quest__fill" :style="{ width: Math.min(collectionCount / 5 * 100, 100) + '%' }"></view>
      </view>
      <text class="quest__count">{{ collectionCount }} / 5</text>
    </view>

    <!-- 当季活跃 -->
    <view class="card">
      <view class="card__head">
        <text class="card__tag card__tag--green">当季活跃 🔥</text>
      </view>
      <scroll-view scroll-x class="season-scroll">
        <view class="season-list">
          <view v-for="fish in seasonalList" :key="fish.name_zh" class="season-item" @tap="goFishDetail(fish)">
            <FishCard :fish="fish" />
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 快捷入口 -->
    <view class="shortcuts">
      <view class="shortcut" hover-class="shortcut--press" @tap="goHistory">
        <image class="shortcut__icon" src="/static/icons/primary/history.svg" mode="aspectFit" />
        <text class="shortcut__text">识别历史</text>
      </view>
      <view class="shortcut" hover-class="shortcut--press" @tap="goAchievement">
        <image class="shortcut__icon" src="/static/icons/primary/trophy.svg" mode="aspectFit" />
        <text class="shortcut__text">我的成就 ★</text>
      </view>
      <view class="shortcut" hover-class="shortcut--press" @tap="goFishDb">
        <image class="shortcut__icon" src="/static/icons/primary/fish.svg" mode="aspectFit" />
        <text class="shortcut__text">鱼类百科</text>
      </view>
      <view class="shortcut" hover-class="shortcut--press" @tap="goFishing">
        <image class="shortcut__icon" src="/static/icons/primary/star.svg" mode="aspectFit" />
        <text class="shortcut__text">去钓鱼</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { request } from '../../utils/api';
import { isLoggedIn, getOpenid } from '../../utils/auth';
import FishCard from '../../components/FishCard.vue';
import CustomNav from '../../components/CustomNav.vue';

const dailyFish = ref(null);
const seasonalList = ref([]);
const collectionCount = ref(0);
const todayDate = ref('');

onMounted(() => {
  const d = new Date();
  todayDate.value = `${d.getMonth() + 1}月${d.getDate()}日`;
  loadSeasonal();
});

onShow(() => { loadCollectionCount(); });

onPullDownRefresh(async () => {
  try { await loadSeasonal(); loadCollectionCount(); }
  finally { uni.stopPullDownRefresh(); }
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
  } catch (e) { console.log('load seasonal error', e); }
}

async function loadCollectionCount() {
  if (!isLoggedIn()) { collectionCount.value = 0; return; }
  try {
    const res = await request({ url: '/user/stats', data: { openid: getOpenid() } });
    collectionCount.value = res.data.collection_count || 0;
  } catch (e) { collectionCount.value = 0; }
}

function goFishDetail(fish) {
  if (!fish) return;
  uni.setStorageSync('temp_fish_detail', JSON.stringify(fish));
  uni.navigateTo({ url: '/pages/fish-detail/index' });
}
function goHistory() { uni.navigateTo({ url: '/pages/history/index' }); }
function goAchievement() { uni.navigateTo({ url: '/pages/achievement/index' }); }
function goFishDb() { uni.switchTab({ url: '/pages/fishdb/index' }); }
function goFishing() { uni.showToast({ title: '功能开发中', icon: 'none' }); }
</script>

<style lang="scss" scoped>
.home {
  padding: 24rpx;
  background: #F6F6F6;
  min-height: 100vh;
}

/* === Y2K Card === */
.card {
  background: #EEEEEE;
  border: 3px solid #222222;
  border-radius: 0;
  box-shadow: 4px 4px 0 #222222;
  padding: 24rpx;
  margin-bottom: 32rpx;
  transition: transform 100ms, box-shadow 100ms;

  &--press {
    box-shadow: none;
    transform: translate(4px, 4px);
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }

  &__tag {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-weight: 900;
    font-size: 24rpx;
    padding: 6rpx 20rpx;
    border: 2px solid #222222;
    border-radius: 0;

    &--green { background: #B4EF4E; color: #222222; }
    &--orange { background: #FF590E; color: #FFFFFF; }
  }

  &__sub {
    font-size: 22rpx;
    color: #A9A9A9;
    font-weight: 700;
  }
}

/* Daily fish */
.daily {
  &__info { display: flex; flex-direction: column; gap: 6rpx; }

  &__name {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-size: 40rpx;
    font-weight: 900;
    color: #222222;
  }

  &__latin {
    font-size: 22rpx;
    color: #A9A9A9;
    font-style: italic;
  }

  &__tip {
    font-size: 24rpx;
    color: #222222;
    margin-top: 8rpx;
    line-height: 1.5;
  }
}

/* Quest */
.quest {
  &__label {
    font-size: 26rpx;
    color: #222222;
    font-weight: 700;
    display: block;
  }

  &__bar {
    height: 20rpx;
    background: #D8D8D8;
    border: 2px solid #222222;
    margin-top: 16rpx;
  }

  &__fill {
    height: 100%;
    background: #B4EF4E;
    transition: width 300ms;
  }

  &__count {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-size: 28rpx;
    font-weight: 900;
    color: #222222;
    margin-top: 8rpx;
    display: block;
    text-align: right;
  }
}

/* Season scroll */
.season-scroll {
  white-space: nowrap;
  margin: 0 -24rpx;
  padding: 0 24rpx;
}

.season-list {
  display: inline-flex;
  gap: 16rpx;
}

.season-item {
  width: 240rpx;
  flex-shrink: 0;
  display: inline-block;
}

/* Shortcuts */
.shortcuts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.shortcut {
  background: #EEEEEE;
  border: 3px solid #222222;
  box-shadow: 4px 4px 0 #222222;
  padding: 28rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  transition: transform 100ms, box-shadow 100ms;

  &--press {
    box-shadow: none;
    transform: translate(4px, 4px);
  }

  &__icon {
    width: 40rpx;
    height: 40rpx;
  }

  &__text {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-size: 22rpx;
    font-weight: 900;
    color: #222222;
    letter-spacing: 1rpx;
  }
}
</style>
