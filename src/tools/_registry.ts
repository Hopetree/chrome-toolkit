import type { ToolConfig } from '@/shared/types'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/shared/types'

export { CATEGORY_LABELS, CATEGORY_ORDER }

export const tools: ToolConfig[] = [
  // 编码/解码
  {
    id: 'base64',
    name: 'Base64 编解码',
    description: '文本与 Base64 互转',
    category: 'encode-decode',
    icon: '🔤',
    component: () => import('@/tools/base64/Base64.vue'),
    keywords: ['base64', '编码', '解码', 'encode', 'decode'],
  },
  {
    id: 'url-encoder',
    name: 'URL 编解码',
    description: 'URL 编码与解码',
    category: 'encode-decode',
    icon: '🔗',
    component: () => import('@/tools/url-encoder/UrlEncoder.vue'),
    keywords: ['url', 'uri', 'percent', 'encode', 'decode', '编码', '解码'],
  },
  {
    id: 'unicode',
    name: 'Unicode 转换',
    description: '文本与 Unicode 转义序列互转',
    category: 'encode-decode',
    icon: '🌐',
    component: () => import('@/tools/unicode/Unicode.vue'),
    keywords: ['unicode', 'escape', 'unescape', '转义', '转换'],
  },
  // 格式化
  {
    id: 'json-formatter',
    name: 'JSON 格式化',
    description: 'JSON 美化、压缩与校验',
    category: 'format',
    icon: '{}',
    component: () => import('@/tools/json-formatter/JsonFormatter.vue'),
    keywords: ['json', 'format', 'beautify', 'minify', '格式化', '美化', '压缩'],
  },
  {
    id: 'xml-formatter',
    name: 'XML 格式化',
    description: 'XML 美化与压缩',
    category: 'format',
    icon: '📄',
    component: () => import('@/tools/xml-formatter/XmlFormatter.vue'),
    keywords: ['xml', 'html', 'format', 'beautify', '格式化', '美化', '压缩'],
  },
  {
    id: 'json-yaml',
    name: 'JSON/YAML 互转',
    description: 'JSON 与 YAML 格式互转',
    category: 'format',
    icon: '🔄',
    component: () => import('@/tools/json-yaml/JsonYaml.vue'),
    keywords: ['json', 'yaml', 'convert', '转换', '互转'],
  },
  {
    id: 'sql-formatter',
    name: 'SQL 格式化',
    description: 'SQL 美化与压缩',
    category: 'format',
    icon: '🗃️',
    component: () => import('@/tools/sql-formatter/SqlFormatter.vue'),
    keywords: ['sql', 'format', 'beautify', 'minify', 'mysql', 'postgresql', '格式化', '美化', '压缩'],
  },
  // 生成器
  {
    id: 'uuid',
    name: 'UUID 生成器',
    description: '生成 UUID v4',
    category: 'generator',
    icon: '🆔',
    component: () => import('@/tools/uuid/UuidGenerator.vue'),
    keywords: ['uuid', 'guid', 'random', 'id', '生成'],
  },
  {
    id: 'password',
    name: '密码生成器',
    description: '自定义强度密码生成',
    category: 'generator',
    icon: '🔑',
    component: () => import('@/tools/password/PasswordGenerator.vue'),
    keywords: ['password', 'random', '生成', '密码', '强度'],
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum',
    description: '占位文本生成',
    category: 'generator',
    icon: '📝',
    component: () => import('@/tools/lorem-ipsum/LoremIpsum.vue'),
    keywords: ['lorem', 'ipsum', 'placeholder', 'text', '占位', '文本'],
  },
  // 转换
  {
    id: 'timestamp',
    name: '时间戳转换',
    description: '时间戳与日期互转',
    category: 'convert',
    icon: '🕐',
    component: () => import('@/tools/timestamp/TimestampConverter.vue'),
    keywords: ['timestamp', 'unix', 'date', 'time', '时间戳', '日期', '转换'],
  },
  {
    id: 'radix',
    name: '进制转换',
    description: '2/8/10/16 进制互转',
    category: 'convert',
    icon: '🔢',
    component: () => import('@/tools/radix/RadixConverter.vue'),
    keywords: ['radix', 'binary', 'octal', 'decimal', 'hex', '进制', '二进制', '十六进制'],
  },
  // 加密/哈希
  {
    id: 'hash',
    name: '哈希计算',
    description: 'MD5/SHA-1/SHA-256',
    category: 'crypto',
    icon: '🔐',
    component: () => import('@/tools/hash/HashCalculator.vue'),
    keywords: ['hash', 'md5', 'sha', 'digest', '哈希', '加密'],
  },
  // 正则
  {
    id: 'regex-tester',
    name: '正则测试器',
    description: '正则表达式实时匹配',
    category: 'regex',
    icon: '🔎',
    component: () => import('@/tools/regex-tester/RegexTester.vue'),
    keywords: ['regex', 'regexp', 'match', 'pattern', '正则', '匹配', '测试'],
  },
]
