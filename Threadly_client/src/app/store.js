import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import threadsReducer from "../features/threads/threadsSlice";
import repliesReducer from "../features/replies/replySlice";
import followReducer from "../features/follow/followSlice";
import retweetReducer from "../features/retweet/retweetSlice";
import usersReducer from "../features/users/userSlice";
import searchReducer from "../features/search/searchSlice";
import adminReducer from "../features/admin/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    threads: threadsReducer,
    replies: repliesReducer,
    follow: followReducer,
    retweet: retweetReducer,
    users: usersReducer,
    search: searchReducer,
    admin: adminReducer,
  },
});