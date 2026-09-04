import type { ChangeEvent } from 'react'
import { formatNumber } from '@/lib/format'
import { Input } from './input'

interface MoneyInputProps {
  id?: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

// Показывает сумму с разделителями разрядов по мере ввода (120 000, а не 120000).
// Хранится как обычное целое число сумов — форматирование только для отображения.
export function MoneyInput({ id, value, onChange, placeholder, disabled, className }: MoneyInputProps) {
  const display = value ? formatNumber(value) : ''

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '')
    onChange(digitsOnly === '' ? 0 : Number(digitsOnly))
  }

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      value={display}
      onChange={handleChange}
    />
  )
}
