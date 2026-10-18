export type BudgetPaymentStatus = "belum_bayar" | "dp" | "lunas";
export type LinkedBudgetModule = "seserahan" | "souvenir";

interface PaymentAmounts {
  dp?: number | null;
  realisasi?: number | null;
  estimasi?: number | null;
}

// Realisasi is the cumulative payment, including DP. Legacy DP-only records
// still count as paid, and a DP already included in realisasi is never added twice.
export function getBudgetPaid(item: PaymentAmounts): number {
  return Math.max(0, Number(item.dp) || 0, Number(item.realisasi) || 0);
}

export function getBudgetStatus(item: PaymentAmounts): BudgetPaymentStatus {
  const paid = getBudgetPaid(item);
  if (paid > 0 && Number(item.estimasi) > 0 && paid >= Number(item.estimasi)) {
    return "lunas";
  }
  return paid > 0 ? "dp" : "belum_bayar";
}

export function normalizeBudgetCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function getLinkedBudgetModule(name: string): LinkedBudgetModule | null {
  const normalized = normalizeBudgetCategoryName(name);
  return normalized === "seserahan" || normalized === "souvenir"
    ? normalized
    : null;
}

// Existing duplicates remain editable categories. Only one stable ID per
// canonical module receives its automatic summary, so module costs count once.
export function getLinkedBudgetCategoryIds(
  categories: { id: string; nama: string }[]
): Partial<Record<LinkedBudgetModule, string>> {
  const ids: Partial<Record<LinkedBudgetModule, string>> = {};
  for (const category of categories) {
    const linkedModule = getLinkedBudgetModule(category.nama);
    if (linkedModule && (!ids[linkedModule] || category.id < ids[linkedModule]!)) {
      ids[linkedModule] = category.id;
    }
  }
  return ids;
}
