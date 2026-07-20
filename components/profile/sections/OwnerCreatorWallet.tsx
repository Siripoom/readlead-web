'use client'

import Image from 'next/image'
import { useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Gift,
  Info,
  LockKeyhole,
  Plus,
  RefreshCw,
} from 'lucide-react'
import CreatorDashboard from '@/components/creator/CreatorDashboard'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useWallet, type WalletTopUpMethod } from '@/contexts/WalletContext'
import type { Role, WalletTransaction } from '@/lib/types'
import styles from '../profile.module.css'

export function OwnerCreator({ role }: { role: Role; userId: string }) {
  if (role !== 'creator' && role !== 'admin') {
    return (
      <section className={`${styles.card} ${styles.creatorLocked}`}>
        <LockKeyhole />
        <h1 className={styles.sectionTitle}>แดชบอร์ดสำหรับนักเขียน</h1>
        <p className={styles.sectionDesc}>บัญชีนี้ยังไม่มีสิทธิ์นักเขียน กรุณาส่งแบบฟอร์มในเมนู “สมัครนักเขียน” ก่อน</p>
      </section>
    )
  }

  return <CreatorDashboard />
}

const PAYMENT_METHODS: Array<{
  id: WalletTopUpMethod
  label: string
  description: string
  logos: Array<{
    src: string
    width: number
    height: number
  }>
}> = [
  {
    id: 'promptpay',
    label: 'พร้อมเพย์',
    description: 'สแกน QR จ่ายทันที',
    logos: [{ src: '/profile/payment-methods/promptpay.png', width: 711, height: 400 }],
  },
  {
    id: 'credit-card',
    label: 'บัตรเครดิต/เดบิต',
    description: 'Visa, Mastercard',
    logos: [
      { src: '/profile/payment-methods/visa.svg', width: 24, height: 24 },
      { src: '/profile/payment-methods/mastercard.svg', width: 1000, height: 618 },
    ],
  },
  {
    id: 'truemoney',
    label: 'ทรูมันนี่ วอลเล็ท',
    description: 'TrueMoney Wallet',
    logos: [{ src: '/profile/payment-methods/truemoney-wallet.jpg', width: 300, height: 300 }],
  },
  {
    id: 'counter-service',
    label: 'เคาน์เตอร์เซอร์วิส',
    description: 'ชำระที่ 7-Eleven',
    logos: [{ src: '/profile/payment-methods/counter-service.png', width: 156, height: 122 }],
  },
]

type HistoryFilter = 'all' | 'success' | 'failed' | 'pending'
type TopUpResult = 'success' | 'error' | null

const HISTORY_FILTERS: Array<{ id: HistoryFilter; label: string }> = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'success', label: 'สำเร็จ' },
  { id: 'failed', label: 'ไม่สำเร็จ' },
  { id: 'pending', label: 'รอดำเนินการ' },
]

function paymentMethod(method: WalletTransaction['paymentMethod']) {
  return PAYMENT_METHODS.find((item) => item.id === method)
}

function PaymentMethodLogo({
  method,
  compact = false,
}: {
  method: (typeof PAYMENT_METHODS)[number]
  compact?: boolean
}) {
  return (
    <span
      className={`${styles.paymentLogo} ${method.logos.length > 1 ? styles.paymentLogoMultiple : ''} ${compact ? styles.paymentLogoCompact : ''}`}
      aria-hidden="true"
    >
      {method.logos.map((logo) => (
        <Image
          key={logo.src}
          src={logo.src}
          width={logo.width}
          height={logo.height}
          alt=""
        />
      ))}
    </span>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value))
}

export function OwnerWallet() {
  const { balance, topUpEnabled, packages, transactions, loading, error, topUp, refresh } = useWallet()
  const topUpSection = useRef<HTMLElement>(null)
  const [selectedPackageId, setSelectedPackageId] = useState('300')
  const [selectedMethod, setSelectedMethod] = useState<WalletTopUpMethod>('promptpay')
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<TopUpResult>(null)

  const selectedPackage = packages.find((item) => item.id === selectedPackageId) ?? packages[0]
  const selectedPayment = PAYMENT_METHODS.find((item) => item.id === selectedMethod) ?? PAYMENT_METHODS[0]
  const visibleTransactions = useMemo(
    () => historyFilter === 'all' ? transactions : transactions.filter((item) => item.status === historyFilter),
    [historyFilter, transactions],
  )

  function openConfirmation() {
    setResult(null)
    setConfirmOpen(true)
  }

  function handleDialogChange(open: boolean) {
    if (busy) return
    setConfirmOpen(open)
    if (!open) setResult(null)
  }

  async function confirmTopUp() {
    if (!selectedPackage || busy || !topUpEnabled) return
    setBusy(true)
    setResult(null)
    const succeeded = await topUp(selectedPackage.id, selectedMethod)
    setBusy(false)
    setResult(succeeded ? 'success' : 'error')
  }

  const totalCoins = selectedPackage ? selectedPackage.coins + selectedPackage.bonus : 0

  return (
    <div className={styles.walletPage}>
      <header className={styles.walletPageHeader}>
        <h1>กระเป๋าเงิน</h1>
        <p>เติมเหรียญ จัดการช่องทางชำระเงิน และดูประวัติการทำรายการ</p>
      </header>

      <section className={styles.walletHero}>
        <span className={styles.walletHeroDeco} aria-hidden="true" />
        <Image className={styles.walletHeroCoin} src="/profile/readify-coin.png" width={66} height={66} alt="เหรียญ ReadLead" priority />
        <div className={styles.walletBalance}>
          <p>ยอดเหรียญในบัญชี</p>
          <div>{loading ? '—' : balance.toLocaleString('th-TH')} <small>เหรียญ</small></div>
        </div>
        <button type="button" className={styles.walletHeroButton} onClick={() => topUpSection.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
          <Plus /> เติมเหรียญ
        </button>
      </section>

      {error && (
        <div className={styles.walletLoadError} role="alert">
          <AlertCircle /> ไม่สามารถโหลดข้อมูลกระเป๋าเงินได้
          <button type="button" onClick={() => void refresh()}><RefreshCw /> ลองอีกครั้ง</button>
        </div>
      )}

      <div className={styles.walletGrid}>
        <div className={styles.walletColumn}>
          <section ref={topUpSection} className={`${styles.card} ${styles.walletSection}`}>
            <h2 className={styles.walletSectionTitle}><CreditCard /> ช่องทางการเติมเหรียญ</h2>
            <p className={styles.walletSectionDescription}>เลือกวิธีชำระเงินที่สะดวกสำหรับคุณ</p>
            <div className={styles.paymentGrid}>
              {PAYMENT_METHODS.map((method) => {
                const active = selectedMethod === method.id
                return (
                  <button
                    type="button"
                    key={method.id}
                    className={`${styles.paymentMethod} ${active ? styles.paymentMethodActive : ''}`}
                    onClick={() => setSelectedMethod(method.id)}
                    aria-pressed={active}
                  >
                    <PaymentMethodLogo method={method} />
                    <span className={styles.paymentText}><b>{method.label}</b><small>{method.description}</small></span>
                    <span className={styles.paymentRadio} aria-hidden="true" />
                  </button>
                )
              })}
            </div>
          </section>

          <section className={`${styles.card} ${styles.walletSection}`}>
            <h2 className={styles.walletSectionTitle}><CircleDollarSign /> เลือกแพ็กเกจเหรียญ</h2>
            <p className={styles.walletSectionDescription}>ยิ่งเติมเยอะ ยิ่งได้โบนัสเยอะ</p>
            <div className={styles.packageGrid}>
              {loading && packages.length === 0 && Array.from({ length: 6 }, (_, index) => <span key={index} className={styles.walletPackageSkeleton} />)}
              {packages.map((walletPackage) => {
                const active = selectedPackage?.id === walletPackage.id
                return (
                  <button
                    type="button"
                    key={walletPackage.id}
                    className={`${styles.walletPackage} ${active ? styles.walletPackageActive : ''}`}
                    onClick={() => setSelectedPackageId(walletPackage.id)}
                    aria-pressed={active}
                  >
                    {walletPackage.popular && <span className={styles.packagePopular}>ยอดนิยม</span>}
                    <span className={styles.packageCoins}><Image src="/profile/readify-coin.png" width={16} height={16} alt="" />{walletPackage.coins.toLocaleString('th-TH')}</span>
                    <span className={styles.packageBonus}>{walletPackage.bonus ? `+${walletPackage.bonus.toLocaleString('th-TH')} โบนัส` : '\u00a0'}</span>
                    <span className={styles.packagePrice}>฿{walletPackage.price.toLocaleString('th-TH')}</span>
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              className={styles.walletTopUpButton}
              onClick={openConfirmation}
              disabled={!selectedPackage || loading || !topUpEnabled}
            >
              <Plus /> เติม {totalCoins.toLocaleString('th-TH')} เหรียญ · ฿{selectedPackage?.price.toLocaleString('th-TH') ?? '—'}
            </button>
            {!loading && !topUpEnabled && <p className={styles.walletDisabledNote}>ระบบเติมเหรียญจำลองยังไม่เปิดใช้งานใน environment นี้</p>}
          </section>
        </div>

        <div className={styles.walletColumn}>
          <section className={`${styles.card} ${styles.walletSection}`}>
            <h2 className={styles.walletSectionTitle}><CreditCard /> บัตรเครดิตที่เชื่อมต่อ</h2>
            <p className={styles.walletSectionDescription}>บัตรที่บันทึกไว้สำหรับการเติมเหรียญ</p>
            <div className={styles.walletEmptyFeature}>
              <CreditCard />
              <div><b>ยังไม่มีบัตรที่เชื่อมต่อ</b><span>ระบบบันทึกบัตรจะเปิดใช้งานเมื่อเชื่อมต่อผู้ให้บริการชำระเงิน</span></div>
            </div>
            <button type="button" className={styles.addCardButton} disabled><Plus /> เพิ่มบัตรใหม่ · ยังไม่เปิดใช้งาน</button>
          </section>

          <section className={`${styles.card} ${styles.walletSection}`}>
            <h2 className={styles.walletSectionTitle}><Gift /> รหัสโปรโมชั่น</h2>
            <p className={styles.walletSectionDescription}>กรอกโค้ดเพื่อรับเหรียญหรือส่วนลดพิเศษ</p>
            <div className={styles.promoForm}>
              <input type="text" placeholder="กรอกรหัสโปรโมชั่น เช่น READ100" disabled aria-label="รหัสโปรโมชั่น" />
              <button type="button" disabled>ใช้โค้ด</button>
            </div>
            <div className={styles.promoNote}><Info /> ระบบใช้รหัสโปรโมชั่นยังไม่เปิดใช้งาน</div>
          </section>
        </div>
      </div>

      <section className={`${styles.card} ${styles.walletSection} ${styles.walletHistory}`}>
        <h2 className={styles.walletSectionTitle}><Clock3 /> ประวัติการเติมเหรียญ</h2>
        <p className={styles.walletSectionDescription}>รายการเติมเหรียญทั้งหมดของคุณ</p>
        <div className={styles.historyTabs} role="tablist" aria-label="กรองประวัติการเติมเหรียญ">
          {HISTORY_FILTERS.map((filter) => (
            <button
              type="button"
              role="tab"
              key={filter.id}
              aria-selected={historyFilter === filter.id}
              className={historyFilter === filter.id ? styles.historyTabActive : ''}
              onClick={() => setHistoryFilter(filter.id)}
            >{filter.label}</button>
          ))}
        </div>
        {loading && transactions.length === 0 ? (
          <div className={styles.walletHistoryEmpty}>กำลังโหลดประวัติการเติมเหรียญ…</div>
        ) : visibleTransactions.length === 0 ? (
          <div className={styles.walletHistoryEmpty}>ยังไม่มีรายการในสถานะนี้</div>
        ) : (
          <div className={styles.walletTableWrap}>
            <table className={styles.walletTable}>
              <thead><tr><th>วันที่ / เวลา</th><th>ช่องทาง</th><th>จำนวนเหรียญ</th><th>ยอดเงิน</th><th>สถานะ</th></tr></thead>
              <tbody>
                {visibleTransactions.map((transaction) => {
                  const method = paymentMethod(transaction.paymentMethod)
                  return (
                    <tr key={transaction.id}>
                      <td data-label="วันที่ / เวลา">{formatDate(transaction.createdAt)}</td>
                      <td data-label="ช่องทาง">
                        {method ? <span className={styles.historyMethod}><PaymentMethodLogo method={method} compact />{method.label}</span> : 'ไม่ระบุ'}
                      </td>
                      <td data-label="จำนวนเหรียญ" className={styles.historyCoins}>
                        +{transaction.coins.toLocaleString('th-TH')} เหรียญ
                        {transaction.bonusCoins > 0 && <small>รวมโบนัส {transaction.bonusCoins.toLocaleString('th-TH')}</small>}
                      </td>
                      <td data-label="ยอดเงิน" className={styles.historyBaht}>{transaction.paidAmountBaht === null ? 'ไม่ระบุ' : `฿${transaction.paidAmountBaht.toLocaleString('th-TH')}`}</td>
                      <td data-label="สถานะ"><span className={`${styles.historyStatus} ${styles.historyStatusSuccess}`}>สำเร็จ</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Dialog open={confirmOpen} onOpenChange={handleDialogChange}>
        <DialogContent
          className={styles.walletDialog}
          overlayClassName={styles.walletDialogOverlay}
          showCloseButton={!busy}
          aria-busy={busy}
        >
          {result === 'success' ? (
            <div className={styles.walletResult}>
              <span className={styles.walletResultSuccess}><CheckCircle2 /></span>
              <DialogTitle>เติมเหรียญสำเร็จ</DialogTitle>
              <DialogDescription>เพิ่ม {totalCoins.toLocaleString('th-TH')} เหรียญเข้าสู่กระเป๋าของคุณแล้ว</DialogDescription>
              <button type="button" onClick={() => handleDialogChange(false)}>เรียบร้อย</button>
            </div>
          ) : (
            <>
              <div className={styles.walletDialogHeader}>
                <DialogTitle>ยืนยันการเติมเหรียญ</DialogTitle>
                <DialogDescription>ตรวจสอบรายละเอียดก่อนยืนยันรายการ</DialogDescription>
              </div>
              <div className={styles.walletDialogBody}>
                <div className={styles.walletDialogPackage}>
                  <Image src="/profile/readify-coin.png" width={48} height={48} alt="เหรียญ ReadLead" />
                  <div><span>แพ็กเกจที่เลือก</span><b>{totalCoins.toLocaleString('th-TH')} เหรียญ</b></div>
                  <strong>฿{selectedPackage?.price.toLocaleString('th-TH') ?? '—'}</strong>
                </div>
                <dl className={styles.walletSummary}>
                  <div><dt>เหรียญหลัก</dt><dd>{selectedPackage?.coins.toLocaleString('th-TH') ?? '—'} เหรียญ</dd></div>
                  <div><dt>โบนัส</dt><dd className={styles.walletSummaryBonus}>+{selectedPackage?.bonus.toLocaleString('th-TH') ?? '0'} เหรียญ</dd></div>
                  <div>
                    <dt>ช่องทางชำระเงิน</dt>
                    <dd className={styles.walletSummaryMethod}>
                      <PaymentMethodLogo method={selectedPayment} compact />
                      <span>{selectedPayment.label}</span>
                    </dd>
                  </div>
                  <div className={styles.walletSummaryTotal}><dt>ยอดชำระทั้งหมด</dt><dd>฿{selectedPackage?.price.toLocaleString('th-TH') ?? '—'}</dd></div>
                </dl>
                <p className={styles.walletDialogNotice}><Info /> รายการนี้ใช้ระบบเติมเหรียญจำลองและจะบันทึกลงประวัติจริงของบัญชี</p>
                {result === 'error' && <p className={styles.walletDialogError} role="alert"><AlertCircle /> ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</p>}
              </div>
              <div className={styles.walletDialogActions}>
                <button type="button" className={styles.walletCancelButton} onClick={() => handleDialogChange(false)} disabled={busy}>ยกเลิก</button>
                <button type="button" className={styles.walletConfirmButton} onClick={() => void confirmTopUp()} disabled={busy || !topUpEnabled || !selectedPackage}>
                  {busy ? <><RefreshCw className={styles.walletSpinner} /> กำลังทำรายการ…</> : `ยืนยันชำระ ฿${selectedPackage?.price.toLocaleString('th-TH') ?? '—'}`}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
