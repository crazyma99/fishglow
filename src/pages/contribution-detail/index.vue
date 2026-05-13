<template>
  <view class="detail" v-if="item">
    <CustomNav title="贡献详情" />
    <!-- 状态头部 -->
    <view class="status-banner" :class="'status-banner--' + item.status">
      <text class="status-banner__label">{{ statusLabel(item.status) }}</text>
      <text class="status-banner__time" v-if="item.reviewed_at">审核于 {{ formatDate(item.reviewed_at) }}</text>
    </view>

    <!-- 审核备注 -->
    <view v-if="item.reviewer_note" class="card note-card">
      <text class="note-card__label">审核备注</text>
      <text class="note-card__text">{{ item.reviewer_note }}</text>
    </view>

    <!-- 基本信息 -->
    <view class="card">
      <text class="card__title">基本信息</text>
      <view class="info-row">
        <text class="info-row__label">鱼种名称</text>
        <text class="info-row__value">{{ item.fish_name }}</text>
      </view>
      <view class="info-row">
        <text class="info-row__label">拉丁学名</text>
        <text class="info-row__value">{{ item.name_latin || '-' }}</text>
      </view>
      <view class="info-row">
        <text class="info-row__label">难度等级</text>
        <text class="info-row__value">{{ difficultyLabel }}</text>
      </view>
      <view class="info-row">
        <text class="info-row__label">适宜水温</text>
        <text class="info-row__value">{{ item.water_temp_min }}°C - {{ item.water_temp_max }}°C</text>
      </view>
      <view class="info-row">
        <text class="info-row__label">栖息环境</text>
        <text class="info-row__value">{{ item.habitat || '-' }}</text>
      </view>
    </view>

    <!-- 月活跃度 -->
    <view class="card" v-if="monthlyActivity.length">
      <text class="card__title">月活跃度</text>
      <view class="bar-chart">
        <view v-for="(val, idx) in monthlyActivity" :key="idx" class="bar-chart__row">
          <text class="bar-chart__month">{{ idx + 1 }}月</text>
          <view class="bar-chart__track">
            <view class="bar-chart__fill" :class="{ 'bar-chart__fill--high': val >= 7, 'bar-chart__fill--mid': val >= 4 && val < 7 }" :style="{ width: (val * 10) + '%' }"></view>
          </view>
          <text class="bar-chart__val">{{ val }}</text>
        </view>
      </view>
    </view>

    <!-- 钓法 -->
    <view class="card" v-if="fishingMethods.length">
      <text class="card__title">推荐钓法</text>
      <view class="tags">
        <text v-for="m in fishingMethods" :key="m" class="tag tag--primary">{{ m }}</text>
      </view>
    </view>

    <!-- 分布省份 -->
    <view class="card" v-if="provinces.length">
      <text class="card__title">分布省份（{{ provinces.length }}个）</text>
      <view class="tags">
        <text v-for="p in provinces" :key="p" class="tag">{{ p }}</text>
      </view>
    </view>

    <!-- 钓鱼技巧 -->
    <view class="card" v-if="item.tip">
      <text class="card__title">钓鱼技巧</text>
      <text class="detail__text">{{ item.tip }}</text>
    </view>

    <!-- 提交信息 -->
    <view class="card card--muted">
      <text class="card__title">提交信息</text>
      <view class="info-row">
        <text class="info-row__label">提交时间</text>
        <text class="info-row__value">{{ formatDate(item.created_at) }}</text>
      </view>
      <view class="info-row" v-if="item.reviewed_at">
        <text class="info-row__label">审核时间</text>
        <text class="info-row__value">{{ formatDate(item.reviewed_at) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CustomNav from '../../components/CustomNav.vue';

const item = ref(null);

onMounted(() => {
  const raw = uni.getStorageSync('temp_contribution');
  if (raw) {
    item.value = JSON.parse(raw);
  }
});

const difficultyLabel = computed(() => {
  if (!item.value) return '';
  return { easy: '简单', medium: '中等', hard: '困难' }[item.value.difficulty] || item.value.difficulty;
});

const monthlyActivity = computed(() => {
  if (!item.value) return [];
  return safeJSON(item.value.monthly_activity, []);
});

const fishingMethods = computed(() => {
  if (!item.value) return [];
  return safeJSON(item.value.fishing_methods, []);
});

const provinces = computed(() => {
  if (!item.value) return [];
  return safeJSON(item.value.distribution_provinces, []);
});

function statusLabel(status) {
  return { pending: '审核中', approved: '已通过', rejected: '已拒绝' }[status] || status;
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(String(ts).replace(' ', 'T'));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function safeJSON(str, fallback) {
  if (!str) return fallback;
  if (typeof str !== 'string') return str;
  try { return JSON.parse(str); } catch { return fallback; }
}
</script>

<style lang="scss" scoped>
.detail {
  padding: 24rpx;
  background: #F6F6F6;
  min-height: 100vh;
}

.status-banner {
  padding: 20rpx 24rpx;
  border-radius: 0;
  margin-bottom: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &--pending { background: rgba(#FFD93D, 0.25); border: 3px solid #222222; box-shadow: 4px 4px 0 #222222; }
  &--approved { background: rgba(#B4EF4E, 0.25); border: 3px solid #222222; box-shadow: 4px 4px 0 #222222; }
  &--rejected { background: rgba(#FF590E, 0.15); border: 3px solid #222222; box-shadow: 4px 4px 0 #222222; }

  &__label { font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif; font-weight: 900; font-size: 28rpx; }
  &--pending &__label { color: #222222; }
  &--approved &__label { color: #222222; }
  &--rejected &__label { color: #FF590E; }

  &__time { font-size: 22rpx; color: #A9A9A9; }
}

.note-card {
  background: rgba(#FFD93D, 0.2);
  border-color: #222222;
  margin-bottom: 24rpx;

  &__label { font-size: 22rpx; color: #222222; margin-bottom: 4rpx; display: block; }
  &__text { font-size: 26rpx; color: #222222; line-height: 1.5; }
}

.card {
  background: #EEEEEE;
  border: 3px solid #222222;
  border-radius: 0;
  box-shadow: 4px 4px 0 #222222;
  padding: 24rpx;
  margin-bottom: 24rpx;

  &--muted { background: #D8D8D8; }
  &__title { font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif; font-weight: 900; font-size: 28rpx; color: #222222; margin-bottom: 16rpx; display: block; }
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
  border-bottom: 3px solid #D8D8D8;

  &:last-child { border-bottom: none; }
  &__label { font-size: 24rpx; color: #A9A9A9; }
  &__value { font-size: 24rpx; color: #222222; }
}

.detail__text { font-size: 26rpx; color: #222222; line-height: 1.6; }

.bar-chart {
  &__row { display: flex; align-items: center; margin-bottom: 6rpx; }
  &__month { width: 60rpx; font-size: 20rpx; color: #A9A9A9; flex-shrink: 0; }
  &__track { flex: 1; height: 14rpx; background: #D8D8D8; border-radius: 0; overflow: hidden; }
  &__fill { height: 100%; border-radius: 0; background: #A9A9A9;
    &--high { background: #FF590E; }
    &--mid { background: #FFD93D; }
  }
  &__val { width: 36rpx; text-align: right; font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif; font-weight: 900; font-size: 20rpx; color: #A9A9A9; flex-shrink: 0; }
}

.tags { display: flex; flex-wrap: wrap; gap: 10rpx; }
.tag { font-size: 22rpx; padding: 8rpx 16rpx; border-radius: 0; border: 2px solid #222222; background: #D8D8D8; color: #222222;
  &--primary { background: rgba(#FF590E, 0.1); color: #FF590E; border-color: #222222; }
}
</style>
