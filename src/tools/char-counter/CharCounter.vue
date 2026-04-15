<template>
  <div class="tool-layout">
    <textarea
      v-model="input"
      class="textarea"
      placeholder="输入或粘贴文本..."
      rows="8"
    ></textarea>

    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-value">{{ stats.characters }}</span>
        <span class="stat-label">字符</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.charactersNoSpace }}</span>
        <span class="stat-label">字符(不含空格)</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.words }}</span>
        <span class="stat-label">单词</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.lines }}</span>
        <span class="stat-label">行数</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.bytes }}</span>
        <span class="stat-label">字节(UTF-8)</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.chinese }}</span>
        <span class="stat-label">中文</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.english }}</span>
        <span class="stat-label">英文</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.digits }}</span>
        <span class="stat-label">数字</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.punctuation }}</span>
        <span class="stat-label">标点符号</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.paragraphs }}</span>
        <span class="stat-label">段落</span>
      </div>
    </div>

    <div class="tool-actions">
      <button class="btn btn-secondary" @click="clear">清空</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const input = ref('')

const stats = computed(() => {
  const text = input.value

  if (!text) {
    return {
      characters: 0,
      charactersNoSpace: 0,
      words: 0,
      lines: 0,
      bytes: 0,
      chinese: 0,
      english: 0,
      digits: 0,
      punctuation: 0,
      paragraphs: 0,
    }
  }

  const characters = text.length
  const charactersNoSpace = text.replace(/\s/g, '').length

  // Words: split by whitespace, filter empty
  const words = text.trim() ? text.trim().split(/\s+/).length : 0

  // Lines: count line breaks + 1 (if not empty)
  const lines = text.length > 0 ? text.split('\n').length : 0

  // Bytes (UTF-8)
  const bytes = new TextEncoder().encode(text).length

  // Chinese characters
  const chinese = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length

  // English letters
  const english = (text.match(/[a-zA-Z]/g) || []).length

  // Digits
  const digits = (text.match(/\d/g) || []).length

  // Punctuation (common CJK + ASCII punctuation)
  const punctuation = (text.match(/[^\w\s\u4e00-\u9fff\u3400-\u4dbf]|[_]/g) || []).length

  // Paragraphs: blocks separated by blank lines
  const paragraphs = text.trim()
    ? text.trim().split(/\n\s*\n/).filter((p) => p.trim()).length
    : 0

  return {
    characters,
    charactersNoSpace,
    words,
    lines,
    bytes,
    chinese,
    english,
    digits,
    punctuation,
    paragraphs,
  }
})

function clear() {
  input.value = ''
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-2) var(--space-1);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.stat-value {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
