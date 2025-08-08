import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Types for inserting and retrieving accounts
export type AccountInsert = Database["public"]["Tables"]["account"]["Insert"];
export type AccountGroup = Database["public"]["Tables"]["account_group"]["Row"];

/** Ensure authenticated user and return user object */
const ensureUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const user = data?.user;
  if (!user) throw new Error("Usuário não autenticado");
  return user;
};

export const accountsService = {
  async createAccount(input: {
    name: string;
    initialValue?: number;
    accountGroupId?: string;
  }) {
    const user = await ensureUser();
    const accountData: AccountInsert = {
      name: input.name,
      initial_value: input.initialValue ?? 0,
      account_group_id: input.accountGroupId ?? null,
      user_id: user.id,
    };

    const { error } = await supabase.from("account").insert(accountData);
    if (error) throw error;
  },

  async getAccountGroups() {
    const { data, error } = await supabase
      .from("account_group")
      .select("*");
    if (error) throw error;
    return data as AccountGroup[];
  },

  async getAccounts() {
    const user = await ensureUser();
    const { data, error } = await supabase
      .from("account")
      .select(`
        *,
        account_group:account_group_id(name)
      `)
      .eq("user_id", user.id);
    if (error) throw error;
    return data;
  },
};

export default accountsService;
