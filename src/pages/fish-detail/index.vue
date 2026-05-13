<template>
  <view class="detail" v-if="fish">
    <!-- 头部信息 -->
    <view class="header-card">
      <view class="header-card__left">
        <text class="header-card__name">{{ fish.name_zh }}</text>
        <text v-if="fish.name_latin" class="header-card__latin">{{ fish.name_latin }}</text>
      </view>
      <view class="header-card__badge" :class="'header-card__badge--' + fish.difficulty">
        <text class="header-card__badge-text">{{ difficultyLabel }}</text>
      </view>
    </view>

    <!-- 活跃月份 - 横向条形图 -->
    <view class="card" v-if="fish.monthly_activity">
      <text class="card__title">全年活跃度</text>
      <view class="bar-chart">
        <view v-for="(val, idx) in fish.monthly_activity" :key="idx" class="bar-chart__row">
          <text class="bar-chart__month" :class="{ 'bar-chart__month--current': idx === currentMonth }">{{ idx + 1 }}月</text>
          <view class="bar-chart__track">
            <view
              class="bar-chart__fill"
              :class="{ 'bar-chart__fill--current': idx === currentMonth, 'bar-chart__fill--high': val >= 7, 'bar-chart__fill--mid': val >= 4 && val < 7 }"
              :style="{ width: (val * 10) + '%' }"
            ></view>
          </view>
          <text class="bar-chart__val" :class="{ 'bar-chart__val--current': idx === currentMonth }">{{ val }}</text>
        </view>
      </view>
      <view class="bar-chart__legend">
        <view class="bar-chart__legend-item"><view class="bar-chart__legend-dot bar-chart__legend-dot--high"></view><text class="bar-chart__legend-text">活跃</text></view>
        <view class="bar-chart__legend-item"><view class="bar-chart__legend-dot bar-chart__legend-dot--mid"></view><text class="bar-chart__legend-text">一般</text></view>
        <view class="bar-chart__legend-item"><view class="bar-chart__legend-dot bar-chart__legend-dot--low"></view><text class="bar-chart__legend-text">低迷</text></view>
      </view>
    </view>

    <!-- 分布地图 -->
    <view class="card">
      <text class="card__title">分布区域</text>
      <view class="map-wrap">
        <image v-if="mapUrl" :src="mapUrl" class="map-wrap__img" mode="widthFix" />
      </view>
      <view class="map-stats">
        <text class="map-stats__text">分布于 <text class="map-stats__num">{{ activeProvinceCount }}</text> 个省份</text>
      </view>
      <!-- 省份标签列表 -->
      <view class="province-tags">
        <text v-for="p in (fish.distribution_provinces || [])" :key="p" class="province-tag">{{ p }}</text>
      </view>
      <text class="card__desc" v-if="fish.habitat">栖息环境：{{ fish.habitat }}</text>
    </view>

    <!-- 当季饵料推荐 -->
    <view class="card" v-if="currentBait.length">
      <text class="card__title">当季饵料推荐</text>
      <view class="bait-list">
        <view v-for="(bait, idx) in currentBait" :key="idx" class="bait-item">
          <view class="bait-item__dot"></view>
          <text class="bait-item__name">{{ bait }}</text>
        </view>
      </view>
    </view>

    <!-- 适宜水温 - 温度计可视化 -->
    <view class="card" v-if="fish.water_temp">
      <text class="card__title">适宜水温</text>
      <view class="temp-visual">
        <view class="temp-visual__bar">
          <view class="temp-visual__range" :style="tempRangeStyle"></view>
        </view>
        <view class="temp-visual__labels">
          <text class="temp-visual__label">0°C</text>
          <text class="temp-visual__label">10°C</text>
          <text class="temp-visual__label">20°C</text>
          <text class="temp-visual__label">30°C</text>
          <text class="temp-visual__label">40°C</text>
        </view>
        <text class="temp-visual__value">最佳 {{ fish.water_temp.optimal_min }}°C - {{ fish.water_temp.optimal_max }}°C</text>
      </view>
    </view>

    <!-- 钓法 -->
    <view class="card" v-if="fish.fishing_methods && fish.fishing_methods.length">
      <text class="card__title">推荐钓法</text>
      <view class="method-list">
        <view v-for="m in fish.fishing_methods" :key="m" class="method-item">
          <text class="method-item__text">{{ m }}</text>
        </view>
      </view>
    </view>

    <!-- 最佳时间 -->
    <view class="card" v-if="currentBestTime">
      <text class="card__title">最佳时间（当季）</text>
      <view class="time-display">
        <image class="time-display__icon" src="/static/icons/primary/history.svg" mode="aspectFit" />
        <text class="time-display__text">{{ currentBestTime }}</text>
      </view>
    </view>

    <!-- 钓鱼技巧 -->
    <view class="card tip-card" v-if="fish.tip">
      <text class="card__title">钓鱼技巧</text>
      <text class="tip-card__text">{{ fish.tip }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

import { IMG_BASE as API_BASE } from '../../utils/config';

const fish = ref(null);
const currentMonth = new Date().getMonth();


onMounted(() => {
  const raw = uni.getStorageSync('temp_fish_detail');
  if (raw) {
    fish.value = JSON.parse(raw);
  }
});

const currentSeason = computed(() => {
  const m = currentMonth + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
});

const currentBait = computed(() => {
  if (!fish.value || !fish.value.recommended_bait) return [];
  return fish.value.recommended_bait[currentSeason.value] || [];
});

const currentBestTime = computed(() => {
  if (!fish.value || !fish.value.best_time) return '';
  return fish.value.best_time[currentSeason.value] || '';
});

const difficultyLabel = computed(() => {
  if (!fish.value) return '';
  const map = { easy: '简单', medium: '中等', hard: '困难' };
  return map[fish.value.difficulty] || '';
});

// 地图 URL（动态着色 SVG）
const mapUrl = computed(() => {
  if (!fish.value || !fish.value.distribution_provinces || !fish.value.distribution_provinces.length) return '';
  const provinces = fish.value.distribution_provinces.join(',');
  return `${API_BASE}/api/map?provinces=${encodeURIComponent(provinces)}`;
});

const activeProvinceCount = computed(() => {
  if (!fish.value) return 0;
  return (fish.value.distribution_provinces || []).length;
});

// 水温范围样式
const tempRangeStyle = computed(() => {
  if (!fish.value || !fish.value.water_temp) return {};
  const min = fish.value.water_temp.optimal_min;
  const max = fish.value.water_temp.optimal_max;
  const left = (min / 40) * 100;
  const width = ((max - min) / 40) * 100;
  return { left: left + '%', width: width + '%' };
});
</script>

<style lang="scss" scoped>
.detail {
  padding: 24rpx;
  padding-bottom: 48rpx;
}

.header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 4rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  &__left {
    flex: 1;
  }

  &__name {
    font-size: 36rpx;
    font-weight: bold;
    color: #1E293B;
    display: block;
  }

  &__latin {
    font-size: 22rpx;
    color: #94A3B8;
    font-style: italic;
    margin-top: 4rpx;
  }

  &__badge {
    padding: 8rpx 16rpx;
    border-radius: 4rpx;

    &--easy { background: #F0FDF4; }
    &--medium { background: #FEFCE8; }
    &--hard { background: #FEF2F2; }
  }

  &__badge-text {
    font-size: 22rpx;
    font-weight: bold;
    color: #1E293B;
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
    margin-bottom: 20rpx;
    display: block;
  }

  &__desc {
    font-size: 22rpx;
    color: #64748B;
    margin-top: 16rpx;
    line-height: 1.5;
  }
}

/* 横向条形图 */
.bar-chart {
  &__row {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
  }

  &__month {
    width: 60rpx;
    font-size: 20rpx;
    color: #94A3B8;
    flex-shrink: 0;

    &--current {
      color: #EA580C;
      font-weight: bold;
    }
  }

  &__track {
    flex: 1;
    height: 16rpx;
    background: #F1F5F9;
    border-radius: 8rpx;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 8rpx;
    background: #CBD5E1;
    transition: width 300ms;

    &--high { background: #EA580C; }
    &--mid { background: #F97316; opacity: 0.6; }
    &--current { background: #EA580C; }
  }

  &__val {
    width: 40rpx;
    text-align: right;
    font-size: 20rpx;
    color: #94A3B8;
    flex-shrink: 0;

    &--current {
      color: #EA580C;
      font-weight: bold;
    }
  }

  &__legend {
    display: flex;
    gap: 24rpx;
    margin-top: 16rpx;
    justify-content: flex-end;
  }

  &__legend-item {
    display: flex;
    align-items: center;
    gap: 6rpx;
  }

  &__legend-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 4rpx;

    &--high { background: #EA580C; }
    &--mid { background: #F97316; opacity: 0.6; }
    &--low { background: #CBD5E1; }
  }

  &__legend-text {
    font-size: 20rpx;
    color: #64748B;
  }
}

/* 中国地图 */
.map-wrap {
  margin-bottom: 16rpx;
  background: #FAFBFC;
  border-radius: 4rpx;
  padding: 16rpx;

  &__img {
    width: 100%;
  }
}

.map-stats {
  margin-bottom: 12rpx;

  &__text {
    font-size: 24rpx;
    color: #64748B;
  }

  &__num {
    color: #EA580C;
    font-weight: bold;
    font-size: 28rpx;
  }
}

.province-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.province-tag {
  font-size: 20rpx;
  color: #EA580C;
  background: #FFF7ED;
  padding: 6rpx 12rpx;
  border-radius: 4rpx;
}

/* 饵料列表 */
.bait-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.bait-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #F0F9FF;
  padding: 10rpx 20rpx;
  border-radius: 4rpx;

  &__dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background: #0EA5E9;
  }

  &__name {
    font-size: 24rpx;
    color: #1E293B;
  }
}

/* 水温可视化 */
.temp-visual {
  &__bar {
    height: 16rpx;
    background: linear-gradient(to right, #BFDBFE, #60A5FA, #F97316, #DC2626);
    border-radius: 8rpx;
    position: relative;
    margin-bottom: 8rpx;
  }

  &__range {
    position: absolute;
    top: -4rpx;
    height: 24rpx;
    border: 3rpx solid #1E293B;
    border-radius: 12rpx;
    background: rgba(255,255,255,0.3);
  }

  &__labels {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8rpx;
  }

  &__label {
    font-size: 18rpx;
    color: #94A3B8;
  }

  &__value {
    font-size: 26rpx;
    color: #EA580C;
    font-weight: bold;
  }
}

/* 钓法列表 */
.method-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.method-item {
  background: #FFF7ED;
  border: 1px solid #FDBA74;
  border-radius: 4rpx;
  padding: 10rpx 24rpx;

  &__text {
    font-size: 24rpx;
    color: #EA580C;
    font-weight: bold;
  }
}

/* 最佳时间 */
.time-display {
  display: flex;
  align-items: center;
  gap: 12rpx;

  &__icon {
    width: 36rpx;
    height: 36rpx;
  }

  &__text {
    font-size: 28rpx;
    color: #1E293B;
  }
}

/* 技巧卡片 */
.tip-card {
  background: #F0F9FF;
  border-color: #BAE6FD;

  &__text {
    font-size: 26rpx;
    color: #0C4A6E;
    line-height: 1.6;
  }
}
</style>
