import { FileText } from 'lucide-react'

type TranscriptOptionsProps = {
  keepTimestamps: boolean
  copy: {
    title: string
    subtitle: string
    supported: string
    keepTimestamps: string
    process: string
  }
  onKeepTimestampsChange: (keep: boolean) => void
  onProcess: () => void
  disabled: boolean
}

export function TranscriptOptions({
  keepTimestamps,
  copy,
  onKeepTimestampsChange,
  onProcess,
  disabled
}: TranscriptOptionsProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-[#111f27]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sea/10 text-sea">
          <FileText aria-hidden="true" size={21} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink dark:text-white">{copy.title}</h2>
          <p className="text-sm text-ink/65 dark:text-white/65">{copy.subtitle}</p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-sea/20 bg-sea/5 p-4 text-sm leading-6 text-ink/75 dark:text-white/75">
        {copy.supported}
      </div>

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
