/*
 * WebView Card for Home Assistant (简化版)
 * 版本: 1.0.0
 * 直接操作 DOM，不使用 Shadow DOM，兼容性更好
 */

(function () {
  "use strict";

  const VERSION = "1.1.0";

  class WebViewCard extends HTMLElement {
    set hass(hass) {
      this._hass = hass;
      if (!this._iframe) {
        this._build();
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
      this._iframe = document.createElement("iframe");
      this._iframe.id = "webview-iframe";
      this._iframe.setAttribute("allow", "fullscreen");

      const height = config.height || "400px";
      this._iframe.style.cssText = `
        width: 100%;
        height: ${height};
        border: none;
        display: block;
        border-radius: 0 0 12px 12px;
      `;

      // 设置 sandbox
      iframe_sandbox(this._iframe, config);

      // 设置 src
      iframe_src(this._iframe, config, this._hass);

      card.appendChild(this._iframe);
      this.appendChild(card);
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
  }

  function iframe_sandbox(iframe, config) {
    iframe.sandbox.add("allow-same-origin");
    if (config.allow_js !== false) {
      iframe.sandbox.add("allow-scripts");
    }
    if (config.allow_popups) {
      iframe.sandbox.add("allow-popups");
      iframe.sandbox.add("allow-top-navigation");
    }
  }

  function iframe_src(iframe, config, hass) {
    let src = "";

    if (config.local_file) {
      src = config.local_file;
      if (!src.startsWith("/") && !src.startsWith("http")) {
        src = "/local/" + src;
      }
    } else if (config.url) {
      src = config.url;
    } else if (config.entity) {
      const state = hass?.states?.[config.entity];
      if (state) {
        src = state.state;
      }
    }

    // 变量替换
    if (src && hass) {
      src = src.replace(/\{\{(\w+)\}\}/g, (_, entityId) => {
        const state = hass.states[entityId];
        return state ? state.state : _;
      });
    }

    if (src) {
      iframe.src = src;
    }
  }

  // 注册组件
  customElements.define("webview-card", WebViewCard);

  // 注册卡片信息
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "webview-card",
    name: "WebView Card",
    description: "内嵌显示网页或本地 HTML，支持 JavaScript",
    preview: true,
    spec_version: 2,
    version: VERSION,
  });

  console.log("WebView Card v" + VERSION + " 已加载");
})();
