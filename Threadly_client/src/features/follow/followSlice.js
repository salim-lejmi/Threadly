import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const followUser = createAsyncThunk(
  "follow/followUser",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/users/${userId}/follow`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to follow user");
    }
  }
);

export const unfollowUser = createAsyncThunk(
  "follow/unfollowUser",
  async (userId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/users/${userId}/follow`);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to unfollow user");
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  "follow/fetchFollowing",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/users/${userId}/following`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch following");
    }
  }
);

export const fetchFollowers = createAsyncThunk(
  "follow/fetchFollowers",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/users/${userId}/followers`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch followers");
    }
  }
);

const initialState = {
  following: [],  
  followers: [],   
  status: "idle",
  error: null,
};

const followSlice = createSlice({
  name: "follow",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(followUser.fulfilled, (state, action) => {
        state.following.push(action.payload);
      })

      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.following = state.following.filter(
          (f) => f.following.id !== action.payload
        );
      })

      .addCase(fetchFollowing.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.following = action.payload;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followers = action.payload;
      });
  },
});

export default followSlice.reducer;