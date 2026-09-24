'use client'

import Script from 'next/script'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, ExternalLink, Info, QrCode, RefreshCw } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useWallet, type WalletTopUpMethod } from '@/contexts/WalletContext'
import type { GatewayChannel, WalletPackage } from '@/lib/types'
import styles from '../../profile.module.css'

interface GooglePayPaymentMethod {
  type: 'CARD'
  parameters: { allowedAuthMethods: string[]; allowedCardNetworks: string[] }
  tokenizationSpecification: { type: 'PAYMENT_GATEWAY'; parameters: { gateway: string; gatewayMerchantId: string } }
}

interface GooglePaymentsClient {
  isReadyToPay: (request: { apiVersion: 2; apiVersionMinor: 0; allowedPaymentMethods: GooglePayPaymentMethod[] }) => Promise<{ result: boolean }>
  loadPaymentData: (request: {
    apiVersion: 2
    apiVersionMinor: 0
    allowedPaymentMethods: GooglePayPaymentMethod[]
    merchantInfo: { merchantName: string; merchantId?: string }
    transactionInfo: { totalPriceStatus: 'FINAL'; totalPrice: string; currencyCode: string; countryCode: string }
  }) => Promise<{ paymentMethodData: { tokenizationData: { token: string } } }>
  createButton: (options: { onClick: () => void; buttonColor?: string; buttonType?: string; buttonSizeMode?: string }) => HTMLElement
}

// Apple Pay's JS API is built into Safari (no script to load, unlike Google
// Pay). paymentData is the encrypted blob Omise wants JSON-stringified.
interface ApplePayPaymentToken {
  paymentData: unknown
  paymentMethod: { network: string; type?: string; displayName?: string }
  transactionIdentifier?: string
}

interface ApplePaySessionInstance {
  onvalidatemerchant: (event: { validationURL: string }) => void
  onpaymentauthorized: (event: { payment: { token: ApplePayPaymentToken } }) => void
  oncancel: (event: unknown) => void
  begin: () => void
  abort: () => void
  completeMerchantValidation: (merchantSession: unknown) => void
  completePayment: (status: number) => void
}

interface ApplePaySessionConstructor {
  new (version: number, request: {
    countryCode: string
    currencyCode: string
    supportedNetworks: string[]
    merchantCapabilities: string[]
    total: { label: string; amount: string }
  }): ApplePaySessionInstance
  canMakePayments: () => boolean
  STATUS_SUCCESS: number
  STATUS_FAILURE: number
}

declare global {
  interface Window {
    ApplePaySession?: ApplePaySessionConstructor
    Omise?: {
      setPublicKey: (key: string) => void
      createToken: (
        type: 'card' | 'tokenization',
        data: Record<string, string | number>,
        callback: (statusCode: number, response: { id?: string; object: string; message?: string }) => void,
      ) => void
    }
    google?: {
      payments: { api: { PaymentsClient: new (options: { environment: 'TEST' | 'PRODUCTION' }) => GooglePaymentsClient } }
    }
  }
}

const POLL_INTERVAL_MS = 3000
const MAX_POLL_ATTEMPTS = 60 // ~3 minutes

type Stage = 'input' | 'busy' | 'qr' | 'redirect' | 'success' | 'error'

interface GatewayChargeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  walletPackage: WalletPackage | undefined
  channel: GatewayChannel
}

export function GatewayChargeDialog({ open, onOpenChange, walletPackage, channel }: GatewayChargeDialogProps) {
  const { initiateGatewayCharge, pollGatewayCharge, paymentConfig } = useWallet()
  const [omiseReady, setOmiseReady] = useState(false)
  const [stage, setStage] = useState<Stage>('input')
  const [errorMessage, setErrorMessage] = useState('')
  const [reference, setReference] = useState('')
  const [qrImageUri, setQrImageUri] = useState('')
  const [authorizeUri, setAuthorizeUri] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expMonth, setExpMonth] = useState('')
  const [expYear, setExpYear] = useState('')
  const [cvv, setCvv] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [googlePayReady, setGooglePayReady] = useState<'checking' | 'ready' | 'unavailable'>('checking')
  const [applePayReady, setApplePayReady] = useState<'checking' | 'ready' | 'unavailable'>('checking')
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollAttempts = useRef(0)
  const googlePayClientRef = useRef<GooglePaymentsClient | null>(null)
  // The container is tracked as *both* a ref and state on purpose: the ref
  // gives callbacks (script onLoad) the latest node without re-closing over
  // it, while the state change is what re-triggers the setup effect. It
  // can't be a plain ref — base-ui portals the dialog through FloatingPortal,
  // which only renders children once its own portalNode state is set, so the
  // node attaches a render *after* `open` flips and no `open`-keyed effect
  // would see it.
  const googlePayContainerRef = useRef<HTMLDivElement | null>(null)
  const [googlePayContainer, setGooglePayContainer] = useState<HTMLDivElement | null>(null)
  const attachGooglePayContainer = useCallback((node: HTMLDivElement | null) => {
    googlePayContainerRef.current = node
    setGooglePayContainer(node)
  }, [])

  // Apple Pay is deliberately NOT in needsToken: that branch renders the
  // typed card-number form, which Apple Pay never uses — it goes through
  // ApplePaySession and Apple's own sheet instead.
  const needsToken = channel.instrument === 'card'
  const needsPhone = channel.instrument === 'truemoney'
  const needsGooglePay = channel.instrument === 'google-pay'
  const needsApplePay = channel.instrument === 'apple-pay'
  const phoneValid = /^0\d{9}$/.test(mobileNumber)
  // GatewayChannel.id is always one of the gateway-eligible ids by
  // construction (WALLET_CHANNELS never marks slip/IAP ids as kind:
  // 'gateway'); PaymentMethod is the broader historical id space.
  const channelId = channel.id as WalletTopUpMethod
  const totalCoins = walletPackage ? walletPackage.coins + walletPackage.bonus : 0
  const googlePayEnvironment = paymentConfig.omisePublicKey.startsWith('pkey_live_') ? 'PRODUCTION' : 'TEST'
  const googlePayMethod: GooglePayPaymentMethod = {
    type: 'CARD',
    parameters: { allowedAuthMethods: ['PAN_ONLY'], allowedCardNetworks: ['VISA', 'MASTERCARD'] },
    tokenizationSpecification: {
      type: 'PAYMENT_GATEWAY',
      parameters: { gateway: 'omise', gatewayMerchantId: paymentConfig.omisePublicKey },
    },
  }
  const googlePayMerchantInfo = {
    merchantName: 'ReadLead',
    ...(paymentConfig.googlePayMerchantId ? { merchantId: paymentConfig.googlePayMerchantId } : {}),
  }

  function stopPolling() {
    if (pollTimer.current) clearInterval(pollTimer.current)
    pollTimer.current = null
    pollAttempts.current = 0
  }

  function startPolling(id: string) {
    stopPolling()
    pollTimer.current = setInterval(async () => {
      pollAttempts.current += 1
      if (pollAttempts.current > MAX_POLL_ATTEMPTS) {
        stopPolling()
        setErrorMessage('รอการยืนยันนานเกินไป กรุณาลองใหม่')
        setStage('error')
        return
      }
      const result = await pollGatewayCharge(id)
      if (!result.ok) return // transient network error, keep polling
      if (result.charge.status === 'approved') {
        stopPolling()
        setReference(result.charge.reference ?? '')
        setStage('success')
      } else if (result.charge.status === 'failed' || result.charge.status === 'expired') {
        stopPolling()
        setErrorMessage(result.charge.status === 'expired' ? 'QR หมดอายุ กรุณาลองใหม่' : 'การชำระเงินไม่สำเร็จ กรุณาลองใหม่')
        setStage('error')
      }
    }, POLL_INTERVAL_MS)
  }

  useEffect(() => () => stopPolling(), [])

  // Keyed on the container node rather than just `open`: the parent mounts
  // this dialog as soon as a gateway channel is *selected*, and the portal
  // then mounts the content a render later still, so googlePayContainer
  // becoming non-null is the only reliable signal that there's somewhere to
  // put the button. It's a fresh node on each open (and across stage
  // changes), and the button is appended outside React's tree, so this has
  // to re-run rather than being a one-time mount effect.
  useEffect(() => {
    if (open && needsGooglePay && stage === 'input' && googlePayContainer) setupGooglePayButton()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, needsGooglePay, stage, googlePayContainer])

  // Safety net for a genuinely unreachable pay.js (blocked by an ad/privacy
  // extension or the network): isReadyToPay's then/catch never runs, so
  // without this the branch below would sit on an empty box forever. Gated
  // on `open` for the same reason as above — otherwise the countdown runs
  // against a closed dialog and lands on 'unavailable' before the user has
  // even opened it.
  useEffect(() => {
    if (!open || !needsGooglePay || stage !== 'input') return
    const timeout = setTimeout(() => {
      setGooglePayReady((prev) => {
        if (prev !== 'checking') return prev
        console.warn('Google Pay: timed out waiting for the script to load or isReadyToPay to respond — falling back to the unavailable message')
        return 'unavailable'
      })
    }, 6000)
    return () => clearTimeout(timeout)
  }, [open, needsGooglePay, stage])

  // Deliberately in an effect rather than a useState initializer: window
  // doesn't exist during SSR, so deriving this at render time would make the
  // server and client disagree on the first paint.
  useEffect(() => {
    if (needsApplePay) refreshApplePayAvailability()
  }, [needsApplePay])

  function refreshApplePayAvailability() {
    // canMakePayments() is synchronous and built into Safari — there's no
    // external script to wait on, so no timeout fallback is needed here.
    const available = !!window.ApplePaySession?.canMakePayments()
    if (!available) {
      console.info('Apple Pay: ApplePaySession unavailable — not Safari, or no card set up in Wallet on this device')
    }
    setApplePayReady(available ? 'ready' : 'unavailable')
  }

  function startApplePay() {
    const ApplePay = window.ApplePaySession
    if (!walletPackage || !ApplePay) return
    if (!paymentConfig.applePayMerchantId) {
      setErrorMessage('ยังไม่ได้ตั้งค่า Apple Pay กรุณาติดต่อผู้ดูแลระบบ')
      setStage('error')
      return
    }
    setErrorMessage('')
    setStage('busy')

    const session = new ApplePay(3, {
      countryCode: 'TH',
      currencyCode: 'THB',
      supportedNetworks: ['visa', 'masterCard', 'jcb'],
      merchantCapabilities: ['supports3DS'],
      total: { label: 'ReadLead', amount: walletPackage.price.toFixed(2) },
    })

    // Apple requires the merchant (us) to validate the session server-side
    // with our Merchant Identity Certificate — Omise does not do this for us.
    session.onvalidatemerchant = (event) => {
      void (async () => {
        try {
          const response = await fetch('/api/member/wallet/applepay/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ validationURL: event.validationURL }),
          })
          const data = (await response.json().catch(() => ({}))) as { merchantSession?: unknown; error?: string }
          if (!response.ok || !data.merchantSession) throw new Error(data.error || 'MERCHANT_VALIDATION_FAILED')
          session.completeMerchantValidation(data.merchantSession)
        } catch (error) {
          console.warn('Apple Pay: merchant validation failed', error)
          session.abort()
          setErrorMessage('ยืนยันร้านค้ากับ Apple ไม่สำเร็จ กรุณาลองใหม่')
          setStage('error')
        }
      })()
    }

    session.onpaymentauthorized = (event) => {
      const token = event.payment.token
      if (!window.Omise) {
        session.completePayment(ApplePay.STATUS_FAILURE)
        setErrorMessage('ระบบชำระเงินยังโหลดไม่เสร็จ กรุณาลองใหม่')
        setStage('error')
        return
      }
      window.Omise.createToken(
        'tokenization',
        {
          method: 'applepay',
          // Omise's documented shape is the stringified paymentData object
          // (their example starts with {"data":"..."}), not the outer token.
          data: JSON.stringify(token.paymentData),
          merchant_id: paymentConfig.applePayMerchantId,
          brand: token.paymentMethod.network,
        },
        (_statusCode, response) => {
          if (response.object === 'error' || !response.id) {
            // Tell Apple first so its sheet stops spinning before we swap
            // the dialog over to the error screen.
            session.completePayment(ApplePay.STATUS_FAILURE)
            setErrorMessage(response.message || 'ทำรายการผ่าน Apple Pay ไม่สำเร็จ กรุณาลองใหม่')
            setStage('error')
            return
          }
          session.completePayment(ApplePay.STATUS_SUCCESS)
          void initiateGatewayCharge(walletPackage.id, channelId, response.id).then(applyChargeResult)
        },
      )
    }

    // User dismissed Apple's sheet — return to the form rather than showing
    // an error screen for something they chose to do.
    session.oncancel = () => setStage('input')

    session.begin()
  }

  // next/script fires onLoad at most once per page load, so a remount (user
  // switches channel away and back) leaves googlePayClientRef null with no
  // second onLoad coming. Rebuild the client from an already-loaded
  // window.google instead of depending on that callback.
  function ensureGooglePayClient() {
    if (googlePayClientRef.current) return googlePayClientRef.current
    if (!window.google) return null
    googlePayClientRef.current = new window.google.payments.api.PaymentsClient({ environment: googlePayEnvironment })
    return googlePayClientRef.current
  }

  function setupGooglePayButton() {
    // Reset before the early return so a stale 'unavailable' from an earlier
    // attempt can't survive into this one; if the script isn't ready yet,
    // onLoad or the timeout above resolves 'checking' from here.
    setGooglePayReady('checking')
    const client = ensureGooglePayClient()
    const container = googlePayContainerRef.current
    if (!client || !container) return
    client
      .isReadyToPay({ apiVersion: 2, apiVersionMinor: 0, allowedPaymentMethods: [googlePayMethod] })
      .then((response) => {
        if (!response.result) {
          console.info('Google Pay: isReadyToPay returned false — no eligible payment method on this device/browser')
          setGooglePayReady('unavailable')
          return
        }
        container.replaceChildren()
        container.appendChild(
          client.createButton({ onClick: () => void handleGooglePayClick(), buttonColor: 'black', buttonType: 'buy', buttonSizeMode: 'fill' }),
        )
        setGooglePayReady('ready')
      })
      .catch((error) => {
        console.warn('Google Pay: isReadyToPay failed', error)
        setGooglePayReady('unavailable')
      })
  }

  async function handleGooglePayClick() {
    if (!walletPackage || !googlePayClientRef.current || !window.Omise) return
    setStage('busy')
    setErrorMessage('')
    try {
      const paymentData = await googlePayClientRef.current.loadPaymentData({
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [googlePayMethod],
        merchantInfo: googlePayMerchantInfo,
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: walletPackage.price.toFixed(2),
          currencyCode: 'THB',
          countryCode: 'TH',
        },
      })
      const token = paymentData.paymentMethodData.tokenizationData.token
      window.Omise.createToken('tokenization', { method: 'googlepay', data: token }, (_statusCode, response) => {
        if (response.object === 'error' || !response.id) {
          setErrorMessage(response.message || 'ทำรายการผ่าน Google Pay ไม่สำเร็จ กรุณาลองใหม่')
          setStage('input')
          return
        }
        void initiateGatewayCharge(walletPackage.id, channelId, response.id).then(applyChargeResult)
      })
    } catch (error) {
      // Google's own sheet reports user-initiated dismissal via
      // statusCode 'CANCELED' — return quietly to the form instead of
      // showing an "error" screen for something the user chose to do.
      if ((error as { statusCode?: string } | null)?.statusCode === 'CANCELED') {
        setStage('input')
        return
      }
      setErrorMessage('ทำรายการผ่าน Google Pay ไม่สำเร็จ กรุณาลองใหม่')
      setStage('error')
    }
  }

  function resetForm() {
    stopPolling()
    setStage('input')
    setErrorMessage('')
    setReference('')
    setQrImageUri('')
    setAuthorizeUri('')
    setCardName('')
    setCardNumber('')
    setExpMonth('')
    setExpYear('')
    setCvv('')
    setMobileNumber('')
    setGooglePayReady('checking')
    if (needsApplePay) refreshApplePayAvailability()
  }

  function handleDialogChange(nextOpen: boolean) {
    if (stage === 'busy') return
    onOpenChange(nextOpen)
    if (!nextOpen) resetForm()
  }

  async function applyChargeResult(result: Awaited<ReturnType<typeof initiateGatewayCharge>>) {
    if (!result.ok) {
      setErrorMessage(result.error)
      setStage('error')
      return
    }
    const { charge } = result
    if (charge.flow === 'completed') {
      if (charge.status === 'approved') {
        setReference(charge.reference ?? '')
        setStage('success')
      } else {
        setErrorMessage('การชำระเงินไม่สำเร็จ กรุณาลองใหม่')
        setStage('error')
      }
      return
    }
    if (charge.flow === 'qr' && charge.qrImageUri) {
      setQrImageUri(charge.qrImageUri)
      setStage('qr')
      startPolling(charge.chargeId)
    } else if (charge.flow === 'redirect' && charge.authorizeUri) {
      setAuthorizeUri(charge.authorizeUri)
      window.open(charge.authorizeUri, '_blank', 'noopener,noreferrer')
      setStage('redirect')
      startPolling(charge.chargeId)
    } else {
      setErrorMessage('ทำรายการชำระเงินไม่สำเร็จ กรุณาลองใหม่')
      setStage('error')
    }
  }

  async function submitCard() {
    if (!walletPackage) return
    if (!window.Omise) {
      setErrorMessage('ระบบชำระเงินยังโหลดไม่เสร็จ กรุณาลองใหม่')
      setStage('error')
      return
    }
    setStage('busy')
    setErrorMessage('')
    window.Omise.createToken(
      'card',
      {
        name: cardName,
        number: cardNumber.replace(/\s+/g, ''),
        expiration_month: expMonth,
        expiration_year: expYear,
        security_code: cvv,
      },
      (_statusCode, response) => {
        if (response.object === 'error' || !response.id) {
          setErrorMessage(response.message || 'ข้อมูลบัตรไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง')
          setStage('input')
          return
        }
        void initiateGatewayCharge(walletPackage.id, channelId, response.id).then(applyChargeResult)
      },
    )
  }

  async function submitDirect() {
    if (!walletPackage) return
    if (needsPhone && !phoneValid) {
      setErrorMessage('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง')
      return
    }
    setStage('busy')
    setErrorMessage('')
    const result = await initiateGatewayCharge(walletPackage.id, channelId, undefined, needsPhone ? mobileNumber : undefined)
    await applyChargeResult(result)
  }

  return (
    <>
      <Script src="https://cdn.omise.co/omise.js" strategy="afterInteractive" onLoad={() => {
        if (window.Omise && paymentConfig.omisePublicKey) {
          window.Omise.setPublicKey(paymentConfig.omisePublicKey)
          setOmiseReady(true)
        }
      }} />
      {needsGooglePay && (
        <Script
          src="https://pay.google.com/gp/p/js/pay.js"
          strategy="afterInteractive"
          onLoad={() => {
            if (!ensureGooglePayClient()) {
              console.warn('Google Pay: script tag reported loaded but window.google is missing — the 6s timeout fallback will show the unavailable message')
              return
            }
            // No-ops when the dialog is still closed (no container yet); the
            // open-gated effect above runs setup again once it mounts.
            setupGooglePayButton()
          }}
          onError={() => console.warn('Google Pay: failed to load https://pay.google.com/gp/p/js/pay.js (blocked by network/extension?) — the 6s timeout fallback will show the unavailable message')}
        />
      )}
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent
          className={styles.walletDialog}
          overlayClassName={styles.walletDialogOverlay}
          showCloseButton={stage !== 'busy'}
          aria-busy={stage === 'busy'}
        >
          {stage === 'success' ? (
            <div className={styles.walletResult}>
              <span className={styles.walletResultSuccess}><CheckCircle2 /></span>
              <DialogTitle>ชำระเงินสำเร็จ</DialogTitle>
              <DialogDescription>รายการ {reference} เติม {totalCoins.toLocaleString('th-TH')} เหรียญเรียบร้อยแล้ว</DialogDescription>
              <button type="button" onClick={() => handleDialogChange(false)}>เรียบร้อย</button>
            </div>
          ) : stage === 'error' ? (
            <div className={styles.walletResult}>
              <span className={styles.walletResultError}><AlertCircle /></span>
              <DialogTitle>ทำรายการไม่สำเร็จ</DialogTitle>
              <DialogDescription>{errorMessage || 'กรุณาลองใหม่อีกครั้ง'}</DialogDescription>
              <button type="button" onClick={resetForm}><RefreshCw /> ลองใหม่</button>
            </div>
          ) : (
            <>
              <div className={styles.walletDialogHeader}>
                <DialogTitle>ชำระเงินผ่าน{channel.label}</DialogTitle>
                <DialogDescription>ตรวจสอบแพ็กเกจก่อนยืนยันการชำระเงิน</DialogDescription>
              </div>
              <div className={styles.walletDialogBody}>
                <div className={styles.walletDialogPackage}>
                  <Image src="/profile/readify-coin.png" width={48} height={48} alt="เหรียญ ReadLead" />
                  <div><span>แพ็กเกจที่เลือก</span><b>{totalCoins.toLocaleString('th-TH')} เหรียญ</b></div>
                  <strong>฿{walletPackage?.price.toLocaleString('th-TH') ?? '—'}</strong>
                </div>

                {stage === 'qr' ? (
                  <div className={styles.gatewayQrBlock}>
                    <Image src={qrImageUri} alt="QR พร้อมเพย์" width={190} height={190} unoptimized />
                    <p><QrCode size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> สแกน QR ด้วยแอปธนาคารเพื่อชำระเงิน ระบบจะเติมเหรียญให้อัตโนมัติ</p>
                  </div>
                ) : stage === 'redirect' ? (
                  <div className={styles.gatewayAwaitBlock}>
                    <RefreshCw />
                    <p><ExternalLink size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> กรุณายืนยันตัวตนในแท็บที่เปิดขึ้น แล้วกลับมาที่หน้านี้</p>
                    {authorizeUri && <a href={authorizeUri} target="_blank" rel="noreferrer">เปิดหน้ายืนยันอีกครั้ง</a>}
                  </div>
                ) : stage === 'busy' ? (
                  <div className={styles.gatewayAwaitBlock}>
                    <RefreshCw />
                    <p>กำลังทำรายการ…</p>
                  </div>
                ) : needsToken ? (
                  <form className={styles.gatewayCardForm} onSubmit={(event) => { event.preventDefault(); void submitCard() }}>
                    <label>ชื่อบนบัตร
                      <input type="text" value={cardName} onChange={(event) => setCardName(event.target.value)} placeholder="ชื่อ-นามสกุล" required />
                    </label>
                    <label>หมายเลขบัตร
                      <input type="text" inputMode="numeric" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} placeholder="0000 0000 0000 0000" required />
                    </label>
                    <label className={styles.gatewayFieldHalf}>เดือนหมดอายุ
                      <input type="text" inputMode="numeric" value={expMonth} onChange={(event) => setExpMonth(event.target.value)} placeholder="MM" maxLength={2} required />
                    </label>
                    <label className={styles.gatewayFieldHalf}>ปีหมดอายุ
                      <input type="text" inputMode="numeric" value={expYear} onChange={(event) => setExpYear(event.target.value)} placeholder="YYYY" maxLength={4} required />
                    </label>
                    <label className={styles.gatewayFieldHalf}>CVV
                      <input type="text" inputMode="numeric" value={cvv} onChange={(event) => setCvv(event.target.value)} placeholder="123" maxLength={4} required />
                    </label>
                  </form>
                ) : needsPhone ? (
                  <form className={styles.gatewayCardForm} onSubmit={(event) => { event.preventDefault(); void submitDirect() }}>
                    <label>เบอร์โทรศัพท์ที่ผูกกับ TrueMoney Wallet
                      <input type="tel" inputMode="numeric" value={mobileNumber} onChange={(event) => setMobileNumber(event.target.value)} placeholder="08XXXXXXXX" maxLength={10} required />
                    </label>
                  </form>
                ) : needsGooglePay ? (
                  <div className={styles.gatewayGooglePayBlock}>
                    <div ref={attachGooglePayContainer} className={styles.gatewayGooglePayButton} />
                    {googlePayReady === 'unavailable' && (
                      <p className={styles.walletDialogNotice}><Info /> เบราว์เซอร์หรืออุปกรณ์นี้ไม่รองรับ Google Pay กรุณาใช้ Chrome บนอุปกรณ์ที่ตั้งค่า Google Pay ไว้แล้ว หรือเลือกช่องทางอื่น</p>
                    )}
                  </div>
                ) : needsApplePay ? (
                  <div className={styles.gatewayGooglePayBlock}>
                    {applePayReady === 'ready' ? (
                      <button
                        type="button"
                        aria-label="ชำระเงินด้วย Apple Pay"
                        className={styles.applePayButton}
                        onClick={() => startApplePay()}
                      />
                    ) : applePayReady === 'unavailable' ? (
                      <p className={styles.walletDialogNotice}><Info /> อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับ Apple Pay กรุณาใช้ Safari บน iPhone, iPad หรือ Mac ที่ตั้งค่า Apple Pay ไว้แล้ว หรือเลือกช่องทางอื่น</p>
                    ) : null}
                  </div>
                ) : (
                  <p className={styles.walletDialogNotice}><Info /> กดยืนยันเพื่อสร้าง QR สำหรับชำระเงินผ่าน{channel.label}</p>
                )}

                {stage === 'input' && errorMessage && <p className={styles.walletDialogError} role="alert"><AlertCircle /> {errorMessage}</p>}
              </div>
              <div className={styles.walletDialogActions}>
                <button type="button" className={styles.walletCancelButton} onClick={() => handleDialogChange(false)} disabled={stage === 'busy'}>ยกเลิก</button>
                {(stage === 'input' && !needsGooglePay && !needsApplePay) && (
                  <button
                    type="button"
                    className={styles.walletConfirmButton}
                    onClick={() => void (needsToken ? submitCard() : submitDirect())}
                    disabled={!walletPackage || (needsToken && !omiseReady) || (needsPhone && !phoneValid)}
                  >
                    ยืนยันและชำระเงิน
                  </button>
                )}
                {(stage === 'busy' || stage === 'qr' || stage === 'redirect') && (
                  <button type="button" className={styles.walletConfirmButton} disabled>
                    <RefreshCw className={styles.walletSpinner} /> กำลังรอการยืนยัน…
                  </button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
