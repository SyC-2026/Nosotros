<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRelationshipStore } from './stores/relationship.js'
import { useRelationshipTheme } from './composables/useRelationshipTheme.js'
import { useSiteConfig } from './composables/useSiteConfig.js'
import LockScreen from './components/LockScreen.vue'
import MainLayout from './components/MainLayout.vue'
import MaintenancePage from './components/MaintenancePage.vue'
import DebugPanel from './components/DebugPanel.vue'
import confetti from 'canvas-confetti'

// Imágenes servidas desde /public/ — no se bundlean, carga lazy por el navegador
const base = import.meta.env.BASE_URL
const bgList = [
  '1.webp', '2.webp', '3.webp', '4.webp', '5.webp', '6.webp',
  '7.webp', '8.webp', '9.webp', '10.webp', '11.webp', '12.webp'
].map(f => `${base}backgrounds/${f}`)

const currentBgIndex = ref(0)
let bgInterval = null

const store = useRelationshipStore()
useRelationshipTheme()
const isUnlocked = computed(() => store.isUnlocked)

watch(isUnlocked, (newVal, oldVal) => {
  if (newVal && !oldVal && store.isCelebrationDay) {
    triggerConfetti()
  }
})

onMounted(() => {
  if (bgList.length > 1) {
    // Cambiar fondo automáticamente cada 7 segundos
    bgInterval = setInterval(() => {
      currentBgIndex.value = (currentBgIndex.value + 1) % bgList.length
    }, 7000)
  }

  // Trigger confetti si es día de celebración (14 de cada mes) y está desbloqueado
  if (store.isCelebrationDay && isUnlocked.value) {
    triggerConfetti()
  }
})

function triggerConfetti() {
  const duration = 5 * 1000 // 5 segundos de confetti
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 40 * (timeLeft / duration)
    // Tira confetti desde ambos lados de la pantalla
    confetti(Object.assign({}, defaults, { 
      particleCount, 
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
    }))
    confetti(Object.assign({}, defaults, { 
      particleCount, 
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
    }))
  }, 250)
}

onUnmounted(() => {
  if (bgInterval) clearInterval(bgInterval)
})

const { maintenanceMode } = useSiteConfig()

// Un único componente activo a la vez — Transition solo acepta un hijo
const currentView = computed(() => {
  if (maintenanceMode.value === null) return null   // Cargando config
  if (maintenanceMode.value)          return MaintenancePage
  if (!isUnlocked.value)              return LockScreen
  return MainLayout
})

const viewKey = computed(() => {
  if (maintenanceMode.value === null) return 'loading'
  if (maintenanceMode.value)          return 'maintenance'
  if (!isUnlocked.value)              return 'lock'
  return 'main'
})
</script>

<template>
  <!-- Fixed global background layer with smooth cross-fade slideshow -->
  <div class="global-bg-container">
    <transition-group name="bg-crossfade">
      <div
        v-for="(bg, idx) in bgList"
        v-show="idx === currentBgIndex"
        :key="bg"
        class="global-bg-image"
        :style="{ backgroundImage: `url(${bg})` }"
      ></div>
    </transition-group>
    <div class="global-bg-overlay"></div>
  </div>

  <transition name="page-transition" mode="out-in" appear>
    <component
      v-if="currentView"
      :is="currentView"
      :key="viewKey"
    />
  </transition>

  <DebugPanel />
</template>

<style>
.global-bg-container {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.global-bg-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.7; /* 👈 Opacidad de la imagen de fondo (de 0.0 a 1.0) */
  filter: grayscale(1.0) brightness(0.5); /* 👈 Intensidad del filtro blanco y negro (de 0.0 a 1.0) */
}

.global-bg-overlay {
  position: absolute;
  inset: 0;
  background: var(--theme-bg-gradient);
  opacity: 0.85; /* 👈 Opacidad del filtro de color del tema (de 0.0 a 1.0) */
  transition: background 0.4s ease;
}

/* Background Cross-fade Animation */
.bg-crossfade-enter-active,
.bg-crossfade-leave-active {
  transition: opacity 2s ease-in-out;
}

.bg-crossfade-enter-from,
.bg-crossfade-leave-to {
  opacity: 0;
}

.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.6s ease;
}
.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
}
</style>
