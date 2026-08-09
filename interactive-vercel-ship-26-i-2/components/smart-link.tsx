import Link from 'next/link'
import type { AnchorHTMLAttributes } from 'react'

// SmartLink — one link component that does the right thing for every href on the
// site. The app is deployed under a basePath (/bharat/app), so app-internal
// routes MUST go through next/link to get the prefix. Everything else — the
// classic atlas .html pages (which live one level up at /bharat/…), same-page
// hashes, and off-site URLs — is already an absolute/complete href and must stay
// a plain <a> so Next does NOT prepend the basePath to it.
//
// Rule of thumb:
//   /atlas, /map, /p/heritage   → <Link>  (internal route, needs basePath)
//   /heritage-atlas.html, https://…, mailto:, #section → <a> (as-is)
export default function SmartLink({
  href,
  children,
  ...rest
}: { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternalRoute =
    href.startsWith('/') &&
    !href.startsWith('//') &&
    !href.includes('.html') &&
    !href.startsWith('/legacy/')

  if (isInternalRoute) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}
