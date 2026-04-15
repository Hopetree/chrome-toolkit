<template>
  <div class="tool-layout">
    <textarea
      v-model="input"
      class="textarea"
      placeholder="输入需要编码或解码的文本..."
      rows="5"
    ></textarea>

    <div class="tool-actions">
      <button class="btn btn-primary" @click="encode">编码</button>
      <button class="btn btn-primary" @click="decode">解码</button>
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

function encode() {
  if (!input.value) {
    output.value = ''
    return
  }
  try {
    output.value = encodeURIComponent(input.value)
  } catch {
    output.value = ''
    toast('编码失败')
  }
}

function decode() {
  if (!input.value) {
    output.value = ''
    return
  }
  try {
    output.value = decodeURIComponent(input.value)
  } catch {
    output.value = ''
    toast('解码失败，请检查输入是否为有效的 URL 编码字符串')
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
