import { forwardRef, useImperativeHandle, useRef } from 'react';
import './OtpInput.css';

// Six single-digit boxes. `value` is an array of 6 strings.
// Auto-advances on input, moves back on Backspace in an empty box.
const OtpInput = forwardRef(function OtpInput({ id, value, onChange }, ref) {
  const inputs = useRef([]);
  useImperativeHandle(ref, () => ({ focusFirst: () => inputs.current[0]?.focus() }));

  const handleInput = (i, e) => {
    const digit = e.target.value.replace(/[^0-9]/g, '');
    onChange(i, digit);
    if (digit.length === 1 && i < 5) inputs.current[i + 1].focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && e.target.value === '' && i > 0) inputs.current[i - 1].focus();
  };

  return (
    <div className="flex justify-center gap-2">
      {value.map((digit, i) => (
        <input
          key={i}
          id={i === 0 ? id : undefined}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleInput(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="form-input otp-input"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : undefined}
        />
      ))}
    </div>
  );
});

export default OtpInput;
