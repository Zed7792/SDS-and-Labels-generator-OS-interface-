import React from 'react';
import { UserCheck, ChevronDown, Shield } from 'lucide-react';
import { CurrentUser } from '../types';
import { ENTERPRISE_USERS } from '../data/sampleUsers';

interface RoleSwitcherBarProps {
  currentUser: CurrentUser;
  onSelectUser: (user: CurrentUser) => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({ currentUser, onSelectUser }) => {
  return (
    <div className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md text-xs transition-colors">
      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
        <span className="hidden sm:inline">Active User:</span>
      </div>

      <div className="relative inline-block">
        <select
          value={currentUser.id}
          onChange={(e) => {
            const found = ENTERPRISE_USERS.find((u) => u.id === e.target.value);
            if (found) onSelectUser(found);
          }}
          className="appearance-none bg-white border border-slate-300 rounded px-2.5 py-0.5 pr-6 font-semibold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
        >
          {ENTERPRISE_USERS.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role === 'hse_lead' ? 'HSE Lead / Approver' : user.role === 'compliance_director' ? 'Director / Sign-off' : 'Preparer'})
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <span
        className={`hidden md:inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
          currentUser.role === 'hse_lead'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : currentUser.role === 'compliance_director'
            ? 'bg-purple-50 text-purple-800 border border-purple-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}
      >
        <Shield className="w-2.5 h-2.5" />
        {currentUser.role === 'hse_lead' ? 'Can Approve' : currentUser.role === 'compliance_director' ? 'Can Sign-Off' : 'Preparer'}
      </span>
    </div>
  );
};
