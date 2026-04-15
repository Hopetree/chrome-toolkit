<template>
  <div class="tool-layout">
    <textarea
      v-model="input"
      class="textarea"
      placeholder="输入需要转换的文本..."
      rows="4"
    ></textarea>

    <div class="tool-actions">
      <button class="btn btn-primary" @click="convert('camelCase')">camelCase</button>
      <button class="btn btn-primary" @click="convert('PascalCase')">PascalCase</button>
      <button class="btn btn-primary" @click="convert('snake_case')">snake_case</button>
      <button class="btn btn-primary" @click="convert('kebab-case')">kebab-case</button>
      <button class="btn btn-primary" @click="convert('CONSTANT_CASE')">CONSTANT_CASE</button>
      <button class="btn btn-secondary" @click="convert('UPPER')">全部大写</button>
      <button class="btn btn-secondary" @click="convert('lower')">全部小写</button>
      <button class="btn btn-secondary" @click="convert('Sentence')">首字母大写</button>
      <button class="btn btn-secondary" @click="convert('Title Case')">标题格式</button>
      <button class="btn btn-swap" @click="swap">交换</button>
      <button class="btn btn-secondary" @click="clear">清空</button>
    </div>

    <div class="output-wrapper">
      <textarea
        ref="outputRef"
        v-model="output"
        class="textarea auto-textarea"
        placeholder="点击上方按钮进行转换..."
        readonly
      ></textarea>
      <button
        v-if="output"
        class="btn btn-secondary btn-sm copy-btn"
        @click="copy"
      >
        复制
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useToast } from '@/shared/useToast'
import { copyToClipboard } from '@/shared/clipboard'

const input = ref('')
const output = ref('')
const outputRef = ref<HTMLTextAreaElement | null>(null)
const toast = useToast()

function autoResize(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

watch(output, () => {
  nextTick(() => autoResize(outputRef.value))
})

function splitIntoWords(text: string): string[] {
  // Split by common separators and camelCase boundaries
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')    // camelCase split
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // XMLParser split
    .replace(/[-_./\\]/g, ' ')                // separators to spaces
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function convertCase(words: string[], style: string): string {
  switch (style) {
    case 'camelCase':
      return words.map((w, i) =>
        i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join('')
    case 'PascalCase':
      return words.map(w =>
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join('')
    case 'snake_case':
      return words.map(w => w.toLowerCase()).join('_')
    case 'kebab-case':
      return words.map(w => w.toLowerCase()).join('-')
    case 'CONSTANT_CASE':
      return words.map(w => w.toUpperCase()).join('_')
    default:
      return words.join(' ')
  }
}

function convert(style: string) {
  if (!input.value) {
    output.value = ''
    return
  }

  const text = input.value.trim()
  const words = splitIntoWords(text)

  if (words.length === 0) {
    output.value = ''
    toast('没有可转换的内容')
    return
  }

  // Simple case conversions that don't need word splitting
  if (style === 'UPPER') {
    output.value = text.toUpperCase()
    return
  }
  if (style === 'lower') {
    output.value = text.toLowerCase()
    return
  }
  if (style === 'Sentence') {
    output.value = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    return
  }
  if (style === 'Title Case') {
    output.value = words.map(w =>
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join(' ')
    return
  }

  output.value = convertCase(words, style)
}

async function copy() {
  const ok = await copyToClipboard(output.value)
  if (ok) {
    toast('已复制')
  }
}

function swap() {
  const tmp = input.value
  input.value = output.value
  output.value = tmp
}

function clear() {
  input.value = ''
  output.value = ''
}
</script>

<style scoped>
.output-wrapper {
  position: relative;
}

.auto-textarea {
  min-height: 80px;
  resize: none;
  overflow: hidden;
}

.copy-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
}
</style>
