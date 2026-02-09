import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Transaction, TransactionType, ExpenseCategory } from '@/lib/types';

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          person:persons(*)
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Transaction[];
    },
  });
}

export function useRecentTransactions(limit = 15) {
  return useQuery({
    queryKey: ['transactions', 'recent', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          person:persons(*)
        `)
        .order('date', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as Transaction[];
    },
  });
}

export function useAccountSummary() {
  return useQuery({
    queryKey: ['accountSummary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount_bs');
      
      if (error) throw error;
      
      let totalIncome = 0;
      let totalExpense = 0;
      
      data?.forEach((t: { type: string; amount_bs: number }) => {
        if (t.type === 'income') {
          totalIncome += Number(t.amount_bs);
        } else {
          totalExpense += Number(t.amount_bs);
        }
      });
      
      return {
        totalIncomeBs: totalIncome,
        totalExpenseBs: totalExpense,
        currentBalanceBs: totalIncome - totalExpense,
      };
    },
  });
}

export function useExpensesByCategory() {
  return useQuery({
    queryKey: ['expensesByCategory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('category, amount_bs')
        .eq('type', 'expense');
      
      if (error) throw error;
      
      const categoryTotals: Record<string, number> = {};
      
      data?.forEach((t: { category: string | null; amount_bs: number }) => {
        const cat = t.category || 'gastos_varios';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount_bs);
      });
      
      return categoryTotals;
    },
  });
}

interface CreateTransactionData {
  date: string;
  type: TransactionType;
  description: string;
  category?: ExpenseCategory | null;
  amount_bs: number;
  exchange_rate_used?: number;
  person_id?: string | null;
  receipt_image_url?: string | null;
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      const { data: result, error } = await supabase
        .from('transactions')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accountSummary'] });
      queryClient.invalidateQueries({ queryKey: ['expensesByCategory'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: CreateTransactionData & { id: string }) => {
      const { data: result, error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accountSummary'] });
      queryClient.invalidateQueries({ queryKey: ['expensesByCategory'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accountSummary'] });
      queryClient.invalidateQueries({ queryKey: ['expensesByCategory'] });
    },
  });
}
