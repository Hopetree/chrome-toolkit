export type Category =
  | 'encode-decode'
  | 'format'
  | 'generator'
  | 'convert'
  | 'crypto'
  | 'regex'

export interface ToolConfig {
  id: string
  name: string
  description: string
  category: Category
  icon: string
  component: () => Promise<any>
  keywords: string[]
}

export const CATEGORY_LABELS: Record<Category, string> = {
  'encode-decode': '编码/解码',
  format: '格式化',
  generator: '生成器',
  convert: '转换',
  crypto: '加密/哈希',
  regex: '正则',
}

export const CATEGORY_ORDER: Category[] = [
  'encode-decode',
  'format',
  'generator',
  'convert',
  'crypto',
  'regex',
]
