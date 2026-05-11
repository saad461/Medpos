'use client';

import { useEffect, useRef } from 'react';
import { usePOSStore } from '@/stores/pos-store';
import { toast } from 'sonner';

const BARCODE_MIN_LENGTH = 6;
const BARCODE_MAX_INTERVAL_MS = 50;

export function BarcodeListener() {
  const barcodeBuffer = useRef('');
  const lastKeyTime = useRef(0);
  const addItem = usePOSStore(state => state.addItem);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTime.current;
      lastKeyTime.current = now;

      // Reset buffer if delay is too long (human typing)
      if (timeSinceLastKey > BARCODE_MAX_INTERVAL_MS && barcodeBuffer.current.length > 0) {
        barcodeBuffer.current = '';
      }

      if (e.key === 'Enter') {
        const barcode = barcodeBuffer.current;
        barcodeBuffer.current = '';

        if (barcode.length >= BARCODE_MIN_LENGTH) {
          e.preventDefault();
          try {
            const res = await fetch(`/api/medicines/search?q=${barcode}&mode=inventory`);
            const data = await res.json();

            if (data.results && data.results.length > 0) {
              const matched = data.results.find((r: { barcode: string }) => r.barcode === barcode) || data.results[0];
              addItem(matched);
              toast.success(`Scanned: ${matched.name}`);
            } else {
              toast.error(`Medicine not found for barcode: ${barcode}`);
            }
          } catch (error) {
            console.error('Barcode lookup failed', error);
          }
        }
        return;
      }

      // Buffer characters
      if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addItem]);

  return null;
}
