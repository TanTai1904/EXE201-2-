import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitEmail = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Vui lòng cung cấp email đã đăng ký.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleVerifyOtp = () => {
    if (otp.join('').length < 6) {
      setError('Vui lòng nhập đủ 6 số OTP.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3); // Success/New password step
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      {/* Decorative Blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-teal/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-2xl border border-slate-200/80 shadow-2xl relative z-10 text-slate-800 fade-in">
        
        {/* Back Link */}
        <Link to="/login" className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-700 text-xs mb-6 transition-colors font-medium">
          <ArrowLeft size={14} />
          <span>Quay lại Đăng nhập</span>
        </Link>

        {step === 3 ? (
          <div className="text-center space-y-4 py-4">
            <div className="inline-flex w-16 h-16 rounded-full bg-emerald-500/10 items-center justify-center text-brand-green border border-brand-green/20 mb-2">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Xác thực thành công</h2>
            <p className="text-sm text-slate-500">
              Bạn đã xác thực OTP thành công. Tính năng đặt lại mật khẩu mới sẽ sớm được cập nhật.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-200 transition-all cursor-pointer"
            >
              Quay lại Đăng nhập
            </button>
          </div>
        ) : step === 2 ? (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold text-slate-800">Nhập mã xác nhận</h2>
            <p className="text-xs text-slate-500">
              Chúng tôi đã gửi mã OTP 6 số đến email <strong className="text-slate-700">{email}</strong>
            </p>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl text-left">
                {error}
              </div>
            )}

            <div className="flex justify-center space-x-2 my-6">
              {otp.map((data, index) => (
                <input
                  className="w-10 h-12 bg-slate-50/50 border border-slate-200 rounded-lg text-center text-lg font-bold text-slate-900 focus:outline-none focus:border-brand-teal transition-all focus:ring-1 focus:ring-brand-teal/35"
                  type="text"
                  name="otp"
                  maxLength="1"
                  key={index}
                  value={data}
                  onChange={e => handleOtpChange(e.target, index)}
                  onFocus={e => e.target.select()}
                  onKeyDown={e => handleOtpKeyDown(e, index)}
                />
              ))}
            </div>

            <button 
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-green text-white font-bold text-sm shadow-lg shadow-teal-500/10 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <span>Xác nhận OTP</span>
              )}
            </button>
            
            <p className="text-xs text-slate-500 mt-4">
              Chưa nhận được mã? <button className="text-brand-teal hover:underline font-bold ml-1">Gửi lại</button>
            </p>
          </div>
        ) : (
          <>
            {/* Form Header */}
            <div className="mb-6">
              <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-teal to-brand-green">
                Khôi phục mật khẩu
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Nhập email tài khoản của bạn bên dưới, chúng tôi sẽ hỗ trợ gửi mã OTP xác nhận.
              </p>
            </div>

            <form onSubmit={handleSubmitEmail} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Địa chỉ Email đăng ký</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input 
                    type="email"
                    placeholder="hoanglam@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-green text-white font-bold text-sm shadow-lg shadow-teal-500/10 hover:opacity-90 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Gửi mã khôi phục</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
