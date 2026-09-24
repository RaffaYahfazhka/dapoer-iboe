/**
 * Utility functions for client-side image validation and compression
 */

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg']
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg']

export interface ImageValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates that an uploaded file is strictly an image (PNG, JPG, JPEG).
 * Explicitly rejects PDF and non-image document formats.
 */
export function validateImageFile(file: File): ImageValidationResult {
  const extension = '.' + (file.name.split('.').pop() || '').toLowerCase()
  const mimeType = (file.type || '').toLowerCase()

  // Explicit check against PDF
  if (mimeType.includes('pdf') || extension === '.pdf') {
    return {
      valid: false,
      error: 'File PDF tidak didukung! Hanya file gambar/foto (.png, .jpg, .jpeg) dari galeri atau perangkat yang diperbolehkan.',
    }
  }

  // Must match allowed mime types or extensions
  const mimeValid = ALLOWED_MIME_TYPES.includes(mimeType)
  const extValid = ALLOWED_EXTENSIONS.includes(extension)

  if (!mimeValid && !extValid) {
    return {
      valid: false,
      error: 'Format file tidak didukung! Hanya diperbolehkan upload file foto (.png, .jpg, .jpeg). Format PDF atau dokumen lain tidak bisa digunakan.',
    }
  }

  return { valid: true }
}

/**
 * Resizes and compresses an image file to a base64 Data URL using HTML5 Canvas.
 * This guarantees low storage footprint for localStorage and prevents QuotaExceededError.
 */
export function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Safety check
    const validation = validateImageFile(file)
    if (!validation.valid) {
      reject(new Error(validation.error || 'File tidak valid'))
      return
    }

    const reader = new FileReader()

    reader.onerror = () => {
      reject(new Error('Gagal membaca file gambar'))
    }

    reader.onload = (e) => {
      const result = e.target?.result as string
      if (!result) {
        reject(new Error('File gambar kosong'))
        return
      }

      const img = new Image()
      img.onerror = () => {
        reject(new Error('Gagal memuat format gambar'))
      }

      img.onload = () => {
        let width = img.naturalWidth || img.width
        let height = img.naturalHeight || img.height

        // Calculate aspect-ratio scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(result)
          return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        try {
          const dataUrl = canvas.toDataURL(outputFormat, quality)
          resolve(dataUrl)
        } catch {
          resolve(result)
        }
      }

      img.src = result
    }

    reader.readAsDataURL(file)
  })
}
