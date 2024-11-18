<template>
  <div class="flex items-center">
    <input
      type="checkbox"
      :id="id"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
    />
    <label
      v-if="label"
      :for="id"
      class="ml-2 block text-sm text-gray-900"
    >
      {{ label }}
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue?: boolean;
  label?: string;
  id?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const id = computed(() => props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`);
</script>
