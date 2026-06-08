import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Search, User, CreditCard, Filter } from 'lucide-react';

export default function StaffApprovals() {
  const { users, approveKYC } = useAuth();
  const [filterStatus, setFilterStatus] = useState('Pending KYC');

  // Khách hàng cần duyệt là những user có idNumber
  const pendingUsers = users.filter(u => u.status === filterStatus || (filterStatus === 'All' && u.idNumber));

  return (
    <div className="space-y-6 fade-in text-slate-850 dark:text-white">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
            <CheckCircle size={24} className="text-brand-teal" />
            <span>Duyệt Hồ Sơ Người Dùng (KYC)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kiểm tra và xác thực giấy tờ tùy thân của khách hàng đăng ký mới.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={() => setFilterStatus('Pending KYC')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${filterStatus === 'Pending KYC' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
        >
          Chờ Duyệt
        </button>
        <button 
          onClick={() => setFilterStatus('Active')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${filterStatus === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
        >
          Đã Duyệt
        </button>
        <button 
          onClick={() => setFilterStatus('Rejected KYC')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${filterStatus === 'Rejected KYC' ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
        >
          Từ Chối
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingUsers.length === 0 ? (
          <div className="col-span-full py-10 text-center text-slate-500">
            Không có hồ sơ nào trong trạng thái này.
          </div>
        ) : (
          pendingUsers.map(u => (
            <div key={u.id} className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">{u.name}</h3>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  u.status === 'Pending KYC' ? 'bg-amber-500/20 text-amber-500' :
                  u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-500' :
                  'bg-rose-500/20 text-rose-500'
                }`}>
                  {u.status}
                </span>
              </div>

              <div className="p-4 flex-1 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-450 font-medium">Số CMND/CCCD:</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-white">{u.idNumber || 'Chưa cung cấp'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">Ngày sinh:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{u.dob || 'Chưa cung cấp'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">Giới tính:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{u.gender || 'Chưa cung cấp'}</span>
                    </div>
                  </div>
                  <div className="text-xs pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">Địa chỉ thường trú:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 break-words leading-relaxed">{u.address || 'Chưa cung cấp'}</span>
                  </div>
                  <div className="text-xs pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">Ngày cấp thẻ:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{u.idIssueDate || 'Chưa cung cấp'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-[3/2] bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-400 relative overflow-hidden group border border-slate-300 dark:border-slate-700">
                    Mặt trước CCCD
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                      Xem ảnh
                    </div>
                  </div>
                  <div className="aspect-[3/2] bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-400 relative overflow-hidden group border border-slate-300 dark:border-slate-700">
                    Mặt sau CCCD
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                      Xem ảnh
                    </div>
                  </div>
                </div>
              </div>

              {u.status === 'Pending KYC' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex space-x-3">
                  <button 
                    onClick={() => approveKYC(u.id, false)}
                    className="flex-1 py-2 text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all flex items-center justify-center space-x-1"
                  >
                    <XCircle size={14} />
                    <span>Từ chối</span>
                  </button>
                  <button 
                    onClick={() => approveKYC(u.id, true)}
                    className="flex-1 py-2 text-xs font-bold text-emerald-600 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-all flex items-center justify-center space-x-1"
                  >
                    <CheckCircle size={14} />
                    <span>Chấp nhận</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
