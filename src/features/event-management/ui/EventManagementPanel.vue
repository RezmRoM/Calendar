<template>
  <div class="w-64 border-l bg-background">
    <div class="p-4 border-b">
      <Button class="w-full" @click="$emit('newEvent')">
        <PlusIcon class="w-4 h-4 mr-2" />
        {{ t('events.new') }}
      </Button>
    </div>

    <!-- Quick Filters -->
    <div class="p-4 border-b">
      <h3 class="text-sm font-medium mb-3">{{ t('filters.title') }}</h3>
      <div class="space-y-2">
        <Button
          v-for="filter in quickFilters"
          :key="filter.id"
          variant="ghost"
          class="w-full justify-start"
          :class="activeFilters.includes(filter.id) && 'bg-primary/10'"
          @click="toggleFilter(filter.id)"
        >
          <component :is="filter.icon" class="w-4 h-4 mr-2" />
          {{ t(`filters.${filter.id}`) }}
        </Button>
      </div>
    </div>

    <!-- Categories -->
    <div class="p-4 border-b">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium">{{ t('events.categories') }}</h3>
        <Button variant="ghost" size="sm" @click="showAddCategory = true">
          <PlusIcon class="w-4 h-4" />
        </Button>
      </div>
      <div class="space-y-2">
        <Button
          v-for="category in categories"
          :key="category"
          variant="ghost"
          class="w-full justify-start"
          :class="selectedCategories.includes(category) && 'bg-primary/10'"
          @click="toggleCategory(category)"
        >
          <TagIcon class="w-4 h-4 mr-2" />
          {{ category }}
        </Button>
      </div>
    </div>

    <!-- Upcoming Events -->
    <div class="p-4">
      <h3 class="text-sm font-medium mb-3">{{ t('upcomingEvents') }}</h3>
      <div class="space-y-2">
        <div
          v-for="event in upcomingEvents"
          :key="event.id"
          class="p-2 rounded-md hover:bg-accent cursor-pointer"
          @click="$emit('selectEvent', event)"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-sm">{{ event.title }}</span>
            <span
              v-if="event.isTask"
              class="w-4 h-4"
              :class="event.completed ? 'text-green-500' : 'text-muted-foreground'"
            >
              <CheckCircleIcon />
            </span>
          </div>
          <div class="text-xs text-muted-foreground mt-1">
            {{ formatEventDate(event.startTime) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Add Category Dialog -->
    <Dialog v-model:open="showAddCategory">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('events.addCategory') }}</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label>{{ t('events.categoryName') }}</Label>
            <Input v-model="newCategory" :placeholder="t('events.categoryName')" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showAddCategory = false">
            {{ t('events.cancel') }}
          </Button>
          <Button @click="addCategory">{{ t('events.save') }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-unused-components */
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  TagIcon,
  StarIcon
} from '@heroicons/vue/24/outline'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/ui/dialog'
import { useEventStore } from '@/entities/event'
import type { CalendarEvent } from '@/entities/event'
/* eslint-enable vue/no-unused-components */

const { t } = useI18n()

const eventStore = useEventStore()

// Props and emits
const emit = defineEmits<{
  (e: 'newEvent'): void
  (e: 'selectEvent', event: CalendarEvent): void
}>()

// Quick filters
const quickFilters = [
  { id: 'upcoming', icon: ClockIcon },
  { id: 'today', icon: CalendarIcon },
  { id: 'tasks', icon: CheckCircleIcon },
  { id: 'completed', icon: CheckCircleIcon },
  { id: 'favorite', icon: StarIcon }
]

const activeFilters = ref<string[]>([])

const toggleFilter = (filterId: string) => {
  const index = activeFilters.value.indexOf(filterId)
  if (index === -1) {
    activeFilters.value.push(filterId)
  } else {
    activeFilters.value.splice(index, 1)
  }
}

// Categories
const categories = computed(() => eventStore.categories)
const selectedCategories = ref<string[]>([])

const toggleCategory = (category: string) => {
  const index = selectedCategories.value.indexOf(category)
  if (index === -1) {
    selectedCategories.value.push(category)
  } else {
    selectedCategories.value.splice(index, 1)
  }
}

// Add Category Dialog
const showAddCategory = ref(false)
const newCategory = ref('')

const addCategory = () => {
  if (newCategory.value.trim()) {
    eventStore.addCategory(newCategory.value.trim())
    newCategory.value = ''
    showAddCategory.value = false
  }
}

// Upcoming Events
const upcomingEvents = computed(() => {
  const now = new Date()
  return eventStore.events
    .filter(event => new Date(event.startTime) > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5)
})

const formatEventDate = (date: Date) => {
  return format(new Date(date), 'MMM d, h:mm a')
}
</script>
