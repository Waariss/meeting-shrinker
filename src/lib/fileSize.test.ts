import { describe, expect, it } from 'vitest'
import { baseName, bytesToMB, formatBytes, getFileExtension, getNotebookLMStatus } from './fileSize'

describe('fileSize helpers', () => {
  it('converts bytes to megabytes', () => {
    expect(bytesToMB(1024 * 1024)).toBe(1)
  })

  it('formats bytes with readable units', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1024)).toBe('1.00 KB')
    expect(formatBytes(10 * 1024 * 1024)).toBe('10.0 MB')
  })

  it('detects NotebookLM status thresholds', () => {
    expect(getNotebookLMStatus(10 * 1024 * 1024).tone).toBe('green')
    expect(getNotebookLMStatus(195 * 1024 * 1024).tone).toBe('yellow')
    expect(getNotebookLMStatus(201 * 1024 * 1024).tone).toBe('red')
  })

  it('extracts extensions and base names', () => {
    expect(getFileExtension('Meeting.Final.MP4')).toBe('mp4')
    expect(baseName('Meeting.Final.MP4')).toBe('Meeting.Final')
  })
})
