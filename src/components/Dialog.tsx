'use client'

import { useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n/client'

interface DialogProps {
  onClose: () => void
  title?: string
  /** Width class for the panel on larger screens. */
  size?: 'sm' | 'lg'
  children: React.ReactNode
}

const SIZES = { sm: 'sm:max-w-sm', lg: 'sm:max-w-2xl' }

/** A bottom sheet on phones and a centered dialog from `sm` up. Render it only while open. */
export default function Dialog({ onClose, title, size = 'lg', children }: DialogProps) {
  const { t } = useI18n()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current()
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${SIZES[size]} max-h-[92dvh] flex flex-col bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up`}
      >
        {title && (
          <div className="flex items-center justify-between gap-3 px-5 h-14 border-b border-gray-100 shrink-0">
            <h2 className="text-base font-semibold text-gray-900 truncate">{title}</h2>
            <button
              onClick={onClose}
              aria-label={t.common.close}
              className="w-9 h-9 -mr-2 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="overflow-y-auto min-h-0 pb-[env(safe-area-inset-bottom)]">{children}</div>
      </div>
    </div>
  )
}
