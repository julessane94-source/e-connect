// stores/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import birthReducer from "@/features/etat-civil/birthSlice";
import documentReducer from "@/features/documents/documentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    birth: birthReducer,
    documents: documentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
