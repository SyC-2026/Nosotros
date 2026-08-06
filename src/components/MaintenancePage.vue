<script setup>
import { Icon } from '@iconify/vue'
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
      <div class="card-footer">
        <Icon icon="mdi:heart" class="footer-heart" />
        <span>Santi & Cami · {{ new Date().getFullYear() }}</span>
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

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 248, 240, 0.85) 0%,
    rgba(253, 235, 213, 0.80) 50%,
    rgba(255, 240, 228, 0.85) 100%
  );
}

/* ── Card ─────────────────────────────────────────────────────────────────── */
.maintenance-card {
  position: relative;
  z-index: 10;
  max-width: 420px;
  width: 100%;
  background: rgba(255, 252, 245, 0.88);
  backdrop-filter: blur(6px);
  border: 1.5px solid rgba(192, 148, 108, 0.35);
  border-radius: 4px;
  padding: 2.75rem 2.5rem;
  text-align: center;
  box-shadow:
    0 4px 28px rgba(160, 110, 60, 0.12),
    0 1px 4px rgba(160, 110, 60, 0.08),
    inset 0 0 0 8px rgba(192, 148, 108, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
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
  background: linear-gradient(90deg, transparent, #c0946c, transparent);
}
.orn-line.short { max-width: 50px; }
.orn-heart  { font-size: 0.85rem; color: #c0717e; }
.orn-flowers { font-size: 0.72rem; color: #b89070; letter-spacing: 4px; }

/* ── Icon wrapper ─────────────────────────────────────────────────────────── */
.icon-wrapper {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    rgba(192, 148, 108, 0.18),
    rgba(192, 113, 126, 0.12)
  );
  border: 1.5px solid rgba(192, 148, 108, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-glow {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  background: linear-gradient(135deg, #c0946c, #c0717e);
  opacity: 0.2;
  filter: blur(8px);
  animation: glow-pulse 3s ease-in-out infinite;
}
.maintenance-icon {
  font-size: 2rem;
  color: #a07850;
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
  background: rgba(192, 148, 108, 0.12);
  border: 1px solid rgba(192, 148, 108, 0.3);
  color: #a07850;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #c0946c;
  box-shadow: 0 0 6px #c0946c;
  animation: blink 2s ease-in-out infinite;
}

/* ── Typography ───────────────────────────────────────────────────────────── */
.card-title {
  font-family: 'Cause', 'Georgia', serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: #5c3d2e;
  letter-spacing: 0.02em;
  line-height: 1.15;
  margin: 0;
}
.card-subtitle {
  font-size: 0.9rem;
  color: #8a6550;
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
  color: #a07850;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}
.footer-heart {
  font-size: 0.75rem;
  color: #c0717e;
}

/* ── Keyframes ────────────────────────────────────────────────────────────── */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%       { transform: translateY(-5px) rotate(8deg); }
}
@keyframes glow-pulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50%       { opacity: 0.35; transform: scale(1.06); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .maintenance-card { padding: 2rem 1.5rem; }
  .card-title { font-size: 1.75rem; }
}
</style>
