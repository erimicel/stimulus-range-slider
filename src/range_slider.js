import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["inputMin", "inputMax", "value"];

  static values = {
    theme: { type: String, default: "default" },
    tooltip: { type: Boolean, default: false },
    labels: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    vertical: { type: Boolean, default: false },
    selectedColour: String,
    currency: String,
    values: String,
    step: Number,
    width: String,
  };

  initialize() {
    this.container = this.element;
    this.inputMin = null;
    this.inputMax = null;
    this.slider = null;
    this.selected = null;
    this.pointerL = null;
    this.pointerR = null;
    this.scale = null;
    this.tipL = null;
    this.tipR = null;

    this.sliderWidth = 0;
    this.sliderLeft = 0;
    this.pointerWidth = 0;
    this.stepWidth = 0;
    this.step = 0;
    this.sliderMinValue = 0;
    this.sliderMaxValue = 0;
    this.inputMinValue = 0;
    this.inputMaxValue = 0;
    this.valRange = null;
    this.activePointer = null;
    this.isRange = false;
    this.isDisabled = false;
    this.valuesAreStrings = false;

    this.values = {
      start: null,
      end: null,
      range: [],
    };

    this.themes = {
      default: {
        container: "rs-container",
        background: "rs-bg",
        selected: "rs-selected",
        scale: "rs-scale",
        pointer: "rs-pointer",
        tip: "rs-tooltip",
      },
      "tailwindcss-v4": {
        container: "relative h-10 w-full",
        background: "absolute h-2 w-full bg-gray-200 rounded-lg",
        selected: "absolute h-2 w-full bg-indigo-600 rounded-lg",
        scale:
          "absolute left-0 w-full mt-2 text-xs text-gray-600 cursor-pointer",
        pointer: `absolute cursor-pointer z-10 inline-block size-5 transform rounded-full border border-gray-200
                     bg-white ring-0 shadow-sm transition-transform duration-200 ease-in-out translate-x-5`,
        tip: "bg-gray-800 text-white text-xs px-1 rounded",
      },
    };

    this.klasses = this.themes[this.themeValue];
  }

  connect() {
    this.setInitialValues();
    this.setInputs();
    this.createSlider();
    this.createScale();
    this.setSliders();
    this.addEvents();
  }

  setInitialValues() {
    this.step = Number(this.stepValue || 1);
    this.valRange = this.valuesValue;

    if (this.step <= 0) return;

    if (this.hasInputMinTarget) {
      this.inputMin = this.inputMinTarget;
      this.inputMinValue = Number(this.inputMin.value);
      if (isNaN(this.inputMinValue)) {
        this.inputMinValue = this.inputMin.value;
      }

      if (this.inputMinValue === "") return;
    }

    if (this.hasInputMaxTarget) {
      this.inputMax = this.inputMaxTarget;

      if (this.inputMax.value instanceof String) {
        this.inputMaxValue = this.inputMax.value;
      } else {
        this.inputMaxValue = Number(this.inputMax.value);

        if (this.inputMinValue > this.inputMaxValue) return;
      }
    }

    this.isDisabled = this.disabledValue;
    this.isRange = this.hasInputMaxTarget && this.hasInputMinTarget;

    this.setRangeValues(this.valRange, this.step);

    this.values.start = this.isRange
      ? this.values.range.indexOf(this.inputMinValue)
      : 0;
    this.values.end = this.isRange
      ? this.values.range.indexOf(this.inputMaxValue)
      : this.values.range.indexOf(this.inputMinValue);
  }

  setRangeValues(valueStr, step) {
    if (!valueStr || !step) return;

    try {
      if (valueStr.includes("..")) {
        // Handle "20000..60000" -> Convert to [20000, 60000]
        [this.sliderMinValue, this.sliderMaxValue] = valueStr
          .split("..")
          .map(Number);

        this.values.range = this.parseRange(
          this.sliderMinValue,
          this.sliderMaxValue,
          step
        );
      } else {
        // Handle "[1,2,3,4,5]" -> Convert to [1,2,3,4,5]
        // Handle "['blue', 'red', 'green']" -> Convert to ['blue', 'red', 'green']
        this.values.range = JSON.parse(valueStr);

        if (
          this.values.range.length === 1 ||
          typeof this.values.range[0] === "string"
        ) {
          this.valuesAreStrings = true;
        } else {
          this.values.range = this.values.range.sort(function (a, b) {
            return a - b;
          });

          this.sliderMinValue = this.values.range[0];
          this.sliderMaxValue = this.values.range[this.values.range.length - 1];

          if (this.step > 1) {
            this.values.range = this.parseRange(
              this.sliderMinValue,
              this.sliderMaxValue,
              step
            );
          }
        }
      }
    } catch (error) {
      console.error("Invalid range slider values:", valueStr);
    }
  }

  setInputs() {
    if (this.inputMin) {
      this.inputMinDisplay = getComputedStyle(this.inputMin, null).display;
      this.inputMin.style.display = "none";
    } else {
      console.warn("Cannot find target input element...");
    }

    if (this.inputMax) {
      this.inputMaxDisplay = getComputedStyle(this.inputMax, null).display;
      this.inputMax.style.display = "none";
    }
  }

  createSlider() {
    this.slider = this.createElement("div", this.klasses.container);
    this.sliderBg = this.createElement("div", this.klasses.background);
    this.selected = this.createElement("div", this.klasses.selected);
    this.pointerL = this.createElement("div", this.klasses.pointer, [
      "dir",
      "left",
    ]);
    this.scale = this.createElement("div", this.klasses.scale);

    if (this.tooltipValue) {
      this.tipL = this.createElement("div", this.klasses.tip);
      this.tipR = this.createElement("div", this.klasses.tip);
      this.pointerL.appendChild(this.tipL);
    }
    this.slider.appendChild(this.sliderBg);
    this.slider.appendChild(this.selected);
    this.slider.appendChild(this.scale);
    this.slider.appendChild(this.pointerL);

    if (this.isRange) {
      this.pointerR = this.createElement("div", this.klasses.pointer, [
        "dir",
        "right",
      ]);
      if (this.tooltipValue) this.pointerR.appendChild(this.tipR);
      this.slider.appendChild(this.pointerR);
    }

    this.container.insertBefore(this.slider, this.inputMin.nextSibling);

    if (this.hasWidthValue) this.slider.style.width = this.widthValue;

    this.sliderLeft = this.slider.getBoundingClientRect().left;
    this.sliderWidth = this.slider.clientWidth;
    this.pointerWidth = this.pointerL.clientWidth;

    if (this.isDisabled) {
      this.slider.classList.add("disabled");

      return;
    } else {
      this.slider.classList.remove("disabled");
    }

    if (this.hasSelectedColourValue) {
      this.selected.style.backgroundColor = this.selectedColourValue;
      this.selected.style.borderColor = this.selectedColourValue;
      if (this.tooltipValue) {
        this.tipL.style.borderColor = this.selectedColourValue;
        this.tipR.style.borderColor = this.selectedColourValue;
      }
    }
  }

  createScale() {
    this.stepWidth = this.sliderWidth / (this.values.range.length - 1);
    this.scale.innerHTML = "";

    for (let i = 0; i < this.values.range.length; i++) {
      const span = document.createElement("span");
      const ins = document.createElement("ins");
      span.appendChild(ins);
      this.scale.appendChild(span);
      span.style.width =
        i === this.values.range.length - 1 ? 0 : this.stepWidth + "px";
      ins.innerHTML = this.labelsValue
        ? this.formatStr(this.values.range[i])
        : "";
      ins.style.marginLeft = (ins.clientWidth / 2) * -1 + "px";
    }
  }

  updateScale() {
    this.stepWidth = this.sliderWidth / (this.values.range.length - 1);

    let pieces = this.slider.querySelectorAll("span");

    for (var i = 0, iLen = pieces.length; i < iLen; i++) {
      pieces[i].style.width = this.stepWidth + "px";
    }

    this.setSliders();
  }

  setSliders() {
    if (this.isRange && this.values.start > this.values.end) {
      this.values.start = this.values.end;
    }

    if (this.isRange) {
      this.pointerL.style.left =
        this.values.start * this.stepWidth - this.pointerWidth / 2 + "px";
      this.pointerR.style.left =
        this.values.end * this.stepWidth - this.pointerWidth / 2 + "px";
      if (this.tooltipValue) {
        this.tipL.innerHTML = this.formatStr(
          this.values.range[this.values.start]
        );
        this.tipR.innerHTML = this.formatStr(
          this.values.range[this.values.end]
        );
      }
    } else {
      this.pointerL.style.left =
        this.values.end * this.stepWidth - this.pointerWidth / 2 + "px";
      if (this.tooltipValue) {
        this.tipL.innerHTML = this.formatStr(
          this.values.range[this.values.end]
        );
      }
    }

    this.selected.style.width =
      (this.values.end - this.values.start) * this.stepWidth + "px";
    this.selected.style.left = this.values.start * this.stepWidth + "px";

    this.updateInput();
  }

  updateInput() {
    if (this.isRange) {
      this.inputMinTarget.value = this.values.range[this.values.start];
      this.inputMinTarget.setAttribute(
        "value",
        this.values.range[this.values.start]
      );
      this.inputMaxTarget.value = this.values.range[this.values.end];
      this.inputMaxTarget.setAttribute(
        "value",
        this.values.range[this.values.end]
      );
    } else {
      this.inputMinTarget.value = this.values.range[this.values.end];
      this.inputMinTarget.setAttribute(
        "value",
        this.values.range[this.values.end]
      );
    }

    if (this.hasValueTarget) {
      if (this.isRange) {
        this.valueTarget.textContent =
          this.values.range[this.values.start] +
          " - " +
          this.values.range[this.values.end];
      } else {
        this.valueTarget.textContent = this.values.range[this.values.end];
      }
    }
  }

  addEvents() {
    this.slider.addEventListener("mousemove", this.move.bind(this));
    this.slider.addEventListener("mouseup", this.drop.bind(this));
    this.pointerL.addEventListener("mousedown", this.drag.bind(this));
    this.pointerR?.addEventListener("mousedown", this.drag.bind(this));
    window.addEventListener("resize", this.onResize.bind(this));

    const pieces = this.slider.querySelectorAll("span");
    for (var i = 0, iLen = pieces.length; i < iLen; i++) {
      pieces[i].addEventListener("click", this.onClickPiece.bind(this));
    }
  }

  drag(e) {
    e.preventDefault();
    if (this.disabledValue) return;

    this.activePointer = e.target;
    this.slider.classList.add("sliding");
  }

  move(e) {
    if (!this.activePointer) return;

    let coordX = e.pageX;
    let index = coordX - this.sliderLeft - this.pointerWidth / 2;

    index = Math.round(index / this.stepWidth);
    index = Math.max(0, Math.min(index, this.values.range.length - 1));

    if (this.isRange) {
      if (this.activePointer === this.pointerL) {
        this.values.start = index;
      }
      if (this.activePointer === this.pointerR) {
        this.values.end = index;
      }
    } else {
      this.values.end = index;
    }

    this.setSliders();
  }

  drop() {
    this.activePointer = null;
  }

  onClickPiece(e) {
    if (this.isDisabled) return;

    var idx = Math.round((e.clientX - this.sliderLeft) / this.stepWidth);

    if (idx > this.values.range.length - 1) idx = this.values.range.length - 1;
    if (idx < 0) idx = 0;

    if (this.isRange) {
      if (idx - this.values.start <= this.values.end - idx) {
        this.values.start = idx;
      } else this.values.end = idx;
    } else this.values.end = idx;

    this.slider.classList.remove("sliding");

    this.setSliders();
  }

  onResize() {
    this.sliderLeft = this.slider.getBoundingClientRect().left;
    this.sliderWidth = this.slider.clientWidth;

    this.updateScale();
  }

  parseRange(min, max, step) {
    if (!max || !step) return null;

    return Array.from(
      { length: Math.ceil((max - min + 1) / step) },
      (_, i) => min + i * step
    );
  }

  createElement(el, klass, dataAttr) {
    let element = document.createElement(el);
    if (klass) {
      element.className = klass;
    }
    if (dataAttr && dataAttr.length === 2) {
      element.setAttribute("data-" + dataAttr[0], dataAttr[1]);
    }

    return element;
  }

  formatStr(value) {
    if (this.valuesAreStrings) return value;
    if (this.hasCurrencyValue) return this.formatCurrency(value);

    return value;
  }

  formatCurrency(value) {
    if (!this.hasCurrencyValue) return value;

    // TODO: add support for other currencies
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: this.currencyValue,
      minimumFractionDigits: 0,
    }).format(value);
  }
}
