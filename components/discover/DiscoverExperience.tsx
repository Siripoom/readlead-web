'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronDown, ChevronLeft, ChevronRight, Eye, Grid2X2,
  Headphones, List as ListIcon, ListTree, Search, SlidersHorizontal, X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { useRole } from '@/contexts/RoleContext'
import { shelfStorageKey } from '@/lib/profile-repository'
import type { CmsBannerElement } from '@/lib/cms-catalog'
import type {
  DiscoverGenre,
  DiscoverPageData,
  DiscoverWork,
} from '@/lib/discover-catalog'
import type { ContentType } from '@/lib/types'
import styles from './DiscoverExperience.module.css'

type ViewMode = 'grid' | 'list'
type SortMode = 'relevance' | 'newest' | 'oldest' | 'popular'
type TypeFilter = 'all' | ContentType
type StatusFilter = 'all' | 'active' | 'completed'
type LengthFilter = 'all' | 'short' | 'medium' | 'long'
type OriginFilter = 'all' | 'original' | 'translated' | 'thai' | 'manhwa' | 'manhua' | 'manga' | 'human' | 'ai'
type QuickCategory = 'all' | 'martial-arts' | 'fantasy' | 'action' | 'adventure' | 'isekai' | 'system'
type CategoryFilter = 'all' | DiscoverGenre | QuickCategory

type Filters = {
  type: TypeFilter
  category: CategoryFilter
  tags: string[]
  status: StatusFilter
  origin: OriginFilter
  length: LengthFilter
  sort: SortMode
}

const TYPE_LABELS: Record<ContentType, string> = {
  novel: 'นิยาย',
  manga: 'เว็บตูน',
  audiobook: 'หนังสือเสียง',
}

const GENRE_LABELS: Record<DiscoverGenre, string> = {
  romance: 'โรแมนซ์', fantasy: 'แฟนตาซี', action: 'แอ็กชัน', mystery: 'สืบสวน',
  horror: 'สยองขวัญ', comedy: 'คอมเมดี', drama: 'ดราม่า', historical: 'ตะวันออก',
  'sci-fi': 'ไซไฟ', 'slice-of-life': 'ชีวิตประจำวัน', bl: 'วาย', gl: 'ยูริ',
}

const QUICK_CATEGORIES: Array<{ key: QuickCategory; label: string }> = [
  { key: 'martial-arts', label: 'กำลังภายใน' },
  { key: 'fantasy', label: 'แฟนตาซี' },
  { key: 'action', label: 'แอ็กชัน' },
  { key: 'adventure', label: 'ผจญภัย' },
  { key: 'isekai', label: 'ต่างโลก' },
  { key: 'system', label: 'ระบบ' },
  { key: 'all', label: 'ทั้งหมด' },
]

const DRAWER_GENRES: Array<{ key: CategoryFilter; label: string }> = [
  { key: 'all', label: 'ทุกหมวด' }, { key: 'fantasy', label: 'แฟนตาซี' },
  { key: 'romance', label: 'โรแมนซ์' }, { key: 'martial-arts', label: 'กำลังภายใน' },
  { key: 'historical', label: 'ตะวันออก' }, { key: 'mystery', label: 'สืบสวน' },
  { key: 'sci-fi', label: 'ไซไฟ' }, { key: 'drama', label: 'ดราม่า' },
  { key: 'horror', label: 'สยองขวัญ' },
]

const SORT_LABELS: Record<SortMode, string> = {
  relevance: 'ความเกี่ยวข้อง', newest: 'ใหม่สุด', oldest: 'เก่าสุด', popular: 'ยอดนิยม',
}

const TYPE_OPTIONS: Array<{ key: TypeFilter; label: string }> = [
  { key: 'all', label: 'ทั้งหมด' }, { key: 'novel', label: 'นิยาย' },
  { key: 'manga', label: 'เว็บตูน' }, { key: 'audiobook', label: 'หนังสือเสียง' },
]

const DEFAULT_FILTERS: Filters = {
  type: 'all', category: 'all', tags: [], status: 'all', origin: 'all', length: 'all', sort: 'relevance',
}

const ORIGIN_OPTIONS: Record<Exclude<TypeFilter, 'all'>, Array<{ key: OriginFilter; label: string }>> = {
  novel: [{ key: 'all', label: 'ทั้งหมด' }, { key: 'original', label: 'ไทย' }, { key: 'translated', label: 'แปล' }],
  manga: [
    { key: 'all', label: 'ทั้งหมด' }, { key: 'thai', label: 'ไทย' }, { key: 'manhwa', label: 'มังฮวา' },
    { key: 'manhua', label: 'ม่านฮว่า' }, { key: 'manga', label: 'มังงะ' },
  ],
  audiobook: [{ key: 'all', label: 'ทั้งหมด' }, { key: 'human', label: 'พากย์' }, { key: 'ai', label: 'เอไอ' }],
}

function compactNumber(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Math.max(0, value))
}

function thaiNumber(value: number) {
  return Math.max(0, value).toLocaleString('th-TH')
}

function normalized(value: string) {
  return value.normalize('NFKC').trim().toLocaleLowerCase('th-TH')
}

function categoryLabel(work: DiscoverWork) {
  const genre = work.genres[0]
  return genre ? GENRE_LABELS[genre] : work.category
}

function originLabel(work: DiscoverWork) {
  if (work.type === 'audiobook') return work.narrationType === 'ai' ? 'เอไอ' : 'พากย์'
  if (work.type === 'manga') {
    return { thai: 'ไทย', manhwa: 'มังฮวา', manhua: 'ม่านฮว่า', manga: 'มังงะ' }[work.mangaRegion]
  }
  return work.origin === 'translated' ? 'แปล' : 'ไทย'
}

function matchesCategory(work: DiscoverWork, category: CategoryFilter) {
  if (category === 'all') return true
  if (category === 'martial-arts') {
    return work.genres.includes('action') || work.tags.some((tag) => /กำลังภายใน|จอมยุทธ์|เซียน|ดาบ|ยุทธ/.test(tag))
  }
  if (category === 'adventure') {
    return work.tags.some((tag) => /ผจญภัย|เดินทาง|ภารกิจ/.test(tag)) || work.genres.includes('action') && work.genres.includes('fantasy')
  }
  if (category === 'isekai') {
    return work.tags.some((tag) => /ต่างโลก|ข้ามเวลา|ข้ามมิติ|ย้อนอดีต|เกิดใหม่|ชีวิตหลังความตาย/.test(tag))
  }
  if (category === 'system') {
    return work.tags.some((tag) => /ระบบ|เกม|เลเวล|สกิล/.test(tag))
  }
  return work.genres.includes(category as DiscoverGenre) || work.category === category
}

function matchesOrigin(work: DiscoverWork, origin: OriginFilter) {
  if (origin === 'all') return true
  if (origin === 'original' || origin === 'translated') return work.origin === origin
  if (origin === 'human' || origin === 'ai') return work.narrationType === origin
  return work.mangaRegion === origin
}

function matchesLength(work: DiscoverWork, length: LengthFilter) {
  if (length === 'short') return work.episodes < 100
  if (length === 'medium') return work.episodes >= 100 && work.episodes < 500
  if (length === 'long') return work.episodes >= 500
  return true
}

function relevanceScore(work: DiscoverWork, query: string) {
  if (!query) return work.views
  const q = normalized(query)
  const title = normalized(work.title)
  const author = normalized(work.author)
  if (title === q) return 5_000_000_000
  if (title.startsWith(q)) return 4_000_000_000
  if (title.includes(q)) return 3_000_000_000
  if (author.includes(q)) return 2_000_000_000
  if (work.tags.some((tag) => normalized(tag).includes(q))) return 1_000_000_000
  return work.views
}

function pageNumbers(current: number, total: number) {
  const values: Array<number | 'dots'> = []
  let previous = 0
  for (let page = 1; page <= total; page += 1) {
    if (page <= 2 || page > total - 2 || Math.abs(page - current) <= 1) {
      if (page - previous > 1) values.push('dots')
      values.push(page)
      previous = page
    }
  }
  return values
}

function heroElementStyle(element: CmsBannerElement): CSSProperties {
  return {
    left: `${element.x}%`,
    top: `${element.y}%`,
    color: element.color,
    background: element.type === 'badge' || element.type === 'button' ? element.backgroundColor : undefined,
    fontWeight: element.bold ? 800 : element.type === 'text' ? 400 : 700,
    textShadow: element.shadow ? '0 1px 6px rgba(0,0,0,.45)' : undefined,
    transform: `scale(${element.scale})`,
    transformOrigin: 'top left',
    width: element.type === 'button' ? `${element.width ?? 18}%` : undefined,
    height: element.type === 'button' ? `${element.height ?? 12}%` : undefined,
  }
}

function HeroElement({ element }: { element: CmsBannerElement }) {
  const className = `${styles.heroElement} ${styles[`heroElement_${element.type}`] ?? ''}`
  if (element.type === 'button' && element.link) {
    return <Link href={element.link} className={className} style={heroElementStyle(element)}>{element.text}</Link>
  }
  return <span className={className} style={heroElementStyle(element)}>{element.text}</span>
}

function MobileSearchBar({ value, onChange, onSubmit, onBack }: {
  value: string
  onChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onBack: () => void
}) {
  return (
    <div className={styles.mobileTopBar}>
      <div className={styles.mobileTopRow}>
        <button type="button" className={styles.mobileBack} onClick={onBack} aria-label="ย้อนกลับ"><ChevronLeft /></button>
        <form className={styles.mobileSearchBox} onSubmit={onSubmit} role="search">
          <Search aria-hidden="true" />
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="ค้นหานิยาย เว็บตูน หนังสือเสียง..."
            aria-label="ค้นหาผลงาน"
          />
          {value && <button type="button" className={styles.mobileClear} onClick={() => onChange('')} aria-label="ล้างคำค้นหา"><X /></button>}
        </form>
      </div>
    </div>
  )
}

function SearchHero({ data, value, onChange, onSubmit }: {
  data: DiscoverPageData['cms']['hero']
  value: string
  onChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className={styles.hero} style={{ background: data.background || '#edf2fa' }}>
      {data.imageUrl && (
        <picture className={styles.heroMedia}>
          {data.mobileImageUrl && <source media="(max-width: 639px)" srcSet={data.mobileImageUrl} />}
          {/* CMS image hosts are dynamic and therefore intentionally bypass next/image host allowlisting. */}
          <img
            src={data.imageUrl}
            alt=""
            fetchPriority="high"
            style={{ objectPosition: `${data.focal.x}% ${data.focal.y}%`, transform: `scale(${data.focal.zoom / 100})` }}
          />
        </picture>
      )}
      {data.imageUrl && <span className={styles.heroScrim} aria-hidden="true" />}
      <div className={styles.heroElements}>
        {data.elements.map((element) => <HeroElement key={element.id} element={element} />)}
      </div>
      <form className={styles.heroSearch} onSubmit={onSubmit} role="search">
        <Search aria-hidden="true" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="ค้นหานิยาย เว็บตูน หนังสือเสียง..."
          aria-label="ค้นหาผลงาน"
        />
        <button type="submit" aria-label="ค้นหา"><Search /></button>
      </form>
    </section>
  )
}

function Cover({ work, className, priority = false }: { work: DiscoverWork; className: string; priority?: boolean }) {
  return (
    <span className={className} style={{ background: work.coverGradient }}>
      {work.coverUrl ? (
        <Image src={work.coverUrl} alt={`ปก ${work.title}`} fill sizes="(max-width: 640px) 92px, 156px" priority={priority} />
      ) : <span className={styles.coverLetters}>{work.title.slice(0, 2)}</span>}
      {work.status === 'completed' && <span className={styles.coverBadge}>จบ</span>}
    </span>
  )
}

function GridCard({ work, priority }: { work: DiscoverWork; priority: boolean }) {
  return (
    <article className={styles.gridCard}>
      <Link href={`/detail?bookId=${encodeURIComponent(work.detailId)}`} aria-label={`ดูรายละเอียด ${work.title}`}>
        <Cover work={work} className={styles.gridCover} priority={priority} />
      </Link>
      <div className={styles.cardBody}>
        <Link className={styles.cardTitle} href={`/detail?bookId=${encodeURIComponent(work.detailId)}`}>{work.title}</Link>
        <div className={styles.cardMeta}>
          <span>{work.author}</span><i /><span>{categoryLabel(work)}</span><i /><span>{originLabel(work)}</span>
        </div>
        <p className={styles.cardSynopsis}>{work.synopsis}</p>
        <div className={styles.cardStats}>
          <span><Eye />{compactNumber(work.views)}</span>
          {work.type === 'audiobook' && <span><Headphones />{compactNumber(Math.round(work.views * .72))}</span>}
          <span><ListTree />{thaiNumber(work.episodes)}</span>
        </div>
      </div>
    </article>
  )
}

function ListCard({ work, saved, onToggleShelf }: { work: DiscoverWork; saved: boolean; onToggleShelf: (work: DiscoverWork) => void }) {
  const updated = new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(work.updatedAt))
  return (
    <article className={styles.listCard}>
      <Link href={`/detail?bookId=${encodeURIComponent(work.detailId)}`} aria-label={`ดูรายละเอียด ${work.title}`}>
        <Cover work={work} className={styles.listCover} />
      </Link>
      <div className={styles.listMain}>
        <Link className={styles.listTitle} href={`/detail?bookId=${encodeURIComponent(work.detailId)}`}>{work.title}</Link>
        <div className={styles.listMeta}><span>{work.author}</span><i /><span>{categoryLabel(work)}</span><i /><span>{originLabel(work)}</span></div>
        <p className={styles.listSynopsis}>{work.synopsis}</p>
        <div className={styles.listStats}>
          <span><Eye />{compactNumber(work.views)}</span>
          {work.type === 'audiobook' && <span><Headphones />{compactNumber(Math.round(work.views * .72))}</span>}
          <span className={styles.latest}><b>อัปเดตล่าสุด</b> {work.type === 'manga' ? 'ตอนที่' : 'บทที่'} {thaiNumber(work.episodes)} · {updated}</span>
        </div>
      </div>
      <div className={styles.listActions}>
        <Link href={`/detail?bookId=${encodeURIComponent(work.detailId)}`}>รายละเอียด</Link>
        <button type="button" className={saved ? styles.savedButton : undefined} onClick={() => onToggleShelf(work)}>
          {saved ? '✓ อยู่ในชั้นแล้ว' : '+ เพิ่มเข้าชั้น'}
        </button>
      </div>
    </article>
  )
}

function FilterOption<T extends string>({ value, active, children, onClick }: { value: T; active: boolean; children: React.ReactNode; onClick: (value: T) => void }) {
  return <button type="button" className={active ? styles.filterOptionActive : styles.filterOption} onClick={() => onClick(value)}>{children}</button>
}

function FilterDrawer({ open, draft, tags, onDraft, onClose, onClear, onApply }: {
  open: boolean
  draft: Filters
  tags: Array<{ name: string; count: number }>
  onDraft: (filters: Filters) => void
  onClose: () => void
  onClear: () => void
  onApply: () => void
}) {
  const [tagQuery, setTagQuery] = useState('')
  const matches = tags.filter((tag) => !draft.tags.includes(tag.name) && normalized(tag.name).includes(normalized(tagQuery))).slice(0, 12)
  const suggestions = tags.filter((tag) => !draft.tags.includes(tag.name)).slice(0, 6)
  const addTag = (tag: string) => {
    if (!tag || draft.tags.includes(tag) || draft.tags.length >= 20) return
    onDraft({ ...draft, tags: [...draft.tags, tag] })
    setTagQuery('')
  }
  const workOptions = draft.type === 'all' ? [] : ORIGIN_OPTIONS[draft.type]

  return (
    <>
      <button type="button" aria-label="ปิดตัวกรอง" tabIndex={open ? 0 : -1} className={`${styles.drawerDim} ${open ? styles.drawerDimOpen : ''}`} onClick={onClose} />
      <aside className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`} aria-hidden={!open} aria-label="ตัวกรองละเอียด">
        <div className={styles.drawerHead}><b>ตัวกรอง</b><button type="button" onClick={onClose} aria-label="ปิด"><X /></button></div>
        <div className={styles.filterGroup}>
          <b>ประเภท</b><div className={styles.filterOptions}>{TYPE_OPTIONS.map((item) => (
            <FilterOption key={item.key} value={item.key} active={draft.type === item.key} onClick={(type) => onDraft({ ...draft, type, origin: 'all' })}>{item.label}</FilterOption>
          ))}</div>
        </div>
        <div className={styles.filterGroup}>
          <b>หมวดหลัก</b><div className={styles.filterOptions}>{DRAWER_GENRES.map((item) => (
            <FilterOption key={item.key} value={item.key} active={draft.category === item.key} onClick={(category) => onDraft({ ...draft, category })}>{item.label}</FilterOption>
          ))}</div>
        </div>
        <div className={styles.filterGroup}>
          <b>แท็ก (เลือกได้ 20)</b>
          <div className={styles.tagBox}>
            <div className={styles.tagInputRow}>
              <input
                value={tagQuery}
                onChange={(event) => setTagQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') { event.preventDefault(); addTag(matches[0]?.name ?? '') }
                  if (event.key === 'Backspace' && !tagQuery && draft.tags.length) onDraft({ ...draft, tags: draft.tags.slice(0, -1) })
                }}
                placeholder="ค้นหาแท็ก และกด Enter เพื่อเพิ่ม"
              />
              <span>{draft.tags.length}/20</span>
            </div>
            {tagQuery && matches.length > 0 && <div className={styles.tagDropdown}>{matches.map((tag) => (
              <button type="button" key={tag.name} onClick={() => addTag(tag.name)}><b>#{tag.name}</b><span>{tag.count} เรื่อง</span></button>
            ))}</div>}
            <div className={styles.tagSuggestions}><b>แท็กแนะนำ :</b>{suggestions.map((tag) => <button type="button" key={tag.name} onClick={() => addTag(tag.name)}>#{tag.name} +</button>)}</div>
            {draft.tags.length > 0 && <div className={styles.selectedTags}>{draft.tags.map((tag) => (
              <span key={tag}>#{tag}<button type="button" onClick={() => onDraft({ ...draft, tags: draft.tags.filter((item) => item !== tag) })}>×</button></span>
            ))}</div>}
          </div>
        </div>
        <div className={styles.filterGroup}>
          <b>สถานะ</b><div className={styles.filterOptions}>
            <FilterOption value="all" active={draft.status === 'all'} onClick={(status) => onDraft({ ...draft, status })}>ทั้งหมด</FilterOption>
            <FilterOption value="active" active={draft.status === 'active'} onClick={(status) => onDraft({ ...draft, status })}>กำลังเขียน</FilterOption>
            <FilterOption value="completed" active={draft.status === 'completed'} onClick={(status) => onDraft({ ...draft, status })}>จบแล้ว</FilterOption>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <b>ผลงาน</b>
          {workOptions.length ? <div className={styles.filterOptions}>{workOptions.map((item) => (
            <FilterOption key={item.key} value={item.key} active={draft.origin === item.key} onClick={(origin) => onDraft({ ...draft, origin })}>{item.label}</FilterOption>
          ))}</div> : <span className={styles.filterHint}>เลือกประเภทก่อน</span>}
        </div>
        <div className={styles.filterGroup}>
          <b>ความยาว</b><div className={styles.filterOptions}>
            <FilterOption value="all" active={draft.length === 'all'} onClick={(length) => onDraft({ ...draft, length })}>ทั้งหมด</FilterOption>
            <FilterOption value="short" active={draft.length === 'short'} onClick={(length) => onDraft({ ...draft, length })}>ต่ำกว่า 100 บท</FilterOption>
            <FilterOption value="medium" active={draft.length === 'medium'} onClick={(length) => onDraft({ ...draft, length })}>100–500 บท</FilterOption>
            <FilterOption value="long" active={draft.length === 'long'} onClick={(length) => onDraft({ ...draft, length })}>500 บทขึ้นไป</FilterOption>
          </div>
        </div>
        <div className={`${styles.filterGroup} ${styles.filterGroupLast}`}>
          <b>เรียงตาม</b><div className={styles.filterOptions}>{(Object.keys(SORT_LABELS) as SortMode[]).map((sort) => (
            <FilterOption key={sort} value={sort} active={draft.sort === sort} onClick={(value) => onDraft({ ...draft, sort: value })}>{SORT_LABELS[sort]}</FilterOption>
          ))}</div>
        </div>
        <div className={styles.drawerFoot}><button type="button" onClick={onClear}>ล้างทั้งหมด</button><button type="button" onClick={onApply}>ยืนยันตัวกรอง</button></div>
      </aside>
    </>
  )
}

export function DiscoverExperience({ data, initialGenre, initialType = null }: { data: DiscoverPageData; initialGenre: DiscoverGenre | null; initialType?: ContentType | null }) {
  const router = useRouter()
  const { isLoggedIn, user } = useRole()
  const [queryInput, setQueryInput] = useState('')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>(() => ({ ...DEFAULT_FILTERS, category: initialGenre ?? 'all', type: initialType ?? 'all' }))
  const [draft, setDraft] = useState<Filters>(() => ({ ...DEFAULT_FILTERS, category: initialGenre ?? 'all', type: initialType ?? 'all' }))
  const [touched, setTouched] = useState(Boolean(initialGenre || initialType))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [view, setView] = useState<ViewMode>('grid')
  const [page, setPage] = useState(1)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!drawerOpen) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setDrawerOpen(false) }
    document.addEventListener('keydown', close)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', close); document.body.style.overflow = previous }
  }, [drawerOpen])

  useEffect(() => {
    if (!user) {
      const timer = window.setTimeout(() => setSavedIds(new Set()), 0)
      return () => window.clearTimeout(timer)
    }
    let localIds: string[] = []
    try {
      localIds = JSON.parse(localStorage.getItem(shelfStorageKey(user.id)) ?? '[]') as string[]
    } catch {}
    const timer = window.setTimeout(() => setSavedIds(new Set(localIds)), 0)
    const controller = new AbortController()
    void fetch('/api/member/activity', { cache: 'no-store', signal: controller.signal })
      .then((response) => response.ok ? response.json() : { shelves: [] })
      .then((payload: { shelves?: Array<{ work: { id: string } }> }) => {
        setSavedIds((current) => new Set([...current, ...(payload.shelves ?? []).map((item) => item.work.id)]))
      })
      .catch(() => undefined)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [user])

  const tagPool = useMemo(() => {
    const counts = new Map<string, number>()
    for (const work of data.works) for (const tag of work.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'th'))
  }, [data.works])

  const queryCategoryRows = useMemo(() => data.works.filter((work) => {
    const q = normalized(query)
    const matchesQuery = !q || normalized(work.title).includes(q) || normalized(work.author).includes(q) || work.tags.some((tag) => normalized(tag).includes(q))
    return matchesQuery && matchesCategory(work, filters.category)
  }), [data.works, filters.category, query])

  const typeCounts = useMemo(() => ({
    all: queryCategoryRows.length,
    novel: queryCategoryRows.filter((work) => work.type === 'novel').length,
    manga: queryCategoryRows.filter((work) => work.type === 'manga').length,
    audiobook: queryCategoryRows.filter((work) => work.type === 'audiobook').length,
  }), [queryCategoryRows])

  const resultRows = useMemo(() => {
    const rows = queryCategoryRows.filter((work) => {
      if (filters.type !== 'all' && work.type !== filters.type) return false
      if (filters.status === 'active' && work.status === 'completed') return false
      if (filters.status === 'completed' && work.status !== 'completed') return false
      if (!matchesOrigin(work, filters.origin) || !matchesLength(work, filters.length)) return false
      return filters.tags.every((tag) => work.tags.includes(tag))
    })
    return rows.sort((a, b) => {
      if (filters.sort === 'newest') return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
      if (filters.sort === 'oldest') return Date.parse(a.updatedAt) - Date.parse(b.updatedAt)
      if (filters.sort === 'popular') return (b.views + b.votes * 50) - (a.views + a.votes * 50)
      return relevanceScore(b, query) - relevanceScore(a, query)
    })
  }, [filters, query, queryCategoryRows])

  const perPage = view === 'grid' ? 12 : 10
  const totalPages = Math.max(1, Math.ceil(resultRows.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const visibleRows = resultRows.slice((currentPage - 1) * perPage, currentPage * perPage)

  const resultLabel = query
    ? `“${query}”`
    : filters.category !== 'all'
      ? DRAWER_GENRES.find((item) => item.key === filters.category)?.label ?? QUICK_CATEGORIES.find((item) => item.key === filters.category)?.label ?? 'ทั้งหมด'
      : filters.type !== 'all' ? TYPE_LABELS[filters.type] : 'ทั้งหมด'

  const commitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = queryInput.trim()
    if (!next) return
    setQuery(next)
    setTouched(true)
    setPage(1)
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  const selectQuickCategory = (category: QuickCategory) => {
    const next = { ...filters, category }
    setFilters(next)
    setDraft(next)
    setTouched(true)
    setPage(1)
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  const toggleShelf = (work: DiscoverWork) => {
    if (!isLoggedIn || !user) { router.push('/login'); return }
    if (!work.isMock) {
      void fetch('/api/interactions/shelf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workId: work.detailId }) })
        .then(async (response) => {
          const payload = await response.json().catch(() => ({})) as { active?: boolean }
          if (!response.ok) return
          setSavedIds((current) => {
            const next = new Set(current)
            if (payload.active) next.add(work.detailId); else next.delete(work.detailId)
            return next
          })
        })
      return
    }
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(work.detailId)) next.delete(work.detailId); else next.add(work.detailId)
      localStorage.setItem(shelfStorageKey(user.id), JSON.stringify([...next]))
      return next
    })
  }

  const goToPage = (next: number) => {
    setPage(Math.max(1, Math.min(totalPages, next)))
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push('/')
  }

  return (
    <div className={styles.root}>
      <MobileSearchBar value={queryInput} onChange={setQueryInput} onSubmit={commitSearch} onBack={goBack} />
      <main className={styles.container}>
        <SearchHero data={data.cms.hero} value={queryInput} onChange={setQueryInput} onSubmit={commitSearch} />

        <div className={styles.tabsRow}>
          <button type="button" className={styles.filterButton} onClick={() => { setDraft(filters); setDrawerOpen(true) }}><SlidersHorizontal />ตัวกรอง</button>
          <div className={styles.typeTabs}>{TYPE_OPTIONS.map((item) => (
            <button
              type="button"
              key={item.key}
              className={touched && filters.type === item.key ? styles.typeTabActive : styles.typeTab}
              onClick={() => {
                if (!touched) return
                const next = { ...filters, type: item.key, origin: 'all' as const }
                setFilters(next); setDraft(next); setPage(1)
              }}
            >{item.label}{touched && <span>{typeCounts[item.key]}</span>}</button>
          ))}</div>
        </div>

        <section className={styles.categorySection} aria-labelledby="popular-categories">
          <h2 id="popular-categories">หมวดหมู่ยอดนิยม</h2>
          <div className={styles.categoryGrid}>{QUICK_CATEGORIES.map((item, index) => {
            const count = item.key === 'all' ? data.works.length : data.works.filter((work) => matchesCategory(work, item.key)).length
            const image = data.cms.categoryImages[index]
            return (
              <button
                type="button"
                key={item.key}
                className={filters.category === item.key && touched ? styles.categoryActive : styles.category}
                style={image ? { backgroundImage: `url(${JSON.stringify(image).slice(1, -1)})` } : undefined}
                onClick={() => selectQuickCategory(item.key)}
              >
                <span>{item.label}</span><small>{thaiNumber(count)} เรื่อง</small>
              </button>
            )
          })}</div>
        </section>

        <section className={styles.results} ref={resultsRef} aria-labelledby="discover-results">
          <div className={styles.resultsHead}>
            <h2 id="discover-results">ผลการค้นหา {touched && <><strong>{resultLabel}</strong> <span>พบ {thaiNumber(resultRows.length)} เรื่อง</span></>}</h2>
            <div className={styles.resultsControls}>
              <label><span>เรียงตาม</span><span className={styles.selectWrap}><select value={filters.sort} onChange={(event) => { const sort = event.target.value as SortMode; setFilters({ ...filters, sort }); setDraft({ ...draft, sort }); setPage(1) }}>{Object.entries(SORT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><ChevronDown /></span></label>
              <div className={styles.viewToggle} aria-label="รูปแบบการแสดงผล">
                <button type="button" aria-label="แบบตาราง" aria-pressed={view === 'grid'} className={view === 'grid' ? styles.viewActive : undefined} onClick={() => { setView('grid'); setPage(1) }}><Grid2X2 /></button>
                <button type="button" aria-label="แบบรายการ" aria-pressed={view === 'list'} className={view === 'list' ? styles.viewActive : undefined} onClick={() => { setView('list'); setPage(1) }}><ListIcon /></button>
              </div>
            </div>
          </div>

          {!touched ? <div className={styles.initialState}><Search /><span>ค้นหาผลงาน</span></div> : visibleRows.length ? (
            view === 'grid'
              ? <div className={styles.resultGrid}>{visibleRows.map((work, index) => <GridCard key={work.id} work={work} priority={currentPage === 1 && index < 3} />)}</div>
              : <div className={styles.resultList}>{visibleRows.map((work) => <ListCard key={work.id} work={work} saved={savedIds.has(work.detailId)} onToggleShelf={toggleShelf} />)}</div>
          ) : <div className={styles.emptyState}><Search /><b>ไม่พบเรื่องที่ตรงกับ “{query || resultLabel}”</b><span>ลองค้นหาคำอื่นหรือล้างตัวกรอง</span></div>}

          {touched && totalPages > 1 && <nav className={styles.pagination} aria-label="หน้าผลการค้นหา">
            <button type="button" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)} aria-label="หน้าก่อนหน้า"><ChevronLeft /></button>
            {pageNumbers(currentPage, totalPages).map((item, index) => item === 'dots'
              ? <span key={`dots-${index}`}>…</span>
              : <button type="button" key={item} className={item === currentPage ? styles.pageActive : undefined} onClick={() => goToPage(item)}>{item}</button>)}
            <button type="button" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)} aria-label="หน้าถัดไป"><ChevronRight /></button>
          </nav>}
        </section>
      </main>

      <FilterDrawer
        open={drawerOpen}
        draft={draft}
        tags={tagPool}
        onDraft={setDraft}
        onClose={() => setDrawerOpen(false)}
        onClear={() => setDraft(DEFAULT_FILTERS)}
        onApply={() => { setFilters(draft); setTouched(true); setPage(1); setDrawerOpen(false) }}
      />
    </div>
  )
}
