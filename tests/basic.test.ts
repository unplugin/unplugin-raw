import path from 'node:path'
import { build as esbuild } from 'esbuild'
import { rolldown } from 'rolldown'
import { rollup, type Plugin, type RollupOutput } from 'rollup'
import { build as vite } from 'vite'
import { expect, test } from 'vitest'
import Raw from '../src'

const resolveDir = path.resolve(__dirname, 'fixtures')

test('esbuild', async () => {
  const contents = `
  import text from "./ts.ts?raw"
  import text2 from "./js.js?raw"
  import text3 from "./jsx.jsx?raw"
  import text4 from "./with.js" with { type: "text" }
  import bytes1 from "./abc.txt" with { type: "bytes" }
  console.log(text, text2, text3, text4, bytes1)
  `

  const result = await esbuild({
    stdin: {
      contents,
      resolveDir,
    },
    write: false,
    bundle: true,
    format: 'esm',
    plugins: [
      Raw.esbuild({
        transform: true,
      }),
    ],
  })
  expect(result.outputFiles[0].text).matchSnapshot()
})

const rollupCode = `
import text from "./ts.ts?raw"
import text2 from "./js.js?raw"
import text3 from "./jsx.jsx?raw"
import text4 from "./with.js" with { type: "text" }
import bytes1 from "./abc.txt" with { type: "bytes" }
console.log(text, text2, text3, text4, bytes1)
`
const entryFile = path.resolve(resolveDir, 'main.js')
const rollupPlugin = (code: string): Plugin => ({
  name: 'entry',
  resolveId(id) {
    if (id === entryFile) {
      return entryFile
    }
  },
  load(id) {
    if (id === entryFile) {
      return code
    }
  },
})

test('rollup', async () => {
  const bundle = await rollup({
    input: [entryFile],
    plugins: [
      Raw.rollup({
        transform: true,
      }),
      rollupPlugin(rollupCode),
    ],
  })
  const result = await bundle.generate({ format: 'esm' })
  expect(result.output[0].code).matchSnapshot()
})

test('vite', async () => {
  const output = await vite({
    root: resolveDir,
    plugins: [
      Raw.vite({
        transform: true,
      }),
      rollupPlugin(rollupCode),
    ],
    build: {
      rollupOptions: {
        input: [entryFile],
      },
      minify: false,
      write: false,
    },
    logLevel: 'silent',
  })
  expect((output as RollupOutput).output[0].code).matchSnapshot()
})

const rolldownCode = `
import text from "./ts.ts?raw"
import text2 from "./js.js?raw"
import text3 from "./jsx.jsx?raw"
console.log(text, text2, text3)
`

test('rolldown', async () => {
  const bundle = await rolldown({
    input: [entryFile],
    plugins: [
      Raw.rolldown({
        transform: true,
      }),
      rollupPlugin(rolldownCode),
    ],
  })
  const result = await bundle.generate({ format: 'esm' })
  expect(result.output[0].code).matchSnapshot()
})
