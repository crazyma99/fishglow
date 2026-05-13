<template>
  <div class="layout" v-if="authed">
    <aside class="sidebar">
      <div class="sidebar__brand">
        <img class="sidebar__logo-img" src="/logo.svg" alt="渔光" />
      </div>
      <nav class="sidebar__nav">
        <router-link to="/dashboard" class="nav-item" active-class="nav-item--active">仪表盘</router-link>
        <router-link to="/fish" class="nav-item" active-class="nav-item--active">鱼种数据</router-link>
        <router-link to="/review" class="nav-item" active-class="nav-item--active">审核列表</router-link>
        <router-link to="/users" class="nav-item" active-class="nav-item--active">用户管理</router-link>
      </nav>
    </aside>
    <main class="content">
      <router-view />
    </main>
  </div>
  <div class="login-wrap" v-else>
    <div class="login-card">
      <div class="login-card__title">渔光管理后台</div>
      <div class="login-card__desc">输入管理密钥进入后台</div>
      <input class="login-card__input" type="password" v-model="key" placeholder="管理密钥" @keydown.enter="doLogin" />
      <button class="login-card__btn" @click="doLogin">进入后台</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ADMIN_KEY } from './utils/api';

const authed = ref(sessionStorage.getItem('admin_authed') === '1');
const key = ref('');

function doLogin() {
  if (key.value === ADMIN_KEY) {
    authed.value = true;
    sessionStorage.setItem('admin_authed', '1');
  } else {
    alert('密钥错误');
  }
}
</script>

<style scoped>
.layout { display: flex; height: 100vh; }
.sidebar { width: 220px; background: var(--card); border-right: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0; }
.sidebar__brand { padding: 16px 20px; border-bottom: 1px solid var(--border); }
.sidebar__logo-img { height: 28px; }
.sidebar__nav { flex: 1; padding: 12px 0; }
.nav-item { display: block; padding: 10px 20px; color: var(--text-secondary); font-size: 13px; font-weight: 500; text-decoration: none; border-left: 3px solid transparent; transition: all 150ms; }
.nav-item:hover { background: var(--muted); color: var(--text); }
.nav-item--active { background: var(--primary-light); color: var(--primary); border-left-color: var(--primary); font-weight: 600; }
.content { flex: 1; overflow-y: auto; }

.login-wrap { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.login-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 40px; width: 360px; }
.login-card__title { font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px; }
.login-card__desc { font-size: 13px; color: var(--text-secondary); text-align: center; margin-bottom: 24px; }
.login-card__input { width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 16px; font-size: 14px; margin-bottom: 16px; outline: none; font-family: var(--font); }
.login-card__input:focus { border-color: var(--primary); }
.login-card__btn { width: 100%; padding: 12px; background: var(--primary); color: white; border: none; border-radius: var(--radius); font-size: 14px; font-weight: 600; cursor: pointer; }
</style>
