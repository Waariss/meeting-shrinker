import { FileDown, NotebookTabs } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-ink/10 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sea text-white">
            <NotebookTabs aria-hidden="true" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight text-ink sm:text-3xl">
              Meeting Shrinker for NotebookLM
            </h1>
            <p className="mt-1 max-w-2xl text-base leading-7 text-ink/70">
              Compress, split, and prepare Thai meeting recordings for NotebookLM.
            </p>
          </div>
        </div>
        <div className="flex max-w-sm items-start gap-3 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm leading-6 text-ink">
          <FileDown aria-hidden="true" className="mt-0.5 shrink-0 text-amber" size={20} />
          <p>All compression runs locally in your browser. Large files may take time depending on your device.</p>
        </div>
      </div>
    </header>
  )
}

