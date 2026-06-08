import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  TrendingUp,
  BarChart2,
  Target,
  MessageSquare,
  Users,
  Bell,
  User,
  LayoutDashboard,
  Compass,
  Award,
  Settings,
  Shield,
  LogOut,
  HelpCircle,
  FolderLock,
  Globe,
  Sparkles,
  CreditCard
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout, paymentRequests } = useAuth();
  const navigate = useNavigate();
  const pendingCount = (paymentRequests || []).filter(r => r.status === 'Pending').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav item list for standard learner role
  const userNavItems = [
    { name: 'Bảng Điều Khiển', path: '/', icon: LayoutDashboard },
    { name: 'Khóa Học Của Tôi', path: '/learning', icon: BookOpen },
    { name: 'Sơ Đồ Recharts', path: '/recharts-learning', icon: BarChart2 },
    { name: 'Giả Lập Đầu Tư', path: '/simulation', icon: TrendingUp },
    { name: 'Kế Hoạch & Mục Tiêu', path: '/goals', icon: Target },
    { name: 'Người Bạn AI Mentor', path: '/mentor', icon: Compass },
    { name: 'Cộng Đồng Tự Học', path: '/community', icon: MessageSquare },
    { name: 'Hồ Sơ Cá Nhân', path: '/profile', icon: User }
  ];

  // Nav item list for administrative role
  const adminNavItems = [
    { name: 'Tổng Quan Admin', path: '/admin', icon: Shield },
    { name: 'Quản Lý Người Dùng', path: '/admin/users', icon: Users },
    { name: 'Quản Lý Khóa Học', path: '/admin/courses', icon: BookOpen },
    { name: 'Phân Tích Học Tập', path: '/admin/analytics', icon: BarChart2 },
    { name: 'Duyệt Nâng Cấp Gói', path: '/admin/subscription-approvals', icon: CreditCard, badge: pendingCount },
    { name: 'Gói Hội Viên & Cài Đặt', path: '/admin/subscriptions', icon: Settings }
  ];

  const staffNavItems = [
    { name: 'Tổng Quan Admin', path: '/admin', icon: Shield },
    { name: 'Quản Lý Người Dùng', path: '/admin/users', icon: Users },
    { name: 'Duyệt Hồ Sơ (KYC)', path: '/admin/approvals', icon: Compass },
    { name: 'Duyệt Nâng Cấp Gói', path: '/admin/subscription-approvals', icon: CreditCard, badge: pendingCount }
  ];

  let currentItems = userNavItems;
  if (user?.role === 'admin') currentItems = adminNavItems;
  if (user?.role === 'staff') currentItems = staffNavItems;

  return (
    <aside className="w-64 h-[calc(100vh-65px)] sticky top-[65px] bg-white dark:bg-slate-905 border-r border-slate-200 dark:border-slate-800/80 p-4 flex flex-col justify-between hidden md:flex shrink-0">
      {/* Menu links list */}
      <div className="space-y-1">
        <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider px-3 mb-2.5">
          {user?.role === 'admin' || user?.role === 'staff' ? 'Bảng Quản Trị' : 'Danh mục chính'}
        </span>
        {currentItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-50 dark:bg-slate-900/60 text-brand-teal font-semibold border-l-4 border-brand-teal pl-2'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50/80 dark:hover:bg-slate-900/30 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              <span className="flex-1">{item.name}</span>
              {item.badge > 0 && (
                <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer in sidebar */}
      <div className="pt-4 border-t border-slate-200/60 dark:border-slate-850 space-y-2">
        {(user?.role !== 'admin' && user?.role !== 'staff') && (
          user?.subscription === 'Premium' || user?.subscription === 'Mentor+' ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800 text-left space-y-2.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                  Hội Viên VIP {user.subscription}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                Đặc quyền AI Mentor không giới hạn đã hoạt động.
              </p>
              <button 
                onClick={() => navigate('/profile')}
                className="w-full py-2 text-[10px] font-bold text-white bg-brand-teal hover:bg-brand-teal/95 rounded-lg shadow-xs transition-all uppercase tracking-wider cursor-pointer"
              >
                Tiện ích VIP
              </button>
            </div>
          ) : user?.subscription === 'Mentor' ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800 text-left space-y-2.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                  Gói Hội Viên Mentor
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                AI Mentor: 20 câu/ngày. Nâng Premium/Mentor+ để hỏi không giới hạn!
              </p>
              <button 
                onClick={() => navigate('/profile')}
                className="w-full py-2 text-[10px] font-bold text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-805 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs transition-all uppercase tracking-wider cursor-pointer"
              >
                Xem đặc quyền
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800 text-left space-y-2.5">
              <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Tài khoản Standard</span>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">AI Mentor giới hạn 20 câu/ngày. Nâng gói để không giới hạn câu hỏi!</p>
              <button 
                onClick={() => navigate('/profile')}
                className="w-full py-2 text-[10px] font-bold text-white bg-brand-teal hover:bg-brand-teal/95 rounded-lg shadow-xs transition-all uppercase cursor-pointer"
              >
                Nâng cấp ngay
              </button>
            </div>
          )
        )}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-xs text-red-500 hover:bg-red-500/10 transition-all text-left"
        >
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
