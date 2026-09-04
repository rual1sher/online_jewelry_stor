import { Loader2, Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import { useRef } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/api/client";
import { useUploadImage } from "@/api/uploads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export function ImageUploadField({
  value,
  onChange,
  placeholder = "https://…",
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadImage();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const result = await uploadImage.mutateAsync(file);
      onChange(result.url);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Не удалось загрузить файл"));
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="secondary"
        disabled={uploadImage.isPending}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploadImage.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
      </Button>
    </div>
  );
}
