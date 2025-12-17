<template>
  <v-menu :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-view-column"
        variant="text"
        size="small"
      >
        <v-icon>mdi-view-column</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Select Columns
        </v-tooltip>
      </v-btn>
    </template>

    <v-card min-width="250">
      <v-card-title class="text-subtitle-1">
        Show Columns
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-2">
        <v-list density="compact">
          <v-list-item
            v-for="header in headers"
            :key="header.key"
            class="px-2"
          >
            <v-checkbox
              v-model="visibleColumns"
              :value="header.key"
              :label="header.title"
              hide-details
              density="compact"
            />
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn
          size="small"
          variant="text"
          @click="selectAll"
        >
          Select All
        </v-btn>
        <v-spacer />
        <v-btn
          size="small"
          variant="text"
          @click="deselectAll"
        >
          Clear All
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Header {
  key: string
  title: string
}

const props = defineProps<{
  headers: Header[]
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const visibleColumns = ref<string[]>([...props.modelValue])

watch(visibleColumns, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

function selectAll() {
  visibleColumns.value = props.headers.map(h => h.key)
}

function deselectAll() {
  visibleColumns.value = []
}
</script>
