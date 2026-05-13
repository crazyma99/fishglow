<template>
  <view class="fishdb">
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
}

.search-bar {
  margin-bottom: 16rpx;

  &__input {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 4rpx;
    padding: 16rpx 24rpx;
    font-size: 28rpx;
  }
}

.tabs {
  margin-bottom: 24rpx;
  white-space: nowrap;

  &__list {
    display: inline-flex;
    gap: 16rpx;
  }

  &__item {
    padding: 12rpx 24rpx;
    font-size: 26rpx;
    color: #64748B;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 4rpx;
    display: inline-block;

    &--active {
      color: #EA580C;
      background: #FFF7ED;
      border-color: #EA580C;
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
    color: #94A3B8;
    font-size: 28rpx;
  }
}
</style>
