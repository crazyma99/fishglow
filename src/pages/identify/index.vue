<template>
  <view class="identify">
    <camera v-if="!loading" class="identify__camera" device-position="back" flash="auto" />

    <view class="identify__controls">
      <view class="identify__btn identify__btn--album" hover-class="identify__btn--active" @tap="chooseAlbum">
        <text class="identify__btn-text">相册</text>
      </view>
      <view class="identify__shutter" hover-class="identify__shutter--active" @tap="takePhoto">
        <view class="identify__shutter-inner"></view>
      </view>
      <view class="identify__btn" />
    </view>

    <LoadingWave v-if="loading" />
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { uploadFile, request } from '../../utils/api';
import { setTemp } from '../../utils/storage';
import { ensureLogin, getOpenid } from '../../utils/auth';
import LoadingWave from '../../components/LoadingWave.vue';

const loading = ref(false);

function takePhoto() {
  const ctx = uni.createCameraContext();
  ctx.takePhoto({
    quality: 'high',
    success(res) {
      handleImage(res.tempImagePath);
    },
    fail() {
      uni.showToast({ title: '拍照失败', icon: 'none' });
    }
  });
}

function chooseAlbum() {
  uni.chooseImage({
    count: 1,
    sourceType: ['album'],
    success(res) {
      handleImage(res.tempFilePaths[0]);
    }
  });
}

async function handleImage(filePath) {
  loading.value = true;
  try {
    const openid = await ensureLogin();
    if (!openid) { loading.value = false; return; }
    const res = await uploadFile(filePath);
    const results = res.data.result || [];
    const photoUrl = res.data.photo_url || '';
    const resultData = {
      imagePath: filePath,
      photoUrl,
      results,
      timestamp: Date.now()
    };
    setTemp('temp_result', resultData);

    // 保存识别记录到历史（带用户拍摄照片）
    if (results.length > 0) {
      const top = results[0];
      request({
        url: '/history/add',
        method: 'POST',
        data: {
          openid: getOpenid(),
          fish_name: top.name,
          score: top.score,
          raw_score: top.score,
          image_url: top.baike_info?.image_url || '',
          photo_path: photoUrl,
          baike_url: top.baike_info?.baike_url || '',
          description: top.baike_info?.description || '',
          structured: top.structured ? JSON.stringify(top.structured) : ''
        }
      }).catch(() => {});
    }

    uni.navigateTo({ url: '/pages/result/index' });
  } catch (e) {
    uni.showToast({ title: e.message || '识别失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.identify {
  height: 100vh;
  background: #000;
  position: relative;
  display: flex;
  flex-direction: column;

  &__camera {
    flex: 1;
    width: 100%;
  }

  &__controls {
    position: absolute;
    bottom: 80rpx;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 60rpx;
  }

  &__btn {
    width: 100rpx;
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 150ms;

    &--album {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4rpx;
    }

    &--active {
      opacity: 0.7;
    }
  }

  &__btn-text {
    color: #FFFFFF;
    font-size: 24rpx;
  }

  &__shutter {
    width: 128rpx;
    height: 128rpx;
    border-radius: 50%;
    border: 6rpx solid #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 150ms;

    &--active {
      opacity: 0.7;
    }
  }

  &__shutter-inner {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: #FFFFFF;
  }
}
</style>
