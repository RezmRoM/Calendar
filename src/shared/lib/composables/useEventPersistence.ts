import { onMounted } from 'vue'
import { useEventStore } from '@/entities/event/model/store'
import type { CalendarEvent } from '@/entities/event'

const STORAGE_KEY = 'calendar_events'

export function useEventPersistence() {
  const eventStore = useEventStore()

  const saveEvents = () => {
    const events = eventStore.events
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  }

  const loadEvents = () => {
    const storedEvents = localStorage.getItem(STORAGE_KEY)
    if (storedEvents) {
      try {
        const events = JSON.parse(storedEvents) as CalendarEvent[]
        // Convert stored date strings back to Date objects
        events.forEach(event => {
          event.startTime = new Date(event.startTime)
          event.endTime = new Date(event.endTime)
        })
        // Replace all events in the store
        eventStore.events = events
      } catch (error) {
        console.error('Error loading events from storage:', error)
        // Clear potentially corrupted data
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }

  // Watch for changes and save
  const setupEventWatcher = () => {
    // Use MutationObserver to watch for changes in the events array
    const observer = new MutationObserver(() => {
      saveEvents()
    })

    // Watch for changes in the events array
    observer.observe(eventStore.events, {
      subtree: true,
      childList: true,
    })

    return () => observer.disconnect()
  }

  onMounted(() => {
    loadEvents()
    setupEventWatcher()
  })

  return {
    saveEvents,
    loadEvents
  }
}
