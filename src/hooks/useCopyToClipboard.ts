import { useCallback, useEffect, useRef, useState } from 'react'

export function useCopyToClipboard(resetAfterMs = 1500) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        window.clearTimeout(timerRef.current)
        timerRef.current = window.setTimeout(
          () => setCopied(false),
          resetAfterMs
        )
        return true
      } catch {
        return false
      }
    },
    [resetAfterMs]
  )

  return { copied, copy }
}
