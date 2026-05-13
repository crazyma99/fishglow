<template>
  <view class="contributions">
    <CustomNav title="我的贡献" />
    <LoginGuide v-if="!loggedIn" title="登录查看贡献" desc="登录后可查看你提交的鱼种数据" @loggedIn="onLoggedIn" />

    <view v-for="item in list" v-if="loggedIn" :key="item.id" class="contrib-item" hover-class="contrib-item--active" @tap="goDetail(item)">
      <view class="contrib-item__header">
        <text class="contrib-item__name">{{ item.fish_name }}</text>
        <text class="contrib-item__status" :class="'status--' + item.status">{{ statusLabel(item.status) }}</text>
      </view>
      <view class="contrib-item__meta">
        <text class="contrib-item__date">{{ formatDate(item.created_at) }}</text>
        <text v-if="item.reviewed_at" class="contrib-item__date">审核于 {{ formatDate(item.reviewed_at) }}</text>
      </view>
    </view>

    <view v-if="list.length === 0 && !loading" class="empty">
      <image class="empty__icon" src="/static/icons/muted/star.svg" mode="aspectFit" />
      <text class="empty__text">暂无贡献记录</text>
      <text class="empty__sub">识别新鱼种时可以贡献数据</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CustomNav from '../../components/CustomNav.vue';
import { request } from '../../utils/api';
import { getOpenid, isLoggedIn } from '../../utils/auth';
import LoginGuide from '../../components/LoginGuide.vue';

const loggedIn = ref(isLoggedIn());

function onLoggedIn() {
  loggedIn.value = true;
  loadList();
}

const list = ref([]);
const loading = ref(true);

onMounted(() => { loadList(); });

async function loadList() {
  if (!isLoggedIn()) { loading.value = false; return; }
  try {
    const res = await request({ url: '/contribute/my', data: { openid: getOpenid() } });
    list.value = res.data || [];
  } catch (e) {
    console.log('load contributions error', e);
  } finally {
    loading.value = false;
  }
}

function statusLabel(status) {
  return { pending: '审核中', approved: '已通过', rejected: '已拒绝' }[status] || status;
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(String(ts).replace(' ', 'T'));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function goDetail(item) {
  uni.setStorageSync('temp_contribution', JSON.stringify(item));
  uni.navigateTo({ url: '/pages/contribution-detail/index' });
}
</script>

<style lang="scss" scoped>
.contributions {
  padding: 24rpx;
  background: #F6F6F6;
  min-height: 100vh;
}

.contrib-item {
  background: #EEEEEE;
  border: 3px solid #222222;
  border-radius: 0;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 4px 4px 0 #222222;
  transition: box-shadow 150ms, transform 150ms;

  &--active {
    box-shadow: none;
    transform: translate(4px, 4px);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__name {
    font-size: 30rpx;
    font-weight: 900;
    color: #222222;
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
  }

  &__status {
    font-size: 22rpx;
    padding: 6rpx 16rpx;
    border-radius: 0;
    font-weight: 900;
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    border: 2px solid #222222;
  }

  &__meta {
    margin-top: 8rpx;
    display: flex;
    gap: 16rpx;
  }

  &__date {
    font-size: 22rpx;
    color: #A9A9A9;
  }
}

.status--pending { background: #FF590E; color: #FFFFFF; border: 2px solid #222222; border-radius: 0; }
.status--approved { background: #B4EF4E; color: #222222; border: 2px solid #222222; border-radius: 0; }
.status--rejected { background: #D8D8D8; color: #222222; border: 2px solid #222222; border-radius: 0; }

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;

  &__icon { width: 80rpx; height: 80rpx; opacity: 0.3; margin-bottom: 16rpx; }
  &__text { font-size: 28rpx; color: #A9A9A9; }
  &__sub { font-size: 24rpx; color: #A9A9A9; margin-top: 8rpx; }
}
</style>
