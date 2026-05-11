'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddMedicineForm } from '@/components/inventory/add-medicine-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddMedicinePage() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/dashboard/inventory">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Medicine</h1>
          <p className="text-muted-foreground">Add medicines from the global DRAP database or create custom items.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="search" className="text-sm font-semibold">Search DRAP Database</TabsTrigger>
          <TabsTrigger value="custom" className="text-sm font-semibold">Add Custom Medicine</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-6">
          <AddMedicineForm mode="search" />
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <AddMedicineForm mode="custom" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
