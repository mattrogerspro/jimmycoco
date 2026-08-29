import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

const routerConfig = read('../pro-site/react-router.config.ts')
const routesConfig = read('../pro-site/app/routes.ts')
const homeRoute = read('../pro-site/app/routes/home.tsx')
const homeForm = read('../pro-site/app/components/home/HomeSections.tsx')
const productRoute = read('../pro-site/app/routes/product.tsx')
const productForm = read('../pro-site/app/components/product/ProductSections.tsx')
const calculatorRoute = read('../pro-site/app/routes/api.calculator-report.ts')
const calculatorForm = read('../pro-site/app/components/shared/CalculatorReportModal.tsx')

function prerenderPaths(source) {
  const match = source.match(/prerender\s*:\s*\[([\s\S]*?)\]/)
  assert.ok(match, 'react-router.config.ts must declare an explicit prerender allow-list')
  return [...match[1].matchAll(/["']([^"']+)["']/g)].map((entry) => entry[1])
}

test('routes with public server actions are never emitted as static data assets', () => {
  const paths = prerenderPaths(routerConfig)

  assert.doesNotMatch(paths.join('\n'), /^\/$/m)
  assert.doesNotMatch(paths.join('\n'), /^\/products\/malibu-professional-spray-1l$/m)
  assert.deepEqual(paths, ['/tools/spray-tan-profit-calculator'])

  assert.match(homeRoute, /export async function action/)
  assert.match(homeForm, /<Form method="post"[^>]*data-form-id="trade_trial"/)
  assert.match(productRoute, /export async function action/)
  assert.match(productForm, /<Form method="post"[^>]*data-form-id="product_order"/)
})

test('calculator report submission remains on its explicit resource action', () => {
  assert.match(routesConfig, /route\("api\/calculator-report", "routes\/api\.calculator-report\.ts"\)/)
  assert.match(calculatorRoute, /export async function action/)
  assert.match(calculatorForm, /<fetcher\.Form[\s\S]*method="post"[\s\S]*action=\{CALCULATOR_REPORT_PATH\}/)
})
