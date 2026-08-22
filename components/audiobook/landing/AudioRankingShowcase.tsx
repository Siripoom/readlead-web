import Link from 'next/link'
import { Headphones } from 'lucide-react'
import type { AudioRankingGroup, AudioRankingItem } from '@/lib/audiobook-landing-data'
import { AudioCover } from './AudioCover'
import styles from './AudioLanding.module.css'

const TITLES: Record<AudioRankingGroup['id'], string> = {
  vote_d: 'โหวตแนะนำ',
  vote_m: 'โหวตรายเดือน',
  listens: 'ยอดฟังสูงสุด',
  new: 'เรื่องใหม่มาแรง',
}

function itemHref(item: AudioRankingItem) {
  return item.href ?? `/detail?bookId=${encodeURIComponent(item.detailId)}`
}

function RankingPanel({ group }: { group: AudioRankingGroup }) {
  const [champion, ...rest] = group.items
  if (!champion) return null
  return (
    <article className={styles.rankingPanel}>
      <div className={styles.rankingPanelHead}>
        <h3>{TITLES[group.id]}</h3>
        <Link href="/ranking">ดูทั้งหมด ›</Link>
      </div>
      <Link href={itemHref(champion)} className={styles.rankingChampion}>
        <div className={styles.rankingChampionCopy}>
          <b>#1</b>
          <h4>{champion.title}</h4>
          <strong>{champion.value}</strong>
          <p>{champion.genreLabel} · {champion.originLabel}</p>
        </div>
        <div className={`${styles.rankingChampionCover} group`} style={{ background: champion.gradient }}>
          <AudioCover index={0} coverUrl={champion.coverUrl} title={champion.title} sizes="72px" />
        </div>
      </Link>
      <ol className={styles.rankingList}>
        {rest.slice(0, 9).map((item, index) => (
          <li key={item.id}>
            <Link href={itemHref(item)}>
              <span className={styles.rankingNumber}>#{index + 2}</span>
              <span className={styles.rankingName}>{item.title}</span>
              <strong>{group.id === 'listens' ? <Headphones /> : null}{item.value}</strong>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  )
}

export function AudioRankingShowcase({ groups }: { groups: AudioRankingGroup[] }) {
  return <div className={styles.rankingGrid}>{groups.map((group) => <RankingPanel key={group.id} group={group} />)}</div>
}
