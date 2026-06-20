// features/etat-civil/birthSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BirthRecord {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  gender: string;
  fatherName: string;
  motherName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface BirthState {
  records: BirthRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: BirthState = {
  records: [],
  loading: false,
  error: null,
};

const birthSlice = createSlice({
  name: "birth",
  initialState,
  reducers: {
    setRecords: (state, action: PayloadAction<BirthRecord[]>) => {
      state.records = action.payload;
    },
    addRecord: (state, action: PayloadAction<BirthRecord>) => {
      state.records.push(action.payload);
    },
    updateRecord: (state, action: PayloadAction<BirthRecord>) => {
      const index = state.records.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    },
    deleteRecord: (state, action: PayloadAction<string>) => {
      state.records = state.records.filter(r => r.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setRecords, addRecord, updateRecord, deleteRecord, setLoading, setError } = birthSlice.actions;
export default birthSlice.reducer;
