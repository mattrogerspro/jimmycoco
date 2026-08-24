import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import masterTemplate from '../email/campaigns/_shared/master-template.js'

const campaignIds = process.argv.slice(2)
if (!campaignIds.length) throw new Error('campaign_id_required')

for (const campaignId of campaignIds) {
  if (!/^[a-z0-9-]+$/.test(campaignId)) throw new Error(`invalid_campaign_id:${campaignId}`)
  const campaignDirectory = path.resolve('email/campaigns', campaignId)
  const manifest = JSON.parse(await readFile(path.join(campaignDirectory, 'email-data.json'), 'utf8'))

  for (const message of manifest.messages || []) {
    const output = String(message.output || message.file || '')
    if (!output.startsWith('emails/') || !output.endsWith('.html')) throw new Error(`invalid_campaign_output:${campaignId}:${output}`)
    const destination = path.join(campaignDirectory, output)
    await mkdir(path.dirname(destination), { recursive: true })
    await writeFile(destination, masterTemplate.renderEmail({ ...manifest.defaults, ...message }), 'utf8')
    console.log(`Rendered ${campaignId}/${output}`)
  }
}
