import { useState } from 'react';
import { Plus, Minus, ArrowRightLeft, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinancialChart } from '@/components/FinancialChart';
import { TransactionList } from '@/components/TransactionList';
import { AccountBalance } from '@/components/AccountBalance';
import { TransactionDialog } from '@/components/TransactionDialog';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const { toast } = useToast();

  // Mock data - Em uma aplicação real, estes dados viriam do Supabase
  const categoryData = [
    { name: 'Lazer', value: 450, color: 'hsl(var(--chart-4))' },
    { name: 'Comida', value: 320, color: 'hsl(var(--chart-2))' },
    { name: 'Outros', value: 180, color: 'hsl(var(--chart-5))' },
  ];

  const investmentData = [
    { month: 'Jan', acoes: 5000, rendaFixa: 3000, outros: 1000 },
    { month: 'Fev', acoes: 5200, rendaFixa: 3100, outros: 1100 },
    { month: 'Mar', acoes: 4800, rendaFixa: 3200, outros: 1050 },
    { month: 'Abr', acoes: 5500, rendaFixa: 3300, outros: 1200 },
    { month: 'Mai', acoes: 5800, rendaFixa: 3400, outros: 1150 },
    { month: 'Jun', acoes: 6100, rendaFixa: 3500, outros: 1300 },
  ];

  const transactions = [
    {
      id: '1',
      name: 'Hamburger',
      bank: 'C6',
      category: 'Comida',
      value: -50,
      type: 'expense' as const,
      date: '08/09/2025'
    },
    {
      id: '2',
      name: 'Salário',
      bank: 'Sicoob',
      category: 'Outros',
      value: 3500,
      type: 'income' as const,
      date: '05/09/2025'
    },
    {
      id: '3',
      name: 'Cinema',
      bank: 'C6',
      category: 'Lazer',
      value: -45,
      type: 'expense' as const,
      date: '03/09/2025'
    }
  ];

  const accounts = [
    { id: '1', name: 'C6', balance: 9350, type: 'Conta Corrente' },
    { id: '2', name: 'Sicoob', balance: 9350, type: 'Conta Corrente' },
  ];

  const handleTransactionSubmit = (data: any) => {
    console.log('Nova transação:', data);
    toast({
      title: "Transação adicionada",
      description: `${data.description} foi adicionada com sucesso.`,
    });
  };

  const handleEditTransaction = (transaction: any) => {
    console.log('Editar transação:', transaction);
    toast({
      title: "Editar transação",
      description: "Funcionalidade de edição será implementada em breve.",
    });
  };

  const handleDeleteTransaction = (id: string) => {
    console.log('Deletar transação:', id);
    toast({
      title: "Transação removida",
      description: "A transação foi removida com sucesso.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-foreground">Meu Gestor de Gastos</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Paulo André</span>
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
              transactions={transactions}
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
            <AccountBalance accounts={accounts} />
          </div>
        </div>
      </main>

      {/* Transaction Dialogs */}
      <TransactionDialog
        type="income"
        isOpen={isIncomeDialogOpen}
        onOpenChange={setIsIncomeDialogOpen}
        onSubmit={handleTransactionSubmit}
      />

      <TransactionDialog
        type="expense"
        isOpen={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        onSubmit={handleTransactionSubmit}
      />

      <TransactionDialog
        type="transfer"
        isOpen={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        onSubmit={handleTransactionSubmit}
      />
    </div>
  );
};

export default Index;
