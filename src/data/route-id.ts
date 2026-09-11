/** Next.js `useParams` can return `string | string[]`. Mock lookups need a plain string. */
export function routeId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}
