import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const PHOTO_DIR = path.join(__dirname, '..', 'uploads')

// Ensure upload directory exists
if (!fs.existsSync(PHOTO_DIR)) {
  fs.mkdirSync(PHOTO_DIR, { recursive: true })
}

/** Store a photo buffer and return its SHA-256 hash */
export function storePhoto(buffer: Buffer, mimeType: string): string {
  const hash = crypto.createHash('sha256').update(buffer).digest('hex')
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg'
  const filename = `${hash}.${ext}`
  const filepath = path.join(PHOTO_DIR, filename)

  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, buffer)
  }

  return `0x${hash}`
}

/** Get the file path for a photo by its hash (with 0x prefix) */
export function getPhotoPath(hash: string): string | null {
  const hex = hash.startsWith('0x') ? hash.slice(2) : hash
  const ZERO_HASH = '0'.repeat(64)
  if (hex === ZERO_HASH) return null

  for (const ext of ['jpg', 'png', 'webp']) {
    const filepath = path.join(PHOTO_DIR, `${hex}.${ext}`)
    if (fs.existsSync(filepath)) return filepath
  }
  return null
}
