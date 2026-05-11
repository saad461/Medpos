'use client';

import { POSLayout } from '@/components/pos/pos-layout';
import { KeyboardShortcuts } from '@/components/pos/keyboard-shortcuts';
import { BarcodeListener } from '@/components/pos/barcode-listener';
import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function POSPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user?.role === 'pharmacist') {
      toast.error('Pharmacists do not have POS access');
      redirect('/dashboard');
    }
  }, [user, loading]);

  if (loading) return null;
  if (!user || user.role === 'pharmacist') return null;

  return (
    <div className="-m-4 lg:-m-8 h-[calc(100vh-64px)] overflow-hidden">
      <KeyboardShortcuts />
      <BarcodeListener />
      <POSLayout />
    </div>
  );
}
