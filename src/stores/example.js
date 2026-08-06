import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExampleStore = defineStore('example', () => {
  const message = ref('Pinia listo')
  
  return { message }
})
