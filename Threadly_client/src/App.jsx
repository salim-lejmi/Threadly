import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { fetchMe } from "./features/auth/authSlice";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  const dispatch = useDispatch();
  const { checkedAuth } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  if (!checkedAuth) return <p className="status-text">Loading...</p>;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<FeedPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;