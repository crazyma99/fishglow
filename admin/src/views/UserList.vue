<template>
  <div class="page">
    <div class="page__header"><h1 class="page__title">用户管理</h1><p class="page__desc">查看注册用户</p></div>
    <div class="page__body">
      <div class="stats">
        <div class="stat"><span class="stat__value">{{ users.length }}</span><span class="stat__label">注册用户</span></div>
        <div class="stat"><span class="stat__value">{{ users.reduce((s,u)=>s+u.collection_count,0) }}</span><span class="stat__label">总收藏</span></div>
        <div class="stat"><span class="stat__value">{{ users.reduce((s,u)=>s+u.history_count,0) }}</span><span class="stat__label">总识别</span></div>
      </div>
      <div class="table-wrap" v-if="users.length"><table class="table">
        <thead><tr><th>头像</th><th>昵称</th><th>OpenID</th><th>图鉴</th><th>识别</th><th>贡献</th><th>注册时间</th></tr></thead>
        <tbody><tr v-for="u in users" :key="u.openid" @click="openUser(u)">
          <td><img v-if="u.avatar_url" :src="imgUrl(u.avatar_url)" class="avatar-sm" /><div v-else class="avatar-sm avatar-empty"></div></td>
          <td>{{ u.nickname || '未设置' }}</td>
          <td class="openid">{{ u.openid.slice(0,16) }}...</td>
          <td><span class="tag tag--primary">{{ u.collection_count }}</span></td>
          <td><span class="tag tag--blue">{{ u.history_count }}</span></td>
          <td><span :class="'tag '+(u.contribution_count?'tag--success':'')">{{ u.contribution_count }}</span></td>
          <td class="date">{{ u.created_at }}</td>
        </tr></tbody>
      </table></div>
      <div v-else class="empty">暂无注册用户</div>
    </div>

    <Drawer v-model="showDrawer" title="用户详情">
      <template v-if="current">
        <div class="field" style="text-align:center">
          <img v-if="current.avatar_url" :src="imgUrl(current.avatar_url)" class="avatar-lg" />
          <div v-else class="avatar-lg avatar-empty" style="margin:0 auto"></div>
        </div>
        <div class="field"><label>昵称</label><p>{{ current.nickname || '未设置' }}</p></div>
        <div class="field"><label>OpenID</label><p class="openid-full">{{ current.openid }}</p></div>
        <div class="field"><label>注册时间</label><p>{{ current.created_at }}</p></div>
        <div class="field"><label>数据统计</label>
          <div class="user-stats">
            <div class="user-stat" style="background:var(--primary-light)"><span class="user-stat__num" style="color:var(--primary)">{{ current.collection_count }}</span><span>图鉴</span></div>
            <div class="user-stat" style="background:var(--secondary-light)"><span class="user-stat__num" style="color:var(--secondary)">{{ current.history_count }}</span><span>识别</span></div>
            <div class="user-stat" style="background:var(--success-light)"><span class="user-stat__num" style="color:var(--success)">{{ current.contribution_count }}</span><span>贡献</span></div>
          </div>
        </div>
      </template>
    </Drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Drawer from '../components/Drawer.vue';
import { apiFetch, imgUrl, ADMIN_KEY } from '../utils/api';

const users = ref([]);
const showDrawer = ref(false);
const current = ref(null);

onMounted(async () => {
  const res = await apiFetch('/api/user/list?admin_key=' + ADMIN_KEY);
  users.value = res.data || [];
});

function openUser(u) { current.value = u; showDrawer.value = true; }
</script>

<style scoped>
.page__header { padding: 20px 24px; border-bottom: 1px solid var(--border); background: var(--card); }
.page__title { font-size: 18px; font-weight: 700; }
.page__desc { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.page__body { padding: 24px; }
.stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 24px; }
.stat { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; text-align: center; }
.stat__value { font-size: 28px; font-weight: 700; color: var(--primary); display: block; }
.stat__label { font-size: 12px; color: var(--text-secondary); }
.table-wrap { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; font-size: 11px; color: var(--text-secondary); text-transform: uppercase; padding: 12px 16px; background: var(--muted); border-bottom: 1px solid var(--border); }
.table td { padding: 12px 16px; border-bottom: 1px solid var(--muted); font-size: 13px; }
.table tbody tr { cursor: pointer; transition: background 150ms; }
.table tbody tr:hover { background: var(--primary-light); }
.openid { font-size: 11px; color: var(--text-secondary); }
.date { font-size: 12px; color: var(--text-secondary); }
.empty { text-align: center; padding: 60px; color: var(--text-secondary); }
.field { margin-bottom: 16px; }
.field label { font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px; }
.openid-full { font-size: 12px; word-break: break-all; color: var(--text-secondary); }
.user-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 8px; }
.user-stat { text-align: center; padding: 12px; border-radius: var(--radius); font-size: 11px; color: var(--text-secondary); }
.user-stat__num { display: block; font-size: 20px; font-weight: 700; }
.avatar-sm { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border); }
.avatar-lg { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border); }
.avatar-empty { background: var(--muted); display: flex; align-items: center; justify-content: center; }
</style>
