import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input"]

  static values = {
    width:   Number,
    tooltip: { type: Boolean, default: false },
    labels:  { type: Boolean, default: false },
    scale:   { type: Boolean, default: false },
  }

  initialize() {
    this.container = this.element
    this.input     = this.inputTarget
    this.slider    = null
    this.selected  = null
    this.pointerL  = null
    this.pointerR  = null
    this.scale     = null
    this.tipL      = null
    this.tipR      = null

    this.sliderWidth	  = 0
		this.sliderLeft		  = 0
		this.pointerWidth	  = 0
    this.stepWidth		  = 0
    this.step 			    = 0
    this.valRange 		  = null
    this.activePointer  = null

    this.values = {
			start:	null,
			end:	  null,
      range:  [],
		}

    this.klasses = {
			container:	'rs-container',
			background: 'rs-bg',
			selected: 	'rs-selected',
			pointer: 	  'rs-pointer',
			scale: 		  'rs-scale',
			noscale:	  'rs-noscale',
			tip: 		    'rs-tooltip'
		}
  }

  connect() {
    this.setInitialValues()
    this.setInput()
    this.createSlider()
    this.createScale()
    this.setSliders()
    this.addEvents()
  }

  // disconnect() {
  //   this.destroy()
  // }

  setInput() {
    if (this.input) {
      this.inputDisplay = getComputedStyle(this.input, null).display
      this.input.style.display = 'none'
    } else {
      console.warn('Cannot find target input element...')
    }
  }

  createSlider() {
    this.slider = this.createElement('div', this.klasses.container)
		this.slider.innerHTML = '<div class="rs-bg"></div>'

		this.selected = this.createElement('div', this.klasses.selected)
		this.pointerL = this.createElement('div', this.klasses.pointer, ['dir', 'left'])
		this.scale    = this.createElement('div', this.klasses.scale)

    if (this.tooltipValue) {
			this.tipL = this.createElement('div', this.klasses.tip)
			this.tipR = this.createElement('div', this.klasses.tip)
			this.pointerL.appendChild(this.tipL)
		}
		this.slider.appendChild(this.selected)
		this.slider.appendChild(this.scale)
		this.slider.appendChild(this.pointerL)

    if (this.isRange) {
			this.pointerR = this.createElement('div', this.klasses.pointer, ['dir', 'right'])
			if (this.tooltipValue) this.pointerR.appendChild(this.tipR)
			this.slider.appendChild(this.pointerR)
		}

		this.container.insertBefore(this.slider, this.input.nextSibling)

    if (this.widthValue) this.slider.style.width = parseInt(this.widthValue) + 'px'
		this.sliderLeft   = this.slider.getBoundingClientRect().left
		this.sliderWidth  = this.slider.clientWidth
		this.pointerWidth = this.pointerL.clientWidth

		if (!this.scaleValue) this.slider.classList.add(this.klasses.noscale)
  }

  createElement(el, klass, dataAttr) {
    let element = document.createElement(el)
		if (klass) { element.className = klass }
		if (dataAttr && dataAttr.length === 2) { element.setAttribute('data-' + dataAttr[0], dataAttr[1]) }

		return element
  }

  setInitialValues() {
    this.step         = Number(this.input.step || 1)
    this.minValue     = Number(this.input.min || 0)
    this.maxValue     = Number(this.input.max || 0)
    this.inputValue   = this.input.value

    if (this.inputValue === '') return
    if (this.minValue > this.maxValue) return
    if (this.step <= 0) return

    this.parsedValue  = this.parseValue(this.inputValue)
    this.values.range = this.parseRange(this.minValue, this.maxValue, this.step)
    this.isRange      = this.parsedValue.length > 1

    this.values.start = this.isRange ? this.values.range.indexOf(this.parsedValue[0]) : 0
    this.values.end   = this.isRange ? this.values.range.indexOf(this.parsedValue[1]) : this.values.range.length - 1
  }

  parseValue(valueStr) {
    if (!valueStr) return null

    const values = valueStr.toString().split(',').map(Number)

    if (values.length === 1) return [values[0]]

    return [values[0], values[1]]
  }

  parseRange(min, max, step) {
    if (!min || !max || !step) return null
 
    return Array.from({ length: Math.ceil((max - min + 1) / step) }, (_, i) => min + i * step)
  }

  createScale() {
    this.stepWidth = this.sliderWidth / (this.values.range.length - 1);
    this.scale.innerHTML = ''

    for (let i = 0; i < this.values.range.length; i++) {
      const span = document.createElement('span')
      const ins  = document.createElement('ins')
      span.appendChild(ins)
      this.scale.appendChild(span)
      span.style.width = i === this.values.range.length - 1 ? 0 : this.stepWidth + 'px'
      ins.innerHTML = this.labelsValue ? this.values.range[i] : ''
      ins.style.marginLeft = (ins.clientWidth / 2) * -1 + 'px'
    }
  }

  setSliders() {
    if (this.isRange && this.values.start > this.values.end) {
      this.values.start = this.values.end
    }

    if (this.isRange) {
      this.pointerL.style.left = (this.values.start * this.stepWidth - (this.pointerWidth / 2)) + 'px'
      this.pointerR.style.left = (this.values.end * this.stepWidth - (this.pointerWidth / 2)) + 'px'
      if (this.tooltipValue) {
        this.tipL.innerHTML = this.values.range[this.values.start]
        this.tipR.innerHTML = this.values.range[this.values.end]
      }
      this.selected.style.width = (this.values.end - this.values.start) * this.stepWidth + 'px'
      this.selected.style.left = this.values.start * this.stepWidth + 'px'
    } else {
      this.pointerL.style.left = (this.values.end * this.stepWidth - (this.pointerWidth / 2)) + 'px'
      if (this.tooltipValue) {
        this.tipL.innerHTML = this.values.range[this.values.end]
      }
    }

    this.updateInput()
  }

  updateInput() {
    if (this.isRange) {
      this.inputTarget.value = `${this.values.range[this.values.start]},${this.values.range[this.values.end]}`
    } else {
      this.inputTarget.value = this.values.range[this.values.end]
    }
  }

  addEvents() {
    this.slider.addEventListener('mousemove', this.move.bind(this))
    this.slider.addEventListener('mouseup', this.drop.bind(this))
    this.pointerL.addEventListener('mousedown', this.drag.bind(this))
    this.pointerR?.addEventListener('mousedown', this.drag.bind(this))
    window.addEventListener('resize', this.onResize.bind(this))
  }

  drag(e) {
    e.preventDefault()
    if (this.disabledValue) return

    this.activePointer = e.target
    this.slider.classList.add('sliding')
  }

  move(e) {
    if (!this.activePointer) return

    let coordX = e.type === 'touchmove' ? e.touches[0].clientX : e.pageX
    let index  = coordX - this.sliderLeft - (this.pointerWidth / 2)

    index = Math.round(index / this.stepWidth)
    index = Math.max(0, Math.min(index, this.values.range.length - 1))

    if (this.isRange) {
      if (this.activePointer === this.pointerL) { this.values.start = index }
      if (this.activePointer === this.pointerR) { this.values.end = index }
    } else {
      this.values.end = index
    }

    this.setSliders()
  }

  drop() {
    this.activePointer = null
  }

  onResize() {
    this.sliderWidth = this.slider.clientWidth
    this.step = this.sliderWidth / (this.values.range.length - 1)
    this.setSliders()
  }

  get disabledValue() {
    return this._disabledValue
  }

  set disabledValue(value) {
    if (value) {
      this.slider.classList.add('disabled')
    } else {
      this.slider.classList.remove('disabled')
    }
  }
}
