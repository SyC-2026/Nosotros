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

export function useLugares() {
  const lugares = ref([])
  const loading = ref(true)
  const error   = ref(null)

  const q = query(
    collection(db, 'lugares'),
    orderBy('createdAt', 'desc')
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      lugares.value = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          titulo: data.titulo || data.nombre || 'Paseo juntos',
          lugar:  data.lugar || data.nombre || 'Lugar especial',
          date:   data.timestamp?.toDate?.() ?? null
        }
      })
      loading.value = false
    },
    (err) => {
      console.error('Error al cargar lugares de Firestore:', err)
      error.value = err
      loading.value = false
    }
  )

  onUnmounted(() => unsubscribe())

  async function addLugar(titulo, lugar, lat, lng, descripcion = '', date = new Date(), foto = '') {
    await addDoc(collection(db, 'lugares'), {
      titulo: titulo || lugar,
      lugar:  lugar || titulo,
      nombre: lugar || titulo,
      lat: Number(lat),
      lng: Number(lng),
      descripcion: descripcion || '',
      timestamp: Timestamp.fromDate(date),
      foto: foto || '',
      createdAt: Timestamp.now()
    })
  }

  async function updateLugar(id, titulo, lugar, lat, lng, descripcion = '', date = new Date(), foto = '') {
    await updateDoc(doc(db, 'lugares', id), {
      titulo: titulo || lugar,
      lugar:  lugar || titulo,
      nombre: lugar || titulo,
      lat: Number(lat),
      lng: Number(lng),
      descripcion: descripcion || '',
      timestamp: Timestamp.fromDate(date),
      foto: foto || ''
    })
  }

  async function deleteLugar(id) {
    await deleteDoc(doc(db, 'lugares', id))
  }

  return {
    lugares,
    loading,
    error,
    addLugar,
    updateLugar,
    deleteLugar
  }
}
