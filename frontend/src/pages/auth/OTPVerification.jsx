import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Clock, KeyRound, Sparkles } from 'lucide-react';

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'nguoidung@gmail.com';
  const name = location.state?.name || 'Bạn';

  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: clear and go back
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleResend = () => {
    setTimer(60);
    setOtp(['', '', '', '']);
    setError('');
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');

    if (code.length < 4) {
      setError('Vui lòng điền đủ mã xác thực 4 chữ số.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate success, redirect to Profile Onboarding Quiz
      navigate('/profile-setup', { state: { email, name } });
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      {/* Blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-teal/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-2xl border border-slate-200/80 shadow-2xl relative z-10 text-slate-800 text-center fade-in">
        
        {/* Graphic */}
        <div className="inline-flex w-14 h-14 rounded-full bg-teal-500/10 items-center justify-center text-brand-teal border border-teal-500/20 mb-4">
          <KeyRound size={26} />
        </div>

        <h1 className="text-xl font-bold text-slate-800 mb-2">Xác thực tài khoản</h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
          SAVE+ vừa gửi mã OTP xác nhận gồm 4 chữ số tới hòm thư <strong className="text-slate-700">{email}</strong>.
        </p>

        {/* Demo Tip */}
        <div className="mb-6 py-2 px-3 rounded-lg bg-teal-500/5 border border-teal-500/10 text-[11px] text-brand-teal text-left flex items-center space-x-1.5">
          <Sparkles size={13} className="shrink-0 text-brand-teal" />
          <span>Hệ thống mô phỏng: Nhập bất kỳ 4 chữ số (ví dụ: 1-2-3-4) để tiếp tục!</span>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl text-left">
              {error}
            </div>
          )}

          {/* Code inputs */}
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 bg-slate-50/50 border-2 border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 rounded-xl text-center text-2xl font-extrabold text-slate-900 focus:outline-none transition-all"
              />
            ))}
          </div>

          {/* Resend timer */}
          <div className="flex items-center justify-center space-x-1.5 text-xs">
            <Clock size={14} className="text-slate-400" />
            {timer > 0 ? (
              <span className="text-slate-500">Gửi lại mã sau <strong className="text-slate-700">{timer}s</strong></span>
            ) : (
              <button 
                type="button" 
                onClick={handleResend}
                className="text-brand-teal font-bold hover:underline"
              >
                Gửi lại mã OTP
              </button>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-teal text-white font-bold text-sm shadow-lg shadow-teal-500/10 hover:opacity-90 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Xác thực & Kích hoạt</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
