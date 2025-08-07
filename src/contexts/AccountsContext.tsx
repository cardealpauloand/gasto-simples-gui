import { createContext, useContext } from 'react';
import type { Database } from '@/integrations/supabase/types';

export type Account = Database['public']['Tables']['account']['Row'] & {
  account_group?: { name: string } | null;
};

const AccountsContext = createContext<Account[]>([]);

export const AccountsProvider = AccountsContext.Provider;

export const useAccounts = () => useContext(AccountsContext);

export default AccountsContext;
