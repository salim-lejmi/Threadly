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

export const updateAvatar = createAsyncThunk(
  "users/updateAvatar",
  async (file, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await axiosInstance.post("/users/me/avatar", form);
      return res.data;
    } catch (err) {
      return rejectWithValue(typeof err.response?.data === "string" ? err.response.data : "Upload failed");
    }
  }
);

export const removeAvatar = createAsyncThunk(
  "users/removeAvatar",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete("/users/me/avatar");
      return res.data;
    } catch (err) {
      return rejectWithValue(typeof err.response?.data === "string" ? err.response.data : "Failed to remove photo");
    }
  }
);

export const updateBio = createAsyncThunk(
  "users/updateBio",
  async (bio, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put("/users/me", { bio });
      return res.data;
    } catch (err) {
      return rejectWithValue(typeof err.response?.data === "string" ? err.response.data : "Failed to save bio");
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
      })

      // these only run on your own profile, so the result is the profile being shown
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.profileUser = action.payload;
      })
      .addCase(removeAvatar.fulfilled, (state, action) => {
        state.profileUser = action.payload;
      })
      .addCase(updateBio.fulfilled, (state, action) => {
        state.profileUser = action.payload;
      });
  },
});

export default userSlice.reducer;