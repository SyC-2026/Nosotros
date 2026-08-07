import { ref } from 'vue'

export const isDebugMode = ref(false)
export const fakeDate = ref(null)

// Este ref nos asegura que si estamos en modo normal, los computed
// que llamen a getNow() también se refresquen (útil para cambios de día exactos).
const realNow = ref(new Date())
setInterval(() => {
  realNow.value = new Date()
}, 1000)

export function getNow() {
  if (isDebugMode.value && fakeDate.value) {
    // Retornamos un clon para que actúe como un new Date() puro.
    return new Date(fakeDate.value)
  }
  return realNow.value
}
