<template>
  <div class="h-full grid grid-cols-[auto_1fr] overflow-hidden">
    <!-- Time labels -->
    <div class="w-20 pr-2 border-r">
      <div
        v-for="hour in hours"
        :key="hour"
        class="h-20 flex items-start justify-end text-sm text-muted-foreground"
      >
        {{ formatHour(hour) }}
      </div>
    </div>

    <!-- Grid content -->
    <div class="relative">
      <!-- Time grid -->
      <div class="absolute inset-0">
        <div
          v-for="hour in hours"
          :key="hour"
          class="h-20 border-b border-border/50"
          @dragover.prevent
          @drop="handleDrop($event, hour)"
        />
      </div>

      <!-- Current time indicator -->
      <div
        v-if="isToday"
        class="absolute left-0 right-0 border-t-2 border-primary z-10"
        :style="{ top: `${currentTimePosition}px` }"
      >
        <div
          class="absolute -left-2 -top-1 w-2 h-2 rounded-full bg-primary"
        />
      </div>

      <!-- Slot for day content -->
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format, isToday as isDateToday } from 'date-fns'
import { useCurrentTime } from '@/shared/lib/composables/useCurrentTime'

const props = defineProps<{
  date: Date
}>()

const emit = defineEmits<{
  (e: 'drop', event: DragEvent, hour: number): void
}>()

// Time grid setup
const hours = Array.from({ length: 24 }, (_, i) => i)

const formatHour = (hour: number) => {
  return format(new Date().setHours(hour, 0, 0, 0), 'ha')
}

// Current time indicator
const { currentTimePosition } = useCurrentTime()
const isToday = computed(() => isDateToday(props.date))

// Drop handling
const handleDrop = (event: DragEvent, hour: number) => {
  emit('drop', event, hour)
}
</script>

<style scoped>
.grid-content {
  display: grid;
  grid-template-rows: repeat(24, 5rem);
}
</style>
