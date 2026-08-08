'use client'

// ─────────────────────────────────────────────────────────────────────────
// THEME TOGGLE — light ("sunlit monument") ⇄ dark ("temple interior").
// A sun (chakra) / lamp (diya) toggle, curved, with a gentle rotate on switch.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light' : 'Switch to dark'}
      title={isDark ? 'Sunlit monument' : 'Temple interior'}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-border text-[var(--muted-foreground)] transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)] ${className || ''}`}
    >
      <span
        className="transition-transform duration-500"
        style={{ transform: isDark ? 'rotate(0deg)' : 'rotate(360deg)' }}
      >
        {/* render a stable icon before mount to avoid hydration flash */}
        {!mounted ? <Sun size={17} /> : isDark ? <Moon size={17} /> : <Sun size={17} />}
      </span>
    </button>
  )
}
