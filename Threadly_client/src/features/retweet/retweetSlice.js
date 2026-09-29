import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const retweetThread = createAsyncThunk(
  "retweet/retweetThread",
  async (threadId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/threads/${threadId}/retweet`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to retweet thread");
    }
  }
);

export const undoRetweetThread = createAsyncThunk(
  "retweet/undoRetweetThread",
  async (threadId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/threads/${threadId}/retweet`);
      return { type: "thread", id: threadId };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to undo retweet");
    }
  }
);

export const retweetReply = createAsyncThunk(
  "retweet/retweetReply",
  async (replyId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/replies/${replyId}/retweet`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to retweet reply");
    }
  }
);

export const undoRetweetReply = createAsyncThunk(
  "retweet/undoRetweetReply",
  async (replyId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/replies/${replyId}/retweet`);
      return { type: "reply", id: replyId };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to undo retweet");
    }
  }
);

export const fetchRetweetsByUser = createAsyncThunk(
  "retweet/fetchByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/users/${userId}/retweets`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch retweets");
    }
  }
);

const initialState = {
  items: [],  
  status: "idle",
  error: null,
};

const retweetSlice = createSlice({
  name: "retweet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(retweetThread.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(retweetReply.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      .addCase(undoRetweetThread.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (r) => r.thread?.threadId !== action.payload.id
        );
      })
      .addCase(undoRetweetReply.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (r) => r.reply?.replyId !== action.payload.id
        );
      })

      .addCase(fetchRetweetsByUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRetweetsByUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchRetweetsByUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default retweetSlice.reducer;