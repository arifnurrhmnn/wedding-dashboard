import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "@/lib/axiosClient";

export interface Guest {
  id: string;
  nama: string;
  kategori: string;
  skala_prioritas: string;
  tipe_undangan: string;
  qty: number;
  created_at?: string;
}

interface GuestState {
  list: Guest[];
  loading: boolean;
  error: string | null;
}

const initialState: GuestState = {
  list: [],
  loading: false,
  error: null,
};

// Thunks
export const fetchGuests = createAsyncThunk(
  "guests/fetchGuests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/tamu-undangan");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to fetch guests"
      );
    }
  }
);

export const addGuest = createAsyncThunk(
  "guests/addGuest",
  async (guestData: Omit<Guest, "id">, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/tamu-undangan", guestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to add guest"
      );
    }
  }
);

export const updateGuest = createAsyncThunk(
  "guests/updateGuest",
  async (
    { id, data }: { id: string; data: Partial<Guest> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosClient.patch(`/tamu-undangan/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to update guest"
      );
    }
  }
);

export const inlineUpdateGuest = createAsyncThunk(
  "guests/inlineUpdateGuest",
  async (
    { id, field, value }: { id: string; field: string; value: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosClient.patch(`/tamu-undangan/${id}`, {
        [field]: value,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to update guest"
      );
    }
  }
);

const guestSlice = createSlice({
  name: "guests",
  initialState,
  reducers: {
    setList: (state, action: PayloadAction<Guest[]>) => {
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
    // Fetch Guests
    builder.addCase(fetchGuests.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGuests.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload;
    });
    builder.addCase(fetchGuests.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add Guest
    builder.addCase(addGuest.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addGuest.fulfilled, (state, action) => {
      state.loading = false;
      state.list.push(action.payload);
    });
    builder.addCase(addGuest.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Guest
    builder.addCase(updateGuest.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateGuest.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.list.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    });
    builder.addCase(updateGuest.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Inline Update Guest
    builder.addCase(inlineUpdateGuest.fulfilled, (state, action) => {
      const index = state.list.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    });
  },
});

export const { setList, setLoading, setError } = guestSlice.actions;
export default guestSlice.reducer;
