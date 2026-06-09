import { Settings2 } from 'lucide-react'
import type { CompressionPreset } from '../lib/ffmpegClient'

export type OutputMode = 'audio' | 'video' | 'split' | 'transcript' | 'full'

type ProcessingOptionsProps = {
  outputMode: OutputMode
  preset: CompressionPreset
  keepTimestamps: boolean
  onOutputModeChange: (mode: OutputMode) => void
  onPresetChange: (preset: CompressionPreset) => void
  onKeepTimestampsChange: (keep: boolean) => void
  onProcess: () => void
  disabled: boolean
}

const outputModes: Array<{ value: OutputMode; label: string; helper: string }> = [
  { value: 'audio', label: 'Extract audio only', helper: 'แยกเสียงสำหรับอัปโหลดต่อ' },
  { value: 'video', label: 'Compress video', helper: 'บีบ MP4 ให้เล็กลง' },
  { value: 'split', label: 'Split file only', helper: 'แบ่งไฟล์ใหญ่เป็นหลาย part' },
  { value: 'transcript', label: 'Transcript only', helper: 'จัด transcript ภาษาไทยให้อ่านง่าย' },
  { value: 'full', label: 'Full preparation mode', helper: 'บีบ แยกเสียง แบ่งไฟล์ และจัด transcript' }
]

const presets: Array<{ value: CompressionPreset; label: string; helper: string }> = [
  { value: 'smallest', label: 'Smallest file / audio only', helper: '48k-64k audio target' },
  { value: 'balanced', label: 'Balanced', helper: '720p, 24fps, 64k audio' },
  { value: 'quality', label: 'Better quality', helper: 'Up to 1080p, 128k audio' }
]

export function ProcessingOptions({
  outputMode,
  preset,
  keepTimestamps,
  onOutputModeChange,
  onPresetChange,
  onKeepTimestampsChange,
  onProcess,
  disabled
}: ProcessingOptionsProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-panel">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sea/10 text-sea">
          <Settings2 aria-hidden="true" size={21} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink">Processing Options</h2>
          <p className="text-sm text-ink/65">Compress for NotebookLM · บีบไฟล์ให้ต่ำกว่า 200MB</p>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-ink">Output mode</legend>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {outputModes.map((mode) => (
            <label
              key={mode.value}
              className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                outputMode === mode.value ? 'border-sea bg-sea/5' : 'border-ink/10 hover:border-ink/30'
              }`}
            >
              <input
                type="radio"
                name="outputMode"
                value={mode.value}
                checked={outputMode === mode.value}
                onChange={() => onOutputModeChange(mode.value)}
                className="mt-1 h-4 w-4 accent-sea"
              />
              <span>
                <span className="block text-sm font-semibold text-ink">{mode.label}</span>
                <span className="block text-sm text-ink/60">{mode.helper}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-ink">Compression preset</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {presets.map((item) => (
            <label
              key={item.value}
              className={`cursor-pointer rounded-lg border p-3 transition ${
                preset === item.value ? 'border-sea bg-sea/5' : 'border-ink/10 hover:border-ink/30'
              }`}
            >
              <input
                type="radio"
                name="preset"
                value={item.value}
                checked={preset === item.value}
                onChange={() => onPresetChange(item.value)}
                className="sr-only"
              />
              <span className="block text-sm font-semibold text-ink">{item.label}</span>
              <span className="mt-1 block text-sm text-ink/60">{item.helper}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-ink/10 p-3">
        <input
          type="checkbox"
          checked={keepTimestamps}
          onChange={(event) => onKeepTimestampsChange(event.target.checked)}
          className="h-4 w-4 accent-sea"
        />
        <span className="text-sm text-ink">Keep transcript timestamps · เก็บ timestamps ไว้</span>
      </label>

      <button
        type="button"
        onClick={onProcess}
        disabled={disabled}
        className="mt-5 min-h-11 w-full rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
      >
        Prepare NotebookLM files
      </button>
    </section>
  )
}

