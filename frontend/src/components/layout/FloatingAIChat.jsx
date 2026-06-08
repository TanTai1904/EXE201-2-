import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Bot, X, Send, Sparkles, MessageSquare, ChevronDown, Zap, Lock } from 'lucide-react';

// Route-aware context hints for AI
const ROUTE_CONTEXT = {
  '/': 'trang Tổng Quan Dashboard (thống kê học tập, danh mục đầu tư, mục tiêu tài chính)',
  '/learning': 'trang Học Tập (khóa học tài chính, bài giảng, quiz)',
  '/simulation': 'trang Giả Lập Đầu Tư (mua bán cổ phiếu ảo, theo dõi danh mục)',
  '/goals': 'trang Mục Tiêu Tích Lũy (quản lý quỹ tiết kiệm cá nhân)',
  '/mentor': 'trang AI Mentor (chat tài chính chuyên sâu)',
  '/community': 'trang Cộng Đồng (thảo luận, chia sẻ kiến thức)',
  '/profile': 'trang Hồ Sơ & Gói Tài Khoản (subscription, thanh toán)',
  '/admin': 'trang Quản Trị Admin',
};

const QUICK_PROMPTS = [
  'ETF VN30 là gì?',
  'Lãi kép hoạt động thế nào?',
  'Cách phân bổ 50/30/20?',
  'Dấu hiệu lừa đảo Ponzi?',
];

const GEMINI_KEY = 'AIzaSyCuYFGSlcGKM1K4RXs93Vy7pB-Juh67VN0';

export default function FloatingAIChat() {
  const { user, riskProfile } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '👋 Xin chào! Tôi là **AI Trợ lý SAVE+**.\nHỏi tôi bất cứ điều gì về tài chính, đầu tư hoặc khóa học ngay tại đây!',
      streaming: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [questionsToday, setQuestionsToday] = useState(() => {
    const saved = localStorage.getItem('saveplus_float_ai_q_today');
    return saved ? parseInt(saved) : 0;
  });
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const scrollRef = useRef();
  const inputRef = useRef();
  const abortRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const sub = user?.subscription || 'Free';
  // Free & Mentor: 20 câu/ngày | Premium & Mentor+: Không giới hạn
  const limit = (sub === 'Premium' || sub === 'Mentor+') ? Infinity : 20;
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - questionsToday);

  const buildSystemPrompt = () => {
    const routeCtx = ROUTE_CONTEXT[location.pathname] || 'ứng dụng SAVE+';
    const profile = riskProfile || 'Balanced';
    const tierHints = {
      Free: 'Trả lời ngắn gọn trong 80 từ. Khuyến khích nâng cấp Premium/Mentor+ để nhận phân tích sâu hơn và không giới hạn câu hỏi.',
      Mentor: 'Trả lời ngắn gọn trong 80 từ. Khuyến khích nâng cấp Premium/Mentor+ để nhận phân tích sâu hơn và không giới hạn câu hỏi.',
      Premium: `Trả lời chi tiết, dùng bullet points. Cá nhân hóa theo khẩu vị rủi ro: ${profile}.`,
      'Mentor+': `Trả lời chuyên sâu, phân tích đa chiều như chuyên gia tư vấn tài chính cao cấp. Khẩu vị rủi ro: ${profile}.`,
    };
    const today = new Date();
    const dateStr = `Hôm nay là ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}.`;
    return `Bạn là AI Trợ lý học tập tài chính của ứng dụng SAVE+ - nền tảng giáo dục tài chính cá nhân hàng đầu Việt Nam. Bạn được hỗ trợ bởi Gemini 2.5 Flash, mô hình AI mới nhất.
${dateStr} Bạn có kiến thức và dữ liệu được cập nhật hoàn toàn mới nhất đến năm 2026, bao gồm xu hướng thị trường chứng khoán Việt Nam, lãi suất, lạm phát và các quy định tài chính mới nhất hiện tại (không bị giới hạn ở năm 2024). Hãy đóng vai một AI thế hệ mới năng động và hiện đại của năm 2026.
Người dùng hiện đang ở: ${routeCtx}.
Gói dịch vụ: ${sub}.
${tierHints[sub] || tierHints['Free']}
Trả lời HOÀN TOÀN bằng tiếng Việt. Không đề xuất mua bán chứng khoán cụ thể. Chỉ cung cấp kiến thức giáo dục tài chính.`;
  };

  const handleSend = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || isStreaming) return;

    if (remaining <= 0) {
      setShowLimitWarning(true);
      setTimeout(() => setShowLimitWarning(false), 4000);
      return;
    }

    const userMsg = { id: Date.now(), sender: 'user', text, streaming: false };
    const botMsgId = Date.now() + 1;
    const botMsg = { id: botMsgId, sender: 'bot', text: '', streaming: true };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
    setIsStreaming(true);

    const newCount = questionsToday + 1;
    setQuestionsToday(newCount);
    localStorage.setItem('saveplus_float_ai_q_today', newCount.toString());

    // Abort previous if any
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const configuredKey = localStorage.getItem('saveplus_gemini_api_key') || GEMINI_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${configuredKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text }] }],
          systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
          tools: [{ google_search: {} }],
          generationConfig: { maxOutputTokens: sub === 'Free' ? 300 : 1500 },
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              const part = json?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (part) {
                accumulated += part;
                setMessages(prev =>
                  prev.map(m =>
                    m.id === botMsgId ? { ...m, text: accumulated } : m
                  )
                );
              }
            } catch {
              // skip malformed SSE chunks
            }
          }
        }
      }

      setMessages(prev =>
        prev.map(m => (m.id === botMsgId ? { ...m, streaming: false } : m))
      );
    } catch (err) {
      if (err.name === 'AbortError') return;

      // Fallback mock response
      const fallbacks = {
        etf: '📊 ETF (Exchange-Traded Fund) là quỹ hoán đổi danh mục giao dịch trên sàn. ETF VN30 giúp bạn sở hữu rổ 30 cổ phiếu lớn nhất HOSE chỉ với 1 lần mua. Lợi thế: đa dạng hóa tự động, phí thấp.',
        'lãi kép': '💰 Lãi kép = lãi tính trên cả vốn gốc lẫn lãi đã tích lũy. Ví dụ: 100tr với lãi 10%/năm → sau 10 năm = 259tr (thay vì 200tr theo lãi đơn). Einstein gọi đây là "kỳ quan thứ 8"!',
        '50/30/20': '📐 Quy tắc 50/30/20: 50% nhu cầu thiết yếu (nhà, ăn), 30% mong muốn cá nhân (giải trí), 20% tiết kiệm & đầu tư. Đây là nền tảng quản lý dòng tiền hiệu quả nhất.',
      };
      const lower = text.toLowerCase();
      const fallback = Object.entries(fallbacks).find(([k]) => lower.includes(k))?.[1]
        || `Cảm ơn câu hỏi của bạn về "${text}". Hãy vào trang AI Mentor để được giải đáp chi tiết hơn với phân tích chuyên sâu theo gói ${sub}!`;

      setMessages(prev =>
        prev.map(m =>
          m.id === botMsgId ? { ...m, text: fallback, streaming: false } : m
        )
      );
    }

    setIsStreaming(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const tierColor = sub === 'Mentor+' ? 'from-amber-500 to-orange-500' : sub === 'Premium' ? 'from-brand-teal to-emerald-500' : 'from-blue-600 to-purple-600';
  const tierLabel = sub === 'Mentor+' ? '✦ Mentor+' : sub === 'Premium' ? '⭐ Premium' : 'Free';

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-24 md:bottom-8 right-5 z-50 w-14 h-14 rounded-2xl shadow-2xl bg-gradient-to-br ${tierColor} text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group`}
        title="AI Trợ lý SAVE+"
        aria-label="Open AI Chat"
      >
        {open ? (
          <ChevronDown size={24} className="transition-transform duration-200" />
        ) : (
          <>
            <Bot size={26} className="group-hover:scale-110 transition-transform" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-white" />
          </>
        )}
        {/* Unread badge */}
        {!open && messages.length > 1 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 rounded-full text-[9px] font-black flex items-center justify-center border-2 border-white shadow">
            AI
          </span>
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-40 md:bottom-28 right-5 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 origin-bottom-right ${
          open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'
        }`}
        style={{ maxHeight: '520px', background: 'rgba(15, 23, 42, 0.97)', backdropFilter: 'blur(24px)' }}
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between bg-gradient-to-r ${tierColor} shrink-0`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-extrabold text-sm leading-none">AI Trợ Lý SAVE+</h3>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                <span className="text-white/80 text-[10px] font-medium">{tierLabel} · {remaining === Infinity ? '∞ không giới hạn' : `${remaining}/20 câu hôm nay`}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-xl bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X size={15} className="text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {msg.sender === 'bot' && (
                <div className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${tierColor} flex items-center justify-center shrink-0 mb-0.5 shadow-lg`}>
                  <Sparkles size={13} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? `bg-gradient-to-br ${tierColor} text-white rounded-br-none shadow-lg`
                    : 'bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-bl-none shadow'
                }`}
              >
                {msg.text || ''}
                {/* Streaming cursor */}
                {msg.streaming && (
                  <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-brand-teal rounded-sm animate-pulse align-middle" />
                )}
              </div>
            </div>
          ))}

          {/* Limit warning */}
          {showLimitWarning && (
            <div className="flex items-center space-x-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-[11px]">
              <Lock size={13} className="shrink-0" />
              <span>
                {(sub === 'Free' || sub === 'Mentor')
                  ? 'Hết 20 câu hỏi hôm nay. Nâng cấp Premium hoặc Mentor+ để hỏi không giới hạn!'
                  : 'Đã đạt giới hạn hôm nay. Hãy quay lại vào ngày mai!'}
              </span>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                disabled={isStreaming}
                className="px-2.5 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-full transition-all disabled:opacity-50 cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-slate-800/60 shrink-0">
          <div className="flex items-center space-x-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl px-3 py-2 focus-within:border-brand-teal/50 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={remaining <= 0 ? 'Đã hết câu hỏi hôm nay...' : 'Hỏi về tài chính, ETF, đầu tư...'}
              disabled={isStreaming || remaining <= 0}
              className="flex-1 bg-transparent text-[12px] text-slate-200 placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming || remaining <= 0}
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                input.trim() && !isStreaming && remaining > 0
                  ? `bg-gradient-to-br ${tierColor} text-white shadow-md hover:scale-110`
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isStreaming ? (
                <Zap size={13} className="animate-pulse" />
              ) : (
                <Send size={13} />
              )}
            </button>
          </div>
          <p className="text-center text-[9px] text-slate-600 mt-1.5">
            Powered by Gemini 2.5 Flash (Cập nhật 2026) · Chỉ cung cấp kiến thức giáo dục
          </p>
        </div>
      </div>
    </>
  );
}
