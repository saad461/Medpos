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

export function generateUniqueSlug(baseName: string, existingSlugs: string[]): string {
  let slug = slugify(baseName)
  let counter = 1
  while (existingSlugs.includes(slug)) {
    slug = `${slugify(baseName)}-${counter}`
    counter++
  }
  return slug
}
