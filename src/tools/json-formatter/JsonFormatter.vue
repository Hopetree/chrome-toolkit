<template>
  <div class="tool-layout">
    <textarea
      v-model="input"
      class="textarea"
      placeholder="输入 JSON 字符串..."
      rows="8"
      @paste="onPaste"
    ></textarea>

    <div class="tool-actions">
      <button class="btn btn-primary" @click="format">格式化</button>
      <button class="btn btn-primary" @click="minify">压缩</button>
      <button class="btn btn-secondary" @click="clear">清空</button>
    </div>

    <div v-if="error" class="error-msg">{{ error }}</div>

    <div v-if="formatted" class="output-wrapper">
      <pre class="code-output" v-html="highlighted"></pre>
      <button class="btn btn-secondary btn-sm copy-btn" @click="copy">复制</button>
    </div>

    <div v-if="formatted" class="stats">
      <span>{{ byteSize }} bytes</span>
      <span>{{ lineCount }} 行</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '@/shared/useToast'
import { copyToClipboard } from '@/shared/clipboard'

const input = ref('')
const formatted = ref('')
const error = ref('')
const toast = useToast()

const highlighted = computed(() => syntaxHighlight(formatted.value))

const byteSize = computed(() => new Blob([formatted.value]).size)

const lineCount = computed(() => formatted.value.split('\n').length)

function format() {
  if (!input.value.trim()) {
    clear()
    return
  }
  try {
    const parsed = JSON.parse(input.value)
    formatted.value = JSON.stringify(parsed, null, 2)
    error.value = ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'JSON 格式无效'
    formatted.value = ''
  }
}

function minify() {
  if (!input.value.trim()) {
    clear()
    return
  }
  try {
    const parsed = JSON.parse(input.value)
    formatted.value = JSON.stringify(parsed)
    error.value = ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'JSON 格式无效'
    formatted.value = ''
  }
}

function clear() {
  input.value = ''
  formatted.value = ''
  error.value = ''
}

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number'
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'json-key' : 'json-string'
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean'
      } else if (/null/.test(match)) {
        cls = 'json-null'
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}

function onPaste() {
  setTimeout(() => format(), 0)
}

async function copy() {
  const ok = await copyToClipboard(formatted.value)
  if (ok) {
    toast('已复制')
  }
}
</script>

<style scoped>
.error-msg {
  color: var(--error);
  font-size: 13px;
  padding: 6px 0;
  word-break: break-all;
}

.output-wrapper {
  position: relative;
}

.code-output {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  overflow-x: auto;
  white-space: pre;
  line-height: 1.5;
  max-height: 400px;
  overflow-y: auto;
}

.code-output::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.code-output::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.code-output :deep(.json-key) {
  color: #2563eb;
}

.code-output :deep(.json-string) {
  color: #16a34a;
}

.code-output :deep(.json-number) {
  color: #d97706;
}

.code-output :deep(.json-boolean) {
  color: #9333ea;
}

.code-output :deep(.json-null) {
  color: #dc2626;
}

.copy-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
}

.stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
  padding-top: 4px;
}
</style>
