<template>
  <div class="flex items-center space-x-4 p-4 border-b">
    <!-- Search -->
    <div class="flex-1 max-w-sm">
      <Input
        v-model="searchQuery"
        placeholder="Search events..."
        type="search"
        class="w-full"
      >
        <template #prefix>
          <MagnifyingGlassIcon class="w-4 h-4 text-muted-foreground" />
        </template>
      </Input>
    </div>

    <!-- Category Filter -->
    <Select
      v-model="selectedCategory"
      class="w-[150px]"
    >
      <option value="">{{ t('filters.categories.all') }}</option>
      <option
        v-for="category in availableCategories"
        :key="category"
        :value="category"
      >
        {{ t(`filters.categories.${category.toLowerCase()}`) }}
      </option>
    </Select>

    <!-- Task Filter -->
    <Select
      v-model="taskFilter"
      class="w-[150px]"
    >
      <option value="">{{ t('filters.events.all') }}</option>
      <option value="tasks">{{ t('filters.events.tasks') }}</option>
      <option value="meetings">{{ t('filters.events.meetings') }}</option>
      <option value="reminders">{{ t('filters.events.reminders') }}</option>
    </Select>

    <!-- Completion Filter -->
    <Select
      v-model="completionFilter"
      class="w-[150px]"
    >
      <option value="">{{ t('filters.status.all') }}</option>
      <option value="completed">{{ t('filters.status.completed') }}</option>
      <option value="pending">{{ t('filters.status.pending') }}</option>
      <option value="cancelled">{{ t('filters.status.cancelled') }}</option>
    </Select>

    <!-- Color Filter -->
    <Select
      v-model="selectedColor"
      class="w-[150px]"
    >
      <option value="">{{ t('filters.colors.all') }}</option>
      <option
        v-for="color in availableColors"
        :key="color"
        :value="color"
      >
        {{ t(`filters.colors.${color}`) }}
      </option>
    </Select>

    <!-- Clear Filters -->
    <Button
      variant="ghost"
      size="sm"
      @click="clearFilters"
      :disabled="!hasActiveFilters"
    >
      <XMarkIcon class="w-4 h-4 mr-2" />
      {{ t('filters.clearAll') }}
    </Button>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-unused-components */
import { ref, computed, watch } from 'vue'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'
/* eslint-enable vue/no-unused-components */
import { useEventFiltering } from '@/shared/lib/composables/useEventFiltering'
import type { EventColor } from '@/entities/event'
import { useI18n } from 'vue-i18n'

const {
  setFilter,
  clearFilters: clearAllFilters,
  setSearchQuery,
  availableCategories,
  availableColors
} = useEventFiltering()

const { t } = useI18n()

// Search
const searchQuery = ref('')
watch(searchQuery, (query: string) => {
  setSearchQuery(query)
})

// Category filter
const selectedCategory = ref('')
watch(selectedCategory, (category: string) => {
  setFilter('categories', category ? [category] : undefined)
})

// Task filter
const taskFilter = ref('')
watch(taskFilter, (filter: string) => {
  if (filter === 'task') {
    setFilter('isTask', true)
  } else if (filter === 'event') {
    setFilter('isTask', false)
  } else {
    setFilter('isTask', undefined)
  }
})

// Completion filter
const completionFilter = ref('')
watch(completionFilter, (filter: string) => {
  if (filter === 'completed') {
    setFilter('completed', true)
  } else if (filter === 'pending') {
    setFilter('completed', false)
  } else {
    setFilter('completed', undefined)
  }
})

// Color filter
const selectedColor = ref<EventColor | ''>('')
watch(selectedColor, (color: EventColor | '') => {
  setFilter('color', color || undefined)
})

// Active filters indicator
const hasActiveFilters = computed(() => {
  return Boolean(
    searchQuery.value ||
    selectedCategory.value ||
    taskFilter.value ||
    completionFilter.value ||
    selectedColor.value
  )
})

// Clear all filters
const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  taskFilter.value = ''
  completionFilter.value = ''
  selectedColor.value = ''
  clearAllFilters()
}
</script>
