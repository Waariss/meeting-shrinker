import { LoaderCircle, XCircle } from 'lucide-react'

type ProgressPanelProps = {
  logs: string[]
  isProcessing: boolean
  error?: string
  title: string
  idleText: string
  processingText: string
}

export function ProgressPanel({ logs, isProcessing, error, title, idleText, processingText }: ProgressPanelProps) {
  if (!isProcessing && !error && logs.length === 0) return null

  return (
    <section
      className="rounded-lg border border-ink/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-[#111f27]"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        {isProcessing ? (
          <LoaderCircle aria-hidden="true" className="animate-spin text-sea" size={22} />
        ) : (
          <XCircle aria-hidden="true" className={error ? 'text-clay' : 'text-leaf'} size={22} />
        )}
        <h2 className="text-lg font-semibold text-ink dark:text-white">{isProcessing ? processingText : title}</h2>
      </div>
      {error ? <p className="mt-3 rounded-lg bg-clay/10 p-3 text-sm text-ink dark:text-white">{error}</p> : null}
      {logs.length ? (
        <div className="mt-3 max-h-44 overflow-auto rounded-lg bg-ink p-3 text-xs leading-5 text-white/85">
          {logs.slice(-18).map((log, index) => (
            <p key={`${log}-${index}`}>{log}</p>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink/65 dark:text-white/65">{idleText}</p>
      )}
    </section>
  )
}
