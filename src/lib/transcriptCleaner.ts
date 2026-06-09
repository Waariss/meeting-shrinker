import { SAFE_TARGET_WORDS } from './notebooklmLimits'

export type TranscriptCleanOptions = {
  keepTimestamps: boolean
  collapseWhitespace: boolean
}

const timestampLinePattern =
  /^(?:\d+\s*)?(?:\d{1,2}:)?\d{2}:\d{2}(?:[.,]\d{1,3})?\s*(?:-->|-)\s*(?:\d{1,2}:)?\d{2}:\d{2}(?:[.,]\d{1,3})?/i

export function parseSrtToText(text: string, keepTimestamps: boolean): string {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim()
      if (!trimmed) return true
      if (/^\d+$/.test(trimmed)) return false
      if (!keepTimestamps && timestampLinePattern.test(trimmed)) return false
      return true
    })
    .join('\n')
}

export function parseVttToText(text: string, keepTimestamps: boolean): string {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed === 'WEBVTT') return trimmed !== 'WEBVTT'
      if (/^(NOTE|STYLE|REGION)\b/i.test(trimmed)) return false
      if (!keepTimestamps && timestampLinePattern.test(trimmed)) return false
      return true
    })
    .join('\n')
}

export function cleanTranscriptText(
  text: string,
  options: TranscriptCleanOptions = { keepTimestamps: false, collapseWhitespace: true }
): string {
  let cleaned = text.replace(/\r/g, '')

  if (!options.keepTimestamps) {
    cleaned = cleaned
      .split('\n')
      .filter((line) => !timestampLinePattern.test(line.trim()))
      .join('\n')
  }

  cleaned = cleaned
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (options.collapseWhitespace) {
    cleaned = cleaned
      .split('\n')
      .map((line) => line.replace(/[ \t]{2,}/g, ' ').trim())
      .join('\n')
      .trim()
  }

  return cleaned
}

export function splitTranscriptByWords(text: string, maxWords = SAFE_TARGET_WORDS): string[] {
  const paragraphs = text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean)
  const chunks: string[] = []
  let current: string[] = []
  let currentWords = 0

  for (const paragraph of paragraphs.length ? paragraphs : [text]) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (words.length > maxWords) {
      if (current.length) {
        chunks.push(current.join('\n\n'))
        current = []
        currentWords = 0
      }
      for (let index = 0; index < words.length; index += maxWords) {
        chunks.push(words.slice(index, index + maxWords).join(' '))
      }
      continue
    }

    if (currentWords + words.length > maxWords && current.length) {
      chunks.push(current.join('\n\n'))
      current = []
      currentWords = 0
    }

    current.push(paragraph)
    currentWords += words.length
  }

  if (current.length) chunks.push(current.join('\n\n'))
  return chunks.length ? chunks : ['']
}

