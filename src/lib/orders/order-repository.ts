import type { SupabaseClient } from '@supabase/supabase-js'
import { CartItem } from '@/lib/types'

export interface NewOrder {
  phone: string
  customerName: string | null
  customerTelegram: string | null
  items: CartItem[]
}

export interface OrderRepository {
  create(order: NewOrder): Promise<void>
}

export class SupabaseOrderRepository implements OrderRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(order: NewOrder) {
    const { error } = await this.supabase.from('orders').insert([{
      phone: order.phone,
      customer_name: order.customerName,
      customer_telegram: order.customerTelegram,
      items: order.items,
      total: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'new',
    }])
    if (error) throw new Error(error.message)
  }
}
