import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "@/lib/axiosClient";

// ── Types ──────────────────────────────────────────────────────────────
export interface BudgetSettings {
  id: string;
  total_budget: number;
  catatan?: string;
  updated_at?: string;
}

export interface BudgetCategory {
  id: string;
  nama: string;
  icon: string;
  urutan: number;
  created_at?: string;
  items?: BudgetItem[];
}

export interface BudgetItem {
  id: string;
  category_id: string;
  nama: string;
  estimasi: number;
  realisasi: number;
  dp: number;
  tanggal_dp?: string;
  tanggal_lunas?: string;
  status: "belum_bayar" | "dp" | "lunas";
  tanggal_bayar?: string;
  catatan?: string;
  vendor_id?: string;
  vendor_nama?: string;
  created_at?: string;
  updated_at?: string;
}

interface BudgetState {
  settings: BudgetSettings | null;
  categories: BudgetCategory[];
  items: BudgetItem[];
  loading: boolean;
  error: string | null;
}

// ── Thunks ─────────────────────────────────────────────────────────────

// Settings
export const fetchBudgetSettings = createAsyncThunk(
  "budget/fetchSettings",
  async () => {
    const res = await axiosClient.get("/budget/settings");
    return res.data as BudgetSettings | null;
  }
);

export const upsertBudgetSettings = createAsyncThunk(
  "budget/upsertSettings",
  async (data: { total_budget: number; catatan?: string }) => {
    const res = await axiosClient.patch("/budget/settings", data);
    return res.data as BudgetSettings;
  }
);

// Categories
export const fetchBudgetCategories = createAsyncThunk(
  "budget/fetchCategories",
  async () => {
    const res = await axiosClient.get("/budget/categories");
    return res.data as BudgetCategory[];
  }
);

export const addBudgetCategory = createAsyncThunk(
  "budget/addCategory",
  async (data: { nama: string; icon: string; urutan?: number }) => {
    const res = await axiosClient.post("/budget/categories", data);
    return res.data as BudgetCategory;
  }
);

export const updateBudgetCategory = createAsyncThunk(
  "budget/updateCategory",
  async ({
    id,
    data,
  }: {
    id: string;
    data: { nama: string; icon: string };
  }) => {
    const res = await axiosClient.patch(`/budget/categories/${id}`, data);
    return res.data as BudgetCategory;
  }
);

export const deleteBudgetCategory = createAsyncThunk(
  "budget/deleteCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/budget/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Gagal menghapus kategori"
      );
    }
  }
);

export const generateDefaultCategories = createAsyncThunk(
  "budget/generateDefault",
  async () => {
    const res = await axiosClient.post("/budget/categories/generate-default");
    return res.data as BudgetCategory[];
  }
);

// Items
export const fetchBudgetItems = createAsyncThunk(
  "budget/fetchItems",
  async () => {
    const res = await axiosClient.get("/budget");
    return res.data as BudgetItem[];
  }
);

export const addBudgetItem = createAsyncThunk(
  "budget/addItem",
  async (
    data: Omit<BudgetItem, "id" | "created_at" | "updated_at" | "vendor_nama">
  ) => {
    const res = await axiosClient.post("/budget", data);
    return res.data as BudgetItem;
  }
);

export const updateBudgetItem = createAsyncThunk(
  "budget/updateItem",
  async ({
    id,
    data,
  }: {
    id: string;
    data: Partial<Omit<BudgetItem, "id" | "created_at">>;
  }) => {
    const res = await axiosClient.patch(`/budget/${id}`, data);
    return res.data as BudgetItem;
  }
);

export const deleteBudgetItem = createAsyncThunk(
  "budget/deleteItem",
  async (id: string) => {
    await axiosClient.delete(`/budget/${id}`);
    return id;
  }
);

// ── Slice ──────────────────────────────────────────────────────────────
const initialState: BudgetState = {
  settings: null,
  categories: [],
  items: [],
  loading: false,
  error: null,
};

const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Settings
    builder
      .addCase(fetchBudgetSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(upsertBudgetSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });

    // Categories
    builder
      .addCase(fetchBudgetCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBudgetCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchBudgetCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      .addCase(addBudgetCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateBudgetCategory.fulfilled, (state, action) => {
        const idx = state.categories.findIndex(
          (c) => c.id === action.payload.id
        );
        if (idx !== -1)
          state.categories[idx] = {
            ...state.categories[idx],
            ...action.payload,
          };
      })
      .addCase(deleteBudgetCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c.id !== action.payload
        );
        state.items = state.items.filter(
          (i) => i.category_id !== action.payload
        );
      })
      .addCase(generateDefaultCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });

    // Items
    builder
      .addCase(fetchBudgetItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBudgetItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBudgetItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      .addCase(addBudgetItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateBudgetItem.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteBudgetItem.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      });
  },
});

export default budgetSlice.reducer;
