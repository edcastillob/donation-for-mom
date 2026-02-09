 import { useState } from 'react';
 import { Link } from 'react-router-dom';
 import { Layout } from '@/components/layout/Layout';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Badge } from '@/components/ui/badge';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { useTransactions, useAccountSummary, useExpensesByCategory } from '@/hooks/useTransactions';
 import { usePersons } from '@/hooks/usePersons';
 import { useExchangeRate } from '@/hooks/useExchangeRate';
 import { getCategoryLabel, EXPENSE_CATEGORIES, type ExpenseCategory } from '@/lib/types';
 import { formatBs, formatUsd } from '@/lib/formatters';
 import { Skeleton } from '@/components/ui/skeleton';
 import { 
   Search, 
   TrendingUp, 
   TrendingDown, 
   Receipt, 
   Eye,
   Wallet,
   DollarSign,
   RefreshCw,
   FileText,
   BarChart3
 } from 'lucide-react';
 import { format } from 'date-fns';
 import { es } from 'date-fns/locale';
 
 export default function Dashboard() {
   const { data: transactions, isLoading: transactionsLoading } = useTransactions();
   const { data: persons } = usePersons();
   const { data: summary, isLoading: summaryLoading } = useAccountSummary();
   const { data: categoryData, isLoading: categoryLoading } = useExpensesByCategory();
   const { data: exchangeRate, isLoading: rateLoading, dataUpdatedAt } = useExchangeRate();
   
   const [searchTerm, setSearchTerm] = useState('');
   const [typeFilter, setTypeFilter] = useState<string>('all');
   const [categoryFilter, setCategoryFilter] = useState<string>('all');
   const [personFilter, setPersonFilter] = useState<string>('all');
   const [activeTab, setActiveTab] = useState('transactions');
 
   const balanceUsd = summary && exchangeRate && summary.currentBalanceBs > 0
     ? summary.currentBalanceBs / exchangeRate.promedio
     : null;
 
   const lastUpdate = dataUpdatedAt 
     ? new Date(dataUpdatedAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
     : null;
 
   const filteredTransactions = transactions?.filter((t) => {
     const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesType = typeFilter === 'all' || t.type === typeFilter;
     const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
     const matchesPerson = personFilter === 'all' || t.person_id === personFilter;
     
     return matchesSearch && matchesType && matchesCategory && matchesPerson;
   });
 
   const incomeTransactions = transactions?.filter(t => t.type === 'income') || [];
   const expenseTransactions = transactions?.filter(t => t.type === 'expense') || [];
 
   const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount_bs), 0);
   const totalExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amount_bs), 0);
 
   return (
     <Layout>
       <div className="space-y-6">
         {/* Header */}
         <div>
           <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
           <p className="text-muted-foreground">
             Estado de cuenta y movimientos en tiempo real
           </p>
         </div>
 
         {/* Summary Cards */}
         <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
           {summaryLoading ? (
             [...Array(4)].map((_, i) => (
               <Card key={i}>
                 <CardContent className="p-4">
                   <Skeleton className="h-4 w-16 mb-2" />
                   <Skeleton className="h-7 w-24" />
                 </CardContent>
               </Card>
             ))
           ) : (
             <>
               <Card>
                 <CardContent className="p-4">
                   <div className="flex items-center gap-2 text-income mb-1">
                     <TrendingUp className="h-4 w-4" />
                     <span className="text-xs font-medium">Ingresos</span>
                   </div>
                   <p className="text-lg md:text-xl font-bold text-income">
                     Bs. {formatBs(summary?.totalIncomeBs ?? 0)}
                   </p>
                 </CardContent>
               </Card>
 
               <Card>
                 <CardContent className="p-4">
                   <div className="flex items-center gap-2 text-expense mb-1">
                     <TrendingDown className="h-4 w-4" />
                     <span className="text-xs font-medium">Egresos</span>
                   </div>
                   <p className="text-lg md:text-xl font-bold text-expense">
                     Bs. {formatBs(summary?.totalExpenseBs ?? 0)}
                   </p>
                 </CardContent>
               </Card>
 
               <Card>
                 <CardContent className="p-4">
                   <div className="flex items-center gap-2 text-primary mb-1">
                     <Wallet className="h-4 w-4" />
                     <span className="text-xs font-medium">Saldo</span>
                   </div>
                   <p className="text-lg md:text-xl font-bold">
                     Bs. {formatBs(summary?.currentBalanceBs ?? 0)}
                   </p>
                 </CardContent>
               </Card>
 
               <Card>
                 <CardContent className="p-4">
                   <div className="flex items-center gap-2 text-muted-foreground mb-1">
                     <DollarSign className="h-4 w-4" />
                     <span className="text-xs font-medium">USD</span>
                   </div>
                   {rateLoading ? (
                     <Skeleton className="h-7 w-20" />
                   ) : balanceUsd !== null ? (
                     <>
                       <p className="text-lg md:text-xl font-bold">{formatUsd(balanceUsd)}</p>
                       <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                         <RefreshCw className="h-2 w-2" />
                         {lastUpdate}
                       </p>
                     </>
                   ) : (
                     <p className="text-sm text-muted-foreground">N/D</p>
                   )}
                 </CardContent>
               </Card>
             </>
           )}
         </div>
 
         {/* Tabs */}
         <Tabs value={activeTab} onValueChange={setActiveTab}>
           <TabsList className="grid w-full grid-cols-4 max-w-lg">
             <TabsTrigger value="transactions" className="text-xs md:text-sm">
               <FileText className="h-4 w-4 md:mr-2" />
               <span className="hidden md:inline">Movimientos</span>
             </TabsTrigger>
             <TabsTrigger value="income" className="text-xs md:text-sm">
               <TrendingUp className="h-4 w-4 md:mr-2" />
               <span className="hidden md:inline">Ingresos</span>
             </TabsTrigger>
             <TabsTrigger value="expense" className="text-xs md:text-sm">
               <TrendingDown className="h-4 w-4 md:mr-2" />
               <span className="hidden md:inline">Egresos</span>
             </TabsTrigger>
             <TabsTrigger value="reports" className="text-xs md:text-sm">
               <BarChart3 className="h-4 w-4 md:mr-2" />
               <span className="hidden md:inline">Reportes</span>
             </TabsTrigger>
           </TabsList>
 
           {/* All Transactions */}
           <TabsContent value="transactions" className="space-y-4">
             <Card>
               <CardHeader className="pb-3">
                 <CardTitle className="text-base">Filtros</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid gap-3 md:grid-cols-4">
                   <div className="relative md:col-span-1">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                       placeholder="Buscar..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="pl-9"
                     />
                   </div>
                   
                   <Select value={typeFilter} onValueChange={setTypeFilter}>
                     <SelectTrigger>
                       <SelectValue placeholder="Tipo" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">Todos</SelectItem>
                       <SelectItem value="income">Ingresos</SelectItem>
                       <SelectItem value="expense">Egresos</SelectItem>
                     </SelectContent>
                   </Select>
                   
                   <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                     <SelectTrigger>
                       <SelectValue placeholder="Categoría" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">Todas</SelectItem>
                       {EXPENSE_CATEGORIES.map((cat) => (
                         <SelectItem key={cat.value} value={cat.value}>
                           {cat.label}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   
                   <Select value={personFilter} onValueChange={setPersonFilter}>
                     <SelectTrigger>
                       <SelectValue placeholder="Persona" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">Todas</SelectItem>
                       {persons?.map((person) => (
                         <SelectItem key={person.id} value={person.id}>
                           {person.full_name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
               </CardContent>
             </Card>
 
             <Card>
               <CardContent className="p-0">
                 {transactionsLoading ? (
                   <div className="p-6 space-y-3">
                     {[...Array(5)].map((_, i) => (
                       <Skeleton key={i} className="h-12 w-full" />
                     ))}
                   </div>
                 ) : filteredTransactions?.length === 0 ? (
                   <div className="p-12 text-center text-muted-foreground">
                     No se encontraron transacciones
                   </div>
                 ) : (
                   <div className="overflow-x-auto">
                     <Table>
                       <TableHeader>
                         <TableRow>
                           <TableHead className="w-24">Fecha</TableHead>
                           <TableHead>Persona</TableHead>
                           <TableHead className="w-20">Tipo</TableHead>
                           <TableHead>Categoría</TableHead>
                           <TableHead className="hidden md:table-cell">Descripción</TableHead>
                           <TableHead className="text-right">Monto</TableHead>
                           <TableHead className="w-12"></TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {filteredTransactions?.map((t) => (
                           <TableRow key={t.id}>
                             <TableCell className="text-xs md:text-sm">
                               {format(new Date(t.date), 'dd/MM/yy', { locale: es })}
                             </TableCell>
                             <TableCell className="text-xs md:text-sm">
                               {t.person?.full_name || '-'}
                             </TableCell>
                             <TableCell>
                               <div className="flex items-center gap-1">
                                 {t.type === 'income' ? (
                                   <TrendingUp className="h-3 w-3 text-income" />
                                 ) : (
                                   <TrendingDown className="h-3 w-3 text-expense" />
                                 )}
                                 <span className="text-xs hidden sm:inline">
                                   {t.type === 'income' ? 'Ingreso' : 'Egreso'}
                                 </span>
                               </div>
                             </TableCell>
                             <TableCell>
                               {t.category ? (
                                 <Badge variant="outline" className="text-xs">
                                   {getCategoryLabel(t.category as ExpenseCategory)}
                                 </Badge>
                               ) : '-'}
                             </TableCell>
                             <TableCell className="hidden md:table-cell max-w-48 truncate">
                               <div className="flex items-center gap-1">
                                 {t.description}
                                 {t.receipt_image_url && <Receipt className="h-3 w-3 text-muted-foreground" />}
                               </div>
                             </TableCell>
                             <TableCell className={`text-right font-semibold text-xs md:text-sm ${
                               t.type === 'income' ? 'text-income' : 'text-expense'
                             }`}>
                               {t.type === 'income' ? '+' : '-'}{formatBs(t.amount_bs)}
                             </TableCell>
                             <TableCell>
                               <Link to={`/transaccion/${t.id}`}>
                                 <Button variant="ghost" size="icon" className="h-8 w-8">
                                   <Eye className="h-4 w-4" />
                                 </Button>
                               </Link>
                             </TableCell>
                           </TableRow>
                         ))}
                       </TableBody>
                     </Table>
                   </div>
                 )}
               </CardContent>
             </Card>
           </TabsContent>
 
           {/* Income Report */}
           <TabsContent value="income" className="space-y-4">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <TrendingUp className="h-5 w-5 text-income" />
                   Reporte de Ingresos
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="mb-4 p-4 bg-income/10 rounded-lg">
                   <p className="text-sm text-muted-foreground">Total de Ingresos</p>
                   <p className="text-2xl font-bold text-income">Bs. {formatBs(totalIncome)}</p>
                 </div>
                 
                 {incomeTransactions.length === 0 ? (
                   <p className="text-center text-muted-foreground py-8">No hay ingresos registrados</p>
                 ) : (
                   <div className="overflow-x-auto">
                     <Table>
                       <TableHeader>
                         <TableRow>
                           <TableHead>Fecha</TableHead>
                           <TableHead>Persona</TableHead>
                           <TableHead>Descripción</TableHead>
                           <TableHead className="text-right">Monto</TableHead>
                           <TableHead className="w-12"></TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {incomeTransactions.map((t) => (
                           <TableRow key={t.id}>
                             <TableCell>{format(new Date(t.date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                             <TableCell>{t.person?.full_name || '-'}</TableCell>
                             <TableCell>{t.description}</TableCell>
                             <TableCell className="text-right font-semibold text-income">
                               +Bs. {formatBs(t.amount_bs)}
                             </TableCell>
                             <TableCell>
                               <Link to={`/transaccion/${t.id}`}>
                                 <Button variant="ghost" size="icon" className="h-8 w-8">
                                   <Eye className="h-4 w-4" />
                                 </Button>
                               </Link>
                             </TableCell>
                           </TableRow>
                         ))}
                       </TableBody>
                     </Table>
                   </div>
                 )}
               </CardContent>
             </Card>
           </TabsContent>
 
           {/* Expense Report */}
           <TabsContent value="expense" className="space-y-4">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <TrendingDown className="h-5 w-5 text-expense" />
                   Reporte de Egresos
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="mb-4 p-4 bg-expense/10 rounded-lg">
                   <p className="text-sm text-muted-foreground">Total de Egresos</p>
                   <p className="text-2xl font-bold text-expense">Bs. {formatBs(totalExpense)}</p>
                 </div>
 
                 {/* Category breakdown */}
                 {!categoryLoading && categoryData && Object.keys(categoryData).length > 0 && (
                   <div className="mb-6">
                     <h4 className="text-sm font-medium mb-3">Por Categoría</h4>
                     <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                       {Object.entries(categoryData).map(([cat, amount]) => (
                         <div key={cat} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                           <span className="text-sm">{getCategoryLabel(cat as ExpenseCategory)}</span>
                           <span className="font-semibold text-expense">Bs. {formatBs(amount)}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
                 
                 {expenseTransactions.length === 0 ? (
                   <p className="text-center text-muted-foreground py-8">No hay egresos registrados</p>
                 ) : (
                   <div className="overflow-x-auto">
                     <Table>
                       <TableHeader>
                         <TableRow>
                           <TableHead>Fecha</TableHead>
                           <TableHead>Categoría</TableHead>
                           <TableHead>Persona</TableHead>
                           <TableHead className="hidden md:table-cell">Descripción</TableHead>
                           <TableHead className="text-right">Monto</TableHead>
                           <TableHead className="w-12"></TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {expenseTransactions.map((t) => (
                           <TableRow key={t.id}>
                             <TableCell>{format(new Date(t.date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                             <TableCell>
                               <Badge variant="outline">
                                 {t.category ? getCategoryLabel(t.category as ExpenseCategory) : '-'}
                               </Badge>
                             </TableCell>
                             <TableCell>{t.person?.full_name || '-'}</TableCell>
                             <TableCell className="hidden md:table-cell">{t.description}</TableCell>
                             <TableCell className="text-right font-semibold text-expense">
                               -Bs. {formatBs(t.amount_bs)}
                             </TableCell>
                             <TableCell>
                               <Link to={`/transaccion/${t.id}`}>
                                 <Button variant="ghost" size="icon" className="h-8 w-8">
                                   <Eye className="h-4 w-4" />
                                 </Button>
                               </Link>
                             </TableCell>
                           </TableRow>
                         ))}
                       </TableBody>
                     </Table>
                   </div>
                 )}
               </CardContent>
             </Card>
           </TabsContent>
 
           {/* Reports Summary */}
           <TabsContent value="reports" className="space-y-4">
             <div className="grid gap-4 md:grid-cols-2">
               <Card>
                 <CardHeader>
                   <CardTitle className="text-base flex items-center gap-2">
                     <TrendingUp className="h-4 w-4 text-income" />
                     Resumen de Ingresos
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-3xl font-bold text-income mb-2">
                     Bs. {formatBs(totalIncome)}
                   </p>
                   <p className="text-sm text-muted-foreground">
                     {incomeTransactions.length} transacciones
                   </p>
                 </CardContent>
               </Card>
 
               <Card>
                 <CardHeader>
                   <CardTitle className="text-base flex items-center gap-2">
                     <TrendingDown className="h-4 w-4 text-expense" />
                     Resumen de Egresos
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-3xl font-bold text-expense mb-2">
                     Bs. {formatBs(totalExpense)}
                   </p>
                   <p className="text-sm text-muted-foreground">
                     {expenseTransactions.length} transacciones
                   </p>
                 </CardContent>
               </Card>
             </div>
 
             {/* Distribution by category */}
             {!categoryLoading && categoryData && Object.keys(categoryData).length > 0 && (
               <Card>
                 <CardHeader>
                   <CardTitle className="text-base">Distribución por Categoría</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-3">
                     {Object.entries(categoryData)
                       .sort(([,a], [,b]) => b - a)
                       .map(([cat, amount]) => {
                         const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                         return (
                           <div key={cat} className="space-y-1">
                             <div className="flex items-center justify-between text-sm">
                               <span>{getCategoryLabel(cat as ExpenseCategory)}</span>
                               <span className="font-medium">
                                 Bs. {formatBs(amount)} ({percentage.toFixed(1)}%)
                               </span>
                             </div>
                             <div className="h-2 bg-muted rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-primary rounded-full transition-all"
                                 style={{ width: `${percentage}%` }}
                               />
                             </div>
                           </div>
                         );
                       })}
                   </div>
                 </CardContent>
               </Card>
             )}
 
             {/* General summary */}
             <Card>
               <CardHeader>
                 <CardTitle className="text-base">Balance General</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid gap-4 md:grid-cols-3">
                   <div className="text-center p-4 bg-income/10 rounded-lg">
                     <p className="text-sm text-muted-foreground mb-1">Total Ingresos</p>
                     <p className="text-xl font-bold text-income">Bs. {formatBs(totalIncome)}</p>
                   </div>
                   <div className="text-center p-4 bg-expense/10 rounded-lg">
                     <p className="text-sm text-muted-foreground mb-1">Total Egresos</p>
                     <p className="text-xl font-bold text-expense">Bs. {formatBs(totalExpense)}</p>
                   </div>
                   <div className="text-center p-4 bg-primary/10 rounded-lg">
                     <p className="text-sm text-muted-foreground mb-1">Saldo Disponible</p>
                     <p className="text-xl font-bold">Bs. {formatBs(totalIncome - totalExpense)}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
         </Tabs>
       </div>
     </Layout>
   );
 }