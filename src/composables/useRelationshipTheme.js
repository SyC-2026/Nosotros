import { watch, onMounted } from 'vue'
import { useRelationshipStore } from '../stores/relationship.js'

export function useRelationshipTheme() {
  const store = useRelationshipStore()

  function updateDOM() {
    if (typeof document === 'undefined') return

    // Actualizar tema principal
    if (store.currentTheme === 'santi') {
      document.body.classList.add('theme-santi')
    } else {
      document.body.classList.remove('theme-santi')
    }

    // Actualizar modo celebración
    if (store.isCelebrationDay && store.isUnlocked) {
      document.body.classList.add('theme-celebration')
    } else {
      document.body.classList.remove('theme-celebration')
    }
  }

  // Escuchar reactivamente los cambios (incluye inicialización inmediata)
  watch(
    [() => store.currentTheme, () => store.isUnlocked, () => store.isCelebrationDay],
    () => {
      updateDOM()
    },
    { immediate: true }
  )
}
