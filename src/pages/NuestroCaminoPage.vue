<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import vintageBg from '../assets/vintage_bg.png'
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

// ── Modal state ───────────────────────────────────────────────────────────────
const showModal    = ref(false)
const editTarget   = ref(null)   // null = new record, object = editing existing
const formTitulo   = ref('')
const formDatetime = ref('')
const saving       = ref(false)
const confirmDelete = ref(false)

const modalTitle = computed(() =>
  editTarget.value ? 'Editar recuerdo' : 'Nuevo recuerdo'
)

function openAdd() {
  editTarget.value   = null
  formTitulo.value   = ''
  // Default to now in local time
  formDatetime.value = toDatetimeLocal(new Date())
  confirmDelete.value = false
  showModal.value    = true
}

function openEdit(recuerdo) {
  editTarget.value    = recuerdo
  formTitulo.value    = recuerdo.titulo
  formDatetime.value  = toDatetimeLocal(recuerdo.date)
  confirmDelete.value = false
  showModal.value     = true
}

function closeModal() {
  showModal.value     = false
  confirmDelete.value = false
}

async function handleSave() {
  if (!formTitulo.value.trim() || !formDatetime.value) return
  saving.value = true
  try {
    const date = new Date(formDatetime.value)
    if (editTarget.value) {
      await updateRecuerdo(editTarget.value.id, formTitulo.value.trim(), date)
    } else {
      await addRecuerdo(formTitulo.value.trim(), date)
    }
    closeModal()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!confirmDelete.value) {
    confirmDelete.value = true
    return
  }
  saving.value = true
  try {
    await deleteRecuerdo(editTarget.value.id)
    closeModal()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="camino-page" :style="{ backgroundImage: `url(${vintageBg})` }">
    <div class="overlay"></div>

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
        <div v-for="(recuerdo, index) in recuerdos" :key="recuerdo.id" class="timeline-item">
          <!-- Connector -->
          <div class="timeline-connector">
            <div class="connector-dot">
              <Icon icon="mdi:heart" class="dot-icon" />
            </div>
            <div v-if="index < recuerdos.length - 1" class="connector-line"></div>
          </div>

          <!-- Card -->
          <div class="memory-card">
            <!-- Date badge -->
            <div class="memory-date-badge" v-if="recuerdo.date">
              <Icon icon="mdi:calendar-heart" class="badge-icon" />
              <div class="badge-texts">
                <span class="badge-day">{{ formatDate(recuerdo.date) }}</span>
                <span class="badge-time">{{ formatTime(recuerdo.date) }}</span>
              </div>
            </div>
            <div class="card-divider"><span class="div-line"></span></div>
            <div class="card-bottom">
              <h3 class="memory-title">{{ recuerdo.titulo }}</h3>
              <!-- Edit button -->
              <button class="btn-edit" @click="openEdit(recuerdo)" title="Editar">
                <Icon icon="mdi:pencil-outline" />
              </button>
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

    <!-- ── Modal ─────────────────────────────────────────────────────────── -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
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
            <span style="color:#c0717e;font-size:0.7rem;">♥</span>
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
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <!-- Delete (only when editing) -->
            <button
              v-if="editTarget"
              class="btn-delete"
              :class="{ confirm: confirmDelete }"
              @click="handleDelete"
              :disabled="saving"
            >
              <Icon :icon="confirmDelete ? 'mdi:alert' : 'mdi:trash-can-outline'" />
              {{ confirmDelete ? '¿Confirmar eliminación?' : 'Eliminar' }}
            </button>

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

  </div>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────────────────── */
.camino-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  font-family: 'Lato', system-ui, sans-serif;
}

.overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(255, 250, 242, 0.88) 0%,
    rgba(253, 238, 218, 0.82) 60%,
    rgba(255, 242, 230, 0.88) 100%
  );
  pointer-events: none;
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
  background: linear-gradient(135deg, rgba(192, 113, 126, 0.15), rgba(192, 148, 108, 0.12));
  border: 1.5px solid rgba(192, 148, 108, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #c0946c;
  flex-shrink: 0;
}
.page-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.9rem;
  font-weight: 700;
  color: #5c3d2e;
  margin: 0;
  line-height: 1.15;
}
.page-subtitle {
  font-size: 0.85rem;
  color: #a07850;
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
  background: linear-gradient(90deg, transparent, rgba(192, 148, 108, 0.5), transparent);
}
.orn-flowers {
  font-size: 0.75rem;
  color: #c0946c;
  letter-spacing: 4px;
}

/* ── States ───────────────────────────────────────────────────────────────── */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 2rem;
  background: rgba(255, 252, 245, 0.85);
  border: 1.5px solid rgba(192, 148, 108, 0.25);
  border-radius: 4px;
  text-align: center;
  color: #a07850;
  font-size: 0.9rem;
}
.error-state { color: #c0717e; }
.spin-icon { font-size: 2rem; animation: spin 1.2s linear infinite; }
.empty-icon { font-size: 2.5rem; color: #c0946c; opacity: 0.5; }
.empty-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.1rem;
  color: #7a5540;
}
.empty-sub { font-size: 0.85rem; color: #b09070; }

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
  background: linear-gradient(135deg, rgba(192, 113, 126, 0.2), rgba(192, 148, 108, 0.15));
  border: 1.5px solid rgba(192, 113, 126, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dot-icon { font-size: 0.9rem; color: #c0717e; }
.connector-line {
  width: 1.5px;
  flex: 1;
  min-height: 1.5rem;
  background: linear-gradient(to bottom, rgba(192, 148, 108, 0.35), rgba(192, 148, 108, 0.1));
  margin: 0.35rem 0;
}

.memory-card {
  flex: 1;
  background: rgba(255, 252, 245, 0.88);
  border: 1.5px solid rgba(192, 148, 108, 0.25);
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

.memory-date-badge {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
}
.badge-icon { font-size: 1rem; color: #c0946c; margin-top: 2px; flex-shrink: 0; }
.badge-texts { display: flex; flex-direction: column; }
.badge-day {
  font-size: 0.8rem;
  font-weight: 600;
  color: #a07850;
  text-transform: capitalize;
}
.badge-time { font-size: 0.72rem; color: #b89070; }

.card-divider { margin-bottom: 0.65rem; }
.div-line {
  display: block;
  height: 1px;
  background: linear-gradient(90deg, rgba(192, 148, 108, 0.4), transparent);
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.memory-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: #5c3d2e;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.btn-edit {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.05rem;
  color: #a07850;
  opacity: 0;
  transition: opacity 0.2s ease, color 0.2s ease;
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: 4px;
  flex-shrink: 0;
}
.btn-edit:hover { color: #c0717e; }

/* ── Counter ──────────────────────────────────────────────────────────────── */
.recuerdos-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #a07850;
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
  background: linear-gradient(135deg, #c0717e, #a85060);
  border: none;
  color: #fff9f5;
  font-size: 1.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 18px rgba(168, 80, 96, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.fab:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 8px 24px rgba(168, 80, 96, 0.5);
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
  background: #fdf8f0;
  border: 1.5px solid rgba(192, 148, 108, 0.3);
  border-radius: 12px 12px 0 0;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 -8px 40px rgba(120, 70, 30, 0.2);
  overflow: hidden;
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
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #5c3d2e;
  margin: 0;
}
.btn-modal-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #a07850;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.2s, transform 0.2s;
}
.btn-modal-close:hover { color: #c0717e; transform: rotate(90deg); }

.modal-ornament {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 1.5rem 0.75rem;
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
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #a07850;
  font-weight: 700;
}
.form-input {
  background: rgba(255, 248, 238, 0.9);
  border: 1.5px solid rgba(192, 148, 108, 0.45);
  border-radius: 6px;
  padding: 0.7rem 0.9rem;
  font-size: 0.95rem;
  font-family: 'Lato', system-ui, sans-serif;
  color: #5c3d2e;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
}
.form-input:focus {
  border-color: #c0717e;
  box-shadow: 0 0 0 3px rgba(192, 113, 126, 0.18);
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem 1.5rem;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.actions-right {
  display: flex;
  gap: 0.6rem;
  margin-left: auto;
}

.btn-cancel {
  background: none;
  border: 1.5px solid rgba(192, 148, 108, 0.4);
  border-radius: 6px;
  padding: 0.6rem 1.1rem;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.875rem;
  color: #8a6550;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover { background: rgba(192, 148, 108, 0.08); }

.btn-save {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: linear-gradient(135deg, #c0717e, #a85060);
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff9f5;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 3px 10px rgba(168, 80, 96, 0.3);
}
.btn-save:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
.btn-save:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-delete {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: 1.5px solid rgba(192, 113, 126, 0.35);
  border-radius: 6px;
  padding: 0.6rem 0.9rem;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.85rem;
  color: #c0717e;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.btn-delete:hover { background: rgba(192, 113, 126, 0.08); }
.btn-delete.confirm {
  background: #c0717e;
  color: #fff9f5;
  border-color: #c0717e;
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
