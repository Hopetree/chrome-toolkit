<template>
  <div class="tool-layout">
    <textarea
      v-model="input"
      class="textarea"
      placeholder="粘贴 JSON 或 YAML 内容..."
      rows="8"
      @paste="onPaste"
    ></textarea>

    <div class="tool-actions">
      <button class="btn btn-primary" @click="toJson">YAML → JSON</button>
      <button class="btn btn-primary" @click="toYaml">JSON → YAML</button>
      <button class="btn btn-swap" @click="swap">交换</button>
      <button class="btn btn-secondary" @click="clear">清空</button>
    </div>

    <div v-if="error" class="error-text">{{ error }}</div>

    <div v-if="output" class="output-wrapper">
      <pre v-if="outputFormat === 'json'" class="code-output" v-html="highlighted"></pre>
      <pre v-else class="code-output" v-html="yamlHighlighted"></pre>
      <button class="btn btn-secondary btn-sm copy-btn" @click="copy">复制</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '@/shared/useToast'
import { copyToClipboard } from '@/shared/clipboard'
import yaml from 'js-yaml'

const input = ref('')
const output = ref('')
const outputFormat = ref<'json' | 'yaml'>('json')
const error = ref('')
const toast = useToast()

function toJson() {
  error.value = ''
  output.value = ''
  if (!input.value.trim()) return
  try {
    const parsed = yaml.load(input.value)
    output.value = JSON.stringify(parsed, null, 2)
    outputFormat.value = 'json'
  } catch (e) {
    error.value = `YAML 解析失败: ${(e as Error).message}`
  }
}

function toYaml() {
  error.value = ''
  output.value = ''
  if (!input.value.trim()) return
  try {
    const parsed = JSON.parse(input.value)
    output.value = yaml.dump(parsed, { indent: 2, lineWidth: -1 })
    outputFormat.value = 'yaml'
  } catch (e) {
    error.value = `JSON 解析失败: ${(e as Error).message}`
  }
}

function onPaste() {
  setTimeout(() => {
    const raw = input.value.trim()
    if (raw.startsWith('{') || raw.startsWith('[')) {
      toYaml()
    } else {
      toJson()
    }
  }, 0)
}

function swap() {
  const tmp = input.value
  input.value = output.value
  output.value = tmp
  error.value = ''
}

function clear() {
  input.value = ''
  output.value = ''
  error.value = ''
}

// JSON 语法高亮
const highlighted = computed(() => {
  if (outputFormat.value !== 'json' || !output.value) return ''
  return output.value.replace(
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
})

// YAML 语法高亮
const yamlHighlighted = computed(() => {
  if (outputFormat.value !== 'yaml' || !output.value) return ''
  return output.value
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^(\s*)(#.*)$/gm, '<span class="yaml-comment">$1$2</span>')
    .replace(/^(\s*[\w.-]+)(:)/gm, '<span class="yaml-key">$1</span><span class="yaml-colon">$2</span>')
    .replace(/:\s+(["'])(.*?)\1/g, ': <span class="yaml-string">$1$2$1</span>')
    .replace(/:\s+(\[.*?\])/g, ': <span class="yaml-string">$1</span>')
    .replace(/\b(true|false)\b/g, '<span class="yaml-bool">$1</span>')
    .replace(/\b(null)\b/g, '<span class="yaml-null">$1</span>')
    .replace(/\b(-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)\b/g, '<span class="yaml-number">$1</span>')
    .replace(/^(\s*- )/gm, '<span class="yaml-dash">$1</span>')
})

async function copy() {
  const ok = await copyToClipboard(output.value)
  if (ok) toast('已复制')
}
</script>

<style scoped>
.output-wrapper {
  position: relative;
}

.copy-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
}

.error-text {
  color: var(--error);
  font-size: var(--text-xs);
  line-height: 1.5;
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

.code-output :deep(.json-key),
.code-output :deep(.yaml-key) { color: #2563eb; }
.code-output :deep(.json-string),
.code-output :deep(.yaml-string) { color: #16a34a; }
.code-output :deep(.json-number),
.code-output :deep(.yaml-number) { color: #d97706; }
.code-output :deep(.json-boolean),
.code-output :deep(.yaml-bool) { color: #9333ea; }
.code-output :deep(.json-null),
.code-output :deep(.yaml-null) { color: var(--text-muted); }

.code-output :deep(.yaml-comment) { color: var(--text-muted); font-style: italic; }
.code-output :deep(.yaml-colon) { color: var(--text-secondary); }
.code-output :deep(.yaml-dash) { color: var(--text-secondary); }
</style>
