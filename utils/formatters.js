/**
 * Format a number as currency with commas
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatMoney(amount) {
  // Format with commas and no decimal places
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}
