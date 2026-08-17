export const DEFAULT_CURRENCY = "GBP (£)";
export const CURRENCY_SYMBOL = "£";

export function formatPrice(amount, symbol = CURRENCY_SYMBOL) {
  const numericAmount = typeof amount === "number" ? amount : parseFloat(amount) || 0;
  return `${symbol}${numericAmount.toFixed(2)}`;
}
