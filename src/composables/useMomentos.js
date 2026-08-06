import { ref, onMounted, onUnmounted } from 'vue'
import { db } from '../firebase.js'
import {
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore'

// Utility function to convert original image file directly to Base64 preserving 100% exact quality
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}

export function useMomentos() {
  const momentos = ref([])
  const albums = ref([])
  const loading = ref(true)
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref(null)

  let unsubMomentos = null
  let unsubAlbums = null

  onMounted(() => {
    // Listen to Momentos collection
    const qMomentos = query(collection(db, 'momentos'), orderBy('createdAt', 'desc'))
    unsubMomentos = onSnapshot(
      qMomentos,
      (snapshot) => {
        momentos.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        loading.value = false
      },
      (err) => {
        console.error('Error al cargar momentos:', err)
        error.value = 'No se pudieron cargar las fotos'
        loading.value = false
      }
    )

    // Listen to Albums collection
    const qAlbums = query(collection(db, 'albums'), orderBy('createdAt', 'asc'))
    unsubAlbums = onSnapshot(
      qAlbums,
      (snapshot) => {
        albums.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      },
      (err) => {
        console.error('Error al cargar álbumes:', err)
      }
    )
  })

  onUnmounted(() => {
    if (unsubMomentos) unsubMomentos()
    if (unsubAlbums) unsubAlbums()
  })

  async function createAlbum(name, description = '') {
    if (!name || !name.trim()) return
    try {
      const albumData = {
        name: name.trim(),
        description: description.trim(),
        createdAt: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'albums'), albumData)
      return { id: docRef.id, ...albumData }
    } catch (err) {
      console.error('Error al crear el álbum:', err)
      throw err
    }
  }

  async function uploadMomento(file, metadata = {}) {
    if (!file) return

    uploading.value = true
    uploadProgress.value = 30
    error.value = null

    try {
      // Compress and convert image to Base64
      const base64Data = await fileToBase64(file)
      uploadProgress.value = 75

      const docData = {
        url: base64Data,
        title: metadata.title || '',
        description: metadata.description || '',
        date: metadata.date || new Date().toISOString().split('T')[0],
        albumId: metadata.albumId || 'local',
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'momentos'), docData)
      uploadProgress.value = 100
      uploading.value = false
      return { id: docRef.id, ...docData }
    } catch (err) {
      console.error('Error guardando imagen Base64:', err)
      error.value = 'Error al procesar la imagen'
      uploading.value = false
      throw err
    }
  }

  async function deleteMomento(item) {
    try {
      await deleteDoc(doc(db, 'momentos', item.id))
    } catch (err) {
      console.error('Error borrando momento:', err)
      throw err
    }
  }

  async function updateMomento(id, data = {}) {
    try {
      await updateDoc(doc(db, 'momentos', id), {
        title: data.title || '',
        description: data.description || '',
        albumId: data.albumId || 'local',
        date: data.date || ''
      })
    } catch (err) {
      console.error('Error al actualizar el momento:', err)
      throw err
    }
  }

  async function deleteAlbum(albumId) {
    try {
      await deleteDoc(doc(db, 'albums', albumId))
    } catch (err) {
      console.error('Error borrando álbum:', err)
      throw err
    }
  }

  return {
    momentos,
    albums,
    loading,
    uploading,
    uploadProgress,
    error,
    createAlbum,
    uploadMomento,
    updateMomento,
    deleteMomento,
    deleteAlbum
  }
}
