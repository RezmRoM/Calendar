<template>
  <div class="flex items-center space-x-2">
    <Button
      variant="ghost"
      size="sm"
      :class="{ 'bg-primary/10': currentLocale === 'en' }"
      @click="switchLanguage('en')"
    >
      EN
    </Button>
    <Button
      variant="ghost"
      size="sm"
      :class="{ 'bg-primary/10': currentLocale === 'ru' }"
      @click="switchLanguage('ru')"
    >
      RU
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/shared/ui/button'

const { locale } = useI18n()
const currentLocale = computed(() => locale.value)

const switchLanguage = (lang: string) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
}
</script>
