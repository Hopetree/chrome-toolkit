<template>
  <Transition name="toast">
    <div v-if="visible" :class="['toast', { leaving }]">
      {{ message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref('')
const visible = ref(false)
const leaving = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function show(msg: string, duration = 2000) {
  message.value = msg
  leaving.value = false
  visible.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    leaving.value = true
    setTimeout(() => {
      visible.value = false
      leaving.value = false
    }, 150)
  }, duration)
}

defineExpose({ show })
</script>
