import { ShieldCheck } from 'lucide-react'

export function PrivacyNotice() {
  return (
    <section className="rounded-lg border border-sea/20 bg-sea/5 p-5">
      <div className="flex gap-3">
        <ShieldCheck aria-hidden="true" className="mt-1 shrink-0 text-sea" size={22} />
        <div>
          <h2 className="text-base font-semibold text-ink">Privacy-first</h2>
          <p className="mt-1 text-sm leading-6 text-ink/70">
            Files are processed locally in your browser and are not uploaded to our server in the default mode.
            If API transcription is enabled in the future, audio may be sent to the selected transcription provider.
          </p>
        </div>
      </div>
    </section>
  )
}

