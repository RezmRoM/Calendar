<template>
  <div class="flex items-center space-x-4">
    <!-- Navigation -->
    <div class="flex items-center space-x-2">
      <Button variant="outline" size="icon" @click="$emit('prev')">
        <ChevronLeftIcon class="w-4 h-4" />
      </Button>
      <Button variant="outline" @click="$emit('today')">
        {{ t('calendar.navigation.today') }}
      </Button>
      <Button variant="outline" size="icon" @click="$emit('next')">
        <ChevronRightIcon class="w-4 h-4" />
      </Button>
    </div>

    <!-- View Selector -->
    <div class="flex items-center space-x-1 bg-muted rounded-lg p-1">
      <Button
        v-for="view in views"
        :key="view"
        variant="ghost"
        size="sm"
        :class="{ 'bg-background shadow-sm': modelValue === view }"
        @click="$emit('update:modelValue', view)"
      >
        {{ t(`calendar.views.${view}`) }}
      </Button>
    </div>

    <!-- Current Date -->
    <div class="text-sm font-medium">
      {{ formatDate(currentDate) }}
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-unused-components */
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { Button } from '@/shared/ui/button'
/* eslint-enable vue/no-unused-components */
import { format } from 'date-fns'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue: 'day' | 'week' | 'month'
  currentDate: Date
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'day' | 'week' | 'month'): void
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'today'): void
}>()

const views = ['day', 'week', 'month'] as const

const formatDate = (date: Date) => {
  return format(date, 'MMMM yyyy')
}
</script>
