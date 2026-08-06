import { ref, onUnmounted } from 'vue'
import { db } from '../firebase.js'
import { doc, onSnapshot } from 'firebase/firestore'

export function useSiteConfig() {
  // null = cargando, true/false = valor real
  const maintenanceMode = ref(null)

  const unsubscribe = onSnapshot(
    doc(db, 'config', 'site'),
    (snap) => {
      if (snap.exists()) {
        maintenanceMode.value = snap.data().maintenanceMode ?? false
      } else {
        maintenanceMode.value = false
      }
    },
    (err) => {
      console.error('Error leyendo config/site:', err)
      maintenanceMode.value = false
    }
  )

  onUnmounted(() => unsubscribe())

  return { maintenanceMode }
}
