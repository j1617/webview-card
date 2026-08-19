/*
 * WebView Card for Home Assistant
 * 版本: 1.3.3
 * 支持加载远程网页或本地 HTML 文件，支持 JavaScript 执行
 */

const VERSION = "1.3.3";

class WebViewCard extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
  }

  set hass(hass) {
    if (!this._hass) {
      this._hass = hass;
      this._build();
    }
  }

  _build() {
    const config = this._config;
    
    const card = document.createElement("ha-card");
    card.style.overflow = "hidden";
    
    if (config.title) {
      card.header = config.title;
    }

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "width: 100%; height: " + (config.height || "400px") + "; border: none; display: block;";

    let src = "";
    if (config.local_file) {
      src = config.local_file;
      if (src.charAt(0) !== "/" && src.indexOf("http") !== 0) {
        src = "/local/" + src;
      }
    } else if (config.url) {
      src = config.url;
    } else if (config.entity) {
      const state = this._hass && this._hass.states ? this._hass.states[config.entity] : null;
      src = state ? state.state : "";
    }

    if (src && this._hass && this._hass.states) {
      src = src.replace(/\{\{(\w+)\}\}/g, function(match, entityId) {
        const s = this._hass.states[entityId];
        return s ? s.state : match;
      }.bind(this));
    }

    iframe.sandbox.add("allow-same-origin");
    if (config.allow_js !== false) {
      iframe.sandbox.add("allow-scripts");
    }
    if (config.allow_popups) {
      iframe.sandbox.add("allow-popups");
      iframe.sandbox.add("allow-top-navigation-by-user-activation");
    }

    if (src) {
      iframe.src = src;
    }

    card.appendChild(iframe);
    this.appendChild(card);
  }

  setConfig(config) {
    if (!config.url && !config.local_file && !config.entity) {
      throw new Error("WebView Card: 需要提供 url、local_file 或 entity 配置");
    }
    this._config = {};
    for (var key in config) {
      this._config[key] = config[key];
    }
  }

  getCardSize() {
    var h = parseInt(this._config.height) || 400;
    return Math.ceil(h / 50) + 1;
  }
}

// 注册自定义元素
customElements.define("webview-card", WebViewCard);

// 注册到 customCards
if (typeof window.customCards === "undefined") {
  window.customCards = [];
}

window.customCards.push({
  type: "webview-card",
  name: "WebView Card",
  description: "内嵌显示网页或本地 HTML，支持 JavaScript",
  preview: true,
  spec_version: 2,
  version: VERSION,
});

console.log("[WebView Card] v" + VERSION + " loaded");
