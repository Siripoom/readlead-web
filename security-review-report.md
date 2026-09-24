# Security Review Report — ReadLead Web

อัปเดตล่าสุด: 2026-09-24
Review ID: `SR-2026-09-24-01`

## ขอบเขต

ตรวจผลกระทบฝั่งเว็บจากรีวิวระบบจัดการผู้ใช้, punishment, permission และ admin session ซึ่ง implementation หลักอยู่ใน `readlead-backoffice`

## สรุปผล

- ฝั่ง `readlead-web` ไม่มี route ที่แก้สถานะผู้ใช้หรือสร้าง punishment โดยตรง จึงไม่ต้องแก้ runtime code ใน review รอบนี้
- เว็บส่งคำขอ login/session ไปยัง backoffice ผ่าน `/api/auth/[action]`; เมื่อ backoffice ตรวจพบ punishment ที่ยัง active เว็บจะได้รับผลว่าไม่สามารถเข้าสู่ระบบหรือ session ใช้งานไม่ได้
- punishment ที่หมดอายุหรือถูกยกเลิกจะไม่ถูกนับว่า active จึงกลับมาเข้าสู่ระบบได้โดยไม่ต้องเปลี่ยน `user.status`
- การแก้ privilege escalation, audit log และ `SESSION_SECRET` อยู่ที่ backoffice ซึ่งเป็น authority ของข้อมูลและการยืนยันตัวตน

## สถานะ findings

- `PATCH /api/users/[id]` ไม่มี audit log: แก้แล้วใน backoffice
- มอบ permission ที่ผู้ดำเนินการไม่มี: แก้แล้วใน backoffice
- punishment record ไม่มีผลต่อการใช้งานจริง: แก้แล้วใน backoffice auth/session
- production ใช้ hard-coded session secret ได้: แก้แล้วใน backoffice

## การตรวจสอบ

- ไม่พบ endpoint ซ้ำสำหรับ user status หรือ punishment ใน repo นี้
- route `/api/auth/[action]` ยังคงทำหน้าที่เป็น BFF proxy และส่งสถานะตอบกลับจาก backoffice โดยตรง
- ไม่มี runtime source change ฝั่งเว็บจาก review นี้ จึงไม่มี migration หรือ env ใหม่สำหรับ `readlead-web`

## หมายเหตุ deploy

ต้อง deploy `readlead-backoffice` ก่อนหรือพร้อมกับเว็บ และต้องกำหนด `SESSION_SECRET` ใน production ของ backoffice

---

## Review 002 — Punishment enforcement และ expiry

วันที่: 2026-09-24
สถานะ: แก้แล้วใน backoffice; ฝั่งเว็บไม่ต้องแก้ runtime code

- ยืนยันข้อค้นพบเดิมว่า punishment record กับ `user.status` ไม่เชื่อมกัน
- backoffice แก้โดยให้ password login, social login และ session validation ตรวจ active punishment โดยตรง
- เว็บซึ่ง proxy login/session ไปยัง backoffice จะได้รับผลบล็อกทันทีเมื่อ punishment ยัง active
- เมื่อ punishment หมดอายุหรือถูกยกเลิก backoffice จะไม่คืน session เป็น null อีก จึงไม่ต้องมี cron หรือการ sync `user.status` กลับเป็น `active`
- direct ban ผ่าน `user.status` ยังคงเป็นกลไกแยก และไม่ถูก expiry ของ punishment ปลดโดยอัตโนมัติ

---

## Review 003 — Endpoint สร้าง punishment ซ้ำซ้อน

วันที่: 2026-09-24
สถานะ: แก้แล้วใน backoffice; ฝั่งเว็บไม่ต้องแก้ runtime code

- Backoffice ปิด `POST /api/users/[id]/punishments` ตัวเก่าแล้ว โดยคงเฉพาะ `GET` ประวัติ
- หน้าจัดการผู้ใช้และหน้าจัดการ punishment ใช้ `POST /api/punishment/records` เป็น canonical endpoint เดียว
- ฝั่งเว็บไม่มี caller ของ endpoint จัดการ punishment ทั้งเก่าและใหม่
- การไม่แก้ `user.status` ใน canonical punishment route เป็นพฤติกรรมที่ตั้งใจ: backoffice auth ตรวจ active punishment โดยตรง และจัดการ expiry/cancellation จาก record โดยไม่ต้องใช้ cron
- Backoffice มี regression test ป้องกันการเพิ่ม legacy POST กลับมาอีก

---

## Review 004 — Validation และ audit ของ punishment levels

วันที่: 2026-09-24
สถานะ: แก้แล้วใน backoffice; ฝั่งเว็บไม่ต้องแก้ runtime code

- Backoffice ตรวจ `level`, `threshold`, `duration` และ `name` ที่ runtime แล้ว
- payload ผิดคืน `400`, level ซ้ำคืน `409` และ PATCH id ที่ไม่มีคืน `404`
- `PunishmentLevel.level` มี unique constraint ที่ฐานข้อมูลอยู่แล้ว และ route เพิ่ม conflict handling ที่อ่านเข้าใจได้
- การสร้าง/แก้ระดับโทษเขียน audit log ใน transaction เดียวกับ mutation
- ฝั่งเว็บไม่มี endpoint หรือ UI สำหรับแก้ punishment levels จึงไม่มี surface ที่ต้องเปลี่ยนใน repo นี้
