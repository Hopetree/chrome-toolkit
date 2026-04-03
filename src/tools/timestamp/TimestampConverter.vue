<template>
  <div class="tool-layout">
    <!-- 当前时间戳 -->
    <div class="section">
      <div class="section-label">当前时间戳</div>
      <div class="row">
        <select v-model="currentUnit" class="select unit-select">
          <option value="ms">毫秒 (ms)</option>
          <option value="s">秒 (s)</option>
        </select>
        <input class="input mono" :value="currentTimestamp" readonly />
        <button class="btn btn-primary btn-sm" @click="copy(currentTimestamp)">复制</button>
      </div>
    </div>

    <!-- 时间戳转日期时间 -->
    <div class="section">
      <div class="section-label">时间戳 → 日期时间</div>
      <div class="row">
        <input
          v-model="tsInput"
          class="input"
          placeholder="请输入时间戳"
          @keyup.enter="convertTs2Date"
        />
        <select v-model="tsUnit" class="select unit-select-sm">
          <option value="ms">毫秒</option>
          <option value="s">秒</option>
        </select>
        <button class="btn btn-primary" @click="convertTs2Date">转换</button>
      </div>
      <div v-if="dateOutput" class="row result-row">
        <input class="input mono result-input" :value="dateOutput" readonly />
        <button class="btn btn-primary btn-sm" @click="copy(dateOutput)">复制</button>
      </div>
    </div>

    <!-- 日期时间转时间戳 -->
    <div class="section">
      <div class="section-label">日期时间 → 时间戳</div>
      <div class="row">
        <input
          v-model="dateInput"
          class="input"
          placeholder="2025-05-19 11:15:51"
          @keyup.enter="convertDate2Ts"
        />
        <select v-model="dtUnit" class="select unit-select-sm">
          <option value="ms">毫秒</option>
          <option value="s">秒</option>
        </select>
        <button class="btn btn-primary" @click="convertDate2Ts">转换</button>
      </div>
      <div v-if="dtError" class="error-text">{{ dtError }}</div>
      <div v-if="tsOutput" class="row result-row">
        <input class="input mono result-input" :value="tsOutput" readonly />
        <button class="btn btn-primary btn-sm" @click="copy(tsOutput)">复制</button>
      </div>
    </div>

    <div class="footer-note">时间戳是表示某一时刻距离 1970-01-01 00:00:00 (UTC) 经过的总秒数或毫秒数。</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from '@/shared/useToast'
import { copyToClipboard } from '@/shared/clipboard'

const toast = useToast()

const currentUnit = ref<'ms' | 's'>('ms')
const currentTsRaw = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const currentTimestamp = computed(() =>
  currentUnit.value === 's'
    ? Math.floor(currentTsRaw.value / 1000).toString()
    : currentTsRaw.value.toString()
)

onMounted(() => {
  timer = setInterval(() => { currentTsRaw.value = Date.now() }, 1000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

const tsInput = ref('')
const tsUnit = ref<'ms' | 's'>('ms')
const dateOutput = ref('')

function convertTs2Date() {
  const raw = tsInput.value.trim()
  if (!raw) { dateOutput.value = ''; return }
  const num = Number(raw)
  if (isNaN(num)) { toast('请输入有效的数字时间戳'); dateOutput.value = ''; return }
  const ms = tsUnit.value === 's' ? num * 1000 : num
  const d = new Date(ms)
  if (isNaN(d.getTime())) { toast('无效的时间戳'); dateOutput.value = ''; return }
  dateOutput.value = formatDate(d)
}

const dateInput = ref('')
const dtUnit = ref<'ms' | 's'>('ms')
const tsOutput = ref('')
const dtError = ref('')

function convertDate2Ts() {
  dtError.value = ''
  const raw = dateInput.value.trim()
  if (!raw) { tsOutput.value = ''; return }
  // 手动解析 YYYY-MM-DD HH:mm:ss 或 YYYY/MM/DD HH:mm:ss
  const match = raw.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/)
  let d: Date
  if (match) {
    d = new Date(+match[1], +match[2] - 1, +match[3], +match[4], +match[5], +match[6])
  } else {
    d = new Date(raw)
  }
  if (isNaN(d.getTime())) {
    dtError.value = '请输入有效的日期时间，如 2025-05-19 11:15:51'
    tsOutput.value = ''
    return
  }
  tsOutput.value = dtUnit.value === 's'
    ? Math.floor(d.getTime() / 1000).toString()
    : d.getTime().toString()
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

async function copy(text: string) {
  const ok = await copyToClipboard(text)
  if (ok) toast('已复制')
}
</script>

<style scoped>
.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.section-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.row .input {
  flex: 1;
  min-width: 0;
}

.result-row {
  margin-top: var(--space-1);
}

.result-input {
  color: var(--accent);
}

.select {
  height: 32px;
  padding: 0 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  outline: none;
  cursor: pointer;
  flex-shrink: 0;
}

.select:focus {
  border-color: var(--border-focus);
}

.unit-select {
  width: 92px;
}

.unit-select-sm {
  width: 56px;
}

.mono {
  font-family: var(--font-mono);
  font-weight: 500;
}

.footer-note {
  margin-top: var(--space-4);
  font-size: var(--text-xs);
  color: var(--text-muted);
  line-height: 1.5;
}

.error-text {
  color: var(--error);
  font-size: var(--text-xs);
  margin-top: var(--space-1);
}
</style>
