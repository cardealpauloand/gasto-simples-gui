import { useState } from "react";
import { Plus, Minus, ArrowRightLeft, User } from "lucide-react";
import HamburgerMenu from "@/components/HamburgerMenu";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FinancialChart } from "@/components/FinancialChart";
import { TransactionList } from "@/components/TransactionList";
import { AccountBalance } from "@/components/AccountBalance";
import { TransactionDialog } from "@/components/TransactionDialog";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { AccountsProvider } from "@/contexts/AccountsContext";
import { accountsService } from "@/services/accounts";
import {
  TransactionType,
  TRANSACTION_TYPE_FROM_FORM,
  TRANSACTION_TYPE_TO_FORM,
} from "@/constants/transactionType";

interface TransactionFormValues {
  description: string;
  account?: string;
  accountOut?: string;
  date: string;
  value: string;
  tags?: string[];
  accountId?: string;
  accountOutId?: string;
  type: "income" | "expense" | "transfer";
  installments?: number;
  subTransactions?: {
    value: string;
    categoryId?: string;
    subCategoryId?: string;
  }[];
}

interface FormattedTransaction {
  id: string;
  transactionId: string;
  name: string;
  bank: string;
  categories: string[];
  value: number;
  type: "income" | "expense" | "transfer";
  date: string;
}

type TransactionRow =
  Database["public"]["Tables"]["transactions_installments"]["Row"] & {
    account?: { name: string } | null;
    account_out?: { name: string } | null;
    sub_transactions?: Database["public"]["Tables"]["transactions_sub"]["Row"][];
  };

type TransactionDialogFormData = {
  description: string;
  accountId: string;
  accountOutId?: string;
  date: string;
  value: string;
  tags: string[];
  subTransactions: {
    value: string;
    categoryId?: string;
    subCategoryId?: string;
  }[];
};

const Index = () => {
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionRow | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    transactions,
    accounts,
    transactionTypes,
    categories,
    loading,
    createTransaction,
    deleteTransaction,
    updateTransaction,
    refetch,
  } = useTransactions();

  const investmentData = [
    { month: "Jan", acoes: 5000, rendaFixa: 3000, outros: 1000 },
    { month: "Fev", acoes: 5200, rendaFixa: 3100, outros: 1100 },
    { month: "Mar", acoes: 4800, rendaFixa: 3200, outros: 1050 },
    { month: "Abr", acoes: 5500, rendaFixa: 3300, outros: 1200 },
    { month: "Mai", acoes: 5800, rendaFixa: 3400, outros: 1150 },
    { month: "Jun", acoes: 6100, rendaFixa: 3500, outros: 1300 },
  ];

  // Formatação das transações para o componente TransactionList
  const formattedTransactions: FormattedTransaction[] = transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((transaction) => {
      const categoryNames = (() => {
        if (transaction.sub_transactions?.length) {
          const names = transaction.sub_transactions.map((st) => {
            if (st.category_id) {
              return (
                categories.find((c) => c.id === st.category_id)?.name ||
                "Outros"
              );
            }
            if (st.sub_category_id) {
              return (
                categories.find((c) =>
                  c.sub_categories?.some((sc) => sc.id === st.sub_category_id)
                )?.name || "Outros"
              );
            }
            return "Outros";
          });
          return Array.from(new Set(names));
        }
        return ["Outros"];
      })();

      const typeId = Number(transaction.transaction_type_id) as TransactionType;
      return {
        id: transaction.id,
        transactionId: transaction.transaction_id,
        name: transaction.description || "Sem descrição",
        bank:
          typeId === TransactionType.INCOME
            ? transaction.account?.name || "N/A"
            : typeId === TransactionType.TRANSFER
            ? `${transaction.account_out?.name || "N/A"} → ${
                transaction.account?.name || "N/A"
              }`
            : transaction.account_out?.name || "N/A",
        categories: categoryNames,
        value:
          typeId === TransactionType.EXPENSE ||
          typeId === TransactionType.TRANSFER
            ? -transaction.value
            : transaction.value,
        type: TRANSACTION_TYPE_TO_FORM[typeId],
        date: new Date(transaction.date).toLocaleDateString("pt-BR"),
      };
    });

  const expenseTotals = transactions.reduce<Record<string, number>>(
    (acc, transaction) => {
      if (Number(transaction.transaction_type_id) !== TransactionType.EXPENSE)
        return acc;
      if (transaction.sub_transactions?.length) {
        transaction.sub_transactions.forEach((st) => {
          const categoryName = st.category_id
            ? categories.find((c) => c.id === st.category_id)?.name || "Outros"
            : categories.find((c) =>
                c.sub_categories?.some((sc) => sc.id === st.sub_category_id)
              )?.name || "Outros";
          const value = Number(st.value) || 0;
          acc[categoryName] = (acc[categoryName] || 0) + value;
        });
      } else {
        const value = Number(transaction.value) || 0;
        acc["Outros"] = (acc["Outros"] || 0) + value;
      }
      return acc;
    },
    {}
  );

  const categoryData = Object.entries(expenseTotals).map(
    ([name, value], index) => ({
      name,
      value,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    })
  );

  // Calcula o resultado das transações por conta
  const accountTotals = transactions.reduce<Record<string, number>>(
    (acc, transaction) => {
      const value = transaction.value || 0;

      if (transaction.account_out_id) {
        acc[transaction.account_out_id] =
          (acc[transaction.account_out_id] || 0) - value;
      }

      if (transaction.account_id) {
        acc[transaction.account_id] =
          (acc[transaction.account_id] || 0) + value;
      }

      return acc;
    },
    {}
  );

  // Formatação das contas para o componente AccountBalance
  const formattedAccounts = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    balance: (account.initial_value || 0) + (accountTotals[account.id] || 0),
    type: account.account_group?.name || "Conta",
  }));

  type TransactionSubmitData = {
    description: string;
    value: string;
    accountId: string;
    accountOutId?: string;
    type: "income" | "expense" | "transfer";
    installments?: number;
    date: string;
  };

  const mapTransactionToFormData = (
    transaction: TransactionRow
  ): TransactionDialogFormData => {
    const typeId = Number(transaction.transaction_type_id) as TransactionType;
    let accountId = "";
    let accountOutId: string | undefined;

    if (typeId === TransactionType.INCOME) {
      accountId = transaction.account_id?.toString() || "";
    } else if (typeId === TransactionType.EXPENSE) {
      accountId = transaction.account_out_id?.toString() || "";
    } else if (typeId === TransactionType.TRANSFER) {
      accountId = transaction.account_out_id?.toString() || "";
      accountOutId = transaction.account_id?.toString() || "";
    }

    return {
      description: transaction.description || "",
      accountId,
      accountOutId,
      date: new Date(transaction.date).toISOString().split("T")[0],
      value: transaction.value?.toString() || "",
      tags: [],
      subTransactions:
        transaction.sub_transactions?.map((st) => ({
          value: st.value?.toString() || "",
          categoryId:
            st.category_id ||
            categories.find((c) =>
              c.sub_categories?.some((sc) => sc.id === st.sub_category_id)
            )?.id ||
            "",
          subCategoryId: st.sub_category_id || "",
        })) || [],
    };
  };

  const handleTransactionSubmit = async (data: TransactionFormValues) => {
    try {
      let accountId: string | undefined;
      let accountOutId: string | undefined;

      if (data.type === "income") {
        accountId = data.accountId || undefined;
      } else if (data.type === "expense") {
        accountOutId = data.accountId || undefined;
      } else if (data.type === "transfer") {
        accountOutId = data.accountId || undefined;
        accountId = data.accountOutId || undefined;
      }
      if (editingTransaction) {
        await updateTransaction({
          installmentId: editingTransaction.id,
          transactionId: editingTransaction.transaction_id,
          description: data.description,
          value: Number(data.value),
          accountId,
          accountOutId,
          date: data.date,
          subTransactions:
            data.subTransactions?.map((st) => ({
              value: Number(st.value),
              categoryId: st.categoryId,
              subCategoryId: st.subCategoryId,
            })) || [],
        });
        setEditingTransaction(null);
      } else {
        await createTransaction({
          description: data.description,
          value: Number(data.value),
          accountId,
          accountOutId,
          transactionTypeId: String(TRANSACTION_TYPE_FROM_FORM[data.type]),
          installments: data.installments || 1,
          date: data.date,
          subTransactions:
            data.subTransactions?.map((st) => ({
              value: Number(st.value),
              categoryId: st.categoryId,
              subCategoryId: st.subCategoryId,
            })) || [],
        });
      }

      if (data.type === "income") setIsIncomeDialogOpen(false);
      if (data.type === "expense") setIsExpenseDialogOpen(false);
      if (data.type === "transfer") setIsTransferDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
    }
  };

  const handleEditTransaction = (transaction: FormattedTransaction) => {
    const original = transactions.find((t) => t.id === transaction.id);
    if (!original) return;
    setEditingTransaction(original);

    if (transaction.type === "income") setIsIncomeDialogOpen(true);
    if (transaction.type === "expense") setIsExpenseDialogOpen(true);
    if (transaction.type === "transfer") setIsTransferDialogOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  const handleEditAccount = (id: string) => {
    navigate(`/accounts/${id}/edit`);
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await accountsService.deleteAccount(id);
      toast({
        title: "Conta removida",
        description: "A conta foi removida com sucesso.",
        variant: "destructive",
      });
      await refetch();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao remover conta",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <AccountsProvider value={accounts}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card shadow-card border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <HamburgerMenu />
                <h1 className="text-xl font-bold text-foreground">
                  Meu Gestor de Gastos
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Paulo André
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button
              variant="income"
              size="lg"
              onClick={() => setIsIncomeDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova receita
            </Button>

            <Button
              variant="transfer"
              size="lg"
              onClick={() => setIsTransferDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Nova transferência
            </Button>

            <Button
              variant="expense"
              size="lg"
              onClick={() => setIsExpenseDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Minus className="h-4 w-4" />
              Nova despesa
            </Button>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Gráfico de Pizza - Gastos por Categoria */}
            <div className="lg:col-span-1">
              <FinancialChart
                type="pie"
                data={categoryData}
                title="Gastos por Categoria"
              />
            </div>

            {/* Lista de Transações */}
            <div className="lg:col-span-3">
              <TransactionList
                transactions={formattedTransactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </div>

            {/* Lado Direito */}
            <div className="lg:col-span-1 space-y-6">
              {/* Gráfico de Linha - Evolução do Patrimônio */}
              <FinancialChart
                type="line"
                data={investmentData}
                title="Evolução do Patrimônio"
              />

              {/* Saldo das Contas */}
              <AccountBalance
                accounts={formattedAccounts}
                onEdit={handleEditAccount}
                onDelete={handleDeleteAccount}
              />
            </div>
          </div>
        </main>

        {/* Transaction Dialogs */}
        <TransactionDialog
          type="income"
          isOpen={isIncomeDialogOpen}
          onOpenChange={(open) => {
            setIsIncomeDialogOpen(open);
            if (!open) setEditingTransaction(null);
          }}
          onSubmit={handleTransactionSubmit}
          categories={categories}
          initialData={
            editingTransaction &&
            Number(editingTransaction.transaction_type_id) ===
              TransactionType.INCOME
              ? mapTransactionToFormData(editingTransaction)
              : undefined
          }
        />

        <TransactionDialog
          type="expense"
          isOpen={isExpenseDialogOpen}
          onOpenChange={(open) => {
            setIsExpenseDialogOpen(open);
            if (!open) setEditingTransaction(null);
          }}
          onSubmit={handleTransactionSubmit}
          categories={categories}
          initialData={
            editingTransaction &&
            Number(editingTransaction.transaction_type_id) ===
              TransactionType.EXPENSE
              ? mapTransactionToFormData(editingTransaction)
              : undefined
          }
        />

        <TransactionDialog
          type="transfer"
          isOpen={isTransferDialogOpen}
          onOpenChange={(open) => {
            setIsTransferDialogOpen(open);
            if (!open) setEditingTransaction(null);
          }}
          onSubmit={handleTransactionSubmit}
          categories={categories}
          initialData={
            editingTransaction &&
            Number(editingTransaction.transaction_type_id) ===
              TransactionType.TRANSFER
              ? mapTransactionToFormData(editingTransaction)
              : undefined
          }
        />
      </div>
    </AccountsProvider>
  );
};

export default Index;
