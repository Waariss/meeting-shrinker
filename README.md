# Meeting Shrinker for NotebookLM

[![Netlify Status](https://api.netlify.com/api/v1/badges/201e62cf-1543-4203-8694-bbae2b76e224/deploy-status)](https://app.netlify.com/sites/waris-damkham/deploys)

Meeting Shrinker is a static, browser-first web app for preparing Thai-heavy meeting recordings for NotebookLM.

Live web app: [https://meeting-shrinker.netlify.app](https://meeting-shrinker.netlify.app)

It helps with this workflow:

```text
Upload meeting file -> compress video / extract audio -> clean transcript -> split large outputs -> download NotebookLM-ready files
```

## Why It Exists

Google Meet recordings can be too large for NotebookLM local uploads. This app gives a practical preparation step before uploading files into NotebookLM, especially for Thai meetings where users may want to extract audio or clean transcript text first.

## NotebookLM Limit Assumptions

- Local file/source size: around 200MB per source.
- Safe output target used by this app: 190MB per media file.
- Source text size: around 500,000 words per source.
- Safe transcript target used by this app: 450,000 words per text file.

These limits are treated as assumptions for the MVP and may change.

## Features

- Upload `.mp4`, `.mov`, `.m4a`, `.mp3`, `.wav`, `.webm`, `.txt`, `.srt`, and `.vtt`.
- Switch the interface between English and Thai.
- Switch between light and dark mode.
- Show original file size and NotebookLM readiness status.
- Extract audio with `ffmpeg.wasm`.
- Compress MP4 output with smallest, balanced, or better-quality presets.
- Split output files above 190MB into parts.
- Clean `.txt`, `.srt`, and `.vtt` transcripts.
- Split transcript output below 450,000 words per file.
- Download outputs individually or as a ZIP.
- Open NotebookLM at `https://notebooklm.google.com/`.

## Privacy

By default, files are processed locally in the browser and are not uploaded to this app's server. The MVP does not include a backend or authentication.

If API transcription is added in the future, audio may be sent to the selected transcription provider.

## Run Locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

The production build is written to `dist/`.

## Test

```bash
npm run lint
npm run test
npm run e2e
```

- `npm run test` runs Vitest unit tests for transcript parsing/splitting and file-size helpers.
- `npm run e2e` runs Playwright checks for app load, English/Thai toggle, light/dark mode, unsupported uploads, transcript export, NotebookLM link, and mobile overflow.

## Deploy To Netlify

This project is a static Netlify app.

Build settings:

- Build command: `npm run build`
- Publish directory: `dist`

The included `netlify.toml` sets the same build settings and adds the cross-origin isolation headers needed by `ffmpeg.wasm`.

## Known Limitations

- Browser video processing is memory-intensive. Large files are better handled on desktop.
- Media splitting uses ffmpeg time ranges instead of raw byte slicing so generated MP4/MOV/WebM chunks are intended to remain playable. If ffmpeg cannot detect duration or segment safely, the app should show an error instead of silently creating invalid chunks.
- Browser memory limits still apply. Very large Google Meet recordings may fail in mobile browsers or low-memory devices.
- Thai and English transcription generation is a placeholder unless an STT provider is connected. The app can clean uploaded transcripts and prepare/extract audio for external transcription workflows.
- No direct NotebookLM upload automation is attempted because there is no official supported API in this MVP.

## Recommended Large-File Workflow

1. Use a laptop or desktop browser for long recordings.
2. Try `Extract audio only` or `Smallest file / audio only` first.
3. If a video must be uploaded, use `Balanced` compression before splitting.
4. Keep each exported file below the 190MB safe target before uploading to NotebookLM.
5. For transcripts, upload `.txt`, `.srt`, or `.vtt` files and export the cleaned NotebookLM-ready `.txt` chunks.

## Test Fixtures

Small text fixtures live under `tests/fixtures/`:

- `transcript.txt`
- `transcript.srt`
- `transcript.vtt`
- `unsupported.pdf`

Media QA should start with small generated files under 10MB before trying larger recordings. Avoid beginning QA with real large meeting recordings because browser memory failures can be slow and noisy.

## Manual QA Checklist

- Verify `npm install`, `npm run lint`, `npm run test`, `npm run build`, `npm run dev`, and `npm run preview`.
- Check desktop, laptop, tablet, mobile, and small-mobile viewport widths for horizontal overflow.
- Toggle English/Thai and light/dark mode.
- Upload supported transcript files and confirm cleaned downloadable outputs.
- Upload an unsupported file and confirm a clear error.
- Test small MP4 extraction/compression before trying large files.
- Confirm the live Netlify app loads and keeps the COOP/COEP headers required for ffmpeg.wasm.

## Future Roadmap

- Real Thai STT integration.
- Speaker diarization.
- Direct Google Drive integration.
- NotebookLM API integration if officially available.
- Auto summary generation.
- Multi-language transcript cleanup.
