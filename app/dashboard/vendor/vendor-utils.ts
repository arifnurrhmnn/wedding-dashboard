import type { Vendor } from "@/redux/slices/vendorSlice";

export function totalContractValue(vendors: Vendor[]) {
  return vendors.reduce((total, vendor) => {
    if (vendor.status !== "deal") return total;
    return total + (vendor.vendor_packages?.find((pkg) => pkg.is_final)?.harga ?? 0);
  }, 0);
}
