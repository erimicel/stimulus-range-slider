# stimulus-range-slider

[![GitHub](https://img.shields.io/github/v/release/erimicel/stimulus-range-slider?style=flat-square)](https://github.com/erimicel/stimulus-range-slider)
[![npm version](https://img.shields.io/npm/v/stimulus-range-slider?style=flat-square)](https://www.npmjs.com/package/stimulus-range-slider)
[![npm](https://img.shields.io/npm/dm/stimulus-range-slider?label=npm&style=flat-square)](https://www.npmjs.com/package/stimulus-range-slider)
[![jsdelivr](https://data.jsdelivr.com/v1/package/gh/erimicel/stimulus-range-slider/badge)](https://www.jsdelivr.com/package/gh/erimicel/stimulus-range-slider)
[![License](https://img.shields.io/github/license/erimicel/stimulus-range-slider?style=flat-square)](LICENSE)

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
import { Application } from "@hotwired/stimulus"

const application = Application.start();

// Import and register all TailwindCSS Components or just the ones you need
import RangeSlider from "stimulus-range-slider"
application.register('range-slider', RangeSlider)
```

To use `default` theme we also need to add css;

```css
import 'stimulus-range-slider/dist/stimulus-range-slider.css';
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

- Support negative numbers
- Support a..z range
- Support vertical slider
- Support tailwindcssv4 and boostrap5 themes
- Support more options for tooltip (position, distance etc.)
- Support show/hide markers
- Support more custom UI elements (pointers, gradient etc.)
- Fix Disable state
- Add onChange custom event that can be ported to custom controller
- Add destroy custom event
