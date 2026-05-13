<template>
  <view class="collection">
    <CustomNav title="图鉴 ★" tab />

    <LoginGuide v-if="!loggedIn" title="登录查看图鉴" desc="登录后可收藏鱼种、查看收集进度" @loggedIn="onLoggedIn" />

    <template v-else>
    <view class="stats-header">
      <text class="stats-header__text">已收集 <text class="stats-header__num">{{ collectedList.length }}</text>/30</text>
    </view>

    <view class="grid">
      <view
        v-for="(item, idx) in displayList"
        :key="idx"
        class="grid__item"
        :class="{ 'grid__item--locked': !item.collected }"
        @tap="item.collected && goDetail(item)"
      >
        <image v-if="item.image_url && item.collected" :src="getImgUrl(item.image_url)" class="grid__img" mode="aspectFill" />
        <view v-else class="grid__placeholder">
          <text class="grid__placeholder-text">?</text>
        </view>
        <text class="grid__name">{{ item.collected ? item.fish_name : '???' }}</text>
      </view>
    </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { request } from '../../utils/api';
import { getOpenid, isLoggedIn } from '../../utils/auth';
import LoginGuide from '../../components/LoginGuide.vue';
import CustomNav from '../../components/CustomNav.vue';

const loggedIn = ref(false);

const collectedList = ref([]);
const displayList = ref([]);
const seasonalData = ref([]);

onShow(() => {
  loggedIn.value = isLoggedIn();
  loadCollection();
});

function onLoggedIn() {
  loggedIn.value = true;
  loadCollection();
}

onPullDownRefresh(async () => {
  try {
    seasonalData.value = [];
    await loadCollection();
  } finally {
    uni.stopPullDownRefresh();
  }
});

async function loadCollection() {
  if (!isLoggedIn()) {
    displayList.value = Array.from({ length: 30 }, () => ({ collected: false, fish_name: '', image_url: '' }));
    return;
  }

  // 加载 seasonal 数据用于匹配完整鱼种信息
  if (seasonalData.value.length === 0) {
    try {
      const sRes = await request({ url: '/seasonal' });
      seasonalData.value = sRes.data.recommendations || [];
    } catch (e) {}
  }

  try {
    const res = await request({
      url: '/collection/list',
      data: { openid: getOpenid() }
    });
    const list = res.data || [];
    collectedList.value = list;
    const display = list.map(item => ({ ...item, collected: true }));
    while (display.length < 30) {
      display.push({ collected: false, fish_name: '', image_url: '' });
    }
    displayList.value = display;
    uni.setStorageSync('collection_count', String(list.length));
  } catch (e) {
    console.log('load collection error', e);
  }
}

import { IMG_BASE } from '../../utils/config';

function getImgUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return IMG_BASE + url;
}

function goDetail(item) {
  // 尝试匹配 seasonal 完整数据
  const match = seasonalData.value.find(f => f.name_zh === item.fish_name);
  if (match) {
    uni.setStorageSync('temp_fish_detail', JSON.stringify(match));
  } else {
    // 无法匹配时构造基本数据
    uni.setStorageSync('temp_fish_detail', JSON.stringify({
      name_zh: item.fish_name,
      image_url: item.image_url || '',
      description: item.description || '',
      structured: item.structured ? (typeof item.structured === 'string' ? JSON.parse(item.structured) : item.structured) : null
    }));
  }
  uni.navigateTo({ url: '/pages/fish-detail/index' });
}
</script>

<style lang="scss" scoped>
.collection {
  padding: 24rpx;
  background: #F6F6F6;
  min-height: 100vh;
}

.stats-header {
  margin-bottom: 24rpx;

  &__text {
    font-size: 28rpx;
    color: #A9A9A9;
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-weight: 900;
  }

  &__num {
    color: #FF590E;
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-weight: 900;
  }
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16rpx;

  &__item {
    background: #EEEEEE;
    border: 3px solid #222222;
    border-radius: 0;
    overflow: hidden;
    text-align: center;
    padding-bottom: 12rpx;
    box-shadow: 4px 4px 0 #222222;
    transition: box-shadow 150ms, transform 150ms;

    &:active {
      box-shadow: none;
      transform: translate(4px, 4px);
    }

    &--locked {
      opacity: 0.5;
      filter: grayscale(0.8);
    }
  }

  &__img {
    width: 100%;
    height: 160rpx;
  }

  &__placeholder {
    width: 100%;
    height: 160rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #D8D8D8;
  }

  &__placeholder-text {
    font-size: 48rpx;
    color: #A9A9A9;
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-weight: 900;
  }

  &__name {
    font-size: 24rpx;
    color: #222222;
    margin-top: 8rpx;
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-weight: 900;
  }
}
</style>
