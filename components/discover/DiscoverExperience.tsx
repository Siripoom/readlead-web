'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronDown, ChevronLeft, ChevronRight, Clock3, Eye, Grid2X2,
  List as ListIcon, ListTree, Search, SlidersHorizontal, X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
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

type ParsedQuery = { keywords: string[]; tags: string[] };
type FilterChip =
  | {
      kind: "field";
      field: "type" | "origin" | "category" | "status" | "length";
      label: string;
    }
  | { kind: "tag"; tag: string; label: string };
type SearchSuggestion =
  | { kind: "history"; text: string }
  | { kind: "work"; text: string; work: DiscoverWork }
  | { kind: "author" | "tag"; text: string; count: number };

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  works: DiscoverWork[];
  tags: Array<{ name: string; count: number }>;
  history: string[];
  onHistory: (history: string[]) => void;
  mobile?: boolean;
};

function parseQuery(value: string): ParsedQuery {
  const keywords: string[] = [];
  const tags: string[] = [];
  for (const token of value.trim().split(/\s+/)) {
    const [keyword, ...tagParts] = token.split("#");
    if (keyword) keywords.push(keyword);
    tags.push(...tagParts.filter(Boolean));
  }
  return { keywords, tags };
}

function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: ParsedQuery;
}) {
  const terms = query.keywords.filter(Boolean);
  if (!terms.length) return <>{text}</>;
  const pattern = terms
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const parts = text.split(new RegExp(`(${pattern})`, "gi"));
  return (
    <>
      {parts.map((part, index) =>
        terms.some((term) => normalized(term) === normalized(part)) ? (
          <mark className={styles.highlight} key={index}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

function SearchBox({
  value,
  onChange,
  onSearch,
  works,
  tags,
  history,
  onHistory,
  mobile = false,
}: SearchBoxProps) {
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const formRef = useRef<HTMLFormElement>(null);
  const parsed = parseQuery(value);
  const token = value.split(/\s+/).at(-1) ?? "";
  const text = normalized(value);
  const suggestions: SearchSuggestion[] = [];
  if (!text) {
    suggestions.push(
      ...history.map(
        (item): SearchSuggestion => ({ kind: "history", text: item }),
      ),
    );
  } else if (token.startsWith("#")) {
    suggestions.push(
      ...tags
        .filter((tag) =>
          normalized(tag.name).includes(normalized(token.slice(1))),
        )
        .slice(0, 15)
        .map(
          (tag): SearchSuggestion => ({
            kind: "tag",
            text: tag.name,
            count: tag.count,
          }),
        ),
    );
  } else {
    suggestions.push(
      ...history
        .filter(
          (item) =>
            normalized(item).includes(text) && normalized(item) !== text,
        )
        .slice(0, 2)
        .map((item): SearchSuggestion => ({ kind: "history", text: item })),
    );
    suggestions.push(
      ...works
        .filter((work) => {
          const titleMatches = parsed.keywords.every((keyword) =>
            normalized(work.title).includes(normalized(keyword)),
          );
          const tagsMatch =
            !parsed.tags.length ||
            work.tags.some((tag) =>
              parsed.tags.some((part) =>
                normalized(tag).includes(normalized(part)),
              ),
            );
          return titleMatches && tagsMatch;
        })
        .slice(0, 5)
        .map(
          (work): SearchSuggestion => ({
            kind: "work",
            text: work.title,
            work,
          }),
        ),
    );
    const authors = new Map<string, number>();
    works.forEach((work) =>
      authors.set(work.author, (authors.get(work.author) ?? 0) + 1),
    );
    suggestions.push(
      ...[...authors]
        .filter(([author]) =>
          parsed.keywords.every((keyword) =>
            normalized(author).includes(normalized(keyword)),
          ),
        )
        .slice(0, 3)
        .map(
          ([author, count]): SearchSuggestion => ({
            kind: "author",
            text: author,
            count,
          }),
        ),
    );
    suggestions.push(
      ...tags
        .filter((tag) => normalized(tag.name).includes(normalized(token)))
        .slice(0, 3)
        .map(
          (tag): SearchSuggestion => ({
            kind: "tag",
            text: tag.name,
            count: tag.count,
          }),
        ),
    );
  }
  const choose = (suggestion: SearchSuggestion) => {
    const next =
      suggestion.kind === "tag"
        ? token.startsWith("#")
          ? `${value.slice(0, value.length - token.length)}#${suggestion.text}`
          : `#${suggestion.text}`
        : suggestion.kind === "history"
          ? suggestion.text
          : [suggestion.text, ...parsed.tags.map((tag) => `#${tag}`)].join(" ");
    onSearch(next);
    setFocused(false);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex])
      choose(suggestions[activeIndex]);
    else {
      onSearch(value);
      setFocused(false);
    }
  };
  return (
    <form
      ref={formRef}
      className={mobile ? styles.mobileSearchBox : styles.heroSearch}
      onSubmit={submit}
      role="search"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <Search aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setFocused(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setFocused(true)}
        placeholder="ค้นหานิยาย เว็บตูน หนังสือเสียง..."
        aria-label="ค้นหาผลงาน"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="dialog"
        aria-expanded={focused && (suggestions.length > 0 || text.length > 0)}
        aria-controls={
          mobile ? "mobile-search-suggestions" : "search-suggestions"
        }
        onKeyDown={(event) => {
          if (event.key === "Escape") setFocused(false);
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) =>
              Math.min(suggestions.length - 1, current + 1),
            );
            setFocused(true);
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => Math.max(-1, current - 1));
          }
        }}
      />
      {mobile && value && (
        <button
          type="button"
          className={styles.mobileClear}
          onClick={() => onChange("")}
          aria-label="ล้างคำค้นหา"
        >
          <X />
        </button>
      )}
      {!mobile && (
        <button type="submit" aria-label="ค้นหา">
          <Search />
        </button>
      )}
      {focused && (suggestions.length > 0 || text.length > 0) && (
        <div
          className={styles.suggestions}
          id={mobile ? "mobile-search-suggestions" : "search-suggestions"}
          role="dialog"
          aria-label="คำค้นหาแนะนำ"
        >
          {suggestions.map((suggestion, index) => (
            <div
              className={`${styles.suggestionRow} ${index === activeIndex ? styles.suggestionActive : ""}`}
              key={`${suggestion.kind}-${suggestion.text}`}
            >
              <button
                type="button"
                className={styles.suggestionChoice}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(suggestion)}
              >
                {suggestion.kind === "work" ? (
                  <span
                    className={styles.suggestionCover}
                    style={{ background: suggestion.work.coverGradient }}
                  >
                    {suggestion.work.coverUrl ? (
                      <Image
                        src={suggestion.work.coverUrl}
                        alt=""
                        fill
                        sizes="40px"
                      />
                    ) : (
                      suggestion.text.slice(0, 2)
                    )}
                  </span>
                ) : suggestion.kind === "history" ? (
                  <Clock3 />
                ) : suggestion.kind === "tag" ? (
                  <span className={styles.suggestionHash}>#</span>
                ) : (
                  <Search />
                )}
                <span className={styles.suggestionText}>
                  <span>
                    <HighlightedText text={suggestion.text} query={parsed} />
                  </span>
                  {suggestion.kind === "work" && (
                    <small>
                      {suggestion.work.author} ·{" "}
                      {TYPE_LABELS[suggestion.work.type]}
                    </small>
                  )}
                </span>
                {(suggestion.kind === "author" ||
                  suggestion.kind === "tag") && (
                  <small>{suggestion.count} เรื่อง</small>
                )}
              </button>
              {suggestion.kind === "history" && (
                <button
                  type="button"
                  className={styles.deleteHistory}
                  aria-label={`ลบประวัติ ${suggestion.text}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() =>
                    onHistory(
                      history.filter((item) => item !== suggestion.text),
                    )
                  }
                >
                  <X />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className={styles.suggestionAll}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              if (text) {
                onSearch(value);
                setFocused(false);
              } else onHistory([]);
            }}
          >
            {text ? `ดูผลลัพธ์ทั้งหมด "${value.trim()}"` : "ล้างทั้งหมด"}
          </button>
        </div>
      )}
    </form>
  );
}

function MobileSearchBar({
  onBack,
  ...search
}: SearchBoxProps & { onBack: () => void }) {
  return (
    <div className={styles.mobileTopBar}>
      <div className={styles.mobileTopRow}>
        <button
          type="button"
          className={styles.mobileBack}
          onClick={onBack}
          aria-label="ย้อนกลับ"
        >
          <ChevronLeft />
        </button>
        <SearchBox {...search} mobile />
      </div>
    </div>
  );
}

function SearchHero({
  data,
  ...search
}: SearchBoxProps & { data: DiscoverPageData["cms"]["hero"] }) {
  return (
    <section
      className={`${styles.hero} ${data.id === "discover-fallback-hero" ? styles.heroFallback : ""}`}
      style={{ background: data.background || "#edf2fa" }}
    >
      {data.imageUrl && (
        <picture className={styles.heroMedia}>
          {data.mobileImageUrl && (
            <source media="(max-width: 639px)" srcSet={data.mobileImageUrl} />
          )}
          <img
            src={data.imageUrl}
            alt=""
            fetchPriority="high"
            style={{
              objectPosition: `${data.focal.x}% ${data.focal.y}%`,
              transform: `scale(${data.focal.zoom / 100})`,
            }}
          />
        </picture>
      )}
      {data.imageUrl && (
        <span className={styles.heroScrim} aria-hidden="true" />
      )}
      <div className={styles.heroElements}>
        {data.elements.map((element) => (
          <HeroElement key={element.id} element={element} />
        ))}
      </div>
      <SearchBox {...search} />
    </section>
  );
}

function WorkTags({
  work,
  selected,
  onSelect,
}: {
  work: DiscoverWork;
  selected: string[];
  onSelect: (tag: string) => void;
}) {
  return (
    <div className={styles.workTags}>
      {work.tags.map((tag) => (
        <button
          type="button"
          key={tag}
          className={selected.includes(tag) ? styles.tagActive : undefined}
          onClick={() => onSelect(tag)}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}

function WorkMetadata({
  work,
  query,
  onSearch,
  list = false,
}: {
  work: DiscoverWork;
  query: ParsedQuery;
  onSearch: (query: string) => void;
  list?: boolean;
}) {
  const values = [
    work.author,
    categoryLabel(work),
    originLabel(work),
    work.status === "completed" ? "จบแล้ว" : "กำลังเขียน",
  ];
  return (
    <div className={list ? styles.listMeta : styles.cardMeta}>
      {values.map((value, index) => (
        <span className={styles.metaItem} key={`${index}-${value}`}>
          {index > 0 && <i />}
          <button type="button" onClick={() => onSearch(value)}>
            <HighlightedText text={value} query={query} />
          </button>
        </span>
      ))}
    </div>
  );
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

type WorkCardProps = {
  work: DiscoverWork;
  query: ParsedQuery;
  selectedTags: string[];
  onTag: (tag: string) => void;
  onSearch: (query: string) => void;
};

function GridCard({
  work,
  priority,
  query,
  selectedTags,
  onTag,
  onSearch,
}: WorkCardProps & { priority: boolean }) {
  return (
    <article className={styles.gridCard}>
      <Link
        href={`/detail?bookId=${encodeURIComponent(work.detailId)}`}
        aria-label={`ดูรายละเอียด ${work.title}`}
      >
        <Cover work={work} className={styles.gridCover} priority={priority} />
      </Link>
      <div className={styles.cardBody}>
        <Link
          className={styles.cardTitle}
          href={`/detail?bookId=${encodeURIComponent(work.detailId)}`}
        >
          <HighlightedText text={work.title} query={query} />
        </Link>
        <WorkMetadata work={work} query={query} onSearch={onSearch} />
        <p className={styles.cardSynopsis}>{work.synopsis}</p>
        <WorkTags work={work} selected={selectedTags} onSelect={onTag} />
        <div className={styles.cardStats}>
          <span>
            <Eye />
            {compactNumber(work.views)}
          </span>
          <span>
            <ListTree />
            {thaiNumber(work.episodes)}
          </span>
        </div>
      </div>
    </article>
  );
}

function ListCard({
  work,
  saved,
  onToggleShelf,
  query,
  selectedTags,
  onTag,
  onSearch,
}: WorkCardProps & {
  saved: boolean;
  onToggleShelf: (work: DiscoverWork) => void;
}) {
  const updated = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
  }).format(new Date(work.updatedAt));
  return (
    <article className={styles.listCard}>
      <Link
        href={`/detail?bookId=${encodeURIComponent(work.detailId)}`}
        aria-label={`ดูรายละเอียด ${work.title}`}
      >
        <Cover work={work} className={styles.listCover} />
      </Link>
      <div className={styles.listMain}>
        <Link
          className={styles.listTitle}
          href={`/detail?bookId=${encodeURIComponent(work.detailId)}`}
        >
          <HighlightedText text={work.title} query={query} />
        </Link>
        <WorkMetadata work={work} query={query} onSearch={onSearch} list />
        <p className={styles.listSynopsis}>{work.synopsis}</p>
        <WorkTags work={work} selected={selectedTags} onSelect={onTag} />
        <div className={styles.listStats}>
          <span>
            <Eye />
            {compactNumber(work.views)}
          </span>
          <span className={styles.latest}>
            <b>อัปเดตล่าสุด</b> {work.type === "manga" ? "ตอนที่" : "บทที่"}{" "}
            {thaiNumber(work.episodes)} · {updated}
          </span>
        </div>
      </div>
      <div className={styles.listActions}>
        <Link href={`/detail?bookId=${encodeURIComponent(work.detailId)}`}>
          รายละเอียด
        </Link>
        <button
          type="button"
          className={saved ? styles.savedButton : undefined}
          onClick={() => onToggleShelf(work)}
        >
          {saved ? "✓ อยู่ในชั้นแล้ว" : "+ เพิ่มเข้าชั้น"}
        </button>
      </div>
    </article>
  );
}

function FilterOption<T extends string>({
  value,
  active,
  children,
  onClick,
}: {
  value: T;
  active: boolean;
  children: ReactNode;
  onClick: (value: T) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={active ? styles.filterOptionActive : styles.filterOption}
      onClick={() => onClick(value)}
    >
      <span className={styles.optionIndicator} />
      {children}
    </button>
  );
}

function FilterDrawer({
  draft,
  tags,
  onDraft,
  onClose,
  onClear,
  onApply,
}: {
  draft: Filters;
  tags: Array<{ name: string; count: number }>;
  onDraft: (filters: Filters) => void;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
}) {
  const [tagQuery, setTagQuery] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);
  const matches = tags.filter((tag) =>
    normalized(tag.name).includes(normalized(tagQuery)),
  );
  const visibleTags = [
    ...new Set([...draft.tags, ...matches.slice(0, 8).map((tag) => tag.name)]),
  ];
  const workOptions = draft.type === "all" ? [] : ORIGIN_OPTIONS[draft.type];
  useEffect(() => {
    const previous = document.activeElement;
    drawerRef.current?.focus();
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <>
      <button
        type="button"
        aria-label="ปิดตัวกรอง"
        className={`${styles.drawerDim} ${styles.drawerDimOpen}`}
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="ตัวกรองละเอียด"
        tabIndex={-1}
        className={`${styles.drawer} ${styles.drawerOpen}`}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const focusable =
            drawerRef.current?.querySelectorAll<HTMLElement>("button, input");
          const first = focusable?.[0];
          const last = focusable?.[focusable.length - 1];
          if (
            event.shiftKey &&
            (document.activeElement === first ||
              document.activeElement === drawerRef.current)
          ) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className={styles.drawerHead}>
          <b>ตัวกรอง</b>
          <button type="button" onClick={onClear}>
            ล้างทั้งหมด
          </button>
        </div>
        <div className={styles.drawerBody}>
          <div className={styles.filterGroup}>
            <b>ประเภท</b>
            <div className={styles.filterOptions}>
              {TYPE_OPTIONS.map((item) => (
                <FilterOption
                  key={item.key}
                  value={item.key}
                  active={draft.type === item.key}
                  onClick={(type) => onDraft({ ...draft, type, origin: "all" })}
                >
                  {item.label}
                </FilterOption>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <b>ผลงาน</b>
            {workOptions.length ? (
              <div className={styles.filterOptions}>
                {workOptions.map((item) => (
                  <FilterOption
                    key={item.key}
                    value={item.key}
                    active={draft.origin === item.key}
                    onClick={(origin) => onDraft({ ...draft, origin })}
                  >
                    {item.label}
                  </FilterOption>
                ))}
              </div>
            ) : (
              <span className={styles.filterHint}>เลือกประเภทก่อน</span>
            )}
          </div>
          <div className={styles.filterGroup}>
            <b>หมวดหลัก</b>
            <div className={styles.filterOptions}>
              {DRAWER_GENRES.map((item) => (
                <FilterOption
                  key={item.key}
                  value={item.key}
                  active={draft.category === item.key}
                  onClick={(category) => onDraft({ ...draft, category })}
                >
                  {item.label}
                </FilterOption>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <b>แท็ก</b>
            <div className={styles.tagSearch}>
              <Search />
              <input
                value={tagQuery}
                onChange={(event) => setTagQuery(event.target.value)}
                placeholder="ค้นหาแท็ก"
                aria-label="ค้นหาแท็ก"
              />
            </div>
            <div className={styles.filterOptions}>
              {visibleTags.map((tag) => (
                <label className={styles.tagOption} key={tag}>
                  <input
                    type="checkbox"
                    checked={draft.tags.includes(tag)}
                    onChange={() =>
                      onDraft({
                        ...draft,
                        tags: draft.tags.includes(tag)
                          ? draft.tags.filter((item) => item !== tag)
                          : [...draft.tags, tag],
                      })
                    }
                  />
                  <span>#{tag}</span>
                  <small>{tags.find((item) => item.name === tag)?.count}</small>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <b>สถานะ</b>
            <div className={styles.filterOptions}>
              <FilterOption
                value="all"
                active={draft.status === "all"}
                onClick={(status) => onDraft({ ...draft, status })}
              >
                ทั้งหมด
              </FilterOption>
              <FilterOption
                value="active"
                active={draft.status === "active"}
                onClick={(status) => onDraft({ ...draft, status })}
              >
                กำลังเขียน
              </FilterOption>
              <FilterOption
                value="completed"
                active={draft.status === "completed"}
                onClick={(status) => onDraft({ ...draft, status })}
              >
                จบแล้ว
              </FilterOption>
            </div>
          </div>
          <div className={styles.filterGroup}>
            <b>ความยาว</b>
            <div className={styles.filterOptions}>
              <FilterOption
                value="all"
                active={draft.length === "all"}
                onClick={(length) => onDraft({ ...draft, length })}
              >
                ทั้งหมด
              </FilterOption>
              <FilterOption
                value="short"
                active={draft.length === "short"}
                onClick={(length) => onDraft({ ...draft, length })}
              >
                ต่ำกว่า 100 บท
              </FilterOption>
              <FilterOption
                value="medium"
                active={draft.length === "medium"}
                onClick={(length) => onDraft({ ...draft, length })}
              >
                100–500 บท
              </FilterOption>
              <FilterOption
                value="long"
                active={draft.length === "long"}
                onClick={(length) => onDraft({ ...draft, length })}
              >
                500 บทขึ้นไป
              </FilterOption>
            </div>
          </div>
        </div>
        <div className={styles.drawerFoot}>
          <button type="button" onClick={onApply}>
            ยืนยันตัวกรอง
          </button>
        </div>
      </div>
    </>
  );
}

function activeFilterChips(filters: Filters): FilterChip[] {
  const chips: FilterChip[] = [];
  if (filters.type !== "all")
    chips.push({
      kind: "field",
      field: "type",
      label: TYPE_LABELS[filters.type],
    });
  if (filters.origin !== "all" && filters.type !== "all") {
    const option = ORIGIN_OPTIONS[filters.type].find(
      (item) => item.key === filters.origin,
    );
    if (option)
      chips.push({ kind: "field", field: "origin", label: option.label });
  }
  if (filters.category !== "all")
    chips.push({
      kind: "field",
      field: "category",
      label:
        DRAWER_GENRES.find((item) => item.key === filters.category)?.label ??
        filters.category,
    });
  chips.push(
    ...filters.tags.map(
      (tag): FilterChip => ({ kind: "tag", tag, label: `#${tag}` }),
    ),
  );
  if (filters.status !== "all")
    chips.push({
      kind: "field",
      field: "status",
      label: filters.status === "completed" ? "จบแล้ว" : "กำลังเขียน",
    });
  if (filters.length !== "all")
    chips.push({
      kind: "field",
      field: "length",
      label: {
        short: "ต่ำกว่า 100 บท",
        medium: "100–500 บท",
        long: "500 บทขึ้นไป",
      }[filters.length],
    });
  return chips;
}

export function DiscoverExperience({
  data,
  initialGenre,
  initialType = null,
}: {
  data: DiscoverPageData;
  initialGenre: DiscoverGenre | null;
  initialType?: ContentType | null;
}) {
  const router = useRouter();
  const { isLoggedIn, user } = useRole();
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    category: initialGenre ?? "all",
    type: initialType ?? "all",
  }));
  const [draft, setDraft] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    category: initialGenre ?? "all",
    type: initialType ?? "all",
  }));
  const [touched, setTouched] = useState(Boolean(initialGenre || initialType));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<string[]>([]);
  const parsedQuery = useMemo(() => parseQuery(query), [query]);
  const chips = activeFilterChips(filters);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored: unknown = JSON.parse(
          localStorage.getItem("readlead-discover-history-v1") ?? "[]",
        );
        if (Array.isArray(stored))
          setHistory(
            stored
              .filter((item): item is string => typeof item === "string")
              .slice(0, 15),
          );
      } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const updateHistory = (next: string[]) => {
    setHistory(next);
    try {
      localStorage.setItem(
        "readlead-discover-history-v1",
        JSON.stringify(next),
      );
    } catch {}
  };

  useEffect(() => {
    if (!drawerOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", close);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!user) {
      const timer = window.setTimeout(() => setSavedIds(new Set()), 0);
      return () => window.clearTimeout(timer);
    }
    let localIds: string[] = [];
    try {
      localIds = JSON.parse(
        localStorage.getItem(shelfStorageKey(user.id)) ?? "[]",
      ) as string[];
    } catch {}
    const timer = window.setTimeout(() => setSavedIds(new Set(localIds)), 0);
    const controller = new AbortController();
    void fetch("/api/member/activity", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : { shelves: [] }))
      .then((payload: { shelves?: Array<{ work: { id: string } }> }) => {
        setSavedIds(
          (current) =>
            new Set([
              ...current,
              ...(payload.shelves ?? []).map((item) => item.work.id),
            ]),
        );
      })
      .catch(() => undefined);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [user]);

  const tagPool = useMemo(() => {
    const counts = new Map<string, number>();
    for (const work of data.works)
      for (const tag of work.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    return [...counts]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "th"));
  }, [data.works]);

  const rowsBeforeType = useMemo(
    () =>
      data.works.filter((work) => {
        const searchable = [
          work.title,
          work.author,
          categoryLabel(work),
          TYPE_LABELS[work.type],
          originLabel(work),
          work.status === "completed" ? "จบแล้ว" : "กำลังเขียน",
        ];
        if (
          !parsedQuery.keywords.every((keyword) =>
            searchable.some((value) =>
              normalized(value).includes(normalized(keyword)),
            ),
          )
        )
          return false;
        if (
          parsedQuery.tags.length &&
          !work.tags.some((tag) =>
            parsedQuery.tags.some((part) =>
              normalized(tag).includes(normalized(part)),
            ),
          )
        )
          return false;
        if (!matchesCategory(work, filters.category)) return false;
        if (filters.status === "active" && work.status === "completed")
          return false;
        if (filters.status === "completed" && work.status !== "completed")
          return false;
        if (
          !matchesOrigin(work, filters.origin) ||
          !matchesLength(work, filters.length)
        )
          return false;
        return filters.tags.every((tag) => work.tags.includes(tag));
      }),
    [data.works, filters, parsedQuery],
  );

  const typeCounts = {
    all: rowsBeforeType.length,
    novel: rowsBeforeType.filter((work) => work.type === "novel").length,
    manga: rowsBeforeType.filter((work) => work.type === "manga").length,
    audiobook: rowsBeforeType.filter((work) => work.type === "audiobook")
      .length,
  };

  const resultRows = useMemo(
    () =>
      rowsBeforeType
        .filter((work) => filters.type === "all" || work.type === filters.type)
        .sort((a, b) => {
          if (filters.sort === "newest")
            return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
          if (filters.sort === "oldest")
            return Date.parse(a.updatedAt) - Date.parse(b.updatedAt);
          if (filters.sort === "popular")
            return b.views + b.votes * 50 - (a.views + a.votes * 50);
          return relevanceScore(b, query) - relevanceScore(a, query);
        }),
    [filters.sort, filters.type, query, rowsBeforeType],
  );

  const perPage = view === "grid" ? 12 : 10;
  const totalPages = Math.max(1, Math.ceil(resultRows.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const visibleRows = resultRows.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const resultLabel = query
    ? `“${query}”`
    : filters.category !== "all"
      ? (DRAWER_GENRES.find((item) => item.key === filters.category)?.label ??
        "ทั้งหมด")
      : filters.type !== "all"
        ? TYPE_LABELS[filters.type]
        : "ทั้งหมด";

  const applyFilters = (next: Filters) => {
    setFilters(next);
    setDraft(next);
    setTouched(true);
    setPage(1);
  };

  const search = (value: string) => {
    const next = value.trim();
    setQueryInput(next);
    setQuery(next);
    applyFilters({ ...filters, category: "all" });
    if (next)
      updateHistory(
        [next, ...history.filter((item) => item !== next)].slice(0, 15),
      );
  };

  const selectTag = (tag: string) => applyFilters({ ...filters, tags: [tag] });
  const removeChip = (chip: FilterChip) => {
    if (chip.kind === "tag")
      applyFilters({
        ...filters,
        tags: filters.tags.filter((tag) => tag !== chip.tag),
      });
    else if (chip.field === "type")
      applyFilters({ ...filters, type: "all", origin: "all" });
    else applyFilters({ ...filters, [chip.field]: "all" });
  };
  const searchProps: SearchBoxProps = {
    value: queryInput,
    onChange: setQueryInput,
    onSearch: search,
    works: data.works,
    tags: tagPool,
    history,
    onHistory: updateHistory,
  };

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
      <MobileSearchBar {...searchProps} onBack={goBack} />
      <div className={styles.container}>
        <SearchHero data={data.cms.hero} {...searchProps} />

        <div className={styles.tabsRow}>
          <div className={styles.typeTabs}>
            {TYPE_OPTIONS.map((item) => (
              <button
                type="button"
                key={item.key}
                className={
                  touched && filters.type === item.key
                    ? styles.typeTabActive
                    : styles.typeTab
                }
                onClick={() => {
                  if (!query && filters.category === "all") return;
                  applyFilters({
                    ...filters,
                    type: item.key,
                    origin: item.key === filters.type ? filters.origin : "all",
                  });
                }}
              >
                {item.label}
                {touched && <span>{typeCounts[item.key]}</span>}
              </button>
            ))}
          </div>
        </div>

        <section
          className={styles.results}
          ref={resultsRef}
          aria-labelledby="discover-results"
        >
          <div className={styles.resultsHead}>
            <h2 id="discover-results">
              ผลการค้นหา{" "}
              {touched && (
                <>
                  <strong>{resultLabel}</strong>{" "}
                  <span>พบ {thaiNumber(resultRows.length)} เรื่อง</span>
                </>
              )}
            </h2>
            <div className={styles.resultsControls}>
              <button
                type="button"
                className={styles.filterButton}
                onClick={() => {
                  setDraft(filters);
                  setDrawerOpen(true);
                }}
              >
                <SlidersHorizontal />
                ตัวกรอง{chips.length > 0 && <span>{chips.length}</span>}
              </button>
              <label>
                <span>เรียงตาม</span>
                <span className={styles.selectWrap}>
                  <select
                    value={filters.sort}
                    onChange={(event) => {
                      const sort = event.target.value as SortMode;
                      setFilters({ ...filters, sort });
                      setDraft({ ...draft, sort });
                      setPage(1);
                    }}
                  >
                    {Object.entries(SORT_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown />
                </span>
              </label>
              <div className={styles.viewToggle} aria-label="รูปแบบการแสดงผล">
                <button
                  type="button"
                  aria-label="แบบตาราง"
                  aria-pressed={view === "grid"}
                  className={view === "grid" ? styles.viewActive : undefined}
                  onClick={() => {
                    setView("grid");
                    setPage(1);
                  }}
                >
                  <Grid2X2 />
                </button>
                <button
                  type="button"
                  aria-label="แบบรายการ"
                  aria-pressed={view === "list"}
                  className={view === "list" ? styles.viewActive : undefined}
                  onClick={() => {
                    setView("list");
                    setPage(1);
                  }}
                >
                  <ListIcon />
                </button>
              </div>
            </div>
          </div>

          {touched && chips.length > 0 && (
            <div className={styles.filterChips} aria-label="ตัวกรองที่ใช้อยู่">
              {chips.map((chip) => (
                <span
                  className={styles.filterChip}
                  key={chip.kind === "tag" ? `tag-${chip.tag}` : chip.field}
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={() => removeChip(chip)}
                    aria-label={`ลบตัวกรอง ${chip.label}`}
                  >
                    <X />
                  </button>
                </span>
              ))}
              <button
                type="button"
                className={styles.clearFilters}
                onClick={() =>
                  applyFilters({ ...DEFAULT_FILTERS, sort: filters.sort })
                }
              >
                ล้างทั้งหมด
              </button>
            </div>
          )}
          {!touched ? (
            <div className={styles.initialState}>
              <span>ค้นหาผลงาน</span>
            </div>
          ) : visibleRows.length ? (
            view === "grid" ? (
              <div className={styles.resultGrid}>
                {visibleRows.map((work, index) => (
                  <GridCard
                    key={work.id}
                    work={work}
                    priority={currentPage === 1 && index < 3}
                    query={parsedQuery}
                    selectedTags={[...filters.tags, ...parsedQuery.tags]}
                    onTag={selectTag}
                    onSearch={search}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.resultList}>
                {visibleRows.map((work) => (
                  <ListCard
                    key={work.id}
                    work={work}
                    saved={savedIds.has(work.detailId)}
                    onToggleShelf={toggleShelf}
                    query={parsedQuery}
                    selectedTags={[...filters.tags, ...parsedQuery.tags]}
                    onTag={selectTag}
                    onSearch={search}
                  />
                ))}
              </div>
            )
          ) : (
            <div className={styles.emptyState}>
              <Search />
              <b>ไม่พบเรื่องที่ตรงกับ “{query || resultLabel}”</b>
              <span>ลองค้นหาคำอื่นหรือล้างตัวกรอง</span>
            </div>
          )}

          {touched && totalPages > 1 && (
            <nav className={styles.pagination} aria-label="หน้าผลการค้นหา">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                aria-label="หน้าก่อนหน้า"
              >
                <ChevronLeft />
              </button>
              {pageNumbers(currentPage, totalPages).map((item, index) =>
                item === "dots" ? (
                  <span key={`dots-${index}`}>…</span>
                ) : (
                  <button
                    type="button"
                    key={item}
                    className={
                      item === currentPage ? styles.pageActive : undefined
                    }
                    onClick={() => goToPage(item)}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                aria-label="หน้าถัดไป"
              >
                <ChevronRight />
              </button>
            </nav>
          )}
        </section>
      </div>

      {drawerOpen && (
        <FilterDrawer
          draft={draft}
          tags={tagPool}
          onDraft={setDraft}
          onClose={() => setDrawerOpen(false)}
          onClear={() => setDraft({ ...DEFAULT_FILTERS, sort: filters.sort })}
          onApply={() => {
            applyFilters(draft);
            setDrawerOpen(false);
          }}
        />
      )}
    </div>
  );
}
