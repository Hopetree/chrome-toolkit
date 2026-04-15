<template>
  <div class="tool-layout">
    <textarea
      v-model="input"
      class="textarea"
      placeholder="输入需要转义或还原的文本..."
      rows="5"
    ></textarea>

    <div class="tool-actions">
      <button class="btn btn-primary" @click="escape">转义</button>
      <button class="btn btn-primary" @click="unescape">还原</button>
      <button class="btn btn-swap" @click="swap">交换</button>
      <button class="btn btn-secondary" @click="clear">清空</button>
    </div>

    <div class="output-wrapper">
      <textarea
        ref="outputRef"
        v-model="output"
        class="textarea auto-textarea"
        placeholder="输出结果..."
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

function escape() {
  if (!input.value) {
    output.value = ''
    return
  }
  try {
    let result = ''
    for (const char of input.value) {
      const cp = char.codePointAt(0)!
      if (cp > 0xffff) {
        // Supplementary plane: use \u{XXXXX} format
        result += `\\u{${cp.toString(16).toUpperCase()}}`
      } else {
        // BMP: use \uXXXX format
        result += `\\u${cp.toString(16).toUpperCase().padStart(4, '0')}`
      }
    }
    output.value = result
  } catch {
    output.value = ''
    toast('转义失败')
  }
}

function unescape() {
  if (!input.value) {
    output.value = ''
    return
  }
  try {
    const regex = /\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g
    let result = ''
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(input.value)) !== null) {
      // Append the literal text before this match
      result += input.value.slice(lastIndex, match.index)

      let codePoint: number
      if (match[1] !== undefined) {
        // \u{XXXXX} format
        codePoint = parseInt(match[1], 16)
      } else {
        // \uXXXX format
        codePoint = parseInt(match[2], 16)
      }
      result += String.fromCodePoint(codePoint)
      lastIndex = regex.lastIndex
    }

    // Append any remaining literal text after the last match
    result += input.value.slice(lastIndex)
    output.value = result
  } catch {
    output.value = ''
    toast('还原失败，请检查输入格式')
  }
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
