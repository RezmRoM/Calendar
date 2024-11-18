<template>
  <div class="h-full flex flex-col">
    <!-- Day headers -->
    <div class="grid grid-cols-7 border-b">
      <div
        v-for="day in weekDays"
        :key="day.date.toISOString()"
        class="h-12 border-r flex flex-col items-center justify-center"
        :class="[isToday(day.date) && 'bg-primary/5']"
      >
        <div class="text-sm font-medium">{{ formatWeekday(day.date) }}</div>
        <div
          class="text-sm"
          :class="[
            isToday(day.date)
              ? 'bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center'
              : 'text-muted-foreground'
          ]"
        >
          {{ formatDate(day.date) }}
        </div>
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="flex-1 grid grid-cols-[auto_1fr] overflow-hidden">
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

      <!-- Week grid -->
      <div class="grid grid-cols-7">
        <div
          v-for="day in weekDays"
          :key="day.date.toISOString()"
          class="relative border-r"
        >
          <!-- Time grid -->
          <div class="absolute inset-0">
            <div
              v-for="hour in hours"
              :key="hour"
              class="h-20 border-b border-border/50"
              @dragover.prevent
              @drop="handleDrop($event, day.date, hour)"
            />
          </div>

          <!-- Current time indicator -->
          <div
            v-if="isToday(day.date)"
            class="absolute left-0 right-0 border-t-2 border-primary z-10"
            :style="{ top: `${currentTimePosition}px` }"
          >
            <div
              class="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-primary"
            />
          </div>

          <!-- Events -->
          <div class="relative h-full">
            <TransitionGroup name="event">
              <div
                v-for="event in getDayEvents(day.date)"
                :key="event.id"
                class="absolute left-1 right-1 rounded-md p-2 text-sm overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-shadow"
                :class="[
                  event.completed ? 'opacity-50' : '',
                  event.color ? `bg-${event.color}-100` : 'bg-primary/10'
                ]"
                :style="getEventStyle(event)"
                draggable="true"
                @dragstart="handleDragStart($event, event)"
                @dragend="handleDragEnd"
                @click="$emit('selectEvent', event)"
              >
                <div class="font-medium">{{ event.title }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ formatEventTime(event) }}
                </div>
                <div v-if="event.isTask" class="absolute right-2 top-2">
                  <CheckCircleIcon
                    :class="[
                      'w-4 h-4',
                      event.completed ? 'text-green-500' : 'text-muted-foreground'
                    ]"
                  />
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  format,
  isToday as isDateToday,
  differenceInMinutes,
  startOfDay,
  startOfWeek,
  addDays,
  addHours,
  isSameDay,
} from 'date-fns'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import type { CalendarEvent } from '@/entities/event'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  date: Date
  events?: CalendarEvent[]
}>()

const emit = defineEmits<{
  (e: 'selectEvent', event: CalendarEvent): void
  (e: 'updateEvent', event: CalendarEvent): void
}>()

const hours = Array.from({ length: 24 }, (_, i) => i)

const weekDays = computed(() => {
  const start = startOfWeek(props.date, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => ({
    date: addDays(start, i),
  }))
})

const { t } = useI18n()

const formatWeekday = (date: Date) => {
  const day = format(date, 'eee').toLowerCase()
  return t(`calendar.weekDays.short.${day}`)
}

const formatDate = (date: Date) => format(date, 'd')

const getDayEvents = (date: Date) => {
  if (!props.events) return []
  return props.events.filter(event => isSameDay(new Date(event.startTime), date))
}

const formatHour = (hour: number) => {
  return format(new Date().setHours(hour, 0, 0, 0), 'ha')
}

const formatEventTime = (event: CalendarEvent) => {
  return `${format(event.startTime, 'h:mm a')} - ${format(
    event.endTime,
    'h:mm a'
  )}`
}

const getEventStyle = (event: CalendarEvent) => {
  const dayStart = startOfDay(event.startTime)
  const startMinutes = differenceInMinutes(event.startTime, dayStart)
  const duration = differenceInMinutes(event.endTime, event.startTime)

  return {
    top: `${(startMinutes / 60) * 5}rem`,
    height: `${(duration / 60) * 5}rem`,
  }
}

const currentTimePosition = computed(() => {
  const now = new Date()
  const dayStart = startOfDay(now)
  const minutes = differenceInMinutes(now, dayStart)
  return (minutes / 60) * 5 * 16 // 5rem * 16px
})

const isToday = (date: Date) => isDateToday(date)

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

const handleDrop = (e: DragEvent, date: Date, hour: number) => {
  if (!draggedEvent) return

  const rect = (e.target as HTMLElement).getBoundingClientRect()
  const offsetY = e.clientY - rect.top
  const minutes = Math.floor((offsetY / rect.height) * 60)
  
  const newStartTime = addHours(startOfDay(date), hour)
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
  name: 'WeekView'
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
</style>
