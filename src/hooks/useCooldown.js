import { useCallback, useEffect, useState } from 'react';

// Countdown used for "Resend OTP in 30s". Returns [secondsLeft, start].
export default function useCooldown(seconds = 30) {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (left <= 0) return undefined;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const start = useCallback(() => setLeft(seconds), [seconds]);
  return [left, start];
}
