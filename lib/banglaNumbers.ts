/**
 * Bangla (Bengali) numeral conversion for display.
 * Maps 0-9 to ০১২৩৪৫৬৭৮৯.
 */

const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Convert a number to Bangla digits (e.g. 1000 → "১,০০০"). Optionally append a suffix like "+". */
export function toBanglaDigits(
  n: number,
  options?: { suffix?: string; useCommas?: boolean }
): string {
  const useCommas = options?.useCommas !== false;
  const suffix = options?.suffix ?? "";
  const s = Math.floor(n).toString();
  const withCommas = useCommas
    ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : s;
  const bangla = withCommas.replace(/\d/g, (d) => BANGLA_DIGITS[Number(d)]);
  return bangla + suffix;
}

/** Format a count for display with Bangla digits and optional "+" (e.g. "১,০০০+"). */
export function formatBanglaCount(n: number, withPlus = true): string {
  return toBanglaDigits(n, { suffix: withPlus ? "+" : "", useCommas: true });
}
