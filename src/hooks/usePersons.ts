import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Person } from '@/lib/types';

export function usePersons() {
  return useQuery({
    queryKey: ['persons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('persons')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      return data as Person[];
    },
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { full_name: string; notes?: string }) => {
      const { data: result, error } = await supabase
        .from('persons')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result as Person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] });
    },
  });
}
