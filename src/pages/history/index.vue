<template>
  <view class="history">
    <view v-for="item in list" :key="item.id || item.timestamp" class="history__item" hover-class="history__item--active" @tap="goResult(item)">
      <image v-if="item.photo_path || item.image_url" :src="getImgUrl(item.photo_path || item.image_url)" class="history__img" mode="aspectFill" />
      <view v-else class="history__img-placeholder"></view>
      <view class="history__info">
        <text class="history__name">{{ item.fish_name || '未知鱼种' }}</text>
        <text class="history__date">{{ formatDate(item.created_at || item.timestamp) }}</text>
      </view>
    </view>

    <view v-if="list.length === 0 && !loading" class="empty">
      <text class="empty__text">暂无识别记录</text>
    </view>

    <view v-if="hasMore" class="load-more" @tap="loadMore">
      <text class="load-more__text">加载更多</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '../../utils/api';
import { getOpenid, isLoggedIn } from '../../utils/auth';
import { setTemp } from '../../utils/storage';

import { IMG_BASE } from '../../utils/config';
function getImgUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return IMG_BASE + url;
}

const list = ref([]);
const offset = ref(0);
const PAGE_SIZE = 20;
const hasMore = ref(false);
const loading = ref(false);

onMounted(() => {
  loadList();
});

async function loadList() {
  if (!isLoggedIn()) { loading.value = false; return; }
  loading.value = true;
  try {
    const res = await request({
      url: '/history/list',
      data: { openid: getOpenid(), limit: PAGE_SIZE, offset: offset.value }
    });
    const items = res.data || [];
    list.value = [...list.value, ...items];
    hasMore.value = items.length === PAGE_SIZE;
  } catch (e) {
    console.log('load history error', e);
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  offset.value += PAGE_SIZE;
  loadList();
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(typeof ts === 'number' ? ts : String(ts).replace(' ', 'T'));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function goResult(item) {
  const resultData = {
    imagePath: item.image_url || '',
    results: item.results || [{ name: item.fish_name, score: item.score || '1.0', baike_info: { image_url: item.image_url, baike_url: item.baike_url, description: item.description }, structured: item.structured ? (typeof item.structured === 'string' ? JSON.parse(item.structured) : item.structured) : null }],
    timestamp: item.timestamp
  };
  setTemp('temp_result', resultData);
  uni.navigateTo({ url: '/pages/result/index' });
}
</script>

<style lang="scss" scoped>
.history {
  padding: 24rpx;

  &__item {
    display: flex;
    gap: 16rpx;
    padding: 20rpx;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 4rpx;
    margin-bottom: 16rpx;
    transition: opacity 150ms;

    &--active {
      opacity: 0.7;
    }
  }

  &__img {
    width: 100rpx;
    height: 100rpx;
    border-radius: 4rpx;
    flex-shrink: 0;
  }

  &__img-placeholder {
    width: 100rpx;
    height: 100rpx;
    border-radius: 4rpx;
    background: #F1F5F9;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &__name {
    font-size: 28rpx;
    font-weight: bold;
    color: #1E293B;
  }

  &__date {
    font-size: 24rpx;
    color: #64748B;
    margin-top: 4rpx;
  }
}

.empty {
  text-align: center;
  padding: 120rpx 0;

  &__text {
    color: #94A3B8;
    font-size: 28rpx;
  }
}

.load-more {
  text-align: center;
  padding: 24rpx;

  &__text {
    color: #0EA5E9;
    font-size: 26rpx;
  }
}
</style>
