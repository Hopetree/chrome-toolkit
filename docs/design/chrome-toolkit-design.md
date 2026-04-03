# Chrome Toolkit 设计文档

## 1. 项目概述

Chrome Toolkit 是一个 Chrome 扩展（Manifest V3），为开发者提供常用的编码/格式化类工具。以 Popup 为唯一交互形态，即开即用，无需离开当前页面。

- **扩展类型**：Chrome Extension（Manifest V3）
- **交互形态**：纯 Popup 模式（400px 宽，最大 580px 高）
- **技术栈**：Vue 3 + TypeScript + Vite + @crxjs/vite-plugin
- **视觉风格**：现代浅色极简
- **外部依赖**：无（纯前端计算，不调用任何外部 API）

## 2. 架构设计

### 2.1 整体结构

Popup 内使用 Vue Router（`createMemoryHistory`）管理两个层级：

- **首页**（`/`）：工具卡片网格，支持搜索（`/` 快捷键聚焦）和分类筛选
- **工具页**（`/tool/:id`）：每个工具独立路由页面，内联在 Popup 中渲染

### 2.2 工具注册机制

每个工具通过统一的配置接口注册：

```typescript
interface ToolConfig {
  id: string            // 唯一标识，如 "json-formatter"
  name: string          // 显示名称
  description: string   // 简短描述
  category: Category    // 所属分类
  icon: string          // 图标名称
  component: () => Promise<any>  // 异步加载的工具组件
  keywords: string[]    // 搜索关键词
}

type Category =
  | 'encode-decode'     // 编码/解码
  | 'format'            // 格式化
  | 'generator'         // 生成器
  | 'convert'           // 转换
  | 'crypto'            // 加密/哈希
  | 'regex'             // 正则
```

新增工具只需：添加 Vue 组件 + 在 `_registry.ts` 中添加一条配置，无需改动框架代码。

### 2.3 数据持久化

使用 `chrome.storage.local`（通过 `src/shared/storage.ts` 封装）存储用户偏好。

### 2.4 目录结构

```
src/
  popup/                 # Popup 入口
    App.vue              # 根组件，提供 Toast
    main.ts              # 应用入口
    router/              # Vue Router 配置
    views/
      Home.vue           # 工具首页（搜索 + 分类卡片网格）
      ToolPage.vue       # 工具页面容器（动态加载工具组件）
    components/
      Toast.vue          # 全局 Toast 提示
  tools/                 # 工具实现（每个工具一个目录）
    _registry.ts         # 工具注册表 + 分类元数据
    base64/Base64.vue
    url-encoder/UrlEncoder.vue
    unicode/Unicode.vue
    json-formatter/JsonFormatter.vue
    xml-formatter/XmlFormatter.vue
    uuid/UuidGenerator.vue
    password/PasswordGenerator.vue
    lorem-ipsum/LoremIpsum.vue
    timestamp/TimestampConverter.vue
    radix/RadixConverter.vue
    hash/HashCalculator.vue
    regex-tester/RegexTester.vue
  shared/                # 共享模块
    types.ts             # ToolConfig、Category、CATEGORY_LABELS、CATEGORY_ORDER
    storage.ts           # chrome.storage 封装
    clipboard.ts         # copyToClipboard 工具函数
    useToast.ts          # useToast 组合式函数
  styles/
    variables.css        # CSS 变量（配色、间距、字号、圆角）
    base.css             # 基础样式重置 + 全局滚动条
    components.css       # 通用组件样式（按钮、输入框、卡片、Toast 等）
public/
  icons/                 # 扩展图标（16/48/128px）
  manifest.json          # 由 vite.config.ts 引用
src/
  manifest.json          # Chrome Extension 清单
  popup.html             # Popup 入口 HTML
```

### 2.5 构建配置

- **构建工具**：Vite
- **插件**：`@crxjs/vite-plugin`（Manifest V3，支持 HMR）
- **样式方案**：纯 CSS + CSS Variables，不引入 UI 框架
- **路径别名**：`@/` → `src/`
- **代码规范**：TypeScript strict 模式

## 3. 工具清单（12 个）

### 3.1 编码/解码（encode-decode）

| 工具 | ID | 功能 |
|------|----|------|
| Base64 编解码 | `base64` | 文本 ↔ Base64 互转，支持中文（UTF-8），粘贴自动识别编解码方向 |
| URL 编解码 | `url-encoder` | URL 编码/解码（encodeURIComponent） |
| Unicode 转换 | `unicode` | 文本 ↔ Unicode 转义序列互转（支持 BMP `\uXXXX` 和补充平面 `\u{XXXXX}`） |

**编码类工具通用按钮**：编码/解码（或转义/还原）、交换（浅黄色 `btn-swap`）、清空

### 3.2 格式化（format）

| 工具 | ID | 功能 |
|------|----|------|
| JSON 格式化 | `json-formatter` | JSON 美化（2 空格缩进）/压缩/校验，语法高亮，错误提示，显示字节数和行数 |
| XML 格式化 | `xml-formatter` | XML 美化/压缩，基础标签校验（栈检测未闭合标签） |

**格式化工具通用按钮**：格式化、压缩、清空

### 3.3 生成器（generator）

| 工具 | ID | 功能 |
|------|----|------|
| UUID 生成器 | `uuid` | 生成 UUID v4，支持批量生成（1-20 个），每个可单独复制，一键复制全部 |
| 密码生成器 | `password` | 滑块/数字输入控制长度（4-64），可切换大小写/数字/符号，可视化强度指示条，首次加载自动生成 |
| Lorem Ipsum | `lorem-ipsum` | 类型切换（段落/句子/单词），数量输入（1-20），内置拉丁词库 |

### 3.4 转换（convert）

| 工具 | ID | 功能 |
|------|----|------|
| 时间戳转换 | `timestamp` | 实时显示当前时间戳（可切换秒/毫秒），时间戳↔日期时间双向转换，统一 `YYYY-MM-DD HH:mm:ss` 格式 |
| 进制转换 | `radix` | 单输入自动转换为二进制/八进制/十进制/十六进制，支持 `0b`/`0o`/`0x` 前缀自动识别 |

### 3.5 加密/哈希（crypto）

| 工具 | ID | 功能 |
|------|----|------|
| 哈希计算 | `hash` | MD5（内联实现）/SHA-1/SHA-256（Web Crypto API），算法切换按钮 |

### 3.6 正则（regex）

| 工具 | ID | 功能 |
|------|----|------|
| 正则测试器 | `regex-tester` | 实时匹配高亮，显示匹配计数和捕获组，常用模板（邮箱/手机号/URL/IP地址），标志说明 |

## 4. 前端设计规范

### 4.1 设计语言

现代浅色极简风格。白色底色、圆角卡片、微妙动效、清晰层次。所有样式通过 CSS 变量统一管理，不引入 UI 框架。

### 4.2 配色

```
背景层次：
  --bg-primary:     #ffffff    /* 主背景 */
  --bg-secondary:   #f5f5f5    /* 卡片/面板/次级元素 */
  --bg-tertiary:    #ffffff    /* 输入框/代码区 */

前景层次：
  --text-primary:   #171717    /* 主文本 */
  --text-secondary: #525252    /* 次要文本 */
  --text-muted:     #737373    /* 占位符/禁用 */

交互色：
  --accent:         #3b82f6    /* 强调色（按钮、链接、选中态） */
  --accent-hover:   #2563eb    /* 强调色 hover */

语义色：
  --success:        #16a34a    /* 成功 */
  --error:          #dc2626    /* 错误 */
  --warning:        #d97706    /* 警告 */

边框：
  --border:         #e5e5e5    /* 默认边框 */
  --border-focus:   #3b82f6    /* 聚焦边框 */
```

### 4.3 排版

```
字体栈：
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif
  --font-mono: "SF Mono", "Fira Code", "Cascadia Code", Consolas, monospace

字号体系：
  --text-xs:   11px    /* 标签、辅助信息、标志说明 */
  --text-sm:   12px    /* 代码、次要文本、select 选项 */
  --text-base: 13px    /* 正文 */
  --text-lg:   14px    /* 标题、工具页头部 */
  --text-xl:   16px    /* 页面大标题 */

字重：
  normal (400)  — 正文
  medium (500)  — 按钮、强调文本
  semibold (600) — 导航、分类标题

行高：1.5（正文），1.4（标题）
```

### 4.4 间距与圆角

```
间距体系（4px 基准网格）：
  --space-1:  4px
  --space-2:  8px
  --space-3:  12px
  --space-4:  16px
  --space-5:  20px
  --space-6:  24px
  --space-8:  32px

圆角：
  --radius-sm:  4px    /* 小元素 */
  --radius-md:  8px    /* 卡片、输入框、按钮 */
  --radius-lg:  12px   /* 大容器 */
```

### 4.5 组件规范

**按钮（`.btn`）**：
- 高度 32px（`.btn-sm` 28px），内边距 0 12px
- `.btn-primary`：`--accent` 填充，白色文本，hover 变深
- `.btn-secondary`：`--bg-secondary` 填充 + `--border` 边框
- `.btn-swap`：浅黄色（`#fef3c7` 背景，`#92400e` 文字，`#fde68a` 边框）
- hover：`translateY(-1px)`，150ms ease

**输入框（`.input`）**：
- 高度 36px，`--bg-tertiary` 背景，`--border` 边框
- 聚焦时边框变为 `--border-focus`，无 box-shadow
- 占位符颜色 `--text-muted`

**文本域（`.textarea`）**：
- 最小高度 80px，可拖拽调整
- 等宽字体，`--text-sm` 字号
- 边框/聚焦行为同输入框

**Select（`.select`）**：
- 高度 32px（紧凑型 32px / 标准型 36px）
- `--bg-secondary` 背景，`--border` 边框

**卡片（`.card`）**：
- `--bg-secondary` 背景，`--radius-md` 圆角，无边框
- hover：`translateY(-1px)` + 淡阴影（`rgba(0,0,0,0.08)`），200ms ease

**代码输出区（`.code-output`）**：
- `--bg-tertiary` 背景 + `--border` 边框，`--radius-sm` 圆角
- 等宽字体，`--text-sm` 字号
- 自定义滚动条（6px，与全局一致）
- 右上角复制按钮（绝对定位）

**Toast 提示**：
- 固定在 Popup 底部居中
- 深色半透明背景（`rgba(0,0,0,0.75)`），白色文字，圆角
- 入场：200ms ease-out 滑入 + 淡入
- 退场：150ms ease-in 滑出 + 淡出
- 自动 2 秒后消失

**分类标题（`.section-title`）**：
- `--text-xs`，`--text-muted` 颜色，600 字重，大写，0.5px 字间距

### 4.6 JSON 语法高亮配色

```
.json-key:    #2563eb  /* 键名 - 蓝色 */
.json-string: #16a34a  /* 字符串 - 绿色 */
.json-number: #d97706  /* 数字 - 橙色 */
.json-boolean: #9333ea  /* 布尔值 - 紫色 */
.json-null:   var(--text-muted)  /* null - 灰色 */
```

### 4.7 Popup 容器

```
宽度：  400px（固定）
高度：  自适应内容，最小 200px，最大 580px
内边距：16px
滚动条：6px 宽，transparent 轨道，--border 色滑块，3px 圆角
```

### 4.8 首页布局

- 标题栏：扩展名称（`--text-xl`）+ 版本号（`--text-xs`，`--text-muted`）
- 搜索框：`/` 快捷键聚焦，实时过滤工具名称/描述/关键词
- 工具按分类分组，每组显示分类标题
- 每个工具显示为卡片：图标 + 名称 + 简短描述
- 卡片网格：3 列布局
- 分类间距：16px（`--space-4`），搜索框到第一个分类：8px（`--space-2`）

### 4.9 工具页布局

- 顶部：返回箭头 + 工具图标 + 工具名称，hover 变色
- 编码/解码类：输入区 → 操作按钮（编码、解码、交换、清空）→ 输出区
- 格式化类：输入区 → 操作按钮（格式化、压缩、清空）→ 输出区
- 生成器/转换类：各工具自定义布局，统一使用 `.tool-layout` 容器

### 4.10 交互动效

| 场景 | 动效 |
|------|------|
| 卡片 hover | `translateY(-1px)` + 淡阴影，200ms ease |
| 按钮 hover | `translateY(-1px)`，150ms ease |
| 页面切换（首页↔工具页） | 无动画，直接替换，保持即时感 |
| Toast 出现 | 底部滑入 + 淡入，200ms ease-out |
| Toast 消失 | 向下滑出 + 淡出，150ms ease-in |
| 复制成功 | Toast 提示"已复制" |
