import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const { user } = useSelector((state) => state.auth);

  if (user?.role !== "role-admin") return <Navigate to="/" replace />;

  return children;
}

export default AdminRoute;