This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Firebase social sign-in setup

1. Create a Firebase project and Web app in the [Firebase console](https://console.firebase.google.com/).
2. In **Authentication → Sign-in method**, enable Google. Add `localhost` and every deployed web hostname under **Authentication → Settings → Authorized domains**.
3. Copy the Web app values into this project's `.env.local` using the `NEXT_PUBLIC_FIREBASE_*` names in `.env.example`.
4. In **Project settings → Service accounts**, create a private key. Add its project ID, client email, and private key to `readlead-backoffice/.env` using the `FIREBASE_*` names in that project's `.env.example`. Keep the private key quoted when it contains `\n` escapes.
5. To enable Facebook, use the existing Meta App ID and App Secret in Firebase **Authentication → Sign-in method → Facebook**. In the Meta App's Facebook Login settings, add `https://readlead-272f7.firebaseapp.com/__/auth/handler` to **Valid OAuth Redirect URIs**. Request the `email` permission and configure the production app mode, app domains, privacy-policy URL, and deployed HTTPS domain before release.
6. To enable Apple:
   - Create a Primary App ID with Bundle ID `th.co.readlead.app` and enable **Sign in with Apple**.
   - Create Services ID `th.co.readlead.web`, associate it with the Primary App ID, add domain `readlead.co.th`, and add return URL `https://readlead-272f7.firebaseapp.com/__/auth/handler`.
   - Create a Sign in with Apple key. In Firebase **Authentication → Sign-in method → Apple**, enter the Services ID, Team ID, Key ID, and the downloaded `.p8` private key.
   - Never add the Apple private key to this repository. If Firebase will send email to Apple private-relay addresses, register `noreply@readlead-272f7.firebaseapp.com` with Apple's private email relay service.
7. Apply the backoffice database migrations before starting the apps:

```bash
cd ../readlead-backoffice
npx prisma migrate deploy
```

Firebase credentials and service-account JSON files must not be committed.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
