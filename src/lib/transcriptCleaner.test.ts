import { describe, expect, it } from 'vitest'
import { cleanTranscriptText, parseSrtToText, parseVttToText, splitTranscriptByWords } from './transcriptCleaner'

describe('transcriptCleaner', () => {
  it('cleans whitespace and removes timestamp lines by default', () => {
    const input = '00:00:01,000 --> 00:00:02,000\n  Hello   world  \n\n\nสวัสดี   ครับ '

    expect(cleanTranscriptText(input)).toBe('Hello world\n\nสวัสดี ครับ')
  })

  it('parses SRT and removes sequence numbers and timestamps', () => {
    const input = '1\n00:00:00,000 --> 00:00:02,000\nHello\n\n2\n00:00:02,000 --> 00:00:04,000\nสวัสดี'

    expect(parseSrtToText(input, false)).toBe('Hello\n\nสวัสดี')
  })

  it('keeps SRT timestamps when requested', () => {
    const input = '1\n00:00:00,000 --> 00:00:02,000\nHello'

    expect(parseSrtToText(input, true)).toContain('00:00:00,000 --> 00:00:02,000')
    expect(parseSrtToText(input, true)).not.toContain('\n1\n')
  })

  it('parses VTT and removes WEBVTT header', () => {
    const input = 'WEBVTT\n\n00:00:00.000 --> 00:00:02.000\nEnglish line\n\n00:00:02.000 --> 00:00:04.000\nบรรทัดไทย'

    expect(parseVttToText(input, false)).toBe('\nEnglish line\n\nบรรทัดไทย')
  })

  it('keeps VTT timestamps when requested', () => {
    const input = 'WEBVTT\n\n00:00:00.000 --> 00:00:02.000\nEnglish line'

    expect(parseVttToText(input, true)).toContain('00:00:00.000 --> 00:00:02.000')
    expect(parseVttToText(input, true)).not.toContain('WEBVTT')
  })

  it('splits transcript by max word count while preserving Thai and English text', () => {
    const input = 'one two three four five\n\nสวัสดี ครับ วันนี้ ประชุม'

    const chunks = splitTranscriptByWords(input, 5)

    expect(chunks).toHaveLength(2)
    expect(chunks[0].split(/\s+/)).toHaveLength(5)
    expect(chunks[1]).toContain('สวัสดี')
  })
})
