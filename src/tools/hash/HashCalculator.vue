<template>
  <div class="tool-layout">
    <textarea
      v-model="input"
      class="textarea"
      placeholder="输入需要计算哈希的文本..."
      rows="5"
    ></textarea>

    <div class="algo-row">
      <button
        v-for="algo in algorithms"
        :key="algo"
        class="btn btn-sm"
        :class="algorithm === algo ? 'btn-primary' : 'btn-secondary'"
        @click="algorithm = algo"
      >
        {{ algo }}
      </button>
    </div>

    <div class="tool-actions">
      <button class="btn btn-primary" @click="calculate">计算</button>
    </div>

    <div v-if="result" class="output-wrapper">
      <pre class="code-output">{{ result }}</pre>
      <button
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

const toast = useToast()

const algorithms = ['MD5', 'SHA-1', 'SHA-256'] as const
type Algorithm = (typeof algorithms)[number]

const input = ref('')
const algorithm = ref<Algorithm>('SHA-256')
const result = ref('')

// --- MD5 implementation ---

function md5(str: string): string {
  // UTF-8 encode
  const bytes = new TextEncoder().encode(str)

  // Pre-processing: padding
  const bitLen = bytes.length * 8
  const padLen = ((56 - (bytes.length + 1) % 64) + 64) % 64
  const padded = new Uint8Array(bytes.length + 1 + padLen + 8)
  padded.set(bytes)
  padded[bytes.length] = 0x80
  // Append original length in bits as 64-bit little-endian
  const view = new DataView(padded.buffer)
  view.setUint32(padded.length - 8, bitLen >>> 0, true)
  view.setUint32(padded.length - 4, 0, true)

  // Initialize hash values
  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  // Per-round shift amounts
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ]

  // Pre-computed K table
  const K = new Uint32Array(64)
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0
  }

  const uint32 = new Uint32Array(padded.buffer)
  const numBlocks = padded.length / 64

  for (let block = 0; block < numBlocks; block++) {
    const offset = block * 16
    const M = uint32.subarray(offset, offset + 16)

    let A = a0, B = b0, C = c0, D = d0

    for (let i = 0; i < 64; i++) {
      let F: number
      let g: number

      if (i < 16) {
        F = (B & C) | (~B & D)
        g = i
      } else if (i < 32) {
        F = (D & B) | (~D & C)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        F = B ^ C ^ D
        g = (3 * i + 5) % 16
      } else {
        F = C ^ (B | ~D)
        g = (7 * i) % 16
      }

      F = (F + A + K[i] + M[g]) >>> 0
      A = D
      D = C
      C = B
      B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) >>> 0
    }

    a0 = (a0 + A) >>> 0
    b0 = (b0 + B) >>> 0
    c0 = (c0 + C) >>> 0
    d0 = (d0 + D) >>> 0
  }

  const toHex = (n: number) => n.toString(16).padStart(8, '0')
  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0)
}

// --- SHA via Web Crypto API ---

async function sha(algo: string, text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest(algo, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

const SHA_ALGO_MAP: Record<string, string> = {
  'SHA-1': 'SHA-1',
  'SHA-256': 'SHA-256',
}

async function calculate() {
  if (!input.value) {
    result.value = ''
    toast('请输入文本')
    return
  }

  try {
    if (algorithm.value === 'MD5') {
      result.value = md5(input.value)
    } else {
      const algoName = SHA_ALGO_MAP[algorithm.value]
      result.value = await sha(algoName, input.value)
    }
  } catch {
    result.value = ''
    toast('计算失败')
  }
}

async function copy() {
  const ok = await copyToClipboard(result.value)
  if (ok) toast('已复制')
}
</script>

<style scoped>
.algo-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  font-size: 14px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  word-break: break-all;
  line-height: 1.5;
  min-height: 48px;
}

.copy-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
}
</style>
