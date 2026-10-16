import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import Transition from '../../../components/ui/Transition.jsx';
import useCooldown from '../../../hooks/useCooldown.js';
import usePageMeta from '../../../hooks/usePageMeta.js';
import * as authService from '../../../services/authService.js';
import * as photosService from '../../../services/photosService.js';
import { mapApiError } from '../../../services/apiError.js';
import { useToast } from '../../../context/ToastContext.jsx';
import '../../../styles/pages/register.css';
import ProgressIndicator from './ProgressIndicator.jsx';
import Step1Basic from './steps/Step1Basic.jsx';
import Step2Verify from './steps/Step2Verify.jsx';
import Step3ProfileDetails from './steps/Step3ProfileDetails.jsx';
import Step4Community from './steps/Step4Community.jsx';
import Step5Preferences from './steps/Step5Preferences.jsx';
import Step6Photos from './steps/Step6Photos.jsx';

const TOTAL_STEPS = 6;

// Every field of the wizard. Defaults match the pre-selected options in register.html.
const INITIAL_FORM = {
  profileFor: 'self',
  firstName: '', lastName: '', phone: '', email: '', password: '',
  // Profile Details (own attributes) — distinct keys from the preference fields below.
  gender: '', dob: '', profileHeight: '', profileMaritalStatus: '',
  profileEducation: '', profileOccupation: '', salary: '', city: '', state: '',
  aboutMe: '', gothram: '', preferredLocation: '',
  subCaste: '', rasi: '', nakshatra: '', padam: '',
  lookingFor: 'bride', ageFrom: '21', ageTo: '28',
  height: 'Any Height', maritalStatus: 'Any', education: 'Any Education', occupation: 'Any Occupation',
  // Selected File[] from Step 6; uploaded AFTER the session is established.
  photos: [],
};

// Same enter animation Alpine used on every step.
const STEP_TRANSITION = {
  className: 'space-y-5',
  enter: 'transition ease-out duration-300',
  enterFrom: 'opacity-0 translate-y-4',
  enterTo: 'opacity-100 translate-y-0',
};

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export default function Register() {
  usePageMeta({
    title: 'Create Free Account | Telugu Sambandham',
    description: 'Create your free Telugu Sambandham profile and start discovering compatible matches.',
  });

  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [cooldown, startCooldown] = useCooldown(30);
  const otpRef = useRef(null);
  const [focusOtpTick, setFocusOtpTick] = useState(0);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const update = (field) => (e) => set(field)(e.target.value);
  const setOtpDigit = (i, digit) => setOtp((o) => o.map((d, idx) => (idx === i ? digit : d)));
  const clearOtp = () => setOtp(['', '', '', '', '', '']);

  // Focus the first OTP box after the step is on screen (Alpine's $nextTick).
  useEffect(() => {
    if (focusOtpTick > 0) otpRef.current?.focusFirst();
  }, [focusOtpTick]);

  // In dev the backend returns the OTP so it can be tested without SMTP; show it
  // as an info toast. Never present in production responses.
  function showDevOtp(devOtp) {
    if (devOtp) showToast('Dev OTP', `Your verification code is ${devOtp}`, 'info', { duration: 8000, icon: 'fa-key' });
  }

  async function handleSendOtp() {
    if (!form.phone && !form.email) {
      showToast('Missing details', 'Please enter your phone number or email address.', 'error');
      return;
    }
    setIsLoading(true);
    clearOtp();
    const result = await authService.sendOtp(form);
    setIsLoading(false);
    if (!result.ok) {
      const { title, message } = mapApiError({ status: result.status, error: result.error, context: 'otp-send' });
      showToast(title, result.message || message, 'error');
      return;
    }
    showDevOtp(result.devOtp);
    setCurrentStep(2);
    startCooldown();
    setFocusOtpTick((n) => n + 1);
  }

  async function handleVerifyOtp() {
    if (otp.join('').length !== 6) {
      showToast('Incomplete code', 'Please enter the complete 6-digit OTP.', 'error');
      otpRef.current?.focusFirst();
      return;
    }
    setIsLoading(true);
    const result = await authService.verifyOtp(otp.join(''));
    setIsLoading(false);
    if (!result.ok) {
      const { title, message } = mapApiError({ status: result.status, error: result.error, context: 'otp' });
      showToast(title, message, 'error');
      clearOtp();
      otpRef.current?.focusFirst();
      return;
    }
    setCurrentStep(3);
    scrollTop();
  }

  async function handleResendOtp() {
    if (cooldown > 0) return;
    setIsLoading(true);
    const result = await authService.resendOtp(form);
    setIsLoading(false);
    if (!result.ok) {
      const { title, message } = mapApiError({ status: result.status, error: result.error, context: 'otp-send' });
      showToast(title, message, 'error');
      return;
    }
    showDevOtp(result.devOtp);
    showToast('Code sent', 'A new verification code has been sent.', 'success');
    clearOtp();
    startCooldown();
    setFocusOtpTick((n) => n + 1);
  }

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) { setCurrentStep(currentStep + 1); scrollTop(); }
  };
  const prevStep = () => {
    if (currentStep > 1) { setCurrentStep(currentStep - 1); scrollTop(); }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await authService.registerProfile(form);
    // Guard: only establish the session when registration actually succeeded
    // (previously signed in with an undefined user on failure).
    if (!result.ok || !result.user) {
      const { title, message } = mapApiError({ status: result.status, error: result.error });
      showToast(title, result.message || message, 'error');
      return;
    }
    signIn(result.user, true);
    // The session cookie is now set; upload the selected photos. Each failure
    // is non-fatal — toast and continue so registration still completes.
    for (const file of form.photos || []) {
      // eslint-disable-next-line no-await-in-loop
      const res = await photosService.uploadPhoto(file);
      if (!res.ok) {
        showToast('Photo Upload Failed', 'A photo could not be uploaded. You can add it later from Edit Profile.', 'error', { duration: 4000, icon: 'fa-times-circle' });
      }
    }
    showToast('Welcome!', 'Profile created successfully. Redirecting to your dashboard...', 'success');
    setTimeout(() => navigate('/dashboard'), 1200);
  }

  return (
    <>
      <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <div className="glass rounded-3xl p-6 sm:p-8 card-shadow">
        <form onSubmit={handleSubmit}>
          {/* All steps stay mounted (display:none when inactive) so entered data is kept. */}
          <Transition show={currentStep === 1} {...STEP_TRANSITION}>
            <Step1Basic form={form} set={set} update={update} isLoading={isLoading} onSendOtp={handleSendOtp} />
          </Transition>

          <Transition show={currentStep === 2} {...STEP_TRANSITION}>
            <Step2Verify
              ref={otpRef}
              form={form}
              otp={otp}
              onOtpChange={setOtpDigit}
              cooldown={cooldown}
              isLoading={isLoading}
              onResend={handleResendOtp}
              onVerify={handleVerifyOtp}
            />
          </Transition>

          <Transition show={currentStep === 3} {...STEP_TRANSITION}>
            <Step3ProfileDetails form={form} set={set} update={update} onBack={prevStep} onNext={nextStep} />
          </Transition>

          <Transition show={currentStep === 4} {...STEP_TRANSITION}>
            <Step4Community form={form} set={set} update={update} onBack={prevStep} onNext={nextStep} />
          </Transition>

          <Transition show={currentStep === 5} {...STEP_TRANSITION}>
            <Step5Preferences form={form} set={set} update={update} onBack={prevStep} onNext={nextStep} />
          </Transition>

          <Transition show={currentStep === 6} {...STEP_TRANSITION}>
            <Step6Photos form={form} set={set} onBack={prevStep} />
          </Transition>
        </form>
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
        By registering, you agree to our{' '}
        <Link to="/terms-privacy" className="text-brand hover:text-brand-dark font-semibold hover:underline transition">Terms &amp; Privacy Policy</Link>.
      </p>
    </>
  );
}
