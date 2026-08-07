<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRelationshipStore } from '../stores/relationship.js'
import { useNavigationStore } from '../stores/navigation.js'
import { useFrases } from '../composables/useFrases.js'
import { Icon } from '@iconify/vue'

import { useMomentos } from '../composables/useMomentos.js'

const store = useRelationshipStore()
const nav = useNavigationStore()
const { getRandomFrase } = useFrases()
const { momentos } = useMomentos()

const currentQuote = ref(getRandomFrase())

// Live day counter
const daysCount = ref(store.daysTogther)
let timer = null

// Photo Carousel (Local Assets + Firestore DB)
const fotoModules = import.meta.glob(
  '../assets/fotos/*.{png,jpg,jpeg,webp,svg,PNG,JPG,JPEG,WEBP,SVG}',
  { eager: true, import: 'default' }
)
const localFotosList = Object.values(fotoModules)

const fotosList = computed(() => {
  const dbUrls = momentos.value.map((m) => m.url).filter(Boolean)
  return [...dbUrls, ...localFotosList]
})

const currentPhotoIndex = ref(0)
let carouselTimer = null

onMounted(() => {
  timer = setInterval(() => {
    daysCount.value = store.daysTogther
  }, 60000)

  carouselTimer = setInterval(() => {
    if (fotosList.value.length > 1) {
      currentPhotoIndex.value = (currentPhotoIndex.value + 1) % fotosList.value.length
    }
  }, 5000) // Cambiar foto cada 5 segundos
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (carouselTimer) clearInterval(carouselTimer)
})

// Navigation Actions
function navigate(page) {
  nav.navigate(page)
}
function handleLock() {
  store.lock()
}

// Next Event Logic
const nextSantiBday = computed(() => {
  const now = new Date()
  let year = now.getFullYear()
  let target = new Date(year, 8, 7, 0, 0, 0)
  if (now > target) target = new Date(year + 1, 8, 7, 0, 0, 0)
  return target
})

const nextCamiBday = computed(() => {
  const now = new Date()
  let year = now.getFullYear()
  let target = new Date(year, 10, 28, 0, 0, 0)
  if (now > target) target = new Date(year + 1, 10, 28, 0, 0, 0)
  return target
})

const nextCumpleMes = computed(() => {
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth()
  let target = new Date(year, month, 14, 0, 0, 0)
  if (now > target) target = new Date(year, month + 1, 14, 0, 0, 0)
  return target
})

const nextAniversario = computed(() => {
  const now = new Date()
  let year = now.getFullYear()
  let target = new Date(year, 6, 14, 0, 0, 0) // July 14
  if (now > target) target = new Date(year + 1, 6, 14, 0, 0, 0)
  return target
})

const closestEvent = computed(() => {
  const events = [
    { name: 'Cumple Mes', target: nextCumpleMes.value, icon: 'mdi:heart-flash' },
    { name: 'Aniversario', target: nextAniversario.value, icon: 'mdi:glass-toast' },
    { name: 'Cumple de Santi', target: nextSantiBday.value, icon: 'mdi:cake-variant-outline' },
    { name: 'Cumple de Cami', target: nextCamiBday.value, icon: 'mdi:cake-variant-outline' }
  ]
  events.sort((a, b) => a.target - b.target)
  return events[0]
})

const targetDateFormatted = computed(() => {
  if (!closestEvent.value) return ''
  const d = closestEvent.value.target
  const day = d.getDate()
  const month = d.toLocaleString('es-ES', { month: 'long' })
  const monthCap = month.charAt(0).toUpperCase() + month.slice(1)
  const year = d.getFullYear()
  return `${day < 10 ? '0'+day : day} de ${monthCap} de ${year}`
})

// Countdown logic for the closest event
const timeRemaining = ref({ days: 0, hours: 0, mins: 0, secs: 0 })
let countdownTimer = null

function updateCountdown() {
  const now = new Date()
  const diff = closestEvent.value.target - now

  if (diff <= 0) {
    timeRemaining.value = { days: 0, hours: 0, mins: 0, secs: 0 }
    return
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24))
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const m = Math.floor((diff / 1000 / 60) % 60)
  const s = Math.floor((diff / 1000) % 60)

  timeRemaining.value = { days: d, hours: h, mins: m, secs: s }
}

onMounted(() => {
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
})
onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})

const pad = (num) => String(num).padStart(2, '0')
</script>

<template>
  <div class="home-dashboard">
    <!-- Header Integrado -->
    <header class="dashboard-header">
      <div class="header-ornament">✵</div>
      <h1 class="site-title">
        <span
          class="name-clickable"
          :class="{ active: store.currentTheme === 'santi' }"
          @click="store.setTheme('santi')"
          title="Estilo Santi"
        >Santi</span>
        <span class="title-ampersand">&</span>
        <span
          class="name-clickable"
          :class="{ active: store.currentTheme === 'cami' }"
          @click="store.setTheme('cami')"
          title="Estilo Cami"
        >Cami</span>
      </h1>
      <div class="header-ornament">✵</div>
    </header>

    <main class="dashboard-grid">
      
      <!-- Widget: Photo Carousel (2x2) -->
      <div class="widget w-carousel" @click="navigate('momentos')" title="Ver Galería">
        <transition-group name="fade-slide">
          <div
            v-for="(foto, index) in fotosList"
            :key="foto"
            v-show="index === currentPhotoIndex"
            class="carousel-slide"
            :style="{ backgroundImage: `url(${foto})` }"
          ></div>
        </transition-group>
        <div class="carousel-overlay">
          <Icon icon="tabler:photo-heart" class="carousel-icon" />
          <span>Galería</span>
          <Icon icon="mdi:chevron-right" class="carousel-arrow" />
        </div>
      </div>

      <!-- Widget: Hero / Days Together (2x1) -->
      <div class="widget w-hero">
        <!-- Watermark de fondo -->
        <div class="hero-bg-heart" aria-hidden="true">♡</div>

        <!-- Izquierda: contador de días -->
        <div class="hero-days-side">
          <span class="hero-days-number">{{ daysCount }}</span>
          <span class="hero-days-label">días juntos</span>
          <span class="hero-days-since">desde el 14 de Julio de 2026</span>
        </div>

        <!-- Separador vertical con ornamento -->
        <div class="hero-divider" aria-hidden="true">
          <span class="hero-divider-line"></span>
          <span class="hero-divider-ornament">✶</span>
          <span class="hero-divider-line"></span>
        </div>

        <!-- Derecha: frase -->
        <div class="hero-quote-side">
          <span class="hero-quote-mark" aria-hidden="true">“</span>
          <p class="hero-quote-text">{{ currentQuote }}</p>
        </div>
      </div>

      <!-- Widget: Next Event (2x1) -->
      <div class="widget w-event">
        <!-- Ícono watermark de fondo -->
        <div class="event-bg-icon" aria-hidden="true">
          <Icon icon="mdi:calendar-heart" />
        </div>
        
        <div class="event-titles">
          <span class="event-subtitle">Próximo Evento: <strong>¡{{ closestEvent.name }}!</strong></span>
          <h3 class="event-target-date">{{ targetDateFormatted }}</h3>
        </div>

        <div class="countdown-display">
          <div class="cd-group">
            <div class="cd-pill">{{ pad(timeRemaining.days) }}</div>
            <span class="cd-label">Días</span>
          </div>
          <span class="cd-sep">:</span>
          <div class="cd-group">
            <div class="cd-pill">{{ pad(timeRemaining.hours) }}</div>
            <span class="cd-label">Horas</span>
          </div>
          <span class="cd-sep">:</span>
          <div class="cd-group">
            <div class="cd-pill">{{ pad(timeRemaining.mins) }}</div>
            <span class="cd-label">Minutos</span>
          </div>
          <span class="cd-sep">:</span>
          <div class="cd-group">
            <div class="cd-pill">{{ pad(timeRemaining.secs) }}</div>
            <span class="cd-label">Segundos</span>
          </div>
        </div>
      </div>

      <!-- Widget: Navigation - Lugares -->
      <div class="widget w-nav" @click="navigate('lugares')">
        <div class="nav-bg-icon" aria-hidden="true">
          <Icon icon="mdi:map-marker-path" />
        </div>
        <div class="nav-content">
          <!-- <Icon icon="mdi:map-marker-path" class="nav-icon-fg" /> -->
          <span class="nav-label">Lugares visitados</span>
          <span class="nav-sublabel">Nuestros viajes</span>
        </div>
      </div>

      <!-- Widget: Navigation - Camino -->
      <div class="widget w-nav" @click="navigate('camino')">
        <div class="nav-bg-icon" aria-hidden="true">
          <Icon icon="mdi:timeline-outline" />
        </div>
        <div class="nav-content">
          <!-- <Icon icon="mdi:timeline-outline" class="nav-icon-fg" /> -->
          <span class="nav-label">Nuestro camino</span>
          <span class="nav-sublabel">Historia juntos</span>
        </div>
      </div>

      <!-- Widget: Navigation - Cartas -->
      <div class="widget w-nav" @click="navigate('cartas')">
        <div class="nav-bg-icon" aria-hidden="true">
          <Icon icon="tabler:mail-heart" />
        </div>
        <div class="nav-content">
          <!-- <Icon icon="tabler:mail-heart" class="nav-icon-fg" /> -->
          <span class="nav-label">Cartas</span>
          <span class="nav-sublabel">Mensajes del corazón</span>
        </div>
      </div>

      <!-- Widget: Actions - Lock -->
      <div class="widget w-nav w-lock" @click="handleLock">
        <div class="nav-bg-icon" aria-hidden="true">
          <Icon icon="mdi:lock-outline" />
        </div>
        <div class="nav-content">
          <!-- <Icon icon="mdi:lock-outline" class="nav-icon-fg" /> -->
          <span class="nav-label">Bloquear</span>
          <span class="nav-sublabel">Cerrar sesión</span>
        </div>
      </div>

    </main>
  </div>
</template>

<style scoped>
.home-dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Lato', system-ui, sans-serif;
  position: relative;
  z-index: 10;
}

/* Header */
.dashboard-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.site-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 3rem;
  font-weight: 700;
  color: var(--theme-text-main);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}
.title-ampersand {
  color: var(--theme-secondary);
  font-size: 2.2rem;
  font-weight: 400;
}
.name-clickable {
  cursor: pointer;
  padding: 0.1rem 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  opacity: 0.6;
}
.name-clickable:hover { opacity: 1; }
.name-clickable.active {
  opacity: 1;
  color: var(--theme-primary);
}
.header-ornament { font-size: 1.2rem; color: var(--theme-secondary); }

/* Grid Layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 220px;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
}

/* Widgets Base */
.widget {
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(160, 110, 60, 0.05);
  overflow: hidden;
  position: relative;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  backdrop-filter: blur(8px);
}
.widget:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(160, 110, 60, 0.12);
}

/* Specific Widgets */
.w-carousel { 
  grid-column: span 2; 
  grid-row: span 2; 
  cursor: pointer;
}
.w-hero {
  grid-column: span 2;
  grid-row: span 1;
  display: flex;
  align-items: stretch;
  padding: 0;
  overflow: hidden;
  position: relative;
}
.w-event { 
  grid-column: span 2; 
  grid-row: span 1; 
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  padding: 1.5rem;
  background: var(--theme-drawer-bg);
  text-align: center;
}
.event-badge {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--theme-badge-bg);
  color: var(--theme-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
.w-nav {
  grid-column: span 1;
  grid-row: span 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-end;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  position: relative;
}
.w-lock {
  opacity: 0.75;
}
.w-lock:hover {
  opacity: 1;
}

/* Carousel Internals */
.carousel-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}
.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.1rem;
  z-index: 2;
}
.carousel-icon { font-size: 1.3rem; }

/* Carousel Transition */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 1.5s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; }

/* Hero Internals */

/* Corazón watermark de fondo */
.hero-bg-heart {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 13rem;
  line-height: 1;
  color: var(--theme-primary);
  opacity: 0.04;
  pointer-events: none;
  user-select: none;
  font-family: 'Georgia', serif;
}

/* Zona izquierda: contador */
.hero-days-side {
  flex: 0 0 42%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 1.5rem 1.25rem 1.5rem 1.75rem;
}
.hero-days-number {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 4rem;
  font-weight: 700;
  color: var(--theme-primary);
  line-height: 1;
  letter-spacing: -0.02em;
}
.hero-days-label {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 0.95rem;
  color: var(--theme-text-body);
  letter-spacing: 0.04em;
  margin-top: 0.25rem;
}
.hero-days-since {
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.65rem;
  color: var(--theme-text-muted);
  letter-spacing: 0.02em;
  font-style: italic;
  margin-top: 0.45rem;
  opacity: 0.8;
}

/* Separador vertical ornamental */
.hero-divider {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 1.75rem 0;
}
.hero-divider-line {
  display: block;
  width: 1px;
  flex: 1;
  background: var(--theme-card-border);
  opacity: 0.7;
}
.hero-divider-ornament {
  font-size: 0.65rem;
  color: var(--theme-secondary);
  opacity: 0.65;
}

/* Zona derecha: frase */
.hero-quote-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 1.5rem 1.75rem 1.5rem 1.25rem;
  position: relative;
  overflow: hidden;
}
.hero-quote-mark {
  display: block;
  font-family: 'Georgia', serif;
  font-size: 5rem;
  line-height: 0.75;
  color: var(--theme-primary);
  opacity: 0.12;
  margin-bottom: -0.75rem;
  user-select: none;
}
.hero-quote-text {
  font-family: 'Cause', 'Georgia', serif;
  font-style: italic;
  font-size: 0.88rem;
  color: var(--theme-text-muted);
  line-height: 1.55;
}

/* Event Internals */
.w-event {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  padding: clamp(1rem, 2.5vw, 1.5rem);
  background: var(--theme-drawer-bg);
  text-align: center;
  box-sizing: border-box;
}
.event-bg-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none;
  overflow: hidden;
  padding-right: 0.5rem;
}
.event-bg-icon svg,
.event-bg-icon iconify-icon {
  width: 65%;
  height: 65%;
  color: var(--theme-primary);
  opacity: 0.07;
  transition: opacity 0.35s ease, transform 0.35s ease;
  transform: rotate(-8deg) scale(1);
}
.w-event:hover .event-bg-icon svg,
.w-event:hover .event-bg-icon iconify-icon {
  opacity: 0.12;
  transform: rotate(-4deg) scale(1.05);
}
.event-badge {
  position: absolute;
  top: clamp(0.75rem, 2vw, 1.25rem);
  right: clamp(0.75rem, 2vw, 1.25rem);
  width: clamp(26px, 4vw, 32px);
  height: clamp(26px, 4vw, 32px);
  border-radius: 50%;
  background: var(--theme-badge-bg);
  color: var(--theme-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.9rem, 2vw, 1.2rem);
}
.event-titles {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.25rem;
  width: 100%;
}
.event-subtitle {
  font-family: 'Lato', system-ui, sans-serif;
  font-size: clamp(0.75rem, 1.8vw, 0.85rem);
  color: var(--theme-text-muted);
}
.event-subtitle strong {
  color: var(--theme-text-main);
  font-weight: 700;
}
.event-target-date {
  font-family: 'Cause', 'Georgia', serif;
  font-size: clamp(1.2rem, 3.2vw, 1.8rem);
  font-weight: 700;
  color: var(--theme-text-main);
  margin: 0;
  line-height: 1.2;
}
.countdown-display {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(0.25rem, 1.5vw, 0.8rem);
  margin-bottom: 0.25rem;
  width: 100%;
  max-width: 100%;
}
.cd-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.cd-pill {
  background: rgba(255, 255, 255, 0.75);
  border: 1.5px solid var(--theme-card-border);
  border-radius: clamp(8px, 1.5vw, 12px);
  padding: clamp(0.3rem, 1vw, 0.5rem) clamp(0.4rem, 1.2vw, 0.8rem);
  font-family: 'Cause', 'Georgia', serif;
  font-size: clamp(1.1rem, 2.8vw, 1.8rem);
  font-weight: 700;
  color: var(--theme-text-main);
  line-height: 1;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 4px 10px rgba(0, 0, 0, 0.05);
  min-width: clamp(38px, 7vw, 65px);
  text-align: center;
  box-sizing: border-box;
}
.cd-label {
  font-size: clamp(0.6rem, 1.4vw, 0.75rem);
  color: var(--theme-text-muted);
}
.cd-sep {
  font-size: clamp(1.1rem, 2.8vw, 1.8rem);
  font-weight: bold;
  color: var(--theme-text-muted);
  padding-top: clamp(0.25rem, 0.8vw, 0.5rem);
  opacity: 0.6;
}

/* Nav Internals */

/* Ícono watermark gigante en el fondo */
.nav-bg-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  overflow: hidden;
}
.nav-bg-icon svg,
.nav-bg-icon iconify-icon {
  width: 130%;
  height: 130%;
  color: var(--theme-primary);
  opacity: 0.07;
  transition: opacity 0.35s ease, transform 0.35s ease;
  transform: rotate(-12deg) scale(1);
}
.w-nav:hover .nav-bg-icon svg,
.w-nav:hover .nav-bg-icon iconify-icon {
  opacity: 0.13;
  transform: rotate(-8deg) scale(1.06);
}

/* Degradado desde abajo para leer el texto */
.nav-bg-icon::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    var(--theme-card-bg) 0%,
    transparent 55%
  );
}

/* Contenido de primer plano */
.nav-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  padding: 1.1rem 1.1rem 1rem;
}

/* Ícono pequeño en primer plano */
.nav-icon-fg {
  font-size: 1.4rem;
  color: var(--theme-primary);
  margin-bottom: 0.35rem;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.w-nav:hover .nav-icon-fg {
  transform: scale(1.15) translateY(-1px);
}

.nav-label {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--theme-text-main);
  line-height: 1.2;
}
.nav-sublabel {
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.68rem;
  color: var(--theme-text-muted);
  letter-spacing: 0.04em;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: minmax(150px, auto);
  }
  .w-carousel { grid-column: span 2; grid-row: span 2; }
  .w-hero { grid-column: span 2; }
  .w-event { grid-column: span 2; min-height: 160px; }
  .w-nav { grid-column: span 1; }
  
  .hero-days-number { font-size: 3.2rem; }
}

@media (max-width: 480px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(130px, auto);
  }
  .w-carousel { grid-column: span 1; grid-row: span 2; }
  .w-hero { grid-column: span 1; flex-direction: column; gap: 0; }
  .hero-days-side { flex: none; padding: 1rem 1.5rem 0.5rem; width: 100%; align-items: center; }
  .hero-days-number { font-size: 3rem; }
  .hero-days-since { display: none; }
  .hero-divider { flex-direction: row; padding: 0 1.5rem; height: auto; gap: 0.5rem; }
  .hero-divider-line { flex: 1; width: auto; height: 1px; }
  .hero-quote-side { flex: none; padding: 0.5rem 1.5rem 1rem; width: 100%; }
  .hero-quote-mark { font-size: 3rem; }
  .w-event { grid-column: span 1; min-height: 165px; }
  .w-nav { grid-column: span 1; display: flex; flex-direction: row; align-items: flex-end; justify-content: flex-start; }
  .nav-bg-icon svg,
  .nav-bg-icon iconify-icon { transform: rotate(-12deg) scale(1.1); }
}
</style>
