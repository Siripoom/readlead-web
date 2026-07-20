'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Building2,
  Check,
  Clock3,
  FileImage,
  LoaderCircle,
  Send,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useRole } from '@/contexts/RoleContext'
import { PrivacyPolicyDocument, WriterTermsDocument } from './WriterLegalDocuments'
import styles from './OwnerWriterApplication.module.css'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const BANKS = [
  ['kbank', 'ธนาคารกสิกรไทย'],
  ['scb', 'ธนาคารไทยพาณิชย์'],
  ['bbl', 'ธนาคารกรุงเทพ'],
  ['ktb', 'ธนาคารกรุงไทย'],
  ['bay', 'ธนาคารกรุงศรีอยุธยา'],
  ['ttb', 'ธนาคารทหารไทยธนชาต (ttb)'],
  ['gsb', 'ธนาคารออมสิน'],
  ['baac', 'ธนาคารเพื่อการเกษตรฯ (ธ.ก.ส.)'],
  ['cimb', 'ธนาคารซีไอเอ็มบีไทย'],
] as const

interface ApplicationSummary {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  penName: string
  submittedAt: string
  rejectionReason: string | null
}

interface AddressOption {
  code: string
  name: string
  postalCode?: string
}

type FieldErrors = Record<string, string>
type LegalDocument = 'writer' | 'privacy' | null

async function readJson(response: Response) {
  return await response.json().catch(() => ({})) as {
    error?: string
    fieldErrors?: FieldErrors
    application?: ApplicationSummary | null
  }
}

async function fetchAddressOptions(params = '') {
  const response = await fetch(`/api/writer-application/addresses${params}`, { cache: 'no-store' })
  const data = await response.json().catch(() => ({})) as { items?: AddressOption[]; error?: string }
  if (!response.ok) throw new Error(data.error ?? 'โหลดข้อมูลที่อยู่ไม่สำเร็จ')
  return data.items ?? []
}

export function OwnerWriterApplication() {
  const { user } = useRole()
  const [applicantType, setApplicantType] = useState<'person' | 'company'>('person')
  const [application, setApplication] = useState<ApplicationSummary | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState('')
  const [unauthorized, setUnauthorized] = useState(false)
  const [identityFile, setIdentityFile] = useState<File | null>(null)
  const [bankFile, setBankFile] = useState<File | null>(null)
  const [fileErrors, setFileErrors] = useState<FieldErrors>({})
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [legalDocument, setLegalDocument] = useState<LegalDocument>(null)

  const [provinces, setProvinces] = useState<AddressOption[]>([])
  const [districts, setDistricts] = useState<AddressOption[]>([])
  const [subdistricts, setSubdistricts] = useState<AddressOption[]>([])
  const [provinceCode, setProvinceCode] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const [subdistrictCode, setSubdistrictCode] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [addressLoading, setAddressLoading] = useState(false)
  const [addressError, setAddressError] = useState('')

  useEffect(() => {
    let active = true
    void fetch('/api/writer-application', { cache: 'no-store' })
      .then(async (response) => ({ response, data: await readJson(response) }))
      .then(({ response, data }) => {
        if (!active) return
      if (response.status === 401) {
        setUnauthorized(true)
        setStatusError(data.error ?? 'กรุณาเข้าสู่ระบบก่อนสมัครนักเขียน')
      } else if (!response.ok) {
        setStatusError(data.error ?? 'ตรวจสอบสถานะใบสมัครไม่สำเร็จ')
      } else {
        setUnauthorized(false)
        setApplication(data.application ?? null)
      }
      })
      .catch(() => { if (active) setStatusError('เชื่อมต่อระบบสมัครนักเขียนไม่สำเร็จ') })
      .finally(() => { if (active) setStatusLoading(false) })
    void fetchAddressOptions()
      .then((items) => { if (active) setProvinces(items) })
      .catch((error: unknown) => { if (active) setAddressError(error instanceof Error ? error.message : 'โหลดข้อมูลที่อยู่ไม่สำเร็จ') })
    return () => { active = false }
  }, [])

  const changeProvince = async (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setProvinceCode(value)
    setDistrictCode('')
    setSubdistrictCode('')
    setPostalCode('')
    setDistricts([])
    setSubdistricts([])
    setAddressError('')
    if (!value) return
    setAddressLoading(true)
    try {
      setDistricts(await fetchAddressOptions(`?provinceCode=${encodeURIComponent(value)}`))
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : 'โหลดข้อมูลอำเภอไม่สำเร็จ')
    } finally {
      setAddressLoading(false)
    }
  }

  const changeDistrict = async (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setDistrictCode(value)
    setSubdistrictCode('')
    setPostalCode('')
    setSubdistricts([])
    setAddressError('')
    if (!value) return
    setAddressLoading(true)
    try {
      setSubdistricts(await fetchAddressOptions(`?provinceCode=${encodeURIComponent(provinceCode)}&districtCode=${encodeURIComponent(value)}`))
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : 'โหลดข้อมูลตำบลไม่สำเร็จ')
    } finally {
      setAddressLoading(false)
    }
  }

  const changeSubdistrict = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setSubdistrictCode(value)
    setPostalCode(subdistricts.find((item) => item.code === value)?.postalCode ?? '')
  }

  const clearFieldError = (event: FormEvent<HTMLFormElement>) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return
    const name = target.name
    if (name && fieldErrors[name]) {
      setFieldErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice('')
    const nextFileErrors: FieldErrors = {}
    if (!identityFile) nextFileErrors.identityFile = 'กรุณาแนบรูปบัตรประชาชน'
    if (!bankFile) nextFileErrors.bankFile = 'กรุณาแนบรูปหน้าสมุดบัญชี'
    setFileErrors(nextFileErrors)
    if (!identityFile || !bankFile) return
    if (!event.currentTarget.reportValidity()) return

    const form = new FormData(event.currentTarget)
    form.set('applicantType', applicantType)
    form.set('termsAccepted', String(termsAccepted))
    form.set('identityFile', identityFile)
    form.set('bankFile', bankFile)

    setSubmitting(true)
    setFieldErrors({})
    try {
      const response = await fetch('/api/writer-application', { method: 'POST', body: form })
      const data = await readJson(response)
      if (!response.ok) {
        setFieldErrors(data.fieldErrors ?? {})
        setNotice(data.error ?? 'ส่งใบสมัครไม่สำเร็จ กรุณาลองใหม่')
        if (data.application) setApplication(data.application)
        return
      }
      if (data.application) {
        setApplication(data.application)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch {
      setNotice('เชื่อมต่อระบบสมัครนักเขียนไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
    }
  }

  if (statusLoading) return <LoadingState />
  if (user?.userType === 'creator') return <ApplicationState status="approved" penName={user.name} submittedAt={null} />
  if (unauthorized) {
    return (
      <div className={styles.stateCard}>
        <UserRound className={styles.stateIcon} />
        <h1>กรุณาเข้าสู่ระบบ</h1>
        <p>{statusError}</p>
        <Link href="/login" className={styles.stateButton}>ไปหน้าเข้าสู่ระบบ</Link>
      </div>
    )
  }
  if (application && application.status !== 'rejected') {
    return <ApplicationState status={application.status} penName={application.penName} submittedAt={application.submittedAt} />
  }

  return (
    <div className={styles.applicationPage}>
      <header className={styles.pageHeader}>
        <h1>สมัครนักเขียน</h1>
        <p>กรอกข้อมูลเพื่อลงทะเบียนเป็นนักเขียนกับ ReadLead และเริ่มสร้างรายได้จากผลงานของคุณ</p>
      </header>

      {statusError && <div className={styles.errorBanner} role="alert">{statusError}</div>}
      {application?.status === 'rejected' && (
        <div className={styles.rejectedBanner} role="status">
          <AlertTriangle />
          <div><b>ใบสมัครก่อนหน้านี้ยังไม่ผ่านการตรวจสอบ</b><p>{application.rejectionReason || 'กรุณาตรวจสอบข้อมูลและเอกสาร แล้วส่งใบสมัครใหม่อีกครั้ง'}</p></div>
        </div>
      )}

      <form className={styles.form} onSubmit={submit} onChange={clearFieldError} noValidate={false}>
        <Section number="1" title="ประเภทผู้สมัคร" description="เลือกประเภทบัญชีที่ต้องการลงทะเบียน">
          <div className={styles.typeGrid}>
            <ApplicantTypeButton active={applicantType === 'person'} icon={<UserRound />} title="บุคคลธรรมดา" description="สมัครในนามตัวบุคคล" onClick={() => setApplicantType('person')} />
            <ApplicantTypeButton active={applicantType === 'company'} icon={<Building2 />} title="นิติบุคคล" description="สมัครในนามบริษัท/ห้างหุ้นส่วน" onClick={() => setApplicantType('company')} />
          </div>
          <InfoNote>
            {applicantType === 'person'
              ? 'รายได้จะถูกหักภาษี ณ ที่จ่ายตามอัตราที่กฎหมายกำหนด และออกหนังสือรับรองในนามบุคคลธรรมดา'
              : 'กรุณาใช้ข้อมูลบริษัทและบัญชีธนาคารในนามนิติบุคคล ระบบจะออกเอกสารภาษีตามประเภทบัญชีที่เลือก'}
          </InfoNote>
        </Section>

        <Section number="2" title="ข้อมูลส่วนตัว" description="ข้อมูลต้องตรงกับบัตรประชาชนเพื่อใช้ยืนยันตัวตน">
          {applicantType === 'company' && (
            <div className={styles.twoColumns}>
              <Field label="ชื่อนิติบุคคล / บริษัท" name="companyName" error={fieldErrors.companyName}><input className={styles.input} name="companyName" placeholder="เช่น บริษัท ตัวอย่าง จำกัด" maxLength={200} required /></Field>
              <Field label="เลขประจำตัวผู้เสียภาษีอากร (13 หลัก)" name="taxId" error={fieldErrors.taxId}><input className={styles.input} name="taxId" placeholder="0-0000-00000-00-0" inputMode="numeric" required /></Field>
            </div>
          )}
          <div className={styles.twoColumns}>
            <Field label="นามปากกา" name="penName" error={fieldErrors.penName}><input className={styles.input} name="penName" placeholder="ชื่อที่จะแสดงบนผลงาน" maxLength={60} required /></Field>
            <Field label="บัตรประชาชน (13 หลัก)" name="nationalId" error={fieldErrors.nationalId}><input className={styles.input} name="nationalId" placeholder="0-0000-00000-00-0" inputMode="numeric" required /></Field>
          </div>
          <div className={styles.nameColumns}>
            <Field label="คำนำหน้า" name="prefix" error={fieldErrors.prefix}><select className={styles.input} name="prefix" defaultValue="" required><option value="" disabled>— เลือก —</option><option>นาย</option><option>นาง</option><option>นางสาว</option><option>ห้างหุ้นส่วนสามัญ</option></select></Field>
            <Field label="ชื่อจริง" name="firstName" error={fieldErrors.firstName}><input className={styles.input} name="firstName" placeholder="ชื่อจริง" maxLength={100} required /></Field>
            <Field label="นามสกุล" name="lastName" error={fieldErrors.lastName}><input className={styles.input} name="lastName" placeholder="นามสกุล" maxLength={100} required /></Field>
          </div>
          <div className={styles.twoColumns}>
            <Field label="เบอร์โทรศัพท์" name="phone" error={fieldErrors.phone}><input className={styles.input} name="phone" placeholder="08x-xxx-xxxx" type="tel" required /></Field>
            <Field label="อีเมล" name="email" error={fieldErrors.email}><input className={styles.input} name="email" placeholder="you@email.com" type="email" defaultValue={user?.email ?? ''} required /></Field>
          </div>
          <Field label="ที่อยู่ (บ้านเลขที่ / หมู่ / ซอย / ถนน)" name="address" error={fieldErrors.address}><input className={styles.input} name="address" placeholder="เช่น 123/45 หมู่ 6 ถ.สุขุมวิท" maxLength={500} required /></Field>
          <div className={styles.addressColumns}>
            <Field label="จังหวัด" name="provinceCode" error={fieldErrors.provinceCode}><select className={styles.input} name="provinceCode" value={provinceCode} onChange={changeProvince} required><option value="">— เลือกจังหวัด —</option>{provinces.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></Field>
            <Field label="อำเภอ / เขต" name="districtCode"><select className={styles.input} name="districtCode" value={districtCode} onChange={changeDistrict} disabled={!provinceCode || addressLoading} required><option value="">— เลือกอำเภอ —</option>{districts.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></Field>
            <Field label="ตำบล / แขวง" name="subdistrictCode"><select className={styles.input} name="subdistrictCode" value={subdistrictCode} onChange={changeSubdistrict} disabled={!districtCode || addressLoading} required><option value="">— เลือกตำบล —</option>{subdistricts.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></Field>
            <Field label="รหัสไปรษณีย์" name="postalCode" error={fieldErrors.postalCode}><input className={styles.input} name="postalCode" value={postalCode} placeholder="—" readOnly required /></Field>
          </div>
          {addressError && <p className={styles.fieldError} role="alert">{addressError}</p>}

          <FileDropzone kind="identity" label="รูปบัตรประชาชน" file={identityFile} error={fileErrors.identityFile || fieldErrors.identityFile} onFile={(file, error) => { setIdentityFile(file); setFileErrors((current) => ({ ...current, identityFile: error })) }} />
          <InfoNote>
            <b>* กรุณาเซ็นรับรองสำเนาเอกสาร</b> และระบุว่า <b>“ใช้สำหรับการลงทะเบียนเป็นนักเขียนกับบริษัท รีดลีด จำกัด”</b> ทุกครั้งก่อนอัปโหลด
            <span>** รองรับไฟล์ภาพ .JPG, .PNG เท่านั้น ขนาดไม่เกิน 5 MB</span>
          </InfoNote>
        </Section>

        <Section number="3" title="บัญชีธนาคาร" description="ใช้สำหรับรับรายได้จากผลงานของคุณ">
          <Field label="ชื่อบัญชี" name="accountName" error={fieldErrors.accountName}><input className={styles.input} name="accountName" placeholder="ชื่อ-นามสกุล เจ้าของบัญชี" maxLength={200} required /><small className={styles.redNote}>* ชื่อบัญชีต้องตรงกับชื่อในบัตรประชาชน</small></Field>
          <div className={styles.twoColumns}>
            <Field label="เลือกธนาคาร" name="bankCode" error={fieldErrors.bankCode}><select className={styles.input} name="bankCode" defaultValue="" required><option value="" disabled>— เลือกธนาคาร —</option>{BANKS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></Field>
            <Field label="เลขที่บัญชี" name="accountNumber" error={fieldErrors.accountNumber}><input className={styles.input} name="accountNumber" placeholder="เลขบัญชี 10-12 หลัก" inputMode="numeric" required /></Field>
          </div>
          <FileDropzone kind="bank" label="รูปหน้าสมุดบัญชี" file={bankFile} error={fileErrors.bankFile || fieldErrors.bankFile} onFile={(file, error) => { setBankFile(file); setFileErrors((current) => ({ ...current, bankFile: error })) }} />
          <InfoNote>
            <b>* กรุณาเซ็นรับรองสำเนาเอกสาร</b> และระบุว่า <b>“ใช้สำหรับการลงทะเบียนเป็นนักเขียนกับบริษัท รีดลีด จำกัด”</b> ทุกครั้งก่อนอัปโหลด
            <span>** รองรับไฟล์ภาพ .JPG, .PNG เท่านั้น ขนาดไม่เกิน 5 MB</span>
          </InfoNote>
        </Section>

        <section className={styles.sectionCard}>
          <label className={styles.terms}>
            <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} required />
            <span className={styles.customCheckbox}><Check /></span>
            <span>ฉันได้อ่านและยอมรับ <button type="button" onClick={() => setLegalDocument('writer')}>ข้อกำหนดและเงื่อนไขการเป็นนักเขียน</button> และ <button type="button" onClick={() => setLegalDocument('privacy')}>นโยบายความเป็นส่วนตัว</button> ของบริษัท รีดลีด จำกัด และยืนยันว่าข้อมูลทั้งหมดเป็นความจริง</span>
          </label>
          {fieldErrors.termsAccepted && <p className={styles.fieldError}>{fieldErrors.termsAccepted}</p>}
          {notice && <div className={styles.errorBanner} role="alert">{notice}</div>}
          <button className={styles.submitButton} type="submit" disabled={!termsAccepted || submitting}>
            {submitting ? <LoaderCircle className={styles.spin} /> : <Send />}
            {submitting ? 'กำลังส่งใบสมัคร…' : 'ส่งใบสมัคร'}
          </button>
        </section>
      </form>

      <Dialog open={legalDocument !== null} onOpenChange={(open) => { if (!open) setLegalDocument(null) }}>
        <DialogContent className={styles.legalDialog}>
          <DialogTitle>{legalDocument === 'writer' ? 'ข้อกำหนดและเงื่อนไขการเป็นนักเขียน' : 'นโยบายคุ้มครองข้อมูลส่วนบุคคล'}</DialogTitle>
          <DialogDescription className="sr-only">เอกสารข้อกำหนดของบริษัท รีดลีด จำกัด</DialogDescription>
          <div className={styles.legalBody}>{legalDocument === 'writer' ? <WriterTermsDocument /> : <PrivacyPolicyDocument />}</div>
          <button type="button" className={styles.legalClose} onClick={() => setLegalDocument(null)}>รับทราบ</button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Section({ number, title, description, children }: { number: string; title: string; description: string; children: React.ReactNode }) {
  return <section className={styles.sectionCard}><h2 className={styles.sectionTitle}><span>{number}</span>{title}</h2><p className={styles.sectionDescription}>{description}</p><div className={styles.sectionContent}>{children}</div></section>
}

function ApplicantTypeButton({ active, icon, title, description, onClick }: { active: boolean; icon: React.ReactNode; title: string; description: string; onClick: () => void }) {
  return <button type="button" className={`${styles.typeCard} ${active ? styles.typeCardActive : ''}`} aria-pressed={active} onClick={onClick}><span className={styles.typeIcon}>{icon}</span><span><b>{title}</b><small>{description}</small></span><i className={styles.radioDot} /></button>
}

function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: React.ReactNode }) {
  return <label className={styles.field} htmlFor={name}><span className={styles.fieldLabel}>{label} <b>*</b></span>{children}{error && <small className={styles.fieldError} role="alert">{error}</small>}</label>
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return <div className={styles.infoNote}><AlertTriangle /><div>{children}</div></div>
}

function FileDropzone({ kind, label, file, error, onFile }: { kind: 'identity' | 'bank'; label: string; file: File | null; error?: string; onFile: (file: File | null, error: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const selectFile = (selected?: File) => {
    if (!selected) return
    if (!['image/jpeg', 'image/png'].includes(selected.type)) return onFile(null, `${label}ต้องเป็นไฟล์ JPG หรือ PNG เท่านั้น`)
    if (selected.size > MAX_FILE_SIZE) return onFile(null, `${label}ต้องมีขนาดไม่เกิน 5 MB`)
    onFile(selected, '')
  }
  const drop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setDragging(false)
    selectFile(event.dataTransfer.files[0])
  }

  return (
    <div className={styles.uploadField}>
      <span className={styles.fieldLabel}>{label} <b>*</b></span>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png" hidden onChange={(event) => selectFile(event.target.files?.[0])} />
      <button type="button" className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ''}`} onClick={() => inputRef.current?.click()} onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onDragOver={(event) => event.preventDefault()} onDrop={drop}>
        {kind === 'identity' ? <FileImage /> : <Banknote />}
        <b>คลิก<span>เลือก{label}</span> หรือลากไฟล์มาวาง</b>
        <small>JPG หรือ PNG ขนาดไม่เกิน 5 MB</small>
      </button>
      {file && <div className={styles.preview}><ImagePreview key={`${file.name}-${file.size}-${file.lastModified}`} file={file} label={label} /><div><b>{file.name}</b><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></div><button type="button" aria-label={`ลบ${label}`} onClick={() => { if (inputRef.current) inputRef.current.value = ''; onFile(null, '') }}><X /></button></div>}
      {error && <small className={styles.fieldError} role="alert">{error}</small>}
    </div>
  )
}

function ImagePreview({ file, label }: { file: File; label: string }) {
  const [preview] = useState(() => URL.createObjectURL(file))
  useEffect(() => () => URL.revokeObjectURL(preview), [preview])
  return <Image src={preview} alt={`ตัวอย่าง${label}`} width={72} height={72} unoptimized />
}

function LoadingState() {
  return <div className={styles.stateCard}><LoaderCircle className={`${styles.stateIcon} ${styles.spin}`} /><h1>กำลังตรวจสอบใบสมัคร</h1><p>กรุณารอสักครู่</p></div>
}

function ApplicationState({ status, penName, submittedAt }: { status: 'pending' | 'approved'; penName: string; submittedAt: string | null }) {
  const approved = status === 'approved'
  return <div className={styles.stateCard}>{approved ? <BadgeCheck className={styles.stateIcon} /> : <Clock3 className={styles.stateIcon} />}<span className={`${styles.statusPill} ${approved ? styles.statusApproved : ''}`}>{approved ? 'อนุมัติแล้ว' : 'รอตรวจสอบ'}</span><h1>{approved ? 'บัญชีนี้เป็นนักเขียนแล้ว' : 'ส่งใบสมัครเรียบร้อยแล้ว'}</h1><p>{approved ? `ยินดีต้อนรับ ${penName} สู่ครอบครัวนักเขียน ReadLead` : 'ทีมงานได้รับข้อมูลและเอกสารของคุณแล้ว ระบบจะแจ้งผลหลังตรวจสอบเสร็จ'}</p>{submittedAt && <small>ส่งเมื่อ {new Intl.DateTimeFormat('th-TH', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(submittedAt))}</small>}</div>
}
