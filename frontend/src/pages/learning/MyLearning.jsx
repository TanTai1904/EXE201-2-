import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Play, 
  BookOpen, 
  ExternalLink, 
  Award, 
  ChevronRight, 
  Video, 
  BookOpenCheck, 
  HelpCircle, 
  RotateCcw, 
  Sparkles, 
  ArrowLeft,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  AlertOctagon,
  Brain,
  Flame,
  Globe,
  MessageSquare,
  ShieldAlert,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DAILY_QUIZ_QUESTIONS = [
  {
    question: 'Quy mô quỹ khẩn cấp nên bằng bao nhiêu tháng chi tiêu thiết yếu?',
    options: [
      'A. 1-2 tháng',
      'B. 3-6 tháng',
      'C. 12-24 tháng',
      'D. Không cần thiết lập'
    ],
    answerIndex: 1,
    explanation: 'Chuyên gia khuyên nên duy trì quỹ khẩn cấp tương đương 3-6 tháng chi tiêu thiết yếu để trang trải các tình huống ngoài dự kiến như mất việc, bệnh tật.'
  },
  {
    question: 'Quy tắc 50/30/20 phân bổ thu nhập hàng tháng như thế nào?',
    options: [
      'A. 50% Đầu tư - 30% Tiết kiệm - 20% Chi tiêu',
      'B. 50% Nhu cầu thiết yếu - 30% Mong muốn cá nhân - 20% Tiết kiệm & Tích lũy',
      'C. 50% Kinh doanh - 30% Gia đình - 20% Từ thiện',
      'D. Chia đều theo sở thích'
    ],
    answerIndex: 1,
    explanation: 'Quy tắc 50/30/20 phân chia: 50% cho nhu cầu thiết yếu (nhà ở, ăn uống), 30% cho mong muốn cá nhân (giải trí, mua sắm) và 20% cho các mục tiêu tài chính (tiết kiệm, trả nợ, đầu tư).'
  },
  {
    question: '"Lãi kép" được Albert Einstein ví như điều gì?',
    options: [
      'A. Kỳ quan thứ năm của thế giới',
      'B. Kỳ quan thứ sáu của thế giới',
      'C. Kỳ quan thứ bảy của thế giới',
      'D. Kỳ quan thứ tám của thế giới'
    ],
    answerIndex: 3,
    explanation: 'Albert Einstein từng nói: "Lãi kép là kỳ quan thứ tám của thế giới. Ai hiểu được nó sẽ kiếm được tiền, ai không hiểu sẽ phải trả chi phí cho nó."'
  },
  {
    question: 'Trong tài chính, "đa dạng hóa danh mục đầu tư" nhằm mục đích chính là gì?',
    options: [
      'A. Triệt tiêu hoàn toàn mọi loại rủi ro trên thị trường',
      'B. Tăng số lượng giao dịch để nhận quà tặng của sàn',
      'C. Giảm thiểu rủi ro phi hệ thống của các tài sản đơn lẻ',
      'D. Đảm bảo luôn đạt lợi nhuận cao nhất sàn giao dịch'
    ],
    answerIndex: 2,
    explanation: 'Đa dạng hóa giúp phân tán rủi ro. Nếu một tài sản trong danh mục mất giá, các tài sản khác có thể bù đắp lại, giảm mức thiệt hại tổng thể.'
  },
  {
    question: 'Chỉ số P/E trong đầu tư chứng khoán thể hiện điều gì?',
    options: [
      'A. Tỷ lệ nợ trên vốn chủ sở hữu',
      'B. Mức giá nhà đầu tư sẵn sàng chi trả cho một đồng lợi nhuận của doanh nghiệp',
      'C. Tốc độ tăng trưởng doanh thu hàng năm',
      'D. Giá trị sổ sách của công ty'
    ],
    answerIndex: 1,
    explanation: 'P/E (Price-to-Earnings ratio) đo lường mối quan hệ giữa thị giá cổ phiếu và lợi nhuận trên mỗi cổ phiếu. Nó cho thấy mức độ kỳ vọng của nhà đầu tư vào sự tăng trưởng của doanh nghiệp.'
  },
  {
    question: 'ETF (Exchange-Traded Fund) khác biệt lớn nhất so với Quỹ mở truyền thống ở điểm nào?',
    options: [
      'A. Được giao dịch trực tiếp trên sàn chứng khoán giống như một cổ phiếu',
      'B. Chỉ đầu tư vào bất động sản đất nền',
      'C. Không thu bất kỳ khoản phí quản lý nào',
      'D. Chỉ dành cho nhà đầu tư tổ chức lớn'
    ],
    answerIndex: 0,
    explanation: 'ETF là quỹ hoán đổi danh mục, được niêm yết và giao dịch trực tiếp trên sàn chứng khoán trong phiên giao dịch, giúp mua bán dễ dàng với tính thanh khoản cao.'
  },
  {
    question: 'Quy tắc 72 được sử dụng để ước tính nhanh điều gì trong đầu tư?',
    options: [
      'A. Tỷ lệ lạm phát bình quân',
      'B. Số năm cần thiết để số tiền đầu tư nhân đôi với một mức lãi suất cố định',
      'C. Số tiền thuế thu nhập phải nộp',
      'D. Tỷ lệ thành công của một phi vụ đầu cơ'
    ],
    answerIndex: 1,
    explanation: 'Lấy 72 chia cho phần trăm lợi suất hàng năm để biết số năm gần đúng để khoản vốn của bạn nhân đôi. Ví dụ: lãi suất 10%/năm thì mất khoảng 7.2 năm.'
  },
  {
    question: 'Trái phiếu Chính phủ thường được xếp vào nhóm tài sản có đặc điểm gì?',
    options: [
      'A. Rủi ro rất cao nhưng lợi nhuận khổng lồ',
      'B. Rủi ro thấp và lợi nhuận ổn định',
      'C. Thanh khoản bằng không',
      'D. Dễ bị ảnh hưởng lừa đảo công nghệ nhất'
    ],
    answerIndex: 1,
    explanation: 'Trái phiếu chính phủ được bảo chứng bởi uy tín của chính phủ quốc gia nên rủi ro vỡ nợ cực kỳ thấp, mang lại dòng tiền lãi suất cố định an toàn.'
  },
  {
    question: 'Lạm phát tăng cao sẽ ảnh hưởng như thế nào đến giá trị thực tế của tiền mặt để yên?',
    options: [
      'A. Làm sức mua của tiền mặt giảm dần theo thời gian',
      'B. Giúp tiền mặt tăng giá trị nhanh chóng',
      'C. Không có bất kỳ ảnh hưởng nào',
      'D. Làm tăng số lượng tiền mặt trong ví của bạn tự động'
    ],
    answerIndex: 0,
    explanation: 'Lạm phát làm tăng mức giá cả chung của hàng hóa và dịch vụ, do đó cùng một lượng tiền mặt sẽ mua được ít hàng hóa hơn trước (sức mua thực tế bị giảm sút).'
  },
  {
    question: 'DCA (Dollar-Cost Averaging) là chiến lược đầu tư như thế nào?',
    options: [
      'A. Mua toàn bộ tài sản tại một thời điểm giá thấp nhất có thể',
      'B. Mua định kỳ một số tiền cố định bất kể giá tài sản tăng hay giảm',
      'C. Giao dịch liên tục trong ngày để ăn chênh lệch cực ngắn',
      'D. Chỉ mua khi có tin đồn trên mạng xã hội'
    ],
    answerIndex: 1,
    explanation: 'DCA (Đầu tư trung bình giá) giúp giảm thiểu áp lực chọn thời điểm thị trường. Bằng cách mua đều đặn, bạn mua được nhiều tài sản hơn khi giá rẻ và ít hơn khi giá đắt.'
  },
  {
    question: 'Khi một dự án tài chính cam kết "bao lỗ hoàn toàn" và hứa hẹn lợi nhuận cố định >20%/năm, bạn nên làm gì?',
    options: [
      'A. Đầu tư toàn bộ tài sản ngay vì dự án quá an toàn',
      'B. Rủ thêm người thân cùng vay tiền để tham gia',
      'C. Tránh xa ngay vì đây là dấu hiệu điển hình của mô hình lừa đảo Ponzi',
      'D. Đầu tư thử một khoản nhỏ và rút ra nhanh'
    ],
    answerIndex: 2,
    explanation: 'Không có kênh đầu tư hợp pháp nào đảm bảo lợi nhuận siêu cao đi kèm cam kết không rủi ro. Các mô hình này thường dùng tiền người sau trả cho người trước và sẽ sụp đổ.'
  },
  {
    question: 'Cổ tức (Dividend) là gì?',
    options: [
      'A. Khoản tiền phạt doanh nghiệp phải nộp cho nhà nước',
      'B. Một phần lợi nhuận sau thuế được doanh nghiệp chia lại cho các cổ đông',
      'C. Chi phí mua sắm trang thiết bị của công ty',
      'D. Số tiền vay ngân hàng của doanh nghiệp'
    ],
    answerIndex: 1,
    explanation: 'Cổ tức là phần lợi nhuận ròng được trích ra để chi trả cho các cổ đông sở hữu cổ phiếu như một cách chia sẻ thành quả kinh doanh của doanh nghiệp.'
  },
  {
    question: 'Khái niệm "Tài sản thanh khoản" chỉ điều gì?',
    options: [
      'A. Tài sản khó bán và có giá trị biến động mạnh',
      'B. Tài sản dễ dàng chuyển đổi thành tiền mặt nhanh chóng mà không bị hao hụt nhiều về giá trị',
      'C. Chỉ bao gồm bất động sản đất nền',
      'D. Tài sản của doanh nghiệp đang bị phá sản thanh lý'
    ],
    answerIndex: 1,
    explanation: 'Tiền mặt, tiền gửi ngân hàng không kỳ hạn hoặc cổ phiếu của các công ty lớn là tài sản có tính thanh khoản cao vì bạn có thể bán chúng lấy tiền mặt gần như ngay lập tức.'
  },
  {
    question: '"Thị trường Gấu" (Bear Market) là thuật ngữ mô tả trạng thái thị trường như thế nào?',
    options: [
      'A. Thị trường đang trong xu hướng giảm giá mạnh và kéo dài',
      'B. Thị trường đi ngang không có biến động',
      'C. Thị trường tăng trưởng mạnh mẽ lập đỉnh mới',
      'D. Thị trường chỉ cho phép giao dịch một số loại hàng hóa đặc biệt'
    ],
    answerIndex: 0,
    explanation: 'Thị trường Gấu mô tả thị trường tài chính đang trong xu hướng suy giảm kéo dài (thường giảm từ 20% trở lên từ đỉnh gần nhất) đi kèm tâm lý bi quan của các nhà đầu tư.'
  },
  {
    question: 'Mua bảo hiểm nhân thọ đóng vai trò gì trong kế hoạch tài chính cá nhân?',
    options: [
      'A. Là kênh đầu tư sinh lời nhanh nhất để làm giàu',
      'B. Là công cụ chuyển giao rủi ro tài chính khi gặp biến cố lớn về sức khỏe hoặc sinh mạng',
      'C. Giúp tăng điểm tín dụng ngân hàng lập tức',
      'D. Tránh được mọi khoản thuế cá nhân suốt đời'
    ],
    answerIndex: 1,
    explanation: 'Bảo hiểm đóng vai trò bảo vệ tài chính cho gia đình bạn trước những biến cố sức khỏe nặng nề, tránh việc phải bán sạch tài sản tích lũy để chi trả viện phí.'
  },
  {
    question: 'Khác biệt lớn nhất giữa "Lãi đơn" và "Lãi kép" là gì?',
    options: [
      'A. Lãi kép chỉ tính trên tiền lãi phát sinh',
      'B. Lãi đơn chỉ áp dụng cho người gửi tiền ngắn hạn dưới 1 tháng',
      'C. Lãi kép tính lãi trên cả vốn gốc lẫn lãi tích lũy của các chu kỳ trước, còn lãi đơn chỉ tính lãi trên vốn gốc ban đầu',
      'D. Lãi đơn có lợi nhuận thực tế cao hơn lãi kép'
    ],
    answerIndex: 2,
    explanation: 'Lãi kép (lãi chồng lãi) cộng dồn lãi vào gốc để tính lãi cho kỳ tiếp theo, giúp số dư tăng trưởng theo hàm số mũ vượt bậc so với lãi đơn.'
  },
  {
    question: 'Khi dùng thẻ tín dụng (Credit Card), hành vi nào giúp bạn tránh bị tính lãi suất cao?',
    options: [
      'A. Luôn thanh toán toàn bộ dư nợ đúng hạn trước ngày đến hạn thanh toán',
      'B. Chỉ trả số tiền thanh toán tối thiểu mỗi tháng',
      'C. Rút tiền mặt từ thẻ tín dụng để tiêu dùng hàng ngày',
      'D. Quẹt thẻ vượt quá hạn mức cho phép'
    ],
    answerIndex: 0,
    explanation: 'Thẻ tín dụng được miễn lãi trong một khoảng thời gian cố định. Nếu bạn thanh toán đầy đủ 100% dư nợ trước ngày hạn, bạn sẽ không mất một đồng lãi suất nào.'
  },
  {
    question: 'Tại sao việc lập ngân sách chi tiêu hàng tháng lại là bước quan trọng đầu tiên?',
    options: [
      'A. Để có lý do cắt giảm toàn bộ chi phí vui chơi giải trí',
      'B. Giúp kiểm soát dòng tiền, tối ưu hóa các khoản chi tiêu và xác định rõ số tiền có thể trích ra để đầu tư tích lũy',
      'C. Vì quy định bắt buộc đối với người dùng tài chính thông minh',
      'D. Giúp tăng thu nhập thụ động ngay lập tức'
    ],
    answerIndex: 1,
    explanation: 'Lập ngân sách giúp bạn hiểu rõ tiền của mình đi đâu, hạn chế việc chi tiêu cảm tính và đảm bảo luôn trích lập được tiền tiết kiệm/đầu tư trước khi chi tiêu.'
  },
  {
    question: 'Rổ ETF VN30 đại diện cho nhóm doanh nghiệp nào tại Việt Nam?',
    options: [
      'A. 30 doanh nghiệp vừa và nhỏ có tiềm năng lớn nhất',
      'B. 30 cổ phiếu của các công ty công nghệ lớn nhất sàn HOSE',
      'C. 30 cổ phiếu có vốn hóa và thanh khoản hàng đầu niêm yết trên sàn HOSE',
      'D. 30 doanh nghiệp có nợ vay thấp nhất sàn chứng khoán'
    ],
    answerIndex: 2,
    explanation: 'VN30 là chỉ số đại diện cho 30 cổ phiếu có vốn hóa lớn nhất và tính thanh khoản hàng đầu trên sàn giao dịch chứng khoán TP.HCM (HOSE), đại diện cho các doanh nghiệp đầu tàu kinh tế Việt Nam.'
  },
  {
    question: 'Tại sao "Cố gắng bắt đáy, bán đỉnh" (Market Timing) thường khiến nhà đầu tư cá nhân thua lỗ?',
    options: [
      'A. Do phí giao dịch bắt đáy quá cao',
      'B. Do biến động thị trường ngắn hạn cực kỳ khó đoán và bị chi phối mạnh bởi tâm lý đám đông, khiến nhà đầu tư dễ đưa ra quyết định sai lầm mua đỉnh bán đáy',
      'C. Vì sở giao dịch chứng khoán cấm giao dịch tại đỉnh hoặc đáy',
      'D. Do thị trường không có đỉnh hay đáy thực tế'
    ],
    answerIndex: 1,
    explanation: 'Dự đoán đỉnh và đáy ngắn hạn là cực kỳ khó khăn. Tâm lý FOMO và hoảng loạn khiến nhà đầu tư mua lúc tăng nóng và bán lúc sụt giảm. DCA là giải pháp thay thế kỷ luật hơn.'
  }
];

export default function MyLearning() {
  const { courses, recordLessonRead, userProgress, setCourses, setUserProgress, resetAllProgress, resetCourseProgress, completeCourseQuiz } = useCourses();
  const { addXP, triggerStreak, streak, xp, user, riskProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const sub = user?.subscription || 'Free';
  const dailyQuizLimit = (sub === 'Premium' || sub === 'Mentor+') ? 20 : 5;
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('courses'); // courses, external_links
  
  // Daily 20 Quiz States
  const [dailyCompletedToday, setDailyCompletedToday] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return localStorage.getItem('saveplus_daily_quiz_completed_date') === today;
  });
  const [dailyQuizStarted, setDailyQuizStarted] = useState(false);
  const [dailyCurrentIndex, setDailyCurrentIndex] = useState(0);
  const [dailySelectedOption, setDailySelectedOption] = useState(null);
  const [isDailySubmitted, setIsDailySubmitted] = useState(false);
  const [dailyScore, setDailyScore] = useState(0);
  const [dailyFinished, setDailyFinished] = useState(false);
  const [isDailyAiLoading, setIsDailyAiLoading] = useState(false);
  
  // Quiz states
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // AI tutor chat state
  const [aiExplanation, setAiExplanation] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Gamified Level calculation
  const xpPerLevel = 250;
  const currentLvl = Math.floor((xp || 0) / xpPerLevel) + 1;

  // Curated financial education course links opening in new tab
  const trustedEducationLinks = [
    { title: 'Học viện TCBS Learn', source: 'Techcom Securities', level: 'Beginner', duration: 'Tự học miễn phí', url: 'https://www.tcbs.com.vn/' },
    { title: 'SSI Học Đầu Tư', source: 'SSI Securities', level: 'Beginner to Intermediate', duration: 'Khóa ngắn hạn', url: 'https://www.ssi.com.vn/' },
    { title: 'Finhay Academy', source: 'Finhay Blog', level: 'Beginner', duration: '5 phút đọc/bài', url: 'https://www.finhay.com.vn/' },
    { title: 'Khan Academy Finance', source: 'Khan Academy', level: 'Beginner', duration: '12 giờ lý thuyết', url: 'https://www.khanacademy.org/college-careers-more/personal-finance' },
    { title: 'Investopedia Finance', source: 'Investopedia Dictionary', level: 'Mọi trình độ', duration: 'Tra cứu nhanh', url: 'https://www.investopedia.com/' },
    { title: 'Coursera Financial Markets', source: 'Yale University', level: 'Intermediate', duration: '20 giờ học', url: 'https://www.coursera.org/learn/financial-markets-global' },
    { title: 'Harvard Financial Literacy', source: 'Harvard University', level: 'Beginner', duration: 'Học liệu công ích', url: 'https://pll.harvard.edu/subject/financial-literacy' }
  ];

  useEffect(() => {
    if (location.state && location.state.startCourseId) {
      const course = courses.find(c => c.id === location.state.startCourseId);
      if (course) {
        startCourse(course);
      }
    }
  }, [location.state, courses]);

  useEffect(() => {
    if (location.state && location.state.startDailyQuiz) {
      setActiveTab('daily_quiz');
      setSelectedCourse(null);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const startCourse = (course) => {
    setSelectedCourse(course);
    setActiveLessonIndex(0);
    setQuizStarted(false);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    const isCompleted = userProgress[course.id]?.quizCompleted || false;
    setQuizFinished(isCompleted);
    setAiExplanation('');
  };

  const handleResetCourse = (courseId, courseTitle) => {
    if (window.confirm(`Bạn có chắc chắn muốn đặt lại tiến độ của bài học "${courseTitle}"? Mọi bài đọc và trắc nghiệm của phần này sẽ được xóa.`)) {
      resetCourseProgress(courseId);
      if (selectedCourse && selectedCourse.id === courseId) {
        setSelectedCourse(null);
      }
      alert(`Đã đặt lại bài học "${courseTitle}"!`);
    }
  };

  const handleLessonComplete = (courseId, lessonId) => {
    recordLessonRead(courseId, lessonId);
    addXP(15); // Add 15 XP for reading
    
    // Auto progress to next lesson or quiz
    if (activeLessonIndex < selectedCourse.lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    } else {
      setQuizStarted(true);
    }
  };

  const handleOptionSelect = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const submitAnswer = () => {
    setIsAnswerSubmitted(true);
    const correctIdx = selectedCourse.quizzes[currentQuizIndex].answerIndex;
    if (selectedOption === correctIdx) {
      setQuizScore(prev => prev + 1);
    }
  };

  const askAiTutor = async (question, correctAnswer, userAnswer, explanation) => {
    const sub = user?.subscription || 'Free';
    if (sub === 'Free') {
      alert("Tính năng giải thích chuyên sâu bằng AI chỉ dành cho thành viên đã nâng cấp gói Premium hoặc Mentor+. Hãy nâng cấp tài khoản của bạn để sử dụng!");
      return;
    }
    setIsAiLoading(true);
    setAiExplanation('');
    
    const profile = riskProfile || 'Balanced';
    
    const today = new Date();
    const dateStr = `Hôm nay là ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}.`;

    // Custom system instruction for quiz tutor based on tier and risk profile
    let systemPrompt = '';
    if (sub === 'Free') {
      systemPrompt = `You are the SAVE+ AI Tutor for a Free user, powered by Gemini 2.5 Flash, the latest AI model. Act as a professional financial consultant/educator. ${dateStr} Explain why the correct answer is correct and why the user's choice is correct/incorrect. Keep your answer very brief, simple, and under 100 words in Vietnamese. ALWAYS append this EXACT suffix at the very end of your response: "\\n\\nBạn đang dùng thử bản giới hạn. Hãy nâng cấp Premium/Mentor+ để nhận phân tích chuyên sâu hơn!"`;
    } else if (sub === 'Premium') {
      systemPrompt = `You are the SAVE+ AI Tutor for a Premium user, powered by Gemini 2.5 Flash, the latest AI model. Act as a professional financial educator. ${dateStr} Use the Socratic method: explain the question conceptually and prompt the user with a question to test their understanding rather than just giving a boring lecture. Structure your response with bullet points in Vietnamese. Tailor it to the user's risk profile: ${profile}. Keep it encouraging and educational.`;
    } else { // Mentor+
      systemPrompt = `You are the SAVE+ AI Tutor+ for a Mentor+ user, powered by Gemini 2.5 Flash, the latest AI model, acting as a premier Wealth Advisory Advisor. ${dateStr} Provide a deep, professional, and analytical explanation in Vietnamese. Combine the Socratic method, structured bullet points, and strategic risk evaluation tailored to the user's risk profile: ${profile}. Offer professional finance insights.`;
    }

    const promptText = `Câu hỏi trắc nghiệm: "${question}"
Đáp án đúng của hệ thống: "${correctAnswer}"
Người học đã chọn: "${userAnswer}"
Giải thích cơ bản từ hệ thống: "${explanation}"

Hãy giúp người học phân tích chuyên sâu câu trả lời của họ, giải thích lý thuyết tài chính nền tảng liên quan, và đưa ra lời khuyên thực tế.`;

    try {
      const keyToUse = localStorage.getItem('saveplus_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToUse}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          tools: [{ google_search: {} }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error("Invalid response format");
      }

      setAiExplanation(generatedText.trim());
      setIsAiLoading(false);
    } catch (error) {
      console.warn("Gemini API call failed in askAiTutor, falling back to mock response:", error);
      
      // Fallback logic
      let fallbackText = `🤖 Cố Vấn Học Tập S+ (AI Mentor):\n` +
        `Bạn đã chọn phương án trả lời: "${userAnswer}". Đáp án chính xác là: "${correctAnswer}".\n\n` +
        `💡 Phân tích chuyên sâu cho người học:\n` +
        `${explanation}\n\n` +
        `🔍 Lời khuyên thực hành quản lý tài chính:\n` +
        `Luôn bắt đầu tích lũy sớm để tận dụng sức mạnh lãi kép. Tránh các dự án lending/staking cam kết lãi suất phi thực tế và hãy giữ gìn an toàn thông tin tài khoản ngân hàng của bạn.`;
        
      if (sub === 'Free') {
        const words = fallbackText.split(/\s+/);
        if (words.length > 80) {
          fallbackText = words.slice(0, 80).join(" ") + "...";
        }
        fallbackText += `\n\nBạn đang dùng thử bản giới hạn. Hãy nâng cấp Premium/Mentor+ để nhận phân tích chuyên sâu hơn!`;
      }
      
      setAiExplanation(fallbackText);
      setIsAiLoading(false);
    }
  };

  const nextQuizStep = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setAiExplanation('');
    
    if (currentQuizIndex < selectedCourse.quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      setQuizFinished(true);
      completeCourseQuiz(selectedCourse.id);
      addXP(50); // bonus 50 XP
      triggerStreak();
      confetti({
        particleCount: 130,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#7C3AED', '#10B981']
      });
    }
  };

  const retryQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizFinished(false);
    setAiExplanation('');
  };

  const handleResetProgress = () => {
    if (window.confirm("Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học tập? Mọi bài học đã hoàn thành sẽ trở về 0%.")) {
      resetAllProgress();
      setSelectedCourse(null);
      alert("Đã đặt lại tiến trình học tập thành công!");
    }
  };

  // Calculate emotional readiness score base
  const totalQuizzesCount = selectedCourse ? selectedCourse.quizzes.length : 1;
  const quizPercent = Math.round((quizScore / totalQuizzesCount) * 100);

  return (
    <div className="space-y-6 fade-in text-slate-800 dark:text-white font-sans">
      
      {/* TABS CONTROLLER */}
      <div className="flex border-b border-slate-200 dark:border-white/10 overflow-x-auto scrollbar-none">
        <button 
          onClick={() => { setActiveTab('courses'); setSelectedCourse(null); }}
          className={`pb-3 px-4 sm:px-6 font-bold text-[11px] sm:text-xs uppercase tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'courses' 
              ? 'border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Giáo trình trực tuyến
        </button>
        <button 
          onClick={() => { setActiveTab('daily_quiz'); setSelectedCourse(null); }}
          className={`pb-3 px-4 sm:px-6 font-bold text-[11px] sm:text-xs uppercase tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'daily_quiz' 
              ? 'border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Thử thách {dailyQuizLimit} câu hằng ngày
        </button>
        <button 
          onClick={() => { setActiveTab('external_links'); setSelectedCourse(null); }}
          className={`pb-3 px-4 sm:px-6 font-bold text-[11px] sm:text-xs uppercase tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'external_links' 
              ? 'border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Cổng tự học uy tín toàn cầu
        </button>
      </div>

      {activeTab === 'courses' && (
        <>
          {/* COURSE VIEW */}
          {!selectedCourse ? (
            <div className="space-y-6">
              
              {/* Heading, Reset Button and Curiosity banner */}
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <BookOpen size={24} className="text-purple-600 dark:text-purple-400" />
                    <span>Lộ Trình Tự Học Tài Chính Cá Nhân & Đầu Tư</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lớp học thiết kế ngắn gọn, trực quan, loại bỏ các chỉ số tài chính phức tạp.</p>
                </div>
                
                <div className="flex items-center space-x-3 self-start md:self-center">
                  <button 
                    onClick={handleResetProgress}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-450 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-[1.01] shadow-xs"
                    title="Đặt lại toàn bộ tiến trình học tập"
                  >
                    <RotateCcw size={14} />
                    <span>Đặt lại tiến trình</span>
                  </button>
                  
                  {/* Curiosity banner */}
                  <div className="hidden lg:flex bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/15 dark:border-purple-500/20 p-3 rounded-xl items-center space-x-2 shrink-0">
                    <Award size={16} className="text-purple-600 dark:text-purple-400 animate-bounce" />
                    <span className="text-[10px] text-slate-700 dark:text-slate-200">Hoàn thành Level 1 để mở khóa rổ Quỹ ETF</span>
                  </div>
                </div>
              </div>

              {/* Course Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                  const courseIndex = courses.findIndex(c => c.id === course.id);
                  const isVipCourse = course.tags?.includes('VIP') || course.id >= 'C06';
                  const hasVipSub = user?.subscription === 'Premium' || user?.subscription === 'Mentor+';
                  
                  let isLocked = false;
                  let lockMessage = '';
                  
                  const prevCourseNotFinished = courseIndex > 0 && (courses[courseIndex - 1]?.progress || 0) < 100;
                  
                  if (prevCourseNotFinished) {
                    isLocked = true;
                    lockMessage = '🔒 Hoàn thành bài học trước để mở khóa';
                  } else if (isVipCourse && !hasVipSub) {
                    isLocked = true;
                    lockMessage = '🔒 VIP: Nâng cấp để mở khóa';
                  }
                  
                  return (
                    <div 
                      key={course.id} 
                      onClick={() => {
                        if (isLocked) {
                          if (prevCourseNotFinished) {
                            alert("Bài học này đang bị khóa. Bạn cần hoàn thành bài học trước đó đạt 100% để mở khóa!");
                          } else if (isVipCourse && !hasVipSub) {
                            if (window.confirm("Khóa học chuyên sâu này chỉ dành cho thành viên VIP. Bạn có muốn đi tới trang Nâng cấp ngay không?")) {
                              navigate('/profile');
                            }
                          } else {
                            alert("Bài học này đang bị khóa. Bạn cần hoàn thành bài học trước đó đạt 100% để mở khóa!");
                          }
                          return;
                        }
                        startCourse(course);
                      }}
                      className={`glass-panel rounded-xl overflow-hidden flex flex-col justify-between hover-scale cursor-pointer ${
                        isLocked ? 'opacity-65 cursor-not-allowed' : ''
                      }`}
                    >
                      <div>
                        {/* Thumbnail overlay */}
                        <div className="relative h-40 bg-slate-900">
                          <img 
                            src={course.thumbnail || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=350&q=80'} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          
                          {isLocked && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-1 z-10">
                              <Lock size={20} className="text-slate-400" />
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-4">{lockMessage}</span>
                            </div>
                          )}

                          <div className="absolute top-2 left-2 flex space-x-1">
                            {course.tags?.map(t => (
                              <span key={t} className="px-2 py-0.5 bg-black/75 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase tracking-wider">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-center text-[9px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
                            <span>Mức: {course.level || 'Beginner'}</span>
                            <span className="flex items-center space-x-0.5">
                              <Clock size={11} />
                              <span>{course.duration || '3 phút đọc'}</span>
                            </span>
                          </div>
                          
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-200 line-clamp-1">{course.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-light">{course.description}</p>
                        </div>
                      </div>

                      {/* Course progress */}
                      <div className="p-4 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/60 dark:bg-slate-900/20 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            <span>Tiến độ</span>
                            <span>{course.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-200/40 dark:border-white/5">
                            <div className="bg-purple-600 dark:bg-purple-500 h-full transition-all duration-300" style={{ width: `${course.progress || 0}%` }} />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {course.progress > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResetCourse(course.id, course.title);
                              }}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-450 rounded-lg transition-all cursor-pointer hover:scale-102"
                              title="Đặt lại bài học này"
                            >
                              <RotateCcw size={12} />
                            </button>
                          )}
                          <button className="px-3.5 py-1.5 bg-brand-teal text-white text-[10px] font-black rounded-lg transition-all flex items-center space-x-0.5 cursor-pointer">
                            <span>{course.progress > 0 ? 'Học tiếp' : 'Bắt đầu'}</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            
            /* DYNAMIC COURSE READER & QUIZ SYSTEM */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Top back button */}
              <div className="lg:col-span-3">
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Quay lại danh mục</span>
                </button>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2 flex-wrap">
                    <span>{selectedCourse.title}</span>
                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                      Cấp độ: {selectedCourse.level || 'Beginner'}
                    </span>
                  </h2>
                  
                  <button 
                    onClick={() => handleResetCourse(selectedCourse.id, selectedCourse.title)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-450 rounded-lg text-xs font-bold transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <RotateCcw size={12} />
                    <span>Đặt lại bài này</span>
                  </button>
                </div>
              </div>

              {/* Left Column: video or reading text */}
              <div className="lg:col-span-2 space-y-6">
                {!quizStarted ? (
                  
                  /* COURSE READ PANEL */
                  <div className="glass-panel p-5 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-200 flex items-center space-x-2">
                        <Play size={16} className="text-blue-500" />
                        <span>Bài giảng {activeLessonIndex + 1}: {selectedCourse.lessons[activeLessonIndex]?.title}</span>
                      </h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center space-x-1">
                        <Clock size={11} />
                        <span>{selectedCourse.duration || '3 phút đọc'}</span>
                      </span>
                    </div>

                    {/* Interactive video simulator frame */}
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-slate-200/40 dark:border-white/5 shadow-inner">
                      {selectedCourse.lessons[activeLessonIndex]?.videoUrl ? (
                        <iframe 
                          src={selectedCourse.lessons[activeLessonIndex]?.videoUrl} 
                          title="SAVE+ Video lecture" 
                          className="w-full h-full object-cover"
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="flex flex-col items-center space-y-2 text-slate-600">
                          <Video size={40} />
                          <span className="text-xs">Không tìm thấy video bài giảng.</span>
                        </div>
                      )}
                    </div>

                    {/* Reading Content */}
                    <div className="prose max-w-none text-xs text-slate-600 dark:text-slate-350 space-y-3 leading-relaxed border-t border-slate-200 dark:border-white/5 pt-4">
                      <h4 className="font-extrabold text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
                        <BookOpen size={14} className="text-purple-600 dark:text-purple-400" />
                        <span>Nội dung chi tiết bài đọc:</span>
                      </h4>
                      <p className="font-light whitespace-pre-line leading-relaxed">{selectedCourse.lessons[activeLessonIndex]?.reading}</p>
                    </div>

                    {/* CTA Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-white/5">
                      <span className="text-[10px] text-brand-gold font-bold flex items-center space-x-1">
                        <Sparkles size={11} className="fill-brand-gold/10" />
                        <span>Đọc xong nhận ngay +15 XP</span>
                      </span>
                      
                      <button 
                        onClick={() => handleLessonComplete(selectedCourse.id, selectedCourse.lessons[activeLessonIndex].id)}
                        className="px-5 py-2 bg-brand-teal text-white text-xs font-black rounded-xl shadow-md flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Hoàn thành bài đọc</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  
                  /* INTERACTIVE SCENARIO QUIZ SCREEN */
                  <div className="glass-panel p-5 rounded-xl space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
                      <span className="font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 text-slate-950 dark:text-slate-200">
                        <BookOpenCheck size={16} className="text-brand-gold" />
                        <span>Trắc nghiệm kịch bản: Câu {currentQuizIndex + 1} / {selectedCourse.quizzes.length}</span>
                      </span>
                      
                      {/* Quiz progress */}
                      <div className="w-24 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-gold h-full transition-all duration-300"
                          style={{ width: `${((currentQuizIndex + 1) / selectedCourse.quizzes.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {!quizFinished ? (
                      <div className="space-y-5">
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-white/5">
                          {selectedCourse.quizzes[currentQuizIndex]?.question}
                        </h3>

                        {/* Options mapping with Neon Green / Rose Red indicators */}
                        <div className="grid grid-cols-1 gap-2.5">
                          {selectedCourse.quizzes[currentQuizIndex]?.options.map((opt, oIdx) => {
                            const isSelected = selectedOption === oIdx;
                            const isCorrectAnswer = selectedCourse.quizzes[currentQuizIndex].answerIndex === oIdx;
                            
                            let optionStyle = 'border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-650 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700';
                            
                            if (isSelected) {
                              optionStyle = 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-white';
                            }
                            
                            if (isAnswerSubmitted) {
                              if (isCorrectAnswer) {
                                optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
                              } else if (isSelected) {
                                optionStyle = 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold';
                              } else {
                                optionStyle = 'opacity-40 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={isAnswerSubmitted}
                                onClick={() => handleOptionSelect(oIdx)}
                                className={`w-full p-3.5 text-left rounded-xl border text-xs transition-all flex items-start space-x-3 cursor-pointer ${optionStyle}`}
                              >
                                <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700/60 flex items-center justify-center font-bold text-[9px] uppercase shrink-0">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span className="leading-relaxed font-light">{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Submit Button */}
                        {!isAnswerSubmitted ? (
                          <button 
                            onClick={submitAnswer}
                            disabled={selectedOption === null}
                            className="w-full py-2.5 bg-brand-teal text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Kiểm tra kết quả
                          </button>
                        ) : (
                          <div className="space-y-4">
                            {/* Explanations */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 rounded-xl space-y-2">
                              <span className="block text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">📝 Phân tích giải nghĩa:</span>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                                {selectedCourse.quizzes[currentQuizIndex]?.explanation}
                              </p>
                              
                              <button
                                onClick={() => askAiTutor(
                                  selectedCourse.quizzes[currentQuizIndex].question,
                                  selectedCourse.quizzes[currentQuizIndex].options[selectedCourse.quizzes[currentQuizIndex].answerIndex],
                                  selectedCourse.quizzes[currentQuizIndex].options[selectedOption],
                                  selectedCourse.quizzes[currentQuizIndex].explanation
                                )}
                                className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-450 hover:underline cursor-pointer pt-1"
                              >
                                <Sparkles size={11} className="text-brand-gold fill-brand-gold/10" />
                                <span>Nhờ AI S+ giải thích chuyên sâu (Quy tắc & Kỷ luật vốn)</span>
                              </button>
                            </div>

                            {/* AI chat bubble overlay */}
                            {(isAiLoading || aiExplanation) && (
                              <div className="p-4 rounded-xl border bg-slate-100 dark:bg-slate-900 border-slate-250 dark:border-white/5 text-left font-mono text-[10.5px] leading-relaxed relative">
                                {isAiLoading ? (
                                  <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                                    <span>AI Mentor đang tải phân tích...</span>
                                  </div>
                                ) : (
                                  <div className="whitespace-pre-line text-slate-700 dark:text-slate-350">
                                    {aiExplanation}
                                  </div>
                                )}
                              </div>
                            )}

                            <button 
                              onClick={nextQuizStep}
                              className="w-full py-2.5 bg-brand-teal text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                            >
                              {currentQuizIndex < selectedCourse.quizzes.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài trắc nghiệm'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      
                      /* QUIZ FINISHED SPLASH */
                      <div className="text-center py-6 space-y-4">
                        <div className="inline-flex w-16 h-16 bg-amber-500/10 text-brand-gold border border-brand-gold/20 rounded-full items-center justify-center mb-1">
                          <Award size={30} className="fill-brand-gold/10" />
                        </div>
                        
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Thử thách hoàn thành xuất sắc!</h3>
                          
                          {/* Emotional feedback */}
                          <div className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 text-[10.5px] rounded-full border border-emerald-500/20 font-bold">
                            <Brain size={13} />
                            <span>Trực giác tâm lý của bạn vượt trội hơn {quizPercent || 72}% học viên mới!</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-light leading-normal">
                          Bạn đã trả lời đúng <strong className="text-blue-600 dark:text-blue-400 font-mono">{quizScore}/{selectedCourse.quizzes.length}</strong> câu hỏi. Nhận ngay <strong className="text-brand-gold font-mono">+50 XP</strong>.
                        </p>
                        
                        <div className="flex space-x-3 max-w-xs mx-auto pt-3">
                          <button 
                            onClick={retryQuiz}
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-250 dark:border-white/10 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
                          >
                            <RotateCcw size={13} />
                            <span>Làm lại</span>
                          </button>
                          
                          <button 
                            onClick={() => setSelectedCourse(null)}
                            className="flex-1 py-2.5 bg-brand-teal text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            Xác nhận hoàn tất
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="glass-panel p-4 rounded-xl space-y-3">
                  <h4 className="font-bold text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-widest">Danh mục bài đọc</h4>
                  
                  <div className="space-y-2">
                    {selectedCourse.lessons.map((lesson, idx) => {
                      const isRead = userProgress[selectedCourse.id]?.lessonsRead?.includes(lesson.id);
                      const isCurrent = activeLessonIndex === idx && !quizStarted;
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => { setActiveLessonIndex(idx); setQuizStarted(false); }}
                          className={`w-full p-2.5 text-left rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer border ${
                            isCurrent 
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border-blue-500/25 pl-3' 
                              : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <span className="line-clamp-1">{idx + 1}. {lesson.title}</span>
                          {isRead && (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-450 flex items-center space-x-0.5">
                              <CheckCircle2 size={11} />
                              <span>Đã đọc</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                    
                    {/* Quiz button */}
                    <button
                      onClick={() => setQuizStarted(true)}
                      className={`w-full p-2.5 text-left rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer border ${
                        quizStarted 
                          ? 'bg-brand-gold/15 text-brand-gold font-bold border-brand-gold/20 pl-3' 
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>🎯 Mini-Quiz Ôn Tập</span>
                      {quizFinished && (
                        <span className="text-[9px] font-bold text-brand-gold flex items-center space-x-0.5">
                          <Award size={11} className="fill-brand-gold/10" />
                          <span>Đạt</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {activeTab === 'daily_quiz' && (
        <div className="space-y-6">
          <div className="text-left">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Brain size={24} className="text-purple-600 dark:text-purple-400" />
              <span>Thử Thách Thường Nhật: Quiz {dailyQuizLimit} Câu Hỏi Tài Chính</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Rèn luyện tư duy quản lý vốn và bảo mật tài sản mỗi ngày. Hoàn thành để nhận ngay +100 XP học tập!
            </p>
          </div>

          {dailyCompletedToday ? (
            <div className="glass-panel p-8 text-center rounded-xl border border-emerald-500/25 bg-emerald-500/5 max-w-xl mx-auto space-y-4">
              <div className="inline-flex w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 rounded-full items-center justify-center animate-bounce">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Thử thách hôm nay đã hoàn thành!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                  Bạn đã trả lời xuất sắc {dailyQuizLimit} câu hỏi tài chính và nhận được <strong>+100 XP</strong>. Hãy tiếp tục quay lại vào ngày mai để đón nhận các câu hỏi mới!
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (window.confirm("Bạn có muốn xóa lịch sử hôm nay để làm lại quiz không? (XP đã nhận vẫn giữ nguyên)")) {
                      localStorage.removeItem('saveplus_daily_quiz_completed_date');
                      setDailyCompletedToday(false);
                      setDailyQuizStarted(false);
                      setDailyCurrentIndex(0);
                      setDailySelectedOption(null);
                      setIsDailySubmitted(false);
                      setDailyScore(0);
                      setDailyFinished(false);
                    }
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-250 dark:border-white/10 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Làm lại thử thách
                </button>
              </div>
            </div>
          ) : !dailyQuizStarted ? (
            <div className="glass-panel p-6 rounded-xl max-w-xl mx-auto border border-purple-500/25 bg-purple-500/5 text-center space-y-4">
              <div className="inline-flex w-16 h-16 bg-purple-500/10 text-purple-650 dark:text-purple-400 border border-purple-500/20 rounded-full items-center justify-center">
                <Brain size={30} className="text-purple-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Bạn đã sẵn sàng cho {dailyQuizLimit} câu hỏi hôm nay?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                  Bộ câu hỏi được tổng hợp ngẫu nhiên về các kỹ năng: Tiết kiệm, Tích lũy lãi kép, ETF, Đa dạng hóa danh mục, Tâm lý học hành vi, và Bảo mật chống Ponzi.
                </p>
              </div>
              <button
                onClick={() => {
                  setDailyQuizStarted(true);
                  setDailyCurrentIndex(0);
                  setDailySelectedOption(null);
                  setIsDailySubmitted(false);
                  setDailyScore(0);
                  setDailyFinished(false);
                  setAiExplanation('');
                }}
                className="px-6 py-2.5 bg-brand-teal text-white text-xs font-black rounded-xl shadow-md cursor-pointer hover:opacity-95 transition-all uppercase tracking-wider"
              >
                Bắt đầu thử thách ngay
              </button>
            </div>
          ) : !dailyFinished ? (
            <div className="glass-panel p-5 rounded-xl max-w-xl mx-auto space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
                <span className="font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 text-slate-950 dark:text-slate-200">
                  <Brain size={16} className="text-purple-500" />
                  <span>Daily Quiz: Câu {dailyCurrentIndex + 1} / {dailyQuizLimit}</span>
                </span>
                <div className="w-24 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-600 h-full transition-all duration-300"
                    style={{ width: `${((dailyCurrentIndex + 1) / dailyQuizLimit) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-5 text-left">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-white/5">
                  {DAILY_QUIZ_QUESTIONS[dailyCurrentIndex]?.question}
                </h3>

                <div className="grid grid-cols-1 gap-2.5">
                  {DAILY_QUIZ_QUESTIONS[dailyCurrentIndex]?.options.map((opt, oIdx) => {
                    const isSelected = dailySelectedOption === oIdx;
                    const isCorrectAnswer = DAILY_QUIZ_QUESTIONS[dailyCurrentIndex].answerIndex === oIdx;
                    
                    let optionStyle = 'border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-650 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700';
                    
                    if (isSelected) {
                      optionStyle = 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-white';
                    }
                    
                    if (isDailySubmitted) {
                      if (isCorrectAnswer) {
                        optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 font-bold';
                      } else if (isSelected) {
                        optionStyle = 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold';
                      } else {
                        optionStyle = 'opacity-40 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={isDailySubmitted}
                        onClick={() => setDailySelectedOption(oIdx)}
                        className={`w-full p-3.5 text-left rounded-xl border text-xs transition-all flex items-start space-x-3 cursor-pointer ${optionStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700/60 flex items-center justify-center font-bold text-[9px] uppercase shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="leading-relaxed font-light">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {!isDailySubmitted ? (
                  <button 
                    onClick={() => {
                      setIsDailySubmitted(true);
                      if (dailySelectedOption === DAILY_QUIZ_QUESTIONS[dailyCurrentIndex].answerIndex) {
                        setDailyScore(prev => prev + 1);
                      }
                    }}
                    disabled={dailySelectedOption === null}
                    className="w-full py-2.5 bg-brand-teal text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Kiểm tra kết quả
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 rounded-xl space-y-2">
                      <span className="block text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">📝 Giải thích từ hệ thống:</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                        {DAILY_QUIZ_QUESTIONS[dailyCurrentIndex]?.explanation}
                      </p>
                      
                      <button
                        onClick={() => askAiTutor(
                          DAILY_QUIZ_QUESTIONS[dailyCurrentIndex].question,
                          DAILY_QUIZ_QUESTIONS[dailyCurrentIndex].options[DAILY_QUIZ_QUESTIONS[dailyCurrentIndex].answerIndex],
                          DAILY_QUIZ_QUESTIONS[dailyCurrentIndex].options[dailySelectedOption],
                          DAILY_QUIZ_QUESTIONS[dailyCurrentIndex].explanation
                        )}
                        className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-450 hover:underline cursor-pointer pt-1"
                      >
                        <Sparkles size={11} className="text-brand-gold fill-brand-gold/10" />
                        <span>Nhờ AI S+ giải thích chuyên sâu</span>
                      </button>
                    </div>

                    {(isDailyAiLoading || aiExplanation) && (
                      <div className="p-4 rounded-xl border bg-slate-100 dark:bg-slate-900 border-slate-250 dark:border-white/5 text-left font-mono text-[10.5px] leading-relaxed relative">
                        {isDailyAiLoading ? (
                          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                            <span>AI Mentor đang tải phân tích...</span>
                          </div>
                        ) : (
                          <div className="whitespace-pre-line text-slate-700 dark:text-slate-350">
                            {aiExplanation}
                          </div>
                        )}
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        setDailySelectedOption(null);
                        setIsDailySubmitted(false);
                        setAiExplanation('');
                        
                        if (dailyCurrentIndex < dailyQuizLimit - 1) {
                          setDailyCurrentIndex(prev => prev + 1);
                        } else {
                          setDailyFinished(true);
                          setDailyCompletedToday(true);
                          localStorage.setItem('saveplus_daily_quiz_completed_date', new Date().toISOString().split('T')[0]);
                          addXP(100); // 100 XP for Daily Quiz completion
                          triggerStreak();
                          confetti({
                            particleCount: 140,
                            spread: 90,
                            origin: { y: 0.6 },
                            colors: ['#7C3AED', '#10B981', '#F59E0B']
                          });
                        }
                      }}
                      className="w-full py-2.5 bg-brand-teal text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                    >
                      {dailyCurrentIndex < dailyQuizLimit - 1 ? 'Câu tiếp theo' : 'Hoàn thành thử thách hôm nay'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Quiz finished splash screen
            <div className="glass-panel p-6 rounded-xl max-w-xl mx-auto text-center space-y-4">
              <div className="inline-flex w-16 h-16 bg-amber-500/10 text-brand-gold border border-brand-gold/20 rounded-full items-center justify-center mb-1">
                <Award size={30} className="fill-brand-gold/10" />
              </div>
              
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Thử thách {dailyQuizLimit} câu hoàn thành!</h3>
                <div className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 text-[10.5px] rounded-full border border-emerald-500/20 font-bold">
                  <Brain size={13} />
                  <span>Trực giác quản lý vốn của bạn rất nhạy bén!</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-light leading-normal">
                Bạn đã trả lời đúng <strong className="text-blue-600 dark:text-blue-400 font-mono">{dailyScore}/{dailyQuizLimit}</strong> câu hỏi. Nhận ngay <strong className="text-brand-gold font-mono">+100 XP</strong>.
              </p>
              
              <div className="pt-2">
                <button 
                  onClick={() => {
                    setActiveTab('courses');
                  }}
                  className="px-6 py-2 bg-brand-teal text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Về Trang Học Tập
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EXTERNAL EDUCATIONAL LINKS DIRECTORY */}
      {activeTab === 'external_links' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Globe size={24} className="text-purple-600 dark:text-purple-400" />
              <span>Học viện Tài chính liên kết uy tín</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              SAVE+ tổng hợp các liên kết giáo dục công ích miễn phí để bạn mở rộng kiến thức tài chính. Mọi liên kết sẽ mở ở tab mới.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trustedEducationLinks.map((lnk) => (
              <div 
                key={lnk.title} 
                className="glass-panel p-4 rounded-xl flex flex-col justify-between space-y-3 hover-scale"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">{lnk.source}</span>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-200">{lnk.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light">Trình độ: {lnk.level} • Hỗ trợ: {lnk.duration}</p>
                </div>
                
                <a 
                  href={lnk.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-slate-100 hover:bg-brand-teal hover:text-white dark:bg-slate-900 dark:hover:bg-brand-teal border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-350 rounded-lg text-[10.5px] font-bold transition-all flex items-center justify-center space-x-1"
                >
                  <span>Go Learn</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
