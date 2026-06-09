import { useMemo, useState } from 'react'
import { AlertCircle, Languages, ListChecks } from 'lucide-react'
import { FileDropzone } from './components/FileDropzone'
import { FileInfoCard } from './components/FileInfoCard'
import { Header } from './components/Header'
import { PrivacyNotice } from './components/PrivacyNotice'
import { ProcessingOptions, type OutputMode } from './components/ProcessingOptions'
import { ProgressPanel } from './components/ProgressPanel'
import { ResultsPanel } from './components/ResultsPanel'
import { compressVideo, extractAudio, splitMediaByDuration, type CompressionPreset } from './lib/ffmpegClient'
import { baseName, bytesToMB, getFileExtension } from './lib/fileSize'
import {
  MAX_BROWSER_FRIENDLY_MB,
  SAFE_TARGET_MB,
  SAFE_TARGET_WORDS,
  SUPPORTED_EXTENSIONS
} from './lib/notebooklmLimits'
import { splitBlobBySize } from './lib/splitFile'
import {
  cleanTranscriptText,
  parseSrtToText,
  parseVttToText,
  splitTranscriptByWords
} from './lib/transcriptCleaner'
import { MockTranscriptionProvider } from './types/transcript'

const accept = SUPPORTED_EXTENSIONS.map((extension) => `.${extension}`).join(',')
const transcriptExtensions = new Set(['txt', 'srt', 'vtt'])
const mediaExtensions = new Set(['mp4', 'mov', 'm4a', 'mp3', 'wav', 'webm'])

function App() {
  const [files, setFiles] = useState<File[]>([])
  const [outputMode, setOutputMode] = useState<OutputMode>('full')
  const [preset, setPreset] = useState<CompressionPreset>('balanced')
  const [keepTimestamps, setKeepTimestamps] = useState(false)
  const [results, setResults] = useState<File[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string>()
  const [isProcessing, setIsProcessing] = useState(false)

  const primaryFile = files[0]
  const unsupportedFiles = useMemo(
    () => files.filter((file) => !SUPPORTED_EXTENSIONS.includes(getFileExtension(file.name) as never)),
    [files]
  )

  const addLog = (message: string) => {
    setLogs((current) => [...current, message])
  }

  const handleFilesSelected = (nextFiles: File[]) => {
    setError(undefined)
    setLogs([])
    setResults([])
    setFiles(nextFiles)
  }

  const validateFiles = () => {
    if (!files.length) {
      setError('Please upload a meeting file first. กรุณาอัปโหลดไฟล์ก่อน')
      return false
    }

    if (unsupportedFiles.length) {
      setError('Unsupported file type. ไม่สามารถประมวลผลไฟล์นี้ได้ ลองแปลงเป็น MP4 หรือ MP3 ก่อน')
      return false
    }

    if (files.some((file) => bytesToMB(file.size) > MAX_BROWSER_FRIENDLY_MB)) {
      setError('ไฟล์นี้ใหญ่มาก มือถืออาจประมวลผลไม่ไหว แนะนำให้ใช้คอม')
      return false
    }

    return true
  }

  const prepareTranscriptFile = async (file: File): Promise<File[]> => {
    const extension = getFileExtension(file.name)
    const rawText = await file.text()
    const normalized =
      extension === 'srt'
        ? parseSrtToText(rawText, keepTimestamps)
        : extension === 'vtt'
          ? parseVttToText(rawText, keepTimestamps)
          : rawText
    const cleaned = cleanTranscriptText(normalized, {
      keepTimestamps,
      collapseWhitespace: true
    })
    const chunks = splitTranscriptByWords(cleaned, SAFE_TARGET_WORDS)

    return chunks.map(
      (chunk, index) =>
        new File([chunk], `${baseName(file.name)}_transcript_part-${String(index + 1).padStart(3, '0')}.txt`, {
          type: 'text/plain;charset=utf-8'
        })
    )
  }

  const prepareMediaFile = async (file: File): Promise<File[]> => {
    const outputs: File[] = []

    if (outputMode === 'audio' || outputMode === 'full') {
      addLog('Extracting audio for transcription or NotebookLM upload...')
      const audio = await extractAudio(file, preset, addLog)
      outputs.push(audio)
      if (bytesToMB(audio.size) > SAFE_TARGET_MB) {
        addLog('ไฟล์ยังเกิน 190MB ระบบจะแบ่งเป็นหลาย part ให้')
        outputs.push(...splitBlobBySize(audio, SAFE_TARGET_MB))
      }
    }

    if (outputMode === 'video' || outputMode === 'full') {
      addLog('Compressing video with selected preset...')
      const compressed = await compressVideo(file, preset, addLog)
      if (bytesToMB(compressed.size) > SAFE_TARGET_MB) {
        addLog('Compressed output is still above 190MB. Splitting into parts...')
        outputs.push(...(await splitMediaByDuration(compressed, SAFE_TARGET_MB)))
      } else {
        outputs.push(compressed)
      }
    }

    if (outputMode === 'split') {
      addLog('Splitting file into NotebookLM-safe parts...')
      outputs.push(...(await splitMediaByDuration(file, SAFE_TARGET_MB)))
    }

    if ((outputMode === 'transcript' || outputMode === 'full') && mediaExtensions.has(getFileExtension(file.name))) {
      const provider = new MockTranscriptionProvider()
      const mock = await provider.transcribe(file, 'th')
      outputs.push(
        new File([mock.text], `${baseName(file.name)}_transcription-placeholder.txt`, {
          type: 'text/plain;charset=utf-8'
        })
      )
    }

    return outputs
  }

  const handleProcess = async () => {
    if (!validateFiles()) return

    setIsProcessing(true)
    setError(undefined)
    setLogs([])
    setResults([])

    try {
      const outputs: File[] = []
      for (const file of files) {
        const extension = getFileExtension(file.name)
        addLog(`Preparing ${file.name}...`)

        if (transcriptExtensions.has(extension)) {
          outputs.push(...(await prepareTranscriptFile(file)))
          continue
        }

        if (mediaExtensions.has(extension)) {
          outputs.push(...(await prepareMediaFile(file)))
        }
      }

      if (!outputs.length) {
        setError('No output files were created. ไม่พบไฟล์ผลลัพธ์')
      } else {
        setResults(dedupeOutputs(outputs))
        addLog('Done. NotebookLM-ready files are available below.')
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unknown error'
      setError(`ไม่สามารถประมวลผลไฟล์นี้ได้ ลองแปลงเป็น MP4 หรือ MP3 ก่อน (${message})`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-dvh bg-mist">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <FileDropzone onFilesSelected={handleFilesSelected} accept={accept} />

        {primaryFile ? (
          <div className="grid gap-4">
            {files.map((file) => (
              <FileInfoCard key={`${file.name}-${file.size}-${file.lastModified}`} file={file} />
            ))}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="grid gap-5">
            <ProcessingOptions
              outputMode={outputMode}
              preset={preset}
              keepTimestamps={keepTimestamps}
              onOutputModeChange={setOutputMode}
              onPresetChange={setPreset}
              onKeepTimestampsChange={setKeepTimestamps}
              onProcess={handleProcess}
              disabled={isProcessing}
            />
            <ProgressPanel logs={logs} isProcessing={isProcessing} error={error} />
            <ResultsPanel files={results} onError={setError} />
          </div>

          <aside className="grid content-start gap-5">
            <PrivacyNotice />
            <section className="rounded-lg border border-ink/10 bg-white p-5">
              <div className="flex items-center gap-3">
                <ListChecks aria-hidden="true" className="text-sea" size={22} />
                <h2 className="text-base font-semibold text-ink">NotebookLM limits</h2>
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/70">
                <li>Local source size assumption: around 200MB per source.</li>
                <li>Safe split target: 190MB per output file.</li>
                <li>Transcript text target: under 450,000 words per file.</li>
              </ul>
            </section>
            <section className="rounded-lg border border-ink/10 bg-white p-5">
              <div className="flex items-center gap-3">
                <Languages aria-hidden="true" className="text-sea" size={22} />
                <h2 className="text-base font-semibold text-ink">Generate transcript</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink/70">
                Transcription requires an STT provider. This MVP prepares the audio file. You can upload the extracted
                audio to NotebookLM or connect a transcription API later.
              </p>
            </section>
            <section className="rounded-lg border border-clay/20 bg-clay/5 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle aria-hidden="true" className="mt-1 shrink-0 text-clay" size={21} />
                <p className="text-sm leading-6 text-ink/75">
                  Mobile browsers may run out of memory on long meetings. For large Google Meet recordings, use a laptop
                  or desktop browser.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}

function dedupeOutputs(files: File[]): File[] {
  const seen = new Set<string>()
  return files.filter((file) => {
    const key = `${file.name}-${file.size}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default App
