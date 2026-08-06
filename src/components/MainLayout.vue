<script setup>
import { computed } from 'vue'
import { useNavigationStore } from '../stores/navigation.js'
import HomePage from './HomePage.vue'
import NuestroCaminoPage from '../pages/NuestroCaminoPage.vue'
import LugaresVisitadosPage from '../pages/LugaresVisitadosPage.vue'
import CartasPage from '../pages/CartasPage.vue'
import NuestrosMomentosPage from '../pages/NuestrosMomentosPage.vue'

const nav = useNavigationStore()

const currentComponent = computed(() => {
  switch (nav.currentPage) {
    case 'home':     return HomePage
    case 'camino':   return NuestroCaminoPage
    case 'lugares':  return LugaresVisitadosPage
    case 'cartas':   return CartasPage
    case 'momentos': return NuestrosMomentosPage
    default:         return HomePage
  }
})
</script>

<template>
  <div class="layout">
    <!-- Page content -->
    <transition name="page-fade" mode="out-in">
      <component :is="currentComponent" :key="nav.currentPage" />
    </transition>
  </div>
</template>

<style scoped>
.layout {
  position: relative;
  min-height: 100vh;
}

/* ---- Page transition ---- */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
