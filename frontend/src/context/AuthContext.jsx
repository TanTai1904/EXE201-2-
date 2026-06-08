import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('saveplus_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState([]);
  const [riskProfile, setRiskProfile] = useState(null);
  const [onboardingAnswers, setOnboardingAnswers] = useState(null);
  const [balance, setBalance] = useState(100000000);
  const [portfolio, setPortfolioState] = useState([]);
  const [watchlist, setWatchlist] = useState(['FPT', 'VCB', 'TSLA', 'AAPL']);
  const [goals, setGoals] = useState([]);
  const [xp, setXp] = useState(150);
  const [streak, setStreak] = useState(3);
  const [notifications, setNotifications] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state with backend once token is present
  const loadUserData = async () => {
    const token = localStorage.getItem('saveplus_token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
      setRiskProfile(data.user.riskProfile);
      setOnboardingAnswers(data.user.onboardingAnswers);
      setBalance(data.user.balance);
      setXp(data.user.xp);
      setStreak(data.user.streak);
      setWatchlist(data.watchlist || []);
      setPortfolioState(data.portfolio || []);
      setGoals(data.goals || []);
      setNotifications(data.notifications || []);
      
      // Load payment requests
      const payments = await api.get('/payments/requests');
      setPaymentRequests(payments);

      // If user is Admin or Staff, load all users
      if (data.user.role === 'admin' || data.user.role === 'staff') {
        const allUsers = await api.get('/admin/users');
        setUsers(allUsers);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Clear invalid token if loading fails
      localStorage.removeItem('saveplus_token');
      localStorage.removeItem('saveplus_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('saveplus_token', data.token);
      localStorage.setItem('saveplus_user', JSON.stringify(data.user));
      setUser(data.user);
      await loadUserData();
      return data.user.role;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('saveplus_token');
    localStorage.removeItem('saveplus_user');
    setUser(null);
    setUsers([]);
    setRiskProfile(null);
    setOnboardingAnswers(null);
    setBalance(100000000);
    setPortfolioState([]);
    setWatchlist(['FPT', 'VCB', 'TSLA', 'AAPL']);
    setGoals([]);
    setXp(150);
    setStreak(3);
    setNotifications([]);
    setPaymentRequests([]);
  };

  const register = async (name, email, password, idNumber, dob, gender, address, idIssueDate) => {
    try {
      const data = await api.post('/auth/register', { name, email, password, idNumber, dob, gender, address, idIssueDate });
      localStorage.setItem('saveplus_token', data.token);
      localStorage.setItem('saveplus_user', JSON.stringify(data.user));
      setUser(data.user);
      await loadUserData();
      return true;
    } catch (error) {
      throw error;
    }
  };

  const saveOnboarding = async (answers) => {
    try {
      const data = await api.post('/users/onboarding', { answers });
      setRiskProfile(data.riskProfile);
      setOnboardingAnswers(data.onboardingAnswers);
      if (user) {
        setUser(prev => ({ ...prev, riskProfile: data.riskProfile }));
      }
    } catch (error) {
      console.error('Failed to save onboarding:', error);
    }
  };

  const updateBalance = async (amount) => {
    try {
      const data = await api.put('/financials/balance', { amount });
      setBalance(data.balance);
    } catch (error) {
      console.error('Failed to update balance:', error);
    }
  };

  const toggleWatchlist = async (symbol) => {
    try {
      const data = await api.post('/financials/watchlist', { symbol });
      setWatchlist(data.watchlist);
    } catch (error) {
      console.error('Failed to toggle watchlist:', error);
    }
  };

  // Intercept state setter to auto-sync portfolio
  const setPortfolio = async (newPortfolio) => {
    try {
      const resolved = typeof newPortfolio === 'function' ? newPortfolio(portfolio) : newPortfolio;
      setPortfolioState(resolved);
      await api.put('/financials/portfolio', { portfolio: resolved });
    } catch (error) {
      console.error('Failed to sync portfolio:', error);
    }
  };

  const addGoal = async (goal) => {
    try {
      const newGoal = await api.post('/goals', goal);
      setGoals(prev => [...prev, newGoal]);
    } catch (error) {
      console.error('Failed to add goal:', error);
    }
  };

  const contributeToGoal = async (id, amount) => {
    try {
      const data = await api.post(`/goals/${id}/contribute`, { amount });
      setGoals(prev => prev.map(g => g.id === id ? data.goal : g));
      setBalance(data.balance);
    } catch (error) {
      console.error('Failed to contribute to goal:', error);
    }
  };

  const addXP = async (amount) => {
    try {
      const data = await api.post('/users/xp', { amount });
      setXp(data.xp);
    } catch (error) {
      console.error('Failed to add XP:', error);
    }
  };

  const triggerStreak = async () => {
    try {
      const data = await api.post('/users/streak');
      setStreak(data.streak);
    } catch (error) {
      console.error('Failed to trigger streak:', error);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  // --- ADMIN ACTIONS ---
  const blockUser = async (id) => {
    try {
      const data = await api.put(`/admin/users/${id}/block`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: data.status } : u));
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const verifyUser = async (id) => {
    try {
      const data = await api.put(`/admin/users/${id}/verify`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, subscription: data.subscription } : u));
    } catch (error) {
      console.error('Failed to verify user:', error);
    }
  };

  const approveKYC = async (id, isApproved) => {
    try {
      const data = await api.put(`/admin/users/${id}/kyc`, { isApproved });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: data.status } : u));
    } catch (error) {
      console.error('Failed to approve KYC:', error);
    }
  };

  const submitUpgradeRequest = async (tierName, paymentCode, amount) => {
    try {
      const cleanAmount = parseFloat(String(amount).replace(/[^0-9.-]+/g, ''));
      const newRequest = await api.post('/payments/requests', {
        targetTier: tierName,
        paymentCode,
        amount: cleanAmount
      });
      setPaymentRequests(prev => [newRequest, ...prev]);
      
      // Reload notifications
      const notifs = await api.get('/notifications');
      setNotifications(notifs);
      return newRequest.id;
    } catch (error) {
      console.error('Failed to submit upgrade request:', error);
    }
  };

  const approveUpgradeRequest = async (requestId) => {
    try {
      const approved = await api.put(`/payments/requests/${requestId}/approve`);
      setPaymentRequests(prev => prev.map(r => r.id === requestId ? approved : r));
      
      // Refresh current user and users list
      await loadUserData();
    } catch (error) {
      console.error('Failed to approve upgrade request:', error);
    }
  };

  const rejectUpgradeRequest = async (requestId, reason = '') => {
    try {
      const rejected = await api.put(`/payments/requests/${requestId}/reject`, { reason });
      setPaymentRequests(prev => prev.map(r => r.id === requestId ? rejected : r));
      
      // Refresh notifications
      const notifs = await api.get('/notifications');
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to reject upgrade request:', error);
    }
  };

  const upgradeSubscription = async (tierName) => {
    try {
      const data = await api.put(`/admin/users/${user?.id}/verify`);
      setUser(prev => ({ ...prev, subscription: data.subscription }));
    } catch (error) {
      // Direct update for simple frontend testing fallback
      setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, subscription: tierName };
        localStorage.setItem('saveplus_user', JSON.stringify(updated));
        return updated;
      });
    }
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
      paymentRequests,
      submitUpgradeRequest,
      approveUpgradeRequest,
      rejectUpgradeRequest,
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
      approveKYC,
      upgradeSubscription,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

