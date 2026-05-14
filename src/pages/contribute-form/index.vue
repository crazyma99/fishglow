<template>
  <view class="page">
    <CustomNav title="贡献鱼种" />

    <view class="form-wrap">
      <!-- 鱼种名称（从上个页面传入） -->
      <view class="field">
        <text class="field__label">鱼种名称</text>
        <text class="field__value">{{ fishName }}</text>
      </view>

      <!-- AI 智能检索按钮 -->
      <view class="ai-btn" hover-class="ai-btn--press" @tap="aiGenerate" v-if="!loading && !generated">
        <text class="ai-btn__text">★ AI 智能填充</text>
        <text class="ai-btn__desc">自动搜索并生成鱼种数据</text>
      </view>

      <!-- Loading -->
      <view v-if="loading" class="loading-box">
        <view class="loading-box__spinner"></view>
        <text class="loading-box__text">AI 正在搜索生成数据...</text>
        <text class="loading-box__sub">预计 10-30 秒</text>
      </view>

      <!-- 表单字段 -->
      <view v-if="generated" class="fields">
        <view class="field">
          <text class="field__label">别名（逗号分隔）</text>
          <textarea class="field__textarea" v-model="form.aliases" placeholder="如：白鱼,翘壳,翘嘴白" />
        </view>
        <view class="field">
          <text class="field__label">拉丁学名</text>
          <input class="field__input" v-model="form.name_latin" />
        </view>
        <view class="field">
          <text class="field__label">栖息环境</text>
          <textarea class="field__textarea" v-model="form.habitat" placeholder="栖息环境描述" />
        </view>
        <view class="field">
          <text class="field__label">难度</text>
          <view class="field__tags">
            <text v-for="d in ['easy','medium','hard']" :key="d" class="field__tag" :class="{'field__tag--active': form.difficulty === d}" @tap="form.difficulty = d">{{ {easy:'简单',medium:'中等',hard:'困难'}[d] }}</text>
          </view>
        </view>
        <view class="field">
          <text class="field__label">钓鱼技巧</text>
          <textarea class="field__textarea" v-model="form.tip" placeholder="50字内的垂钓建议" />
        </view>
        <view class="field">
          <text class="field__label">适宜水温 (°C)</text>
          <view class="field__row">
            <input class="field__input field__input--sm" type="number" v-model="form.water_temp_min" placeholder="最低" />
            <text class="field__sep">—</text>
            <input class="field__input field__input--sm" type="number" v-model="form.water_temp_max" placeholder="最高" />
          </view>
        </view>
        <view class="field">
          <text class="field__label">分布省份</text>
          <text class="field__hint">{{ (form.distribution_provinces || []).join('、') }}</text>
        </view>
        <view class="field">
          <text class="field__label">月活跃度 (1-10)</text>
          <text class="field__hint">{{ (form.monthly_activity || []).join(', ') }}</text>
        </view>

        <view class="submit-btn" hover-class="submit-btn--press" @tap="submit">
          <text class="submit-btn__text">提交审核</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CustomNav from '../../components/CustomNav.vue';
import { request } from '../../utils/api';
import { ensureLogin, getOpenid } from '../../utils/auth';

const fishName = ref('');
const loading = ref(false);
const generated = ref(false);
const form = ref({
  aliases: '',
  name_latin: '',
  habitat: '',
  difficulty: 'medium',
  tip: '',
  water_temp_min: 15,
  water_temp_max: 25,
  distribution_provinces: [],
  monthly_activity: [],
  fishing_methods: [],
  recommended_bait: {},
  best_time: {}
});

onMounted(() => {
  const name = uni.getStorageSync('temp_contribute_fish');
  if (name) {
    fishName.value = name;
  } else {
    uni.navigateBack();
  }
});

async function aiGenerate() {
  loading.value = true;
  try {
    const res = await request({
      url: '/contribute/generate',
      method: 'POST',
      data: { fish_name: fishName.value }
    });
    const data = res.data;
    form.value = {
      aliases: data.aliases || '',
      name_latin: data.name_latin || '',
      habitat: data.habitat || '',
      difficulty: data.difficulty || 'medium',
      tip: data.tip || '',
      water_temp_min: data.water_temp_min || 15,
      water_temp_max: data.water_temp_max || 25,
      distribution_provinces: data.distribution_provinces || [],
      monthly_activity: data.monthly_activity || [],
      fishing_methods: data.fishing_methods || [],
      recommended_bait: data.recommended_bait || {},
      best_time: data.best_time || {}
    };
    generated.value = true;
  } catch (e) {
    uni.showToast({ title: e.message || '生成失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function submit() {
  const openid = await ensureLogin();
  if (!openid) return;

  try {
    await request({
      url: '/contribute/submit',
      method: 'POST',
      data: {
        openid,
        fish_name: fishName.value,
        aliases: form.value.aliases,
        name_latin: form.value.name_latin,
        habitat: form.value.habitat,
        difficulty: form.value.difficulty,
        tip: form.value.tip,
        water_temp_min: parseInt(form.value.water_temp_min) || 0,
        water_temp_max: parseInt(form.value.water_temp_max) || 0,
        distribution_provinces: form.value.distribution_provinces,
        monthly_activity: form.value.monthly_activity,
        fishing_methods: form.value.fishing_methods,
        recommended_bait: form.value.recommended_bait,
        best_time: form.value.best_time
      }
    });
    uni.showToast({ title: '提交成功，等待审核', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1500);
  } catch (e) {
    uni.showToast({ title: e.message || '提交失败', icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
.page {
  background: #F6F6F6;
  min-height: 100vh;
}

.form-wrap {
  padding: 24rpx;
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

  &__value {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-size: 36rpx;
    font-weight: 900;
    color: #222222;
  }

  &__input {
    width: 100%;
    border: 3px solid #222222;
    padding: 16rpx 20rpx;
    font-size: 26rpx;
    color: #222222;
    background: #EEEEEE;
    box-sizing: border-box;
  }

  &__input--sm {
    width: 200rpx;
  }

  &__textarea {
    width: 100%;
    border: 3px solid #222222;
    padding: 16rpx 20rpx;
    font-size: 26rpx;
    color: #222222;
    background: #EEEEEE;
    box-sizing: border-box;
    min-height: 80rpx;
    line-height: 1.5;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  &__sep {
    color: #A9A9A9;
    font-weight: 700;
  }

  &__tags {
    display: flex;
    gap: 12rpx;
  }

  &__tag {
    padding: 10rpx 28rpx;
    font-size: 24rpx;
    color: #A9A9A9;
    background: #D8D8D8;
    border: 2px solid #222222;
    font-weight: 700;

    &--active {
      color: #222222;
      background: #B4EF4E;
    }
  }

  &__hint {
    font-size: 24rpx;
    color: #A9A9A9;
    line-height: 1.6;
    word-break: break-all;
  }
}

.ai-btn {
  background: #B4EF4E;
  border: 3px solid #222222;
  box-shadow: 4px 4px 0 #222222;
  padding: 28rpx 24rpx;
  margin-bottom: 32rpx;
  transition: transform 100ms, box-shadow 100ms;

  &--press {
    box-shadow: none;
    transform: translate(4px, 4px);
  }

  &__text {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-size: 30rpx;
    font-weight: 900;
    color: #222222;
    display: block;
  }

  &__desc {
    font-size: 22rpx;
    color: #222222;
    opacity: 0.6;
    margin-top: 4rpx;
  }
}

.loading-box {
  padding: 80rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__spinner {
    width: 48rpx;
    height: 48rpx;
    border: 4rpx solid #D8D8D8;
    border-top-color: #FF590E;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 24rpx;
  }

  &__text {
    font-size: 28rpx;
    font-weight: 900;
    color: #222222;
  }

  &__sub {
    font-size: 22rpx;
    color: #A9A9A9;
    margin-top: 8rpx;
  }
}

@keyframes spin { to { transform: rotate(360deg); } }

.fields {
  margin-top: 16rpx;
}

.submit-btn {
  margin-top: 40rpx;
  background: #FF590E;
  border: 4px solid #222222;
  border-radius: 999rpx;
  padding: 28rpx;
  text-align: center;
  transition: opacity 150ms;

  &--press {
    opacity: 0.8;
  }

  &__text {
    font-size: 30rpx;
    font-weight: 900;
    color: #FFFFFF;
  }
}
</style>
