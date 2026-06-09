import { NOTEBOOKLM_MAX_SOURCE_MB, SAFE_TARGET_MB } from './notebooklmLimits'

export type NotebookLMStatus = {
  tone: 'green' | 'yellow' | 'red'
  label: string
  helper: string
}

export function bytesToMB(bytes: number): number {
  return bytes / 1024 / 1024
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** index
  return `${value >= 10 ? value.toFixed(1) : value.toFixed(2)} ${units[index]}`
}

export function getNotebookLMStatus(fileSize: number): NotebookLMStatus {
  const mb = bytesToMB(fileSize)
  if (mb <= SAFE_TARGET_MB) {
    return {
      tone: 'green',
      label: 'Ready for NotebookLM',
      helper: 'Below the 190MB safe target.'
    }
  }

  if (mb <= NOTEBOOKLM_MAX_SOURCE_MB) {
    return {
      tone: 'yellow',
      label: 'Near NotebookLM limit',
      helper: 'ใกล้ 200MB แล้ว แนะนำให้บีบหรือแยกไฟล์ก่อน'
    }
  }

  return {
    tone: 'red',
    label: 'Needs compression or splitting',
    helper: 'ไฟล์เกิน 200MB ต้องบีบไฟล์หรือแบ่งเป็นหลาย part'
  }
}

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

export function baseName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '')
}

