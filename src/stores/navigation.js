import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  const currentPage = ref('home')
  const isDrawerOpen = ref(false)

  function navigate(page) {
    currentPage.value = page
    isDrawerOpen.value = false
  }

  function toggleDrawer() {
    isDrawerOpen.value = !isDrawerOpen.value
  }

  function closeDrawer() {
    isDrawerOpen.value = false
  }

  return { currentPage, isDrawerOpen, navigate, toggleDrawer, closeDrawer }
})
