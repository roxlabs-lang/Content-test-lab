import React, { useRef, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  onComplete?: (val: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onResend?: () => void;
  resendCooldown?: number;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  isLoading = false,
  isError = false,
  errorMessage,
  onResend,
  resendCooldown = 0,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const handleChange = (index: number, char: string) => {
    // Only accept numeric digit
    const cleaned = char.replace(/[^0-9]/g, '');
    if (!cleaned && char !== '') return;

    const newDigits = [...digits];
    newDigits[index] = cleaned.slice(-1); // Take last char if typed fast
    const nextVal = newDigits.join('');
    onChange(nextVal);

    if (cleaned && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (nextVal.length === length && onComplete) {
      onComplete(nextVal);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to prev box if empty
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '').slice(0, length);
    if (!pasted) return;

    onChange(pasted);
    const nextFocusIdx = Math.min(pasted.length, length - 1);
    inputRefs.current[nextFocusIdx]?.focus();

    if (pasted.length === length && onComplete) {
      onComplete(pasted);
    }
  };

  return (
    <div className="space-y-4">
      {/* 6 Digit Input Group */}
      <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {Array.from({ length }).map((_, i) => {
          const isFilled = Boolean(digits[i]);
          return (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digits[i] || ''}
              disabled={isLoading}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-11 h-13 sm:w-13 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border bg-zinc-950 text-white transition-all outline-none ${
                isError
                  ? 'border-red-500/80 bg-red-950/20 text-red-200 focus:ring-2 focus:ring-red-500/50'
                  : isFilled
                  ? 'border-indigo-500/80 bg-indigo-950/20 text-indigo-100 shadow-sm shadow-indigo-500/10'
                  : 'border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 text-zinc-300'
              } disabled:opacity-50`}
            />
          );
        })}
      </div>

      {/* Error Message if any */}
      {isError && errorMessage && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Resend & Status Footer */}
      {onResend && (
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
          <span>Didn't receive verification code?</span>
          <button
            type="button"
            onClick={onResend}
            disabled={isLoading || resendCooldown > 0}
            className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
          </button>
        </div>
      )}
    </div>
  );
};
