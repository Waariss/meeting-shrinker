import { useEffect, useMemo, useState } from 'react'
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
import {
  cleanTranscriptText,
  parseSrtToText,
  parseVttToText,
  splitTranscriptByWords
} from './lib/transcriptCleaner'

const accept = SUPPORTED_EXTENSIONS.map((extension) => `.${extension}`).join(',')
const transcriptExtensions = new Set(['txt', 'srt', 'vtt'])
const mediaExtensions = new Set(['mp4', 'mov', 'm4a', 'mp3', 'wav', 'webm'])
const videoExtensions = new Set(['mp4', 'mov', 'webm'])
const audioExtensions = new Set(['m4a', 'mp3', 'wav'])
type Language = 'en' | 'th'
type Theme = 'light' | 'dark'

const copy = {
  en: {
    header: {
      title: 'Meeting Shrinker for NotebookLM',
      subtitle: 'Compress, split, and prepare English or Thai meeting recordings for NotebookLM.',
      warning: 'All compression runs locally in your browser. Large files may take time depending on your device.'
    },
    upload: {
      title: 'Upload Meeting File',
      helper: 'Upload English or Thai meetings: MP4, MP3, M4A, MOV, WEBM, TXT, SRT, or VTT.',
      button: 'Choose files'
    },
    options: {
      title: 'Processing Options',
      subtitle: 'Compress for NotebookLM and keep each output below the safe limit.',
      outputMode: 'Output mode',
      compressionPreset: 'Compression preset',
      keepTimestamps: 'Keep transcript timestamps',
      process: 'Prepare NotebookLM files',
      outputModes: [
        { value: 'audio' as const, label: 'Extract audio only', helper: 'Prepare audio for NotebookLM or STT upload' },
        { value: 'video' as const, label: 'Compress video', helper: 'Reduce MP4 size for easier upload' },
        { value: 'split' as const, label: 'Split file only', helper: 'Split large files into safer parts' },
        { value: 'full' as const, label: 'Full preparation mode', helper: 'Compress, extract audio, and split if needed' }
      ],
      presets: [
        { value: 'smallest' as const, label: 'Smallest file / audio only', helper: '48k-64k audio target' },
        { value: 'balanced' as const, label: 'Balanced', helper: '720p, 24fps, 64k audio' },
        { value: 'quality' as const, label: 'Better quality', helper: 'Up to 1080p, 128k audio' }
      ]
    },
    progress: {
      title: 'Processing status',
      processing: 'Processing',
      idle: 'Preparing local browser tools...'
    },
    results: {
      title: 'NotebookLM Export Pack',
      subtitle: 'Download outputs individually or as one ZIP.',
      downloadZip: 'Download ZIP',
      openNotebookLM: 'Open NotebookLM',
      download: 'Download',
      zipError: 'Could not create ZIP export.'
    },
    privacy: {
      title: 'Privacy-first',
      body: 'Files are processed locally in your browser and are not uploaded to our server in the default mode. If API transcription is enabled in the future, audio may be sent to the selected transcription provider.'
    },
    side: {
      limitsTitle: 'NotebookLM limits',
      limits: [
        'Local source size assumption: around 200MB per source.',
        'Safe split target: 190MB per output file.',
        'Uploaded transcript target: under 450,000 words per output file.'
      ],
      transcriptTitle: 'Transcript cleanup now, auto transcript later',
      transcriptBody:
        'Available now: upload an existing English or Thai TXT, SRT, or VTT transcript to clean and split it for NotebookLM. Coming feature: creating a transcript directly from audio/video. Until then, use the extracted audio with NotebookLM or another STT tool.',
      memoryNote:
        'Mobile browsers may run out of memory on long meetings. For large Google Meet recordings, use a laptop or desktop browser.'
    },
    messages: {
      uploadFirst: 'Please upload a meeting file first.',
      unsupported: 'Unsupported file type. Try converting the file to MP4, MP3, TXT, SRT, or VTT first.',
      hugeFile: 'This file is very large. Mobile browsers may not have enough memory; use a laptop or desktop.',
      noOutput: 'No output files were created.',
      cannotProcess: 'Could not process this file. Try converting it to MP4 or MP3 first.',
      splitLarge: 'Output is still above 190MB. Splitting into multiple parts.',
      extractingAudio: 'Extracting audio for transcription or NotebookLM upload...',
      audioAlreadyReady: 'Audio file is already ready for NotebookLM. Checking whether it needs splitting...',
      compressingVideo: 'Compressing video with selected preset...',
      skippingVideoForAudio: 'Skipping video compression for audio-only input.',
      splittingFile: 'Splitting file into NotebookLM-safe parts...',
      done: 'Done. NotebookLM-ready files are available below.'
    }
  },
  th: {
    header: {
      title: 'Meeting Shrinker สำหรับ NotebookLM',
      subtitle: 'บีบไฟล์ แบ่งไฟล์ และเตรียมไฟล์ประชุมภาษาไทยหรืออังกฤษสำหรับ NotebookLM',
      warning: 'การบีบอัดทำใน browser ของคุณทั้งหมด ไฟล์ใหญ่อาจใช้เวลานานตามเครื่องที่ใช้'
    },
    upload: {
      title: 'อัปโหลดไฟล์ประชุม',
      helper: 'รองรับ meeting ภาษาไทยหรืออังกฤษ: MP4, MP3, M4A, MOV, WEBM, TXT, SRT หรือ VTT',
      button: 'เลือกไฟล์'
    },
    options: {
      title: 'ตัวเลือกการประมวลผล',
      subtitle: 'บีบไฟล์สำหรับ NotebookLM และคุม output ให้อยู่ใต้ safe limit',
      outputMode: 'รูปแบบ output',
      compressionPreset: 'ระดับการบีบอัด',
      keepTimestamps: 'เก็บ timestamps ใน transcript',
      process: 'เตรียมไฟล์สำหรับ NotebookLM',
      outputModes: [
        { value: 'audio' as const, label: 'แยกเสียงเท่านั้น', helper: 'เตรียม audio สำหรับ NotebookLM หรือ STT' },
        { value: 'video' as const, label: 'บีบวิดีโอ', helper: 'ลดขนาด MP4 เพื่ออัปโหลดง่ายขึ้น' },
        { value: 'split' as const, label: 'แบ่งไฟล์เท่านั้น', helper: 'แบ่งไฟล์ใหญ่เป็นหลาย part' },
        { value: 'full' as const, label: 'เตรียมครบชุด', helper: 'บีบ แยกเสียง และแบ่งไฟล์เมื่อจำเป็น' }
      ],
      presets: [
        { value: 'smallest' as const, label: 'เล็กสุด / audio only', helper: 'เป้าหมายเสียง 48k-64k' },
        { value: 'balanced' as const, label: 'สมดุล', helper: '720p, 24fps, audio 64k' },
        { value: 'quality' as const, label: 'คุณภาพดีกว่า', helper: 'สูงสุด 1080p, audio 128k' }
      ]
    },
    progress: {
      title: 'สถานะการประมวลผล',
      processing: 'กำลังประมวลผล',
      idle: 'กำลังเตรียมเครื่องมือใน browser...'
    },
    results: {
      title: 'ชุดไฟล์สำหรับ NotebookLM',
      subtitle: 'ดาวน์โหลดทีละไฟล์หรือรวมเป็น ZIP ได้',
      downloadZip: 'ดาวน์โหลด ZIP',
      openNotebookLM: 'เปิด NotebookLM',
      download: 'ดาวน์โหลด',
      zipError: 'ไม่สามารถสร้าง ZIP ได้'
    },
    privacy: {
      title: 'Privacy-first',
      body: 'ไฟล์ถูกประมวลผลใน browser ของคุณ และ default mode จะไม่อัปโหลดไฟล์ไป server ของเรา ถ้าอนาคตเปิด API transcription เสียงอาจถูกส่งไปยัง provider ที่เลือก'
    },
    side: {
      limitsTitle: 'Limit ของ NotebookLM',
      limits: [
        'สมมติฐาน local source size: ประมาณ 200MB ต่อ source',
        'safe split target: 190MB ต่อไฟล์ output',
        'เป้าหมาย transcript ที่อัปโหลดเอง: ต่ำกว่า 450,000 คำต่อไฟล์ output'
      ],
      transcriptTitle: 'ตอนนี้ clean transcript ได้ / auto transcript ยังเป็น Coming feature',
      transcriptBody:
        'ทำได้ตอนนี้: ถ้ามี transcript ภาษาไทยหรืออังกฤษเป็น TXT, SRT หรือ VTT อยู่แล้ว สามารถอัปโหลดเพื่อ clean และ split สำหรับ NotebookLM ได้ ส่วนที่ยังไม่มี: การสร้าง transcript จากเสียง/วิดีโอโดยตรง ระหว่างนี้ให้ใช้ audio ที่แยกออกมากับ NotebookLM หรือ STT tool อื่นก่อน',
      memoryNote: 'ไฟล์ประชุมยาว ๆ อาจทำให้ browser มือถือ memory ไม่พอ แนะนำให้ใช้ laptop หรือ desktop'
    },
    messages: {
      uploadFirst: 'กรุณาอัปโหลดไฟล์ประชุมก่อน',
      unsupported: 'ไม่รองรับไฟล์นี้ ลองแปลงเป็น MP4, MP3, TXT, SRT หรือ VTT ก่อน',
      hugeFile: 'ไฟล์นี้ใหญ่มาก มือถืออาจประมวลผลไม่ไหว แนะนำให้ใช้คอม',
      noOutput: 'ไม่พบไฟล์ผลลัพธ์',
      cannotProcess: 'ไม่สามารถประมวลผลไฟล์นี้ได้ ลองแปลงเป็น MP4 หรือ MP3 ก่อน',
      splitLarge: 'ไฟล์ยังเกิน 190MB ระบบจะแบ่งเป็นหลาย part ให้',
      extractingAudio: 'กำลังแยกเสียงสำหรับ transcription หรือ NotebookLM...',
      audioAlreadyReady: 'ไฟล์เสียงพร้อมใช้แล้ว กำลังตรวจว่าต้องแบ่งไฟล์หรือไม่...',
      compressingVideo: 'กำลังบีบวิดีโอตาม preset ที่เลือก...',
      skippingVideoForAudio: 'ข้ามการบีบวิดีโอ เพราะ input เป็นไฟล์เสียง',
      splittingFile: 'กำลังแบ่งไฟล์ให้อยู่ในขนาดที่เหมาะกับ NotebookLM...',
      done: 'เสร็จแล้ว ไฟล์สำหรับ NotebookLM อยู่ด้านล่าง'
    }
  }
}

function App() {
  const [language, setLanguage] = useState<Language>('en')
  const [theme, setTheme] = useState<Theme>('light')
  const [files, setFiles] = useState<File[]>([])
  const [outputMode, setOutputMode] = useState<OutputMode>('full')
  const [preset, setPreset] = useState<CompressionPreset>('balanced')
  const [keepTimestamps, setKeepTimestamps] = useState(false)
  const [results, setResults] = useState<File[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string>()
  const [isProcessing, setIsProcessing] = useState(false)
  const t = copy[language]

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'th'
  }, [language])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

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
      setError(t.messages.uploadFirst)
      return false
    }

    if (unsupportedFiles.length) {
      setError(t.messages.unsupported)
      return false
    }

    if (files.some((file) => bytesToMB(file.size) > MAX_BROWSER_FRIENDLY_MB)) {
      setError(t.messages.hugeFile)
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
    const extension = getFileExtension(file.name)
    const isVideo = videoExtensions.has(extension)
    const isAudio = audioExtensions.has(extension)

    if (outputMode === 'audio' || outputMode === 'full') {
      addLog(isAudio ? t.messages.audioAlreadyReady : t.messages.extractingAudio)
      const audio = isAudio ? file : await extractAudio(file, preset, addLog)
      outputs.push(audio)
      if (bytesToMB(audio.size) > SAFE_TARGET_MB) {
        addLog(t.messages.splitLarge)
        outputs.push(...(await splitMediaByDuration(audio, SAFE_TARGET_MB)))
      }
    }

    if ((outputMode === 'video' || outputMode === 'full') && isVideo) {
      addLog(t.messages.compressingVideo)
      const compressed = await compressVideo(file, preset, addLog)
      if (bytesToMB(compressed.size) > SAFE_TARGET_MB) {
        addLog(t.messages.splitLarge)
        outputs.push(...(await splitMediaByDuration(compressed, SAFE_TARGET_MB)))
      } else {
        outputs.push(compressed)
      }
    } else if ((outputMode === 'video' || outputMode === 'full') && isAudio) {
      addLog(t.messages.skippingVideoForAudio)
    }

    if (outputMode === 'split') {
      addLog(t.messages.splittingFile)
      outputs.push(...(await splitMediaByDuration(file, SAFE_TARGET_MB)))
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
        setError(t.messages.noOutput)
      } else {
        setResults(dedupeOutputs(outputs))
        addLog(t.messages.done)
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unknown error'
      setError(`${t.messages.cannotProcess} (${message})`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-dvh bg-mist transition-colors dark:bg-[#0d171c]">
      <Header
        language={language}
        theme={theme}
        title={t.header.title}
        subtitle={t.header.subtitle}
        warning={t.header.warning}
        onLanguageToggle={() => setLanguage((current) => (current === 'en' ? 'th' : 'en'))}
        onThemeToggle={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
      />
      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <FileDropzone
          onFilesSelected={handleFilesSelected}
          accept={accept}
          title={t.upload.title}
          helper={t.upload.helper}
          buttonLabel={t.upload.button}
        />

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
              copy={t.options}
              onOutputModeChange={setOutputMode}
              onPresetChange={setPreset}
              onKeepTimestampsChange={setKeepTimestamps}
              onProcess={handleProcess}
              disabled={isProcessing}
            />
            <ProgressPanel
              logs={logs}
              isProcessing={isProcessing}
              error={error}
              title={t.progress.title}
              idleText={t.progress.idle}
              processingText={t.progress.processing}
            />
            <ResultsPanel files={results} onError={setError} copy={t.results} />
          </div>

          <aside className="grid content-start gap-5">
            <PrivacyNotice title={t.privacy.title} body={t.privacy.body} />
            <section className="rounded-lg border border-ink/10 bg-white p-5 dark:border-white/10 dark:bg-[#111f27]">
              <div className="flex items-center gap-3">
                <ListChecks aria-hidden="true" className="text-sea" size={22} />
                <h2 className="text-base font-semibold text-ink dark:text-white">{t.side.limitsTitle}</h2>
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/70 dark:text-white/70">
                {t.side.limits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border border-ink/10 bg-white p-5 dark:border-white/10 dark:bg-[#111f27]">
              <div className="flex items-center gap-3">
                <Languages aria-hidden="true" className="text-sea" size={22} />
                <h2 className="text-base font-semibold text-ink dark:text-white">{t.side.transcriptTitle}</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink/70 dark:text-white/70">{t.side.transcriptBody}</p>
            </section>
            <section className="rounded-lg border border-clay/20 bg-clay/5 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle aria-hidden="true" className="mt-1 shrink-0 text-clay" size={21} />
                <p className="text-sm leading-6 text-ink/75 dark:text-white/75">{t.side.memoryNote}</p>
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
