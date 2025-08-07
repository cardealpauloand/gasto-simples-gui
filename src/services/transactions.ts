import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
type TransactionInstallmentInsert =
  Database["public"]["Tables"]["transactions_installments"]["Insert"];

export interface CreateTransactionData {
  description: string;
  value: number;
  date: string; // esperado YYYY-MM-DD
  installments?: number;
  accountId?: string;
  accountOutId?: string;
  account?: string;
  accountOut?: string;
  transactionTypeId?: string;
  type?: string;
}

/** Garante usuário autenticado e retorna o objeto do user */
const ensureUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const user = data?.user;
  if (!user) throw new Error("Usuário não autenticado");
  return user;
};

/** Formata Date -> 'YYYY-MM-DD' sem problemas de timezone */
const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Soma meses preservando dia quando possível */
const addMonths = (d: Date, months: number) => {
  const copy = new Date(d.getTime());
  copy.setMonth(copy.getMonth() + months);
  return copy;
};

export const transactionsService = {
  /**
   * Autentica um usuário usando e-mail e senha no Supabase.
   */
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Erro ao autenticar usuário:", error);
      throw error;
    }
    return data;
  },

  /**
   * Cadastra um novo usuário no Supabase.
   */
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error("Erro ao cadastrar usuário:", error);
      throw error;
    }
    return data;
  },

  async createTransaction(input: CreateTransactionData) {
    try {
      const user = await ensureUser();
      const installments = input.installments ?? 1;

      // 1) Criar a transação principal
      const transactionData: TransactionInsert = {
        user_id: user.id,
        account_id: input.accountId ?? undefined,
        account_out_id: input.accountOutId ?? undefined,
        transaction_type_id: input.transactionTypeId ?? undefined,
        total_installments: installments,
        description: input.description,
      };

      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) throw transactionError;

      // 2) Criar as parcelas automaticamente
      // Parse local para evitar UTC shift
      const baseDate = new Date(`${input.date}T00:00:00`);

      const installmentsPayload: TransactionInstallmentInsert[] = Array.from(
        { length: installments },
        (_, i) => {
          const date = addMonths(baseDate, i);
          return {
            transaction_id: transaction.id,
            user_id: user.id,
            account_id: input.accountId,
            transaction_type_id: input.transactionTypeId,
            value: input.value,
            date: toYMD(date),
            installment_number: i + 1,
            description:
              installments > 1
                ? `${input.description} - Parcela ${i + 1}/${installments}`
                : input.description,
          };
        }
      );

      const { data: createdInstallments, error: installmentsError } =
        await supabase
          .from("transactions_installments")
          .insert(installmentsPayload)
          .select();

      if (installmentsError) {
        // rollback best-effort
        await supabase.from("transactions").delete().eq("id", transaction.id);
        throw installmentsError;
      }

      return { transaction, installments: createdInstallments };
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      throw error;
    }
  },

  async getTransactions() {
    try {
      const user = await ensureUser();

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

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      throw error;
    }
  },

  async getAccounts() {
    try {
      const user = await ensureUser();

      const { data, error } = await supabase
        .from("account")
        .select(
          `
          *,
          account_group:account_group_id(name)
        `
        )
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao buscar contas:", error);
      throw error;
    }
  },

  async getTransactionTypes() {
    const { data, error } = await supabase
      .from("transactions_type")
      .select("*");
    if (error) {
      console.error("Erro ao buscar tipos de transação:", error);
      throw error;
    }
    return data;
  },

  async getCategories() {
    const { data, error } = await supabase.from("category").select(`
      *,
      sub_categories:sub_category(*)
    `);
    if (error) {
      console.error("Erro ao buscar categorias:", error);
      throw error;
    }
    return data;
  },
};
