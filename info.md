# WebView Card

**在 Home Assistant 中内嵌显示网页或本地 HTML 文件，支持 JavaScript 执行。**

![示例](https://raw.githubusercontent.com/qclaw/webview-card/main/example.png)

## 功能

- 🌐 支持加载远程网页 URL
- 📁 支持加载本地 HTML 文件
- ⚡ JavaScript 执行完全支持
- 🎨 支持 hass 变量替换
- 📐 可调节高度和标题

## 安装

**通过 HACS 安装（推荐）：**
1. 打开 HACS → 集成
2. 搜索 "WebView Card"
3. 点击下载

**手动安装：**
1. 下载 release
2. 解压到 `/config/www/community/webview-card/`
3. 添加资源引用

## 使用方法

### 添加资源
在 `configuration.yaml` 中添加：
```yaml
lovelace:
  resources:
    - url: /local/community/webview-card/webview-card.js
      type: module
```

### 加载远程网页
```yaml
type: custom:webview-card
title: 示例网站
url: https://example.com
height: 500px
```

### 加载本地 HTML
```yaml
type: custom:webview-card
title: 本地页面
local_file: my-pages/test.html
height: 600px
```

## 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | string | - | 远程网页 URL |
| `local_file` | string | - | 本地 HTML 文件路径 |
| `title` | string | - | 卡片标题 |
| `height` | string | 400px | 卡片高度 |
| `allow_js` | boolean | true | 允许 JavaScript |
| `allow_popups` | boolean | false | 允许弹窗 |
