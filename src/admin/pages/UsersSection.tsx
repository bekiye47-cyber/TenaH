import React, { useState, useEffect } from 'react';
import { AdminAppUser } from '../types';
import { adminService } from '../services/adminSupabase';
import { Search, Shield, User as UserIcon, Wallet, Calendar, RefreshCw } from 'lucide-react';

interface UsersSectionProps {
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const UsersSection: React.FC<UsersSectionProps> = ({ onNotify }) => {
  const [users, setUsers] = useState<AdminAppUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers(search);
      setUsers(data);
    } catch (err: any) {
      onNotify('error', 'Failed to load users', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-heading tracking-tight">Registered Community Users</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Read-only overview of Telegram Mini App profiles, wallet balances, and roles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="users-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username, or Telegram ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14221C] text-[#1D2B24] dark:text-[#E2EBE6] focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            id="refresh-users-btn"
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#14221C] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 dark:bg-stone-900/40 border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-4 py-3.5">Telegram ID</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Wallet Balance</th>
                <th className="px-4 py-3.5">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-stone-400">
                    <span className="inline-block animate-spin mr-2">●</span> Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-stone-400">
                    No users matching "{search}"
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isAdmin = u.role === 'admin';

                  return (
                    <tr key={u.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                      {/* Name, Username & Telegram Photo */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shrink-0">
                            {u.photo_url ? (
                              <img src={u.photo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold text-sm">
                                {u.name?.[0] || 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-[#1D2B24] dark:text-[#E2EBE6] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isAdmin && (
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400">
                              {u.username ? `@${u.username}` : 'No username'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Telegram ID */}
                      <td className="px-4 py-4 whitespace-nowrap font-mono text-stone-600 dark:text-stone-300 text-[11px]">
                        {u.telegram_id}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isAdmin
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Current Wallet Balance */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5" />
                          <span>${u.wallet_balance.toFixed(2)} USD</span>
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="px-4 py-4 whitespace-nowrap text-stone-500 dark:text-stone-400">
                        {new Date(u.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
