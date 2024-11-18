<template>
  <div class="h-screen flex flex-col">
    <header class="border-b p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-semibold">Calendar</h1>
          <div class="flex space-x-2">
            <button
              v-for="view in views"
              :key="view"
              @click="currentView = view"
              :class="[
                'px-3 py-1 rounded-md',
                currentView === view
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              ]"
            >
              {{ view }}
            </button>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <button
            class="p-2 hover:bg-secondary rounded-md"
            @click="previousPeriod"
          >
            <ChevronLeftIcon class="w-5 h-5" />
          </button>
          <button
            class="p-2 hover:bg-secondary rounded-md"
            @click="today"
          >
            Today
          </button>
          <button
            class="p-2 hover:bg-secondary rounded-md"
            @click="nextPeriod"
          >
            <ChevronRightIcon class="w-5 h-5" />
          </button>
          <div class="text-lg font-medium">
            {{ formatDate(currentDate) }}
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-auto">
      <component
        :is="currentViewComponent"
        :date="currentDate"
        :events="events"
      />
    </main>

    <EventDialog
      v-model:open="showEventDialog"
      :event="selectedEvent"
      @save="handleEventSave"
      @delete="handleEventDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { useEventStore } from '@/entities/event'
import { DayView, WeekView } from '@/widgets/calendar'
import { EventDialog } from '@/features/event-dialog'
import type { CalendarEvent } from '@/entities/event'

const views = ['Day', 'Week'] as const
type View = typeof views[number]

const currentView = ref<View>('Week')
const currentDate = ref(new Date())
const showEventDialog = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)

const eventStore = useEventStore()
const events = computed(() => eventStore.events)

const currentViewComponent = computed(() => {
  switch (currentView.value) {
    case 'Day':
      return DayView
    case 'Week':
      return WeekView
    default:
      return WeekView
  }
})

const formatDate = (date: Date) => {
  return format(date, 'MMMM d, yyyy')
}

const previousPeriod = () => {
  // Implementation
}

const nextPeriod = () => {
  // Implementation
}

const today = () => {
  currentDate.value = new Date()
}

const handleEventSave = (event: CalendarEvent) => {
  if (event.id) {
    eventStore.updateEvent(event.id, event)
  } else {
    eventStore.addEvent(event)
  }
  showEventDialog.value = false
}

const handleEventDelete = (eventId: string) => {
  eventStore.deleteEvent(eventId)
  showEventDialog.value = false
}
</script>
