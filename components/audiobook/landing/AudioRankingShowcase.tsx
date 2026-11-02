import Link from 'next/link'
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
  const unit = group.id === 'vote_d' || group.id === 'vote_m' ? 'โหวต' : group.id === 'listens' ? 'ฟัง' : ''
  return (
    <article className={styles.rankingPanel}>
      <div className={styles.rankingPanelHead}>
        <h3>{TITLES[group.id]}</h3>
        <Link href="/ranking">ดูทั้งหมด ›</Link>
      </div>
      <div className={styles.rankingPanelBody}>
        <Link href={itemHref(champion)} className={styles.rankingChampion}>
          <div className={styles.rankingChampionCopy}>
            <b>#1</b>
            <h4>{champion.title}</h4>
            <strong>{champion.value}<small>{unit}</small></strong>
            <p>{champion.genreLabel} · {champion.originLabel} · {champion.author}</p>
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
                <strong>{item.value}<small>{unit}</small></strong>
                <span className={styles.rankingDetails}>{item.genreLabel} · {item.originLabel} · {item.author}</span>
                <span className={`${styles.rankingRowCover} group`} style={{ background: item.gradient }}>
                  <AudioCover index={index + 1} coverUrl={item.coverUrl} title={item.title} sizes="72px" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </article>
  )
}

export function AudioRankingShowcase({ groups }: { groups: AudioRankingGroup[] }) {
  return <div className={styles.rankingGrid}>{groups.map((group) => <RankingPanel key={group.id} group={group} />)}</div>
}
