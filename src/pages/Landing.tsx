 import { Link } from 'react-router-dom';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent } from '@/components/ui/card';
 import { useAccountSummary } from '@/hooks/useTransactions';
 import { useExchangeRate } from '@/hooks/useExchangeRate';
 import { formatBs, formatUsd } from '@/lib/formatters';
 import { Skeleton } from '@/components/ui/skeleton';
 import { 
   Heart, 
   TrendingUp, 
   TrendingDown, 
   Wallet, 
   DollarSign,
   ArrowRight,
   RefreshCw
 } from 'lucide-react';
 
 export default function Landing() {
   const { data: summary, isLoading: summaryLoading } = useAccountSummary();
   const { data: exchangeRate, isLoading: rateLoading, dataUpdatedAt } = useExchangeRate();
 
   const balanceUsd = summary && exchangeRate && summary.currentBalanceBs > 0
     ? summary.currentBalanceBs / exchangeRate.promedio
     : null;
 
   const lastUpdate = dataUpdatedAt 
     ? new Date(dataUpdatedAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
     : null;
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="border-b bg-card">
         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Heart className="h-6 w-6 text-primary" />
             <span className="font-semibold text-lg">Cuenta Solidaria</span>
           </div>
           <Link to="/dashboard">
             <Button variant="default" size="sm">
               Movimientos
             </Button>
           </Link>
            <Link to="/login">
             <Button variant="ghost" size="sm">
               Administrador
             </Button>
           </Link>
         </div>
       </header>
 
       {/* Hero Section */}
       <section className="py-12 md:py-20 px-4">
         <div className="container mx-auto max-w-4xl text-center">
           <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
             <Heart className="h-4 w-4" />
             <span className="text-sm font-medium">Fondo Solidario</span>
           </div>
           
           <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground animate-fade-in">
             Cuenta Solidaria para <br className="hidden md:block" />
             <span className="text-primary">Juana Blazco</span>
           </h1>
           
           <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
             Fondo destinado a cubrir gastos médicos, medicinas y mantenimiento. 
             Transparencia total en la gestión de todos los recursos recibidos.
           </p>
         </div>
       </section>
 
       {/* Account Status */}
       <section className="pb-12 px-4">
         <div className="container mx-auto max-w-4xl">
           <h2 className="text-xl font-semibold mb-6 text-center">Estado de Cuenta Actual</h2>
           
           {summaryLoading ? (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
               {[...Array(4)].map((_, i) => (
                 <Card key={i}>
                   <CardContent className="p-6">
                     <Skeleton className="h-4 w-20 mb-2" />
                     <Skeleton className="h-8 w-28" />
                   </CardContent>
                 </Card>
               ))}
             </div>
           ) : (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
               {/* Total Ingresos */}
               <Card className="border-income/20 bg-income/5">
                 <CardContent className="p-6">
                   <div className="flex items-center gap-2 text-income mb-2">
                     <TrendingUp className="h-4 w-4" />
                     <span className="text-sm font-medium">Total Ingresos</span>
                   </div>
                   <p className="text-2xl font-bold text-income">
                     Bs. {formatBs(summary?.totalIncomeBs ?? 0)}
                   </p>
                 </CardContent>
               </Card>
 
               {/* Total Egresos */}
               <Card className="border-expense/20 bg-expense/5">
                 <CardContent className="p-6">
                   <div className="flex items-center gap-2 text-expense mb-2">
                     <TrendingDown className="h-4 w-4" />
                     <span className="text-sm font-medium">Total Egresos</span>
                   </div>
                   <p className="text-2xl font-bold text-expense">
                     Bs. {formatBs(summary?.totalExpenseBs ?? 0)}
                   </p>
                 </CardContent>
               </Card>
 
               {/* Saldo Actual */}
               <Card className="border-primary/20 bg-primary/5">
                 <CardContent className="p-6">
                   <div className="flex items-center gap-2 text-primary mb-2">
                     <Wallet className="h-4 w-4" />
                     <span className="text-sm font-medium">Saldo Actual</span>
                   </div>
                   <p className="text-2xl font-bold text-foreground">
                     Bs. {formatBs(summary?.currentBalanceBs ?? 0)}
                   </p>
                 </CardContent>
               </Card>
 
               {/* Saldo USD */}
               <Card className="border-muted">
                 <CardContent className="p-6">
                   <div className="flex items-center gap-2 text-muted-foreground mb-2">
                     <DollarSign className="h-4 w-4" />
                     <span className="text-sm font-medium">Estimado USD</span>
                   </div>
                   {rateLoading ? (
                     <Skeleton className="h-8 w-24" />
                   ) : balanceUsd !== null ? (
                     <>
                       <p className="text-2xl font-bold text-foreground">
                         {formatUsd(balanceUsd)}
                       </p>
                       <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                         <RefreshCw className="h-3 w-3" />
                         Tasa: Bs. {formatBs(exchangeRate?.promedio ?? 0)}
                         {lastUpdate && ` · ${lastUpdate}`}
                       </p>
                     </>
                   ) : (
                     <p className="text-sm text-muted-foreground">
                       No disponible con saldo negativo
                     </p>
                   )}
                 </CardContent>
               </Card>
             </div>
           )}
         </div>
       </section>
 
       {/* CTA */}
       <section className="py-12 px-4 bg-card border-t">
         <div className="container mx-auto max-w-4xl text-center">
           <h3 className="text-xl font-semibold mb-4">
             Consulta todos los movimientos
           </h3>
           <p className="text-muted-foreground mb-6 max-w-md mx-auto">
             Revisa el historial completo de ingresos, egresos y reportes detallados 
             con total transparencia.
           </p>
           <Link to="/dashboard">
             <Button size="lg" className="gap-2">
               Ver movimientos
               <ArrowRight className="h-4 w-4" />
             </Button>
           </Link>
         </div>
       </section>
 
       {/* Footer */}
       <footer className="py-6 px-4 border-t">
         <div className="container mx-auto max-w-4xl text-center text-sm text-muted-foreground">
           <p>Cuenta Solidaria para Juana Blazco · Gestión transparente de recursos</p>
         </div>
       </footer>
     </div>
   );
 }