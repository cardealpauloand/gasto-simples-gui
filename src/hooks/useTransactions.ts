import { useState, useEffect, useCallback } from "react";
import {
  transactionsService,
  type CreateTransactionData,
} from "@/services/transactions";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Transaction =
  Database["public"]["Tables"]["transactions_installments"]["Row"] & {
    account?: { name: string } | null;
    transaction_type?: { name: string } | null;
  };

type Account = Database["public"]["Tables"]["account"]["Row"] & {
  account_group?: { name: string } | null;
};

type TransactionType = Database["public"]["Tables"]["transactions_type"]["Row"];

type Category = Database["public"]["Tables"]["category"]["Row"] & {
  sub_categories?: Database["public"]["Tables"]["sub_category"]["Row"][];
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>(
    []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Usuário autenticado:", 1);

      // const signUpResult = await transactionsService.signUp(
      //   "pascs0703@gmail.com",
      //   "123Mudar@"
      // );
      // console.log(signUpResult);

      const loginResult = await transactionsService.login(
        "pascs0703@gmail.com",
        "123Mudar@"
      );
      console.log("Usuário autenticado:", loginResult);
      const [transactionsData, accountsData, typesData, categoriesData] =
        await Promise.all([
          transactionsService.getTransactions(),
          transactionsService.getAccounts(),
          transactionsService.getTransactionTypes(),
          transactionsService.getCategories(),
        ]);

      setTransactions(transactionsData as Transaction[]);
      setAccounts(accountsData as Account[]);
      setTransactionTypes(typesData as TransactionType[]);
      setCategories(categoriesData as Category[]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao carregar dados",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createTransaction = async (data: CreateTransactionData) => {
    setLoading(true);
    try {
      await transactionsService.createTransaction(data);

      toast({
        title: "Transação criada",
        description: `${data.description} foi adicionada com sucesso.`,
      });

      // Recarregar as transações após criar uma nova
      await loadData();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao criar transação",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    transactions,
    accounts,
    transactionTypes,
    categories,
    loading,
    createTransaction,
    refetch: loadData,
  };
};
