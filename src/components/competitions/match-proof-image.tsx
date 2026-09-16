import { useEffect, useState } from 'react'
import { getMatchProofUrl } from '#/lib/storage'
import { Skeleton } from '#/components/ui/skeleton'

export function MatchProofImage({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getMatchProofUrl(path).then((signedUrl) => {
      if (!cancelled) setUrl(signedUrl)
    })
    return () => {
      cancelled = true
    }
  }, [path])

  if (!url) return <Skeleton className="h-40 w-full rounded-lg" />
  return <img src={url} alt="Print do resultado" className="w-full rounded-lg border border-border object-cover" />
}
