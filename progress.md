# Progress: เชื่อมต่อ Omise Payment Gateway ในกระเป๋าเงิน

อัปเดตล่าสุด: 2026-08-21 (แก้บั๊ก Google Pay dialog ค้างว่างเปล่าไม่มีอะไรขึ้น)

## บริบท

เมนูกระเป๋าเงินในหน้าโปรไฟล์ (`components/profile/`) เดิมรองรับการเติมเหรียญแค่ช่องทางเดียวคือ "อัปโหลดหลักฐาน" (สลิปโอนเงิน ให้แอดมินตรวจสอบเอง) ส่วน พร้อมเพย์/บัตรเครดิต/ทรูมันนี่/เคาน์เตอร์เซอร์วิส เป็นแค่ปุ่ม disabled ไว้เฉยๆ ไม่มีระบบชำระเงินจริงรองรับ

งานนี้คือเตรียมเชื่อมต่อ Omise ให้ใช้งานได้จริง, เอาเคาน์เตอร์เซอร์วิสออก, เพิ่ม ShopeePay/Apple Pay, และเตรียม API ไว้ให้แอปมือถือในอนาคตใช้งานร่วมกันได้

งานนี้เกี่ยวข้องกับ 2 repo:
- `readlead-web` — frontend (BFF proxy อย่างเดียว ไม่มี DB)
- `readlead-backoffice` — backend จริง (Prisma + Postgres + เรียก Omise API)

แผนเต็มอยู่ที่ `/Users/a.siripoom/.claude/plans/components-profile-omise-delegated-hamming.md`

---

## ทำไปแล้ว

### Phase 1 — โครงสร้างข้อมูล (data-driven contract) — เสร็จ ทั้ง 2 repo

**readlead-web**
- `lib/types.ts` — เพิ่ม type `PaymentChannel`, `GatewayChargeResult`, ขยาย `PaymentMethod` ให้รองรับ `shopeepay` / `apple-pay` / `google-play` / `app-store`, ขยาย `WalletTransaction.status` ให้มี `authorizing` / `failed` / `expired`
- `contexts/WalletContext.tsx` — wallet snapshot ดึง `channels` จาก backend จริงแทนของ hardcode, เพิ่มฟังก์ชัน `initiateGatewayCharge()` / `pollGatewayCharge()`
- `components/profile/sections/OwnerCreatorWallet.tsx` — เมนูช่องทางชำระเงินเปลี่ยนจาก array hardcode เป็นดึงจาก `channels` (backend เป็นคนคุมว่าช่องไหนเปิด/ปิด), **เอาเคาน์เตอร์เซอร์วิสออกจากตัวเลือก** (แต่เก็บไว้ในทะเบียนแสดงผลประวัติ กันรายการเก่าพัง), มี `FALLBACK_WEB_CHANNELS` กันหน้าเว็บพังถ้า backoffice ยังไม่ deploy field ใหม่
- `lib/profile-help-data.ts` — แก้ FAQ ไม่พูดถึงเคาน์เตอร์เซอร์วิสแล้ว
- `.env.example` / `.env.local` — เพิ่ม `NEXT_PUBLIC_OMISE_PUBLIC_KEY`

**readlead-backoffice**
- `prisma/schema.prisma` — แก้ตาราง `CoinTopUpRequest`: เพิ่ม enum status ใหม่ (`authorizing`/`failed`/`expired`), ทำให้ฟิลด์สลิปเป็น nullable, เพิ่มฟิลด์ `paymentMethod`, `omiseChargeId`, `omiseChargeStatus`, `omiseSourceType`, `amountReceivedSatang` — **รัน migration ลง DB จริงในเครื่องแล้ว** (`20260817070000_add_gateway_topup_fields`)
- `lib/wallet-channels.ts` (ไฟล์ใหม่) — รายการช่องทางชำระเงินทั้งหมด (source of truth)
- `lib/member-wallet.ts` — ส่ง `channels` กลับไปพร้อม wallet snapshot
- `lib/member-topups.ts`, `lib/db/coin-topups.ts` — แก้จุดที่ hardcode `paymentMethod: 'proof-upload'` ให้อ่านค่าจริงจาก DB, แยกฟังก์ชัน `creditTopUp()` ออกมาใช้ร่วมกัน (สำคัญ — กันเครดิตซ้ำตอนทำ webhook)
- `.env.example` — เพิ่ม `OMISE_SECRET_KEY`

### Phase 2a — เชื่อม Omise จริง (ฝั่ง server) — เสร็จ

- `lib/member-topup-charges.ts` (ไฟล์ใหม่, backoffice) — สร้าง charge ผ่าน Omise API จริง (บัตร = ใช้ token จาก client, พร้อมเพย์/ShopeePay = สร้าง source ที่ server เลย ไม่ต้องพึ่ง client)
- `POST /api/auth/member/wallet/topups/charge` — สร้างรายการชำระเงิน
- `GET /api/auth/member/wallet/topups/charge/[chargeId]` — เช็คสถานะ (poll)
- `POST /api/webhooks/omise` — รับผลจาก Omise (verify signature ถ้าตั้งค่า secret ไว้, และ**เช็คซ้ำกับ Omise API เสมอ**ไม่เชื่อ payload เฉยๆ)
- แก้บั๊กที่เจอระหว่างทำ: `proxy.ts` บล็อคทุก route ที่ไม่มี admin cookie ไว้ ลืมเปิดให้ `/api/webhooks/` เข้าถึงได้ (Omise เรียกมาแบบไม่มี cookie) — แก้แล้ว

**ทดสอบผ่านจริงกับ Omise test API (ไม่ใช่แค่ build ผ่าน):**
- สร้าง charge บัตรเทส → เครดิตเหรียญเข้าจริง (ยอดขึ้นถูกต้อง)
- กดซ้ำด้วย idempotency key เดิม → ไม่สร้างรายการซ้ำ ไม่เครดิตซ้ำ
- ส่ง webhook ซ้ำ 2 ครั้งให้ charge เดิม → เครดิตแค่ครั้งเดียว
- poll สถานะ charge ที่ยังไม่จบ (พร้อมเพย์) → ได้ QR image จริงจาก Omise
- เช็คสิทธิ์: user อื่นขอดู charge ของคนอื่นไม่ได้ (404)

### Phase 2b — หน้าจอ UI — เสร็จ

- `components/profile/sections/wallet/GatewayChargeDialog.tsx` (ไฟล์ใหม่) — popup ชำระเงินสำหรับช่องทาง gateway แยกจาก popup อัปโหลดสลิปเดิม
  - บัตรเครดิต: ฟอร์มกรอกบัตร → tokenize ผ่าน omise.js → ส่ง charge → ถ้าสำเร็จทันทีก็ขึ้นหน้า "ชำระเงินสำเร็จ"
  - พร้อมเพย์: กดยืนยัน → โชว์ QR จริงจาก Omise → poll สถานะอัตโนมัติทุก 3 วิ

**ทดสอบผ่านเบราว์เซอร์จริง (ไม่ใช่แค่ curl):**
- กรอกฟอร์มบัตร (เลขบัตรเทส) → เห็นหน้าจอ "ชำระเงินสำเร็จ" จริง → ยอดเหรียญขึ้นในหน้าเว็บจริง (495→600→650)
- กด PromptPay → เห็น QR code จริงจาก Omise (มีลายน้ำ "TEST MODE") → ปุ่ม polling ทำงาน
- เช็คซ้ำอีกรอบหลังปิด (revert) ช่องทางกลับเป็น disabled แล้ว → เมนูโชว์ถูกต้อง (พร้อมเพย์/บัตร/ShopeePay/Apple Pay ขึ้น "ยังไม่เปิดใช้งาน", ไม่มีเคาน์เตอร์เซอร์วิส)

---

## สถานะตอนนี้ (สำคัญ)

**เปิดใช้งานช่องทางชำระเงินแล้ว 5 ช่อง** (`enabled: true` ใน `readlead-backoffice/lib/wallet-channels.ts`): อัปโหลดหลักฐาน, พร้อมเพย์, บัตรเครดิต/เดบิต, ทรูมันนี่ วอลเล็ท, ShopeePay

**ยังปิดอยู่:**
- `apple-pay` — ต้องมี Apple Merchant ID + domain verification file + certificate ผูกกับ Omise ก่อน (ยังไม่เริ่ม Phase 3b)
- `google-play` / `app-store` — เป็นแค่ stub เตรียมไว้สำหรับแอปมือถือในอนาคต ไม่เกี่ยวกับเว็บ

### Phase 3 — เปิด ShopeePay/TrueMoney จริง — เสร็จ

- เพิ่มการรองรับเบอร์โทรศัพท์สำหรับ TrueMoney (Omise ต้องการ `phone_number` ตอนสร้าง source) — ทั้ง backend (`createMemberCharge`), route, `WalletContext.initiateGatewayCharge()`, และ dialog UI (`GatewayChargeDialog.tsx` มีช่องกรอกเบอร์เพิ่มเมื่อเลือก TrueMoney)
- แก้ FAQ ให้พูดถึง ShopeePay/ทรูมันนี่ที่เปิดใช้งานแล้ว, Apple Pay "กำลังเตรียมเปิดใช้งาน"

**บั๊กสำคัญที่เจอและแก้ระหว่างทดสอบ TrueMoney จริง:** การสร้าง charge ที่ `lib/member-topup-charges.ts` ไม่เคยส่ง `return_uri` ไปให้ Omise เลย — ทำให้ทุก flow ที่ต้องออกจากหน้าเว็บ (TrueMoney app-switch, บัตรที่ต้องยืนยัน 3DS) ล้มเหลวทันทีด้วย error `"return_uri is missing"` จาก Omise (พร้อมเพย์/ShopeePay ที่เป็น QR ล้วนไม่โดนเพราะไม่ต้องใช้ `return_uri`) แก้โดยเพิ่ม env var ใหม่ `WEB_APP_URL` ใน backoffice แล้วประกอบเป็น URL ชี้กลับมาที่แท็บกระเป๋าเงินของ user เอง ยืนยันแล้วว่าทำงานถูกต้องทั้งทาง curl และเบราว์เซอร์จริง (TrueMoney/ShopeePay เข้าสู่หน้าจอ "redirect" พร้อมลิงก์ยืนยันที่ใช้งานได้จริง)

**⚠️ ต้องตั้งค่าตอน deploy ขึ้น production:** `WEB_APP_URL` ในไฟล์ `.env` ของ backoffice ต้องเปลี่ยนจาก `http://localhost:3000` เป็น URL จริงของเว็บที่ deploy แล้ว ไม่งั้น TrueMoney และบัตรที่ต้องยืนยัน 3DS จะใช้งานไม่ได้เหมือนบั๊กที่เจอ

**ทดสอบผ่านเบราว์เซอร์จริงครบทุกช่องทางที่เปิด:**
- บัตรเครดิต: ยังชำระสำเร็จได้ปกติ ยอดเหรียญขึ้นถูกต้อง
- พร้อมเพย์: QR ยังขึ้นและ poll สถานะทำงาน
- ทรูมันนี่: เข้าหน้าจอ redirect พร้อม `authorize_uri` จริงจาก Omise (ก่อนหน้านี้ล้มเหลวเพราะบั๊ก return_uri ด้านบน)
- ShopeePay: เข้าหน้าจอ redirect พร้อม charge จริงจาก Omise
- เมนูเลือกช่องทางในหน้ากระเป๋าเงินโชว์ถูกต้อง: 4 ช่อง gateway เลือกได้ + Apple Pay ปิดอยู่ + ไม่มีเคาน์เตอร์เซอร์วิส
- ตารางประวัติ render รายการที่เคยล้มเหลว (แดง "ชำระเงินไม่สำเร็จ") ปนกับรายการที่สำเร็จได้ถูกต้อง

---

## ปัญหาความปลอดภัยที่เจอระหว่างทำ (แก้แล้ว)

1. **คีย์ Omise ที่ส่งในแชทถือว่ารั่วแล้ว** แม้จะเป็น test mode — **ยังไม่ได้ rotate คีย์ใหม่** แนะนำให้ไป rotate ที่หน้า Omise dashboard เมื่อมีเวลา แล้วอัปเดต `.env` เอง (ไม่ต้องส่งในแชท)
2. เคย set `NEXT_PUBLIC_OMISE_SECRET_KEY` ใน `readlead-web/.env.local` ผิด — จะทำให้ secret key หลุดไปอยู่ใน JavaScript ฝั่ง browser ที่ทุกคนโหลดได้ — ลบออกแล้ว, secret key อยู่ถูกที่แล้วคือ `readlead-backoffice/.env` (`OMISE_SECRET_KEY`)

---

## เหลืออะไรที่ต้องทำ

### ต้องทำก่อนขึ้น production (ถ้าจะเปิดใช้ช่องทาง gateway จริง)
- [ ] Rotate Omise API key ใหม่ (คีย์เดิมรั่วในแชทแล้ว)
- [ ] ตั้งค่า Webhook signing secret ในหน้า Omise dashboard แล้วใส่ `OMISE_WEBHOOK_SECRET` — ตอนนี้ webhook endpoint ยังไม่มีลายเซ็นยืนยัน (ปลอดภัยอยู่เพราะเช็คกับ Omise API ซ้ำเสมอ แต่ควรมีชั้นป้องกันเพิ่ม)

### Phase 3c — เพิ่ม Google Pay + ใส่โลโก้จริงให้ ShopeePay/Apple Pay/Google Pay — เสร็จ (ยังไม่ได้ทดสอบผ่านเบราว์เซอร์จริง)

**Google Pay เป็นคนละอย่างกับ Google Play** — อันนี้คือกระเป๋าเงินจ่ายเงินบนเว็บ (เหมือน Apple Pay) ไม่ใช่ Google Play Billing (ซื้อในแอป ที่เตรียมไว้เฉยๆ สำหรับแอปมือถือในอนาคต) เพิ่ม `instrument: 'google-pay'` ใหม่แยกจากของเดิม

**ทำไมเปิดใช้งานได้เลยต่างจาก Apple Pay:** Apple Pay ต้องมี Apple Merchant ID + ไฟล์ยืนยันโดเมน + certificate ก่อนถึงจะทำงานได้แม้แต่ในโหมดทดสอบ แต่ Google Pay โหมด TEST ของ Google ใช้งานได้เลยโดยไม่ต้องลงทะเบียน merchant (Omise มองว่า Google Pay เป็นแค่บัตรที่ผ่านการ tokenize มา — ใช้ charge flow เดียวกับบัตรเครดิตเป๊ะๆ) เลยเปิด `enabled: true` ได้เลย — **ก่อนขึ้น production ต้องไปลงทะเบียน merchant ID จริงที่ Google Pay & Wallet Console แล้วสลับ environment จาก TEST เป็น PRODUCTION** (ทำเป็น: อ่านจาก prefix ของ `NEXT_PUBLIC_OMISE_PUBLIC_KEY` อัตโนมัติแล้ว — พอสลับเป็น `pkey_live_...` ระบบจะสลับเป็น PRODUCTION ให้เอง)

**สิ่งที่แก้:**
- `lib/types.ts`, `lib/wallet-channels.ts` (backoffice): เพิ่ม `'google-pay'` เป็น instrument ใหม่
- `lib/member-topup-charges.ts` (backoffice): รับ token จาก Google Pay เหมือนบัตร/Apple Pay (ผ่าน `card:` parameter เดียวกัน)
- `components/profile/sections/wallet/GatewayChargeDialog.tsx`: เพิ่มการโหลด Google Pay JS SDK, เช็ค `isReadyToPay`, แสดงปุ่ม Google Pay ทางการ (ปุ่มจริงจาก Google ไม่ใช่ปุ่มที่ทำเอง) ถ้าเบราว์เซอร์/อุปกรณ์ไม่รองรับจะขึ้นข้อความแจ้งแทนปุ่ม
- `components/profile/sections/OwnerCreatorWallet.tsx`: เพิ่ม Google Pay ในกริดเลือกช่องทาง, ใส่โลโก้จริงให้ทั้ง ShopeePay, Apple Pay, และ Google Pay (ก่อนหน้านี้ใช้ไอคอนกระเป๋าเงินทั่วไปแทน)

**ที่มาโลโก้:** ShopeePay มาจาก seeklogo.com (เว็บรวมโลโก้แบรนด์ทั่วไป, ไม่มี brand kit ทางการที่หาได้), ส่วน Apple Pay กับ Google Pay ได้จาก Wikimedia Commons (ตรวจสอบแล้วว่าระบุลิขสิทธิ์/เครื่องหมายการค้าไว้ชัดเจน เป็นแหล่งที่น่าเชื่อถือกว่า) ทุกไฟล์ตรวจสอบด้วยตาแล้วว่าตรงกับโลโก้จริง — ถ้าจะขึ้น production แนะนำให้ขอไฟล์ทางการจากเจ้าของแบรนด์อีกทีเพื่อความชัวร์เรื่องลิขสิทธิ์

**ยืนยันแล้ว:** typecheck + lint ผ่านทั้ง 2 repo, ไฟล์โลโก้ถูก serve ได้จริงจาก dev server
**ยังไม่ได้ยืนยัน:** การกดปุ่ม Google Pay จริงในเบราว์เซอร์ (ต้อง login ด้วยบัญชีจริงถึงจะเทสได้ ระบบจำลอง session ทดสอบไม่ได้เพราะ auto-mode ของ Claude Code บล็อกการสร้าง session ปลอมไว้โดยเจตนา — ต้องให้คนจริงลอง) หมายเหตุ: ปุ่ม Google Pay จะไม่ขึ้นถ้าเบราว์เซอร์/เครื่องไม่มีบัญชี Google ที่ผูกบัตรไว้ (ระบบจะโชว์ข้อความแจ้งแทนอัตโนมัติ ไม่ใช่บั๊ก)

### Phase 3d — เช็ค/เตรียม API Google Pay + Apple Pay สำหรับแอปมือถือในอนาคต — เสร็จ

เช็คแล้วว่า **endpoint สร้าง charge (`POST /api/auth/member/wallet/topups/charge`) พร้อมสำหรับแอปมือถืออยู่แล้วโดยไม่ต้องแก้โค้ดเลย** เพราะมันรับแค่ Omise token ที่ mint มาแล้ว ไม่สนว่ามาจาก omise.js บนเว็บหรือ Omise iOS/Android SDK บนแอป — ใช้ endpoint เดียวกันได้ทันที ระบบ login (`/api/auth/member/login|google|facebook|apple`) ก็ใช้ cookie ธรรมดา ไม่มี CSRF/Origin check ที่จะบล็อกแอปมือถือ เรียกตรงไปที่ backoffice ได้เลยเหมือนกัน

**สิ่งเดียวที่ขาดจริงๆ และแก้แล้ว:** `platforms` ใน `WALLET_CHANNELS` (backoffice) ของ `apple-pay`/`google-pay` มีแค่ `['web']` — ตาม contract ที่ตั้งไว้เอง (`channels` ถูกแท็กด้วย platform ให้ทั้งเว็บและแอปในอนาคตใช้ร่วมกัน) แอปมือถือที่ทำตาม spec จะเห็นว่าใช้ไม่ได้ทั้งที่จริงๆ charge flow รองรับอยู่แล้ว แก้เป็น:
- `apple-pay`: `platforms: ['web', 'ios']` (ยังปิดอยู่เหมือนเดิม — ติดปัญหา Apple Merchant ID เหมือนกันทั้งเว็บและแอป)
- `google-pay`: `platforms: ['web', 'android']` (เปิดใช้งานอยู่)

เพิ่มคอมเมนต์อธิบาย mobile contract ไว้ใน `lib/member-topup-charges.ts` (backoffice) ตรงจุดที่ card/apple-pay/google-pay ใช้ path เดียวกัน — สรุปสั้นๆ: แอปมือถือ login ผ่าน endpoint เดิม, mint token เองด้วย Omise SDK ของมือถือ, แล้วยิงมาที่ endpoint เดิมได้เลย ไม่ต้องมี endpoint ใหม่

**นอกขอบเขต (ยังไม่ทำ ตั้งใจ):** ยังไม่เพิ่ม ios/android ให้ credit-card/promptpay/truemoney/shopeepay (ผู้ใช้ถามเจาะจงแค่ Google Pay/Apple Pay), ยังไม่ทำ Bearer-token auth (cookie auth ใช้กับแอปมือถือได้อยู่แล้ว เป็นการตัดสินใจสถาปัตยกรรมใหญ่กว่านี้ ไม่ใช่ตัวบล็อก), ยังไม่มีแอปมือถือจริงให้ทดสอบ (ยัง repo ไม่มี)

**ยืนยันแล้ว:** typecheck + lint ผ่านทั้ง 2 repo, เช็คค่า `platforms`/`enabled` จริงจาก `WALLET_CHANNELS` ตรงตามที่ตั้งใจ, เช็คแล้วว่าเว็บไม่กระทบ (ยัง filter ด้วย `platforms.includes('web')` เหมือนเดิม)

### สถานะช่องทางชำระเงิน (ข้อมูลจริงจาก DB — ไม่ใช่ข้อมูล seed)

ยืนยันด้วยรายการที่ `status='approved'` จริงในฐานข้อมูล จากการจ่ายเงินจริงผ่าน Omise test mode:

| ช่องทาง | รายการที่สำเร็จจริง |
|---|---|
| บัตรเครดิต/เดบิต | 3 |
| พร้อมเพย์ | 4 |
| ShopeePay | 2 |
| ทรูมันนี่ วอลเล็ท | 1 |
| อัปโหลดสลิป | 1 |
| Google Pay | **0 — ยังไม่เคยสำเร็จ** |
| Apple Pay | **0 — ยังไม่เคยสำเร็จ** |

**บั๊กเชิงระบบที่เจอ (สำคัญมากตอนขึ้น production):** รายการที่ลูกค้าจ่ายเงินสำเร็จจริงที่ Omise แล้ว จะค้างเป็น `authorizing` ตลอดไปถ้า webhook ยิงกลับมาไม่ได้ — ตอน dev เพราะ Omise เข้า `localhost` ไม่ได้ ไล่เช็ครายการค้างทั้งหมดเทียบกับ Omise API แล้วเจอ **2 รายการที่จ่ายเงินสำเร็จจริงแต่ระบบไม่เคยบันทึก** (ทรูมันนี่ 105 เหรียญ + พร้อมเพย์ 320 เหรียญ) — settle ให้เรียบร้อยแล้ว นี่คือสาเหตุที่ทรูมันนี่ดูเหมือน "ใช้ไม่ได้" มาตลอด ทั้งที่จริงๆ ใช้ได้

**⚠️ ตอน deploy ต้องตั้งค่า webhook URL ใน Omise dashboard** ให้ชี้มาที่ `https://<โดเมน-backoffice>/api/webhooks/omise` ไม่งั้นลูกค้าจ่ายเงินจริงแล้วเหรียญไม่เข้า (การ poll ตอนเปิด dialog ช่วยได้เฉพาะตอนผู้ใช้ยังเปิดหน้าค้างไว้เท่านั้น)

**หมายเหตุ:** ตัวเลขข้างบนคือรายการจริงทั้งหมด ไม่นับ demo data

### Demo data สำหรับรีวิว UI (`readlead-backoffice/prisma/seed-wallet-demo.ts`)

สร้างไว้ให้ลูกค้าดูว่าตารางประวัติแสดงผลแต่ละช่องทาง/สถานะยังไง — 12 แถวครอบคลุมทุกช่องทาง + ทุกสถานะ (approved/pending/rejected/authorizing/failed/expired)

```bash
npx tsx prisma/seed-wallet-demo.ts artorsiriratpoom@gmail.com            # เพิ่ม
npx tsx prisma/seed-wallet-demo.ts artorsiriratpoom@gmail.com --remove   # ลบออก
```

รายการที่เป็น `approved` จะเติมเหรียญเข้าบัญชีด้วย (ผ่าน `CoinLedger` เหมือน `creditTopUp()` ของจริง) เพราะถ้าประวัติโชว์เติมเงินก้อนใหญ่แต่ยอดคงเหลือไม่ขยับ ลูกค้าจะเห็นว่าดูพังทันที — สคริปต์คำนวณ `balanceAfter` ใหม่ตามลำดับเวลาให้ด้วย ยอดในตารางเลยไล่ต่อเนื่องถูกต้อง รันซ้ำได้ไม่เติมซ้ำ (กันด้วย `idempotencyKey`) และ `--remove` จะหักเหรียญคืนให้เท่าที่เติมไป ไม่แตะรายการจริง

**ข้อควรระวัง:** แถวพวกนี้เป็นแค่ fixture สำหรับดูหน้าตา UI บนบัญชีทดสอบ **ไม่ใช่หลักฐานว่าช่องทางนั้นใช้งานได้** โดยเฉพาะ Google Pay กับ Apple Pay ที่ยังไม่เคยชำระเงินสำเร็จจริงสักครั้ง — ทุกแถวมี `idempotencyKey` ขึ้นต้นด้วย `demo-wallet:` / `demo-wallet-credit:` เพื่อให้แยกออกจากรายการจริงได้ทันทีเวลาเช็ค DB

### Phase 3b — Apple Pay: เขียนโค้ดครบแล้ว รอ setup ภายนอกถึงจะทดสอบได้

**บั๊กที่เจอระหว่างทำ (dormant อยู่):** `apple-pay` ถูกจัดอยู่ใน `needsToken` ร่วมกับบัตรเครดิต แปลว่าถ้าเปิดใช้งานเมื่อไหร่ จะโชว์**ฟอร์มกรอกเลขบัตร**ให้ผู้ใช้ ซึ่งผิดสิ้นเชิง — Apple Pay ไม่มีการกรอกบัตร ต้องใช้ `ApplePaySession` เปิด sheet ของ Apple เอง แก้แล้ว

**Apple Pay ต่างจาก Google Pay ตรงไหน (สำคัญ):**
| | Google Pay | Apple Pay |
|---|---|---|
| ทดสอบโดยไม่ต้องลงทะเบียน | ได้ (TEST env) | **ไม่ได้เลย** |
| ทำงานบน localhost | ได้ | **ไม่ได้เลย** |
| ต้องวางไฟล์ยืนยันโดเมน | ไม่ต้อง | ต้อง |
| ใครทำ merchant validation | Google/Omise จัดการ | **เซิร์ฟเวอร์เราต้องทำเอง** |

จุดที่หนักสุดคือ merchant validation — Omise **ไม่ได้**ทำให้ (ยืนยันจาก docs.omise.co/applepay ตรงๆ) เซิร์ฟเวอร์เราต้องถือ Apple Merchant Identity Certificate แล้วยิง mutual-TLS ไปที่ `validationURL` ของ Apple เอง

**สิ่งที่เขียนไปแล้ว:**
- `readlead-backoffice/lib/apple-pay.ts` (ใหม่) — merchant validation ผ่าน mTLS ไปหา Apple พร้อม **กัน SSRF**: `validationURL` มาจากเบราว์เซอร์ (ผู้ใช้ควบคุมได้) และเรากำลังจะยิง request พร้อม client certificate ของเราไปที่นั้น เลยบังคับว่าต้องเป็นโดเมน `*.apple.com` เท่านั้น
- `readlead-backoffice/app/api/auth/member/wallet/applepay/session/route.ts` (ใหม่) — endpoint จำกัดเฉพาะสมาชิกที่ login แล้ว (กันคนนอกมายิงใช้ certificate เรามั่วๆ)
- `readlead-web/app/api/member/wallet/applepay/session/route.ts` (ใหม่) — proxy ตามแพตเทิร์น `forwardBackoffice` เดิม
- `GatewayChargeDialog.tsx` — `ApplePaySession` flow เต็มรูปแบบ (validate merchant → `Omise.createToken('tokenization', {method:'applepay', ...})` → charge), ปุ่ม Apple Pay ทางการ, จับ user cancel แยกจาก error
- env: `NEXT_PUBLIC_APPLE_PAY_MERCHANT_ID` (web), `APPLE_PAY_MERCHANT_ID`/`_CERT`/`_KEY`/`_DISPLAY_NAME` (backoffice)
- `public/.well-known/README.md` — อธิบายว่าไฟล์ยืนยันโดเมนจาก Omise ต้องวางตรงไหน (ไม่ได้ commit ไฟล์จริงเพราะ Omise ออกให้เฉพาะโดเมน)

**ยืนยันแล้ว:** typecheck + lint + `npm run build` ผ่านทั้ง 2 repo, และทดสอบจริงว่า Next.js เสิร์ฟไฟล์จาก `public/.well-known/` ได้ (curl ได้ 200 + เนื้อไฟล์ตรง) — จุดนี้สำคัญเพราะโฟลเดอร์ขึ้นต้นด้วยจุด

**ยังไม่ได้ยืนยันเลย (ทดสอบไม่ได้จนกว่าจะ setup เสร็จ):** ทุกอย่างที่เป็น runtime ของ Apple Pay — ไม่มี Safari, ไม่มีโดเมนจริง, ไม่มี certificate จุดที่เสี่ยงผิดที่สุดคือรูปแบบ `data` ที่ส่งให้ Omise: ผมใช้ `JSON.stringify(token.paymentData)` อ้างอิงจากตัวอย่างใน docs ที่ขึ้นต้นด้วย `{"data":"..."}` ซึ่งตรงกับโครงสร้าง `paymentData` ของ Apple — แต่ docs ไม่ได้เขียนชัด ให้เช็คจุดนี้เป็นอันดับแรกถ้าเจอ error ตอนทดสอบจริง

**⚠️ `apple-pay` ตอนนี้ตั้ง `enabled: true` ไว้ชั่วคราวเพื่อรีวิว UI เท่านั้น — ต้องเปลี่ยนกลับเป็น `false` ก่อน deploy** (ทั้งใน `readlead-backoffice/lib/wallet-channels.ts` และ `FALLBACK_WEB_CHANNELS` ใน `OwnerCreatorWallet.tsx`) เพราะยังชำระเงินจริงไม่ได้จนกว่าจะมี certificate + ไฟล์ยืนยันโดเมนครบ ถ้าปล่อยขึ้น production ผู้ใช้จริงจะเห็นช่องทางที่กดแล้วพัง

### บั๊กที่เจอและแก้แล้ว (รอบ 2): Google Pay ขึ้น "ไม่รองรับ" ตลอด ทั้งที่เครื่องรองรับ

**หมายเหตุสำคัญ:** รอบแรกผมวินิจฉัยผิด ไปสรุปว่าเป็น ad-blocker/เน็ตเวิร์กบล็อก แล้วให้ผู้ใช้เสียเวลาลอง incognito/VPN/เปลี่ยนเน็ต — **ไม่ใช่เลย เป็นบั๊กในโค้ดเราเอง** สิ่งที่ทำให้รู้ว่าวินิจฉัยผิดคือผู้ใช้ยืนยันว่าเปิด `https://pay.google.com/gp/p/js/pay.js` ตรงๆ โหลดขึ้นปกติ

**สาเหตุจริง (ไล่จากโค้ด ไม่ใช่เดา):**
1. `OwnerCreatorWallet.tsx:943` mount `<GatewayChargeDialog>` ตั้งแต่ตอน *เลือก* ช่องทางในกริด ทั้งที่ dialog ยังปิดอยู่ (`open={false}`)
2. `components/ui/dialog.tsx` ใช้ `DialogPortal` ของ base-ui ซึ่ง**ไม่ render children เลยตอนปิด** → `googlePayContainerRef` เป็น `null`
3. effect เดิมยิง `setupGooglePayButton()` ตอน mount → เจอ `if (!client || !container) return` → **ออกเงียบๆ ไม่เคยเรียก `isReadyToPay` เลย**
4. timeout 6 วิที่ผมใส่ไว้รอบก่อนก็เริ่มนับตั้งแต่ตอนนั้น → นับจบตอน dialog ยังปิดอยู่ → ตั้งเป็น `'unavailable'`
5. พอผู้ใช้กดเปิด dialog จริง container ถึงมี — แต่ effect ผูกกับ `[needsGooglePay, stage]` ซึ่งไม่เปลี่ยน → **ไม่มีอะไรรันซ้ำ** ค้างที่ `'unavailable'` ตลอดไป

**จุดที่เกือบพลาดซ้ำ:** ตอนแรกจะแก้แค่เพิ่ม `open` เข้า deps แต่ไปอ่านซอร์ส `FloatingPortal` ของ base-ui แล้วพบว่า children จะ render ก็ต่อเมื่อ `portalNode` (useState เริ่มที่ null) ถูกเซ็ตแล้ว — แปลว่า container mount **ช้ากว่า `open` ไป 1 render** ถ้าแก้แค่ deps จะยังพังเหมือนเดิม

**แก้จริง (ทั้งหมดอยู่ใน `GatewayChargeDialog.tsx`):**
- เปลี่ยน container จาก plain ref เป็น callback ref + state (`attachGooglePayContainer`) แล้วผูก effect กับตัว node เอง — setup จะรันตอน node ติดจริงเท่านั้น ไม่ต้องเดาเรื่อง timing
- เพิ่ม `ensureGooglePayClient()` สร้าง client จาก `window.google` ที่โหลดไว้แล้วได้เอง ไม่ต้องพึ่ง `onLoad` (เพราะ next/script ยิง `onLoad` แค่ครั้งเดียวต่อการโหลดหน้า — ถ้าผู้ใช้สลับช่องทางไปมาจน component remount จะไม่มี `onLoad` รอบสองอีกเลย = บั๊กซ้อนอีกตัว)
- ย้าย `setGooglePayReady('checking')` ขึ้นมาก่อน early return กัน `'unavailable'` ค้างจากรอบก่อน
- timeout 6 วิยังอยู่ (gate ด้วย `open` แล้ว) ไว้รองรับกรณีโดนบล็อกจริงๆ

### บั๊กที่เจอและแก้แล้ว (รอบ 1): กด Google Pay แล้ว popup ว่างเปล่า ไม่มีอะไรให้ทำต่อ

ผู้ใช้ทดสอบจริงแล้วเจอว่ากด "Google Pay" ในกริดช่องทาง แล้ว popup เปิดมาแต่ไม่มีปุ่มหรือข้อความอะไรเลย เช็คแล้วจาก DB (`CoinTopUpRequest` ที่ `paymentMethod = 'google-pay'`) ไม่มีรายการเลยแม้แต่รายการเดียว — ยืนยันว่าปัญหาอยู่ฝั่ง client ล้วนๆ ไม่เคยไปถึง backend เลย

**สาเหตุ:** โค้ดเดิมรอ Google Pay script โหลดเสร็จแล้วค่อยเช็ค `isReadyToPay()` เพื่อตัดสินใจว่าจะโชว์ปุ่มจริงหรือข้อความ "ไม่รองรับ" — แต่ถ้า script โหลดไม่สำเร็จเลย (เช่นโดน ad-blocker/extension บล็อก หรือเน็ตเวิร์กบล็อก `pay.google.com`) โค้ดไม่มี fallback ใดๆ เลย จะค้างว่างเปล่าตลอดไปแบบที่เจอ

**แก้แล้ว:** เพิ่ม timeout 6 วินาที ถ้ายังไม่ได้คำตอบจาก Google ภายในเวลานี้ จะเปลี่ยนไปโชว์ข้อความ "ไม่รองรับ" ให้อัตโนมัติแทนที่จะค้างเงียบ, เพิ่ม `onError` ให้ script tag เพื่อจับกรณีโหลดไม่สำเร็จตรงๆ, และเพิ่ม log ใน console (`console.warn`/`console.info`) ไว้หลายจุดเผื่อครั้งหน้าต้องเปิด DevTools เช็คว่าจริงๆ ค้างเพราะอะไร

**ยังไม่ยืนยัน 100%:** ไม่สามารถ login เข้าบัญชีจริงเพื่อทดสอบซ้ำได้ (ระบบบล็อกการสร้าง session ปลอมไว้ตามที่คุยกันไว้ก่อนหน้า) รอผู้ใช้ทดสอบซ้ำแล้วรายงานผล — ถ้ายังขึ้น "ไม่รองรับ" อยู่ ให้เช็ค DevTools > Network ว่ามีการยิง request ไป `pay.google.com` ไหม (ถ้าไม่มีเลยคือโดนบล็อกฝั่งเบราว์เซอร์ ไม่ใช่บั๊กโค้ด) และเช็คว่าส่งอีเมลขอเปิดใช้งาน Google Pay ที่ `support@omise.co` แล้วหรือยัง (ยังไม่ยืนยันว่าส่งแล้ว — ถ้ายังไม่ส่ง อาจเป็นอีกสาเหตุนึงที่ทำให้ใช้งานไม่ได้เต็มรูปแบบแม้ปุ่มจะขึ้นแล้วก็ตาม)

### บั๊กสำคัญที่เจอและแก้แล้ว: ระบบขึ้น "สำเร็จ" แต่ไม่เติมเหรียญให้จริง

ระหว่างทดสอบพร้อมเพย์แบบกดยืนยันมือใน Omise dashboard พบว่า dialog ขึ้น "ชำระเงินสำเร็จ" ถูกต้อง แต่ยอดเหรียญในบัญชีไม่เพิ่ม — เช็คแล้วพบว่า endpoint poll สถานะ (`GET .../topups/charge/[chargeId]`) ไปดึงสถานะสดจาก Omise มาโชว์ให้ผู้ใช้เห็นตรงๆ แต่**ไม่เคยบันทึกผลหรือเติมเหรียญเข้า DB เลย** — งานเติมเหรียญจะเกิดจาก webhook เท่านั้น ซึ่งบน localhost Omise เรียกเข้ามาไม่ได้ (ไม่มี public URL) เลยค้างอยู่แบบนั้นตลอดไป และแม้ใน production ถ้า webhook มาช้า/หลุดก็จะเกิดปัญหาเดียวกัน

**แก้แล้วที่ `lib/member-topup-charges.ts`:** แยกฟังก์ชันกลาง `settleFromOmiseCharge()` ที่บันทึกสถานะ + เติมเหรียญ (ใช้ตรรกะ idempotent เดิม) ให้ทั้ง webhook handler และ poll endpoint (`refreshedChargeDto`) เรียกใช้ร่วมกัน ตอนนี้ไม่ว่าจะรู้ผลจาก webhook หรือจาก poll ก็เติมเหรียญให้ถูกต้องเสมอ ปลอดภัยจากการเติมซ้ำเพราะยังพึ่ง unique constraint เดิม

ทดสอบแล้วโดยจำลอง webhook เข้า endpoint จริงสำหรับ charge ที่ค้างอยู่ (`chrg_test_68pw39cvb3b9nzoz09b`, 2,400 เหรียญ) → ยืนยันผ่าน DB ว่าสถานะเปลี่ยนเป็น `approved` และยอดเหรียญเข้าบัญชีถูกต้อง

### ยังไม่ได้ทดสอบ (ต้องมีคนกดยืนยันมือใน Omise dashboard เพราะ test mode ไม่มี API จำลองอัตโนมัติ)
- [ ] กรณีบัตรต้องยืนยัน 3DS จนจบ round-trip (เห็นแค่ตอน redirect เริ่มทำงานแล้ว ยังไม่เคยเห็นตอนยืนยันเสร็จแล้วกลับมา poll สำเร็จ/ไม่สำเร็จ)
- [ ] ทรูมันนี่/ShopeePay จนจบ round-trip เหมือนกัน (เห็นแค่ redirect เริ่มทำงานถูกต้องหลังแก้บั๊ก return_uri แล้ว)
- [ ] กรณี QR พร้อมเพย์ถูกจ่ายจริงจนสถานะเปลี่ยนเป็น "สำเร็จ" — เห็น QR ขึ้นแล้ว แต่ยังไม่เคยเห็นตอน poll แล้วเปลี่ยนเป็นสำเร็จจริง
- [ ] กรณี QR หมดเวลา (expired)

วิธีทดสอบ: รันทั้ง 2 server แล้วไปกดปุ่ม Actions > Mark as Successful/Failed ในหน้า Omise dashboard เพื่อดูว่า dialog เปลี่ยนหน้าจอถูกต้องไหม

### ยังไม่ได้ทำเลย (ตามแผน phase ถัดไป)
- [ ] **Phase 3b** — Apple Pay (ต้องมี Apple Merchant ID + domain verification file + certificate ผูกกับ Omise ก่อน ถึงจะเริ่มทำได้)
- [ ] **Phase 4** — Google Play Billing / App Store IAP — มีแค่ endpoint โครงไว้ (`POST /topups/iap/verify`) ยังไม่ได้ implement การตรวจสอบ receipt จริงกับ Google/Apple (ตามที่ตกลงกันไว้ว่ายังไม่ต้องทำตอนนี้ เพราะยังไม่มีแอปมือถือ)
- [ ] ระบบ "บัตรเครดิตที่เชื่อมต่อ" (บันทึกบัตรไว้ใช้ครั้งถัดไป) — ยังเป็นปุ่ม disabled เหมือนเดิม ไม่อยู่ใน scope งานนี้

---

## ไฟล์สำคัญ (อ้างอิงเวลากลับมาทำต่อ)

**readlead-web**
- `components/profile/sections/OwnerCreatorWallet.tsx` — หน้าจอกระเป๋าเงินหลัก
- `components/profile/sections/wallet/GatewayChargeDialog.tsx` — popup ชำระเงินผ่าน gateway
- `contexts/WalletContext.tsx` — logic เรียก API ฝั่ง client
- `lib/types.ts` — type ทั้งหมดที่เกี่ยวกับ payment channel

**readlead-backoffice**
- `lib/wallet-channels.ts` — **จุดเดียวที่ต้องแก้เพื่อเปิด/ปิดช่องทาง**
- `lib/member-topup-charges.ts` — logic เรียก Omise จริง
- `lib/db/coin-topups.ts` — `creditTopUp()` ฟังก์ชันกลางที่เติมเหรียญ (ห้ามมีจุดเติมเหรียญอื่นนอกจากนี้)
- `app/api/webhooks/omise/route.ts` — รับผลจาก Omise
- `prisma/schema.prisma` — schema (มี migration ใหม่แล้ว)
