import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Shield, 
  TrendingUp, 
  Award, 
  AlertOctagon, 
  Clock, 
  Percent,
  Download,
  Filter,
  AlertTriangle,
  Flame,
  Search,
  MessageSquare,
  CreditCard,
  Target,
  FileText,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function AdminDashboard() {
  const { users } = useAuth();
  const { darkMode } = useTheme();
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [exporting, setExporting] = useState(null);

  // Real counts from database
  const realUsers = users.filter(u => u.role === 'user');
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const premiumUsers = users.filter(u => u.subscription === 'Premium' || u.subscription === 'Mentor' || u.subscription === 'Mentor+').length;

  // Top level KPIs - all based on real data
  const metrics = [
    { name: 'Tổng người dùng', value: realUsers.length, change: realUsers.length === 0 ? 'Chưa có người dùng' : `${realUsers.length} tài khoản đã đăng ký`, icon: Users, color: 'text-blue-500 bg-blue-500/10 dark:text-blue-400 dark:bg-blue-500/10' },
    { name: 'Học viên Active', value: activeUsers, change: activeUsers === 0 ? 'Chưa có hoạt động' : `${activeUsers} tài khoản đang hoạt động`, icon: Clock, color: 'text-purple-500 bg-purple-500/10 dark:text-purple-400 dark:bg-purple-500/10' },
    { name: 'Tài khoản Premium', value: premiumUsers, change: premiumUsers === 0 ? 'Chưa có nâng cấp' : `${premiumUsers} người đã nâng cấp`, icon: Percent, color: 'text-emerald-500 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10' },
    { name: 'Tổng tài khoản hệ thống', value: users.length, change: `${users.length} tài khoản (gồm admin, staff)`, icon: MessageSquare, color: 'text-amber-500 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/10' }
  ];

  // Chart 1: User Growth - starts empty for fresh website
  const trafficData = realUsers.length === 0
    ? [{ name: 'Hiện tại', 'Đăng ký mới': 0, 'Hoạt động': 0 }]
    : [
        { name: 'Khởi đầu', 'Đăng ký mới': 0, 'Hoạt động': 0 },
        { name: 'Hiện tại', 'Đăng ký mới': realUsers.length, 'Hoạt động': activeUsers }
      ];

  // Chart 2: Onboarding conversion funnel - based on real data
  const totalAll = users.length;
  const riskProfiled = users.filter(u => u.riskProfile).length;
  const premiumCount = premiumUsers;
  const funnelData = [
    { stage: '1. Tài khoản', 'Tỷ lệ %': totalAll > 0 ? 100 : 0 },
    { stage: '2. Active', 'Tỷ lệ %': totalAll > 0 ? Math.round((activeUsers / totalAll) * 100) : 0 },
    { stage: '3. Hồ sơ rủi ro', 'Tỷ lệ %': totalAll > 0 ? Math.round((riskProfiled / totalAll) * 100) : 0 },
    { stage: '4. Premium', 'Tỷ lệ %': totalAll > 0 ? Math.round((premiumCount / totalAll) * 100) : 0 }
  ];

  // Chart 3: Subscription breakdown from real data
  const freeCount = users.filter(u => u.subscription === 'Free').length;
  const premiumOnlyCount = users.filter(u => u.subscription === 'Premium').length;
  const mentorCount = users.filter(u => u.subscription === 'Mentor' || u.subscription === 'Mentor+').length;
  const personalityDistribution = [
    { name: `Free (${freeCount})`, value: freeCount || 1 },
    { name: `Premium (${premiumOnlyCount})`, value: premiumOnlyCount || 0 },
    { name: `Mentor (${mentorCount})`, value: mentorCount || 0 }
  ].filter(d => d.value > 0);

  const COLORS = ['#7C3AED', '#2563EB', '#06B6D4', '#F43F5E'];

  // Chart 4: Empty for fresh start
  const blockchainInterest = [
    { topic: 'Blockchain', views: 0 },
    { topic: 'Bảo mật ví', views: 0 },
    { topic: 'Scams', views: 0 },
    { topic: 'ETF', views: 0 }
  ];

  // No quiz analytics yet for fresh website
  const failedQuizzes = [];

  // No community reports yet for fresh website
  const reportedPosts = [];

  const handleExport = (type) => {
    setExporting(type);
    setTimeout(() => {
      setExporting(null);
      alert(`Báo cáo ${type.toUpperCase()} của hệ thống SAVE+ đã được tổng hợp thành công và sẵn sàng để tải về máy.`);
    }, 1100);
  };

  return (
    <div className="space-y-6 fade-in text-slate-800 dark:text-white font-sans pb-10">
      
      {/* 1. Header with Filters & Mock Download Buttons */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <h1 className="text-xl font-extrabold flex items-center space-x-2">
            <Shield size={24} className="text-purple-500 dark:text-purple-400" />
            <span>Master Admin Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hệ thống phân tích hành vi học tập, tỷ lệ chuyển đổi phễu và an toàn cộng đồng.</p>
        </div>

        {/* Action controllers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range switch */}
          <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1 rounded-xl">
            <button 
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${timeFilter === 'today' ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Hôm nay
            </button>
            <button 
              onClick={() => setTimeFilter('weekly')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${timeFilter === 'weekly' ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Tuần
            </button>
            <button 
              onClick={() => setTimeFilter('monthly')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${timeFilter === 'monthly' ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Tháng
            </button>
          </div>

          {/* Export buttons */}
          <button 
            disabled={exporting !== null}
            onClick={() => handleExport('csv')}
            className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download size={13} />
            <span>{exporting === 'csv' ? 'Exporting CSV...' : 'Xuất CSV'}</span>
          </button>

          <button 
            disabled={exporting !== null}
            onClick={() => handleExport('pdf')}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileText size={13} />
            <span>{exporting === 'pdf' ? 'Tạo PDF...' : 'Báo cáo PDF'}</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.name} className="glass-panel p-5 rounded-2xl shadow-xs flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">{m.name}</span>
                <h3 className="text-xl font-extrabold font-mono text-slate-800 dark:text-slate-100">{m.value}</h3>
                <span className="text-[10px] text-emerald-500 dark:text-emerald-450 font-bold block">{m.change}</span>
              </div>
              <div className={`p-3.5 rounded-xl shrink-0 ${m.color}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Recharts graphs row 1 (Growth & Funnel) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User signups area chart */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <TrendingUp size={16} className="text-blue-500 dark:text-blue-400" />
              <span>Biểu đồ tăng trưởng thành viên mới</span>
            </h3>
            <span className="text-[10px] text-slate-555 dark:text-slate-400 block">Số lượng học viên đăng ký mới song hành với lượng user online thường xuyên.</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#E2E8F0'} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? 'rgba(7, 11, 22, 0.95)' : '#FFF', 
                    borderRadius: '12px', 
                    border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', 
                    color: darkMode ? '#FFF' : '#1E293B', 
                    fontSize: '11px' 
                  }}
                />
                <Area type="monotone" dataKey="Đăng ký mới" name="Tài khoản mới" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorReg)" />
                <Area type="monotone" dataKey="Hoạt động" name="User Active" stroke="#7C3AED" strokeWidth={1.8} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Onboarding Funnel */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <BarChart3 size={16} className="text-purple-500 dark:text-purple-400" />
              <span>Phễu chuyển đổi & Giữ chân học viên</span>
            </h3>
            <span className="text-[10px] text-slate-555 dark:text-slate-400 block">Đo lường mức độ rơi rụng người học từ lúc đăng nhập đến nâng cấp Premium.</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 15, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#E2E8F0'} />
                <XAxis type="number" stroke="#94A3B8" fontSize={10} tickLine={false} domain={[0, 100]} />
                <YAxis dataKey="stage" type="category" stroke="#94A3B8" fontSize={10} tickLine={false} width={110} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? 'rgba(7, 11, 22, 0.95)' : '#FFF', 
                    borderRadius: '12px', 
                    border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', 
                    color: darkMode ? '#FFF' : '#1E293B', 
                    fontSize: '11px' 
                  }}
                />
                <Bar dataKey="Tỷ lệ %" fill="#7C3AED" radius={[0, 8, 8, 0]} barSize={18}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#F43F5E' : '#7C3AED'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. Recharts graphs row 2 (Personality + Topic Views) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Personality breakdown */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-205">Khẩu vị rủi ro & Tính cách tài chính</h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Dữ liệu phân mảnh từ khảo sát cá tính.</span>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={personalityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {personalityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `${val}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-[10.5px] border-t border-slate-200 dark:border-white/5 pt-3">
            {personalityDistribution.map((entry, index) => (
              <div key={entry.name} className="flex justify-between items-center">
                <span className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span>{entry.name.split(' ')[0]}</span>
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Blockchain topic views interest */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-205">Mức độ quan tâm chủ đề Blockchain</h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Lượt truy cập chuyên đề học tập.</span>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockchainInterest} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#E2E8F0'} />
                <XAxis dataKey="topic" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip />
                <Bar dataKey="views" fill="#2563EB" radius={[8, 8, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10.5px] border-t border-slate-200 dark:border-white/5 pt-3 text-slate-500 dark:text-slate-400 text-center font-bold">
            💡 Chủ đề "Bảo mật ví" được học viên xem nhiều nhất.
          </div>
        </div>

        {/* Behavioral Analytics */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-205">Tương tác hành vi</h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Mức độ hoạt động trên app.</span>
          </div>

          <div className="space-y-3.5 py-2 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-500 dark:text-slate-400">Thời gian học / ngày</span>
                <span className="text-blue-500 dark:text-blue-400">14.5 phút</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                <div className="bg-blue-500 h-full" style={{ width: '70%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-500 dark:text-slate-400">Học viên hỏi AI Mentor</span>
                <span className="text-purple-500 dark:text-purple-400">68% dùng thường xuyên</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                <div className="bg-purple-500 h-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-500 dark:text-slate-400">Duy trì chuỗi streak</span>
                <span className="text-emerald-500 dark:text-emerald-400">42% học viên giữ &gt;3 ngày</span>
              </div>
              <div className="w-full bg-slate-105 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                <div className="bg-emerald-500 h-full" style={{ width: '42%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl border border-blue-500/15 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 text-center font-bold">
            Curiosity Score: 85 điểm (Rất cao)
          </div>
        </div>

      </div>

      {/* 5. Lower warning lists row (Quiz Fail Warning Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quiz fail rate warnings */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-202 flex items-center space-x-1.5">
              <AlertOctagon size={16} className="text-rose-500" />
              <span>Cảnh Báo Độ Khó Nội Dung Học (Quiz Fail Tracker)</span>
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Các lớp học có tỷ lệ trả lời sai nhiều nhất, cần cập nhật bổ sung bài đọc hỗ trợ.</span>
          </div>

          <div className="space-y-3.5">
            {failedQuizzes.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                <AlertOctagon size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">Chưa có dữ liệu quiz</p>
                <p className="text-[10px] mt-1">Số liệu sẽ xuất hiện khi người dùng bắt đầu học.</p>
              </div>
            ) : failedQuizzes.map((quiz) => (
              <div key={quiz.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{quiz.category}</span>
                  <span className="text-rose-500 font-bold font-mono">{quiz.rate}% Trả lời sai ({quiz.count})</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-slate-105 dark:bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                    <div className="bg-rose-500 h-full" style={{ width: `${quiz.rate}%` }} />
                  </div>
                  <span className={`text-[9px] font-black shrink-0 uppercase tracking-widest ${
                    quiz.level === 'Cao' ? 'text-rose-500' : 'text-amber-500'
                  }`}>
                    Độ khó: {quiz.level}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {failedQuizzes.length > 0 && (
            <div className="p-3 bg-rose-500/5 dark:bg-rose-500/10 rounded-xl border border-rose-500/15 text-[10px] leading-relaxed text-slate-600 dark:text-slate-400">
              💡 <strong>AI Recommendation:</strong> Các chuyên đề có tỉ lệ sai cao cần bổ sung bài đọc hỗ trợ hoặc video minh họa.
            </div>
          )}
        </div>

        {/* Reported Community posts and scams */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-202 flex items-center space-x-1.5">
              <AlertTriangle size={16} className="text-brand-gold" />
              <span>Báo Cáo An Ninh Cộng Đồng & Vi Phạm Spams</span>
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Nơi người dùng báo cáo các bài viết dụ dỗ nạp tiền, cam kết sinh lời đa cấp.</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
            {reportedPosts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                <AlertTriangle size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">Chưa có báo cáo vi phạm</p>
                <p className="text-[10px] mt-1">Hệ thống sẽ hiển thị báo cáo khi có người dùng hoạt động.</p>
              </div>
            ) : reportedPosts.map((post) => (
              <div key={post.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{post.user}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">{post.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-light leading-normal">{post.issue}</p>
                </div>
                
                <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-bold border shrink-0 ${
                  post.action.includes('Ban') 
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                    : post.action.includes('Approve') 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {post.action}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button className="w-full py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer">
              <MessageSquare size={13} />
              <span>Xem chi tiết báo cáo vi phạm</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
