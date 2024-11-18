import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  category?: string
  color: string
  isTask: boolean
  completed: boolean
  hashtags: string[]
}

export const useEventStore = defineStore('events', () => {
  // State
  const events = ref<CalendarEvent[]>([])
  const categories = ref<string[]>(['Work', 'Personal', 'Meeting', 'Other'])
  const filters = ref({
    search: '',
    categories: [] as string[],
    showCompleted: true,
    showTasks: true,
    showEvents: true,
    dateRange: null as { start: Date; end: Date } | null,
  })

  // Initialize from localStorage
  const initializeStore = () => {
    const savedEvents = localStorage.getItem('calendar-events')
    const savedCategories = localStorage.getItem('calendar-categories')

    if (savedEvents) {
      events.value = JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
      }))
    } else {
      // Add a welcome event if no events exist
      const now = new Date()
      const later = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour later

      events.value = [
        {
          id: crypto.randomUUID(),
          title: 'Welcome to Your Calendar!',
          description: 'This is a sample event to get you started.',
          startTime: now,
          endTime: later,
          category: 'Other',
          color: '#3b82f6',
          isTask: false,
          completed: false,
          hashtags: ['welcome', 'start'],
        },
      ]
    }

    if (savedCategories) {
      categories.value = JSON.parse(savedCategories)
    }
  }

  // Persist to localStorage
  watch(
    events,
    (newEvents) => {
      localStorage.setItem('calendar-events', JSON.stringify(newEvents))
    },
    { deep: true }
  )

  watch(
    categories,
    (newCategories) => {
      localStorage.setItem('calendar-categories', JSON.stringify(newCategories))
    },
    { deep: true }
  )

  // Actions
  const addEvent = (event: CalendarEvent) => {
    events.value.push(event)
  }

  const updateEvent = (id: string, updatedEvent: CalendarEvent) => {
    const index = events.value.findIndex(e => e.id === id)
    if (index !== -1) {
      events.value[index] = updatedEvent
    }
  }

  const deleteEvent = (id: string) => {
    events.value = events.value.filter(e => e.id !== id)
  }

  const addCategory = (category: string) => {
    if (!categories.value.includes(category)) {
      categories.value.push(category)
    }
  }

  const removeCategory = (category: string) => {
    categories.value = categories.value.filter(c => c !== category)
    // Update events with removed category
    events.value = events.value.map(event => {
      if (event.category === category) {
        return { ...event, category: undefined }
      }
      return event
    })
  }

  const toggleEventCompletion = (id: string) => {
    const event = events.value.find(e => e.id === id)
    if (event) {
      event.completed = !event.completed
    }
  }

  // Computed
  const filteredEvents = computed(() => {
    return events.value.filter(event => {
      // Search filter
      if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase()
        const matchesSearch =
          event.title.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.hashtags.some(tag => tag.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // Category filter
      if (
        filters.value.categories.length > 0 &&
        event.category &&
        !filters.value.categories.includes(event.category)
      ) {
        return false
      }

      // Task/Event filter
      if (event.isTask && !filters.value.showTasks) return false
      if (!event.isTask && !filters.value.showEvents) return false
      if (event.isTask && event.completed && !filters.value.showCompleted) return false

      // Date range filter
      if (filters.value.dateRange) {
        const { start, end } = filters.value.dateRange
        if (
          !isWithinInterval(new Date(event.startTime), {
            start: startOfDay(start),
            end: endOfDay(end),
          })
        ) {
          return false
        }
      }

      return true
    })
  })

  const getEventsForDate = (date: Date) => {
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    return filteredEvents.value.filter(event =>
      isWithinInterval(new Date(event.startTime), {
        start: dayStart,
        end: dayEnd,
      })
    )
  }

  const setFilters = (newFilters: Partial<typeof filters.value>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  // Initialize store
  initializeStore()

  return {
    // State
    events,
    categories,
    filters,
    // Computed
    filteredEvents,
    // Actions
    addEvent,
    updateEvent,
    deleteEvent,
    addCategory,
    removeCategory,
    getEventsForDate,
    setFilters,
    toggleEventCompletion,
  }
})
