import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { baseName, bytesToMB } from './fileSize'
import { SAFE_TARGET_MB } from './notebooklmLimits'

export type CompressionPreset = 'smallest' | 'balanced' | 'quality'

let ffmpeg: FFmpeg | null = null
const videoExtensions = new Set(['mp4', 'mov', 'webm'])
const audioExtensions = new Set(['mp3', 'm4a', 'wav'])
const audioCopyContainers = new Set(['mp4', 'mov', 'm4a'])

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
  const extension = file.name.split('.').pop()?.toLowerCase() || 'mp4'
  const inputName = `input.${extension}`
  const outputName = `${baseName(file.name)}_audio.mp3`
  const bitrate = preset === 'smallest' ? '48k' : preset === 'quality' ? '128k' : '64k'

  await instance.writeFile(inputName, await fetchFile(file))

  if (audioCopyContainers.has(extension)) {
    const copiedOutputName = `${baseName(file.name)}_audio.m4a`

    try {
      onLog?.('Copying audio track without re-encoding...')
      await instance.exec(['-i', inputName, '-map', '0:a:0', '-vn', '-c:a', 'copy', copiedOutputName])
      const data = await instance.readFile(copiedOutputName)
      await safeDelete(instance, [inputName, copiedOutputName])

      return new File([data], copiedOutputName, { type: 'audio/mp4' })
    } catch {
      await safeDelete(instance, [copiedOutputName])
      onLog?.('Audio copy failed. Re-encoding audio instead...')
    }
  }

  await instance.exec(['-i', inputName, '-map', '0:a:0', '-vn', '-b:a', bitrate, '-ac', '1', outputName])
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
      '-map',
      '0:a:0',
      '-vn',
      '-b:a',
      '48k',
      `${baseName(file.name)}_audio.mp3`
    ],
    balanced: [
      '-i',
      inputName,
      '-map',
      '0:v:0',
      '-map',
      '0:a:0?',
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
      '-map',
      '0:v:0',
      '-map',
      '0:a:0?',
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

  const instance = await loadFfmpeg()
  const extension = file.name.split('.').pop()?.toLowerCase() || 'mp4'
  const inputName = `split-input.${extension}`
  const rootName = baseName(file.name)
  const targetBytes = targetSizeMB * 1024 * 1024
  const partCount = Math.ceil(file.size / targetBytes)

  await instance.writeFile(inputName, await fetchFile(file))

  try {
    const duration = await probeDuration(instance, inputName)
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error('Could not detect media duration for safe time-based splitting.')
    }

    const segmentDuration = Math.ceil(duration / partCount)
    const outputs: File[] = []

    for (let part = 0; part < partCount; part += 1) {
      const startTime = part * segmentDuration
      const outputName = `${rootName}_part-${String(part + 1).padStart(3, '0')}.${extension}`

      try {
        await instance.exec([
          '-ss',
          String(startTime),
          '-t',
          String(segmentDuration),
          '-i',
          inputName,
          ...buildStreamMapArgs(extension),
          '-c',
          'copy',
          '-avoid_negative_ts',
          'make_zero',
          outputName
        ])
      } catch {
        await safeDelete(instance, [outputName])
        await instance.exec(buildReencodeSplitArgs(inputName, outputName, extension, startTime, segmentDuration))
      }

      const data = await instance.readFile(outputName)
      outputs.push(new File([data], outputName, { type: file.type || mimeTypeForExtension(extension) }))
      await safeDelete(instance, [outputName])
    }

    return outputs
  } finally {
    await safeDelete(instance, [inputName])
  }
}

async function safeDelete(instance: FFmpeg, names: string[]): Promise<void> {
  await Promise.allSettled(names.map((name) => instance.deleteFile(name)))
}

async function probeDuration(instance: FFmpeg, inputName: string): Promise<number> {
  const logs: string[] = []
  instance.on('log', ({ message }) => logs.push(message))

  try {
    await instance.exec(['-i', inputName])
  } catch {
    // ffmpeg prints metadata, including Duration, before failing because no output is provided.
  }

  const durationLine = logs.find((line) => line.includes('Duration:'))
  const match = durationLine?.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/)
  if (!match) return Number.NaN

  const [, hours, minutes, seconds] = match
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
}

function buildReencodeSplitArgs(
  inputName: string,
  outputName: string,
  extension: string,
  startTime: number,
  segmentDuration: number
): string[] {
  const baseArgs = ['-ss', String(startTime), '-t', String(segmentDuration), '-i', inputName]

  if (audioExtensions.has(extension)) {
    return [...baseArgs, '-map', '0:a:0', '-vn', '-b:a', '96k', outputName]
  }

  if (videoExtensions.has(extension)) {
    return [
      ...baseArgs,
      '-map',
      '0:v:0',
      '-map',
      '0:a:0?',
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
    ]
  }

  throw new Error('Safe media splitting is unavailable for this file type.')
}

function buildStreamMapArgs(extension: string): string[] {
  if (audioExtensions.has(extension)) return ['-map', '0:a:0']
  if (videoExtensions.has(extension)) return ['-map', '0:v:0', '-map', '0:a:0?']
  return []
}

function mimeTypeForExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    wav: 'audio/wav'
  }

  return mimeTypes[extension] ?? 'application/octet-stream'
}
