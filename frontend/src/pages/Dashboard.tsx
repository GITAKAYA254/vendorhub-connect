import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { DashboardProducts } from '@/components/dashboard/DashboardProducts';
import { DashboardJobs } from '@/components/dashboard/DashboardJobs';
import { DashboardTasks } from '@/components/dashboard/DashboardTasks';
import { DashboardPaymentSettings } from '@/components/dashboard/DashboardPaymentSettings';

const Dashboard = () => {
  const { user } = useAuthStore();

  if (!user?.isVendor) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Vendor Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your products, jobs, and tasks
        </p>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
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

        <TabsContent value="payments">
          <DashboardPaymentSettings />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Dashboard;
