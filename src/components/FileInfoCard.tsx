import { AlertTriangle, CheckCircle2, FileText, Info } from 'lucide-react'
import { formatBytes, getNotebookLMStatus } from '../lib/fileSize'

type FileInfoCardProps = {
  file: File
  hint?: string
}

const toneClasses = {
  green: 'border-leaf/30 bg-leaf/10 text-leaf',
  yellow: 'border-amber/40 bg-amber/10 text-amber',
  red: 'border-clay/40 bg-clay/10 text-clay'
}

const toneIcons = {
  green: CheckCircle2,
  yellow: Info,
  red: AlertTriangle
}

export function FileInfoCard({ file, hint }: FileInfoCardProps) {
  const status = getNotebookLMStatus(file.size)
  const StatusIcon = toneIcons[status.tone]

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-[#111f27]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ink/5 text-ink dark:bg-white/10 dark:text-white">
            <FileText aria-hidden="true" size={22} />
          </div>
          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold text-ink dark:text-white">{file.name}</h2>
            <p className="mt-1 text-sm text-ink/65 dark:text-white/65">
              {file.type || 'Unknown type'} · {formatBytes(file.size)}
            </p>
          </div>
        </div>
        <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${toneClasses[status.tone]}`}>
          <StatusIcon aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-semibold">{status.label}</p>
            <p className="text-ink/70 dark:text-white/75">{status.helper}</p>
          </div>
        </div>
      </div>
      {hint ? (
        <div className="mt-4 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm leading-6 text-ink/75 dark:text-white/75">
          {hint}
        </div>
      ) : null}
    </section>
  )
}
