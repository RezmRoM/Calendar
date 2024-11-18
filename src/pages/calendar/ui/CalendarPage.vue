<template>
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <header class="border-b p-4">
      <div class="container flex items-center justify-between">
        <!-- Logo and Navigation -->
        <div class="flex items-center space-x-8">
          <h1 class="text-xl font-bold">{{ t('calendar.title') }}</h1>
          <ViewSelector
            v-model="currentView"
            :current-date="currentDate"
            @prev="navigatePrev"
            @next="navigateNext"
            @today="navigateToday"
          />
        </div>

        <!-- Search, Language, and User -->
        <div class="flex items-center space-x-4">
          <Input
            type="search"
            :placeholder="t('search.placeholder')"
            class="w-64"
          >
            <template #prefix>
              <MagnifyingGlassIcon class="w-4 h-4 text-muted-foreground" />
            </template>
          </Input>
          <LanguageSwitcher />
          <Button variant="outline" size="icon">
            <BellIcon class="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Cog6ToothIcon class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden">
      <div class="h-full flex">
        <!-- Calendar Views -->
        <div class="flex-1 overflow-auto">
          <FilterBar class="sticky top-0 z-10" />
          
          <component
            :is="currentViewComponent"
            :date="currentDate"
            :current-month="currentDate"
            :events="filteredEvents"
            @select-event="openEventDialog"
            @new-event="openNewEventDialog"
          />
        </div>

        <!-- Event Management Panel -->
        <EventManagementPanel
          @new-event="openNewEventDialog"
          @select-event="openEventDialog"
        />
      </div>
    </main>

    <!-- Event Dialog -->
    <EventDialog
      v-model:open="showEventDialog"
      :event="selectedEvent"
      @update="handleEventUpdate"
      @delete="handleEventDelete"
    />
  </div>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-unused-components */
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  MagnifyingGlassIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { ViewSelector } from '@/widgets/calendar/ui'
import { FilterBar } from '@/features/event-filter/ui'
import { EventDialog } from '@/features/event-dialog/ui'
import { EventManagementPanel } from '@/features/event-management/ui'
import { LanguageSwitcher } from '@/features/language-switcher/ui'
import { DayView, WeekView, MonthView } from '@/widgets/calendar/ui'
import { useEventStore } from '@/entities/event'
import type { CalendarEvent } from '@/entities/event'
/* eslint-enable vue/no-unused-components */

const { t } = useI18n()

// Store
const eventStore = useEventStore()

// View state
const currentView = ref<'day' | 'week' | 'month'>('week')
const currentDate = ref(new Date())

const currentViewComponent = computed(() => {
  switch (currentView.value) {
    case 'day':
      return DayView
    case 'week':
      return WeekView
    case 'month':
      return MonthView
    default:
      return WeekView
  }
})

// Navigation
const navigatePrev = () => {
  const date = new Date(currentDate.value)
  switch (currentView.value) {
    case 'day':
      date.setDate(date.getDate() - 1)
      break
    case 'week':
      date.setDate(date.getDate() - 7)
      break
    case 'month':
      date.setMonth(date.getMonth() - 1)
      break
  }
  currentDate.value = date
}

const navigateNext = () => {
  const date = new Date(currentDate.value)
  switch (currentView.value) {
    case 'day':
      date.setDate(date.getDate() + 1)
      break
    case 'week':
      date.setDate(date.getDate() + 7)
      break
    case 'month':
      date.setMonth(date.getMonth() + 1)
      break
  }
  currentDate.value = date
}

const navigateToday = () => {
  currentDate.value = new Date()
}

// Events
const events = computed(() => eventStore.events)
const filteredEvents = computed(() => eventStore.filteredEvents)

// Event Dialog
const showEventDialog = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)

const openEventDialog = (event: CalendarEvent) => {
  selectedEvent.value = event
  showEventDialog.value = true
}

const openNewEventDialog = () => {
  selectedEvent.value = null
  showEventDialog.value = true
}

const handleEventUpdate = (event: CalendarEvent) => {
  if (event.id && events.value.some(e => e.id === event.id)) {
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
