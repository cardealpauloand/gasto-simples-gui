interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
}

interface AccountBalanceProps {
  accounts: Account[];
}

export function AccountBalance({ accounts }: AccountBalanceProps) {
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-card">
      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Contas</h3>
      
      <div className="space-y-3">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <span className="font-medium text-card-foreground">{account.name}</span>
              <span className="text-xs text-muted-foreground">{account.type}</span>
            </div>
            <span className="font-semibold text-success">
              {formatCurrency(account.balance)}
            </span>
          </div>
        ))}
        
        {accounts.length > 1 && (
          <>
            <div className="border-t border-border pt-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-card-foreground">Total</span>
                <span className="font-bold text-lg text-success">
                  {formatCurrency(getTotalBalance())}
                </span>
              </div>
            </div>
          </>
        )}
        
        {accounts.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-muted-foreground text-sm">
              Nenhuma conta cadastrada
            </p>
          </div>
        )}
      </div>
    </div>
  );
}