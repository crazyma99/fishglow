<template>
  <div class="cropper-mask" v-if="visible" @click.self="$emit('cancel')">
    <div class="cropper-panel">
      <div class="cropper-header">
        <span class="cropper-title">裁剪封面图 ({{ ratioLabel }})</span>
        <span class="cropper-close" @click="$emit('cancel')">×</span>
      </div>
      <div class="cropper-body" ref="bodyRef">
        <div class="cropper-canvas" ref="canvasWrap" :style="{ width: displayW + 'px', height: displayH + 'px' }">
          <img :src="imgSrc" class="cropper-img" :style="imgStyle" draggable="false" />
          <!-- 裁剪框 -->
          <div class="crop-box" :style="cropBoxStyle" @mousedown="startDrag" @touchstart.prevent="startDrag">
            <div class="crop-box__border"></div>
            <!-- 网格线 -->
            <div class="crop-box__grid">
              <div class="grid-h" style="top:33.33%"></div>
              <div class="grid-h" style="top:66.66%"></div>
              <div class="grid-v" style="left:33.33%"></div>
              <div class="grid-v" style="left:66.66%"></div>
            </div>
          </div>
          <!-- 遮罩 -->
          <div class="crop-overlay crop-overlay--top" :style="{ height: cropY + 'px' }"></div>
          <div class="crop-overlay crop-overlay--bottom" :style="{ top: (cropY + cropH) + 'px', height: (displayH - cropY - cropH) + 'px' }"></div>
          <div class="crop-overlay crop-overlay--left" :style="{ top: cropY + 'px', height: cropH + 'px', width: cropX + 'px' }"></div>
          <div class="crop-overlay crop-overlay--right" :style="{ top: cropY + 'px', height: cropH + 'px', left: (cropX + cropW) + 'px', width: (displayW - cropX - cropW) + 'px' }"></div>
        </div>
        <!-- 缩放控制 -->
        <div class="cropper-zoom">
          <button class="zoom-btn" @click="zoomOut">−</button>
          <input type="range" min="0.5" max="3" step="0.1" v-model.number="scale" class="zoom-slider" />
          <button class="zoom-btn" @click="zoomIn">+</button>
        </div>
      </div>
      <div class="cropper-footer">
        <button class="btn btn--secondary" @click="$emit('cancel')">取消</button>
        <button class="btn btn--primary" @click="doCrop">确认裁剪</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  visible: Boolean,
  src: String,
  ratio: { type: Number, default: 3/2 },  // width/height
  outputWidth: { type: Number, default: 600 }
});

const emit = defineEmits(['crop', 'cancel']);

const ratioLabel = computed(() => {
  if (props.ratio === 3/2) return '3:2';
  if (props.ratio === 1) return '1:1';
  return `${props.ratio.toFixed(1)}:1`;
});

// Image state
const imgSrc = ref('');
const naturalW = ref(0);
const naturalH = ref(0);
const scale = ref(1);
const displayW = ref(400);
const displayH = ref(300);

// Crop box (relative to display canvas)
const cropX = ref(0);
const cropY = ref(0);
const cropW = ref(200);
const cropH = ref(133);

// Drag state
let dragging = false;
let dragStartX = 0, dragStartY = 0;
let dragStartCropX = 0, dragStartCropY = 0;

const imgStyle = computed(() => ({
  width: (naturalW.value * scale.value) + 'px',
  height: (naturalH.value * scale.value) + 'px',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)'
}));

const cropBoxStyle = computed(() => ({
  left: cropX.value + 'px',
  top: cropY.value + 'px',
  width: cropW.value + 'px',
  height: cropH.value + 'px'
}));

watch(() => props.src, (src) => {
  if (!src) return;
  imgSrc.value = src;
  const img = new Image();
  img.onload = () => {
    naturalW.value = img.width;
    naturalH.value = img.height;

    // Fit image into 400x400 canvas
    const maxSize = 400;
    const fitScale = Math.min(maxSize / img.width, maxSize / img.height, 1);
    scale.value = fitScale;
    displayW.value = Math.round(img.width * fitScale);
    displayH.value = Math.round(img.height * fitScale);

    // Init crop box: max size that fits ratio
    const r = props.ratio;
    if (displayW.value / displayH.value > r) {
      cropH.value = displayH.value;
      cropW.value = Math.round(displayH.value * r);
    } else {
      cropW.value = displayW.value;
      cropH.value = Math.round(displayW.value / r);
    }
    cropX.value = Math.round((displayW.value - cropW.value) / 2);
    cropY.value = Math.round((displayH.value - cropH.value) / 2);
  };
  img.src = src;
}, { immediate: true });

// Zoom
function zoomIn() { scale.value = Math.min(scale.value + 0.2, 3); updateDisplay(); }
function zoomOut() { scale.value = Math.max(scale.value - 0.2, 0.3); updateDisplay(); }

watch(scale, () => updateDisplay());

function updateDisplay() {
  displayW.value = Math.round(naturalW.value * scale.value);
  displayH.value = Math.round(naturalH.value * scale.value);
  // Constrain crop box
  cropX.value = Math.min(cropX.value, displayW.value - cropW.value);
  cropY.value = Math.min(cropY.value, displayH.value - cropH.value);
  cropX.value = Math.max(cropX.value, 0);
  cropY.value = Math.max(cropY.value, 0);
}

// Drag
function startDrag(e) {
  dragging = true;
  const ev = e.touches ? e.touches[0] : e;
  dragStartX = ev.clientX;
  dragStartY = ev.clientY;
  dragStartCropX = cropX.value;
  dragStartCropY = cropY.value;
}

function onDrag(e) {
  if (!dragging) return;
  const ev = e.touches ? e.touches[0] : e;
  let dx = ev.clientX - dragStartX;
  let dy = ev.clientY - dragStartY;
  let nx = dragStartCropX + dx;
  let ny = dragStartCropY + dy;
  nx = Math.max(0, Math.min(nx, displayW.value - cropW.value));
  ny = Math.max(0, Math.min(ny, displayH.value - cropH.value));
  cropX.value = nx;
  cropY.value = ny;
}

function stopDrag() { dragging = false; }

onMounted(() => {
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchmove', onDrag);
  window.addEventListener('touchend', stopDrag);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('touchmove', onDrag);
  window.removeEventListener('touchend', stopDrag);
});

// Crop output
function doCrop() {
  const canvas = document.createElement('canvas');
  const outW = props.outputWidth;
  const outH = Math.round(outW / props.ratio);
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');

  // Map crop box back to natural image coordinates
  const sx = cropX.value / scale.value;
  const sy = cropY.value / scale.value;
  const sw = cropW.value / scale.value;
  const sh = cropH.value / scale.value;

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
    canvas.toBlob((blob) => {
      emit('crop', blob);
    }, 'image/jpeg', 0.9);
  };
  img.src = imgSrc.value;
}
</script>

<style scoped>
.cropper-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
}

.cropper-panel {
  background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
  width: 520px; max-height: 90vh; display: flex; flex-direction: column;
}

.cropper-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 20px; border-bottom: 1px solid var(--border);
}
.cropper-title { font-size: 15px; font-weight: 700; }
.cropper-close { font-size: 22px; cursor: pointer; color: var(--text-secondary); padding: 2px 6px; }
.cropper-close:hover { background: var(--muted); border-radius: var(--radius); }

.cropper-body {
  padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 16px; overflow: auto;
}

.cropper-canvas {
  position: relative; overflow: hidden; background: #1a1a1a; border: 1px solid var(--border);
  user-select: none; cursor: crosshair;
}

.cropper-img { pointer-events: none; }

.crop-box {
  position: absolute; cursor: move; z-index: 10;
}

.crop-box__border {
  position: absolute; inset: 0;
  border: 2px solid #fff; box-shadow: 0 0 0 1px rgba(0,0,0,0.5);
}

.crop-box__grid { position: absolute; inset: 0; }
.grid-h { position: absolute; left: 0; right: 0; height: 1px; background: rgba(255,255,255,0.3); }
.grid-v { position: absolute; top: 0; bottom: 0; width: 1px; background: rgba(255,255,255,0.3); }

.crop-overlay { position: absolute; background: rgba(0,0,0,0.5); left: 0; right: 0; }
.crop-overlay--top { top: 0; left: 0; right: 0; }
.crop-overlay--bottom { left: 0; right: 0; }
.crop-overlay--left { left: 0; }
.crop-overlay--right { }

.cropper-zoom {
  display: flex; align-items: center; gap: 8px;
}
.zoom-btn {
  width: 28px; height: 28px; border: 1px solid var(--border); border-radius: var(--radius);
  background: var(--card); font-size: 16px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.zoom-btn:hover { background: var(--muted); }
.zoom-slider { width: 160px; }

.cropper-footer {
  padding: 14px 20px; border-top: 1px solid var(--border);
  display: flex; justify-content: flex-end; gap: 10px;
}
</style>
