export type TranscriptLanguage = 'th' | 'en' | 'auto'

export interface TranscriptSegment {
  start?: number
  end?: number
  text: string
}

export interface TranscriptResult {
  language: string
  text: string
  segments?: TranscriptSegment[]
}

export interface TranscriptionProvider {
  transcribe(file: File, language: TranscriptLanguage): Promise<TranscriptResult>
}

export class MockTranscriptionProvider implements TranscriptionProvider {
  async transcribe(file: File, language: TranscriptLanguage): Promise<TranscriptResult> {
    return {
      language,
      text: [
        'Transcription requires an STT provider.',
        `Prepared audio file: ${file.name}`,
        'This MVP extracts or prepares audio so you can upload it to NotebookLM or connect an API later.'
      ].join('\n')
    }
  }
}

