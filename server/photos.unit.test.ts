import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { storePhoto, getPhotoPath } from './photos'

const TEST_DIR = path.join(__dirname, '..', 'uploads')

describe('Photo Storage', () => {
  const testBuffer = Buffer.from('fake-jpeg-data-for-testing')
  let storedHash: string

  it('should store a photo and return a 0x-prefixed SHA-256 hash', () => {
    storedHash = storePhoto(testBuffer, 'image/jpeg')
    expect(storedHash).toMatch(/^0x[0-9a-f]{64}$/)
  })

  it('should return the same hash for the same content (idempotent)', () => {
    const hash2 = storePhoto(testBuffer, 'image/jpeg')
    expect(hash2).toBe(storedHash)
  })

  it('should create a file on disk', () => {
    const hex = storedHash.slice(2)
    const filepath = path.join(TEST_DIR, `${hex}.jpg`)
    expect(fs.existsSync(filepath)).toBe(true)
  })

  it('should store PNG with .png extension', () => {
    const pngBuffer = Buffer.from('fake-png-data')
    const hash = storePhoto(pngBuffer, 'image/png')
    const hex = hash.slice(2)
    expect(fs.existsSync(path.join(TEST_DIR, `${hex}.png`))).toBe(true)
  })

  it('should store WebP with .webp extension', () => {
    const webpBuffer = Buffer.from('fake-webp-data')
    const hash = storePhoto(webpBuffer, 'image/webp')
    const hex = hash.slice(2)
    expect(fs.existsSync(path.join(TEST_DIR, `${hex}.webp`))).toBe(true)
  })

  it('should return different hashes for different content', () => {
    const hash1 = storePhoto(Buffer.from('content-a'), 'image/jpeg')
    const hash2 = storePhoto(Buffer.from('content-b'), 'image/jpeg')
    expect(hash1).not.toBe(hash2)
  })
})

describe('Photo Retrieval', () => {
  it('should find a stored photo by hash', () => {
    const buffer = Buffer.from('findable-photo-data')
    const hash = storePhoto(buffer, 'image/jpeg')
    const filepath = getPhotoPath(hash)
    expect(filepath).not.toBeNull()
    expect(fs.existsSync(filepath!)).toBe(true)
  })

  it('should return null for zero hash', () => {
    const zeroHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
    expect(getPhotoPath(zeroHash)).toBeNull()
  })

  it('should return null for non-existent hash', () => {
    const fakeHash = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    expect(getPhotoPath(fakeHash)).toBeNull()
  })

  it('should handle hash without 0x prefix', () => {
    const buffer = Buffer.from('no-prefix-test')
    const hash = storePhoto(buffer, 'image/jpeg')
    const hashNoPrefix = hash.slice(2)
    const filepath = getPhotoPath(hashNoPrefix)
    expect(filepath).not.toBeNull()
  })
})
