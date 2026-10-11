import { forwardRef } from 'react';
import OtpInput from '../../../../components/ui/OtpInput.jsx';

const Step2Verify = forwardRef(function Step2Verify(
  { form, otp, onOtpChange, cooldown, isLoading, onResend, onVerify },
  otpRef
) {
  return (
    <>
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-brand-soft dark:bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i aria-hidden="true" className="fas fa-shield-alt text-2xl text-brand" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-slate-800 dark:text-white mb-2">Verify Your Account</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          We've sent a 6-digit OTP to <span className="font-semibold text-slate-700 dark:text-slate-300">{form.phone || form.email}</span>
        </p>
      </div>

      <div>
        <label htmlFor="enter-6-digit-otp" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 text-center">Enter 6-Digit OTP</label>
        <OtpInput ref={otpRef} id="enter-6-digit-otp" value={otp} onChange={onOtpChange} />
        <div className="text-center mt-4">
          <button type="button" onClick={onResend} className="text-sm font-semibold text-brand hover:text-brand-dark transition" disabled={cooldown > 0}>
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>

      <button type="button" onClick={onVerify} className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-lg shadow-brand/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
        <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
        {!isLoading && <i aria-hidden="true" className="fas fa-arrow-right" />}
        {isLoading && <i aria-hidden="true" className="fas fa-circle-notch fa-spin" />}
      </button>
    </>
  );
});

export default Step2Verify;
