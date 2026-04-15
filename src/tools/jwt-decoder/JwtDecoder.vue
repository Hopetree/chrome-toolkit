<template>
  <div class="tool-layout">
    <textarea
      v-model="input"
      class="textarea"
      placeholder="粘贴 JWT Token..."
      rows="4"
    ></textarea>

    <div class="tool-actions">
      <button class="btn btn-primary" @click="decode">解析</button>
      <button class="btn btn-secondary" @click="clear">清空</button>
    </div>

    <template v-if="decoded">
      <div class="section-title">Header</div>
      <div class="code-output">
        <pre class="json-pre">{{ formatJson(decoded.header) }}</pre>
        <button class="btn btn-secondary btn-sm copy-btn" @click="copy(decoded.headerRaw)">复制</button>
      </div>

      <div class="section-title">Payload</div>
      <div class="code-output">
        <pre class="json-pre">{{ formatJson(decoded.payload) }}</pre>
        <button class="btn btn-secondary btn-sm copy-btn" @click="copy(decoded.payloadRaw)">复制</button>
      </div>

      <div v-if="decoded.expiresAt !== null" class="expire-info" :class="decoded.isExpired ? 'expired' : 'valid'">
        {{ decoded.isExpired ? '已过期' : '未过期' }} · {{ formatTime(decoded.expiresAt) }}
      </div>

      <div v-if="decoded.issuedAt" class="meta-row">
        <span class="meta-label">签发时间</span>
        <span class="meta-value">{{ formatTime(decoded.issuedAt) }}</span>
      </div>
      <div v-if="decoded.notBefore" class="meta-row">
        <span class="meta-label">生效时间</span>
        <span class="meta-value">{{ formatTime(decoded.notBefore) }}</span>
      </div>

      <div class="section-title">Signature</div>
      <div class="code-output signature-block">
        <span class="sig-algorithm">{{ decoded.header?.alg || '未知' }}</span>
        <span class="sig-value">{{ decoded.signature }}</span>
      </div>
    </template>

    <div v-if="error" class="error-msg">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/shared/useToast'
import { copyToClipboard } from '@/shared/clipboard'
import { decodeJwt } from './jwt'
import type { DecodedJwt } from './jwt'

const input = ref('')
const error = ref('')
const toast = useToast()

const decoded = ref<DecodedJwt | null>(null)

function formatJson(obj: any): string {
  return JSON.stringify(obj, null, 2)
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}

function decode() {
  error.value = ''
  decoded.value = null

  const token = input.value.trim()
  if (!token) return

  try {
    decoded.value = decodeJwt(token)
  } catch (e: any) {
    error.value = e.message || '解析失败，请检查 JWT 格式是否正确'
  }
}

async function copy(text: string) {
  const ok = await copyToClipboard(text)
  if (ok) {
    toast('已复制')
  }
}

function clear() {
  input.value = ''
  error.value = ''
  decoded.value = null
}
</script>

<style scoped>
.section-title {
  margin-top: var(--space-3);
}

.code-output {
  position: relative;
  min-height: 48px;
}

.json-pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: var(--text-sm);
}

.error-msg {
  padding: var(--space-2) var(--space-3);
  background-color: #fef2f2;
  color: var(--error);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.expire-info {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  text-align: center;
}

.expire-info.valid {
  background-color: #f0fdf4;
  color: #16a34a;
}

.expire-info.expired {
  background-color: #fef2f2;
  color: #dc2626;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
}

.meta-label {
  color: var(--text-muted);
}

.meta-value {
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.signature-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.sig-algorithm {
  flex-shrink: 0;
  padding: 2px var(--space-2);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-secondary);
}

.sig-value {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: rtl;
  text-align: left;
}
</style>
