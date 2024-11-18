import { createRouter, createWebHistory } from 'vue-router'
import CalendarPage from '@/pages/calendar/ui/CalendarPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'calendar',
      component: CalendarPage
    }
  ]
})
