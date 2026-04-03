<template>
  <div class="tool-layout">
    <input
      v-model="input"
      class="input mono"
      placeholder="输入数字，如 0b1010、0o12、0xFF、255"
      @input="convert"
    />

    <div v-if="error" class="error-msg">{{ error }}</div>

    <template v-if="!error && input.trim()">
      <div
        v-for="row in outputs"
        :key="row.base"
        class="output-row"
      >
        <div class="output-row-header">
          <span class="output-label">{{ row.label }}</span>
          <button
            class="btn btn-secondary btn-sm"
            @click="copyValue(row.value)"
          >
            复制
          </button>
        </div>
        <div class="code-output mono">{{ row.value }}</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '@/shared/useToast'
import { copyToClipboard } from '@/shared/clipboard'

const toast = useToast()
const input = ref('')
const error = ref('')

interface OutputRow {
  base: number
  label: string
  value: string
}

const decimalValue = computed(() => {
  const raw = input.value.trim()
  if (!raw) {
    error.value = ''
    return null
  }

  let parsed: number
  try {
    parsed = parseInput(raw)
  } catch {
    error.value = '无效的数字格式'
    return null
  }

  if (isNaN(parsed)) {
    error.value = '无法解析为数字'
    return null
  }

  if (!Number.isFinite(parsed)) {
    error.value = '数值超出范围'
    return null
  }

  error.value = ''
  return parsed
})

const outputs = computed<OutputRow[]>(() => {
  if (decimalValue.value === null) return []
  const n = Math.floor(decimalValue.value)
  return [
    { base: 2, label: 'Binary (2)', value: '0b' + n.toString(2) },
    { base: 8, label: 'Octal (8)', value: '0o' + n.toString(8) },
    { base: 10, label: 'Decimal (10)', value: n.toString(10) },
    { base: 16, label: 'Hexadecimal (16)', value: '0x' + n.toString(16).toUpperCase() },
  ]
})

function parseInput(raw: string): number {
  const lower = raw.toLowerCase()

  if (lower.startsWith('0b')) {
    return parseInt(lower.slice(2), 2)
  }
  if (lower.startsWith('0o')) {
    return parseInt(lower.slice(2), 8)
  }
  if (lower.startsWith('0x')) {
    return parseInt(lower.slice(2), 16)
  }

  // Plain decimal
  const n = Number(raw)
  if (!/^-?\d+$/.test(raw)) {
    throw new Error('invalid')
  }
  return n
}

function convert() {
  // Trigger reactivity via computed
  void decimalValue.value
}

async function copyValue(value: string) {
  const ok = await copyToClipboard(value)
  if (ok) toast('已复制')
}
</script>

<style scoped>
.mono {
  font-family: var(--font-mono);
}

.error-msg {
  color: var(--error);
  font-size: var(--text-sm);
  padding: var(--space-1) 0;
}

.output-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.output-row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.output-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
}
</style>
