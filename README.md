# Meeting Shrinker for NotebookLM

Meeting Shrinker is a static, browser-first web app for preparing Thai-heavy meeting recordings for NotebookLM.

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

## Deploy To Netlify

This project is a static Netlify app.

Build settings:

- Build command: `npm run build`
- Publish directory: `dist`

The included `netlify.toml` sets the same build settings and adds the cross-origin isolation headers needed by `ffmpeg.wasm`.

## Known Limitations

- Browser video processing is memory-intensive. Large files are better handled on desktop.
- Splitting currently uses safe byte-size chunking for the MVP. Duration-aware splitting can be improved later.
- Transcription is a placeholder. The app prepares audio and includes a typed provider interface for future STT integration.
- No direct NotebookLM upload automation is attempted because there is no official supported API in this MVP.

## Future Roadmap

- Real Thai STT integration.
- Speaker diarization.
- Direct Google Drive integration.
- NotebookLM API integration if officially available.
- Auto summary generation.
- Multi-language transcript cleanup.
