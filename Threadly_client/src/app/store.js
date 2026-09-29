import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import threadsReducer from "../features/threads/threadsSlice";
import repliesReducer from "../features/replies/replySlice";
import followReducer from "../features/follow/followSlice";
import retweetReducer from "../features/retweet/retweetSlice";
import usersReducer from "../features/users/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    threads: threadsReducer,
    replies: repliesReducer,
    follow: followReducer,
    retweet: retweetReducer,
    users: usersReducer,

  },
});