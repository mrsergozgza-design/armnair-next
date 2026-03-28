export async function getUsdToAmd(): Promise<number> {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await res.json()
    return data.rates.AMD ?? 390
  } catch {
    return 390 // fallback если API недоступен
  }
}
