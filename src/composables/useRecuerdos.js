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

export function useRecuerdos() {
  const recuerdos = ref([])
  const loading   = ref(true)
  const error     = ref(null)

  const q = query(
    collection(db, 'recuerdos'),
    orderBy('timestamp', 'desc')
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      recuerdos.value = snapshot.docs.map((docSnap) => ({
        id:   docSnap.id,
        ...docSnap.data(),
        date: docSnap.data().timestamp?.toDate?.() ?? null
      }))
      loading.value = false
    },
    (err) => {
      console.error('Error al obtener recuerdos:', err)
      error.value = err
      loading.value = false
    }
  )

  onUnmounted(() => unsubscribe())

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async function addRecuerdo(titulo, date) {
    await addDoc(collection(db, 'recuerdos'), {
      titulo,
      timestamp: Timestamp.fromDate(date)
    })
  }

  async function updateRecuerdo(id, titulo, date) {
    await updateDoc(doc(db, 'recuerdos', id), {
      titulo,
      timestamp: Timestamp.fromDate(date)
    })
  }

  async function deleteRecuerdo(id) {
    await deleteDoc(doc(db, 'recuerdos', id))
  }

  return {
    recuerdos,
    loading,
    error,
    addRecuerdo,
    updateRecuerdo,
    deleteRecuerdo
  }
}
