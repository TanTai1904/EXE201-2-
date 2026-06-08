import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Award, Sparkles, Lock, ArrowRight, HelpCircle, TrendingUp, Compass, HelpCircle as QuestionIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RechartsLearning() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const isVip = user?.subscription === 'Premium' || user?.subscription === 'Mentor+';

  // Allocator state
  const [allocations, setAllocations] = useState({ stock: 50, bond: 30, cash: 20 });
  const [monthlySaving, setMonthlySaving] = useState(2000000); // 2 million VND/month
  const [years, setYears] = useState(20); // 20 years projection

  const handleAllocChange = (key, val) => {
    const numericVal = parseInt(val) || 0;
    setAllocations(prev => {
      const next = { ...prev, [key]: numericVal };
      const total = next.stock + next.bond + next.cash;
      if (total === 0) return prev;
      
      // Normalize to sum up to 100%
      return {
        stock: Math.round((next.stock / total) * 100),
        bond: Math.round((next.bond / total) * 100),
        cash: Math.round((next.cash / total) * 100)
      };
    });
  };

  // Projected returns based on allocation: Stock: 12%, Bond: 7%, Cash: 5%
  const calculatePortfolioReturn = () => {
    return (
      (allocations.stock * 12 + allocations.bond * 7 + allocations.cash * 5) / 100
    ) / 100; // as decimal
  };

  const getProjectionData = () => {
    const data = [];
    const r = calculatePortfolioReturn();
    let currentBalance = 0;
    let totalInvested = 0;

    for (let year = 0; year <= years; year++) {
      if (year > 0) {
        // Compound interest calculated annually with monthly savings additions
        for (let month = 1; month <= 12; month++) {
          currentBalance = (currentBalance + monthlySaving) * (1 + r / 12);
          totalInvested += monthlySaving;
        }
      } else {
        currentBalance = monthlySaving * 12;
        totalInvested = monthlySaving * 12;
      }

      data.push({
        name: `Năm ${year}`,
        'Tổng tài sản tích lũy': Math.round(currentBalance),
        'Vốn gốc đã nạp': Math.round(totalInvested)
      });
    }
    return data;
  };

  const projectionData = getProjectionData();
  const estimatedReturnRate = (calculatePortfolioReturn() * 100).toFixed(1);

  const allocationData = [
    { name: 'Cổ phiếu (Stocks)', value: allocations.stock, color: '#3B82F6' },
    { name: 'Trái phiếu (Bonds)', value: allocations.bond, color: '#0EA5E9' },
    { name: 'Tiền mặt (Cash)', value: allocations.cash, color: '#10B981' }
  ];

  const handleConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  return (
    <div className="space-y-6 fade-in text-slate-800 dark:text-white font-sans min-h-[80vh]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/40">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <TrendingUp size={24} className="text-brand-teal" />
            <span>Sơ Đồ Học Trực Quan S+ (Recharts Interactive)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Sử dụng biểu đồ Recharts tương tác để hình dung trực quan phân bổ tài sản và sức mạnh lãi kép.</p>
        </div>
      </div>

      {!isVip ? (
        /* LOCK SCREEN FOR FREE USERS */
        <div className="glass-panel p-8 rounded-3xl border border-slate-250 dark:border-slate-800 text-center max-w-2xl mx-auto space-y-6 my-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-teal" />
          
          <div className="w-16 h-16 bg-brand-teal/10 dark:bg-brand-teal/20 text-brand-teal rounded-full flex items-center justify-center mx-auto border border-brand-teal/20 animate-pulse">
            <Lock size={28} />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Tính năng dành riêng cho thành viên VIP</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Bạn đang sử dụng tài khoản học viên thông thường. Đặc quyền học trực quan bằng sơ đồ Recharts, phân bổ tài sản và giả lập tăng trưởng 30 năm chỉ mở khóa trên bản **Premium** và **Mentor+**.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-900 text-left max-w-md mx-auto space-y-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Đặc quyền được mở khóa:</span>
            <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-400">
              <li className="flex items-center space-x-1.5">
                <span className="text-brand-teal text-[13px]">✔</span>
                <span>Biểu đồ tròn Recharts phân bổ danh mục tài sản 3 lớp</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="text-brand-teal text-[13px]">✔</span>
                <span>Biểu đồ đường Recharts mô phỏng lãi kép dồn tích 30 năm</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="text-brand-teal text-[13px]">✔</span>
                <span>Tìm hiểu tỷ lệ phân bổ tối ưu theo độ tuổi và hồ sơ rủi ro</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-brand-teal text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-95 transition-all uppercase tracking-wider inline-flex items-center space-x-2 cursor-pointer"
          >
            <span>Nâng cấp VIP ngay</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        /* VIP INTERACTIVE DASHBOARD */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls - Left side (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Asset Allocation Sliders */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-left">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Compass size={18} className="text-brand-teal" />
                  <span>Cấu hình phân bổ tỷ trọng</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Kéo các thanh trượt để thay đổi cơ cấu tài sản tích lũy của bạn.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-650 dark:text-slate-300">Cổ phiếu (Stocks - Kỳ vọng 12%/năm)</span>
                    <span className="text-blue-500 font-bold">{allocations.stock}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={allocations.stock}
                    onChange={(e) => handleAllocChange('stock', e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-650 dark:text-slate-300">Trái phiếu (Bonds - Kỳ vọng 7%/năm)</span>
                    <span className="text-sky-500 font-bold">{allocations.bond}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={allocations.bond}
                    onChange={(e) => handleAllocChange('bond', e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none accent-sky-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-650 dark:text-slate-300">Tiền mặt (Cash - Kỳ vọng 5%/năm)</span>
                    <span className="text-emerald-500 font-bold">{allocations.cash}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={allocations.cash}
                    onChange={(e) => handleAllocChange('cash', e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-brand-teal/5 border border-brand-teal/20 rounded-xl text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-350">
                💡 <strong>Lợi suất trung bình ước tính:</strong> <strong className="text-brand-teal">{estimatedReturnRate}%/năm</strong>. Danh mục có tỷ trọng cổ phiếu cao hơn sẽ mang lại lợi suất kỳ vọng lớn hơn nhưng đi kèm dao động thị trường mạnh hơn.
              </div>
            </div>

            {/* Savings Plan Sliders */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-left">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Award size={18} className="text-brand-teal" />
                  <span>Kế hoạch tích lũy định kỳ</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Đặt mức tiết kiệm tích lũy hàng tháng và số năm đầu tư.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-650 dark:text-slate-300">Số tiền nạp hàng tháng:</span>
                    <span className="text-brand-teal font-extrabold">{(monthlySaving / 1000000).toFixed(1)} triệu / tháng</span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="15000000"
                    step="500000"
                    value={monthlySaving}
                    onChange={(e) => setMonthlySaving(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none accent-brand-teal cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-650 dark:text-slate-300">Thời gian đầu tư:</span>
                    <span className="text-amber-500 font-extrabold">{years} năm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={years}
                    onChange={(e) => setYears(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={handleConfetti}
                className="w-full py-2 bg-brand-teal text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider hover:opacity-95 transition-all cursor-pointer"
              >
                🎉 Kích hoạt mục tiêu tích lũy
              </button>
            </div>

          </div>

          {/* Recharts Graphs - Right side (2/3) */}
          <div className="lg:col-span-2 space-y-6 text-left">
            
            {/* Visual allocation and Compound Interest Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Allocation Pie Chart Card (1/3 of row) */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between items-center text-center">
                <div className="w-full">
                  <h4 className="font-bold text-xs text-slate-850 dark:text-slate-200">Cơ Cấu Danh Mục</h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Tỷ lệ phân bổ tài sản hiện tại</span>
                </div>

                <div className="h-32 w-full flex items-center justify-center my-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={45}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full space-y-1.5 text-[10.5px]">
                  <div className="flex justify-between items-center px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-905 border border-slate-100 dark:border-slate-800">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-slate-500">Cổ phiếu:</span>
                    </span>
                    <strong className="text-slate-800 dark:text-white font-mono">{allocations.stock}%</strong>
                  </div>
                  <div className="flex justify-between items-center px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-905 border border-slate-100 dark:border-slate-800">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      <span className="text-slate-500">Trái phiếu:</span>
                    </span>
                    <strong className="text-slate-800 dark:text-white font-mono">{allocations.bond}%</strong>
                  </div>
                  <div className="flex justify-between items-center px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-905 border border-slate-100 dark:border-slate-800">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-500">Tiền mặt:</span>
                    </span>
                    <strong className="text-slate-800 dark:text-white font-mono">{allocations.cash}%</strong>
                  </div>
                </div>
              </div>

              {/* Compound Interest Simulator (2/3 of row) */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 md:col-span-2 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-850 dark:text-slate-200">Dự Phóng Sự Phát Triển Tài Sản (Lãi Kép)</h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Biểu đồ đường minh họa tổng tài sản dồn tích qua các năm.</span>
                </div>

                <div className="h-48 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#E2E8F0'} />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} tickFormatter={(v) => `${(v/1000000000).toFixed(1)}B`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: darkMode ? 'rgba(7, 11, 22, 0.95)' : '#FFF', 
                          borderRadius: '12px', 
                          border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', 
                          color: darkMode ? '#FFF' : '#1E293B', 
                          fontSize: '10.5px' 
                        }}
                        formatter={(val) => [`${parseFloat(val).toLocaleString()} ₫`]}
                      />
                      <Legend verticalAlign="top" height={25} iconSize={10} style={{ fontSize: '10.5px' }} />
                      <Line type="monotone" dataKey="Tổng tài sản tích lũy" stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="Vốn gốc đã nạp" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-[10px] text-slate-400 text-center pt-2">
                  (Đơn vị trục dọc: B - Tỷ VNĐ. Tài sản tăng trưởng nhanh hơn về cuối thời kỳ là biểu hiện rõ nét của **Lãi Kép**).
                </div>
              </div>

            </div>

            {/* Educational takeaway panel */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h4 className="font-extrabold text-xs text-slate-850 dark:text-slate-200 flex items-center space-x-1">
                  <QuestionIcon size={14} className="text-brand-teal" />
                  <span>💡 Bài học thực hành phân bổ tài sản</span>
                </h4>
                <p className="text-[10.5px] text-slate-400 mt-0.5">Hiểu rõ tại sao phân bổ tài sản quyết định 90% hiệu quả danh mục đầu tư.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed">
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="font-bold text-slate-800 dark:text-white block mb-0.5">1. Tại sao không nạp 100% vào Cổ phiếu?</span>
                  <p className="text-slate-500 dark:text-slate-400">
                    Mặc dù cổ phiếu mang lại lợi nhuận cao nhất dài hạn (~12%), nhưng thị trường chứng khoán có thể sụt giảm tới 30-40% trong các chu kỳ suy thoái. Việc phân bổ một phần vào trái phiếu và tiền mặt đóng vai trò làm đệm đỡ giảm sốc và bảo đảm tính thanh khoản cho bạn khi cần rút tiền gấp.
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="font-bold text-slate-800 dark:text-white block mb-0.5">2. Tầm quan trọng của kỷ luật thời gian</span>
                  <p className="text-slate-500 dark:text-slate-400">
                    Khi nhìn vào sơ đồ lãi kép phía trên, bạn sẽ nhận ra tài sản tích lũy tăng rất chậm trong 5-10 năm đầu. Nhưng từ năm thứ 15 trở đi, lượng lãi chồng lãi bắt đầu bùng nổ, kéo tổng tài sản vượt trội xa so với tổng số tiền vốn bạn đã nạp vào. Đầu tư sớm và đều đặn là bí mật lớn nhất!
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
