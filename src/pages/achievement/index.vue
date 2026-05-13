<template>
  <view class="achievement">
    <LoginGuide v-if="!loggedIn" title="登录查看成就" desc="登录后可解锁勋章和查看成就" @loggedIn="onLoggedIn" />

    <view v-else class="grid">
      <view
        v-for="badge in allBadges"
        :key="badge.badge_id"
        class="badge-wrap"
        :class="{ 'badge-wrap--locked': !badge.unlocked }"
        @tap="showDetail(badge)"
      >
        <view class="badge-wrap__icon-box">
          <image v-if="badge.image_url" :src="badge.image_url" class="badge-wrap__icon" mode="aspectFit" />
          <image v-else class="badge-wrap__icon" src="/static/icons/muted/trophy.svg" mode="aspectFit" />
          <view v-if="!badge.unlocked" class="badge-wrap__lock">
            <image class="badge-wrap__lock-icon" src="/static/icons/white/lock.svg" mode="aspectFit" />
          </view>
        </view>
        <text class="badge-wrap__name">{{ badge.name }}</text>
        <text v-if="badge.unlocked" class="badge-wrap__date">{{ formatDate(badge.unlocked_at) }}</text>
        <text v-else class="badge-wrap__condition">收集{{ badge.threshold }}种</text>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <view v-if="showModal" class="modal-mask" @tap="showModal = false">
      <view class="modal" @tap.stop>
        <view class="modal__header">
          <image v-if="currentBadge.image_url" :src="currentBadge.image_url" class="modal__icon" mode="aspectFit" />
          <image v-else class="modal__icon" src="/static/icons/primary/trophy.svg" mode="aspectFit" />
        </view>
        <text class="modal__name">{{ currentBadge.name }}</text>
        <view class="modal__info">
          <view class="modal__row">
            <text class="modal__label">获取条件</text>
            <text class="modal__value">收集{{ currentBadge.threshold }}种不同的鱼</text>
          </view>
          <view class="modal__row">
            <text class="modal__label">状态</text>
            <text class="modal__value" :class="currentBadge.unlocked ? 'modal__value--success' : 'modal__value--locked'">
              {{ currentBadge.unlocked ? '已解锁' : '未解锁' }}
            </text>
          </view>
          <view v-if="currentBadge.unlocked" class="modal__row">
            <text class="modal__label">获取时间</text>
            <text class="modal__value">{{ formatDate(currentBadge.unlocked_at) }}</text>
          </view>
          <view v-if="!currentBadge.unlocked" class="modal__row">
            <text class="modal__label">当前进度</text>
            <text class="modal__value">{{ collectionCount }}/{{ currentBadge.threshold }}</text>
          </view>
        </view>
        <view class="modal__close" @tap="showModal = false">
          <text class="modal__close-text">关闭</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '../../utils/api';
import { getOpenid, isLoggedIn } from '../../utils/auth';
import LoginGuide from '../../components/LoginGuide.vue';

const loggedIn = ref(isLoggedIn());

function onLoggedIn() {
  loggedIn.value = true;
  loadBadges();
}

const BADGE_LIST = [
  { badge_id: 'first', name: '初识', threshold: 1 },
  { badge_id: 'five', name: '入门', threshold: 5 },
  { badge_id: 'ten', name: '钓友', threshold: 10 },
  { badge_id: 'twenty', name: '探索者', threshold: 20 },
  { badge_id: 'thirty', name: '达人', threshold: 30 },
  { badge_id: 'fifty', name: '大师', threshold: 50 },
  { badge_id: 'hundred', name: '百鱼斋主', threshold: 100 },
  { badge_id: 'legendary', name: '渔光传说', threshold: 200 }
];

const allBadges = ref([]);
const showModal = ref(false);
const currentBadge = ref({});
const collectionCount = ref(0);

onMounted(() => {
  loadBadges();
});

async function loadBadges() {
  let unlockedMap = {};

  if (isLoggedIn()) {
    try {
      const res = await request({
        url: '/achievements',
        data: { openid: getOpenid() }
      });
      (res.data || []).forEach(a => { unlockedMap[a.badge_id] = a.unlocked_at; });
    } catch (e) {}

    try {
      const stats = await request({ url: '/user/stats', data: { openid: getOpenid() } });
      collectionCount.value = stats.data.collection_count || 0;
    } catch (e) {}
  }

  let badgeUrls = {};
  try {
    const res = await request({ url: '/badges' });
    badgeUrls = res.data || {};
  } catch (e) {}

  allBadges.value = BADGE_LIST.map(b => ({
    ...b,
    unlocked: !!unlockedMap[b.badge_id],
    unlocked_at: unlockedMap[b.badge_id] || '',
    image_url: badgeUrls[b.badge_id] || ''
  }));
}

function showDetail(badge) {
  currentBadge.value = badge;
  showModal.value = true;
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(String(ts).replace(' ', 'T'));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
</script>

<style lang="scss" scoped>
.achievement {
  padding: 24rpx;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.badge-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 4rpx;
  padding: 24rpx 16rpx;
  transition: opacity 150ms;

  &:active {
    opacity: 0.7;
  }

  &--locked {
    .badge-wrap__icon-box {
      filter: grayscale(1);
      opacity: 0.4;
    }
    .badge-wrap__name {
      color: #94A3B8;
    }
  }

  &__icon-box {
    position: relative;
    width: 120rpx;
    height: 120rpx;
  }

  &__icon {
    width: 100%;
    height: 100%;
  }

  &__lock {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 36rpx;
    height: 36rpx;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__lock-icon {
    width: 20rpx;
    height: 20rpx;
  }

  &__name {
    margin-top: 12rpx;
    font-size: 26rpx;
    font-weight: bold;
    color: #1E293B;
  }

  &__date {
    font-size: 20rpx;
    color: #16A34A;
    margin-top: 4rpx;
  }

  &__condition {
    font-size: 20rpx;
    color: #94A3B8;
    margin-top: 4rpx;
  }
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 560rpx;
  background: #FFFFFF;
  border-radius: 4rpx;
  padding: 48rpx 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__header {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 16rpx;
  }

  &__icon {
    width: 100%;
    height: 100%;
  }

  &__name {
    font-size: 32rpx;
    font-weight: bold;
    color: #1E293B;
    margin-bottom: 24rpx;
  }

  &__info {
    width: 100%;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    padding: 16rpx 0;
    border-bottom: 1px solid #F1F5F9;
  }

  &__label {
    font-size: 26rpx;
    color: #64748B;
  }

  &__value {
    font-size: 26rpx;
    color: #1E293B;

    &--success {
      color: #16A34A;
    }
    &--locked {
      color: #94A3B8;
    }
  }

  &__close {
    margin-top: 32rpx;
    padding: 16rpx 48rpx;
    background: #F1F5F9;
    border-radius: 4rpx;
  }

  &__close-text {
    font-size: 26rpx;
    color: #64748B;
  }
}
</style>
