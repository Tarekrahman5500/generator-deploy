import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { secureStorage } from "./SecureStorage";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const accessToken = secureStorage.get("accessToken");

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
