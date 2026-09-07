import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const pricing = JSON.parse(read('pro-site/retail-pricing.json'))
const portalPricing = read('pro-site/app/lib/portal-pricing.ts')
const resellerServer = read('pro-site/app/lib/resellers.server.ts')
const migration = read('supabase/migrations/20260907110000_sync_reseller_catalogue_with_pro_site.sql')

test('portal maps every current catalogue SKU to the Pro website pricing source', () => {
  assert.match(portalPricing, /"MALIBU-1L": \{ kind: "professional" \}/)
  assert.match(portalPricing, /"MITT-BUFF-GLOW": \{ kind: "retail", productId: "mitt" \}/)
  assert.match(portalPricing, /"SOUFFLE-SELF-TAN": \{ kind: "retail", productId: "souffleMedium" \}/)
  assert.match(portalPricing, /"KIT-A-LIST-GLOW": \{ kind: "retail", productId: "kit" \}/)
})

test('submitted reseller orders are recalculated with canonical quantity pricing', () => {
  assert.match(resellerServer, /const pricing = portalProductPricing\([\s\S]*line\.quantity/)
  assert.match(resellerServer, /unit_price_pence: pricing\.unitPricePence/)
  assert.match(resellerServer, /line_total_pence: pricing\.lineTotalPence/)
  assert.doesNotMatch(
    resellerServer,
    /product\.trade_price_pence \* \(1 - Number\(reseller\.discount_percent/,
  )
})

test('database reference prices match the current Pro website price file', () => {
  const expected = [
    ['MALIBU-1L', pricing.professional.malibu1L.tiers[0].unitPrice * 100],
    ['MITT-BUFF-GLOW', pricing.retail.mitt.singleUnitTradePrice * 100],
    ['SOUFFLE-SELF-TAN', pricing.retail.souffleMedium.singleUnitTradePrice * 100],
    ['KIT-A-LIST-GLOW', pricing.retail.kit.singleUnitTradePrice * 100],
  ]

  for (const [sku, price] of expected) {
    assert.match(
      migration,
      new RegExp(`trade_price_pence = ${price}\\nwhere sku = '${sku}'`),
    )
  }
})
