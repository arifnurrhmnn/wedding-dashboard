import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "@/lib/axiosClient";

export interface Schedule {
  id: string;
  title: string;
  start_datetime: string;
  end_datetime?: string;
  created_at?: string;
  updated_at?: string;
}

interface ScheduleState {
  list: Schedule[];
  loading: boolean;
  error: string | null;
}

const initialState: ScheduleState = {
  list: [],
  loading: false,
  error: null,
};

// Thunks
export const fetchSchedules = createAsyncThunk(
  "schedules/fetchSchedules",
  async (params: { month?: string } = {}, { rejectWithValue }) => {
    try {
      const url = params.month
        ? `/schedule?month=${params.month}`
        : "/schedule";
      const response = await axiosClient.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to fetch schedules"
      );
    }
  }
);

export const addSchedule = createAsyncThunk(
  "schedules/addSchedule",
  async (scheduleData: Omit<Schedule, "id">, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/schedule", scheduleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to add schedule"
      );
    }
  }
);

export const updateSchedule = createAsyncThunk(
  "schedules/updateSchedule",
  async (
    { id, data }: { id: string; data: Partial<Schedule> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosClient.patch(`/schedule/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to update schedule"
      );
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  "schedules/deleteSchedule",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/schedule/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to delete schedule"
      );
    }
  }
);

// Slice
const scheduleSlice = createSlice({
  name: "schedules",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch schedules
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSchedules.fulfilled,
        (state, action: PayloadAction<Schedule[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add schedule
    builder
      .addCase(addSchedule.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        addSchedule.fulfilled,
        (state, action: PayloadAction<Schedule>) => {
          state.loading = false;
          state.list.push(action.payload);
        }
      )
      .addCase(addSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update schedule
    builder
      .addCase(updateSchedule.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        updateSchedule.fulfilled,
        (state, action: PayloadAction<Schedule>) => {
          state.loading = false;
          const index = state.list.findIndex(
            (item) => item.id === action.payload.id
          );
          if (index !== -1) {
            state.list[index] = action.payload;
          }
        }
      )
      .addCase(updateSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete schedule
    builder
      .addCase(deleteSchedule.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        deleteSchedule.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.list = state.list.filter((item) => item.id !== action.payload);
        }
      )
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = scheduleSlice.actions;
export default scheduleSlice.reducer;
