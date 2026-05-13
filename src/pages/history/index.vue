<template>
  <view class="history">
    <CustomNav title="识别历史" />
    <LoginGuide v-if="!loggedIn" title="登录查看历史" desc="登录后可查看识别记录" @loggedIn="onLoggedIn" />

    <template v-else>
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
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CustomNav from '../../components/CustomNav.vue';
import { request } from '../../utils/api';
import { getOpenid, isLoggedIn } from '../../utils/auth';
import { setTemp } from '../../utils/storage';
import LoginGuide from '../../components/LoginGuide.vue';

const loggedIn = ref(isLoggedIn());

function onLoggedIn() {
  loggedIn.value = true;
  loadList();
}

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
  background: #F6F6F6;
  min-height: 100vh;

  &__item {
    display: flex;
    gap: 16rpx;
    padding: 20rpx;
    background: #EEEEEE;
    border: 3px solid #222222;
    border-radius: 0;
    margin-bottom: 16rpx;
    box-shadow: 4px 4px 0 #222222;
    transition: box-shadow 150ms, transform 150ms;

    &--active {
      box-shadow: none;
      transform: translate(4px, 4px);
    }
  }

  &__img {
    width: 100rpx;
    height: 100rpx;
    border-radius: 0;
    flex-shrink: 0;
    border: 3px solid #222222;
  }

  &__img-placeholder {
    width: 100rpx;
    height: 100rpx;
    border-radius: 0;
    background: #D8D8D8;
    flex-shrink: 0;
    border: 3px solid #222222;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &__name {
    font-size: 28rpx;
    font-weight: 900;
    color: #222222;
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
  }

  &__date {
    font-size: 24rpx;
    color: #A9A9A9;
    margin-top: 4rpx;
  }
}

.empty {
  text-align: center;
  padding: 120rpx 0;

  &__text {
    color: #A9A9A9;
    font-size: 28rpx;
  }
}

.load-more {
  text-align: center;
  padding: 24rpx;

  &__text {
    color: #00CFFF;
    font-size: 26rpx;
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-weight: 900;
  }
}
</style>
