import fs from 'node:fs/promises'
import test from 'node:test'
import assert from 'node:assert/strict'

const forbidden = /Libre Caslon|Fraunces|Georgia|Times New Roman|Playfair|var\(--serif\)/i

test('technical interface assets contain no serif typography', async () => {
  for (const filename of ['src/styles.css', 'test.html']) {
    const source = await fs.readFile(filename, 'utf8')
    assert.doesNotMatch(source, forbidden, `${filename} must remain sans-serif only`)
  }
})
