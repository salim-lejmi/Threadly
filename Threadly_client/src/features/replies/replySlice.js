import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchRepliesByThread = createAsyncThunk(
  "replies/fetchByThread",
  async (threadId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/threads/${threadId}/replies`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch replies");
    }
  }
);

export const fetchLikedReplyIds = createAsyncThunk(
  "replies/fetchLikedIds",
  async (threadId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/threads/${threadId}/replies/liked`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch likes");
    }
  }
);

export const createReply = createAsyncThunk(
  "replies/create",
  async ({ threadId, replyText, image }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("replyText", replyText || "");
      if (image) form.append("image", image);
      const res = await axiosInstance.post(`/threads/${threadId}/replies`, form);
      return res.data;
    } catch (err) {
      return rejectWithValue(typeof err.response?.data === "string" ? err.response.data : "Failed to create reply");
    }
  }
);

export const deleteReply = createAsyncThunk(
  "replies/delete",
  async ({ threadId, replyId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/threads/${threadId}/replies/${replyId}`);
      return replyId;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to delete reply");
    }
  }
);

export const likeReply = createAsyncThunk(
  "replies/like",
  async ({ threadId, replyId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/threads/${threadId}/replies/${replyId}/like`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to like reply");
    }
  }
);

export const unlikeReply = createAsyncThunk(
  "replies/unlike",
  async ({ threadId, replyId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/threads/${threadId}/replies/${replyId}/like`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to unlike reply");
    }
  }
);

const initialState = {
  items: [],
  likedIds: [],
  status: "idle",
  error: null,
};

function replaceReply(state, updatedReply) {
  const index = state.items.findIndex((r) => r.replyId === updatedReply.replyId);
  if (index !== -1) state.items[index] = updatedReply;
}

const replySlice = createSlice({
  name: "replies",
  initialState,
  reducers: {
    clearReplies: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepliesByThread.pending, (state) => {
        state.status = "loading";
        state.items = [];
      })
      .addCase(fetchRepliesByThread.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchRepliesByThread.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchLikedReplyIds.fulfilled, (state, action) => {
        state.likedIds = action.payload;
      })

      .addCase(createReply.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      .addCase(deleteReply.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.replyId !== action.payload);
      })

      .addCase(likeReply.fulfilled, (state, action) => {
        replaceReply(state, action.payload);
        if (!state.likedIds.includes(action.payload.replyId)) {
          state.likedIds.push(action.payload.replyId);
        }
      })
      .addCase(unlikeReply.fulfilled, (state, action) => {
        replaceReply(state, action.payload);
        state.likedIds = state.likedIds.filter((id) => id !== action.payload.replyId);
      });
  },
});

export const { clearReplies } = replySlice.actions;
export default replySlice.reducer;