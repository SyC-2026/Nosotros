<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLugares } from '../composables/useLugares.js'

const { lugares, loading, error, addLugar, updateLugar, deleteLugar } = useLugares()

// ── Date Formatter ────────────────────────────────────────────────────────────
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

// ── Map State ─────────────────────────────────────────────────────────────────
const mapContainer = ref(null)
let mapInstance = null
let markerGroup = null
const selectedLugarId = ref(null)

function initMap() {
  if (mapInstance || !mapContainer.value) return

  // Coordenadas iniciales por defecto (Buenos Aires / Argentina)
  const initialLat = lugares.value.length > 0 ? lugares.value[0].lat : -34.6037
  const initialLng = lugares.value.length > 0 ? lugares.value[0].lng : -58.3816

  mapInstance = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false
  }).setView([initialLat, initialLng], 12)

  // Control de zoom en esquina superior derecha
  L.control.zoom({ position: 'topright' }).addTo(mapInstance)

  // Capa de mapa OpenStreetMap con estética clara
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(mapInstance)

  markerGroup = L.layerGroup().addTo(mapInstance)

  // Hacer clic en el mapa para capturar coordenadas al agregar/editar
  mapInstance.on('click', (e) => {
    if (showModal.value) {
      formLat.value = Number(e.latlng.lat.toFixed(6))
      formLng.value = Number(e.latlng.lng.toFixed(6))
    }
  })

  updateMapMarkers()
}

function updateMapMarkers() {
  if (!mapInstance || !markerGroup) return
  markerGroup.clearLayers()

  const bounds = []

  lugares.value.forEach((place) => {
    if (place.lat && place.lng) {
      bounds.push([place.lat, place.lng])

      // Ícono de pin personalizado
      const isSelected = place.id === selectedLugarId.value
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="pin-wrapper ${isSelected ? 'active' : ''}">
            <div class="pin-head">♥</div>
            <div class="pin-point"></div>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40]
      })

      const marker = L.marker([place.lat, place.lng], { icon: customIcon })
      marker.on('click', () => {
        selectLugar(place)
      })

      markerGroup.addLayer(marker)
    }
  })

  if (bounds.length > 0 && !selectedLugarId.value) {
    mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  }
}

function selectLugar(place) {
  selectedLugarId.value = place.id
  if (mapInstance && place.lat && place.lng) {
    mapInstance.flyTo([place.lat, place.lng], 15, { animate: true, duration: 1.2 })
  }
  updateMapMarkers()
}

watch(lugares, () => {
  nextTick(() => {
    if (!mapInstance) {
      initMap()
    } else {
      updateMapMarkers()
    }
  })
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      initMap()
    }, 200)
  })
})

// ── Modal State ───────────────────────────────────────────────────────────────
const showModal     = ref(false)
const editTarget    = ref(null)
const formTitulo    = ref('')
const formLugar     = ref('')
const formLat       = ref(-34.6037)
const formLng       = ref(-58.3816)
const formDesc      = ref('')
const formDatetime  = ref('')
const formFoto      = ref('')
const saving        = ref(false)
const confirmDelete = ref(false)

const modalTitle = computed(() =>
  editTarget.value ? 'Editar lugar' : 'Nuevo lugar visitado'
)

function openAdd() {
  editTarget.value    = null
  formTitulo.value    = ''
  formLugar.value     = ''
  geoQuery.value      = ''
  geoShowResults.value = false
  geoResults.value    = []
  // Usar las coordenadas del mapa actual o por defecto
  if (mapInstance) {
    const center = mapInstance.getCenter()
    formLat.value = Number(center.lat.toFixed(6))
    formLng.value = Number(center.lng.toFixed(6))
  } else {
    formLat.value = -34.6037
    formLng.value = -58.3816
  }
  formDesc.value      = ''
  formDatetime.value  = toDateOnly(new Date())
  formFoto.value      = ''
  confirmDelete.value = false
  showModal.value     = true
}

function openEdit(place) {
  editTarget.value    = place
  formTitulo.value    = place.titulo || place.nombre || ''
  formLugar.value     = place.lugar || place.nombre || ''
  formLat.value       = place.lat
  formLng.value       = place.lng
  formDesc.value      = place.descripcion || ''
  formDatetime.value  = toDateOnly(place.date || new Date())
  formFoto.value      = place.foto || ''
  geoQuery.value      = ''
  geoShowResults.value = false
  geoResults.value    = []
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

const deletingLugarId = ref(null)
let deleteLugarTimeout = null

async function handleCardDelete(lugar) {
  if (deletingLugarId.value === lugar.id) {
    clearTimeout(deleteLugarTimeout)
    deletingLugarId.value = null
    await deleteLugar(lugar.id)
  } else {
    deletingLugarId.value = lugar.id
    clearTimeout(deleteLugarTimeout)
    deleteLugarTimeout = setTimeout(() => {
      deletingLugarId.value = null
    }, 3000)
  }
}

async function handleSave() {
  if ((!formTitulo.value.trim() && !formLugar.value.trim()) || !formLat.value || !formLng.value) return
  saving.value = true
  try {
    const date = formDatetime.value ? new Date(formDatetime.value + 'T12:00:00') : new Date()
    const tituloVal = formTitulo.value.trim() || formLugar.value.trim()
    const lugarVal  = formLugar.value.trim() || formTitulo.value.trim()

    if (editTarget.value) {
      await updateLugar(
        editTarget.value.id,
        tituloVal,
        lugarVal,
        formLat.value,
        formLng.value,
        formDesc.value.trim(),
        date,
        formFoto.value
      )
    } else {
      await addLugar(
        tituloVal,
        lugarVal,
        formLat.value,
        formLng.value,
        formDesc.value.trim(),
        date,
        formFoto.value
      )
    }
    closeModal()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

// ── Lightbox Preview ─────────────────────────────────────────────────────────
const previewImage = ref(null)
function openImagePreview(url, title) {
  previewImage.value = { url, title }
}
function closeImagePreview() {
  previewImage.value = null
}

// ── Geocoding (Nominatim / OpenStreetMap) ────────────────────────────────────
const geoQuery       = ref('')
const geoResults     = ref([])
const geoLoading     = ref(false)
const geoShowResults = ref(false)
let   geoDebounce    = null

watch(geoQuery, (val) => {
  clearTimeout(geoDebounce)
  if (!val || val.trim().length < 3) {
    geoResults.value     = []
    geoShowResults.value = false
    return
  }
  geoDebounce = setTimeout(() => searchGeocode(val.trim()), 500)
})

async function searchGeocode(q) {
  geoLoading.value = true
  geoResults.value = []
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`
    const res  = await fetch(url, { headers: { 'Accept-Language': 'es' } })
    const data = await res.json()
    geoResults.value     = data
    geoShowResults.value = data.length > 0
  } catch (e) {
    console.error('Geocoding error:', e)
  } finally {
    geoLoading.value = false
  }
}

function selectGeoResult(result) {
  formLat.value    = Number(parseFloat(result.lat).toFixed(6))
  formLng.value    = Number(parseFloat(result.lon).toFixed(6))
  // Rellenar nombre del lugar si está vacío
  if (!formLugar.value.trim()) {
    formLugar.value = result.name || result.display_name.split(',')[0]
  }
  // Centrar mapa en el resultado
  if (mapInstance) {
    mapInstance.flyTo([formLat.value, formLng.value], 16, { animate: true, duration: 1 })
  }
  geoQuery.value       = result.display_name.split(',').slice(0, 2).join(', ')
  geoShowResults.value = false
  geoResults.value     = []
}

function closeGeoResults() {
  setTimeout(() => { geoShowResults.value = false }, 180)
}
</script>

<template>
  <div class="lugares-page">
    <div class="lugares-content">

      <!-- Page Header -->
      <div class="page-header">
        <div class="header-icon">
          <Icon icon="mdi:map-marker-path" />
        </div>
        <div>
          <h1 class="page-title">Lugares visitados</h1>
          <p class="page-subtitle">Cada rincón que recorrimos juntos</p>
        </div>
      </div>

      <!-- Ornament -->
      <div class="ornament">
        <span class="orn-line"></span>
        <span class="orn-flowers">✿ ♥ ✿</span>
        <span class="orn-line"></span>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="state-box">
        <Icon icon="mdi:loading" class="spin-icon" />
        <p>Cargando mapa y lugares...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="state-box error-state">
        <Icon icon="mdi:alert-circle-outline" />
        <p>No se pudieron cargar los lugares.</p>
      </div>

      <!-- Content Grid -->
      <div v-else class="lugares-layout">

        <!-- Map Box -->
        <div class="map-card">
          <div ref="mapContainer" class="places-map"></div>
          <div class="map-hint">
            <Icon icon="mdi:gesture-tap" />
            <span>Presioná en un pin o tarjeta para centrar</span>
          </div>
        </div>

        <!-- Places Cards List -->
        <div class="places-list">
          <div v-if="lugares.length === 0" class="state-box empty-box">
            <Icon icon="mdi:map-marker-off-outline" class="empty-icon" />
            <p class="empty-title">Aún no hay lugares guardados</p>
            <p class="empty-sub">Presioná el botón ✦ para marcar el primero ♥</p>
          </div>

          <div
            v-for="lugar in lugares"
            :key="lugar.id"
            class="place-card"
            :class="{ active: lugar.id === selectedLugarId }"
            @click="selectLugar(lugar)"
          >
            <div class="place-card-header">
              <div class="place-title-group">
                <h3 class="place-title">{{ lugar.titulo }}</h3>
                <div class="place-location-sub">
                  <Icon icon="mdi:map-marker" class="place-icon" />
                  <span class="place-location-name">{{ lugar.lugar }}</span>
                </div>
              </div>
              <div class="card-actions">
                <button class="btn-card-action" @click.stop="openEdit(lugar)" title="Editar lugar">
                  <Icon icon="mdi:pencil-outline" />
                </button>
                <button
                  class="btn-card-action btn-card-delete"
                  :class="{ confirm: deletingLugarId === lugar.id }"
                  @click.stop="handleCardDelete(lugar)"
                  :title="deletingLugarId === lugar.id ? 'Presiona de nuevo para confirmar eliminación' : 'Eliminar lugar'"
                >
                  <Icon :icon="deletingLugarId === lugar.id ? 'mdi:alert-circle' : 'mdi:trash-can-outline'" />
                </button>
              </div>
            </div>

            <p v-if="lugar.descripcion" class="place-desc">{{ lugar.descripcion }}</p>

            <!-- Memory photo -->
            <div
              v-if="lugar.foto && getFotoUrl(lugar.foto)"
              class="place-photo-box"
              @click.stop="openImagePreview(getFotoUrl(lugar.foto), lugar.titulo)"
              title="Haz clic para ampliar"
            >
              <img :src="getFotoUrl(lugar.foto)" :alt="lugar.titulo" class="place-photo" loading="lazy" />
            </div>

            <!-- Card footer: Date & Coordinates -->
            <div class="place-card-footer">
              <div v-if="lugar.date" class="place-date">
                <Icon icon="mdi:calendar-heart" />
                <span>{{ formatDate(lugar.date) }}</span>
              </div>
              <div class="place-coords">
                <Icon icon="mdi:crosshairs-gps" />
                <span>{{ lugar.lat.toFixed(4) }}, {{ lugar.lng.toFixed(4) }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- FAB — Add new place -->
    <button class="fab" @click="openAdd" title="Agregar lugar">
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

            <!-- Geocoder Search -->
            <div class="form-group">
              <label class="form-label">
                <Icon icon="mdi:magnify" />
                Buscar lugar o dirección
              </label>
              <div class="geo-search-wrap">
                <div class="geo-input-row">
                  <input
                    v-model="geoQuery"
                    type="text"
                    class="form-input"
                    placeholder="Ej: Puerto Madero, Jardín Japonés, Unicenter..."
                    @blur="closeGeoResults"
                    autocomplete="off"
                  />
                  <span v-if="geoLoading" class="geo-loader">
                    <Icon icon="mdi:loading" class="spin-icon-sm" />
                  </span>
                </div>
                <transition name="geo-drop">
                  <ul v-if="geoShowResults" class="geo-results">
                    <li
                      v-for="r in geoResults"
                      :key="r.place_id"
                      class="geo-result-item"
                      @mousedown.prevent="selectGeoResult(r)"
                    >
                      <Icon icon="mdi:map-marker-outline" class="geo-result-icon" />
                      <div class="geo-result-texts">
                        <span class="geo-result-name">{{ r.name || r.display_name.split(',')[0] }}</span>
                        <span class="geo-result-sub">{{ r.display_name }}</span>
                      </div>
                    </li>
                  </ul>
                </transition>
              </div>
              <p class="geo-hint">Busca y seleccioná un resultado para autocompletar coordenadas y nombre 📍</p>
            </div>

            <div class="form-group">
              <label class="form-label">Título de la salida / evento</label>
              <input
                v-model="formTitulo"
                type="text"
                class="form-input"
                placeholder="Ej: Primera cita, Paseo al atardecer, Cena de aniversario..."
                @keyup.enter="handleSave"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Nombre del lugar (subtítulo)</label>
              <input
                v-model="formLugar"
                type="text"
                class="form-input"
                placeholder="Ej: Puerto Madero, Jardín Japonés, Café San Telmo..."
                @keyup.enter="handleSave"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Latitud</label>
                <input v-model.number="formLat" type="number" step="any" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Longitud</label>
                <input v-model.number="formLng" type="number" step="any" class="form-input" />
              </div>
            </div>
            <!-- <p class="map-picker-tip">💡 O tocá cualquier punto en el mapa para capturar sus coordenadas.</p> -->

            <div class="form-group">
              <label class="form-label">Descripción o recuerdo (opcional)</label>
              <textarea
                v-model="formDesc"
                class="form-textarea"
                rows="2"
                placeholder="Ej: Tomamos un café y paseamos hasta el atardecer..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Fecha del paseo</label>
              <input v-model="formDatetime" type="date" class="form-input" />
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

          <div class="modal-actions">
            <div class="actions-right">
              <button class="btn-cancel" @click="closeModal" :disabled="saving">
                Cancelar
              </button>
              <button
                class="btn-save"
                @click="handleSave"
                :disabled="saving || (!formTitulo.trim() && !formLugar.trim()) || !formLat || !formLng"
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

    <!-- ── Lightbox Preview ───────────────────────────────────────────────── -->
    <transition name="modal-fade">
      <div v-if="previewImage" class="lightbox-backdrop" @click="closeImagePreview">
        <img :src="previewImage.url" :alt="previewImage.title" class="lightbox-img" />
      </div>
    </transition>

  </div>
</template>

<style>
/* Leaflet custom pin styling */
.custom-map-pin {
  background: none;
  border: none;
}
.pin-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: scale(1);
  transition: transform 0.25s ease;
}
.pin-wrapper.active {
  transform: scale(1.35);
  z-index: 1000;
}
.pin-head {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--theme-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid #ffffff;
}
.pin-wrapper.active .pin-head {
  background: var(--theme-secondary);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
}
.pin-point {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid var(--theme-primary);
  margin-top: -2px;
}
.pin-wrapper.active .pin-point {
  border-top-color: var(--theme-secondary);
}

.leaflet-control-attribution {
  display: none !important;
}
</style>

<style scoped>
.lugares-page {
  height: 100vh;
  overflow: hidden;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  font-family: 'Cause', system-ui, sans-serif;
}

.lugares-content {
  width: 100%;
  max-width: 1280px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
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

/* Layout Grid */
.lugares-layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1.5rem;
  align-items: stretch;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
@media (max-width: 900px) {
  .lugares-layout {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
}

/* Map Card */
.map-card {
  position: relative;
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.places-map {
  width: 100%;
  flex: 1;
  min-height: 0;
  z-index: 1;
}
.map-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem;
  font-size: 0.78rem;
  color: var(--theme-text-muted);
  background: rgba(0, 0, 0, 0.03);
  border-top: 1px solid var(--theme-card-border);
}

/* Places List */
.places-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  overflow-y: auto;
  padding-right: 4px;
  min-height: 0;
}

.place-card {
  background: var(--theme-card-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 6px;
  padding: 1rem 1.1rem;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.place-card:hover {
  border-color: var(--theme-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.place-card.active {
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 3px var(--theme-badge-bg);
}

.place-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
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
.place-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.place-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 1.12rem;
  font-weight: 700;
  color: var(--theme-text-main);
  margin: 0;
  line-height: 1.25;
}
.place-location-sub {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.place-icon {
  font-size: 1.05rem;
  color: var(--theme-primary);
  flex-shrink: 0;
}
.place-location-name {
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--theme-text-muted);
}

.place-desc {
  font-family: 'Lato', system-ui, sans-serif;
  font-size: 0.88rem;
  color: var(--theme-text-body);
  line-height: 1.45;
  margin: 0;
}

.place-photo-box {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--theme-card-border);
  max-height: 160px;
}
.place-photo {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.place-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--theme-text-muted);
  border-top: 1px solid var(--theme-card-border);
  padding-top: 0.5rem;
  margin-top: 0.2rem;
}
.place-date, .place-coords {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* FAB button */
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

/* Modal styles */
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
.modal-body {
  padding: 0.5rem 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  overflow-y: auto;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.form-label {
  font-family: 'Cause', system-ui, sans-serif;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--theme-text-muted);
  font-weight: 700;
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
.map-picker-tip {
  font-size: 0.75rem;
  color: var(--theme-text-muted);
  margin: -0.2rem 0 0.2rem;
}
.form-foto-preview {
  margin-top: 0.4rem;
  border-radius: 6px;
  overflow: hidden;
  border: 1.5px solid var(--theme-card-border);
  max-height: 140px;
}
.form-foto-preview img {
  width: 100%;
  height: 140px;
  object-fit: cover;
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
.btn-edit {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.05rem;
  color: var(--theme-text-muted);
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: 4px;
}
.btn-edit:hover { color: var(--theme-primary); }

/* Lightbox */
.lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: 400;
  background: rgba(15, 10, 5, 0.92);
  backdrop-filter: blur(8px);
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
}

/* Geocoder */
.geo-search-wrap {
  position: relative;
}
.geo-input-row {
  position: relative;
  display: flex;
  align-items: center;
}
.geo-input-row .form-input {
  padding-right: 2.2rem;
}
.geo-loader {
  position: absolute;
  right: 0.65rem;
  color: var(--theme-text-muted);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  pointer-events: none;
}
.geo-results {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 500;
  background: var(--theme-drawer-bg);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 8px;
  list-style: none;
  margin: 0;
  padding: 0.3rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  max-height: 220px;
  overflow-y: auto;
}
.geo-result-item {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.55rem 0.65rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.geo-result-item:hover {
  background: var(--theme-badge-bg);
}
.geo-result-icon {
  font-size: 1.1rem;
  color: var(--theme-primary);
  margin-top: 2px;
  flex-shrink: 0;
}
.geo-result-texts {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.geo-result-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--theme-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.geo-result-sub {
  font-size: 0.75rem;
  color: var(--theme-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.geo-hint {
  font-size: 0.74rem;
  color: var(--theme-text-muted);
  margin-top: 0.3rem;
  font-family: 'Lato', system-ui, sans-serif;
}

/* Geocoder dropdown animation */
.geo-drop-enter-active,
.geo-drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.geo-drop-enter-from,
.geo-drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
