import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { getCategoryLabel, type ExpenseCategory, type Transaction } from '@/lib/types';
import { formatBs } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, User, DollarSign, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          person:persons(*)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Transaction | null;
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error || !transaction) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Transacción no encontrada</p>
          <Link to="/dashboard">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/dashboard">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al dashboard
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${
                  transaction.type === 'income'
                    ? 'bg-income/10 text-income'
                    : 'bg-expense/10 text-expense'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <CardTitle>{transaction.description}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {transaction.type === 'income' ? 'Ingreso' : 'Egreso'}
                  </p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                transaction.type === 'income' ? 'text-income' : 'text-expense'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}Bs. {formatBs(transaction.amount_bs)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {format(new Date(transaction.date), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
              </div>

              {transaction.category && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Categoría</p>
                    <Badge variant="outline">
                      {getCategoryLabel(transaction.category as ExpenseCategory)}
                    </Badge>
                  </div>
                </div>
              )}

              {transaction.person && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Persona</p>
                    <p className="font-medium">{transaction.person.full_name}</p>
                  </div>
                </div>
              )}

              {transaction.exchange_rate_used && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tasa de cambio usada</p>
                    <p className="font-medium">Bs. {formatBs(transaction.exchange_rate_used)}</p>
                  </div>
                </div>
              )}
            </div>

            {transaction.receipt_image_url && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                  <p className="font-medium">Recibo / Factura</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <img
                      src={transaction.receipt_image_url}
                      alt="Recibo"
                      className="rounded-lg border max-w-full max-h-96 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] p-2">
                    <DialogTitle className="sr-only">Recibo / Factura</DialogTitle>
                    <img
                      src={transaction.receipt_image_url}
                      alt="Recibo ampliado"
                      className="w-full h-full object-contain"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}

            <div className="pt-4 border-t text-sm text-muted-foreground">
              <p>Registrado: {format(new Date(transaction.created_at), "d/MM/yyyy 'a las' HH:mm", { locale: es })}</p>
              {transaction.updated_at !== transaction.created_at && (
                <p>Última modificación: {format(new Date(transaction.updated_at), "d/MM/yyyy 'a las' HH:mm", { locale: es })}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
