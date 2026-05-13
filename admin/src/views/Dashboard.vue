<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">仪表盘</h1>
      <p class="page__desc">数据概览与统计</p>
    </div>
    <div class="page__body">
      <div class="stats">
        <div class="stat"><span class="stat__value stat__value--primary">{{ stats.fishCount }}</span><span class="stat__label">鱼种总数</span></div>
        <div class="stat"><span class="stat__value stat__value--warning">{{ stats.pendingCount }}</span><span class="stat__label">待审核</span></div>
        <div class="stat"><span class="stat__value stat__value--success">{{ stats.communityCount }}</span><span class="stat__label">社区贡献</span></div>
        <div class="stat"><span class="stat__value stat__value--blue">{{ stats.userCount }}</span><span class="stat__label">注册用户</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiFetch, ADMIN_KEY } from '../utils/api';

const stats = ref({ fishCount: 0, pendingCount: 0, communityCount: 0, userCount: 0 });

onMounted(async () => {
  try {
    const [fishRes, contribRes, userRes] = await Promise.all([
      apiFetch('/api/fish/list?admin_key=' + ADMIN_KEY),
      apiFetch('/api/contribute/pending?admin_key=' + ADMIN_KEY),
      apiFetch('/api/user/list?admin_key=' + ADMIN_KEY),
    ]);
    const fish = fishRes.data || [];
    stats.value = {
      fishCount: fish.length,
      pendingCount: (contribRes.data || []).length,
      communityCount: fish.filter(f => f.source === 'community').length,
      userCount: (userRes.data || []).length,
    };
  } catch (e) { console.error(e); }
});
</script>

<style scoped>
.page__header { padding: 20px 24px; border-bottom: 1px solid var(--border); background: var(--card); }
.page__title { font-size: 18px; font-weight: 700; }
.page__desc { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.page__body { padding: 24px; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; text-align: center; }
.stat__value { font-size: 32px; font-weight: 700; display: block; }
.stat__value--primary { color: var(--primary); }
.stat__value--warning { color: var(--warning); }
.stat__value--success { color: var(--success); }
.stat__value--blue { color: var(--secondary); }
.stat__label { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
</style>
