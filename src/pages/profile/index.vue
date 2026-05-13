<template>
  <view class="profile">
    <!-- 未登录状态 -->
    <view v-if="!loggedIn" class="login-card" hover-class="login-card--active" @tap="handleLogin">
      <view class="login-card__icon-wrap">
        <image class="login-card__icon" src="/static/icons/primary/star.svg" mode="aspectFit" />
      </view>
      <view class="login-card__info">
        <text class="login-card__title">点击登录</text>
        <text class="login-card__desc">登录后可收藏图鉴、查看历史记录</text>
      </view>
    </view>

    <!-- 已登录状态 -->
    <view v-else class="user-card">
      <image class="user-card__avatar" :src="avatar || ''" mode="aspectFill" />
      <view class="user-card__info">
        <text class="user-card__name">{{ nickname }}</text>
        <text class="user-card__id">渔光用户</text>
      </view>
    </view>

    <!-- Stats (仅登录后显示) -->
    <view v-if="loggedIn" class="stats">
      <view class="stats__item">
        <text class="stats__num">{{ collectionCount }}</text>
        <text class="stats__label">图鉴数</text>
      </view>
      <view class="stats__divider"></view>
      <view class="stats__item">
        <text class="stats__num">{{ identifyCount }}</text>
        <text class="stats__label">识别次数</text>
      </view>
    </view>

    <!-- Recent badges -->
    <view class="card" v-if="loggedIn && recentBadges.length > 0">
      <text class="card__title">最近成就</text>
      <view class="badges-row">
        <BadgeItem v-for="b in recentBadges" :key="b.name" :badge="b" :unlocked="true" />
      </view>
    </view>

    <!-- Menu -->
    <view class="menu">
      <view class="menu__item" hover-class="menu__item--active" @tap="goHistory">
        <text class="menu__text">识别历史</text>
        <text class="menu__arrow">›</text>
      </view>
      <view class="menu__item" hover-class="menu__item--active" @tap="goAchievement">
        <text class="menu__text">我的成就</text>
        <text class="menu__arrow">›</text>
      </view>
      <view v-if="loggedIn" class="menu__item" hover-class="menu__item--active" @tap="goContributions">
        <text class="menu__text">我的贡献</text>
        <text class="menu__arrow">›</text>
      </view>
      <view class="menu__item" hover-class="menu__item--active" @tap="goSettings">
        <text class="menu__text">设置</text>
        <text class="menu__arrow">›</text>
      </view>
      <view v-if="loggedIn" class="menu__item menu__item--danger" hover-class="menu__item--active" @tap="handleLogout">
        <text class="menu__text menu__text--danger">退出登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import BadgeItem from '../../components/BadgeItem.vue';
import { isLoggedIn, ensureLogin, logout as authLogout, getOpenid } from '../../utils/auth';
import { request } from '../../utils/api';

const loggedIn = ref(false);
const avatar = ref('');
const nickname = ref('');
const collectionCount = ref(0);
const identifyCount = ref(0);
const recentBadges = ref([]);

onShow(() => {
  checkLoginState();
});

function checkLoginState() {
  loggedIn.value = isLoggedIn();
  if (loggedIn.value) {
    loadProfile();
  }
}

async function loadProfile() {
  const openid = getOpenid();
  nickname.value = uni.getStorageSync('user_nickname') || '渔友';
  avatar.value = uni.getStorageSync('user_avatar') || '';

  try {
    const res = await request({ url: '/user/stats', data: { openid } });
    collectionCount.value = res.data.collection_count || 0;
    identifyCount.value = res.data.history_count || 0;
  } catch (e) {}
}

async function handleLogin() {
  const openid = await ensureLogin();
  if (openid) {
    loggedIn.value = true;
    loadProfile();
  }
}

function goHistory() {
  uni.navigateTo({ url: '/pages/history/index' });
}

function goAchievement() {
  uni.navigateTo({ url: '/pages/achievement/index' });
}

function goContributions() {
  uni.navigateTo({ url: '/pages/contributions/index' });
}

function goSettings() {
  uni.showToast({ title: '设置页面开发中', icon: 'none' });
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success(res) {
      if (res.confirm) {
        authLogout();
        loggedIn.value = false;
        nickname.value = '';
        avatar.value = '';
        collectionCount.value = 0;
        identifyCount.value = 0;
        recentBadges.value = [];
        uni.showToast({ title: '已退出', icon: 'success' });
      }
    }
  });
}
</script>

<style lang="scss" scoped>
.profile {
  padding: 24rpx;
}

.login-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 4rpx;
  padding: 40rpx 24rpx;
  margin-bottom: 24rpx;
  transition: opacity 150ms;

  &--active {
    opacity: 0.7;
  }

  &__icon-wrap {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: #FFF7ED;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    width: 40rpx;
    height: 40rpx;
  }

  &__info {
    flex: 1;
  }

  &__title {
    font-size: 32rpx;
    font-weight: bold;
    color: #EA580C;
  }

  &__desc {
    font-size: 24rpx;
    color: #64748B;
    margin-top: 4rpx;
  }
}

.user-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 4rpx;
  padding: 32rpx 24rpx;
  margin-bottom: 24rpx;

  &__avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    background: #F1F5F9;
  }

  &__info {
    flex: 1;
  }

  &__name {
    font-size: 32rpx;
    font-weight: bold;
    color: #1E293B;
  }

  &__id {
    font-size: 24rpx;
    color: #64748B;
    margin-top: 4rpx;
  }
}

.stats {
  display: flex;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 4rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;

  &__item {
    flex: 1;
    text-align: center;
  }

  &__divider {
    width: 1px;
    background: #E2E8F0;
  }

  &__num {
    font-size: 40rpx;
    font-weight: bold;
    color: #EA580C;
    display: block;
  }

  &__label {
    font-size: 24rpx;
    color: #64748B;
    margin-top: 4rpx;
  }
}

.card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 4rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  &__title {
    font-size: 28rpx;
    font-weight: bold;
    color: #1E293B;
    margin-bottom: 16rpx;
    display: block;
  }
}

.badges-row {
  display: flex;
  gap: 16rpx;
}

.menu {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 4rpx;

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28rpx 24rpx;
    border-bottom: 1px solid #F1F5F9;
    transition: opacity 150ms;

    &:last-child {
      border-bottom: none;
    }

    &--active {
      opacity: 0.7;
    }

    &--danger {
      margin-top: 8rpx;
    }
  }

  &__text {
    font-size: 28rpx;
    color: #1E293B;

    &--danger {
      color: #DC2626;
    }
  }

  &__arrow {
    font-size: 32rpx;
    color: #94A3B8;
  }
}
</style>
