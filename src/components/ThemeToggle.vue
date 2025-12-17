<template>
  <v-btn
    :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
    @click="toggleTheme"
    variant="text"
  />
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'

const theme = useTheme()

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  // Persist theme preference
  localStorage.setItem('theme', theme.global.name.value)
}
</script>
