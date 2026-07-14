import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const campaignsDir = path.resolve('email/campaigns')

async function discoverCampaigns() {
  const entries = await fs.readdir(campaignsDir, { withFileTypes: true })
  const campaigns = []

  for (const entry of entries.filter((item) => item.isDirectory() && !item.name.startsWith('_'))) {
    const directory = path.join(campaignsDir, entry.name)
    let data
    try {
      data = JSON.parse(await fs.readFile(path.join(directory, 'email-data.json'), 'utf8'))
    } catch (error) {
      if (error.code === 'ENOENT') continue
      throw error
    }
    const studio = JSON.parse(await fs.readFile(path.join(directory, 'studio.json'), 'utf8'))
    campaigns.push({ id: entry.name, directory, data, studio })
  }

  return campaigns
}

test('every repository campaign is complete enough for automatic Studio discovery', async () => {
  const campaigns = await discoverCampaigns()
  assert.ok(campaigns.length >= 5)

  for (const campaign of campaigns) {
    assert.ok(campaign.studio.name, `${campaign.id} is missing studio.name`)
    assert.equal(campaign.studio.days.length, campaign.data.messages.length, `${campaign.id} needs one studio day per message`)

    for (const [index, message] of campaign.data.messages.entries()) {
      const output = message.output || message.file
      const title = message.title || message.subject
      assert.ok(output, `${campaign.id} message ${index + 1} needs output or file`)
      assert.ok(title, `${campaign.id} message ${index + 1} needs title or subject`)
      await fs.access(path.join(campaign.directory, output.replace(/^\.\//, '')))
    }
  }
})

test('UK Salon Onboarding exposes all seven live-preview messages', async () => {
  const campaigns = await discoverCampaigns()
  const onboarding = campaigns.find((campaign) => campaign.id === 'uk-salon-onboarding')
  assert.ok(onboarding)
  assert.equal(onboarding.data.messages.length, 7)
  assert.deepEqual(onboarding.studio.days, [0, 3, 6, 9, 12, 16, 21])
})
