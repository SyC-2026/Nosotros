<script setup>
import { ref, computed } from 'vue'
import { useRelationshipStore } from '../stores/relationship.js'
import vintageBg from '../assets/vintage_bg.png'
import { Icon } from '@iconify/vue'

const store = useRelationshipStore()

// Input state — three separate fields: day, month, year
const day = ref('')
const month = ref('')
const year = ref('')

const shakeError = ref(false)
const errorMsg = ref('')
const unlocking = ref(false)
const success = ref(false)

// Refs for focus chaining
const dayRef = ref(null)
const monthRef = ref(null)
const yearRef = ref(null)

// Auto-advance focus as user types
function onDayInput() {
  if (day.value.length === 2) monthRef.value?.focus()
}
function onMonthInput() {
  if (month.value.length === 2) yearRef.value?.focus()
}

function handleSubmit() {
  const formatted = `${day.value.padStart(2, '0')}/${month.value.padStart(2, '0')}/${year.value}`
  
  if (store.tryUnlock(formatted)) {
    unlocking.value = true
    success.value = true
    // Let the animation play before the parent re-renders
    setTimeout(() => {}, 1200)
  } else {
    shakeError.value = true
    errorMsg.value = 'Fecha incorrecta 💔 Intenta de nuevo'
    setTimeout(() => {
      shakeError.value = false
      errorMsg.value = ''
    }, 800)
  }
}

// Computed button state
const canSubmit = computed(() => day.value && month.value && year.value.length === 4)
</script>

<template>
  <div class="lock-screen" :style="{ backgroundImage: `url(${vintageBg})` }">
    <!-- Warm overlay -->
    <div class="overlay"></div>

    <transition name="fade-up">
      <div class="card" v-if="!success">
        <!-- Top decorative element -->
        <div class="card-ornament">
          <span class="ornament-line"></span>
          <span class="heart">♥</span>
          <span class="ornament-line"></span>
        </div>

        <h1 class="card-title">Santi & Cami</h1>
        <p class="card-subtitle">
          Para entrar a nuestro espacio especial,<br>
          introduce la fecha en que todo comenzó. 💛
        </p>

        <!-- Date input group -->
        <div class="date-group" :class="{ shake: shakeError }">
          <div class="date-field">
            <label>Día</label>
            <input
              ref="dayRef"
              v-model="day"
              type="text"
              inputmode="numeric"
              maxlength="2"
              placeholder="DD"
              @input="onDayInput"
              @keyup.enter="canSubmit && handleSubmit()"
            />
          </div>
          <div class="date-separator">/</div>
          <div class="date-field">
            <label>Mes</label>
            <input
              ref="monthRef"
              v-model="month"
              type="text"
              inputmode="numeric"
              maxlength="2"
              placeholder="MM"
              @input="onMonthInput"
              @keyup.enter="canSubmit && handleSubmit()"
            />
          </div>
          <div class="date-separator">/</div>
          <div class="date-field year-field">
            <label>Año</label>
            <input
              ref="yearRef"
              v-model="year"
              type="text"
              inputmode="numeric"
              maxlength="4"
              placeholder="AAAA"
              @keyup.enter="canSubmit && handleSubmit()"
            />
          </div>
        </div>

        <!-- Error message -->
        <transition name="fade">
          <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        </transition>

        <!-- Submit button -->
        <button
          class="btn-unlock"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          Abrir nuestro espacio
          <Icon icon="mdi:heart" class="btn-heart-icon" />
        </button>

        <!-- Bottom ornament -->
        <div class="card-ornament bottom">
          <span class="ornament-line short"></span>
          <span class="tiny-flowers">✿ ✾ ✿</span>
          <span class="ornament-line short"></span>
        </div>
      </div>
    </transition>

    <!-- Success animation -->
    <transition name="fade">
      <div v-if="success" class="success-overlay">
        <div class="success-heart">
          <Icon icon="mdi:heart" />
        </div>
        <p class="success-text">Bienvenidos...</p>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* ---- Base ---- */
.lock-screen {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  position: relative;
  font-family: 'Playfair Display', 'Georgia', serif;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 248, 240, 0.82) 0%,
    rgba(253, 235, 213, 0.78) 50%,
    rgba(255, 240, 228, 0.82) 100%
  );
}

/* ---- Card ---- */
.card {
  position: relative;
  z-index: 10;
  background: rgba(255, 252, 245, 0.88);
  backdrop-filter: blur(6px);
  border: 1.5px solid rgba(192, 148, 108, 0.35);
  border-radius: 4px;
  padding: 3rem 2.75rem;
  max-width: 420px;
  width: calc(100% - 2rem);
  text-align: center;
  box-shadow:
    0 4px 24px rgba(160, 110, 60, 0.12),
    0 1px 4px rgba(160, 110, 60, 0.08),
    inset 0 0 0 8px rgba(192, 148, 108, 0.06);
}

/* ---- Ornaments ---- */
.card-ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}
.card-ornament.bottom {
  margin-top: 1.75rem;
  margin-bottom: 0;
}
.ornament-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #c0946c, transparent);
  max-width: 60px;
}
.ornament-line.short {
  max-width: 40px;
}
.heart {
  font-size: 1.1rem;
  color: #c0717e;
  letter-spacing: 2px;
}
.tiny-flowers {
  font-size: 0.75rem;
  color: #b89070;
  letter-spacing: 3px;
}

/* ---- Typography ---- */
.card-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 2.6rem;
  font-weight: 700;
  color: #5c3d2e;
  letter-spacing: 0.04em;
  margin-bottom: 0.6rem;
  line-height: 1.1;
}
.card-subtitle {
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.9rem;
  color: #8a6550;
  line-height: 1.6;
  margin-bottom: 2rem;
}

/* ---- Date Input ---- */
.date-group {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}
.date-group.shake {
  animation: shake 0.5s ease;
}
.date-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}
.date-field.year-field input {
  width: 88px;
}
.date-field label {
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #a07850;
}
.date-field input {
  width: 52px;
  padding: 0.65rem 0.4rem;
  text-align: center;
  font-size: 1.3rem;
  font-family: 'Playfair Display', 'Georgia', serif;
  color: #5c3d2e;
  background: rgba(255, 248, 238, 0.9);
  border: 1.5px solid rgba(192, 148, 108, 0.5);
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  letter-spacing: 0.05em;
}
.date-field input:focus {
  border-color: #c0717e;
  box-shadow: 0 0 0 3px rgba(192, 113, 126, 0.18);
}
.date-field input::placeholder {
  color: #c9aa8a;
  font-size: 1rem;
}
.date-separator {
  font-size: 1.6rem;
  color: #c0946c;
  font-family: 'Playfair Display', serif;
  padding-bottom: 0.35rem;
}

/* ---- Error ---- */
.error-msg {
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.85rem;
  color: #c0717e;
  margin-top: 0.6rem;
  min-height: 1.2rem;
}

/* ---- Button ---- */
.btn-unlock {
  margin-top: 1.5rem;
  width: 100%;
  padding: 0.9rem 1rem;
  background: linear-gradient(135deg, #c0717e 0%, #a85060 100%);
  color: #fff9f5;
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1rem;
  letter-spacing: 0.04em;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 3px 12px rgba(168, 80, 96, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}
.btn-heart-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}
.btn-unlock:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(168, 80, 96, 0.4);
}
.btn-unlock:active:not(:disabled) {
  transform: translateY(0);
}
.btn-unlock:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ---- Success overlay ---- */
.success-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.success-heart {
  font-size: 5rem;
  color: #c0717e;
  animation: heartbeat 0.8s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}
.success-text {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.6rem;
  color: #5c3d2e;
  letter-spacing: 0.08em;
}

/* ---- Transitions ---- */
.fade-up-enter-active {
  animation: fadeUp 0.6s ease both;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ---- Keyframes ---- */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
</style>
