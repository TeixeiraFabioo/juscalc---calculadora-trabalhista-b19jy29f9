import React from 'react'
import { cn } from '@/lib/utils'

interface FieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: string
  error?: string
  className?: string
  children: React.ReactNode
}

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}) => (
  <div className={cn('space-y-1.5', className)}>
    <label htmlFor={htmlFor} className="block text-xs font-bold text-[#0F2A44]">
      {label}
      {required && <span className="text-[#C9A24B]"> *</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
    {error && (
      <p className="text-[11px] font-semibold text-red-600" role="alert">
        {error}
      </p>
    )}
  </div>
)

const inputBase =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-[#0F2A44] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/50 focus:border-[#C9A24B] disabled:bg-gray-100 disabled:text-gray-400'

export const TextInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { error?: string }
> = ({ className, error, ...props }) => (
  <input
    {...props}
    className={cn(inputBase, error ? 'border-red-400' : 'border-gray-300', className)}
  />
)

export const SelectInput: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }
> = ({ className, error, children, ...props }) => (
  <select
    {...props}
    className={cn(inputBase, error ? 'border-red-400' : 'border-gray-300', className)}
  >
    {children}
  </select>
)

interface RadioOption {
  value: string
  label: string
}

export const RadioGroup: React.FC<{
  name: string
  value: string
  options: RadioOption[]
  onChange: (value: string) => void
  error?: string
}> = ({ name, value, options, onChange, error }) => (
  <div className="space-y-1.5" role="radiogroup">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition-colors',
            value === opt.value
              ? 'border-[#C9A24B] bg-[#C9A24B]/10 text-[#0F2A44] font-semibold'
              : 'border-gray-300 bg-white text-[#5A6E82] hover:border-gray-400',
          )}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="accent-[#C9A24B] w-4 h-4"
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
    {error && (
      <p className="text-[11px] font-semibold text-red-600" role="alert">
        {error}
      </p>
    )}
  </div>
)

export const Checkbox: React.FC<{
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}> = ({ label, checked, onChange }) => (
  <label className="flex items-start gap-2.5 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-[#0F2A44] cursor-pointer hover:border-gray-400 transition-colors">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="accent-[#C9A24B] w-4 h-4 mt-0.5 flex-shrink-0"
    />
    <span>{label}</span>
  </label>
)
