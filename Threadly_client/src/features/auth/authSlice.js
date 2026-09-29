import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";


export const signup = createAsyncThunk(
  "auth/signup",
  async (signupData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/signup", signupData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Signup failed");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/login", { username, password });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Login failed");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/logout");
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Logout failed");
    }
  }
);

// used on app load to check if there's already a valid session cookie
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/me");
      return res.data;
    } catch (err) {
      // not logged in — not a real error, just no session
      return rejectWithValue(null);
    }
  }
);

// --- Slice ---

const initialState = {
  user: null,
  status: "idle",       // idle | loading | succeeded | failed
  error: null,
  checkedAuth: false,   // has the initial /me check run yet?
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // signup
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // login
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      })
      // fetchMe (initial auth check)
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "succeeded";
        state.checkedAuth = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.status = "idle";
        state.checkedAuth = true;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;