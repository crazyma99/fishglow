<template>
  <div class="form">
    <div class="field">
      <label class="field__label">鱼种名称 *</label>
      <input class="field__input" v-model="form.name_zh" placeholder="如：鲫鱼" />
    </div>
    <div class="field">
      <label class="field__label">拉丁学名</label>
      <input class="field__input" v-model="form.name_latin" placeholder="如：Carassius auratus" />
    </div>
    <div class="field">
      <label class="field__label">难度</label>
      <div class="field__tags">
        <span v-for="d in ['easy','medium','hard']" :key="d" class="tag-btn" :class="{ active: form.difficulty === d }" @click="form.difficulty = d">{{ {easy:'简单',medium:'中等',hard:'困难'}[d] }}</span>
      </div>
    </div>
    <div class="field">
      <label class="field__label">栖息环境</label>
      <input class="field__input" v-model="form.habitat" placeholder="如：静水/缓流，水草区" />
    </div>
    <div class="field">
      <label class="field__label">适宜水温 (°C)</label>
      <div class="field__row">
        <input class="field__input field__input--sm" type="number" v-model.number="form.water_temp_min" placeholder="最低" />
        <span style="color:var(--text-secondary)">—</span>
        <input class="field__input field__input--sm" type="number" v-model.number="form.water_temp_max" placeholder="最高" />
      </div>
    </div>
    <div class="field">
      <label class="field__label">钓法（逗号分隔）</label>
      <input class="field__input" v-model="fishingMethodsStr" placeholder="如：台钓, 传统钓, 路亚" />
    </div>
    <div class="field">
      <label class="field__label">月活跃度（12个数字，逗号分隔，1-10）</label>
      <input class="field__input" v-model="activityStr" placeholder="如：5,6,8,10,9,6,4,4,7,9,8,5" />
    </div>
    <div class="field">
      <label class="field__label">分布省份（逗号分隔）</label>
      <textarea class="field__input field__input--area" v-model="provincesStr" placeholder="如：广东,湖南,四川,江苏"></textarea>
    </div>
    <div class="field">
      <label class="field__label">钓鱼技巧</label>
      <textarea class="field__input field__input--area" v-model="form.tip" placeholder="50字内的垂钓建议"></textarea>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';

const props = defineProps({
  initial: { type: Object, default: () => ({}) }
});

const form = reactive({
  name_zh: props.initial.name_zh || '',
  name_latin: props.initial.name_latin || '',
  difficulty: props.initial.difficulty || 'medium',
  habitat: props.initial.habitat || '',
  water_temp_min: props.initial.water_temp_min || 0,
  water_temp_max: props.initial.water_temp_max || 0,
  tip: props.initial.tip || '',
});

const fishingMethodsStr = ref((props.initial.fishing_methods || []).join(', '));
const activityStr = ref((props.initial.monthly_activity || []).join(', '));
const provincesStr = ref((props.initial.distribution_provinces || []).join(', '));

// 暴露 getData 给父组件
function getData() {
  return {
    name_zh: form.name_zh,
    name_latin: form.name_latin,
    difficulty: form.difficulty,
    habitat: form.habitat,
    water_temp_min: form.water_temp_min,
    water_temp_max: form.water_temp_max,
    tip: form.tip,
    fishing_methods: fishingMethodsStr.value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
    monthly_activity: activityStr.value.split(/[,，]/).map(s => parseInt(s.trim()) || 5),
    distribution_provinces: provincesStr.value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
  };
}

defineExpose({ form, getData });
</script>

<style scoped>
.form { display: flex; flex-direction: column; gap: 16px; }
.field__label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; display: block; }
.field__input { width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: 8px 12px; font-size: 13px; font-family: var(--font); outline: none; }
.field__input:focus { border-color: var(--primary); }
.field__input--sm { width: 100px; }
.field__input--area { min-height: 60px; resize: vertical; }
.field__row { display: flex; align-items: center; gap: 8px; }
.field__tags { display: flex; gap: 8px; }
.tag-btn { padding: 6px 14px; font-size: 12px; border-radius: var(--radius); border: 1px solid var(--border); cursor: pointer; background: var(--card); color: var(--text-secondary); transition: all 150ms; }
.tag-btn.active { background: var(--primary-light); color: var(--primary); border-color: var(--primary); }
</style>
