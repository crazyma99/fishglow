<template>
  <view class="achievement">
    <CustomNav title="BADGES ★" />
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
import CustomNav from '../../components/CustomNav.vue';
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

// 勋章图片 URL 缓存（固定资源，只请求一次）
let badgeUrlsCache = null;

onMounted(() => {
  loadBadges();
});

async function loadBadges() {
  let unlockedMap = {};

  // 并行请求：badges 只请求一次，后续复用缓存
  const promises = [];

  if (!badgeUrlsCache) {
    promises.push(
      request({ url: '/badges' }).then(res => { badgeUrlsCache = res.data || {}; }).catch(() => { badgeUrlsCache = {}; })
    );
  }

  if (isLoggedIn()) {
    promises.push(
      request({ url: '/achievements', data: { openid: getOpenid() } })
        .then(res => { (res.data || []).forEach(a => { unlockedMap[a.badge_id] = a.unlocked_at; }); })
        .catch(() => {}),
      request({ url: '/user/stats', data: { openid: getOpenid() } })
        .then(res => { collectionCount.value = res.data.collection_count || 0; })
        .catch(() => {})
    );
  }

  await Promise.all(promises);

  allBadges.value = BADGE_LIST.map(b => ({
    ...b,
    unlocked: !!unlockedMap[b.badge_id],
    unlocked_at: unlockedMap[b.badge_id] || '',
    image_url: (badgeUrlsCache || {})[b.badge_id] || ''
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
  background: #F6F6F6;
  min-height: 100vh;
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
  background: #EEEEEE;
  border: 3px solid #222222;
  border-radius: 0;
  box-shadow: 4px 4px 0 #222222;
  padding: 24rpx 16rpx;
  transition: box-shadow 150ms, transform 150ms;

  &:active {
    box-shadow: none;
    transform: translate(4px, 4px);
  }

  &--locked {
    .badge-wrap__icon-box {
      filter: grayscale(1);
      opacity: 0.4;
    }
    .badge-wrap__name {
      color: #A9A9A9;
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
    color: #222222;
  }

  &__date {
    font-size: 20rpx;
    color: #B4EF4E;
    margin-top: 4rpx;
  }

  &__condition {
    font-size: 20rpx;
    color: #A9A9A9;
    margin-top: 4rpx;
  }
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 560rpx;
  background: #F6F6F6;
  border: 3px solid #222222;
  border-radius: 0;
  box-shadow: 8px 8px 0 #222222;
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
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-weight: 900;
    font-size: 32rpx;
    color: #222222;
    margin-bottom: 24rpx;
  }

  &__info {
    width: 100%;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    padding: 16rpx 0;
    border-bottom: 3px solid #D8D8D8;
  }

  &__label {
    font-size: 26rpx;
    color: #A9A9A9;
  }

  &__value {
    font-size: 26rpx;
    color: #222222;

    &--success {
      color: #B4EF4E;
    }
    &--locked {
      color: #A9A9A9;
    }
  }

  &__close {
    margin-top: 32rpx;
    padding: 16rpx 48rpx;
    background: #D8D8D8;
    border: 3px solid #222222;
    border-radius: 0;
    box-shadow: 4px 4px 0 #222222;
    transition: box-shadow 150ms, transform 150ms;

    &:active {
      box-shadow: none;
      transform: translate(4px, 4px);
    }
  }

  &__close-text {
    font-size: 26rpx;
    color: #222222;
  }
}
</style>
