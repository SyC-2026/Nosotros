<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import BackButton from '../components/BackButton.vue'
import { useMomentos } from '../composables/useMomentos.js'

// Import local photos as fallback/initial set
const fotoModules = import.meta.glob(
  '../assets/fotos/*.{png,jpg,jpeg,webp,svg,PNG,JPG,JPEG,WEBP,SVG}',
  { eager: true, import: 'default' }
)
const localFotos = Object.entries(fotoModules).map(([path, url], index) => ({
  id: `local_${index}`,
  url,
  title: 'Foto Local',
  date: 'Local',
  albumId: 'local',
  isLocal: true
}))

const {
  momentos,
  albums,
  loading,
  uploading,
  uploadProgress,
  createAlbum,
  uploadMomento,
  updateMomento,
  deleteMomento,
  deleteAlbum
} = useMomentos()

// Active album tab state ('all' or album.id)
const activeAlbumId = ref('all')

// Filtered list of momentos
const filteredMomentos = computed(() => {
  if (activeAlbumId.value === 'all') {
    return [...momentos.value, ...localFotos]
  }
  return momentos.value.filter((m) => m.albumId === activeAlbumId.value)
})

// Modal states for photo upload
const showUploadModal = ref(false)
const selectedFile = ref(null)
const filePreview = ref(null)
const titleInput = ref('')
const dateInput = ref(new Date().toISOString().split('T')[0])
const targetAlbumId = ref('none')

// Modal state for album creation
const showAlbumModal = ref(false)
const albumNameInput = ref('')
const albumDescInput = ref('')

// Modal state for photo editing
const showEditModal = ref(false)
const editPhotoId = ref(null)
const editTitleInput = ref('')
const editDateInput = ref('')
const editAlbumIdInput = ref('none')

// ── Date formatter ────────────────────────────────────────────────────────────
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
})
function formatDate(dateStr) {
  if (!dateStr || dateStr === 'Local') return dateStr
  // Use T12:00:00 to avoid timezone shifting
  const dateObj = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`)
  if (isNaN(dateObj.getTime())) return dateStr
  const d = dateFormatter.format(dateObj)
  return d.charAt(0).toUpperCase() + d.slice(1)
}

function openEditPhoto(item) {
  if (item.isLocal) return
  editPhotoId.value = item.id
  editTitleInput.value = item.title || ''
  editDateInput.value = item.date || new Date().toISOString().split('T')[0]
  editAlbumIdInput.value = item.albumId || 'none'
  showEditModal.value = true
}

async function submitEditPhoto() {
  if (!editPhotoId.value) return
  try {
    await updateMomento(editPhotoId.value, {
      title: editTitleInput.value,
      date: editDateInput.value,
      albumId: editAlbumIdInput.value
    })
    if (activeLightboxItem.value && activeLightboxItem.value.id === editPhotoId.value) {
      activeLightboxItem.value.title = editTitleInput.value
      activeLightboxItem.value.date = editDateInput.value
      activeLightboxItem.value.albumId = editAlbumIdInput.value
    }
    showEditModal.value = false
  } catch (err) {
    alert('Error al actualizar la foto.')
  }
}

// Lightbox state
const activeLightboxItem = ref(null)

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    const reader = new FileReader()
    reader.onload = (event) => {
      filePreview.value = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

function openUploadModal() {
  targetAlbumId.value = (activeAlbumId.value !== 'all' && activeAlbumId.value !== 'none') ? activeAlbumId.value : 'none'
  showUploadModal.value = true
}

function resetUploadForm() {
  selectedFile.value = null
  filePreview.value = null
  titleInput.value = ''
  dateInput.value = new Date().toISOString().split('T')[0]
  showUploadModal.value = false
}

async function submitMomento() {
  if (!selectedFile.value) return

  try {
    await uploadMomento(selectedFile.value, {
      title: titleInput.value,
      date: dateInput.value,
      albumId: targetAlbumId.value
    })
    resetUploadForm()
  } catch (err) {
    alert('Ocurrió un error al subir la foto. Inténtalo nuevamente.')
  }
}

async function submitAlbum() {
  if (!albumNameInput.value.trim()) return

  try {
    const newAlbum = await createAlbum(albumNameInput.value, albumDescInput.value)
    if (newAlbum?.id) {
      activeAlbumId.value = newAlbum.id
    }
    albumNameInput.value = ''
    albumDescInput.value = ''
    showAlbumModal.value = false
  } catch (err) {
    alert('Error al crear el álbum.')
  }
}

const deletingAlbumId = ref(null)

async function handleDeleteAlbum(album) {
  if (deletingAlbumId.value === album.id) {
    try {
      await deleteAlbum(album.id)
      if (activeAlbumId.value === album.id) {
        activeAlbumId.value = 'all'
      }
      deletingAlbumId.value = null
    } catch (err) {
      console.error('Error al borrar el álbum:', err)
    }
  } else {
    deletingAlbumId.value = album.id
    setTimeout(() => {
      if (deletingAlbumId.value === album.id) {
        deletingAlbumId.value = null
      }
    }, 3000)
  }
}

const deletingPhotoId = ref(null)

async function handleDelete(item) {
  if (item.isLocal) return
  if (deletingPhotoId.value === item.id) {
    try {
      await deleteMomento(item)
      if (activeLightboxItem.value?.id === item.id) {
        activeLightboxItem.value = null
      }
      deletingPhotoId.value = null
    } catch (err) {
      console.error('Error al borrar la foto:', err)
    }
  } else {
    deletingPhotoId.value = item.id
    setTimeout(() => {
      if (deletingPhotoId.value === item.id) {
        deletingPhotoId.value = null
      }
    }, 3000)
  }
}

function openLightbox(item) {
  activeLightboxItem.value = item
}

function closeLightbox() {
  activeLightboxItem.value = null
}
</script>

<template>
  <div class="momentos-page">
    <BackButton />
    <div class="momentos-content">

      <!-- Page Header -->
      <div class="page-header">
        <div class="header-icon">
          <Icon icon="tabler:photo-heart" />
        </div>
        <div>
          <h1 class="page-title">Galería</h1>
          <p class="page-subtitle">Nuestra galería de recuerdos y fotos juntas ♥</p>
        </div>
      </div>

      <!-- Ornament -->
      <div class="ornament">
        <span class="orn-line"></span>
        <span class="orn-flowers">✿ ♥ ✿</span>
        <span class="orn-line"></span>
      </div>

      <!-- Gallery Layout (Sidebar + Masonry) -->
      <div class="gallery-layout">
        <!-- Albums Section -->
      <div class="albums-section">
        <div class="albums-header">
          <span class="albums-section-title">
            <Icon icon="mdi:folder-multiple-outline" />Álbumes
          </span>
          <button class="btn-new-album" @click="showAlbumModal = true">
            <Icon icon="mdi:plus" />
            Nuevo Álbum
          </button>
        </div>

        <div class="albums-row">
          <!-- Tarjeta: Todas -->
          <button
            class="album-card"
            :class="{ active: activeAlbumId === 'all' }"
            @click="activeAlbumId = 'all'"
          >
            <div class="album-card-icon">
              <Icon icon="mdi:image-multiple-outline" />
            </div>
            <span class="album-card-name">Todas</span>
            <span class="album-card-count">{{ momentos.length + localFotos.length }}</span>
          </button>

          <!-- Tarjeta por álbum -->
          <div
            v-for="album in albums"
            :key="album.id"
            class="album-card"
            :class="{ active: activeAlbumId === album.id, confirming: deletingAlbumId === album.id }"
            @click="activeAlbumId = album.id"
          >
            <div class="album-card-icon">
              <Icon icon="mdi:folder-heart-outline" />
            </div>
            <span class="album-card-name">{{ album.name }}</span>
            <span class="album-card-count">{{ momentos.filter(m => m.albumId === album.id).length }}</span>
            <button
              class="album-card-delete"
              @click.stop="handleDeleteAlbum(album)"
              :title="deletingAlbumId === album.id ? 'Toca de nuevo para confirmar' : 'Eliminar álbum'"
            >
              <Icon :icon="deletingAlbumId === album.id ? 'mdi:alert-circle' : 'mdi:close'" />
            </button>
          </div>
        </div>
      </div>

      <main class="page-content">
        <!-- Loading indicator -->
        <div v-if="loading" class="loading-state">
          <Icon icon="mdi:loading" class="spin-icon" />
          <p>Cargando galería de recuerdos...</p>
        </div>

        <!-- Empty state for selected album -->
        <div v-else-if="filteredMomentos.length === 0" class="empty-album-state">
          <Icon icon="mdi:image-off-outline" class="empty-icon" />
          <p>Aún no hay fotos en este álbum.</p>
          <button class="btn-subir-empty" @click="openUploadModal">
            <Icon icon="mdi:plus" /> Subir la primera foto
          </button>
        </div>

        <!-- Gallery Masonry -->
        <div v-else class="gallery-masonry">
          <div
            v-for="item in filteredMomentos"
            :key="item.id"
            class="gallery-card"
            @click="openLightbox(item)"
          >
            <img :src="item.url" :alt="item.title || 'Momento'" loading="lazy" class="gallery-img" />
            <div class="card-overlay">
              <span v-if="item.title" class="card-title">{{ item.title }}</span>
              <span v-if="item.date" class="card-date">
                <Icon icon="mdi:calendar-heart" class="card-date-icon" />{{ formatDate(item.date) }}
              </span>
            </div>
          </div>
        </div>
      </main>
      </div> <!-- End Gallery Layout -->

    </div>

    <!-- FAB — Add new photo -->
    <button class="fab" @click="openUploadModal" title="Agregar foto">
      <Icon icon="mdi:plus" />
    </button>

    <!-- Upload Photo Modal -->
    <transition name="modal-fade">
      <div v-if="showUploadModal" class="modal-backdrop" @click.self="resetUploadForm">
        <div class="modal-card">
          <button class="btn-close-modal" @click="resetUploadForm">
            <Icon icon="mdi:close" />
          </button>
          
          <h2 class="modal-title">Subir Nueva Foto</h2>

          <div class="form-group">
            <label>Álbum de destino:</label>
            <select v-model="targetAlbumId" class="form-input">
              <option value="none">Sin álbum</option>
              <option v-for="album in albums" :key="album.id" :value="album.id">
                {{ album.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="file-drop-area" :class="{ 'has-file': filePreview }">
              <input type="file" accept="image/*" @change="handleFileSelect" hidden />
              <img v-if="filePreview" :src="filePreview" class="preview-image" />
              <div v-else class="drop-placeholder">
                <Icon icon="mdi:cloud-upload-outline" class="upload-icon" />
                <span>Toca para seleccionar una foto</span>
              </div>
            </label>
          </div>

          <div class="form-group">
            <label>Título o Descripción (Opcional):</label>
            <input
              v-model="titleInput"
              type="text"
              placeholder="Ej: Viaje a la playa, Tarde de café..."
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Fecha del Momento:</label>
            <input v-model="dateInput" type="date" class="form-input" />
          </div>

          <div v-if="uploading" class="progress-bar-container">
            <div class="progress-bar-fill" :style="{ width: uploadProgress + '%' }"></div>
            <span class="progress-text">Subiendo... {{ uploadProgress }}%</span>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="resetUploadForm" :disabled="uploading">Cancelar</button>
            <button class="btn-submit" @click="submitMomento" :disabled="!selectedFile || uploading">
              <Icon v-if="uploading" icon="mdi:loading" class="spin-icon-sm" />
              <span v-else>Guardar Foto</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Create Album Modal -->
    <transition name="modal-fade">
      <div v-if="showAlbumModal" class="modal-backdrop" @click.self="showAlbumModal = false">
        <div class="modal-card">
          <button class="btn-close-modal" @click="showAlbumModal = false">
            <Icon icon="mdi:close" />
          </button>
          
          <h2 class="modal-title">Crear Nuevo Álbum</h2>

          <div class="form-group">
            <label>Nombre del Álbum:</label>
            <input
              v-model="albumNameInput"
              type="text"
              placeholder="Ej: Vacaciones, Cumpleaños, Salidas..."
              class="form-input"
              @keyup.enter="submitAlbum"
            />
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="showAlbumModal = false">Cancelar</button>
            <button class="btn-submit" @click="submitAlbum" :disabled="!albumNameInput.trim()">
              Crear Álbum
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Lightbox Modal -->
    <transition name="modal-fade">
      <div v-if="activeLightboxItem" class="lightbox-backdrop" @click.self="closeLightbox">
        <div class="lightbox-content">
          <!-- <button class="btn-close-lightbox" @click="closeLightbox">
            <Icon icon="mdi:close" />
          </button> -->

          <div class="lightbox-image-container">
            <img :src="activeLightboxItem.url" :alt="activeLightboxItem.title" />
          </div>

          <div class="lightbox-details">
            <div class="lightbox-text">
              <h3 v-if="activeLightboxItem.title">{{ activeLightboxItem.title }}</h3>
              <p v-if="activeLightboxItem.date" class="lightbox-date">
                <Icon icon="mdi:calendar-heart" /> {{ formatDate(activeLightboxItem.date) }}
              </p>
            </div>

            <div v-if="!activeLightboxItem.isLocal" class="lightbox-actions">
              <button
                class="btn-card-action"
                @click="openEditPhoto(activeLightboxItem)"
                title="Editar foto"
              >
                <Icon icon="mdi:pencil-outline" />
              </button>

              <button
                class="btn-card-action btn-card-delete"
                :class="{ confirm: deletingPhotoId === activeLightboxItem.id }"
                @click="handleDelete(activeLightboxItem)"
                :title="deletingPhotoId === activeLightboxItem.id ? 'Toca de nuevo para confirmar' : 'Eliminar foto'"
              >
                <Icon :icon="deletingPhotoId === activeLightboxItem.id ? 'mdi:alert-circle' : 'mdi:trash-can-outline'" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Edit Photo Modal -->
    <transition name="modal-fade">
      <div v-if="showEditModal" class="modal-backdrop" @click.self="showEditModal = false">
        <div class="modal-card">
          <button class="btn-close-modal" @click="showEditModal = false">
            <Icon icon="mdi:close" />
          </button>
          
          <h2 class="modal-title">Editar Foto</h2>

          <div class="form-group">
            <label>Nombre / Título de la foto:</label>
            <input
              v-model="editTitleInput"
              type="text"
              placeholder="Ej: Viaje a la playa, Tarde de café..."
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Mover al Álbum / Carpeta:</label>
            <select v-model="editAlbumIdInput" class="form-input">
              <option value="none">Sin álbum</option>
              <option v-for="album in albums" :key="album.id" :value="album.id">
                {{ album.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Fecha del Momento:</label>
            <input v-model="editDateInput" type="date" class="form-input" />
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="showEditModal = false">Cancelar</button>
            <button class="btn-submit" @click="submitEditPhoto">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.momentos-page {
  min-height: 100vh;
  padding: 5rem 2rem 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  font-family: 'Cause', system-ui, sans-serif;
}

.momentos-content {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  position: relative;
}
.header-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: var(--theme-badge-bg);
  border: 1px solid var(--theme-badge-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: var(--theme-primary);
  flex-shrink: 0;
}
.page-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--theme-text-main);
  margin: 0;
  letter-spacing: 0.02em;
}
.page-subtitle {
  font-size: 0.9rem;
  color: var(--theme-text-muted);
  margin: 0.2rem 0 0;
}
/* FAB button */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 50;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--theme-btn-gradient);
  border: none;
  color: #fff9f5;
  font-size: 1.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.fab:hover {
  filter: brightness(1.08);
}

/* Ornament */
.ornament {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.25rem 0;
}
.orn-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--theme-badge-border), transparent);
}
.orn-flowers {
  font-size: 0.75rem;
  color: var(--theme-secondary);
  letter-spacing: 0.2em;
}

/* Gallery Layout */
.gallery-layout {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1.5rem;
  width: 100%;
  margin-top: 0.5rem;
}

/* Albums Section */
.albums-section {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  position: sticky;
  top: 1rem;
}

.albums-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.albums-section-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--theme-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

.btn-new-album {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: 1.5px dashed var(--theme-card-border);
  border-radius: 20px;
  padding: 0.35rem 0.9rem;
  font-size: 0.82rem;
  font-family: 'Cause', 'Georgia', serif;
  color: var(--theme-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-new-album:hover {
  border-color: var(--theme-primary);
  color: var(--theme-primary);
  background: var(--theme-badge-bg);
}

.albums-row {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  scrollbar-width: none;
  /* Use larger padding and negative margin to prevent large shadow clipping */
  padding: 1.5rem;
  margin: -1.5rem;
}
.albums-row::-webkit-scrollbar { display: none; }

/* Album card (Chips / Pills) */
.album-card {
  width: 100%;
  justify-content: flex-start;
  flex: 0 0 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 1rem 0.45rem 0.65rem;
  background: var(--theme-card-bg);
  border: 1px solid var(--theme-card-border);
  border-radius: 30px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.album-card:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: var(--theme-primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
.album-card.active {
  background: var(--theme-primary);
  border-color: var(--theme-primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}
.album-card.confirming {
  border-color: #e53e3e;
  animation: shake 0.35s ease;
}

.album-card-icon {
  font-size: 1.35rem;
  color: var(--theme-primary);
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
}
.album-card.active .album-card-icon {
  color: rgba(255, 255, 255, 0.95);
}

.album-card-name {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--theme-text-main);
  white-space: nowrap;
  transition: color 0.3s ease;
}
.album-card.active .album-card-name {
  color: white;
}

.album-card-count {
  margin-left: auto;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.1rem 0.45rem;
  background: var(--theme-badge-bg);
  border-radius: 12px;
  color: var(--theme-text-muted);
  transition: all 0.3s ease;
  margin-left: 0.1rem;
}
.album-card.active .album-card-count {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

/* Botón borrar: tipo badge flotante */
.album-card-delete {
  position: absolute;
  top: -6px;
  right: -4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--theme-card-bg);
  border: 1px solid var(--theme-card-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--theme-text-muted);
  cursor: pointer;
  opacity: 0;
  transform: scale(0.6);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 5;
}
.album-card:hover .album-card-delete,
.album-card.active .album-card-delete {
  opacity: 1;
  transform: scale(1);
}
.album-card-delete:hover {
  background: rgba(229, 62, 62, 0.15) !important;
  color: #e53e3e !important;
  border-color: #e53e3e;
}
.album-card.confirming .album-card-delete {
  background: #e53e3e;
  color: white !important;
  border-color: #e53e3e;
  transform: scale(1.1);
}

/* Loading & Empty States */
.loading-state, .empty-album-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  color: var(--theme-text-muted);
  text-align: center;
}
.empty-icon {
  font-size: 3rem;
  color: var(--theme-secondary);
  margin-bottom: 0.5rem;
}
.btn-subir-empty {
  margin-top: 1rem;
  background: var(--theme-primary);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-family: 'Cause', serif;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.spin-icon {
  font-size: 2.5rem;
  animation: spin 1s linear infinite;
  color: var(--theme-primary);
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* Gallery Masonry */
.page-content {
  flex: 1;
  min-width: 0; /* Prevents flex children from overflowing */
}
.gallery-masonry {
  columns: 3;
  column-gap: 1.25rem;
}

.gallery-card {
  break-inside: avoid;
  margin-bottom: 1.25rem;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1), box-shadow 0.35s ease;
}

.gallery-card:hover {
  transform: translateY(-5px) scale(1.012);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.13);
}

.gallery-img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.5s ease;
}

.gallery-card:hover .gallery-img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.15) 60%,
    transparent 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0.9rem 1rem;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-card:hover .card-overlay {
  opacity: 1;
}

.card-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
}

.card-date {
  font-size: 0.74rem;
  opacity: 0.82;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.2rem;
}

.card-date-icon {
  font-size: 0.85rem;
}

@media (max-width: 700px) {
  .gallery-masonry { columns: 2; column-gap: 0.9rem; }
  .gallery-card { margin-bottom: 0.9rem; }
}
@media (max-width: 400px) {
  .gallery-masonry { columns: 1; }
}

/* Modal Styling */
.modal-backdrop, .lightbox-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.modal-card {
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  padding: 2rem;
  position: relative;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.btn-close-modal {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--theme-text-muted);
  cursor: pointer;
}
.modal-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.6rem;
  color: var(--theme-text-main);
  margin-top: 0;
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--theme-text-main);
}
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--theme-card-border);
  background: rgba(255,255,255,0.8);
  font-size: 0.95rem;
  box-sizing: border-box;
  font-family: inherit;
}
.file-drop-area {
  border: 2px dashed var(--theme-secondary);
  border-radius: 14px;
  height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  background: rgba(255,255,255,0.4);
  transition: background 0.2s ease;
}
.file-drop-area:hover {
  background: rgba(255,255,255,0.7);
}
.drop-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--theme-text-muted);
}
.upload-icon {
  font-size: 2.5rem;
  color: var(--theme-primary);
}
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.progress-bar-container {
  height: 24px;
  background: rgba(0,0,0,0.05);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.progress-bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--theme-primary);
  transition: width 0.2s ease;
}
.progress-text {
  position: relative;
  z-index: 2;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--theme-text-main);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.btn-cancel {
  background: none;
  border: 1px solid var(--theme-card-border);
  padding: 0.7rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
  color: var(--theme-text-muted);
}
.btn-submit {
  background: var(--theme-primary);
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Lightbox Styling */
.lightbox-content {
  max-width: 900px;
  max-height: 90vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.btn-close-lightbox {
  position: absolute;
  top: -2.5rem;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}
.lightbox-image-container {
  max-height: 75vh;
  width: 100%;
  display: flex;
  justify-content: center;
}
.lightbox-image-container img {
  max-height: 75vh;
  max-width: 100%;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.lightbox-details {
  margin-top: 1rem;
  background: var(--theme-card-bg);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}
.lightbox-text h3 {
  margin: 0;
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.2rem;
  color: var(--theme-text-main);
}
.lightbox-date {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--theme-text-muted);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.lightbox-actions {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}
.btn-card-action {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: var(--theme-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 6px;
  transition: color 0.2s ease, background 0.2s ease, transform 0.15s ease;
}
.btn-card-action:hover {
  color: var(--theme-primary);
  background: var(--theme-badge-bg);
}
.btn-card-delete:hover {
  color: #e53e3e;
}
.btn-card-delete.confirm {
  color: #e53e3e;
  background: rgba(229, 62, 62, 0.15);
}

.btn-delete-album.confirming {
  color: #e53e3e;
  opacity: 1;
}

/* Animations */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .gallery-layout {
    flex-direction: column;
  }
  .albums-section {
    width: 100%;
    position: static;
  }
  .albums-row {
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    max-height: none;
    padding: 1.5rem;
    margin: -1.5rem;
  }
  .album-card {
    width: auto;
  }
}
</style>
