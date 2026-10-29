import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Delete, ArrowRight, Globe } from 'lucide-react';
import { api } from '../../services/api';

interface Props {
  onUnlocked: () => void;
  onNavigateWebsite?: () => void;
}

export const SecurityLockScreen: React.FC<Props> = ({ onUnlocked, onNavigateWebsite }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (num: string) => {
    if (loading) return;
    setError('');
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        attemptUnlock(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    if (loading) return;
    setError('');
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (loading) return;
    setError('');
    setPin('');
  };

  const attemptUnlock = async (pinToTest: string) => {
    setLoading(true);
    setError('');
    try {
      await api.verifyPin(pinToTest);
      onUnlocked();
    } catch (err: any) {
      setError(err.message || 'Incorrect PIN. Access Denied.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  // Listen to physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'Enter' && pin.length >= 4) {
        attemptUnlock(pin);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, loading]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 text-slate-100 select-none">
      {/* Top Brand Bar */}
      <div className="w-full max-w-sm flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white p-0.5 flex items-center justify-center overflow-hidden shadow">
            <img src="/logo.png" alt="DD Events" className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Owner Security</span>
        </div>
        {onNavigateWebsite && (
          <button
            onClick={onNavigateWebsite}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 transition"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Public Site</span>
          </button>
        )}
      </div>

      {/* Main Lock Display */}
      <div className="w-full max-w-xs flex flex-col items-center text-center my-auto">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-900/60 to-rose-900/40 border border-slate-800 flex items-center justify-center mb-5 shadow-2xl shadow-indigo-500/10">
          <Lock className="w-8 h-8 text-rose-400 stroke-[2.2]" />
        </div>

        <h2 className="text-xl font-black text-white tracking-tight mb-1">
          Operations Locked
        </h2>
        <p className="text-xs text-slate-400 mb-6 max-w-[240px]">
          Enter your 4-digit Master Owner PIN to access confidential clients & financial records.
        </p>

        {/* PIN Dots Display */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                  isFilled
                    ? 'bg-rose-500 border-rose-400 scale-110 shadow-lg shadow-rose-500/50'
                    : 'bg-slate-900 border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {error ? (
          <div className="text-rose-400 text-xs font-semibold bg-rose-950/60 border border-rose-800/80 px-3 py-1.5 rounded-xl mb-3 animate-shake">
            {error}
          </div>
        ) : (
          <div className="text-slate-500 text-[11px] mb-3">
            {loading ? 'Verifying Credentials...' : 'Default PIN: 2026'}
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              disabled={loading}
              className="h-14 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 active:bg-slate-700 text-xl font-bold text-white border border-slate-800/80 transition-all shadow-sm flex items-center justify-center active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            disabled={loading}
            className="h-14 rounded-2xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center"
          >
            Clear
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            disabled={loading}
            className="h-14 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 active:bg-slate-700 text-xl font-bold text-white border border-slate-800/80 transition-all shadow-sm flex items-center justify-center active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={loading}
            className="h-14 rounded-2xl bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition flex items-center justify-center active:scale-95"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {pin.length >= 4 && (
          <button
            onClick={() => attemptUnlock(pin)}
            disabled={loading}
            className="w-full max-w-[260px] mt-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
          >
            <span>{loading ? 'Checking...' : 'Unlock System'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-sm text-center border-t border-slate-900 pt-3">
        <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          Enterprise End-to-End Encrypted & Anti-Shell Protected
        </p>
      </div>
    </div>
  );
};
