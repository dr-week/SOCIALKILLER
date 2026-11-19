import { describe, it } from 'node:test'
import assert from 'node:assert'

describe('marketing integrations', () => {
  it('scans developer communities and converts signals into topics', async () => {
    const { scanAllDeveloperCommunities, convertSignalToTopic } = await import('./marketing/community-scanner.mjs')
    const scanResult = await scanAllDeveloperCommunities({ tag: 'javascript' })
    assert.ok(scanResult.scannedAt)
    assert.ok(Array.isArray(scanResult.signals))
    const topic = convertSignalToTopic({
      id: 'mock-101',
      channel: 'stackoverflow',
      title: 'How to optimize event loop latency in Node 22',
      url: 'https://stackoverflow.com/questions/mock-101',
      summary: 'Stack Overflow active discussion on Node 22 performance',
      extractedPillar: 'Hard Numbers & Benchmarks'
    })
    assert.strictEqual(topic.pillar, 'Hard Numbers & Benchmarks')
    assert.ok(topic.hook.includes('How to optimize event loop latency'))
  })

  it('encrypts credentials in SQLite and verifies the Discord ping path', async () => {
    process.env.FOLLOWDESK_VAULT_KEY = 'test-only-followdesk-vault-key-32-characters'
    const { savePlatformVaultCredentials, getPlatformVaultCredentials, encryptSecret, decryptSecret } =
      await import('./credential-store.mjs')
    const raw = { apiKey: 'secret_test_token_999', clientId: 'client_123' }
    const encrypted = encryptSecret(raw)
    assert.strictEqual(decryptSecret(encrypted.encryptedSecret, encrypted.iv, encrypted.authTag).apiKey, raw.apiKey)
    savePlatformVaultCredentials('x', { apiKey: 'persisted_x_key' })
    assert.strictEqual(getPlatformVaultCredentials('x').apiKey, 'persisted_x_key')
    const { ping } = await import('./posting/discord/index.mjs')
    assert.strictEqual((await ping({ webhookUrl: 'invalid_url' })).connected, false)
  })
})
