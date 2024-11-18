<template>
  <div
    class="grid gap-4"
    :class="[size === 'sm' && 'sm:max-w-[425px]', size === 'lg' && 'sm:max-w-[800px]']"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'lg'
  }>(),
  {
    size: 'sm',
  }
)
</script>
