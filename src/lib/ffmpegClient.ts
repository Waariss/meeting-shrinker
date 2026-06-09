import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { baseName, bytesToMB } from './fileSize'
import { SAFE_TARGET_MB } from './notebooklmLimits'
import { splitBlobBySize } from './splitFile'

export type CompressionPreset = 'smallest' | 'balanced' | 'quality'

let ffmpeg: FFmpeg | null = null

export async function loadFfmpeg(onLog?: (message: string) => void): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg

  ffmpeg = new FFmpeg()
  ffmpeg.on('log', ({ message }) => onLog?.(message))

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm'
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
  })

  return ffmpeg
}

export async function extractAudio(
  file: File,
  preset: CompressionPreset,
  onLog?: (message: string) => void
): Promise<File> {
  const instance = await loadFfmpeg(onLog)
  const inputName = `input.${file.name.split('.').pop() || 'mp4'}`
  const outputName = `${baseName(file.name)}_audio.mp3`
  const bitrate = preset === 'smallest' ? '48k' : preset === 'quality' ? '128k' : '64k'

  await instance.writeFile(inputName, await fetchFile(file))
  await instance.exec(['-i', inputName, '-vn', '-b:a', bitrate, '-ac', '1', outputName])
  const data = await instance.readFile(outputName)
  await safeDelete(instance, [inputName, outputName])

  return new File([data], outputName, { type: 'audio/mpeg' })
}

export async function compressVideo(
  file: File,
  preset: CompressionPreset,
  onLog?: (message: string) => void
): Promise<File> {
  const instance = await loadFfmpeg(onLog)
  const inputName = `input.${file.name.split('.').pop() || 'mp4'}`
  const outputName = `${baseName(file.name)}_compressed.mp4`
  const argsByPreset: Record<CompressionPreset, string[]> = {
    smallest: [
      '-i',
      inputName,
      '-vn',
      '-b:a',
      '48k',
      `${baseName(file.name)}_audio.mp3`
    ],
    balanced: [
      '-i',
      inputName,
      '-vf',
      'scale=-2:min(720\\,ih),fps=24',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '28',
      '-b:a',
      '64k',
      outputName
    ],
    quality: [
      '-i',
      inputName,
      '-vf',
      'scale=-2:min(1080\\,ih)',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '24',
      '-b:a',
      '128k',
      outputName
    ]
  }
  const actualOutputName = preset === 'smallest' ? `${baseName(file.name)}_audio.mp3` : outputName

  await instance.writeFile(inputName, await fetchFile(file))
  await instance.exec(argsByPreset[preset])
  const data = await instance.readFile(actualOutputName)
  await safeDelete(instance, [inputName, actualOutputName])

  return new File([data], actualOutputName, {
    type: preset === 'smallest' ? 'audio/mpeg' : 'video/mp4'
  })
}

export async function splitMediaByDuration(file: File, targetSizeMB = SAFE_TARGET_MB): Promise<File[]> {
  if (bytesToMB(file.size) <= targetSizeMB) return [file]

  // Duration-aware splitting is expensive and metadata support varies in ffmpeg.wasm.
  // This byte split keeps the MVP usable; future versions can add time-range chunking.
  return splitBlobBySize(file, targetSizeMB, baseName(file.name))
}

async function safeDelete(instance: FFmpeg, names: string[]): Promise<void> {
  await Promise.allSettled(names.map((name) => instance.deleteFile(name)))
}

