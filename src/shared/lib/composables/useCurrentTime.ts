import { ref, onMounted, onUnmounted } from 'vue'
import { differenceInMinutes, startOfDay } from 'date-fns'

export function useCurrentTime() {
  const currentTime = ref(new Date())
  let timer: number

  const updateCurrentTime = () => {
    currentTime.value = new Date()
  }

  const currentTimePosition = () => {
    const now = currentTime.value
    const dayStart = startOfDay(now)
    const minutes = differenceInMinutes(now, dayStart)
    return (minutes / 60) * 5 * 16 // 5rem * 16px
  }

  onMounted(() => {
    updateCurrentTime()
    // Update every minute
    timer = window.setInterval(updateCurrentTime, 60000)
  })

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
    }
  })

  return {
    currentTime,
    currentTimePosition
  }
}
