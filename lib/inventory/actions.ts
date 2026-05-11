import { revalidatePath } from 'next/cache';

export async function addMedicineToInventory(data: any) {
  const response = await fetch('/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (response.ok) revalidatePath('/dashboard/inventory');
  return result;
}

export async function updateMedicine(id: string, data: any) {
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (response.ok) {
    revalidatePath(`/dashboard/inventory/${id}`);
    revalidatePath('/dashboard/inventory');
  }
  return result;
}

export async function adjustStock(data: any) {
  const response = await fetch('/api/inventory/adjust-stock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (response.ok) {
    revalidatePath(`/dashboard/inventory/${data.store_medicine_id}`);
    revalidatePath('/dashboard/inventory');
  }
  return result;
}

export async function deleteMedicine(id: string) {
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'DELETE',
  });
  const result = await response.json();
  if (response.ok) revalidatePath('/dashboard/inventory');
  return result;
}
