'use client'

import { useEffect, useState, useCallback } from 'react'
import { Book, CartItem } from './types'

const STORAGE_KEY = 'bookstore-cart'
const EVENT_NAME = 'bookstore-cart-changed'

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setItems(readCart())
    setMounted(true)

    const sync = () => setItems(readCart())
    window.addEventListener(EVENT_NAME, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT_NAME, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const add = useCallback((book: Book) => {
    const current = readCart()
    const existing = current.find((i) => i.id === book.id)
    const updated = existing
      ? current.map((i) => i.id === book.id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...current, {
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          image_url: book.image_url,
          quantity: 1,
        }]
    writeCart(updated)
  }, [])

  const remove = useCallback((id: string) => {
    writeCart(readCart().filter((i) => i.id !== id))
  }, [])

  const setQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      writeCart(readCart().filter((i) => i.id !== id))
      return
    }
    writeCart(readCart().map((i) => i.id === id ? { ...i, quantity } : i))
  }, [])

  const clear = useCallback(() => writeCart([]), [])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return { items, add, remove, setQuantity, clear, total, count, mounted }
}
