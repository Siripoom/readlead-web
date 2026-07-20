import type { SVGProps } from 'react'

type SocialProviderIconProps = SVGProps<SVGSVGElement>

export function GoogleIcon({ className = 'h-5 w-5', ...props }: SocialProviderIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" {...props}>
      <path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.2c1.9-1.8 3.1-4.4 3.1-7.6Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.3l-3.2-2.6c-.9.6-2 1-3.5 1a5.9 5.9 0 0 1-5.5-4.1H3.2v2.7A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.2a10 10 0 0 0 0 9.3L6.5 14Z" />
      <path fill="#EA4335" d="M12 6.1c1.6 0 3 .5 4.1 1.6l3-3A10 10 0 0 0 3.2 7.4l3.3 2.7A5.9 5.9 0 0 1 12 6.1Z" />
    </svg>
  )
}

export function FacebookIcon({ className = 'h-5 w-5', ...props }: SocialProviderIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" {...props}>
      <circle cx="12" cy="12" r="11" fill="white" />
      <path fill="#1877F2" d="M13.5 20v-7h2.4l.4-2.8h-2.8V8.4c0-.8.2-1.4 1.4-1.4h1.5V4.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8V13h2.5v7h3Z" />
    </svg>
  )
}

export function AppleIcon({ className = 'h-5 w-5', ...props }: SocialProviderIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" {...props}>
      <path fill="currentColor" d="M17.1 12.5c0-2.5 2-3.7 2.1-3.8a4.5 4.5 0 0 0-3.5-1.9c-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.1-.9a4.7 4.7 0 0 0-4 2.4c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3.1 2.4 1.2-.1 1.7-.8 3.2-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4a10.7 10.7 0 0 0 1.4-2.9 4.2 4.2 0 0 1-3-3.6ZM14.7 5.2A4.3 4.3 0 0 0 15.8 2a4.5 4.5 0 0 0-3 1.5 4.1 4.1 0 0 0-1.1 3.1 3.7 3.7 0 0 0 3-1.4Z" />
    </svg>
  )
}
