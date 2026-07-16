# WebView Card for Home Assistant

[![GitHub Release](https://img.shields.io/github/v/release/qclaw/webview-card?style=flat-square)](https://github.com/qclaw/webview-card/releases)
[![HACS Compatible](https://img.shields.io/badge/HACS-Yes-blue?style=flat-square)](https://hacs.xyz/)
[![License](https://img.shields.io/github/license/qclaw/webview-card?style=flat-square)](LICENSE)

**版本**: 1.2.0

在 Home Assistant 中内嵌显示网页或本地 HTML 文件，支持 JavaScript 完美执行。

---

## 功能特性

- ✅ 支持加载远程网页 URL
- ✅ 支持加载本地 HTML 文件
- ✅ 完整 JavaScript 执行支持（默认开启）
- ✅ 支持 hass 变量替换 `{{entity_id}}`
- ✅ 支持 allow-popups 弹窗
- ✅ 可配置卡片高度和标题

---

## 安装（HACS）

1. 打开 HACS
2. 点击 **集成** → **+**
3. 搜索 **WebView Card**
4. 点击 **下载**

或者手动安装到 `/config/www/community/webview-card/`

---

## 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | string | **必填** | `custom:webview-card` |
| `title` | string | - | 卡片标题 |
| `url` | string | - | 远程网页 URL |
| `local_file` | string | - | 本地 HTML 文件路径 |
| `entity` | string | - | 实体 ID（作为 URL 来源） |
| `height` | string | `400px` | 卡片高度 |
| `allow_js` | boolean | `true` | 允许 JavaScript |
| `allow_popups` | boolean | `false` | 允许弹窗 |

---

## 使用示例

### 加载远程网页

```yaml
type: custom:webview-card
title: 示例网站
url: https://example.com
height: 500px
```

### 加载本地 HTML 文件

```yaml
type: custom:webview-card
title: 本地页面
local_file: my-pages/test.html
height: 600px
```

---

## 添加卡片

1. 编辑仪表板
2. 点击 **添加卡片**
3. 找到 **自定义卡片** → **WebView Card**
4. 配置参数

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `webview-card.js` | 主版本（推荐） |
| `webview-card-legacy.js` | 备选版本（兼容性更好） |

---

## 更新日志

### v1.2.0
- 🐛 修复 local_file 加载本地 HTML 显示空白的问题
- ⚡ 移除 Shadow DOM，改用直接 DOM 操作

### v1.1.0
- 修复卡片在 HA 中找不到的问题
- 优化 Shadow DOM 兼容性
- 新增 `local_file` 参数支持

### v1.0.0
- 初始版本

---

## 常见问题

### Q: 卡片在添加时找不到？

1. 确认资源类型选择 **JavaScript 模块**
2. 清除浏览器缓存（Ctrl+Shift+R）
3. 查看浏览器控制台是否有错误

### Q: 远程网页无法显示？

大多数网站有 X-Frame-Options 安全头限制，无法被嵌入。建议使用**本地 HTML 文件**。

---

## 本地 HTML 示例

创建 `/config/www/demo/test.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: sans-serif; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
  </style>
</head>
<body>
  <h1>🎉 WebView Card Works!</h1>
  <p id="time"></p>
  <script>
    document.getElementById('time').textContent = new Date().toLocaleTimeString();
    setInterval(() => {
      document.getElementById('time').textContent = new Date().toLocaleTimeString();
    }, 1000);
  </script>
</body>
</html>
```
