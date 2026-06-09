import { Download, ExternalLink, PackageOpen } from 'lucide-react'
import { formatBytes } from '../lib/fileSize'
import { createZip, downloadFile } from '../lib/zipExport'

type ResultsPanelProps = {
  files: File[]
  onError: (message: string) => void
  copy: {
    title: string
    subtitle: string
    downloadZip: string
    openNotebookLM: string
    download: string
    zipError: string
  }
}

export function ResultsPanel({ files, onError, copy }: ResultsPanelProps) {
  if (!files.length) return null

  const handleZip = async () => {
    try {
      const zip = await createZip(files)
      downloadFile(zip)
    } catch {
      onError(copy.zipError)
    }
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-[#111f27]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf/10 text-leaf">
            <PackageOpen aria-hidden="true" size={21} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink dark:text-white">{copy.title}</h2>
            <p className="text-sm text-ink/65 dark:text-white/65">{copy.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleZip}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-sea px-4 py-3 text-sm font-semibold text-white transition hover:bg-sea/90 active:scale-[0.99]"
          >
            <Download aria-hidden="true" size={18} />
            {copy.downloadZip}
          </button>
          <a
            href="https://notebooklm.google.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 py-3 text-sm font-semibold text-ink transition hover:border-sea hover:text-sea dark:border-white/15 dark:text-white"
          >
            {copy.openNotebookLM}
            <ExternalLink aria-hidden="true" size={17} />
          </a>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {files.map((file) => (
          <div
            key={`${file.name}-${file.size}`}
            className="flex flex-col gap-3 rounded-lg border border-ink/10 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10"
          >
            <div className="min-w-0">
              <p className="break-words text-sm font-semibold text-ink dark:text-white">{file.name}</p>
              <p className="mt-1 text-sm text-ink/60 dark:text-white/60">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => downloadFile(file)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 py-3 text-sm font-semibold text-ink transition hover:border-sea hover:text-sea dark:border-white/15 dark:text-white"
            >
              <Download aria-hidden="true" size={17} />
              {copy.download}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
