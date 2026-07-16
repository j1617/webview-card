/*
 * WebView Card for Home Assistant
 * 版本: 1.1.0
 * 支持加载远程网页或本地 HTML 文件，支持 JavaScript 执行
 */

(function () {
  "use strict";

  const VERSION = "1.2.0";

  class WebViewCard extends HTMLElement {
    set hass(hass) {
      this._hass = hass;
      if (!this._built) {
        this._build();
        this._built = true;
      }
    }

    _build() {
      const config = this._config;

      // 创建卡片
      const card = document.createElement("ha-card");
      if (config.title) {
        card.header = config.title;
      }

      // 创建 iframe
      const iframe = document.createElement("iframe");
      iframe.id = "webview-iframe";
      iframe.setAttribute("allow", "fullscreen");

      const height = config.height || "400px";
      iframe.style.cssText = `
        width: 100%;
        height: ${height};
        border: none;
        display: block;
        border-radius: 0 0 12px 12px;
      `;

      // 设置 sandbox
      iframe.sandbox.add("allow-same-origin");
      if (config.allow_js !== false) {
        iframe.sandbox.add("allow-scripts");
      }
      if (config.allow_popups) {
        iframe.sandbox.add("allow-popups");
        iframe.sandbox.add("allow-top-navigation");
      }

      // 设置 src
      let src = "";
      if (config.local_file) {
        src = config.local_file;
        // 确保本地文件路径正确
        if (!src.startsWith("/") && !src.startsWith("http") && !src.startsWith("file://")) {
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
      }

      if (src) {
        iframe.src = src;
      }

      card.appendChild(iframe);
      this.appendChild(card);
      this._card = card;
      this._iframe = iframe;
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

  // 注册卡片
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "webview-card",
    name: "WebView Card",
    description: "内嵌显示网页或本地 HTML，支持 JavaScript",
    preview: true,
    spec_version: 2,
    version: VERSION,
      // v1.2.0: 修复 local_file 显示空白问题，移除 Shadow DOM
  });

  console.log("WebView Card v" + VERSION + " loaded");
})();
