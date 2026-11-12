"use client";

import {
  startTransition,
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Book,
  BookMarked,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  Headphones,
  Heart,
  History,
  Library,
  Menu,
  Sun,
  Ticket,
  UsersRound,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";
import { shelfStorageKey } from "@/lib/profile-repository";
import {
  RANKING_GENRES,
  RANKING_SORT_LABELS,
  RANKING_STATS,
  RANKING_TYPE_LABELS,
  RANKING_VIEW_LABELS,
  type RankingContentType,
  type RankingCreatorItem,
  type RankingGenreKey,
  type RankingRouteState,
  type RankingSort,
  type RankingView,
  type RankingWorkItem,
} from "@/lib/ranking-page-data";
import styles from "./RankingLanding.module.css";

const PAGE_SIZE = 20;
const DAILY_MAX = 15;
const MONTHLY_MAX = 30;
const COUNTRIES = ["", "จีน", "เกาหลี", "ญี่ปุ่น", "อังกฤษ", "อื่นๆ"];
const VOTE_STORAGE_KEY = "rl_ranking_votes_v1";

type VoteKind = "daily" | "monthly";
type VoteBonus = { daily: number; monthly: number };
type VoteLedger = {
  dailyKey: string;
  monthlyKey: string;
  dailyUsed: number;
  monthlyUsed: number;
  bonuses: Record<string, VoteBonus>;
  server?: boolean;
  dailyAllowance?: number;
  dailyBalance?: number;
  monthlyBalance?: number;
};

interface Props {
  state: RankingRouteState;
  works: RankingWorkItem[];
  creators: RankingCreatorItem[];
}

const todayKey = () => new Date().toLocaleDateString("en-CA");
const monthKey = () => todayKey().slice(0, 7);
const initialLedger = (): VoteLedger => ({
  dailyKey: todayKey(),
  monthlyKey: monthKey(),
  dailyUsed: 0,
  monthlyUsed: 0,
  bonuses: {},
});

const remainingTickets = (ledger: VoteLedger, kind: VoteKind) => {
  if (ledger.server)
    return kind === "daily"
      ? (ledger.dailyBalance ?? 0)
      : (ledger.monthlyBalance ?? 0);
  return Math.max(
    0,
    kind === "daily"
      ? DAILY_MAX - ledger.dailyUsed
      : MONTHLY_MAX - ledger.monthlyUsed,
  );
};

const fmt = (value: number) => {
  if (value >= 1_000_000) return `${Number((value / 1_000_000).toFixed(1))}M`;
  if (value >= 10_000) return `${Number((value / 1_000).toFixed(1))}K`;
  return value.toLocaleString("en-US");
};

const coverStyle = (
  item: Pick<RankingWorkItem, "coverFrom" | "coverTo">,
): CSSProperties => ({
  background: `linear-gradient(155deg, ${item.coverFrom}, ${item.coverTo})`,
});

function buildHref(
  state: RankingRouteState,
  options: { genre?: RankingGenreKey | null; page?: number } = {},
) {
  const params = new URLSearchParams();
  if (state.type && state.sort) {
    params.set("type", state.type);
    params.set("sort", state.sort);
  } else if (state.view !== "overview") {
    params.set("view", state.view);
  }
  const genre = options.genre === undefined ? state.genre : options.genre;
  if (genre) params.set("genre", genre);
  if (state.origin) params.set("origin", state.origin);
  if (options.page && options.page > 1)
    params.set("page", String(options.page));
  const query = params.toString();
  return query ? `/ranking?${query}` : "/ranking";
}

function currentLabel(state: RankingRouteState) {
  if (state.type && state.sort)
    return `${RANKING_TYPE_LABELS[state.type]} · ${RANKING_SORT_LABELS[state.sort].label}`;
  if (state.view !== "overview") return RANKING_VIEW_LABELS[state.view].label;
  return "ภาพรวม";
}

const TYPE_ICONS: Record<RankingContentType, ReactNode> = {
  novel: <BookOpen />,
  manga: <Library />,
  audiobook: <Headphones />,
};

const SORTS: RankingSort[] = ["recommended", "monthly", "views"];
const OTHER_VIEWS: Array<{
  view: Exclude<RankingView, "overview">;
  icon: ReactNode;
}> = [
  { view: "completed", icon: <History /> },
  { view: "shelf", icon: <BookMarked /> },
  { view: "favorites", icon: <Heart /> },
];

function SideMenu({
  state,
  onNavigate,
}: {
  state: RankingRouteState;
  onNavigate?: () => void;
}) {
  const [openGroups, setOpenGroups] = useState<
    Record<RankingContentType, boolean>
  >({
    novel: state.type === "novel",
    manga: state.type === "manga",
    audiobook: state.type === "audiobook",
  });

  return (
    <>
      <nav className={styles.sideNav} aria-label="หมวดกระดานอันดับ">
        <Link
          href="/ranking"
          onClick={onNavigate}
          aria-current={
            state.view === "overview" && !state.type ? "page" : undefined
          }
          className={cn(
            styles.sideLink,
            state.view === "overview" && !state.type && styles.sideLinkActive,
          )}
        >
          <BarChart3 className={styles.sideIcon} /> ภาพรวม
        </Link>

        {(["novel", "manga", "audiobook"] as RankingContentType[]).map(
          (type) => {
            const isOpen = openGroups[type];
            return (
              <div key={type}>
                <button
                  type="button"
                  className={styles.groupButton}
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpenGroups((current) => ({
                      ...current,
                      [type]: !current[type],
                    }))
                  }
                >
                  <span className={styles.sideIcon}>{TYPE_ICONS[type]}</span>
                  <span className={styles.groupLabel}>
                    {RANKING_TYPE_LABELS[type]}
                  </span>
                  <ChevronDown
                    className={cn(styles.chevron, isOpen && styles.chevronOpen)}
                  />
                </button>
                {isOpen && (
                  <div className={styles.subNav}>
                    {SORTS.map((sort) => {
                      const active = state.type === type && state.sort === sort;
                      const label =
                        sort === "new"
                          ? `อันดับ${type === "novel" ? "หนังสือ" : type === "manga" ? "เว็บตูน" : "หนังสือเสียง"}ใหม่`
                          : RANKING_SORT_LABELS[sort].label;
                      return (
                        <Link
                          key={sort}
                          href={`/ranking?type=${type}&sort=${sort}`}
                          onClick={onNavigate}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            styles.subLink,
                            active && styles.subLinkActive,
                          )}
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          },
        )}

        <details
          className={styles.sideGroup}
          open={state.sort === "new" || undefined}
        >
          <summary className={styles.groupButton}>
            <span className={styles.groupLabel}>ผลงานเปิดตัว</span>
            <ChevronDown className={styles.chevron} />
          </summary>
          <div className={styles.subNav}>
            {(["ไทย", "แปล"] satisfies RankingWorkItem["origin"][]).map(
              (origin) => (
                <Link
                  className={cn(
                    styles.subLink,
                    state.sort === "new" &&
                      state.origin === origin &&
                      styles.subLinkActive,
                  )}
                  key={origin}
                  onClick={onNavigate}
                  href={buildHref({
                    ...state,
                    view: "overview",
                    type: "novel",
                    sort: "new",
                    origin,
                    genre: null,
                  })}
                >
                  ผลงาน{origin}
                </Link>
              ),
            )}
          </div>
        </details>
        <div className={styles.separator} />
        <div className={styles.sideSectionTitle}>อันดับอื่นๆ</div>
        <details
          className={styles.sideGroup}
          open={state.view === "creators" || undefined}
        >
          <summary className={styles.groupButton}>
            <span className={styles.groupLabel}>เจ้าของผลงาน</span>
            <ChevronDown className={styles.chevron} />
          </summary>
          <div className={styles.subNav}>
            {(["ไทย", "แปล"] satisfies RankingWorkItem["origin"][]).map(
              (origin) => (
                <Link
                  className={cn(
                    styles.subLink,
                    state.view === "creators" &&
                      state.origin === origin &&
                      styles.subLinkActive,
                  )}
                  key={origin}
                  onClick={onNavigate}
                  href={buildHref({
                    ...state,
                    view: "creators",
                    type: null,
                    sort: null,
                    origin,
                    genre: null,
                  })}
                >
                  ผลงาน{origin}
                </Link>
              ),
            )}
          </div>
        </details>
        {OTHER_VIEWS.filter((item) => item.view !== "favorites").map(
          ({ view, icon }) => {
            const active = state.view === view;
            return (
              <Link
                key={view}
                href={`/ranking?view=${view}`}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(styles.sideLink, active && styles.sideLinkActive)}
              >
                <span className={styles.sideIcon}>{icon}</span>
                {RANKING_VIEW_LABELS[view].label}
              </Link>
            );
          },
        )}
      </nav>

      <div className={styles.promo}>
        <h3>โหวตผลงานที่คุณชื่นชอบ</h3>
        <p>ทุกการโหวตของคุณ มีผลต่ออันดับผลงานที่คุณรักได้เลย!</p>

        <svg className={styles.gems} viewBox="0 0 100 90" aria-hidden="true">
          <defs>
            <linearGradient id="rank-gem" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#c69cff" />
              <stop offset="1" stopColor="#f48fc4" />
            </linearGradient>
          </defs>
          <polygon points="50,30 64,46 50,78 36,46" fill="url(#rank-gem)" />
          <polygon points="50,30 64,46 50,52 36,46" fill="#fff" opacity=".35" />
          <polygon points="70,44 80,54 72,76 60,58" fill="#f4a0cc" />
          <polygon
            points="30,50 40,60 34,80 22,62"
            fill="#b98bee"
            opacity=".9"
          />
          <circle cx="78" cy="34" r="3" fill="#f7a8d4" />
          <circle cx="24" cy="40" r="2.5" fill="#c69cff" />
        </svg>
      </div>
    </>
  );
}

function RankingHero() {
  const year = new Date().getFullYear();
  return (
    <section className={styles.heroBand}>
      <div className={styles.hero}>
        <svg
          className={styles.heroScene}
          aria-hidden="true"
          viewBox="0 0 800 300"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#cbe6ff" />
              <stop offset=".5" stopColor="#e1e4fb" />
              <stop offset="1" stopColor="#f7dcec" />
            </linearGradient>
            <radialGradient id="sun" cx=".34" cy=".22" r=".55">
              <stop offset="0" stopColor="#fff" stopOpacity=".9" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="cst" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e3e8fb" />
              <stop offset="1" stopColor="#bfc9ee" />
            </linearGradient>
            <linearGradient id="hr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#41527a" />
              <stop offset="1" stopColor="#1f2840" />
            </linearGradient>
          </defs>
          <rect width="800" height="300" fill="url(#sky)" />
          <rect width="800" height="300" fill="url(#sun)" />
          <g fill="#fff" opacity=".72">
            <ellipse cx="130" cy="64" rx="74" ry="22" />
            <ellipse cx="215" cy="54" rx="48" ry="16" />
            <ellipse cx="640" cy="46" rx="82" ry="24" />
            <ellipse cx="720" cy="78" rx="56" ry="17" />
            <ellipse cx="430" cy="40" rx="46" ry="14" />
          </g>
          <g fill="url(#cst)" opacity=".92">
            <rect x="452" y="150" width="20" height="92" />
            <polygon points="452,150 462,128 472,150" />
            <rect x="476" y="120" width="26" height="122" />
            <polygon points="476,120 489,92 502,120" />
            <rect x="506" y="138" width="20" height="104" />
            <polygon points="506,138 516,116 526,138" />
            <rect x="540" y="160" width="30" height="82" />
            <polygon points="540,160 555,138 570,160" />
            <rect x="430" y="170" width="16" height="72" />
            <polygon points="430,170 438,154 446,170" />
          </g>
          <path
            d="M0,238 Q400,216 800,242 L800,300 L0,300 Z"
            fill="#ecd9e9"
            opacity=".75"
          />
          <path
            d="M0,258 Q400,242 800,260 L800,300 L0,300 Z"
            fill="#ddc6dd"
            opacity=".7"
          />
          <g fill="url(#hr)">
            <ellipse cx="652" cy="120" rx="16" ry="18" />
            <path d="M620,152 Q652,138 684,152 L700,256 Q652,242 604,256 Z" />
            <path d="M684,150 L706,240 L692,246 L668,162 Z" />
            <path d="M618,150 L598,236 L612,242 L636,162 Z" />
          </g>
          <g fill="#f3a4c2" opacity=".85">
            <rect
              x="300"
              y="120"
              width="6"
              height="9"
              rx="3"
              transform="rotate(22 303 124)"
            />
            <rect
              x="356"
              y="172"
              width="5"
              height="8"
              rx="2"
              transform="rotate(-16 358 176)"
            />
            <rect
              x="404"
              y="208"
              width="6"
              height="9"
              rx="3"
              transform="rotate(34 407 212)"
            />
            <rect
              x="250"
              y="196"
              width="5"
              height="8"
              rx="2"
              transform="rotate(12 252 200)"
            />
            <rect
              x="338"
              y="96"
              width="5"
              height="7"
              rx="2"
              transform="rotate(-8 340 99)"
            />
          </g>
        </svg>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            กระดานอันดับปี <span>{year}</span>
          </h1>
          <p className={styles.heroDescription}>ร่วมโหวตผลงานที่คุณชื่นชอบ</p>
        </div>
      </div>
    </section>
  );
}

function GenreFilters({
  state,
  children,
}: {
  state: RankingRouteState;
  children?: ReactNode;
}) {
  return (
    <div className={styles.filters} aria-label="กรองหมวดหมู่">
      {children}
      <Link
        href={buildHref(state, { genre: null })}
        className={cn(styles.filterLink, !state.genre && styles.filterActive)}
      >
        ทุกหมวด
      </Link>
      {RANKING_GENRES.map((genre) => (
        <span key={genre.key} className="contents">
          <span className={styles.filterDot} aria-hidden="true">
            ·
          </span>
          <Link
            href={buildHref(state, { genre: genre.key })}
            className={cn(
              styles.filterLink,
              state.genre === genre.key && styles.filterActive,
            )}
          >
            {genre.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

function CountryOptions({
  value,
  onChange,
}: {
  value: string;
  onChange: (country: string) => void;
}) {
  return COUNTRIES.map((country, index) => (
    <span className="contents" key={country}>
      {index > 0 && (
        <span className={styles.filterDot} aria-hidden="true">
          ·
        </span>
      )}
      <button
        type="button"
        className={cn(
          styles.typeButton,
          country === value && styles.filterActive,
        )}
        aria-pressed={country === value}
        onClick={() => onChange(country)}
      >
        {country || "ทุกประเทศ"}
      </button>
    </span>
  ));
}

function StatsStrip({ works }: { works: RankingWorkItem[] }) {
  const creatorCount = (items: RankingWorkItem[]) =>
    new Set(items.map((work) => work.creatorId ?? work.author)).size;
  const count = (type: RankingContentType) =>
    works.filter((work) => work.type === type).length;
  const views = (type: RankingContentType) =>
    works
      .filter((work) => work.type === type)
      .reduce((total, work) => total + work.views, 0);
  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
  });
  const today = dateKey.format(new Date());
  const newWorks = works.filter(
    (work) =>
      work.publishedAt && dateKey.format(new Date(work.publishedAt)) === today,
  );
  const values: Record<
    (typeof RANKING_STATS)[number]["id"],
    { value: string; parts: Array<{ label: string; value: string }> }
  > = {
    creators: {
      value: creatorCount(works).toLocaleString("en-US"),
      parts: [
        {
          label: "นักเขียน",
          value: String(
            creatorCount(
              works.filter(
                (work) => work.type === "novel" && work.origin === "ไทย",
              ),
            ),
          ),
        },
        {
          label: "นักวาด",
          value: String(
            creatorCount(
              works.filter(
                (work) => work.type === "manga" && work.origin === "ไทย",
              ),
            ),
          ),
        },
        {
          label: "นักแปล",
          value: String(
            creatorCount(works.filter((work) => work.origin === "แปล")),
          ),
        },
        {
          label: "นักพากย์",
          value: String(
            creatorCount(
              works.filter(
                (work) => work.type === "audiobook" && work.origin === "ไทย",
              ),
            ),
          ),
        },
      ],
    },
    works: {
      value: String(works.length),
      parts: [
        { label: "นิยาย", value: String(count("novel")) },
        { label: "เว็บตูน", value: String(count("manga")) },
        { label: "หนังสือเสียง", value: String(count("audiobook")) },
      ],
    },
    views: {
      value: works
        .reduce((total, work) => total + work.views, 0)
        .toLocaleString("en-US"),
      parts: [
        { label: "นิยาย", value: fmt(views("novel")) },
        { label: "เว็บตูน", value: fmt(views("manga")) },
        { label: "หนังสือเสียง", value: fmt(views("audiobook")) },
      ],
    },
    new: {
      value: String(newWorks.length),
      parts: (
        ["novel", "manga", "audiobook"] satisfies RankingContentType[]
      ).map((type) => ({
        label: RANKING_TYPE_LABELS[type],
        value: String(newWorks.filter((work) => work.type === type).length),
      })),
    },
  };
  const statistics = RANKING_STATS.map((stat) => ({
    ...stat,
    ...values[stat.id],
  }));
  const icons = [
    <UsersRound key="users" />,
    <Book key="works" />,
    <Eye key="views" />,
    <Sun key="new" />,
  ];
  return (
    <section
      className={cn(styles.card, styles.stats)}
      aria-label="สถิติแพลตฟอร์ม"
    >
      {statistics.map((stat, index) => (
        <div className={styles.stat} key={stat.id}>
          <span className={styles.statIcon} style={{ background: stat.accent }}>
            {icons[index]}
          </span>
          <div>
            <div className={styles.statValue}>
              {stat.value} <span>{stat.unit}</span>
            </div>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statParts}>
              {stat.parts.map((part) => (
                <span key={part.label}>
                  {part.label} <b>{part.value}</b>
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function WorkLink({
  item,
  className,
  children,
}: {
  item: RankingWorkItem;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      className={className}
      href={`/detail?bookId=${encodeURIComponent(item.detailId)}`}
    >
      {children}
    </Link>
  );
}

function OverviewWorkTitle({ item }: { item: RankingWorkItem }) {
  const tooltipId = useId();
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  useEffect(() => {
    if (!position) return;
    const hide = () => setPosition(null);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [position]);

  const show = (anchor: HTMLAnchorElement) => {
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(400, window.innerWidth - 32);
    setPosition({
      left: Math.max(
        16,
        Math.min(rect.right + 14, window.innerWidth - width - 16),
      ),
      top: Math.max(16, Math.min(rect.top - 14, window.innerHeight - 190)),
    });
  };

  return (
    <>
      <Link
        href={`/detail?bookId=${encodeURIComponent(item.detailId)}`}
        className={styles.storyTitle}
        aria-describedby={position ? tooltipId : undefined}
        onMouseEnter={(event) => show(event.currentTarget)}
        onMouseLeave={() => setPosition(null)}
        onFocus={(event) => show(event.currentTarget)}
        onBlur={() => setPosition(null)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setPosition(null);
        }}
      >
        {item.title}
      </Link>
      {position &&
        createPortal(
          <div
            id={tooltipId}
            className={styles.workPreview}
            role="tooltip"
            style={position}
          >
            <span className={styles.previewCover} style={coverStyle(item)}>
              {item.title.slice(0, 2)}
            </span>
            <span>
              <strong>{item.title}</strong>
              <span>
                {item.author} · {item.genreLabel}
                {item.country ? ` · ต้นฉบับ${item.country}` : ""}
              </span>
              <span className={styles.previewSynopsis}>{item.synopsis}</span>
              <span className={styles.previewEpisode}>
                {item.latestEpisode}
              </span>
            </span>
          </div>,
          document.body,
        )}
    </>
  );
}

function OverviewTable({
  state,
  works,
  ledger,
}: Props & { ledger: VoteLedger }) {
  const [contentType, setContentType] = useState<RankingContentType>("novel");
  const [country, setCountry] = useState("");
  const rows = useMemo(
    () =>
      works
        .filter(
          (item) =>
            item.type === contentType &&
            (!state.genre || item.genre === state.genre),
        )
        .sort(
          (left, right) =>
            right.recommendedVotes +
            (ledger.bonuses[right.detailId]?.daily ?? 0) -
            left.recommendedVotes -
            (ledger.bonuses[left.detailId]?.daily ?? 0),
        ),
    [contentType, ledger.bonuses, state.genre, works],
  );

  return (
    <>
      <section className={cn(styles.card, styles.overviewFilters)}>
        <GenreFilters state={state}>
          <span
            className={styles.typeFilters}
            role="group"
            aria-label="ประเภทผลงาน"
          >
            {(
              ["novel", "manga", "audiobook"] satisfies RankingContentType[]
            ).map((type, index) => (
              <span className="contents" key={type}>
                {index > 0 && (
                  <span className={styles.filterDot} aria-hidden="true">
                    ·
                  </span>
                )}
                <button
                  type="button"
                  aria-pressed={contentType === type}
                  onClick={() => setContentType(type)}
                  className={cn(
                    styles.typeButton,
                    contentType === type && styles.filterActive,
                  )}
                >
                  {RANKING_TYPE_LABELS[type]}
                </button>
              </span>
            ))}
          </span>
          <span className={styles.filterDivider} aria-hidden="true" />
        </GenreFilters>
      </section>
      <div className={styles.overviewGrid}>
        {(["แปล", "ไทย"] satisfies RankingWorkItem["origin"][]).map(
          (origin) => {
            const originRows = rows
              .filter(
                (item) =>
                  item.origin === origin &&
                  (origin === "ไทย" || !country || item.country === country),
              )
              .slice(0, 100);
            return (
              <section
                className={cn(styles.card, styles.overviewCard)}
                key={origin}
                aria-label={`อันดับผลงาน${origin}`}
              >
                <div className={styles.sectionHead}>
                  <h2>
                    ผลงาน{origin} <small>(Top 100)</small>
                  </h2>
                </div>
                <div className={styles.countryFilters}>
                  {origin === "แปล" && (
                    <div role="group" aria-label="ประเทศต้นฉบับ">
                      <CountryOptions value={country} onChange={setCountry} />
                    </div>
                  )}
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <colgroup>
                      <col style={{ width: 60 }} />
                      <col />
                      <col style={{ width: 130 }} />
                      <col style={{ width: 96 }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className={styles.center}>อันดับ</th>
                        <th className={styles.titleCell}>เรื่อง</th>
                        <th>เจ้าของผลงาน</th>
                        <th className={styles.center}>คะแนน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {originRows.length === 0 && (
                        <tr>
                          <td colSpan={4} className={styles.empty}>
                            ยังไม่มีผลงาน
                          </td>
                        </tr>
                      )}
                      {originRows.map((item, index) => (
                        <tr key={item.id}>
                          <td className={styles.rankCell}>
                            <span
                              className={styles.rankNumber}
                              data-rank={index + 1}
                            >
                              {index + 1}
                              <span className={styles.rankChange}>
                                {item.change > 0
                                  ? `▲${item.change}`
                                  : item.change < 0
                                    ? `▼${Math.abs(item.change)}`
                                    : ""}
                              </span>
                            </span>
                          </td>
                          <td className={styles.titleCell}>
                            <OverviewWorkTitle item={item} />
                          </td>
                          <td className={styles.authorCell} title={item.author}>
                            {item.creatorId ? (
                              <Link
                                href={`/profile/${encodeURIComponent(item.creatorId)}`}
                              >
                                {item.author}
                              </Link>
                            ) : (
                              item.author
                            )}
                          </td>
                          <td className={styles.center}>
                            {fmt(
                              item.recommendedVotes +
                                (ledger.bonuses[item.detailId]?.daily ?? 0),
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          },
        )}
      </div>
    </>
  );
}

function metricFor(
  item: RankingWorkItem,
  state: RankingRouteState,
  bonus: VoteBonus,
) {
  if (state.view === "completed") return { value: item.views, label: "ยอดวิว" };
  if (state.view === "shelf")
    return { value: item.shelfCount, label: "เพิ่มเข้าชั้น" };
  if (state.view === "favorites")
    return { value: item.favoriteCount, label: "หัวใจ" };
  if (state.view === "reviews")
    return {
      value: item.reviewCount,
      label: `รีวิว · ${item.rating.toFixed(1)} ★`,
    };
  if (state.sort === "monthly")
    return { value: item.monthlyVotes + bonus.monthly, label: "คะแนนโหวต" };
  if (state.sort === "views") return { value: item.views, label: "ยอดเข้าชม" };
  if (state.sort === "new")
    return { value: new Date(item.updatedAt).getTime(), label: "เปิดตัวใหม่" };
  return { value: item.recommendedVotes + bonus.daily, label: "คะแนนโหวต" };
}

function sortWorks(
  works: RankingWorkItem[],
  state: RankingRouteState,
  ledger: VoteLedger,
) {
  return [...works].sort((left, right) => {
    if (state.sort === "new")
      return (
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      );
    const leftMetric = metricFor(
      left,
      state,
      ledger.bonuses[left.id] ?? { daily: 0, monthly: 0 },
    ).value;
    const rightMetric = metricFor(
      right,
      state,
      ledger.bonuses[right.id] ?? { daily: 0, monthly: 0 },
    ).value;
    return rightMetric - leftMetric;
  });
}

function Pagination({
  state,
  total,
}: {
  state: RankingRouteState;
  total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const candidates = Array.from(
    new Set([1, state.page - 1, state.page, state.page + 1, pages]),
  )
    .filter((page) => page >= 1 && page <= pages)
    .sort((a, b) => a - b);
  return (
    <nav className={styles.pagination} aria-label="หน้ารายการอันดับ">
      <Link
        aria-disabled={state.page === 1}
        href={buildHref(state, { page: state.page - 1 })}
        className={cn(styles.pageLink, state.page === 1 && styles.pageDisabled)}
      >
        <ChevronLeft size={15} />
        <span className="sr-only">ก่อนหน้า</span>
      </Link>
      {candidates.map((page, index) => (
        <span key={page} className="contents">
          {index > 0 && page - candidates[index - 1] > 1 && (
            <span className={styles.pageLink} aria-hidden="true">
              …
            </span>
          )}
          <Link
            aria-current={page === state.page ? "page" : undefined}
            href={buildHref(state, { page })}
            className={cn(
              styles.pageLink,
              page === state.page && styles.pageActive,
            )}
          >
            {page}
          </Link>
        </span>
      ))}
      <Link
        aria-disabled={state.page === pages}
        href={buildHref(state, { page: state.page + 1 })}
        className={cn(
          styles.pageLink,
          state.page === pages && styles.pageDisabled,
        )}
      >
        <ChevronRight size={15} />
        <span className="sr-only">ถัดไป</span>
      </Link>
    </nav>
  );
}

function CreatorList({
  state,
  creators,
  roleLabel,
}: {
  state: RankingRouteState;
  creators: Array<RankingCreatorItem & { profileId: string | null }>;
  roleLabel: string;
}) {
  const pageState = {
    ...state,
    page: Math.min(
      state.page,
      Math.max(1, Math.ceil(creators.length / PAGE_SIZE)),
    ),
  };
  const start = (pageState.page - 1) * PAGE_SIZE;
  const pageItems = creators.slice(start, start + PAGE_SIZE);
  return (
    <>
      <div className={styles.list}>
        {pageItems.length === 0 && (
          <div className={styles.empty}>ยังไม่มีเจ้าของผลงานในหมวดนี้</div>
        )}
        {pageItems.map((creator, index) => (
          <div className={styles.creatorRow} key={creator.id}>
            <div className={styles.creatorAvatarWrap}>
              <span
                className={styles.avatar}
                style={{
                  background: `linear-gradient(145deg,${creator.avatarFrom},${creator.avatarTo})`,
                }}
              >
                {creator.name.charAt(0)}
              </span>
            </div>
            <div className={styles.workMain}>
              <h3 className={styles.workTitle}>
                <span>#{start + index + 1}</span>
                {creator.profileId ? (
                  <Link
                    href={`/profile/${encodeURIComponent(creator.profileId)}`}
                  >
                    {creator.name}
                  </Link>
                ) : (
                  creator.name
                )}
              </h3>
              <p className={styles.creatorMeta}>{roleLabel}</p>
              <p className={styles.creatorWorks}>
                ผลงาน {creator.works} เรื่อง
              </p>
            </div>
            <div className={styles.workActions}>
              <div className={styles.metric}>
                <b>{fmt(creator.followers)}</b>
                <span>ผู้ติดตาม</span>
              </div>
              <div className={styles.creatorButtons}>
                {creator.profileId ? (
                  <>
                    <Link
                      className={styles.primaryButton}
                      href={`/profile/${encodeURIComponent(creator.profileId)}`}
                    >
                      ดูโปรไฟล์
                    </Link>
                    <Link
                      className={styles.outlineButton}
                      href={`/profile/${encodeURIComponent(creator.profileId)}`}
                      title="ติดตามที่หน้าโปรไฟล์"
                    >
                      + ติดตาม
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      disabled
                      title="ยังไม่มี ID โปรไฟล์สาธารณะ"
                    >
                      ดูโปรไฟล์
                    </button>
                    <button
                      type="button"
                      className={styles.outlineButton}
                      disabled
                      title="ยังไม่มี ID โปรไฟล์สาธารณะ"
                    >
                      + ติดตาม
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination state={pageState} total={creators.length} />
    </>
  );
}

function ListView({
  state,
  works,
  creators,
  ledger,
  onVote,
  savedIds,
  onToggleShelf,
}: Props & {
  ledger: VoteLedger;
  onVote: (item: RankingWorkItem) => void;
  savedIds: Set<string>;
  onToggleShelf: (id: string) => void;
}) {
  const [country, setCountry] = useState("");
  const [newDays, setNewDays] = useState(90);
  const [referenceTime] = useState(() => Date.now());
  const [creatorType, setCreatorType] = useState<RankingContentType>("novel");
  const origin = state.origin ?? "ไทย";
  const displayedCreators = creators.flatMap((creator) => {
    const matching = works.filter(
      (work) =>
        work.author === creator.name &&
        work.type === creatorType &&
        work.origin === origin &&
        (!country || origin === "ไทย" || work.country === country),
    );
    return matching.length
      ? [
          {
            ...creator,
            works: matching.length,
            profileId:
              matching.find((work) => work.creatorId)?.creatorId ?? null,
          },
        ]
      : [];
  });
  const baseTitle =
    state.type && state.sort
      ? RANKING_SORT_LABELS[state.sort]
      : state.view !== "overview"
        ? RANKING_VIEW_LABELS[state.view]
        : null;
  const title =
    state.type && state.sort === "new"
      ? {
          ...baseTitle,
          label: `ผลงานเปิดตัว${state.origin ? ` · ผลงาน${state.origin}` : ""}`,
        }
      : baseTitle;
  const sorted = useMemo(
    () =>
      sortWorks(
        works.filter(
          (item) =>
            (!state.type || item.type === state.type) &&
            item.origin === origin &&
            (origin === "ไทย" || !country || item.country === country) &&
            (state.sort !== "new" ||
              Boolean(
                item.publishedAt &&
                new Date(item.publishedAt).getTime() >=
                  referenceTime - newDays * 86_400_000,
              )) &&
            (!state.genre || item.genre === state.genre) &&
            (state.view !== "completed" || item.status === "completed"),
        ),
        state,
        ledger,
      ),
    [country, ledger, newDays, origin, referenceTime, state, works],
  );
  const currentPage = Math.min(
    state.page,
    Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)),
  );
  const pageState = { ...state, page: currentPage };
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(start, start + PAGE_SIZE);

  return (
    <section className={cn(styles.card, styles.listCard)}>
      <div className={styles.sectionHead}>
        <h2>
          {title?.label}
          {state.view === "creators" ? ` · ผลงาน${origin}` : ""}
        </h2>
        <small>
          {state.view === "creators"
            ? `${displayedCreators.length} รายการ`
            : `${sorted.length} ${state.sort === "new" ? "ผลงาน" : "เรื่อง"}`}
        </small>
        {state.sort === "new" && (
          <div
            className={styles.newDays}
            role="group"
            aria-label="ระยะเวลาเปิดตัวผลงาน"
          >
            <span>เปิดตัวภายใน</span>
            {[90, 60, 30, 15, 7].map((days) => (
              <button
                key={days}
                type="button"
                aria-pressed={newDays === days}
                className={cn(
                  styles.typeButton,
                  newDays === days && styles.filterActive,
                )}
                onClick={() => setNewDays(days)}
              >
                {days} วัน
              </button>
            ))}
          </div>
        )}
      </div>
      {state.view === "creators" && (
        <div
          className={styles.listFilters}
          role="group"
          aria-label="ประเภทผลงานของครีเอเตอร์"
        >
          {(["novel", "manga", "audiobook"] satisfies RankingContentType[]).map(
            (type, index) => (
              <span className="contents" key={type}>
                {index > 0 && (
                  <span className={styles.filterDot} aria-hidden="true">
                    ·
                  </span>
                )}
                <button
                  type="button"
                  className={cn(
                    styles.typeButton,
                    creatorType === type && styles.filterActive,
                  )}
                  aria-pressed={creatorType === type}
                  onClick={() => setCreatorType(type)}
                >
                  {RANKING_TYPE_LABELS[type]}
                </button>
              </span>
            ),
          )}
          {origin === "แปล" && (
            <>
              <span className={styles.filterDivider} aria-hidden="true" />
              <CountryOptions value={country} onChange={setCountry} />
            </>
          )}
        </div>
      )}
      {state.view !== "creators" && (
        <div className={styles.listFilters}>
          <div
            className={styles.listFilterControls}
            role="group"
            aria-label="กรองประเภทและต้นฉบับ"
          >
            {state.sort === "new" ? (
              <>
                {(
                  ["novel", "manga", "audiobook"] satisfies RankingContentType[]
                ).map((type) => (
                  <Link
                    key={type}
                    href={buildHref({ ...state, type })}
                    className={cn(
                      styles.filterLink,
                      state.type === type && styles.filterActive,
                    )}
                  >
                    {RANKING_TYPE_LABELS[type]}
                  </Link>
                ))}
              </>
            ) : (
              <>
                {(["ไทย", "แปล"] satisfies RankingWorkItem["origin"][]).map(
                  (value, index) => (
                    <span className="contents" key={value}>
                      {index > 0 && (
                        <span className={styles.filterDot} aria-hidden="true">
                          ·
                        </span>
                      )}
                      <Link
                        href={buildHref({ ...state, origin: value })}
                        className={cn(
                          styles.filterLink,
                          origin === value && styles.filterActive,
                        )}
                        aria-current={origin === value ? "true" : undefined}
                      >
                        {value}
                      </Link>
                    </span>
                  ),
                )}
              </>
            )}
            <span className={styles.filterDivider} aria-hidden="true" />
            {origin === "แปล" && (
              <>
                <CountryOptions value={country} onChange={setCountry} />
                <span className={styles.filterDivider} aria-hidden="true" />
              </>
            )}
          </div>
          <GenreFilters state={state} />
        </div>
      )}
      {state.view === "creators" ? (
        <CreatorList
          state={state}
          creators={displayedCreators}
          roleLabel={
            origin === "แปล"
              ? "นักแปล"
              : creatorType === "manga"
                ? "นักวาด"
                : creatorType === "audiobook"
                  ? "นักพากย์"
                  : "นักเขียน"
          }
        />
      ) : (
        <>
          <div className={styles.list}>
            {pageItems.length === 0 && (
              <div className={styles.empty}>ยังไม่มีรายการในหมวดนี้</div>
            )}
            {pageItems.map((item, index) => {
              const rank = start + index + 1;
              const bonus = ledger.bonuses[item.detailId] ?? {
                daily: 0,
                monthly: 0,
              };
              const metric = metricFor(item, state, bonus);
              return (
                <article className={styles.workRow} key={item.id}>
                  <WorkLink item={item} className={styles.coverWrap}>
                    <span className={styles.cover} style={coverStyle(item)}>
                      {item.title.slice(0, 2)}
                    </span>
                    {item.status === "completed" && (
                      <span className={styles.completedBadge}>จบ</span>
                    )}
                  </WorkLink>
                  <div className={styles.workMain}>
                    <h3 className={styles.workTitle}>
                      <span>#{rank}</span>
                      <WorkLink item={item}>{item.title}</WorkLink>
                    </h3>
                    <div className={styles.meta}>
                      <b>{item.author}</b>
                      <i className={styles.metaDivider} />
                      <span>{item.genreLabel}</span>
                      <i className={styles.metaDivider} />
                      <span>{item.origin}</span>
                      <i className={styles.metaDivider} />
                      <span>
                        เปิดตัว{" "}
                        {item.publishedAt
                          ? new Date(item.publishedAt).toLocaleDateString(
                              "th-TH",
                              { dateStyle: "medium", timeZone: "Asia/Bangkok" },
                            )
                          : item.launchedAt}
                      </span>
                    </div>
                    <p className={styles.description}>{item.synopsis}</p>
                    <div className={styles.workTags} aria-label="แท็กผลงาน">
                      {(item.tags?.length
                        ? item.tags
                        : [
                            item.genreLabel,
                            RANKING_TYPE_LABELS[item.type],
                            item.origin,
                          ]
                      ).map((tag) => (
                        <Link
                          key={tag}
                          href={`/search?q=${encodeURIComponent(`#${tag}`)}`}
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                    <p className={styles.updated}>
                      <b>อัปเดตล่าสุด</b>{" "}
                      <WorkLink item={item}>{item.latestEpisode}</WorkLink> ·{" "}
                      {new Date(item.updatedAt).toLocaleString("sv-SE", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Bangkok",
                      })}
                    </p>
                  </div>
                  <div className={styles.workActions}>
                    <div className={styles.metric}>
                      {state.view !== "completed" && (
                        <button
                          type="button"
                          className={styles.metricScoreButton}
                          onClick={() => onVote(item)}
                          aria-label={`โหวตให้ ${item.title}`}
                        >
                          <b>
                            {state.sort === "new"
                              ? fmt(item.recommendedVotes + bonus.daily)
                              : fmt(metric.value)}
                          </b>
                          {state.sort !== "new" && <span>{metric.label}</span>}
                        </button>
                      )}
                    </div>
                    <div className={styles.actionButtons}>
                      <WorkLink item={item} className={styles.primaryButton}>
                        รายละเอียดเรื่อง
                      </WorkLink>
                      <button
                        type="button"
                        className={styles.outlineButton}
                        onClick={() => onToggleShelf(item.detailId)}
                      >
                        {savedIds.has(item.detailId)
                          ? "✓ อยู่ในชั้นแล้ว"
                          : "+ เพิ่มเข้าชั้น"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <Pagination state={pageState} total={sorted.length} />
        </>
      )}
    </section>
  );
}

function VoteDialog({
  item,
  open,
  onOpenChange,
  ledger,
  onConfirm,
  message,
}: {
  item: RankingWorkItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ledger: VoteLedger;
  onConfirm: (kind: VoteKind) => void;
  message: string;
}) {
  if (!item) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialog}>
        <DialogHeader>
          <DialogTitle className={styles.dialogTitle}>
            โหวตให้ “{item.title}”
          </DialogTitle>
          <DialogDescription>
            เลือกตั๋วที่ต้องการใช้ 1 ใบ คะแนนจะอัปเดตบนกระดานทันที
          </DialogDescription>
        </DialogHeader>
        <div className={styles.dialogCover}>
          <span className={styles.dialogMiniCover} style={coverStyle(item)}>
            {item.title.charAt(0)}
          </span>
          <div>
            <b>{item.title}</b>
            <p className={styles.creatorMeta}>
              {item.author} · {item.genreLabel}
            </p>
          </div>
        </div>
        <div className={styles.dialogOptions}>
          <button
            type="button"
            className={styles.dialogOption}
            style={
              { "--accent": "#cc4452", "--bg": "#fff5f8" } as CSSProperties
            }
            disabled={remainingTickets(ledger, "daily") <= 0}
            onClick={() => onConfirm("daily")}
          >
            <Ticket color="#cc4452" />
            <b>โหวตแนะนำ</b>
            <span>เหลือ {remainingTickets(ledger, "daily")} ใบวันนี้</span>
          </button>
          <button
            type="button"
            className={styles.dialogOption}
            style={
              { "--accent": "#f6921e", "--bg": "#fff9f1" } as CSSProperties
            }
            disabled={remainingTickets(ledger, "monthly") <= 0}
            onClick={() => onConfirm("monthly")}
          >
            <Crown color="#f6921e" />
            <b>โหวตรายเดือน</b>
            <span>เหลือ {remainingTickets(ledger, "monthly")} ใบ</span>
          </button>
        </div>
        <p className={styles.dialogMessage} role="status">
          {message}
        </p>
      </DialogContent>
    </Dialog>
  );
}

export function RankingExperience({ state, works, creators }: Props) {
  const router = useRouter();
  const { isLoggedIn, user } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ledger, setLedger] = useState<VoteLedger>(initialLedger);
  const [ledgerReady, setLedgerReady] = useState(false);
  const [selectedWork, setSelectedWork] = useState<RankingWorkItem | null>(
    null,
  );
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [voteMessage, setVoteMessage] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [serverWorks, setServerWorks] = useState<RankingWorkItem[] | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/catalog/works?pageSize=50", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error("catalog")),
      )
      .then(
        (data: {
          items?: Array<{
            id: string;
            type: RankingContentType;
            title: string;
            category: string;
            tagline: string;
            seriesStatus: string;
            updatedAt: string;
            publishedAt: string | null;
            views: number;
            shelfCount: number;
            dailyVotes: number;
            monthlyVotes: number;
            reviewCount: number;
            creator: {
              id: string;
              name: string;
              writerApplication: { penName: string } | null;
            };
            _count: { episodes: number };
          }>;
        }) => {
          setServerWorks(
            (data.items ?? []).map((item, index) => ({
              id: item.id,
              detailId: item.id,
              publishedAt: item.publishedAt,
              type: item.type,
              title: item.title,
              creatorId: item.creator.id,
              author:
                item.creator.writerApplication?.penName || item.creator.name,
              genre: (RANKING_GENRES.some(
                (genre) => genre.key === item.category,
              )
                ? item.category
                : "other") as RankingGenreKey,
              genreLabel:
                RANKING_GENRES.find((genre) => genre.key === item.category)
                  ?.label || item.category,
              synopsis: item.tagline,
              status:
                item.seriesStatus === "completed" ? "completed" : "ongoing",
              origin: "ไทย",
              latestEpisode: `${item._count.episodes} ตอน`,
              updatedAt: item.updatedAt,
              launchedAt: item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString("th-TH", {
                    dateStyle: "medium",
                  })
                : "—",
              recommendedVotes: item.dailyVotes,
              monthlyVotes: item.monthlyVotes,
              views: item.views,
              change: 0,
              shelfCount: item.shelfCount,
              favoriteCount: item.shelfCount,
              reviewCount: item.reviewCount,
              rating: 0,
              coverFrom: ["#7255a7", "#9a5f73", "#477c78"][index % 3],
              coverTo: ["#241b3a", "#39212b", "#193934"][index % 3],
            })),
          );
        },
      )
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (serverWorks === null) return;
    const firstWork = serverWorks[0];
    if (!user || !firstWork) {
      const timer = window.setTimeout(
        () =>
          setLedger({
            ...initialLedger(),
            server: true,
            dailyAllowance: DAILY_MAX,
            dailyBalance: 0,
            monthlyBalance: 0,
          }),
        0,
      );
      return () => window.clearTimeout(timer);
    }
    const controller = new AbortController();
    void fetch(
      `/api/interactions/state?workId=${encodeURIComponent(firstWork.detailId)}`,
      { cache: "no-store", signal: controller.signal },
    )
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as {
          tickets?: {
            daily: { allowance: number; used: number; balance: number };
            monthly: { balance: number };
          };
        };
        if (!response.ok || !data.tickets) throw new Error("ticket state");
        setLedger((current) => ({
          ...current,
          server: true,
          dailyAllowance: data.tickets!.daily.allowance,
          dailyUsed: data.tickets!.daily.used,
          dailyBalance: data.tickets!.daily.balance,
          monthlyBalance: data.tickets!.monthly.balance,
        }));
      })
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError")
          setVoteMessage("ไม่สามารถโหลดยอดตั๋วล่าสุดได้");
      });
    return () => controller.abort();
  }, [serverWorks, user]);

  useEffect(() => {
    let next = initialLedger();
    try {
      const stored = JSON.parse(
        localStorage.getItem(VOTE_STORAGE_KEY) ?? "null",
      ) as VoteLedger | null;
      if (stored) {
        const resetDaily = stored.dailyKey !== todayKey();
        const resetMonthly = stored.monthlyKey !== monthKey();
        const bonuses = Object.fromEntries(
          Object.entries(stored.bonuses ?? {}).map(([id, bonus]) => [
            id,
            {
              daily: resetDaily ? 0 : bonus.daily,
              monthly: resetMonthly ? 0 : bonus.monthly,
            },
          ]),
        );
        next = {
          dailyKey: todayKey(),
          monthlyKey: monthKey(),
          dailyUsed: resetDaily ? 0 : stored.dailyUsed,
          monthlyUsed: resetMonthly ? 0 : stored.monthlyUsed,
          bonuses,
        };
      }
    } catch {}
    startTransition(() => {
      setLedger(next);
      setLedgerReady(true);
    });

    if (user)
      void fetch("/api/member/activity", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : { shelves: [] }))
        .then((data: { shelves?: Array<{ work: { id: string } }> }) =>
          setSavedIds(
            new Set((data.shelves ?? []).map((item) => item.work.id)),
          ),
        );
  }, [user]);

  useEffect(() => {
    if (!ledgerReady || serverWorks !== null) return;
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(ledger));
  }, [ledger, ledgerReady, serverWorks]);

  const openVote = (item: RankingWorkItem) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setSelectedWork(item);
    setVoteMessage("");
    setVoteDialogOpen(true);
  };

  const confirmVote = async (kind: VoteKind) => {
    if (!selectedWork) return;
    if (remainingTickets(ledger, kind) <= 0) {
      setVoteMessage("ตั๋วประเภทนี้ถูกใช้ครบแล้ว");
      return;
    }
    if (serverWorks?.some((work) => work.detailId === selectedWork.detailId)) {
      const response = await fetch("/api/interactions/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workId: selectedWork.detailId,
          kind,
          amount: 1,
          requestId: crypto.randomUUID(),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        tickets?: {
          daily: { allowance: number; used: number; balance: number };
          monthly: { balance: number };
        };
        totals?: { daily: number; monthly: number };
        error?: string;
      };
      if (!response.ok || !data.tickets || !data.totals) {
        setVoteMessage(data.error || "โหวตไม่สำเร็จ");
        return;
      }
      setLedger((current) => ({
        ...current,
        server: true,
        dailyAllowance: data.tickets!.daily.allowance,
        dailyUsed: data.tickets!.daily.used,
        dailyBalance: data.tickets!.daily.balance,
        monthlyBalance: data.tickets!.monthly.balance,
        bonuses: {
          ...current.bonuses,
          [selectedWork.detailId]: {
            daily: Math.max(
              0,
              data.totals!.daily - selectedWork.recommendedVotes,
            ),
            monthly: Math.max(
              0,
              data.totals!.monthly - selectedWork.monthlyVotes,
            ),
          },
        },
      }));
      setVoteMessage("บันทึกคะแนนโหวตเรียบร้อยแล้ว");
      return;
    }
    setLedger((current) => {
      const currentBonus = current.bonuses[selectedWork.detailId] ?? {
        daily: 0,
        monthly: 0,
      };
      return {
        ...current,
        dailyUsed: current.dailyUsed + (kind === "daily" ? 1 : 0),
        monthlyUsed: current.monthlyUsed + (kind === "monthly" ? 1 : 0),
        bonuses: {
          ...current.bonuses,
          [selectedWork.detailId]: {
            ...currentBonus,
            [kind]: currentBonus[kind] + 1,
          },
        },
      };
    });
    setVoteMessage("บันทึกคะแนนโหวตเรียบร้อยแล้ว");
  };

  const toggleShelf = (id: string) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (serverWorks?.some((work) => work.detailId === id)) {
      void fetch("/api/interactions/shelf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workId: id }),
      }).then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as {
          active?: boolean;
        };
        if (response.ok)
          setSavedIds((current) => {
            const next = new Set(current);
            if (data.active) next.add(id);
            else next.delete(id);
            return next;
          });
      });
      return;
    }
    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (user)
        localStorage.setItem(
          shelfStorageKey(user.id),
          JSON.stringify([...next]),
        );
      return next;
    });
  };

  const displayWorks = serverWorks ?? works;

  return (
    <div className={styles.page} data-ranking-page>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sideTitle}>อันดับความนิยม</h2>
          <SideMenu state={state} />
        </aside>

        <div className={styles.content}>
          <div className={styles.mobileNav}>
            <button
              type="button"
              className={styles.mobileNavButton}
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
            >
              <span className="flex items-center">
                <Menu size={18} />
                <span className="ml-2">{currentLabel(state)}</span>
              </span>
              <ChevronRight size={18} />
            </button>
          </div>

          <RankingHero />
          {state.view === "overview" && !state.type ? (
            <>
              <StatsStrip works={displayWorks} />
              <OverviewTable
                state={state}
                works={displayWorks}
                creators={creators}
                ledger={ledger}
              />
            </>
          ) : (
            <ListView
              state={state}
              works={displayWorks}
              creators={creators}
              ledger={ledger}
              onVote={openVote}
              savedIds={savedIds}
              onToggleShelf={toggleShelf}
            />
          )}
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[min(88vw,360px)] gap-0 bg-white p-0"
        >
          <SheetHeader className="border-b px-5 py-5">
            <SheetTitle className="text-lg font-bold">
              อันดับความนิยม
            </SheetTitle>
            <SheetDescription>เลือกหมวดและประเภทอันดับ</SheetDescription>
          </SheetHeader>
          <div className={styles.sheetBody}>
            <SideMenu state={state} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <VoteDialog
        item={selectedWork}
        open={voteDialogOpen}
        onOpenChange={setVoteDialogOpen}
        ledger={ledger}
        onConfirm={confirmVote}
        message={voteMessage}
      />
    </div>
  );
}
