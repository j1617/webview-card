/**
 * WebView Card - Home Assistant Custom Card
 * 在 HA 中内嵌网页，支持 JavaScript 执行
 *
 * 安装方法：
 * 1. 将此文件夹复制到 HA 的 www/community/webview-card/ 目录
 * 2. 在 Lovelace 中添加 resources 条目
 * 3. 使用 type: custom:webview-card
 */

import { LovelaceCard, LovelaceCardEditor } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";

export interface WebViewCardConfig {
  type: string;
  title?: string;
  url: string;
  height?: string;
  allow_js?: boolean;
  allow_popups?: boolean;
  entity?: string;
  default_url?: string;
}

const cards: unknown[] = [];

const cardHelpers = await import(
  "/hacsfiles/frontend/frontend-latest/chunk-BFPFK27K.js"
);

cards.push({
  type: "webview",
  name: "WebView Card",
  description: "在 Home Assistant 中内嵌显示任意网页，支持 JavaScript",
  preview: true,
  spec_version: 2,
  stack_type: "vertical",
});

export class WebViewCard extends LitElement {
  private _hass?: HomeAssistant;
  private _config?: WebViewCardConfig;
  private _iframe?: HTMLIFrameElement;

  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    if (!this._iframe) {
      this._build();
    }
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  setConfig(config: WebViewCardConfig): void {
    if (!config.url && !config.entity) {
      throw new Error("需要提供 url 或 entity 配置");
    }
    this._config = {
      height: "400px",
      allow_js: true,
      allow_popups: false,
      ...config,
    };
  }

  private _build(): void {
    this._iframe = document.createElement("iframe");
    this._iframe.id = "webview-iframe";
    this._iframe.style.cssText = `
      width: 100%;
      height: ${this._config?.height || "400px"};
      border: none;
      border-radius: 12px;
      display: block;
    `;
    this._iframe.setAttribute("allow", "fullscreen");
    this._updateSrc();
    this._applySandbox();
    this.requestUpdate();
  }

  private _applySandbox(): void {
    if (!this._iframe) return;
    const iframe = this._iframe;

    if (this._config?.allow_js !== false) {
      iframe.sandbox.add("allow-scripts");
      iframe.sandbox.add("allow-same-origin");
    } else {
      iframe.sandbox.add("allow-same-origin");
    }

    if (this._config?.allow_popups) {
      iframe.sandbox.add("allow-popups");
    }
  }

  private _updateSrc(): void {
    if (!this._iframe || !this._config?.url) return;

    let url = this._config.url;

    // 支持 hass 状态替换
    if (this._hass) {
      url = url.replace(/\{\{(\w+)\}\}/g, (_, entityId: string) => {
        const state = this._hass!.states[entityId];
        return state ? state.state : _;
      });
    }

    this._iframe.src = url;
  }

  protected render(): TemplateResult {
    return html`
      <ha-card .header=${this._config?.title}>
        ${this._iframe}
      </ha-card>
    `;
  }

  getCardSize(): number {
    return this._config?.height
      ? Math.ceil(parseInt(this._config.height) / 50) + 1
      : 9;
  }
}

customElements.define("webview-card", WebViewCard);

// 注册卡片
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "webview",
  name: "WebView Card",
  description: "在 Home Assistant 中内嵌显示任意网页，支持 JavaScript",
  preview: true,
});
