import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useEventos } from '../composables/useEventos.js'
import { getNow } from '../utils/debug.js'

export const useRelationshipStore = defineStore('relationship', () => {
  // --- Estado de desbloqueo ---
  const isUnlocked = ref(localStorage.getItem('nosotros_unlocked') === 'true')

  // --- Fecha de inicio de la relación ---
  const startDate = new Date('2026-07-14T00:00:00')
  const UNLOCK_DATE = '14/07/2026'

  // --- Nombre de la pareja ---
  const coupleNames = ref('Santi & Cami')
  const name1 = 'Santi'
  const name2 = 'Cami'

  const currentTheme = ref(localStorage.getItem('nosotros_theme') || 'cami')

  // --- Suscripción a eventos desde Firebase ---
  const { eventos } = useEventos()

  // --- Celebración Dinámica ---
  const isCelebrationDay = computed(() => {
    const now = getNow()
    const todayDay = now.getDate()
    const todayMonth = now.getMonth()

    for (const evt of eventos.value) {
      if (!evt.fecha) continue
      
      const evtDay = evt.fecha.getDate()
      const evtMonth = evt.fecha.getMonth()
      const evtYear = evt.fecha.getFullYear()

      if (evt.tipo === 'Mensualmente') {
        if (todayDay === evtDay) return true
      } else if (evt.tipo === 'Anualmente') {
        if (todayDay === evtDay && todayMonth === evtMonth) return true
      } else {
        // Asumimos 'Fecha unica' por defecto
        if (todayDay === evtDay && todayMonth === evtMonth && now.getFullYear() === evtYear) {
          return true
        }
      }
    }
    return false
  })

  function setTheme(theme) {
    currentTheme.value = theme
    localStorage.setItem('nosotros_theme', theme)
  }

  // --- Intento de desbloqueo ---
  function tryUnlock(inputDate) {
    if (inputDate === UNLOCK_DATE) {
      isUnlocked.value = true
      localStorage.setItem('nosotros_unlocked', 'true')
      return true
    }
    return false
  }

  function lock() {
    isUnlocked.value = false
    localStorage.removeItem('nosotros_unlocked')
  }

  // --- Días juntos ---
  const daysTogther = computed(() => {
    const now = new Date()
    const diff = now - startDate
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  })

  return {
    isUnlocked,
    startDate,
    coupleNames,
    name1,
    name2,
    currentTheme,
    setTheme,
    tryUnlock,
    lock,
    daysTogther,
    isCelebrationDay
  }
})
