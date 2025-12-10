import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "@/lib/axiosClient";

export interface Seserahan {
  id: string;
  unique_id?: string;
  nama_item: string;
  kategori: string;
  brand?: string;
  status_pembelian: string;
  harga: number;
  link_marketplace?: string;
  catatan?: string;
  foto_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface SeserahanState {
  list: Seserahan[];
  loading: boolean;
  error: string | null;
}

const initialState: SeserahanState = {
  list: [],
  loading: false,
  error: null,
};

// Thunks
export const fetchSeserahan = createAsyncThunk(
  "seserahan/fetchSeserahan",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/seserahan");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to fetch seserahan"
      );
    }
  }
);

export const addSeserahan = createAsyncThunk(
  "seserahan/addSeserahan",
  async (data: Omit<Seserahan, "id">, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/seserahan", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to add seserahan"
      );
    }
  }
);

export const updateSeserahan = createAsyncThunk(
  "seserahan/updateSeserahan",
  async (
    { id, data }: { id: string; data: Partial<Seserahan> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosClient.patch(`/seserahan/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to update seserahan"
      );
    }
  }
);

export const inlineUpdateSeserahan = createAsyncThunk(
  "seserahan/inlineUpdateSeserahan",
  async (
    { id, field, value }: { id: string; field: string; value: string | number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosClient.patch(`/seserahan/${id}`, {
        [field]: value,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to update seserahan"
      );
    }
  }
);

export const deleteSeserahan = createAsyncThunk(
  "seserahan/deleteSeserahan",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/seserahan/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to delete seserahan"
      );
    }
  }
);

const seserahanSlice = createSlice({
  name: "seserahan",
  initialState,
  reducers: {
    setList: (state, action: PayloadAction<Seserahan[]>) => {
      state.list = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Seserahan
    builder.addCase(fetchSeserahan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSeserahan.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload;
    });
    builder.addCase(fetchSeserahan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add Seserahan
    builder.addCase(addSeserahan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addSeserahan.fulfilled, (state, action) => {
      state.loading = false;
      state.list.push(action.payload);
    });
    builder.addCase(addSeserahan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Seserahan
    builder.addCase(updateSeserahan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateSeserahan.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.list.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    });
    builder.addCase(updateSeserahan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Inline Update Seserahan
    builder.addCase(inlineUpdateSeserahan.fulfilled, (state, action) => {
      const index = state.list.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    });

    // Delete Seserahan
    builder.addCase(deleteSeserahan.fulfilled, (state, action) => {
      const index = state.list.findIndex((s) => s.id === action.payload);
      if (index !== -1) {
        state.list.splice(index, 1);
      }
    });
  },
});

export const { setList, setLoading, setError } = seserahanSlice.actions;
export default seserahanSlice.reducer;
