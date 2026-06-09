import { FileDown, Languages, Moon, NotebookTabs, Sun } from 'lucide-react'

type HeaderProps = {
  language: 'en' | 'th'
  theme: 'light' | 'dark'
  title: string
  subtitle: string
  warning: string
  onLanguageToggle: () => void
  onThemeToggle: () => void
}

export function Header({
  language,
  theme,
  title,
  subtitle,
  warning,
  onLanguageToggle,
  onThemeToggle
}: HeaderProps) {
  return (
    <header className="border-b border-ink/10 bg-white/85 backdrop-blur dark:border-white/10 dark:bg-[#111f27]/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sea text-white">
            <NotebookTabs aria-hidden="true" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight text-ink dark:text-white sm:text-3xl">{title}</h1>
            <p className="mt-1 max-w-2xl text-base leading-7 text-ink/70 dark:text-white/70">{subtitle}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onLanguageToggle}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-sea hover:text-sea active:scale-[0.99] dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-sea"
                aria-label="Toggle language"
              >
                <Languages aria-hidden="true" size={17} />
                {language === 'en' ? 'ภาษาไทย' : 'English'}
              </button>
              <button
                type="button"
                onClick={onThemeToggle}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-sea hover:text-sea active:scale-[0.99] dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-sea"
                aria-label="Toggle light or dark mode"
              >
                {theme === 'light' ? <Moon aria-hidden="true" size={17} /> : <Sun aria-hidden="true" size={17} />}
                {theme === 'light' ? 'Dark' : 'Light'}
              </button>
            </div>
          </div>
        </div>
        <div className="flex max-w-sm items-start gap-3 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm leading-6 text-ink dark:text-white">
          <FileDown aria-hidden="true" className="mt-0.5 shrink-0 text-amber" size={20} />
          <p>{warning}</p>
        </div>
      </div>
    </header>
  )
}
