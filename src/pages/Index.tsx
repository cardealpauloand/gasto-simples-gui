import { useState } from "react";
import { Plus, Minus, ArrowRightLeft, Menu, User } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { FinancialChart } from "@/components/FinancialChart";
import { TransactionList } from "@/components/TransactionList";
import { AccountBalance } from "@/components/AccountBalance";
import { TransactionDialog } from "@/components/TransactionDialog";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { AccountsProvider } from "@/contexts/AccountsContext";

interface TransactionFormValues {
  description: string;
  account?: string;
  accountOut?: string;
  date: string;
  value: string;
  categories?: string[];
  tags?: string[];
  accountId?: string;
  accountOutId?: string;
  type: "income" | "expense" | "transfer";
  installments?: number;
}

interface FormattedTransaction {
  id: string;
  transactionId: string;
  name: string;
  bank: string;
  category: string;
  value: number;
  type: "income" | "expense" | "transfer";
  date: string;
}

type TransactionRow =
  Database["public"]["Tables"]["transactions_installments"]["Row"] & {
    account?: { name: string } | null;
    transaction_type?: { name: string } | null;
  };

type TransactionDialogFormData = {
  description: string;
  accountId: string;
  accountOutId?: string;
  date: string;
  value: string;
  categories: string[];
  tags: string[];
};

const Index = () => {
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionRow | null>(null);
  const { toast } = useToast();

  const {
    transactions,
    accounts,
    transactionTypes,
    categories,
    loading,
    createTransaction,
    deleteTransaction,
    updateTransaction,
  } = useTransactions();

  // Dados de gráfico temporários - serão calculados baseados nas transações reais
  const categoryData = [
    { name: "Lazer", value: 450, color: "hsl(var(--chart-4))" },
    { name: "Comida", value: 320, color: "hsl(var(--chart-2))" },
    { name: "Outros", value: 180, color: "hsl(var(--chart-5))" },
  ];

  const investmentData = [
    { month: "Jan", acoes: 5000, rendaFixa: 3000, outros: 1000 },
    { month: "Fev", acoes: 5200, rendaFixa: 3100, outros: 1100 },
    { month: "Mar", acoes: 4800, rendaFixa: 3200, outros: 1050 },
    { month: "Abr", acoes: 5500, rendaFixa: 3300, outros: 1200 },
    { month: "Mai", acoes: 5800, rendaFixa: 3400, outros: 1150 },
    { month: "Jun", acoes: 6100, rendaFixa: 3500, outros: 1300 },
  ];

  // Formatação das transações para o componente TransactionList
  const formattedTransactions: FormattedTransaction[] = transactions.map(
    (transaction) => ({
      id: transaction.id,
      transactionId: transaction.transaction_id,
      name: transaction.description || "Sem descrição",
      bank: transaction.account?.name || "N/A",
      category: "Outros", // Por enquanto, até implementarmos as categorias
      value:
        transaction.transaction_type?.name === "Despesa" ||
        transaction.transaction_type?.name === "Transferência"
          ? -transaction.value
          : transaction.value,
      type:
        transaction.transaction_type?.name === "Receita"
          ? ("income" as const)
          : transaction.transaction_type?.name === "Despesa"
          ? ("expense" as const)
          : ("transfer" as const),
      date: new Date(transaction.date).toLocaleDateString("pt-BR"),
    })
  );

  // Calcula o resultado das transações por conta
  const accountTotals = transactions.reduce<Record<string, number>>(
    (acc, transaction) => {
      const accountId = transaction.account_id;
      if (!accountId) return acc;

      const typeName = transaction.transaction_type?.name;
      const value = transaction.value || 0;

      const impact =
        typeName === "Despesa" || typeName === "Transferência"
          ? -value
          : value;

      acc[accountId] = (acc[accountId] || 0) + impact;
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
  ): TransactionDialogFormData => ({
    description: transaction.description || undefined,
    accountId: transaction.account_id?.toString() || undefined,
    accountOutId: transaction.account_out_id?.toString() || undefined,
    date: new Date(transaction.date).toISOString().split("T")[0],
    value: transaction.value?.toString() || undefined,
    categories: [],
    tags: [],
  });

  const handleTransactionSubmit = async (data: TransactionFormValues) => {
    try {
      // Encontrar o tipo de transação baseado no tipo do diálogo
      enum TransactionType {
        income = 1,
        expense = 2,
        transfer = 3,
      }
      if (editingTransaction) {
        await updateTransaction({
          installmentId: editingTransaction.id,
          transactionId: editingTransaction.transaction_id,
          description: data.description,
          value: Number(data.value),
          accountId: data.accountId,
          accountOutId: data.accountOutId,
          date: data.date,
        });
        setEditingTransaction(null);
      } else {
        await createTransaction({
          description: data.description,
          value: Number(data.value),
          account: data.account,
          accountOut: data.accountOutId,
          accountId: data.accountId,
          accountOutId: data.accountOut,
          transactionTypeId: String(TransactionType[data.type] || 1),
          installments: data.installments || 1,
          date: data.date,
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

  return (
    <AccountsProvider value={accounts}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card shadow-card border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Gráfico de Pizza - Gastos por Categoria */}
            <div className="lg:col-span-1">
              <FinancialChart
                type="pie"
                data={categoryData}
                title="Gastos por Categoria"
              />
            </div>

            {/* Lista de Transações */}
            <div className="lg:col-span-2">
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
              <AccountBalance accounts={formattedAccounts} />
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
          initialData={
            editingTransaction &&
            editingTransaction.transaction_type?.name === "Receita"
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
          initialData={
            editingTransaction &&
            editingTransaction.transaction_type?.name === "Despesa"
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
          initialData={
            editingTransaction &&
            editingTransaction.transaction_type?.name === "Transferência"
              ? mapTransactionToFormData(editingTransaction)
              : undefined
          }
        />
      </div>
    </AccountsProvider>
  );
};

export default Index;
