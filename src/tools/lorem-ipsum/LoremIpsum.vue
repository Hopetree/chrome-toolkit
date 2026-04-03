<template>
  <div class="tool-layout">
    <div class="tool-actions">
      <div class="type-selector">
        <button
          v-for="opt in typeOptions"
          :key="opt.value"
          class="btn btn-secondary btn-sm"
          :class="{ active: type === opt.value }"
          @click="type = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
      <div class="count-input">
        <input
          type="number"
          v-model.number="count"
          min="1"
          max="20"
          class="num-input"
        />
      </div>
      <button class="btn btn-primary" @click="generate">生成</button>
    </div>

    <div v-if="output" class="output-wrapper">
      <div class="output-area">{{ output }}</div>
      <button class="btn btn-secondary btn-sm copy-btn" @click="copy">
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

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
]

type GenType = 'paragraph' | 'sentence' | 'word'

const typeOptions: { label: string; value: GenType }[] = [
  { label: '段落', value: 'paragraph' },
  { label: '句子', value: 'sentence' },
  { label: '单词', value: 'word' },
]

const type = ref<GenType>('paragraph')
const count = ref(3)
const output = ref('')

function randomWords(n: number): string {
  const result: string[] = []
  for (let i = 0; i < n; i++) {
    result.push(WORDS[Math.floor(Math.random() * WORDS.length)])
  }
  // Capitalize first letter of each sentence
  if (result.length > 0) {
    result[0] = result[0].charAt(0).toUpperCase() + result[0].slice(1)
  }
  return result.join(' ')
}

function generateSentence(): string {
  const wordCount = 8 + Math.floor(Math.random() * 12)
  return randomWords(wordCount) + '.'
}

function generateParagraph(): string {
  const sentenceCount = 3 + Math.floor(Math.random() * 4)
  const sentences: string[] = []
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence())
  }
  return sentences.join(' ')
}

function generate() {
  const n = Math.min(Math.max(count.value, 1), 20)
  const parts: string[] = []

  for (let i = 0; i < n; i++) {
    switch (type.value) {
      case 'word':
        parts.push(randomWords(1))
        break
      case 'sentence':
        parts.push(generateSentence())
        break
      case 'paragraph':
        parts.push(generateParagraph())
        break
    }
  }

  if (type.value === 'paragraph') {
    output.value = parts.join('\n\n')
  } else {
    output.value = parts.join(' ')
  }
}

async function copy() {
  const ok = await copyToClipboard(output.value)
  if (ok) toast('已复制')
}
</script>

<style scoped>
.type-selector {
  display: flex;
  gap: 0;
}

.type-selector .btn {
  border-radius: 0;
}

.type-selector .btn:first-child {
  border-radius: 4px 0 0 4px;
}

.type-selector .btn:last-child {
  border-radius: 0 4px 4px 0;
}

.type-selector .btn.active {
  background: var(--text-secondary);
  color: #fff;
  border-color: var(--text-secondary);
}

.count-input {
  margin-left: 12px;
}

.num-input {
  width: 56px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
}

.output-wrapper {
  position: relative;
}

.output-area {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 400px;
  overflow-y: auto;
}

.copy-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
}
</style>
