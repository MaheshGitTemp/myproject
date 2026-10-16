import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FormInput from '../../../components/ui/FormInput.jsx';
import PasswordInput from '../../../components/ui/PasswordInput.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import usePageMeta from '../../../hooks/usePageMeta.js';
import { login } from '../../../services/authService.js';
import { mapApiError } from '../../../services/apiError.js';

export default function Login() {
  usePageMeta({
    title: 'Log In | Telugu Sambandham',
    description: 'Log in to your Telugu Sambandham account to view matches, messages and interests.',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ identifier: '', password: '', remember: false });

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function handleLogin(e) {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(form);
    setIsLoading(false);

    if (result.ok) {
      showToast('Success', 'Logged in successfully! Redirecting to dashboard...', 'success');
      signIn(result.user, form.remember);
      setTimeout(() => navigate(location.state?.from?.pathname || '/dashboard', { replace: true }), 1500);
    } else {
      const { title, message } = mapApiError({ status: result.status, error: result.error, context: 'login' });
      showToast(title, message, 'error');
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-3xl p-6 sm:p-8 card-shadow">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-slate-800 dark:text-white mb-2">Welcome Back!</h1>
          <p className="text-slate-500 dark:text-slate-400">Log in to continue your journey to find your perfect match.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <FormInput
            id="phone-number-or-email"
            label="Phone Number or Email *"
            type="text"
            value={form.identifier}
            onChange={update('identifier')}
            autoComplete="username"
            placeholder="e.g., 9876543210 or you@example.com"
            required
          />

          <PasswordInput
            id="password"
            label="Password *"
            value={form.password}
            onChange={update('password')}
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={update('remember')}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand focus:ring-brand/20 dark:bg-slate-800 transition"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm font-semibold text-brand hover:text-brand-dark transition hover:underline">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg shadow-brand/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Logging in...' : 'Log In'}</span>
            {!isLoading && <i aria-hidden="true" className="fas fa-arrow-right" />}
            {isLoading && <i aria-hidden="true" className="fas fa-circle-notch fa-spin" />}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 rounded-full">New to Telugu Sambandham?</span>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center w-full py-3.5 border-2 border-brand text-brand hover:bg-brand hover:text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6 leading-relaxed">
        By logging in, you agree to our{' '}
        <Link to="/terms-privacy" className="text-brand hover:text-brand-dark font-semibold hover:underline transition">Terms of Service</Link> and{' '}
        <Link to="/terms-privacy" className="text-brand hover:text-brand-dark font-semibold hover:underline transition">Privacy Policy</Link>.
      </p>
    </div>
  );
}
