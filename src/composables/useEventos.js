import { ref } from 'vue'
import { db } from '../firebase.js'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

// Estado global en memoria para evitar múltiples suscripciones desde distintos componentes/stores
let globalEventos = null
const globalLoading = ref(true)
const globalError = ref(null)
let unsub = null

export function useEventos() {
  if (!globalEventos) {
    globalEventos = ref([])
    const q = query(collection(db, 'eventos'), orderBy('fecha', 'asc'))
    unsub = onSnapshot(
      q,
      (snapshot) => {
        globalEventos.value = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            // Convertimos Timestamp a Date nativo si viene de Firestore
            fecha: data.fecha?.toDate?.() || new Date(data.fecha || Date.now())
          }
        })
        globalLoading.value = false
      },
      (err) => {
        console.error('Error al cargar eventos:', err)
        globalError.value = err
        globalLoading.value = false
      }
    )
  }

  return {
    eventos: globalEventos,
    loading: globalLoading,
    error: globalError
  }
}
