<template>
  <div class="tool-layout">
    <textarea
      v-model="input"
      class="textarea"
      placeholder="输入需要编码或解码的文本..."
      rows="5"
      @paste="onPaste"
    ></textarea>

    <div class="tool-actions">
      <button class="btn btn-primary" @click="encode">编码</button>
      <button class="btn btn-primary" @click="decode">解码</button>
      <button class="btn btn-swap" @click="swap">交换</button>
      <button class="btn btn-secondary" @click="clear">清空</button>
    </div>

    <div class="output-wrapper">
      <textarea
        v-model="output"
        class="textarea"
        placeholder="输出结果..."
        rows="5"
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
import { ref } from 'vue'
import { useToast } from '@/shared/useToast'
import { copyToClipboard } from '@/shared/clipboard'

const input = ref('')
const output = ref('')
const toast = useToast()

function encode() {
  if (!input.value) {
    output.value = ''
    return
  }
  try {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(input.value)
    let binary = ''
    bytes.forEach((b) => (binary += String.fromCharCode(b)))
    output.value = btoa(binary)
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
    const binary = atob(input.value)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const decoder = new TextDecoder()
    output.value = decoder.decode(bytes)
  } catch {
    output.value = ''
    toast('解码失败，请检查输入是否为有效的 Base64 字符串')
  }
}

function onPaste() {
  // Auto-detect: if pasted text looks like Base64, try to decode it
  setTimeout(() => {
    if (/^[A-Za-z0-9+/]*={0,2}$/.test(input.value.trim())) {
      decode()
    } else {
      encode()
    }
  }, 0)
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

.copy-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
}
</style>
