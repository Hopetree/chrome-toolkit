<template>
  <div class="tool-page" v-if="tool">
    <div class="tool-header" @click="router.push('/')">
      <span class="back-arrow">←</span>
      <span>{{ tool.icon }} {{ tool.name }}</span>
    </div>
    <component :is="toolComponent" v-if="toolComponent" />
  </div>
  <div v-else class="tool-page">
    <div class="tool-header" @click="router.push('/')">
      <span class="back-arrow">←</span>
      <span>工具未找到</span>
    </div>
    <p class="not-found">该工具不存在</p>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { tools } from '@/tools/_registry'

const router = useRouter()
const route = useRoute()

const toolId = computed(() => route.params.id as string)
const tool = computed(() => tools.find(t => t.id === toolId.value))

const toolComponent = computed(() => {
  if (!tool.value) return null
  return defineAsyncComponent(tool.value.component)
})
</script>

<style scoped>
.tool-page {
  display: flex;
  flex-direction: column;
}

.back-arrow {
  font-size: var(--text-lg);
  margin-right: var(--space-1);
}

.not-found {
  color: var(--text-secondary);
  font-size: var(--text-sm);
}
</style>
