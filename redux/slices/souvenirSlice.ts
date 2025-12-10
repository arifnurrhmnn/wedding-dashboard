import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "@/lib/axiosClient";

export interface Souvenir {
  id: string;
  unique_id?: string;
  nama_souvenir: string;
  jumlah: number;
  vendor?: string;
  status_pengadaan: string;
  harga_per_item: number;
  total_harga?: number;
  catatan?: string;
  foto_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface SouvenirState {
  list: Souvenir[];
  loading: boolean;
  error: string | null;
}

const initialState: SouvenirState = {
  list: [],
  loading: false,
  error: null,
};

// Thunks
export const fetchSouvenir = createAsyncThunk(
  "souvenir/fetchSouvenir",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/souvenir");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to fetch souvenir"
      );
    }
  }
);

export const addSouvenir = createAsyncThunk(
  "souvenir/addSouvenir",
  async (data: Omit<Souvenir, "id">, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/souvenir", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to add souvenir"
      );
    }
  }
);

export const updateSouvenir = createAsyncThunk(
  "souvenir/updateSouvenir",
  async (
    { id, data }: { id: string; data: Partial<Souvenir> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosClient.patch(`/souvenir/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to update souvenir"
      );
    }
  }
);

export const inlineUpdateSouvenir = createAsyncThunk(
  "souvenir/inlineUpdateSouvenir",
  async (
    { id, field, value }: { id: string; field: string; value: string | number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosClient.patch(`/souvenir/${id}`, {
        [field]: value,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to update souvenir"
      );
    }
  }
);

export const deleteSouvenir = createAsyncThunk(
  "souvenir/deleteSouvenir",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/souvenir/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to delete souvenir"
      );
    }
  }
);

const souvenirSlice = createSlice({
  name: "souvenir",
  initialState,
  reducers: {
    setList: (state, action: PayloadAction<Souvenir[]>) => {
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
    // Fetch Souvenir
    builder.addCase(fetchSouvenir.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSouvenir.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload;
    });
    builder.addCase(fetchSouvenir.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add Souvenir
    builder.addCase(addSouvenir.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addSouvenir.fulfilled, (state, action) => {
      state.loading = false;
      state.list.push(action.payload);
    });
    builder.addCase(addSouvenir.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Souvenir
    builder.addCase(updateSouvenir.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateSouvenir.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.list.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    });
    builder.addCase(updateSouvenir.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Inline Update Souvenir
    builder.addCase(inlineUpdateSouvenir.fulfilled, (state, action) => {
      const index = state.list.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    });

    // Delete Souvenir
    builder.addCase(deleteSouvenir.fulfilled, (state, action) => {
      const index = state.list.findIndex((s) => s.id === action.payload);
      if (index !== -1) {
        state.list.splice(index, 1);
      }
    });
  },
});

export const { setList, setLoading, setError } = souvenirSlice.actions;
export default souvenirSlice.reducer;
