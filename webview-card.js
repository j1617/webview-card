/*
 * WebView Card for Home Assistant
 * 版本: 1.0.0
 * 支持加载远程网页或本地 HTML 文件，支持 JavaScript 执行
 */

(function () {
  "use strict";

  const VERSION = "1.1.0";

  // 等待 customCardAPI 可用
  const loadCard = () => {
    class WebViewCard extends HTMLElement {
      constructor() {
        super();
        this._card = null;
        this._iframe = null;
      }

      set hass(hass) {
        this._hass = hass;
        if (!this._card) {
          this._build();
        }
      }

      _build() {
        const config = this._config;
        const shadow = this.attachShadow({ mode: "open" });

        // 创建样式
        const style = document.createElement("style");
        style.textContent = `
          ha-card {
            --ha-card-border-radius: 12px;
          }
          iframe {
            width: 100%;
            border: none;
            display: block;
          }
        `;

        // 创建 ha-card
        const card = document.createElement("ha-card");
        card.id = "card";

        // 设置 header
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
          border-radius: 0 0 var(--ha-card-border-radius, 12px) var(--ha-card-border-radius, 12px);
          display: block;
        `;

        // 设置 sandbox 权限
        this._applySandbox();

        // 设置 src
        this._setSrc();

        card.appendChild(this._iframe);
        shadow.appendChild(style);
        shadow.appendChild(card);
        this._card = shadow;
      }

      _applySandbox() {
        const config = this._config;
        const iframe = this._iframe;

        iframe.sandbox.add("allow-same-origin");

        if (config.allow_js !== false) {
          iframe.sandbox.add("allow-scripts");
        }

        if (config.allow_popups) {
          iframe.sandbox.add("allow-popups");
          iframe.sandbox.add("allow-top-navigation");
        }
      }

      _setSrc() {
        const config = this._config;
        let src = "";

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

    // 注册到 customCards 数组
    window.customCards = window.customCards || [];
    window.customCards.push({
      type: "webview-card",
      name: "WebView Card",
      description: "内嵌显示网页或本地 HTML，支持 JavaScript",
      preview: true,
      spec_version: 2,
      version: VERSION,
    });
  };

  // 立即加载
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadCard);
  } else {
    loadCard();
  }
})();
