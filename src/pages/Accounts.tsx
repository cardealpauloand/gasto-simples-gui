import { AccountsProvider } from "@/contexts/AccountsContext";
import { AccountBalance } from "@/components/AccountBalance";
import HamburgerMenu from "@/components/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import { accountsService } from "@/services/accounts";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useCallback } from "react";

const Accounts = () => {
  const { accounts, transactions, refetch } = useTransactions();
  const navigate = useNavigate();
  const { toast } = useToast();

  const accountTotals = transactions.reduce<Record<string, number>>(
    (acc, transaction) => {
      const accountId = transaction.account_id;
      if (!accountId) return acc;
      const typeName = transaction.transaction_type?.name;
      const value = transaction.value || 0;
      const impact =
        typeName === "Despesa" || typeName === "Transferência" ? -value : value;
      acc[accountId] = (acc[accountId] || 0) + impact;
      return acc;
    },
    {}
  );

  const formattedAccounts = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    balance: (account.initial_value || 0) + (accountTotals[account.id] || 0),
    type: account.account_group?.name || "Conta",
  }));

  const handleEditAccount = useCallback(
    (id: string) => navigate(`/accounts/${id}/edit`),
    [navigate]
  );

  const handleDeleteAccount = useCallback(
    async (id: string) => {
      try {
        await accountsService.deleteAccount(id);
        toast({
          title: "Conta removida",
          description: "A conta foi removida com sucesso.",
          variant: "destructive",
        });
        await refetch();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        toast({
          title: "Erro ao remover conta",
          description: message,
          variant: "destructive",
        });
      }
    },
    [toast, refetch]
  );

  return (
    <AccountsProvider value={accounts}>
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-card border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <HamburgerMenu />
                <h1 className="text-xl font-bold text-foreground">Contas</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link to="/accounts/new">Nova conta</Link>
                </Button>
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Paulo André
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AccountBalance
            accounts={formattedAccounts}
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccount}
          />
        </main>
      </div>
    </AccountsProvider>
  );
};

export default Accounts;

