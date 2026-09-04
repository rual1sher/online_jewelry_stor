import type { ChangeEvent } from 'react'
import { Input } from './input'

export const PHONE_PREFIX = '+998'
export const PHONE_REGEX = /^\+998\d{9}$/

interface PhoneInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

// Код страны +998 зафиксирован и не редактируется — пользователь вводит только
// оставшиеся 9 цифр номера.
export function PhoneInput({ id, value, onChange, disabled }: PhoneInputProps) {
  const digits = value.startsWith(PHONE_PREFIX) ? value.slice(PHONE_PREFIX.length) : ''

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 9)
    onChange(PHONE_PREFIX + cleaned)
  }

  return (
    <div className="flex">
      <span className="flex select-none items-center rounded-l-md border border-r-0 border-line bg-canvas px-3 text-sm text-muted">
        {PHONE_PREFIX}
      </span>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="901234567"
        className="rounded-l-none"
        disabled={disabled}
        value={digits}
        onChange={handleChange}
      />
    </div>
  )
}
