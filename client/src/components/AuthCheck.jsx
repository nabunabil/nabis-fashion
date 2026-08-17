import { Navigate, useLocation } from "react-router-dom";
import { authClient } from "../lib/auth-client";

function AuthCheck({ children, guestOnly = false }) {
  const { data: session, isPending } = authClient.useSession();
  const location = useLocation();

  // Only show full loading spinner on initial check when session is not yet loaded
  if (isPending && session === undefined) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center" role="status" aria-label="Checking your session">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-accent" />
      </div>
    );
  }

  if (guestOnly && session) {
    const destination = typeof location.state?.from === "string" ? location.state.from : "/";
    return <Navigate to={destination} replace />;
  }

  if (!guestOnly && !session) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from: returnTo }} />;
  }

  return children;
}

export default AuthCheck;
