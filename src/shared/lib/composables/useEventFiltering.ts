import { ref, computed } from 'vue'
import type { CalendarEvent, EventColor } from '@/entities/event'
import { useEventStore } from '@/entities/event/model/store'

export interface EventFilters {
  completed?: boolean
  categories?: string[]
  hashtags?: string[]
  dateRange?: { start: Date; end: Date }
  isTask?: boolean
  color?: EventColor
  searchQuery?: string
}

export function useEventFiltering() {
  const eventStore = useEventStore()
  const filters = ref<EventFilters>({})
  const searchQuery = ref('')

  const filteredEvents = computed(() => {
    let events = eventStore.events

    // Apply search query
    if (searchQuery.value) {
      events = eventStore.searchEvents(searchQuery.value)
    }

    // Apply filters
    if (Object.keys(filters.value).length) {
      events = eventStore.filterEvents(filters.value)
    }

    return events
  })

  const setFilter = (key: keyof EventFilters, value: any) => {
    filters.value = { ...filters.value, [key]: value }
  }

  const removeFilter = (key: keyof EventFilters) => {
    const { [key]: _, ...rest } = filters.value
    filters.value = rest
  }

  const clearFilters = () => {
    filters.value = {}
    searchQuery.value = ''
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  // Computed properties for available filter options
  const availableCategories = computed(() => eventStore.allCategories)
  const availableHashtags = computed(() => eventStore.allHashtags)
  const availableColors = computed(() => {
    const colors = new Set<EventColor>()
    eventStore.events.forEach(event => {
      if (event.color) colors.add(event.color)
    })
    return Array.from(colors)
  })

  return {
    // State
    filters,
    searchQuery,
    filteredEvents,

    // Actions
    setFilter,
    removeFilter,
    clearFilters,
    setSearchQuery,

    // Available options
    availableCategories,
    availableHashtags,
    availableColors
  }
}
