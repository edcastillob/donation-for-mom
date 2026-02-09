import { Layout } from '@/components/layout/Layout';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Estado de Cuenta</h2>
          <p className="text-muted-foreground">
            Transparencia total en la gestión de recursos para Juana Blazco
          </p>
        </div>
        
        <SummaryCards />
        
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryChart />
          <RecentTransactions />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
