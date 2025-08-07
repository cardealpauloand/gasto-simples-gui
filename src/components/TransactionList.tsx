import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  name: string;
  bank: string;
  category: string;
  value: number;
  type: 'income' | 'expense' | 'transfer';
  date: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const formatCurrency = (value: number) => {
    const sign = value < 0 ? '-' : '';
    return `${sign}R$ ${Math.abs(value).toFixed(2)}`;
  };

  const getValueColor = (value: number, type: string) => {
    if (type === 'income') return 'text-success';
    if (type === 'expense') return 'text-danger';
    return 'text-info';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Comida': 'bg-red-100 text-red-700',
      'Lazer': 'bg-purple-100 text-purple-700',
      'Transporte': 'bg-blue-100 text-blue-700',
      'Saúde': 'bg-green-100 text-green-700',
      'Casa': 'bg-yellow-100 text-yellow-700',
      'Outros': 'bg-gray-100 text-gray-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-card rounded-lg shadow-card overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Transações Recentes</h3>
        
        {/* Header */}
        <div className="grid grid-cols-5 gap-4 py-3 px-2 text-sm font-medium text-muted-foreground border-b">
          <div>Nome</div>
          <div>Banco</div>
          <div>Tipo</div>
          <div className="text-right">Valor</div>
          <div className="text-center">Ações</div>
        </div>

        {/* Transactions */}
        <div className="space-y-0">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="grid grid-cols-5 gap-4 py-4 px-2 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-medium text-card-foreground">{transaction.name}</span>
                <span className="text-xs text-muted-foreground">{transaction.date}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground">{transaction.bank}</span>
              </div>
              
              <div className="flex items-center">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getCategoryColor(transaction.category)}`}
                >
                  {transaction.category}
                </Badge>
              </div>
              
              <div className="flex items-center justify-end">
                <span className={`font-semibold ${getValueColor(transaction.value, transaction.type)}`}>
                  {formatCurrency(transaction.value)}
                </span>
              </div>
              
              <div className="flex items-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem 
                      onClick={() => onEdit?.(transaction)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(transaction.id)}
                      className="cursor-pointer text-danger focus:text-danger"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {transactions.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione sua primeira transação usando os botões acima
            </p>
          </div>
        )}
      </div>
    </div>
  );
}