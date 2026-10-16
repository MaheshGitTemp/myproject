import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../../../components/ui/FormInput.jsx';
import OtpInput from '../../../components/ui/OtpInput.jsx';
import PasswordInput from '../../../components/ui/PasswordInput.jsx';
import Transition, { ALPINE_DEFAULT } from '../../../components/ui/Transition.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import useCooldown from '../../../hooks/useCooldown.js';
import usePageMeta from '../../../hooks/usePageMeta.js';
import * as authService from '../../../services/authService.js';
import { mapApiError } from '../../../services/apiError.js';

const EMPTY_OTP = ['', '', '', '', '', ''];

export default function ForgotPassword() {
  usePageMeta({
    title: 'Forgot Password | Telugu Sambandham',
    description: 'Reset your Telugu Sambandham password securely.',
  });

  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ identifier: '', newPassword: '', confirmPassword: '' });
  const [otp, setOtp] = useState(EMPTY_OTP);
  const [cooldown, startCooldown] = useCooldown(30);
  const otpRef = useRef(null);
  const [focusOtpTick, setFocusOtpTick] = useState(0);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setOtpDigit = (i, digit) => setOtp((o) => o.map((d, idx) => (idx === i ? digit : d)));

  useEffect(() => {
    if (focusOtpTick > 0) otpRef.current?.focusFirst();
  }, [focusOtpTick]);

  async function handleSendOtp(e) {
    e.preventDefault();
    if (!form.identifier) return;
    setIsLoading(true);
    setOtp(EMPTY_OTP);
    const result = await authService.sendResetOtp(form.identifier);
    setIsLoading(false);
    if (!result.ok) {
      const { title, message } = mapApiError({ status: result.status, error: result.error, context: 'otp-send' });
      showToast(title, message, 'error');
      return;
    }
    setCurrentStep(2);
    startCooldown();
    if (result.devOtp) showToast('Dev OTP', `Your reset code is ${result.devOtp}`, 'info', { duration: 8000, icon: 'fa-key' });
    else showToast('OTP Sent', 'A 6-digit code has been sent to your email/phone.', 'success');
    setFocusOtpTick((n) => n + 1);
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setIsLoading(true);
    const result = await authService.resendResetOtp(form.identifier);
    setIsLoading(false);
    if (!result.ok) {
      const { title, message } = mapApiError({ status: result.status, error: result.error, context: 'otp-send' });
      showToast(title, message, 'error');
      return;
    }
    setOtp(EMPTY_OTP);
    startCooldown();
    if (result.devOtp) showToast('Dev OTP', `Your reset code is ${result.devOtp}`, 'info', { duration: 8000, icon: 'fa-key' });
    else showToast('OTP Resent', 'A new code has been sent.', 'success');
    setFocusOtpTick((n) => n + 1);
  }

  async function handleReset(e) {
    e.preventDefault();
    if (otp.join('').length !== 6) {
      showToast('Invalid OTP', 'Please enter the complete 6-digit code.', 'error');
      otpRef.current?.focusFirst();
      return;
    }
    if (form.newPassword.length < 6) {
      showToast('Weak Password', 'Password must be at least 6 characters.', 'error');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      showToast('Mismatch', 'Passwords do not match.', 'error');
      return;
    }
    setIsLoading(true);
    const result = await authService.resetPassword({ identifier: form.identifier, otp: otp.join(''), newPassword: form.newPassword });
    setIsLoading(false);
    if (!result.ok) {
      const { title, message } = mapApiError({ status: result.status, error: result.error, context: 'otp' });
      showToast(title, result.message || message, 'error');
      return;
    }
    setCurrentStep(3);
  }

  const mismatch = form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword;

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-3xl p-6 sm:p-8 card-shadow">
        {/* STEP 1: Identify Account */}
        <Transition show={currentStep === 1} {...ALPINE_DEFAULT}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-brand-soft dark:bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i aria-hidden="true" className="fas fa-lock-open text-2xl text-brand" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-slate-800 dark:text-white mb-2">Forgot Password?</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your registered email or phone number, and we'll send you an OTP to reset your password.</p>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-5">
            <FormInput
              id="email-or-phone-number"
              label="Email or Phone Number *"
              type="text"
              value={form.identifier}
              onChange={update('identifier')}
              placeholder="e.g., 9876543210 or you@example.com"
              required
            />

            <button type="submit" className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg shadow-brand/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
              <span>{isLoading ? 'Sending OTP...' : 'Send OTP'}</span>
              {!isLoading && <i aria-hidden="true" className="fas fa-arrow-right" />}
              {isLoading && <i aria-hidden="true" className="fas fa-circle-notch fa-spin" />}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/login" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-brand transition flex items-center justify-center gap-2">
              <i aria-hidden="true" className="fas fa-arrow-left" /> Back to Login
            </Link>
          </div>
        </Transition>

        {/* STEP 2: Verify OTP & Reset */}
        <Transition show={currentStep === 2} {...ALPINE_DEFAULT}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i aria-hidden="true" className="fas fa-shield-alt text-2xl text-blue-500" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-slate-800 dark:text-white mb-2">Verify &amp; Reset</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Enter the 6-digit code sent to <span className="font-semibold text-slate-700 dark:text-slate-300">{form.identifier}</span> and create a new password.
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label htmlFor="enter-6-digit-otp" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 text-center">Enter 6-Digit OTP</label>
              <OtpInput ref={otpRef} id="enter-6-digit-otp" value={otp} onChange={setOtpDigit} />
              <div className="text-center mt-3">
                <button type="button" onClick={handleResend} className="text-xs font-semibold text-brand hover:text-brand-dark transition" disabled={cooldown > 0}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>

            <PasswordInput
              id="new-password"
              label="New Password *"
              autoComplete="current-password"
              value={form.newPassword}
              onChange={update('newPassword')}
              placeholder="Min 6 characters"
              toggleLabel="Toggle password visibility"
              smoothToggle={false}
              required
            />

            <PasswordInput
              id="confirm-new-password"
              label="Confirm New Password *"
              autoComplete="current-password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              placeholder="Re-enter password"
              toggleLabel="Toggle password visibility"
              smoothToggle={false}
              required
            >
              {mismatch && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <i aria-hidden="true" className="fas fa-exclamation-circle" /> Passwords do not match
                </p>
              )}
            </PasswordInput>

            <button type="submit" className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg shadow-brand/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
              <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
              {!isLoading && <i aria-hidden="true" className="fas fa-check" />}
              {isLoading && <i aria-hidden="true" className="fas fa-circle-notch fa-spin" />}
            </button>
          </form>
        </Transition>

        {/* STEP 3: Success */}
        <Transition show={currentStep === 3} className="text-center" {...ALPINE_DEFAULT}>
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
            <i aria-hidden="true" className="fas fa-check text-3xl text-green-500" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-slate-800 dark:text-white mb-2">Password Reset Successful!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Your password has been updated. You can now log in with your new credentials.</p>

          <Link to="/login" className="w-full inline-flex items-center justify-center py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg shadow-brand/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
            Back to Login
          </Link>
        </Transition>
      </div>
    </div>
  );
}
