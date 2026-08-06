import { ref, onUnmounted } from 'vue'
import { db } from '../firebase.js'
import { collection, onSnapshot } from 'firebase/firestore'

export const fallbackFrases = [
  'Contigo, cada día ordinario se convierte en el favorito de mi vida.',
  'Sos mi lugar seguro en cualquier rincón del mundo.',
  'Encontrarte fue como escuchar mi canción favorita por primera vez.',
  'Cada segundo a tu lado vale una vida entera.',
  'Me gusta la vida, pero me gusta más si es con vos.',
  'Haces que todo lo bonito se vuelva aún más hermoso.',
  'Sos la casualidad más linda que me pasó en la vida.',
  'No importa a dónde vaya, mi hogar siempre va a ser con vos.',
  'A tu lado, el tiempo pasa volando pero los recuerdos quedan para siempre.',
  'Te elijo hoy, mañana y en cada una de mis vidas.'
]

// Cache global de frases para respuesta instantánea
let cachedFrases = [...fallbackFrases]

export function useFrases() {
  const frases  = ref(cachedFrases)
  const loading = ref(true)
  const error   = ref(null)

  const unsubscribe = onSnapshot(
    collection(db, 'frases'),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data().texto).filter(Boolean)
      if (list.length > 0) {
        cachedFrases = list
        frases.value = list
      }
      loading.value = false
    },
    (err) => {
      console.error('Error al cargar frases de Firestore:', err)
      error.value = err
      loading.value = false
    }
  )

  onUnmounted(() => unsubscribe())

  function getRandomFrase() {
    const list = (frases.value && frases.value.length > 0) ? frases.value : cachedFrases
    const randomIndex = Math.floor(Math.random() * list.length)
    return list[randomIndex]
  }

  return {
    frases,
    loading,
    error,
    getRandomFrase
  }
}
