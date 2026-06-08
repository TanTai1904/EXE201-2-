import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle, XCircle, Clock, CreditCard, User, Crown,
  Sparkles, Filter, Search, RefreshCw, TrendingUp, AlertCircle, Check, X
} from 'lucide-react';

const STATUS_CONFIG = {
  Pending:  { label: 'Chờ Duyệt',  cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30',  dot: 'bg-amber-500 dark:bg-amber-400' },
  Approved: { label: 'Đã Duyệt',   cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20 dark:border-emerald-500/30', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  Rejected: { label: 'Từ Chối',    cls: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30',     dot: 'bg-rose-500 dark:bg-rose-400' },
};

const TIER_CONFIG = {
  Premium:  { color: 'from-brand-teal to-emerald-500', bg: 'bg-teal-500/10 text-brand-teal border-brand-teal/20', icon: <Sparkles size={13} className="text-brand-teal" />, price: '99,000đ / tháng' },
  'Mentor+': { color: 'from-amber-500 to-orange-500',  bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20', icon: <Crown size={13} className="text-amber-600 dark:text-amber-500" />,    price: '199,000đ / tháng' },
};

function fmt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function SubscriptionApprovals() {
  const { paymentRequests, approveUpgradeRequest, rejectUpgradeRequest } = useAuth();
  const [filter, setFilter]           = useState('Pending');
  const [search, setSearch]           = useState('');
  const [rejectModal, setRejectModal] = useState(null); // { requestId }
  const [rejectReason, setRejectReason] = useState('');
  const [confirmApprove, setConfirmApprove] = useState(null); // requestId

  const filtered = paymentRequests.filter(r => {
    const matchStatus = filter === 'All' || r.status === filter;
    const matchSearch = !search || r.userEmail?.toLowerCase().includes(search.toLowerCase()) || r.userName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    Pending:  paymentRequests.filter(r => r.status === 'Pending').length,
    Approved: paymentRequests.filter(r => r.status === 'Approved').length,
    Rejected: paymentRequests.filter(r => r.status === 'Rejected').length,
  };

  const handleApprove = () => {
    if (!confirmApprove) return;
    approveUpgradeRequest(confirmApprove);
    setConfirmApprove(null);
  };

  const handleReject = () => {
    if (!rejectModal) return;
    rejectUpgradeRequest(rejectModal, rejectReason.trim());
    setRejectModal(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6 fade-in text-slate-800 dark:text-white">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
            <CreditCard size={22} className="text-brand-teal" />
            <span>Duyệt Yêu Cầu Nâng Cấp Gói</span>
          </h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">
            Xem xét và phê duyệt các giao dịch nâng cấp tài khoản VIP Premium hoặc Mentor+ từ người dùng.
          </p>
        </div>
        {/* Summary stats */}
        <div className="flex space-x-3">
          {[['Pending', 'Chờ duyệt', 'text-amber-500'], ['Approved', 'Đã duyệt', 'text-emerald-500'], ['Rejected', 'Từ chối', 'text-rose-500']].map(([k, l, c]) => (
            <div key={k} className="text-center px-4 py-2 bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl min-w-[85px] shadow-sm">
              <p className={`text-lg font-black ${c}`}>{counts[k]}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-100/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
        
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {['Pending', 'Approved', 'Rejected', 'All'].map(s => {
            const cfg = STATUS_CONFIG[s] || { label: 'Tất cả', cls: 'bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700', dot: 'bg-slate-500 dark:bg-slate-400' };
            const active = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 text-[11px] font-bold rounded-xl border transition-all flex items-center space-x-1.5 cursor-pointer ${
                  active
                    ? cfg.cls + ' ring-2 ring-brand-teal/20 dark:ring-white/5 font-black'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {s !== 'All' && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                <span>{s === 'All' ? 'Tất cả' : cfg.label}</span>
                {s !== 'All' && <span className="ml-1 opacity-60">({counts[s] || 0})</span>}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Tìm theo email hoặc tên học viên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-brand-teal text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors"
          />
        </div>
      </div>

      {/* Requests Data Table */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-900/30 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Học viên / Email</th>
                <th className="p-4">Gói nâng cấp</th>
                <th className="p-4 font-mono text-center">Mã giao dịch</th>
                <th className="p-4">Ngày yêu cầu</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw size={28} className="opacity-40 animate-spin-slow" />
                      <p className="font-bold text-slate-500">Không tìm thấy yêu cầu nào</p>
                      <p className="text-[10px] opacity-75">Các yêu cầu mới từ người dùng sẽ hiển thị trực tiếp tại đây.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(req => {
                  const tier = TIER_CONFIG[req.targetTier] || TIER_CONFIG['Premium'];
                  const sc = STATUS_CONFIG[req.status] || STATUS_CONFIG['Pending'];

                  return (
                    <tr key={req.id} className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10 transition-colors">
                      {/* User Info */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <User size={15} className="text-slate-400 dark:text-slate-500" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-800 dark:text-slate-200">{req.userName || 'Học viên'}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">{req.userEmail}</span>
                          </div>
                        </div>
                      </td>

                      {/* Upgrade package */}
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center w-fit space-x-1 ${tier.bg}`}>
                          {tier.icon}
                          <span>{req.targetTier}</span>
                        </span>
                      </td>

                      {/* Payment transaction code */}
                      <td className="p-4 text-center">
                        <span className="text-[11px] font-mono font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/50">
                          {req.paymentCode || '—'}
                        </span>
                      </td>

                      {/* Timestamps */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="block text-slate-700 dark:text-slate-300">{fmt(req.createdAt)}</span>
                          {req.resolvedAt && (
                            <span className="block text-[9px] text-slate-400 italic">
                              {req.status === 'Approved' ? 'Duyệt lúc: ' : 'Từ chối lúc: '} {fmt(req.resolvedAt)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center w-fit space-x-1 ${sc.cls}`}>
                          <span className={`w-1 h-1 rounded-full ${sc.dot} ${req.status === 'Pending' ? 'animate-pulse' : ''}`} />
                          <span>{sc.label}</span>
                        </span>
                        {req.status === 'Rejected' && req.note && (
                          <div className="mt-1 flex items-start space-x-1 max-w-[150px]">
                            <AlertCircle size={10} className="text-rose-450 mt-0.5 shrink-0" />
                            <span className="text-[9px] text-rose-500 dark:text-rose-350 leading-tight block truncate" title={req.note}>
                              {req.note}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        {req.status === 'Pending' ? (
                          <div className="flex justify-end space-x-1.5">
                            <button
                              onClick={() => setRejectModal(req.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer border border-rose-500/15"
                              title="Từ chối yêu cầu"
                            >
                              <X size={13} />
                            </button>
                            <button
                              onClick={() => setConfirmApprove(req.id)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors cursor-pointer border border-emerald-500/15"
                              title="Chấp nhận thanh toán"
                            >
                              <Check size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Approve Modal */}
      {confirmApprove && (() => {
        const req = paymentRequests.find(r => r.id === confirmApprove);
        if (!req) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center space-y-5 text-slate-800 dark:text-white relative">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/15">
                <CheckCircle size={28} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Xác nhận Duyệt</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 mt-2 leading-relaxed">
                  Bạn sắp phê duyệt nâng cấp gói tài khoản cho <strong className="text-slate-800 dark:text-white font-black">{req.userEmail}</strong> lên gói{' '}
                  <strong className="text-emerald-500 font-black">{req.targetTier}</strong>.
                  Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmApprove(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer border border-slate-250 dark:border-slate-700/50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Xác nhận Duyệt ✓
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-5 text-slate-800 dark:text-white relative">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/15">
                <XCircle size={22} className="text-rose-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Từ chối yêu cầu</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Nhập lý do để thông báo cho người dùng</p>
              </div>
            </div>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Mã giao dịch không hợp lệ, không tìm thấy lịch sử giao dịch tương ứng..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-650"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer border border-slate-250 dark:border-slate-700/50"
              >
                Hủy
                </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-90 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Xác nhận Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
