'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, ArrowUpDown, MoreVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { StockAdjustDialog } from '@/components/inventory/stock-adjust-dialog';
import { SubmitGlobalDialog } from '@/components/inventory/submit-global-dialog';
import { useRouter } from 'next/navigation';

export function InventoryDetailActions({ item }: { item: any }) {
  const [showAdjust, setShowAdjust] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild>
        <Link href={`/dashboard/inventory/${item.id}/edit`}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Link>
      </Button>
      <Button variant="outline" onClick={() => setShowAdjust(true)}>
        <ArrowUpDown className="w-4 h-4 mr-2" />
        Adjust Stock
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem>Deactivate from POS</DropdownMenuItem>
          {item.medicine.scope === 'private' && (
            <DropdownMenuItem onClick={() => setShowSubmit(true)}>Submit to Global DB</DropdownMenuItem>
          )}
          <DropdownMenuItem className="text-rose-600 focus:text-rose-600 focus:bg-rose-50">Delete Medicine</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StockAdjustDialog
        open={showAdjust}
        onOpenChange={setShowAdjust}
        item={item}
        onSuccess={() => router.refresh()}
      />
      <SubmitGlobalDialog
        open={showSubmit}
        onOpenChange={setShowSubmit}
        medicineId={item.medicine_id}
        medicineName={item.medicine.name}
      />
    </div>
  );
}
