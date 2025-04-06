# stimulus-range-slider

[![GitHub](https://img.shields.io/github/v/release/erimicel/stimulus-range-slider?style=flat-square)](https://github.com/erimicel/stimulus-range-slider)
[![npm version](https://img.shields.io/npm/v/stimulus-range-slider?style=flat-square)](https://www.npmjs.com/package/stimulus-range-slider)
[![npm](https://img.shields.io/npm/dm/stimulus-range-slider?label=npm&style=flat-square)](https://www.npmjs.com/package/stimulus-range-slider)
[![License](https://img.shields.io/github/license/erimicel/stimulus-range-slider?style=flat-square)](LICENSE)

This component currently supports Numbers, Strings and only USD Currency number format.
Also it comes with 2 value set options;
`[1,2,3,4,5]` < as Array
`1..5` < as Range

## Live demo

https://erimicel.github.io/stimulus-range-slider/

## 📦 Installation

This assumes that [StimulusJS](https://stimulus.hotwired.dev/) is already installed.

Add the stimulus-range-slider module:
`yarn add stimulus-range-slider`

or
`npm install stimulus-range-slider`

or use with Rails importmaps:
`bin/importmap pin stimulus-range-slider`

## Usage

First, you'll want to initialize StimulusJS and then you can import range slider.

```js
// Start StimulusJS
import { Application } from "@hotwired/stimulus";

const application = Application.start();

// Import and register all TailwindCSS Components or just the ones you need
import RangeSlider from "stimulus-range-slider";
application.register("range-slider", RangeSlider);
```

To use `default` theme we also need to add css;

```css
import 'stimulus-range-slider/dist/stimulus-range-slider.css';
```

Now we can add `range-slider` component to our view;

```html
<!-- Multi Range Slider with Tooltips -->
<div
  data-controller="range-slider"
  data-range-slider-values-value="1..10"
  data-range-slider-labels-value="true"
  data-range-slider-tooltip-value="true"
  data-range-slider-markers-value="true"
>
  <label class="block mb-8 text-sm font-medium text-gray-700 dark:text-white">
    Example of multi point range slider with tooltips
  </label>

  <input type="text" data-range-slider-target="inputMin" value="2" />
  <input type="text" data-range-slider-target="inputMax" value="5" />

  <!-- OR erb -->
  <%= form.text_field :range_min, data: { range_slider_target: "inputMin" } %>
  <%= form.text_field :range_max, data: { range_slider_target: "inputMax" } %>

  <!-- To show value on different element => <span data-range-slider-target="value"></span> -->
</div>

<!-- Single Range Slider -->
<div
  data-controller="range-slider"
  data-range-slider-values-value="[1,5,10,15,20,25]"
>
  <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-white">
    Example of single range slider
  </label>

  <input type="text" data-range-slider-target="inputMin" value="5" />

  <!-- OR erb -->
  <%= form.text_field :range_min, data: { range_slider_target: "inputMin" } %>

  <!-- To show value on different element => <span data-range-slider-target="value"></span> -->
</div>
```

Other data options;

```
data-range-slider-values-value="[1,2,3,4,5]"
data-range-slider-values-value='["red", "blue", "green"]'
data-range-slider-step-value=5
data-range-slider-width-value="50%"
data-range-slider-selected-colour-value="#ff0000"
data-range-slider-currency-value="USD"
```

## Development

To view examples locally, run `npm install && npm run build && npx serve` and then open `localhost:3000` in your browser.

## Contributing

Contributions, issues, and feature requests are welcome! Fork the repository, create a new branch, commit your changes, push to your branch, and open a pull request:

```bash
git checkout -b feature-branch-name
git commit -m 'Add some feature'
git push origin feature-branch-name
```

If you find this package helpful, please ⭐ the repository on GitHub!

## TODO

- Support a..z range
- Support tailwindcssv4 and boostrap5 themes
- Support more options for tooltip (position, distance etc.)
- Support more custom UI elements (pointers, gradient etc.)
- Add onChange custom event that can be ported to custom controller
- Add destroy custom event
