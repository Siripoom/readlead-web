# .well-known

## Apple Pay domain association

Apple Pay on the web only works once Apple can verify this domain. To enable it:

1. Email `support@omise.co` asking to enable Apple Pay, and list every domain
   that will show the Apple Pay button (top-level domains and subdomains are
   registered separately, e.g. `readlead.co.th` and `www.readlead.co.th`).
2. Omise replies with a domain association file.
3. Save it in this directory as **`apple-developer-merchantid-domain-association`**
   — no file extension. It then serves at
   `https://<domain>/.well-known/apple-developer-merchantid-domain-association`,
   which is exactly where Apple looks.
4. Confirm it is reachable over HTTPS with no redirect or proxy in front of it
   (`curl -sI https://<domain>/.well-known/apple-developer-merchantid-domain-association`
   must return `200`, not `301`/`302`). Apple fetches this directly and a
   redirect fails verification.

The file is intentionally not committed here: it is issued per-domain by
Omise/Apple, so it has to come from them rather than being generated.

Related config: `NEXT_PUBLIC_APPLE_PAY_MERCHANT_ID` in this repo, and
`APPLE_PAY_MERCHANT_ID` / `APPLE_PAY_MERCHANT_CERT` / `APPLE_PAY_MERCHANT_KEY`
in `readlead-backoffice` (used by `lib/apple-pay.ts` for merchant validation).
