<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRelationshipStore } from '../stores/relationship.js'
import vintageBg from '../assets/vintage_bg.png'
import TimerCard from './TimerCard.vue'
import { Icon } from '@iconify/vue'

const store = useRelationshipStore()

// Live day counter (updates every minute)
const daysCount = ref(store.daysTogther)
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    daysCount.value = store.daysTogther
  }, 60000)
})
onUnmounted(() => clearInterval(timer))

// Format the start date nicely
const startDateFormatted = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(store.startDate)

// Lock the app (go back to LockScreen)
function handleLock() {
  store.lock()
}
</script>

<template>
  <div class="home" :style="{ backgroundImage: `url(${vintageBg})` }">
    <div class="overlay"></div>

    <!-- Header -->
    <header class="site-header">
      <div class="header-ornament">✵</div>
      <h1 class="site-title">Santi & Cami</h1>
      <div class="header-ornament">✵</div>
    </header>

    <main class="content">

      <!-- Hero Card — Days together -->
      <section class="hero-card">
        <p class="hero-since">Desde el {{ startDateFormatted }}</p>
        <div class="days-display">
          <span class="days-number">{{ daysCount }}</span>
          <span class="days-label">{{ daysCount === 1 ? 'día juntos' : 'días juntos' }}</span>
        </div>
        <div class="hero-divider">
          <span class="ornament-line"></span>
          <span class="small-heart">♥</span>
          <span class="ornament-line"></span>
        </div>
        <p class="hero-quote">
          “Contigo, cada día ordinario se convierte en el favorito de mi vida.”
        </p>
      </section>

      <!-- Timers Section -->
      <section class="timers-section">
        <div class="section-header">
          <span class="ornament-line long"></span>
          <h2 class="section-title">Nuestros tiempos</h2>
          <span class="ornament-line long"></span>
        </div>

        <div class="timers-grid">
          <TimerCard
            label="Primera vez que hablamos"
            icon="mdi:message-text-outline"
            since="2026-05-18T14:56:00-03:00"
          />
          <TimerCard
            label="Primera vez que nos vimos"
            icon="mdi:eye-outline"
            since="2026-06-20T16:30:00-03:00"
          />
          <TimerCard
            label="El día que nos pusimos de novios"
            icon="mdi:heart"
            since="2026-07-14T00:00:00-03:00"
          />
        </div>
      </section>

      <!-- Milestones Section -->
      <section class="milestones-section">
        <div class="section-header">
          <span class="ornament-line long"></span>
          <h2 class="section-title">Nuestros momentos</h2>
          <span class="ornament-line long"></span>
        </div>

        <div class="milestones-grid">
          <div
            v-for="milestone in store.milestones"
            :key="milestone.id"
            class="milestone-card"
            :class="{ locked: !milestone.unlocked }"
          >
            <div class="milestone-icon">
              <Icon :icon="milestone.icon" />
            </div>
            <div class="milestone-body">
              <span class="milestone-date">{{ milestone.date }}</span>
              <h3 class="milestone-title">{{ milestone.title }}</h3>
              <p v-if="milestone.unlocked" class="milestone-desc">{{ milestone.description }}</p>
              <p v-else class="milestone-locked-text">
                <Icon icon="mdi:lock-outline" class="inline-icon" /> Próximamente...
              </p>
            </div>
          </div>
        </div>
      </section>

    </main>

    <!-- Footer -->
    <footer class="site-footer">
      <p>Santi & Cami · Hecho con <Icon icon="mdi:heart" class="footer-heart" /></p>
      <button class="btn-lock" @click="handleLock" title="Salir">
        <Icon icon="mdi:lock-open-variant-outline" />
      </button>
    </footer>
  </div>
</template>

<style scoped>
/* ---- Base ---- */
.home {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  font-family: 'Lato', system-ui, sans-serif;
}

.overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(255, 250, 242, 0.88) 0%,
    rgba(253, 238, 218, 0.82) 60%,
    rgba(255, 242, 230, 0.88) 100%
  );
  pointer-events: none;
}

/* ---- Header ---- */
.site-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2.5rem 2rem 1rem;
  text-align: center;
}
.site-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 2.8rem;
  font-weight: 700;
  color: #5c3d2e;
  letter-spacing: 0.06em;
  margin: 0;
}
.header-ornament {
  font-size: 1.2rem;
  color: #c0946c;
}

/* ---- Main content ---- */
.content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 860px;
  padding: 1rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* ---- Hero card ---- */
.hero-card {
  background: rgba(255, 252, 245, 0.85);
  border: 1.5px solid rgba(192, 148, 108, 0.3);
  border-radius: 4px;
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow:
    0 4px 20px rgba(160, 110, 60, 0.1),
    inset 0 0 0 6px rgba(192, 148, 108, 0.05);
}
.hero-since {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #a07850;
  margin-bottom: 1.25rem;
}
.days-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}
.days-number {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: clamp(4rem, 15vw, 7rem);
  font-weight: 700;
  color: #c0717e;
  line-height: 1;
  letter-spacing: -0.02em;
}
.days-label {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.3rem;
  color: #8a6550;
  letter-spacing: 0.08em;
  margin-top: 0.25rem;
}
.hero-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.ornament-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #c0946c, transparent);
}
.ornament-line.long {
  max-width: 80px;
}
.small-heart {
  color: #c0717e;
  font-size: 0.9rem;
}
.hero-quote {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-style: italic;
  font-size: 1.05rem;
  color: #7a5540;
  line-height: 1.6;
}

/* ---- Timers ---- */
.timers-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.timers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* ---- Milestones ---- */
.milestones-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.section-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.35rem;
  font-weight: 600;
  color: #5c3d2e;
  white-space: nowrap;
  letter-spacing: 0.04em;
}
.milestones-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.milestone-card {
  display: flex;
  gap: 1.25rem;
  background: rgba(255, 252, 245, 0.85);
  border: 1.5px solid rgba(192, 148, 108, 0.25);
  border-radius: 4px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 10px rgba(160, 110, 60, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.milestone-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(160, 110, 60, 0.14);
}
.milestone-card.locked {
  opacity: 0.65;
  background: rgba(245, 240, 232, 0.7);
}
.milestone-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 0.1rem;
  color: #c0717e;
  display: flex;
  align-items: flex-start;
}
.milestone-body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.milestone-date {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #a07850;
}
.milestone-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: #5c3d2e;
  margin: 0;
}
.milestone-desc {
  font-size: 0.9rem;
  color: #8a6550;
  line-height: 1.5;
  margin: 0;
}
.milestone-locked-text {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.875rem;
  color: #b0907a;
  font-style: italic;
  margin: 0;
}
.inline-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.footer-heart {
  font-size: 1rem;
  color: #c0717e;
  vertical-align: middle;
  position: relative;
  top: -1px;
}

/* ---- Footer ---- */
.site-footer {
  position: relative;
  z-index: 10;
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  font-size: 0.8rem;
  color: #a07850;
  letter-spacing: 0.06em;
}
.btn-lock {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #c0946c;
  opacity: 0.5;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
}
.btn-lock:hover {
  opacity: 1;
}

/* ---- Responsive ---- */
@media (max-width: 680px) {
  .timers-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 480px) {
  .site-title { font-size: 2rem; }
  .content { padding: 0.75rem 1rem 3rem; }
  .hero-card { padding: 2rem 1.25rem; }
}
</style>
