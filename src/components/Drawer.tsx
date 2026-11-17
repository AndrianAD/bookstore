'use client'

import { useEffect, useRef } from 'react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  side: 'left' | 'right'
  label: string
  /** Width classes for the panel, e.g. `w-full sm:w-[440px]`. */
  className?: string
  children: React.ReactNode
}

const SIDE_CLASSES = {
  left:  { anchor: 'left-0',  hidden: '-translate-x-full' },
  right: { anchor: 'right-0', hidden: 'translate-x-full' },
}

export default function Drawer({ open, onClose, side, label, className = '', children }: DrawerProps) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current()
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const { anchor, hidden } = SIDE_CLASSES[side]

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* A closed panel sits just off-screen; clipping it here keeps it from widening the page on phones. */}
      <div className="fixed inset-0 z-[70] overflow-hidden pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          aria-hidden={!open}
          className={`absolute top-0 ${anchor} bg-white shadow-2xl flex flex-col pointer-events-auto transition-transform duration-300 ease-out ${
            open ? 'translate-x-0' : hidden
          } ${className}`}
          style={{ height: '100dvh' }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
