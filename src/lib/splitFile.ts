import { baseName } from './fileSize'

export function splitBlobBySize(file: File | Blob, targetSizeMB: number, name = 'meeting_part'): File[] {
  const targetBytes = targetSizeMB * 1024 * 1024
  if (file.size <= targetBytes) {
    return [file instanceof File ? file : new File([file], `${name}-001.bin`)]
  }

  const totalParts = Math.ceil(file.size / targetBytes)
  const extension = file instanceof File ? file.name.split('.').pop() || 'bin' : 'bin'
  const rootName = file instanceof File ? baseName(file.name) : name
  const files: File[] = []

  for (let part = 0; part < totalParts; part += 1) {
    const start = part * targetBytes
    const end = Math.min(start + targetBytes, file.size)
    const blob = file.slice(start, end, file.type)
    files.push(
      new File([blob], `${rootName}_part-${String(part + 1).padStart(3, '0')}.${extension}`, {
        type: file.type
      })
    )
  }

  return files
}

