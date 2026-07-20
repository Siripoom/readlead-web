'use client'

import { useEffect, useMemo, useRef, useState, type Dispatch, type ElementType, type FormEvent, type SetStateAction } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, ChevronDown, CircleDollarSign, Headphones, PenTool, Rocket, Search, Shield, TicketCheck } from 'lucide-react'
import { HELP_CATEGORIES, HELP_FAQS, type HelpArticle, type HelpCategoryIcon } from '@/lib/profile-help-data'
import styles from '../profile.module.css'

const CATEGORY_ICONS: Record<HelpCategoryIcon, ElementType> = {
  rocket: Rocket,
  book: BookOpen,
  coin: CircleDollarSign,
  ticket: TicketCheck,
  pen: PenTool,
  shield: Shield,
}

export function OwnerHelp() {
  const router = useRouter()
  const pathname = usePathname()
  const categoryGridRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLElement>(null)
  const [query, setQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [openArticleIds, setOpenArticleIds] = useState<Set<string>>(() => new Set())
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(() => new Set())
  const [columnCount, setColumnCount] = useState(3)

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return HELP_FAQS
    return HELP_FAQS.filter((item) => `${item.question} ${item.answer}`.toLowerCase().includes(normalized))
  }, [query])

  useEffect(() => {
    const grid = categoryGridRef.current
    if (!grid) return
    let active = true
    const updateColumnCount = () => {
      if (!active) return
      const count = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length
      setColumnCount(Math.max(1, count))
    }
    const observer = new ResizeObserver(updateColumnCount)
    observer.observe(grid)
    queueMicrotask(updateColumnCount)
    return () => {
      active = false
      observer.disconnect()
    }
  }, [])

  const selectedCategory = HELP_CATEGORIES.find((category) => category.id === selectedCategoryId) ?? null
  const panelAfterIndex = selectedCategory
    ? Math.min(Math.ceil((HELP_CATEGORIES.findIndex((category) => category.id === selectedCategory.id) + 1) / columnCount) * columnCount, HELP_CATEGORIES.length) - 1
    : -1

  function toggleId(setter: Dispatch<SetStateAction<Set<string>>>, id: string) {
    setter((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectCategory(id: string) {
    setSelectedCategoryId((current) => current === id ? null : id)
    setOpenArticleIds(new Set())
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    faqRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.helpPage}>
      <section className={styles.helpHero}>
        <span className={styles.helpHeroDeco} aria-hidden="true" />
        <h1>เราช่วยอะไรคุณได้บ้าง?</h1>
        <p>ค้นหาคำตอบ คู่มือการใช้งาน และเคล็ดลับต่าง ๆ ของ ReadLead</p>
        <form className={styles.helpSearch} role="search" onSubmit={submitSearch}>
          <Search aria-hidden="true" />
          <label className="sr-only" htmlFor="profile-help-search">ค้นหาคู่มือผู้ใช้</label>
          <input
            id="profile-help-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="พิมพ์คำถามหรือคำค้น เช่น เติมเหรียญ, โหวต, สมัครนักเขียน..."
          />
          <button type="submit">ค้นหา</button>
        </form>
      </section>

      <h2 className={styles.helpSectionTitle}>หมวดหมู่ความช่วยเหลือ</h2>
      <div ref={categoryGridRef} className={styles.helpCategoryGrid}>
        {HELP_CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.icon]
          const active = selectedCategoryId === category.id
          return (
            <div key={category.id} className={styles.helpCategoryCell}>
              <button
                type="button"
                className={`${styles.card} ${styles.helpCategory} ${active ? styles.helpCategoryActive : ''}`}
                onClick={() => selectCategory(category.id)}
                aria-expanded={active}
                aria-controls={active ? 'profile-help-category-panel' : undefined}
              >
                <span className={styles.helpCategoryIcon}><Icon /></span>
                <span className={styles.helpCategoryText}>
                  <b>{category.title}</b>
                  <small>{category.description}</small>
                  <em>{category.count} บทความ</em>
                </span>
              </button>
            </div>
          )
        }).flatMap((card, index) => selectedCategory && index === panelAfterIndex
          ? [card, <CategoryPanel key="category-panel" category={selectedCategory} openIds={openArticleIds} onToggle={(id) => toggleId(setOpenArticleIds, id)} />]
          : [card])}
      </div>

      <section ref={faqRef} className={`${styles.card} ${styles.helpFaqSection}`}>
        <div className={styles.helpFaqHeader}><h2>คำถามที่พบบ่อย</h2></div>
        {results.length ? results.map((item) => {
          const open = openFaqIds.has(item.id)
          return (
            <div key={item.id} className={`${styles.helpAccordion} ${open ? styles.helpAccordionOpen : ''}`}>
              <button type="button" onClick={() => toggleId(setOpenFaqIds, item.id)} aria-expanded={open} aria-controls={`${item.id}-answer`}>
                <span className={styles.helpQuestionBadge}>Q</span>
                <span>{item.question}</span>
                <ChevronDown className={styles.helpChevron} />
              </button>
              <div id={`${item.id}-answer`} className={styles.helpAccordionContent} aria-hidden={!open}>
                <div><p>{item.answer}</p></div>
              </div>
            </div>
          )
        }) : <div className={styles.helpNoMatch}>ไม่พบคำถามที่ตรงกับการค้นหา ลองพิมพ์คำอื่น หรือติดต่อทีมงานด้านล่าง</div>}
      </section>

      <section className={`${styles.card} ${styles.helpCta}`}>
        <span className={styles.helpCtaIcon}><Headphones /></span>
        <div><b>ยังหาคำตอบไม่เจอ?</b><p>ทีมงานพร้อมช่วยเหลือคุณ ติดต่อเราได้ตลอด 24 ชม.</p></div>
        <button type="button" onClick={() => router.push(`${pathname}?tab=report`, { scroll: false })}>ติดต่อทีมงาน</button>
      </section>
    </div>
  )
}

function CategoryPanel({ category, openIds, onToggle }: { category: typeof HELP_CATEGORIES[number]; openIds: Set<string>; onToggle: (id: string) => void }) {
  return (
    <section id="profile-help-category-panel" className={styles.helpCategoryPanel}>
      <h3>{category.title} <span>{category.panelCount} บทความ</span></h3>
      <div>
        {category.articles.map((article, index) => <ArticleAccordion key={article.id} article={article} number={index + 1} open={openIds.has(article.id)} onToggle={() => onToggle(article.id)} />)}
      </div>
    </section>
  )
}

function ArticleAccordion({ article, number, open, onToggle }: { article: HelpArticle; number: number; open: boolean; onToggle: () => void }) {
  return (
    <div className={`${styles.helpAccordion} ${styles.helpArticleAccordion} ${open ? styles.helpAccordionOpen : ''}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={`${article.id}-content`}>
        <span className={styles.helpQuestionBadge}>{number}</span>
        <span>{article.title}</span>
        <ChevronDown className={styles.helpChevron} />
      </button>
      <div id={`${article.id}-content`} className={styles.helpAccordionContent} aria-hidden={!open}>
        <div className={styles.helpArticleBody} dangerouslySetInnerHTML={{ __html: article.html }} />
      </div>
    </div>
  )
}
