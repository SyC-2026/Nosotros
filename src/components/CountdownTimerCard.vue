<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  label: { type: String, required: true },
  icon: { type: String, default: 'mdi:cake-variant' },
  targetDate: { type: [Date, String], required: true }
})

const days    = ref(0)
const hours   = ref(0)
const minutes = ref(0)
const seconds = ref(0)

function update() {
  const now  = new Date()
  const target = new Date(props.targetDate)
  const diff = Math.max(0, target - now) // ms remaining

  const totalSeconds = Math.floor(diff / 1000)
  days.value    = Math.floor(totalSeconds / 86400)
  hours.value   = Math.floor((totalSeconds % 86400) / 3600)
  minutes.value = Math.floor((totalSeconds % 3600) / 60)
  seconds.value = totalSeconds % 60
}

let timer = null
onMounted(() => {
  update()
  timer = setInterval(update, 1000)
})
onUnmounted(() => clearInterval(timer))

const pad = (n) => String(n).padStart(2, '0')
</script>

<template>
  <div class="timer-card">
    <!-- Background Watermark Icon -->
    <div class="bg-watermark-icon">
      <Icon :icon="icon" />
    </div>

    <!-- Header -->
    <div class="timer-header">
      <h3 class="timer-label">{{ label }}</h3>
    </div>

    <!-- Divider -->
    <div class="timer-divider">
      <span class="div-line"></span>
      <span class="div-heart">♥</span>
      <span class="div-line"></span>
    </div>

    <!-- Digits -->
    <div class="timer-digits">
      <div class="digit-block">
        <span class="digit-value">{{ days }}</span>
        <span class="digit-unit">días</span>
      </div>
      <div class="digit-sep">:</div>
      <div class="digit-block">
        <span class="digit-value">{{ pad(hours) }}</span>
        <span class="digit-unit">horas</span>
      </div>
      <div class="digit-sep">:</div>
      <div class="digit-block">
        <span class="digit-value">{{ pad(minutes) }}</span>
        <span class="digit-unit">min</span>
      </div>
      <div class="digit-sep">:</div>
      <div class="digit-block">
        <span class="digit-value seconds">{{ pad(seconds) }}</span>
        <span class="digit-unit">seg</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timer-card {
  position: relative;
  overflow: hidden;
  height: 100%;
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 4px;
  padding: 1.4rem 1.2rem 1.25rem;
  text-align: center;
  box-shadow: 0 3px 14px rgba(160, 110, 60, 0.1),
              inset 0 0 0 6px rgba(192, 148, 108, 0.04);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.65rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.timer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 22px rgba(160, 110, 60, 0.16);
}

.timer-header,
.timer-divider,
.timer-digits {
  position: relative;
  z-index: 1;
}

/* Background Watermark Icon */
.bg-watermark-icon {
  position: absolute;
  right: -0.6rem;
  bottom: -0.8rem;
  font-size: 6.5rem;
  color: var(--theme-primary);
  opacity: 0.07;
  pointer-events: none;
  z-index: 0;
  line-height: 1;
  transform: rotate(-10deg);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.timer-card:hover .bg-watermark-icon {
  opacity: 0.13;
  transform: rotate(-4deg) scale(1.08);
}

/* Header */
.timer-header {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6rem;
}
.timer-label {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--theme-text-main);
  margin: 0;
  letter-spacing: 0.02em;
  line-height: 1.3;
}

/* Divider */
.timer-divider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.div-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--theme-secondary), transparent);
}
.div-heart {
  font-size: 0.65rem;
  color: var(--theme-primary);
}

/* Digit blocks */
.timer-digits {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}
.digit-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 42px;
}
.digit-value {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--theme-text-main);
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.digit-value.seconds {
  color: var(--theme-primary);
  animation: tick-color 1s step-end infinite;
}
.digit-unit {
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--theme-text-muted);
  margin-top: 1px;
}
.digit-sep {
  font-family: 'Cause', serif;
  font-size: 1.5rem;
  color: var(--theme-secondary);
  margin-bottom: 1rem;
  opacity: 0.6;
}
</style>
