import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LuMail, LuLock, LuLogIn, LuArrowRight, LuEye, LuEyeOff } from "react-icons/lu";
import { authClient } from "../lib/auth-client";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const returnTo = typeof location.state?.from === "string" ? location.state.from : "/";
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: new URL(returnTo, window.location.origin).toString(),
      });

      if (error) {
        setErrorMsg(error.message || "Failed to sign in. Please verify your credentials.");
        return;
      }

      setSuccessMsg("Signed in successfully! Redirecting...");

      setTimeout(() => {
        navigate(returnTo, { replace: true });
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 sm:pt-28 pb-16 min-h-screen flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 sm:p-10 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tight">Welcome Back</h2>
          <p className="text-sm text-neutral-400 mt-2 font-semibold">Sign in to your Nabis Fashion account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email input */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <div className="relative">
              <LuMail className="absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@example.com"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Password
              </label>
              <a href="#" className="text-xs font-bold text-accent hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <LuLock className="absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all placeholder:text-neutral-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-neutral-400 hover:text-neutral-600 focus:outline-none transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-bold border border-red-100">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <LuLogIn className="h-4 w-4" />
            <span>{loading ? "Signing in..." : "Sign In"}</span>
          </button>
        </form>

        <hr className="border-neutral-100" />

        {/* Register suggestion */}
        <div className="text-center text-sm font-semibold text-neutral-500">
          New to Nabis Fashion?{" "}
          <Link to="/register" className="text-accent hover:underline font-bold inline-flex items-center gap-0.5">
            Create an account <LuArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
