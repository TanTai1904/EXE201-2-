import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  ShieldCheck, 
  Award, 
  Settings, 
  CreditCard, 
  Flame, 
  Sparkles, 
  Check,
  X,
  QrCode
} from 'lucide-react';

export default function Profile() {
  const { user, riskProfile, xp, streak, onboardingAnswers } = useAuth();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [paymentCode, setPaymentCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgradeClick = (tier) => {
    setSelectedTier(tier);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = () => {
    setIsProcessing(true);
    // Mock API call
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentModal(false);
      setPaymentCode('');
      alert('Yêu cầu nâng cấp của bạn đã được gửi và đang được xử lý. Bạn sẽ nhận được thông báo sau khi hoàn tất.');
    }, 1500);
  };

  const tiers = [
    {
      name: 'Free (Khởi đầu)',
      price: '0đ',
      features: [
        'Bài học tài chính cơ bản',
        'Tự động theo dõi ngân sách',
        'Giả lập tích lũy cơ bản',
        'Cộng đồng thảo luận chung'
      ],
      current: user?.subscription === 'Free' || !user?.subscription,
      color: 'border-slate-200 dark:border-slate-800'
    },
    {
      name: 'Premium (Chuyên nghiệp)',
      price: '99,000đ / tháng',
      features: [
        'Toàn bộ 15+ khóa học chuyên sâu',
        'Không quảng cáo giới hạn',
        'Học trực quan cùng sơ đồ Recharts',
        '20 câu hỏi AI Mentor mỗi ngày',
        'Huy chương thành tựu nâng cao'
      ],
      current: user?.subscription === 'Premium',
      color: 'border-brand-teal ring-2 ring-brand-teal/20 bg-brand-teal/5'
    },
    {
      name: 'Mentor+ (Đặc quyền)',
      price: '199,000đ / tháng',
      features: [
        'Tất cả đặc quyền bản Premium',
        'AI Mentor+ không giới hạn câu hỏi',
        'Cảnh báo biến động thị trường từ AI',
        'Chuyên mục Đọc phân tích của chuyên gia',
        'Hỗ trợ khẩn cấp 1-1 phòng chống lừa đảo'
      ],
      current: user?.subscription === 'Mentor+',
      color: 'border-brand-gold ring-2 ring-brand-gold/20 bg-amber-500/5'
    }
  ];

  return (
    <div className="space-y-6 fade-in font-sans">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
          <Settings size={22} className="text-brand-teal" />
          <span>Hồ Sơ & Gói Tài Khoản</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Quản lý hồ sơ rủi ro học tập, theo dõi điểm thưởng tích lũy và cấu hình gói dịch vụ.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Profile Stats Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
              alt={user?.name} 
              className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-brand-teal/25"
            />
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">{user?.name}</h2>
              <span className="text-xs text-slate-400">{user?.email}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Điểm thưởng</span>
                <span className="block text-sm font-extrabold text-brand-teal">{xp} XP</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Học tập</span>
                <span className="block text-sm font-extrabold text-amber-500">{streak} Ngày 🔥</span>
              </div>
            </div>

            {/* Risk profile information box */}
            <div className="p-4 bg-teal-500/5 dark:bg-teal-900/10 border border-brand-teal/25 rounded-2xl text-left text-xs">
              <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Hồ sơ rủi ro tích lũy</span>
              <h4 className="font-extrabold text-brand-teal dark:text-brand-teallight text-sm">
                {riskProfile === 'Conservative' ? 'AN TOÀN (Conservative)' : riskProfile === 'Aggressive' ? 'TĂNG TRƯỞNG (Aggressive)' : 'CÂN BẰNG (Balanced)'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Được đánh giá dựa trên khảo sát onboard của bạn. Lộ trình bài học và rổ gợi ý ETF được tinh chỉnh theo hồ sơ này.
              </p>
              {onboardingAnswers && (
                <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/20 space-y-1 text-[10px] text-slate-400">
                  <div>Thu nhập dự kiến: <strong className="text-slate-700 dark:text-slate-200">{onboardingAnswers.income}đ</strong></div>
                  <div>Khả năng tiết kiệm: <strong className="text-slate-700 dark:text-slate-200">{onboardingAnswers.savings}đ/tháng</strong></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Subscription tier comparison list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-1.5">
                <CreditCard size={18} className="text-brand-teal" />
                <span>So Sánh Các Gói Tài Khoản</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Chọn gói phù hợp nhất với trình độ tự học tài chính cá nhân của bạn.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tiers.map((tier) => (
                <div 
                  key={tier.name} 
                  className={`p-4 rounded-2xl border flex flex-col justify-between relative ${tier.color}`}
                >
                  {/* Active Badge */}
                  {tier.current && (
                    <span className="absolute -top-2 left-4 px-2 py-0.5 rounded bg-brand-teal text-[8.5px] font-extrabold text-white uppercase tracking-wider">
                      Gói hiện tại
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{tier.name}</h4>
                      <span className="block text-sm font-extrabold text-brand-teal dark:text-brand-teallight mt-1.5">{tier.price}</span>
                    </div>

                    <ul className="space-y-2 text-[10px] text-slate-500 dark:text-slate-400">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start space-x-1.5">
                          <Check size={12} className="text-brand-teal shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    disabled={tier.current}
                    onClick={() => handleUpgradeClick(tier)}
                    className={`w-full mt-6 py-2 rounded-xl text-[10.5px] font-bold transition-all uppercase ${tier.current ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed border border-slate-200/20' : 'bg-brand-teal hover:bg-brand-teal/95 text-white shadow-md'}`}
                  >
                    {tier.current ? 'Đang kích hoạt' : 'Nâng cấp ngay'}
                  </button>
                </div>
              ))}
            </div>

            {/* Refund trust badge */}
            <div className="mt-2 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/15 flex items-center space-x-2 text-[10.5px] text-slate-500 dark:text-slate-400">
              <ShieldCheck size={16} className="text-brand-green" />
              <span>Hoàn phí 100% trong 7 ngày đầu nếu bạn không hài lòng về chất lượng nội dung học tập.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <CreditCard size={18} className="text-brand-teal" />
                <span>Thanh toán nâng cấp</span>
              </h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">Gói bạn chọn</p>
                <h4 className="font-extrabold text-brand-teal text-lg">{selectedTier.name}</h4>
                <p className="font-bold text-slate-800 dark:text-white">{selectedTier.price}</p>
              </div>

              <div className="flex flex-col items-center p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Quét mã QR để thanh toán</span>
                <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center shadow-sm">
                  {/* Placeholder for QR Code */}
                  <QrCode size={100} className="text-slate-800" />
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Hoặc chuyển khoản với nội dung:</p>
                  <p className="font-mono text-xs font-bold text-slate-800 dark:text-white bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded mt-1">UPGRADE {user?.name ? user.name.toUpperCase().replace(/\s+/g, '') : 'USER'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nhập mã thanh toán (Mã giao dịch / Promo code)</label>
                <input 
                  type="text" 
                  value={paymentCode}
                  onChange={(e) => setPaymentCode(e.target.value)}
                  placeholder="VD: MB123456789 hoặc SAVEPLUS50" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-teal/50"
                />
              </div>

              <button 
                onClick={handlePaymentSubmit}
                disabled={!paymentCode.trim() || isProcessing}
                className="w-full py-3 bg-brand-teal hover:bg-brand-teal/95 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <span>Đang xử lý...</span>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Xác nhận đã thanh toán</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
