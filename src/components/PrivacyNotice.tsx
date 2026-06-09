import { ShieldCheck } from 'lucide-react'

type PrivacyNoticeProps = {
  title: string
  body: string
}

export function PrivacyNotice({ title, body }: PrivacyNoticeProps) {
  return (
    <section className="rounded-lg border border-sea/20 bg-sea/5 p-5">
      <div className="flex gap-3">
        <ShieldCheck aria-hidden="true" className="mt-1 shrink-0 text-sea" size={22} />
        <div>
          <h2 className="text-base font-semibold text-ink dark:text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-ink/70 dark:text-white/70">{body}</p>
        </div>
      </div>
    </section>
  )
}
