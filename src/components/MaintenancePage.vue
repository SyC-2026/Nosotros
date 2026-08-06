<script setup>
import { Icon } from '@iconify/vue'
import { useRelationshipStore } from '../stores/relationship.js'

const rel = useRelationshipStore()
</script>

<template>
  <div class="maintenance-page">

    <div class="maintenance-card">

      <!-- Top ornament -->
      <div class="card-ornament">
        <span class="orn-line"></span>
        <span class="orn-heart">♥</span>
        <span class="orn-line"></span>
      </div>

      <!-- Icon -->
      <div class="icon-wrapper">
        <div class="icon-glow"></div>
        <Icon icon="mdi:hammer-wrench" class="maintenance-icon" />
      </div>

      <!-- Status badge -->
      <div class="status-badge">
        <span class="status-dot"></span>
        Actualizando el sitio
      </div>

      <!-- Heading -->
      <h1 class="card-title">Volvemos pronto</h1>

      <p class="card-subtitle">
        Estamos trabajando en mejoras para hacer nuestro espacio aún más especial.
        ¡Gracias por la paciencia!
      </p>

      <!-- Bottom ornament -->
      <div class="card-ornament">
        <span class="orn-line short"></span>
        <span class="orn-flowers">✿ ✾ ✿</span>
        <span class="orn-line short"></span>
      </div>

      <!-- Footer -->
      <div
        class="card-footer"
        @click="rel.setTheme(rel.currentTheme === 'santi' ? 'cami' : 'santi')"
        title="Haz clic para cambiar de estilo (Cami / Santi)"
      >
        <Icon icon="mdi:heart" class="footer-heart" />
        <span>{{ rel.coupleNames }} · {{ new Date().getFullYear() }}</span>
        <Icon icon="mdi:heart" class="footer-heart" />
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────────────────── */
.maintenance-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
  font-family: 'Lato', system-ui, sans-serif;
}

/* ── Card ─────────────────────────────────────────────────────────────────── */
.maintenance-card {
  position: relative;
  z-index: 10;
  max-width: 420px;
  width: 100%;
  background: var(--theme-card-bg);
  backdrop-filter: blur(6px);
  border: 1.5px solid var(--theme-card-border);
  border-radius: 4px;
  padding: 2.75rem 2.5rem;
  text-align: center;
  box-shadow: 0 4px 28px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
  transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
}

/* ── Ornaments ────────────────────────────────────────────────────────────── */
.card-ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
}
.orn-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--theme-secondary), transparent);
}
.orn-line.short { max-width: 50px; }
.orn-heart  { font-size: 0.85rem; color: var(--theme-primary); }
.orn-flowers { font-size: 0.72rem; color: var(--theme-secondary); letter-spacing: 4px; }

/* ── Icon wrapper ─────────────────────────────────────────────────────────── */
.icon-wrapper {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: var(--theme-badge-bg);
  border: 1.5px solid var(--theme-badge-border);
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-glow {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  background: var(--theme-btn-gradient);
  opacity: 0.25;
  filter: blur(8px);
  animation: glow-pulse 3s ease-in-out infinite;
}
.maintenance-icon {
  font-size: 2rem;
  color: var(--theme-primary);
  position: relative;
  z-index: 2;
  animation: float 4s ease-in-out infinite;
}

/* ── Status badge ─────────────────────────────────────────────────────────── */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px;
  border-radius: 9999px;
  background: var(--theme-badge-bg);
  border: 1px solid var(--theme-badge-border);
  color: var(--theme-text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--theme-primary);
  box-shadow: 0 0 6px var(--theme-primary);
  animation: blink 2s ease-in-out infinite;
}

/* ── Typography ───────────────────────────────────────────────────────────── */
.card-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--theme-text-main);
  letter-spacing: 0.02em;
  line-height: 1.15;
  margin: 0;
}
.card-subtitle {
  font-size: 0.9rem;
  color: var(--theme-text-body);
  line-height: 1.65;
  max-width: 320px;
  margin: 0 auto;
}

/* ── Footer ───────────────────────────────────────────────────────────────── */
.card-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: var(--theme-text-muted);
  letter-spacing: 0.05em;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}
.card-footer:hover {
  color: var(--theme-primary);
}
.footer-heart {
  font-size: 0.75rem;
  color: var(--theme-primary);
}

/* ── Animations ───────────────────────────────────────────────────────────── */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes glow-pulse {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(1.05); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
