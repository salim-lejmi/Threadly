import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchUserById = createAsyncThunk(
  "users/fetchById",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/users/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "User not found");
    }
  }
);

const initialState = {
  profileUser: null,
  status: "idle",
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.status = "loading";
        state.profileUser = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profileUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;