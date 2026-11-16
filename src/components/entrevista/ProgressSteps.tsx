import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressStepsProps {
  step: number // 1..4
  labels: [string, string, string, string]
  onStepClick?: (step: number) => void
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ step, labels, onStepClick }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
      <ol className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
        {labels.map((label, i) => {
          const n = i + 1
          const isCurrent = n === step
          const isDone = n < step
          const clickable = !!onStepClick && n < step
          return (
            <li key={n} className="flex items-center gap-2.5 flex-1 min-w-0">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(n)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-1 py-1 min-w-0 text-left',
                  clickable && 'hover:bg-gray-50 cursor-pointer',
                )}
              >
                <span
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 border-2 transition-colors',
                    isCurrent && 'bg-[#C9A24B] border-[#C9A24B] text-[#0F2A44]',
                    isDone && 'bg-[#0F2A44] border-[#0F2A44] text-[#C9A24B]',
                    !isCurrent && !isDone && 'bg-white border-gray-300 text-gray-400',
                  )}
                >
                  {n}
                </span>
                <span
                  className={cn(
                    'text-xs sm:text-sm font-bold truncate',
                    isCurrent && 'text-[#C9A24B]',
                    isDone && 'text-[#0F2A44]',
                    !isCurrent && !isDone && 'text-gray-400',
                  )}
                >
                  {label}
                </span>
              </button>
              {n < 4 && (
                <span
                  className={cn(
                    'hidden sm:block h-0.5 flex-1 rounded-full',
                    n < step ? 'bg-[#0F2A44]' : 'bg-gray-200',
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
