<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useCartas } from '../composables/useCartas.js'
import { useRelationshipStore } from '../stores/relationship.js'

const { cartas, loading, error, addCarta, updateCarta, deleteCarta } = useCartas()
const rel = useRelationshipStore()

// ── Date formatter ────────────────────────────────────────────────────────────
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
})
function formatDate(date) {
  if (!date) return ''
  const d = dateFormatter.format(date)
  return d.charAt(0).toUpperCase() + d.slice(1)
}
function toDateOnly(date) {
  if (!date) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// ── Modal state ───────────────────────────────────────────────────────────────
const showModal    = ref(false)
const editTarget   = ref(null)
const formTitulo   = ref('')
const formContenido = ref('')
const formDe       = ref('')
const formPara     = ref('')
const formDatetime = ref('')
const saving       = ref(false)

const modalTitle = computed(() => editTarget.value ? 'Editar carta' : 'Escribir carta')

function openAdd() {
  editTarget.value    = null
  formTitulo.value    = ''
  formContenido.value = ''
  formDe.value        = rel.coupleNames?.split(' & ')[0] || ''
  formPara.value      = rel.coupleNames?.split(' & ')[1] || ''
  formDatetime.value  = toDateOnly(new Date())
  showModal.value     = true
}

function openEdit(carta) {
  editTarget.value    = carta
  formTitulo.value    = carta.titulo    || ''
  formContenido.value = carta.contenido || ''
  formDe.value        = carta.de        || ''
  formPara.value      = carta.para      || ''
  formDatetime.value  = toDateOnly(carta.date || new Date())
  showModal.value     = true
}

function closeModal() {
  showModal.value = false
}

// ── Read modal ───────────────────────────────────────────────────────────────
const readCarta = ref(null)
function openRead(carta) { readCarta.value = carta }
function closeRead()    { readCarta.value = null  }

// ── Delete with confirmation ──────────────────────────────────────────────────
const deletingCartaId = ref(null)
let   deleteCartaTimeout = null

async function handleCardDelete(carta) {
  if (deletingCartaId.value === carta.id) {
    clearTimeout(deleteCartaTimeout)
    deletingCartaId.value = null
    await deleteCarta(carta.id)
    if (readCarta.value?.id === carta.id) closeRead()
  } else {
    deletingCartaId.value = carta.id
    clearTimeout(deleteCartaTimeout)
    deleteCartaTimeout = setTimeout(() => {
      deletingCartaId.value = null
    }, 3000)
  }
}

// ── Backdrop click ────────────────────────────────────────────────────────────
let isBackdropMouseDown = false
function handleBackdropMouseDown(e) {
  isBackdropMouseDown = (e.target === e.currentTarget)
}
function handleBackdropClick(e) {
  if (isBackdropMouseDown && e.target === e.currentTarget) closeModal()
  isBackdropMouseDown = false
}

// ── Save ──────────────────────────────────────────────────────────────────────
async function handleSave() {
  if (!formTitulo.value.trim() && !formContenido.value.trim()) return
  saving.value = true
  try {
    const date = formDatetime.value ? new Date(formDatetime.value + 'T12:00:00') : new Date()
    if (editTarget.value) {
      await updateCarta(editTarget.value.id, formTitulo.value.trim(), formContenido.value.trim(), formDe.value.trim(), formPara.value.trim(), date)
    } else {
      await addCarta(formTitulo.value.trim(), formContenido.value.trim(), formDe.value.trim(), formPara.value.trim(), date)
    }
    closeModal()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="cartas-page">
    <div class="cartas-content">

      <!-- Page Header -->
      <div class="page-header">
        <div class="header-icon">
          <Icon icon="mdi:email-heart-outline" />
        </div>
        <div>
          <h1 class="page-title">Cartas</h1>
          <p class="page-subtitle">Palabras que guardamos para siempre</p>
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
        <p>Cargando cartas...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-box error-state">
        <Icon icon="mdi:alert-circle-outline" />
        <p>No se pudieron cargar las cartas.</p>
      </div>

      <!-- Empty -->
      <div v-else-if="cartas.length === 0" class="state-box empty-box">
        <Icon icon="mdi:email-outline" class="empty-icon" />
        <p class="empty-title">Aún no hay cartas escritas</p>
        <p class="empty-sub">Presioná el botón ✦ para escribir la primera ♥</p>
      </div>

      <!-- Cards grid -->
      <div v-else class="cartas-grid">
        <div
          v-for="carta in cartas"
          :key="carta.id"
          class="carta-card"
          @click="openRead(carta)"
        >
          <!-- Wax seal decoration -->
          <div class="carta-seal">✉</div>

          <!-- Card header -->
          <div class="carta-header">
            <div class="carta-meta">
              <h3 class="carta-titulo">{{ carta.titulo }}</h3>
              <div v-if="carta.de || carta.para" class="carta-from-to">
                <span v-if="carta.de">De: <strong>{{ carta.de }}</strong></span>
                <span v-if="carta.de && carta.para" class="meta-sep">→</span>
                <span v-if="carta.para">Para: <strong>{{ carta.para }}</strong></span>
              </div>
            </div>
            <div class="carta-actions" @click.stop>
              <button class="btn-card-action" @click="openEdit(carta)" title="Editar carta">
                <Icon icon="mdi:pencil-outline" />
              </button>
              <button
                class="btn-card-action btn-card-delete"
                :class="{ confirm: deletingCartaId === carta.id }"
                @click="handleCardDelete(carta)"
                :title="deletingCartaId === carta.id ? 'Presiona de nuevo para confirmar' : 'Eliminar carta'"
              >
                <Icon :icon="deletingCartaId === carta.id ? 'mdi:alert-circle' : 'mdi:trash-can-outline'" />
              </button>
            </div>
          </div>

          <!-- Date -->
          <div v-if="carta.date" class="carta-date">
            <Icon icon="mdi:calendar-heart" />
            <span>{{ formatDate(carta.date) }}</span>
          </div>

          <!-- Open hint -->
          <div class="carta-open-hint">
            <Icon icon="mdi:email-open-outline" />
            <span>Leer carta</span>
          </div>
        </div>
      </div>

    </div>

    <!-- FAB -->
    <button class="fab" @click="openAdd" title="Escribir carta">
      <Icon icon="mdi:plus" />
    </button>

    <!-- ── Modal Form ──────────────────────────────────────────────────────── -->
    <transition name="modal-fade">
      <div
        v-if="showModal"
        class="modal-backdrop"
        @mousedown="handleBackdropMouseDown"
        @click="handleBackdropClick"
      >
        <div class="modal-card">

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

          <div class="modal-body">

            <div class="form-group">
              <label class="form-label">Título de la carta</label>
              <input
                v-model="formTitulo"
                type="text"
                class="form-input"
                placeholder="Ej: Para cuando estés triste, Mi promesa para vos..."
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">De</label>
                <input
                  v-model="formDe"
                  type="text"
                  class="form-input"
                  placeholder="Tu nombre"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Para</label>
                <input
                  v-model="formPara"
                  type="text"
                  class="form-input"
                  placeholder="Nombre del destinatario"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Fecha</label>
              <input v-model="formDatetime" type="date" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">Contenido de la carta</label>
              <textarea
                v-model="formContenido"
                class="form-textarea carta-textarea"
                rows="8"
                placeholder="Escribí tu carta aquí... con todo el amor del mundo ♥"
              ></textarea>
            </div>

          </div>

          <div class="modal-actions">
            <div class="actions-right">
              <button class="btn-cancel" @click="closeModal" :disabled="saving">Cancelar</button>
              <button
                class="btn-save"
                @click="handleSave"
                :disabled="saving || (!formTitulo.trim() && !formContenido.trim())"
              >
                <Icon v-if="saving" icon="mdi:loading" class="spin-icon-sm" />
                <Icon v-else icon="mdi:send-outline" />
                {{ saving ? 'Guardando...' : 'Guardar carta' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </transition>

    <!-- ── Read Modal ─────────────────────────────────────────────────────── -->
    <transition name="modal-fade">
      <div
        v-if="readCarta"
        class="modal-backdrop"
        @click.self="closeRead"
      >
        <div class="modal-card read-modal-card">

          <!-- Header -->
          <div class="read-modal-header">
            <div class="read-modal-seal">✉</div>
            <div class="read-modal-meta">
              <h2 class="read-modal-titulo">{{ readCarta.titulo }}</h2>
              <div v-if="readCarta.de || readCarta.para" class="carta-from-to">
                <span v-if="readCarta.de">De: <strong>{{ readCarta.de }}</strong></span>
                <span v-if="readCarta.de && readCarta.para" class="meta-sep">→</span>
                <span v-if="readCarta.para">Para: <strong>{{ readCarta.para }}</strong></span>
              </div>
              <div v-if="readCarta.date" class="carta-date">
                <Icon icon="mdi:calendar-heart" />
                <span>{{ formatDate(readCarta.date) }}</span>
              </div>
            </div>
            <button class="btn-modal-close" @click="closeRead">
              <Icon icon="mdi:close" />
            </button>
          </div>

          <div class="modal-ornament">
            <span class="orn-line"></span>
            <span class="modal-heart">♥</span>
            <span class="orn-line"></span>
          </div>

          <!-- Letter content -->
          <div class="read-modal-body">
            <p class="read-carta-text">{{ readCarta.contenido || 'Esta carta no tiene contenido aún.' }}</p>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.cartas-page {
  min-height: 100vh;
  padding: 5rem 2rem 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  font-family: 'Cause', system-ui, sans-serif;
}

.cartas-content {
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
}
.header-icon {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  background: var(--theme-badge-bg);
  border: 1.5px solid var(--theme-badge-border);
  color: var(--theme-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  flex-shrink: 0;
}
.page-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--theme-text-main);
  margin: 0;
}
.page-subtitle {
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.9rem;
  color: var(--theme-text-muted);
  margin-top: 2px;
}

/* Ornament */
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

/* States */
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
.error-state { border-color: var(--theme-primary); }
.empty-icon  { font-size: 3rem; color: var(--theme-secondary); }
.empty-title { font-size: 1.05rem; font-weight: 600; color: var(--theme-text-main); margin: 0; }
.empty-sub   { font-size: 0.85rem; margin: 0; }
.spin-icon   { font-size: 1.5rem; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Cards grid */
.cartas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

/* Carta card */
.carta-card {
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 8px;
  padding: 1.25rem 1.2rem 0.9rem;
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  overflow: hidden;
}
.carta-card:hover {
  border-color: var(--theme-primary);
  box-shadow: 0 4px 18px rgba(0,0,0,0.1);
}

/* Wax seal */
.carta-seal {
  position: absolute;
  top: -0.4rem;
  right: 1rem;
  font-size: 2rem;
  color: var(--theme-secondary);
  opacity: 0.25;
  pointer-events: none;
  line-height: 1;
}

/* Card header */
.carta-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}
.carta-meta { flex: 1; min-width: 0; }
.carta-titulo {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--theme-text-main);
  margin: 0 0 0.2rem;
  line-height: 1.3;
}
.carta-from-to {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.78rem;
  color: var(--theme-text-muted);
}
.meta-sep { color: var(--theme-primary); font-size: 0.85rem; }
.carta-from-to strong { color: var(--theme-text-body); }

/* Card actions */
.carta-actions {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  flex-shrink: 0;
}
.btn-card-action {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--theme-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease, background 0.2s ease;
}
.btn-card-action:hover { color: var(--theme-primary); background: var(--theme-badge-bg); }
.btn-card-delete:hover { color: #e53e3e; }
.btn-card-delete.confirm { color: #e53e3e; background: rgba(229,62,62,0.12); }

/* Date */
.carta-date {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.78rem;
  color: var(--theme-text-muted);
}

/* Open hint */
.carta-open-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.75rem;
  color: var(--theme-text-muted);
  padding-top: 0.4rem;
  border-top: 1px solid var(--theme-card-border);
  transition: color 0.2s ease;
}
.carta-card:hover .carta-open-hint { color: var(--theme-primary); }

/* Read modal */
.read-modal-card {
  max-width: 640px;
}
.read-modal-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem 1rem;
}
.read-modal-seal {
  font-size: 2.2rem;
  color: var(--theme-secondary);
  opacity: 0.6;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 2px;
}
.read-modal-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.read-modal-titulo {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--theme-text-main);
  margin: 0;
  line-height: 1.3;
}
.read-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem;
}
.read-carta-text {
  font-family: 'Georgia', serif;
  font-size: 1rem;
  color: var(--theme-text-body);
  line-height: 1.9;
  white-space: pre-wrap;
  margin: 0;
}

/* FAB */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--theme-btn-gradient);
  border: none;
  color: #fff9f5;
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(160, 110, 60, 0.35);
  z-index: 50;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.fab:hover { transform: scale(1.09); box-shadow: 0 6px 24px rgba(160, 110, 60, 0.45); }

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.modal-card {
  background: var(--theme-drawer-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 12px;
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 1rem;
}
.modal-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--theme-text-main);
  margin: 0;
}
.btn-modal-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.3rem;
  color: var(--theme-text-muted);
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}
.btn-modal-close:hover { color: var(--theme-primary); }

.modal-ornament {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.5rem 0.75rem;
}
.modal-heart {
  font-size: 0.75rem;
  color: var(--theme-secondary);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.form-label {
  font-family: 'Cause', system-ui, sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--theme-text-muted);
  letter-spacing: 0.03em;
}
.form-input, .form-textarea {
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.88rem;
  color: var(--theme-text-body);
  outline: none;
  transition: border-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}
.form-input:focus, .form-textarea:focus {
  border-color: var(--theme-primary);
}
.form-textarea { resize: vertical; min-height: 80px; }
.carta-textarea { font-family: 'Georgia', serif; font-size: 0.95rem; line-height: 1.8; min-height: 180px; }

.modal-actions {
  padding: 1rem 1.5rem 1.25rem;
  background: rgba(0,0,0,0.02);
  border-top: 1px solid var(--theme-card-border);
}
.actions-right {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
}
.btn-cancel {
  background: transparent;
  border: 1.5px solid var(--theme-card-border);
  border-radius: 6px;
  padding: 0.6rem 1.1rem;
  font-size: 0.85rem;
  color: var(--theme-text-body);
  cursor: pointer;
  font-family: 'Cause', system-ui, sans-serif;
}
.btn-save {
  background: var(--theme-btn-gradient);
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff9f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'Cause', system-ui, sans-serif;
}
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.spin-icon-sm { animation: spin 1s linear infinite; }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal-card { transform: scale(0.96) translateY(8px); }
.modal-fade-leave-to  .modal-card  { transform: scale(0.96) translateY(8px); }
</style>
