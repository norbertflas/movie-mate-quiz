import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "../Navigation";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Allow access to the home page (quiz) for non-logged users
  if (!session && location.pathname !== "/" && location.pathname !== "/auth") {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">{children}</main>
    </div>
  );
};