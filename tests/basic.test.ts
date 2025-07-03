import path from 'node:path'
import { build } from 'esbuild'
import { rollup } from 'rollup'
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

  const result = await build({
    stdin: {
      contents,
      resolveDir,
    },
    write: false,
    bundle: true,
    format: 'esm',
    plugins: [Raw.esbuild()],
  })
  expect(result.outputFiles[0].text).matchSnapshot()
})

test('rollup', async () => {
  const contents = `
  import text from "./ts.ts?raw"
  import text2 from "./js.js?raw"
  import text3 from "./jsx.jsx?raw"
  import text4 from "./with.js" with { type: "text" }
  console.log(text, text2, text3, text4)
  `
  const entryFile = path.resolve(resolveDir, 'main.js')
  const bundle = await rollup({
    input: [entryFile],
    plugins: [
      Raw.rollup(),
      {
        name: 'entry',
        resolveId(id) {
          if (id === entryFile) {
            return entryFile
          }
        },
        load(id) {
          if (id === entryFile) {
            return contents
          }
        },
      },
    ],
  })
  const result = await bundle.generate({ format: 'esm' })
  expect(result.output[0].code).matchSnapshot()
})
