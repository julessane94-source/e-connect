// features/documents/documentSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Document {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface DocumentState {
  documents: Document[];
  loading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  documents: [],
  loading: false,
  error: null,
};

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setDocuments: (state, action: PayloadAction<Document[]>) => {
      state.documents = action.payload;
    },
    addDocument: (state, action: PayloadAction<Document>) => {
      state.documents.push(action.payload);
    },
    updateDocument: (state, action: PayloadAction<Document>) => {
      const index = state.documents.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.documents[index] = action.payload;
      }
    },
    deleteDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(d => d.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setDocuments, addDocument, updateDocument, deleteDocument, setLoading } = documentSlice.actions;
export default documentSlice.reducer;
