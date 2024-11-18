<template>
  <div
    class="group relative rounded-md p-2 text-sm overflow-hidden cursor-pointer transition-all"
    :class="[
      props.event.completed ? 'opacity-50' : '',
      props.event.color ? `bg-${props.event.color}-100 hover:bg-${props.event.color}-200` : 'bg-primary/10 hover:bg-primary/20',
      isDragging ? 'ring-2 ring-primary shadow-lg' : 'hover:ring-2 ring-primary',
      dragOver ? 'border-2 border-dashed border-primary' : ''
    ]"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover.prevent
    @click="$emit('click', props.event)"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <!-- Event Title -->
    <div class="font-medium truncate">{{ props.event.title }}</div>

    <!-- Event Time -->
    <div class="text-xs text-muted-foreground">
      {{ formatEventTime(props.event.startTime, props.event.endTime) }}
    </div>

    <!-- Categories and Hashtags -->
    <div class="mt-1 flex flex-wrap gap-1">
      <span
        v-for="category in props.event.categories"
        :key="category"
        class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-background/50"
      >
        {{ category }}
      </span>
      <span
        v-for="hashtag in props.event.hashtags"
        :key="hashtag"
        class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-background/50 text-muted-foreground"
      >
        #{{ hashtag }}
      </span>
    </div>

    <!-- Task Status -->
    <div
      v-if="props.event.isTask"
      class="absolute right-2 top-2 transition-opacity"
      :class="props.event.completed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
    >
      <CheckCircleIcon
        class="w-4 h-4"
        :class="props.event.completed ? 'text-green-500' : 'text-muted-foreground'"
        @click.stop="toggleComplete"
      />
    </div>

    <!-- Tooltip -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div
        v-if="showTooltip"
        class="absolute z-50 w-64 px-3 py-2 text-sm bg-popover text-popover-foreground rounded-md shadow-md -translate-x-1/2 left-1/2"
        :style="{ top: tooltipPosition }"
      >
        <h4 class="font-semibold">{{ props.event.title }}</h4>
        <p v-if="props.event.description" class="mt-1 text-xs text-muted-foreground">
          {{ props.event.description }}
        </p>
        <div class="mt-2 flex flex-wrap gap-1">
          <span
            v-for="category in props.event.categories"
            :key="category"
            class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-background"
          >
            {{ category }}
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import type { CalendarEvent } from '../model/types'
import { useEventStore } from '../model/store'

const props = defineProps<{
  event: CalendarEvent
}>()

const emit = defineEmits<{
  (e: 'click', event: CalendarEvent): void
  (e: 'dragstart', event: DragEvent, calendarEvent: CalendarEvent): void
  (e: 'dragend', event: DragEvent): void
  (e: 'dragenter', event: DragEvent, calendarEvent: CalendarEvent): void
  (e: 'dragleave', event: DragEvent): void
}>()

const eventStore = useEventStore()

// Drag state
const isDragging = ref(false)
const dragOver = ref(false)

// Tooltip state
const showTooltip = ref(false)
const tooltipPosition = computed(() => {
  // Position above the event if in the bottom half of the calendar
  const rect = document.body.getBoundingClientRect()
  const middle = rect.height / 2
  const eventRect = document.elementFromPoint(rect.x, middle)?.getBoundingClientRect()
  
  if (eventRect && eventRect.top > middle) {
    return 'auto'
  }
  return '100%'
})

// Event handlers
const handleDragStart = (event: DragEvent) => {
  isDragging.value = true
  emit('dragstart', event, props.event)
}

const handleDragEnd = (event: DragEvent) => {
  isDragging.value = false
  emit('dragend', event)
}

const handleDragEnter = (event: DragEvent) => {
  dragOver.value = true
  emit('dragenter', event, props.event)
}

const handleDragLeave = (event: DragEvent) => {
  dragOver.value = false
  emit('dragleave', event)
}

const toggleComplete = () => {
  if (props.event.isTask) {
    eventStore.toggleEventCompletion(props.event.id)
  }
}

// Formatting
const formatEventTime = (start: Date, end: Date) => {
  return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
}
</script>
