import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchDashboard = createAsyncThunk(
  "admin/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const [stats, users, threads, replies] = await Promise.all([
        axiosInstance.get("/admin/stats"),
        axiosInstance.get("/admin/users"),
        axiosInstance.get("/admin/threads"),
        axiosInstance.get("/admin/replies"),
      ]);
      return {
        stats: stats.data,
        users: users.data,
        threads: threads.data,
        replies: replies.data,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to load dashboard");
    }
  }
);

export const banUser = createAsyncThunk(
  "admin/banUser",
  async (userId, { rejectWithValue }) => {
    try {
      await axiosInstance.post(`/admin/users/${userId}/ban`);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to ban user");
    }
  }
);

export const unbanUser = createAsyncThunk(
  "admin/unbanUser",
  async (userId, { rejectWithValue }) => {
    try {
      await axiosInstance.post(`/admin/users/${userId}/unban`);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to unban user");
    }
  }
);

export const adminDeleteThread = createAsyncThunk(
  "admin/deleteThread",
  async (threadId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/threads/${threadId}`);
      return threadId;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to delete thread");
    }
  }
);

export const adminDeleteReply = createAsyncThunk(
  "admin/deleteReply",
  async (replyId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/replies/${replyId}`);
      return replyId;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to delete reply");
    }
  }
);

const initialState = {
  stats: null,
  users: [],
  threads: [],
  replies: [],
  status: "idle",
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload.stats;
        state.users = action.payload.users;
        state.threads = action.payload.threads;
        state.replies = action.payload.replies;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    [banUser, unbanUser, adminDeleteThread, adminDeleteReply].forEach((thunk) => {
      builder.addCase(thunk.rejected, (state, action) => {
        state.error = action.payload;
      });
    });
  },
});

export default adminSlice.reducer;