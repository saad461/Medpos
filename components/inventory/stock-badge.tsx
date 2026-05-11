import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { isBefore, addDays } from 'date-fns';

interface Props {
  stockQty: number;
  reorderLevel: number;
  expiryDate?: string;
  className?: string;
}

export function StockBadge({ stockQty, reorderLevel, expiryDate, className }: Props) {
  const today = new Date();
  const expiry = expiryDate ? new Date(expiryDate) : null;

  const isExpired = expiry && isBefore(expiry, today);
  const isExpiringSoon = expiry && !isExpired && isBefore(expiry, addDays(today, 30));
  const isOutOfStock = stockQty === 0;
  const isLowStock = !isOutOfStock && stockQty <= reorderLevel;

  if (isExpired) {
    return (
      <Badge className={cn("bg-rose-600 text-white hover:bg-rose-700 border-none", className)}>
        Expired
      </Badge>
    );
  }

  if (isOutOfStock) {
    return (
      <Badge variant="outline" className={cn("bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800", className)}>
        Out of Stock
      </Badge>
    );
  }

  if (isLowStock) {
    return (
      <Badge variant="outline" className={cn("bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800", className)}>
        Low Stock
      </Badge>
    );
  }

  if (isExpiringSoon) {
    return (
      <Badge variant="outline" className={cn("bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800", className)}>
        Expiring Soon
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn("bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800", className)}>
      In Stock
    </Badge>
  );
}
