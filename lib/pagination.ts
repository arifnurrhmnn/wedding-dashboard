export function clampPage(page: number, itemCount: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(itemCount / pageSize));
  return Math.min(Math.max(1, page), totalPages);
}
