import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/contexts/AuthContext';
import { TransactionForm } from '@/components/admin/TransactionForm';
import { TransactionList } from '@/components/admin/TransactionList';
import { List, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuthContext();
  const [activeTab, setActiveTab] = useState('income');

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center space-y-4">
              <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">Acceso Restringido</h2>
              <p className="text-muted-foreground mb-4">
                Necesitas permisos de administrador para acceder
              </p>
              <Button onClick={() => navigate('/login')}>
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Administración</h1>
          <p className="text-muted-foreground">
            Registra y gestiona ingresos y egresos
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-sm">
            <TabsTrigger value="income" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Ingreso</span>
            </TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Egreso</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Gestionar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-income">
                  <TrendingUp className="h-5 w-5" />
                  Registrar Ingreso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionForm type="income" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expense">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-expense">
                  <TrendingDown className="h-5 w-5" />
                  Registrar Egreso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionForm type="expense" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Gestionar Transacciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
