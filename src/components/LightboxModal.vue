<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    required: true
  },
  imageAlt: {
    type: String,
    default: 'Imagen'
  },
  title: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    default: ''
  },
  showDetails: {
    type: Boolean,
    default: true
  }
})

defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="lightbox-backdrop" @click.self="$emit('close')">
        <div class="lightbox-content">
          <button v-if="!showDetails || (!title && !date && !$slots.actions)" class="btn-close-lightbox" @click="$emit('close')">
            <Icon icon="mdi:close" />
          </button>

          <div class="lightbox-image-container">
            <img :src="imageUrl" :alt="imageAlt" />
          </div>

          <div v-if="showDetails && (title || date || $slots.actions)" class="lightbox-details">
            <div class="lightbox-text">
              <h3 v-if="title">{{ title }}</h3>
              <p v-if="date" class="lightbox-date">
                <Icon icon="mdi:calendar-heart" /> {{ date }}
              </p>
            </div>

            <div v-if="$slots.actions" class="lightbox-actions">
              <slot name="actions"></slot>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.lightbox-backdrop {
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
  font-weight: 600;
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

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  /* transform: scale(0.98); */
}
</style>
