<template>
  <div>
    <header class="app-header">
      <h1 class="app-title">Chrome Toolkit</h1>
      <span class="app-version">v1.0</span>
    </header>

    <input
      ref="searchRef"
      v-model="query"
      class="input search-input"
      placeholder="搜索工具..."
      @keydown.esc="query = ''"
    />

    <div v-for="cat in filteredCategories" :key="cat" class="category-section">
      <div class="section-title">{{ categoryLabels[cat] }}</div>
      <div class="tool-grid">
        <div
          v-for="tool in toolsByCategory(cat)"
          :key="tool.id"
          class="tool-card card"
          @click="go(tool.id)"
        >
          <div class="tool-card-icon">{{ tool.icon }}</div>
          <div class="tool-card-info">
            <div class="tool-card-name">{{ tool.name }}</div>
            <div class="tool-card-desc">{{ tool.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { tools, CATEGORY_LABELS as categoryLabels, CATEGORY_ORDER as categoryOrder } from '@/tools/_registry'
import type { Category } from '@/shared/types'

const router = useRouter()
const query = ref('')
const searchRef = ref<HTMLInputElement>()

const filteredCategories = computed(() => {
  if (!query.value) return categoryOrder
  const q = query.value.toLowerCase()
  return categoryOrder.filter(cat =>
    tools
      .filter(t => t.category === cat)
      .some(t => matchesTool(t, q))
  )
})

function toolsByCategory(cat: Category) {
  const filtered = tools.filter(t => t.category === cat)
  if (!query.value) return filtered
  const q = query.value.toLowerCase()
  return filtered.filter(t => matchesTool(t, q))
}

function matchesTool(t: { name: string; description: string; keywords: string[] }, q: string) {
  return (
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.keywords.some(k => k.toLowerCase().includes(q))
  )
}

function go(id: string) {
  router.push(`/tool/${id}`)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === '/' && document.activeElement !== searchRef.value) {
    e.preventDefault()
    searchRef.value?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.app-title {
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.4;
}

.app-version {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.search-input {
  margin-bottom: var(--space-3);
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.category-section {
  margin-top: var(--space-4);
}

.category-section:first-child {
  margin-top: var(--space-2);
}

.tool-card {
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tool-card-icon {
  font-size: 20px;
  line-height: 1;
}

.tool-card-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.tool-card-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.tool-card-desc {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
