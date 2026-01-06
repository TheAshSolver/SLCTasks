export function fCurrency(amount = 0, currency = "INR") {
  return Intl.NumberFormat("en-IN", { style: "currency", currency }).format(
    amount,
  );
}
