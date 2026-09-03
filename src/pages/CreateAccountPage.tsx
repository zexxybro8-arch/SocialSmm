import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Lock, 
  Mail, 
  User, 
  AtSign, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { BRANDING } from '../config/branding';
import { useAuth } from '../auth/AuthContext';
import { getReadableAuthErrorMessage } from '../auth/authErrors';

interface CreateAccountPageProps {
  onBackToLanding: () => void;
  onGoToLogin: () => void;
  onRegisterSuccess: (role: 'customer') => void;
}

export const CreateAccountPage: React.FC<CreateAccountPageProps> = ({
  onBackToLanding,
  onGoToLogin,
  onRegisterSuccess,
}) => {
  const { register, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateForm = (): string | null => {
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail) return 'Please enter a valid email.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return 'Please enter a valid email.';

    if (!trimmedUsername) return 'Please enter a desired username.';
    if (trimmedUsername.length < 3) return 'Username must contain at least 3 characters.';

    if (!password) return 'Please enter a password.';
    if (password.length < 6) return 'Password is too weak.';

    if (!trimmedName) return 'Please enter your full name.';

    return null;
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      onRegisterSuccess('customer');
    } catch (err: any) {
      setErrorMessage(getReadableAuthErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: email.trim(),
        username: username.trim(),
        password,
        name: name.trim(),
        fullName: name.trim(),
        mobile: mobileNo.trim() || undefined,
        mobileNo: mobileNo.trim() || undefined,
      });

      setSuccessMessage('Account created successfully! Redirecting...');
      // Allow auth state to propagate and then transition
      setTimeout(() => {
        onRegisterSuccess('customer');
      }, 300);
    } catch (err: any) {
      setErrorMessage(getReadableAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-zinc-100 flex flex-col justify-center px-4 py-8 relative selection:bg-emerald-500 selection:text-zinc-950 font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Navigation back */}
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            id="create-account-back-btn"
            onClick={onBackToLanding}
            className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition px-2.5 py-1.5 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Instant Activation
          </span>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl border border-zinc-800/90 bg-[#0C1220]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header & Logo */}
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center font-black text-zinc-950 text-xl shadow-lg shadow-emerald-950/60 mb-3">
              {BRANDING.BRAND_NAME.slice(0, 2).toUpperCase()}
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Create Account
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Sign up to scale your social reach with guaranteed high-speed delivery
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Create Account Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* 1. Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* 2. Username */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="reg-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* 3. Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  id="reg-toggle-pwd-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 4. Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* 5. Mobile No. */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Mobile No.
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="reg-mobile"
                  type="tel"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Terms notice */}
            <p className="text-[11px] text-zinc-500 text-center pt-1">
              By creating an account, you agree to our Terms of Service & Privacy Policy.
            </p>

            {/* Primary Create Account Button */}
            <div className="pt-2">
              <button
                id="create-account-submit-btn"
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 active:scale-[0.99] text-zinc-950 font-black text-sm flex items-center justify-center space-x-2 transition-all shadow-xl shadow-emerald-950/60 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                ) : (
                  <span>Create account</span>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative bg-[#0C1220] px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Or
              </span>
            </div>

            {/* Google One-Click Auth */}
            <div>
              <button
                type="button"
                id="google-register-btn"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
                className="w-full py-3 px-6 rounded-2xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 hover:border-zinc-600 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center space-x-2.5 transition-all cursor-pointer disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Secondary Outlined Sign In Button */}
            <div className="pt-1">
              <button
                type="button"
                id="create-account-to-login-btn"
                onClick={onGoToLogin}
                className="w-full py-2.5 px-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 bg-transparent hover:bg-zinc-900/50 active:scale-[0.99] text-zinc-400 hover:text-zinc-200 font-medium text-xs transition-all text-center cursor-pointer"
              >
                Already have an account? <span className="text-emerald-400 font-bold">Sign in</span>
              </button>
            </div>
          </form>

          {/* Secure Guarantee */}
          <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-center space-x-2 text-[11px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Firebase Authentication & Zero Plaintext Credentials</span>
          </div>
        </div>
      </div>
    </div>
  );
};
