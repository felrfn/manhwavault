import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";

type Props = { children: ReactNode };

export function AuthGuard({ children }: Props) {
  const authed = isAuthenticated();
  const loc = useLocation();
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return <>{children}</>;
}
