<template>
  <view class="contributions">
    <view v-for="item in list" :key="item.id" class="contrib-item" hover-class="contrib-item--active" @tap="goDetail(item)">
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
import { request } from '../../utils/api';
import { getOpenid, isLoggedIn } from '../../utils/auth';

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
}

.contrib-item {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 4rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  transition: opacity 150ms;

  &--active { opacity: 0.7; }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__name {
    font-size: 30rpx;
    font-weight: bold;
    color: #1E293B;
  }

  &__status {
    font-size: 22rpx;
    padding: 6rpx 16rpx;
    border-radius: 4rpx;
    font-weight: 600;
  }

  &__meta {
    margin-top: 8rpx;
    display: flex;
    gap: 16rpx;
  }

  &__date {
    font-size: 22rpx;
    color: #64748B;
  }
}

.status--pending { background: #FEFCE8; color: #CA8A04; }
.status--approved { background: #F0FDF4; color: #16A34A; }
.status--rejected { background: #FEF2F2; color: #DC2626; }

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;

  &__icon { width: 80rpx; height: 80rpx; opacity: 0.3; margin-bottom: 16rpx; }
  &__text { font-size: 28rpx; color: #64748B; }
  &__sub { font-size: 24rpx; color: #94A3B8; margin-top: 8rpx; }
}
</style>
