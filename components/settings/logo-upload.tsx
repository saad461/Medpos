'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface LogoUploadProps {
  currentLogoUrl?: string | null
  storeName: string
}

export function LogoUpload({ currentLogoUrl, storeName }: LogoUploadProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Only PNG, JPG, and WebP images are allowed.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB.')
      return
    }

    // Preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/settings/logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      toast.success('Logo uploaded!')
      router.refresh()
    } catch (_error) {
      toast.error('Failed to upload logo.')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove the logo?')) return

    setIsUploading(true)
    try {
      const response = await fetch('/api/settings/logo', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Remove failed')
      }

      toast.success('Logo removed!')
      setPreviewUrl(null)
      router.refresh()
    } catch (_error) {
      toast.error('Failed to remove logo.')
    } finally {
      setIsUploading(false)
    }
  }

  const displayUrl = previewUrl || currentLogoUrl

  return (
    <Card className="border-dashed">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          {displayUrl ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-lg border bg-muted">
                <img
                  src={displayUrl}
                  alt="Store Logo"
                  className="h-full w-full object-contain"
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{storeName}</p>
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={isUploading}
                  >
                    Change Logo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={handleRemove}
                    disabled={isUploading}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Upload Store Logo</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 2MB • Recommended: 200×200px
                </p>
              </div>
              <Button variant="outline" size="sm" className="mt-2" disabled={isUploading}>
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload Logo
              </Button>
            </div>
          )}
          <input
            id="logo-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}
