<template>
  <router-view />
  <Toast ref="toastRef" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Toast from './components/Toast.vue'
import { provideToast } from '@/shared/useToast'

const toastRef = ref<InstanceType<typeof Toast>>()

onMounted(() => {
  if (toastRef.value) {
    provideToast((msg: string, duration?: number) => toastRef.value!.show(msg, duration))
  }
})
</script>
