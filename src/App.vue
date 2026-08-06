<script setup>
import { computed } from 'vue'
import { useRelationshipStore } from './stores/relationship.js'
import LockScreen from './components/LockScreen.vue'
import MainLayout from './components/MainLayout.vue'

import { onMounted } from 'vue'
import { db } from './firebase'

onMounted(() => {
  console.log("Firebase conectado correctamente:", db)
})

const store = useRelationshipStore()
const isUnlocked = computed(() => store.isUnlocked)
</script>

<template>
  <transition name="page-transition" mode="out-in">
    <LockScreen  v-if="!isUnlocked" key="lock" />
    <MainLayout  v-else             key="main" />
  </transition>
</template>

<style>
.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.6s ease;
}
.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
}
</style>

