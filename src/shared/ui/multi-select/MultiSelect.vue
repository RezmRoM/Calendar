<template>
  <div class="relative">
    <div
      class="flex flex-wrap gap-1 min-h-[2.5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
      :class="{ 'ring-2 ring-ring ring-offset-2': open }"
      @click="open = true"
    >
      <div
        v-for="item in modelValue"
        :key="item"
        class="flex items-center gap-1 rounded bg-secondary px-2 py-1"
      >
        <span>{{ item }}</span>
        <button
          type="button"
          class="rounded-full hover:bg-secondary-foreground/20"
          @click.stop="remove(item)"
        >
          <XMarkIcon class="h-3 w-3" />
        </button>
      </div>
      <input
        ref="inputRef"
        v-model="search"
        class="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        :placeholder="modelValue.length === 0 ? placeholder : ''"
        @keydown.backspace="handleBackspace"
      />
    </div>

    <div
      v-if="open"
      class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
    >
      <div class="p-1">
        <div
          v-for="option in filteredOptions"
          :key="option"
          class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
          :class="{ 'bg-accent text-accent-foreground': isSelected(option) }"
          @click="toggle(option)"
        >
          {{ option }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { XMarkIcon } from '@heroicons/vue/20/solid'

const props = defineProps<{
  modelValue: string[]
  options: string[]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const containerRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const open = ref(false)
const search = ref('')

onClickOutside(containerRef, () => {
  open.value = false
  search.value = ''
})

const filteredOptions = computed(() => {
  return props.options.filter(
    option =>
      !props.modelValue.includes(option) &&
      option.toLowerCase().includes(search.value.toLowerCase())
  )
})

const isSelected = (option: string) => props.modelValue.includes(option)

const toggle = (option: string) => {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(option)

  if (index === -1) {
    newValue.push(option)
  } else {
    newValue.splice(index, 1)
  }

  emit('update:modelValue', newValue)
  search.value = ''
  inputRef.value?.focus()
}

const remove = (option: string) => {
  emit(
    'update:modelValue',
    props.modelValue.filter(item => item !== option)
  )
}

const handleBackspace = (e: KeyboardEvent) => {
  if (search.value === '' && props.modelValue.length > 0) {
    e.preventDefault()
    remove(props.modelValue[props.modelValue.length - 1])
  }
}
</script>
