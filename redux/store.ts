import { configureStore } from "@reduxjs/toolkit";
import guestReducer from "./slices/guestSlice";
import seserahanReducer from "./slices/seserahanSlice";
import souvenirReducer from "./slices/souvenirSlice";
import checklistReducer from "./slices/checklistSlice";

export const store = configureStore({
  reducer: {
    guests: guestReducer,
    seserahan: seserahanReducer,
    souvenir: souvenirReducer,
    checklist: checklistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
