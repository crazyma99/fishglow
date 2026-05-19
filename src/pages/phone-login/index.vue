<template>
  <view class="login-page">
    <view class="login-page__header">
      <image class="login-page__logo" src="/static/logo-icon.png" mode="aspectFit" />
      <text class="login-page__title">渔光 FishGlow</text>
      <text class="login-page__desc">手机号登录</text>
    </view>

    <view class="login-page__form">
      <view class="field">
        <text class="field__label">手机号</text>
        <input class="field__input" v-model="phone" type="number" maxlength="11" placeholder="输入手机号" />
      </view>
      <view class="field">
        <text class="field__label">验证码</text>
        <view class="field__row">
          <input class="field__input field__input--flex" v-model="code" type="number" maxlength="6" placeholder="验证码" />
          <view class="send-btn" :class="{ 'send-btn--disabled': countdown > 0 }" hover-class="send-btn--press" @tap="sendCode">
            <text class="send-btn__text">{{ countdown > 0 ? countdown + 's' : '获取验证码' }}</text>
          </view>
        </view>
      </view>

      <view class="submit-btn" hover-class="submit-btn--press" @tap="doLogin">
        <text class="submit-btn__text">登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { request } from '../../utils/api';

const phone = ref('');
const code = ref('');
const countdown = ref(0);
let timer = null;

const eventChannel = ref(null);
// #ifdef APP-PLUS
import { onLoad } from '@dcloudio/uni-app';
onLoad(() => {
  eventChannel.value = getApp().globalData?._eventChannel;
});
// #endif

async function sendCode() {
  if (countdown.value > 0) return;
  if (!phone.value || !/^1\d{10}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' });
    return;
  }
  try {
    const res = await request({ url: '/phone/send-code', method: 'POST', data: { phone: phone.value } });
    uni.showToast({ title: '验证码已发送', icon: 'success' });
    if (res.data?.debug_code) code.value = res.data.debug_code;
    countdown.value = 60;
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) clearInterval(timer);
    }, 1000);
  } catch (e) {
    uni.showToast({ title: e.message || '发送失败', icon: 'none' });
  }
}

async function doLogin() {
  if (!phone.value || !code.value) {
    uni.showToast({ title: '请填写手机号和验证码', icon: 'none' });
    return;
  }
  try {
    const res = await request({ url: '/phone/login', method: 'POST', data: { phone: phone.value, code: code.value } });
    const openid = res.data.openid;
    uni.setStorageSync('fishglow_openid', openid);

    // 通知调用方登录成功
    const pages = getCurrentPages();
    const current = pages[pages.length - 1];
    const channel = current.getOpenerEventChannel && current.getOpenerEventChannel();
    if (channel) channel.emit('loginSuccess', { openid });

    uni.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 800);
  } catch (e) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: #F6F6F6;
  padding: 120rpx 48rpx 48rpx;

  &__header {
    text-align: center;
    margin-bottom: 64rpx;
  }

  &__logo {
    width: 100rpx;
    height: 68rpx;
    margin-bottom: 16rpx;
  }

  &__title {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-size: 40rpx;
    font-weight: 900;
    color: #222222;
    display: block;
  }

  &__desc {
    font-size: 26rpx;
    color: #A9A9A9;
    margin-top: 8rpx;
  }

  &__form {
    margin-top: 32rpx;
  }
}

.field {
  margin-bottom: 28rpx;

  &__label {
    font-size: 24rpx;
    color: #A9A9A9;
    font-weight: 700;
    margin-bottom: 8rpx;
    display: block;
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
  }

  &__input--flex {
    flex: 1;
  }

  &__row {
    display: flex;
    gap: 12rpx;
  }
}

.send-btn {
  background: #EEEEEE;
  border: 3px solid #222222;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  height: 88rpx;
  flex-shrink: 0;

  &--press { opacity: 0.7; }
  &--disabled { opacity: 0.5; }

  &__text {
    font-size: 24rpx;
    font-weight: 700;
    color: #222222;
    white-space: nowrap;
  }
}

.submit-btn {
  margin-top: 48rpx;
  background: #FF590E;
  border: 4px solid #222222;
  border-radius: 999rpx;
  padding: 28rpx;
  text-align: center;
  box-shadow: 4px 4px 0 #222222;
  transition: transform 100ms, box-shadow 100ms;

  &--press {
    box-shadow: none;
    transform: translate(4px, 4px);
  }

  &__text {
    font-size: 32rpx;
    font-weight: 900;
    color: #FFFFFF;
  }
}
</style>
