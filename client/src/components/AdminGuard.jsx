import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { LuShieldAlert } from "react-icons/lu";

function AdminGuard({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const location = useLocation();

  // Only show full loading spinner on initial check when session is not yet loaded
  if (isPending && session === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-accent" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const role = session.user?.role?.toLowerCase();
  if (role !== "admin") {
    return (
      <div className="pt-28 pb-16 min-h-[70vh] flex items-center justify-center max-w-7xl mx-auto px-4">
        <div className="bg-white border border-red-100 shadow-sm rounded-3xl p-8 max-w-md text-center space-y-4">
          <div className="inline-flex p-3 bg-red-50 text-red-600 rounded-2xl">
            <LuShieldAlert className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 uppercase">Access Restricted</h2>
          <p className="text-sm text-neutral-500 font-semibold">
            You do not have administrator permissions to access this page.
          </p>
          <Link
            to="/"
            className="inline-block bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-6 py-3 rounded-xl uppercase text-xs tracking-wider transition-colors"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

export default AdminGuard;
