<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useRecuerdos } from '../composables/useRecuerdos.js'
import { useMomentos } from '../composables/useMomentos.js'
import BackButton from '../components/BackButton.vue'
import DynamicFormModal from '../components/DynamicFormModal.vue'

const { recuerdos, loading, error, addRecuerdo, updateRecuerdo, deleteRecuerdo } = useRecuerdos()
const { momentos } = useMomentos()

// ── Formatters ────────────────────────────────────────────────────────────────
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
})
const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit', minute: '2-digit'
})

function formatDate(date) {
  if (!date) return ''
  const d = dateFormatter.format(date)
  return d.charAt(0).toUpperCase() + d.slice(1)
}
function formatTime(date) {
  if (!date) return ''
  return timeFormatter.format(date)
}

// ── Converts a JS Date to the value required by <input type="datetime-local">
function toDatetimeLocal(date) {
  if (!date) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// ── Carga dinámica de fotos desde src/assets/fotos/ y Firestore ─────────────────
const fotoModules = import.meta.glob(
  '../assets/fotos/*.{png,jpg,jpeg,webp,svg,PNG,JPG,JPEG,WEBP,SVG}',
  { eager: true, import: 'default' }
)

const fotosMap = computed(() => {
  const map = {}
  for (const path in fotoModules) {
    const filename = path.split('/').pop()
    map[filename] = fotoModules[path]
  }
  return map
})

const availableFotoNames = computed(() => Object.keys(fotosMap.value))

const availableFotoOptions = computed(() => {
  const localList = availableFotoNames.value.map((name) => ({
    value: name,
    label: name
  }))

  const dbList = momentos.value.map((m, index) => ({
    value: m.url,
    label: m.title || `Foto ${index + 1}`
  }))

  return [...localList, ...dbList]
})

function getFotoUrl(filename) {
  if (!filename) return null
  if (filename.startsWith('http') || filename.startsWith('data:')) {
    return filename
  }
  return fotosMap.value[filename] || null
}

// ── Modal state ───────────────────────────────────────────────────────────────
const showModal    = ref(false)
const editTarget   = ref(null)   // null = new record, object = editing existing
const saving       = ref(false)
const confirmDelete = ref(false)

const formData = ref({
  titulo: '',
  datetime: '',
  foto: ''
})

const modalSchema = computed(() => [
  { id: 'titulo', type: 'text', label: 'Título del recuerdo', placeholder: 'Ej: Primera cena juntos...', fullWidth: true },
  { id: 'datetime', type: 'datetime-local', label: 'Fecha y hora', fullWidth: true },
  { id: 'foto', type: 'select', label: 'Foto asociable (opcional)', options: [{ label: 'Ninguna', value: '' }, ...availableFotoOptions.value], fullWidth: true },
  { id: 'preview', type: 'slot', fullWidth: true }
])

const modalTitle = computed(() =>
  editTarget.value ? 'Editar recuerdo' : 'Nuevo recuerdo'
)

function openAdd() {
  editTarget.value = null
  formData.value.titulo = ''
  formData.value.foto = ''
  formData.value.datetime = toDatetimeLocal(new Date())
  confirmDelete.value = false
  showModal.value = true
}

function openEdit(recuerdo) {
  editTarget.value = recuerdo
  formData.value.titulo = recuerdo.titulo
  formData.value.datetime = toDatetimeLocal(recuerdo.date)
  formData.value.foto = recuerdo.foto || ''
  confirmDelete.value = false
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  confirmDelete.value = false
}

let isBackdropMouseDown = false
function handleBackdropMouseDown(e) {
  isBackdropMouseDown = (e.target === e.currentTarget)
}
function handleBackdropClick(e) {
  if (isBackdropMouseDown && e.target === e.currentTarget) {
    closeModal()
  }
  isBackdropMouseDown = false
}

async function handleSave() {
  const { titulo, datetime, foto } = formData.value
  if (!titulo.trim() || !datetime) return
  saving.value = true
  try {
    const date = new Date(datetime)
    if (editTarget.value) {
      await updateRecuerdo(editTarget.value.id, titulo.trim(), date, foto)
    } else {
      await addRecuerdo(titulo.trim(), date, foto)
    }
    closeModal()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

const deletingRecuerdoId = ref(null)
let deleteRecuerdoTimeout = null

async function handleCardDelete(recuerdo) {
  if (deletingRecuerdoId.value === recuerdo.id) {
    clearTimeout(deleteRecuerdoTimeout)
    deletingRecuerdoId.value = null
    await deleteRecuerdo(recuerdo.id)
  } else {
    deletingRecuerdoId.value = recuerdo.id
    clearTimeout(deleteRecuerdoTimeout)
    deleteRecuerdoTimeout = setTimeout(() => {
      deletingRecuerdoId.value = null
    }, 3000)
  }
}

// ── Lightbox preview state ───────────────────────────────────────────────────
const previewImage = ref(null)

function openImagePreview(url, title) {
  previewImage.value = { url, title }
}
function closeImagePreview() {
  previewImage.value = null
}
</script>

<template>
  <div class="camino-page">
    <BackButton />

    <div class="camino-content">

      <!-- Page header -->
      <div class="page-header">
        <div class="header-icon">
          <Icon icon="mdi:timeline-outline" />
        </div>
        <div>
          <h1 class="page-title">Nuestro camino</h1>
          <p class="page-subtitle">Cada momento que vivimos juntos</p>
        </div>
      </div>

      <!-- Ornament -->
      <div class="ornament">
        <span class="orn-line"></span>
        <span class="orn-flowers">✿ ♥ ✿</span>
        <span class="orn-line"></span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="state-box">
        <Icon icon="mdi:loading" class="spin-icon" />
        <p>Cargando recuerdos...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-box error-state">
        <Icon icon="mdi:alert-circle-outline" />
        <p>No se pudieron cargar los recuerdos.</p>
      </div>

      <!-- Empty -->
      <div v-else-if="recuerdos.length === 0" class="state-box">
        <Icon icon="mdi:image-outline" class="empty-icon" />
        <p class="empty-title">Aún no hay recuerdos guardados</p>
        <p class="empty-sub">Presioná el botón ✦ para agregar el primero ♥</p>
      </div>

      <!-- Timeline -->
      <div v-else class="timeline">
        <div v-for="(recuerdo, index) in recuerdos" :key="recuerdo.id" class="memory-entry">

          <!-- Dot en la línea -->
          <div class="entry-dot">
            <Icon icon="mdi:heart" class="dot-icon" />
          </div>

          <!-- Card -->
          <div class="memory-card">

            <!-- Foto -->
            <div
              v-if="recuerdo.foto && getFotoUrl(recuerdo.foto)"
              class="memory-photo-area"
              @click="openImagePreview(getFotoUrl(recuerdo.foto), recuerdo.titulo)"
              title="Ampliar imagen"
            >
              <img
                :src="getFotoUrl(recuerdo.foto)"
                :alt="recuerdo.titulo"
                loading="lazy"
              />
              <div class="photo-expand-hint">
                <Icon icon="mdi:arrow-expand-all" />
              </div>
            </div>

            <!-- Cuerpo de la card -->
            <div class="card-body">
              <div class="card-body-left">
                <h3 class="memory-title">{{ recuerdo.titulo }}</h3>
                <div v-if="recuerdo.date" class="memory-date">
                  <Icon icon="mdi:calendar-heart" class="date-icon" />
                  <span>{{ formatDate(recuerdo.date) }}</span>
                  <span class="date-time">· {{ formatTime(recuerdo.date) }}</span>
                </div>
              </div>
              <div class="card-actions" @click.stop>
                <button class="btn-card-action" @click="openEdit(recuerdo)" title="Editar recuerdo">
                  <Icon icon="mdi:pencil-outline" />
                </button>
                <button
                  class="btn-card-action btn-card-delete"
                  :class="{ confirm: deletingRecuerdoId === recuerdo.id }"
                  @click="handleCardDelete(recuerdo)"
                  :title="deletingRecuerdoId === recuerdo.id ? 'Presiona de nuevo para confirmar' : 'Eliminar recuerdo'"
                >
                  <Icon :icon="deletingRecuerdoId === recuerdo.id ? 'mdi:alert-circle' : 'mdi:trash-can-outline'" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Counter -->
      <div v-if="recuerdos.length > 0" class="recuerdos-counter">
        <Icon icon="mdi:heart-multiple-outline" />
        {{ recuerdos.length }} {{ recuerdos.length === 1 ? 'recuerdo guardado' : 'recuerdos guardados' }}
      </div>

    </div>

    <!-- FAB — add new memory -->
    <button class="fab" @click="openAdd" title="Agregar recuerdo">
      <Icon icon="mdi:plus" />
    </button>

    <!-- ── Modal Form ─────────────────────────────────────────────────────── -->
    <!-- ── Dynamic Modal Form ─────────────────────────────────────────────── -->
    <DynamicFormModal
      :show="showModal"
      :title="modalTitle"
      :schema="modalSchema"
      v-model="formData"
      :loading="saving"
      saveText="Guardar"
      saveIcon="mdi:heart"
      @close="closeModal"
      @save="handleSave"
    >
      <template #field-preview>
        <!-- Preview selected photo -->
        <div v-if="formData.foto && getFotoUrl(formData.foto)" class="form-foto-preview">
          <img :src="getFotoUrl(formData.foto)" :alt="formData.foto" />
        </div>
      </template>
    </DynamicFormModal>

    <!-- ── Lightbox Modal Preview (Solo la foto) ───────────────────────── -->
    <transition name="modal-fade">
      <div
        v-if="previewImage"
        class="lightbox-backdrop"
        @click="closeImagePreview"
      >
        <img
          :src="previewImage.url"
          :alt="previewImage.title"
          class="lightbox-img"
        />
      </div>
    </transition>

  </div>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────────────────── */
.camino-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  font-family: 'Cause', system-ui, sans-serif;
}

.camino-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 680px;
  padding: 5rem 1.5rem 6rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Header ───────────────────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.header-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: var(--theme-badge-bg);
  border: 1.5px solid var(--theme-card-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--theme-secondary);
  flex-shrink: 0;
}
.page-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--theme-text-main);
  margin: 0;
  line-height: 1.15;
}
.page-subtitle {
  font-size: 0.85rem;
  color: var(--theme-text-muted);
  margin-top: 3px;
}

/* ── Ornament ─────────────────────────────────────────────────────────────── */
.ornament {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.orn-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--theme-secondary), transparent);
}
.orn-flowers {
  font-size: 0.75rem;
  color: var(--theme-secondary);
  letter-spacing: 4px;
}

/* ── States ───────────────────────────────────────────────────────────────── */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 2rem;
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 16px;
  text-align: center;
  color: var(--theme-text-muted);
  font-size: 0.9rem;
}
.error-state { color: var(--theme-primary); }
.spin-icon { font-size: 2rem; animation: spin 1.2s linear infinite; }
.empty-icon { font-size: 2.5rem; color: var(--theme-secondary); opacity: 0.5; }
.empty-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.1rem;
  color: var(--theme-text-main);
}
.empty-sub { font-size: 0.85rem; color: var(--theme-text-body); }

/* ── Timeline ───────────────────────────────────────────────────────────────────── */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

/* Línea vertical de fondo */
.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 44px;
  bottom: 32px;
  width: 1.5px;
  background: linear-gradient(
    to bottom,
    var(--theme-primary) 0%,
    var(--theme-card-border) 70%,
    transparent 100%
  );
  opacity: 0.4;
}

.memory-entry {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding-bottom: 2rem;
  position: relative;
}

/* Dot circular con corazón */
.entry-dot {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--theme-card-bg);
  border: 2px solid var(--theme-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  backdrop-filter: blur(6px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
}
.memory-entry:hover .entry-dot {
  transform: scale(1.14);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.13);
}
.dot-icon {
  font-size: 0.95rem;
  color: var(--theme-primary);
}

/* Memory card */
.memory-card {
  flex: 1;
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}
.memory-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

/* Área de foto */
.memory-photo-area {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
.memory-photo-area img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}
.memory-photo-area:hover img {
  transform: scale(1.04);
}
.photo-expand-hint {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.38);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  opacity: 0;
  transition: opacity 0.25s ease;
  backdrop-filter: blur(4px);
}
.memory-photo-area:hover .photo-expand-hint {
  opacity: 1;
}

/* Cuerpo de la card */
.card-body {
  padding: 1rem 1.2rem 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}
.card-body-left {
  flex: 1;
  min-width: 0;
}
.memory-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.08rem;
  font-weight: 700;
  color: var(--theme-text-main);
  margin: 0 0 0.4rem;
  line-height: 1.3;
}
.memory-date {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.76rem;
  color: var(--theme-text-muted);
}
.date-icon {
  color: var(--theme-secondary);
  font-size: 0.95rem;
  flex-shrink: 0;
}
.date-time {
  color: var(--theme-text-body);
  opacity: 0.65;
}

/* Acciones: ocultas hasta hover */
.card-actions {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}
.memory-card:hover .card-actions {
  opacity: 1;
}
.btn-card-action {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.05rem;
  color: var(--theme-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.2s ease, background 0.2s ease;
}
.btn-card-action:hover {
  color: var(--theme-primary);
  background: var(--theme-badge-bg);
}
.btn-card-delete:hover { color: #e53e3e; }
.btn-card-delete.confirm {
  color: #e53e3e;
  line-height: 1.3;
  flex: 1;
}

.card-divider {
  margin-top: 0.85rem;
  margin-bottom: 0.75rem;
}
.div-line {
  display: block;
  height: 1px;
  background: linear-gradient(90deg, var(--theme-secondary), transparent);
}

.memory-date-badge {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.1rem;
}
.badge-icon {
  font-size: 1.85rem;
  color: var(--theme-secondary);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.badge-texts {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.badge-day {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--theme-text-muted);
  line-height: 1.25;
}
.badge-time {
  font-size: 0.75rem;
  color: var(--theme-text-body);
  line-height: 1.2;
}

.btn-edit {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.05rem;
  color: var(--theme-text-muted);
  opacity: 0;
  transition: opacity 0.2s ease, color 0.2s ease;
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: 4px;
  flex-shrink: 0;
}
.btn-edit:hover { color: var(--theme-primary); }

/* ── Counter ──────────────────────────────────────────────────────────────── */
.recuerdos-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--theme-text-muted);
  letter-spacing: 0.05em;
  padding: 0.5rem;
}

/* ── FAB ──────────────────────────────────────────────────────────────────── */
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
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
.fab:active { transform: scale(0.96); }

/* ── Modal classes removed (now in DynamicFormModal) ── */

.form-foto-preview {
  margin-top: 0.4rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid var(--theme-card-border);
  max-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
}
.form-foto-preview img {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

/* ── (old photo classes removed, now in .memory-photo-area) ── */

/* ── Lightbox Modal ── */
.lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: 400;
  background: rgba(15, 10, 5, 0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  cursor: pointer;
}

.lightbox-img {
  max-width: 92vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7);
  border: 2px solid var(--theme-card-border);
  transition: transform 0.25s ease;
}
.lightbox-backdrop:hover .lightbox-img {
  transform: scale(1.01);
}

</style>
