export enum TransactionType {
  INCOME = 1,
  EXPENSE = 2,
  TRANSFER = 3,
}

export const TRANSACTION_TYPE_FROM_FORM: Record<"income" | "expense" | "transfer", TransactionType> = {
  income: TransactionType.INCOME,
  expense: TransactionType.EXPENSE,
  transfer: TransactionType.TRANSFER,
};

export const TRANSACTION_TYPE_TO_FORM: Record<TransactionType, "income" | "expense" | "transfer"> = {
  [TransactionType.INCOME]: "income",
  [TransactionType.EXPENSE]: "expense",
  [TransactionType.TRANSFER]: "transfer",
};
