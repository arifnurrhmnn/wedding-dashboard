import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "@/lib/axiosClient";

export interface VendorPackage {
  id: string;
  vendor_id: string;
  nama_paket: string;
  deskripsi?: string;
  harga: number;
  is_final: boolean;
  created_at?: string;
}

export interface VendorActivityLog {
  id: string;
  vendor_id: string;
  aktivitas: string;
  tanggal: string;
  catatan?: string;
  created_at?: string;
}

export interface VendorDocument {
  id: string;
  vendor_id: string;
  nama: string;
  tipe: string;
  file_url: string;
  file_name: string;
  uploaded_at?: string;
}

export interface Vendor {
  id: string;
  nama: string;
  kategori: string;
  kontak_nama?: string;
  kontak_wa?: string;
  kontak_email?: string;
  website?: string;
  instagram?: string;
  alamat?: string;
  catatan?: string;
  status: "prospek" | "negosiasi" | "deal" | "batal";
  rating?: number;
  vendor_packages?: VendorPackage[];
  vendor_activity_logs?: VendorActivityLog[];
  vendor_documents?: VendorDocument[];
  created_at?: string;
  updated_at?: string;
}

interface VendorState {
  list: Vendor[];
  selectedVendor: Vendor | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}

const initialState: VendorState = {
  list: [],
  selectedVendor: null,
  loading: false,
  detailLoading: false,
  error: null,
};

// ─── Thunks ──────────────────────────────────────────────

export const fetchVendors = createAsyncThunk(
  "vendor/fetchVendors",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/vendor");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to fetch vendors"
      );
    }
  }
);

export const fetchVendorDetail = createAsyncThunk(
  "vendor/fetchVendorDetail",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(`/vendor/${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to fetch vendor detail"
      );
    }
  }
);

export const addVendor = createAsyncThunk(
  "vendor/addVendor",
  async (data: Omit<Vendor, "id">, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/vendor", data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to add vendor"
      );
    }
  }
);

export const updateVendor = createAsyncThunk(
  "vendor/updateVendor",
  async (
    { id, data }: { id: string; data: Partial<Vendor> },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosClient.patch(`/vendor/${id}`, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to update vendor"
      );
    }
  }
);

export const deleteVendor = createAsyncThunk(
  "vendor/deleteVendor",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/vendor/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to delete vendor"
      );
    }
  }
);

export const updateVendorStatus = createAsyncThunk(
  "vendor/updateVendorStatus",
  async (
    { id, status }: { id: string; status: Vendor["status"] },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosClient.patch(`/vendor/${id}/status`, { status });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to update status"
      );
    }
  }
);

// ── Packages ──
export const addVendorPackage = createAsyncThunk(
  "vendor/addPackage",
  async (
    {
      vendorId,
      data,
    }: { vendorId: string; data: Omit<VendorPackage, "id" | "vendor_id"> },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosClient.post(`/vendor/${vendorId}/packages`, data);
      return { vendorId, pkg: res.data };
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to add package"
      );
    }
  }
);

export const updateVendorPackage = createAsyncThunk(
  "vendor/updatePackage",
  async (
    {
      vendorId,
      packageId,
      data,
    }: { vendorId: string; packageId: string; data: Partial<VendorPackage> },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosClient.patch(
        `/vendor/${vendorId}/packages/${packageId}`,
        data
      );
      return { vendorId, pkg: res.data };
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to update package"
      );
    }
  }
);

export const deleteVendorPackage = createAsyncThunk(
  "vendor/deletePackage",
  async (
    { vendorId, packageId }: { vendorId: string; packageId: string },
    { rejectWithValue }
  ) => {
    try {
      await axiosClient.delete(`/vendor/${vendorId}/packages/${packageId}`);
      return { vendorId, packageId };
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to delete package"
      );
    }
  }
);

export const setFinalPackage = createAsyncThunk(
  "vendor/setFinalPackage",
  async (
    { vendorId, packageId }: { vendorId: string; packageId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosClient.post(
        `/vendor/${vendorId}/packages/${packageId}/set-final`
      );
      return { vendorId, pkg: res.data };
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to set final package"
      );
    }
  }
);

// ── Activity Logs ──
export const addActivityLog = createAsyncThunk(
  "vendor/addActivityLog",
  async (
    {
      vendorId,
      data,
    }: { vendorId: string; data: Omit<VendorActivityLog, "id" | "vendor_id"> },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosClient.post(
        `/vendor/${vendorId}/activity-logs`,
        data
      );
      return { vendorId, log: res.data };
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to add activity log"
      );
    }
  }
);

export const deleteActivityLog = createAsyncThunk(
  "vendor/deleteActivityLog",
  async (
    { vendorId, logId }: { vendorId: string; logId: string },
    { rejectWithValue }
  ) => {
    try {
      await axiosClient.delete(`/vendor/${vendorId}/activity-logs/${logId}`);
      return { vendorId, logId };
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to delete activity log"
      );
    }
  }
);

// ─── Slice ────────────────────────────────────────────────

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    clearSelectedVendor(state) {
      state.selectedVendor = null;
    },
  },
  extraReducers: (builder) => {
    // fetchVendors
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchVendorDetail
    builder
      .addCase(fetchVendorDetail.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchVendorDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedVendor = action.payload;
      })
      .addCase(fetchVendorDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      });

    // addVendor
    builder
      .addCase(addVendor.pending, (state) => {
        state.loading = true;
      })
      .addCase(addVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(addVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateVendor
    builder
      .addCase(updateVendor.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.list.findIndex((v) => v.id === action.payload.id);
        if (idx !== -1)
          state.list[idx] = { ...state.list[idx], ...action.payload };
        if (state.selectedVendor?.id === action.payload.id) {
          state.selectedVendor = { ...state.selectedVendor, ...action.payload };
        }
      })
      .addCase(updateVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // deleteVendor
    builder.addCase(deleteVendor.fulfilled, (state, action) => {
      state.list = state.list.filter((v) => v.id !== action.payload);
    });

    // updateVendorStatus
    builder.addCase(updateVendorStatus.fulfilled, (state, action) => {
      const idx = state.list.findIndex((v) => v.id === action.payload.id);
      if (idx !== -1)
        state.list[idx] = { ...state.list[idx], ...action.payload };
      if (state.selectedVendor?.id === action.payload.id) {
        state.selectedVendor = { ...state.selectedVendor, ...action.payload };
      }
    });

    // addVendorPackage
    builder.addCase(addVendorPackage.fulfilled, (state, action) => {
      const { vendorId, pkg } = action.payload;
      const vendor = state.list.find((v) => v.id === vendorId);
      if (vendor)
        vendor.vendor_packages = [...(vendor.vendor_packages || []), pkg];
      if (state.selectedVendor?.id === vendorId) {
        state.selectedVendor.vendor_packages = [
          ...(state.selectedVendor.vendor_packages || []),
          pkg,
        ];
      }
    });

    // updateVendorPackage
    builder.addCase(updateVendorPackage.fulfilled, (state, action) => {
      const { vendorId, pkg } = action.payload;
      const updatePkgs = (pkgs?: VendorPackage[]) =>
        pkgs?.map((p) => (p.id === pkg.id ? pkg : p));
      const vendor = state.list.find((v) => v.id === vendorId);
      if (vendor) vendor.vendor_packages = updatePkgs(vendor.vendor_packages);
      if (state.selectedVendor?.id === vendorId) {
        state.selectedVendor.vendor_packages = updatePkgs(
          state.selectedVendor.vendor_packages
        );
      }
    });

    // deleteVendorPackage
    builder.addCase(deleteVendorPackage.fulfilled, (state, action) => {
      const { vendorId, packageId } = action.payload;
      const filter = (pkgs?: VendorPackage[]) =>
        pkgs?.filter((p) => p.id !== packageId);
      const vendor = state.list.find((v) => v.id === vendorId);
      if (vendor) vendor.vendor_packages = filter(vendor.vendor_packages);
      if (state.selectedVendor?.id === vendorId) {
        state.selectedVendor.vendor_packages = filter(
          state.selectedVendor.vendor_packages
        );
      }
    });

    // setFinalPackage — reset semua lalu tandai satu
    builder.addCase(setFinalPackage.fulfilled, (state, action) => {
      const { vendorId, pkg } = action.payload;
      const markFinal = (pkgs?: VendorPackage[]) =>
        pkgs?.map((p) => ({ ...p, is_final: p.id === pkg.id }));
      const vendor = state.list.find((v) => v.id === vendorId);
      if (vendor) {
        vendor.vendor_packages = markFinal(vendor.vendor_packages);
        vendor.status = "deal";
      }
      if (state.selectedVendor?.id === vendorId) {
        state.selectedVendor.vendor_packages = markFinal(
          state.selectedVendor.vendor_packages
        );
        state.selectedVendor.status = "deal";
      }
    });

    // addActivityLog
    builder.addCase(addActivityLog.fulfilled, (state, action) => {
      const { vendorId, log } = action.payload;
      const vendor = state.list.find((v) => v.id === vendorId);
      if (vendor)
        vendor.vendor_activity_logs = [
          log,
          ...(vendor.vendor_activity_logs || []),
        ];
      if (state.selectedVendor?.id === vendorId) {
        state.selectedVendor.vendor_activity_logs = [
          log,
          ...(state.selectedVendor.vendor_activity_logs || []),
        ];
      }
    });

    // deleteActivityLog
    builder.addCase(deleteActivityLog.fulfilled, (state, action) => {
      const { vendorId, logId } = action.payload;
      const filter = (logs?: VendorActivityLog[]) =>
        logs?.filter((l) => l.id !== logId);
      const vendor = state.list.find((v) => v.id === vendorId);
      if (vendor)
        vendor.vendor_activity_logs = filter(vendor.vendor_activity_logs);
      if (state.selectedVendor?.id === vendorId) {
        state.selectedVendor.vendor_activity_logs = filter(
          state.selectedVendor.vendor_activity_logs
        );
      }
    });
  },
});

export const { clearSelectedVendor } = vendorSlice.actions;
export default vendorSlice.reducer;
