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
    console.error('[identify] error:', JSON.stringify(e));
    uni.showToast({ title: e.message || e.errMsg || '识别失败', icon: 'none' });
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
    transition: box-shadow 150ms, transform 150ms;

    &--album {
      background: rgba(255, 255, 255, 0.15);
      border: 3px solid #FFFFFF;
      border-radius: 0;
      box-shadow: 4px 4px 0 rgba(255, 255, 255, 0.3);
    }

    &--active {
      box-shadow: none;
      transform: translate(4px, 4px);
    }
  }

  &__btn-text {
    color: #FFFFFF;
    font-size: 24rpx;
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-weight: 900;
  }

  &__shutter {
    width: 128rpx;
    height: 128rpx;
    border-radius: 50%;
    border: 6rpx solid #FF590E;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: box-shadow 150ms, transform 150ms;
    box-shadow: 4px 4px 0 rgba(255, 89, 14, 0.5);

    &--active {
      box-shadow: none;
      transform: translate(4px, 4px);
    }
  }

  &__shutter-inner {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: #FF590E;
  }
}
</style>
