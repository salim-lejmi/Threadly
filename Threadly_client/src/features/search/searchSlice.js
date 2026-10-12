import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { likeThread, unlikeThread, deleteThread } from "../threads/threadsSlice";

export const searchUsers = createAsyncThunk(
  "search/users",
  async (q, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/search/users", { params: { q } });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Search failed");
    }
  }
);

export const searchThreads = createAsyncThunk(
  "search/threads",
  async (q, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/search/threads", { params: { q } });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Search failed");
    }
  }
);

const initialState = {
  users: [],
  threads: [],
  status: "idle",
  error: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    clearSearch: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(searchThreads.fulfilled, (state, action) => {
        state.threads = action.payload;
      })

      .addCase(likeThread.fulfilled, (state, action) => {
        const i = state.threads.findIndex((t) => t.threadId === action.payload.threadId);
        if (i !== -1) state.threads[i] = action.payload;
      })
      .addCase(unlikeThread.fulfilled, (state, action) => {
        const i = state.threads.findIndex((t) => t.threadId === action.payload.threadId);
        if (i !== -1) state.threads[i] = action.payload;
      })
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.threads = state.threads.filter((t) => t.threadId !== action.payload);
      });
  },
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;