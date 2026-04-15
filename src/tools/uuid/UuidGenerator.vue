<template>
  <div class="tool-layout">
    <div class="tool-actions">
      <button class="btn btn-primary" @click="generate">生成</button>
      <label class="batch-toggle">
        <input type="checkbox" v-model="batchMode" />
        批量生成
      </label>
      <div v-if="batchMode" class="batch-input">
        <input
          type="number"
          v-model.number="batchCount"
          min="1"
          max="20"
          class="num-input"
        />
        <span class="batch-hint">1-20</span>
      </div>
    </div>

    <div v-if="uuids.length" class="output-wrapper">
      <div class="uuid-list">
        <div v-for="(uuid, index) in uuids" :key="index" class="uuid-row">
          <span class="uuid-text">{{ uuid }}</span>
          <button
            class="btn btn-secondary btn-sm uuid-copy"
            @click="copyOne(uuid)"
          >
            复制
          </button>
        </div>
      </div>
      <button class="btn btn-primary btn-sm copy-all-btn" @click="copyAll">
        复制全部
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from '@/shared/useToast'
import { copyToClipboard } from '@/shared/clipboard'

const toast = useToast()
const uuids = ref<string[]>([])
const batchMode = ref(false)
const batchCount = ref(1)

watch(batchMode, (enabled) => {
  if (!enabled) {
    batchCount.value = 1
  }
})

function generate() {
  const count = batchMode.value ? Math.min(Math.max(batchCount.value, 1), 20) : 1
  uuids.value = Array.from({ length: count }, () => crypto.randomUUID())
}

async function copyOne(uuid: string) {
  const ok = await copyToClipboard(uuid)
  if (ok) toast('已复制')
}

async function copyAll() {
  const ok = await copyToClipboard(uuids.value.join('\n'))
  if (ok) toast('已复制全部')
}
</script>

<style scoped>
.batch-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
}

.batch-input {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
}

.num-input {
  width: 56px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
}

.batch-hint {
  font-size: 12px;
  color: #999;
}

.output-wrapper {
  position: relative;
}

.uuid-list {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px;
  overflow-y: auto;
}

.uuid-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: 4px;
}

.uuid-row:hover {
  background: var(--bg-secondary);
}

.uuid-text {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: var(--text-primary);
  word-break: break-all;
  flex: 1;
  margin-right: 8px;
}

.uuid-copy {
  flex-shrink: 0;
}

.copy-all-btn {
  margin-top: 8px;
}
</style>
