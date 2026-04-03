<template>
  <div class="tool-layout">
    <div class="pattern-row">
      <input
        v-model="pattern"
        class="input pattern-input"
        placeholder="输入正则表达式..."
        spellcheck="false"
      />
      <span class="slash">/</span>
      <input
        v-model="flags"
        class="input flags-input"
        placeholder="g"
        spellcheck="false"
      />
      <span class="slash">/</span>
    </div>

    <div v-if="error" class="regex-error">{{ error }}</div>

    <div class="templates">
      <span class="templates-label">常用模板:</span>
      <button
        v-for="tpl in templates"
        :key="tpl.label"
        class="btn btn-secondary btn-sm"
        @click="applyTemplate(tpl)"
      >
        {{ tpl.label }}
      </button>
    </div>

    <div class="flags-hint">
      <span class="hint-label">标志说明:</span>
      <span><code>g</code> 全局匹配</span>
      <span><code>i</code> 忽略大小写</span>
      <span><code>m</code> 多行模式</span>
      <span><code>s</code> 点匹配换行</span>
      <span><code>u</code> Unicode 模式</span>
    </div>

    <textarea
      v-model="testString"
      class="textarea"
      placeholder="输入测试文本..."
      rows="6"
    ></textarea>

    <div v-if="testString && !error" class="results-section">
      <div class="match-summary">
        共匹配 <strong>{{ matchCount }}</strong> 处
      </div>

      <div v-if="matches.length" class="highlight-area">
        <template v-for="(seg, i) in highlightedSegments" :key="i">
          <span v-if="seg.type === 'text'">{{ seg.value }}</span>
          <mark v-else class="match-highlight">{{ seg.value }}</mark>
        </template>
      </div>

      <div class="match-list">
        <div v-for="(m, idx) in matches" :key="idx" class="match-item">
          <div class="match-header">
            <span class="match-index">#{{ idx + 1 }}</span>
            <span class="match-text">{{ m[0] }}</span>
            <button
              class="btn btn-secondary btn-sm"
              @click="copyMatch(m[0])"
            >
              复制
            </button>
          </div>
          <div v-if="m.length > 1" class="match-groups">
            <div v-for="(group, gi) in m.slice(1)" :key="gi" class="capture-group">
              <span class="group-label">组 {{ gi + 1 }}:</span>
              <span class="group-value">{{ group ?? 'undefined' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToast } from '@/shared/useToast'
import { copyToClipboard } from '@/shared/clipboard'

const toast = useToast()

const pattern = ref('')
const flags = ref('g')
const testString = ref('')
const error = ref('')

interface Template {
  label: string
  pattern: string
}

const templates: Template[] = [
  { label: '邮箱', pattern: '[\\w.-]+@[\\w.-]+\\.\\w+' },
  { label: '手机号', pattern: '1[3-9]\\d{9}' },
  { label: 'URL', pattern: 'https?://[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=%]+' },
  { label: 'IP地址', pattern: '(\\d{1,3}\\.){3}\\d{1,3}' },
]

const matches = ref<RegExpExecArray[]>([])

const matchCount = computed(() => matches.value.length)

const regex = computed<RegExp | null>(() => {
  error.value = ''
  if (!pattern.value) return null
  try {
    const re = new RegExp(pattern.value, flags.value)
    return re
  } catch (e) {
    error.value = (e as Error).message
    return null
  }
})

function runMatch() {
  matches.value = []
  const re = regex.value
  if (!re || !testString.value) return

  const isGlobal = re.global
  let m: RegExpExecArray | null

  if (isGlobal) {
    re.lastIndex = 0
    while ((m = re.exec(testString.value)) !== null) {
      matches.value.push(m)
      if (m[0].length === 0) {
        re.lastIndex++
      }
    }
  } else {
    m = re.exec(testString.value)
    if (m) matches.value.push(m)
  }
}

watch([pattern, flags, testString], runMatch)

interface Segment {
  type: 'text' | 'match'
  value: string
}

const highlightedSegments = computed<Segment[]>(() => {
  if (!regex.value || !testString.value) return []

  const re = regex.value
  const str = testString.value
  const segments: Segment[] = []
  let lastIndex = 0

  // Create a fresh regex to avoid state issues
  const sourceRe = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
  sourceRe.lastIndex = 0

  let m: RegExpExecArray | null
  while ((m = sourceRe.exec(str)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ type: 'text', value: str.slice(lastIndex, m.index) })
    }
    segments.push({ type: 'match', value: m[0] })
    lastIndex = sourceRe.lastIndex
    if (m[0].length === 0) {
      sourceRe.lastIndex++
    }
  }

  if (lastIndex < str.length) {
    segments.push({ type: 'text', value: str.slice(lastIndex) })
  }

  return segments
})

function applyTemplate(tpl: Template) {
  pattern.value = tpl.pattern
  if (!flags.value.includes('g')) {
    flags.value += 'g'
  }
}

async function copyMatch(text: string) {
  const ok = await copyToClipboard(text)
  if (ok) toast('已复制')
}
</script>

<style scoped>
.pattern-row {
  display: flex;
  align-items: center;
  gap: 0;
}

.pattern-input {
  flex: 1;
  border-radius: 6px 0 0 6px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
}

.flags-input {
  width: 56px;
  border-radius: 0 6px 6px 0;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  text-align: center;
}

.slash {
  padding: 0 2px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 16px;
  color: #666;
  flex-shrink: 0;
}

.regex-error {
  color: var(--error);
  font-size: 12px;
  margin-top: 6px;
  word-break: break-all;
}

.templates {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.templates-label {
  font-size: 13px;
  color: #888;
  flex-shrink: 0;
}

.flags-hint {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.hint-label {
  color: var(--text-muted);
  flex-shrink: 0;
}

.flags-hint code {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 0 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--accent);
}

.results-section {
  margin-top: 12px;
}

.match-summary {
  font-size: 13px;
  color: #555;
  margin-bottom: 8px;
}

.match-summary strong {
  color: #333;
}

.highlight-area {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  line-height: 1.6;
  word-break: break-all;
  white-space: pre-wrap;
}

.match-highlight {
  background: rgba(59, 130, 246, 0.2);
  color: var(--accent);
  border-radius: 2px;
  padding: 1px 0;
}

.match-list {
  margin-top: 8px;
}

.match-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 10px;
  margin-bottom: 6px;
}

.match-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-index {
  font-size: 12px;
  color: #999;
  font-weight: 500;
  flex-shrink: 0;
}

.match-text {
  flex: 1;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: #333;
  word-break: break-all;
}

.match-groups {
  margin-top: 6px;
  padding-left: 28px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.capture-group {
  font-size: 12px;
}

.group-label {
  color: #888;
  margin-right: 6px;
}

.group-value {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  color: #555;
}
</style>
