import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LuMail, LuLock, LuUser, LuPhone, LuUserPlus, LuArrowRight, LuEye, LuEyeOff } from "react-icons/lu";
import { authClient } from "../lib/auth-client";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const validateRegistration = () => {
    const errors = {};
    const normalizedPhone = phone.replace(/[\s()-]/g, "");

    if (name.trim().length < 2) {
      errors.name = "Enter your full name (at least 2 characters).";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!/^\+?[1-9]\d{7,14}$/.test(normalizedPhone)) {
      errors.phone = "Enter a valid phone number, including the country code if needed.";
    }

    if (password.length < 8 || password.length > 128) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    const firstError = Object.values(errors)[0];
    if (firstError) setErrorMsg(firstError);

    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validateRegistration()) return;

    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        phone: phone.replace(/[\s()-]/g, ""),
        callbackURL: new URL("/", window.location.origin).toString(),
      });

      if (error) {
        setErrorMsg(error.message || "Failed to create account. Please check your inputs.");
        return;
      }

      setSuccessMsg("Registration successful! Redirecting to home page...");

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || "Failed to create account. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 sm:pt-28 pb-16 min-h-screen flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 sm:p-10 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tight">Create Account</h2>
          <p className="text-sm text-neutral-400 mt-2 font-semibold font-sans">Join Nabis Fashion today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} noValidate className="space-y-4">
          {/* Name input */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <LuUser className="absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFieldErrors((errors) => ({ ...errors, name: "" }));
                }}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "register-name-error" : undefined}
                placeholder="e.g. John Doe"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all placeholder:text-neutral-400"
              />
            </div>
            {fieldErrors.name && <p id="register-name-error" className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.name}</p>}
          </div>

          {/* Email input */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <LuMail className="absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((errors) => ({ ...errors, email: "" }));
                }}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
                placeholder="john@example.com"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all placeholder:text-neutral-400"
              />
            </div>
            {fieldErrors.email && <p id="register-email-error" className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.email}</p>}
          </div>

          {/* Phone input */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Phone Number *
            </label>
            <div className="relative">
              <LuPhone className="absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setFieldErrors((errors) => ({ ...errors, phone: "" }));
                }}
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? "register-phone-error" : undefined}
                placeholder="e.g. +880 17XXXXXXXX"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all placeholder:text-neutral-400"
              />
            </div>
            {fieldErrors.phone && <p id="register-phone-error" className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.phone}</p>}
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Password *
            </label>
            <div className="relative">
              <LuLock className="absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((errors) => ({ ...errors, password: "" }));
                }}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "register-password-error" : undefined}
                placeholder="Min. 12 characters"
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
            {fieldErrors.password && <p id="register-password-error" className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.password}</p>}
          </div>

          {/* Confirm Password input */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <LuLock className="absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors((errors) => ({ ...errors, confirmPassword: "" }));
                }}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={fieldErrors.confirmPassword ? "register-confirm-password-error" : undefined}
                placeholder="Confirm password"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all placeholder:text-neutral-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3.5 text-neutral-400 hover:text-neutral-600 focus:outline-none transition-colors"
                title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && <p id="register-confirm-password-error" className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.confirmPassword}</p>}
          </div>

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-xs font-bold border border-emerald-200 animate-fade-in flex items-center gap-2">
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
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-4"
          >
            <LuUserPlus className="h-4 w-4" />
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
          </button>
        </form>

        <hr className="border-neutral-100" />

        {/* Login suggestion */}
        <div className="text-center text-sm font-semibold text-neutral-500">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline font-bold inline-flex items-center gap-0.5">
            Sign In <LuArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
