import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
type TransactionInstallmentInsert =
  Database["public"]["Tables"]["transactions_installments"]["Insert"];

export interface CreateTransactionData {
  description: string;
  value: number;
  accountId?: string;
  accountOutId?: string;
  account?: string;
  accountOut?: string;
  transactionTypeId?: string;
  type?: string;
  installments?: number;
  date: string;
}

export const transactionsService = {
  /**
   * Autentica um usuário usando e-mail e senha no Supabase.
   * @param email E-mail do usuário
   * @param password Senha do usuário
   * @returns Dados do usuário autenticado ou erro
   */
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Erro ao autenticar usuário:", error);
      throw error;
    }
  },

  /**
   * Cadastra um novo usuário no Supabase.
   * @param email E-mail do usuário
   * @param password Senha do usuário
   * @returns Dados do usuário cadastrado ou erro
   */
  async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      throw error;
    }
  },
  async createTransaction(data: CreateTransactionData) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const installments = data.installments || 1;
      console.log("data", data);

      // 1. Criar a transação principal
      const transactionData: TransactionInsert = {
        user_id: user.id,
        account_id: data.account,
        account_out_id: data.accountOut,
        transaction_type_id: data.transactionTypeId,
        total_installments: installments,
        description: data.description,
      };

      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) {
        throw transactionError;
      }

      // 2. Criar as parcelas automaticamente
      const installmentData: TransactionInstallmentInsert[] = [];
      const baseDate = new Date(data.date);

      for (let i = 0; i < installments; i++) {
        const installmentDate = new Date(baseDate);
        installmentDate.setMonth(baseDate.getMonth() + i);

        installmentData.push({
          transaction_id: transaction.id,
          user_id: user.id,
          account_id: data.accountId,
          transaction_type_id: data.transactionTypeId,
          value: data.value,
          date: installmentDate.toISOString().split("T")[0],
          installment_number: i + 1,
          description:
            installments > 1
              ? `${data.description} - Parcela ${i + 1}/${installments}`
              : data.description,
        });
      }

      const { data: installmentsData, error: installmentsError } =
        await supabase
          .from("transactions_installments")
          .insert(installmentData)
          .select();

      if (installmentsError) {
        // Se houver erro ao criar as parcelas, desfazer a transação
        await supabase.from("transactions").delete().eq("id", transaction.id);
        throw installmentsError;
      }

      return {
        transaction,
        installments: installmentsData,
      };
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      throw error;
    }
  },

  async getTransactions() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from("transactions_installments")
        .select(
          `
          *,
          transaction_id,
          account:account_id(name),
          transaction_type:transaction_type_id(name)
        `
        )
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      throw error;
    }
  },

  async getAccounts() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("Usuário autenticado:", user);

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from("account")
        .select(
          `
          *,
          account_group:account_group_id(name)
        `
        )
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar contas:", error);
      throw error;
    }
  },

  async getTransactionTypes() {
    try {
      const { data, error } = await supabase
        .from("transactions_type")
        .select("*");

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar tipos de transação:", error);
      throw error;
    }
  },

  async getCategories() {
    try {
      const { data, error } = await supabase.from("category").select(`
          *,
          sub_categories:sub_category(*)
        `);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      throw error;
    }
  },
};
