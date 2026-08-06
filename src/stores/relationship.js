import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

  // --- Hitos de la relación ---
  const milestones = ref([
    {
      id: 1,
      date: '14/07/2026',
      title: 'El comienzo',
      description: 'El día que todo empezó. El primero de muchos.',
      icon: 'mdi:heart-outline',
      unlocked: true
    },
    {
      id: 2,
      date: '14/08/2026',
      title: 'Primer mes juntos',
      description: '¡Un mes de risas, charlas y momentos especiales!',
      icon: 'mdi:party-popper',
      unlocked: computed(() => {
        const monthMark = new Date('2026-08-14')
        return new Date() >= monthMark
      }).value
    }
  ])

  return {
    isUnlocked,
    startDate,
    coupleNames,
    name1,
    name2,
    tryUnlock,
    lock,
    daysTogther,
    milestones
  }
})
