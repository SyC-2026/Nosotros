import { ref, onUnmounted } from 'vue'
import { db } from '../firebase.js'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore'

export function useCartas() {
  const cartas  = ref([])
  const loading = ref(true)
  const error   = ref(null)

  const q = query(
    collection(db, 'cartas'),
    orderBy('createdAt', 'desc')
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      cartas.value = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id:        docSnap.id,
          ...data,
          titulo:    data.titulo    || 'Sin título',
          contenido: data.contenido || '',
          de:        data.de        || '',
          para:      data.para      || '',
          date:      data.date?.toDate?.() ?? null,
        }
      })
      loading.value = false
    },
    (err) => {
      console.error('useCartas error:', err)
      error.value   = err
      loading.value = false
    }
  )

  onUnmounted(unsubscribe)

  async function addCarta(titulo, contenido, de, para, date) {
    await addDoc(collection(db, 'cartas'), {
      titulo,
      contenido,
      de,
      para,
      date:      date      ? Timestamp.fromDate(date) : null,
      createdAt: Timestamp.now(),
    })
  }

  async function updateCarta(id, titulo, contenido, de, para, date) {
    await updateDoc(doc(db, 'cartas', id), {
      titulo,
      contenido,
      de,
      para,
      date: date ? Timestamp.fromDate(date) : null,
    })
  }

  async function deleteCarta(id) {
    await deleteDoc(doc(db, 'cartas', id))
  }

  return { cartas, loading, error, addCarta, updateCarta, deleteCarta }
}
