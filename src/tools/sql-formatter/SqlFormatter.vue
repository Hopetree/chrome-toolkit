<template>
  <div class="tool-layout">
    <div class="dialect-row">
      <select v-model="dialect" class="select">
        <option value="sql">Standard SQL</option>
        <option value="mysql">MySQL</option>
        <option value="postgresql">PostgreSQL</option>
        <option value="sqlite">SQLite</option>
        <option value="transactsql">SQL Server (T-SQL)</option>
        <option value="plsql">Oracle (PL/SQL)</option>
        <option value="mariadb">MariaDB</option>
        <option value="clickhouse">ClickHouse</option>
        <option value="bigquery">Google BigQuery</option>
        <option value="snowflake">Snowflake</option>
        <option value="hive">Hive</option>
        <option value="spark">Spark SQL</option>
      </select>
    </div>

    <textarea
      v-model="input"
      class="textarea"
      placeholder="输入 SQL 语句..."
      rows="8"
      @paste="onPaste"
    ></textarea>

    <div class="tool-actions">
      <button class="btn btn-primary" @click="format">格式化</button>
      <button class="btn btn-primary" @click="minify">压缩</button>
      <button class="btn btn-secondary" @click="clear">清空</button>
    </div>

    <div v-if="error" class="error-text">{{ error }}</div>

    <div v-if="formatted" class="output-wrapper">
      <pre class="code-output">{{ formatted }}</pre>
      <button class="btn btn-secondary btn-sm copy-btn" @click="copy">复制</button>
    </div>

    <div v-if="formatted" class="stats">
      <span>{{ byteSize }} bytes</span>
      <span>{{ lineCount }} 行</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '@/shared/useToast'
import { copyToClipboard } from '@/shared/clipboard'
import { format as sqlFormat } from 'sql-formatter'

const input = ref('')
const formatted = ref('')
const error = ref('')
const dialect = ref('sql')
const toast = useToast()

const byteSize = computed(() => new Blob([formatted.value]).size)
const lineCount = computed(() => formatted.value.split('\n').length)

function format() {
  if (!input.value.trim()) { clear(); return }
  try {
    formatted.value = sqlFormat(input.value.trim(), {
      language: dialect.value,
      tabWidth: 2,
      keywordCase: 'upper',
    })
    error.value = ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'SQL 格式无效'
    formatted.value = ''
  }
}

function minify() {
  if (!input.value.trim()) { clear(); return }
  try {
    formatted.value = input.value.trim().replace(/\s+/g, ' ').replace(/\s*([,()])\s*/g, '$1')
    error.value = ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'SQL 格式无效'
    formatted.value = ''
  }
}

function clear() {
  input.value = ''
  formatted.value = ''
  error.value = ''
}

function onPaste() {
  setTimeout(() => format(), 0)
}

async function copy() {
  const ok = await copyToClipboard(formatted.value)
  if (ok) toast('已复制')
}
</script>

<style scoped>
.dialect-row {
  display: flex;
  gap: var(--space-2);
}

.select {
  height: 32px;
  padding: 0 var(--space-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  outline: none;
  cursor: pointer;
  width: 100%;
}

.select:focus {
  border-color: var(--border-focus);
}

.error-text {
  color: var(--error);
  font-size: var(--text-xs);
  line-height: 1.5;
}

.output-wrapper {
  position: relative;
}

.copy-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
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

.stats {
  display: flex;
  gap: var(--space-4);
  font-size: var(--text-xs);
  color: var(--text-muted);
  padding-top: var(--space-1);
}
</style>
