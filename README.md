# unplugin-raw [![npm](https://img.shields.io/npm/v/unplugin-raw.svg)](https://npmjs.com/package/unplugin-raw)

[![Unit Test](https://github.com/unplugin/unplugin-raw/actions/workflows/unit-test.yml/badge.svg)](https://github.com/unplugin/unplugin-raw/actions/workflows/unit-test.yml)

Transform file to a default-export string. It will be transformed to JavaScript, then a string.

## Installation

```bash
npm i -D unplugin-raw
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import Raw from 'unplugin-raw/vite'

export default defineConfig({
  plugins: [Raw()],
})
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import Raw from 'unplugin-raw/rollup'

export default {
  plugins: [Raw()],
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [require('unplugin-raw/esbuild')()],
})
```

<br></details>

<!-- <details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('unplugin-raw/webpack')()],
}
```

<br></details> -->

## Usage

```ts
import text2 from './js.js?raw'
import text3 from './jsx.jsx?raw'
import text from './ts.ts?raw'
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2023-PRESENT [三咲智子](https://github.com/sxzz)
