<script setup>
import { Icon } from '@iconify/vue'
import { useNavigationStore } from '../stores/navigation.js'
import { useRelationshipStore } from '../stores/relationship.js'

const nav = useNavigationStore()
const rel = useRelationshipStore()

const menuItems = [
  { id: 'home',     label: 'Inicio',         icon: 'boxicons:home-heart' },
  { id: 'camino',   label: 'Nuestro camino',  icon: 'mdi:timeline-outline' },
]
</script>

<template>
  <!-- Backdrop -->
  <transition name="backdrop-fade">
    <div
      v-if="nav.isDrawerOpen"
      class="drawer-backdrop"
      @click="nav.closeDrawer()"
    ></div>
  </transition>

  <!-- Drawer panel -->
  <transition name="drawer-slide">
    <aside v-if="nav.isDrawerOpen" class="drawer">

      <!-- Drawer header -->
      <div class="drawer-header">
        <div class="drawer-title-group">
          <Icon icon="mdi:heart" class="drawer-heart-icon" />
          <div>
            <p class="drawer-couple">{{ rel.coupleNames }}</p>
            <p class="drawer-since">Desde el 14 de julio de 2026</p>
          </div>
        </div>
        <!-- <button class="btn-close" @click="nav.closeDrawer()" aria-label="Cerrar menú">
          <Icon icon="mdi:close" />
        </button> -->
      </div>

      <!-- Ornament -->
      <div class="drawer-ornament">
        <span class="orn-line"></span>
        <span class="orn-flower">✿</span>
        <span class="orn-line"></span>
      </div>

      <!-- Nav items -->
      <nav class="drawer-nav">
        <button
          v-for="item in menuItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: nav.currentPage === item.id }"
          @click="nav.navigate(item.id)"
        >
          <Icon :icon="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
          <Icon
            v-if="nav.currentPage === item.id"
            icon="mdi:chevron-right"
            class="nav-active-arrow"
          />
        </button>
      </nav>

      <!-- Footer -->
      <div class="drawer-footer">
        <Icon icon="mdi:heart" class="footer-icon" />
        <span>Solo para nosotros</span>
        <Icon icon="mdi:heart" class="footer-icon" />
      </div>
    </aside>
  </transition>
</template>

<style scoped>
/* ---- Backdrop ---- */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 100;
}

/* ---- Drawer panel ---- */
.drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  z-index: 101;
  background: var(--theme-drawer-bg);
  border-right: 1.5px solid var(--theme-card-border);
  box-shadow: 4px 0 32px rgba(0, 0, 0, 0.14);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.4s ease;
}

/* ---- Drawer header ---- */
.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.75rem 1.5rem 1.25rem;
  background: var(--theme-drawer-header-bg);
  border-bottom: 1px solid var(--theme-card-border);
}
.drawer-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.drawer-heart-icon {
  font-size: 1.6rem;
  color: var(--theme-primary);
  flex-shrink: 0;
}
.drawer-couple {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--theme-text-main);
  line-height: 1.2;
}
.drawer-since {
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.72rem;
  color: var(--theme-text-muted);
  margin-top: 2px;
  letter-spacing: 0.02em;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.3rem;
  color: #a07850;
  opacity: 0.7;
  transition: opacity 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 4px;
}
.btn-close:hover {
  opacity: 1;
  transform: rotate(90deg);
}

/* ---- Ornament ---- */
.drawer-ornament {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 1.5rem;
}
.orn-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--theme-secondary), transparent);
}
.orn-flower {
  font-size: 0.75rem;
  color: var(--theme-secondary);
  letter-spacing: 4px;
}

/* ---- Nav items ---- */
.drawer-nav {
  flex: 1;
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.18s ease, transform 0.15s ease;
  position: relative;
}
.nav-item:hover {
  background: var(--theme-badge-bg);
  transform: translateX(3px);
}
.nav-item.active {
  background: var(--theme-drawer-header-bg);
}

.nav-icon {
  font-size: 1.3rem;
  color: var(--theme-text-muted);
  flex-shrink: 0;
  transition: color 0.18s;
}
.nav-item.active .nav-icon {
  color: var(--theme-primary);
}

.nav-label {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--theme-text-main);
  flex: 1;
  letter-spacing: 0.02em;
}

.nav-active-arrow {
  font-size: 1.1rem;
  color: var(--theme-primary);
}

/* ---- Drawer footer ---- */
.drawer-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.75rem;
  color: var(--theme-text-muted);
  letter-spacing: 0.06em;
  border-top: 1px solid var(--theme-card-border);
}
.footer-icon {
  font-size: 0.75rem;
  color: var(--theme-primary);
}

/* ---- Transitions ---- */
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(-100%);
}
</style>
