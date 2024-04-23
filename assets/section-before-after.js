'use strict'

document.addEventListener("StartAsyncLoading", function(event) {
  class SplitCursor extends HTMLElement {
    constructor() {
      super();
      this._parentSection = null;
      this._dragging = false;
      this._offsetX = 0;
      this._currentX = 0;
      this._initialX = 0;
    }

    connectedCallback() {
      this._parentSection = this.closest(".before-after");
      this._dragging = false;
      this._offsetX = this._currentX = 0;
      this._parentSection.addEventListener("pointerdown", this._onPointerDown.bind(this));
      this._parentSection.addEventListener("pointermove", this._onPointerMove.bind(this));
      this._parentSection.addEventListener("pointerup", this._onPointerUp.bind(this));
    }

    _onPointerDown(event) {
      if (event.target === this || this.contains(event.target)) {
        this._initialX = event.clientX - this._offsetX;
        this._dragging = true;
      }
    }

    _onPointerMove(event) {
      if (!this._dragging) {
        return;
      }
      this._currentX = Math.min(Math.max(event.clientX - this._initialX, this.minOffset), this.maxOffset);
      this._offsetX = this._currentX;
      this._parentSection.style.setProperty("--clip-path-offset", `${this._currentX.toFixed(1)}px`);
    }

    _onPointerUp() {
      this._dragging = false;
    }

    get minOffset() {
      return -this.offsetLeft - (document.dir === "rtl" ? this.clientWidth : 0);
    }
    get maxOffset() {
      return this.offsetParent.clientWidth + this.minOffset;
    }
  }

  if (!window.customElements.get("split-cursor")) {
    window.customElements.define("split-cursor", SplitCursor);
  }
});