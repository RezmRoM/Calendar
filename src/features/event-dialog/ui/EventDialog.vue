<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ event ? t('events.edit') : t('events.new') }}</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Title -->
        <div class="space-y-2">
          <Label for="title">{{ t('events.title') }}</Label>
          <Input
            id="title"
            v-model="formData.title"
            :placeholder="t('events.titlePlaceholder')"
            required
          />
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label for="description">{{ t('events.description') }}</Label>
          <textarea
            id="description"
            v-model="formData.description"
            :placeholder="t('events.descriptionPlaceholder')"
            class="w-full min-h-[100px] rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm"
          />
        </div>

        <!-- Date and Time -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="startTime">{{ t('events.startTime') }}</Label>
            <Input
              id="startTime"
              v-model="formData.startTime"
              type="datetime-local"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="endTime">{{ t('events.endTime') }}</Label>
            <Input
              id="endTime"
              v-model="formData.endTime"
              type="datetime-local"
              required
            />
          </div>
        </div>

        <!-- Category -->
        <div class="space-y-2">
          <Label for="category">{{ t('events.category') }}</Label>
          <select
            id="category"
            v-model="formData.category"
            class="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm"
          >
            <option value="">{{ t('events.selectCategory') }}</option>
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>

        <!-- Color -->
        <div class="space-y-2">
          <Label for="color">{{ t('events.color') }}</Label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in eventColors"
              :key="color"
              type="button"
              class="w-6 h-6 rounded-full"
              :class="{ 'ring-2 ring-offset-2': formData.color === color }"
              :style="{ backgroundColor: color }"
              @click="formData.color = color"
            />
          </div>
        </div>

        <!-- Task Options -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="isTask"
              v-model="formData.isTask"
              @update:modelValue="handleTaskToggle"
            />
            <Label for="isTask">{{ t('events.isTask') }}</Label>
          </div>

          <div v-if="formData.isTask" class="flex items-center space-x-2">
            <Checkbox id="completed" v-model="formData.completed" />
            <Label for="completed">{{ t('events.completed') }}</Label>
          </div>
        </div>

        <!-- Hashtags -->
        <div class="space-y-2">
          <Label for="hashtags">{{ t('events.hashtags') }}</Label>
          <Input
            id="hashtags"
            v-model="hashtagsInput"
            :placeholder="t('events.hashtagsPlaceholder')"
            @keydown.enter.prevent="addHashtag"
          />
          <div class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="tag in formData.hashtags"
              :key="tag"
              class="px-2 py-1 text-sm rounded-full bg-primary/10"
            >
              #{{ tag }}
              <button
                type="button"
                class="ml-1 text-muted-foreground hover:text-foreground"
                @click="removeHashtag(tag)"
              >
                ×
              </button>
            </span>
          </div>
        </div>

        <!-- Actions -->
        <DialogFooter>
          <Button
            v-if="event"
            type="button"
            variant="destructive"
            @click="handleDelete"
          >
            {{ t('events.delete') }}
          </Button>
          <div class="flex space-x-2">
            <Button type="button" variant="outline" @click="open = false">
              {{ t('events.cancel') }}
            </Button>
            <Button type="submit">
              {{ t('events.save') }}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Checkbox } from '@/shared/ui/checkbox'
import { useEventStore } from '@/entities/event'
import type { CalendarEvent } from '@/entities/event'

const props = defineProps<{
  open: boolean
  event?: CalendarEvent | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update', event: CalendarEvent): void
  (e: 'delete', eventId: string): void
}>()

const { t } = useI18n()
const eventStore = useEventStore()

// Event colors
const eventColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#a855f7', // purple
  '#ec4899', // pink
]

// Add this interface at the top of the script section
interface EventFormData {
  title: string
  description: string
  startTime: string // Changed from Date to string for form inputs
  endTime: string // Changed from Date to string for form inputs
  category: string
  color: string
  isTask: boolean
  completed: boolean
  hashtags: string[]
}

// Update the formData ref type
const formData = ref<EventFormData>({
  title: '',
  description: '',
  startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  endTime: format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"),
  category: '',
  color: eventColors[0],
  isTask: false,
  completed: false,
  hashtags: [],
})

// Categories
const categories = computed(() => eventStore.categories)

// Hashtags handling
const hashtagsInput = ref('')

const addHashtag = () => {
  const tag = hashtagsInput.value.trim().replace(/^#/, '')
  if (tag && !formData.value.hashtags?.includes(tag)) {
    formData.value.hashtags = [...(formData.value.hashtags || []), tag]
  }
  hashtagsInput.value = ''
}

const removeHashtag = (tag: string) => {
  formData.value.hashtags = formData.value.hashtags?.filter(t => t !== tag)
}

// Task handling
const handleTaskToggle = (value: boolean) => {
  formData.value.isTask = value
  if (!value) {
    formData.value.completed = false
  }
}

// Watch for event changes
watch(
  () => props.event,
  newEvent => {
    if (newEvent) {
      formData.value = { ...newEvent }
      formData.value.startTime = format(new Date(newEvent.startTime), "yyyy-MM-dd'T'HH:mm")
      formData.value.endTime = format(new Date(newEvent.endTime), "yyyy-MM-dd'T'HH:mm")
    } else {
      formData.value = {
        title: '',
        description: '',
        startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"),
        category: '',
        color: eventColors[0],
        isTask: false,
        completed: false,
        hashtags: [],
      }
    }
  },
  { immediate: true }
)

// Update the form submission
const handleSubmit = () => {
  if (!formData.value.startTime || !formData.value.endTime) return

  const event: CalendarEvent = {
    id: props.event?.id || crypto.randomUUID(),
    ...formData.value,
    startTime: new Date(formData.value.startTime),
    endTime: new Date(formData.value.endTime),
    hashtags: formData.value.hashtags || [],
  }

  emit('update', event)
  emit('update:open', false)
}

// Delete event
const handleDelete = () => {
  if (props.event?.id) {
    emit('delete', props.event.id)
    emit('update:open', false)
  }
}

// Sync open state
const open = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})
</script>

<script lang="ts">
export default {
  name: 'EventDialog'
}
</script>
