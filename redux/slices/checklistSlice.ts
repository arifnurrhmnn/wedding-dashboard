import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "@/lib/axiosClient";

export interface ChecklistTask {
  id: string;
  unique_id?: string;
  title: string;
  description?: string;
  category: string;
  timeline_phase: string;
  due_date?: string;
  status: string;
  priority: string;
  created_at?: string;
  updated_at?: string;
}

interface ChecklistState {
  list: ChecklistTask[];
  loading: boolean;
  error: string | null;
  templateGenerated: boolean;
}

const initialState: ChecklistState = {
  list: [],
  loading: false,
  error: null,
  templateGenerated: false,
};

// Thunks
export const fetchChecklist = createAsyncThunk(
  "checklist/fetchChecklist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/checklist");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to fetch checklist"
      );
    }
  }
);

export const addChecklistTask = createAsyncThunk(
  "checklist/addTask",
  async (
    taskData: Omit<ChecklistTask, "id" | "created_at">,
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosClient.post("/checklist", taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to add task"
      );
    }
  }
);

export const updateChecklistTask = createAsyncThunk(
  "checklist/updateTask",
  async (
    { id, data }: { id: string; data: Partial<ChecklistTask> },
    { rejectWithValue }
  ) => {
    try {
      console.log("updateChecklistTask - ID:", id);
      console.log("updateChecklistTask - Data:", JSON.stringify(data, null, 2));
      const response = await axiosClient.patch(`/checklist/${id}`, data);
      console.log("updateChecklistTask - Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("updateChecklistTask - Error:", error);
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to update task"
      );
    }
  }
);

export const inlineUpdateChecklistTask = createAsyncThunk(
  "checklist/inlineUpdateTask",
  async (
    { id, field, value }: { id: string; field: string; value: string | number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosClient.patch(`/checklist/${id}`, {
        [field]: value,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to update task"
      );
    }
  }
);

export const deleteChecklistTask = createAsyncThunk(
  "checklist/deleteTask",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/checklist/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to delete task"
      );
    }
  }
);

export const generateDefaultTemplate = createAsyncThunk(
  "checklist/generateTemplate",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/checklist/generate-template");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Failed to generate template"
      );
    }
  }
);

const checklistSlice = createSlice({
  name: "checklist",
  initialState,
  reducers: {
    setTemplateGenerated: (state, action: PayloadAction<boolean>) => {
      state.templateGenerated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Checklist
      .addCase(fetchChecklist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChecklist.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.templateGenerated = action.payload.length > 0;
      })
      .addCase(fetchChecklist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Task
      .addCase(addChecklistTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addChecklistTask.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(addChecklistTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Task
      .addCase(updateChecklistTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChecklistTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateChecklistTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Inline Update Task
      .addCase(inlineUpdateChecklistTask.fulfilled, (state, action) => {
        const index = state.list.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      // Delete Task
      .addCase(deleteChecklistTask.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t.id !== action.payload);
      })
      // Generate Template
      .addCase(generateDefaultTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateDefaultTemplate.fulfilled, (state, action) => {
        state.loading = false;
        // Response bisa berupa { addedCount, tasks } atau array langsung
        if (action.payload.tasks && Array.isArray(action.payload.tasks)) {
          // Jika response berupa { addedCount, tasks }
          state.list = [...state.list, ...action.payload.tasks];
        } else if (Array.isArray(action.payload)) {
          // Jika response berupa array langsung (backward compatibility)
          state.list = action.payload;
        }
        state.templateGenerated = true;
      })
      .addCase(generateDefaultTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTemplateGenerated } = checklistSlice.actions;
export default checklistSlice.reducer;
