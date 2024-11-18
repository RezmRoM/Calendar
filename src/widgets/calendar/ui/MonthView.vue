<template>
  <div class="h-full flex flex-col">
    <!-- Week day headers -->
    <div class="grid grid-cols-7 border-b">
      <div
        v-for="weekday in weekDays"
        :key="weekday"
        class="h-12 flex items-center justify-center text-sm font-medium text-muted-foreground"
      >
        {{ weekday }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="flex-1 grid grid-cols-7 grid-rows-6">
      <div
        v-for="date in monthDates"
        :key="date.toISOString()"
        class="border-r border-b p-1 relative"
        :class="[
          isToday(date) && 'bg-primary/5',
          !isSameMonth(date, currentMonth) && 'opacity-50'
        ]"
      >
        <!-- Date number -->
        <div
          class="h-7 w-7 flex items-center justify-center text-sm rounded-full"
          :class="[
            isToday(date)
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground'
          ]"
        >
          {{ date.getDate() }}
        </div>

        <!-- Events -->
        <div class="mt-1 space-y-1">
          <TransitionGroup name="event">
            <div
              v-for="event in getDayEvents(date)"
              :key="event.id"
              class="rounded-sm px-2 py-1 text-xs truncate cursor-pointer hover:ring-1 ring-primary transition-shadow"
              :class="[
                event.completed ? 'opacity-50' : '',
                event.color ? `bg-${event.color}-100` : 'bg-primary/10'
              ]"
              @click="$emit('selectEvent', event)"
            >
              <div class="flex items-center gap-1">
                <CheckCircleIcon
                  v-if="event.isTask"
                  class="w-3 h-3"
                  :class="event.completed ? 'text-green-500' : 'text-muted-foreground'"
                />
                <span class="truncate">{{ event.title }}</span>
              </div>
            </div>
          </TransitionGroup>

          <!-- More events indicator -->
          <div
            v-if="getDayEvents(date).length > maxEventsPerDay"
            class="text-xs text-center text-muted-foreground cursor-pointer hover:text-foreground"
            @click="$emit('showMore', date)"
          >
            +{{ getDayEvents(date).length - maxEventsPerDay }} more
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday as isDateToday,
  isSameMonth as isSameMonthFn,
  format
} from 'date-fns'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import type { CalendarEvent } from '@/entities/event'

const props = defineProps<{
  currentMonth: Date
  events: CalendarEvent[]
}>()

const emit = defineEmits<{
  (e: 'selectEvent', event: CalendarEvent): void
  (e: 'showMore', date: Date): void
}>()

// Constants
const maxEventsPerDay = 3

const { t } = useI18n()

// Computed
const monthDates = computed(() => {
  const monthStart = startOfMonth(props.currentMonth)
  const monthEnd = endOfMonth(props.currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  return eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })
})

// Methods
const getDayEvents = (date: Date) => {
  return props.events.filter(event => {
    const eventDate = new Date(event.startTime)
    return (
      eventDate.getFullYear() === date.getFullYear() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getDate() === date.getDate()
    )
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
}

const isToday = (date: Date) => isDateToday(date)
const isSameMonth = (date: Date, baseDate: Date) => isSameMonthFn(date, baseDate)

// Заменим массив дней недели на переведенные значения
const weekDays = computed(() => [
  t('calendar.weekDays.short.sun'),
  t('calendar.weekDays.short.mon'),
  t('calendar.weekDays.short.tue'),
  t('calendar.weekDays.short.wed'),
  t('calendar.weekDays.short.thu'),
  t('calendar.weekDays.short.fri'),
  t('calendar.weekDays.short.sat')
])
</script>

<style scoped>
.event-enter-active,
.event-leave-active {
  transition: all 0.3s ease;
}

.event-enter-from,
.event-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
