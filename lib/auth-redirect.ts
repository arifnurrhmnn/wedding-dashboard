export function accountDestination(status: unknown) {
  if (status === "active") return "/dashboard";
  if (status === "rejected") return "/rejected";
  return "/pending";
}
