<template>
  <div class="min-h-full grid grid-cols-[auto_1fr] overflow-auto">
    <!-- Time labels -->
    <div class="w-20 pr-2 border-r sticky left-0 bg-background">
      <div
        v-for="hour in hours"
        :key="hour"
        class="h-20 flex items-start justify-end text-sm text-muted-foreground pt-2 pr-4"
      >
        {{ formatHour(hour) }}
      </div>
    </div>

    <!-- Events grid -->
    <div class="relative min-h-full">
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

      <!-- Events -->
      <div class="relative" style="height: 1200px;"> <!-- 24 часа * 50px -->
        <TransitionGroup name="event">
          <div
            v-for="event in dayEvents"
            :key="event.id"
            class="absolute left-1 right-1 rounded-md overflow-hidden cursor-pointer transition-all"
            :class="[
              event.completed ? 'opacity-50' : '',
              'bg-accent hover:bg-accent/90'
            ]"
            :style="getEventStyle(event)"
            draggable="true"
            @dragstart="handleDragStart($event, event)"
            @dragend="handleDragEnd"
            @click="$emit('selectEvent', event)"
          >
            <!-- Event Header -->
            <div class="px-3 py-1 text-sm font-medium">
              {{ event.title }}
            </div>
            
            <!-- Event Time -->
            <div class="px-3 pb-1 text-xs text-muted-foreground">
              {{ formatEventTime(event) }}
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Current time indicator -->
      <div
        v-if="isToday"
        class="absolute left-0 right-0 border-t-2 border-primary z-10"
        :style="{ top: `${currentTimePosition}px` }"
      >
        <div class="absolute -left-2 -top-1 w-2 h-2 rounded-full bg-primary" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format, isToday as isDateToday, differenceInMinutes, startOfDay, addHours } from 'date-fns'
import type { CalendarEvent } from '@/entities/event'

const props = defineProps<{
  date: Date
  events: CalendarEvent[]
}>()

const emit = defineEmits<{
  (e: 'selectEvent', event: CalendarEvent): void
  (e: 'updateEvent', event: CalendarEvent): void
}>()

const hours = Array.from({ length: 24 }, (_, i) => i)

const dayEvents = computed(() => {
  return props.events.filter(event => {
    const eventDate = new Date(event.startTime)
    return (
      eventDate.getFullYear() === props.date.getFullYear() &&
      eventDate.getMonth() === props.date.getMonth() &&
      eventDate.getDate() === props.date.getDate()
    )
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
})

const formatHour = (hour: number) => {
  return format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')
}

const formatEventTime = (event: CalendarEvent) => {
  return `${format(event.startTime, 'HH:mm')} - ${format(event.endTime, 'HH:mm')}`
}

const getEventStyle = (event: CalendarEvent) => {
  const dayStart = startOfDay(new Date(event.startTime))
  const startMinutes = differenceInMinutes(new Date(event.startTime), dayStart)
  const duration = differenceInMinutes(new Date(event.endTime), new Date(event.startTime))

  return {
    top: `${(startMinutes / 60) * 80}px`,
    height: `${Math.max((duration / 60) * 80, 30)}px`,
    backgroundColor: event.color || '#3b82f6'
  }
}

const currentTimePosition = computed(() => {
  const now = new Date()
  const dayStart = startOfDay(now)
  const minutes = differenceInMinutes(now, dayStart)
  return (minutes / 60) * 80
})

const isToday = computed(() => isDateToday(props.date))

// Drag and drop functionality
let draggedEvent: CalendarEvent | null = null

const handleDragStart = (e: DragEvent, event: CalendarEvent) => {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    draggedEvent = event
  }
}

const handleDragEnd = () => {
  draggedEvent = null
}

const handleDrop = (e: DragEvent, hour: number) => {
  if (!draggedEvent) return

  const rect = (e.target as HTMLElement).getBoundingClientRect()
  const offsetY = e.clientY - rect.top
  const minutes = Math.floor((offsetY / rect.height) * 60)
  
  const newStartTime = addHours(startOfDay(props.date), hour)
  newStartTime.setMinutes(minutes)
  
  const duration = differenceInMinutes(draggedEvent.endTime, draggedEvent.startTime)
  const newEndTime = new Date(newStartTime.getTime() + duration * 60 * 1000)

  emit('updateEvent', {
    ...draggedEvent,
    startTime: newStartTime,
    endTime: newEndTime,
  })
}
</script>

<script lang="ts">
export default {
  name: 'DayView'
}
</script>

<style scoped>
.event-enter-active,
.event-leave-active {
  transition: all 0.3s ease;
}

.event-enter-from,
.event-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.h-20 {
  height: 80px;
}
</style>
