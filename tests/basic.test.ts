import path from 'node:path'
import { build as esbuild } from 'esbuild'
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
console.log(text, text2, text3, text4)
`
const entryFile = path.resolve(resolveDir, 'main.js')
const rollupPlugin: Plugin = {
  name: 'entry',
  resolveId(id) {
    if (id === entryFile) {
      return entryFile
    }
  },
  load(id) {
    if (id === entryFile) {
      return rollupCode
    }
  },
}

test('rollup', async () => {
  const bundle = await rollup({
    input: [entryFile],
    plugins: [
      Raw.rollup({
        transform: true,
      }),
      rollupPlugin,
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
      rollupPlugin,
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
