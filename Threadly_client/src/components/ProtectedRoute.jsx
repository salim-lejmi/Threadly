import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user, checkedAuth } = useSelector((state) => state.auth);

  if (!checkedAuth) return <div>Loading...</div>; 
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;