<template>
  <div class="page">
    <div class="page__header"><h1 class="page__title">审核列表</h1><p class="page__desc">审核用户贡献的鱼种数据</p></div>
    <div class="page__body">
      <div v-if="list.length === 0" class="empty">暂无待审核贡献</div>
      <div v-else class="table-wrap"><table class="table">
        <thead><tr><th>鱼种</th><th>难度</th><th>钓法</th><th>省份数</th><th>提交时间</th><th>操作</th></tr></thead>
        <tbody><tr v-for="c in list" :key="c.id">
          <td><strong>{{ c.fish_name }}</strong></td>
          <td>{{ diffLabel(c.difficulty) }}</td>
          <td><span v-for="m in parse(c.fishing_methods).slice(0,2)" :key="m" class="tag tag--primary">{{ m }}</span></td>
          <td>{{ parse(c.distribution_provinces).length }}个</td>
          <td class="date">{{ c.created_at }}</td>
          <td class="actions-cell">
            <button class="btn btn--success btn--sm" @click="openReview(c)">审核</button>
          </td>
        </tr></tbody>
      </table></div>
    </div>

    <Drawer v-model="showDrawer" :title="'审核: ' + (current?.fish_name||'')">
      <template v-if="current">
        <div class="field"><label>鱼种</label><p><strong>{{ current.fish_name }}</strong></p></div>
        <div class="field"><label>拉丁学名</label><p class="latin">{{ current.name_latin || '-' }}</p></div>
        <div class="field"><label>难度</label><span :class="'tag tag--'+diffColor(current.difficulty)">{{ diffLabel(current.difficulty) }}</span></div>
        <div class="field"><label>月活跃度</label>
          <div class="mini-chart"><div v-for="(v,i) in parse(current.monthly_activity)" :key="i" class="mini-chart__bar" :class="{high:v>=7,mid:v>=4&&v<7}" :style="{height:v*10+'%'}"></div></div>
        </div>
        <div class="field"><label>水温</label><p>{{ current.water_temp_min }}°C - {{ current.water_temp_max }}°C</p></div>
        <div class="field"><label>栖息环境</label><p>{{ current.habitat }}</p></div>
        <div class="field"><label>钓法</label><span v-for="m in parse(current.fishing_methods)" :key="m" class="tag tag--primary">{{ m }}</span></div>
        <div class="field"><label>省份</label><span v-for="p in parse(current.distribution_provinces)" :key="p" class="tag">{{ p }}</span></div>
        <div class="field"><label>技巧</label><p>{{ current.tip }}</p></div>
        <div class="field"><label>提交者</label><p class="date">{{ current.openid }}</p></div>
        <div class="field"><label>审核备注</label><input v-model="reviewNote" placeholder="可选" /></div>
      </template>
      <template #footer>
        <button class="btn btn--success" @click="doReview('approve')">通过入库</button>
        <button class="btn btn--error" @click="doReview('reject')">拒绝</button>
      </template>
    </Drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Drawer from '../components/Drawer.vue';
import { apiFetch, ADMIN_KEY } from '../utils/api';

const list = ref([]);
const showDrawer = ref(false);
const current = ref(null);
const reviewNote = ref('');

onMounted(loadList);

async function loadList() {
  const res = await apiFetch('/api/contribute/pending?admin_key=' + ADMIN_KEY);
  list.value = (res.data || []).filter(c => c.status === 'pending');
}

function parse(v) { if (!v) return []; if (typeof v!=='string') return v; try { return JSON.parse(v); } catch { return []; } }
function diffLabel(d) { return {easy:'简单',medium:'中等',hard:'困难'}[d]||d; }
function diffColor(d) { return d==='easy'?'success':d==='hard'?'error':'warning'; }

function openReview(c) { current.value = c; reviewNote.value = ''; showDrawer.value = true; }

async function doReview(action) {
  try {
    await apiFetch('/api/contribute/review', 'POST', { admin_key: ADMIN_KEY, id: current.value.id, action, reviewer_note: reviewNote.value });
    showDrawer.value = false;
    loadList();
  } catch(e) { alert(e.message); }
}
</script>

<style scoped>
.page__header { padding: 20px 24px; border-bottom: 1px solid var(--border); background: var(--card); }
.page__title { font-size: 18px; font-weight: 700; }
.page__desc { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.page__body { padding: 24px; }
.table-wrap { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; font-size: 11px; color: var(--text-secondary); text-transform: uppercase; padding: 12px 16px; background: var(--muted); border-bottom: 1px solid var(--border); }
.table td { padding: 12px 16px; border-bottom: 1px solid var(--muted); font-size: 13px; }
.actions-cell { white-space: nowrap; }
.btn--sm { font-size: 11px; padding: 4px 8px; }
.empty { text-align: center; padding: 60px; color: var(--text-secondary); }
.date { font-size: 12px; color: var(--text-secondary); }
.latin { font-style: italic; color: var(--text-secondary); }
.field { margin-bottom: 16px; }
.field label { font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px; }
.field input { width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: 8px 12px; font-size: 13px; outline: none; }
.field input:focus { border-color: var(--primary); }
.mini-chart { display: flex; align-items: flex-end; gap: 2px; height: 40px; }
.mini-chart__bar { flex: 1; background: var(--border); border-radius: 2px 2px 0 0; min-height: 3px; }
.mini-chart__bar.high { background: var(--primary); }
.mini-chart__bar.mid { background: #FDBA74; }
</style>
