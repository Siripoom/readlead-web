'use client'

import { useState } from 'react'
import { FileWarning } from 'lucide-react'
import styles from '../profile.module.css'

export function OwnerWriterApplication() {
  const [applicantType, setApplicantType] = useState<'person' | 'company'>('person')
  const [notice, setNotice] = useState('')

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    const form = new FormData(event.currentTarget)
    const files = [form.get('identityFile'), form.get('bankFile')]
    if (files.some((file) => file instanceof File && file.size > 5 * 1024 * 1024)) {
      setNotice('ไฟล์เอกสารแต่ละไฟล์ต้องมีขนาดไม่เกิน 5 MB')
      return
    }
    setNotice('ตรวจสอบข้อมูลในแบบฟอร์มแล้ว แต่ยังไม่ได้ส่งหรือบันทึกข้อมูล เนื่องจากระบบสมัครนักเขียนยังไม่มี API')
  }

  return (
    <div className={styles.stack}>
      <header><h1 className={styles.sectionTitle}>สมัครนักเขียน</h1><p className={styles.sectionDesc}>ลงทะเบียนเพื่อเผยแพร่ผลงานและรับรายได้บน ReadLead</p></header>
      <div className={styles.dangerNote}>
        <FileWarning size={17} className="mr-2 inline" />
        ข้อมูลบัตรประชาชน เอกสาร และบัญชีธนาคารในหน้านี้จะไม่ถูกเก็บใน localStorage หรือส่งออกจากอุปกรณ์
      </div>
      <form onSubmit={submit} className={styles.stack}>
        <section className={`${styles.card} ${styles.sectionCard}`}>
          <div className={styles.sectionHeader}><div><h2 className={styles.sectionTitle}>1. ประเภทผู้สมัคร</h2><p className={styles.sectionDesc}>เลือกประเภทบัญชีที่ต้องการลงทะเบียน</p></div></div>
          <div className={styles.filterRow}>
            <button type="button" className={`${styles.filterButton} ${applicantType === 'person' ? styles.filterButtonActive : ''}`} onClick={() => setApplicantType('person')}>บุคคลธรรมดา</button>
            <button type="button" className={`${styles.filterButton} ${applicantType === 'company' ? styles.filterButtonActive : ''}`} onClick={() => setApplicantType('company')}>นิติบุคคล</button>
          </div>
        </section>

        <section className={`${styles.card} ${styles.sectionCard}`}>
          <div className={styles.sectionHeader}><div><h2 className={styles.sectionTitle}>2. ข้อมูลผู้สมัคร</h2><p className={styles.sectionDesc}>ข้อมูลต้องตรงกับเอกสารที่ใช้ยืนยันตัวตน</p></div></div>
          <div className={styles.formGrid}>
            {applicantType === 'company' && <>
              <Field label="ชื่อนิติบุคคล / บริษัท"><input className={styles.input} name="companyName" required /></Field>
              <Field label="เลขประจำตัวผู้เสียภาษี"><input className={styles.input} name="taxId" inputMode="numeric" pattern="[0-9]{13}" required /></Field>
            </>}
            <Field label="นามปากกา"><input className={styles.input} name="penName" maxLength={60} required /></Field>
            <Field label="เลขบัตรประชาชน 13 หลัก"><input className={styles.input} name="nationalId" inputMode="numeric" pattern="[0-9]{13}" required /></Field>
            <Field label="คำนำหน้า"><select className={styles.select} name="prefix" required><option value="">— เลือก —</option><option>นาย</option><option>นาง</option><option>นางสาว</option></select></Field>
            <Field label="ชื่อจริง"><input className={styles.input} name="firstName" required /></Field>
            <Field label="นามสกุล"><input className={styles.input} name="lastName" required /></Field>
            <Field label="เบอร์โทรศัพท์"><input className={styles.input} name="phone" type="tel" pattern="[0-9+ -]{9,15}" required /></Field>
            <Field label="อีเมล"><input className={styles.input} name="email" type="email" required /></Field>
            <Field label="ที่อยู่" full><textarea className={styles.textarea} name="address" required /></Field>
            <Field label="จังหวัด"><input className={styles.input} name="province" required /></Field>
            <Field label="อำเภอ / เขต"><input className={styles.input} name="district" required /></Field>
            <Field label="ตำบล / แขวง"><input className={styles.input} name="subdistrict" required /></Field>
            <Field label="รหัสไปรษณีย์"><input className={styles.input} name="postalCode" inputMode="numeric" pattern="[0-9]{5}" required /></Field>
            <Field label="รูปบัตรประชาชน (.JPG/.PNG ไม่เกิน 5 MB)" full><input className={styles.input} name="identityFile" type="file" accept="image/jpeg,image/png" required /></Field>
          </div>
        </section>

        <section className={`${styles.card} ${styles.sectionCard}`}>
          <div className={styles.sectionHeader}><div><h2 className={styles.sectionTitle}>3. บัญชีรับรายได้</h2><p className={styles.sectionDesc}>ชื่อบัญชีต้องตรงกับชื่อในเอกสารยืนยันตัวตน</p></div></div>
          <div className={styles.formGrid}>
            <Field label="ชื่อบัญชี"><input className={styles.input} name="accountName" required /></Field>
            <Field label="ธนาคาร"><select className={styles.select} name="bank" required><option value="">— เลือกธนาคาร —</option><option>ธนาคารกสิกรไทย</option><option>ธนาคารไทยพาณิชย์</option><option>ธนาคารกรุงเทพ</option><option>ธนาคารกรุงไทย</option><option>ธนาคารกรุงศรีอยุธยา</option><option>ธนาคารทหารไทยธนชาต</option></select></Field>
            <Field label="เลขที่บัญชี"><input className={styles.input} name="accountNumber" inputMode="numeric" pattern="[0-9-]{10,15}" required /></Field>
            <Field label="รูปหน้าสมุดบัญชี (.JPG/.PNG ไม่เกิน 5 MB)"><input className={styles.input} name="bankFile" type="file" accept="image/jpeg,image/png" required /></Field>
          </div>
        </section>

        <section className={`${styles.card} ${styles.sectionCard}`}>
          <label className="flex items-start gap-3 text-sm leading-6">
            <input type="checkbox" name="terms" required className="mt-1" />
            <span>ฉันยืนยันว่าข้อมูลทั้งหมดเป็นความจริง และยอมรับข้อกำหนดการเป็นนักเขียนกับนโยบายความเป็นส่วนตัว</span>
          </label>
          {notice && <p className={`${styles.infoNote} mt-4`} role="status">{notice}</p>}
          <div className={styles.buttonRow}><button type="submit" className={styles.primaryButton}>ตรวจสอบแบบฟอร์ม</button></div>
        </section>
      </form>
    </div>
  )
}

function Field({ label, full = false, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return <label className={`${styles.field} ${full ? styles.fieldFull : ''}`}><span>{label} <b style={{ color: '#cc4452' }}>*</b></span>{children}</label>
}
