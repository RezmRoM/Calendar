<template>
  <div class="h-screen flex flex-col">
    <!-- Calendar Header -->
    <header class="border-b p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-semibold">Calendar</h1>
          <div class="flex items-center space-x-2">
            <Button variant="outline" size="sm" @click="today">Today</Button>
            <Button variant="ghost" size="icon" @click="previousPeriod">
              <ChevronLeftIcon class="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" @click="nextPeriod">
              <ChevronRightIcon class="h-4 w-4" />
            </Button>
          </div>
          <div class="text-lg">{{ currentPeriodLabel }}</div>
        </div>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              :class="{ 'bg-primary text-primary-foreground': view === 'day' }"
              @click="view = 'day'"
            >
              Day
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              :class="{ 'bg-primary text-primary-foreground': view === 'week' }"
              @click="view = 'week'"
            >
              Week
            </Button>
          </div>
          <Button variant="default" size="sm" @click="openEventDialog()">
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>
    </header>

    <!-- Calendar Body -->
    <main class="flex-1 overflow-auto">
      <Transition name="fade" mode="out-in">
        <component 
          :is="currentView" 
          :date="currentDate" 
          :events="filteredEvents"
          @selectEvent="openEventDialog"
          @updateEvent="handleEventUpdate"
        />
      </Transition>
    </main>

    <!-- Event Dialog -->
    <EventDialog
      v-model:open="showEventDialog"
      :event="selectedEvent"
      @update="handleEventUpdate"
      @delete="handleEventDelete"
    />

    <!-- Search and Filter Dialog -->
    <Dialog v-model:open="showFilterDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search & Filter Events</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="space-y-2">
            <Label>Search</Label>
            <Input v-model="searchQuery" placeholder="Search events..." />
          </div>
          <div class="space-y-2">
            <Label>Status</Label>
            <Select v-model="filterStatus">
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Categories</Label>
            <MultiSelect
              v-model="selectedCategories"
              :options="categories"
              placeholder="Select categories"
            />
          </div>
          <div class="space-y-2">
            <Label>Hashtags</Label>
            <MultiSelect
              v-model="selectedHashtags"
              :options="hashtags"
              placeholder="Select hashtags"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue'
import { format, addDays, addWeeks, startOfDay } from 'date-fns'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'
import { MultiSelect } from '@/shared/ui/multi-select'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/vue/24/solid'
import DayView from './DayView.vue'
import WeekView from './WeekView.vue'
import EventDialog from '@/features/event-dialog/ui/EventDialog.vue'
import type { CalendarEvent } from '@/entities/event'

// View state
const view = ref<'day' | 'week'>('week')
const currentDate = ref(new Date())
const currentView = computed(() => view.value === 'day' ? DayView : WeekView)

// Event state
const events = ref<CalendarEvent[]>([])
const showEventDialog = ref(false)
const selectedEvent = shallowRef<CalendarEvent | null>(null)

// Filter state
const showFilterDialog = ref(false)
const searchQuery = ref('')
const filterStatus = ref('all')
const selectedCategories = ref<string[]>([])
const selectedHashtags = ref<string[]>([])

// Available options
const categories = ['Work', 'Personal', 'Family', 'Health', 'Social']
const hashtags = ['#important', '#urgent', '#followup', '#meeting', '#deadline']

// Computed
const currentPeriodLabel = computed(() => {
  if (view.value === 'day') {
    return format(currentDate.value, 'MMMM d, yyyy')
  } else {
    const weekEnd = addDays(currentDate.value, 6)
    return `${format(currentDate.value, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
  }
})

const filteredEvents = computed(() => {
  return events.value.filter((event: CalendarEvent) => {
    // Search filter
    if (searchQuery.value && !event.title.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false
    }

    // Hashtag filter
    if (selectedHashtags.value.length && !event.hashtags?.some((tag: string) => selectedHashtags.value.includes(tag))) {
      return false
    }

    return true
  })
})

// Navigation methods
const today = () => {
  currentDate.value = new Date()
}

const previousPeriod = () => {
  if (view.value === 'day') {
    currentDate.value = addDays(currentDate.value, -1)
  } else {
    currentDate.value = addWeeks(currentDate.value, -1)
  }
}

const nextPeriod = () => {
  if (view.value === 'day') {
    currentDate.value = addDays(currentDate.value, 1)
  } else {
    currentDate.value = addWeeks(currentDate.value, 1)
  }
}

// Event methods
const openEventDialog = (event?: CalendarEvent) => {
  selectedEvent.value = event || null
  showEventDialog.value = true
}

const handleEventSave = (event: CalendarEvent) => {
  const index = events.value.findIndex((e: CalendarEvent) => e.id === event.id)
  if (index !== -1) {
    events.value[index] = event
  } else {
    events.value.push(event)
  }
  showEventDialog.value = false
}

const handleEventDelete = (eventId: string) => {
  events.value = events.value.filter(event => event.id !== eventId)
  showEventDialog.value = false
}

const handleEventUpdate = (event: CalendarEvent) => {
  const index = events.value.findIndex(e => e.id === event.id)
  if (index !== -1) {
    events.value[index] = event
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
