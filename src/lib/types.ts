export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 
  | 'medicinas'
  | 'comida'
  | 'mantenimiento'
  | 'gastos_medicos'
  | 'transporte'
  | 'gastos_varios';

export interface Person {
  id: string;
  full_name: string;
  notes?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  category?: ExpenseCategory;
  amount_bs: number;
  exchange_rate_used?: number;
  person_id?: string;
  receipt_image_url?: string;
  created_at: string;
  updated_at: string;
  person?: Person;
}

export interface AccountSummary {
  totalIncomeBs: number;
  totalExpenseBs: number;
  currentBalanceBs: number;
  currentBalanceUsd: number | null;
}

export interface ExchangeRate {
  promedio: number;
  fechaActualizacion: string;
}

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'medicinas', label: 'Medicinas' },
  { value: 'comida', label: 'Comida' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'gastos_medicos', label: 'Gastos Médicos' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'gastos_varios', label: 'Gastos Varios' },
];

export const getCategoryLabel = (category: ExpenseCategory): string => {
  const found = EXPENSE_CATEGORIES.find(c => c.value === category);
  return found?.label || category;
};
