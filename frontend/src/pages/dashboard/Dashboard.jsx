import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Sparkles, 
  Award, 
  CheckSquare, 
  TrendingUp, 
  ChevronRight, 
  HelpCircle, 
  ShieldCheck, 
  BookOpen, 
  ArrowUpRight, 
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  HelpCircle as QuestionIcon,
  Compass,
  Trophy,
  Zap,
  Globe,
  Wallet
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DASHBOARD_DAILY_QUESTIONS = [
  {
    question: 'Kênh đầu tư nào thường bị ảnh hưởng tiêu cực nhất khi lạm phát tăng cao phi mã?',
    options: [
      'A. Bất động sản trung tâm',
      'B. Vàng vật chất',
      'C. Tiền mặt gửi tiết kiệm lãi suất cố định thấp',
      'D. Cổ phiếu của các công ty năng lượng'
    ],
    answerIndex: 2,
    explanation: 'Khi lạm phát tăng cao, tiền gửi lãi suất thấp sẽ bị mất giá trị thực tế nhanh chóng vì lãi suất thực tế có thể âm.'
  },
  {
    question: 'Để kiểm tra tính an toàn pháp lý của một chứng chỉ quỹ mở tại Việt Nam, bạn nên tra cứu ở đâu?',
    options: [
      'A. Trang cá nhân của các influencer tài chính',
      'B. Danh mục được cấp phép của Ủy ban Chứng khoán Nhà nước (UBCKNN)',
      'C. Các hội nhóm chat kín trên Telegram',
      'D. Diễn đàn thảo luận công nghệ tự do'
    ],
    answerIndex: 1,
    explanation: 'Ủy ban Chứng khoán Nhà nước là cơ quan quản lý và cấp phép hoạt động chính thức cho các quỹ mở tại Việt Nam. Tra cứu tại đây đảm bảo tính pháp lý.'
  },
  {
    question: 'Hành vi nào sau đây là dấu hiệu cảnh báo cao nhất của một dự án lừa đảo đa cấp Ponzi?',
    options: [
      'A. Yêu cầu nhà đầu tư ký hợp đồng dịch vụ tư vấn tài chính',
      'B. Lợi nhuận không cố định và phụ thuộc vào kết quả kinh doanh thực tế',
      'C. Yêu cầu lôi kéo người tham gia mới để được hưởng hoa hồng hệ thống nhiều tầng',
      'D. Báo cáo tài chính của doanh nghiệp được kiểm toán độc lập'
    ],
    answerIndex: 2,
    explanation: 'Mô hình Ponzi bản chất lấy tiền của người tham gia sau trả cho người trước. Hoa hồng giới thiệu nhiều tầng là động lực để hệ thống phình to và sụp đổ.'
  },
  {
    question: 'Nếu bạn muốn mua tích lũy dài hạn và không có thời gian theo dõi thị trường hàng ngày, lựa chọn nào tối ưu nhất?',
    options: [
      'A. Giao dịch phái sinh hợp đồng tương lai VN30',
      'B. Mua tích lũy định kỳ (DCA) các chứng chỉ quỹ ETF chỉ số lớn',
      'C. Mua cổ phiếu đầu cơ penny có biên độ dao động mạnh',
      'D. Lướt sóng coin cỏ ngắn hạn'
    ],
    answerIndex: 1,
    explanation: 'DCA vào quỹ ETF chỉ số lớn (như VN30 hay Diamond) giúp trung bình hóa chi phí mua, đa dạng hóa rổ tài sản và tối ưu lợi nhuận dài hạn một cách thụ động.'
  },
  {
    question: 'Mức lãi suất tiết kiệm ngân hàng thông thường chịu sự chi phối trực tiếp lớn nhất từ cơ quan nào?',
    options: [
      'A. Sở giao dịch chứng khoán',
      'B. Ngân hàng Nhà nước Việt Nam (SBV)',
      'C. Hiệp hội bất động sản',
      'D. Các công ty chứng khoán tư nhân'
    ],
    answerIndex: 1,
    explanation: 'Ngân hàng Nhà nước Việt Nam quản lý chính sách tiền tệ và quy định mức lãi suất điều hành, tác động trực tiếp đến biểu lãi suất huy động của các ngân hàng thương mại.'
  },
  {
    question: 'Tỷ lệ nợ trên thu nhập (Debt-to-Income ratio) tốt nhất nên kiểm soát ở mức nào?',
    options: [
      'A. Dưới 10%',
      'B. Dưới 35%',
      'C. Khoảng 50% đến 70%',
      'D. Không giới hạn miễn là có thu nhập'
    ],
    answerIndex: 1,
    explanation: 'Kiểm soát tổng nghĩa vụ trả nợ (bao gồm cả gốc và lãi) dưới 35% tổng thu nhập hàng tháng giúp đảm bảo bạn không bị mất cân đối tài chính hay rơi vào bẫy nợ.'
  },
  {
    question: 'Tại sao việc tự tái cân bằng rổ tài sản theo quý hoặc năm lại cần thiết?',
    options: [
      'A. Để đổi mã cổ phiếu liên tục lấy vận may',
      'B. Để duy trì khẩu vị rủi ro thiết lập ban đầu, tránh việc một lớp tài sản tăng quá mạnh chiếm lĩnh tỷ trọng lớn',
      'C. Để rút hết tiền mặt ra gửi tiết kiệm',
      'D. Tránh việc đóng thuế thu nhập cá nhân'
    ],
    answerIndex: 1,
    explanation: 'Tái cân bằng đưa rổ tài sản về tỷ lệ mong muốn ban đầu, giúp thực hiện kỷ luật chốt lời tài sản tăng mạnh và tích lũy tài sản giá tốt.'
  }
];

export default function Dashboard() {
  const { user, riskProfile, xp, streak, balance, goals, addXP } = useAuth();
  const { courses } = useCourses();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const sub = user?.subscription || 'Free';
  const dailyQuizLimit = (sub === 'Premium' || sub === 'Mentor+') ? 20 : 5;

  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Daily Question states
  const [dailyQCompleted, setDailyQCompleted] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return localStorage.getItem(`saveplus_daily_q_done_${today}`) === 'true';
  });
  const [selectedDailyOption, setSelectedDailyOption] = useState(null);
  const [showDailyResult, setShowDailyResult] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return localStorage.getItem(`saveplus_daily_q_done_${today}`) === 'true';
  });

  useEffect(() => {
    // Show immediately if it is a new session and not postponed
    const checkPopup = () => {
      const postponeUntil = localStorage.getItem('saveplus_postpone_until');
      const now = Date.now();
      
      if (!postponeUntil || now >= parseInt(postponeUntil)) {
        const hasShownInSession = sessionStorage.getItem('saveplus_login_popup_shown');
        if (postponeUntil && now >= parseInt(postponeUntil)) {
          localStorage.removeItem('saveplus_postpone_until');
          sessionStorage.removeItem('saveplus_login_popup_shown');
          setShowLoginModal(true);
        } else if (!hasShownInSession) {
          setShowLoginModal(true);
        }
      }
    };

    checkPopup();
    const interval = setInterval(checkPopup, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRoadmapClick = (courseId) => {
    const courseIndex = courses.findIndex(c => c.id === courseId);
    const isLocked = courseIndex > 0 && (courses[courseIndex - 1]?.progress || 0) < 100;
    if (isLocked) {
      alert("Bài học này đang bị khóa. Bạn cần hoàn thành bài học trước đó đạt 100% (gồm bài đọc & trắc nghiệm) để mở khóa!");
      return;
    }
    navigate('/learning', { state: { startCourseId: courseId } });
  };

  // Onboarding checklist state
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Hoàn thành Câu hỏi hằng ngày trên Dashboard', done: dailyQCompleted, xp: 20 },
    { id: 2, text: 'Học bài giảng: Tiết kiệm & Tích lũy', done: false, xp: 20 },
    { id: 3, text: 'Chạy thử giả lập lãi kép 2M/tháng', done: false, xp: 30 },
    { id: 4, text: 'Đọc cẩm nang nhận diện Ponzi lừa đảo', done: false, xp: 25 },
    { id: 5, text: 'Hỏi AI Mentor về rổ tài sản ETF', done: false, xp: 15 }
  ]);

  useEffect(() => {
    setChecklist(prev => prev.map(item => item.id === 1 ? { ...item, done: dailyQCompleted } : item));
  }, [dailyQCompleted]);

  const toggleChecklist = (id) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        if (!item.done) {
          addXP(item.xp); // Grant XP on check
        }
        return { ...item, done: !item.done };
      }
      return item;
    }));
  };

  // Recharts compound interest simulator data (Saving 2M/month vs diversified saving over 6 months)
  const chartData = [
    { name: 'Tháng 1', Cash: 2000000, Diversified: 2000000 },
    { name: 'Tháng 2', Cash: 4000000, Diversified: 4100000 },
    { name: 'Tháng 3', Cash: 6000000, Diversified: 6250000 },
    { name: 'Tháng 4', Cash: 8000000, Diversified: 8480000 },
    { name: 'Tháng 5', Cash: 10000000, Diversified: 10790000 },
    { name: 'Tháng 6', Cash: 12000000, Investing: 12000000, Diversified: 13240000 },
  ];

  // Calculate learning score based on progress average
  const totalProgress = courses.reduce((acc, c) => acc + c.progress, 0);
  const confidenceScore = courses.length ? Math.round(totalProgress / courses.length) : 0;

  // Level info
  const calculateLevelInfo = (xpPoints) => {
    const xpPerLevel = 250;
    const currentLvl = Math.floor((xpPoints || 150) / xpPerLevel) + 1;
    const nextLvlXp = currentLvl * xpPerLevel;
    const prevLvlXp = (currentLvl - 1) * xpPerLevel;
    const relativeXp = xpPoints - prevLvlXp;
    return {
      level: currentLvl,
      relativeXp,
      neededXp: xpPerLevel,
      pct: Math.min(100, Math.round((relativeXp / xpPerLevel) * 100))
    };
  };

  const lvlInfo = calculateLevelInfo(xp || 150);

  // AI recommendations
  const getAIRecommendation = () => {
    switch (riskProfile) {
      case 'Safe Saver':
        return {
          title: 'Gợi ý AI: Ưu tiên bảo vệ dòng tiền & Nhận diện cạm bẫy',
          message: 'Chào Lâm, là một Safe Saver, việc bảo mật tài khoản và nhận diện các dự án lừa đảo tài chính Ponzi cam kết lãi suất cao là rất quan trọng. Hãy đọc bài "Nhận diện lừa đảo" trước nhé.'
        };
      case 'Blockchain Curious':
        return {
          title: 'Gợi ý AI: Tìm hiểu đa dạng hóa tài sản & Chứng chỉ quỹ',
          message: 'Chào Lâm, với tư duy cởi mở tìm tòi, hãy bắt đầu tìm hiểu về Quỹ chỉ số ETF để hiểu cách phân tán rủi ro đầu tư hiệu quả vào top doanh nghiệp Việt Nam.'
        };
      case 'High Growth Seeker':
        return {
          title: 'Gợi ý AI: Học Kỷ luật vốn & Thực hành Giả lập tích lũy',
          message: 'Chào Lâm, khẩu vị tăng trưởng mạnh mẽ của bạn rất tốt, nhưng cần đi kèm tính kỷ luật cao. Hãy hoàn thành giả lập tích lũy tài sản 2 triệu/tháng để thấy rõ sức mạnh lãi kép.'
        };
      default:
        return {
          title: 'Gợi ý AI: Tích lũy đều đặn & Khám phá lãi suất kép',
          message: 'Chào Lâm, dựa trên cá tính tài chính của bạn, hãy tiếp tục học bài học "Lãi kép: Kỳ quan thế giới" để hiểu cách bắt đầu tích lũy sớm tạo ra sự khác biệt khổng lồ.'
        };
    }
  };

  const aiRec = getAIRecommendation();

  // Proposed asset allocation data based on risk profile
  const getAllocationData = () => {
    switch (riskProfile) {
      case 'Conservative':
      case 'Safe Saver':
        return [
          { name: 'Trái phiếu & Quỹ trái phiếu', value: 60, color: '#00A389' },
          { name: 'Gửi tiết kiệm / Tiền mặt', value: 25, color: '#94A3B8' },
          { name: 'Cổ phiếu & Quỹ chỉ số (ETF)', value: 15, color: '#0F62FE' }
        ];
      case 'Aggressive':
      case 'High Growth Seeker':
        return [
          { name: 'Cổ phiếu & Quỹ chỉ số (ETF)', value: 75, color: '#0F62FE' },
          { name: 'Trái phiếu & Quỹ trái phiếu', value: 15, color: '#00A389' },
          { name: 'Tài sản kỹ thuật số / Khác', value: 10, color: '#D97706' }
        ];
      case 'Balanced':
      case 'Blockchain Curious':
      default:
        return [
          { name: 'Cổ phiếu & Quỹ chỉ số (ETF)', value: 50, color: '#0F62FE' },
          { name: 'Trái phiếu & Quỹ trái phiếu', value: 35, color: '#00A389' },
          { name: 'Gửi tiết kiệm / Tiền mặt', value: 15, color: '#94A3B8' }
        ];
    }
  };

  const allocationData = getAllocationData();

  // Next course suggestion
  const nextCourse = courses.find(c => c.progress < 100) || courses[0];

  // Dynamic Course progress checks for Roadmap
  const c01Progress = courses.find(c => c.id === 'C01')?.progress || 0;
  const c02Progress = courses.find(c => c.id === 'C02')?.progress || 0;
  const c03Progress = courses.find(c => c.id === 'C03')?.progress || 0;
  const c04Progress = courses.find(c => c.id === 'C04')?.progress || 0;
  const c05Progress = courses.find(c => c.id === 'C05')?.progress || 0;

  return (
    <div className="space-y-6 fade-in text-slate-800 dark:text-white font-sans">
      
      {/* 1. PERSONALIZED PORTFOLIO OVERVIEW HEADER (Clean light corporate design) */}
      <div className="glass-panel p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded bg-brand-teal/5 border border-brand-teal/10 text-[9px] uppercase font-bold text-brand-teal tracking-wider">
                HỌC TRÌNH TÀI CHÍNH NỀN TẢNG
              </span>
              <span className="text-xs text-slate-400 font-mono">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Hệ thống phân tích hành vi & kiến thức</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Chào buổi sáng, {user?.name || 'Lâm'} 👋
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed font-light">
              Tài khoản của bạn đang vận hành ổn định. Đã tích lũy thành công <strong className="text-brand-teal font-semibold">{confidenceScore}%</strong> lộ trình kiến thức và phát triển kỹ năng đầu tư an toàn.
            </p>

            {/* Level and XP progress */}
            <div className="pt-2 max-w-md">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">
                <span className="flex items-center space-x-1.5">
                  <Trophy size={13} className="text-brand-gold" />
                  <span>Cấp độ học tập: Level {lvlInfo.level} Explorer</span>
                </span>
                <span className="font-mono text-slate-500">{xp || 150} / {lvlInfo.level * 250} XP</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
                <div 
                  className="bg-brand-teal h-full transition-all duration-500" 
                  style={{ width: `${lvlInfo.pct}%` }} 
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Còn {lvlInfo.neededXp - lvlInfo.relativeXp} XP nữa để thăng cấp tiếp theo</span>
            </div>
          </div>

          {/* Stats blocks grid */}
          <div className="flex flex-wrap gap-4 shrink-0">
            {/* Stat Item 1: Chuỗi */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-left min-w-[140px] flex items-center space-x-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-amber-500/10">
                <Flame size={20} className="fill-amber-500 text-amber-500" />
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Chuỗi chuyên cần</span>
                <span className="block text-base font-bold text-slate-800 dark:text-white leading-tight mt-0.5">{streak || 4} ngày học</span>
                <span className="text-[9px] text-brand-green font-medium">Học tập đều đặn</span>
              </div>
            </div>

            {/* Stat Item 2: Số dư tích lũy giả lập */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-left min-w-[180px] flex items-center space-x-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center border border-brand-green/10">
                <Wallet size={20} className="text-brand-green" />
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Vốn tích lũy thử nghiệm</span>
                <span className="block text-base font-bold text-slate-800 dark:text-white leading-tight mt-0.5 font-mono">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(balance)}
                </span>
                <span className="text-[9px] text-brand-teal font-medium">Có sẵn giao dịch</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CURIOSITY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div 
          onClick={() => navigate('/profile')}
          className="glass-panel p-5 rounded-xl cursor-pointer group flex items-start space-x-3.5 hover-scale"
        >
          <div className="p-2 bg-brand-teal/5 text-brand-teal rounded-lg border border-brand-teal/10">
            <Compass size={16} />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-brand-teal uppercase tracking-wider block">Tính cách tài chính</span>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-brand-teal transition-colors">Xem lại cá tính rủi ro của bạn</h4>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
              Hệ thống gợi ý các bài học và danh mục đầu tư dựa trên khẩu vị rủi ro: {riskProfile || 'Safe Saver'}.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => navigate('/learning')}
          className="glass-panel p-5 rounded-xl cursor-pointer group flex items-start space-x-3.5 hover-scale"
        >
          <div className="p-2 bg-amber-500/5 text-amber-500 rounded-lg border border-amber-500/10">
            <Lock size={16} />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">Tiến độ học tập</span>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors">Học tuần tự từng bài học</h4>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
              Hoàn thành 100% bài học trước (gồm bài đọc & mini-quiz) để mở khóa bài học tiếp theo trong lộ trình.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => navigate('/simulation')}
          className="glass-panel p-5 rounded-xl cursor-pointer group flex items-start space-x-3.5 hover-scale"
        >
          <div className="p-2 bg-brand-green/5 text-brand-green rounded-lg border border-brand-green/10">
            <QuestionIcon size={16} />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-brand-green uppercase tracking-wider block">Giả lập thực chiến</span>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-brand-green transition-colors">Trải nghiệm sức mạnh Lãi Kép</h4>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
              Thử thiết lập hạn mức đầu tư tích lũy định kỳ để xem biến động giá trị tài sản 10 năm sau.
            </p>
          </div>
        </div>
      </div>

      {/* 3. VISUAL ROADMAP TIMELINE */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div>
          <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <Compass size={16} className="text-brand-teal" />
            <span>Sơ Đồ Học Trình Quản Lý Vốn & Tích Lũy</span>
          </h3>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-light mt-0.5">Hoàn thành bài đọc & trắc nghiệm để mở khóa chuyên đề tiếp theo.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-1">
          {/* Step 1: ETF & Chứng chỉ quỹ */}
          <div 
            onClick={() => handleRoadmapClick('C01')}
            className={`p-3.5 rounded-lg border text-center flex flex-col items-center justify-between space-y-2 cursor-pointer transition-all hover:border-brand-teal ${
              c01Progress === 100 
                ? 'border-brand-green/20 bg-brand-green/5 text-brand-green' 
                : 'border-brand-teal/20 bg-brand-teal/5 text-brand-teal'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${
              c01Progress === 100 
                ? 'bg-brand-green/10 border-brand-green/15 text-brand-green' 
                : 'bg-brand-teal/10 border-brand-teal/15 text-brand-teal'
            }`}>
              {c01Progress === 100 ? <CheckCircle size={14} /> : <Sparkles size={12} className="animate-pulse" />}
            </div>
            <h4 className="font-bold text-[10px] tracking-tight">1. ETF & CC Quỹ</h4>
          </div>

          {/* Step 2: Lãi kép */}
          <div 
            onClick={() => handleRoadmapClick('C02')}
            className={`p-3.5 rounded-lg border text-center flex flex-col items-center justify-between space-y-2 cursor-pointer transition-all hover:border-brand-teal ${
              c02Progress === 100 
                ? 'border-brand-green/20 bg-brand-green/5 text-brand-green' 
                : c01Progress === 100
                  ? 'border-brand-teal/20 bg-brand-teal/5 text-brand-teal'
                  : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 text-slate-400 dark:text-slate-500 opacity-60'
            }`}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center">
              {c02Progress === 100 ? (
                <CheckCircle size={14} className="text-brand-green" />
              ) : c01Progress === 100 ? (
                <Sparkles size={12} className="text-brand-teal animate-pulse" />
              ) : (
                <Lock size={12} />
              )}
            </div>
            <h4 className="font-bold text-[10px] tracking-tight">2. Sức mạnh Lãi kép</h4>
          </div>

          {/* Step 3: Đa dạng hóa danh mục */}
          <div 
            onClick={() => handleRoadmapClick('C03')}
            className={`p-3.5 rounded-lg border text-center flex flex-col items-center justify-between space-y-2 cursor-pointer transition-all hover:border-brand-teal ${
              c03Progress === 100 
                ? 'border-brand-green/20 bg-brand-green/5 text-brand-green' 
                : c02Progress === 100
                  ? 'border-brand-teal/20 bg-brand-teal/5 text-brand-teal'
                  : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 text-slate-400 dark:text-slate-500 opacity-60'
            }`}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center">
              {c03Progress === 100 ? (
                <CheckCircle size={14} className="text-brand-green" />
              ) : c02Progress === 100 ? (
                <Sparkles size={12} className="text-brand-teal animate-pulse" />
              ) : (
                <Lock size={12} />
              )}
            </div>
            <h4 className="font-bold text-[10px] tracking-tight">3. Đa dạng hóa</h4>
          </div>

          {/* Step 4: Tâm lý đầu tư */}
          <div 
            onClick={() => handleRoadmapClick('C04')}
            className={`p-3.5 rounded-lg border text-center flex flex-col items-center justify-between space-y-2 cursor-pointer transition-all hover:border-brand-teal ${
              c04Progress === 100 
                ? 'border-brand-green/20 bg-brand-green/5 text-brand-green' 
                : c03Progress === 100
                  ? 'border-brand-teal/20 bg-brand-teal/5 text-brand-teal'
                  : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 text-slate-400 dark:text-slate-500 opacity-60'
            }`}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center">
              {c04Progress === 100 ? (
                <CheckCircle size={14} className="text-brand-green" />
              ) : c03Progress === 100 ? (
                <Sparkles size={12} className="text-brand-teal animate-pulse" />
              ) : (
                <Lock size={12} />
              )}
            </div>
            <h4 className="font-bold text-[10px] tracking-tight">4. Tâm lý đầu tư</h4>
          </div>

          {/* Step 5: Lạm phát */}
          <div 
            onClick={() => handleRoadmapClick('C05')}
            className={`p-3.5 rounded-lg border text-center flex flex-col items-center justify-between space-y-2 cursor-pointer transition-all hover:border-brand-teal ${
              c05Progress === 100 
                ? 'border-brand-green/20 bg-brand-green/5 text-brand-green' 
                : c04Progress === 100
                  ? 'border-brand-teal/20 bg-brand-teal/5 text-brand-teal'
                  : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 text-slate-400 dark:text-slate-500 opacity-60'
            }`}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center">
              {c05Progress === 100 ? (
                <CheckCircle size={14} className="text-brand-green" />
              ) : c04Progress === 100 ? (
                <Sparkles size={12} className="text-brand-teal animate-pulse" />
              ) : (
                <Lock size={12} />
              )}
            </div>
            <h4 className="font-bold text-[10px] tracking-tight">5. Tác động Lạm phát</h4>
          </div>

          {/* Step 6: Simulation */}
          <div 
            onClick={() => c05Progress === 100 ? navigate('/simulation') : alert("Bạn cần hoàn thành toàn bộ 5 bài học (đạt 100% tiến độ) để mở khóa Giả lập tích lũy thực chiến!")}
            className={`p-3.5 rounded-lg border text-center flex flex-col items-center justify-between space-y-2 ${
              c05Progress === 100
                ? 'border-brand-teal/20 bg-brand-teal/5 text-brand-teal cursor-pointer hover:border-brand-teal transition-all'
                : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 text-slate-400 dark:text-slate-500 opacity-60'
            }`}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center">
              {c05Progress === 100 ? (
                <Sparkles size={12} className="text-brand-teal animate-pulse" />
              ) : (
                <Lock size={12} />
              )}
            </div>
            <h4 className="font-bold text-[10px] tracking-tight">6. Giả lập tích lũy</h4>
          </div>
        </div>
      </div>

      {/* 4. MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (AI recommendation + Compound growth Simulator) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Mentor Recommendation */}
          <div className="glass-panel p-5 rounded-xl relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-lg bg-brand-teal/5 text-brand-teal shrink-0 border border-brand-teal/10">
                <Sparkles size={18} className="fill-brand-teal/10" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xs flex items-center gap-2 flex-wrap text-slate-900 dark:text-slate-200">
                  <span>{aiRec.title}</span>
                  <span className="px-2 py-0.5 rounded bg-brand-teal/5 border border-brand-teal/10 text-[8px] font-bold text-brand-teal uppercase tracking-wider">
                    Hồ sơ: {riskProfile || 'Safe Saver'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light mt-1.5">
                  {aiRec.message}
                </p>
                <button 
                  onClick={() => navigate('/mentor')}
                  className="pt-2 text-[10.5px] font-bold text-brand-teal hover:underline inline-flex items-center space-x-0.5 cursor-pointer font-sans"
                >
                  <span>Trò chuyện trực tiếp với AI Mentor</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Recommended Asset Allocation Card */}
          <div className="glass-panel p-5 rounded-xl space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">Mô Hình Phân Bổ Tài Sản Khuyến Nghị</h3>
                <span className="text-[10px] text-slate-400 block mt-0.5">Cá nhân hóa theo khẩu vị rủi ro: <strong className="text-brand-teal">{riskProfile === 'Conservative' || riskProfile === 'Safe Saver' ? '🛡️ An Toàn' : riskProfile === 'Aggressive' || riskProfile === 'High Growth Seeker' ? '🔥 Tăng Trưởng' : '⚖️ Cân Bằng'}</strong></span>
              </div>
              <span className="px-2 py-0.5 rounded bg-brand-teal/5 border border-brand-teal/10 text-[9px] font-bold text-brand-teal uppercase tracking-wider">
                Phân bổ tối ưu hóa
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Donut Chart */}
              <div className="h-44 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`]}
                      contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in donut chart */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Mô hình</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">Danh Mục</span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-3 text-left">
                {allocationData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-105/10 pb-1.5 last:border-b-0 last:pb-0">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 dark:text-slate-400 font-light leading-normal">{item.name}</span>
                    </div>
                    <span className="font-bold font-mono text-slate-950 dark:text-white">{item.value}%</span>
                  </div>
                ))}
                
                <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-400">Bạn muốn thử nghiệm cơ cấu tài sản?</span>
                  <button 
                    onClick={() => navigate('/simulation')}
                    className="text-brand-teal font-extrabold hover:underline cursor-pointer"
                  >
                    Vào Giả Lập Tích Lũy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Simple compound growth chart (savings vs diversified savings) */}
          <div className="glass-panel p-5 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">Hiệu Ứng Lãi Kép & Đầu Tư Định Kỳ</h3>
                <span className="text-[10px] text-slate-400 block mt-0.5">Giả lập gửi góp 2,000,000₫/tháng trong vòng 6 tháng.</span>
              </div>
              <span className="self-start sm:self-auto px-2 py-0.5 rounded bg-brand-green/5 border border-brand-green/10 text-brand-green text-[9px] font-bold flex items-center space-x-1">
                <TrendingUp size={12} />
                <span>Rổ đầu tư tăng trưởng thêm +10% lợi suất</span>
              </span>
            </div>

            <div className="h-56 w-full pt-1.5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDiv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F62FE" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0F62FE" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.05}/>
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#1E293B' : '#F1F5F9'} />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} tickFormatter={(v) => `${v/1000000}M`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#0E1726' : '#FFFFFF', 
                      borderRadius: '8px', 
                      border: darkMode ? '1px solid #1E293B' : '1px solid #E2E8F0', 
                      color: darkMode ? '#FFFFFF' : '#0F172A', 
                      fontSize: '11px' 
                    }}
                    formatter={(val) => [`${parseFloat(val).toLocaleString()} ₫`]}
                  />
                  <Area type="monotone" dataKey="Diversified" name="Danh mục đa dạng hóa (ETF)" stroke="#0F62FE" strokeWidth={2} fillOpacity={1} fill="url(#colorDiv)" />
                  <Area type="monotone" dataKey="Cash" name="Tiết kiệm tiền mặt thường" stroke="#94A3B8" strokeWidth={1.2} fillOpacity={1} fill="url(#colorCash)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-center text-[10.5px] pt-3 border-t border-slate-100 dark:border-slate-850">
              <span className="text-slate-400">Xem giải nghĩa đầy đủ tại chuyên đề Lãi kép.</span>
              <button 
                onClick={() => navigate('/learning')}
                className="text-brand-teal font-bold hover:underline cursor-pointer"
              >
                Học tích lũy an toàn
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: FCS speedometer & Gamified checklist */}
        <div className="space-y-6">
          
          {/* Animated FCS Speedometer */}
          <div className="glass-panel p-5 rounded-xl text-center flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-[10px] uppercase text-slate-500 tracking-widest mb-3">Điểm Tự Tin Tài Chính (FCS)</h3>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <defs>
                  <linearGradient id="fcsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0F62FE" />
                    <stop offset="100%" stopColor="#3F83F8" />
                  </linearGradient>
                </defs>
                <circle cx="48" cy="48" r="40" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="6" fill="transparent" />
                <circle cx="48" cy="48" r="40" stroke="url(#fcsGradient)" strokeWidth="6" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 40} 
                  strokeDashoffset={2 * Math.PI * 40 * (1 - confidenceScore / 100)} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">{confidenceScore}%</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Sẵn sàng</span>
              </div>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-normal mt-3 max-w-xs font-light">
              Mức độ sẵn sàng tâm lý của bạn trước khi bước vào đầu tư thật. Hoàn tất các bài trắc nghiệm để cải thiện điểm số.
            </p>
          </div>

          {/* Daily Challenge Widget: Câu Hỏi Hằng Ngày */}
          <div className="glass-panel p-5 rounded-xl space-y-4 text-left relative overflow-hidden bg-white dark:bg-slate-900 shadow-2xs border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-850">
              <h3 className="font-bold text-xs flex items-center space-x-1.5 text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                <QuestionIcon size={14} className="text-brand-teal" />
                <span>Thử thách Trắc nghiệm Hôm Nay</span>
              </h3>
              <span className="px-2 py-0.5 rounded bg-brand-teal/5 text-[8.5px] font-bold text-brand-teal uppercase tracking-widest border border-brand-teal/10">
                +20 XP
              </span>
            </div>

            {dailyQCompleted ? (
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-brand-green/5 border border-brand-green/15 rounded-lg flex items-start space-x-2 text-xs">
                  <CheckCircle size={15} className="text-brand-green shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-brand-green">Bạn đã hoàn thành thử thách hôm nay!</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                      Lựa chọn của bạn là chính xác hoặc đã được giải đáp bên dưới. Hãy quay lại vào ngày mai để tiếp tục trả lời các thử thách mới.
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-850 rounded-lg text-[11px] leading-relaxed text-slate-600 dark:text-slate-450">
                  <strong>💡 Giải thích:</strong> {DASHBOARD_DAILY_QUESTIONS[new Date().getDay()].explanation}
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1 text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/40">
                  {DASHBOARD_DAILY_QUESTIONS[new Date().getDay()].question}
                </p>

                <div className="flex flex-col gap-2">
                  {DASHBOARD_DAILY_QUESTIONS[new Date().getDay()].options.map((opt, idx) => {
                    const isSelected = selectedDailyOption === idx;
                    let optStyle = "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/20 bg-white dark:bg-slate-950/40 text-slate-700 dark:text-slate-350";
                    if (isSelected) {
                      optStyle = "border-brand-teal bg-brand-teal/5 text-brand-teal";
                    }
                    if (showDailyResult) {
                      if (idx === DASHBOARD_DAILY_QUESTIONS[new Date().getDay()].answerIndex) {
                        optStyle = "border-brand-green bg-brand-green/5 text-brand-green font-bold";
                      } else if (isSelected) {
                        optStyle = "border-red-500 bg-red-500/5 text-red-500 font-bold";
                      } else {
                        optStyle = "opacity-45 border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/20 text-slate-400";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={showDailyResult}
                        onClick={() => setSelectedDailyOption(idx)}
                        className={`w-full p-2.5 rounded-lg border text-left flex items-start space-x-2.5 transition-all cursor-pointer ${optStyle}`}
                      >
                        <span className="w-4.5 h-4.5 shrink-0 rounded border border-slate-250 dark:border-slate-700 flex items-center justify-center font-bold text-[9px] uppercase">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-light mt-0.5 leading-normal">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {!showDailyResult ? (
                  <button
                    onClick={() => {
                      setShowDailyResult(true);
                      const today = new Date().toISOString().split('T')[0];
                      localStorage.setItem(`saveplus_daily_q_done_${today}`, 'true');
                      setDailyQCompleted(true);
                      
                      // Grant XP
                      addXP(20);

                      // Also mark checklist item 1 as done
                      setChecklist(prev => prev.map(item => item.id === 1 ? { ...item, done: true } : item));

                      confetti({
                        particleCount: 50,
                        spread: 40,
                        colors: ['#0F62FE', '#00A389']
                      });
                    }}
                    disabled={selectedDailyOption === null}
                    className="w-full py-2 bg-brand-teal text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Nộp câu trả lời
                  </button>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-850 rounded-lg text-[11px] leading-relaxed text-slate-650 dark:text-slate-400 mt-2">
                    <strong>💡 Giải thích:</strong> {DASHBOARD_DAILY_QUESTIONS[new Date().getDay()].explanation}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Daily Challenge Widget & Checklist */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div>
              <h3 className="font-bold text-xs flex items-center space-x-1.5 border-b pb-2 border-slate-100 dark:border-slate-850 text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                <CheckSquare size={14} className="text-brand-teal" />
                <span>Nhiệm Vụ Tân Binh Hôm Nay</span>
              </h3>
              
              {/* Daily Motivation quote */}
              <div className="bg-brand-teal/5 border border-brand-teal/10 p-2.5 rounded-lg text-[10.5px] leading-normal text-brand-teal mt-2">
                📢 <strong>Động lực:</strong> Hoàn thành nhiệm vụ giúp bạn gia tăng điểm kinh nghiệm nhanh chóng!
              </div>
            </div>

            <div className="space-y-2.5">
              {checklist.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleChecklist(item.id)}
                  className="flex items-start space-x-2.5 cursor-pointer select-none text-[11.5px] hover:opacity-85"
                >
                  <input 
                    type="checkbox" 
                    checked={item.done}
                    onChange={() => {}} // toggled on container click
                    className="mt-0.5 accent-brand-teal cursor-pointer shrink-0"
                  />
                  <div className="flex-1 leading-normal">
                    <span className={`${item.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-350 font-medium'}`}>
                      {item.text}
                    </span>
                    {!item.done && (
                      <span className="inline-block text-[8px] bg-brand-teal/5 border border-brand-teal/10 text-brand-teal px-1 rounded ml-1 font-bold font-mono">
                        +{item.xp} XP
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 5. BOTTOM ROW: QUICK LINK & RECOMMENDED LESSON CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Next recommended Lesson Card */}
        {nextCourse && (
          <div className="glass-panel p-5 rounded-xl flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center space-x-4 pr-3">
              <img 
                src={nextCourse.thumbnail || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=150&q=80'} 
                alt={nextCourse.title} 
                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-200/40 dark:border-white/10"
              />
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-brand-teal uppercase tracking-wider block">Bài học đề xuất tiếp theo</span>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">{nextCourse.title}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{nextCourse.duration || '5 phút'} • Cấp độ: {nextCourse.level || 'Beginner'}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/learning')}
              className="p-2.5 bg-brand-teal text-white rounded-lg shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}

        {/* Investment simulation preview card */}
        <div 
          onClick={() => navigate('/simulation')}
          className="glass-panel p-5 rounded-xl flex items-center justify-between cursor-pointer group hover-scale bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-lg bg-brand-teal/5 text-brand-teal border border-brand-teal/10 flex items-center justify-center shrink-0">
              <TrendingUp size={22} className="group-hover:scale-105 transition-transform" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-brand-teal uppercase tracking-wider block">Giả Lập Thực Chiến</span>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-brand-teal transition-colors">Vào Giả Lập Tích Lũy & Compound</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light leading-normal">Mô phỏng thói quen đầu tư dài hạn với rổ tài sản thực tế ảo.</p>
            </div>
          </div>
          <button className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-lg shadow-xs transition-all shrink-0">
            <ChevronRight size={15} />
          </button>
        </div>

      </div>

      {/* Login VIP AI Mentor Reminder Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-xl p-6 text-center space-y-5 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-teal" />
            
            <div className="w-12 h-12 bg-brand-teal/5 text-brand-teal rounded-lg flex items-center justify-center mx-auto border border-brand-teal/10 shadow-xs">
              <CheckSquare size={20} className="fill-brand-teal/5 text-brand-teal" />
            </div>

            <div className="space-y-1 text-left sm:text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white text-center uppercase tracking-wider">
                🏆 Thử Thách Quiz {dailyQuizLimit} Câu Hôm Nay
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed font-light text-center">
                Chào mừng bạn quay trở lại! Hãy cùng rèn luyện tư duy tài chính, quản lý vốn thép với bộ {dailyQuizLimit} câu hỏi thử thách và nhận ngay các đặc quyền Premium:
              </p>
            </div>

            {/* List of Premium features */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 rounded-xl text-left space-y-3">
              <div className="flex items-center space-x-2.5">
                <BookOpen size={15} className="text-brand-teal shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-350 font-medium">Toàn bộ 15+ khóa học chuyên sâu</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <ShieldCheck size={15} className="text-brand-teal shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-350 font-medium">Không quảng cáo giới hạn</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <TrendingUp size={15} className="text-brand-teal shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-350 font-medium">Học trực quan cùng sơ đồ Recharts</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Sparkles size={15} className="text-brand-teal shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-350 font-medium">{dailyQuizLimit} câu hỏi thử thách tài chính mỗi ngày</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Award size={15} className="text-brand-teal shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-350 font-medium">Huy chương thành tựu nâng cao</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2 pt-1">
              <button
                onClick={() => {
                  sessionStorage.setItem('saveplus_login_popup_shown', 'true');
                  setShowLoginModal(false);
                  navigate('/learning', { state: { startDailyQuiz: true } });
                }}
                className="w-full py-2.5 bg-brand-teal text-white font-bold text-xs rounded-lg shadow-sm hover:bg-brand-teal/95 transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>🚀 Bắt đầu làm Quiz {dailyQuizLimit} Câu Ngay</span>
              </button>
              
              <button
                onClick={() => {
                  sessionStorage.setItem('saveplus_login_popup_shown', 'true');
                  setShowLoginModal(false);
                  navigate('/learning');
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-250 text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                📖 Học giáo trình trực tuyến
              </button>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    const postponeTime = Date.now() + 5 * 60 * 1000; // 5 minutes
                    localStorage.setItem('saveplus_postpone_until', postponeTime.toString());
                    sessionStorage.setItem('saveplus_login_popup_shown', 'true');
                    setShowLoginModal(false);
                  }}
                  className="py-2 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
                >
                  ⏳ Hoãn lại 5 phút
                </button>
                <button
                  onClick={() => {
                    const postponeTime = Date.now() + 10 * 1000; // 10 seconds for quick testing
                    localStorage.setItem('saveplus_postpone_until', postponeTime.toString());
                    sessionStorage.setItem('saveplus_login_popup_shown', 'true');
                    setShowLoginModal(false);
                  }}
                  className="py-2 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold rounded-lg transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
                  title="Nhấp để hoãn nhanh 10 giây nhằm kiểm thử tính năng này"
                >
                  ⚡ Hoãn 10s (Test)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
