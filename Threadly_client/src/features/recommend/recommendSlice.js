import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { likeThread, unlikeThread, deleteThread } from "../threads/threadsSlice";

export const fetchSimilar = createAsyncThunk(
  "recommend/similar",
  async (threadId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/threads/${threadId}/similar`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to load similar listings");
    }
  }
);

export const fetchRecommended = createAsyncThunk(
  "recommend/forYou",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/threads/recommended");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to load recommendations");
    }
  }
);

const initialState = {
  similar: [],
  similarStatus: "idle",
  recommended: [],
  recommendedStatus: "idle",
};

function replaceIn(list, updated) {
  const i = list.findIndex((t) => t.threadId === updated.threadId);
  if (i !== -1) list[i] = updated;
}

const recommendSlice = createSlice({
  name: "recommend",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSimilar.pending, (state) => {
        state.similarStatus = "loading";
        state.similar = [];
      })
      .addCase(fetchSimilar.fulfilled, (state, action) => {
        state.similarStatus = "succeeded";
        state.similar = action.payload;
      })
      .addCase(fetchSimilar.rejected, (state) => {
        state.similarStatus = "failed";
      })

      .addCase(fetchRecommended.pending, (state) => {
        state.recommendedStatus = "loading";
        state.recommended = [];
      })
      .addCase(fetchRecommended.fulfilled, (state, action) => {
        state.recommendedStatus = "succeeded";
        state.recommended = action.payload;
      })
      .addCase(fetchRecommended.rejected, (state) => {
        state.recommendedStatus = "failed";
      })

       .addCase(likeThread.fulfilled, (state, action) => {
        replaceIn(state.similar, action.payload);
        replaceIn(state.recommended, action.payload);
      })
      .addCase(unlikeThread.fulfilled, (state, action) => {
        replaceIn(state.similar, action.payload);
        replaceIn(state.recommended, action.payload);
      })
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.similar = state.similar.filter((t) => t.threadId !== action.payload);
        state.recommended = state.recommended.filter((t) => t.threadId !== action.payload);
      });
  },
});

export default recommendSlice.reducer;