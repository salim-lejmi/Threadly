import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { likeThread, unlikeThread, deleteThread } from "../threads/threadsSlice";

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

// the logged-in user's own retweets (used for the Retweet / Undo button state)
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

// retweets of the profile being viewed (shown on the profile timeline)
export const fetchProfileRetweets = createAsyncThunk(
  "retweet/fetchProfile",
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
  profileItems: [],
  status: "idle",
  error: null,
};

function replaceThreadIn(list, updated) {
  list.forEach((r) => {
    if (r.thread?.threadId === updated.threadId) r.thread = updated;
  });
}

const retweetSlice = createSlice({
  name: "retweet",
  initialState,
  reducers: {
    clearProfileRetweets: (state) => {
      state.profileItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(retweetThread.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(retweetReply.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      .addCase(undoRetweetThread.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.thread?.threadId !== action.payload.id);
      })
      .addCase(undoRetweetReply.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.reply?.replyId !== action.payload.id);
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
      })

      .addCase(fetchProfileRetweets.fulfilled, (state, action) => {
        state.profileItems = action.payload;
      })

      // keep like counts correct on retweeted cards
      .addCase(likeThread.fulfilled, (state, action) => {
        replaceThreadIn(state.items, action.payload);
        replaceThreadIn(state.profileItems, action.payload);
      })
      .addCase(unlikeThread.fulfilled, (state, action) => {
        replaceThreadIn(state.items, action.payload);
        replaceThreadIn(state.profileItems, action.payload);
      })

      // a deleted thread takes its retweets with it
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.thread?.threadId !== action.payload);
        state.profileItems = state.profileItems.filter((r) => r.thread?.threadId !== action.payload);
      });
  },
});

export const { clearProfileRetweets } = retweetSlice.actions;
export default retweetSlice.reducer;