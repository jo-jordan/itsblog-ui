import { t } from '../i18n'

// Shrinks a photo in the browser before upload, so originals never leave the
// device and the site needs no paid image service.
export async function resizeImage(file, maxSize, quality) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) {
    throw new Error(t('footprints.detail.imageFailed'))
  }
  return { blob, width, height }
}
