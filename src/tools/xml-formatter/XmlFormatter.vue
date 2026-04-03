<template>
  <div class="tool-layout">
    <textarea
      v-model="input"
      class="textarea"
      placeholder="输入 XML 字符串..."
      rows="8"
    ></textarea>

    <div class="tool-actions">
      <button class="btn btn-primary" @click="format">格式化</button>
      <button class="btn btn-primary" @click="minify">压缩</button>
      <button class="btn btn-secondary" @click="clear">清空</button>
    </div>

    <div v-if="error" class="error-msg">{{ error }}</div>

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

const input = ref('')
const formatted = ref('')
const error = ref('')
const toast = useToast()

const byteSize = computed(() => new Blob([formatted.value]).size)

const lineCount = computed(() => formatted.value.split('\n').length)

function format() {
  if (!input.value.trim()) {
    clear()
    return
  }

  try {
    const xml = input.value.trim()
    const validationError = validateXml(xml)
    if (validationError) {
      error.value = validationError
      formatted.value = ''
      return
    }
    formatted.value = beautifyXml(xml)
    error.value = ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'XML 格式无效'
    formatted.value = ''
  }
}

function minify() {
  if (!input.value.trim()) {
    clear()
    return
  }

  try {
    const xml = input.value.trim()
    const validationError = validateXml(xml)
    if (validationError) {
      error.value = validationError
      formatted.value = ''
      return
    }
    formatted.value = xml.replace(/>\s+</g, '><').trim()
    error.value = ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'XML 格式无效'
    formatted.value = ''
  }
}

function clear() {
  input.value = ''
  formatted.value = ''
  error.value = ''
}

function validateXml(xml: string): string | null {
  const tagStack: string[] = []
  const tagRegex = /<\/?([a-zA-Z_][\w\-.:]*)[^>]*\/?>/g
  let match: RegExpExecArray | null

  while ((match = tagRegex.exec(xml)) !== null) {
    const fullTag = match[0]
    const tagName = match[1]

    if (fullTag.startsWith('<?') || fullTag.startsWith('<!')) {
      continue
    }

    // Self-closing tag
    if (fullTag.endsWith('/>')) {
      continue
    }

    // Closing tag
    if (fullTag.startsWith('</')) {
      if (tagStack.length === 0 || tagStack.pop() !== tagName) {
        return `XML 标签不匹配: </${tagName}>`
      }
    } else {
      // Opening tag
      tagStack.push(tagName)
    }
  }

  if (tagStack.length > 0) {
    return `XML 标签未闭合: <${tagStack[tagStack.length - 1]}>`
  }

  return null
}

function beautifyXml(xml: string): string {
  const indent = '  '
  let formatted = ''
  let level = 0
  let i = 0

  while (i < xml.length) {
    // Skip whitespace
    if (/\s/.test(xml[i])) {
      i++
      continue
    }

    // XML declaration or CDATA or comments
    if (xml.startsWith('<?', i) || xml.startsWith('<![', i)) {
      let end = xml.indexOf('?>', i)
      if (end === -1) {
        end = xml.indexOf(']]>', i)
        if (end === -1) break
        end += 2
      } else {
        end += 1
      }
      formatted += '  '.repeat(level) + xml.substring(i, end + 1) + '\n'
      i = end + 1
      continue
    }

    // Closing tag
    if (xml.startsWith('</', i)) {
      const end = xml.indexOf('>', i)
      if (end === -1) break
      level = Math.max(0, level - 1)
      formatted += '  '.repeat(level) + xml.substring(i, end + 1) + '\n'
      i = end + 1
      continue
    }

    // Opening tag (may have inline content)
    const tagEnd = xml.indexOf('>', i)
    if (tagEnd === -1) break

    const tagContent = xml.substring(i, tagEnd + 1)
    const isSelfClosing = tagContent.endsWith('/>')

    if (!isSelfClosing) {
      // Check if there's text content before the closing tag
      const closeIdx = findClosingTag(xml, i, tagEnd)
      if (closeIdx !== -1) {
        const inner = xml.substring(tagEnd + 1, closeIdx).trim()
        if (inner && !inner.startsWith('<')) {
          // Inline content (text between tags)
          formatted += '  '.repeat(level) + tagContent + inner + xml.substring(closeIdx) + '\n'
          i = closeIdx + xml.substring(closeIdx).indexOf('>') + 1
          continue
        }
      }
    }

    formatted += '  '.repeat(level) + tagContent + '\n'
    if (!isSelfClosing) {
      level++
    }
    i = tagEnd + 1
  }

  return formatted.trimEnd()
}

function findClosingTag(
  xml: string,
  openStart: number,
  openEnd: number
): number {
  const tagMatch = xml.substring(openStart, openEnd + 1).match(/<([a-zA-Z_][\w\-.:]*)/)
  if (!tagMatch) return -1
  const tagName = tagMatch[1]
  const closingTag = `</${tagName}>`
  return xml.indexOf(closingTag, openEnd + 1)
}

async function copy() {
  const ok = await copyToClipboard(formatted.value)
  if (ok) {
    toast('已复制')
  }
}
</script>

<style scoped>
.error-msg {
  color: var(--error);
  font-size: 13px;
  padding: 6px 0;
  word-break: break-all;
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
  font-size: 13px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  overflow-x: auto;
  white-space: pre;
  line-height: 1.5;
  max-height: 400px;
  overflow-y: auto;
}

.copy-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
}

.stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
  padding-top: 4px;
}
</style>
