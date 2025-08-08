import { TransactionType } from "@/constants/transactionType";
import type { Database } from "@/integrations/supabase/types";

// Types representing the shape of transactions and categories used in the calculation
export type TransactionRow =
  Database["public"]["Tables"]["transactions_installments"]["Row"] & {
    sub_transactions?: Database["public"]["Tables"]["transactions_sub"]["Row"][];
  };

export type Category = Database["public"]["Tables"]["category"]["Row"] & {
  sub_categories?: Database["public"]["Tables"]["sub_category"]["Row"][];
};

/**
 * Calculates total expense values grouped by parent category.
 * Negative amounts reduce the category total, ensuring real totals.
 * Transactions without category information are grouped under "Outros".
 */
export function calculateCategoryTotals(
  transactions: TransactionRow[],
  categories: Category[]
): Record<string, number> {
  const categoryMap = new Map<string, string>();
  const subCategoryMap = new Map<string, string>();

  categories.forEach((cat) => {
    categoryMap.set(cat.id, cat.name);
    cat.sub_categories?.forEach((sub) => {
      subCategoryMap.set(sub.id, cat.name);
    });
  });

  return transactions.reduce<Record<string, number>>((acc, transaction) => {
    // Only consider expense transactions for category totals
    if (Number(transaction.transaction_type_id) !== TransactionType.EXPENSE) {
      return acc;
    }

    if (transaction.sub_transactions?.length) {
      transaction.sub_transactions.forEach((st) => {
        let categoryName = "Outros";

        if (st.category_id && categoryMap.has(st.category_id)) {
          categoryName = categoryMap.get(st.category_id)!;
        } else if (
          st.sub_category_id &&
          subCategoryMap.has(st.sub_category_id)
        ) {
          categoryName = subCategoryMap.get(st.sub_category_id)!;
        }

        const value = Number(st.value) || 0;

        acc[categoryName] = (acc[categoryName] || 0) + value;
      });
    } else {
      const value = Number(transaction.value) || 0;
      acc["Outros"] = (acc["Outros"] || 0) + value;
    }

    return acc;
  }, {});
}
