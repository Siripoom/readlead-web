import type { CSSProperties } from 'react'
import type { ReaderTheme } from '@/lib/reader-repository'

export const READER_THEME_VARS: Record<ReaderTheme, CSSProperties> = {
  light: {
    '--reader-page': '#f4f5f8', '--reader-paper': '#ffffff', '--reader-ink': '#29242b',
    '--reader-muted': '#85818a', '--reader-border': '#e7e8ee', '--reader-hover': '#faf5f6',
    '--reader-highlight': '#fdeff1', '--reader-accent': '#cc4452', '--reader-cover': 'linear-gradient(155deg,#985267,#321b2a)',
  } as CSSProperties,
  sepia: {
    '--reader-page': '#e9dfca', '--reader-paper': '#f8f0dd', '--reader-ink': '#493c2e',
    '--reader-muted': '#847765', '--reader-border': '#ded1b7', '--reader-hover': '#f1e6cf',
    '--reader-highlight': '#ead8bd', '--reader-accent': '#a84a47', '--reader-cover': 'linear-gradient(155deg,#9c7457,#4a3428)',
  } as CSSProperties,
  dark: {
    '--reader-page': '#17161b', '--reader-paper': '#242128', '--reader-ink': '#ece9ef',
    '--reader-muted': '#aaa3b0', '--reader-border': '#3b3740', '--reader-hover': '#302c34',
    '--reader-highlight': '#443039', '--reader-accent': '#ef7d88', '--reader-cover': 'linear-gradient(155deg,#684559,#241b29)',
  } as CSSProperties,
}

export function getReaderThemeStyle(theme: ReaderTheme, coverGradient?: string): CSSProperties {
  return {
    ...READER_THEME_VARS[theme],
    ...(coverGradient ? { '--reader-cover': coverGradient } : {}),
  } as CSSProperties
}
