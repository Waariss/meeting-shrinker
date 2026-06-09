export const NOTEBOOKLM_MAX_SOURCE_MB = 200
export const SAFE_TARGET_MB = 190
export const NOTEBOOKLM_MAX_WORDS = 500000
export const SAFE_TARGET_WORDS = 450000
export const MAX_BROWSER_FRIENDLY_MB = 1200

export const SUPPORTED_EXTENSIONS = [
  'mp4',
  'mov',
  'm4a',
  'mp3',
  'wav',
  'webm',
  'txt',
  'srt',
  'vtt'
] as const

export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number]

