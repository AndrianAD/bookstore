/** Ukrainian and Russian share one plural rule: "one" for 1, 21…; "few" for 2–4, 22–24…; "many" otherwise. */
export function slavicPlural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function englishPlural(n: number, one: string, other: string) {
  return n === 1 ? one : other
}
