<template>
  <div class="tool-layout">
    <textarea
      v-model="input"
      class="textarea"
      placeholder="输入 XML 字符串..."
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
      <pre class="code-output">{{ formatted }}</pre>
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
import xmlFormat from 'xml-formatter'

const input = ref('')
const formatted = ref('')
const error = ref('')
const toast = useToast()

const byteSize = computed(() => new Blob([formatted.value]).size)
const lineCount = computed(() => formatted.value.split('\n').length)

function format() {
  if (!input.value.trim()) { clear(); return }
  try {
    formatted.value = xmlFormat(input.value.trim(), {
      indentation: '  ',
      collapseContent: true,
    })
    error.value = ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'XML 格式无效'
    formatted.value = ''
  }
}

function minify() {
  if (!input.value.trim()) { clear(); return }
  try {
    formatted.value = input.value.trim().replace(/>\s+</g, '><')
    error.value = ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'XML 格式无效'
    formatted.value = ''
  }
}

function clear() {
  input.value = ''
  formatted.value = ''
  error.value = ''
}

function onPaste() {
  setTimeout(() => format(), 0)
}

async function copy() {
  const ok = await copyToClipboard(formatted.value)
  if (ok) toast('已复制')
}
</script>

<style scoped>
.error-msg {
  color: var(--error);
  font-size: var(--text-sm);
  padding: var(--space-1) 0;
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

.copy-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
}

.stats {
  display: flex;
  gap: var(--space-4);
  font-size: var(--text-xs);
  color: var(--text-muted);
  padding-top: var(--space-1);
}
</style>
