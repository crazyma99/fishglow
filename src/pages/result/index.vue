<template>
  <view class="result">
    <CustomNav title="识别结果" />
    <!-- Hero 区: 大图 + 渐变遮罩 + 鱼名 -->
    <view class="hero">
      <image :src="fishCoverImage || imagePath" class="hero__img" mode="aspectFill" />
      <view class="hero__overlay"></view>
      <view v-if="topResult" class="hero__content">
        <text class="hero__name">{{ topResult.name }}</text>
        <view class="hero__badge" :class="confidenceClass(topResult.score)">
          <text class="hero__badge-text">{{ confidenceLabel(topResult.score) }}</text>
        </view>
      </view>
      <!-- 置信度环 -->
      <view v-if="topResult" class="hero__ring">
        <view class="ring">
          <view class="ring__circle" :style="ringStyle"></view>
          <text class="ring__value">{{ (parseFloat(topResult.score) * 100).toFixed(0) }}</text>
          <text class="ring__unit">%</text>
        </view>
      </view>
    </view>

    <!-- 结构化信息 -->
    <view v-if="topResult && topResult.structured" class="info-section">
      <text class="section-title">鱼种档案</text>
      <view class="info-grid">
        <view v-if="topResult.structured.family" class="info-item">
          <image class="info-item__icon" src="/static/icons/primary/fish.svg" mode="aspectFit" />
          <view class="info-item__content">
            <text class="info-item__label">科属</text>
            <text class="info-item__value">{{ topResult.structured.family }}</text>
          </view>
        </view>
        <view v-if="topResult.structured.habitat" class="info-item">
          <image class="info-item__icon" src="/static/icons/primary/info.svg" mode="aspectFit" />
          <view class="info-item__content">
            <text class="info-item__label">栖息地</text>
            <text class="info-item__value">{{ topResult.structured.habitat }}</text>
          </view>
        </view>
        <view v-if="topResult.structured.food" class="info-item">
          <image class="info-item__icon" src="/static/icons/primary/star.svg" mode="aspectFit" />
          <view class="info-item__content">
            <text class="info-item__label">食性</text>
            <text class="info-item__value">{{ topResult.structured.food }}</text>
          </view>
        </view>
        <view v-if="topResult.structured.distribution" class="info-item">
          <image class="info-item__icon" src="/static/icons/primary/search.svg" mode="aspectFit" />
          <view class="info-item__content">
            <text class="info-item__label">分布</text>
            <text class="info-item__value">{{ topResult.structured.distribution }}</text>
          </view>
        </view>
      </view>

      <!-- 特征全宽卡片 -->
      <view v-if="topResult.structured.features" class="feature-card">
        <text class="feature-card__title">外形特征</text>
        <text class="feature-card__text">{{ topResult.structured.features }}</text>
      </view>

      <!-- 标签组 -->
      <view class="tag-row">
        <view v-if="topResult.structured.alias" class="tag-item">
          <text class="tag-item__label">别名</text>
          <text class="tag-item__value">{{ topResult.structured.alias }}</text>
        </view>
        <view v-if="topResult.structured.breeding" class="tag-item">
          <text class="tag-item__label">繁殖期</text>
          <text class="tag-item__value">{{ topResult.structured.breeding }}</text>
        </view>
        <view v-if="topResult.structured.edible" class="tag-item">
          <text class="tag-item__label">可食用</text>
          <text class="tag-item__value">{{ topResult.structured.edible }}</text>
        </view>
      </view>

      <!-- 冷知识高亮 -->
      <view v-if="topResult.structured.fun_fact" class="funfact">
        <image class="funfact__icon" src="/static/icons/primary/info.svg" mode="aspectFit" />
        <text class="funfact__text">{{ topResult.structured.fun_fact }}</text>
      </view>
    </view>

    <!-- 相关图片 -->
    <view v-if="topResult && relatedImages.length" class="info-section">
      <text class="section-title">相关图片</text>
      <scroll-view scroll-x class="related-scroll">
        <view class="related-list">
          <image v-for="(img, idx) in relatedImages" :key="idx" :src="img.url" class="related-img" mode="aspectFill" />
        </view>
      </scroll-view>
    </view>

    <!-- 百科描述（无structured时显示） -->
    <view v-if="topResult && !topResult.structured && topResult.baike_info?.description" class="info-section">
      <text class="section-title">百科介绍</text>
      <text class="desc-text">{{ topResult.baike_info.description }}</text>
    </view>

    <!-- 候选鱼种 -->
    <view v-if="candidates.length > 0" class="info-section">
      <text class="section-title">其他可能</text>
      <scroll-view scroll-x class="candidates-scroll">
        <view class="candidates-list">
          <view v-for="(item, idx) in candidates" :key="idx" class="candidate-card" hover-class="candidate-card--active" @tap="switchTop(idx)">
            <image v-if="item.baike_info?.image_url" :src="item.baike_info.image_url" class="candidate-card__img" mode="aspectFill" />
            <view v-else class="candidate-card__img candidate-card__img--placeholder">
              <image src="/static/icons/muted/fish.svg" style="width:40rpx;height:40rpx" mode="aspectFit" />
            </view>
            <text class="candidate-card__name">{{ item.name }}</text>
            <text class="candidate-card__score" :class="confidenceClass(item.score)">
              {{ (parseFloat(item.score) * 100).toFixed(0) }}%
            </text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 贡献入口（数据库中无此鱼数据时显示） -->
    <view v-if="topResult && showContribute" class="info-section">
      <view class="contribute-card" hover-class="contribute-card--active" @tap="handleContribute">
        <view class="contribute-card__left">
          <image class="contribute-card__icon" src="/static/icons/primary/star.svg" mode="aspectFit" />
          <view class="contribute-card__text">
            <text class="contribute-card__title">贡献鱼种信息</text>
            <text class="contribute-card__desc">该鱼种暂无详细数据，AI 将帮你填充信息</text>
          </view>
        </view>
        <text class="contribute-card__arrow">›</text>
      </view>
    </view>

    <!-- 贡献表单弹窗 -->
    <view v-if="showContributeForm" class="form-mask" @tap="showContributeForm = false">
      <view class="form-panel" @tap.stop>
        <view class="form-panel__header">
          <text class="form-panel__title">贡献鱼种数据</text>
          <text class="form-panel__close" @tap="showContributeForm = false">×</text>
        </view>

        <scroll-view scroll-y class="form-panel__body">
          <!-- Loading 状态 -->
          <view v-if="contributeLoading" class="form-loading">
            <view class="form-loading__spinner"></view>
            <text class="form-loading__text">AI 正在搜索并生成数据</text>
            <text class="form-loading__sub">预计需要 10-30 秒...</text>
          </view>
          <!-- 表单内容 -->
          <view v-else-if="contributeData" class="form-content">
            <view class="form-field">
              <text class="form-field__label">鱼种名称</text>
              <text class="form-field__value">{{ contributeData.fish_name }}</text>
            </view>
            <view class="form-field">
              <text class="form-field__label">别名（逗号分隔）</text>
              <textarea class="form-field__textarea" v-model="contributeData.aliases" placeholder="如：白鱼,翘壳,翘嘴白" />
            </view>
            <view class="form-field">
              <text class="form-field__label">拉丁学名</text>
              <input class="form-field__input" v-model="contributeData.name_latin" />
            </view>
            <view class="form-field">
              <text class="form-field__label">栖息环境</text>
              <textarea class="form-field__textarea" v-model="contributeData.habitat" placeholder="栖息环境描述" />
            </view>
            <view class="form-field">
              <text class="form-field__label">难度</text>
              <view class="form-field__tags">
                <text v-for="d in ['easy','medium','hard']" :key="d" class="form-field__tag" :class="{'form-field__tag--active': contributeData.difficulty === d}" @tap="contributeData.difficulty = d">{{ {easy:'简单',medium:'中等',hard:'困难'}[d] }}</text>
              </view>
            </view>
            <view class="form-field">
              <text class="form-field__label">钓鱼技巧</text>
              <textarea class="form-field__textarea" v-model="contributeData.tip" placeholder="50字内的垂钓建议" />
            </view>
            <view class="form-field">
              <text class="form-field__label">分布省份</text>
              <text class="form-field__hint">{{ (contributeData.distribution_provinces || []).join('、') }}</text>
            </view>
            <view class="form-field">
              <text class="form-field__label">月活跃度 (1-10)</text>
              <text class="form-field__hint">{{ (contributeData.monthly_activity || []).join(', ') }}</text>
            </view>

            <view class="form-panel__actions">
              <view class="form-btn form-btn--submit" hover-class="form-btn--hover" @tap="submitContribution">
                <text class="form-btn__text">提交审核</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="actions">
      <view class="actions__btn actions__btn--primary" hover-class="actions__btn--hover" @tap="addToCollection">
        <image class="actions__icon" src="/static/icons/white/bookmark.svg" mode="aspectFit" />
        <text class="actions__text">收入图鉴</text>
      </view>
      <view class="actions__btn actions__btn--secondary" hover-class="actions__btn--hover" @tap="onShare">
        <image class="actions__icon" src="/static/icons/primary/share.svg" mode="aspectFit" />
        <text class="actions__text actions__text--dark">分享</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="!topResult && !loading" class="empty">
      <image class="empty__icon" src="/static/icons/muted/fish.svg" mode="aspectFit" />
      <text class="empty__text">未识别到鱼类</text>
      <text class="empty__sub">请尝试拍摄更清晰的照片</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CustomNav from '../../components/CustomNav.vue';
import { getTemp, removeTemp } from '../../utils/storage';
import { request } from '../../utils/api';
import { ensureLogin } from '../../utils/auth';

const imagePath = ref('');
const photoUrl = ref('');
const topResult = ref(null);
const candidates = ref([]);
const allResults = ref([]);
const loading = ref(true);
const showContribute = ref(false);
const showContributeForm = ref(false);
const contributeLoading = ref(false);
const contributeData = ref(null);
const fishCoverImage = ref('');
import { IMG_BASE } from '../../utils/config';

onMounted(() => {
  const data = getTemp('temp_result');
  removeTemp('temp_result');

  if (!data) {
    loading.value = false;
    return;
  }

  imagePath.value = data.imagePath || '';
  photoUrl.value = data.photoUrl || '';
  const results = (data.results || []).filter(
    r => r.name !== '非动物' && parseFloat(r.score) > 0.01
  );

  allResults.value = results;
  if (results.length > 0) {
    topResult.value = results[0];
    candidates.value = results.slice(1);
    // 检查鱼种是否已有完整数据
    checkContribute(results[0].name);
  }
  loading.value = false;
});

// 相关图片（百科图 + 用户拍照）
const relatedImages = computed(() => {
  const imgs = [];
  if (topResult.value?.baike_info?.image_url) {
    imgs.push({ url: topResult.value.baike_info.image_url, label: '百科' });
  }
  if (imagePath.value && fishCoverImage.value) {
    // 有封面图时，用户拍照作为相关图片展示
    imgs.push({ url: imagePath.value, label: '我的拍摄' });
  }
  return imgs;
});

// 置信度环样式
const ringStyle = computed(() => {
  if (!topResult.value) return {};
  const pct = parseFloat(topResult.value.score) * 100;
  const deg = (pct / 100) * 360;
  return {
    background: `conic-gradient(#FF590E ${deg}deg, #D8D8D8 ${deg}deg)`
  };
});

function confidenceLabel(score) {
  const s = parseFloat(score);
  if (s >= 0.8) return '非常匹配';
  if (s >= 0.5) return '可能是';
  return '也许是';
}

function confidenceClass(score) {
  const s = parseFloat(score);
  if (s >= 0.8) return 'confidence--high';
  if (s >= 0.5) return 'confidence--mid';
  return 'confidence--low';
}

async function switchTop(idx) {
  const selected = candidates.value[idx];
  if (!selected.structured && selected.baike_info?.description) {
    try {
      const res = await request({
        url: '/structurize',
        method: 'POST',
        data: { name: selected.name, description: selected.baike_info.description }
      });
      selected.structured = res.data.structured;
    } catch (e) {}
  }
  const prev = topResult.value;
  topResult.value = selected;
  candidates.value.splice(idx, 1);
  if (prev) candidates.value.unshift(prev);
}

async function addToCollection() {
  if (!topResult.value) return;
  const openid = await ensureLogin();
  if (!openid) return;
  try {
    const collectRes = await request({
      url: '/collection/add',
      method: 'POST',
      data: {
        openid,
        fish_name: topResult.value.name,
        image_url: photoUrl.value || topResult.value.baike_info?.image_url || '',
        baike_url: topResult.value.baike_info?.baike_url || '',
        description: topResult.value.baike_info?.description || '',
        structured: topResult.value.structured ? JSON.stringify(topResult.value.structured) : '',
        score: topResult.value.score
      }
    });
    const newBadges = collectRes.data?.new_badges || [];
    if (newBadges.length > 0) {
      const badgeNames = { first: '初识', five: '入门', ten: '钓友', twenty: '探索者', thirty: '达人', fifty: '大师', hundred: '百鱼斋主', legendary: '渔光传说' };
      const unlocked = newBadges.map(id => badgeNames[id] || id).join('、');
      uni.showToast({ title: `收藏成功！解锁：${unlocked}`, icon: 'none', duration: 3000 });
    } else {
      uni.showToast({ title: '已收入图鉴', icon: 'success' });
    }
  } catch (e) {
    uni.showToast({ title: e.message || '收藏失败', icon: 'none' });
  }
}

function onShare() {
  uni.showToast({ title: '分享功能开发中', icon: 'none' });
}

// === 贡献功能 ===
async function checkContribute(fishName) {
  try {
    const res = await request({ url: '/contribute/check', data: { fish_name: fishName } });
    showContribute.value = !res.data.has_data && !res.data.has_pending;

    // 获取鱼种封面图
    if (res.data.has_data) {
      const coverRes = await request({ url: '/fish/cover', data: { name: fishName } });
      if (coverRes.data.cover_image) {
        fishCoverImage.value = coverRes.data.cover_image.startsWith('http')
          ? coverRes.data.cover_image
          : IMG_BASE + coverRes.data.cover_image;
      }
    }
  } catch (e) {
    showContribute.value = false;
  }
}

async function handleContribute() {
  const openid = await ensureLogin();
  if (!openid) return;

  showContributeForm.value = true;
  contributeLoading.value = true;
  contributeData.value = null;

  try {
    const res = await request({
      url: '/contribute/generate',
      method: 'POST',
      data: { fish_name: topResult.value.name }
    });
    contributeData.value = res.data;
  } catch (e) {
    uni.showToast({ title: e.message || '生成失败', icon: 'none' });
    showContributeForm.value = false;
  } finally {
    contributeLoading.value = false;
  }
}

async function submitContribution() {
  if (!contributeData.value) return;
  const openid = await ensureLogin();
  if (!openid) return;

  try {
    await request({
      url: '/contribute/submit',
      method: 'POST',
      data: {
        openid,
        fish_name: contributeData.value.fish_name,
        name_latin: contributeData.value.name_latin,
        aliases: contributeData.value.aliases || '',
        monthly_activity: contributeData.value.monthly_activity,
        fishing_methods: contributeData.value.fishing_methods,
        recommended_bait: contributeData.value.recommended_bait,
        best_time: contributeData.value.best_time,
        water_temp_min: contributeData.value.water_temp_min,
        water_temp_max: contributeData.value.water_temp_max,
        habitat: contributeData.value.habitat,
        difficulty: contributeData.value.difficulty,
        tip: contributeData.value.tip,
        distribution_provinces: contributeData.value.distribution_provinces
      }
    });
    uni.showToast({ title: '提交成功，等待审核', icon: 'success' });
    showContributeForm.value = false;
    showContribute.value = false;
  } catch (e) {
    uni.showToast({ title: e.message || '提交失败', icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
.result {
  padding-bottom: 160rpx;
  background: #F6F6F6;
  min-height: 100vh;
}

/* Hero 区域 */
.hero {
  position: relative;
  height: 480rpx;
  overflow: hidden;
  border-bottom: 3px solid #222222;

  &__img {
    width: 100%;
    height: 100%;
  }

  &__overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.7));
  }

  &__content {
    position: absolute;
    bottom: 32rpx;
    left: 32rpx;
  }

  &__name {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-weight: 900;
    font-size: 44rpx;
    color: #FFFFFF;
    display: block;
    margin-bottom: 12rpx;
  }

  &__badge {
    display: inline-block;
    padding: 8rpx 20rpx;
    border-radius: 0;
    border: 2px solid #222222;
  }

  &__badge-text {
    font-size: 24rpx;
    font-weight: bold;
  }

  &__ring {
    position: absolute;
    bottom: 32rpx;
    right: 32rpx;
  }
}

/* 置信度环 */
.ring {
  width: 100rpx;
  height: 100rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &__circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    mask: radial-gradient(transparent 60%, black 61%);
    -webkit-mask: radial-gradient(transparent 60%, black 61%);
  }

  &__value {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-weight: 900;
    font-size: 28rpx;
    color: #FFFFFF;
    position: relative;
  }

  &__unit {
    font-size: 18rpx;
    color: rgba(255,255,255,0.8);
    position: relative;
  }
}

/* 信息区 */
.info-section {
  padding: 32rpx 24rpx 0;
}

.section-title {
  font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
  font-weight: 900;
  font-size: 30rpx;
  color: #222222;
  margin-bottom: 20rpx;
  display: block;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  background: #EEEEEE;
  border: 3px solid #222222;
  border-radius: 0;
  box-shadow: 4px 4px 0 #222222;
  padding: 20rpx;

  &__icon {
    width: 36rpx;
    height: 36rpx;
    flex-shrink: 0;
    margin-top: 2rpx;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: 20rpx;
    color: #A9A9A9;
    display: block;
  }

  &__value {
    font-size: 26rpx;
    color: #222222;
    margin-top: 4rpx;
    line-height: 1.3;
  }
}

/* 特征卡 */
.feature-card {
  background: #EEEEEE;
  border: 3px solid #222222;
  border-radius: 0;
  box-shadow: 4px 4px 0 #222222;
  padding: 20rpx;
  margin-bottom: 20rpx;

  &__title {
    font-size: 22rpx;
    color: #A9A9A9;
    display: block;
    margin-bottom: 8rpx;
  }

  &__text {
    font-size: 26rpx;
    color: #222222;
    line-height: 1.5;
  }
}

/* 标签组 */
.tag-row {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.tag-item {
  background: #D8D8D8;
  border: 2px solid #222222;
  border-radius: 0;
  padding: 12rpx 20rpx;

  &__label {
    font-size: 20rpx;
    color: #A9A9A9;
    display: block;
  }

  &__value {
    font-size: 24rpx;
    color: #222222;
    margin-top: 2rpx;
  }
}

/* 冷知识 */
.funfact {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  background: rgba(#FFD93D, 0.2);
  border: 3px solid #222222;
  border-radius: 0;
  box-shadow: 4px 4px 0 #222222;
  padding: 20rpx;
  margin-bottom: 24rpx;

  &__icon {
    width: 32rpx;
    height: 32rpx;
    flex-shrink: 0;
    margin-top: 2rpx;
  }

  &__text {
    font-size: 26rpx;
    color: #222222;
    line-height: 1.4;
  }
}

/* 相关图片 */
.related-scroll {
  white-space: nowrap;
  margin: 0 -24rpx;
  padding: 0 24rpx;
}
.related-list {
  display: inline-flex;
  gap: 12rpx;
}
.related-img {
  width: 240rpx;
  height: 160rpx;
  border-radius: 0;
  border: 3px solid #222222;
  flex-shrink: 0;
  display: inline-block;
}

/* 百科描述 */
.desc-text {
  font-size: 26rpx;
  color: #222222;
  line-height: 1.6;
  background: #EEEEEE;
  border: 3px solid #222222;
  border-radius: 0;
  box-shadow: 4px 4px 0 #222222;
  padding: 20rpx;
}

/* 候选鱼种 */
.candidates-scroll {
  white-space: nowrap;
  margin: 0 -24rpx;
  padding: 0 24rpx;
}

.candidates-list {
  display: inline-flex;
  gap: 16rpx;
  padding-bottom: 8rpx;
}

.candidate-card {
  width: 200rpx;
  flex-shrink: 0;
  background: #EEEEEE;
  border: 3px solid #222222;
  border-radius: 0;
  box-shadow: 4px 4px 0 #222222;
  overflow: hidden;
  display: inline-block;
  transition: box-shadow 150ms, transform 150ms;

  &--active {
    box-shadow: none;
    transform: translate(4px, 4px);
  }

  &__img {
    width: 200rpx;
    height: 140rpx;

    &--placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #D8D8D8;
    }
  }

  &__name {
    font-size: 24rpx;
    font-weight: bold;
    color: #222222;
    padding: 12rpx 12rpx 4rpx;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__score {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-weight: 900;
    font-size: 20rpx;
    padding: 4rpx 8rpx;
    border-radius: 0;
    border: 2px solid #222222;
    margin: 0 12rpx 12rpx;
    display: inline-block;
  }
}

/* 置信度颜色 */
.confidence {
  &--high {
    color: #222222;
    background: rgba(#B4EF4E, 0.3);
  }
  &--mid {
    color: #222222;
    background: rgba(#FFD93D, 0.3);
  }
  &--low {
    color: #A9A9A9;
    background: #D8D8D8;
  }
}

/* 底部操作栏 */
.actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #F6F6F6;
  border-top: 3px solid #222222;

  &__btn {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    border-radius: 999rpx;
    border: 3px solid #222222;
    box-shadow: 4px 4px 0 #222222;
    transition: box-shadow 150ms, transform 150ms;

    &--primary {
      background: #FF590E;
    }

    &--secondary {
      background: #EEEEEE;
    }

    &--hover {
      box-shadow: none;
      transform: translate(4px, 4px);
    }
  }

  &__icon {
    width: 32rpx;
    height: 32rpx;
  }

  &__text {
    font-size: 28rpx;
    color: #FFFFFF;
    font-weight: bold;

    &--dark {
      color: #222222;
    }
  }
}

/* 贡献卡片 */
.contribute-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(#FFD93D, 0.25);
  border: 3px solid #222222;
  border-radius: 0;
  box-shadow: 4px 4px 0 #222222;
  padding: 24rpx;
  transition: box-shadow 150ms, transform 150ms;

  &--active {
    box-shadow: none;
    transform: translate(4px, 4px);
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 16rpx;
    flex: 1;
  }

  &__icon { width: 48rpx; height: 48rpx; }

  &__text { flex: 1; }

  &__title {
    font-size: 28rpx;
    font-weight: bold;
    color: #222222;
    display: block;
  }

  &__desc {
    font-size: 22rpx;
    color: #A9A9A9;
    margin-top: 4rpx;
  }

  &__arrow {
    font-size: 36rpx;
    color: #222222;
  }
}

/* 贡献表单 */
.form-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.form-panel {
  width: 100%;
  max-height: 80vh;
  background: #F6F6F6;
  border: 3px solid #222222;
  border-radius: 0;
  box-shadow: 0 -8px 0 #222222;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 32rpx;
    border-bottom: 3px solid #D8D8D8;
  }

  &__title {
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
    font-weight: 900;
    font-size: 32rpx;
    color: #222222;
  }

  &__close {
    font-size: 48rpx;
    color: #A9A9A9;
    padding: 0 16rpx;
  }

  &__body {
    flex: 1;
    padding: 24rpx 32rpx;
    height: 60vh;
  }

  &__actions {
    padding: 24rpx 0;
  }
}

.form-loading {
  padding: 120rpx 0;
  text-align: center;
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
    font-family: 'SpaceGrotesk', -apple-system, 'PingFang SC', sans-serif;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-content {
  width: 100%;
  overflow: hidden;
}

.form-field {
  margin-bottom: 24rpx;

  &__label {
    font-size: 24rpx;
    color: #A9A9A9;
    margin-bottom: 8rpx;
    display: block;
  }

  &__value {
    font-size: 28rpx;
    color: #222222;
    font-weight: bold;
  }

  &__input {
    width: 100%;
    border: 3px solid #222222;
    border-radius: 0;
    padding: 16rpx;
    font-size: 26rpx;
    color: #222222;
    background: #EEEEEE;
    box-sizing: border-box;
    min-height: 64rpx;
  }

  &__textarea {
    width: 100%;
    border: 3px solid #222222;
    border-radius: 0;
    padding: 16rpx;
    font-size: 26rpx;
    color: #222222;
    background: #EEEEEE;
    box-sizing: border-box;
    min-height: 100rpx;
    line-height: 1.5;
  }

  &__hint {
    font-size: 24rpx;
    color: #A9A9A9;
    line-height: 1.5;
    word-break: break-all;
  }

  &__tags {
    display: flex;
    gap: 12rpx;
  }

  &__tag {
    padding: 10rpx 24rpx;
    font-size: 24rpx;
    color: #A9A9A9;
    background: #D8D8D8;
    border-radius: 0;
    border: 2px solid #222222;

    &--active {
      color: #222222;
      background: rgba(#B4EF4E, 0.3);
      border-color: #222222;
    }
  }
}

.form-btn {
  text-align: center;
  padding: 24rpx;
  border-radius: 999rpx;
  border: 3px solid #222222;
  box-shadow: 4px 4px 0 #222222;
  transition: box-shadow 150ms, transform 150ms;

  &--submit { background: #FF590E; }
  &--hover {
    box-shadow: none;
    transform: translate(4px, 4px);
  }

  &__text {
    font-size: 28rpx;
    color: #FFFFFF;
    font-weight: bold;
  }
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;

  &__icon {
    width: 120rpx;
    height: 120rpx;
    opacity: 0.3;
    margin-bottom: 24rpx;
  }

  &__text {
    font-size: 32rpx;
    color: #A9A9A9;
    font-weight: bold;
  }

  &__sub {
    font-size: 24rpx;
    color: #A9A9A9;
    margin-top: 8rpx;
  }
}
</style>
