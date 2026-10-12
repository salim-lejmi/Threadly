import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchAllThreads = createAsyncThunk(
  "threads/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/threads");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch threads");
    }
  }
);

export const fetchFeed = createAsyncThunk(
  "threads/fetchFeed",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/threads/feed");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch feed");
    }
  }
);

export const fetchThreadsByUser = createAsyncThunk(
  "threads/fetchByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/threads/user/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch user threads");
    }
  }
);

export const fetchThreadById = createAsyncThunk(
  "threads/fetchById",
  async (threadId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/threads/${threadId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Thread not found");
    }
  }
);

export const fetchLikedThreadIds = createAsyncThunk(
  "threads/fetchLikedIds",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/threads/liked");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch likes");
    }
  }
);

export const createThread = createAsyncThunk(
  "threads/create",
  async (threadText, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/threads", { threadText });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to create thread");
    }
  }
);

export const deleteThread = createAsyncThunk(
  "threads/delete",
  async (threadId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/threads/${threadId}`);
      return threadId;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to delete thread");
    }
  }
);

export const likeThread = createAsyncThunk(
  "threads/like",
  async (threadId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/threads/${threadId}/like`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to like thread");
    }
  }
);

export const unlikeThread = createAsyncThunk(
  "threads/unlike",
  async (threadId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/threads/${threadId}/like`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to unlike thread");
    }
  }
);

const initialState = {
  items: [],
  likedIds: [],
  currentThread: null,
  status: "idle",
  error: null,
};

function replaceThread(state, updatedThread) {
  const index = state.items.findIndex((t) => t.threadId === updatedThread.threadId);
  if (index !== -1) state.items[index] = updatedThread;
  if (state.currentThread?.threadId === updatedThread.threadId) {
    state.currentThread = updatedThread;
  }
}

function startLoading(state) {
  state.status = "loading";
  state.error = null;
  state.items = [];
}

const threadsSlice = createSlice({
  name: "threads",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllThreads.pending, startLoading)
      .addCase(fetchAllThreads.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAllThreads.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchFeed.pending, startLoading)
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchThreadsByUser.pending, startLoading)
      .addCase(fetchThreadsByUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchThreadsByUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchThreadById.fulfilled, (state, action) => {
        state.currentThread = action.payload;
      })

      .addCase(fetchLikedThreadIds.fulfilled, (state, action) => {
        state.likedIds = action.payload;
      })

      .addCase(createThread.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      .addCase(deleteThread.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.threadId !== action.payload);
      })

      .addCase(likeThread.fulfilled, (state, action) => {
        replaceThread(state, action.payload);
        if (!state.likedIds.includes(action.payload.threadId)) {
          state.likedIds.push(action.payload.threadId);
        }
      })
      .addCase(unlikeThread.fulfilled, (state, action) => {
        replaceThread(state, action.payload);
        state.likedIds = state.likedIds.filter((id) => id !== action.payload.threadId);
      });
  },
});

export default threadsSlice.reducer;