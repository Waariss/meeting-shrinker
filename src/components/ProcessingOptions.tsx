import { Settings2 } from 'lucide-react'
import type { CompressionPreset } from '../lib/ffmpegClient'

export type OutputMode = 'audio' | 'video' | 'split' | 'transcript' | 'full'

type ProcessingOptionsProps = {
  outputMode: OutputMode
  preset: CompressionPreset
  keepTimestamps: boolean
  copy: {
    title: string
    subtitle: string
    outputMode: string
    compressionPreset: string
    keepTimestamps: string
    process: string
    outputModes: Array<{ value: OutputMode; label: string; helper: string }>
    presets: Array<{ value: CompressionPreset; label: string; helper: string }>
  }
  onOutputModeChange: (mode: OutputMode) => void
  onPresetChange: (preset: CompressionPreset) => void
  onKeepTimestampsChange: (keep: boolean) => void
  onProcess: () => void
  disabled: boolean
}

export function ProcessingOptions({
  outputMode,
  preset,
  keepTimestamps,
  copy,
  onOutputModeChange,
  onPresetChange,
  onKeepTimestampsChange,
  onProcess,
  disabled
}: ProcessingOptionsProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-[#111f27]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sea/10 text-sea">
          <Settings2 aria-hidden="true" size={21} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink dark:text-white">{copy.title}</h2>
          <p className="text-sm text-ink/65 dark:text-white/65">{copy.subtitle}</p>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-ink dark:text-white">{copy.outputMode}</legend>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {copy.outputModes.map((mode) => (
            <label
              key={mode.value}
              className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                outputMode === mode.value
                  ? 'border-sea bg-sea/5'
                  : 'border-ink/10 hover:border-ink/30 dark:border-white/10 dark:hover:border-white/30'
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
                <span className="block text-sm font-semibold text-ink dark:text-white">{mode.label}</span>
                <span className="block text-sm text-ink/60 dark:text-white/60">{mode.helper}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-ink dark:text-white">{copy.compressionPreset}</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {copy.presets.map((item) => (
            <label
              key={item.value}
              className={`cursor-pointer rounded-lg border p-3 transition ${
                preset === item.value
                  ? 'border-sea bg-sea/5'
                  : 'border-ink/10 hover:border-ink/30 dark:border-white/10 dark:hover:border-white/30'
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
              <span className="block text-sm font-semibold text-ink dark:text-white">{item.label}</span>
              <span className="mt-1 block text-sm text-ink/60 dark:text-white/60">{item.helper}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-ink/10 p-3 dark:border-white/10">
        <input
          type="checkbox"
          checked={keepTimestamps}
          onChange={(event) => onKeepTimestampsChange(event.target.checked)}
          className="h-4 w-4 accent-sea"
        />
        <span className="text-sm text-ink dark:text-white">{copy.keepTimestamps}</span>
      </label>

      <button
        type="button"
        onClick={onProcess}
        disabled={disabled}
        className="mt-5 min-h-11 w-full rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
      >
        {copy.process}
      </button>
    </section>
  )
}
