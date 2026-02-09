import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccountSummary } from '@/hooks/useTransactions';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { Wallet, TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function formatBs(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function SummaryCards() {
  const { data: summary, isLoading: summaryLoading } = useAccountSummary();
  const { data: exchangeRate, isLoading: rateLoading, dataUpdatedAt } = useExchangeRate();

  const balanceUsd = summary && exchangeRate && summary.currentBalanceBs > 0
    ? summary.currentBalanceBs / exchangeRate.promedio
    : null;

  const lastUpdate = dataUpdatedAt 
    ? new Date(dataUpdatedAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
    : null;

  if (summaryLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo Actual
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Bs. {formatBs(summary?.currentBalanceBs ?? 0)}
          </div>
          {balanceUsd !== null && (
            <p className="text-xs text-muted-foreground mt-1">
              ≈ {formatUsd(balanceUsd)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Ingresos
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            Bs. {formatBs(summary?.totalIncomeBs ?? 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Egresos
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            Bs. {formatBs(summary?.totalExpenseBs ?? 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tasa USD
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {rateLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                Bs. {formatBs(exchangeRate?.promedio ?? 0)}
              </div>
              {lastUpdate && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Actualizado: {lastUpdate}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
