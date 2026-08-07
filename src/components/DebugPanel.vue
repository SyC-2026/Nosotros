<script setup>
import { ref, onMounted } from 'vue'
import { isDebugMode, fakeDate, getNow } from '../utils/debug.js'

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const expanded = ref(false)
const localDate = ref('')

onMounted(() => {
  if (isLocalhost) {
    const d = new Date()
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    localDate.value = d.toISOString().slice(0,16)
  }
})

function applyDate() {
  if (localDate.value) {
    fakeDate.value = new Date(localDate.value)
  }
}

function clearDate() {
  fakeDate.value = null
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  localDate.value = d.toISOString().slice(0,16)
}
</script>

<template>
  <div v-if="isLocalhost" class="debug-panel" :class="{ 'is-expanded': expanded }">
    <button class="debug-toggle" @click="expanded = !expanded">
      🐞 Debug
    </button>
    <div v-if="expanded" class="debug-content">
      <label class="debug-label">
        <input type="checkbox" v-model="isDebugMode" /> Activar Fake Date
      </label>
      <input type="datetime-local" class="debug-input" v-model="localDate" :disabled="!isDebugMode" />
      <div class="debug-actions">
        <button class="debug-btn" @click="applyDate" :disabled="!isDebugMode">Aplicar</button>
        <button class="debug-btn" @click="clearDate" :disabled="!isDebugMode">Reset</button>
      </div>
      <p class="debug-info">Ahora: {{ getNow().toLocaleString('es-AR') }}</p>
    </div>
  </div>
</template>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: rgba(15, 10, 5, 0.9);
  backdrop-filter: blur(8px);
  color: white;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 99999;
  font-family: monospace;
  font-size: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
}
.debug-toggle {
  background: none;
  border: none;
  color: #fbbf24;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.debug-content {
  margin-top: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  border-top: 1px solid rgba(255,255,255,0.2);
  padding-top: 0.8rem;
}
.debug-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
}
.debug-input {
  background: rgba(255,255,255,0.1);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  padding: 0.3rem;
  color-scheme: dark;
}
.debug-actions {
  display: flex;
  gap: 0.5rem;
}
.debug-btn {
  flex: 1;
  background: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
  padding: 0.35rem;
}
.debug-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.debug-btn:not(:disabled):hover {
  background: #444;
}
.debug-info {
  margin: 0;
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
}
</style>
