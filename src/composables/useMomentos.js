import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
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
    uploadProgress.value = 0
    error.value = null

    try {
      const apiKey = import.meta.env.VITE_FIVEMANAGE_API_TOKEN
      if (!apiKey || apiKey === 'YOUR_API_TOKEN') {
        throw new Error('API Token de Fivemanage no configurado en .env')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('filename', file.name)
      formData.append('path', 'nosotros/galeria')
      formData.append('metadata', JSON.stringify({
        title: metadata.title || '',
        description: metadata.description || '',
        albumId: metadata.albumId || 'local',
      }))

      // Upload file to Fivemanage
      const res = await axios.post('https://api.fivemanage.com/api/v3/file', formData, {
        headers: {
          Authorization: apiKey,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 95) / progressEvent.total)
            uploadProgress.value = percentCompleted
          }
        }
      })

      const fileUrl = res.data?.url || res.data?.data?.url

      if (!fileUrl) {
        throw new Error('No se pudo obtener la URL de Fivemanage')
      }

      // Save document to Firestore
      const docData = {
        url: fileUrl,
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
      console.error('Error subiendo imagen a Fivemanage:', err)
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
