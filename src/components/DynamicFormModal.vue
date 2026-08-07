<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  show: Boolean,
  title: String,
  schema: {
    type: Array,
    required: true
  },
  modelValue: {
    type: Object,
    required: true
  },
  loading: Boolean,
  saveText: {
    type: String,
    default: 'Guardar'
  },
  saveIcon: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'save'])

let isBackdropMouseDown = false
function handleBackdropMouseDown(e) {
  isBackdropMouseDown = (e.target === e.currentTarget)
}
function handleBackdropClick(e) {
  if (isBackdropMouseDown && e.target === e.currentTarget) {
    emit('close')
  }
}

const localModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function updateField(key, value) {
  const newVal = { ...localModel.value, [key]: value }
  emit('update:modelValue', newVal)
}
</script>

<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="modal-backdrop" @mousedown="handleBackdropMouseDown" @click="handleBackdropClick">
        <div class="modal-card">
          
          <div class="modal-header">
            <h2 class="modal-title">{{ title }}</h2>
            <button class="btn-modal-close" @click="$emit('close')">
              <Icon icon="mdi:close" />
            </button>
          </div>

          <div class="modal-ornament">
            <span class="orn-line"></span>
            <span class="modal-heart">♥</span>
            <span class="orn-line"></span>
          </div>

          <div class="modal-body modal-body-grid">
            <template v-for="field in schema" :key="field.id">
              
              <!-- SLOTS -->
              <div v-if="field.type === 'slot'" :class="['form-group', field.fullWidth ? 'full-width' : '']">
                <slot :name="`field-${field.id}`"></slot>
              </div>

              <!-- NATIVE INPUTS -->
              <div v-else :class="['form-group', field.fullWidth ? 'full-width' : '']">
                <label class="form-label">
                  <Icon v-if="field.icon" :icon="field.icon" style="margin-right:4px;" />
                  {{ field.label }}
                </label>
                
                <textarea v-if="field.type === 'textarea'"
                  :value="localModel[field.id]"
                  @input="updateField(field.id, $event.target.value)"
                  class="form-textarea" 
                  :rows="field.rows || 2" 
                  :placeholder="field.placeholder"
                ></textarea>

                <select v-else-if="field.type === 'select'"
                  :value="localModel[field.id]"
                  @change="updateField(field.id, $event.target.value)"
                  class="form-select"
                >
                  <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>

                <input v-else
                  :type="field.type"
                  :value="localModel[field.id]"
                  @input="updateField(field.id, field.type === 'number' && $event.target.value !== '' ? Number($event.target.value) : $event.target.value)"
                  class="form-input"
                  :placeholder="field.placeholder"
                  :step="field.step"
                />
              </div>

            </template>
          </div>
          
          <div class="modal-actions">
            <div class="actions-right">
              <button class="btn-cancel" @click="$emit('close')">Cancelar</button>
              <button class="btn-save" @click="$emit('save')" :disabled="loading">
                <Icon v-if="loading" icon="mdi:loading" class="spin-icon" />
                <Icon v-else-if="saveIcon" :icon="saveIcon" />
                {{ loading ? '' : saveText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
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
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 0.75rem;
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
}
.modal-ornament {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 1.5rem 0.5rem;
}
.modal-heart {
  color: var(--theme-primary);
  font-size: 0.7rem;
}
.orn-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--theme-badge-border), transparent);
}
.modal-body {
  padding: 0.5rem 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  overflow-y: auto;
}
.modal-body-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.full-width {
  grid-column: span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.form-label {
  display: flex;
  align-items: center;
  font-family: 'Cause', system-ui, sans-serif;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--theme-text-muted);
  font-weight: 700;
}

textarea {
  resize: vertical;
}

.form-input, .form-textarea, .form-select {
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 6px;
  padding: 0.65rem 0.85rem;
  font-size: 0.92rem;
  font-family: 'Cause', system-ui, sans-serif;
  color: var(--theme-text-main);
  outline: none;
  width: 100%;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem 1.5rem 1.25rem;
  background: rgba(0, 0, 0, 0.02);
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
.btn-delete {
  background: transparent;
  border: 1.5px solid var(--theme-primary);
  border-radius: 6px;
  padding: 0.6rem 0.9rem;
  font-size: 0.85rem;
  color: var(--theme-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.btn-delete.confirm {
  color: #e53e3e;
  border-color: #e53e3e;
  background: rgba(229, 62, 62, 0.15);
}
.spin-icon {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* Animations */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>
