import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, UserPlus } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !idNumber || !idFront || !idBack) {
      setError('Vui lòng điền đầy đủ thông tin và tải lên giấy tờ tùy thân.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }
    if (!agree) {
      setError('Bạn cần đồng ý với Điều khoản Sử dụng để tiếp tục.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Register in context with ID
      register(name, email, password, idNumber);
      setLoading(false);
      // Move to OTP page, passing state details
      navigate('/otp-verify', { state: { email, name } });
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      {/* Decorative Blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-teal/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-2xl border border-slate-200/80 shadow-2xl relative z-10 text-slate-800 fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-teal to-brand-green items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-teal-500/20 mb-3">
            S+
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-teal to-brand-green">
            Tạo tài khoản mới
          </h1>
          <p className="text-xs text-slate-500 mt-1">Bắt đầu hành trình làm chủ tài chính cá nhân miễn phí</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Họ và tên của bạn</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User size={16} />
              </span>
              <input 
                type="text"
                placeholder="Nguyễn Hoàng Lâm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Địa chỉ Email</label>
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

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mật khẩu bảo mật</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input 
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center space-x-1.5">
              <ShieldCheck size={14} className="text-brand-teal" />
              <span>Xác minh Danh tính (KYC)</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1.5">Số CMND/CCCD</label>
                <input 
                  type="text"
                  placeholder="Nhập 12 số CCCD"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* ID Front */}
                <div 
                  className={`border border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${idFront ? 'border-brand-teal bg-brand-teal/5' : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'}`}
                  onClick={() => setIdFront('front.jpg')}
                >
                  {idFront ? (
                    <span className="text-[10px] font-bold text-brand-teal">Đã tải lên Mặt trước</span>
                  ) : (
                    <>
                      <div className="w-8 h-6 bg-slate-100 rounded mb-1.5 border border-slate-200 flex items-center justify-center"><User size={12} className="text-slate-400"/></div>
                      <span className="text-[10px] text-slate-500">Tải lên Mặt trước</span>
                    </>
                  )}
                </div>

                {/* ID Back */}
                <div 
                  className={`border border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${idBack ? 'border-brand-teal bg-brand-teal/5' : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'}`}
                  onClick={() => setIdBack('back.jpg')}
                >
                  {idBack ? (
                    <span className="text-[10px] font-bold text-brand-teal">Đã tải lên Mặt sau</span>
                  ) : (
                    <>
                      <div className="w-8 h-6 bg-slate-100 rounded mb-1.5 border border-slate-200 flex flex-col items-center justify-evenly py-0.5"><div className="w-6 h-0.5 bg-slate-300"></div><div className="w-6 h-0.5 bg-slate-300"></div></div>
                      <span className="text-[10px] text-slate-500">Tải lên Mặt sau</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start space-x-2 py-1">
            <input 
              type="checkbox" 
              id="agree_terms"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 accent-brand-teal rounded"
            />
            <label htmlFor="agree_terms" className="text-[11px] text-slate-500 leading-tight cursor-pointer">
              Tôi đồng ý với <a href="#terms" className="text-brand-teal hover:underline">Điều khoản Dịch vụ</a> và <a href="#privacy" className="text-brand-teal hover:underline font-normal">Chính sách Bảo mật</a> của SAVE+.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-green text-white font-bold text-sm shadow-lg shadow-teal-500/10 hover:opacity-90 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={16} />
                <span>Đăng ký tài khoản</span>
              </>
            )}
          </button>
        </form>

        {/* Login Redirect */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-brand-teal hover:underline font-bold">Đăng nhập</Link>
        </p>

        {/* Security Info */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[10px] text-slate-400">
          <ShieldCheck size={12} className="text-brand-green" />
          <span>Thông tin được mã hóa bảo mật hoàn toàn</span>
        </div>
      </div>
    </div>
  );
}
