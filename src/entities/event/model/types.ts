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

export type EventColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'

export interface CreateEventPayload {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  color?: EventColor
  isTask?: boolean
  categories?: string[]
  hashtags?: string[]
}
