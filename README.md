# unplugin-raw [![npm](https://img.shields.io/npm/v/unplugin-raw.svg)](https://npmjs.com/package/unplugin-raw)

[![Unit Test](https://github.com/unplugin/unplugin-raw/actions/workflows/unit-test.yml/badge.svg)](https://github.com/unplugin/unplugin-raw/actions/workflows/unit-test.yml)

Transform file to a default-export string, and can be transformed by esbuild.

## Installation

```bash
npm i -D unplugin-raw

npm i -D esbuild # Optional, if you want to transform TypeScript to JavaScript
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
<summary>Rolldown</summary><br>

```ts
// rolldown.config.js
import Raw from 'unplugin-raw/rolldown'

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

## Options

```ts
export interface TransformOptions {
  /** @default [/\.[cm]?[jt]sx?$/] */
  include?: FilterPattern
  /** @default [/node_modules/] */
  exclude?: FilterPattern
  /** @default {} */
  options?: EsbuildTransformOptions
}

export interface Options {
  /** @default 'pre' */
  enforce?: 'pre' | 'post' | undefined
  /**
   * Transform
   * @default false
   */
  transform?: TransformOptions | boolean
}
```

## Usage

```ts
import text from './js.js?raw'
import text2 from './jsx.jsx?raw'
import text3 from './ts.ts?raw'
import text4 from './with.js' with { type: 'text' }
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2023-PRESENT [三咲智子](https://github.com/sxzz)
