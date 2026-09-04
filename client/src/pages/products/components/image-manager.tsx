import { Loader2, Plus, Upload, X } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/api/client'
import { useAddImage, useRemoveImage } from '@/api/products'
import { useUploadImage } from '@/api/uploads'
import type { ProductImage } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ImageManager({
  productId,
  images,
}: {
  productId: string
  images: ProductImage[]
}) {
  const [url, setUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addImage = useAddImage(productId)
  const removeImage = useRemoveImage(productId)
  const uploadImage = useUploadImage()

  const handleAdd = async () => {
    if (!url.trim()) return
    try {
      await addImage.mutateAsync({ url: url.trim(), sortOrder: images.length })
      setUrl('')
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось добавить изображение'))
    }
  }

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const uploaded = await uploadImage.mutateAsync(file)
      await addImage.mutateAsync({ url: uploaded.url, sortOrder: images.length })
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось загрузить изображение'))
    }
  }

  const handleRemove = async (imageId: string) => {
    try {
      await removeImage.mutateAsync(imageId)
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось удалить изображение'))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {images.map((image) => (
          <div key={image.id} className="group relative size-20 overflow-hidden rounded bg-canvas">
            <img src={image.url} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(image.id)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        {images.length === 0 ? (
          <div className="flex size-20 items-center justify-center rounded bg-canvas text-[11px] text-muted">
            Нет фото
          </div>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Ссылка на изображение"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button type="button" variant="secondary" onClick={handleAdd} disabled={addImage.isPending}>
          <Plus className="size-4" /> Добавить
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={uploadImage.isPending || addImage.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadImage.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Загрузить
        </Button>
      </div>
    </div>
  )
}
