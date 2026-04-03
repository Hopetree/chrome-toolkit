<template>
  <div class="tool-layout">
    <div class="options">
      <div class="option-row">
        <label>密码长度: {{ length }}</label>
        <input
          type="range"
          v-model.number="length"
          min="4"
          max="64"
          class="slider"
        />
        <input
          type="number"
          v-model.number="length"
          min="4"
          max="64"
          class="num-input"
        />
      </div>

      <div class="option-row checkboxes">
        <label>
          <input type="checkbox" v-model="upper" /> 大写字母 (A-Z)
        </label>
        <label>
          <input type="checkbox" v-model="lower" /> 小写字母 (a-z)
        </label>
        <label>
          <input type="checkbox" v-model="digits" /> 数字 (0-9)
        </label>
        <label>
          <input type="checkbox" v-model="symbols" /> 符号 (!@#$%...)
        </label>
      </div>
    </div>

    <div class="tool-actions">
      <button class="btn btn-primary" @click="generate">生成密码</button>
    </div>

    <div v-if="password" class="output-wrapper">
      <pre class="code-output">{{ password }}</pre>
      <button class="btn btn-secondary btn-sm copy-btn" @click="copy">
        复制
      </button>
    </div>

    <div v-if="password" class="strength-bar-wrapper">
      <div class="strength-bar">
        <div
          class="strength-fill"
          :style="{ width: barWidth + '%', background: barColor }"
        ></div>
      </div>
      <span class="strength-label" :style="{ color: barColor }">
        {{ strengthLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/shared/useToast'
import { copyToClipboard } from '@/shared/clipboard'

const toast = useToast()

const length = ref(16)
const upper = ref(true)
const lower = ref(true)
const digits = ref(true)
const symbols = ref(true)
const password = ref('')

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

function charsetSize(): number {
  let size = 0
  if (upper.value) size += 26
  if (lower.value) size += 26
  if (digits.value) size += 10
  if (symbols.value) size += SYMBOLS.length
  return size
}

const entropy = computed(() => {
  const size = charsetSize()
  if (size === 0) return 0
  return length.value * Math.log2(size)
})

const strengthLabel = computed(() => {
  if (entropy.value < 40) return '弱'
  if (entropy.value <= 60) return '中等'
  return '强'
})

const barColor = computed(() => {
  if (entropy.value < 40) return '#e74c3c'
  if (entropy.value <= 60) return '#f39c12'
  return '#27ae60'
})

const barWidth = computed(() => {
  const maxEntropy = 64 * Math.log2(26 + 26 + 10 + SYMBOLS.length)
  return Math.min((entropy.value / maxEntropy) * 100, 100)
})

function generate() {
  let pool = ''
  if (upper.value) pool += UPPER
  if (lower.value) pool += LOWER
  if (digits.value) pool += DIGITS
  if (symbols.value) pool += SYMBOLS

  if (!pool) {
    password.value = ''
    toast('请至少选择一种字符类型')
    return
  }

  const arr = new Uint32Array(length.value)
  crypto.getRandomValues(arr)
  password.value = Array.from(arr, (n) => pool[n % pool.length]).join('')
}

async function copy() {
  const ok = await copyToClipboard(password.value)
  if (ok) toast('已复制')
}

onMounted(() => {
  generate()
})
</script>

<style scoped>
.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.option-row label {
  user-select: none;
  cursor: pointer;
}

.slider {
  flex: 1;
  cursor: pointer;
}

.num-input {
  width: 56px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
}

.checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
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

.strength-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.strength-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease, background 0.3s ease;
}

.strength-label {
  font-size: 12px;
  font-weight: 500;
  min-width: 32px;
  text-align: right;
}
</style>
