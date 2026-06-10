import { expect, test } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const fixture = (name: string) => path.join(testDir, '..', 'fixtures', name)

test('app loads', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Meeting Shrinker for NotebookLM' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Choose files' })).toBeVisible()
})

test('language toggle EN/TH works', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Toggle language' }).click()

  await expect(page.getByRole('heading', { name: 'Meeting Shrinker สำหรับ NotebookLM' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'เลือกไฟล์' })).toBeVisible()
})

test('theme toggle works', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Toggle light or dark mode' }).click()

  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.getByRole('button', { name: 'Toggle light or dark mode' })).toContainText('Light')
})

test('unsupported file shows clear error', async ({ page }) => {
  await page.goto('/')
  await page.locator('input[type="file"]').setInputFiles(fixture('unsupported.pdf'))

  await page.getByRole('button', { name: 'Prepare NotebookLM files' }).click()

  await expect(page.getByText('Unsupported file type')).toBeVisible()
})

test('TXT transcript upload creates downloadable output', async ({ page }) => {
  await page.goto('/')
  await page.locator('input[type="file"]').setInputFiles(fixture('transcript.txt'))

  await page.getByRole('button', { name: 'Clean transcript for NotebookLM' }).click()

  await expect(page.getByText('transcript_transcript_part-001.txt')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Download ZIP' })).toBeVisible()
})

test('SRT transcript upload creates cleaned output', async ({ page }) => {
  await page.goto('/')
  await page.locator('input[type="file"]').setInputFiles(fixture('transcript.srt'))

  await page.getByRole('button', { name: 'Clean transcript for NotebookLM' }).click()

  await expect(page.getByText('transcript_transcript_part-001.txt')).toBeVisible()
})

test('Open NotebookLM points to correct URL', async ({ page }) => {
  await page.goto('/')
  await page.locator('input[type="file"]').setInputFiles(fixture('transcript.txt'))
  await page.getByRole('button', { name: 'Clean transcript for NotebookLM' }).click()

  await expect(page.getByRole('link', { name: /Open NotebookLM/ })).toHaveAttribute(
    'href',
    'https://notebooklm.google.com/'
  )
})

test('mobile viewport has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})
