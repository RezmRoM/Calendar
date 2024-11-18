import { ref } from 'vue'
import type { CalendarEvent } from '@/entities/event'
import { useEventStore } from '@/entities/event/model/store'

export function useEventDragAndDrop() {
  const eventStore = useEventStore()
  const draggedEvent = ref<CalendarEvent | null>(null)
  const dragOverEvent = ref<CalendarEvent | null>(null)

  const handleDragStart = (event: DragEvent, calendarEvent: CalendarEvent) => {
    if (!event.dataTransfer) return

    draggedEvent.value = calendarEvent
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', calendarEvent.id)

    // Add dragging class for styling
    const element = event.target as HTMLElement
    element.classList.add('dragging')
  }

  const handleDragEnd = (event: DragEvent) => {
    draggedEvent.value = null
    dragOverEvent.value = null

    // Remove dragging class
    const element = event.target as HTMLElement
    element.classList.remove('dragging')
  }

  const handleDragOver = (event: DragEvent, calendarEvent?: CalendarEvent) => {
    event.preventDefault()
    dragOverEvent.value = calendarEvent || null
  }

  const handleDrop = (event: DragEvent, dropDate: Date, hour: number) => {
    event.preventDefault()
    if (!draggedEvent.value) return

    // Calculate new start time
    const dropTime = new Date(dropDate)
    dropTime.setHours(hour)
    
    if (dragOverEvent.value && dragOverEvent.value.id !== draggedEvent.value.id) {
      // Swap events if dropping onto another event
      eventStore.swapEvents(draggedEvent.value.id, dragOverEvent.value.id)
    } else {
      // Move event to new time
      eventStore.moveEvent(draggedEvent.value.id, dropTime)
    }

    draggedEvent.value = null
    dragOverEvent.value = null
  }

  return {
    draggedEvent,
    dragOverEvent,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  }
}
