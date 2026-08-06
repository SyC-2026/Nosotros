<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  label: { type: String, required: true },
  icon: { type: String, default: 'mdi:heart' },
  // ISO string con timezone Argentina (-03:00)
  since: { type: String, required: true }
})

// Parsear la fecha de referencia
const sinceDate = new Date(props.since)

const days    = ref(0)
const hours   = ref(0)
const minutes = ref(0)
const seconds = ref(0)

function update() {
  const now  = new Date()
  const diff = Math.max(0, now - sinceDate) // ms

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

// Pad to 2 digits
const pad = (n) => String(n).padStart(2, '0')
</script>

<template>
  <div class="timer-card">
    <!-- Header -->
    <div class="timer-header">
      <span class="timer-icon">
        <Icon :icon="icon" />
      </span>
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
  background: rgba(255, 252, 245, 0.88);
  border: 1.5px solid rgba(192, 148, 108, 0.28);
  border-radius: 4px;
  padding: 1.5rem 1.25rem 1.35rem;
  text-align: center;
  box-shadow: 0 3px 14px rgba(160, 110, 60, 0.1),
              inset 0 0 0 6px rgba(192, 148, 108, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.timer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 22px rgba(160, 110, 60, 0.16);
}

/* Header */
.timer-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.timer-icon {
  font-size: 1.4rem;
  line-height: 1;
  color: #a07850;
  display: flex;
  align-items: center;
}
.timer-label {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #5c3d2e;
  margin: 0;
  letter-spacing: 0.02em;
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
  background: linear-gradient(90deg, transparent, rgba(192, 148, 108, 0.5), transparent);
}
.div-heart {
  font-size: 0.65rem;
  color: #c0717e;
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
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.9rem;
  font-weight: 700;
  color: #7a4f3a;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.digit-value.seconds {
  color: #c0717e;
  /* subtle tick animation */
  animation: tick-color 1s step-end infinite;
}
.digit-unit {
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #a07850;
  margin-top: 1px;
}
.digit-sep {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: #c0946c;
  margin-bottom: 1rem;
  opacity: 0.6;
}

@keyframes tick-color {
  0%   { opacity: 1; }
  50%  { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
