# WebView Card for Home Assistant

在 Home Assistant 中内嵌显示网页，支持 **网页 URL** 和 **本地 HTML 文件** 两种方式，JavaScript 完美执行。

---

## 功能特性

- ✅ 支持加载远程网页 `url: https://example.com`
- ✅ 支持加载本地 HTML 文件 `local_file: /local/my-page.html`
- ✅ 完整 JavaScript 执行支持（默认开启）
- ✅ 支持 hass 变量替换 `{{entity_id}}`
- ✅ 支持 allow-popups 弹窗
- ✅ 可配置高度和标题

---

## 安装方法

### 1. 复制到 HA 配置目录

将整个 `webview-card` 文件夹复制到：

```
/config/www/community/webview-card/
```

### 2. 添加资源引用

**方式 A：UI 配置**
- HA → 仪表板 → 编辑仪表板 → 右上角三个点 → 管理资源
- 点击 "添加资源"
- URL: `/local/community/webview-card/webview-card.js`
- 资源类型: **JavaScript 模块**

**方式 B：编辑 configuration.yaml**
```yaml
lovelace:
  resources:
    - url: /local/community/webview-card/webview-card.js
      type: module
```

---

## 使用方法

### 方式一：加载远程网页

```yaml
type: custom:webview-card
title: 外部网页
url: https://www.example.com
height: 500px
```

### 方式二：加载本地 HTML 文件

```yaml
type: custom:webview-card
title: 本地页面
local_file: /local/my-pages/test.html
height: 500px
```

> 💡 `local_file` 会自动添加 `/local/` 前缀，所以写相对路径即可：
> ```yaml
> local_file: my-pages/test.html   # 实际加载 /local/my-pages/test.html
> ```

### 方式三：使用实体状态作为 URL

```yaml
type: custom:webview-card
title: 动态网页
entity: sensor.web_url
url: "{{sensor.web_url}}"
height: 400px
```

### 方式四：允许弹窗

```yaml
type: custom:webview-card
title: 带弹窗的页面
url: https://example.com
height: 500px
allow_popups: true
```

### 完整配置示例

```yaml
type: custom:webview-card
title: 我的 WebView
url: https://your-page.com
# 或使用本地文件:
# local_file: custom/mypage.html
height: 600px
allow_js: true
allow_popups: false
```

---

## 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | string | **必填** | `custom:webview-card` |
| `title` | string | 无 | 卡片标题 |
| `url` | string | - | 远程网页 URL（二选一） |
| `local_file` | string | - | 本地 HTML 文件路径（二选一） |
| `entity` | string | - | 实体 ID，用于获取 URL |
| `height` | string | `400px` | 卡片高度 |
| `allow_js` | boolean | `true` | 是否允许执行 JavaScript |
| `allow_popups` | boolean | `false` | 是否允许弹窗/跳转 |

> **优先级**: `local_file` > `url` > `entity`

---

## 完整使用示例

### 显示本地网页（推荐）

1. 把 HTML 文件放到 HA 配置目录：
   ```
   /config/www/my-pages/dashboard.html
   ```

2. 卡片配置：
   ```yaml
   type: custom:webview-card
   title: 我的看板
   local_file: my-pages/dashboard.html
   height: 600px
   allow_js: true
   ```

### 嵌入在线工具

```yaml
type: custom:webview-card
title: 在线白板
url: https://excalidraw.com
height: 700px
```

### 嵌入监控画面

```yaml
type: custom:webview-card
title: 摄像头
local_file: camera-view.html
height: 480px
```

---

## 注意事项

### 跨域限制

大多数外部网站会因为 CORS 策略无法被 iframe 嵌入。建议：
- 优先使用 **本地 HTML 文件**（无跨域问题）
- 使用你自己的服务器/网站
- 或通过 Nginx/Caddy 配置代理

### 本地 HTML 文件放置位置

```
/config/www/
├── my-pages/
│   ├── dashboard.html    ← 放在这里
│   ├── widget.html
│   └── monitor.html
└── community/
    └── webview-card/
        └── webview-card.js  ← 插件文件
```

### 安全提示

- `allow_js: true` 允许嵌入的网页执行 JavaScript
- 只在你信任的本地网页上启用
- 避免在未知来源的外部网页上启用

---

## 文件结构

```
www/community/webview-card/
├── webview-card.js      # HA 卡片主文件（引用这个）
├── webview-card.ts      # TypeScript 源码
├── demo.html            # 内置演示页面
└── README.md            # 说明文档
```

---

## 故障排除

### 网页无法加载

1. 检查 URL 是否可访问
2. 确认 CORS 策略允许嵌入
3. 查看浏览器控制台错误信息

### JavaScript 不执行

1. 确保 `allow_js: true`（默认开启）
2. 检查网页本身是否正常执行 JS

### 本地文件 404

1. 确认 HTML 文件已放在 `/config/www/` 目录下
2. 检查路径是否正确（不需要加 `/local/` 前缀）
3. 确认文件权限可读
