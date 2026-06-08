import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Bell, LogOut, Flame, ShieldAlert, Award, CreditCard, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout, login, xp, streak, balance, notifications, markNotificationRead } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Simulated live stock ticker data
  const [indices, setIndices] = useState([
    { name: 'VN-INDEX', value: 1284.52, change: 12.45, pct: 0.98, up: true },
    { name: 'VN30', value: 1312.40, change: 15.10, pct: 1.16, up: true },
    { name: 'HNX-INDEX', value: 242.15, change: -0.82, pct: -0.34, up: false },
    { name: 'FUEVFVND', value: 31250, change: 350, pct: 1.13, up: true }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => prev.map(idx => {
        const factor = (Math.random() - 0.48); // Slight positive bias
        const changeAmt = idx.value * 0.0004 * factor;
        const newValue = idx.value + changeAmt;
        const originalValue = idx.name === 'FUEVFVND' ? 30900 : (idx.name === 'VN-INDEX' ? 1272.07 : (idx.name === 'VN30' ? 1297.30 : 242.97));
        const totalChange = newValue - originalValue;
        const totalPct = (totalChange / originalValue) * 100;
        return {
          ...idx,
          value: newValue,
          change: totalChange,
          pct: totalPct,
          up: totalChange >= 0
        };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleToggleNotif = () => setShowNotif(!showNotif);
  
  const handleRead = (id) => {
    markNotificationRead(id);
  };

  const formattedBalance = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(balance);

  const handleRoleSwitch = () => {
    if (user?.role === 'admin') {
      logout();
      navigate('/login');
    } else {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-slate-800/80 px-6 py-3.5 flex items-center justify-between shadow-xs bg-white dark:bg-slate-905">
      {/* Brand Logo */}
      <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/')}>
        <div className="w-9 h-9 rounded-lg bg-brand-teal flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
          S+
        </div>
        <div className="hidden sm:block leading-none text-left">
          <span className="font-extrabold text-lg tracking-wider text-slate-900 dark:text-white">SAVE+</span>
          <span className="block text-[8px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-0.5">Kiến Thức Là Tài Sản</span>
        </div>
      </div>

      {/* Removed Stock Ticker as requested */}

      {/* Action center indicators */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {user?.role !== 'admin' && (
          <>
            {/* Streak Counter */}
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-200/50 transition-all cursor-pointer" title="Chuỗi học tập hàng ngày">
              <Flame size={15} className="fill-amber-500 text-amber-500" />
              <span className="font-bold text-xs">{streak} ngày</span>
            </div>

            {/* XP Points */}
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-200/50 transition-all" title="Điểm kinh nghiệm học tập">
              <Award size={15} className="text-brand-teal" />
              <span className="font-bold text-xs">{xp} XP</span>
            </div>

            {/* Virtual Balance */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300" title="Số dư tài khoản thử nghiệm">
              <CreditCard size={15} className="text-brand-green" />
              <span className="font-bold text-xs font-mono">{formattedBalance}</span>
            </div>
          </>
        )}


        {/* Dark/Light mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={handleToggleNotif}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors relative"
          >
            <Bell size={18} />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {unreadNotifs}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 glass-panel border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden text-sm">
              <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/40 bg-slate-100/50 dark:bg-slate-800/50 flex justify-between items-center">
                <span className="font-bold">Thông báo mới ({unreadNotifs})</span>
                {unreadNotifs > 0 && <span className="text-xs text-brand-teal font-medium">Bấm để đọc</span>}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/30">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">Không có thông báo mới</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleRead(n.id)}
                      className={`p-3 transition-colors cursor-pointer ${n.read ? 'opacity-65 hover:bg-slate-50 dark:hover:bg-slate-800/20' : 'bg-teal-500/5 dark:bg-teal-500/5 hover:bg-teal-500/10 dark:hover:bg-teal-500/10'}`}
                    >
                      <div className="flex justify-between items-start mb-0.5">
                        <span className={`font-semibold ${n.read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>{n.title}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-1.5 focus:outline-none"
            >
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-teal/20"
              />
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 glass-panel border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden text-sm">
                <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/40">
                  <span className="block font-bold text-slate-800 dark:text-white truncate">{user.name}</span>
                  <span className="block text-xs text-slate-400 truncate">{user.email}</span>
                </div>
                <div className="py-1">
                  <button 
                    onClick={() => { setShowProfileDropdown(false); navigate(user.role === 'admin' ? '/admin' : '/profile'); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Thông tin tài khoản
                  </button>
                  <button 
                    onClick={() => { setShowProfileDropdown(false); logout(); navigate('/login'); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/30 text-red-500 flex items-center space-x-2 transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand-teal to-brand-green text-white text-xs font-bold shadow-md shadow-teal-500/20 hover:opacity-90 transition-all"
          >
            Đăng nhập
          </button>
        )}
      </div>
    </header>
  );
}


