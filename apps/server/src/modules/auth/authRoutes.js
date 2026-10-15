// Auth routes + rate limiting. Mounted at /api/auth in app.js.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register, verifyEmailOtp, resendOtp, login, logout, me,
  forgotPassword, resetPassword, changePassword,
} from './authController.js';
import { requireAuth } from './session.js';

// Tight limiter for sensitive/abuse-prone endpoints (OTP, login, register).
// validate:false + a safe keyGenerator avoid express-rate-limit v7 throwing on
// localhost (IPv6 ::1 / undefined req.ip), which otherwise crashes the process.
const safeKey = (req) => req.ip || req.socket?.remoteAddress || 'unknown';

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,                  // 10 requests / IP / window
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: safeKey,
  message: { error: 'rate_limited', message: 'Too many attempts. Please try again later.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: safeKey,
  message: { error: 'rate_limited', message: 'Too many attempts. Please try again later.' },
});

export const authRouter = Router();

authRouter.post('/register', otpLimiter, register);
authRouter.post('/verify-otp', otpLimiter, verifyEmailOtp);
authRouter.post('/resend-otp', otpLimiter, resendOtp);
authRouter.post('/login', loginLimiter, login);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);
authRouter.post('/forgot-password', otpLimiter, forgotPassword);
authRouter.post('/reset-password', otpLimiter, resetPassword);
authRouter.post('/change-password', requireAuth, changePassword);
