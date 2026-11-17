export type Currency = 'EUR' | 'UAH'

export const DEFAULT_CURRENCY: Currency = 'EUR'

export const CURRENCIES: Record<Currency, { symbol: string }> = {
  EUR: { symbol: '€' },
  UAH: { symbol: '₴' },
}

export const CURRENCY_CODES = Object.keys(CURRENCIES) as Currency[]

export interface PricedLine {
  price: number
  quantity: number
  /** Missing on carts and orders saved before books had a currency. */
  currency?: Currency | null
}

export function currencySymbol(currency?: Currency | null) {
  return CURRENCIES[currency ?? DEFAULT_CURRENCY]?.symbol ?? CURRENCIES[DEFAULT_CURRENCY].symbol
}

export function formatAmount(amount: number) {
  return amount.toLocaleString('ru-RU')
}

export function formatPrice(amount: number, currency?: Currency | null) {
  return `${formatAmount(amount)} ${currencySymbol(currency)}`
}

export function lineTotal(line: PricedLine) {
  return formatPrice(line.price * line.quantity, line.currency)
}

/** Sums lines per currency, since amounts in different currencies cannot be added up. */
export function formatTotals(lines: PricedLine[]) {
  const totals = new Map<Currency, number>()
  for (const line of lines) {
    const currency = line.currency ?? DEFAULT_CURRENCY
    totals.set(currency, (totals.get(currency) ?? 0) + line.price * line.quantity)
  }
  if (totals.size === 0) return formatPrice(0)
  return Array.from(totals, ([currency, amount]) => formatPrice(amount, currency)).join(' + ')
}
