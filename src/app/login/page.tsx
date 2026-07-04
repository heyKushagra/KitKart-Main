"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function Login() {
  const router = useRouter();
  const { user, loading: authLoading, login, signUp, loginWithGoogle } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Get redirect path safely without triggering useSearchParams de-opt
  const getRedirectPath = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("redirect") || "/";
    }
    return "/";
  };

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user && !isRedirecting) {
      const redirectPath = getRedirectPath();
      router.replace(redirectPath);
    }
  }, [user, authLoading, router, isRedirecting]);

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
    // Reset validation fields
    setFullName("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Client-side validations
    if (!email.trim() || !password) {
      showToast("error", "Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("error", "Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      showToast("error", "Password must be at least 6 characters.");
      return;
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        showToast("error", "Please enter your full name.");
        return;
      }
      if (password !== confirmPassword) {
        showToast("error", "Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        setIsRedirecting(true);
        showToast("success", "Successfully logged in! Redirecting...");
        const redirectPath = getRedirectPath();
        setTimeout(() => {
          router.replace(redirectPath);
        }, 1500);
      } else {
        await signUp(email, password, fullName);
        setIsRedirecting(true);
        showToast("success", "Account created successfully! Redirecting...");
        const redirectPath = getRedirectPath();
        setTimeout(() => {
          router.replace(redirectPath);
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      let errorMsg = "An authentication error occurred.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        errorMsg = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        errorMsg = "This email is already registered.";
      } else if (err.code === "auth/invalid-credential") {
        errorMsg = "Invalid credentials. Please try again.";
      } else if (err.message) {
        errorMsg = err.message;
      }
      showToast("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await loginWithGoogle();
      setIsRedirecting(true);
      showToast("success", "Successfully authenticated with Google! Redirecting...");
      const redirectPath = getRedirectPath();
      setTimeout(() => {
        router.replace(redirectPath);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      let errorMsg = "Google authentication failed.";
      if (err.code === "auth/popup-closed-by-user") {
        errorMsg = "Sign-in popup closed by user.";
      } else if (err.message) {
        errorMsg = err.message;
      }
      showToast("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Prevent UI flash while checking user state
  if (authLoading || (user && !loading && !isRedirecting)) {
    return (
      <div className="auth-loader-container">
        <div className="auth-spinner"></div>
        <style jsx>{`
          .auth-loader-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: var(--clr-bg);
          }
          .auth-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid var(--clr-border);
            border-top: 3px solid var(--clr-gold);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      {/* Toast Notifications */}
      <div className="toasts-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-card toast-${t.type}`}>
            {t.type === "success" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <div className="auth-container">
        {/* KitKart Branding */}
        <div className="auth-brand">
          <svg viewBox="0 0 32 32" fill="none" className="brand-logo">
            <path
              d="M16 2L4 8v8c0 7.5 5.3 14.5 12 16 6.7-1.5 12-8.5 12-16V8L16 2z"
              stroke="var(--clr-gold)"
              strokeWidth="1.5"
              fill="none"
            />
            <text
              x="10"
              y="21"
              fontSize="14"
              fontWeight="700"
              fill="var(--clr-gold)"
              fontFamily="Space Grotesk, sans-serif"
            >
              K
            </text>
          </svg>
          <h2 className="brand-name">KITKART</h2>
        </div>

        {/* Card Form */}
        <div className="auth-card">
          <h1 className="auth-title">{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p className="auth-subtitle">
            {isLogin
              ? "Login to access your orders and account settings."
              : "Register now to start order tracking and premium benefits."}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="input-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
              />
            </div>

            <div className="input-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                {isLogin && (
                  <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>
                    Forgot Password?
                  </a>
                )}
              </div>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="password-toggle"
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="password-toggle"
                    aria-label="Toggle Confirm Password Visibility"
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? (
                <div className="btn-spinner"></div>
              ) : (
                <span>{isLogin ? "Sign In" : "Register"}</span>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* Google Sign In Button */}
          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            disabled={loading} 
            className="google-signin-btn"
          >
            <svg viewBox="0 0 24 24" className="google-icon" width="18" height="18">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>{isLogin ? "Sign in with Google" : "Sign up with Google"}</span>
          </button>

          {/* Toggle Link */}
          <div className="auth-toggle-row">
            <span>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button onClick={handleToggle} className="toggle-btn-link">
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-page-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: radial-gradient(circle at center, #161616 0%, #0b0b0b 100%);
          padding: var(--sp-10) var(--sp-4);
          position: relative;
          overflow: hidden;
          font-family: var(--ff-body);
        }

        /* Toasts System */
        .toasts-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }
        .toast-card {
          display: flex;
          align-items: center;
          gap: var(--sp-3);
          padding: var(--sp-4) var(--sp-6);
          border-radius: var(--r-md);
          background: rgba(19, 19, 19, 0.9);
          backdrop-filter: blur(12px);
          color: var(--clr-text);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
          font-size: 0.9rem;
          font-weight: 500;
          pointer-events: auto;
          animation: slideInToast 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          max-width: 320px;
        }
        .toast-success {
          border: 1px solid rgba(46, 213, 115, 0.3);
          color: #2ed573;
        }
        .toast-error {
          border: 1px solid rgba(255, 71, 87, 0.3);
          color: #ff4757;
        }
        @keyframes slideInToast {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Container & Card */
        .auth-container {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .auth-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: var(--sp-6);
        }
        .brand-logo {
          width: 54px;
          height: 54px;
          margin-bottom: var(--sp-2);
        }
        .brand-name {
          font-family: var(--ff-heading);
          color: var(--clr-text);
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.2em;
        }

        .auth-card {
          width: 100%;
          background: rgba(19, 19, 19, 0.65);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-lg);
          padding: var(--sp-8) var(--sp-8);
          box-shadow: 0 16px 64px rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(16px);
        }

        .auth-title {
          font-family: var(--ff-heading);
          color: var(--clr-text);
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: var(--sp-1);
          text-align: center;
        }
        .auth-subtitle {
          color: var(--clr-text-secondary);
          font-size: 0.85rem;
          line-height: 1.4;
          text-align: center;
          margin-bottom: var(--sp-8);
        }

        /* Form styling */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--sp-5);
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: var(--sp-2);
        }
        .input-group label {
          color: var(--clr-text);
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .forgot-link {
          font-size: 0.8rem;
          color: var(--clr-text-secondary);
          transition: color var(--t-fast);
        }
        .forgot-link:hover {
          color: var(--clr-gold);
        }

        .auth-input {
          width: 100%;
          background: var(--clr-surface);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-md);
          color: var(--clr-text);
          padding: var(--sp-3) var(--sp-4);
          font-size: 0.95rem;
          transition: all var(--t-fast);
        }
        .auth-input:focus {
          outline: none;
          border-color: var(--clr-gold);
          box-shadow: 0 0 12px rgba(197, 160, 89, 0.15);
        }

        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-toggle {
          position: absolute;
          right: var(--sp-4);
          color: var(--clr-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color var(--t-fast);
        }
        .password-toggle:hover {
          color: var(--clr-text);
        }
        .password-toggle svg {
          width: 18px;
          height: 18px;
        }

        .auth-submit-btn {
          width: 100%;
          background: var(--clr-gold);
          color: var(--clr-bg);
          font-family: var(--ff-heading);
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: var(--sp-4);
          border-radius: var(--r-full);
          transition: all var(--t-med);
          margin-top: var(--sp-2);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(197, 160, 89, 0.2);
        }
        .auth-submit-btn:hover:not(:disabled) {
          background: var(--clr-gold-hover);
          box-shadow: 0 6px 20px rgba(197, 160, 89, 0.35);
          transform: translateY(-1px);
        }
        .auth-submit-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .auth-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid var(--clr-bg);
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Toggle Link Bottom */
        .auth-toggle-row {
          margin-top: var(--sp-6);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--sp-2);
          font-size: 0.85rem;
          color: var(--clr-text-secondary);
        }
        .toggle-btn-link {
          color: var(--clr-gold);
          font-weight: 600;
          transition: color var(--t-fast);
        }
        .toggle-btn-link:hover {
          color: var(--clr-gold-hover);
        }

        /* OR Divider */
        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: var(--sp-6) 0;
          color: var(--clr-text-muted);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--clr-border);
        }
        .auth-divider:not(:empty)::before {
          margin-right: var(--sp-4);
        }
        .auth-divider:not(:empty)::after {
          margin-left: var(--sp-4);
        }

        /* Google button */
        .google-signin-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--sp-3);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--clr-border);
          color: var(--clr-text);
          padding: var(--sp-3) var(--sp-4);
          border-radius: var(--r-full);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--t-fast);
        }
        .google-signin-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--clr-text-secondary);
        }
        .google-signin-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .google-icon {
          flex-shrink: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
