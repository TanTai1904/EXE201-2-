import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Bot, User, Compass, HelpCircle } from 'lucide-react';

export default function AIMentor() {
  const { riskProfile, user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Xin chào Lâm! Tôi là Cố vấn học tập AI của SAVE+. \n\nTôi ở đây để giải thích mọi thuật ngữ tài chính, gợi ý lộ trình học tập, hoặc cùng bạn làm rõ các khái niệm như lãi suất kép, đa dạng hóa danh mục và ETF. \n\n*Lưu ý: Tôi chỉ cung cấp kiến thức giáo dục và không đưa ra lời khuyên mua bán chứng khoán.*`
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef();

  const [questionsCount, setQuestionsCount] = useState(() => {
    const saved = localStorage.getItem('saveplus_ai_questions_today');
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const presetPrompts = [
    'Nên gửi tiết kiệm hay đầu tư?',
    'Quỹ ETF là gì?',
    'Giải thích về Đa dạng hóa danh mục',
    'Làm thế nào để tránh bẫy lừa đảo Ponzi?'
  ];

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Check query limits based on subscription
    const sub = user?.subscription || 'Free';
    // Free & Mentor: 20 câu/ngày | Premium & Mentor+: Không giới hạn
    const limit = (sub === 'Premium' || sub === 'Mentor+') ? Infinity : 20;
    
    if (questionsCount >= limit) {
      let limitText = '';
      if (sub === 'Free') {
        limitText = '⚠️ Bạn đã hết hạn mức 20 câu hỏi miễn phí hôm nay. Hãy nâng cấp lên gói Premium hoặc Mentor+ để hỏi không giới hạn!';
      } else if (sub === 'Mentor') {
        limitText = '⚠️ Bạn đã hết hạn mức 20 câu hỏi Mentor hôm nay. Hãy nâng cấp lên gói Premium hoặc Mentor+ để hỏi không giới hạn!';
      } else {
        limitText = '⚠️ Đã đạt giới hạn hôm nay. Hãy quay lại vào ngày mai hoặc liên hệ hỗ trợ!';
      }
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: limitText + '\n\n👉 Bạn có thể nạp tiền và nâng cấp ngay tại phần [Hồ sơ & Gói tài khoản](/profile).'
      }]);
      setInput('');
      return;
    }

    const nextCount = questionsCount + 1;
    setQuestionsCount(nextCount);
    localStorage.setItem('saveplus_ai_questions_today', nextCount.toString());

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const today = new Date();
      const dateStr = `Hôm nay là ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}.`;
      let systemPrompt = '';
      if (sub === 'Free' || sub === 'Mentor') {
        systemPrompt = `You are the SAVE+ AI Mentor for a ${sub} user, powered by Gemini 2.5 Flash, the latest AI model. Act as a professional financial consultant. ${dateStr} You have up-to-date knowledge up to 2026, including recent Vietnamese and global financial trends. Answer the user's financial question directly, clearly, and concisely in Vietnamese (under 100 words). Do not refer to pre-2024 cutoffs or limitations. ALWAYS append this EXACT suffix at the very end of your response: "\\n\\nBạn đang dùng thử bản giới hạn. Hãy nâng cấp Premium/Mentor+ để nhận phân tích chuyên sâu hơn!"`;
      } else if (sub === 'Premium') {
        systemPrompt = `You are the SAVE+ AI Mentor for a Premium user, powered by Gemini 2.5 Flash, the latest AI model. Act as a professional financial advisor. ${dateStr} You have up-to-date, real-time knowledge of financial policies, interest rates, inflation, and market conditions up to 2026 (never state you are limited to 2024). Answer the user's questions directly, comprehensively, and clearly in Vietnamese with beautiful bullet points. Do not ask back too many questions. Personalize your advice based on the user's risk profile: ${riskProfile || 'Balanced'}. (If Conservative, emphasize safety, bonds, and capital preservation. If Aggressive, address high-growth assets but warn about position sizing and risk management. If Balanced, recommend a 50/50 or diversified mix). Keep the tone professional, educational, and direct.`;
      } else { // Mentor+
        systemPrompt = `You are the SAVE+ AI Mentor+ for a Mentor+ user, powered by Gemini 2.5 Flash, the latest AI model. Act as a premier Advanced Wealth Advisory Consultant. ${dateStr} You possess advanced, real-time-like financial knowledge updated to 2026 (never state you are limited to 2024). Provide professional, highly analytical, and direct financial insights in Vietnamese. Answer the user's questions directly, providing specific strategies, valuations, or allocations. Do not ask back too many questions. Personalize the advice to the user's risk profile: ${riskProfile || 'Balanced'}. (If Conservative, focus on high-quality debt instruments, capital protection, inflation hedging. If Aggressive, discuss market dynamics, derivatives, growth stock valuation, and advanced diversification. If Balanced, discuss core-satellite investing). Offer highly structured, direct, and actionable feedback.`;
      }

      const configuredKey = localStorage.getItem('saveplus_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${configuredKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: textToSend }] }],
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

      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: generatedText.trim()
      }]);
    } catch (error) {
      console.warn("Gemini API call failed, falling back to mock Socratic advisor:", error);
      
      // Fallback keyword-based response logic
      setTimeout(() => {
        let aiText = '';
        const lower = textToSend.toLowerCase();

        if (lower.includes('tiết kiệm') || lower.includes('đầu tư')) {
          aiText = `🤔 Nên gửi tiết kiệm hay đầu tư? Đây là câu hỏi rất hay cho người mới bắt đầu!\n\n` +
            `• Gửi tiết kiệm: Thích hợp cho Quỹ khẩn cấp (3-6 tháng chi phí). An toàn cao, lãi suất cố định (~5-6%/năm tại VN). Bạn có thể rút bất kỳ lúc nào.\n` +
            `• Đầu tư: Thích hợp cho dòng tiền nhàn rỗi dài hạn (>3 năm). Lợi nhuận kỳ vọng cao hơn (10-15%/năm) qua các quỹ chỉ số ETF hoặc cổ phiếu doanh nghiệp, nhưng giá trị có thể dao động ngắn hạn.\n\n` +
            `💡 Lời khuyên Socratic của tôi: Bạn đã xây dựng xong Quỹ khẩn cấp cho bản thân chưa? Bạn cảm thấy thế nào nếu số tiền đầu tư tạm thời giảm 5% vào tuần tới?`;
        } else if (lower.includes('etf')) {
          aiText = `📊 Quỹ ETF (Exchange Traded Fund) hoạt động giống như một chiếc giỏ chứa hàng chục cổ phiếu khác nhau niêm yết trên sàn.\n\n` +
            `Ví dụ: Thay vì bạn mua riêng lẻ FPT, VCB, HPG; bạn chỉ cần mua 1 chứng chỉ quỹ ETF VN30. \n\n` +
            `Lợi thế lớn nhất là: Đa dạng hóa tự động với chi phí cực thấp, tránh rủi ro "mất trắng" nếu một công ty cụ thể gặp sự cố. Bạn thấy mô hình này có thuận lợi hơn tự mua cổ phiếu lẻ không?`;
        } else if (lower.includes('đa dạng hóa')) {
          aiText = `🥚 Đa dạng hóa chính là nguyên tắc kinh điển: "Đừng bao giờ bỏ tất cả trứng vào một giỏ".\n\n` +
            `Trong tài chính, điều này nghĩa là phân bổ tiền của bạn vào nhiều lớp tài sản khác nhau:\n` +
            `1. Tiền mặt tích lũy (Quỹ khẩn cấp)\n` +
            `2. Trái phiếu (Thu nhập cố định, rủi ro thấp)\n` +
            `3. Cổ phiếu/ETF (Tăng trưởng dài hạn, rủi ro cao hơn)\n\n` +
            `Nếu một giỏ trứng bị rơi (ví dụ cổ phiếu giảm giá), các giỏ còn lại (tiết kiệm, trái phiếu) vẫn nâng đỡ tài sản của bạn không bị ảnh hưởng nặng nề. Bạn hiện đang phân bổ dòng tiền nhàn rỗi của mình thế nào?`;
        } else if (lower.includes('lừa đảo') || lower.includes('ponzi')) {
          aiText = `🚨 Bẫy lừa đảo tài chính Ponzi thường núp bóng các dự án đầu tư công nghệ mới, cam kết lợi nhuận phi thực tế.\n\n` +
            `Dấu hiệu nhận biết cốt lõi:\n` +
            `1. Lợi nhuận siêu cao & cam kết KHÔNG RỦI RO (ví dụ: lãi 1%/ngày, 30%/tháng).\n` +
            `2. Trả hoa hồng cao khi lôi kéo thêm người tham gia (Đa cấp biến tướng).\n` +
            `3. Pháp lý mập mờ, nạp rút tiền qua các cổng trung gian không có giấy phép của Nhà nước Việt Nam.\n\n` +
            `Nguyên tắc bất di bất dịch: Lợi nhuận cao luôn đi đôi với rủi ro cao. Bạn đã bao giờ bắt gặp lời mời chào đầu tư nào có các biểu hiện trên chưa?`;
        } else {
          aiText = `Cảm ơn câu hỏi của bạn. Để hiểu rõ hơn dưới góc nhìn học tập:\n\n` +
            `Mục tiêu của SAVE+ là trang bị tư duy tài chính dài hạn. Với câu hỏi "${textToSend}", hãy cùng phân tích xem: \n` +
            `• Đâu là phần rủi ro lớn nhất bạn muốn tránh?\n` +
            `• Kế hoạch sử dụng số vốn đó là trong ngắn hạn hay dài hạn?\n\n` +
            `Hãy chia sẻ thêm suy nghĩ của bạn, tôi sẽ giúp bạn mổ xẻ chi tiết từng khái niệm học thuật!`;
        }

        // Apply Free/Mentor limits in fallback too
        if (sub === 'Free' || sub === 'Mentor') {
          const words = aiText.split(/\s+/);
          if (words.length > 80) {
            aiText = words.slice(0, 80).join(" ") + "...";
          }
          aiText += `\n\nBạn đang dùng thử bản giới hạn. Hãy nâng cấp Premium/Mentor+ để nhận phân tích chuyên sâu hơn!`;
        }

        setTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'bot',
          text: aiText
        }]);
      }, 1000);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col justify-between space-y-4 fade-in">
      
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/40">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2 text-left">
            <Compass size={22} className="text-brand-teal" />
            <span>AI Mentor Học Tập S+</span>
            {(user?.subscription === 'Premium' || user?.subscription === 'Mentor+') && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse flex items-center space-x-0.5">
                <Sparkles size={10} className="fill-amber-500/10" />
                <span>VIP {user?.subscription}</span>
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 text-left">
            {user?.subscription === 'Premium'
              ? `🌟 Bạn đang dùng đặc quyền Premium (Không giới hạn câu hỏi).`
              : user?.subscription === 'Mentor+'
              ? `🌟 Bạn đang dùng đặc quyền Mentor+ (Không giới hạn câu hỏi).`
              : user?.subscription === 'Mentor'
              ? `📚 Bạn đang dùng gói Mentor (Hôm nay đã hỏi: ${questionsCount}/20 câu).`
              : `Người bạn đồng hành giải đáp thắc mắc tài chính (Hôm nay đã hỏi: ${questionsCount}/20 câu).`}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-brand-teal text-xs font-bold flex items-center space-x-1">
          <Bot size={14} />
          <span>Gemini 2.5 Flash (Cập nhật 2026)</span>
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 max-h-[60vh]">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start space-x-3.5 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}
          >
            {/* Avatar icon */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'bot' ? 'bg-brand-teal text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
              {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
            </div>

            {/* Bubble */}
            <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line border ${msg.sender === 'bot' ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs' : 'bg-brand-teal text-white border-brand-teal shadow-md shadow-teal-500/5'}`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing bubble */}
        {typing && (
          <div className="flex items-start space-x-3.5 max-w-md">
            <div className="w-8 h-8 rounded-xl bg-brand-teal text-white flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested prompts list */}
      <div className="space-y-2">
        <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center space-x-1">
          <HelpCircle size={12} className="text-brand-teal" />
          <span>Gợi ý câu hỏi bắt đầu:</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presetPrompts.map(p => (
            <button
              key={p}
              onClick={() => handleSendMessage(p)}
              className="py-1.5 px-3 bg-slate-100 hover:bg-brand-teal/10 dark:bg-slate-900/60 dark:hover:bg-brand-teal/15 border border-slate-200/50 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-full transition-all cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Free / Mentor User Upgrade Banner */}
      {(!user?.subscription || user.subscription === 'Free' || user.subscription === 'Mentor') && (
        <div className="bg-brand-teal/5 dark:bg-blue-900/10 border border-brand-teal/20 p-3 rounded-xl text-[11px] text-slate-650 dark:text-slate-350 text-left flex justify-between items-center">
          <span>💡 Bạn đang dùng AI Mentor giới hạn 20 câu/ngày. Nâng cấp Premium/Mentor+ để hỏi không giới hạn!</span>
          <button 
            type="button"
            onClick={() => navigate('/profile')} 
            className="text-xs font-extrabold text-brand-teal hover:underline ml-2 whitespace-nowrap cursor-pointer uppercase shrink-0"
          >
            Nâng cấp ngay
          </button>
        </div>
      )}

      {/* Text inputs */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
        className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-sm"
      >
        <input 
          type="text" 
          placeholder="Hỏi AI Mentor về lãi kép, ETF hoặc quản lý ngân sách..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent px-3 py-2 text-xs focus:outline-none text-slate-800 dark:text-white"
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          className="p-2.5 bg-brand-teal text-white rounded-xl disabled:opacity-50 hover:bg-brand-teal/95 shadow-md transition-all cursor-pointer shrink-0"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
