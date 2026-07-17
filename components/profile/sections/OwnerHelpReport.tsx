'use client'

import { useMemo, useState } from 'react'
import { BookOpen, CircleDollarSign, PenTool, Search, Shield, TicketCheck } from 'lucide-react'
import styles from '../profile.module.css'

const FAQS = [
  { category: 'การอ่าน', question: 'เพิ่มเรื่องเข้าชั้นหนังสืออย่างไร?', answer: 'เปิดหน้ารายละเอียดเรื่อง แล้วกดปุ่มเพิ่มเข้าชั้นหนังสือ รายการจะปรากฏในหน้าแรกของบัญชีนี้' },
  { category: 'เหรียญ', question: 'เหรียญ ReadLead ใช้ทำอะไร?', answer: 'ใช้ปลดล็อกตอนแบบชำระเงิน สนับสนุนนักเขียน และร่วมกิจกรรมที่กำหนด' },
  { category: 'โหวต', question: 'ตั๋วโหวตรีเซ็ตเมื่อใด?', answer: 'ตั๋วแนะนำรีเซ็ตทุกวัน ส่วนตั๋วรายเดือนรีเซ็ตเมื่อขึ้นเดือนใหม่' },
  { category: 'นักเขียน', question: 'สมัครนักเขียนต้องใช้เอกสารอะไร?', answer: 'ต้องใช้เอกสารยืนยันตัวตนและหลักฐานบัญชีรับรายได้ ระบบจริงจะส่งเอกสารผ่านช่องทางที่เข้ารหัสเท่านั้น' },
  { category: 'บัญชี', question: 'แก้ชื่อที่แสดงได้ที่ไหน?', answer: 'ไปที่เมนูศูนย์บัญชี แก้ชื่อหรือคำแนะนำตัว แล้วกดบันทึกการเปลี่ยนแปลง' },
]

export function OwnerHelp() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return FAQS
    return FAQS.filter((item) => `${item.category} ${item.question} ${item.answer}`.toLowerCase().includes(normalized))
  }, [query])

  return (
    <div className={styles.stack}>
      <header><h1 className={styles.sectionTitle}>คู่มือผู้ใช้</h1><p className={styles.sectionDesc}>ค้นหาคำตอบเกี่ยวกับการอ่าน บัญชี เหรียญ และการเป็นนักเขียน</p></header>
      <section className={`${styles.card} ${styles.sectionCard}`}>
        <label className={styles.field}>
          <span className="sr-only">ค้นหาคู่มือ</span>
          <span className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b91a0]" /><input className={`${styles.input} pl-10`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาคำถามหรือหัวข้อ..." /></span>
        </label>
      </section>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <GuideCard icon={BookOpen} title="การอ่าน & ชั้นหนังสือ" count="12 บทความ" />
        <GuideCard icon={CircleDollarSign} title="เหรียญ & การชำระเงิน" count="9 บทความ" />
        <GuideCard icon={TicketCheck} title="ตั๋วโหวต & EXP" count="8 บทความ" />
        <GuideCard icon={PenTool} title="สำหรับนักเขียน" count="15 บทความ" />
        <GuideCard icon={Shield} title="บัญชี & ความปลอดภัย" count="7 บทความ" />
      </div>
      <section className={`${styles.card} ${styles.sectionCard}`}>
        <div className={styles.sectionHeader}><div><h2 className={styles.sectionTitle}>คำถามที่พบบ่อย</h2><p className={styles.sectionDesc}>พบ {results.length} รายการ</p></div></div>
        {results.length ? <div className={styles.faqList}>{results.map((item) => <details key={item.question} className={styles.faqItem}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div> : <div className={styles.empty}>ไม่พบคำตอบที่ตรงกับคำค้น</div>}
      </section>
    </div>
  )
}

function GuideCard({ icon: Icon, title, count }: { icon: typeof BookOpen; title: string; count: string }) {
  return <div className={`${styles.card} p-5`}><Icon className="mb-3 text-[#cc4452]" /><b className="block text-sm">{title}</b><span className={styles.sectionDesc}>{count}</span></div>
}

export function OwnerReport() {
  const [notice, setNotice] = useState('')
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    setNotice('ตรวจสอบแบบฟอร์มแล้ว แต่ยังไม่ได้ส่งข้อมูล เนื่องจากระบบแจ้งปัญหายังไม่มี API')
  }

  return (
    <div className={styles.stack}>
      <header><h1 className={styles.sectionTitle}>แจ้งปัญหา</h1><p className={styles.sectionDesc}>อธิบายปัญหาที่พบเพื่อเตรียมส่งให้ทีมสนับสนุน</p></header>
      <form onSubmit={submit} className={`${styles.card} ${styles.sectionCard}`}>
        <div className={styles.formGrid}>
          <label className={styles.field}><span>ประเภทปัญหา</span><select className={styles.select} name="category" required><option value="">— เลือกประเภท —</option><option>การเข้าสู่ระบบและบัญชี</option><option>การอ่านหรือซื้อเนื้อหา</option><option>การเติมเหรียญ</option><option>ผลงานนักเขียน</option><option>ข้อเสนอแนะอื่น ๆ</option></select></label>
          <label className={styles.field}><span>อีเมลสำหรับติดต่อกลับ</span><input className={styles.input} name="email" type="email" required /></label>
          <label className={`${styles.field} ${styles.fieldFull}`}><span>หัวข้อ</span><input className={styles.input} name="subject" maxLength={120} required /></label>
          <label className={`${styles.field} ${styles.fieldFull}`}><span>รายละเอียดปัญหา</span><textarea className={styles.textarea} name="detail" minLength={20} maxLength={2000} required /></label>
          <label className={`${styles.field} ${styles.fieldFull}`}><span>ภาพประกอบ (ไม่บังคับ)</span><input className={styles.input} name="attachment" type="file" accept="image/jpeg,image/png,image/webp" /></label>
        </div>
        <p className={`${styles.infoNote} mt-4`}>ไฟล์และข้อความจะอยู่ในแบบฟอร์มชั่วคราวเท่านั้น ไม่ถูกบันทึกหรืออัปโหลดจากอุปกรณ์</p>
        {notice && <p className={`${styles.dangerNote} mt-3`} role="status">{notice}</p>}
        <div className={styles.buttonRow}><button type="submit" className={styles.primaryButton}>ตรวจสอบแบบฟอร์ม</button></div>
      </form>
    </div>
  )
}
