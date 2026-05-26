import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Mock initial admin users list for dashboard data
const INITIAL_ADMIN_USERS = [
  { id: 'U001', name: 'Trần Minh Quân', email: 'quan.tran@gmail.com', role: 'user', learningProgress: 85, riskProfile: 'Aggressive', subscription: 'Premium', status: 'Active' },
  { id: 'U002', name: 'Lê Thị Mai', email: 'mai.le@yahoo.com', role: 'user', learningProgress: 45, riskProfile: 'Balanced', subscription: 'Free', status: 'Active' },
  { id: 'U003', name: 'Phạm Đức Nam', email: 'nam.pd@hotmail.com', role: 'user', learningProgress: 95, riskProfile: 'Conservative', subscription: 'Mentor+', status: 'Active' },
  { id: 'U004', name: 'Nguyễn Bích Vy', email: 'vy.nguyen@gmail.com', role: 'user', learningProgress: 10, riskProfile: null, subscription: 'Free', status: 'Blocked' },
  { id: 'U005', name: 'Hoàng Anh Tuấn', email: 'tuan.ha@tcbs.vn', role: 'user', learningProgress: 60, riskProfile: 'Balanced', subscription: 'Premium', status: 'Active' }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('saveplus_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('saveplus_users_list');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_USERS;
  });

  const [riskProfile, setRiskProfile] = useState(() => {
    return localStorage.getItem('saveplus_risk_profile') || null;
  });

  const [onboardingAnswers, setOnboardingAnswers] = useState(() => {
    const saved = localStorage.getItem('saveplus_onboarding_answers');
    return saved ? JSON.parse(saved) : null;
  });

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('saveplus_balance');
    return saved ? parseFloat(saved) : 100000000; // 100M VND starting cash
  });

  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('saveplus_portfolio');
    return saved ? JSON.parse(saved) : []; // e.g. [{ symbol: 'FPT', shares: 10, buyPrice: 135000 }, ...]
  });

  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('saveplus_watchlist');
    return saved ? JSON.parse(saved) : ['FPT', 'VCB', 'TSLA', 'AAPL'];
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('saveplus_goals');
    return saved ? JSON.parse(saved) : [
      { id: 'G01', name: 'Quỹ Dự Phòng Khẩn Cấp (Emergency)', target: 20000000, current: 8000000, category: 'Emergency fund', monthlyContribution: 1000000 },
      { id: 'G02', name: 'Mua Xe Máy Mới (Motorbike)', target: 45000000, current: 15000000, category: 'Buy motorbike', monthlyContribution: 2000000 }
    ];
  });

  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('saveplus_xp');
    return saved ? parseInt(saved) : 150; // Starter XP
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('saveplus_streak');
    return saved ? parseInt(saved) : 3; // 3-day active streak
  });

  const [notifications, setNotifications] = useState([
    { id: 'N1', title: 'Bài học mới cho bạn!', message: 'Khóa học "Đầu tư quỹ ETF tối ưu" được gợi ý dựa trên hồ sơ rủi ro của bạn.', read: false, time: '10 phút trước' },
    { id: 'N2', title: 'Thử thách hàng ngày', message: 'Duy trì chuỗi học tập 3 ngày của bạn! Nhấn học ngay hôm nay.', read: false, time: '2 giờ trước' },
    { id: 'N3', title: 'Cảnh báo thị trường từ AI', message: 'VNINDEX có xu hướng dao động nhẹ. Hãy giữ tâm lý đầu tư dài hạn.', read: true, time: '1 ngày trước' }
  ]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('saveplus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('saveplus_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('saveplus_users_list', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('saveplus_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('saveplus_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('saveplus_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('saveplus_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('saveplus_streak', streak.toString());
  }, [streak]);

  const login = (email, password) => {
    // Automatically assign roles based on email
    let assignedRole = 'user';
    let userName = 'Nguyễn Hoàng Lâm';

    if (email === 'admin1@gmail.com') {
      assignedRole = 'admin';
      userName = 'Admin Quản Trị';
    } else if (email === 'staff1@gmail.com') {
      assignedRole = 'staff';
      userName = 'Nhân viên Duyệt';
    }
    
    const mockUser = {
      id: assignedRole === 'admin' ? 'A001' : assignedRole === 'staff' ? 'S001' : 'U001',
      name: userName,
      email: email,
      role: assignedRole,
      avatar: assignedRole === 'admin' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    };
    setUser(mockUser);
    return assignedRole;
  };

  const logout = () => {
    setUser(null);
  };

  const register = (name, email, password, idNumber) => {
    const mockUser = {
      id: 'U' + Math.floor(Math.random() * 1000),
      name,
      email,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    };
    setUser(mockUser);
    // Add to admin list
    const newRecord = {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: 'user',
      learningProgress: 0,
      riskProfile: null,
      subscription: 'Free',
      status: 'Pending KYC',
      idNumber: idNumber || null
    };
    setUsers(prev => [newRecord, ...prev]);
    return true;
  };

  const saveOnboarding = (answers) => {
    setOnboardingAnswers(answers);
    localStorage.setItem('saveplus_onboarding_answers', JSON.stringify(answers));
    
    // Compute Risk Profile: conservative, balanced, aggressive
    let profile = 'Balanced';
    if (answers.riskTolerance === 'Conservative' || answers.experience === 'Chưa có kinh nghiệm') {
      profile = 'Conservative';
    } else if (answers.riskTolerance === 'Aggressive' && answers.knowledge === 'Nâng cao') {
      profile = 'Aggressive';
    }
    setRiskProfile(profile);
    localStorage.setItem('saveplus_risk_profile', profile);

    // Update in users table if logged in
    if (user) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, riskProfile: profile } : u));
    }
  };

  const updateBalance = (amount) => {
    setBalance(amount);
    localStorage.setItem('saveplus_balance', amount.toString());
  };

  const toggleWatchlist = (symbol) => {
    setWatchlist(prev => {
      if (prev.includes(symbol)) {
        return prev.filter(s => s !== symbol);
      } else {
        return [...prev, symbol];
      }
    });
  };

  const addGoal = (goal) => {
    const newGoal = {
      id: 'G' + Math.floor(Math.random() * 1000),
      ...goal,
      current: 0
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const contributeToGoal = (id, amount) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextVal = Math.min(g.target, g.current + parseFloat(amount));
        return { ...g, current: nextVal };
      }
      return g;
    }));
    setBalance(prev => prev - parseFloat(amount));
  };

  const addXP = (amount) => {
    setXp(prev => prev + amount);
  };

  const triggerStreak = () => {
    setStreak(prev => prev + 1);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const blockUser = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u));
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const verifyUser = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, subscription: u.subscription === 'Free' ? 'Premium' : 'Mentor+' } : u));
  };

  const approveKYC = (id, isApproved) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: isApproved ? 'Active' : 'Rejected KYC' } : u));
  };

  return (
    <AuthContext.Provider value={{
      user,
      users,
      login,
      logout,
      register,
      riskProfile,
      onboardingAnswers,
      saveOnboarding,
      balance,
      updateBalance,
      portfolio,
      setPortfolio,
      watchlist,
      toggleWatchlist,
      goals,
      addGoal,
      contributeToGoal,
      xp,
      addXP,
      streak,
      triggerStreak,
      notifications,
      markNotificationRead,
      blockUser,
      deleteUser,
      verifyUser,
      approveKYC
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
