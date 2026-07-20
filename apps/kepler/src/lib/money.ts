/**
 * Parses a rupee amount typed by staff into integer paise.
 *
 * String-based on purpose: `parseFloat("19.99") * 100` is 1998.9999999999998, and
 * relying on Math.round to paper over that invites a rounding bug in real charges.
 * Money never becomes a float here.
 */
export function rupeesToPaise(input: string): { paise: number } | { error: string } {
  const raw = input.trim().replace(/[,\s₹]/g, "");
  if (raw === "") return { error: "Enter an amount" };

  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(raw);
  if (!match) {
    return { error: "Enter a valid amount, e.g. 2500 or 2500.50" };
  }

  const [, whole, frac = ""] = match;
  const paise = Number(whole) * 100 + Number(frac.padEnd(2, "0"));

  if (paise <= 0) return { error: "Amount must be greater than zero" };
  // ICICI allows 9 significant digits before the decimal.
  if (Number(whole) > 999_999_999) return { error: "Amount is too large" };

  return { paise };
}

export function paiseToRupeeString(paise: number): string {
  return (paise / 100).toFixed(2);
}
