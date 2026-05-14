<template>
  <div class="page">
    <div class="page__header">
      <div><h1 class="page__title">鱼种数据</h1><p class="page__desc">管理鱼种数据库，支持增删改查</p></div>
      <button class="btn btn--primary" @click="openCreate">+ 新增鱼种</button>
    </div>
    <div class="page__body">
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>封面</th><th>鱼种</th><th>难度</th><th>钓法</th><th>分布</th><th>来源</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="f in list" :key="f.id">
              <td><img v-if="f.cover_image" :src="imgUrl(f.cover_image)" class="cover-thumb" /><div v-else class="cover-empty">无图</div></td>
              <td class="clickable" @click="openDetail(f)"><strong>{{ f.name_zh }}</strong><br><span class="latin">{{ f.name_latin }}</span></td>
              <td><span :class="'tag tag--' + diffColor(f.difficulty)">{{ diffLabel(f.difficulty) }}</span></td>
              <td><span v-for="m in (parse(f.fishing_methods)||[]).slice(0,2)" :key="m" class="tag tag--primary">{{ m }}</span></td>
              <td>{{ (parse(f.distribution_provinces)||[]).length }}个</td>
              <td><span :class="'tag ' + (f.source==='community'?'tag--success':'tag--blue')">{{ f.source==='community'?'社区':'官方' }}</span></td>
              <td class="actions-cell">
                <button class="btn btn--secondary btn--sm" @click="openEdit(f)">编辑</button>
                <button class="btn btn--error btn--sm" @click="handleDelete(f)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Drawer -->
    <Drawer v-model="showDetail" :title="current?.name_zh || ''">
      <template v-if="current">
        <div class="field"><label>封面图 (16:9)</label>
          <div class="cover-preview">
            <img v-if="current.cover_image" :src="imgUrl(current.cover_image)" />
            <div v-else class="cover-preview__empty">暂无封面</div>
          </div>
          <input type="file" accept="image/*" @change="handleCoverUpload" style="margin-top:8px;font-size:12px" />
        </div>
        <div class="field"><label>拉丁学名</label><p class="latin">{{ current.name_latin || '-' }}</p></div>
        <div class="field"><label>别名</label><p>{{ current.aliases || '-' }}</p></div>
        <div class="field"><label>难度</label><span :class="'tag tag--' + diffColor(current.difficulty)">{{ diffLabel(current.difficulty) }}</span></div>
        <div class="field"><label>月活跃度</label>
          <div class="mini-chart"><div v-for="(v,i) in parse(current.monthly_activity)" :key="i" class="mini-chart__bar" :class="{ high: v>=7, mid: v>=4&&v<7 }" :style="{height: v*10+'%'}"></div></div>
        </div>
        <div class="field"><label>适宜水温</label><p>{{ current.water_temp_min }}°C - {{ current.water_temp_max }}°C</p></div>
        <div class="field"><label>栖息环境</label><p>{{ current.habitat || '-' }}</p></div>
        <div class="field"><label>钓法</label><span v-for="m in parse(current.fishing_methods)" :key="m" class="tag tag--primary">{{ m }}</span></div>
        <div class="field"><label>推荐饵料</label>
          <div v-for="s in ['spring','summer','autumn','winter']" :key="s" style="margin-bottom:4px">
            <span style="font-size:11px;color:var(--text-secondary)">{{ {spring:'春',summer:'夏',autumn:'秋',winter:'冬'}[s] }}:</span>
            <span v-for="b in (parse(current.recommended_bait)||{})[s]||[]" :key="b" class="tag">{{ b }}</span>
            <span v-if="!((parse(current.recommended_bait)||{})[s]||[]).length" style="font-size:12px;color:var(--text-secondary)">-</span>
          </div>
        </div>
        <div class="field"><label>最佳时间</label>
          <div v-for="s in ['spring','summer','autumn','winter']" :key="s" style="font-size:12px;margin-bottom:2px">
            <span style="color:var(--text-secondary)">{{ {spring:'春',summer:'夏',autumn:'秋',winter:'冬'}[s] }}:</span>
            {{ (parse(current.best_time)||{})[s] || '-' }}
          </div>
        </div>
        <div class="field"><label>分布省份 ({{ (parse(current.distribution_provinces)||[]).length }}个)</label><span v-for="p in parse(current.distribution_provinces)" :key="p" class="tag">{{ p }}</span></div>
        <div class="field"><label>钓鱼技巧</label><p>{{ current.tip || '-' }}</p></div>
        <div class="field"><label>来源</label><span :class="'tag '+(current.source==='community'?'tag--success':'tag--blue')">{{ current.source==='community'?'社区':'官方' }}</span></div>
      </template>
    </Drawer>

    <!-- Edit Drawer -->
    <Drawer v-model="showEdit" :title="editMode === 'create' ? '新增鱼种' : '编辑: ' + (editData.name_zh||'')">
      <div class="form">
        <div class="field"><label>鱼种名称 *</label><input v-model="editData.name_zh" placeholder="如：鲫鱼" /></div>
        <div class="field"><label>拉丁学名</label><input v-model="editData.name_latin" placeholder="Carassius auratus" /></div>
        <div class="field"><label>别名（逗号分隔）</label><input v-model="editData.aliases_str" placeholder="鲫瓜子,土鲫,银鲫" /></div>
        <div class="field"><label>难度</label>
          <div class="tag-btns"><span v-for="d in ['easy','medium','hard']" :key="d" class="tag-btn" :class="{active:editData.difficulty===d}" @click="editData.difficulty=d">{{ diffLabel(d) }}</span></div>
        </div>
        <div class="field"><label>栖息环境</label><textarea v-model="editData.habitat" placeholder="如：静水/缓流，水草区"></textarea></div>
        <div class="field"><label>适宜水温 (°C)</label>
          <div class="row"><input type="number" v-model.number="editData.water_temp_min" style="width:80px" /> <span>—</span> <input type="number" v-model.number="editData.water_temp_max" style="width:80px" /></div>
        </div>
        <div class="field"><label>钓法（逗号分隔）</label><input v-model="editData.fishing_methods_str" placeholder="台钓, 路亚, 传统钓" /></div>
        <div class="field"><label>春季饵料（逗号分隔）</label><input v-model="editData.bait_spring" /></div>
        <div class="field"><label>夏季饵料（逗号分隔）</label><input v-model="editData.bait_summer" /></div>
        <div class="field"><label>秋季饵料（逗号分隔）</label><input v-model="editData.bait_autumn" /></div>
        <div class="field"><label>冬季饵料（逗号分隔）</label><input v-model="editData.bait_winter" /></div>
        <div class="field"><label>春季最佳时间</label><input v-model="editData.time_spring" /></div>
        <div class="field"><label>夏季最佳时间</label><input v-model="editData.time_summer" /></div>
        <div class="field"><label>秋季最佳时间</label><input v-model="editData.time_autumn" /></div>
        <div class="field"><label>冬季最佳时间</label><input v-model="editData.time_winter" /></div>
        <div class="field"><label>月活跃度（12个数字，逗号分隔）</label><input v-model="editData.activity_str" placeholder="5,6,8,10,9,6,4,4,7,9,8,5" /></div>
        <div class="field"><label>分布省份（逗号分隔）</label><textarea v-model="editData.provinces_str"></textarea></div>
        <div class="field"><label>钓鱼技巧</label><textarea v-model="editData.tip"></textarea></div>
      </div>
      <template #footer>
        <button class="btn btn--primary" @click="submitEdit">{{ editMode === 'create' ? '创建' : '保存' }}</button>
        <button class="btn btn--secondary" @click="showEdit=false">取消</button>
      </template>
    </Drawer>

    <!-- 图片裁剪器 -->
    <ImageCropper :visible="showCropper" :src="cropperSrc" :ratio="16/9" :outputWidth="640" @crop="onCropDone" @cancel="showCropper=false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Drawer from '../components/Drawer.vue';
import ImageCropper from '../components/ImageCropper.vue';
import { apiFetch, imgUrl, ADMIN_KEY, API_BASE } from '../utils/api';

const list = ref([]);
const showDetail = ref(false);
const showEdit = ref(false);
const current = ref(null);
const editMode = ref('create');
const editData = ref({});

onMounted(loadList);

async function loadList() {
  const res = await apiFetch('/api/fish/list?admin_key=' + ADMIN_KEY);
  list.value = res.data || [];
}

function parse(v) {
  if (!v) return [];
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return []; }
}

function diffLabel(d) { return {easy:'简单',medium:'中等',hard:'困难'}[d]||d; }
function diffColor(d) { return d==='easy'?'success':d==='hard'?'error':'warning'; }

function openDetail(f) { current.value = f; showDetail.value = true; }

function openCreate() {
  editMode.value = 'create';
  editData.value = { name_zh:'', name_latin:'', aliases_str:'', difficulty:'medium', habitat:'', water_temp_min:15, water_temp_max:25, tip:'', fishing_methods_str:'', activity_str:'5,5,5,5,5,5,5,5,5,5,5,5', provinces_str:'', bait_spring:'', bait_summer:'', bait_autumn:'', bait_winter:'', time_spring:'', time_summer:'', time_autumn:'', time_winter:'' };
  showEdit.value = true;
}

function openEdit(f) {
  editMode.value = 'edit';
  const bait = parse(f.recommended_bait) || {};
  const time = parse(f.best_time) || {};
  editData.value = {
    id: f.id,
    name_zh: f.name_zh,
    name_latin: f.name_latin || '',
    aliases_str: f.aliases || '',
    difficulty: f.difficulty || 'medium',
    habitat: f.habitat || '',
    water_temp_min: f.water_temp_min || 0,
    water_temp_max: f.water_temp_max || 0,
    tip: f.tip || '',
    fishing_methods_str: (parse(f.fishing_methods)||[]).join(', '),
    activity_str: (parse(f.monthly_activity)||[]).join(', '),
    provinces_str: (parse(f.distribution_provinces)||[]).join(', '),
    bait_spring: (bait.spring||[]).join(', '),
    bait_summer: (bait.summer||[]).join(', '),
    bait_autumn: (bait.autumn||[]).join(', '),
    bait_winter: (bait.winter||[]).join(', '),
    time_spring: time.spring || '',
    time_summer: time.summer || '',
    time_autumn: time.autumn || '',
    time_winter: time.winter || '',
  };
  showEdit.value = true;
}

async function submitEdit() {
  const d = editData.value;
  const body = {
    admin_key: ADMIN_KEY,
    name_zh: d.name_zh,
    name_latin: d.name_latin,
    aliases: d.aliases_str || '',
    difficulty: d.difficulty,
    habitat: d.habitat,
    water_temp_min: d.water_temp_min,
    water_temp_max: d.water_temp_max,
    tip: d.tip,
    fishing_methods: d.fishing_methods_str.split(/[,，]/).map(s=>s.trim()).filter(Boolean),
    monthly_activity: d.activity_str.split(/[,，]/).map(s=>parseInt(s.trim())||5),
    distribution_provinces: d.provinces_str.split(/[,，]/).map(s=>s.trim()).filter(Boolean),
    recommended_bait: {
      spring: d.bait_spring.split(/[,，]/).map(s=>s.trim()).filter(Boolean),
      summer: d.bait_summer.split(/[,，]/).map(s=>s.trim()).filter(Boolean),
      autumn: d.bait_autumn.split(/[,，]/).map(s=>s.trim()).filter(Boolean),
      winter: d.bait_winter.split(/[,，]/).map(s=>s.trim()).filter(Boolean),
    },
    best_time: {
      spring: d.time_spring,
      summer: d.time_summer,
      autumn: d.time_autumn,
      winter: d.time_winter,
    },
  };
  if (editMode.value === 'edit') body.id = d.id;

  try {
    await apiFetch('/api/fish/' + (editMode.value==='create'?'create':'update'), 'POST', body);
    showEdit.value = false;
    loadList();
  } catch(e) { alert(e.message); }
}

async function handleDelete(f) {
  if (!confirm(`确定删除「${f.name_zh}」？此操作不可撤销。`)) return;
  try {
    await apiFetch('/api/fish/delete', 'POST', { admin_key: ADMIN_KEY, id: f.id });
    loadList();
  } catch(e) { alert(e.message); }
}

// 封面裁剪
const showCropper = ref(false);
const cropperSrc = ref('');

function handleCoverUpload(e) {
  const file = e.target.files[0];
  if (!file || !current.value) return;
  cropperSrc.value = URL.createObjectURL(file);
  showCropper.value = true;
}

async function onCropDone(blob) {
  showCropper.value = false;
  if (!blob || !current.value) return;

  const fd = new FormData();
  fd.append('image', blob, 'cover.jpg');
  fd.append('admin_key', ADMIN_KEY);
  fd.append('fish_id', current.value.id);
  try {
    const res = await fetch(API_BASE + '/api/fish/upload-cover', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.code === 0) { loadList(); showDetail.value = false; }
    else alert(data.msg);
  } catch(e) { alert(e.message); }
}
</script>

<style scoped>
.page__header { padding: 20px 24px; border-bottom: 1px solid var(--border); background: var(--card); display: flex; justify-content: space-between; align-items: center; }
.page__title { font-size: 18px; font-weight: 700; }
.page__desc { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.page__body { padding: 24px; }
.table-wrap { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; font-size: 11px; color: var(--text-secondary); text-transform: uppercase; padding: 12px 16px; background: var(--muted); border-bottom: 1px solid var(--border); }
.table td { padding: 12px 16px; border-bottom: 1px solid var(--muted); font-size: 13px; }
.table tr:last-child td { border-bottom: none; }
.clickable { cursor: pointer; }
.clickable:hover strong { color: var(--primary); }
.latin { color: var(--text-secondary); font-style: italic; font-size: 11px; }
.cover-thumb { width: 48px; height: 32px; object-fit: cover; border-radius: 2px; border: 1px solid var(--border); }
.cover-empty { width: 48px; height: 32px; background: var(--muted); border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--text-secondary); }
.actions-cell { white-space: nowrap; }
.btn--sm { font-size: 11px; padding: 4px 8px; }

.field { margin-bottom: 16px; }
.field label { font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px; }
.field input, .field textarea { width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: 8px 12px; font-size: 13px; font-family: var(--font); outline: none; }
.field input:focus, .field textarea:focus { border-color: var(--primary); }
.field textarea { min-height: 60px; resize: vertical; }
.row { display: flex; align-items: center; gap: 8px; }
.tag-btns { display: flex; gap: 8px; }
.tag-btn { padding: 6px 14px; font-size: 12px; border-radius: var(--radius); border: 1px solid var(--border); cursor: pointer; background: var(--card); }
.tag-btn.active { background: var(--primary-light); color: var(--primary); border-color: var(--primary); }

.cover-preview img { width: 100%; aspect-ratio: 3/2; object-fit: cover; border-radius: var(--radius); border: 1px solid var(--border); }
.cover-preview__empty { width: 100%; aspect-ratio: 3/2; background: var(--muted); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); border: 1px dashed var(--border); }

.mini-chart { display: flex; align-items: flex-end; gap: 2px; height: 40px; }
.mini-chart__bar { flex: 1; background: var(--border); border-radius: 2px 2px 0 0; min-height: 3px; }
.mini-chart__bar.high { background: var(--primary); }
.mini-chart__bar.mid { background: #FDBA74; }
</style>
