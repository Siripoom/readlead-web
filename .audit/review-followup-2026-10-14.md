# ตรวจทานรีวิวความปลอดภัย ReadLead รอบ 11 ตุลาคม 2569

ตรวจทานวันที่ 14–15 ตุลาคม 2569 จาก `Untitled (1).pdf` โดยเทียบกับ `readlead-backoffice` คอมมิต `4ff8579` และ `readlead-web` คอมมิต `809f225` ส่วนตารางด้านล่างบันทึกผลตรวจ *ก่อนแก้*; สถานะล่าสุดอยู่ในหัวข้อ “ผลการแก้” ท้ายรายงาน ยังไม่ได้แตะข้อมูล production

## วิธีตรวจและข้อจำกัด

- อ่านเอกสารครบ 9 หน้า ตรวจหน้าแรกจากภาพเรนเดอร์ และเทียบรายการที่ยังเปิดกับ route, service, schema, migration และหน้า web ที่เกี่ยวข้อง
- ก่อนแก้ รัน `npm run test:security` ผ่าน 66/66 และ `npm run test:media` ผ่าน 4/4 ใน backoffice
- ทดสอบ N-1 แบบไม่เชื่อมต่อฐานข้อมูล คำสั่งปกติล้มที่ `server-only` จริง ส่วนคำสั่งที่เพิ่ม `--conditions=react-server` โหลดโมดูลได้แล้วจึงล้มที่ URL ฐานข้อมูลจำลอง
- ไม่ได้เชื่อมต่อฐานข้อมูล, Backblaze, ระบบ deploy หรือบริการจริง จึงยืนยันจำนวนแถว v1, การตั้งค่า bucket, object version, สิทธิ์ของแอดมินเดิม และผลกระทบ production ไม่ได้

## ผลสรุป

รีวิวระบุงานเปิด 26 รายการ: สูง 1, กลาง 12, ต่ำ 13. การตรวจโค้ดครั้งนี้ยืนยันปัญหาหรือช่องว่างของ 22 รายการ อีก 4 รายการต้องตรวจสภาพแวดล้อมจริงหรือตัดสินใจเชิงนโยบายควบคู่กับหลักฐานในโค้ด ได้แก่ M-6, N-3, N-4 และ P-3. จำนวนนี้เป็นการจัดประเภทหลักฐานสำหรับรายงาน ไม่ใช่จำนวนช่องโหว่ที่ทดสอบโจมตีสำเร็จ

### ระดับสูง

| ข้อ | ผลตรวจ | หลักฐานและผลกระทบ | การดำเนินการที่แนะนำ |
| --- | --- | --- | --- |
| N-1 | **ยืนยันด้วยการรัน** | `scripts/migrate-private-payloads.ts` import `lib/writer-application-crypto.ts` ซึ่ง import `server-only`. `DATABASE_URL=not-a-url node --import tsx scripts/migrate-private-payloads.ts` จบด้วย exception ของ `server-only`. เมื่อเพิ่ม `--conditions=react-server` ผ่านจุด import แล้วหยุดที่ URL จำลอง | เพิ่ม npm script สำหรับ dry-run และ apply ที่ใส่ condition นี้ พร้อม smoke test และคู่มือ; ห้ามรัน apply จนสำรอง DB และคีย์แล้ว |

### ระดับกลาง

| ข้อ | ผลตรวจ | หลักฐานและผลกระทบ | การดำเนินการที่แนะนำ |
| --- | --- | --- | --- |
| M-1 | ยืนยัน | `app/api/auth/member/writer-application/route.ts` ใช้ `updateMany` ทับข้อมูลใบสมัครที่ถูกปฏิเสธ; `WriterApplication.userId` ยัง `@unique` และไม่มี revision. คีย์ไฟล์เก่าไม่ถูกลบ จึงอาจเป็น object ไม่มีแถวอ้างอิง | กำหนด retention ของ KYC แล้วเพิ่มประวัติ revision หรือ cleanup หลัง commit ที่ตรวจสอบได้ |
| M-4 | ยืนยันในโค้ด | `lib/storage/backblaze.ts` ใช้ `getConfig()` ของ bucket หลักสำหรับ upload/download/delete ไฟล์แนบรายงาน | แยก private storage และทำ migration พร้อม marker ตำแหน่งของไฟล์เก่า |
| M-6 | ต้องตรวจ production | สคริปต์ `scripts/migrate-topup-slips.ts` ใช้ `DeleteObject` โดยไม่ระบุ version. โค้ดไม่พิสูจน์ว่า B2 ลบ version เก่าแล้ว หรือ production migration สำเร็จ | ตรวจ object versions, lifecycle rule, แถว `slipUrl` ที่เหลือ และประเมินการแจ้งผู้ใช้ |
| M-7 | ยืนยันในโค้ด; ต้องวางแผนย้ายข้อมูล | `getTopUpPrivateConfig()` fallback ไป bucket หลัก; `writer-documents.ts` fallback และผสม private/public credentials ได้. เอกสาร KYC เดิมไม่มี bucket marker | กำหนด private config แบบ fail closed หลังย้ายไฟล์เดิม; ตรวจ direct `B2_PUBLIC_URL` และไม่สลับ bucket ก่อนยืนยันการอ่านไฟล์เก่า |
| M-8 | ยืนยัน | `createWithdrawal` รับเพียง userId กับ amount และสร้าง UUID ใหม่ทุกครั้ง; unique `(userId,payoutPeriod)` ไม่คุ้มครอง advance ที่ period เป็น null. หน้า web ส่ง POST โดยไม่มี idempotency key แม้ proxy ส่ง header นี้ได้ | เพิ่ม client key แบบ unique ต่อผู้ใช้, replay ผลเดิม และ retry transaction เมื่อ P2034 |
| M-9 | ยืนยันใน schema | `CoinLedger`, `CreatorRevenueLedger`, `EpisodePurchase` ผูกผู้ใช้ด้วย `onDelete: Cascade` | กำหนดนโยบายเก็บข้อมูลการเงินกับผู้รับผิดชอบ แล้วเปลี่ยนการลบบัญชีหรือ relation ตามนโยบาย |
| M-10 | ยืนยันในโค้ด | cron payout ตอบ 500 และ `console.error` เมื่อมี `skipped: 'error'`; ไม่เห็นการแจ้งเตือนหรือการ retry ของรายการที่ล้มในงวดนั้น | กำหนดการรันซ้ำภายในวันจ่ายและ alert ที่ติดตามได้ พร้อมตรวจ idempotency ของแต่ละรายการ |
| N-2 | ยืนยันในโค้ด | migration สร้าง v2 แล้ว `updateMany` ทันที ไม่มี decrypt v2 กลับมาตรวจเทียบ; v1 reader ยังอยู่เพื่ออ่านข้อมูลเดิม | เพิ่ม read-back ก่อนเขียนและตรวจจำนวน v1 หลังย้าย; เอา v1 reader ออกหลังยืนยันการย้ายครบ |
| N-3 | ความเสี่ยง deploy ยืนยันจากรูปแบบข้อมูล | โค้ดเก่ารองรับ v1 แต่โค้ดใหม่เขียน v2. การ rollback ไปคอมมิตก่อน v2 หลังมี write ใหม่จะอ่านข้อมูลนั้นไม่ได้; ยังไม่ตรวจแผน deploy จริง | สำรอง DB และคีย์, ใช้ rollback ไป build ที่อ่าน v2 ได้, ระบุจุดห้าม rollback ใน runbook |
| N-4 | ช่องว่างด้านข้อมูลเดิม; ต้องตรวจ production | `writer-applications` อยู่ใน permission list และ seed แต่ไม่มี data migration สำหรับ `AdminProfile.permissions` เดิม. หน้าแอดมินมี checkbox ให้มอบสิทธิ์แล้ว | ตรวจแอดมินปัจจุบันและมอบสิทธิ์แก่ผู้รีวิวที่อนุมัติไว้ก่อนใช้งานจริง โดยไม่ grant ทุกคนอัตโนมัติ |
| N-5 | ยืนยัน | `downloadCreatorMedia()` อ่าน object ทั้งชิ้นเมื่อไม่มี Range; RLCM1 ต้องอ่านและถอดรหัสทั้งชิ้นแม้มี Range. ปัจจุบันไฟล์เสียงใหม่อัปโหลดได้ถึง 100 MB | เพิ่มเพดานสำหรับ no-Range/legacy หรือย้าย RLCM1 เป็น RLCM2 แล้วทดสอบหน่วยความจำและ Content-Range |
| P-1 | ยืนยัน | `public/works/[id]/view` สุ่ม cookie ใหม่ให้ guest ที่ไม่ส่ง cookie; `recordWorkView` เพิ่ม WorkView, views และ metric ต่อคีย์ใหม่ ไม่มี rate limit | จำกัดต่อ IP/งานและจำนวน session ใหม่ หรือใช้ตัวระบุที่ทนต่อการทิ้ง cookie โดยรักษาความเป็นส่วนตัว |

### ระดับต่ำและงานเก็บกวาด

| ข้อ | ผลตรวจ | หลักฐานและผลกระทบ | การดำเนินการที่แนะนำ |
| --- | --- | --- | --- |
| L-1 | ยืนยัน | `updateWithdrawalStatus` ใช้ Serializable แต่ไม่มี retry P2034 หรือแปลงเป็น 409 | retry แบบมีเพดานหรือส่ง 409 ที่ผู้ใช้แก้ได้ |
| L-4 | ยืนยันบางส่วน | writer application route ใช้ `Number(content-length ?? 0)` แต่ `formData()` และตัวตรวจไฟล์ยังมีเพดานต่อไฟล์. ความเสี่ยงคือ parse body ใหญ่ก่อนตรวจไฟล์ | ตรวจขนาด request ที่ขอบระบบและจำกัดอัตราต่อผู้ใช้; ทดสอบกรณีไม่มี header |
| L-5 | ยืนยันในโค้ด | ไม่พบ rate limit หรือเพดานจำนวน pending ใน top-up และ report submission | เพิ่ม quota/pending limit ตามบัญชีและช่วงเวลา |
| L-6 | ยืนยัน | migration สลิปเช็ก private copy ด้วย HEAD เท่านั้น, หยุดเมื่อแถวหนึ่งล้ม และตั้ง `rejectUnauthorized:false` เมื่อเปิด TLS | เทียบ byte size/hash, บันทึกแถวที่ล้ม, ตรวจ TLS certificate และรวมไฟล์แนบรายงาน |
| L-7 | ต้องกำหนดกระบวนการจ่าย | การอนุมัติถอนเงินบันทึก `withdrawal_paid` โดยไม่มีเลขอ้างอิงการโอนใน service | ตกลงจุดที่ถือว่าจ่ายเงินจริงและบันทึกหลักฐานการโอน; พิจารณาสองผู้อนุมัติสำหรับยอดสูง |
| L-9 | ยืนยัน | PATCH punishment จับ P2025 แล้ว แต่ `request.json()` ไม่มี guard และตรวจเพียง status ไม่ว่าง จึงรับ status string นอก whitelist | ตรวจ JSON shape และ enum ก่อน update |
| L-10 | ยืนยันในโค้ด | หน้า Content และโมเดล Content ยังอยู่; ตัวตรวจชนิดไฟล์มีหลายชุด | ตรวจการใช้งานและข้อมูลก่อนลบ legacy; รวม magic-byte detector |
| N-6 | ยืนยัน | envelope ใน `writer-application-crypto.ts` ไม่มี key ID และอ่านด้วยคีย์เดียว | ออกแบบ keyring/kid และ migration ที่อ่านคีย์เก่าได้ |
| P-2 | ยืนยันการส่งข้อมูล; นโยบายการแสดงชื่อยังต้องตกลง | public work detail ส่ง `userId`, `user.name` ของ review/reply/comment; creator endpoint ส่ง `name` คู่กับ `penName`. web ใช้ชื่อและ ID บางจุดเพื่อแสดงผล/ลิงก์ | กำหนด public display name และ public profile identifier แล้วลด DTO โดยปรับ web พร้อมกัน |
| P-3 | พฤติกรรมยืนยัน; เจตนาธุรกิจไม่ทราบ | approved work เป็น `coming_soon`, `hasCover` เป็น true แม้ `coverIsPublic=false`; cover route เปิดภาพให้ approved | ยืนยันว่าหน้า coming soon ตั้งใจแสดงปกและเรื่องย่อหรือไม่ แล้วทำ DTO/cover route ให้ตรงนโยบาย |
| P-4 | ยืนยัน | `page = Math.max(1, Number(...) || 1)` รับ Infinity และเลขใหญ่มากไปคำนวณ `skip` | รับเฉพาะ safe integer และ clamp ก่อนเรียก Prisma |
| P-5 | ยืนยัน | cover/asset upload ใช้ `WRITER_APPLICATION_ENCRYPTION_KEY || B2_APP_KEY || 'creator-media'` สำหรับ workToken | derive secret ตาม purpose จากคีย์ที่บังคับตั้งค่า และลบ fallback คงที่ |
| P-6 | ยืนยันในโค้ด | register route ไม่มี rate limit และไม่พบ limiter ส่วนกลางใน backoffice | จำกัดต่อ IP และอีเมลที่ขอบระบบหรือแอป พร้อมตรวจ false positive |

## ลำดับงานที่เสนอ

1. ปิด N-1 ก่อนใช้งาน migration: เพิ่มคำสั่งที่รันได้จริง, smoke test และคู่มือ dry-run/apply. เพิ่ม read-back ของ N-2. สำรอง DB กับ encryption key ก่อน apply
2. จัดการ N-3 และ N-4 ในแผน deploy. ตรวจผู้รีวิวเดิมและแผน rollback ก่อนปล่อยโค้ดที่เขียน v2
3. แก้ P-5, P-4, L-9, M-8 และ P-1 ในโค้ดพร้อม regression tests เพราะมีเส้นทางเรียกจากภายนอกชัดเจน
4. วาง migration ของ M-1, M-4, M-6, M-7, M-9 และ N-6 โดยแยกการแก้โค้ดออกจากการย้ายข้อมูลจริง
5. ตัดสินใจนโยบาย P-2, P-3, L-7 แล้วทำ web/backend ให้ตรงกัน; ปิดงาน rate limit, payout retry และ cleanup ที่เหลือ

## ขอบเขตที่ยังไม่ได้ตรวจ

ตามเอกสารต้นทาง ยังไม่ได้ตรวจ Omise webhook, wallet/Apple Pay, ads/monetization, exp, tickets, moderation/creator-moderation และ dashboard. รายงานนี้ไม่ได้ขยายผลไปยังโมดูลเหล่านั้น

## ผลการแก้วันที่ 14–15 ตุลาคม 2569

| ข้อ | สถานะล่าสุด |
| --- | --- |
| N-1 | เพิ่มคำสั่ง `db:migrate-private-payloads` พร้อม React Server condition และคู่มือ dry run, backup, apply, rollback |
| N-2 | migration ถอดรหัส v2 กลับและเทียบข้อมูลก่อนเขียนแต่ละแถว |
| M-1 | เก็บ KYC revision เดิมพร้อมเอกสารในการส่งใหม่แบบ transaction; อ่านประวัติผ่าน API แอดมินได้จนถึง 1 ปีหลัง archive |
| M-8 | บังคับ `idempotency-key` ต่อคำขอถอน, unique ตามผู้ใช้, replay ผลเดิม, retry serialization conflict; web ใช้ key เดิมเมื่อ retry จำนวนเดิม |
| M-9 | foreign key ของรายการซื้อ, ledger, top-up และ withdrawal ใช้ `ON DELETE RESTRICT` เพื่อบล็อกการลบบัญชีที่มีประวัติการเงินและบล็อก cascade ผ่านงาน/ตอนที่มีรายการซื้อ |
| L-4 | จำกัด multipart body ของ KYC ก่อน parse แม้ไม่มี Content-Length |
| L-1 | แปลง Prisma serialization conflict `P2034` ในการตัดสินถอนเงินเป็น HTTP 409 เพื่อให้ผู้ดูแลลองใหม่ได้ |
| L-7 | แยก `approved` (อนุมัติให้โอน) จาก `paid` (โอนจริง) ต้องมีเลขอ้างอิงการโอน; `withdrawal_paid` ledger เกิดเฉพาะตอน paid |
| L-9 | ตรวจ JSON และ whitelist สถานะ PATCH punishment |
| P-3 | ซ่อนปก tagline และเรื่องย่อของ approved/coming soon จน published ทั้ง detail และ landing |
| P-4 | จำกัด page เป็น safe integer บวกและไม่เกิน 1000 |
| P-5 | derive work token secret จากคีย์ที่บังคับตั้งค่า; เลิก fallback ไป B2 key/ค่าคงที่ |

Migration ใหม่อยู่ใน backoffice: `20261014090000_withdrawal_client_idempotency`, `20261014100000_writer_application_revisions`, `20261014110000_preserve_financial_history`, `20261014120000_withdrawal_paid_state` ยังไม่ได้ apply กับ production

**ยังเปิด:** M-1 ต้องมีงานลบ revision และ object KYC เมื่อครบ 1 ปีพร้อมตรวจ B2 versions/ตำแหน่ง bucket เดิม รวมถึงผูกนโยบายกับการปิดบัญชีเมื่อมี flow นี้; M-4/M-6/M-7/L-6 ต้องย้ายและพิสูจน์ private object ใน production; N-3/N-4 ต้องตรวจ deploy/rollback และ admin grants; N-5 ต้องจัดการ full decrypt/legacy media; M-10 ต้องเพิ่ม payout alert/retry; P-1/P-6/L-5 ต้องมี rate limit/quotas; P-2 ต้องกำหนด public name policy; L-10/N-6 ต้องตรวจ legacy Content และทำ keyring

`npm run test:security` หลังแก้ผ่าน 73/73, `npx prisma generate`, production build ของทั้งสอง repo และ `git diff --check` ผ่าน ไม่ได้เชื่อมต่อ DB/B2/deploy จริง จึงยังไม่ถือว่าการย้ายข้อมูล production เสร็จ
