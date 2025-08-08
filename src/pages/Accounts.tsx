import { AccountsProvider } from "@/contexts/AccountsContext";
import { AccountBalance } from "@/components/AccountBalance";
import HamburgerMenu from "@/components/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import { accountsService } from "@/services/accounts";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useCallback, useState } from "react";
import { AccountDialog } from "@/components/AccountDialog";

const Accounts = () => {
  const { accounts, transactions, refetch } = useTransactions();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleCreateAccount = useCallback(
    async (data: {
      name: string;
      initialValue: number;
      accountGroupId?: string;
    }) => {
      try {
        await accountsService.createAccount(data);
        toast({
          title: "Conta criada",
          description: `${data.name} foi adicionada com sucesso.`,
        });
        await refetch();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Erro desconhecido";
        toast({
          title: "Erro ao criar conta",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsDialogOpen(false);
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
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Paulo André
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsDialogOpen(true)}>Nova conta</Button>
          </div>
          <AccountBalance
            accounts={formattedAccounts}
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccount}
          />
        </main>
        <AccountDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleCreateAccount}
        />
      </div>
    </AccountsProvider>
  );
};

export default Accounts;

