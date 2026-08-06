<script setup>
import { Icon } from '@iconify/vue'
import { useNavigationStore } from '../stores/navigation.js'

const nav = useNavigationStore()

function goHome() {
  nav.navigate('home')
}
</script>

<template>
  <button class="btn-back" @click="goHome" title="Volver al inicio">
    <Icon icon="mdi:arrow-left" />
  </button>
</template>

<style scoped>
.btn-back {
  position: fixed;
  top: 1.1rem;
  left: 1.1rem;
  z-index: 200;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  color: var(--theme-text-main);
  cursor: pointer;
  transition: background 0.4s ease, border-color 0.4s ease, color 0.4s ease, transform 0.2s ease, box-shadow 0.2s ease;
  backdrop-filter: blur(8px);
}
.btn-back:hover {
  color: var(--theme-primary);
  border-color: var(--theme-secondary);
}
</style>
