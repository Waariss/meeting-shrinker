import { ChangeEvent, DragEvent, useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'

type FileDropzoneProps = {
  onFilesSelected: (files: File[]) => void
  accept: string
}

export function FileDropzone({ onFilesSelected, accept }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return
    onFilesSelected(Array.from(fileList))
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files)
    event.target.value = ''
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`rounded-lg border-2 border-dashed p-6 transition sm:p-8 ${
        isDragging ? 'border-sea bg-sea/5' : 'border-ink/20 bg-white'
      }`}
    >
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-sea/10 text-sea">
          <UploadCloud aria-hidden="true" size={28} />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-ink">Upload Meeting File</h2>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          อัปโหลดไฟล์ประชุม เช่น MP4, MP3, M4A, MOV, WEBM, TXT, SRT หรือ VTT
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 min-h-11 rounded-md bg-sea px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sea/90 active:scale-[0.99]"
        >
          Choose files
        </button>
        <input ref={inputRef} className="sr-only" type="file" multiple accept={accept} onChange={handleChange} />
      </div>
    </div>
  )
}

