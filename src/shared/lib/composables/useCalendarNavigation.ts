import { ref, computed } from 'vue'
import {
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  isSameDay,
} from 'date-fns'

export type CalendarView = 'day' | 'week' | 'month'

export function useCalendarNavigation() {
  const currentDate = ref(new Date())
  const currentView = ref<CalendarView>('week')

  // Navigation methods
  const goToToday = () => {
    currentDate.value = new Date()
  }

  const next = () => {
    switch (currentView.value) {
      case 'day':
        currentDate.value = addDays(currentDate.value, 1)
        break
      case 'week':
        currentDate.value = addWeeks(currentDate.value, 1)
        break
      case 'month':
        currentDate.value = addMonths(currentDate.value, 1)
        break
    }
  }

  const previous = () => {
    switch (currentView.value) {
      case 'day':
        currentDate.value = subDays(currentDate.value, 1)
        break
      case 'week':
        currentDate.value = subWeeks(currentDate.value, 1)
        break
      case 'month':
        currentDate.value = subMonths(currentDate.value, 1)
        break
    }
  }

  const setView = (view: CalendarView) => {
    currentView.value = view
  }

  // Date range computations
  const dateRange = computed(() => {
    switch (currentView.value) {
      case 'day':
        return {
          start: currentDate.value,
          end: currentDate.value,
        }
      case 'week':
        return {
          start: startOfWeek(currentDate.value, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate.value, { weekStartsOn: 1 }),
        }
      case 'month':
        return {
          start: startOfMonth(currentDate.value),
          end: endOfMonth(currentDate.value),
        }
    }
  })

  // Formatted dates for display
  const formattedDate = computed(() => {
    switch (currentView.value) {
      case 'day':
        return format(currentDate.value, 'MMMM d, yyyy')
      case 'week':
        const { start, end } = dateRange.value
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
      case 'month':
        return format(currentDate.value, 'MMMM yyyy')
    }
  })

  // Helper methods
  const isToday = (date: Date) => {
    return isSameDay(date, new Date())
  }

  return {
    // State
    currentDate,
    currentView,
    dateRange,
    formattedDate,

    // Navigation methods
    goToToday,
    next,
    previous,
    setView,

    // Helpers
    isToday,
  }
}
