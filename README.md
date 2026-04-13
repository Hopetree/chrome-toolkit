# Chrome Toolkit

一个 Chrome 浏览器扩展，为开发者提供常用的编码/格式化工具。即开即用，无需离开当前页面。

大部分开发情况下，这个工具并没有用武之地，因为网上有太多类似工具站，甚至你可以在自己的本地执行代码完成部分工作，这个工具的用武之地是纯内网开发场景。

<img width="513" height="573" alt="image" src="https://github.com/user-attachments/assets/f24d3339-e271-41d4-80c4-3be107462ae8" />


## 功能

- **编码/解码**：Base64、URL、Unicode
- **格式化**：JSON（语法高亮）、XML
- **生成器**：UUID、密码（强度指示）、Lorem Ipsum
- **转换**：时间戳、进制、颜色
- **加密/哈希**：MD5、SHA-1、SHA-256
- **正则**：实时匹配测试、常用模板

## 技术栈

Vue 3 + TypeScript + Vite + @crxjs/vite-plugin

## 开发

```bash
npm install
npm run dev
```

在 Chrome 中加载 `dist/` 目录：`chrome://extensions` → 开发者模式 → 加载已解压的扩展程序

## 构建

```bash
npm run build
```

## 许可证

[MIT](./LICENSE)
