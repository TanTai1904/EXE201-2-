import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ChartTooltip } from 'recharts';
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
  QrCode,
  Download,
  BookOpen,
  Volume2,
  PhoneCall,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Mail,
  Smartphone,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Crown,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Profile() {
  const { user, riskProfile, xp, streak, onboardingAnswers, saveOnboarding, upgradeSubscription, paymentRequests, submitUpgradeRequest } = useAuth();
  const location = useLocation();
  
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [paymentCode, setPaymentCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // VIP Feature States
  const [downloadingBookId, setDownloadingBookId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [activeEbook, setActiveEbook] = useState(null);
  const [ebookPage, setEbookPage] = useState(0);
  
  const [activeArticle, setActiveArticle] = useState(null);
  
  const [alertsConfig, setAlertsConfig] = useState({
    vnindex: true,
    gold: false,
    crypto: false,
    channelSMS: true,
    channelEmail: false,
  });

  const [sosStatus, setSosStatus] = useState('idle'); // idle, sending, connecting, connected
  const [sosForm, setSosForm] = useState({ title: '', desc: '' });
  const [sosChat, setSosChat] = useState([]);
  const [sosMessageInput, setSosMessageInput] = useState('');

  const [activeCourse, setActiveCourse] = useState(null);
  const [coursePage, setCoursePage] = useState(0);

  // Mock VIP Ebooks
  const vipEbooks = [
    { id: 'eb1', title: 'Cẩm Nang Quản Lý Tài Chính Cá Nhân 2026', pages: ['Trang 1: Bắt đầu từ tiết kiệm 20% thu nhập...', 'Trang 2: Cách phân bổ quỹ khẩn cấp an toàn...', 'Trang 3: Thiết lập quy tắc 50/30/20 hiệu quả.'] },
    { id: 'eb2', title: 'Đầu Tư ETF Nền Tảng Cho Người Việt', pages: ['Trang 1: Hiểu về cấu trúc quỹ ETF tại VN...', 'Trang 2: Danh sách các quỹ ETF nổi bật như E1VFVN30...', 'Trang 3: Chiến lược mua tích lũy định kỳ (DCA).'] }
  ];

  // Mock VIP Expert Articles
  const vipArticles = [
    { id: 'art1', title: 'Phân tích xu hướng lãi suất Quý 3/2026', author: 'Dr. Nguyễn Thế Minh', date: '01/06/2026', content: 'Thị trường lãi suất tiết kiệm có xu hướng tạo đáy và hồi phục nhẹ. Dòng vốn có dấu hiệu dịch chuyển dần từ gửi tiết kiệm truyền thống sang chứng chỉ quỹ mở và ETF có hiệu suất tốt hơn...' },
    { id: 'art2', title: 'Đánh giá rổ ETF VN30 vs Diamond ETF', author: 'Hoàng Anh Tuấn (Cố vấn TCBS)', date: '28/05/2026', content: 'Rổ Diamond ETF tập trung vào các cổ phiếu hết room ngoại, có hiệu suất vượt trội trong chu kỳ tăng trưởng. VN30 ETF mang tính ổn định và đa dạng hóa cao hơn. Khuyến nghị phân bổ 60% Diamond - 40% VN30.' }
  ];

  // Mock Premium Courses (15+ courses mock)
  const premiumCourses = [
    { id: 'pc1', title: 'Khóa học Phân tích Báo cáo Tài chính chuyên sâu', pages: ['Bài 1: Đọc hiểu 3 báo cáo tài chính cốt lõi (Cân đối kế toán, Kết quả kinh doanh, Lưu chuyển tiền tệ).', 'Bài 2: Sử dụng các chỉ số tài chính cơ bản như ROE, ROA, tỷ số thanh toán để đánh giá doanh nghiệp.', 'Bài 3: Nhận diện các dấu hiệu xào nấu báo cáo tài chính của doanh nghiệp có rủi ro cao.'] },
    { id: 'pc2', title: 'Khóa học Định giá Cổ phiếu theo mô hình DCF & P/E', pages: ['Bài 1: Phương pháp định giá dòng tiền chiết khấu (DCF) - cách tính giá trị nội tại.', 'Bài 2: Phương pháp so sánh tương đối P/E, P/B giữa các doanh nghiệp cùng ngành.', 'Bài 3: Thiết lập biên độ an toàn (Margin of Safety) để đưa ra quyết định giải ngân tối ưu.'] },
    { id: 'pc3', title: 'Chiến thuật Quản lý vốn & Phân bổ tài sản tích lũy', pages: ['Bài 1: Quy tắc quản lý vốn 50/30/20 cải tiến cho nhà đầu tư trẻ.', 'Bài 2: Phân bổ tài sản chống chọi khủng hoảng và tận dụng chu kỳ tăng trưởng của nền kinh tế.', 'Bài 3: Kỷ luật tái cân bằng danh mục định kỳ theo quý hoặc năm.'] }
  ];

  // Mock VIP Badges
  const vipBadges = [
    { name: 'Nhà Đầu Tư Thông Thái', desc: 'Mở khóa đặc quyền Premium', icon: '🏆', color: 'from-amber-400 to-yellow-500' },
    { name: 'Vua Tích Lũy Lãi Kép', desc: 'Sử dụng công cụ Recharts trực quan', icon: '💰', color: 'from-emerald-400 to-green-500' },
    { name: 'Khắc Tinh Ponzi', desc: 'Đã kết nối SOS phòng ngừa lừa đảo', icon: '🛡️', color: 'from-blue-400 to-indigo-500' }
  ];



  const handleUpgradeClick = (tier) => {
    setSelectedTier(tier);
    setShowPaymentModal(true);
  };

  const startDownload = (book) => {
    setDownloadingBookId(book.id);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadingBookId(null);
          setActiveEbook(book);
          setEbookPage(0);
          return 0;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleSOSSubmit = (e) => {
    e.preventDefault();
    if (!sosForm.title.trim()) return;
    setSosStatus('sending');
    setTimeout(() => {
      setSosStatus('connecting');
      setTimeout(() => {
        setSosStatus('connected');
        setSosChat([
          { sender: 'bot', text: `🚨 KÊNH SOS KHẨN CẤP KHỞI ĐỘNG 🚨\nChào Lâm, tôi là Đỗ Hữu Quân - Chuyên gia bảo mật tài chính từ SAVE+. Tôi đã nhận được báo cáo về số điện thoại/dự án nghi vấn: "${sosForm.title}". Hãy cung cấp thêm thông tin tin nhắn hoặc cuộc gọi để tôi phân tích giúp bạn nhé!` }
        ]);
      }, 1500);
    }, 1000);
  };

  const handleSendSOSMsg = (e) => {
    e.preventDefault();
    if (!sosMessageInput.trim()) return;
    const userMsg = { sender: 'user', text: sosMessageInput };
    setSosChat(prev => [...prev, userMsg]);
    setSosMessageInput('');
    
    // Simulate expert response
    setTimeout(() => {
      let reply = '';
      const msgLower = sosMessageInput.toLowerCase();
      if (msgLower.includes('link') || msgLower.includes('web') || msgLower.includes('url')) {
        reply = '⚠️ CẢNH BÁO: Tuyệt đối không nhấp vào đường link này. Đây là website giả mạo nhằm chiếm đoạt tài khoản. Hãy chụp ảnh màn hình và chặn ngay số điện thoại gửi link.';
      } else if (msgLower.includes('tiền') || msgLower.includes('chuyển') || msgLower.includes('nạp')) {
        reply = '❌ KHẨN CẤP: Không chuyển bất kỳ khoản tiền nào dưới hình thức phí duy trì, phí kích hoạt hay tiền cọc hoàn thuế. Các cơ quan nhà nước không bao giờ yêu cầu chuyển khoản cá nhân.';
      } else {
        reply = 'Tôi đang rà soát thông tin này. Bạn vui lòng chụp tin nhắn đó gửi qua hoặc không thực hiện bất kỳ giao dịch nào vào lúc này để đảm bảo an toàn tài sản.';
      }
      setSosChat(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 1200);
  };

  const handlePaymentSubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      let tierName = 'Free';
      if (selectedTier.name.includes('Mentor+')) tierName = 'Mentor+';
      else if (selectedTier.name.includes('Mentor')) tierName = 'Mentor';
      else if (selectedTier.name.includes('Premium')) tierName = 'Premium';
      // Submit as pending request for admin/staff to approve
      submitUpgradeRequest(tierName, paymentCode, selectedTier.price);
      setShowPaymentModal(false);
      setPaymentCode('');
      setShowSuccessModal(true);
    }, 1500);
  };



  const tiers = [
    {
      name: 'Mentor (Nâng cao)',
      price: '49,000đ',
      period: '/ tháng',
      badge: 'Cơ Bản & Trực Quan',
      popular: false,
      features: [
        'Toàn bộ bài học cơ bản + nâng cao',
        'AI Mentor giới hạn 20 câu/ngày',
        'Học trực quan cùng sơ đồ Recharts',
        'Huy chương thành tựu nâng cao'
      ],
      current: user?.subscription === 'Mentor',
      color: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-slate-300 dark:hover:border-slate-700',
      icon: BookOpen,
      iconColor: 'text-blue-600 bg-blue-500/10'
    },
    {
      name: 'Premium (Chuyên nghiệp)',
      price: '99,000đ',
      period: '/ tháng',
      badge: 'Khuyên Dùng',
      popular: true,
      features: [
        'Toàn bộ 15+ khóa học chuyên sâu',
        'AI Mentor không giới hạn câu hỏi',
        'Học trực quan cùng sơ đồ Recharts',
        'Không quảng cáo giới hạn',
        'Huy chương thành tựu nâng cao'
      ],
      current: user?.subscription === 'Premium',
      color: 'border-brand-teal ring-2 ring-brand-teal/20 bg-white dark:bg-slate-900 shadow-md scale-102 z-10',
      icon: Sparkles,
      iconColor: 'text-brand-teal bg-brand-teal/10'
    },
    {
      name: 'Mentor+ (Đặc quyền)',
      price: '199,000đ',
      period: '/ tháng',
      badge: 'Chuyên Gia Cao Cấp',
      popular: false,
      features: [
        'Tất cả đặc quyền bản Premium',
        'AI Mentor+ không giới hạn câu hỏi',
        'Cảnh báo biến động thị trường từ AI',
        'Chuyên mục Đọc phân tích của chuyên gia',
        'Hỗ trợ khẩn cấp 1-1 phòng chống lừa đảo'
      ],
      current: user?.subscription === 'Mentor+',
      color: 'border-amber-400 bg-white dark:bg-slate-900 shadow-sm hover:border-amber-500',
      icon: Crown,
      iconColor: 'text-amber-500 bg-amber-500/10'
    }
  ];

  const subTier = user?.subscription || 'Free';

  return (
    <div className="space-y-6 fade-in font-sans">
      
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-3 text-left">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
            <Settings size={22} className="text-brand-teal" />
            <span>Hồ Sơ & Gói Tài Khoản</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Quản lý hồ sơ rủi ro học tập, theo dõi điểm thưởng tích lũy và cấu hình gói dịch vụ.</p>
        </div>
        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
          🟢 Hệ thống hoạt động bình thường
        </span>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Profile Stats Card */}
          <div className={`glass-panel p-5 rounded-xl border text-center space-y-4 relative overflow-hidden bg-white/80 dark:bg-slate-900/85 border-slate-200 dark:border-slate-800 shadow-lg ${
            subTier === 'Mentor+' ? 'border-amber-500/40 ring-1 ring-amber-500/10' 
            : subTier === 'Premium' ? 'border-brand-teal/40' 
            : subTier === 'Mentor' ? 'border-blue-400/40'
            : ''
          }`}>
            <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 border border-blue-500/25 rounded-md text-[8px] font-extrabold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>Dữ liệu thực tế</span>
            </div>

            <div className="relative w-20 h-20 mx-auto mt-2">
              <img 
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                alt={user?.name} 
                className={`w-20 h-20 rounded-full object-cover ring-4 ${
                  subTier === 'Mentor+' ? 'ring-amber-500/50' : subTier === 'Premium' ? 'ring-brand-teal/50' : 'ring-slate-300 dark:ring-slate-700'
                }`}
              />
              {subTier !== 'Free' && (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 border-2 border-white dark:border-slate-900 shadow-md">
                  <Crown size={12} className="fill-white" />
                </div>
              )}
            </div>

            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center justify-center space-x-1">
                <span>{user?.name}</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">{user?.email}</span>
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
 
            {/* Risk profile box */}
            <div className="p-4 bg-teal-500/5 dark:bg-teal-900/10 border border-brand-teal/25 rounded-xl text-left text-xs">
              <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Khẩu vị rủi ro hiện tại</span>
              <h4 className="font-extrabold text-brand-teal dark:text-brand-teallight text-sm">
                {riskProfile === 'Conservative' ? '🛡️ AN TOÀN (Conservative)' : riskProfile === 'Aggressive' ? '🔥 TĂNG TRƯỞNG (Aggressive)' : '⚖️ CÂN BẰNG (Balanced)'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-light">
                Được đánh giá dựa trên khảo sát. Lộ trình bài học và rổ gợi ý ETF được tinh chỉnh theo hồ sơ này.
              </p>
              {onboardingAnswers && (
                <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/20 space-y-1 text-[10px] text-slate-400">
                  <div>Thu nhập dự kiến: <strong className="text-slate-700 dark:text-slate-200 font-mono">{parseFloat(onboardingAnswers.income).toLocaleString()} đ</strong></div>
                  <div>Khả năng tiết kiệm: <strong className="text-slate-700 dark:text-slate-200 font-mono">{parseFloat(onboardingAnswers.savings).toLocaleString()} đ/tháng</strong></div>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information KYC Card */}
          <div className="glass-panel p-5 rounded-xl border bg-white/80 dark:bg-slate-900/85 border-slate-200 dark:border-slate-800 shadow-lg text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-850 dark:text-white flex items-center space-x-1.5 font-sans">
                <ShieldCheck size={16} className="text-brand-teal" />
                <span>Thông Tin Cá Nhân KYC</span>
              </h3>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                user?.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                user?.status === 'Pending KYC' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse' :
                user?.status === 'Rejected KYC' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' :
                'bg-slate-500/10 text-slate-600 border border-slate-500/20'
              }`}>
                {user?.status === 'Active' ? 'Đã xác thực' :
                 user?.status === 'Pending KYC' ? 'Chờ duyệt' :
                 user?.status === 'Rejected KYC' ? 'Bị từ chối' : 'Chưa KYC'}
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed font-sans">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850">
                <span className="text-slate-400 font-semibold">Số CMND/CCCD</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-slate-800 dark:text-white">
                    {user?.idNumber ? (showSensitiveData ? user.idNumber : `${user.idNumber.substring(0, 4)}••••${user.idNumber.substring(user.idNumber.length - 4)}`) : 'Chưa cung cấp'}
                  </span>
                  {user?.idNumber && (
                    <button 
                      onClick={() => setShowSensitiveData(!showSensitiveData)}
                      className="text-slate-450 hover:text-brand-teal focus:outline-none transition-colors cursor-pointer"
                      type="button"
                    >
                      {showSensitiveData ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850">
                  <span className="block text-[9px] text-slate-400 font-semibold mb-0.5">Ngày sinh</span>
                  <span className="font-bold text-slate-800 dark:text-white">{user?.dob || 'Chưa cung cấp'}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850">
                  <span className="block text-[9px] text-slate-400 font-semibold mb-0.5">Giới tính</span>
                  <span className="font-bold text-slate-800 dark:text-white">{user?.gender || 'Chưa cung cấp'}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850">
                <span className="block text-[9px] text-slate-400 font-semibold mb-0.5">Địa chỉ thường trú</span>
                <span className="font-bold text-slate-800 dark:text-white break-words">{user?.address || 'Chưa cung cấp'}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850">
                <span className="block text-[9px] text-slate-400 font-semibold mb-0.5">Ngày cấp thẻ CCCD</span>
                <span className="font-bold text-slate-800 dark:text-white">{user?.idIssueDate || 'Chưa cung cấp'}</span>
              </div>
            </div>
          </div>
        </div>
 
        {/* Right Columns: Main content panels */}
        <div className="lg:col-span-2 space-y-6 text-left">
          


          {/* Section 2: VIP Library & Ebooks (Mentor / Premium / Mentor+) */}
          {(subTier === 'Mentor' || subTier === 'Premium' || subTier === 'Mentor+') && (
            <div className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-md text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                <div className="flex items-center space-x-2">
                  <BookOpen className="text-amber-500" size={18} />
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Thư viện Sách điện tử (Ebook VIP)</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[9px] font-black text-amber-500 uppercase tracking-widest border border-amber-500/20">
                  Mở khóa
                </span>
              </div>

              {activeEbook ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-850 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/40 pb-2">
                    <span className="font-extrabold text-slate-800 dark:text-white">{activeEbook.title}</span>
                    <button 
                      onClick={() => setActiveEbook(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="min-h-[60px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    {activeEbook.pages[ebookPage]}
                  </p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 dark:border-slate-800/40">
                    <button 
                      disabled={ebookPage === 0}
                      onClick={() => setEbookPage(prev => Math.max(0, prev - 1))}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-[10px] font-bold disabled:opacity-50"
                    >
                      Trang trước
                    </button>
                    <span className="text-[10px] text-slate-400">Trang {ebookPage + 1} / {activeEbook.pages.length}</span>
                    <button 
                      disabled={ebookPage === activeEbook.pages.length - 1}
                      onClick={() => setEbookPage(prev => Math.min(activeEbook.pages.length - 1, prev + 1))}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-[10px] font-bold disabled:opacity-50"
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vipEbooks.map(book => (
                    <div key={book.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-xl flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="font-bold text-[11px] text-slate-800 dark:text-white">{book.title}</h4>
                        <p className="text-[10px] text-slate-400 font-light">VIP Ebook • {book.pages.length} trang tài liệu</p>
                      </div>
                      <button
                        onClick={() => startDownload(book)}
                        disabled={downloadingBookId !== null}
                        className="p-2 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal rounded-lg transition-all shrink-0 cursor-pointer"
                      >
                        {downloadingBookId === book.id ? (
                          <span className="text-[10px] font-bold animate-pulse">{downloadProgress}%</span>
                        ) : (
                          <Download size={14} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Expert Analysis Articles (Mentor / Premium / Mentor+) */}
          {(subTier === 'Mentor' || subTier === 'Premium' || subTier === 'Mentor+') && (
            <div className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-md text-left space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-850">
                <Crown className="text-amber-500" size={18} />
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Góc Phân Tích Chuyên Gia (VIP)</h3>
              </div>

              {activeArticle ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-850 rounded-xl space-y-3 text-xs leading-relaxed">
                  <div className="flex justify-between items-start border-b border-slate-200/50 dark:border-slate-800/40 pb-2">
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white">{activeArticle.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Tác giả: {activeArticle.author} • {activeArticle.date}</p>
                    </div>
                    <button 
                      onClick={() => setActiveArticle(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-light font-sans text-[11px] whitespace-pre-line leading-relaxed">
                    {activeArticle.content}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {vipArticles.map(art => (
                    <div 
                      key={art.id}
                      onClick={() => setActiveArticle(art)}
                      className="p-3 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl border border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center cursor-pointer transition-all group"
                    >
                      <div>
                        <h4 className="font-bold text-[11.5px] text-slate-800 dark:text-slate-100 group-hover:text-brand-teal transition-colors">{art.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Viết bởi {art.author} • {art.date}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 4: 1-1 SOS Scam Prevention Chat (Only for Mentor+) */}
          {subTier === 'Mentor+' && (
            <div className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-md text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="text-rose-500 animate-pulse" size={18} />
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Đường dây nóng SOS Phòng Chống Lừa Đảo</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-[9px] font-black text-rose-500 uppercase tracking-widest border border-rose-500/20">
                  1-1 Expert Live
                </span>
              </div>

              {sosStatus === 'idle' && (
                <form onSubmit={handleSOSSubmit} className="space-y-3">
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Bạn nhận được cuộc gọi, tin nhắn tuyển cộng tác viên, hay dự án lãi suất cao mập mờ? Hãy nhập tên dự án hoặc số điện thoại nghi vấn vào đây để được chuyên gia bảo mật tài chính kiểm duyệt tức thì.
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={sosForm.title}
                      onChange={(e) => setSosForm({ ...sosForm, title: e.target.value })}
                      placeholder="VD: Dự án CTV Shopee kiếm 500k/ngày, SĐT 0912xxxxxx..."
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500/50"
                    />
                    <button 
                      type="submit"
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                    >
                      Báo cáo khẩn cấp
                    </button>
                  </div>
                </form>
              )}

              {(sosStatus === 'sending' || sosStatus === 'connecting') && (
                <div className="p-10 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {sosStatus === 'sending' ? 'Đang gửi dữ liệu báo cáo...' : 'Đang kết nối với Cố vấn Bảo mật Đỗ Hữu Quân...'}
                  </p>
                </div>
              )}

              {sosStatus === 'connected' && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-64 bg-slate-50 dark:bg-slate-950/60">
                  <div className="p-2.5 bg-rose-600 text-white text-[10px] font-black uppercase flex items-center justify-between">
                    <span>Đang kết nối: Chuyên gia Đỗ Hữu Quân</span>
                    <button 
                      onClick={() => setSosStatus('idle')}
                      className="hover:text-slate-200"
                    >
                      Đóng
                    </button>
                  </div>
                  
                  {/* Chat messages */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs scrollbar-thin">
                    {sosChat.map((msg, mIdx) => (
                      <div 
                        key={mIdx}
                        className={`max-w-[80%] p-2.5 rounded-xl text-[11px] leading-relaxed whitespace-pre-line ${
                          msg.sender === 'user' 
                            ? 'bg-rose-600 text-white ml-auto rounded-tr-none' 
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 mr-auto rounded-tl-none border border-slate-200/50 dark:border-slate-800/40'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  {/* Chat input */}
                  <form onSubmit={handleSendSOSMsg} className="p-2 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 bg-white dark:bg-slate-900">
                    <input 
                      type="text"
                      value={sosMessageInput}
                      onChange={(e) => setSosMessageInput(e.target.value)}
                      placeholder="Nhập tin nhắn của bạn..."
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none"
                    />
                    <button 
                      type="submit"
                      className="px-3 py-2 bg-rose-600 text-white font-bold text-xs rounded-lg hover:bg-rose-500 cursor-pointer"
                    >
                      Gửi
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Section 5: Badges / Achievements list */}
          {(subTier === 'Mentor' || subTier === 'Premium' || subTier === 'Mentor+') && (
            <div className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-md text-left space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-850">
                <Award className="text-amber-500" size={18} />
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Huy Chương Thành Tựu VIP</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {vipBadges.map(badge => (
                  <div key={badge.name} className="p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-xl flex items-center space-x-3 hover:shadow-xs transition-shadow">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${badge.color} text-white flex items-center justify-center text-lg shrink-0`}>
                      {badge.icon}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-[11px] text-slate-850 dark:text-white">{badge.name}</h4>
                      <p className="text-[10px] text-slate-400 font-light">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Subscription Tiers Comparison */}
          <div className="glass-panel p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md text-left space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <CreditCard size={18} className="text-brand-teal" />
                  <span>Gói Dịch Vụ & Hội Viên Tích Lũy</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Nâng cấp tài khoản để mở khóa kiến thức chuyên sâu và trợ giúp từ AI không giới hạn.</p>
              </div>
              <div className="px-3 py-1 bg-brand-teal/5 border border-brand-teal/10 rounded-full text-[10px] font-black text-brand-teal uppercase tracking-widest self-start md:self-auto">
                3 gói lựa chọn
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {tiers.map((tier) => {
                const TierIcon = tier.icon;
                return (
                  <div 
                    key={tier.name} 
                    className={`p-5 rounded-2xl border flex flex-col justify-between relative transition-all duration-200 ${
                      tier.popular 
                        ? 'border-brand-teal ring-4 ring-brand-teal/5 dark:ring-brand-teal/10 bg-slate-50/10 dark:bg-slate-900/40 translate-y-[-4px]' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 hover:border-slate-350 dark:hover:border-slate-700'
                    } ${tier.color}`}
                  >
                    {/* Active or Popular Badge */}
                    {tier.current ? (
                      <span className="absolute -top-2.5 left-5 px-2.5 py-0.5 rounded-full bg-brand-teal text-[8px] font-black text-white uppercase tracking-wider shadow-sm z-20">
                        Gói hiện tại
                      </span>
                    ) : tier.popular ? (
                      <span className="absolute -top-2.5 left-5 px-2.5 py-0.5 rounded-full bg-amber-500 text-[8px] font-black text-white uppercase tracking-wider shadow-sm z-20">
                        Phổ biến nhất
                      </span>
                    ) : null}

                    <div className="space-y-4">
                      {/* Tier Icon & Badge info */}
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl ${tier.iconColor} shrink-0`}>
                          <TierIcon size={18} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">
                          {tier.badge}
                        </span>
                      </div>

                      {/* Package Name & Price */}
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-105">{tier.name}</h4>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-xl font-black text-slate-950 dark:text-white font-mono">{tier.price}</span>
                          <span className="text-[10px] text-slate-400 font-light">{tier.period}</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-850 my-2" />

                      {/* Feature List */}
                      <ul className="space-y-2.5">
                        {tier.features.map((feat) => (
                          <li key={feat} className="flex items-start space-x-2 text-[10.5px]">
                            <Check size={13} className="text-brand-green shrink-0 mt-0.5" />
                            <span className="text-slate-650 dark:text-slate-400 leading-normal font-light">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button 
                      disabled={tier.current}
                      onClick={() => handleUpgradeClick(tier)}
                      className={`w-full mt-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-wide cursor-pointer ${
                        tier.current 
                          ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed border border-slate-200/20' 
                          : tier.popular
                            ? 'bg-brand-teal hover:bg-brand-teal/95 text-white shadow-md shadow-blue-500/10 hover:shadow-lg'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-250 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {tier.current ? 'Đang kích hoạt' : 'Nâng cấp ngay'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 p-3 bg-brand-green/5 rounded-xl border border-brand-green/10 flex items-center space-x-2 text-[10.5px] text-slate-550 dark:text-slate-400 leading-relaxed font-light">
              <ShieldCheck size={16} className="text-brand-green shrink-0" />
              <span>Hoàn phí 100% trong 7 ngày đầu nếu bạn không hài lòng về chất lượng nội dung học tập.</span>
            </div>
          </div>

          {/* Section 7: My Upgrade Request History */}
          {(() => {
            const myRequests = (paymentRequests || []).filter(r => r.userId === user?.id);
            if (myRequests.length === 0) return null;
            const STATUS_MAP = {
              Pending:  { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',   label: '⏳ Chờ duyệt' },
              Approved: { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: '✅ Đã duyệt' },
              Rejected: { cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30',       label: '❌ Từ chối' },
            };
            return (
              <div className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-md text-left space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-850">
                  <CreditCard className="text-brand-teal" size={18} />
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Lịch Sử Yêu Cầu Nâng Cấp</h3>
                </div>
                <div className="space-y-2">
                  {myRequests.map(req => {
                    const sc = STATUS_MAP[req.status] || STATUS_MAP['Pending'];
                    return (
                      <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{req.targetTier}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Mã: {req.paymentCode} · {new Date(req.createdAt).toLocaleDateString('vi-VN')}</p>
                          {req.note && <p className="text-[10px] text-rose-400 italic">{req.note}</p>}
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${sc.cls}`}>{sc.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

        </div>

      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h3 className="font-extrabold text-sm text-slate-805 dark:text-white flex items-center space-x-2">
                <CreditCard size={18} className="text-brand-teal" />
                <span>Thanh toán nâng cấp</span>
              </h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5 text-center">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Gói bạn chọn</p>
                <h4 className="font-extrabold text-brand-teal text-base">{selectedTier.name}</h4>
                <p className="font-bold text-slate-800 dark:text-white">{selectedTier.price}</p>
              </div>

              <div className="flex flex-col items-center p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 rounded-xl space-y-3">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-350">Quét mã QR để thanh toán</span>
                <div className="w-32 h-32 bg-white p-2.5 rounded-xl flex items-center justify-center shadow-sm">
                  <QrCode size={110} className="text-slate-800" />
                </div>
                <div className="text-center space-y-0.5">
                  <p className="text-[10px] text-slate-400">Hoặc chuyển khoản với nội dung:</p>
                  <p className="font-mono text-xs font-black text-slate-800 dark:text-white bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">UPGRADE {user?.name ? user.name.toUpperCase().replace(/\s+/g, '') : 'USER'}</p>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nhập mã thanh toán (Mã giao dịch / Promo code)</label>
                <input
                  type="text"
                  value={paymentCode}
                  onChange={(e) => setPaymentCode(e.target.value)}
                  placeholder="VD: MB123456789 hoặc SAVEPLUS50"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-brand-teal/50"
                />
              </div>

              <button
                onClick={handlePaymentSubmit}
                disabled={!paymentCode.trim() || isProcessing}
                className="w-full py-3 bg-brand-teal hover:bg-brand-teal/95 disabled:bg-slate-200 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
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

      {/* Upgrade Success / Pending Dialog */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm p-6 text-center space-y-6 relative shadow-2xl">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 text-3xl">
              ⏳
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Yêu Cầu Đã Được Ghi Nhận!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                Admin/Staff sẽ xem xét và xác nhận yêu cầu nâng cấp của bạn trong thời gian sớm nhất. Bạn sẽ nhận được thông báo khi có kết quả!
              </p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 bg-brand-teal hover:bg-brand-teal/90 text-white font-bold text-xs rounded-xl transition-all cursor-pointer uppercase"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

