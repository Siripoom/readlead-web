# Security Review Report — Writer Application / KYC

อัปเดตล่าสุด: 2026-09-24

Review ID: `SR-2026-09-24-02`

ระบบที่ตรวจ: `readlead-backoffice` ณ `HEAD 2771469`

สถานะ: **ต้องแก้ก่อนถือว่าระบบเก็บหลักฐานและจำกัดสิทธิ์ KYC ได้อย่างปลอดภัย**

## ขอบเขตและวิธีตรวจ

ตรวจ lifecycle ตั้งแต่รับใบสมัคร, เข้ารหัส payload, อัปโหลดเอกสาร, บันทึกผลพิจารณา, audit log และ authorization ของหน้า/route ฝั่งแอดมิน โดยเทียบ implementation ปัจจุบันกับข้อกำหนดต่อไปนี้:

- ใบสมัครแต่ละครั้งและเอกสารประกอบต้องอ้างอิงย้อนหลังได้โดยไม่ถูกการยื่นครั้งใหม่เขียนทับ
- rejection reason ต้องไม่สูญหายเมื่อมีการยื่นใหม่
- AES-GCM ต้อง bind ciphertext กับ record และชนิดข้อมูลด้วย AAD
- key ต้องแยกตาม purpose
- การอ่าน PII/KYC และการอนุมัติใบสมัครต้องมี permission เฉพาะตามหลัก least privilege

การตรวจนี้เป็น security/code review ไม่ใช่คำวินิจฉัยทางกฎหมาย ข้อกำหนดระยะเวลาเก็บและลบข้อมูลต้องให้ผู้รับผิดชอบ PDPA/กฎหมายกำหนดเพิ่มอย่างชัดเจน

## Standards

ไม่พบการฝ่าฝืนมาตรฐาน Next.js ที่บันทึกไว้ใน `AGENTS.md`/`CLAUDE.md`; route ที่ตรวจใช้ App Router และ await async request APIs ถูกต้อง อย่างไรก็ตามพบ design smells ที่มีผลต่อความปลอดภัยดังนี้

### S-1 — High: non-atomic lifecycle กระจายระหว่าง object storage กับฐานข้อมูล

เอกสารถูกอัปโหลดก่อน create/update แถวฐานข้อมูลใน `app/api/auth/member/writer-application/route.ts:81-123` ขณะที่ `lib/storage/writer-documents.ts:59-79` เขียนลง key เดิมแบบ in-place

ผลคือ:

- ถ้า identity upload สำเร็จแต่ bank upload ล้มเหลว เอกสาร identity เก่าอาจถูกทับแล้วแม้ API ตอบล้มเหลว
- ถ้า upload ทั้งคู่สำเร็จแต่ DB update ล้มเหลว แถวเดิมยังอยู่ แต่เปิดดูแล้วได้ไฟล์ใหม่
- การยื่นพร้อมกันสอง request สามารถ interleave จน payload/metadata กับ bytes มาจากคนละ request

นี่เป็นความเสียหายต่อหลักฐานที่เกิดได้แม้การยื่นซ้ำ **ไม่สำเร็จ**

### S-2 — High: crypto context เป็น primitive strings และไม่ bind กับเจ้าของ record

`lib/writer-application-crypto.ts:44-77` รับเพียง `Record<string, string>` และใช้ master key โดยตรงโดยไม่มี AAD ส่วน document AAD ในบรรทัด 40-41 bind แค่ `kind` จึงไม่รู้ว่า ciphertext เป็นของ application ใด

### S-3 — High: approval แข่งกับการระงับบัญชีได้

`lib/db/writer-applications.ts:135-168` อ่านว่า user ยัง `active` ก่อน แล้วค่อย update application และ update `userType: 'creator'` แบบไม่มีเงื่อนไข ถ้ามีอีก transaction ระงับ user หลังการอ่านแต่ก่อน update ผู้ใช้ ระบบยังอนุมัติและ promote บัญชีที่ถูกระงับได้

ควรทำ conditional update ที่รวม `status: 'active'` และตรวจ affected row ภายใน transaction หรือใช้ locking/isolation ที่บังคับ invariant เดียวกัน

### S-4 — Medium: permission เป็น string กว้างเกิน domain

หน้า, sidebar และ API ใช้ string `'users'` ซ้ำหลายจุด ทั้งที่มี `AdminPermission` อยู่แล้ว การเปลี่ยนสิทธิ์ของ KYC จึงต้องแก้กระจายและ compiler ไม่ช่วยตรวจ route ที่ตกหล่น

### S-5 — Medium: ไม่มี lifecycle ลบ object ตาม record

schema ใช้ `onDelete: Cascade` กับแถวฐานข้อมูล แต่ storage module มีเฉพาะ Put/Get ไม่มี Delete หรือ retention workflow ดังนั้นการลบ user/application ทางฐานข้อมูลสามารถทิ้งเอกสารบัตรและบัญชีธนาคารเป็น orphan ใน bucket ได้

## Spec

### F-1 — Critical: การยื่นใหม่ทำลายทั้ง record history และไฟล์เดิม

หลักฐาน:

- `prisma/schema.prisma:187,237-258` กำหนด `User.writerApplication` เป็น relation เดี่ยวและ `WriterApplication.userId` เป็น `@unique`
- migration `prisma/migrations/20260718090000_writer_applications/migration.sql:25` สร้าง unique index บน `userId`
- `app/api/auth/member/writer-application/route.ts:89-106` ใช้ `update()` แถวเดิมเมื่อใบสมัครก่อนหน้าถูก reject พร้อมเขียนทับ `encryptedPayload`, ข้อมูลผู้สมัคร, object keys และตั้ง `rejectionReason: null`
- `lib/writer-application-crypto.ts:118-123` สร้าง token จาก `userId + kind` เท่านั้น และ `lib/storage/writer-documents.ts:67-77` Put ลง key นั้น จึงเขียนทับ object เดิม
- `lib/db/writer-applications.ts:170-177` บันทึก audit เพียง decision และ previous status ไม่เก็บเหตุผล reject

หลังยื่นใหม่ ระบบจึงสูญเสีย payload เดิม, เอกสารเดิม, `reviewedAt` และข้อความ rejection reason แบบกู้คืนจากระบบปัจจุบันไม่ได้ ส่วน audit ของผู้พิจารณาที่ยังเหลืออยู่ใช้ application ID เดิมร่วมกันทุกครั้ง จึงแยกไม่ได้ว่าเป็นการตัดสิน submission revision ใด

แนวแก้หลักคือทำ **หนึ่ง submission ต่อหนึ่ง immutable row**:

- เปลี่ยน relation เป็น `User.writerApplications[]` และยกเลิก unique `userId`
- สร้าง application ID ใหม่ทุกครั้ง; ห้าม update แถว rejected ให้กลับเป็น pending
- เก็บ predecessor/current pointer หรือ revision ตามความต้องการ และมี constraint ป้องกัน pending submission ซ้ำจาก concurrent requests
- แยกข้อมูล profile ที่ระบบ public/finance ต้องใช้หลังอนุมัติออกจากสมมติฐาน “user มี writerApplication เดียว” เพราะปัจจุบัน catalog และ payout หลายจุดอ่าน relation แบบ singular

ไม่แนะนำให้เก็บ snapshot PII ที่ถอดรหัสแล้วทั้งชุดลง generic `AuditLog.detail` เป็นทางแก้หลัก เพราะจะเพิ่มสำเนาข้อมูลอ่อนไหวและทำให้ access/retention ยากขึ้น หากจำเป็นต้องใช้ fallback ควรเป็น encrypted history store ที่มีสิทธิ์และ retention เฉพาะ

### F-2 — Critical: upload-before-DB ทำลายหลักฐานได้แม้ transaction ธุรกิจไม่สำเร็จ

`Promise.all()` upload สองไฟล์ทำงานก่อน DB mutation และ object storage ไม่ได้อยู่ใน transaction เดียวกับ PostgreSQL จึง rollback ร่วมกันไม่ได้

แนวแก้:

1. จอง submission ID ก่อนเข้ารหัส/อัปโหลด
2. ใช้ key ใหม่ต่อ submission เช่น HMAC ของ `applicationId + kind`; ห้าม overwrite key ของ submission เก่า
3. upload ไป staging/unique keys แล้ว create/finalize record ใน transaction
4. ถ้า DB ล้มเหลวให้ทำ compensating cleanup และมี scheduled orphan cleanup รองรับ process crash
5. ถ้าผู้ให้บริการรองรับ ให้เพิ่ม conditional put/versioning/object lock เป็น defense in depth แต่ไม่ใช้แทน immutable data model

### F-3 — High: AES-GCM payload และ document ไม่ bind กับ application

`encryptWriterApplicationPayload`/`decryptWriterApplicationPayload` ใน `lib/writer-application-crypto.ts:44-77` ไม่มี `setAAD()` และใช้ `getEncryptionKey()` ตรง ๆ ขณะที่ document AAD ในบรรทัด 40-41 มีเพียงชนิดเอกสาร

ผลคือ:

- สลับ `encryptedPayload` ระหว่างสองแถวแล้ว authentication tag ยังผ่าน
- สลับ object/ciphertext ของเอกสารชนิดเดียวกันระหว่างสอง application แล้ว tag ยังผ่าน
- ระบบไม่มี cryptographic proof ว่า PII/เอกสารที่เปิดอยู่เป็นของ record นั้นจริง

ควรมี context-specific API เช่น:

```ts
encryptWriterApplicationPayload(applicationId, payload)
decryptWriterApplicationPayload(applicationId, envelope)
encryptWriterDocument(applicationId, kind, body)
decryptWriterDocument(applicationId, kind, envelope)
writerDocumentObjectToken(applicationId, kind)
```

โดย payload ใช้ `deriveKey('application-payload')` และ AAD ที่มี version + applicationId; document ใช้ key purpose ของตนเองและ AAD ที่มี version + applicationId + kind

### F-4 — High: สิทธิ์ `users` เปิดทั้ง KYC และ decision mutation กว้างเกินไป

`lib/admin-permissions.ts:1-10` ไม่มี permission สำหรับ writer application/KYC ขณะที่จุดต่อไปนี้ใช้ `users` ทั้งหมด:

- list: `app/api/writer-applications/route.ts:9-11`
- detail PII และ approve/reject: `app/api/writer-applications/[id]/route.ts:20-22,41-43`
- identity/bank document: `app/api/writer-applications/[id]/documents/[kind]/route.ts:11-13`
- page/sidebar: `app/(backoffice)/writer-applications/page.tsx:5-7`, `components/layout/Sidebar.tsx:16`

ดังนั้น admin ที่ควรจัดการ user ทั่วไปได้ สามารถอ่านบัตรประชาชน/สมุดบัญชีและอนุมัติหรือ reject ใบสมัครได้ด้วย

ขั้นต่ำให้เพิ่ม `writer-applications` เป็น permission แยกและเปลี่ยนทุก surface ให้ใช้ permission นี้ ทางเลือกที่ละเอียดกว่าให้แยก `writer-applications:read-pii` กับ `writer-applications:review` และไม่ backfill ให้ admin เดิมโดยอัตโนมัติ ยกเว้น role ที่ได้รับอนุมัติแล้ว

### F-5 — Medium: ไม่มี key separation สำหรับ application payload และ helper ถูกใช้ข้าม domain

payload ใช้ master key ตรง ๆ (`lib/writer-application-crypto.ts:46,66`) และ helper เดียวกันถูกใช้เข้ารหัสปลายทางถอนเงินใน `lib/db/creator-studio.ts:389,446`/`lib/db/finance.ts:21`

จึงไม่ควรแก้ด้วยการเพิ่ม `applicationId` เข้า shared helper เดิมอย่างเดียว ต้องแยก API และ purpose:

- application payload → `application-payload` + application ID AAD
- withdrawal destination → `withdrawal-destination` + withdrawal ID AAD
- document content → `document-content` + application ID + kind AAD
- object-key token → `document-object-key` + application ID + kind

### F-6 — Migration blocker: เปลี่ยน key/AAD โดยไม่ version จะทำให้ข้อมูลเดิมอ่านไม่ได้

payload envelope และ document envelope ปัจจุบันเป็น version 1 (`lib/writer-application-crypto.ts:6,53,58,102-103`) ถ้าเปลี่ยน key derivation หรือ AAD แต่ยังใช้ v1 ข้อมูลเดิมทั้งหมดจะถอดรหัสไม่ผ่าน

ต้องออก format `v2` พร้อมหนึ่งในสองแนวทาง:

- dual-read: อ่าน v1 ด้วย legacy path, เขียนใหม่เป็น v2 เท่านั้น และ re-encrypt เมื่ออ่าน/ทำ batch migration
- planned migration: สำรองข้อมูล, decrypt v1, re-encrypt v2 พร้อม application ID, verify จำนวน/แฮช แล้วจึงปิด legacy read

ห้ามลบ legacy path จนตรวจยืนยันว่าไม่มี v1 เหลือ และต้องแยก migration ของ withdrawal ciphertext ออกจาก application ciphertext

## Regression tests ที่ต้องมี

ปัจจุบันไม่พบ automated test ของ writer-application lifecycle, crypto context หรือ authorization routes เหล่านี้

1. reject submission A แล้ว submit B: ได้คนละ application ID/key และ A/rejection reason ยังอ่านย้อนหลังได้เหมือนเดิม
2. identity upload สำเร็จแต่ bank upload หรือ DB write ล้มเหลว: object/record ของ A ไม่เปลี่ยน
3. submit พร้อมกันสอง request: ไม่เกิด pending ซ้ำและไม่เกิด payload/document ผสมกัน
4. สลับ payload ระหว่าง application IDs: decrypt ต้อง fail authentication
5. สลับ document ชนิดเดียวกันระหว่าง application IDs: decrypt ต้อง fail authentication
6. admin ที่มีเพียง `users`: list/detail/document/decision ต้องได้ 403; permission ใหม่จึงได้สิทธิ์ตามที่กำหนด
7. reject audit/history ต้องระบุ reason และ reviewer โดยไม่ทำสำเนา PII เกินจำเป็น
8. suspend user แข่งกับ approve: ต้องไม่เกิด user ที่ inactive แต่ถูก promote จาก approval
9. v1 fixture ยังอ่านได้ระหว่าง migration และ v2 fixture ใช้ derived key/AAD ถูก context
10. การลบ/หมดอายุ retention ต้องลบ DB metadata และ object ที่เกี่ยวข้องครบ พร้อม audit ที่ไม่เก็บเนื้อหาเอกสาร

## ลำดับการแก้ที่แนะนำ

1. ปิดหรือจำกัด resubmission ชั่วคราวจนกว่าจะใช้ unique per-submission keys เพื่อหยุดการทำลายหลักฐานเพิ่ม
2. เพิ่ม permission เฉพาะและตัด `users` ออกจาก writer-application page/API ทั้งหมด
3. เปลี่ยน data model เป็น immutable submissions และแก้ upload/finalization workflow
4. ออก crypto envelope v2 พร้อม record-bound AAD และ purpose-derived keys
5. migrate/backfill สิทธิ์และ ciphertext อย่างตรวจสอบย้อนกลับได้
6. เพิ่ม regression tests และกำหนด retention/deletion policy ก่อนเปิด flow ใหม่

ถ้าธุรกิจตั้งใจเก็บเฉพาะใบสมัครล่าสุดจริง ต้องบันทึกเป็น policy ที่อนุมัติชัดเจน พร้อม retention/deletion rationale และ UI ต้องไม่ทำให้ audit trail อ้างว่าเอกสารปัจจุบันคือเอกสารที่ใช้ตัดสินใจในอดีต อย่างไรก็ตาม policy แบบ “latest only” ยังไม่แก้ปัญหา overbroad permission, missing AAD หรือ partial overwrite

## สรุปจำนวน findings

Standards: 5 findings (ร้ายแรงที่สุด: non-atomic cross-store lifecycle) — Spec: 6 findings (ร้ายแรงที่สุด: การยื่นใหม่ทำลาย record/document/rejection evidence เดิม)
