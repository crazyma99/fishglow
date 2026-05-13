<template>
  <Teleport to="body">
    <div class="drawer-mask" :class="{ open: modelValue }" @click="$emit('update:modelValue', false)"></div>
    <div class="drawer" :class="{ open: modelValue }">
      <div class="drawer__header">
        <span class="drawer__title">{{ title }}</span>
        <span class="drawer__close" @click="$emit('update:modelValue', false)">×</span>
      </div>
      <div class="drawer__body"><slot /></div>
      <div class="drawer__footer" v-if="$slots.footer"><slot name="footer" /></div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({ modelValue: Boolean, title: { type: String, default: '' } });
defineEmits(['update:modelValue']);
</script>

<style scoped>
.drawer-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 500; opacity: 0; pointer-events: none; transition: opacity 200ms; }
.drawer-mask.open { opacity: 1; pointer-events: auto; }
.drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 480px; background: var(--card); border-left: 1px solid var(--border); z-index: 600; transform: translateX(100%); transition: transform 250ms ease; display: flex; flex-direction: column; }
.drawer.open { transform: translateX(0); }
.drawer__header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.drawer__title { font-size: 16px; font-weight: 700; }
.drawer__close { font-size: 24px; cursor: pointer; color: var(--text-secondary); padding: 4px 8px; border-radius: var(--radius); }
.drawer__close:hover { background: var(--muted); }
.drawer__body { flex: 1; overflow-y: auto; padding: 20px; }
.drawer__footer { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; gap: 12px; }
</style>
