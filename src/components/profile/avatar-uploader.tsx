import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { uploadAvatar } from '#/lib/storage'
import { initials } from '#/lib/text'

export function AvatarUploader({
  userId,
  displayName,
  avatarUrl,
  onUploaded,
}: {
  userId: string
  displayName: string
  avatarUrl: string | null
  onUploaded: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError(null)
    setUploading(true)
    try {
      const url = await uploadAvatar(userId, file)
      onUploaded(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a foto.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative"
        disabled={uploading}
      >
        <Avatar size="lg" className="size-24 border-2 border-border">
          <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
          <AvatarFallback className="text-2xl">{initials(displayName)}</AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="size-5 animate-spin text-white" />
          ) : (
            <Camera className="size-5 text-white" />
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleChange}
      />
      <p className="text-xs text-muted-foreground">PNG, JPG ou WebP até 2 MB</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
