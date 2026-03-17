import { describe, it, expect } from 'vitest'

const EAS_GRAPHQL = 'https://base-sepolia.easscan.org/graphql'
const REVIEW_SCHEMA_UID = '0x968e91f0274b78a31037839b55e59b942dd1521daebf9190268137e450b7d69f'
const EXPECTED_SCHEMA = 'uint8 rating, string text, string placeId, string placeName, bytes32 photoHash, int256 lat, int256 lng, uint8 qualityScore'

describe('EAS On-Chain Integration (Base Sepolia)', () => {
  it('should have our review schema registered on-chain', async () => {
    const res = await fetch(EAS_GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { schema(where: { id: "${REVIEW_SCHEMA_UID}" }) { id schema resolver revocable } }`,
      }),
    })

    expect(res.ok).toBe(true)
    const data = await res.json()
    const schema = data.data?.schema

    expect(schema).toBeTruthy()
    expect(schema.id).toBe(REVIEW_SCHEMA_UID)
    expect(schema.schema).toBe(EXPECTED_SCHEMA)
    expect(schema.resolver).toBe('0x0000000000000000000000000000000000000000')
    expect(schema.revocable).toBe(false)
  })

  it('should have at least one attestation submitted for our schema', async () => {
    const res = await fetch(EAS_GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { attestations(where: { schemaId: { equals: "${REVIEW_SCHEMA_UID}" } }, take: 1) { id txid attester time decodedDataJson } }`,
      }),
    })

    expect(res.ok).toBe(true)
    const data = await res.json()
    const attestations = data.data?.attestations

    expect(attestations).toBeTruthy()
    expect(attestations.length).toBeGreaterThanOrEqual(1)

    const attestation = attestations[0]
    expect(attestation.id).toMatch(/^0x[0-9a-f]{64}$/i)
    expect(attestation.txid).toMatch(/^0x[0-9a-f]{64}$/i)
    expect(attestation.attester).toMatch(/^0x[0-9a-fA-F]{40}$/)
    expect(attestation.time).toBeGreaterThan(0)
  })

  it('should decode attestation data with correct field types', async () => {
    const res = await fetch(EAS_GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { attestations(where: { schemaId: { equals: "${REVIEW_SCHEMA_UID}" } }, take: 1, orderBy: [{ time: desc }]) { decodedDataJson } }`,
      }),
    })

    const data = await res.json()
    const attestation = data.data?.attestations?.[0]
    expect(attestation).toBeTruthy()

    const decoded = JSON.parse(attestation.decodedDataJson)
    expect(Array.isArray(decoded)).toBe(true)

    // Verify all expected fields exist with correct types
    const fieldNames = decoded.map((f: { name: string }) => f.name)
    expect(fieldNames).toContain('rating')
    expect(fieldNames).toContain('text')
    expect(fieldNames).toContain('placeId')
    expect(fieldNames).toContain('placeName')
    expect(fieldNames).toContain('photoHash')
    expect(fieldNames).toContain('lat')
    expect(fieldNames).toContain('lng')
    expect(fieldNames).toContain('qualityScore')

    // Verify rating is a valid number 1-5
    const rating = decoded.find((f: { name: string }) => f.name === 'rating')
    const ratingVal = Number(rating.value.value)
    expect(ratingVal).toBeGreaterThanOrEqual(1)
    expect(ratingVal).toBeLessThanOrEqual(5)

    // Verify text is non-empty
    const text = decoded.find((f: { name: string }) => f.name === 'text')
    expect(text.value.value.length).toBeGreaterThan(0)

    // Verify qualityScore is 0-100
    const quality = decoded.find((f: { name: string }) => f.name === 'qualityScore')
    const qualityVal = Number(quality.value.value)
    expect(qualityVal).toBeGreaterThanOrEqual(0)
    expect(qualityVal).toBeLessThanOrEqual(100)
  })

  it('should produce a schema UID that matches encodePacked computation', async () => {
    const { keccak256, toUtf8Bytes, getBytes, concat } = await import('ethers')

    // Compute locally
    const packed = concat([
      toUtf8Bytes(EXPECTED_SCHEMA),
      getBytes('0x0000000000000000000000000000000000000000'),
      new Uint8Array([0]),
    ])
    const computedUID = keccak256(packed)

    // Must match what's on-chain
    expect(computedUID).toBe(REVIEW_SCHEMA_UID)

    // Verify on-chain schema has this UID
    const res = await fetch(EAS_GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { schema(where: { id: "${computedUID}" }) { id } }`,
      }),
    })
    const data = await res.json()
    expect(data.data?.schema?.id).toBe(computedUID)
  })
})
