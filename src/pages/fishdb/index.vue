<template>
  <view class="fishdb">
    <CustomNav title="FISH WIKI" tab />

    <!-- Search -->
    <view class="search-bar">
      <input class="search-bar__input" placeholder="搜索鱼种..." v-model="keyword" />
    </view>

    <!-- Category tabs -->
    <scroll-view scroll-x class="tabs">
      <view class="tabs__list">
        <view
          v-for="tab in tabs"
          :key="tab"
          class="tabs__item"
          :class="{ 'tabs__item--active': activeTab === tab }"
          @tap="activeTab = tab"
        >
          <text>{{ tab }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Fish list -->
    <view class="fish-list">
      <view v-for="fish in filteredList" :key="fish.name_zh" class="fish-list__item" @tap="goDetail(fish)">
        <FishCard :fish="fish" />
      </view>
    </view>

    <view v-if="filteredList.length === 0" class="empty">
      <text class="empty__text">暂无数据</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { request } from '../../utils/api';
import FishCard from '../../components/FishCard.vue';
import CustomNav from '../../components/CustomNav.vue';

const tabs = ['全部', '台钓', '路亚', '传统钓', '抛竿'];
const activeTab = ref('全部');
const keyword = ref('');
const fishList = ref([]);

onMounted(() => {
  loadFish();
});

onPullDownRefresh(async () => {
  try {
    await loadFish();
  } finally {
    uni.stopPullDownRefresh();
  }
});

async function loadFish() {
  try {
    const res = await request({ url: '/seasonal' });
    fishList.value = res.data.recommendations || [];
  } catch (e) {
    console.log('load fish error', e);
  }
}

const filteredList = computed(() => {
  let list = fishList.value;
  if (activeTab.value !== '全部') {
    list = list.filter(f => (f.fishing_methods || []).includes(activeTab.value));
  }
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase();
    list = list.filter(f => (f.name_zh || '').toLowerCase().includes(kw));
  }
  return list;
});

function goDetail(fish) {
  uni.setStorageSync('temp_fish_detail', JSON.stringify(fish));
  uni.navigateTo({ url: '/pages/fish-detail/index' });
}
</script>

<style lang="scss" scoped>
.fishdb {
  padding: 24rpx;
  background: #F6F6F6;
  min-height: 100vh;
}

.search-bar {
  margin-bottom: 24rpx;
  padding-bottom: 8rpx;

  &__input {
    background: #EEEEEE;
    border: 3px solid #222222;
    border-radius: 0;
    padding: 16rpx 24rpx;
    font-size: 28rpx;
    color: #222222;
    box-shadow: 4px 4px 0 #222222;
  }
}

.tabs {
  margin-bottom: 24rpx;
  white-space: nowrap;
  padding-bottom: 8rpx;

  &__list {
    display: inline-flex;
    gap: 16rpx;
    padding-bottom: 8rpx;
  }

  &__item {
    padding: 12rpx 24rpx;
    font-size: 26rpx;
    color: #A9A9A9;
    background: #EEEEEE;
    border: 3px solid #222222;
    border-radius: 0;
    display: inline-block;
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-weight: 900;
    box-shadow: 4px 4px 0 #222222;
    transition: box-shadow 150ms, transform 150ms;

    &:active {
      box-shadow: none;
      transform: translate(4px, 4px);
    }

    &--active {
      color: #222222;
      background: #B4EF4E;
      border-color: #222222;
    }
  }
}

.fish-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;

  &__item {
    width: 100%;
  }
}

.empty {
  padding: 120rpx 0;
  text-align: center;

  &__text {
    color: #A9A9A9;
    font-size: 28rpx;
  }
}
</style>
