import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["inputMin", "inputMax", "value"];

  static values = {
    theme: { type: String, default: "default" },
    tooltip: { type: Boolean, default: false },
    labels: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    vertical: { type: Boolean, default: false },
    markers: { type: Boolean, default: false },
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
    this.inputMinValue = null;
    this.inputMaxValue = null;
    this.activePointer = null;
    this.isRange = false;
    this.isDisabled = false;
    this.isVertical = false;
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
        marker: "rs-marker",
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
        marker: "absolute h-2 w-1 bg-gray-200",
      },
    };

    this.klasses = this.themes[this.themeValue];
  }

  connect() {
    this.setInitialValues();
    this.setInputs();
    this.createSlider();
    this.createScale();
    this.adjustLabelVisibility();
    this.setSliders();
    this.addEvents();

    setTimeout(() => this.onResize(), 0);
  }

  setInitialValues() {
    this.step = Number(this.stepValue || 1);
    this.isVertical = this.verticalValue;

    if (this.step <= 0) return;

    if (this.hasInputMinTarget) {
      this.inputMin = this.inputMinTarget;

      if (this.inputMin.value === "") {
        this.inputMinValue = null;
      } else {
        this.inputMinValue = Number(this.inputMin.value);
      }
      if (isNaN(this.inputMinValue)) {
        this.inputMinValue = this.inputMin.value;
      }
    }

    if (this.hasInputMaxTarget) {
      this.inputMax = this.inputMaxTarget;

      if (this.inputMax.value === "") {
        this.inputMaxValue = null;
      } else if (this.inputMax.value instanceof String) {
        this.inputMaxValue = this.inputMax.value;
      } else {
        this.inputMaxValue = Number(this.inputMax.value);

        if (this.inputMinValue > this.inputMaxValue) return;
      }
    }

    this.isDisabled = this.disabledValue;
    this.isRange = this.hasInputMaxTarget && this.hasInputMinTarget;

    this.setRangeValues(this.valuesValue, this.step);

    if (this.inputMin.value === "") {
      this.values.start = 0;
    } else {
      this.values.start = this.isRange
        ? this.values.range.indexOf(this.inputMinValue)
        : 0;
    }

    if (this.hasInputMaxTarget && this.inputMax.value === "") {
      this.values.end = this.values.range.length - 1;
    } else {
      this.values.end = this.isRange
        ? this.values.range.indexOf(this.inputMaxValue)
        : this.inputMin.value === ""
        ? this.values.range.length - 1
        : this.values.range.indexOf(this.inputMinValue);
    }
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
    if (this.isVertical) {
      this.slider.classList.add("vertical");
    }
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

    if (this.hasWidthValue) {
      if (this.isVertical) {
        this.slider.style.height = this.widthValue;
      } else {
        this.slider.style.width = this.widthValue;
      }
    }

    this.sliderLeft = this.slider.getBoundingClientRect().left;
    this.sliderTop = this.slider.getBoundingClientRect().top;
    this.sliderWidth = this.isVertical
      ? this.slider.clientHeight
      : this.slider.clientWidth;
    this.pointerWidth = this.pointerL.clientWidth;

    if (this.isDisabled) {
      this.slider.classList.add("disabled");

      return;
    } else {
      this.slider.classList.remove("disabled");
    }

    if (!this.labelsValue) this.slider.classList.add("-no-labels");

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
      const labelContainer = document.createElement("div");
      const label = document.createElement("span");

      if (this.markersValue) {
        labelContainer.classList.add(this.klasses.marker);
        label.classList.add(this.klasses.marker);
      }

      labelContainer.appendChild(label);
      this.scale.appendChild(labelContainer);

      const position = this.isVertical
        ? this.sliderWidth - i * this.stepWidth // Vertical position from bottom
        : i * this.stepWidth; // Horizontal position from left

      if (this.isVertical) {
        labelContainer.style.height =
          i === this.values.range.length - 1 ? 0 : this.stepWidth + "px";
        labelContainer.style.width = "auto";
      } else {
        labelContainer.style.width =
          i === this.values.range.length - 1 ? 0 : this.stepWidth + "px";
      }

      if (this.labelsValue) {
        label.innerHTML = this.formatStr(this.values.range[i]);

        label.style.position = "absolute";

        if (this.isVertical) {
          // Position labels on the right side for vertical slider
          label.style.top = position + "px";
          label.style.left = "0px";
          label.style.transform = "translateY(-50%)";
        } else {
          // Position labels below for horizontal slider
          label.style.left = position + "px";
          label.style.transform = "translateX(-50%)";
        }

        // Determine which labels to show based on available space
        const totalLabels = this.values.range.length;
        const availableWidth = this.sliderWidth;
        const approxLabelWidth = 50; // Estimate of average label width in pixels
        const maxLabelsToShow = Math.floor(availableWidth / approxLabelWidth);

        // Show all labels if there's enough space, otherwise show a subset
        if (
          totalLabels <= maxLabelsToShow ||
          i === 0 ||
          i === totalLabels - 1 ||
          i % Math.ceil(totalLabels / maxLabelsToShow) === 0
        ) {
          label.style.display = "inline-block";
        } else {
          label.style.display = "none";
        }
      }
    }
  }

  updateScale() {
    this.stepWidth = this.sliderWidth / (this.values.range.length - 1);

    let pieces = this.slider.querySelectorAll("div");

    for (var i = 0, iLen = pieces.length; i < iLen; i++) {
      pieces[i].style.width = this.stepWidth + "px";
    }

    this.setSliders();
  }

  setSliders() {
    if (this.isRange && this.values.start > this.values.end) {
      this.values.start = this.values.end;
    }

    const maxPosition = (this.values.range.length - 1) * this.stepWidth;

    if (this.isRange) {
      let startPosition, endPosition;

      if (this.isVertical) {
        // For vertical, invert the positions (0 at bottom, max at top)
        startPosition = maxPosition - this.values.start * this.stepWidth;
        endPosition = maxPosition - this.values.end * this.stepWidth;

        // Ensure correct order (lower value is at the bottom)
        if (startPosition < endPosition) {
          [startPosition, endPosition] = [endPosition, startPosition];
        }

        this.pointerL.style.top = startPosition - this.pointerWidth / 2 + "px";
        this.pointerR.style.top = endPosition - this.pointerWidth / 2 + "px";

        // Set selected area - in vertical mode, it grows from bottom up
        this.selected.style.top = endPosition + "px";
        this.selected.style.height = startPosition - endPosition + "px";
      } else {
        // Horizontal slider (existing logic)
        startPosition = this.values.start * this.stepWidth;
        endPosition = this.values.end * this.stepWidth;

        this.pointerL.style.left = startPosition - this.pointerWidth / 2 + "px";
        this.pointerR.style.left = endPosition - this.pointerWidth / 2 + "px";

        this.selected.style.left = startPosition + "px";
        this.selected.style.width = endPosition - startPosition + "px";
      }

      if (this.tooltipValue) {
        this.tipL.innerHTML = this.formatStr(
          this.values.range[this.values.start]
        );
        this.tipR.innerHTML = this.formatStr(
          this.values.range[this.values.end]
        );
      }
    } else {
      let position;

      if (this.isVertical) {
        // Single pointer, vertical slider
        position = maxPosition - this.values.end * this.stepWidth;
        position = Math.max(0, Math.min(position, maxPosition));

        this.pointerL.style.top = position - this.pointerWidth / 2 + "px";

        // Selected area grows from bottom
        this.selected.style.top = position + "px";
        this.selected.style.height = maxPosition - position + "px";
      } else {
        // Single pointer, horizontal slider
        position = this.values.end * this.stepWidth;
        position = Math.max(0, Math.min(position, maxPosition));

        this.pointerL.style.left = position - this.pointerWidth / 2 + "px";

        this.selected.style.width = position + "px";
        this.selected.style.left = "0px";
      }

      if (this.tooltipValue) {
        this.tipL.innerHTML = this.formatStr(
          this.values.range[this.values.end]
        );
      }
    }

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
    this.slider.addEventListener("touchmove", this.move.bind(this), {
      passive: true,
    });
    this.slider.addEventListener("mouseup", this.drop.bind(this));
    this.slider.addEventListener("touchend", this.drop.bind(this), {
      passive: true,
    });
    this.slider.addEventListener("touchcancel", this.drop.bind(this), {
      passive: true,
    });
    this.pointerL.addEventListener("mousedown", this.drag.bind(this));
    this.pointerL.addEventListener("touchstart", this.drag.bind(this), {
      passive: true,
    });
    this.pointerR?.addEventListener("mousedown", this.drag.bind(this));
    this.pointerR?.addEventListener("touchstart", this.drag.bind(this), {
      passive: true,
    });
    window.addEventListener("resize", this.onResize.bind(this));

    const pieces = this.slider.querySelectorAll("div");
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

    // Get coordinates
    let coord, position, percentage, index;

    if (this.isVertical) {
      coord = e.touches ? e.touches[0].pageY : e.pageY;
      position = coord - this.sliderTop;

      // Invert percentage calculation for vertical (0 at bottom, 1 at top)
      percentage = 1 - position / this.sliderWidth;
    } else {
      coord = e.touches ? e.touches[0].pageX : e.pageX;
      position = coord - this.sliderLeft;
      percentage = position / this.sliderWidth;
    }

    // Clamp percentage
    percentage = Math.max(0, Math.min(1, percentage));

    // Calculate index
    index = Math.round(percentage * (this.values.range.length - 1));

    // Update values
    if (this.isRange) {
      if (this.activePointer === this.pointerL) {
        this.values.start = Math.min(index, this.values.end);
      } else if (this.activePointer === this.pointerR) {
        this.values.end = Math.max(index, this.values.start);
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

    let position, percentage, idx;

    if (this.isVertical) {
      position = e.clientY - this.sliderTop;
      percentage = 1 - position / this.sliderWidth;
    } else {
      position = e.clientX - this.sliderLeft;
      percentage = position / this.sliderWidth;
    }

    percentage = Math.max(0, Math.min(1, percentage));
    idx = Math.round(percentage * (this.values.range.length - 1));

    if (this.isRange) {
      // Determine which handle to move based on click position
      if (
        Math.abs(idx - this.values.start) <= Math.abs(idx - this.values.end)
      ) {
        this.values.start = idx;
      } else {
        this.values.end = idx;
      }
    } else {
      this.values.end = idx;
    }

    this.slider.classList.remove("sliding");
    this.setSliders();
  }

  onResize() {
    const currentStart = this.values.start;
    const currentEnd = this.values.end;

    // Update dimensions based on orientation
    const rect = this.slider.getBoundingClientRect();
    this.sliderLeft = rect.left;
    this.sliderTop = rect.top;

    if (this.isVertical) {
      this.sliderWidth = this.slider.clientHeight;
    } else {
      this.sliderWidth = this.slider.clientWidth;
    }

    this.pointerWidth = this.pointerL.clientWidth;
    this.stepWidth = this.sliderWidth / (this.values.range.length - 1);

    this.createScale();
    this.adjustLabelVisibility();

    this.values.start = currentStart;
    this.values.end = currentEnd;

    this.setSliders();
  }

  adjustLabelVisibility() {
    const labels = this.scale.querySelectorAll('span');
    const totalLabels = labels.length;
    
    if (totalLabels === 0) return;
    
    // Get dimensions based on orientation
    const availableSpace = this.isVertical ? 
      this.slider.clientHeight : 
      this.slider.clientWidth;
    
    const minSpacing = this.isVertical ? 30 : 40;
    const maxLabelsToShow = Math.max(2, Math.floor(availableSpace / minSpacing));
    
    for (let i = 0; i < totalLabels; i++) {
      if (i === 0 || i === totalLabels - 1) {
        // Always show first and last labels
        labels[i].style.display = 'inline-block';
      } else if (availableSpace < 300) {
        // On small space, only show first and last
        labels[i].style.display = 'none';
      } else if (totalLabels <= maxLabelsToShow) {
        // If we have enough space, show all labels
        labels[i].style.display = 'inline-block';
      } else {
        // Show a distributed subset
        const interval = Math.ceil(totalLabels / maxLabelsToShow);
        labels[i].style.display = i % interval === 0 ? 'inline-block' : 'none';
      }
    }
  }

  parseRange(min, max, step) {
    if (!max || !step) return null;

    const count = Math.floor((max - min) / step) + 1;
    return Array.from({ length: count }, (_, i) => min + i * step);
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
