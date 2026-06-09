import JSZip from 'jszip'

export async function createZip(files: File[], zipName = 'notebooklm-export-pack.zip'): Promise<File> {
  const zip = new JSZip()
  files.forEach((file) => zip.file(file.name, file))
  const blob = await zip.generateAsync({ type: 'blob' })
  return new File([blob], zipName, { type: 'application/zip' })
}

export function downloadFile(file: File): void {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

