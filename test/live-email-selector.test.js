import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('Live Email selector lists active campaigns only and labels an opened archive as a reference', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const selector = app.match(/<div className="campaign-select-wrap">[\s\S]*?<\/div>/)?.[0] || ''

  assert.match(selector, /activeCampaigns\.map/)
  assert.doesNotMatch(selector, /\{campaigns\.map/)
  assert.match(selector, /Archived email reference/)
})
