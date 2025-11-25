import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { DashboardProducts } from '@/components/dashboard/DashboardProducts';
import { DashboardJobs } from '@/components/dashboard/DashboardJobs';
import { DashboardTasks } from '@/components/dashboard/DashboardTasks';

const Dashboard = () => {
  const { user } = useAuthStore();

  if (!user?.isVendor) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Vendor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your products, jobs, and tasks
          </p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <DashboardProducts />
          </TabsContent>

          <TabsContent value="jobs">
            <DashboardJobs />
          </TabsContent>

          <TabsContent value="tasks">
            <DashboardTasks />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
