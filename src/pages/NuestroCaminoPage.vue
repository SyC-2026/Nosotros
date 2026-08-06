<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useRecuerdos } from '../composables/useRecuerdos.js'

const { recuerdos, loading, error, addRecuerdo, updateRecuerdo, deleteRecuerdo } = useRecuerdos()

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

// ── Carga dinámica de fotos desde src/assets/fotos/ ────────────────────────────
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

function getFotoUrl(filename) {
  if (!filename) return null
  return fotosMap.value[filename] || null
}

// ── Modal state ───────────────────────────────────────────────────────────────
const showModal    = ref(false)
const editTarget   = ref(null)   // null = new record, object = editing existing
const formTitulo   = ref('')
const formDatetime = ref('')
const formFoto     = ref('')
const saving       = ref(false)
const confirmDelete = ref(false)

const modalTitle = computed(() =>
  editTarget.value ? 'Editar recuerdo' : 'Nuevo recuerdo'
)

function openAdd() {
  editTarget.value   = null
  formTitulo.value   = ''
  formFoto.value     = ''
  // Default to now in local time
  formDatetime.value = toDatetimeLocal(new Date())
  confirmDelete.value = false
  showModal.value    = true
}

function openEdit(recuerdo) {
  editTarget.value    = recuerdo
  formTitulo.value    = recuerdo.titulo
  formDatetime.value  = toDatetimeLocal(recuerdo.date)
  formFoto.value      = recuerdo.foto || ''
  confirmDelete.value = false
  showModal.value     = true
}

function closeModal() {
  showModal.value     = false
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
  if (!formTitulo.value.trim() || !formDatetime.value) return
  saving.value = true
  try {
    const date = new Date(formDatetime.value)
    if (editTarget.value) {
      await updateRecuerdo(editTarget.value.id, formTitulo.value.trim(), date, formFoto.value)
    } else {
      await addRecuerdo(formTitulo.value.trim(), date, formFoto.value)
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
        <div v-for="recuerdo in recuerdos" :key="recuerdo.id" class="timeline-item">
          <!-- Card -->
          <div class="memory-card">
            <!-- Card Header: Title & Edit button -->
            <div class="card-top">
              <h3 class="memory-title">{{ recuerdo.titulo }}</h3>
              <div class="card-actions">
                <button class="btn-card-action" @click="openEdit(recuerdo)" title="Editar recuerdo">
                  <Icon icon="mdi:pencil-outline" />
                </button>
                <button
                  class="btn-card-action btn-card-delete"
                  :class="{ confirm: deletingRecuerdoId === recuerdo.id }"
                  @click="handleCardDelete(recuerdo)"
                  :title="deletingRecuerdoId === recuerdo.id ? 'Presiona de nuevo para confirmar eliminación' : 'Eliminar recuerdo'"
                >
                  <Icon :icon="deletingRecuerdoId === recuerdo.id ? 'mdi:alert-circle' : 'mdi:trash-can-outline'" />
                </button>
              </div>
            </div>

            <!-- Memory photo -->
            <div
              v-if="recuerdo.foto && getFotoUrl(recuerdo.foto)"
              class="memory-photo-box"
              @click="openImagePreview(getFotoUrl(recuerdo.foto), recuerdo.titulo)"
              title="Haz clic para ampliar en pantalla completa"
            >
              <img
                :src="getFotoUrl(recuerdo.foto)"
                :alt="recuerdo.titulo"
                class="memory-photo"
                loading="lazy"
              />
              <div class="photo-expand-badge">
                <Icon icon="mdi:arrow-expand-all" />
              </div>
            </div>

            <!-- Divider -->
            <div class="card-divider"><span class="div-line"></span></div>

            <!-- Card Footer: Date badge -->
            <div class="memory-date-badge" v-if="recuerdo.date">
              <Icon icon="mdi:calendar-heart" class="badge-icon" />
              <div class="badge-texts">
                <span class="badge-day">{{ formatDate(recuerdo.date) }}</span>
                <span class="badge-time">{{ formatTime(recuerdo.date) }}</span>
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
    <transition name="modal-fade">
      <div
        v-if="showModal"
        class="modal-backdrop"
        @mousedown="handleBackdropMouseDown"
        @click="handleBackdropClick"
      >
        <div class="modal-card">

          <!-- Modal header -->
          <div class="modal-header">
            <h2 class="modal-title">{{ modalTitle }}</h2>
            <button class="btn-modal-close" @click="closeModal">
              <Icon icon="mdi:close" />
            </button>
          </div>

          <div class="modal-ornament">
            <span class="orn-line"></span>
            <span class="modal-heart">♥</span>
            <span class="orn-line"></span>
          </div>

          <!-- Form -->
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Título del recuerdo</label>
              <input
                v-model="formTitulo"
                type="text"
                class="form-input"
                placeholder="Ej: Primera cena juntos..."
                @keyup.enter="handleSave"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Fecha y hora</label>
              <input
                v-model="formDatetime"
                type="datetime-local"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Foto asociable (opcional)</label>
              <select v-model="formFoto" class="form-select">
                <option value="">-- Sin foto --</option>
                <option v-for="name in availableFotoNames" :key="name" :value="name">
                  📷 {{ name }}
                </option>
              </select>
            </div>

            <!-- Preview selected photo -->
            <div v-if="formFoto && getFotoUrl(formFoto)" class="form-foto-preview">
              <img :src="getFotoUrl(formFoto)" :alt="formFoto" />
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <div class="actions-right">
              <button class="btn-cancel" @click="closeModal" :disabled="saving">
                Cancelar
              </button>
              <button
                class="btn-save"
                @click="handleSave"
                :disabled="saving || !formTitulo.trim() || !formDatetime"
              >
                <Icon v-if="saving" icon="mdi:loading" class="spin-icon-sm" />
                <Icon v-else icon="mdi:content-save-outline" />
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </transition>

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
  max-width: 600px;
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
  border-radius: 4px;
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

/* ── Timeline ─────────────────────────────────────────────────────────────── */
.timeline {
  display: flex;
  flex-direction: column;
}
.timeline-item {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}
.timeline-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding-top: 0.2rem;
}
.connector-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--theme-badge-bg);
  border: 1.5px solid var(--theme-card-border);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dot-icon { font-size: 0.9rem; color: var(--theme-primary); }
.connector-line {
  width: 1.5px;
  flex: 1;
  min-height: 1.5rem;
  background: linear-gradient(to bottom, var(--theme-secondary), transparent);
  margin: 0.35rem 0;
}

.memory-card {
  flex: 1;
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 4px;
  padding: 1.1rem 1.2rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 10px rgba(160, 110, 60, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.memory-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(160, 110, 60, 0.13);
}
.memory-card:hover .btn-edit {
  opacity: 1;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}
.btn-card-action {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.15rem;
  color: var(--theme-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
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
.memory-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--theme-text-main);
  margin: 0;
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
  border-radius: 50%;
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
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
.fab:active { transform: scale(0.96); }

/* ── Modal ────────────────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(50, 30, 15, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}

@media (min-width: 480px) {
  .modal-backdrop {
    align-items: center;
    padding: 1rem;
  }
}

.modal-card {
  background: var(--theme-drawer-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 12px 12px 0 0;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative;
  z-index: 310;
  transition: background 0.4s ease, border-color 0.4s ease;
}

@media (min-width: 480px) {
  .modal-card { border-radius: 8px; }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
}
.modal-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--theme-text-main);
  margin: 0;
}
.btn-modal-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: var(--theme-text-muted);
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.2s, transform 0.2s;
}
.btn-modal-close:hover { color: var(--theme-primary); transform: rotate(90deg); }

.modal-ornament {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 1.5rem 0.75rem;
}
.modal-heart {
  color: var(--theme-primary);
  font-size: 0.7rem;
}

.modal-body {
  padding: 0.25rem 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.form-label {
  font-family: 'Cause', system-ui, sans-serif;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--theme-text-muted);
  font-weight: 700;
}
.form-input {
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 6px;
  padding: 0.7rem 0.9rem;
  font-size: 0.95rem;
  font-family: 'Cause', system-ui, sans-serif;
  color: var(--theme-text-main);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
}
.form-input:focus {
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 3px var(--theme-badge-bg);
}

.form-select {
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 6px;
  padding: 0.7rem 0.9rem;
  font-size: 0.95rem;
  font-family: 'Cause', system-ui, sans-serif;
  color: var(--theme-text-main);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
  cursor: pointer;
}
.form-select:focus {
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 3px var(--theme-badge-bg);
}

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

/* ── Memory Photo in Timeline Card ── */
.memory-photo-box {
  margin-top: 0.85rem;
  border-radius: 6px;
  overflow: hidden;
  border: 1.5px solid var(--theme-card-border);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.03);
  position: relative;
  cursor: pointer;
}
.memory-photo {
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.memory-card:hover .memory-photo {
  transform: scale(1.02);
}
.photo-expand-badge {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  background: rgba(0, 0, 0, 0.55);
  color: #ffffff;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  opacity: 0;
  transition: opacity 0.22s ease, background 0.22s ease;
  backdrop-filter: blur(4px);
}
.memory-photo-box:hover .photo-expand-badge {
  opacity: 1;
}

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

/* ── Modal Actions Layout Fix ── */
.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem 1.5rem;
}
.actions-right {
  display: flex;
  gap: 0.65rem;
  width: 100%;
}

.btn-cancel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  background: none;
  border: 1.5px solid var(--theme-card-border);
  border-radius: 6px;
  padding: 0.65rem 1.1rem;
  font-family: 'Cause', system-ui, sans-serif;
  font-size: 0.875rem;
  color: var(--theme-text-body);
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover { background: var(--theme-badge-bg); }

.btn-save {
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  min-width: 130px;
  gap: 0.4rem;
  background: var(--theme-btn-gradient);
  border: none;
  border-radius: 6px;
  padding: 0.65rem 1.2rem;
  font-family: 'Cause', system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff9f5;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}
.btn-save:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
.btn-save:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-delete {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  gap: 0.4rem;
  background: none;
  border: 1.5px solid var(--theme-primary);
  border-radius: 6px;
  padding: 0.65rem 0.9rem;
  font-family: 'Cause', system-ui, sans-serif;
  font-size: 0.85rem;
  color: var(--theme-primary);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.btn-delete:hover { background: var(--theme-badge-bg); }
.btn-delete.confirm {
  background: var(--theme-primary);
  color: #fff9f5;
  border-color: var(--theme-primary);
  animation: shake 0.4s ease;
}

.spin-icon-sm { animation: spin 1s linear infinite; font-size: 1rem; }

/* ── Transitions ──────────────────────────────────────────────────────────── */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-fade-enter-from { opacity: 0; }
.modal-fade-enter-from .modal-card { transform: translateY(40px); }
.modal-fade-leave-to { opacity: 0; }
.modal-fade-leave-to .modal-card { transform: translateY(40px); }

/* ── Keyframes ────────────────────────────────────────────────────────────── */
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>
