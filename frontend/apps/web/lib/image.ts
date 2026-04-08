/**
 * Resolve a product imageUrl from the backend.
 * Backend stores relative paths like "/uploads/image-xxx.jpg".
 * These must be prefixed with the API base URL to display correctly.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function resolveImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  // Already absolute (e.g., https://... or http://...)
  if (imageUrl.startsWith("http")) return imageUrl;
  // Relative path from backend — prepend API_BASE
  return `${API_BASE}${imageUrl}`;
}
