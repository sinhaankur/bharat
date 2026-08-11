'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Privacy analytics (GoatCounter — visits + visitor countries, cookieless) + AdSense
// loader for the app, mirroring the classic analytics.js/ads.js. Both are INERT until
// their placeholder IDs are set, so this is safe to ship now.
//
// TO ENABLE:
//   GoatCounter: set GC_CODE to your goatcounter site code.
//   AdSense:     set ADS_CLIENT to your ca-pub-… id (site must be AdSense-approved).
const GC_CODE = 'YOUR_GOATCOUNTER_CODE'
const ADS_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'

export default function Analytics() {
  const pathname = usePathname()

  // AdSense loader (once)
  useEffect(() => {
    if (!ADS_CLIENT || ADS_CLIENT.includes('XXXX')) return
    if (document.getElementById('adsense-lib')) return
    const s = document.createElement('script')
    s.id = 'adsense-lib'
    s.async = true
    s.crossOrigin = 'anonymous'
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADS_CLIENT
    document.head.appendChild(s)
  }, [])

  // GoatCounter loader (once) + count a pageview on client route changes
  useEffect(() => {
    if (!GC_CODE || GC_CODE === 'YOUR_GOATCOUNTER_CODE') return
    const w = window as unknown as { goatcounter?: { count?: (o: { path: string }) => void; no_onload?: boolean } }
    if (!document.getElementById('goatcounter-lib')) {
      w.goatcounter = { no_onload: false }
      const s = document.createElement('script')
      s.id = 'goatcounter-lib'
      s.async = true
      s.setAttribute('data-goatcounter', `https://${GC_CODE}.goatcounter.com/count`)
      s.src = 'https://gc.zgo.at/count.js'
      document.head.appendChild(s)
    } else if (w.goatcounter?.count) {
      w.goatcounter.count({ path: pathname || location.pathname })
    }
  }, [pathname])

  return null
}
