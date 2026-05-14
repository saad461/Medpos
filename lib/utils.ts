import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPKR(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace("PKR", "Rs.")
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // remove special chars
    .replace(/[\s_-]+/g, '-')    // replace spaces with hyphens
    .replace(/^-+|-+$/g, '')     // trim hyphens from ends
}

export async function generateUniqueSlug(
  baseName: string,
  supabaseAdminClient: any
): Promise<string> {
  let slug = slugify(baseName)
  let counter = 1

  while (true) {
    const { data } = await supabaseAdminClient
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!data) return slug // slug is available

    slug = `${slugify(baseName)}-${counter}`
    counter++

    if (counter > 10) {
      // Fallback: add timestamp
      slug = `${slugify(baseName)}-${Date.now()}`
      return slug
    }
  }
}
