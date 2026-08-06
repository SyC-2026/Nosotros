<script setup>
import { ref, computed } from 'vue'
import { useRelationshipStore } from '../stores/relationship.js'
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
    errorMsg.value = 'Fecha incorrecta. Intenta de nuevo'
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
  <div class="lock-screen">

    <transition name="fade-up" appear>
      <div class="card" v-if="!success">
        <!-- Top decorative element -->
        <div class="card-ornament">
          <span class="ornament-line"></span>
          <span class="heart">♥</span>
          <span class="ornament-line"></span>
        </div>

        <h1 class="card-title">
          <span
            class="name-clickable"
            :class="{ active: store.currentTheme === 'santi' }"
            @click="store.setTheme('santi')"
            title="Toca para activar el estilo de Santi"
          >Santi</span>
          <span class="title-ampersand">&</span>
          <span
            class="name-clickable"
            :class="{ active: store.currentTheme === 'cami' }"
            @click="store.setTheme('cami')"
            title="Toca para activar el estilo de Cami"
          >Cami</span>
        </h1>
        <p class="card-subtitle">
          Para entrar a nuestro espacio especial,<br>
          introduce la fecha en que todo comenzó.
          <Icon icon="mdi:heart" class="subtitle-heart-icon" />
        </p>

        <!-- Date input group -->
        <div class="date-group" :class="{ shake: shakeError }">
          <div class="date-field">
            <label for="lock-day">Día</label>
            <input
              id="lock-day"
              name="lock-day"
              aria-label="Día"
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
            <label for="lock-month">Mes</label>
            <input
              id="lock-month"
              name="lock-month"
              aria-label="Mes"
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
            <label for="lock-year">Año</label>
            <input
              id="lock-year"
              name="lock-year"
              aria-label="Año"
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
  font-family: 'Cause', 'Georgia', serif;
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
  background: var(--theme-card-bg);
  backdrop-filter: blur(6px);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 4px;
  padding: 3rem 2.75rem;
  max-width: 420px;
  width: calc(100% - 2rem);
  text-align: center;
  box-shadow:
    0 4px 24px rgba(160, 110, 60, 0.12),
    0 1px 4px rgba(160, 110, 60, 0.08),
    inset 0 0 0 8px rgba(192, 148, 108, 0.06);
  transition: background 0.4s ease, border-color 0.4s ease;
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
  background: linear-gradient(90deg, transparent, var(--theme-secondary), transparent);
  max-width: 60px;
}
.ornament-line.short {
  max-width: 40px;
}
.heart {
  font-size: 1.1rem;
  color: var(--theme-primary);
  letter-spacing: 2px;
}
.tiny-flowers {
  font-size: 0.75rem;
  color: var(--theme-secondary);
  letter-spacing: 3px;
}

/* ---- Typography ---- */
.card-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 2.6rem;
  font-weight: 700;
  color: var(--theme-text-main);
  letter-spacing: 0.04em;
  margin-bottom: 0.6rem;
  line-height: 1.1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
}
.title-ampersand {
  color: var(--theme-secondary);
  font-size: 2.1rem;
  font-weight: 400;
}
.name-clickable {
  cursor: pointer;
  padding: 0.1rem 0.4rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  opacity: 0.75;
}
.name-clickable:hover {
  opacity: 1;
  transform: translateY(-2px);
}
.name-clickable.active {
  opacity: 1;
  color: var(--theme-primary);
}

.card-subtitle {
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.9rem;
  color: var(--theme-text-body);
  line-height: 1.6;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}
.subtitle-heart-icon {
  font-size: 1rem;
  color: var(--theme-primary);
  margin-top: 0.2rem;
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
  color: var(--theme-text-muted);
}
.date-field input {
  width: 54px;
  height: 48px;
  line-height: 48px;
  padding: 0;
  text-align: center;
  font-size: 1.25rem;
  font-family: 'Cause', 'Georgia', serif;
  color: var(--theme-text-main);
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  letter-spacing: 0.05em;
  box-sizing: border-box;
}
.date-field input:focus {
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 3px var(--theme-badge-bg);
}
.date-field input::placeholder {
  color: var(--theme-text-muted);
  opacity: 0.6;
  font-size: 1.05rem;
  line-height: 48px;
}
.date-separator {
  font-size: 1.6rem;
  color: var(--theme-secondary);
  font-family: 'Cause', serif;
  padding-bottom: 0.35rem;
}

/* ---- Error ---- */
.error-msg {
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.85rem;
  color: var(--theme-primary);
  margin-top: 0.6rem;
  min-height: 1.2rem;
}

/* ---- Button ---- */
.btn-unlock {
  margin-top: 1.5rem;
  width: 100%;
  padding: 0.9rem 1rem;
  background: var(--theme-btn-gradient);
  color: #fff9f5;
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1rem;
  letter-spacing: 0.04em;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
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
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
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
  color: var(--theme-primary);
  animation: heartbeat 0.8s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}
.success-text {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.6rem;
  color: var(--theme-text-main);
  letter-spacing: 0.08em;
}

/* ---- Transitions ---- */
.fade-up-enter-active,
.fade-up-appear-active {
  animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
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
