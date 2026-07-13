/*
 * WebView Card for Home Assistant
 * 版本: 1.0.0
 * 支持加载远程网页或本地 HTML 文件，支持 JavaScript 执行
 */

(function () {
  "use strict";

  const VERSION = "1.0.0";

  // 注册卡片（HA 规范要求）
  if (!customCards) customCards = [];
  customCards.push({
    type: "webview-card",
    name: "WebView Card",
    description: "在 HA 中内嵌显示网页或本地 HTML，支持 JavaScript 执行",
    preview: true,
    spec_version: 2,
    version: VERSION,
    stack_type: "vertical",
  });

  class WebViewCard extends HTMLElement {
    set hass(hass) {
      this._hass = hass;
      if (!this._card) {
        this._build();
      }
    }

    _build() {
      const config = this._config;

      // 创建 ha-card
      const card = document.createElement("ha-card");
      if (config.title) {
        const header = document.createElement("div");
        header.slot = "header";
        header.textContent = config.title;
        card.appendChild(header);
      }

      // 创建 iframe
      this._iframe = document.createElement("iframe");
      this._iframe.id = "webview-iframe";
      this._iframe.setAttribute("allow", "fullscreen");

      const height = config.height || "400px";
      const borderRadius = "var(--ha-card-border-radius, 12px)";

      this._iframe.style.cssText = `
        width: 100%;
        height: ${height};
        border: none;
        border-radius: 0 0 ${borderRadius} ${borderRadius};
        display: block;
        box-sizing: border-box;
      `;

      // 设置 sandbox 权限
      this._applySandbox();

      // 设置 src
      this._setSrc();

      card.appendChild(this._iframe);
      this.appendChild(card);
      this._card = card;
    }

    _applySandbox() {
      const config = this._config;
      const iframe = this._iframe;

      // 基础权限：允许同源
      iframe.sandbox.add("allow-same-origin");

      // 允许 JS 执行（默认开启）
      if (config.allow_js !== false) {
        iframe.sandbox.add("allow-scripts");
      }

      // 允许弹窗
      if (config.allow_popups) {
        iframe.sandbox.add("allow-popups");
        iframe.sandbox.add("allow-top-navigation");
      }
    }

    _setSrc() {
      const config = this._config;
      let src = "";

      // 优先级：local_file > url > entity
      if (config.local_file) {
        src = config.local_file;
        if (!src.startsWith("/") && !src.startsWith("http")) {
          src = "/local/" + src;
        }
      } else if (config.url) {
        src = config.url;
      } else if (config.entity) {
        const state = this._hass?.states?.[config.entity];
        if (state) {
          src = state.state;
        }
      }

      // 变量替换
      if (src && this._hass) {
        src = src.replace(/\{\{(\w+)\}\}/g, (_, entityId) => {
          const state = this._hass!.states[entityId];
          return state ? state.state : _;
        });
        src = src.replace(/\{\{hass\.states\."([^"]+)"\}\}/g, (_, entityId) => {
          const state = this._hass!.states[entityId];
          return state ? state.state : _;
        });
        src = src.replace(/\{\{hass\.states\.'([^']+)'\}\}/g, (_, entityId) => {
          const state = this._hass!.states[entityId];
          return state ? state.state : _;
        });
      }

      if (src) {
        this._iframe.src = src;
      }
    }

    setConfig(config) {
      if (!config.url && !config.local_file && !config.entity) {
        throw new Error("WebView Card: 需要提供 url、local_file 或 entity 配置");
      }
      this._config = {
        height: "400px",
        allow_js: true,
        allow_popups: false,
        ...config,
      };
    }

    getCardSize() {
      const h = this._config?.height || "400px";
      return Math.ceil(parseInt(h) / 50) + 1;
    }

    static getStubArea() {
      return { height: 3 };
    }
  }

  customElements.define("webview-card", WebViewCard);
})();
