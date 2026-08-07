/** Client-safe invoicing constants. Route components may import these. */

export const INVOICE_STATUSES = ["draft", "issued", "part_paid", "paid", "void"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  part_paid: "Part paid",
  paid: "Paid",
  void: "Void",
};

export const PAYMENT_METHODS = ["bank_transfer", "card", "cash", "cheque", "credit", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: "Bank transfer",
  card: "Card",
  cash: "Cash",
  cheque: "Cheque",
  credit: "Credit note",
  other: "Other",
};

/** Statuses that still owe money — what "outstanding" means everywhere. */
export const OPEN_INVOICE_STATUSES: InvoiceStatus[] = ["issued", "part_paid"];

/**
 * Line arithmetic, in one place so the draft builder, the totals shown in the
 * admin and the PDF can never disagree. The database recomputes the invoice
 * totals from these figures, so this is the only place rounding happens.
 */
export function calculateLine(input: {
  quantity: number;
  unitPricePence: number;
  vatRateBps: number;
  pricesIncludeVat: boolean;
}) {
  const { quantity, unitPricePence, vatRateBps, pricesIncludeVat } = input;
  const extended = Math.round(unitPricePence * quantity);

  if (!vatRateBps) return { netPence: extended, vatPence: 0, grossPence: extended };

  if (pricesIncludeVat) {
    // The quoted price is the gross; back the tax out of it.
    const net = Math.round(extended / (1 + vatRateBps / 10000));
    return { netPence: net, vatPence: extended - net, grossPence: extended };
  }

  const vat = Math.round(extended * (vatRateBps / 10000));
  return { netPence: extended, vatPence: vat, grossPence: extended + vat };
}

/** Days until due — negative once overdue. */
export function daysUntil(due: string | null) {
  if (!due) return null;
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${due}T00:00:00`).getTime() - midnight.getTime()) / 86_400_000);
}

export function isOverdue(status: string, due: string | null) {
  if (!OPEN_INVOICE_STATUSES.includes(status as InvoiceStatus)) return false;
  const days = daysUntil(due);
  return days !== null && days < 0;
}
