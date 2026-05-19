<template>
  <view class="profile">
    <CustomNav title="我的" tab />

    <!-- 未登录状态 -->
    <view v-if="!loggedIn" class="login-card" hover-class="login-card--active" @tap="handleLogin">
      <view class="login-card__icon-wrap">
        <image class="login-card__icon" src="/static/icons/primary/star.svg" mode="aspectFit" />
      </view>
      <view class="login-card__info">
        <text class="login-card__title">★ LOGIN ★</text>
        <text class="login-card__desc">登录后可收藏图鉴、查看历史记录</text>
      </view>
    </view>

    <!-- 已登录状态 -->
    <view v-else class="user-card">
      <view class="user-card__avatar-wrap" hover-class="user-card__avatar-wrap--press" @tap="changeAvatar">
        <image class="user-card__avatar" :src="avatar || ''" mode="aspectFill" />
        <text class="user-card__avatar-edit">换</text>
      </view>
      <view class="user-card__info">
        <view class="user-card__name-row" hover-class="user-card__name-row--press" @tap="changeNickname">
          <text class="user-card__name">{{ nickname }}</text>
          <text class="user-card__name-edit">✎</text>
        </view>
        <text class="user-card__id">渔光用户</text>
        <!-- 手机号绑定状态 -->
        <view class="user-card__phone" v-if="phoneBound">
          <text class="user-card__phone-text">{{ phoneDisplay }}</text>
        </view>
        <view v-else class="user-card__bind" hover-class="user-card__bind--press" @tap="showBindPhone">
          <text class="user-card__bind-text">绑定手机号</text>
        </view>
      </view>
    </view>

    <!-- 绑定手机号弹窗 -->
    <view v-if="showPhoneModal" class="phone-modal" @tap="showPhoneModal = false">
      <view class="phone-modal__panel" @tap.stop>
        <text class="phone-modal__title">绑定手机号</text>
        <text class="phone-modal__desc">绑定后可在 APP 端同步数据</text>
        <input class="phone-modal__input" v-model="phoneInput" type="number" maxlength="11" placeholder="输入手机号" />
        <view class="phone-modal__code-row">
          <input class="phone-modal__input phone-modal__input--code" v-model="codeInput" type="number" maxlength="6" placeholder="验证码" />
          <view class="phone-modal__send" :class="{ 'phone-modal__send--disabled': countdown > 0 }" hover-class="phone-modal__send--press" @tap="sendCode">
            <text class="phone-modal__send-text">{{ countdown > 0 ? countdown + 's' : '获取验证码' }}</text>
          </view>
        </view>
        <view class="phone-modal__submit" hover-class="phone-modal__submit--press" @tap="bindPhone">
          <text class="phone-modal__submit-text">确认绑定</text>
        </view>
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
import { API_BASE, IMG_BASE } from '../../utils/config';
import CustomNav from '../../components/CustomNav.vue';

const loggedIn = ref(false);
const avatar = ref('');
const nickname = ref('');
const collectionCount = ref(0);
const identifyCount = ref(0);
const recentBadges = ref([]);

// 手机号绑定
const phoneBound = ref(false);
const phoneDisplay = ref('');
const showPhoneModal = ref(false);
const phoneInput = ref('');
const codeInput = ref('');
const countdown = ref(0);
let countdownTimer = null;

onShow(() => {
  checkLoginState();
});

function checkLoginState() {
  loggedIn.value = isLoggedIn();
  if (loggedIn.value) {
    loadProfile();
    loadPhoneStatus();
  }
}

async function loadProfile() {
  const openid = getOpenid();

  try {
    const [userRes, statsRes] = await Promise.all([
      request({ url: '/user', data: { openid } }),
      request({ url: '/user/stats', data: { openid } })
    ]);
    // 用户信息
    if (userRes.data) {
      nickname.value = userRes.data.nickname || '渔友';
      avatar.value = userRes.data.avatar_url || '';
      uni.setStorageSync('user_nickname', nickname.value);
      uni.setStorageSync('user_avatar', avatar.value);
    }
    // 统计
    collectionCount.value = statsRes.data.collection_count || 0;
    identifyCount.value = statsRes.data.history_count || 0;
  } catch (e) {
    nickname.value = uni.getStorageSync('user_nickname') || '渔友';
    avatar.value = uni.getStorageSync('user_avatar') || '';
  }
}

async function handleLogin() {
  const openid = await ensureLogin();
  if (openid) {
    loggedIn.value = true;
    loadProfile();
  }
}

// 手机号相关
async function loadPhoneStatus() {
  try {
    const res = await request({ url: '/phone/status', data: { openid: getOpenid() } });
    phoneBound.value = res.data.bound;
    phoneDisplay.value = res.data.phone;
  } catch (e) {}
}

function showBindPhone() {
  phoneInput.value = '';
  codeInput.value = '';
  showPhoneModal.value = true;
}

async function sendCode() {
  if (countdown.value > 0) return;
  if (!phoneInput.value || !/^1\d{10}$/.test(phoneInput.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return;
  }
  try {
    const res = await request({ url: '/phone/send-code', method: 'POST', data: { phone: phoneInput.value } });
    uni.showToast({ title: '验证码已发送', icon: 'success' });
    // 开发模式自动填入
    if (res.data?.debug_code) codeInput.value = res.data.debug_code;
    // 倒计时
    countdown.value = 60;
    countdownTimer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) clearInterval(countdownTimer);
    }, 1000);
  } catch (e) {
    uni.showToast({ title: e.message || '发送失败', icon: 'none' });
  }
}

async function bindPhone() {
  if (!phoneInput.value || !codeInput.value) {
    uni.showToast({ title: '请填写手机号和验证码', icon: 'none' });
    return;
  }
  try {
    await request({
      url: '/phone/bind',
      method: 'POST',
      data: { openid: getOpenid(), phone: phoneInput.value, code: codeInput.value }
    });
    uni.showToast({ title: '绑定成功', icon: 'success' });
    showPhoneModal.value = false;
    loadPhoneStatus();
  } catch (e) {
    uni.showToast({ title: e.message || '绑定失败', icon: 'none' });
  }
}

function changeAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success(res) {
      const tempPath = res.tempFilePaths[0];
      avatar.value = tempPath;
      // 上传头像到服务器（复用 uploadFile 逻辑）
      uni.uploadFile({
        url: `${API_BASE}/recognize`,  // 复用图片上传接口存储
        filePath: tempPath,
        name: 'file',
        success(uploadRes) {
          const data = JSON.parse(uploadRes.data);
          if (data.code === 0 && data.data.photo_url) {
            const avatarUrl = IMG_BASE + data.data.photo_url;
            avatar.value = avatarUrl;
            uni.setStorageSync('user_avatar', avatarUrl);
            // 同步到服务端用户表
            request({
              url: '/user/update',
              method: 'POST',
              data: { openid: getOpenid(), nickname: nickname.value, avatar_url: avatarUrl }
            }).catch(() => {});
          }
        }
      });
    }
  });
}

function changeNickname() {
  uni.showModal({
    title: '修改昵称',
    editable: true,
    placeholderText: nickname.value || '输入新昵称',
    success(res) {
      if (res.confirm && res.content && res.content.trim()) {
        const newName = res.content.trim();
        nickname.value = newName;
        uni.setStorageSync('user_nickname', newName);
        // 同步到服务端
        request({
          url: '/user/update',
          method: 'POST',
          data: { openid: getOpenid(), nickname: newName, avatar_url: avatar.value || '' }
        }).catch(() => {});
      }
    }
  });
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
        // 清除所有缓存数据
        uni.removeStorageSync('collection_count');
        uni.removeStorageSync('identify_count');
        uni.removeStorageSync('user_nickname');
        uni.removeStorageSync('user_avatar');
        uni.removeStorageSync('user_badges');
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
  background: #F6F6F6;
  min-height: 100vh;
}

.login-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: #B4EF4E;
  border: 3px solid #222222;
  box-shadow: 4px 4px 0 #222222;
  padding: 40rpx 24rpx;
  margin-bottom: 32rpx;
  transition: transform 100ms, box-shadow 100ms;

  &--active {
    box-shadow: none;
    transform: translate(4px, 4px);
  }

  &__icon-wrap {
    width: 80rpx;
    height: 80rpx;
    background: #222222;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #222222;
  }

  &__icon {
    width: 40rpx;
    height: 40rpx;
  }

  &__info {
    flex: 1;
  }

  &__title {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-size: 32rpx;
    font-weight: 900;
    color: #222222;
  }

  &__desc {
    font-size: 24rpx;
    color: #222222;
    opacity: 0.7;
    margin-top: 4rpx;
  }
}

.user-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: #EEEEEE;
  border: 3px solid #222222;
  box-shadow: 4px 4px 0 #222222;
  padding: 32rpx 24rpx;
  margin-bottom: 32rpx;

  &__avatar-wrap {
    position: relative;
    width: 96rpx;
    height: 96rpx;
    flex-shrink: 0;
  }

  &__avatar-wrap--press {
    opacity: 0.7;
  }

  &__avatar {
    width: 96rpx;
    height: 96rpx;
    border: 3px solid #222222;
    background: #D8D8D8;
  }

  &__avatar-edit {
    position: absolute;
    bottom: -4rpx;
    right: -4rpx;
    width: 32rpx;
    height: 32rpx;
    background: #FF590E;
    color: #FFFFFF;
    font-size: 18rpx;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #222222;
  }

  &__info {
    flex: 1;
  }

  &__name-row {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  &__name-row--press {
    opacity: 0.7;
  }

  &__name {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-size: 32rpx;
    font-weight: 900;
    color: #222222;
  }

  &__name-edit {
    font-size: 24rpx;
    color: #A9A9A9;
  }

  &__id {
    font-size: 24rpx;
    color: #A9A9A9;
    display: block;
    margin-top: 4rpx;
    margin-top: 4rpx;
  }
}

.stats {
  display: flex;
  background: #EEEEEE;
  border: 3px solid #222222;
  box-shadow: 4px 4px 0 #222222;
  padding: 32rpx;
  margin-bottom: 32rpx;

  &__item {
    flex: 1;
    text-align: center;
  }

  &__divider {
    width: 3px;
    background: #222222;
  }

  &__num {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-size: 48rpx;
    font-weight: 900;
    color: #FF590E;
    display: block;
  }

  &__label {
    font-size: 22rpx;
    color: #A9A9A9;
    font-weight: 700;
    margin-top: 4rpx;
  }
}

.card {
  background: #EEEEEE;
  border: 3px solid #222222;
  box-shadow: 4px 4px 0 #222222;
  padding: 24rpx;
  margin-bottom: 32rpx;

  &__title {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-size: 24rpx;
    font-weight: 900;
    color: #222222;
    margin-bottom: 16rpx;
    display: block;
  }
}

.badges-row {
  display: flex;
  gap: 16rpx;
}

.menu {
  background: #EEEEEE;
  border: 3px solid #222222;
  box-shadow: 4px 4px 0 #222222;

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28rpx 24rpx;
    border-bottom: 3px solid #D8D8D8;
    transition: transform 100ms, box-shadow 100ms;

    &:last-child {
      border-bottom: none;
    }

    &--active {
      background: #D8D8D8;
    }

    &--danger {
      margin-top: 8rpx;
    }
  }

  &__text {
    font-size: 28rpx;
    font-weight: 700;
    color: #222222;

    &--danger {
      color: #FF590E;
    }
  }

  &__arrow {
    font-size: 32rpx;
    font-weight: 900;
    color: #222222;
  }
}

/* 手机号 */
.user-card__phone {
  margin-top: 6rpx;
}
.user-card__phone-text {
  font-size: 22rpx;
  color: #A9A9A9;
}
.user-card__bind {
  margin-top: 6rpx;
  display: inline-block;
  padding: 4rpx 16rpx;
  background: #B4EF4E;
  border: 2px solid #222222;
}
.user-card__bind--press { opacity: 0.7; }
.user-card__bind-text {
  font-size: 20rpx;
  font-weight: 700;
  color: #222222;
}

/* 绑定弹窗 */
.phone-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;

  &__panel {
    width: 100%;
    background: #F6F6F6;
    border: 3px solid #222222;
    box-shadow: 8px 8px 0 #222222;
    padding: 32rpx;
  }

  &__title {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-size: 32rpx;
    font-weight: 900;
    color: #222222;
    display: block;
    margin-bottom: 8rpx;
  }

  &__desc {
    font-size: 22rpx;
    color: #A9A9A9;
    display: block;
    margin-bottom: 24rpx;
  }

  &__input {
    width: 100%;
    border: 3px solid #222222;
    padding: 20rpx;
    font-size: 28rpx;
    color: #222222;
    background: #EEEEEE;
    box-sizing: border-box;
    height: 88rpx;
    margin-bottom: 16rpx;
  }

  &__input--code {
    flex: 1;
    margin-bottom: 0;
  }

  &__code-row {
    display: flex;
    gap: 12rpx;
    margin-bottom: 24rpx;
  }

  &__send {
    background: #EEEEEE;
    border: 3px solid #222222;
    padding: 0 20rpx;
    display: flex;
    align-items: center;
    height: 88rpx;
    flex-shrink: 0;
  }
  &__send--press { opacity: 0.7; }
  &__send--disabled { opacity: 0.5; }
  &__send-text {
    font-size: 24rpx;
    font-weight: 700;
    color: #222222;
    white-space: nowrap;
  }

  &__submit {
    background: #FF590E;
    border: 4px solid #222222;
    border-radius: 999rpx;
    padding: 24rpx;
    text-align: center;
  }
  &__submit--press { opacity: 0.8; }
  &__submit-text {
    font-size: 28rpx;
    font-weight: 900;
    color: #FFFFFF;
  }
}
</style>
