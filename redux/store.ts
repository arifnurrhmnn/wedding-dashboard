import { configureStore } from "@reduxjs/toolkit";
import guestReducer from "./slices/guestSlice";

export const store = configureStore({
  reducer: {
    guests: guestReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
