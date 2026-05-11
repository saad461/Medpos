'use client';

import { useEffect } from 'react';
import { usePOSStore } from '@/stores/pos-store';

export function KeyboardShortcuts() {
  const { items, clearCart } = usePOSStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a text field,
      // UNLESS it's an F-key which are usually reserved for POS actions
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'F1') {
        e.preventDefault();
        if (items.length > 0) {
          if (confirm('Start new sale? Current cart will be cleared.')) {
            clearCart();
            window.dispatchEvent(new CustomEvent('focus-pos-search'));
          }
        } else {
          window.dispatchEvent(new CustomEvent('focus-pos-search'));
        }
      }

      if (e.key === 'F2') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('focus-pos-search'));
      }

      if (e.key === 'F10') {
        e.preventDefault();
        // Trigger checkout - this requires more complex wiring or a shared state/event
        window.dispatchEvent(new CustomEvent('trigger-pos-checkout'));
      }

      if (e.key === 'Escape' && !isInput) {
        // Clear search or close modals
        window.dispatchEvent(new CustomEvent('pos-esc-press'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, clearCart]);

  return null;
}
