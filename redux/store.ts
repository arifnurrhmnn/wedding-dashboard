import { configureStore } from "@reduxjs/toolkit";
import guestReducer from "./slices/guestSlice";
import seserahanReducer from "./slices/seserahanSlice";
import souvenirReducer from "./slices/souvenirSlice";
import checklistReducer from "./slices/checklistSlice";
import scheduleReducer from "./slices/scheduleSlice";
import vendorReducer from "./slices/vendorSlice";
import budgetReducer from "./slices/budgetSlice";

export const store = configureStore({
  reducer: {
    guests: guestReducer,
    seserahan: seserahanReducer,
    souvenir: souvenirReducer,
    checklist: checklistReducer,
    schedules: scheduleReducer,
    vendor: vendorReducer,
    budget: budgetReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
