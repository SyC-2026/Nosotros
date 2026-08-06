<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useNavigationStore } from '../stores/navigation.js'
import SideDrawer from './SideDrawer.vue'
import HomePage from './HomePage.vue'
import NuestroCaminoPage from '../pages/NuestroCaminoPage.vue'

const nav = useNavigationStore()

const currentComponent = computed(() => {
  switch (nav.currentPage) {
    case 'home':   return HomePage
    case 'camino': return NuestroCaminoPage
    default:       return HomePage
  }
})
</script>

<template>
  <div class="layout">
    <!-- Hamburger button — visible only when drawer is closed -->
    <transition name="btn-fade">
      <button
        v-if="!nav.isDrawerOpen"
        class="btn-hamburger"
        @click="nav.toggleDrawer()"
        aria-label="Abrir menú"
      >
        <Icon icon="mdi:menu" />
      </button>
    </transition>

    <!-- Side Drawer -->
    <SideDrawer />

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

/* ---- Hamburger button ---- */
.btn-hamburger {
  position: fixed;
  top: 1.1rem;
  left: 1.1rem;
  z-index: 200;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255, 252, 245, 0.9);
  border: 1.5px solid rgba(192, 148, 108, 0.35);
  box-shadow: 0 2px 12px rgba(120, 70, 30, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  color: #7a4f3a;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  backdrop-filter: blur(8px);
}
.btn-hamburger:hover {
  background: rgba(255, 248, 240, 1);
  box-shadow: 0 4px 18px rgba(120, 70, 30, 0.2);
  transform: scale(1.06);
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

/* ---- Hamburger fade ---- */
.btn-fade-enter-active,
.btn-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.btn-fade-enter-from,
.btn-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
